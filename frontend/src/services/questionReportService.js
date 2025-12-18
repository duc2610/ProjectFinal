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
 * Báo cáo một câu hỏi (phía Examinee)
 * @param {number} testQuestionId - ID của test question (cha, áp dụng cho cả câu đơn và group)
 * @param {string} reportType - Loại báo cáo: "IncorrectAnswer", "Typo", "AudioIssue", "ImageIssue", "Unclear", "Other"
 * @param {string} description - Mô tả chi tiết
 * @param {number|null|undefined} subQuestionId - ID của sub-question trong group (questionId trong snapshot); chỉ bắt buộc với câu group
 * @returns {Promise} Response từ API
 */
export async function reportQuestion(testQuestionId, reportType, description, subQuestionId) {
  const payload = {
    testQuestionId,
    reportType,
    description,
  };

  // Backend yêu cầu SubQuestionId cho question group; gửi kèm khi có
  if (subQuestionId !== undefined && subQuestionId !== null) {
    payload.subQuestionId = subQuestionId;
  }

  const res = await api.post("/api/question-reports", payload);
  return res?.data?.data ?? res?.data ?? res;
}

/**
 * Lấy danh sách báo cáo của một test result
 * @param {number} testResultId - ID của test result
 * @returns {Promise<array>} Danh sách report của test result
 */
export async function getTestResultReports(testResultId) {
  const res = await api.get(`/api/question-reports/test-result/${testResultId}`);
  // Giả sử response trả về array hoặc object có data property
  const data = res?.data?.data ?? res?.data;
  return Array.isArray(data) ? data : data?.reports || [];
}

// ================== ADMIN / TEST CREATOR ==================

/**
 * Lấy danh sách report (dành cho Admin/TestCreator)
 * Backend: GET /api/question-reports
 * @param {{status?: number|null, testQuestionId?: number|null, page?: number, pageSize?: number}} filters
 */
export async function getQuestionReports(filters = {}) {
  const { status = null, testQuestionId = null, page = 1, pageSize = 20 } = filters;

  const params = {
    page,
    pageSize,
  };

  if (status !== null && status !== undefined && status !== "all") {
    params.status = status;
  }

  if (testQuestionId) {
    params.testQuestionId = testQuestionId;
  }

  const res = await api.get("/api/question-reports", { params });
  // PagedResponse: { data: [], pageNumber, pageSize, totalRecords, ... }
  return res?.data?.data ?? res?.data ?? res;
}

/**
 * Lấy chi tiết 1 report theo ID (Admin/TestCreator)
 * Backend: GET /api/question-reports/{reportId}
 */
export async function getReportById(reportId) {
  const res = await api.get(`/api/question-reports/${reportId}`);
  return res?.data?.data ?? res?.data ?? res;
}

/**
 * Review / cập nhật trạng thái một report
 * Backend: PUT /api/question-reports/{reportId}/review
 * @param {number} reportId
 * @param {{status: number, reviewerNotes?: string}} payload
 */
export async function reviewReport(reportId, payload) {
  const res = await api.put(`/api/question-reports/${reportId}/review`, payload);
  return res?.data?.data ?? res?.data ?? res;
}

/**
 * Cập nhật TestQuestion snapshot khi xử lý report
 * Backend: PUT /api/tests/test-questions/{testQuestionId}
 * Request body: multipart/form-data (UpdateTestQuestionDto)
 *
 * @param {number} testQuestionId
 * @param {{ 
 *   content?: string, 
 *   solution?: string, 
 *   alsoUpdateSourceInBank?: boolean, 
 *   audioFile?: File|null, 
 *   imageFile?: File|null, 
 *   answerOptions?: Array<{label: string, content: string, isCorrect: boolean}>,
 *   // For question group:
 *   passage?: string,
 *   questions?: Array<{
 *     questionId: number,
 *     content: string,
 *     explanation: string,
 *     options: Array<{label: string, content: string, isCorrect: boolean}>
 *   }>
 * }} data
 */
export async function updateTestQuestionFromReport(testQuestionId, data) {
  const {
    content,
    solution,
    alsoUpdateSourceInBank = false,
    audioFile = null,
    imageFile = null,
    answerOptions = [],
    // Question group fields
    passage,
    questions = [],
  } = data || {};

  const formData = new FormData();

  // Single question fields
  if (content != null) formData.append("Content", content);
  if (solution != null) formData.append("Solution", solution);
  
  // Question group fields
  if (passage != null) formData.append("Passage", passage);
  
  formData.append("AlsoUpdateSourceInBank", alsoUpdateSourceInBank ? "true" : "false");

  if (audioFile) {
    formData.append("Audio", audioFile);
  }

  if (imageFile) {
    formData.append("Image", imageFile);
  }

  // Single question answer options
  if (Array.isArray(answerOptions) && answerOptions.length > 0) {
    answerOptions.forEach((opt, index) => {
      if (opt.label != null) {
        formData.append(`AnswerOptions[${index}].Label`, opt.label);
      }
      if (opt.content != null) {
        formData.append(`AnswerOptions[${index}].Content`, opt.content);
      }
      if (typeof opt.isCorrect === "boolean") {
        formData.append(
          `AnswerOptions[${index}].IsCorrect`,
          opt.isCorrect ? "true" : "false"
        );
      }
    });
  }

  // Question group sub-questions
  if (Array.isArray(questions) && questions.length > 0) {
    questions.forEach((q, qIndex) => {
      if (q.questionId != null) {
        formData.append(`Questions[${qIndex}].QuestionId`, q.questionId.toString());
      }
      if (q.content != null) {
        formData.append(`Questions[${qIndex}].Content`, q.content);
      }
      if (q.explanation != null) {
        formData.append(`Questions[${qIndex}].Explanation`, q.explanation);
      }
      
      if (Array.isArray(q.options) && q.options.length > 0) {
        q.options.forEach((opt, optIndex) => {
          if (opt.label != null) {
            formData.append(`Questions[${qIndex}].Options[${optIndex}].Label`, opt.label);
          }
          if (opt.content != null) {
            formData.append(`Questions[${qIndex}].Options[${optIndex}].Content`, opt.content);
          }
          if (typeof opt.isCorrect === "boolean") {
            formData.append(
              `Questions[${qIndex}].Options[${optIndex}].IsCorrect`,
              opt.isCorrect ? "true" : "false"
            );
          }
        });
      }
    });
  }

  const res = await api.put(
    `/api/tests/test-questions/${testQuestionId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res?.data?.data ?? res?.data ?? res;
}

