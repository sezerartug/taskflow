import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { App as AntdApp } from "antd";
import App from "./App";
import { store } from "./store";
import "antd/dist/reset.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <AntdApp>
        <App />
      </AntdApp>
    </Provider>
  </React.StrictMode>
);