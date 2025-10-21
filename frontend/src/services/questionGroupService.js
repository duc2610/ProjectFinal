import { api } from "./apiClient";

export async function createQuestionGroup(formData) {
  const res = await api.post(`/api/question-group`, formData);
  return res?.data?.data ?? res?.data;
}

export async function getQuestionGroupById(id) {
  const res = await api.get(`/api/question-group/${id}`);
  return res?.data?.data ?? res?.data;
}

export async function updateQuestionGroup(id, formData) {
  const res = await api.put(`/api/question-group/${id}`, formData);
  return res?.data?.data ?? res?.data;
}

export async function deleteQuestionGroup(id) {
  const res = await api.delete(`/api/question/${id}`, {
    params: { isGroupQuestion: true },
  });
  return res?.data?.data ?? res?.data;
}

export async function restoreQuestionGroup(id) {
  const res = await api.put(`/api/question/restore/${id}`, null, {
    params: { isGroupQuestion: true },
  });
  return res?.data?.data ?? res?.data;
}
