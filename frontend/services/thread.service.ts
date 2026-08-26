import { apiClient } from "./api";
import { Thread, ThreadSummary } from "@/types/api.types";

export const threadService = {
  async list(): Promise<ThreadSummary[]> {
    return apiClient<ThreadSummary[]>("/threads", {
      method: "GET",
    });
  },

  async get(id: string): Promise<Thread> {
    return apiClient<Thread>(`/threads/${id}`, {
      method: "GET",
    });
  },

  async create(title?: string): Promise<Thread> {
    return apiClient<Thread>("/threads", {
      method: "POST",
      body: JSON.stringify(title ? { title } : {}),
    });
  },

  async rename(id: string, title: string): Promise<Thread> {
    return apiClient<Thread>(`/threads/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    });
  },

  async remove(id: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/threads/${id}`, {
      method: "DELETE",
    });
  },
};
