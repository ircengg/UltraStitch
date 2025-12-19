import { Modal, Text, Stack, Group, Divider, Title, Code } from "@mantine/core";
import { useRecoilState } from "recoil";
import { viewAtom } from "../atom";
import { useApi } from "../hooks/useApi";
import { useEffect } from "react";
import { useState } from "react";

export default function AboutPage() {
    const { api } = useApi();
    const [view, setView] = useRecoilState(viewAtom);
    const [license, setLicense] = useState(null)


    const onClose = () => {
        setView({ about: false })
    }


    const getLicence = async () => {
        const res = await api("getLicence");
        console.log(res)
        if (res) {
            setLicense(res)
        }
    };

    useEffect(() => {
        getLicence()
    }, [])

    if (!view.about) {
        return null;
    }

    return (
        <Modal
            opened={view.about}
            onClose={onClose}
            title="About Application"
            size="lg"
            centered
        >
            <Stack gap="md">

                <Title order={4}>Application</Title>
                <Text size="sm">
                    <b>Product:</b> UT Mapping Suite<br />
                    <b>Version:</b> 1.0.0<br />
                    <b>Developer:</b> IRC Engineering
                </Text>

                <Divider />

                <Title order={4}>License Information</Title>

                {license ? (
                    <Stack gap={5}>
                        <Group justify="space-between">
                            <Text size="sm">License Key:</Text>
                            <Code>{license.key}</Code>
                        </Group>
                        <Group justify="space-between">
                            <Text size="sm">Status:</Text>
                            <Text fw={600}>{license.status}</Text>
                        </Group>

                        <Group justify="space-between">
                            <Text size="sm">Expires On:</Text>
                            <Text fw={600}>{license.expires_at}</Text>
                        </Group>

                        <Group justify="space-between">
                            <Text size="sm">Registered Email:</Text>
                            <Text>{license.meta?.email || "—"}</Text>
                        </Group>
                    </Stack>
                ) : (
                    <Text size="sm" c="dimmed">
                        License info not loaded.
                    </Text>
                )}

                <Divider />

                <Text size="xs" c="dimmed" ta="center">
                    © {new Date().getFullYear()} IRC Engineering. All rights reserved.
                </Text>
            </Stack>
        </Modal>
    );
}
