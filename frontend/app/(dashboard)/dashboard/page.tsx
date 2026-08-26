"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Sparkles, AlertCircle, RotateCcw, StopCircle, ArrowRight } from "lucide-react";
import { AgentConfig, TaskType } from "@/types/api.types";
import { DEFAULT_PIPELINE, TASK_TYPES } from "@/lib/constants";
import { useChatStream } from "@/hooks/useChatStream";
import { TaskTypeSelector } from "@/features/dashboard/TaskTypeSelector";
import { PipelineConfigurator } from "@/features/agents/PipelineConfigurator";
import { AgentTimeline } from "@/features/chat/AgentTimeline";
import { AgentMessageCard } from "@/features/chat/AgentMessageCard";
import { FinalResultCard } from "@/features/chat/FinalResultCard";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const router = useRouter();

  // Task configuration state
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType>("coding");
  const [taskPrompt, setTaskPrompt] = useState("");
  const [pipelineAgents, setPipelineAgents] = useState<AgentConfig[]>(DEFAULT_PIPELINE);

  // Streaming Hook
  const {
    status,
    isStreaming,
    activeRole,
    messages,
    finalResult,
    error,
    currentThreadId,
    startWorkflow,
    cancelWorkflow,
    resetWorkflow,
  } = useChatStream();

  const handleTaskTypeChange = (type: TaskType) => {
    setSelectedTaskType(type);
    const taskConfig = TASK_TYPES.find((t) => t.type === type);
    if (taskConfig && !taskPrompt) {
      setTaskPrompt(taskConfig.defaultPrompt);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!taskPrompt.trim() || isStreaming) return;

    const threadId = await startWorkflow({
      task: taskPrompt.trim(),
      taskType: selectedTaskType,
      agents: pipelineAgents,
    });

    if (threadId) {
      // Thread created
    }
  };

  const handleViewInFullThread = () => {
    if (currentThreadId) {
      router.push(`/chat/${currentThreadId}`);
    }
  };

  const completedRoles = messages.map((m) => m.role);

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1 flex flex-col">
      {/* Welcome / Header */}
      {status === "idle" && (
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <span>Multi-AI Collaboration Studio</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              v1.0
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Define your task and let multiple specialized AI agents draft, critique, optimize, and finalize the result.
          </p>
        </div>
      )}

      {/* When Streaming or Completed: Show Live Workflow Execution */}
      {status !== "idle" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Active Task Prompt Summary */}
          <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] font-mono">
                Submitted Task ({selectedTaskType.replace("_", " ")})
              </span>
              <div className="flex items-center gap-2">
                {isStreaming && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={cancelWorkflow}
                    className="text-xs py-1 h-7"
                    leftIcon={<StopCircle className="w-3.5 h-3.5" />}
                  >
                    Cancel Run
                  </Button>
                )}
                {status === "completed" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={resetWorkflow}
                    className="text-xs py-1 h-7"
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    New Task
                  </Button>
                )}
                {currentThreadId && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleViewInFullThread}
                    className="text-xs py-1 h-7"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Open Thread
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed font-mono whitespace-pre-wrap bg-[var(--bg-tertiary)]/50 p-3 rounded-lg border border-[var(--border-subtle)]">
              {taskPrompt}
            </p>
          </div>

          {/* Real-time Collaboration Pipeline Status */}
          <AgentTimeline
            agents={pipelineAgents}
            activeRole={activeRole}
            status={status}
            completedRoles={completedRoles}
          />

          {/* Error Alert if any */}
          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 flex items-start gap-3 text-xs text-rose-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold">Execution Interrupted</div>
                <div className="leading-relaxed">{error}</div>
              </div>
            </div>
          )}

          {/* Live Agent Messages Stream */}
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <AgentMessageCard key={`${msg.role}-${i}`} message={msg} />
            ))}
          </div>

          {/* Final Deliverable Card */}
          {finalResult && <FinalResultCard content={finalResult} />}
        </div>
      )}

      {/* Task Creation Form (Shown when idle) */}
      {status === "idle" && (
        <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
          {/* 1. Task Domain Selector */}
          <TaskTypeSelector
            selectedType={selectedTaskType}
            onSelect={handleTaskTypeChange}
          />

          {/* 2. Pipeline Configurator */}
          <PipelineConfigurator
            agents={pipelineAgents}
            onChange={setPipelineAgents}
          />

          {/* 3. Task Prompt Input Box */}
          <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="task-prompt-input"
                className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] font-mono"
              >
                Describe Your Task / Goal
              </label>
              <span className="text-[11px] text-[var(--text-muted)]">
                Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] font-mono text-[10px]">Ctrl+Enter</kbd> to execute
              </span>
            </div>

            <textarea
              id="task-prompt-input"
              rows={4}
              value={taskPrompt}
              onChange={(e) => setTaskPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="e.g. Write a production-grade TypeScript caching wrapper for Redis with stampede protection..."
              className="w-full rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] p-3.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y min-h-[120px]"
              required
            />

            {/* Quick Templates */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-[var(--text-muted)] mr-1">Quick ideas:</span>
              {[
                "Reverse a linked list in TypeScript",
                "Design a system prompt for code refactoring",
                "Cinematic 16:9 Midjourney prompt for futuristic city",
                "Compare MongoDB Atlas vs PostgreSQL for real-time apps",
              ].map((template, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTaskPrompt(template)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)]"
                >
                  {template}
                </button>
              ))}
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
              <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{pipelineAgents.length} AI agents will collaborate</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={!taskPrompt.trim() || isStreaming}
                className="px-6 font-semibold shadow-md shadow-indigo-500/25"
                rightIcon={<Send className="w-4 h-4" />}
              >
                Start Multi-AI Workflow
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
