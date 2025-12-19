import { ActionIcon, Button, Group, ScrollArea, Stack, Title, Box, Collapse } from "@mantine/core";

import { useState } from "react";
import { useRecoilValue } from "recoil";
import { menuEventAtom, scansAtom, selectedObjectAtom, toolbarAtom, viewAtom } from "../atom";
import { Card, Text } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { useRecoilState } from "recoil";
import { IconUpload } from "@tabler/icons-react";
import { IconFileImport } from "@tabler/icons-react";
import { useApi } from "../hooks/useApi";
import { useSetRecoilState } from "recoil";
import { IconChevronRight } from "@tabler/icons-react";
import { IconChevronLeft } from "@tabler/icons-react";
import { IconScan } from "@tabler/icons-react";
import { useEffect } from "react";
import { useRef } from "react";





export default function ScanList() {
  const [opened, setOpened] = useState(true);
  const scans = useRecoilValue(scansAtom);
  const [toolbar, setToolbar] = useRecoilState(toolbarAtom);
  const [view, setView] = useRecoilState(viewAtom);
  const menuEvent = useRecoilValue(menuEventAtom);

  const setScans = useSetRecoilState(scansAtom);
  const { api } = useApi()

  const handleScanImport = async () => {
    const res = await api("import_scans");
    console.log(res);
    if (res) {
      setScans(res)
    }

  }

  useEffect(() => {
    console.log(menuEvent)
    if (menuEvent && menuEvent == "scan_list") {
      setOpened(true)
    }
  }, [menuEvent]);

  if (!view.scan_list) {
    return null;
  }

  return (
    <Box
      style={{
        position: "absolute",
        top: 70,
        left: 0,
        zIndex: 100,
        width: 260,
        transition: "all 0.2s ease",
        backgroundColor: "ActiveText"
      }}
    >
      <Collapse in={view.scan_list} style={{ backgroundColor: 'inherit' }}>
        <ScrollArea h={"calc(100vh - 150px)"}>
          <Stack gap="xs">
            {scans.map((s) => (
              <ScanItem key={s.id} scan={s} />
            ))}
          </Stack>
        </ScrollArea>
      </Collapse>
    </Box>
  )
}




export function ScanItem({ scan }) {
  const [selected, setSelected] = useRecoilState(selectedObjectAtom);
  const [toolbar] = useRecoilState(toolbarAtom);

  const isSelected = selected?.type === "scan" && scan.id === selected?.obj?.id;

  // ⭐ ref for scrolling
  const itemRef = useRef(null);

  useEffect(() => {
    if (isSelected && itemRef.current) {
      itemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [isSelected]);

  return (
    <Card
      ref={itemRef}
      shadow="sm"
      p="sm"
      radius="md"
      draggable={toolbar.scan_registration_mode}
      onDragStart={(e) =>
        e.dataTransfer.setData("scan-data", JSON.stringify(scan))
      }
      style={{
        cursor: toolbar.scan_registration_mode ? "grab" : "default",
        border: isSelected ? "2px solid #1c7ed6" : "1px solid #ddd",
        backgroundColor: isSelected ? "#e7f5ff" : "white",
        transition: "border 0.2s, background-color 0.2s",
      }}
      onClick={e => {
        setSelected({ type: 'scan', obj: scan })
      }}
    >
      <Stack spacing={2}>
        <Text weight={500} size="md" lineClamp={1} c={isSelected ? "blue" : "black"}>
          {scan.name}
        </Text>
        <Text weight={500} size="sm"  >
          X={scan.x}, Y={scan.y} , Width={scan.width}, Height={scan.height}
        </Text>

        <Text c="dimmed" size="sm">
          {scan.scan_details || "No description available"}
        </Text>
      </Stack>
    </Card>
  );
}