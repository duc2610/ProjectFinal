import { Navigate, useLocation } from "react-router-dom";
import { Result, Button } from "antd";
import { useAuth } from "@shared/hooks/useAuth";
import { hasRole } from "@shared/utils/acl";

export function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

export function RoleGuard({ roles = [], children }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasRole(user, roles)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Bạn không có quyền truy cập trang này."
        extra={
          <Button type="primary" href="/">
            Về Trang chủ
          </Button>
        }
      />
    );
  }
  return children;
}
