import { apiClient, removeAuthToken, setAuthToken } from "./api";
import { AuthMeResponse, LoginRequest, LoginResponse } from "@/types/api.types";

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const res = await apiClient<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  async me(): Promise<AuthMeResponse> {
    return apiClient<AuthMeResponse>("/auth/me", {
      method: "GET",
    });
  },

  async logout(): Promise<{ message: string }> {
    try {
      return await apiClient<{ message: string }>("/auth/logout", {
        method: "POST",
      });
    } finally {
      removeAuthToken();
    }
  },

  async logoutAll(): Promise<{ message: string }> {
    try {
      return await apiClient<{ message: string }>("/auth/logout-all", {
        method: "POST",
      });
    } finally {
      removeAuthToken();
    }
  },
};
