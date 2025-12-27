import { ActionIcon, Button, Group,  Stack } from "@mantine/core";

import { useState } from "react";
import {  referenceAtom,  selectedObjectAtom, toolbarAtom, viewAtom } from "../atom";
import { Card, Text } from "@mantine/core";

import { useRecoilState } from "recoil";
import { useEffect } from "react";
import { useRef } from "react";
import Panel from "./Panel";
import { IconEdit } from "@tabler/icons-react";
import FormRenderer from "./FormRenderer";




export default function ReferenceList() {
  const [reference, setReference] = useRecoilState(referenceAtom);
  const [view, setView] = useRecoilState(viewAtom);

  const [editingItem, setEditingItem] = useState(null);
  const [draft, setDraft] = useState(null);

  const onClose = () =>
    setView({ ...view, reference_list: false });

  const startEdit = (item) => {
    setEditingItem(item.id);
    setDraft({ ...item }); // IMPORTANT: copy
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setDraft(null);
  };

  const applyEdit = () => {
    setReference((prev) =>
      prev.map((r) =>
        r.id === editingItem ? draft : r
      )
    );
    cancelEdit();
  };

  const onChange = (key, value) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  if (!view.reference_list) return null;

  return (
    <Panel title="Reference" onClose={onClose} pos={{ left: 10, top: 40 }}>
      {/* EDIT MODE */}
      {editingItem && draft && (
        <>
          <FormRenderer
            fields={[
              { type: "divider", label: "Position" },

              { type: "number", name: "x", label: "X (mm)" },
              { type: "number", name: "y", label: "Y (mm)" },
              { type: "number", name: "width", label: "Width (mm)" },
              { type: "number", name: "height", label: "Height (mm)" },

              { type: "divider", label: "Display" },

              { type: "text", name: "name", label: "Name" },
              { type: "text", name: "scan_details", label: "Description" },
            ]}
            value={draft}
            onChange={onChange}
          />

          <Group mt="md" position="right">
            <Button variant="default" onClick={cancelEdit}>
              Cancel
            </Button>
            <Button onClick={applyEdit}>
              Apply
            </Button>
          </Group>
        </>
      )}

      {/* LIST MODE */}
      {!editingItem && (
        <Stack gap="xs">
          {reference.map((r) => (
            <Item
              key={r.id}
              item={r}
              onEdit={startEdit}
            />
          ))}
        </Stack>
      )}
    </Panel>
  );
}



export function Item({ item, onEdit }) {
  const [selected, setSelected] = useRecoilState(selectedObjectAtom);
  const [toolbar] = useRecoilState(toolbarAtom);

  const isSelected =
    selected?.type === "reference" &&
    selected?.obj?.id === item.id;

  const itemRef = useRef(null);

  useEffect(() => {
    if (isSelected && itemRef.current) {
      itemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
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
      style={{
        cursor: toolbar.scan_registration_mode ? "grab" : "default",
        border: isSelected ? "2px solid #1c7ed6" : "1px solid #ddd",
        backgroundColor: isSelected ? "#e7f5ff" : "white",
      }}
      onClick={() =>
        setSelected({ type: "reference", obj: item })
      }
    >
      <Group position="apart">
        <Text weight={500}>{item.name}</Text>
        <ActionIcon
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
        >
          <IconEdit size={16} />
        </ActionIcon>
      </Group>

      <Text size="sm">
        X={item.x}, Y={item.y}
      </Text>

      <Text size="xs" c="dimmed">
        {item.scan_details || "No description"}
      </Text>
    </Card>
  );
}
