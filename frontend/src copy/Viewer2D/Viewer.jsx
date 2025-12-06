import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Group, Text, Transformer } from "react-konva";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import useImage from "use-image";
import { AUT_DATA_ATOM, HOVER_DATA_ATOM, TOOLBAR_ATOM } from "../atom";
import { Button } from "@mantine/core";
import UseServer from "../../Server";
import { round } from "../utils";

export default function CorrosionMappingViewer({ backgroundSrc }) {
    const { db } = UseServer()
    const stageRef = useRef();
    const trRef = useRef();
    const [bgImage] = useImage(backgroundSrc);
    const [selectedId, setSelectedId] = useState(null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [toolbar, setToolbar] = useRecoilState(TOOLBAR_ATOM);
    const [autData, setAutData] = useRecoilState(AUT_DATA_ATOM)

    // 🧭 Fit background to stage
    const resetViewToFit = () => {
        if (bgImage && stageRef.current) {
            const stage = stageRef.current;
            const imgWidth = bgImage.width;
            const imgHeight = bgImage.height;
            const stageWidth = dimensions.width;
            const stageHeight = dimensions.height;
            const scaleX = stageWidth / imgWidth;
            const scaleY = stageHeight / imgHeight;
            const newScale = Math.min(scaleX, scaleY);
            const x = (stageWidth - imgWidth * newScale) / 2;
            const y = (stageHeight - imgHeight * newScale) / 2;
            stage.scale({ x: newScale, y: newScale });
            stage.position({ x, y });
            stage.batchDraw();
            setScale(newScale);
            setPosition({ x, y });
        }
    };

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
        setScale(newScale);
        setPosition(newPos);
    };

    // 🖱 Deselect
    const handleStageMouseDown = (e) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            setSelectedId(null);
            trRef.current?.nodes([]);
            trRef.current?.getLayer()?.batchDraw();
        }
    };

    const handleScanRegistrationSave = async () => {
        if (!autData?.name) return;

        try {
            // Merge local scan updates into Frappe scans by scan_number
            const updatedScans = autData.scans.map(existingScan => {
                // Create merged object with updated coordinates
                const merged = {
                    ...existingScan,
                    doctype: "SPAI AUT Scan",
                    parent: autData.name,
                    parenttype: "SPAI AUT",
                    parentfield: "scans",
                };

                // Remove heavy props not needed in DB
                delete merged.data;
                delete merged.image;

                return merged;
            });

            const payload = { scans: updatedScans };
            console.log("📤 Saving to Frappe:", payload);
            // return

            const res = await db.updateDoc("SPAI AUT", autData.name, payload);
            console.log("✅ Scan registration saved:", res);

        } catch (err) {
            console.error("❌ Failed to save scan registration:", err);
        }
    };





    // 🪟 Resize
    useEffect(() => {
        const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // 🖼 Auto fit
    useEffect(() => {
        resetViewToFit();
    }, [bgImage, dimensions]);

    useEffect(() => {
        if (toolbar.fit_all) {
            resetViewToFit();
            setToolbar({ ...toolbar, fit_all: false });
        }
    }, [toolbar]);

    // 🎯 Attach transformer to selected image
    useEffect(() => {
        const stage = stageRef.current;
        const transformer = trRef.current;
        if (!stage || !transformer) return;

        if (selectedId !== null && selectedId !== undefined) {
            const node = stage.findOne(`#scan-${selectedId}`);
            if (node) transformer.nodes([node]);
            else transformer.nodes([]);
        } else {
            transformer.nodes([]);
        }

        transformer.getLayer()?.batchDraw();
    }, [selectedId, autData.scans]);



    // 🧩 Update scan data
    const handleTransformUpdate = (scanIndex, newProps) => {
        let scans_ = [...autData.scans];
        scans_[scanIndex] = { ...scans_[scanIndex], ...newProps };
        setAutData({ ...autData, scans: scans_ });
    };

    return (
        <div style={{ width: "100vw", height: "100vh", background: "#f4f4f4" }}>
            <Stage
                ref={stageRef}
                width={dimensions.width}
                height={dimensions.height}
                draggable
                onWheel={handleWheel}
                onMouseDown={handleStageMouseDown}
                style={{ cursor: "grab" }}
            >
                <Layer>
                    {bgImage && (
                        <KonvaImage image={bgImage} width={bgImage.width} height={bgImage.height} perfectDrawEnabled={false} />
                    )}
                </Layer>

                <Layer>
                    {toolbar.heatmap_view &&
                        autData.scans.map((scan, scanIndex) => (
                            <ScanStrip
                                key={scanIndex}
                                scanIndex={scanIndex}
                                scan={scan}
                                isSelected={selectedId === scanIndex}
                                onSelect={() => setSelectedId(scanIndex)}
                                onTransform={handleTransformUpdate}
                            />
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
            </Stage>
            {toolbar.scan_registration_mode && <Button style={{ position: 'fixed', top: 8, right: 8, border: 2 }} variant="light" size="small" onClick={handleScanRegistrationSave}>SAVE</Button>}
        </div>
    );
}

function ScanStrip({ scanIndex, scan, isSelected, onSelect, onTransform }) {
    const toolbar = useRecoilValue(TOOLBAR_ATOM)
    const setHoverInfo = useSetRecoilState(HOVER_DATA_ATOM);
    const imgRef = useRef();
    const heatmap = scan.image;

    // 🟢 Drag move
    const handleDragEnd = (e) => {
        const node = e.target;
        onTransform(scanIndex, {
            x: Math.round(node.x()),
            y: Math.round(node.y()),
            rotation: node.rotation(),
            width: node.width(),
            height: node.height(),
        });
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

        onTransform(scanIndex, {
            x: Math.round(node.x()),
            y: Math.round(node.y()),
            rotation: node.rotation(),
            width: newWidth,
            height: newHeight,
        });
    };

    // Convert mouse position to thickness + actual x,y labels
    // Convert mouse position → real X, Y, and thickness
    const getThicknessAtMouse = (e) => {
        const imageNode = imgRef.current;
        if (!imageNode || !scan?.data) return null;

        const { matrix, x_labels, y_labels } = scan.data;
        const pos = imageNode.getRelativePointerPosition();

        const col = Math.floor((pos.x / imageNode.width()) * matrix[0].length);
        const row = Math.floor(((imageNode.height() - pos.y) / imageNode.height()) * matrix.length);

        if (row < 0 || row >= matrix.length || col < 0 || col >= matrix[0].length)
            return null;

        const thk = matrix[row][col];
        const xLabel = x_labels[col] ?? col;
        const yLabel = y_labels[row] ?? row;

        return { thk, xPos: xLabel, yPos: yLabel };
    };




    // 🟡 Hover handlers
    const onScanHoverIn = (e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "pointer";
        const { clientX, clientY } = e.evt;

    };

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e.evt;
        const thkInfo = getThicknessAtMouse(e);
        if (thkInfo) {
            setHoverInfo({
                thkInfo: thkInfo,
                point: { x: clientX, y: clientY },
                scan: scan
            })
        } else {
            setHoverInfo(null);
        }
    };


    const onScanHoverOut = (e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "default";
        setHoverInfo(null);
    };

    return (
        <KonvaImage
            id={`scan-${scanIndex}`}
            ref={imgRef}
            image={heatmap}
            x={scan.x}
            y={scan.y}
            width={scan.width}
            height={scan.height}
            rotation={scan.rotation || 0}
            draggable={toolbar.scan_registration_mode}
            stroke={isSelected ? "yellow" : undefined}
            strokeWidth={0}
            onClick={(e) => {
                e.cancelBubble = true;
                onSelect();
            }}
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransformEnd}
            onMouseEnter={onScanHoverIn}
            onMouseMove={handleMouseMove}
            onMouseLeave={onScanHoverOut}
        />
    );
}


