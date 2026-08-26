import { STORAGE_KEYS } from "@/lib/constants";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
}

export function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  skipAuth?: boolean;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, skipAuth = false, headers = {}, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const token = getAuthToken();

  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...customConfig,
    headers: reqHeaders,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    let errorData: unknown;

    try {
      errorData = await response.json();
      if (errorData && typeof errorData === "object" && "error" in errorData) {
        errorMessage = String((errorData as { error: string }).error);
      } else if (errorData && typeof errorData === "object" && "message" in errorData) {
        errorMessage = String((errorData as { message: string }).message);
      }
    } catch {
      // Body not JSON
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  // Handle empty responses (like 204)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
