# app.py
import webview
from backend.api import API
from backend.license import validate_license, start_background_checker
import os

os.environ["PYWEBVIEW_GUI"] = "qt"
env = os.getenv("ENV", "development")


def on_license_fail(result):
    """Called only when server says invalid license"""
    webview.create_window(
        "License Error",
        f"Your license is invalid.\nReason: {result.get('reason')}",
        width=400,
        height=200,
    )
    os._exit(0)


def get_entrypoint():
    if env == "development":
        return "http://localhost:5173/"

    base = os.path.dirname(__file__)
    p1 = os.path.join(base, "./dist/index.html")
    p2 = os.path.join(base, "./gui/index.html")

    if os.path.exists(p1):
        return p1
    if os.path.exists(p2):
        return p2

    raise Exception("No index.html found")


def app():
    webview.settings["ALLOW_DOWNLOADS"] = True
    api = API()
    entry = get_entrypoint()

    # -------------------------------
    # LICENSE VALIDATION
    # -------------------------------
    result = validate_license()
    print("License check:", result)

    # Default window (will be replaced depending on license)
    window = None

    # Case 1: License file missing
    if result.get("reason") == "license_file_missing":
        window = webview.create_window(
            "License Missing",
            None,
            "license.json not found",
            width=400,
            height=200
        )

    # Case 2: Server says invalid license
    elif result.get("valid") is False and not result["reason"].startswith("connection_error"):
        window = webview.create_window(
            "License Error",
            None,
            f"Invalid License: {result['reason']}",
            width=400,
            height=200
        )

    # Case 3: License OK or offline → load main app
    else:
        # Start silent background validator
        start_background_checker(on_license_fail)

        window = webview.create_window(
            "UltraStitch",
            entry,
            width=1200,
            height=800,
            easy_drag=False,
            js_api=api,
            text_select=True,
        )

    # 🔴 IMPORTANT: START WEBVIEW ONLY ONCE
    webview.start(debug=(env == "development"), gui="edgechromium", ssl=True)
