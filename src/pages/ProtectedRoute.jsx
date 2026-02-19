import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Result, Button } from "antd";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user } = useAuth();

  // 🚫 Kullanıcı giriş yapmamışsa login'e yönlendir
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 Eğer allowedRoles belirtilmiş ve kullanıcının rolü bu listede yoksa
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Result
          status="403"
          title="Yetkisiz Erişim"
          subTitle="Bu sayfayı görüntüleme yetkiniz yok."
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Geri Dön
            </Button>
          }
        />
      </div>
    );
  }

  // ✅ Her şey tamam, sayfayı göster
  return children;
}