import { useAuthContext } from "@app/providers/AuthProvider";

export function useAuth() {
  const ctx = useAuthContext();
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
