import { Card, Input, Button, message, Typography } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    if (!email.trim()) {
      message.error("E-posta adresi giriniz");
      return;
    }
    if (!password.trim()) {
      message.error("Şifre giriniz");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      message.error("Geçerli bir e-posta adresi giriniz");
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      message.success("Giriş başarılı! Yönlendiriliyorsunuz...");
      navigate("/dashboard");
    } catch (err) {
      message.error(err.message || "Giriş başarısız. E-posta veya şifrenizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && email.trim() && password.trim() && !loading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      {/* Ana içerik - flex ile ortalandı */}
      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-lg border border-gray-200 dark:border-slate-700 rounded-xl">
          <div className="text-center mb-8">
            <Title level={3} className="mb-1 text-gray-900 dark:text-white">
              Hoş Geldiniz
            </Title>
            <Text type="secondary" className="dark:text-gray-400">
              Devam etmek için giriş yapın
            </Text>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <Input
                size="large"
                placeholder="E-posta"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                prefix={<UserOutlined className="text-gray-400" />}
                className="rounded-lg"
              />

              <Input.Password
                size="large"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                prefix={<LockOutlined className="text-gray-400" />}
                className="rounded-lg"
              />
            </div>

            <Button
              type="primary"
              block
              onClick={handleLogin}
              loading={loading}
              disabled={loading || !email.trim() || !password.trim()}
              size="large"
              className="h-12 text-base font-medium rounded-lg"
            >
              {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </Button>

            {/* Demo hesapları - minimalist */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Text className="text-xs text-gray-500 dark:text-gray-400 block text-center mb-3">
                Demo hesabı
              </Text>
              <div className="grid grid-cols-2 gap-3 justify-center items-center">
                <div className="text-center">
                  <Text className="text-xs font-medium text-gray-900 dark:text-white block">Admin</Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">admin@taskflow.com</Text>
                </div>
                <div className="text-center">
                  <Text className="text-xs font-medium text-gray-900 dark:text-white block">Şifre: 123456</Text>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}