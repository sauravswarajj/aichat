"use client";

import React, { useState, use, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  User,
  Sparkles,
  MessageSquare,
  AlertCircle,
  ImagePlus,
  X,
} from "lucide-react";
import { useThreadQuery } from "@/hooks/useThreads";
import { useChatStream } from "@/hooks/useChatStream";
import { DEFAULT_PIPELINE } from "@/lib/constants";
import { AgentTimeline } from "@/features/chat/AgentTimeline";
import { AgentMessageCard } from "@/features/chat/AgentMessageCard";
import { FinalResultCard } from "@/features/chat/FinalResultCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import { AgentConfig, TaskType } from "@/types/api.types";

interface ChatThreadPageProps {
  params: Promise<{ threadId: string }>;
}

export default function ChatThreadPage({ params }: ChatThreadPageProps) {
  const { threadId } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: thread, isLoading, isError, error: fetchError, refetch } = useThreadQuery(threadId);

  const [followUpPrompt, setFollowUpPrompt] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("coding");
  const [pipelineAgents, setPipelineAgents] = useState<AgentConfig[]>(DEFAULT_PIPELINE);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const {
    status: streamStatus,
    isStreaming,
    activeRole,
    messages: liveMessages,
    finalResult: liveFinalResult,
    error: streamError,
    startWorkflow,
    cancelWorkflow,
  } = useChatStream();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [thread?.turns, liveMessages, liveFinalResult]);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be under 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setAttachedImage(e.target?.result as string);
      setImageFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSendFollowUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!followUpPrompt.trim() || isStreaming) return;

    const taskText = followUpPrompt.trim();
    const imageToSend = attachedImage;
    setFollowUpPrompt("");
    setAttachedImage(null);
    setImageFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    await startWorkflow({
      task: taskText,
      taskType: taskType,
      agents: pipelineAgents,
      image: imageToSend || undefined,
      threadId: threadId,
    });

    refetch();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !thread) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Conversation Not Found</h2>
        <p className="text-xs text-[var(--text-secondary)]">
          {fetchError ? (fetchError as Error).message : "This chat thread may have been deleted."}
        </p>
        <Button variant="primary" onClick={() => router.push("/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Thread Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-8 max-w-4xl mx-auto w-full">
        {/* Thread Header */}
        <div className="border-b border-[var(--border-subtle)] pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>{thread.title || "Untitled Conversation"}</span>
            </h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Created {formatDate(thread.createdAt)} • {thread.turns?.length || 0} turn(s)
            </p>
          </div>
        </div>

        {/* Previous Turns History */}
        {thread.turns?.map((turn, turnIdx) => (
          <div key={turn.id || turnIdx} className="space-y-6 pt-2">
            {/* Turn Marker */}
            <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
              <span>Turn 0{turnIdx + 1}</span>
              <div className="h-px bg-[var(--border-subtle)] flex-1" />
            </div>

            {/* User Task Card */}
            <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span>User Task</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] uppercase">
                  {turn.taskType?.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-primary)] font-mono whitespace-pre-wrap pl-8">
                {turn.task}
              </p>

              {/* Render Image Thumbnail if attached in this turn */}
              {turn.image && (
                <div className="pl-8 pt-2">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] w-fit">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={turn.image}
                      alt="Reference Photo"
                      className="w-14 h-14 object-cover rounded-md border border-[var(--border-subtle)] shadow-sm"
                    />
                    <span className="text-xs text-[var(--text-secondary)] font-mono">
                      Reference Photo
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Agent Messages */}
            <div className="space-y-3 pl-2 sm:pl-4">
              {turn.messages?.map((msg, msgIdx) => (
                <AgentMessageCard key={`${msg.role}-${msgIdx}`} message={msg} />
              ))}
            </div>

            {/* Turn Final Result */}
            {turn.finalResult && (
              <div className="pl-2 sm:pl-4">
                <FinalResultCard content={turn.finalResult} />
              </div>
            )}
          </div>
        ))}

        {/* Live Streaming Turn (if active in this thread) */}
        {streamStatus !== "idle" && (
          <div className="space-y-6 pt-4 border-t border-indigo-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
                <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Executing Multi-AI Collaboration...</span>
              </div>
              {isStreaming && (
                <Button variant="danger" size="sm" onClick={cancelWorkflow} className="text-xs py-1 h-7">
                  Cancel
                </Button>
              )}
            </div>

            <AgentTimeline
              agents={pipelineAgents}
              activeRole={activeRole}
              status={streamStatus}
              completedRoles={liveMessages.map((m) => m.role)}
            />

            {streamError && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
                {streamError}
              </div>
            )}

            <div className="space-y-3">
              {liveMessages.map((msg, i) => (
                <AgentMessageCard key={`live-${msg.role}-${i}`} message={msg} isStreaming={isStreaming && activeRole === msg.role} />
              ))}
            </div>

            {liveFinalResult && <FinalResultCard content={liveFinalResult} />}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Sticky Bottom Input Bar */}
      <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/90 backdrop-blur-md p-4 shrink-0">
        <form onSubmit={handleSendFollowUp} className="max-w-4xl mx-auto space-y-2">
          {/* Image Preview if attached */}
          {attachedImage && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-elevated)] border border-indigo-500/30 animate-in fade-in">
              <div className="flex items-center gap-2 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={attachedImage}
                  alt="Attachment"
                  className="w-10 h-10 object-cover rounded border border-[var(--border-subtle)]"
                />
                <span className="text-xs text-[var(--text-primary)] truncate">
                  {imageFileName || "Attached Image"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAttachedImage(null);
                  setImageFileName(null);
                }}
                className="p-1 text-[var(--text-muted)] hover:text-rose-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="relative flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file);
              }}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-indigo-400 hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] transition-colors shrink-0"
              title="Attach Reference Image"
            >
              <ImagePlus className="w-4 h-4" />
            </button>

            <textarea
              rows={2}
              value={followUpPrompt}
              onChange={(e) => setFollowUpPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSendFollowUp();
                }
              }}
              placeholder="Continue conversation with earlier context or attached image..."
              className="flex-1 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] p-3 pr-20 text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none"
              disabled={isStreaming}
            />

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!followUpPrompt.trim() || isStreaming}
              className="absolute right-2 bottom-2.5 shadow-md shadow-indigo-500/20 text-xs px-3"
              rightIcon={<Send className="w-3.5 h-3.5" />}
            >
              Send
            </Button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>Agents will receive prior conversation turns & images as context.</span>
            <span>Ctrl+Enter to submit</span>
          </div>
        </form>
      </div>
    </div>
  );
}
