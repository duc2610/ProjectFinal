import React from "react";
import { useLocation } from "react-router-dom";
import styles from "./ChristmasDecorations.module.css";

/**
 * Component hiển thị trang trí Giáng sinh (ông già Noel và cây thông)
 * Chỉ hiển thị ở trang Home và các trang list test
 */
export default function ChristmasDecorations() {
  const location = useLocation();
  const pathname = location.pathname;

  // Các trang được phép hiển thị trang trí
  const allowedPages = [
    "/", // Home
    "/test-list",
    "/practice-lr",
    "/practice-sw",
  ];

  // Kiểm tra nếu không phải trang được phép thì không hiển thị
  if (!allowedPages.includes(pathname)) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Cây thông Noel - bên trái dưới cùng */}
      <div className={styles.christmasTree}>
        <div className={styles.tree}>
          {/* Thân cây */}
          <div className={styles.trunk}></div>
          {/* Tầng 1 */}
          <div className={styles.branch1}></div>
          {/* Tầng 2 */}
          <div className={styles.branch2}></div>
          {/* Tầng 3 */}
          <div className={styles.branch3}></div>
          {/* Ngôi sao trên đỉnh */}
          <div className={styles.star}>⭐</div>
          {/* Quả bóng trang trí */}
          <div className={styles.ornament1}></div>
          <div className={styles.ornament2}></div>
          <div className={styles.ornament3}></div>
        </div>
      </div>

      {/* Ông già Noel - bên phải dưới cùng */}
      <div className={styles.santa}>
        <div className={styles.santaBody}>
          {/* Đầu */}
          <div className={styles.santaHead}>
            <div className={styles.santaFace}>
              <div className={styles.santaEye}></div>
              <div className={styles.santaEye}></div>
              <div className={styles.santaNose}></div>
              <div className={styles.santaBeard}></div>
            </div>
            <div className={styles.santaHat}>
              <div className={styles.hatPom}></div>
            </div>
          </div>
          {/* Thân */}
          <div className={styles.santaTorso}>
            <div className={styles.santaBelt}></div>
          </div>
          {/* Túi quà */}
          <div className={styles.santaBag}></div>
        </div>
      </div>
    </div>
  );
}

