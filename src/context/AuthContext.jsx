import { createContext, useContext, useState } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // localStorage kullanımı daha kalıcıdır, sessionStorage sekme kapanınca silinir
    const stored = sessionStorage.getItem("user");
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        if (userData.id && !userData._id) userData._id = userData.id;
        return userData;
      } catch {
        return null;
      }
    }
    return null;
  });

  const login = async ({ email, password }) => {
    try {
      const response = await authApi.login({ email, password });
      const { user: userData, token } = response.data;
      
      if (userData.id && !userData._id) userData._id = userData.id;
      
      sessionStorage.setItem("user", JSON.stringify(userData));
      sessionStorage.setItem("token", token);
      setUser(userData);
      
      return userData;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Giriş başarısız");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUser(null);
  };

  // ✅ KRİTİK DÜZELTME: Güncelleme state ve storage senkronizasyonu
  const updateUser = (updatedUserData) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedUserData };
      // ID tutarlılığı
      if (newUser.id && !newUser._id) newUser._id = newUser.id;
      
      // Storage'ı hemen güncelle
      sessionStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth, AuthProvider içinde kullanılmalıdır");
  return ctx;
}