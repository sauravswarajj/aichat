"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Sparkles,
  AlertCircle,
  RotateCcw,
  StopCircle,
  ArrowRight,
  ImagePlus,
  X,
  FileImage,
} from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Task configuration state
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType>("coding");
  const [taskPrompt, setTaskPrompt] = useState("");
  const [pipelineAgents, setPipelineAgents] = useState<AgentConfig[]>(DEFAULT_PIPELINE);

  // Multimodal Vision Image State
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPEG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size should be under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setAttachedImage(dataUrl);
      setImageFileName(file.name);
      // If user uploads an image and is on coding/general, suggest image_prompt or prompt_engineering
      if (selectedTaskType === "coding") {
        setSelectedTaskType("prompt_engineering");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
    setImageFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!taskPrompt.trim() || isStreaming) return;

    await startWorkflow({
      task: taskPrompt.trim(),
      taskType: selectedTaskType,
      agents: pipelineAgents,
      image: attachedImage || undefined,
    });
  };

  const handleViewInFullThread = () => {
    if (currentThreadId) {
      router.push(`/chat/${currentThreadId}`);
    }
  };

  const completedRoles = messages.map((m) => m.role);

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1 flex flex-col min-w-0">
      {/* Welcome / Header */}
      {status === "idle" && (
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <span>Jaishwal AI Collaboration Studio</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              Vision v1.1
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Define your task or attach a reference photo. Specialized AI agents draft, critique, optimize, and finalize the result.
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

            {/* Task Prompt + Image Preview if attached */}
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed font-mono whitespace-pre-wrap bg-[var(--bg-tertiary)]/50 p-3 rounded-lg border border-[var(--border-subtle)]">
                {taskPrompt}
              </p>

              {attachedImage && (
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-indigo-500/30 w-fit max-w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachedImage}
                    alt="Reference"
                    className="w-16 h-16 object-cover rounded-md border border-[var(--border-subtle)] shrink-0 shadow-sm"
                  />
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-medium text-[var(--text-primary)] block truncate">
                      {imageFileName || "Attached Reference Photo"}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Analyzed by Vision Creator
                    </span>
                  </div>
                </div>
              )}
            </div>
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
        <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col min-w-0">
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

          {/* 3. Task Prompt Input Box with Vision Image Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-xl bg-[var(--bg-secondary)] border transition-all p-4 shadow-sm space-y-3 ${
              isDragging
                ? "border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-500/5"
                : "border-[var(--border-subtle)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <label
                htmlFor="task-prompt-input"
                className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] font-mono"
              >
                Describe Your Task / Goal
              </label>
              <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
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
              placeholder="e.g. Inspect this reference photo and generate an ultra-realistic Midjourney v6 prompt replicating its lighting, camera depth, and colors..."
              className="w-full rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] p-3.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y min-h-[120px]"
              required
            />

            {/* Attached Reference Image Thumbnail */}
            {attachedImage && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-elevated)] border border-indigo-500/30 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-3 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachedImage}
                    alt="Uploaded Reference"
                    className="w-12 h-12 object-cover rounded-md border border-[var(--border-subtle)] shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-[var(--text-primary)] block truncate">
                      {imageFileName || "Reference Image"}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      Ready for Gemini Vision Analysis
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remove attached image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quick Templates */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-[var(--text-muted)] mr-1">Quick ideas:</span>
              {[
                "Analyze reference photo & create cinematic prompt",
                "Reverse a linked list in TypeScript",
                "Design a system prompt for code refactoring",
                "Cinematic 16:9 Midjourney prompt for futuristic city",
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

            {/* Hidden File Input for Image Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Submit Bar with Image Attachment Button */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border transition-all ${
                    attachedImage
                      ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300"
                      : "bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                  }`}
                  title="Attach reference photo or portrait for AI Vision analysis"
                >
                  <ImagePlus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{attachedImage ? "Change Image" : "Attach Image"}</span>
                </button>

                <div className="text-xs text-[var(--text-muted)] hidden sm:flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{pipelineAgents.length} AI agents will collaborate</span>
                </div>
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
