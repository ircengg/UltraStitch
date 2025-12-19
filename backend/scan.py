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
        return

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
            name_without_ext = os.path.splitext(filename)[0]

            # Skip if already present
            if filename in existing_ids:
                continue

            dst_path = os.path.join(scans_folder, filename)
            shutil.copy2(src_path, dst_path)

            scan_meta = {
                "id": name_without_ext,
                "name": name_without_ext,
                "scan_details": name_without_ext,
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
        csv_path = os.path.join(scan_folder, scan_id + ".csv")
        # csv_path = os.path.join(scan_folder, scan_id )
        png_path = os.path.join(scan_folder, scan_id + ".png")

        if not os.path.exists(csv_path):
            print(f"⚠️ CSV not found: {csv_path}")
            continue

        save_heatmap_fast(csv_path, png_path, scan["nominal_thk"])

        print(f"✔ Heatmap saved: {png_path}")
        


def save_heatmap_fast(csv_path, out_path, nominal_thk):
    if os.path.exists(out_path):
        return

    df = pd.read_csv(csv_path)

    raw = pd.to_numeric(
        df.iloc[1:, 1:].stack(),
        errors="coerce"
    ).unstack().to_numpy()

    h, w = raw.shape

    # RGBA image
    rgba = np.zeros((h, w, 4), dtype=np.uint8)

    invalid = np.isnan(raw)
    grid = np.nan_to_num(raw, nan=-9999)

    mask_bad  = (grid < 0.8 * nominal_thk) & (~invalid)
    mask_warn = (grid >= 0.8 * nominal_thk) & (grid < 0.9 * nominal_thk)
    mask_good = (grid >= 0.9 * nominal_thk)

    # Colors
    rgba[mask_bad]  = [204, 102, 0, 255]
    rgba[mask_warn] = [255, 255, 0, 255]
    rgba[mask_good] = [0, 255, 0, 255]

    # Transparent invalid
    rgba[invalid] = [0, 0, 0, 0]

    Image.fromarray(rgba, mode="RGBA").save(out_path, "PNG")

