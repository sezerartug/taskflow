import { Card, Input, Button, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    // 👇 Basic client-side validation (isteğe bağlı, API zaten yapıyor)
    if (!email.trim() || !password.trim()) {
      message.error("Lütfen e-posta ve şifre alanlarını doldurunuz");
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      message.success("Giriş başarılı!");
      navigate("/dashboard");
    } catch (err) {
      // 👇 Error mesajını doğru şekilde göster
      message.error(err.message || "Giriş başarısız. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // Enter tuşu ile giriş
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && email.trim() && password.trim() && !loading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-amber-700 via-emerald-500 to-pink-500">
      <Card className="w-full max-w-sm backdrop-blur-lg bg-white/80 border-0 shadow-2xl rounded-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">TaskFlow</h2>
          <p className="text-sm text-slate-500 mt-1">
            Görevlerini kolayca yönet
          </p>
        </div>
        
        <div className="space-y-4">
          <Input
            size="large"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="w-full"
          />

          <Input.Password
            size="large"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="w-full"
          />
        </div>

        <Button 
          type="primary" 
          block 
          onClick={handleLogin}
          loading={loading}
          disabled={loading || !email.trim() || !password.trim()}
          className="mt-6 h-10 text-base"
        >
          {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
        </Button>

        <div className="mt-6 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            Demo hesabı ile giriş yap:
          </p>
          <p className="text-xs text-slate-700 text-center font-medium mt-1">
            admin@taskflow.com / 123456
          </p>
          <p className="text-xs text-slate-400 text-center mt-2">
            Veya JSON Server'da kayıtlı kullanıcılarınızı kullanın
          </p>
        </div>
      </Card>
    </div>
  );
}