
import {
    Box,
    Button,
    Collapse,
    Group,
    Text,
    Switch,
    Paper,
    ScrollArea,
    TextInput,
    NumberInput,
    ColorInput,
    Checkbox,
    Divider
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";
import { useRecoilState } from "recoil";
import { drawingAtom, viewAtom } from "../atom";

export default function DrawingSettings() {
    const [drawing, setDrawing] = useRecoilState(drawingAtom);
    const [view, setView] = useRecoilState(viewAtom);


    const handleChange = (key, value) => {
        setDrawing(prev => ({ ...prev, [key]: value }));
        // console.log(drawing);
    }

    if (!view.drawing_setting) {
        return null;
    }

    return (
        <Box
            style={{
                position: "absolute",
                top: 20,
                right: 20,
                zIndex: 100,
                width: 260,
                transition: "all 0.2s ease",
                // backgroundColor: "ActiveText"
            }}
        >

            <Collapse in={view.drawing_setting} style={{ backgroundColor: 'inherit' }}>
                <Paper
                    withBorder
                    mt="sm"
                    p="sm"
                    shadow="sm"
                    radius="md"
                    style={{ height: "70vh" }}
                >
                    <ScrollArea style={{ height: "100%", backgroundColor: 'inherit' }}>
                        <Divider label="Grid Settings" my={10} />
                        <Checkbox
                            my={5}
                            checked={drawing.showGrid}
                            label="Grid"
                            onChange={e => handleChange("showGrid", e.target.checked)}
                        />
                        <NumberInput
                            value={drawing.surfaceWidth}
                            label="Surface Width (mm)"
                            onChange={value => handleChange("surfaceWidth", value)}
                        />
                        <NumberInput
                            value={drawing.surfaceHeight}
                            label="Surface Height (mm)"
                            onChange={value => handleChange("surfaceHeight", value)}
                        />

                        <NumberInput
                            value={drawing.gridStep}
                            label="Grid Step (mm)"
                            onChange={value => handleChange("gridStep", value)}
                        />
                        <NumberInput
                            value={drawing.gridfontSize}
                            label="Font Size"
                            onChange={value => handleChange("gridfontSize", value)}
                        />
                        <ColorInput
                            value={drawing.gridfontColor}
                            label="Font Color"
                            onChange={value => handleChange("gridfontColor", value)}
                        />


                        {/* References */}
                        <Divider label="References" my={10} />


                        <Checkbox
                            my={5}
                            checked={drawing.showReference}
                            label="Show Reference"
                            onChange={e => handleChange("showReference", e.target.checked)}
                        />
                        <NumberInput
                            value={drawing.referenceOpacity}
                            label="Opacity (%)"
                            min={0}
                            max={100}
                            onChange={value => handleChange("referenceOpacity", value)}
                        />



                        {/* Scans */}
                        <Divider label="Scans" my={10} />

                        <Checkbox
                            my={5}
                            checked={drawing.showScans}
                            label="Show Scans"
                            onChange={e => handleChange("showScans", e.target.checked)}
                        />
                        <Checkbox
                            my={5}
                            checked={drawing.scanDetailsOn}
                            label="Show Scan Details"
                            onChange={e => handleChange("scanDetailsOn", e.target.checked)}
                        />
                        <NumberInput
                            value={drawing.scanOpacity}
                            label="Opacity (%)"
                            min={0}
                            max={100}
                            onChange={value => handleChange("scanOpacity", value)}
                        />
                        <NumberInput
                            value={drawing.scanfontSize}
                            label="Font Size"
                            onChange={value => handleChange("scanfontSize", value)}
                        />
                        <ColorInput
                            value={drawing.scanfontColor}
                            label="Font Color"
                            onChange={value => handleChange("scanfontColor", value)}
                        />


                        {/* Shapes */}
                        <Divider label="Shapes" my={10} />
                        <Checkbox
                            my={5}
                            checked={drawing.showShapes}
                            label="Show Annotations"
                            onChange={e => handleChange("showShapes", e.target.checked)}
                        />
                        <NumberInput
                            value={drawing.shapeOpacity}
                            label="Opacity (%)"
                            min={0}
                            max={100}
                            onChange={value => handleChange("shapeOpacity", value)}
                        />
                        <NumberInput
                            value={drawing.shapeFontSize}
                            label="Font Size"
                            onChange={value => handleChange("shapeFontSize", value)}
                        />
                        <ColorInput
                            value={drawing.shapeFontColor}
                            label="Font Color"
                            onChange={value => handleChange("shapeFontColor", value)}
                        />
                        <NumberInput
                            value={drawing.shapeLineSize}
                            label="Line Size"
                            onChange={value => handleChange("shapeLineSize", value)}
                        />
                        <ColorInput
                            value={drawing.ShapeColor}
                            label="Line Color"
                            onChange={value => handleChange("ShapeColor", value)}
                        />



                        {/* Measurements */}
                        <Divider label="Measurements" my={10} />
                        <Checkbox
                            my={5}
                            checked={drawing.showMeasurements}
                            label="Show Measurements"
                            onChange={e => handleChange("showMeasurements", e.target.checked)}
                        />
                        <NumberInput
                            value={drawing.mFontSize}
                            label="Font Size"
                            onChange={value => handleChange("mFontSize", value)}
                        />
                        <ColorInput
                            value={drawing.mFontColor}
                            label="Font Color"
                            onChange={value => handleChange("mFontColor", value)}
                        />


                        {/* Thickness Data */}
                        <Divider label="Thickness Data" my={10} />
                        <Checkbox
                            my={5}
                            checked={drawing.showThickness}
                            label="Show Thickness Data"
                            onChange={e => handleChange("showThickness", e.target.checked)}
                        />
                    </ScrollArea>
                </Paper>
            </Collapse>
        </Box>
    );
}
