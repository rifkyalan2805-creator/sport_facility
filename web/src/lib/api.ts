import axios, { AxiosError, AxiosRequestConfig } from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

const ACCESS_KEY = "sh_access";
const REFRESH_KEY = "sh_refresh";

// Penyimpanan token sederhana (localStorage). Aman terhadap SSR (cek window).
export const tokenStore = {
  get access() {
    return typeof window !== "undefined" ? localStorage.getItem(ACCESS_KEY) : null;
  },
  get refresh() {
    return typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null;
  },
  set(access: string, refresh: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Lampirkan access token ke setiap request.
api.interceptors.request.use((config) => {
  const t = tokenStore.access;
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// Refresh token saat 401 — single-flight (request paralel berbagi 1 refresh).
let refreshing: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const refresh = tokenStore.refresh;
  if (!refresh) return null;
  try {
    const res = await axios.post(`${API_URL}/auth/refresh`, {
      refresh_token: refresh,
    });
    const { accessToken, refreshToken } = res.data.data;
    tokenStore.set(accessToken, refreshToken);
    return accessToken;
  } catch {
    tokenStore.clear();
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      tokenStore.refresh
    ) {
      original._retry = true;
      refreshing = refreshing ?? doRefresh();
      const newToken = await refreshing;
      refreshing = null;
      if (newToken) {
        original.headers = {
          ...original.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

// Helper unwrap respons backend berbentuk { success, data }.
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.get(url, config);
  return res.data.data as T;
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await api.post(url, body, config);
  return res.data.data as T;
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await api.patch(url, body, config);
  return res.data.data as T;
}
