import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, setAuthLostHandler } from "./api.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // One-time message shown on the login page (e.g. "Password changed"). Lives here so it survives route-guard redirects.
  const [flash, setFlash] = useState("");

  // Who am I? (an expired access token is refreshed inside api.js)
  useEffect(() => {
    api.profile().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
    setAuthLostHandler(() => setUser(null));
  }, []);

  const login = useCallback(async (credentials) => {
    await api.login(credentials);
    setUser(await api.profile());
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  return <AuthContext.Provider value={{ user, setUser, loading, login, logout, flash, setFlash }}>{children}</AuthContext.Provider>;
}
