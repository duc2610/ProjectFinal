import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";
import Splash from "@shared/components/Splash";

export function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Splash />;

  if (!isAuthenticated) {
    if (localStorage.getItem("tg_access_token")) {
      message.warning("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
    return (
      <Navigate
        to="/login"
        replace
        state={{ returnTo: location.pathname + location.search }}
      />
    );
  }
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Splash />;
  if (isAuthenticated) {
    const returnTo = location.state?.returnTo || "/";
    return <Navigate to={returnTo} replace />;
  }
  return <Outlet />;
}
