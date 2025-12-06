import {
    Modal,
    Table,
    TextInput,
    NumberInput,
    Button,
    ScrollArea,
    Group,
    Checkbox,
} from "@mantine/core";
import { useRecoilState } from "recoil";
import { menuEventAtom, scansAtom, toolbarAtom } from "../atom";
import { IconHttpDelete, IconDeviceFloppy } from "@tabler/icons-react";
import { useEffect } from "react";

export function ScanEditor() {
    const [rows, setRows] = useRecoilState(scansAtom);
    const [toolbar, setToolbar] = useRecoilState(toolbarAtom);
    const [menuEvent, setMenuEvent] = useRecoilState(menuEventAtom);

    const updateRow = (index, field, value) => {
        const updated = [...rows];
        updated[index] = { ...updated[index], [field]: value };
        setRows(updated);
    };

    const handleClose = () => {
        setToolbar({ ...toolbar, open_scan_editor: false });
    };

    // ---- DELETE SELECTED ---- //
    const handleDelete = () => {
        const filtered = rows.filter((r) => !r.is_selected);
        setRows(filtered);
    };

    useEffect(() => {
        if (menuEvent && menuEvent == "edit_scans") {
            setToolbar({ ...toolbar, open_scan_editor: true });
        }
    }, [menuEvent])

    return (
        <Modal
            opened={toolbar.open_scan_editor}
            onClose={handleClose}
            title="Edit Scans"
            size="100%"
            withCloseButton
            radius={10}
            overlayProps={{
                color: "teal",
                backgroundOpacity: 0.3,
                blur: 0,
            }}
        >
            <ScrollArea h={"calc(100vh - 150px)"} w="100%" offsetScrollbars>
                <Table
                    highlightOnHover
                    withTableBorder
                    withColumnBorders
                    style={{ minWidth: "1200px" }}
                >
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th></Table.Th>
                            <Table.Th>ID/Name</Table.Th>
                            <Table.Th>Scan Details</Table.Th>
                            <Table.Th>Nominal Thk</Table.Th>
                            <Table.Th>Min Thk</Table.Th>
                            <Table.Th>Max Thk</Table.Th>
                            <Table.Th>X</Table.Th>
                            <Table.Th>Y</Table.Th>
                            <Table.Th>Width</Table.Th>
                            <Table.Th>Height</Table.Th>
                            <Table.Th>Rotation</Table.Th>
                        </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                        {rows.map((row, index) => (
                            <Table.Tr key={row.id}>
                                <Table.Td>
                                    <Checkbox
                                        checked={row.is_selected || false}
                                        onChange={(e) =>
                                            updateRow(index, "is_selected", e.currentTarget.checked)
                                        }
                                    />
                                </Table.Td>

                                <Table.Td>
                                    {row.id}
                                    {/* <TextInput
                                        value={row.id}
                                        onChange={(e) => updateRow(index, "id", e.target.value)}
                                    /> */}
                                </Table.Td>

                                <Table.Td>
                                    <TextInput
                                        value={row.scan_details || ""}
                                        onChange={(e) =>
                                            updateRow(index, "scan_details", e.target.value)
                                        }
                                    />
                                </Table.Td>

                                <Table.Td>
                                    <NumberInput
                                        value={row.nominal_thk ?? 0}
                                        onChange={(v) => updateRow(index, "nominal_thk", v)}
                                    />
                                </Table.Td>

                                <Table.Td>
                                    <NumberInput
                                        value={row.min_thk ?? 0}
                                        onChange={(v) => updateRow(index, "min_thk", v)}
                                    />
                                </Table.Td>

                                <Table.Td>
                                    <NumberInput
                                        value={row.max_thk ?? 0}
                                        onChange={(v) => updateRow(index, "max_thk", v)}
                                    />
                                </Table.Td>

                                <Table.Td>
                                    <NumberInput
                                        value={row.x ?? 0}
                                        onChange={(v) => updateRow(index, "x", v)}
                                    />
                                </Table.Td>

                                <Table.Td>
                                    <NumberInput
                                        value={row.y ?? 0}
                                        onChange={(v) => updateRow(index, "y", v)}
                                    />
                                </Table.Td>

                                <Table.Td>
                                    <NumberInput
                                        value={row.width ?? 0}
                                        onChange={(v) => updateRow(index, "width", v)}
                                    />
                                </Table.Td>

                                <Table.Td>
                                    <NumberInput
                                        value={row.height ?? 0}
                                        onChange={(v) => updateRow(index, "height", v)}
                                    />
                                </Table.Td>

                                <Table.Td>
                                    <NumberInput
                                        value={row.rotation ?? 0}
                                        onChange={(v) => updateRow(index, "rotation", v)}
                                    />
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </ScrollArea>

            {/* FOOTER BUTTONS */}
            <Group justify="flex-end" mt="md">
                <Button leftSection={<IconDeviceFloppy />} variant="default" onClick={handleClose}>
                    Close
                </Button>

                <Button leftSection={<IconHttpDelete />} color="red" onClick={handleDelete}>
                    Delete Selected
                </Button>
            </Group>
        </Modal>
    );
}
