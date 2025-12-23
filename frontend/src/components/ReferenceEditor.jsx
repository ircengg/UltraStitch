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
import { referenceAtom, viewAtom } from "../atom";
import { IconHttpDelete, IconDeviceFloppy, IconUpload, IconDownload } from "@tabler/icons-react";
import Papa from "papaparse";
import { VirtualTable } from "./VirtualTable";

export function ReferenceEditor() {
    const [rows, setRows] = useRecoilState(referenceAtom);
    const [view, setView] = useRecoilState(viewAtom);

    const handleClose = () => {
        setView({ ...view, reference_editor: false })
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
        a.download = "references.csv";
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

    const handleImportImages = async () => {
        console.log("images")
    }



    if (!view.reference_editor) {
        return null;
    }

    return <Modal
        opened={true}
        onClose={handleClose}
        title="Edit References"
        size="100%"
        withCloseButton
        radius={10}
        overlayProps={{ color: "teal", backgroundOpacity: 0.3 }}
    >
        <VirtualTable
            rows={rows}
            setRows={setRows}
            columns={[
                { key: "id", type: "text", width: 160 },
                { key: "x", type: "number", width: 120 },
                { key: "y", type: "number", width: 120 },
                { key: "width", type: "number", width: 120 },
                { key: "height", type: "number", width: 120 },
                { key: "rotation", type: "number", width: 120 },
                { key: "map", type: "text", width: 200 },
            ]}
        />


        {/* FOOTER BUTTONS */}
        <Group justify="space-between" mt="md">
            <Group>
                {/* IMPORT CSV */}
                <FileButton onChange={handleImportImages} accept=".png,.jpg">
                    {(props) => (
                        <Button leftSection={<IconUpload />} {...props}>
                            Import Images
                        </Button>
                    )}
                </FileButton>

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
