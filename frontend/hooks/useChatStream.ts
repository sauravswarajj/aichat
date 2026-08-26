"use client";

import { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services/chat.service";
import { AgentMessage, AgentRole, WorkflowEvent, WorkflowRequest, WorkflowStatus } from "@/types/api.types";
import { THREADS_QUERY_KEY, threadDetailQueryKey } from "./useThreads";

interface UseChatStreamReturn {
  status: WorkflowStatus;
  isStreaming: boolean;
  activeRole: AgentRole | null;
  activeRound: number;
  messages: AgentMessage[];
  finalResult: string | null;
  error: string | null;
  currentThreadId: string | null;
  startWorkflow: (request: WorkflowRequest) => Promise<string | undefined>;
  cancelWorkflow: () => void;
  resetWorkflow: () => void;
}

export function useChatStream(): UseChatStreamReturn {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<WorkflowStatus>("idle");
  const [activeRole, setActiveRole] = useState<AgentRole | null>(null);
  const [activeRound, setActiveRound] = useState<number>(0);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [finalResult, setFinalResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelWorkflow = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus("failed");
    setActiveRole(null);
    setError("Collaboration was cancelled by user.");
  }, []);

  const resetWorkflow = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus("idle");
    setActiveRole(null);
    setActiveRound(0);
    setMessages([]);
    setFinalResult(null);
    setError(null);
  }, []);

  const startWorkflow = useCallback(
    async (request: WorkflowRequest): Promise<string | undefined> => {
      // Reset state for new run
      setStatus("running");
      setError(null);
      setFinalResult(null);
      setMessages([]);
      setActiveRole(null);
      setActiveRound(0);

      let targetThreadId = request.threadId;
      if (targetThreadId) {
        setCurrentThreadId(targetThreadId);
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await chatService.streamWorkflow(
          request,
          (event: WorkflowEvent) => {
            switch (event.type) {
              case "thread_info": {
                const data = event.data as { threadId: string };
                if (data.threadId) {
                  targetThreadId = data.threadId;
                  setCurrentThreadId(data.threadId);
                  queryClient.invalidateQueries({ queryKey: THREADS_QUERY_KEY });
                }
                break;
              }
              case "workflow_started": {
                setStatus("running");
                break;
              }
              case "agent_started": {
                const data = event.data as { role: AgentRole; round: number };
                setActiveRole(data.role);
                setActiveRound(data.round);
                break;
              }
              case "agent_response": {
                const newMsg = event.data as AgentMessage;
                setMessages((prev) => {
                  // If message already exists for this round/role, replace; else append
                  const existsIdx = prev.findIndex(
                    (m) => m.round === newMsg.round && m.role === newMsg.role
                  );
                  if (existsIdx >= 0) {
                    const updated = [...prev];
                    updated[existsIdx] = newMsg;
                    return updated;
                  }
                  return [...prev, newMsg];
                });
                break;
              }
              case "agent_completed": {
                // Role completed its turn
                break;
              }
              case "agent_error": {
                const data = event.data as { role: AgentRole; round: number; error: string };
                setError(`Agent ${data.role} error: ${data.error}`);
                break;
              }
              case "final_result": {
                const data = event.data as { content: string };
                setFinalResult(data.content);
                break;
              }
              case "workflow_completed": {
                setStatus("completed");
                setActiveRole(null);
                // Refresh threads query and target thread detail
                queryClient.invalidateQueries({ queryKey: THREADS_QUERY_KEY });
                if (targetThreadId) {
                  queryClient.invalidateQueries({ queryKey: threadDetailQueryKey(targetThreadId) });
                }
                break;
              }
              case "workflow_error": {
                const data = event.data as { error: string };
                setStatus("failed");
                setError(data.error || "Workflow failed");
                setActiveRole(null);
                break;
              }
            }
          },
          controller.signal
        );

        return targetThreadId;
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setStatus("failed");
          setError(err.message || "An unexpected error occurred during execution.");
        }
      } finally {
        abortControllerRef.current = null;
      }

      return targetThreadId;
    },
    [queryClient]
  );

  return {
    status,
    isStreaming: status === "running",
    activeRole,
    activeRound,
    messages,
    finalResult,
    error,
    currentThreadId,
    startWorkflow,
    cancelWorkflow,
    resetWorkflow,
  };
}
