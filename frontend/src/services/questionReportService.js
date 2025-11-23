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

/**
 * Báo cáo một câu hỏi
 * @param {number} testQuestionId - ID của test question
 * @param {string} reportType - Loại báo cáo: "IncorrectAnswer", "Typo", "AudioIssue", "ImageIssue", "Unclear", "Other"
 * @param {string} description - Mô tả chi tiết
 * @returns {Promise} Response từ API
 */
export async function reportQuestion(testQuestionId, reportType, description) {
  const payload = {
    testQuestionId,
    reportType,
    description,
  };
  const res = await api.post("/api/question-reports", payload);
  return res?.data?.data ?? res?.data ?? res;
}

/**
 * Lấy danh sách báo cáo của một test result
 * @param {number} testResultId - ID của test result
 * @returns {Promise} Response từ API - array các reports
 */
export async function getTestResultReports(testResultId) {
  const res = await api.get(`/api/question-reports/test-result/${testResultId}`);
  // Giả sử response trả về array hoặc object có data property
  const data = res?.data?.data ?? res?.data;
  return Array.isArray(data) ? data : (data?.reports || []);
}

