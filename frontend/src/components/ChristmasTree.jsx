import React from "react";
import { useLocation } from "react-router-dom";

/**
 * Component hiển thị cây thông Noel
 * Chỉ hiển thị ở trang Home và TestList
 */
export default function ChristmasTree() {
  const location = useLocation();
  const pathname = location.pathname;

  // Chỉ hiển thị ở trang Home và TestList
  const shouldShow = pathname === "/" || pathname === "/test-list" || pathname === "/practice-lr" || pathname === "/practice-sw";

  if (!shouldShow) {
    return null;
  }

  // CSS animation cho hiệu ứng đung đưa
  const swingAnimation = {
    animation: "swing 3s ease-in-out infinite",
    transformOrigin: "bottom center",
  };

  return (
    <>
      <style>
        {`
          @keyframes swing {
            0%, 100% {
              transform: rotate(-2deg);
            }
            50% {
              transform: rotate(2deg);
            }
          }
        `}
      </style>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          zIndex: 1000,
          pointerEvents: "none", // Không chặn các sự kiện click
        }}
      >
        <img
          src="/xmas-tree-1.png"
          alt="Christmas Tree"
          style={{
            width: "200px", // Có thể điều chỉnh kích thước
            height: "auto",
            maxWidth: "30vw", // Responsive: không quá 30% chiều rộng màn hình
            ...swingAnimation,
          }}
        />
      </div>
    </>
  );
}

