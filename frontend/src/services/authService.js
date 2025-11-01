import { api, tokenStore } from "./apiClient";

const unwrap = (res) => res?.data?.data ?? res?.data;

export async function login({ email, password }) {
  const res = await api.post("api/Auth/login", { email, password });
  const data = unwrap(res);

  if (data?.token) tokenStore.access = data.token;
  if (data?.refreshToken) tokenStore.refresh = data.refreshToken;
  if (data?.userId) {
    "user",
      JSON.stringify({
        id: data.userId,
        fullname: data.fullName,
        email: data.email,
      });
  }
  return data;
}

export function logout() {
  tokenStore.clear();
  localStorage.removeItem("user");
}

export async function register({ fullName, email, password }) {
  const payload = { fullName, email, password };
  const res = await api.post("/api/Auth/register", payload);
  return unwrap(res);
}

export async function verifyRegisterOtp({
  email,
  otpCode,
  fullName,
  password,
}) {
  const payload = { email, otpCode, fullName, password };
  const res = await api.post("/api/Auth/verify-register", payload);
  return unwrap(res);
}

export async function sendOTP({ email }) {
  return await api.post("/api/Auth/request-reset-password", { email });
}

export async function verifyResetOtp({ email, otpCode }) {
  return await api.post("/api/Auth/verify-reset-otp", { email, otpCode });
}

export async function resetPasswordConfirm({
  email,
  otpCode,
  newPassword,
  confirmNewPassword,
}) {
  return api.post("/api/Auth/reset-password", {
    email,
    otpCode,
    newPassword,
    confirmNewPassword,
  });
}

export async function loginWithGoogle(code) {
  const res = await api.get(`/api/Auth/signin-google?code=${code}`);
  const data = unwrap(res);

  if (data?.token) tokenStore.access = data.token;
  if (data?.refreshToken) tokenStore.refresh = data.refreshToken;

  if (data?.userId) {
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.userId,
        fullname: data.fullName,
        email: data.email,
      })
    );
  }

  return data;
}

export async function getProfile() {
  const res = await api.get("/api/Auth/profile");
  return unwrap(res);
}

export async function changePassword({
  oldPassword,
  newPassword,
  confirmNewPassword,
}) {
  const res = await api.post("/api/Auth/change-password", {
    oldPassword: oldPassword,
    newPassword: newPassword,
    confirmNewPassword: confirmNewPassword,
  });
  return unwrap(res);
}
