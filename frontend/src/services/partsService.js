import { api } from "./apiClient";

export async function getPartsBySkill(testSkill) {
  const res = await api.get(`/api/Parts/by-test-skill/${testSkill}`);
  return res?.data?.data ?? res?.data;
}
