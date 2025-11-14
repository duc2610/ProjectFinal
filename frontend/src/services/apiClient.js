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
});

api.interceptors.request.use((config) => {
  const isRefreshTokenRequest = config.url?.includes("/refresh-token") || 
                                config.url?.includes("refresh-token");
  
  if (!isRefreshTokenRequest) {
    const token = tokenStore.access;
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;
  if (isFormData) {
    if (config.headers) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
  } else {
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

// Flag to prevent infinite refresh loops
// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) return Promise.reject(error);

    const status = error.response?.status;
    if ((status === 401 || status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {

        const plainAxios = axios.create({
          baseURL: api.defaults.baseURL, 
        });

        const refreshTokenValue = tokenStore.refresh;
        if (!refreshTokenValue) {
          throw new Error("No refresh token available");
        }

        const refreshRes = await plainAxios.post("/api/Auth/refresh-token", {
          refreshToken: refreshTokenValue,
        });

        const data = refreshRes?.data?.data ?? refreshRes?.data;
        const newToken = data?.token || tokenStore.access;

        if (data?.token) tokenStore.access = data.token;
        if (data?.refreshToken) tokenStore.refresh = data.refreshToken;

        processQueue(null, newToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStore.clear();
        localStorage.removeItem("user");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
