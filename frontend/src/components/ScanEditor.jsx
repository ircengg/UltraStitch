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
import { VirtualTable } from "./VirtualTable";

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

    return <Modal
        opened={true}
        onClose={handleClose}
        title="Edit Scans"
        size="100%"
        withCloseButton
        radius={10}
        overlayProps={{ color: "teal", backgroundOpacity: 0.3 }}
    >
        <VirtualTable
            rows={rows}
            setRows={setRows}
            columns={[
                { key: "scan_details", type: "long_text" },
                { key: "nominal_thk", type: "number" },
                { key: "min_thk", type: "number" },
                { key: "max_thk", type: "number" },
                { key: "x", type: "number" },
                { key: "y", type: "number" },
                { key: "width", type: "number" },
                { key: "height", type: "number" },
                { key: "rotation", type: "number" },
            ]}
        />


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
}
