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

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

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

  //   useEffect(() => {
  //     clearTimer();
  //     if (!user) return;

  //     const token = localStorage.getItem("token");
  //     const payload = verifyFakeToken(token);

  //     if (!payload) {
  //       signOut();
  //       return;
  //     }

  //     const nowSec = Math.floor(Date.now() / 1000);
  //     const timeLeftMs = Math.max(0, (payload.exp - nowSec) * 1000);

  //     if (timeLeftMs === 0) {
  //       signOut();
  //       return;
  //     }

  //     timerRef.current = setTimeout(() => {
  //       signOut();
  //     }, timeLeftMs);

  //     return clearTimer;
  //   }, [user]);

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
      refresh: () => setUser(getCurrentUser()),
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
