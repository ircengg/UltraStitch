
import numpy as np
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