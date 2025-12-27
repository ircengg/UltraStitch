
import { useRecoilState } from "recoil";
import { drawingAtom, viewAtom } from "../atom";
import Panel from "./Panel";
import FormRenderer from "./FormRenderer";


export default function DrawingSettings() {
    const [drawing, setDrawing] = useRecoilState(drawingAtom);
    const [view, setView] = useRecoilState(viewAtom);

    const handleChange = (key, value) => {
        setDrawing((prev) => ({ ...prev, [key]: value }));
    };

    if (!view.drawing_setting) return null;

    const drawingFields = [
        { type: "divider", label: "Grid Settings" },

        { type: "checkbox", name: "showGrid", label: "Grid" },
        { type: "number", name: "surfaceWidth", label: "Surface Width (mm)" },
        { type: "number", name: "surfaceHeight", label: "Surface Height (mm)" },
        { type: "number", name: "gridStep", label: "Grid Step (mm)" },
        { type: "number", name: "gridfontSize", label: "Font Size" },
        { type: "color", name: "gridfontColor", label: "Font Color" },

        { type: "divider", label: "References" },

        { type: "checkbox", name: "showReference", label: "Show Reference" },
        { type: "number", name: "referenceOpacity", label: "Opacity (%)", min: 0, max: 100 },

        { type: "divider", label: "Scans" },

        { type: "checkbox", name: "showScans", label: "Show Scans" },
        { type: "checkbox", name: "scanDetailsOn", label: "Show Scan Details" },
        { type: "number", name: "scanOpacity", label: "Opacity (%)", min: 0, max: 100 },
        { type: "number", name: "scanfontSize", label: "Font Size" },
        { type: "color", name: "scanfontColor", label: "Font Color" },

        { type: "divider", label: "Shapes" },

        { type: "checkbox", name: "showShapes", label: "Show Annotations" },
        { type: "number", name: "shapeOpacity", label: "Opacity (%)", min: 0, max: 100 },
        { type: "number", name: "shapeFontSize", label: "Font Size" },
        { type: "color", name: "shapeFontColor", label: "Font Color" },
        { type: "number", name: "shapeLineSize", label: "Line Size" },
        { type: "color", name: "ShapeColor", label: "Line Color" },

        { type: "divider", label: "Measurements" },

        { type: "checkbox", name: "showMeasurements", label: "Show Measurements" },
        { type: "number", name: "mFontSize", label: "Font Size" },
        { type: "color", name: "mFontColor", label: "Font Color" },

        { type: "divider", label: "Thickness Data" },

        { type: "checkbox", name: "showThickness", label: "Show Thickness Data" },
    ];


    return (
        <Panel
            title="Drawing Settings"
            onClose={() =>
                setView({ ...view, drawing_setting: false })
            }
        >
            <FormRenderer
                fields={drawingFields}
                value={drawing}
                onChange={handleChange}
            />
        </Panel>
    );
}
