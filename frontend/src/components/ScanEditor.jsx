import {
    Modal,
    Table,
    TextInput,
    NumberInput,
    Button,
    ScrollArea,
    Group,
    Checkbox,
    FileButton,
} from "@mantine/core";
import { useRecoilState } from "recoil";
import { scansAtom, viewAtom } from "../atom";
import { IconHttpDelete, IconDeviceFloppy, IconUpload, IconDownload } from "@tabler/icons-react";
import Papa from "papaparse";

export function ScanEditor() {
    const [rows, setRows] = useRecoilState(scansAtom);
    const [view, setView] = useRecoilState(viewAtom)

    const updateRow = (index, field, value) => {
        const updated = [...rows];
        updated[index] = { ...updated[index], [field]: value };
        setRows(updated);
    };

    const handleClose = () => {
        setView({ ...view, scan_editor: false })
    };

    const handleDelete = () => {
        const filtered = rows.filter((r) => !r.is_selected);
        setRows(filtered);
    };

    // --------------------------
    // EXPORT CSV (DOWNLOAD FILE)
    // --------------------------
    const handleExportCSV = () => {
        const csv = Papa.unparse(rows);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.href = url;
        a.download = "scan_properties_export.csv";
        a.click();

        URL.revokeObjectURL(url);
    };

    // --------------------------
    // IMPORT CSV (LOAD INTO TABLE)
    // --------------------------
    const handleImportCSV = (file) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const imported = results.data.map((row) => ({
                    ...row,
                    nominal_thk: Number(row.nominal_thk) || 0,
                    min_thk: Number(row.min_thk) || 0,
                    max_thk: Number(row.max_thk) || 0,
                    x: Number(row.x) || 0,
                    y: Number(row.y) || 0,
                    width: Number(row.width) || 0,
                    height: Number(row.height) || 0,
                    rotation: Number(row.rotation) || 0,
                    is_selected: false,
                }));

                setRows(imported);
            },
        });
    };



    if (!view.scan_editor) {
        return null;
    }

    return (
        <Modal
            opened={true}
            onClose={handleClose}
            title="Edit Scans"
            size="100%"
            withCloseButton
            radius={10}
            overlayProps={{ color: "teal", backgroundOpacity: 0.3 }}
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
                            <Table.Th>
                                <Checkbox
                                    // checked={row.is_selected || false}
                                    onChange={(e) => {
                                        let selected = e.currentTarget.checked;
                                        if (selected) {
                                            setRows(rows.map(r => ({ ...r, is_selected: true })));
                                        } else {
                                            setRows(rows.map(r => ({ ...r, is_selected: false })));
                                        }
                                    }}
                                />
                            </Table.Th>
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

                                <Table.Td>{row.id}</Table.Td>

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
            <Group justify="space-between" mt="md">
                <Group>
                    {/* IMPORT CSV */}
                    <FileButton onChange={handleImportCSV} accept=".csv">
                        {(props) => (
                            <Button leftSection={<IconUpload />} {...props}>
                                Import CSV
                            </Button>
                        )}
                    </FileButton>

                    {/* EXPORT CSV */}
                    <Button leftSection={<IconDownload />} onClick={handleExportCSV}>
                        Export CSV
                    </Button>
                </Group>

                <Group>
                    <Button leftSection={<IconDeviceFloppy />} variant="default" onClick={handleClose}>
                        Close
                    </Button>

                    <Button leftSection={<IconHttpDelete />} color="red" onClick={handleDelete}>
                        Delete Selected
                    </Button>
                </Group>
            </Group>
        </Modal>
    );
}
