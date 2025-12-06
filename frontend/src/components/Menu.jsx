import { Menu, Button, Group } from '@mantine/core';
import { useSetRecoilState } from 'recoil';
import { useApi } from '../hooks/useApi';
import { drawingAtom, menuEventAtom, mesurementAtom, projectAtom, referenceAtom, scansAtom } from '../atom';
import { useRecoilState } from 'recoil';

export default function Menubar() {
    const { api } = useApi();
    const [project, setProject] = useRecoilState(projectAtom);
    const [scans, setScans] = useRecoilState(scansAtom);
    const [drawing, setDrawing] = useRecoilState(drawingAtom);
    const [reference, setReference] = useRecoilState(referenceAtom);
    const [measurement, setMeasurement] = useRecoilState(mesurementAtom);
    const setMenuEvent = useSetRecoilState(menuEventAtom)


    const handleProjectOpen = async () => {
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


    const handle_project_save = async () => {
        const payload = {
            project,
            scans,
            drawing,
            reference,
            measurement
        }
        const res = await api("save_project", payload);
        if (res) {
            console.log(res)
        }
    }

    /**
     * Scans
     */
    const handleScanImport = async () => {
        const res = await api("import_scans");
        console.log(res);
        if (res) {
            setScans(res)
        }

    }

    const handle_scan_process = async () => {
        const res = await api("process_scans", scans);
        if (res) {
            console.log(res)
        }
    }


    const handleMenuClicked = (menuEvent) => {
        setMenuEvent(menuEvent)
    }


    return (
        <Group bg="#f5f5f5" px="md" py={0} align="center" style={{ borderBottom: "1px solid #ddd" }}>

            {/* PROJECT MENU */}
            <Menu>
                <Menu.Target>
                    <Button variant="subtle">Project</Button>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Item onClick={handleProjectOpen}>Open Project</Menu.Item>
                    <Menu.Item onClick={handle_project_save} disabled={!project}>Save Project</Menu.Item>
                </Menu.Dropdown>
            </Menu>

            {/* EDIT MENU */}
            <Menu>
                <Menu.Target>
                    <Button variant="subtle">Scans</Button>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Item onClick={handleScanImport}>Import</Menu.Item>
                    <Menu.Item onClick={handle_scan_process}>Process Scans</Menu.Item>
                    <Menu.Item onClick={() => handleMenuClicked("edit_scans")}>Edit</Menu.Item>
                    <Menu.Item onClick={() => handleMenuClicked("scan_list")}>Scan List</Menu.Item>
                </Menu.Dropdown>
            </Menu>

            {/* View MENU */}
            <Menu>
                <Menu.Target>
                    <Button variant="subtle">View</Button>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Item onClick={() => handleMenuClicked("drawing_settings")}>Zoom In</Menu.Item>
                </Menu.Dropdown>
            </Menu>

            {/* HELP */}
            {/* <Menu>
                <Menu.Target>
                    <Button variant="subtle">Help</Button>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Item onClick={() => handleMenuClicked("about_app")}>About</Menu.Item>
                </Menu.Dropdown>
            </Menu> */}

        </Group>
    );
}
