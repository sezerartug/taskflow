import { Layout, Switch, Avatar, Dropdown } from "antd";
import {
  UserOutlined,
  BellOutlined,
  TeamOutlined,
  DashboardOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationBell from "./NotificationBell";

const { Header } = Layout;

export default function AppHeader() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const userMenuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <DashboardOutlined />,
      onClick: () => navigate("/dashboard"),
    },
    {
      key: "my-tasks",
      label: "Bana Atananlar",
      icon: <UnorderedListOutlined />,
      onClick: () => navigate("/my-tasks"),
    },
    {
      key: "profile",
      label: "Profilim",
      icon: <UserOutlined />,
      onClick: () => navigate("/profile"),
    },
    ...(user?.role === "Admin"
      ? [
          {
            key: "users",
            label: "Kullanıcılar",
            icon: <TeamOutlined />,
            onClick: () => navigate("/admin/users"),
          },
        ]
      : []),
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Çıkış Yap",
      danger: true,
      onClick: () => {
        logout();
        navigate("/login");
      },
    },
  ];

  return (
    <Header className="bg-linear-to-r from-indigo-600 to-purple-600 dark:from-slate-900 dark:to-slate-800 border-b dark:border-slate-700 px-6">
      <div className="flex justify-between items-center h-full">
        {/* Logo */}
        <h1
          className="text-2xl font-semibold text-white cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          TaskFlow
        </h1>

        {/* Sağ taraf */}
        <div className="flex items-center gap-4">
          <Switch
            checked={theme === "dark"}
            onChange={toggleTheme}
            checkedChildren="🌙"
            unCheckedChildren="☀️"
            className="scale-125 md:scale-100 bg-white/20"
          />

          {/* Bildirim Zili */}
          {user && <NotificationBell />}

          {/* Kullanıcı Menüsü */}
          {user && (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 p-1 md:p-0">
                <Avatar
                  src={user.avatar ? `http://localhost:5000${user.avatar}` : null}
                  icon={!user.avatar && <UserOutlined />}
                  className="bg-white/20 border-2 border-white/50"
                  size={window.innerWidth < 768 ? "default" : "large"}
                >
                  {user.name?.[0]}
                </Avatar>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-white">
                    {user.name}
                  </div>
                  <div className="text-xs text-white/80">{user.role}</div>
                </div>
              </div>
            </Dropdown>
          )}
        </div>
      </div>
    </Header>
  );
}