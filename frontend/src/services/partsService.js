import { api } from "./apiClient";

export async function getPartsBySkill(skill) {
  const res = await api.get(`/api/Parts/by-skill/${skill}`);
  return res?.data?.data ?? res?.data;
}
