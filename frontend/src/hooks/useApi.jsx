import { useLoader } from "./useLoader";

export function useApi() {
    const loader = useLoader();

    const api = async (method, args, options = { loader: true }) => {
        try {
            // Automatically open loader
            if (options.loader !== false) loader.open();

            // Validate pywebview API
            if (!window.pywebview?.api || !window.pywebview.api[method]) {
                throw new Error(`PyWebView API method "${method}" not found`);
            }

            let result;

            // 🔥 Only supply arguments if args is defined
            if (args !== undefined) {
                result = await window.pywebview.api[method](args);
            } else {
                result = await window.pywebview.api[method]();
            }

            return result;

        } catch (err) {
            console.error("API Error:", err);
            throw err;

        } finally {
            if (options.loader !== false) loader.close();
        }
    };

    return { api };
}