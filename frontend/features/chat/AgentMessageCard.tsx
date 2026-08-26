"use client";

import React, { useState } from "react";
import { Copy, Check, Bot, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { AgentMessage } from "@/types/api.types";
import { AGENT_ROLES, PROVIDERS } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { formatTime, cn } from "@/lib/utils";

interface AgentMessageCardProps {
  message: AgentMessage;
  isStreaming?: boolean;
}

export function AgentMessageCard({ message, isStreaming = false }: AgentMessageCardProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const roleMeta = AGENT_ROLES[message.role];
  const providerMeta = PROVIDERS.find((p) => p.id === message.provider);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy agent response:", err);
    }
  };

  return (
    <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden shadow-sm transition-all duration-200 hover:border-[var(--border-strong)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-tertiary)]/50 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Role Badge */}
          <Badge variant="role" role={message.role}>
            {roleMeta?.label || message.role}
          </Badge>

          {/* Provider & Model Info */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-mono">
            <span className="font-medium text-[var(--text-primary)]">
              {providerMeta?.name || message.provider}
            </span>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="text-[var(--text-muted)]">{message.model}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {message.timestamp && (
            <span className="text-[10px] text-[var(--text-muted)] font-mono hidden sm:inline-block">
              {formatTime(message.timestamp)}
            </span>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            title="Copy agent contribution"
            aria-label="Copy agent contribution"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      {isExpanded && (
        <div className="p-4 sm:p-5">
          <MarkdownRenderer content={message.content} />
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-indigo-500 animate-pulse ml-1 align-middle" />
          )}
        </div>
      )}
    </div>
  );
}
