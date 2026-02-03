import { Layout, Button, Switch } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const { Header } = Layout;

export default function AppHeader() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <Header className="bg-white dark:bg-slate-900 border-b dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white dark:text-slate-100">
          TaskFlow
        </h1>

        <div className="flex items-center gap-4">
          <Switch
            checked={theme === "dark"}
            onChange={toggleTheme}
            checkedChildren="🌙"
            unCheckedChildren="☀️"
          />

          {user && (
            <>
              <span className="text-sm text-slate-500 dark:text-slate-300">
                {user.email}
              </span>

              <Button
                danger
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Çıkış Yap
              </Button>
            </>
          )}
        </div>
      </div>
    </Header>
  );
}
