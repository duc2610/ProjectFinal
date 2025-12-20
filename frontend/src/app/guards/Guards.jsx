import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";
import Splash from "@components/Splash";
import { message, notification } from "antd";
import { hasRole, ROLES } from "@utils/acl";
import { hasCookie } from "@utils/cookie";
import { useRef, useEffect } from "react";
import { showNotificationOnce, resetNotificationTracking } from "@utils/notificationHelper";

export function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Splash />;

  if (!isAuthenticated) {
    const currentPath = location.pathname;
    
    // Nếu đang trong quá trình đăng xuất, không hiển thị thông báo
    // Chỉ redirect về home
    if (isLoggingOut) {
      return <Navigate to="/" replace />;
    }
    
    // Chỉ hiển thị thông báo một lần cho mỗi path (tránh hiển thị nhiều lần do re-render)
    // Và chỉ hiển thị khi không phải đang redirect về home
    if (loginWarningShownForPath !== currentPath && currentPath !== "/") {
      loginWarningShownForPath = currentPath;
      
      const notificationKey = `login-warning-${currentPath}`;
      
      if (hasCookie("tg_access_token")) {
        showNotificationOnce({
          key: notificationKey,
          type: "warning",
          message: "Phiên đăng nhập đã hết hạn",
          description: "Vui lòng đăng nhập lại.",
          placement: "topRight",
          duration: 4,
        });
      } else {
        // Hiển thị thông báo yêu cầu đăng nhập thay vì redirect về login
        showNotificationOnce({
          key: notificationKey,
          type: "warning",
          message: "Yêu cầu đăng nhập",
          description: "Vui lòng đăng nhập để sử dụng chức năng này.",
          placement: "topRight",
          duration: 4,
        });
      }
    }
    
    // Redirect về home thay vì login
    return <Navigate to="/" replace />;
  }
  
  // Reset warning khi đã authenticated
  if (loginWarningShownForPath === location.pathname) {
    loginWarningShownForPath = null;
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

// Biến để track warning đã hiển thị (tránh hiển thị nhiều lần)
let warningShownForPath = null;
// Biến để track xem có đang trong quá trình redirect tự động sau login không
let isAutoRedirecting = false;
let autoRedirectTimeout = null;
// Biến để track xem có đang trong quá trình đăng xuất không
let isLoggingOut = false;
// Biến để track xem đã hiển thị thông báo đăng nhập cho path hiện tại chưa
let loginWarningShownForPath = null;

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

// Export function để set flag logging out (được gọi từ AuthProvider)
export function setLoggingOut(value) {
  isLoggingOut = value;
  if (value) {
    // Reset các flag khi đăng xuất
    loginWarningShownForPath = null;
    // Reset notification tracking khi đăng xuất
    resetNotificationTracking();
    // Reset flag sau 2 giây để đảm bảo redirect hoàn tất
    setTimeout(() => {
      isLoggingOut = false;
    }, 2000);
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
    const currentPath = location.pathname;
    
    // Nếu đang trong quá trình đăng xuất, không hiển thị thông báo
    // Chỉ redirect về home
    if (isLoggingOut) {
      return <Navigate to="/" replace />;
    }
    
    // Chỉ hiển thị thông báo một lần cho mỗi path (tránh hiển thị nhiều lần do re-render)
    // Và chỉ hiển thị khi không phải đang redirect về home
    if (loginWarningShownForPath !== currentPath && currentPath !== "/") {
      loginWarningShownForPath = currentPath;
      
      // Hiển thị thông báo yêu cầu đăng nhập thay vì redirect về login
      const notificationKey = `role-login-warning-${currentPath}`;
      showNotificationOnce({
        key: notificationKey,
        type: "warning",
        message: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để sử dụng chức năng này.",
        placement: "topRight",
        duration: 4,
      });
    }
    
    // Redirect về home thay vì login
    return <Navigate to="/" replace />;
  }

  // Kiểm tra quyền chỉ khi user đã được load xong
  if (!user) {
    return <Splash />;
  }

  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const currentPath = location.pathname;
  const allowed = hasRole(user, allow);
  
  if (!allowed) {
    // Hiển thị warning khi:
    // - Không phải auto redirect sau login
    // - Chưa hiển thị warning cho path này (tránh spam do re-render/StrictMode)
    // Lưu ý: Không phụ thuộc "path có hợp role hay không" vì có các route dạng /reports/*
    // vẫn cần chặn theo role (ví dụ: /reports/question chỉ TestCreator được vào).
    const shouldShowWarning =
      !isAutoRedirecting && warningShownForPath !== currentPath;
    
    if (shouldShowWarning) {
      warningShownForPath = currentPath;
      message.warning("Bạn không có quyền truy cập trang này.");
    }
    
    // Luôn redirect về trang phù hợp với role khi không có quyền
    // Điều này đảm bảo user không bao giờ thấy màn hình trắng
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
