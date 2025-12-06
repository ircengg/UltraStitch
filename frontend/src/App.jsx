
import { useRecoilState } from "recoil";
import { menuEventAtom, projectAtom, scansAtom } from "./atom";
import ProjectPage from "./pages/ProjectPage";
import ViewerPage from "./pages/ViewerPage";
import "./App.css"
import Menubar from "./components/Menu";

export default function App() {
    const [project, setProject] = useRecoilState(projectAtom);


    if (!project) {
        return <ProjectPage />
    }




    return (
        <>
            <Menubar />
            <ViewerPage />
        </>
    );
}
