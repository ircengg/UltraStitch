import { CONTEXT_MENU_STATE, HIDDEN_MESHES_ATOM, SCAN_REG_ATOM, TOOLBAR_ATOM, VIEW_ONLY_MESH_ATOM } from './atom';
import { Menu } from "@mantine/core";
import { useRecoilState } from 'recoil';

const ContextMenu = () => {
    const [context_menu, setContextMenu] = useRecoilState(CONTEXT_MENU_STATE);

    const [viewOnly, setViewOnly] = useRecoilState(VIEW_ONLY_MESH_ATOM);
    const [hidden, setHidden] = useRecoilState(HIDDEN_MESHES_ATOM);

    const [scanRegistration, setScanRegistration] = useRecoilState(SCAN_REG_ATOM);
    const [toolbar, setToolbar] = useRecoilState(TOOLBAR_ATOM);


    const toggleHide = (uuid) => {
        setHidden((prev) => {
            const next = new Set(prev);
            // console.log(next)
            if (next.has(uuid)) next.delete(uuid);
            else next.add(uuid);
            return next;
        });
        setContextMenu(null);
    };

    const handleViewOnly = (uuid) => {
        setViewOnly(uuid);
        setContextMenu(null);
    };

    const handleViewAll = () => {
        setViewOnly(null);
        setHidden(new Set());
        setContextMenu(null);
    };


    const openScanRegistration = (context_menu) => {
        setScanRegistration({
            mesh_id: context_menu.mesh_id,
            meshUuid: context_menu.meshUuid
        });
        setToolbar(t => ({ ...t, scan_registration_mode: true }))
    }

    const openAddTag = (context_menu) => {
        setScanRegistration({
            mesh_id: context_menu.mesh_id,
            meshUuid: context_menu.meshUuid
        });
        setToolbar(t => ({ ...t, scan_registration_mode: true }))
    }


    const handleMenuClick = (menu_id) => {
        setContextMenu({ ...context_menu, menu_id, open: false });
        // console.log(menu_id, context_menu)
    }



    if (!context_menu || !context_menu.open) {
        return null;
    }

    return (
        <Menu
            opened
            // onClose={() => setContextMenu(null)}
            withinPortal
            position="bottom-start"
        >
            <Menu.Dropdown style={{ position: "absolute", top: context_menu.y, left: context_menu.x }}>
                {context_menu.meshUuid &&
                    (
                        <>
                            <Menu.Item onClick={() => toggleHide(context_menu.meshUuid)}>
                                {hidden.has(context_menu.meshUuid) ? "Show" : "Hide"}
                            </Menu.Item>
                            <Menu.Item onClick={() => handleViewOnly(context_menu.meshUuid)}>View Only</Menu.Item>
                            <Menu.Item onClick={() => openScanRegistration(context_menu)}>Register Scans</Menu.Item>
                            <Menu.Item onClick={() => handleMenuClick("add_tag")}>Tag</Menu.Item>
                            <Menu.Item onClick={() => handleMenuClick("show_info")}>Show Info</Menu.Item>
                        </>
                    )
                }
                <Menu.Item onClick={handleViewAll}>View All</Menu.Item>
            </Menu.Dropdown>
        </Menu>
    )
}

export default ContextMenu