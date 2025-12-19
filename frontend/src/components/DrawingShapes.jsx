import { useRef } from "react";
import { Layer, Rect, Circle, Line, Transformer, Text } from "react-konva";
import { useRecoilState } from "recoil";
import { drawingAtom, newShapeAtom, selectedObjectAtom, toolbarAtom } from "../atom";
import { useRecoilValue } from "recoil";

export default function DrawingShapes() {
    const [drawing, setDrawing] = useRecoilState(drawingAtom);
    const newShape = useRecoilValue(newShapeAtom);
    const trRef = useRef();


    return (
        <Layer>

            {/* SAVED SHAPES */}
            {drawing.shapes.map(shape => (<Shape shape={shape} />))}

            {/* TRANSFORMER */}
            <Transformer
                ref={trRef}
                rotateEnabled
                enabledAnchors={[
                    "top-left", "top-right",
                    "bottom-left", "bottom-right",
                ]}
            />

            {/* LIVE DRAWING SHAPE */}
            {
                newShape && <Shape shape={newShape} />
            }
        </Layer>
    );
}





const Shape = ({ shape }) => {
    const [drawing, setDrawing] = useRecoilState(drawingAtom);
    const [toolbar] = useRecoilState(toolbarAtom);
    const [selected, setSelected] = useRecoilState(selectedObjectAtom);
    const isSelected = (selected.type == "shape" && selected?.obj?.id == shape.id)


    const handleSelect = () => {
        setSelected({
            type: "shape",
            obj: shape
        });
    };

    const handleDragMove = (id, e) => {
        const node = e.target;
        const { x, y } = node.position();

        setDrawing((d) => ({
            ...d,
            shapes: d.shapes.map(s =>
                s.id === id ? { ...s, x, y } : s
            ),
        }));
    };

    const handleTransformEnd = (id, e) => {
        const node = e.target;

        setDrawing((d) => ({
            ...d,
            shapes: d.shapes.map(s => {
                if (s.id !== id) return s;

                if (s.type === "rect") {
                    return {
                        ...s,
                        x: node.x(),
                        y: node.y(),
                        width: node.width() * node.scaleX(),
                        height: node.height() * node.scaleY(),
                    };
                }

                if (s.type === "circle") {
                    return {
                        ...s,
                        x: node.x(),
                        y: node.y(),
                        radius: node.radius() * node.scaleX(),
                    };
                }

                return s;
            }),
        }));

        node.scaleX(1);
        node.scaleY(1);
    };


    return <>
        {shape.type === "rect" && (
            <Rect
                x={shape.x}
                y={shape.y}
                stroke={isSelected ? "blue" : drawing.shapeFontColor}
                strokeWidth={isSelected ? drawing.shapeLineSize * 2 : drawing.shapeLineSize}
                draggable={toolbar.scan_registration_mode && isSelected}
                onClick={handleSelect}
                onTap={handleSelect}
                onDragMove={(e) => handleDragMove(shape.id, e)}
                onTransformEnd={(e) => handleTransformEnd(shape.id, e)}
                width={shape.width}
                height={shape.height}

            />
        )}

        {shape.type === "circle" && (
            <Circle
                x={shape.x}
                y={shape.y}
                stroke={isSelected ? "blue" : drawing.shapeFontColor}
                draggable={toolbar.scan_registration_mode && isSelected}
                onClick={() => handleSelect(shape.id)}
                onTap={() => handleSelect(shape.id)}
                onDragMove={(e) => handleDragMove(shape.id, e)}
                onTransformEnd={(e) => handleTransformEnd(shape.id, e)}
                radius={shape.radius}
                strokeWidth={isSelected ? drawing.shapeLineSize * 2 : drawing.shapeLineSize}
            />
        )}

        {shape.type === "polygon" && (
            <Line
                x={shape.x}
                y={shape.y}
                stroke={isSelected ? "blue" : drawing.shapeFontColor}
                draggable={toolbar.scan_registration_mode && isSelected}
                onClick={() => handleSelect(shape.id)}
                onTap={() => handleSelect(shape.id)}
                onDragMove={(e) => handleDragMove(shape.id, e)}
                onTransformEnd={(e) => handleTransformEnd(shape.id, e)}
                points={shape.points}
                closed
                fill="transparent"
                strokeWidth={isSelected ? drawing.shapeLineSize * 2 : drawing.shapeLineSize}
            />
        )}
        <Text
            x={shape.x}
            y={shape.y}
            text={`R:${shape.radius || ""}, W:${shape.width || ""}, H:${shape.height || ""} mm`}
            fontSize={drawing.shapeFontSize}
            fill={drawing.shapeFontColor}
            offsetX={40}
            offsetY={10}
        />
    </>
}