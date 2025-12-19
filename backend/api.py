import os
import json
import uuid
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import webview
from datetime import datetime

import http.server
import socketserver
import threading
import functools

from backend import project
from backend import scan
from backend import license
from backend import registration

class API:
    def __init__(self):        
        self.project_dir = None
        self.httpd = None
        self.http_port = 8100  # any free port
        self.http_thread = None
    def ping(self):
        return "API OK"
    
    def main_window(self):
        if len(webview.windows):
            return webview.windows[0]
    
   
    # --------------------------------------------------------
    # STATIC FILE SERVER (FIXED PORT VERSION)
    # --------------------------------------------------------
    def start_file_server(self, folder_path):
        """Start or restart the static file server on FIXED PORT."""

        # If project folder changed → restart server
        if self.httpd and folder_path != self.project_dir:
            print("🔄 Project dir changed — restarting static server...")
            self.stop_file_server()

        # If server already running for the same folder → nothing to do
        if self.httpd:
            return

        self.project_dir = folder_path

        # Handler bound to directory (no chdir)
        handler = functools.partial(
            http.server.SimpleHTTPRequestHandler,
            directory=folder_path
        )

        def run_server():
            try:
                with socketserver.ThreadingTCPServer(
                    ("127.0.0.1", self.http_port),
                    handler
                ) as self.httpd:
                    print(f"📡 Static server running at http://127.0.0.1:{self.http_port}")
                    self.httpd.serve_forever()
            except OSError as e:
                # Port already in use
                print(f"❌ Port {self.http_port} is already in use! {e}")
                print("⚠️  Static server could not start.")
                self.httpd = None

        self.http_thread = threading.Thread(target=run_server, daemon=True)
        self.http_thread.start()

    def stop_file_server(self):
        """Stop server cleanly."""
        if self.httpd:
            print("🛑 Stopping static server...")
            self.httpd.shutdown()
            self.httpd = None


    
    #----------scans---------
    import_scans = scan.import_scans
    process_scans = scan.process_scans
        
    
    
    def register_scans(self, scan_list):
        # call your UT stitching, grid generation etc.
        from .registration import process_scans
        return process_scans(scan_list)
    
    def select_directory(self):
        window = self.main_window()
        try:
            
            result = window.create_file_dialog(
                webview.FOLDER_DIALOG
            )
            if result:
                return {"success": True, "path": result[0]}
            return {"success": False, "path": None}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    
    #-------Project manager-----------
    create_project = project.create_project
    open_project = project.open_project
    save_project = project.save_project
    
    #----- Scan Registration -----------
    register_scans = registration.register_scans
    export_registration = registration.export_registration
    get_registered_data = registration.export_registration
    
    #-------License-----------
    getLicence = license.getLicence
    
    
        
    

    # ---------------------------------------------------------
    # CSV Loader
    # ---------------------------------------------------------
    def _load_csv(self, file_path):
        df = pd.read_csv(file_path)
        df.rename(columns={df.columns[0]: "Distance_mm"}, inplace=True)
        df = df.replace("ND", np.nan)

        for col in df.columns[1:]:
            df[col] = pd.to_numeric(df[col], errors="coerce")
        return df

    # ---------------------------------------------------------
    # Excel Loader
    # ---------------------------------------------------------
    def _load_excel(self, file_path):
        df = pd.read_excel(file_path, sheet_name="Data")
        df.rename(columns={df.columns[0]: "Distance_mm"}, inplace=True)
        df = df.replace("ND", np.nan)

        for col in df.columns[1:]:
            df[col] = pd.to_numeric(df[col], errors="coerce")
        return df

    # ---------------------------------------------------------
    # Heatmap Generator (PNG)
    # ---------------------------------------------------------
    def _create_heatmap(self, df: pd.DataFrame, output_file: str):
        """
        df:
        Distance_mm | Probe1 | Probe2 | Probe3 ...

        Heatmap = probes (X) vs distance (Y)
        """

        try:
            probe_columns = df.columns[1:]
            data = df[probe_columns].to_numpy()

            plt.figure(figsize=(6, 6), dpi=170)
            plt.imshow(data, aspect="auto")
            plt.colorbar(label="Thickness")
            plt.title("Thickness Map")
            plt.tight_layout()

            plt.savefig(output_file)
            plt.close()
        except Exception as e:
            print("Heatmap generation failed:", e)
            
    def open_file_dialog(self, options):
        window = self.main_window()
        result = window.create_file_dialog(
            webview.FileDialog.SAVE,
            save_filename=options.get('save_filename'),
            file_types=tuple(options.get('file_types', []))
        )
        return result[0] if result else None

