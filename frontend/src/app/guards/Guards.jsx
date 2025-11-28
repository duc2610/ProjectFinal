import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";
import Splash from "@shared/components/Splash";
import { message } from "antd";
import { hasRole, ROLES } from "@shared/utils/acl";
import { hasCookie } from "@shared/utils/cookie";
import { useRef, useEffect } from "react";

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

// Helper function để kiểm tra xem path có phù hợp với role không
function isPathAllowedForRole(path, roles) {
  if (!path || !Array.isArray(roles)) return false;
  
  if (path.startsWith("/admin")) {
    return roles.includes(ROLES.Admin);
  }
  if (path.startsWith("/test-creator")) {
    return roles.includes(ROLES.TestCreator);
  }
  if (path.startsWith("/toeic-exam") || path.startsWith("/result") || path.startsWith("/exam")) {
    return roles.includes(ROLES.Examinee);
  }
  return true; // Các path khác (home, about, etc.) đều được phép
}

// Biến để track warning đã hiển thị (tránh hiển thị nhiều lần)
let warningShownForPath = null;
// Biến để track xem có đang trong quá trình redirect tự động sau login không
let isAutoRedirecting = false;
let autoRedirectTimeout = null;

// Export function để set flag auto redirecting (được gọi từ Login component)
export function setAutoRedirecting(value) {
  isAutoRedirecting = value;
  if (value) {
    // Reset flag sau 1 giây
    if (autoRedirectTimeout) {
      clearTimeout(autoRedirectTimeout);
    }
    autoRedirectTimeout = setTimeout(() => {
      isAutoRedirecting = false;
    }, 1000);
  }
}

export function RoleRoute({ allow }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Reset auto redirect flag sau một khoảng thời gian ngắn khi path thay đổi
  useEffect(() => {
    if (isAutoRedirecting) {
      if (autoRedirectTimeout) {
        clearTimeout(autoRedirectTimeout);
      }
      autoRedirectTimeout = setTimeout(() => {
        isAutoRedirecting = false;
      }, 1000); // 1 giây sau khi redirect
    }
    return () => {
      if (autoRedirectTimeout) {
        clearTimeout(autoRedirectTimeout);
      }
    };
  }, [location.pathname]);

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

  // Kiểm tra quyền chỉ khi user đã được load xong
  if (!user) {
    return <Splash />;
  }

  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const currentPath = location.pathname;
  const allowed = hasRole(user, allow);
  
  if (!allowed) {
    // Kiểm tra xem path hiện tại có phù hợp với role của user không
    const isPathAllowed = isPathAllowedForRole(currentPath, roles);
    
    // Nếu path hiện tại phù hợp với role, không hiển thị warning
    // Và không render Outlet (để Route khác xử lý)
    // Điều này tránh hiển thị warning khi có nhiều RoleRoute lồng nhau
    if (isPathAllowed) {
      // User đang ở đúng path, không render gì (sẽ được xử lý bởi RoleRoute khác match)
      // Return fragment rỗng để không render gì
      return <></>;
    }
    
    // Nếu path không phù hợp với role, kiểm tra xem có đang trong quá trình auto redirect không
    // Chỉ hiển thị warning khi không phải auto redirect (user thực sự cố gắng truy cập)
    const shouldShowWarning = !isAutoRedirecting && warningShownForPath !== currentPath;
    
    if (shouldShowWarning) {
      warningShownForPath = currentPath;
      message.warning("Bạn không có quyền truy cập trang này.");
    }
    
    // Đánh dấu đang trong quá trình auto redirect
    isAutoRedirecting = true;
    
    // Redirect về trang phù hợp với role
    if (roles.includes(ROLES.Admin)) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (roles.includes(ROLES.TestCreator)) {
      return <Navigate to="/test-creator/dashboard" replace />;
    }
    if (roles.includes(ROLES.Examinee)) {
      return <Navigate to="/" replace />;
    }
    
    // Nếu không có role nào phù hợp, redirect về home
    return <Navigate to="/" replace />;
  }

  // Reset warning khi có quyền
  if (warningShownForPath === currentPath) {
    warningShownForPath = null;
  }

  return <Outlet />;
}
