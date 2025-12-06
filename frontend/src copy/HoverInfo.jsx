import React from 'react';
import { useRecoilValue } from 'recoil';
import { HOVER_DATA_ATOM } from './atom';
import { Paper, Text, Divider, Group } from '@mantine/core';

const HoverInfo = () => {
  const hoverData = useRecoilValue(HOVER_DATA_ATOM);

  if (!hoverData) return null; // nothing to show if no hover

  const { point, meshName, tags } = hoverData;

  const thk = 4.5;

  // Position tooltip near cursor
  const style = {
    position: 'fixed',
    top: (point?.y || 0) + 15,
    left: (point?.x || 0) + 15,
    pointerEvents: 'none',
    zIndex: 9999,
    padding: '10px 14px',
    borderRadius: '12px',
    background: 'rgba(139, 221, 232, 0.5)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: "black",
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
    minWidth: '220px',
    maxWidth: '300px',
  };

  if (!hoverData) {
    return null;
  }

  return (
    <Paper style={style} shadow="xl" withBorder={false}>
      <Text fw={600} size="sm" tt="uppercase" mb={5}>
        Scan: {hoverData.scan.scan_number}
      </Text>
      <Text size="xs" mb={8}>
        {hoverData.scan.scan_details}
      </Text>
      <Divider mb={8} opacity={0.2} />

      <div>
        <Group gap="xs" mb={4}>
          <Text size="sm" fw={500}>
            Nominal Thickness: {hoverData.scan.nominal_thk} mm
          </Text>
          <Text size="sm" >
            Measured Thickness: {hoverData?.thkInfo?.thk} mm
          </Text>
          <Text size="sm" >
            Position: {hoverData?.thkInfo?.xPos}, {hoverData?.thkInfo?.yPos} mm
          </Text>
        </Group>
      </div>
    </Paper>
  );
};

export default HoverInfo;
