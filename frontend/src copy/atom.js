import { atom } from 'recoil';

export const MODEL_DOC_ATOM = atom({
  key: 'MODEL_DOC_ATOM',
  default: null
});


export const TOOLBAR_ATOM = atom({
  key: 'TOOLBAR_ATOM',
  default: {
    thk_filter:{
      min: 0,
      max: 100,
      max_range:100,
      run:false
    },  
    heatmap_view: false,
    scan_registration_mode: false,
    hover_thickness: false,
    fit_all: true,
    visual_inspection: false
  }
});


export const HOVER_DATA_ATOM = atom({
  key: "HOVER_DATA_ATOM",
  default: null,
});

export const AUT_DATA_ATOM = atom({
  key: "AUT_DATA_ATOM",
  default: null,
});


































export const MODEL_TAG_ATOM = atom({
  key: 'MODEL_TAG_ATOM',
  default: null
});



// currently selected mesh (single selection for now)
export const SELECTED_MESH_ATOM = atom({
  key: "SELECTED_MESH_ATOM",
  default: null,
});






















export const MEASUREMENT_POINTS_ATOM = atom({
  key: 'MEASUREMENT_POINTS_ATOM',
  default: []
});






// "view only" mode -> stores uuid of the mesh
export const VIEW_ONLY_MESH_ATOM = atom({
  key: "VIEW_ONLY_MESH_ATOM",
  default: null,
});

// set of hidden meshes (uuids)
export const HIDDEN_MESHES_ATOM = atom({
  key: "HIDDEN_MESHES_ATOM",
  default: new Set(),
});

export const CONTEXT_MENU_STATE = atom({
  key: "CONTEXT_MENU_STATE",
  default: null,
});



export const CURRENT_THICKNESS_POINT = atom({
  key: "CURRENT_THICKNESS_POINT",
  default: null,
});



export const SCAN_DATA = atom({
  key: "SCAN_DATA",
  default: null,
});


export const SCAN_REG_ATOM = atom({
  key: "SCAN_REG_ATOM",
  default: null,
});



export const sceneRefStateAtom = atom({
  key: "sceneRefStateAtom",
  default: { current: null },
});