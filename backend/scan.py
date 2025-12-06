import os
import json
import shutil
import h5py
import webview
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from PIL import Image

def import_scans(self):
    window = self.main_window()

    # 1. Let user pick multiple CSV scan files
    result = window.create_file_dialog(
        dialog_type=webview.FileDialog.OPEN,
        allow_multiple=True,
        file_types=('Scan Files (*.csv)',)
    )
    if not result:
        return []

    scan_files = result  # list of full paths

    # Ensure project folder & HDF5 file exist
    project_dir = self.project_dir            # e.g. "C:/projects/ABC"
    project_file_path = self.project_file_path  # e.g. "C:/projects/ABC/ABC.h5"
    scans_folder = os.path.join(project_dir, "scans")
    os.makedirs(scans_folder, exist_ok=True)

    # 2. Open HDF5 file and load existing scan list
    with h5py.File(project_file_path, "r+") as h5:
        if "meta/scans" in h5:
            old_scans = json.loads(h5["meta/scans"][()].decode("utf-8"))
        else:
            old_scans = []

        # Convert old scan ids to set for deduplication
        existing_ids = {scan.get("id") for scan in old_scans}

        # 3. Copy new scan files and append metadata
        new_scans = []
        for src_path in scan_files:
            filename = os.path.basename(src_path)

            # Skip if already present
            if filename in existing_ids:
                continue

            dst_path = os.path.join(scans_folder, filename)
            shutil.copy2(src_path, dst_path)

            scan_meta = {
                "id": filename,
                "name": filename,
                "scan_details": filename,
                "nominal_thk": 0,
                "min_thk": 0,
                "max_thk": 25,
                "x": 0,
                "y": 0,
                "rotation": 0,
                "width": 3000,   # default placeholder
                "height": 1000   # default placeholder
            }
            new_scans.append(scan_meta)

        # Merge old + new scans
        updated_scans = old_scans + new_scans

        # 4. Save updated scans list back into HDF5
        if "meta/scans" in h5:
            del h5["meta/scans"]
        h5.create_dataset(
            "meta/scans",
            data=json.dumps(updated_scans).encode("utf-8")
        )

    return updated_scans




def process_scans(self, scans):
    scan_folder = os.path.join(self.project_dir, "scans")

    for scan in scans:
        scan_id = scan["id"]
        # csv_path = os.path.join(scan_folder, scan_id + ".csv")
        csv_path = os.path.join(scan_folder, scan_id )
        png_path = os.path.join(scan_folder, scan_id + ".png")

        if not os.path.exists(csv_path):
            print(f"⚠️ CSV not found: {csv_path}")
            continue

        save_heatmap_fast(csv_path, png_path, scan["nominal_thk"])

        print(f"✔ Heatmap saved: {png_path}")
        


def save_heatmap_fast(csv_path, out_path, nominal_thk):
    """
    FAST: Read scan CSV → generate heatmap PNG using NumPy + Pillow.
    Color rules:
        invalid, NaN, ND, non-numeric → WHITE
        < 0.8 * nominal              → Brown/Orange
        < 0.9 * nominal              → Yellow
        >= 0.9 * nominal             → Green
    """

    # Load CSV
    df = pd.read_csv(csv_path)

    # Convert numeric area only
    raw = pd.to_numeric(
        df.iloc[1:, 1:].stack(),
        errors='coerce'         # converts ND, text, empty → NaN
    ).unstack().to_numpy()

    # Prepare output RGB
    h, w = raw.shape
    rgb = np.zeros((h, w, 3), dtype=np.uint8)

    # Mask invalid values
    invalid_mask = np.isnan(raw)

    # Replace NaN with dummy number for comparison (will be overridden later)
    grid = np.nan_to_num(raw, nan=-9999)

    # Rule masks
    mask_bad  = (grid < 0.8 * nominal_thk) & (~invalid_mask)
    mask_warn = (grid >= 0.8 * nominal_thk) & (grid < 0.9 * nominal_thk) & (~invalid_mask)
    mask_good = (grid >= 0.9 * nominal_thk) & (~invalid_mask)

    # Apply colors
    rgb[mask_bad]  = [204, 102, 0]      # brown/orange
    rgb[mask_warn] = [255, 255, 0]      # yellow
    rgb[mask_good] = [0, 255, 0]        # green
    rgb[invalid_mask] = [255, 255, 255] # white

    # Save PNG
    Image.fromarray(rgb, mode="RGB").save(out_path, "PNG")
