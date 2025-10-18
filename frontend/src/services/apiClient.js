import axios from "axios";
import env from "@config/env";

const ACCESS_KEY = "tg_access_token";
const REFRESH_KEY = "tg_refresh_token";

export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS_KEY);
  },
  set access(v) {
    v
      ? localStorage.setItem(ACCESS_KEY, v)
      : localStorage.removeItem(ACCESS_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  set refresh(v) {
    v
      ? localStorage.setItem(REFRESH_KEY, v)
      : localStorage.removeItem(REFRESH_KEY);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export const api = axios.create({
  baseURL: env.API_BASE_URL,
  // ❌ TUYỆT ĐỐI KHÔNG đặt Content-Type mặc định ở đây
  // headers: { "Content-Type": "application/json" },  // <- gỡ bỏ
});

// Request interceptor
api.interceptors.request.use((config) => {
  // attach token
  const token = tokenStore.access;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Nếu payload là FormData -> xoá mọi Content-Type để browser tự thêm boundary
  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;
  if (isFormData) {
    if (config.headers) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
  } else {
    // payload JSON -> đặt Content-Type nếu chưa có
    if (
      config.headers &&
      !config.headers["Content-Type"] &&
      !config.headers["content-type"]
    ) {
      config.headers["Content-Type"] = "application/json";
    }
  }
  return config;
});
