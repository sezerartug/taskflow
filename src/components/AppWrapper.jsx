import App from "../App";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useTheme } from "../context/ThemeContext";

export default function AppWrapper() {
  const { theme } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm:
          theme === "dark"
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
      }}
    >
      <App />
    </ConfigProvider>
  );
}