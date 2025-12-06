
import webview
import h5py
import os
import glob
import numpy as np
import json
from datetime import datetime

def create_project(self, projectmeta):
    project_title = projectmeta.get("title", "Untitled")
    window = self.main_window()
    result = window.create_file_dialog(webview.FOLDER_DIALOG)
    if not result:
        return

    folder_path = result[0]
    project_file_path = os.path.join(folder_path, f"{project_title}.h5")
    
    self.project_dir = folder_path
    self.project_file_path = project_file_path
    self.project_file = project_title
    
    os.makedirs(os.path.join(folder_path, "scans"), exist_ok=True)
    os.makedirs(os.path.join(folder_path, "reference"), exist_ok=True)

    drawing = {
        "fontSize": 200,
        "fontColor": "#bf0d0d",
        "surfaceHeight": 14000,
        "surfaceWidth": 65000,
        "gridStep": 100,
        "scanOpacity": 40,
    }

    scans = []
    reference = []
    measurement = []
    projectmeta["created_at"] = datetime.now().isoformat()

    with h5py.File(project_file_path, "w") as h5:
        h5.create_dataset("meta/project", data=json.dumps(projectmeta).encode("utf-8"))
        h5.create_dataset("meta/drawing", data=json.dumps(drawing).encode("utf-8"))
        h5.create_dataset("meta/scans", data=json.dumps(scans).encode("utf-8"))
        h5.create_dataset("meta/reference", data=json.dumps(reference).encode("utf-8"))
        h5.create_dataset("meta/measurement", data=json.dumps(measurement).encode("utf-8"))    

    return {
        "project": projectmeta,
        "scans": scans,
        "drawing": drawing,
        "reference":reference,
        "measurement": measurement
    }



def open_project(self):
    window = self.main_window()

    # 1. Let user pick *.h5 project file
    result = window.create_file_dialog(
        dialog_type=webview.OPEN_DIALOG,
        allow_multiple=False,
        file_types=('UltraScan Project (*.h5)',)
    )
    if not result:
        return
    
    

    project_file_path = result[0]

    # 2. Extract directory + filename
    project_dir = os.path.dirname(project_file_path)
    project_file = os.path.basename(project_file_path)

    # 3. Store internally for later use
    self.project_dir = project_dir
    self.project_file_path = project_file_path
    self.project_file = project_file
    
    #Start server for this project
    self.start_file_server(project_dir)
    
    scans = []
    reference = []
    measurement = []

    # 4. Read HDF5 project metadata
    with h5py.File(project_file_path, "r") as h5:
        project = json.loads(h5["meta/project"][()].decode("utf-8"))
        drawing = json.loads(h5["meta/drawing"][()].decode("utf-8"))
        scans = json.loads(h5["meta/scans"][()].decode("utf-8"))
        if "reference" in h5["meta"]:
            reference = json.loads(h5["meta/reference"][()].decode("utf-8"))
        if "measurement" in h5["meta"]:
            measurement = json.loads(h5["meta/measurement"][()].decode("utf-8"))
    
    for scan in scans:
        scan['map_link'] = f"http://127.0.0.1:{self.http_port}/scans/{scan['id']}.png"
    
    for r in reference:
        r['map_link'] = f"http://127.0.0.1:{self.http_port}/reference/{r['map']}"    
        
    print(project)

    # 5. Return data the way React expects
    return {
        "project": project,
        "drawing": drawing,
        "scans": scans,
        "reference":reference,
        "measurement":measurement
    }
    
    
def save_project(self, projectmeta):   

    project_file_path = self.project_file_path
    scans_folder = os.path.join(self.project_dir, "scans")

    if not os.path.exists(project_file_path):
        raise FileNotFoundError(f"Project file not found: {project_file_path}")

    project = projectmeta.get("project", {})
    drawing = projectmeta.get("drawing", {})
    scans = projectmeta.get("scans", [])
    reference = projectmeta.get("reference", [])
    measurement = projectmeta.get("measurement", [])

    # ---- Save metadata to HDF5 ---- #
    with h5py.File(project_file_path, "a") as h5:
        for key, value in [
            ("meta/project", project),
            ("meta/drawing", drawing),
            ("meta/scans", scans),
            ("meta/reference", reference),
            ("meta/measurement", measurement)
        ]:
            if key in h5:
                del h5[key]

            h5.create_dataset(key, data=json.dumps(value).encode("utf-8"))

    return projectmeta









    
# ---------------------------------------------------------
# OPEN PROJECT + Auto-generate Heatmaps if missing
# ---------------------------------------------------------
# def open_project(self):
#     window = self.main_window()
#     try:
#         result = window.create_file_dialog(
#             dialog_type=webview.OPEN_DIALOG,
#             allow_multiple=False,
#             file_types=('UltraScan Project (*.proj)',)
#         )

#         if not result:
#             return {"success": False, "cancelled": True}

#         project_file = result[0]

#         # Load JSON
#         with open(project_file, "r") as f:
#             project = json.load(f)

#         # Project folder:
#         project_dir = os.path.dirname(project_file)
#         self.project_dir = project_dir
        
#         # Start server for this project
#         self.start_file_server(project_dir)

#         scans_folder = os.path.join(project_dir, "scans")
#         os.makedirs(scans_folder, exist_ok=True)

#         scans = project.get("scans", [])

#         # Process all scans and attach missing heatmaps
#         for scan in scans:
#             scan_name = scan.get("name")
#             if not scan_name:
#                 continue

#             scan_csv = os.path.join(scans_folder, f"{scan_name}.csv")
#             scan_xlsx = os.path.join(scans_folder, f"{scan_name}.xlsx")

#             # choose CSV or Excel
#             if os.path.exists(scan_csv):
#                 df = self._load_csv(scan_csv)
#             elif os.path.exists(scan_xlsx):
#                 df = self._load_excel(scan_xlsx)
#             else:
#                 continue

#             # If scan has no map => create one
#             if "map" not in scan or not scan["map"]:
#                 map_filename = f"{scan_name}_map.png"
#                 map_filepath = os.path.join(scans_folder, map_filename)

#                 self._create_heatmap(df, map_filepath)
#                 rel = os.path.relpath(map_filepath, self.project_dir).replace("\\", "/")
#                 scan["map_url"] = f"http://127.0.0.1:{self.http_port}/{rel}"
#                 scan["map"] = map_filename

#         # Save project back (updated maps)
#         with open(project_file, "w") as f:
#             json.dump(project, f, indent=4)
            

#         return {
#             "success": True,
#             "project": project,
#             "project_path": project_file
#         }

#     except Exception as e:
#         return {"success": False, "error": str(e)}