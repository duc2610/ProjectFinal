import { api } from "./apiClient";

export async function createQuestion(formData) {
  const res = await api.post("/api/question", formData);
  return res?.data?.data ?? res?.data;
}

export async function getQuestions(params) {
  const res = await api.get("/api/questions", { params });
  return res?.data?.data ?? res?.data;
}

export async function deleteQuestion(id) {
  const res = await api.delete(`/api/question/${id}`);
  return res?.data?.data ?? res?.data;
}

export async function getQuestionById(id) {
  const res = await api.get(`/api/question/${id}`);
  return res?.data?.data ?? res?.data;
}

export async function updateQuestion(id, formData) {
  const res = await api.put(`/api/question/${id}`, formData);
  return res?.data?.data ?? res?.data;
}
