
import webview
import h5py
import os
import numpy as np
import json
from datetime import datetime
from urllib.parse import quote
import base64


def encode_f32(arr: np.ndarray) -> str:
    return base64.b64encode(arr.astype(np.float32).tobytes()).decode("ascii")


def create_project(self, projectmeta):
    project = projectmeta.get("project", {})
    drawing = projectmeta.get("drawing", {})
    project_title = project.get("title", "Untitled")
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

    scans = []
    reference = []
    measurement = []
    annotation = []
    project["created_at"] = datetime.now().isoformat()

    with h5py.File(project_file_path, "w") as h5:
        h5.create_dataset("meta/project", data=json.dumps(project).encode("utf-8"))
        h5.create_dataset("meta/drawing", data=json.dumps(drawing).encode("utf-8"))
        h5.create_dataset("meta/annotation", data=json.dumps(annotation).encode("utf-8"))
        h5.create_dataset("meta/scans", data=json.dumps(scans).encode("utf-8"))
        h5.create_dataset("meta/reference", data=json.dumps(reference).encode("utf-8"))
        h5.create_dataset("meta/measurement", data=json.dumps(measurement).encode("utf-8"))    

    return {
        "project": project,
        "scans": scans,
        "drawing": drawing,
        "reference":reference,
        "measurement": measurement,
        "annotation": annotation
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
    annotation = []
   

    # 4. Read HDF5 project metadata
    with h5py.File(project_file_path, "r") as h5:
        project = json.loads(h5["meta/project"][()].decode("utf-8"))
        drawing = json.loads(h5["meta/drawing"][()].decode("utf-8"))
        scans = json.loads(h5["meta/scans"][()].decode("utf-8"))
        if "annotation" in h5["meta"]:
            annotation = json.loads(h5["meta/annotation"][()].decode("utf-8"))        
        if "reference" in h5["meta"]:
            reference = json.loads(h5["meta/reference"][()].decode("utf-8"))
        if "measurement" in h5["meta"]:
            measurement = json.loads(h5["meta/measurement"][()].decode("utf-8"))
            
       
    # 5. Return data the way React expects
    return {
        "project": project,
        "drawing": drawing,
        "scans": scans,
        "reference":reference,
        "measurement":measurement,
        "annotation":annotation,       
        "static_server_url": f"http://127.0.0.1:{self.http_port}"
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
    annotation = projectmeta.get("annotation", [])

    # ---- Save metadata to HDF5 ---- #
    with h5py.File(project_file_path, "a") as h5:
        for key, value in [
            ("meta/project", project),
            ("meta/drawing", drawing),
            ("meta/scans", scans),
            ("meta/reference", reference),
            ("meta/measurement", measurement),
            ("meta/annotation", annotation)
        ]:
            if key in h5:
                del h5[key]

            h5.create_dataset(key, data=json.dumps(value).encode("utf-8"))

    return projectmeta








