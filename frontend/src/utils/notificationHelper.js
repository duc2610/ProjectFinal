import { notification } from "antd";

// Map để track các notification đã hiển thị
const shownNotifications = new Map();

/**
 * Hiển thị notification với cơ chế tránh hiển thị nhiều lần
 * @param {Object} config - Config cho notification
 * @param {string} config.key - Key duy nhất để track notification (bắt buộc)
 * @param {string} config.message - Tiêu đề notification
 * @param {string} config.description - Mô tả notification
 * @param {string} config.type - Loại notification: 'warning', 'error', 'success', 'info'
 * @param {number} config.duration - Thời gian hiển thị (mặc định: 4 giây)
 * @param {string} config.placement - Vị trí hiển thị (mặc định: 'topRight')
 */
export function showNotificationOnce(config) {
  const {
    key,
    message,
    description,
    type = "warning",
    duration = 4,
    placement = "topRight",
    ...rest
  } = config;

  if (!key) {
    // showNotificationOnce: key is required
    return;
  }

  // Kiểm tra xem notification này đã được hiển thị chưa
  if (shownNotifications.has(key)) {
    return;
  }

  // Đánh dấu đã hiển thị
  shownNotifications.set(key, true);

  // Hiển thị notification
  notification[type]({
    key,
    message,
    description,
    placement,
    duration,
    onClose: () => {
      // Xóa key khỏi map sau khi đóng
      shownNotifications.delete(key);
    },
    ...rest,
  });

  // Tự động xóa key sau duration + 1 giây để đảm bảo cleanup
  setTimeout(() => {
    shownNotifications.delete(key);
  }, (duration + 1) * 1000);
}

/**
 * Xóa một notification khỏi tracking
 * @param {string} key - Key của notification cần xóa
 */
export function clearNotificationTracking(key) {
  if (key) {
    shownNotifications.delete(key);
  } else {
    // Xóa tất cả nếu không có key
    shownNotifications.clear();
  }
}

/**
 * Reset tất cả tracking (dùng khi logout hoặc clear state)
 */
export function resetNotificationTracking() {
  shownNotifications.clear();
}

