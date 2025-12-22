import React, { useEffect, useRef, useState } from "react";
import { Paper, Text, Badge, Group } from "@mantine/core";

/**
 * HoverThickness
 *
 * Props:
 *  - value: number | null    (thickness or null)
 *  - pointer: { x, y }       (canvas-relative pixel coords)
 *  - visible: boolean        (whether to show)
 *  - nominal: number         (for color thresholds, default 25)
 *  - offset: { x, y }       (offset from pointer in px)
 */
export default function HoverThickness({
    value,
    pointer,
    visible = false,
    nominal,
    offset = { x: 16, y: 16 },
}) {
    const [pos, setPos] = useState({ left: -9999, top: -9999 });
    const rafRef = useRef(null);
    const elRef = useRef(null);

    // Color selection based on thresholds
    function colorForValue(v) {
        if (v == null) return { bg: "rgba(255,255,255,0.9)", color: "#000" }; // white
        if (v < 0.8 * nominal) return { bg: "#C77A2C", color: "#fff" }; // brown/orange
        if (v < 0.9 * nominal) return { bg: "#FFF000", color: "#000" }; // yellow
        return { bg: "#00AA00", color: "#fff" }; // green
    }

    // Smooth follow using rAF, clamps to viewport so box doesn't go off screen
    useEffect(() => {
        if (!visible || !pointer) {
            setPos({ left: -9999, top: -9999 });
            return;
        }

        const onFrame = () => {
            rafRef.current = null;

            // Desired position (page coordinates relative to window)
            const desiredX = pointer.x + offset.x;
            const desiredY = pointer.y + offset.y;

            // compute clamped position so tooltip stays inside viewport
            const el = elRef.current;
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            let width = 180;
            let height = 72;
            if (el) {
                const rect = el.getBoundingClientRect();
                width = rect.width || width;
                height = rect.height || height;
            }

            let left = desiredX;
            let top = desiredY;

            // clamp right/bottom
            if (left + width + 8 > vw) left = Math.max(8, vw - width - 8);
            if (top + height + 8 > vh) top = Math.max(8, vh - height - 8);

            // clamp left/top
            if (left < 8) left = 8;
            if (top < 8) top = 8;

            setPos({ left, top });
        };

        if (!rafRef.current) rafRef.current = requestAnimationFrame(onFrame);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        };
    }, [pointer, visible, offset]);

    const { bg, color } = colorForValue(value);


    const display = value == null ? "--" : (Math.round(value * 10) / 10).toFixed(1);

    return (
        <div
            ref={elRef}
            style={{
                position: "fixed",
                right: 10,
                top: 35,
                pointerEvents: "none", // important so it doesn't block Konva events
                zIndex: 9999,
                transition: "transform 120ms ease-out, opacity 150ms",
                transform: visible ? "scale(1)" : "scale(0.95)",
                opacity: visible ? 1 : 0,
            }}
        >
            <Paper
                shadow="xl"
                p="xs"
                withBorder
                radius="md"
                style={{
                    minWidth: 160,
                    display: "flex",
                    alignItems: "center",
                    backdropFilter: "blur(8px) saturate(120%)",
                    background:
                        "linear-gradient(180deg, rgba(255,255,255,0.65), rgba(255,255,255,0.35))",
                    border: "1px solid rgba(255,255,255,0.25)",
                    boxShadow: "0 6px 20px rgba(10,12,20,0.12)",
                }}

            >
                <Group position="apart" spacing="xs" style={{ width: "100%" }}>
                    <div>
                        <Text size="sm" weight={700} style={{ marginBottom: 2 }}>
                            Thickness
                        </Text>
                    </div>

                    <div style={{ textAlign: "right" }}>
                        <Badge
                            variant="filled"
                            fullWidth={false}
                            style={{
                                background: bg,
                                color: color,
                                borderRadius: 8,
                                fontSize: 14,
                                padding: "6px 10px",
                                minWidth: 64,
                                boxShadow:
                                    "0 4px 10px rgba(0,0,0,0.08), inset 0 -2px 0 rgba(0,0,0,0.06)",
                            }}
                        >
                            {display}
                        </Badge>/
                        <Badge
                            variant="filled"
                            fullWidth={false}
                            style={{
                                // background: bg,
                                color: color,
                                borderRadius: 8,
                                fontSize: 14,
                                padding: "6px 10px",
                                minWidth: 64,
                                boxShadow:
                                    "0 4px 10px rgba(0,0,0,0.08), inset 0 -2px 0 rgba(0,0,0,0.06)",
                            }}
                        >
                            {nominal}
                        </Badge>
                    </div>
                </Group>
            </Paper>
        </div>
    );
}
