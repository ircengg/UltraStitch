import { List } from "react-window";
import { memo, useCallback, useMemo } from "react";
import {
    Checkbox,
    NumberInput,
    TextInput,
    Group,
    Box,
    Text,
} from "@mantine/core";

/* -------------------------
   Cell
-------------------------- */
const Cell = memo(function Cell({ row, column, onCommit }) {
    const value = row[column.key];

    if (column.type === "number") {
        return (
            <NumberInput
                defaultValue={value ?? 0}
                hideControls
                w={column.width || 120}
                onBlur={(e) =>
                    onCommit(column.key, Number(e.target.value))
                }
            />
        );
    }

    return (
        <TextInput
            defaultValue={value ?? ""}
            w={column.width || 160}
            onBlur={(e) =>
                onCommit(column.key, e.target.value)
            }
        />
    );
});

/* -------------------------
   Header (STICKY)
-------------------------- */
const Header = memo(function Header({ columns, setRows, rows }) {

    const allSelected = rows.length > 0 && rows.every(r => r.is_selected);
    const someSelected = rows.some(r => r.is_selected);

    const handleSelectAll = (checked) => {
        setRows(prev =>
            prev.map(r => ({ ...r, is_selected: checked }))
        );
    };

    return (
        <Group
            gap="xs"
            wrap="nowrap"
            px="xs"
            h={40}
            style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                background: "var(--mantine-color-body)",
                borderBottom: "1px solid #ddd",
            }}
        >
            <Checkbox
                checked={allSelected}
                indeterminate={!allSelected && someSelected}
                onChange={(e) =>
                    handleSelectAll(e.currentTarget.checked)
                }
            />

            {columns.map((col) => (
                <Box key={col.key} w={col.width || 160}>
                    <Text fw={600} size="sm">
                        {col.label || col.key}
                    </Text>
                </Box>
            ))}
        </Group>
    );
});


/* -------------------------
   Row
-------------------------- */
const Row = memo(function Row(props) {
    const { index, style, rows, columns, updateRow } = props;

    const row = rows[index];
    if (!row) return null;

    const onCommit = useCallback(
        (key, value) => updateRow(index, key, value),
        [index, updateRow]
    );

    return (
        <Group
            style={style}
            gap="xs"
            wrap="nowrap"
            px="xs"
        >
            <Checkbox
                checked={!!row.is_selected}
                onChange={(e) =>
                    updateRow(index, "is_selected", e.currentTarget.checked)
                }
            />

            {columns.map((col) => (
                <Cell
                    key={col.key}
                    row={row}
                    column={col}
                    onCommit={onCommit}
                />
            ))}
        </Group>
    );
});

/* -------------------------
   VirtualTable
-------------------------- */
export function VirtualTable({
    rows = [],
    setRows,
    columns = [],
    height = 500,
    rowHeight = 48,
}) {
    const updateRow = useCallback((index, key, value) => {
        setRows((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [key]: value };
            return next;
        });
    }, [setRows]);

    const rowProps = useMemo(() => ({
        rows,
        columns,
        updateRow,
    }), [rows, columns, updateRow]);

    return (
        <Box
            style={{
                height: "calc(100vh - 250px)",
                width: "100%",
                overflow: "auto",
                border: "1px solid #ddd",
                borderRadius: 6,
            }}
        >
            {/* Sticky Header */}
            <Header
                columns={columns}
                rows={rows}
                setRows={setRows}
            />



            {/* Virtualized Rows */}
            <List
                rowComponent={Row}
                rowCount={rows.length}
                rowHeight={rowHeight}
                rowProps={rowProps}
                style={{
                    height: height - 50, // header height
                    width: "100%",
                }}
            />
        </Box>
    );
}
