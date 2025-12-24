import React from "react";
import { useLocation } from "react-router-dom";
import Snowfall from "react-snowfall";

/**
 * Component hiển thị hiệu ứng tuyết rơi
 * Tự động ẩn trên các trang admin và test-creator
 */
export default function SnowfallWrapper() {
  const location = useLocation();
  const pathname = location.pathname;

  // Kiểm tra nếu đang ở trang admin hoặc test-creator thì không hiển thị
  const isAdminOrCreatorPage =
    pathname.startsWith("/admin") || pathname.startsWith("/test-creator");

  // Nếu là trang admin/creator thì không hiển thị snowfall
  if (isAdminOrCreatorPage) {
    return null;
  }

  return (
    <Snowfall
      // Số lượng bông tuyết
      snowflakeCount={150}
      // Tốc độ rơi
      speed={[0.5, 3]}
      // Kích thước bông tuyết
      radius={[0.5, 3]}
      // Màu sắc (xanh nhạt để nổi bật trên nền trắng)
      color="#b3e5fc"
      // Độ trong suốt
      style={{
        position: "fixed",
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        pointerEvents: "none", // Không chặn các sự kiện click
      }}
    />
  );
}

