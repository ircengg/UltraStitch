import { Slider, Paper, Container, Text, RangeSlider, Select, Group, ActionIcon, Tooltip, Divider, Box } from "@mantine/core";
import { IconLiveView, IconRectangle, IconRegistered, IconRulerMeasure2, IconScan, IconSelect, IconVideo } from "@tabler/icons-react"
import { useRecoilState, useSetRecoilState } from "recoil";
import { MEASUREMENT_POINTS_ATOM, SELECTED_MESH_ATOM, TOOLBAR_ATOM } from "../atom";
import { useEffect } from "react";
import { useState } from "react";
import { debounce } from "../utils";

const Toolbar = () => {
    const [toolbar, setToolbar] = useRecoilState(TOOLBAR_ATOM);

    const [localRange, setLocalRange] = useState([
        toolbar.thk_filter.min,
        toolbar.thk_filter.max,
    ]);

    // 🕒 Debounced updater (only runs after user stops dragging)
    const debouncedUpdate = debounce((min, max) => {
        setToolbar((prev) => ({
            ...prev,
            thk_filter: {
                ...prev.thk_filter,
                min,
                max,
                run: true,
            },
        }));
    }, 600); // adjust delay as needed (e.g., 300–500 ms)

    const handleRangeChange = ([min, max]) => {
        setLocalRange([min, max]);
        debouncedUpdate(min, max);
    };

    useEffect(() => {
        setLocalRange([toolbar.thk_filter.min, toolbar.thk_filter.max]);
    }, [toolbar.thk_filter.min, toolbar.thk_filter.max]);

    return (
        <Paper
            shadow="xs"
            style={{
                position: "fixed",
                bottom: 0,
                width: "100%",

                color: "white",

            }}
        >

            <Group justify="space-between" align="center" px="md" p={5} >
                {/* Left Group - Controls */}
                <Group gap="sm">
                    {/* Heatmap Toggle Button */}


                    <Tooltip label="View Scans">
                        <ActionIcon
                            variant={toolbar.heatmap_view ? "filled" : "light"}
                            onClick={e => {
                                setToolbar({
                                    ...toolbar,
                                    heatmap_view: !toolbar.heatmap_view
                                })
                            }}
                        >
                            <IconScan
                                style={{
                                    width: "70%",
                                    height: "70%",
                                }}
                                stroke={1.5}
                            />
                        </ActionIcon>
                    </Tooltip>

                    {/* hover_thickness */}
                    <Tooltip label="Show Thickness">
                        <ActionIcon
                            variant={toolbar.hover_thickness ? "filled" : "light"}
                            onClick={e => {
                                setToolbar({
                                    ...toolbar,
                                    hover_thickness: !toolbar.hover_thickness
                                })
                            }}
                        >
                            <IconLiveView
                                style={{
                                    width: "70%",
                                    height: "70%",
                                }}
                                stroke={1.5}
                            />
                        </ActionIcon>
                    </Tooltip>


                    {/* scan_registration_mode Toggle Button */}
                    <Tooltip label="Register Scans">
                        <ActionIcon
                            variant={toolbar.scan_registration_mode ? "filled" : "light"}
                            onClick={e => {
                                setToolbar({
                                    ...toolbar,
                                    scan_registration_mode: !toolbar.scan_registration_mode
                                })
                            }}
                        >
                            <IconRegistered
                                style={{
                                    width: "70%",
                                    height: "70%",
                                }}
                                stroke={1.5}
                            />
                        </ActionIcon>
                    </Tooltip>

                    {/* scan_registration_mode Toggle Button */}
                    <Tooltip label="Fit All">
                        <ActionIcon
                            variant={"light"}
                            onClick={e => {
                                setToolbar({
                                    ...toolbar,
                                    fit_all: true
                                })
                            }}
                        >
                            <IconRectangle
                                style={{
                                    width: "70%",
                                    height: "70%",
                                }}
                                stroke={1.5}
                            />
                        </ActionIcon>
                    </Tooltip>


                    {/* scan_registration_mode Toggle Button */}
                    <Tooltip label="Visual Inspection">
                        <ActionIcon
                            variant={toolbar.visual_inspection ? "filled" : "light"}
                            onClick={e => {
                                setToolbar({
                                    ...toolbar,
                                    visual_inspection: !toolbar.visual_inspection
                                })
                            }}
                        >
                            <IconVideo
                                style={{
                                    width: "70%",
                                    height: "70%",
                                }}
                                stroke={1.5}
                            />
                        </ActionIcon>
                    </Tooltip>

                    <Divider orientation="vertical" color="rgba(255,255,255,0.2)" />

                    <Box w={300}>
                        <RangeSlider
                            minRange={0}
                            max={toolbar.thk_filter.max_range + 5}
                            step={0.5}
                            value={localRange}
                            onChange={handleRangeChange}
                            labelAlwaysOn
                            thumbSize={14}
                            color="teal"
                        />
                    </Box>
                </Group>
                {/* Right Group - Branding */}
                <Group gap="xs">
                    <Text
                        fw={700}
                        fz="lg"
                        variant="gradient"
                        gradient={{ from: "#8B0000", to: "#FF6666", deg: 45 }} // darkred → light red
                        style={{ userSelect: "none" }}
                    >
                        @ IRC Engineering Services
                    </Text>
                </Group>

            </Group>

        </Paper>
    );
}

export default Toolbar