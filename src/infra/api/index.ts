import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { mmkvImpl } from "@/infra/adapters/storage/implementation/mmkv";
import { StorageKeys } from "@/infra/adapters/storage/types";
import type { HttpClientImpl, HttpResponse, RequestConfig } from "./types";

// auth.Payload has no `json:"..."` tags on the Go side, so it serializes as
// PascalCase — unlike the rest of this API. Mirrored as-is here on purpose.
interface StoredSession {
  AccessToken: string;
  RefreshToken: string;
}

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

const client: AxiosInstance = axios.create({ baseURL });

client.interceptors.request.use((config) => {
  const session = mmkvImpl.getItemSync<StoredSession>(StorageKeys.SESSION);
  if (session?.AccessToken) {
    config.headers.set("Authorization", `Bearer ${session.AccessToken}`);
  }
  return config;
});

let pendingRefresh: Promise<StoredSession | null> | null = null;

async function refreshSession(): Promise<StoredSession | null> {
  const session = mmkvImpl.getItemSync<StoredSession>(StorageKeys.SESSION);
  if (!session?.RefreshToken) {
    return null;
  }

  try {
    const { data } = await axios.post<StoredSession>(`${baseURL}/auth/refresh`, {
      refreshToken: session.RefreshToken,
    });
    const updated: StoredSession = {
      ...session,
      AccessToken: data.AccessToken,
      RefreshToken: data.RefreshToken,
    };
    mmkvImpl.setItem(StorageKeys.SESSION, updated);
    return updated;
  } catch {
    mmkvImpl.removeItem(StorageKeys.SESSION);
    return null;
  }
}

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const isRefreshCall = originalRequest?.url?.includes("/auth/refresh");

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isRefreshCall
    ) {
      throw error;
    }

    originalRequest._retry = true;
    pendingRefresh = pendingRefresh ?? refreshSession();
    const refreshed = await pendingRefresh;
    pendingRefresh = null;

    if (!refreshed) {
      throw error;
    }

    originalRequest.headers.set("Authorization", `Bearer ${refreshed.AccessToken}`);
    return client(originalRequest);
  },
);

async function get<T>(url: string, config?: RequestConfig): Promise<HttpResponse<T>> {
  const res = await client.get<T>(url, config);
  return { data: res.data, status: res.status };
}

async function post<T>(
  url: string,
  data?: unknown,
  config?: RequestConfig,
): Promise<HttpResponse<T>> {
  const res = await client.post<T>(url, data, config);
  return { data: res.data, status: res.status };
}

async function patch<T>(
  url: string,
  data?: unknown,
  config?: RequestConfig,
): Promise<HttpResponse<T>> {
  const res = await client.patch<T>(url, data, config);
  return { data: res.data, status: res.status };
}

async function deleteFn<T>(url: string, config?: RequestConfig): Promise<HttpResponse<T>> {
  const res = await client.delete<T>(url, config);
  return { data: res.data, status: res.status };
}

export const axiosHttpClientImpl: HttpClientImpl = {
  get,
  post,
  patch,
  delete: deleteFn,
};
