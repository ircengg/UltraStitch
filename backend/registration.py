import os
import json
import h5py
import numpy as np
import pandas as pd
import webview
from math import radians, sin, cos, ceil
from backend.utils import numpy_to_json_list





def register_scans(self, cell_size=10, ):
    project_dir = self.project_dir
    project_file_path = self.project_file_path
    scans_folder = os.path.join(project_dir, "scans")
    # Load metadata
    with h5py.File(project_file_path, "r") as h5:
        drawing_meta = json.loads(h5["meta/drawing"][()].decode("utf-8"))
        scans_meta = json.loads(h5["meta/scans"][()].decode("utf-8"))

    surface_w = drawing_meta["surfaceWidth"]
    surface_h = drawing_meta["surfaceHeight"]

    W = int(np.ceil(surface_w / cell_size))
    H = int(np.ceil(surface_h / cell_size))

    reference = np.full((H, W), np.nan, dtype=np.float32)


    # Process each scan
    for scan in scans_meta:
        scan_id = scan["id"]
        csv_file = os.path.join(scans_folder, f"{scan_id}.csv")

        if not os.path.exists(csv_file):
            print(f"Skipping, missing CSV: {csv_file}")
            continue

        scan_matrix = load_csv_matrix(csv_file)

        reference = apply_scan_to_reference(
            scan_matrix,
            scan,
            reference,
            cell_size
        )

        print(f"Registered scan {scan_id}")

    # Prepare coordinate arrays
    x_values = np.arange(W) * cell_size
    y_values = np.arange(H) * cell_size

    # Save into project HDF5
    with h5py.File(project_file_path, "a") as h5:
        for key in ["output/matrix", "output/x_values", "output/y_values"]:
            if key in h5:
                del h5[key]

        h5.create_dataset(
            "output/matrix",
            data=reference,
            compression="gzip",
            compression_opts=4,   # 3–6 is ideal
            shuffle=True
        )

        h5.create_dataset("output/x_values", data=x_values)
        h5.create_dataset("output/y_values", data=y_values)

        # Write CSV string inside HDF5
        # df = pd.DataFrame(reference, index=y_values, columns=x_values)
        # df.index.name = "Y_mm"
        # csv_str = df.to_csv()

        # if "output/csv" in h5:
        #     del h5["output/csv"]

        # h5.create_dataset("output/csv", data=csv_str.encode("utf-8"))

    print("Registration completed and written to HDF5.")
    
    return {
        "matrix": numpy_to_json_list(reference),
        "x": numpy_to_json_list(x_values),
        "y": numpy_to_json_list(y_values),
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

