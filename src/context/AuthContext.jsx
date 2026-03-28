import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  fetchCurrentUser,
  loginRequest,
  registerRequest,
} from "../services/api";

/* ═══════════════════════════════════════════════════════════════
   AUTH CONTEXT  —  JWT-backed auth state
═══════════════════════════════════════════════════════════════ */
const AuthContext = createContext(null);
const TOKEN_KEY = "ps_crm_token";
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const response = await fetchCurrentUser();
        setUser(response.user);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async ({ email, password }) => {
    const response = await loginRequest({ email, password });
    localStorage.setItem(TOKEN_KEY, response.token);
    setUser(response.user);
    return response.user;
  };

  const register = async ({ name, email, password, phone }) => {
    const response = await registerRequest({ name, email, password, phone });
    localStorage.setItem(TOKEN_KEY, response.token);
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      role: user?.role || null,
      login,
      register,
      logout,
      isAdmin: user?.role === "admin",
      isAuthenticated: Boolean(user),
      isBootstrapping,
    }),
    [user, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
