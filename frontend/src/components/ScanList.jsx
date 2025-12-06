import { ActionIcon, Button, Group, ScrollArea, Stack, Title, Box, Collapse } from "@mantine/core";

import { useState } from "react";
import { useRecoilValue } from "recoil";
import { menuEventAtom, scansAtom, toolbarAtom } from "../atom";
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





export default function ScanList() {
  const [opened, setOpened] = useState(true);
  const scans = useRecoilValue(scansAtom);
  const [toolbar, setToolbar] = useRecoilState(toolbarAtom);
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
  }, [menuEvent])

  return (
    <Box
      style={{
        position: "absolute",
        top: 70,
        left: 0,
        zIndex: 100,
        width: opened ? 260 : 60,
        transition: "all 0.2s ease",
        backgroundColor: "ActiveText"
      }}
    >
      <Collapse in={opened} style={{ backgroundColor: 'inherit' }}> 
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
  const [toolbar, setToolbar] = useRecoilState(toolbarAtom)
  const handleDragStart = (e) => {
    e.dataTransfer.setData("scan-data", JSON.stringify(scan));
  };

  return (
    <Card
      shadow="sm"
      p="sm"
      radius="md"
      draggable={toolbar.scan_registration_mode}
      onDragStart={handleDragStart}
      style={{ cursor: toolbar.scan_registration_mode ? "grab" : "default" }}
    >
      <Stack spacing={2}>
        <Text weight={500} size="md" lineClamp={1}>
          {scan.name}
        </Text>
        <Text c="dimmed" size="sm" >
          {scan.scan_details || "No description available"}
        </Text>
      </Stack>
    </Card>
  );
}
