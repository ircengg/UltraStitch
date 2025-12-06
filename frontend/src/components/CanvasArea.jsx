import { useRef, useState } from "react";
import { Stage, Layer, Rect, Circle, Line, Text, Transformer, Image as KonvaImage, Group } from "react-konva";
import { Box } from "@mantine/core";
import useImage from "use-image";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { drawingAtom, mesurementAtom, newMesaurementAtom, newShapeAtom, projectAtom, referenceAtom, scansAtom, selectedObjectAtom, selectedScanAtom, toolbarAtom } from "../atom";
import Grid from "./Grid";
import { Measurements } from "./Measurements";
import { useRecoilValue } from "recoil";
import { round } from "../utils";

import ScanImage from "./ScanImage";
import Reference from "./Reference";
import DrawingShapes from "./DrawingShapes";
import { useSetRecoilState } from "recoil";


export default function CanvasArea() {
    const stageRef = useRef();
    const trRef = useRef();
    const containerRef = useRef();

    const [references, setReferences] = useRecoilState(referenceAtom);
    const [scans, setScans] = useRecoilState(scansAtom);
    const selectedScan = useRecoilValue(selectedScanAtom);
    const [selectedObj, setSelectedObj] = useRecoilState(selectedObjectAtom);
    const [toolbar, setToolbar] = useRecoilState(toolbarAtom);
    const [measurements, setMeasurements] = useRecoilState(mesurementAtom);
    const [drawing, setDrawing] = useRecoilState(drawingAtom);

    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });



    //  new objects
    const [newShape, setNewShape] = useRecoilState(newShapeAtom);
    const [newMeasurement, setNewMeasurement] = useRecoilState(newMesaurementAtom)



    const scale = Math.min(
        dimensions.width / drawing.surfaceWidth,
        dimensions.height / drawing.surfaceHeight
    );


    function getRelativePointerPosition(stage) {
        const transform = stage.getAbsoluteTransform().copy();
        transform.invert();
        const pos = stage.getPointerPosition();
        return transform.point(pos);
    }






    const handleDrop = (e) => {
        e.preventDefault();

        const stage = stageRef.current;
        const rect = stage.container().getBoundingClientRect();

        // Get pointer position relative to stage DOM container
        const pointer = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        // Convert to world coords considering scale and drag
        const transform = stage.getAbsoluteTransform().copy().invert();
        const pos = transform.point(pointer);

        console.log("Dropped at world coords:", pos);

        const scans_ = [...scans];
        const data = JSON.parse(e.dataTransfer.getData("scan-data"));
        const index = scans_.findIndex(s => s.id == data.id);
        if (index === -1) return;

        scans_[index] = {
            ...scans_[index],
            x: round(pos.x),
            y: round(pos.y),
        };

        setScans(scans_);
    };



    const handleDragOver = (e) => e.preventDefault();

    // 🔍 Zoom
    const handleWheel = (e) => {
        e.evt.preventDefault();
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();
        const scaleBy = 2;
        const direction = e.evt.deltaY > 0 ? -1 : 1;
        const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };
        stage.scale({ x: newScale, y: newScale });
        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };
        stage.position(newPos);
        stage.batchDraw();
        // setScale(newScale);
        // setPosition(newPos);
    };






    // 🪟 Resize
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver(() => {
            const rect = containerRef.current.getBoundingClientRect();
            setDimensions({
                width: rect.width,
                height: rect.height,
            });
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);



    // 🎯 Attach transformer to selected image
    useEffect(() => {
        const stage = stageRef.current;
        const transformer = trRef.current;
        if (!stage || !transformer || !selectedScan) return;

        const node = stage.findOne(`#scan-${selectedScan.id}`);
        if (node) {
            transformer.nodes([node])
        } else {
            transformer.nodes([])
        };
        transformer.getLayer()?.batchDraw();
    }, [selectedScan, scans]);




    const handleCanvaClick = (e) => {
        if (!toolbar.measuring) {
            return
        }
        const stage = e.target.getStage();
        const pos = getRelativePointerPosition(stage);

        if (!newMeasurement) {
            const id = "dim-" + Date.now();
            setNewMeasurement({ p1: pos, id });
        } else {
            let m = { ...newMeasurement };
            m.p2 = pos
            m.distance = Math.hypot(m.p2.x - m.p1.x, m.p2.y - m.p1.y);
            setMeasurements(prev => [...prev, m]);
            setNewMeasurement(null);
        }
    }


    const handleMouseDown = (e) => {
        if (!toolbar.draw_rectangle && !toolbar.draw_circle && !toolbar.draw_polygon) return;
        const stage = e.target.getStage();
        const pos = getRelativePointerPosition(stage);
        const id = "shape-" + Date.now();

        if (toolbar.draw_rectangle) {
            setNewShape({
                id,
                type: "rect",
                x: pos.x,
                y: pos.y,
                width: 0,
                height: 0
            });
        }

        if (toolbar.draw_circle) {
            setNewShape({
                id,
                type: "circle",
                x: pos.x,
                y: pos.y,
                radius: 0
            });

        }

        if (toolbar.draw_polygon) {
            setNewShape({
                id,
                type: "polygon",
                points: [pos.x, pos.y],   // first point
                stroke: "black"
            });
        }
    };

    const handleMouseMove = (e) => {
        // LIVE MEASUREMENT MODE
        if (toolbar.measuring && newMeasurement) {
            const stage = e.target.getStage();
            const pos = getRelativePointerPosition(stage);

            setNewMeasurement(m => {
                const updated = { ...m };
                updated.p2 = pos;   // live update endpoint
                updated.distance = Math.hypot(pos.x - m.p1.x, pos.y - m.p1.y);
                return updated;
            });
            return; // IMPORTANT: don't continue into shape drawing logic
        }

        // SHAPE DRAWING LOGIC (your existing code)
        if (!toolbar.draw_rectangle && !toolbar.draw_circle && !toolbar.draw_polygon) return;
        if (!newShape) return;

        const stage = e.target.getStage();
        const pos = getRelativePointerPosition(stage);
        setNewShape(s => {
            const shape = { ...s };
            if (shape.type === "rect") {
                shape.width = pos.x - shape.x;
                shape.height = pos.y - shape.y;
            }
            if (shape.type === "circle") {
                shape.radius = Math.hypot(pos.x - shape.x, pos.y - shape.y);
            }
            if (shape.type === "polygon") {
                const pts = [...shape.points];
                pts.push(pos.x, pos.y);
                shape.points = pts.slice(-200);
            }
            return shape;
        });
    };



    const handleMouseUp = () => {
        if (!newShape) return;
        setDrawing(d => ({
            ...d,
            shapes: [...d.shapes, newShape]
        }));
        setNewShape(null)
    };



    useEffect(() => {
        const handleKeyDown = (e) => {
            console.log("key pressed:", e.key);

            if (e.key === "Escape") {
                // Example: cancel measuring
                setNewMeasurement(null);
                setNewShape(null);
            }

            if (e.key === "m") {
                // toggle measuring tool
                setToolbar(t => ({ ...t, measuring: !t.measuring }));
            }
            if (e.key === "Delete" && selectedObj) {
                console.log("Deleting: ")
                console.log(selectedObj)
                if (selectedObj.type == "dimension") {
                    setMeasurements(prev => prev.filter(p => p.id != selectedObj.obj?.id));
                }
                if (selectedObj.type == "shape") {
                    setDrawing(d => ({
                        ...d,
                        'shapes': d.shapes.filter(s => {
                            console.log(s.id)
                            console.log(selectedObj.obj?.id)
                            return s.id != selectedObj.obj?.id
                        })
                    }));
                }
                if (selectedObj.type == "reference") {
                    setReferences(prev => prev.filter(p => p.id != selectedObj.obj?.id));
                }
                if (selectedObj.type == "scan") {
                    setScans(prev => prev.filter(p => p.id != selectedObj.obj?.id));
                }
                setSelectedObj({
                    type: "",
                    obj: null
                });
            }

            return null;
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedObj]);





    return (
        <Box
            ref={containerRef}
            w="100vw"   // <-- FIXED
            h="100vh"
            bg="white"
            p={0}
            m={0}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                boxSizing: "border-box"   // ⭐ FIX
            }}
        >
            <Stage
                width={dimensions.width}
                height={dimensions.height}
                scaleX={scale}
                scaleY={scale}
                ref={stageRef}
                draggable={!(toolbar.draw_rectangle || toolbar.draw_circle || toolbar.draw_polygon)}  // <-- FIX

                onWheel={handleWheel}
                onClick={handleCanvaClick}


                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                {
                    drawing.showGrid && <Layer>
                        <Grid
                            widthMM={drawing.surfaceWidth}
                            heightMM={drawing.surfaceHeight}
                        />
                    </Layer>
                }

                {
                    drawing.showReference && <Layer>
                        {references.map((reference) => (
                            <>
                                <Reference reference={reference} key={reference.id} />
                            </>
                        ))}
                    </Layer>
                }

                {
                    drawing.showScans && <Layer>
                        {scans.filter(scan => scan.x !== undefined && scan.y !== undefined).map((scan) => (

                            <>
                                <ScanImage scan={scan} key={scan.id} />
                                {drawing.scanDetailsOn && <Text
                                    x={scan.x}
                                    y={scan.y}
                                    rotation={scan.rotation || 0}
                                    text={scan.name}
                                    fontSize={drawing.fontSize * 2}
                                    fill="black"
                                />}
                            </>
                        ))}
                        {
                            toolbar.scan_registration_mode && <Transformer
                                ref={trRef}
                                rotateEnabled
                                anchorSize={10}
                                keepRatio={false}
                                boundBoxFunc={(oldBox, newBox) => newBox}
                            />
                        }
                    </Layer>

                }


                {
                    drawing.showMeasurements && <Layer>
                        <Measurements />
                    </Layer>

                }

                {
                    drawing.showShapes && <DrawingShapes stageRef={stageRef} />
                }
            </Stage>

        </Box>
    );
}

