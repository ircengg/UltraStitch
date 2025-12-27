
import { Image as KonvaImage } from "react-konva";

import useImage from "use-image";

import { useRecoilState } from "recoil";
import { drawingAtom, referenceAtom, selectedObjectAtom, staticServerAtom, toolbarAtom } from "../atom";

import { useRecoilValue } from "recoil";
import { round } from "../utils";




const Reference = ({ reference }) => {
    const [references, setReferences] = useRecoilState(referenceAtom)
    const drawing = useRecoilValue(drawingAtom);
    const toolbar = useRecoilValue(toolbarAtom);
    const static_server_url = useRecoilValue(staticServerAtom);


    const [image] = useImage(`${static_server_url}/reference/${encodeURIComponent(reference.map)}`);
    const [selected, setSelected] = useRecoilState(selectedObjectAtom);


    const isSelcted = (selected.type == "reference" && selected?.obj?.id == reference.id)

    // 🟢 Drag move
    const handleDragEnd = (e) => {
        console.log("dragging")
        const node = e.target;
        const refrence_ = {
            ...reference,
            x: round(node.x()),
            y: round(node.y()),
            rotation: round(node.rotation()),
            width: round(node.width()),
            height: round(node.height()),
        };

        setReferences(prev => prev.map(s => s.id === reference.id ? refrence_ : s));
    };

    // 🟢 Transform (resize / rotate)
    const handleTransformEnd = (e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        const newWidth = node.width() * scaleX;
        const newHeight = node.height() * scaleY;

        node.scaleX(1);
        node.scaleY(1);
        node.width(newWidth);
        node.height(newHeight);

        const reference_ = {
            ...reference,
            x: round(node.x()),
            y: round(node.y()),
            rotation: round(node.rotation()),
            width: round(newWidth),
            height: round(newHeight)
        };


        setReferences(prev => prev.map(s => s.id === reference.id ? reference_ : s));

    };



    return <KonvaImage
        id={`reference-${reference.id}`}
        // ref={imgRef}
        image={image}
        x={reference.x}
        y={reference.y}
        width={reference.width || drawing.surfaceWidth}
        height={reference.height || drawing.surfaceHeight}
        rotation={reference.rotation || 0}
        draggable={toolbar.scan_registration_mode && isSelcted}
        stroke={isSelcted ? "blue" : undefined}
        strokeWidth={20}
        onClick={(e) => {
            // e.cancelBubble = true;
            setSelected({
                type: "reference",
                obj: reference
            });
        }}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        opacity={drawing.referenceOpacity / 100}
        // onMouseEnter={onScanHoverIn}
        // onMouseMove={handleMouseMove}
        // onMouseLeave={onScanHoverOut}
        perfectDrawEnabled={false}
    />



}


export default Reference