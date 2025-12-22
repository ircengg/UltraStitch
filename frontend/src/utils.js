/**
 * Query the nearest data point from a 2D grid.
 * @param {number[]} x - Sorted array of x coordinates (columns)
 * @param {number[]} y - Sorted array of y coordinates (rows)
 * @param {number[][]} data - 2D array of data, data[i][j] corresponds to (x[j], y[i])
 * @param {number} xVal - x coordinate to query
 * @param {number} yVal - y coordinate to query
 * @returns {number} - Nearest data value
 */
export function queryNearest2D(x, y, data, xVal, yVal) {
    // Find nearest index in a sorted array
    function nearestIndex(arr, val) {
        let low = 0, high = arr.length - 1;

        if (val <= arr[0]) return 0;
        if (val >= arr[arr.length - 1]) return arr.length - 1;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (arr[mid] === val) return mid;
            else if (arr[mid] < val) low = mid + 1;
            else high = mid - 1;
        }

        return (Math.abs(arr[low] - val) < Math.abs(arr[high] - val)) ? low : high;
    }

    const i = nearestIndex(y, yVal); // nearest row (y)
    const j = nearestIndex(x, xVal); // nearest column (x)
    return data[i][j];
}


export const round = (v, places = 3) => {
    const num = Number(v);
    if (isNaN(num)) return v; // gracefully handle non-numbers
    return Number(num.toFixed(places));
};



export const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}


function decodeFloat32(base64) {
    const binary = atob(base64);
    const len = binary.length;
    const buffer = new ArrayBuffer(len);
    const view = new Uint8Array(buffer);
  
    for (let i = 0; i < len; i++) {
      view[i] = binary.charCodeAt(i);
    }
  
    return new Float32Array(buffer);
  }
  