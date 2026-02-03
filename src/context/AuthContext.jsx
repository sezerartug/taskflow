import { createContext, useContext, useState } from "react";
import { api } from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async ({ email, password }) => {
    // API'ye güveniyoruz, o zaten validation yapacak
    const userData = await api.login({ email, password });
    
    // Token kontrolü (eğer token yoksa oluştur)
    if (!userData.token) {
      userData.token = `token_${Date.now()}_${Math.random().toString(36).substr(2)}`;
    }
    
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);
    setUser(userData);
    
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth, AuthProvider içinde kullanılmalıdır");
  }
  return ctx;
}