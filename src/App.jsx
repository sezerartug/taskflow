import { Layout, ConfigProvider, theme as antdTheme, App as AntdApp } from 'antd';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import MyTasks from './pages/MyTasks';
import Users from './pages/Users';
import NotFound from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ProtectedRoute from './pages/ProtectedRoute';
import AppHeader from './components/AppHeader';
import Footer from './components/Footer';

const { Content } = Layout;

function ThemeWrapper({ children }) {
  const { theme } = useTheme();
  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
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
          <AntdApp>
            <BrowserRouter>
              <Layout style={{ height: '100vh', overflow: 'hidden' }}>
                <AppHeader />
                <Content style={{ flex: 1, overflow: 'auto' }}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-tasks"
                      element={
                        <ProtectedRoute>
                          <MyTasks />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/users"
                      element={
                        <ProtectedRoute allowedRoles={['Admin']}>
                          <Users />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Content>
                <Footer />
              </Layout>
            </BrowserRouter>
          </AntdApp>
        </AuthProvider>
      </ThemeWrapper>
    </ThemeProvider>
  );
}

export default App;