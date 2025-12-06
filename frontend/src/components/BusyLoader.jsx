import { Modal, Loader, Text, Stack, Center, Paper } from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import { loaderAtom } from "../atom";





export function BusyLoader() {
    const { open, message } = useRecoilValue(loaderAtom);

    return (
        <Modal
            opened={open}
            onClose={() => { }}
            withCloseButton={false}
            centered
            radius="lg"
            padding={0}
            size="xs"
            closeOnEscape={false}
            closeOnClickOutside={false}
            overlayProps={{
                backgroundOpacity: 0.25,
                blur: 3,
            }}
        >
            <Paper
                radius="lg"
                shadow="md"
                p="xl"
                style={{
                    textAlign: "center",
                    backdropFilter: "blur(10px)",
                }}
            >
                <Center mb="md">
                    <Loader size="lg" color="teal" type="dots" />
                </Center>

                <Text size="sm" c="dimmed">
                    {message}
                </Text>
            </Paper>
        </Modal>
    );
}

