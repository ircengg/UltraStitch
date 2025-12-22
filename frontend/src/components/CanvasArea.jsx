import { useRef, useState } from "react";
import { Stage, Layer, Rect, Circle, Line, Text, Transformer, Image as KonvaImage, Group } from "react-konva";
import { Box } from "@mantine/core";
import useImage from "use-image";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { drawingAtom, mesurementAtom, newMesaurementAtom, newShapeAtom, projectAtom, referenceAtom, scansAtom, selectedObjectAtom, selectedScanAtom, thkDataAtom, toolbarAtom } from "../atom";
import Grid from "./Grid";
import { Measurements } from "./Measurements";
import { useRecoilValue } from "recoil";
import { round } from "../utils";

import ScanImage from "./ScanImage";
import Reference from "./Reference";
import DrawingShapes from "./DrawingShapes";
import { useSetRecoilState } from "recoil";
import ThicknessGrid from "./ThicknessGrid";
import HoverThickness from "./HoverThickness";
import { useApi } from "../hooks/useApi";


export default function CanvasArea() {
    const { api } = useApi()
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

    const thkData = useRecoilValue(thkDataAtom);

    const [hoverValue, setHoverValue] = useState(null);

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

    function binarySearchIndex(arr, value) {
        let lo = 0, hi = arr.length - 1;
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            if (arr[mid] === value) return mid;
            if (arr[mid] < value) lo = mid + 1;
            else hi = mid - 1;
        }
        return Math.max(0, Math.min(lo, arr.length - 1));
    }

    const rafRef = useRef(null);





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

        // console.log("Dropped at world coords:", pos);

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
            m.distance = round(Math.hypot(m.p2.x - m.p1.x, m.p2.y - m.p1.y));
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
                x: round(pos.x),
                y: round(pos.y),
                width: 0,
                height: 0
            });
        }

        if (toolbar.draw_circle) {
            setNewShape({
                id,
                type: "circle",
                x: round(pos.x),
                y: round(pos.y),
                radius: 0
            });

        }

        if (toolbar.draw_polygon) {
            setNewShape({
                id,
                type: "polygon",
                points: [round(pos.x), round(pos.y)],   // first point
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
                shape.width = round(pos.x - shape.x);
                shape.height = round(pos.y - shape.y);
            }
            if (shape.type === "circle") {
                shape.radius = round(Math.hypot(pos.x - shape.x, pos.y - shape.y));
            }
            if (shape.type === "polygon") {
                const pts = [...shape.points];
                pts.push(pos.x, pos.y);
                shape.points = pts.slice(-200);
            }
            return shape;
        });


        //---Live Thickness Values
        if (drawing.showThickness) {
            if (rafRef.current) return;
            if (!thkData) return;

            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = null;

                const stage = e.target.getStage();
                const pos = getRelativePointerPosition(stage);
                if (!pos) return;

                const nx = pos.x / drawing.surfaceWidth;
                const ny = pos.y / drawing.surfaceHeight;

                const worldX = nx * thkData.x[thkData.x.length - 1];
                const worldY = ny * thkData.y[thkData.y.length - 1];

                const col = binarySearchIndex(thkData.x, worldX);
                const row = binarySearchIndex(thkData.y, worldY);
                const thk = thkData.matrix[row]?.[col] ?? null;
                // console.log(thk)
                setHoverValue({
                    thk,
                    pos,
                    x: row,
                    y: col
                });
            });
        }



    };



    const handleMouseUp = () => {
        if (!newShape) return;
        setDrawing(d => ({
            ...d,
            shapes: [...d.shapes, newShape]
        }));
        setNewShape(null)
    };

    const handleThkRegClick = async (e) => {
        const stage = e.target.getStage();
        const pos = getRelativePointerPosition(stage);
        console.log(pos)
        const thk = await api("getThicknessAt", { x: round(pos.x), y: round(pos.y) });
        console.log("thk: ", thk);

        if (thk) {
            setHoverValue({
                thk: thk.value,
                pos,
                x: thk.row,
                y: thk.col,
                nominal: thk.nominal
            });
        } else {
            setHoverValue(null);
        }

    }



    useEffect(() => {
        const handleKeyDown = (e) => {
            // console.log("key pressed:", e.key);

            if (e.key === "Escape") {
                // Example: cancel measuring
                setNewMeasurement(null);
                setNewShape(null);
                setToolbar({
                    ...toolbar,
                    measuring: false,
                    scan_registration_mode: false,
                    draw_rectangle: false,
                    draw_circle: false,
                    draw_polygon: false
                });

            }

            if (e.key === "m") {
                // toggle measuring tool
                setToolbar(t => ({ ...t, measuring: !t.measuring }));
            }
            if (e.key === "Delete" && selectedObj) {
                // console.log("Deleting: ")
                // console.log(selectedObj)
                if (selectedObj.type == "dimension") {
                    setMeasurements(prev => prev.filter(p => p.id != selectedObj.obj?.id));
                }
                if (selectedObj.type == "shape") {
                    setDrawing(d => ({
                        ...d,
                        'shapes': d.shapes.filter(s => {
                            // console.log(s.id)
                            // console.log(selectedObj.obj?.id)
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


    useEffect(() => {
        if (toolbar.fit_all) {

            setToolbar({ ...toolbar, fit_all: false })
        }
    }, [toolbar.fit_all])


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
                <Layer>
                    {
                        drawing.showGrid && <Grid
                            widthMM={drawing.surfaceWidth}
                            heightMM={drawing.surfaceHeight}
                        />
                    }

                    {
                        drawing.showReference && references.map((reference) => (
                            <>
                                <Reference reference={reference} key={reference.id} />
                            </>
                        ))
                    }

                    {
                        drawing.showThickness && <ThicknessGrid handleClick={handleThkRegClick} />
                    }
                </Layer>


                <Layer>
                    {
                        drawing.showScans && scans.filter(scan => scan.x !== undefined && scan.y !== undefined).map((scan) => (
                            <ScanImage scan={scan} key={scan.id} />
                        ))
                    }

                    {toolbar.scan_registration_mode && <Transformer
                        ref={trRef}
                        rotateEnabled
                        anchorSize={10}
                        keepRatio={false}
                        boundBoxFunc={(oldBox, newBox) => newBox}
                    />
                    }

                    {
                        drawing.showMeasurements && <Measurements />

                    }


                    {
                        drawing.showShapes && <DrawingShapes stageRef={stageRef} />
                    }

                </Layer>

            </Stage>


            {(hoverValue && drawing.showThickness) && <HoverThickness
                value={hoverValue.thk}
                pointer={hoverValue.pos}
                visible={hoverValue ? true : false}
                nominal={25} // or pass your nominal variable
                offset={{ x: 18, y: 18 }}
            />}
        </Box>
    );
}

