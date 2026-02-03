import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { App as AntdApp } from "antd"; // Antd App component'ini import et
import "antd/dist/reset.css";
import "./index.css";

// Antd message'ları için wrapper
function AntdAppWrapper() {
  return (
    <AntdApp>
      <App />
    </AntdApp>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AntdAppWrapper />
  </React.StrictMode>
);