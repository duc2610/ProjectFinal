import { api } from "./apiClient";

const unwrap = (res) => res?.data?.data ?? res?.data;

/**
 * Lấy thống kê tổng quan cho Admin Dashboard
 * @returns {Promise<Object>} Thống kê tổng số người dùng, bài thi, câu hỏi, kết quả thi
 */
export async function getDashboardStatistics() {
  const res = await api.get("/api/admin/dashboard/statistics");
  return unwrap(res);
}

/**
 * Lấy thống kê người dùng theo tháng
 * @param {number} months - Số tháng cần lấy thống kê (mặc định 12 tháng)
 * @returns {Promise<Array>} Danh sách thống kê người dùng theo từng tháng
 */
export async function getUserStatisticsByMonth(months = 12) {
  const res = await api.get("/api/admin/dashboard/users/monthly", {
    params: { months },
  });
  return unwrap(res);
}

/**
 * Lấy thống kê số lượng bài thi hoàn thành theo ngày
 * @param {number} days - Số ngày cần lấy thống kê (mặc định 7 ngày)
 * @returns {Promise<Array>} Danh sách thống kê bài thi hoàn thành theo từng ngày
 */
export async function getTestCompletionsByDay(days = 7) {
  const res = await api.get("/api/admin/dashboard/tests/completions", {
    params: { days },
  });
  return unwrap(res);
}

/**
 * Lấy danh sách hoạt động gần đây
 * @param {number} limit - Số lượng hoạt động cần lấy (mặc định 20)
 * @returns {Promise<Array>} Danh sách các hoạt động gần đây
 */
export async function getRecentActivities(limit = 20) {
  const res = await api.get("/api/admin/dashboard/activities/recent", {
    params: { limit },
  });
  return unwrap(res);
}

