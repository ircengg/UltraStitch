import { atom } from 'recoil';



export const toolbarAtom = atom({
  key: 'toolbarAtom',
  default: {
    measuring: false,
    scan_registration_mode: false,
    open_scan_editor: false,
    // NEW drawing tools
    draw_rectangle: false,
    draw_circle: false,
    draw_polygon: false,
  }
});

export const loaderAtom = atom({
  key: "loaderAtom",
  default: {
    open: false,
    message: "Processing, please wait...",
  },
});


export const scansAtom = atom({
  key: 'scansAtom',
  default: []
});



export const projectAtom = atom({
  key: 'projectAtom',
  default: null
});

export const referenceAtom = atom({
  key: 'referenceAtom',
  default: [
    // {
    //   "id": 1,
    //   "x": 0,
    //   "y": 0,
    //   "width": 42500,
    //   "height": 18849.555,
    //   "rotation": 0,
    //   "map": "/GA-Model.png"
    // }
  ]
});

export const mesurementAtom = atom({
  key: 'mesurementAtom',
  default: []
});



export const drawingAtom = atom({
  key: 'drawingAtom',
  default: {
    fontSize: 200,
    fontColor: "#bf0d0d",
    surfaceHeight: 14000,
    surfaceWidth: 65000,
    gridStep: 100, // 100 mm,
    scanOpacity: 40,
    scanDetailsOn: true,
    showReference: true,
    showScans: true,
    showMeasurements: true,
    showShapes: true,
    showGrid: true,



    shapes: [], // <--- ALL SHAPES STORED HERE
    shapeLineSize: 10,
    ShapeColor: "#bf0d0d",

    drawingShape: null, // temp active shape while drawing
  }
});




/**
 * New Object STates
 */

export const newShapeAtom = atom({
  key: 'newShapeAtom',
  default: null
});

export const newMesaurementAtom = atom({
  key: 'newMesaurementAtom',
  default: null
});





export const selectedScanAtom = atom({
  key: 'selectedScanAtom',
  default: null
});


export const selectedObjectAtom = atom({
  key: 'selectedObjectAtom',
  default: {
    type: "", // "measurement" | "scan" | "shape" | "reference",
    obj: null
  }
});




/**
 * Menu Event
 */

export const menuEventAtom = atom({
  key: 'menuEventAtom',
  default: null
});






