import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  login as svcLogin,
  logout as svcLogout,
  loginWithGoogle as svcGoogle,
} from "@services/authService";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      } catch {}
    }
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const data = await svcLogin({ email, password });
      const u = { id: data.userId, fullname: data.fullname, email: data.email };
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
      return { ok: true, user: u };
    } catch (err) {
      const message = err?.response?.data?.message || "Đăng nhập thất bại";
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (code) => {
    setLoading(true);
    try {
      const data = await svcGoogle(code);
      const u = { id: data.userId, fullname: data.fullname, email: data.email };
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
      return { ok: true, user: u };
    } catch (err) {
      const message =
        err?.response?.data?.message || "Đăng nhập Google thất bại";
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    svcLogout();
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      signIn,
      signInWithGoogle,
      signOut,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
