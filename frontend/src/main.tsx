import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "antd/dist/reset.css";
import "./index.css";
import App from "./App.tsx";
import { App as AntApp, ConfigProvider } from "antd";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0f766e",
          colorInfo: "#0f766e",
          colorText: "#14243b",
          colorTextSecondary: "#526278",
          colorBgLayout: "#f4f7fb",
          colorBorder: "#dce4ed",
          borderRadius: 12,
          controlHeight: 42,
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        },
        components: {
          Layout: { bodyBg: "#f4f7fb" },
          Button: { primaryShadow: "none", fontWeight: 600 },
          Card: { headerFontSize: 16 },
          Menu: { itemBg: "transparent" },
          Table: { headerBg: "#f4f7fb", headerColor: "#526278" },
          Typography: { titleMarginTop: 0, titleMarginBottom: 16 },
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
);
