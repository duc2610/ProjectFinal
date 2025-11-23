import { api } from "./apiClient";

/**
 * Lấy danh sách báo cáo câu hỏi của user hiện tại
 * @param {number} page - Số trang (mặc định: 1)
 * @param {number} pageSize - Số bản ghi mỗi trang (mặc định: 20)
 * @returns {Promise} Response từ API
 */
export async function getMyQuestionReports(page = 1, pageSize = 20) {
  const params = { page, pageSize };
  const res = await api.get("/api/question-reports/my-reports", { params });
  // Response structure: { statusCode, message, data: { data: [], pageNumber, pageSize, totalRecords, ... }, success }
  return res?.data?.data ?? res?.data ?? res;
}

