"use client";

import React, { useState } from "react";
import { Check, Copy, Sparkles, CheckCircle2 } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { Button } from "@/components/ui/Button";

interface FinalResultCardProps {
  content: string;
}

export function FinalResultCard({ content }: FinalResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy final result:", err);
    }
  };

  const wordCount = content.trim().split(/\s+/).length;

  return (
    <div className="rounded-xl border-2 border-indigo-500/40 bg-gradient-to-b from-indigo-950/20 via-[var(--bg-secondary)] to-[var(--bg-secondary)] overflow-hidden shadow-xl shadow-indigo-500/5">
      {/* Header Banner */}
      <div className="px-5 py-3 bg-indigo-600/10 border-b border-indigo-500/20 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <span>Final Collaborative Deliverable</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono uppercase">
                Ready
              </span>
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Synthesized by the Finalizer from all agent contributions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--text-muted)] font-mono">
            {wordCount} words
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCopy}
            className="bg-indigo-600 hover:bg-indigo-500 text-xs shadow-sm"
            leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? "Copied!" : "Copy Result"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 sm:p-6 bg-[var(--bg-secondary)]">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
}
