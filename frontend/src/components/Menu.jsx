import { Menu, Button, Group, ActionIcon, CheckIcon } from '@mantine/core';
import { useSetRecoilState } from 'recoil';
import { useApi } from '../hooks/useApi';
import { drawingAtom, menuEventAtom, mesurementAtom, projectAtom, referenceAtom, registrationAtom, scansAtom, shapeAtom, thkDataAtom, viewAtom } from '../atom';
import { useRecoilState } from 'recoil';
import { IconBrandSupernova } from '@tabler/icons-react';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { IconCheckbox } from '@tabler/icons-react';
import { IconSquare } from '@tabler/icons-react';

export default function Menubar() {
    const { api } = useApi();
    const [project, setProject] = useRecoilState(projectAtom);
    const [scans, setScans] = useRecoilState(scansAtom);
    const [drawing, setDrawing] = useRecoilState(drawingAtom);
    const [reference, setReference] = useRecoilState(referenceAtom);
    const [measurement, setMeasurement] = useRecoilState(mesurementAtom);
    const [registration, setRegistration] = useRecoilState(registrationAtom);
    const [shapes, setShapes] = useRecoilState(shapeAtom);

    const [view, setView] = useRecoilState(viewAtom);
  
    const handleProjectOpen = async () => {
        const res = await api("open_project");
        console.log(res)
        if (res) {
            setProject(res.project);
            setDrawing(prev => ({ ...prev, ...res.drawing }));
            setScans(res.scans)
            setReference(res.reference);
            setMeasurement(res.measurement)
            setShapes(res.annotation)
        }
    };


    const handle_project_save = async () => {
        const payload = {
            project,
            scans,
            drawing,
            reference,
            measurement,
            annotation: shapes
        }
        console.log("payload: ", payload)
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
            setScans(res);
            // console.log(res)
        }
    }

    const export_registered_scans = async () => {
        const res = await api("export_registration");
        alert('Excel exported successfully');
    }

    const register_scans = async () => {
        const res = await api("register_scans", drawing.gridStep);
        if (res) {
            console.log(res);
            setRegistration({ ...registration, ...res });
        }
    }





    const handleMenuClicked = (menuEvent) => {
        setView(prev => ({ ...prev, [menuEvent]: !prev[menuEvent] }))
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

            <ActionIcon>
                <IconDeviceFloppy />
            </ActionIcon>

            {/* EDIT MENU */}
            <Menu>
                <Menu.Target>
                    <Button variant="subtle">Scans</Button>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Item onClick={handleScanImport}>Import</Menu.Item>
                    <Menu.Item onClick={handle_scan_process}>Process Scans</Menu.Item>
                    <Menu.Item onClick={export_registered_scans}>Export Registered Scans</Menu.Item>
                    <Menu.Item onClick={register_scans}>Register Scans</Menu.Item>

                </Menu.Dropdown>
            </Menu>

            {/* View MENU */}
            <Menu>
                <Menu.Target>
                    <Button variant="subtle">View</Button>
                </Menu.Target>

                <Menu.Dropdown>
                    <CheckMenu title={"Scan List"} name={"scan_list"} />
                    <CheckMenu title={"Reference List"} name={"reference_list"} />
                    <CheckMenu title={"Scan Editor"} name={"scan_editor"} />
                    <CheckMenu title={"Reference Editor"} name={"reference_editor"} />
                    <CheckMenu title={"Drawing Setings"} name={"drawing_setting"} />
                </Menu.Dropdown>
            </Menu>

            {/* HELP */}
            <Menu>
                <Menu.Target>
                    <Button variant="subtle">Help</Button>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Item onClick={() => handleMenuClicked("about")}>About</Menu.Item>
                </Menu.Dropdown>
            </Menu>

        </Group>
    );
}



const CheckMenu = ({ name, title }) => {
    const [view, setView] = useRecoilState(viewAtom);

    const handleMenuClicked = (name) => {
        setView(prev => ({ ...prev, [name]: !prev[name] }))
    }

    return <Menu.Item
        leftSection={
            view[name] ? (
                <IconCheckbox size={16} />
            ) : (
                <IconSquare size={16} />
            )
        }
        onClick={() => handleMenuClicked(name)}
    >
        {title || name}
    </Menu.Item>
}