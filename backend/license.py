# license.py
import hashlib
import subprocess
import uuid
import os
import json
import requests
import sys
import threading
import time

LICENSE_FILE = "license.json"
SERVER_URL = "https://license.spainnovision.com/api/license/validate"
BACKGROUND_INTERVAL = 1 * 60   # 15 minutes


# ---------------------------
# MACHINE ID
# ---------------------------
def get_system_client_id():
    try:
        if os.name == "nt":
            output = subprocess.check_output(
                ["wmic", "csproduct", "get", "uuid"], text=True
            ).splitlines()
            uuid_val = [x.strip() for x in output if x.strip() and x.strip() != "UUID"]
            if uuid_val:
                return "win-" + uuid_val[0]
    except:
        pass

    try:
        if os.path.exists("/etc/machine-id"):
            mid = open("/etc/machine-id").read().strip()
            return "linux-" + mid
    except:
        pass

    try:
        if sys.platform == "darwin":
            output = subprocess.check_output(
                ["ioreg", "-rd1", "-c", "IOPlatformExpertDevice"], text=True
            )
            for line in output.splitlines():
                if "IOPlatformUUID" in line:
                    uuid_val = line.split("=")[1].strip().strip('"')
                    return "mac-" + uuid_val
    except:
        pass

    # fallback
    mac = uuid.getnode()
    return "mac-hash-" + hashlib.sha256(str(mac).encode()).hexdigest()[:16]


# ---------------------------
# SYNC LICENSE CALL
# ---------------------------
def validate_license():
    if not os.path.exists(LICENSE_FILE):
        return {"valid": False, "reason": "license_file_missing"}

    with open(LICENSE_FILE, "r") as f:
        data = json.load(f)

    body = {
        "key": data.get("key"),
        "signature": data.get("signature"),
        "client": get_system_client_id()
    }

    try:
        res = requests.post(SERVER_URL, json=body, timeout=5)
        return res.json()
    except Exception as e:
        return {"valid": False, "reason": f"connection_error: {str(e)}"}


# ---------------------------
# BACKGROUND CHECKER
# ---------------------------
def background_license_checker(on_fail):
    """Runs every 15 minutes silently.
    If server says INVALID → call on_fail() to terminate the app.
    """
    while True:
        time.sleep(BACKGROUND_INTERVAL)
        result = validate_license()

        # If server confirms license is invalid → terminate
        if result.get("valid") is False and not result["reason"].startswith("connection_error"):
            on_fail(result)
            break


def start_background_checker(on_fail):
    threading.Thread(target=background_license_checker, args=(on_fail,), daemon=True).start()




def getLicence(self):
    if not os.path.exists(LICENSE_FILE):
        return

    with open(LICENSE_FILE, "r") as f:
        data = json.load(f)
    
    return data