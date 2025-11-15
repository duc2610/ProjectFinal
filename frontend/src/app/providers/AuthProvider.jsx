import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import {
  login as svcLogin,
  logout as svcLogout,
  loginWithGoogle as svcGoogle,
  getProfile as svcGetProfile,
} from "@services/authService";
import { useNavigate, useLocation } from "react-router-dom";
import { ROLES } from "@shared/utils/acl";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const hasToken = !!localStorage.getItem("tg_access_token");
        if (hasToken) {
          const profile = await svcGetProfile();
          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));
          
          const currentPath = location.pathname;
          if (currentPath === "/") {
            const roles = Array.isArray(profile?.roles) ? profile.roles : [];
            if (roles.includes(ROLES.Admin)) {
              navigate("/admin/dashboard", { replace: true });
            } else if (roles.includes(ROLES.TestCreator)) {
              navigate("/test-creator/dashboard", { replace: true });
            }
          }
        } else {
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch (e) {
        localStorage.removeItem("tg_access_token");
        localStorage.removeItem("tg_refresh_token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, location.pathname]);

  const persistTokens = (data) => {
    if (data && data.accessToken)
      localStorage.setItem("tg_access_token", data.accessToken);
    if (data && data.refreshToken)
      localStorage.setItem("tg_refresh_token", data.refreshToken);
  };

  const refreshProfile = useCallback(async () => {
    const profile = await svcGetProfile();
    setUser(profile);
    localStorage.setItem("user", JSON.stringify(profile));
    return profile;
  }, []);

  const signIn = useCallback(
    async (email, password) => {
      setLoading(true);
      try {
        const data = await svcLogin({ email, password });
        persistTokens(data);
        const profile = await refreshProfile();
        return { ok: true, user: profile };
      } catch (err) {
        const message = err?.response?.data?.message || "Đăng nhập thất bại";
        return { ok: false, message };
      } finally {
        setLoading(false);
      }
    },
    [refreshProfile]
  );

  const signInWithGoogle = useCallback(
    async (code) => {
      setLoading(true);
      try {
        const data = await svcGoogle(code);
        persistTokens(data);
        const profile = await refreshProfile();
        return { ok: true, user: profile };
      } catch (err) {
        const message =
          err?.response?.data?.message || "Đăng nhập Google thất bại";
        return { ok: false, message };
      } finally {
        setLoading(false);
      }
    },
    [refreshProfile]
  );

  const signOut = () => {
    svcLogout();
    setUser(null);
    localStorage.removeItem("user");
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user, 
      signIn,
      signInWithGoogle,
      signOut,
      refreshProfile,
    }),
    [user, loading, signIn, signInWithGoogle, signOut, refreshProfile]
  );
  

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
