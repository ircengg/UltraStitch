import { useState } from "react";
import {
    Button,
    Card,
    TextInput,
    Text,
} from "@mantine/core";
import { useRecoilState, useSetRecoilState } from "recoil";
import { drawingAtom, menuEventAtom, mesurementAtom, projectAtom, referenceAtom, scansAtom } from "../atom";
import { useApi } from "../hooks/useApi";
import { useEffect } from "react";
import { useRecoilValue } from "recoil";

export default function ProjectPage() {
    const [projctType, setProjectType] = useState(null);
    const menuEvent = useRecoilValue(menuEventAtom)
    const { api } = useApi();

    const [projectName, setProjectName] = useState("");
    const [directoryPath, setDirectoryPath] = useState("");
    const [project, setProject] = useRecoilState(projectAtom);
    const setScans = useSetRecoilState(scansAtom);
    const setDrawing = useSetRecoilState(drawingAtom);
    const setReference = useSetRecoilState(referenceAtom);
    const setMeasurement = useSetRecoilState(mesurementAtom)

    const [newProject, setNewProject] = useState({
        title: "Untitled",
        description: "Automated COrrosion Mapping"
    });


    const handleCreate = async () => {
        const res = await api("create_project", newProject);
        if (res) {
            setProject(res.project)
            setScans(res.scans)
            setDrawing(res.drawing)
            setReference(res.reference);
            setMeasurement(res.measurement)
        }
    };

    const handleOpen = async () => {
        setProjectType(null)
        const res = await api("open_project");
        console.log(res)
        if (res) {
            setProject(res.project);
            setDrawing(prev => ({ ...prev, ...res.drawing }));
            setScans(res.scans)
            setReference(res.reference);
            setMeasurement(res.measurement)

        }
    };

    const onInputChange = (key, value) => {
        console.log(key, value)
        setNewProject({ ...newProject, [key]: value })
    };


    useEffect(() => {
        if (menuEvent) {
            if (menuEvent == "open_project") {
                handleOpen();
            }
            if (menuEvent == "new_project") {
                setProjectType("new")
            }

        }
    }, [menuEvent])

    // ------------------------------
    // FIRST SCREEN
    // ------------------------------
    if (!projctType) {
        return (
            <div style={styles.fullCenter}>
                <Card shadow="lg" radius="lg" p="xl" w={500}>
                    <Button fullWidth onClick={() => setProjectType("new")}>
                        ➕ New Project
                    </Button>

                    <Button fullWidth mt="md" onClick={handleOpen}>
                        📂 Open Project
                    </Button>
                </Card>
            </div>
        );
    }

    // ------------------------------
    // NEW PROJECT SCREEN
    // ------------------------------
    return (
        <div style={styles.fullCenter}>
            <Card withBorder radius="md" p="md" w={500}>
                <Text size="lg" fw={500} mb="sm">
                    Create New Project
                </Text>

                <TextInput
                    label="Project Name"
                    placeholder="Enter name"
                    value={newProject.title}
                    onChange={e => onInputChange("title", e.target.value)}
                    mb="md"
                />

                <TextInput
                    label="Project Details"
                    placeholder="Enter Project Details"
                    value={newProject.description}
                    onChange={e => onInputChange("description", e.target.value)}
                    mb="md"
                />

                <Button fullWidth onClick={handleCreate}>
                    ➕ Create Project
                </Button>
                <Button
                    fullWidth
                    variant="subtle"
                    onClick={() => setProjectType(null)}
                >
                    ← Back
                </Button>
            </Card>
        </div>
    );
}

// ------------------------------
// FULLSCREEN CENTER STYLES
// ------------------------------
const styles = {
    fullCenter: {
        minWidth: "100vw",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        padding: 40,
        boxSizing: "border-box",
    }
};
