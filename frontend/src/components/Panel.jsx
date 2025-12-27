import {
    Box,
    Paper,
    ScrollArea,
    Title,
    ActionIcon,
    Group,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";

export default function Panel({
    children,
    search = null,
    pos = { top: 40, right: 10 },
    width = 260,
    title = null,
    onClose,
}) {

    let margin = search ? "165px": "130px"



    return (
        <Box
            style={{
                position: "absolute",
                ...pos,
                zIndex: 100,
                width,
                transition: "all 0.2s ease",
            }}
        >
            <Paper
                radius="md"
                shadow="lg"
                withBorder
                style={{
                    backgroundColor: "rgba(255, 170, 90, 0.18)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 170, 90, 0.35)",
                }}
            >
                {title && (
                    <Group
                        px="sm"
                        py="xs"
                        position="apart"
                        style={{
                            backgroundColor: "rgba(255, 170, 90, 0.28)",
                            backdropFilter: "blur(6px)",
                            borderBottom: "1px solid rgba(255, 170, 90, 0.4)",
                        }}
                    >
                        <Title order={4}>{title}</Title>

                        {onClose && (
                            <ActionIcon
                                size="sm"
                                radius="md"
                                variant="subtle"
                                onClick={onClose}
                                aria-label="Close panel"
                            >
                                <IconX size={16} />
                            </ActionIcon>
                        )}
                    </Group>
                )}
                {search}
                <ScrollArea style={{ height: `calc(100vh - ${margin})` }}>
                    <Box p="sm">{children}</Box>
                </ScrollArea>
            </Paper>
        </Box>
    );
}
