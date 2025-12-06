import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css"
import App from "./App";
import { RecoilRoot } from "recoil";
import { BusyLoader } from "./components/BusyLoader";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <RecoilRoot>
        <App />
        <BusyLoader />
      </RecoilRoot>
    </MantineProvider>
  </React.StrictMode>
);
