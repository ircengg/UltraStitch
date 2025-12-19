import {
    Slider, Paper, Container, Text, RangeSlider, Select,
    Group, ActionIcon, Tooltip, Divider, Box
} from "@mantine/core";

import {
    IconRulerMeasure,
    IconRegistered,
    IconRectangle,
    IconCircle,
    IconPolygon
} from "@tabler/icons-react";

import { useRecoilState } from "recoil";
import { toolbarAtom } from "../atom";
import { IconFilterPlus } from "@tabler/icons-react";


const Toolbar = () => {
    const [toolbar, setToolbar] = useRecoilState(toolbarAtom);

    // Helper to toggle exclusive drawing tool
    const activateTool = (toolName) => {
        setToolbar({
            ...toolbar,
            measuring: false,
            scan_registration_mode: false,
            draw_rectangle: false,
            draw_circle: false,
            draw_polygon: false,
            [toolName]: !toolbar[toolName],
        });
    };


    return (
        <Paper
            shadow="xs"
            style={{
                position: "fixed",
                bottom: 0,
                width: "100vw",
                color: "white",
            }}
        >

            <Group justify="space-between" align="center" px="md" p={5}>
                <Group gap="sm">

                    {/* ------------ Measure Tool ------------ */}
                    <Tooltip label="Fit All">
                        <ActionIcon
                            onClick={() => setToolbar({ ...toolbar, fit_all: true })}
                        >
                            <IconFilterPlus
                                style={{ width: "70%", height: "70%" }}
                                stroke={1.5}
                            />
                        </ActionIcon>
                    </Tooltip>

                    {/* ------------ Measure Tool ------------ */}
                    <Tooltip label="Measure">
                        <ActionIcon
                            variant={toolbar.measuring ? "filled" : "light"}
                            onClick={() => activateTool("measuring")}
                        >
                            <IconRulerMeasure
                                style={{ width: "70%", height: "70%" }}
                                stroke={1.5}
                            />
                        </ActionIcon>
                    </Tooltip>

                    {/* ------------ Scan Registration ------------ */}
                    <Tooltip label="Register Scans">
                        <ActionIcon
                            variant={toolbar.scan_registration_mode ? "filled" : "light"}
                            onClick={() => activateTool("scan_registration_mode")}
                        >
                            <IconRegistered
                                style={{ width: "70%", height: "70%" }}
                                stroke={1.5}
                            />
                        </ActionIcon>
                    </Tooltip>

                    <Divider orientation="vertical" color="rgba(3, 1, 24, 1)" size={2} />

                    {/* ------------ Drawing Tools ------------ */}

                    {/* Rectangle */}
                    <Tooltip label="Draw Rectangle">
                        <ActionIcon
                            variant={toolbar.draw_rectangle ? "filled" : "light"}
                            onClick={() => activateTool("draw_rectangle")}
                        >
                            <IconRectangle
                                style={{ width: "70%", height: "70%" }}
                                stroke={1.5}
                            />
                        </ActionIcon>
                    </Tooltip>

                    {/* Circle */}
                    <Tooltip label="Draw Circle">
                        <ActionIcon
                            variant={toolbar.draw_circle ? "filled" : "light"}
                            onClick={() => activateTool("draw_circle")}
                        >
                            <IconCircle
                                style={{ width: "70%", height: "70%" }}
                                stroke={1.5}
                            />
                        </ActionIcon>
                    </Tooltip>

                    {/* Polygon / Free shape */}
                    <Tooltip label="Draw Polygon / Free Shape">
                        <ActionIcon
                            variant={toolbar.draw_polygon ? "filled" : "light"}
                            onClick={() => activateTool("draw_polygon")}
                        >
                            <IconPolygon
                                style={{ width: "70%", height: "70%" }}
                                stroke={1.5}
                            />
                        </ActionIcon>
                    </Tooltip>

                </Group>

                {/* Branding */}
                <Group gap="xs">
                    <Text
                        fw={700}
                        fz="lg"
                        variant="gradient"
                        gradient={{ from: "#8B0000", to: "#FF6666", deg: 45 }}
                        style={{ userSelect: "none" }}
                    >
                        @ IRC Engineering Services
                    </Text>
                </Group>

            </Group>

        </Paper>
    );
};

export default Toolbar;
