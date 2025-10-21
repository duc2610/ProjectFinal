import { api } from "./apiClient";

// Helpers
const SKILL_NAME = {
  1: "Speaking",
  2: "Writing",
  3: "Listening",
  4: "Reading",
};

// LIST (active)
export async function getQuestions(params = {}) {
  const res = await api.get("/api/questions", { params });
  return res?.data?.data ?? res?.data;
}

// LIST (deleted)
export async function getDeletedQuestions(params = {}) {
  const res = await api.get("/api/questions/deleted", { params });
  return res?.data?.data ?? res?.data;
}

// CREATE single
export async function createQuestion(formData) {
  const res = await api.post("/api/question", formData);
  return res?.data?.data ?? res?.data;
}

// DETAIL single
export async function getQuestionById(id) {
  const res = await api.get(`/api/question/${id}`);
  return res?.data?.data ?? res?.data;
}

// UPDATE single
export async function updateQuestion(id, formData) {
  const res = await api.put(`/api/question/${id}`, formData);
  return res?.data?.data ?? res?.data;
}

// DELETE (single/group): /api/question/{id}?isGroupQuestion=true|false
export async function deleteQuestion(id, isGroupQuestion = false) {
  const res = await api.delete(`/api/question/${id}`, {
    params: { isGroupQuestion },
  });
  return res?.data?.data ?? res?.data;
}

// RESTORE (single/group): /api/question/restore/{id}?isGroupQuestion=true|false
export async function restoreQuestion(id, isGroupQuestion = false) {
  const res = await api.put(`/api/question/restore/${id}`, null, {
    params: { isGroupQuestion },
  });
  return res?.data?.data ?? res?.data;
}

export function buildQuestionListParams({
  page,
  pageSize,
  partId,
  questionTypeId,
  skill,
  keyword,
  sortOrder,
} = {}) {
  const p = {};
  if (page) p.page = page;
  if (pageSize) p.pageSize = pageSize;
  if (partId != null) p.part = partId;
  if (questionTypeId != null) p.questionType = questionTypeId;
  if (skill != null) p.skill = SKILL_NAME[skill] || skill;
  if (keyword) p.keyWord = keyword;
  if (sortOrder) p.sortOrder = sortOrder;
  return p;
}
