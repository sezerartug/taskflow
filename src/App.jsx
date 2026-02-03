import { Layout, ConfigProvider, theme as antdTheme } from "antd";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext"; // ThemeProvider'ı buraya taşı
import ProtectedRoute from "./pages/ProtectedRoute";
import AppHeader from "./components/AppHeader";

const { Content } = Layout;

// ThemeWrapper component'i oluştur
function ThemeWrapper({ children }) {
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
      {children}
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemeWrapper>
        <AuthProvider>
          <BrowserRouter>
            <Layout className="min-h-screen bg-gray-100 dark:bg-slate-900">
              <AppHeader />
              <Content className="bg-gray-50 dark:bg-slate-900">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Layout className="h-screen bg-gray-100 dark:bg-slate-800">
                          <Content className="p-6 overflow-auto">
                            <Dashboard />
                          </Content>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                  <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
              </Content>
            </Layout>
          </BrowserRouter>
        </AuthProvider>
      </ThemeWrapper>
    </ThemeProvider>
  );
}

export default App;