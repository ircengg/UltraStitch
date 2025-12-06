import { Title, Text, Paper, Group } from "@mantine/core";

const ViewerHeader = ({ autData }) => {
    return (
        <Paper
            shadow="none"
            p={2}
            radius="md"
            withBorder={false}
            style={{
                position: "fixed",
                top: 2,
                left: 10,
                background: "rgba(0, 0, 0, 0.2)", // transparent background
                backdropFilter: "blur(4px)", // subtle glass effect
                color: "white",
                zIndex: 200,
            }}
        >
            <Group gap="xs" align="center">
                <Title
                    order={5}
                    c={'red'}
                    style={{
                        fontWeight: 500,
                        letterSpacing: "0.5px",
                    }}
                >
                    {autData?.name || "AUT Viewer"}
                </Title>

                <Text size="sm" c="black">
                    — {autData?.details || "Ultrasonic thickness scan viewer"}
                </Text>
            </Group>
        </Paper>
    );
};

export default ViewerHeader;
