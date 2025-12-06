
import { useRecoilState } from "recoil";
import { loaderAtom } from "../atom";


export function useLoader() {
    const [state, setState] = useRecoilState(loaderAtom);

    return {
        open: (msg) =>
            setState({
                open: true,
                message: msg || "Processing, please wait...",
            }),

        close: () =>
            setState({
                open: false,
                message: "",
            }),

        setMessage: (msg) =>
            setState((s) => ({ ...s, message: msg })),
    };
}


