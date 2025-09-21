import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  login as svcLogin,
  logout as svcLogout,
  getCurrentUser,
  verifyFakeToken,
  isAuthenticated as svcIsAuthenticated,
} from "@services/authService";
import { useNavigate } from "react-router-dom";
import { hasRole } from "@shared/utils/acl";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const res = await svcLogin(email, password);
      if (res.success) {
        setUser(res.user);
        return { ok: true, user: res.user };
      }
      return { ok: false, message: res.message || "Đăng nhập thất bại" };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    clearTimer();
    svcLogout();
    setUser(null);
  };
  useEffect(() => {
    const onStorage = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: svcIsAuthenticated(),
      signIn,
      signOut,
      hasRole: (role) => hasRole(user, role),
      refresh: () => setUser(getCurrentUser()),
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
