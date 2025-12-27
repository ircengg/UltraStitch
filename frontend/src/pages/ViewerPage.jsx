import { Box } from "@mantine/core";

import CanvasArea from "../components/CanvasArea";
import Toolbar from "../components/Toolbar";
import DrawingSettings from "../components/DrawingSettings";
import { ScanEditor } from "../components/ScanEditor";
import ScanList from "../components/ScanList";
import { ReferenceEditor } from "../components/ReferenceEditor";
import ReferenceList from "../components/ReferenceList";


export default function ViewerPage() {

    return (
        <Box p={0} m={0}>           
            <CanvasArea />
            <ScanList />
            <ReferenceList />
            <Toolbar />
            <DrawingSettings />       
            <ScanEditor />
            <ReferenceEditor />
        </Box>
    );
}
