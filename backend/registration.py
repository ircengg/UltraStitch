import os
import json
import h5py
import numpy as np
import pandas as pd
from PIL import Image
import webview
from math import radians, sin, cos, ceil
from backend.utils import numpy_to_json_list
import bisect


def _find_index(arr, value):
    i = bisect.bisect_left(arr, value)
    if i <= 0:
        return 0
    if i >= len(arr):
        return len(arr) - 1
    return i if abs(arr[i] - value) < abs(arr[i - 1] - value) else i - 1



def getThicknessAt(self, pos={}):
    """
    Stateless thickness query.
    Safe for multi-user / multi-project servers.
    """
    x = pos.get("x")
    y = pos.get("y")

    if not self.project_file_path:
        return None

    try:
        with h5py.File(self.project_file_path, "r") as h5:
            if "output" not in h5 or "matrix" not in h5["output"]:
                return None

            matrix = h5["output/matrix"]
            nominal_thickness = h5["output/nominal_thickness"]
            x_vals = h5["output/x_values"]
            y_vals = h5["output/y_values"]

            col = _find_index(x_vals, x)
            row = _find_index(y_vals, y)

            value = float(matrix[row, col])
            nominal = float(nominal_thickness[row, col])

            if np.isnan(value):
                return None

            return {
                "x": float(x),
                "y": float(y),
                "row": int(row),
                "col": int(col),
                "value": value,
                "nominal":nominal 
            }

    except Exception as e:
        print("getThicknessAt error:", e)
        return None


def register_scans(self, cell_size=10):    
    project_dir = self.project_dir
    project_file_path = self.project_file_path
    scans_folder = os.path.join(project_dir, "scans")

    # --------------------------------------------------
    # NEW: registration folder
    # --------------------------------------------------
    registration_dir = os.path.join(project_dir, "registration")
    os.makedirs(registration_dir, exist_ok=True)

    # --------------------------------------------------
    # Load metadata
    # --------------------------------------------------
    with h5py.File(project_file_path, "r") as h5:
        drawing_meta = json.loads(h5["meta/drawing"][()].decode("utf-8"))
        scans_meta   = json.loads(h5["meta/scans"][()].decode("utf-8"))

    surface_w = drawing_meta["surfaceWidth"]
    surface_h = drawing_meta["surfaceHeight"]

    W = int(np.ceil(surface_w / cell_size))
    H = int(np.ceil(surface_h / cell_size))

    # --------------------------------------------------
    # Thickness + nominal thickness matrices
    # --------------------------------------------------
    reference_thk = np.full((H, W), np.nan, dtype=np.float32)
    reference_nom = np.full((H, W), np.nan, dtype=np.float32)

    # --------------------------------------------------
    # Process scans
    # --------------------------------------------------
    for scan in scans_meta:
        scan_id = scan["id"]
        csv_file = os.path.join(scans_folder, f"{scan_id}.csv")

        if not os.path.exists(csv_file):
            print(f"Skipping, missing CSV: {csv_file}")
            continue

        scan_matrix = load_csv_matrix(csv_file)

        # Apply thickness
        reference_thk = apply_scan_to_reference(
            scan_matrix,
            scan,
            reference_thk,
            cell_size
        )

        # Apply nominal thickness (scalar → grid)
        nominal_thk = scan.get("nominal_thk")
        if nominal_thk is not None:
            nominal_matrix = np.full_like(scan_matrix, nominal_thk)
            reference_nom = apply_scan_to_reference(
                nominal_matrix,
                scan,
                reference_nom,
                cell_size
            )

        print(f"Registered scan {scan_id}")

    # --------------------------------------------------
    # Coordinate arrays
    # --------------------------------------------------
    x_values = np.arange(W) * cell_size
    y_values = np.arange(H) * cell_size

    # --------------------------------------------------
    # Save into HDF5
    # --------------------------------------------------
    with h5py.File(project_file_path, "a") as h5:
        for key in [
            "output/thickness",
            "output/nominal_thickness",
            "output/x_values",
            "output/y_values",
        ]:
            if key in h5:
                del h5[key]

        h5.create_dataset(
            "output/thickness",
            data=reference_thk,
            compression="gzip",
            compression_opts=4,
            shuffle=True,
        )

        h5.create_dataset(
            "output/nominal_thickness",
            data=reference_nom,
            compression="gzip",
            compression_opts=4,
            shuffle=True,
        )

        h5.create_dataset("output/x_values", data=x_values)
        h5.create_dataset("output/y_values", data=y_values)

    # --------------------------------------------------
    # NEW: save color image
    # --------------------------------------------------
    # Use average nominal thickness if grid varies
    nominal_for_image = np.nanmean(reference_nom)

    img_path = os.path.join(registration_dir, "thickness_map.png")
    save_heatmap_from_matrix(
        reference_thk,
        img_path,
        nominal_for_image
    )

    print("Registration completed, HDF5 + image written.")

    return {
        "image": img_path,
    }


def export_registration(self):
    print("Starting CSV export")

    project_file_path = self.project_file_path

    # Load / compute data
    need_register = False
    with h5py.File(project_file_path, "r") as h5:
        if "output/matrix" not in h5:
            need_register = True

    if need_register:
        print("No registration found → running register_scans()")
        matrix, x_values, y_values = self.register_scans()
    else:
        print("Loading registration from HDF5")
        with h5py.File(project_file_path, "r") as h5:
            matrix = h5["output/matrix"][()]
            x_values = h5["output/x_values"][()]
            y_values = h5["output/y_values"][()]

    # File save dialog (SERVER SIDE)
    window = self.main_window()
    result = window.create_file_dialog(
        webview.FileDialog.SAVE,
        save_filename="registration.csv",
        file_types=("CSV Files (*.csv)",)
    )

    if not result:
        print("Export cancelled")
        return {"success": False}

    csv_path = result[0]
    print("Saving CSV to:", csv_path)

    # Create DataFrame
    df = pd.DataFrame(
        data=matrix,
        index=y_values,     # rows
        columns=x_values    # columns
    )

    df.index.name = "Y"
    df.columns.name = "X"

    # FAST synchronous write
    df.to_csv(csv_path)

    print("CSV export finished")

    return {"success": True, "path": csv_path}


def get_registered_scans(self):
    project_file_path = self.project_file_path

    # Check if registration already exists
    need_register = False

    with h5py.File(project_file_path, "r") as h5:
        if "output/matrix" not in h5:
            need_register = True

    # Auto run registration if missing
    if need_register:
        print("No registration found → running register_scans()...")
        matrix, x_values, y_values = self.register_scans()
    else:
        print("Registration available → loading...")
        with h5py.File(project_file_path, "r") as h5:
            matrix = h5["output/matrix"][()]
            x_values = h5["output/x_values"][()]
            y_values = h5["output/y_values"][()]


    # Return for external use
    # Convert numpy → JSON-safe lists
    return {
        "matrix": numpy_to_json_list(matrix),
        "x": numpy_to_json_list(x_values),
        "y": numpy_to_json_list(y_values),
    }





def load_csv_matrix(csv_path):
    df = pd.read_csv(csv_path)
    df.rename(columns={df.columns[0]: "Distance_mm"}, inplace=True)
    df = df.replace("ND", np.nan)

    for col in df.columns[1:]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    return df[df.columns[1:]].values


def resize_scan_matrix(scan_array, out_h, out_w):
    """Resize scan array (nearest-neighbour) to match the cell grid."""
    src_h, src_w = scan_array.shape
    out = np.zeros((out_h, out_w))

    for y in range(out_h):
        for x in range(out_w):
            sy = int((y / out_h) * src_h)
            sx = int((x / out_w) * src_w)
            out[y, x] = scan_array[sy, sx]

    return out


def apply_scan_to_reference(scan_array, scan_meta, reference, cell_size):
    ref_h, ref_w = reference.shape
    src_h, src_w = scan_array.shape

    scan_cell_w = scan_meta["width"] / src_w
    scan_cell_h = scan_meta["height"] / src_h

    theta = radians(scan_meta.get("rotation", 0))
    cos_t, sin_t = cos(theta), sin(theta)

    x_base = scan_meta["x"]
    y_base = scan_meta["y"]

    for i in range(src_h):
        for j in range(src_w):
            val = scan_array[i, j]
            if np.isnan(val):
                continue

            # scan-local center (mm)
            x_local = (j + 0.5) * scan_cell_w
            y_local = (i + 0.5) * scan_cell_h

            # rotate
            x_rot = x_local * cos_t - y_local * sin_t
            y_rot = x_local * sin_t + y_local * cos_t

            # world coords (mm)
            x_world = x_base + x_rot
            y_world = y_base + y_rot

            # footprint size in reference cells
            rx0 = int((x_world - scan_cell_w / 2) / cell_size)
            rx1 = int((x_world + scan_cell_w / 2) / cell_size)
            ry0 = int((y_world - scan_cell_h / 2) / cell_size)
            ry1 = int((y_world + scan_cell_h / 2) / cell_size)

            for ry in range(ry0, ry1 + 1):
                for rx in range(rx0, rx1 + 1):
                    if 0 <= rx < ref_w and 0 <= ry < ref_h:
                        reference[ry, rx] = val

    return reference


def save_heatmap_from_matrix(matrix, out_path, nominal_thk):
    if os.path.exists(out_path):
        return

    raw = matrix.astype(np.float32)
    h, w = raw.shape

    rgba = np.zeros((h, w, 4), dtype=np.uint8)

    invalid = np.isnan(raw)
    grid = np.nan_to_num(raw, nan=-9999)

    mask_bad  = (grid < 0.8 * nominal_thk) & (~invalid)
    mask_warn = (grid >= 0.8 * nominal_thk) & (grid < 0.9 * nominal_thk)
    mask_good = (grid >= 0.9 * nominal_thk)

    rgba[mask_bad]  = [204, 102, 0, 255]   # red/orange
    rgba[mask_warn] = [255, 255, 0, 255]   # yellow
    rgba[mask_good] = [0, 255, 0, 255]     # green

    rgba[invalid] = [0, 0, 0, 0]            # transparent

    Image.fromarray(rgba, mode="RGBA").save(out_path, "PNG")