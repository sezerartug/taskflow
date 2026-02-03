import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  // Kullanıcı yoksa login'e yönlendir
  if (!user) {
    return <Navigate to="/login" replace />;
  }
 // Kullanıcı varsa child route'u render et
  return children;
}

