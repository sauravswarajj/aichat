import { getAuthToken } from "./api";
import { WorkflowEvent, WorkflowEventType, WorkflowRequest, WorkflowState } from "@/types/api.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const chatService = {
  async runWorkflowJSON(request: WorkflowRequest): Promise<WorkflowState & { threadId: string }> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let message = "Workflow failed";
      try {
        const err = await response.json();
        message = err.error || err.message || message;
      } catch {}
      throw new Error(message);
    }

    return response.json();
  },

  /**
   * Streams a workflow using Server-Sent Events over HTTP POST.
   * Supports early abort via AbortSignal.
   */
  async streamWorkflow(
    request: WorkflowRequest,
    onEvent: (event: WorkflowEvent) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!response.ok) {
      let message = `Workflow stream failed (${response.status})`;
      try {
        const err = await response.json();
        message = err.error || err.message || message;
      } catch {}
      throw new Error(message);
    }

    if (!response.body) {
      throw new Error("No response body received for SSE stream");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE messages are delimited by double newlines (\n\n)
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          if (!part.trim()) continue;

          let eventType: WorkflowEventType = "agent_response";
          let dataStr = "";

          const lines = part.split("\n");
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.slice(7).trim() as WorkflowEventType;
            } else if (line.startsWith("data: ")) {
              dataStr = line.slice(6).trim();
            }
          }

          if (dataStr) {
            try {
              const parsedData = JSON.parse(dataStr);
              onEvent({ type: eventType, data: parsedData });
            } catch (err) {
              console.warn("Failed to parse SSE data block:", dataStr, err);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
};
