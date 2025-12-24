
import numpy as np
import sys
import os


def numpy_to_json_list(arr):
    """Convert numpy array → list with NaN replaced by None."""
    if isinstance(arr, np.ndarray):
        arr = arr.tolist()   # numpy array → python nested list

    # Replace NaN in the nested list
    def fix(value):
        if isinstance(value, float) and np.isnan(value):
            return None
        if isinstance(value, list):
            return [fix(v) for v in value]
        return value

    return fix(arr)

def get_app_dir():
    """Returns the directory of the main script (works with PyInstaller)."""
    if hasattr(sys, '_MEIPASS'):
        return sys._MEIPASS  # onefile temp dir
    elif getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)  # one-dir build
    else:
        return os.path.dirname(os.path.abspath(sys.argv[0]))  # dev mode