


# def import_scans(self):
#     window = self.main_window()

#     # 1. Let user pick multiple CSV scan files
#     result = window.create_file_dialog(
#         dialog_type=webview.FileDialog.OPEN,
#         allow_multiple=True,
#         file_types=('Scan Files (*.csv)',)
#     )
#     if not result:
#         return

#     scan_files = result  # list of full paths

#     # Ensure project folder & HDF5 file exist
#     project_dir = self.project_dir            # e.g. "C:/projects/ABC"
#     project_file_path = self.project_file_path  # e.g. "C:/projects/ABC/ABC.h5"
#     scans_folder = os.path.join(project_dir, "scans")
#     os.makedirs(scans_folder, exist_ok=True)

#     # 2. Open HDF5 file and load existing scan list
#     with h5py.File(project_file_path, "r+") as h5:
#         if "meta/scans" in h5:
#             old_scans = json.loads(h5["meta/scans"][()].decode("utf-8"))
#         else:
#             old_scans = []

#         # Convert old scan ids to set for deduplication
#         existing_ids = {scan.get("id") for scan in old_scans}

#         # 3. Copy new scan files and append metadata
#         new_scans = []
#         for src_path in scan_files:
#             filename = os.path.basename(src_path)
#             name_without_ext = os.path.splitext(filename)[0]

#             # Skip if already present
#             if filename in existing_ids:
#                 continue

#             dst_path = os.path.join(scans_folder, filename)
#             shutil.copy2(src_path, dst_path)

#             scan_meta = {
#                 "id": name_without_ext,
#                 "name": name_without_ext,
#                 "scan_details": name_without_ext,
#                 "nominal_thk": 0,
#                 "min_thk": 0,
#                 "max_thk": 25,
#                 "x": 0,
#                 "y": 0,
#                 "rotation": 0,
#                 "width": 3000,   # default placeholder
#                 "height": 1000   # default placeholder
#             }
#             new_scans.append(scan_meta)

#         # Merge old + new scans
#         updated_scans = old_scans + new_scans

#         # 4. Save updated scans list back into HDF5
#         if "meta/scans" in h5:
#             del h5["meta/scans"]
#         h5.create_dataset(
#             "meta/scans",
#             data=json.dumps(updated_scans).encode("utf-8")
#         )

#     return updated_scans