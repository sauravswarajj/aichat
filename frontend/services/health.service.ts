import { apiClient } from "./api";
import { HealthResponse } from "@/types/api.types";

export const healthService = {
  async check(): Promise<HealthResponse> {
    return apiClient<HealthResponse>("/health", {
      method: "GET",
      skipAuth: true,
    });
  },
};
