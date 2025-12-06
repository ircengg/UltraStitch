
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
import { drawingAtom } from "../atom";

export default function DrawingSettings() {    
    const [opened, setOpened] = useState(false);
    const [drawing, setDrawing] = useRecoilState(drawingAtom);


    const handleChange = (key, value) => {
        setDrawing(prev => ({ ...prev, [key]: value }));
        console.log(drawing)
    }

    return (
        <Box
            style={{
                position: "absolute",
                top: 20,
                right: 20,
                zIndex: 100,
                width: opened ? 260 : 60,
                transition: "all 0.2s ease",
                // backgroundColor: "ActiveText"
            }}
        >
            <Button
                variant="gradient"
                onClick={() => setOpened((o) => !o)}
                fullWidth
                radius="md"
                leftSection={opened ? <IconChevronRight /> : <IconChevronLeft />}
            >
                Drawing Settings
            </Button>

            <Collapse in={opened} style={{ backgroundColor: 'inherit' }}>
                <Paper
                    withBorder
                    mt="sm"
                    p="sm"
                    shadow="sm"
                    radius="md"
                    style={{ height: "70vh" }}
                >
                    <ScrollArea style={{ height: "100%", backgroundColor: 'inherit' }}>


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
                            value={drawing.scanOpacity}
                            label="Scan Opacity (%)"
                            min={0}
                            max={100}
                            onChange={value => handleChange("scanOpacity", value)}
                        />
                        <NumberInput
                            value={drawing.fontSize}
                            label="Font Size"
                            onChange={value => handleChange("fontSize", value)}
                        />
                        <ColorInput
                            value={drawing.fontColor}
                            label="Font Color"
                            onChange={value => handleChange("fontColor", value)}
                        />

                        <Divider>Shapes</Divider>
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

                        <Divider label="View Settings" my={10} />

                        <Checkbox
                            my={5}
                            checked={drawing.showGrid}
                            label="Show Grid"
                            onChange={e => handleChange("showGrid", e.target.checked)}
                        />


                        <Checkbox
                            my={5}
                            checked={drawing.showReference}
                            label="Show Reference"
                            onChange={e => handleChange("showReference", e.target.checked)}
                        />

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

                        <Checkbox
                            my={5}
                            checked={drawing.showMeasurements}
                            label="Show Measurements"
                            onChange={e => handleChange("showMeasurements", e.target.checked)}
                        />
                        <Checkbox
                            my={5}
                            checked={drawing.showShapes}
                            label="Show Annotations"
                            onChange={e => handleChange("showShapes", e.target.checked)}
                        />
                    </ScrollArea>
                </Paper>
            </Collapse>
        </Box>
    );
}
