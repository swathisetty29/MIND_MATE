import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("mindmate_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api("/me")
      .then((d) => setUser(d.user))
      .catch(() => {
        localStorage.removeItem("mindmate_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function login(token, u) {
    localStorage.setItem("mindmate_token", token);
    setUser(u);
  }

  function logout() {
    localStorage.removeItem("mindmate_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
