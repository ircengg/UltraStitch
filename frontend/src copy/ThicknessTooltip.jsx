import React, { useState } from 'react';
import { Tooltip, Paper, Text } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import { CURRENT_THICKNESS_POINT } from './atom';

const ThicknessTooltip = () => {
    const point = useRecoilValue(CURRENT_THICKNESS_POINT)
    // point = { x: clientX, y: clientY, scan, tmm, u, v }
    if (!point) return null;

    const style = {
        position: 'fixed',
        top: point.y + 10, // slightly below cursor
        left: point.x + 10, // slightly to the right
        pointerEvents: 'none', // allow clicks through
        zIndex: 9999,
    };

    return (
        <Paper shadow="sm" style={style} padding="sm">
            <Text size="sm"><strong>Scan:</strong> {point.scan}</Text>
            <Text size="sm"><strong>Thickness:</strong> {point.tmm.toFixed(2)} mm</Text>
            <Text size="sm"><strong>X:</strong> {point.x.toFixed(2)}, <strong>Y:</strong> {point.y.toFixed(2)}</Text>
            {/* <Text size="sm"><strong>U:</strong> {point.u.toFixed(3)}, <strong>V:</strong> {point.v.toFixed(3)}</Text> */}
        </Paper>
    );
};

export default ThicknessTooltip;
