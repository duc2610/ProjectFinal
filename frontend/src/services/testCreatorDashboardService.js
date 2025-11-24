import { api } from "./apiClient";

const unwrap = (res) => res?.data?.data ?? res?.data;

/**
 * Lấy thống kê tổng quan cho Test Creator Dashboard
 * @returns {Promise<Object>} Thống kê tổng số bài thi, câu hỏi, kết quả thi, điểm trung bình
 */
export async function getDashboardStatistics() {
  const res = await api.get("/api/test-creator/dashboard/statistics");
  return unwrap(res);
}

/**
 * Lấy hiệu suất bài thi theo ngày
 * @param {number} days - Số ngày cần lấy thống kê (mặc định 7 ngày)
 * @returns {Promise<Array>} Danh sách hiệu suất bài thi theo từng ngày
 */
export async function getTestPerformanceByDay(days = 7) {
  const res = await api.get("/api/test-creator/dashboard/performance/daily", {
    params: { days },
  });
  return unwrap(res);
}

/**
 * Lấy danh sách top bài thi hiệu suất cao
 * @param {number} limit - Số lượng bài thi cần lấy (mặc định 5)
 * @returns {Promise<Array>} Danh sách top bài thi với số lượt hoàn thành và điểm trung bình cao nhất
 */
export async function getTopPerformingTests(limit = 5) {
  const res = await api.get("/api/test-creator/dashboard/tests/top", {
    params: { limit },
  });
  return unwrap(res);
}

/**
 * Lấy danh sách hoạt động gần đây
 * @param {number} limit - Số lượng hoạt động cần lấy (mặc định 20)
 * @returns {Promise<Array>} Danh sách các hoạt động gần đây
 */
export async function getRecentActivities(limit = 20) {
  const res = await api.get("/api/test-creator/dashboard/activities/recent", {
    params: { limit },
  });
  return unwrap(res);
}

