import { api } from "./apiClient";

export async function getQuestionTypesByPart(partId) {
  const res = await api.get(`/api/QuestionTypes/by-part/${partId}`);
  return res?.data?.data ?? res?.data;
}
