import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";
import Splash from "@shared/components/Splash";
import { message } from "antd";
import { hasRole, ROLES } from "@shared/utils/acl";
import { hasCookie } from "@shared/utils/cookie";

export function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Splash />;

  if (!isAuthenticated) {
    if (hasCookie("tg_access_token")) {
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
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <Splash />;
  if (isAuthenticated) {
    const returnTo = location.state?.returnTo;
    if (returnTo) return <Navigate to={returnTo} replace />;
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    const defaultDest =
      roles.includes(ROLES.Admin) || roles.includes(ROLES.TestCreator)
        ? "/admin/dashboard"
        : "/";
    return <Navigate to={defaultDest} replace />;
  }
  return <Outlet />;
}

export function RoleRoute({ allow }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Splash />;

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ returnTo: location.pathname + location.search }}
      />
    );
  }

  const allowed = hasRole(user, allow);
  if (!allowed) {
    message.warning("Bạn không có quyền truy cập trang này.");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
