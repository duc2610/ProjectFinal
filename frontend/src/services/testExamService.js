import { api } from "./apiClient";

export async function startTest(testId, isSelectTime = false) {
  const url = `/api/tests/start?Id=${testId}&IsSelectTime=${isSelectTime}`;
  try {
    const res = await api.get(url);
    return res?.data?.data ?? res?.data;
  } catch (error) {
    throw error;
  }
}

// services/testExamService.js
export async function submitTest(payload) {
  const url = `/api/tests/submit/L&R`; // Đảm bảo backend có route này
  try {
    const res = await api.post(url, payload);
    return res?.data?.data ?? res?.data; // Trả về data
  } catch (error) {
    throw error;
  }
}
export async function getTestResultDetail(testResultId) {
  const url = `/api/tests/result/detail/${testResultId}`;
  try {
    const res = await api.get(url);
    return res?.data?.data ?? res?.data;
  } catch (error) {
    throw error;
  }
}

// Alias functions để tương thích với code cũ (deprecated - sẽ xóa sau)
export async function getTestResultDetailLR(testResultId) {
  return getTestResultDetail(testResultId);
}

export async function getTestResultDetailSW(testResultId) {
  return getTestResultDetail(testResultId);
}

// Submit Speaking & Writing với API assessment/bulk
export async function submitAssessmentBulk(payload) {
  const url = `/api/assessment/bulk`;
  try {
    const res = await api.post(url, payload);
    return res?.data?.data ?? res?.data;
  } catch (error) {
    throw error;
  }
}

// Lưu tiến độ làm bài (cho tất cả loại bài thi: L&R, Writing, Speaking)
export async function saveProgress(testResultId, answers) {
  const url = `/api/tests/save-progress`;
  try {
    const payload = {
      testResultId: testResultId,
      answers: answers, // Array of answer objects với format mới
    };
    const res = await api.post(url, payload);
    return res?.data?.data ?? res?.data;
  } catch (error) {
    throw error;
  }
}