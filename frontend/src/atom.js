import { atom } from 'recoil';



export const thkDataAtom = atom({
  key: 'thkDataAtom',
  default: null
});


export const registrationAtom = atom({
  key: 'registrationAtom',
  default: {

  }
});


export const staticServerAtom = atom({
  key: 'staticServerAtom',
  default: null
});




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
    fit_all: true
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

    //grid
    showGrid: true,
    surfaceHeight: 14000,
    surfaceWidth: 65000,
    gridStep: 100, // 100 mm, 
    gridfontSize: 80,
    gridfontColor: "#bf0d0d",

    //References
    showReference: true,
    referenceOpacity: 50,

    //Scans
    showScans: true,
    scanOpacity: 70,
    scanfontSize: 80,
    scanfontColor: "#bf0d0d",
    scanDetailsOn: true,


    //Shapes
    showShapes: true,
    shapeOpacity: 80,
    shapeFontSize: 89,
    shapeFontColor: "#bf0d0d",
    shapes: [], // <--- ALL SHAPES STORED HERE
    shapeLineSize: 10,
    ShapeColor: "#bf0d0d",

    //Measurements
    showMeasurements: true,
    mFontSize: 90,
    mFontColor: "#bf0d0d",


    //Thickness
    showThickness: false,



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




export const viewAtom = atom({
  key: 'viewAtom',
  default: {
    scan_list: true,
    drawing_setting: false,
    scan_editor: false,
    reference_editor:false,
    about: false
  }
});



