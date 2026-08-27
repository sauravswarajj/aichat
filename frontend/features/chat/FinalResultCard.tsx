"use client";

import React, { useState, useMemo } from "react";
import { Check, Copy, Sparkles, Download, FileText, CheckCheck } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { Button } from "@/components/ui/Button";

interface FinalResultCardProps {
  content: string;
}

export function FinalResultCard({ content }: FinalResultCardProps) {
  const [copiedFull, setCopiedFull] = useState(false);
  const [copiedPromptOnly, setCopiedPromptOnly] = useState(false);

  // Extract first code/prompt block if present
  const extractedPrompt = useMemo(() => {
    const codeBlockMatch = /```(?:text|prompt|markdown|[\w-]+)?\s*([\s\S]*?)```/i.exec(content);
    if (codeBlockMatch && codeBlockMatch[1]) {
      return codeBlockMatch[1].trim();
    }
    return null;
  }, [content]);

  const handleCopyFull = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFull(true);
      setTimeout(() => setCopiedFull(false), 2500);
    } catch (err) {
      console.error("Failed to copy final result:", err);
    }
  };

  const handleCopyPromptOnly = async () => {
    if (!extractedPrompt) return;
    try {
      await navigator.clipboard.writeText(extractedPrompt);
      setCopiedPromptOnly(true);
      setTimeout(() => setCopiedPromptOnly(false), 2500);
    } catch (err) {
      console.error("Failed to copy extracted prompt:", err);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `multi-ai-deliverable-${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const wordCount = content.trim().split(/\s+/).length;

  return (
    <div className="rounded-xl border-2 border-indigo-500/40 bg-gradient-to-b from-indigo-950/20 via-[var(--bg-secondary)] to-[var(--bg-secondary)] overflow-hidden shadow-xl shadow-indigo-500/5">
      {/* Header Banner */}
      <div className="px-4 sm:px-5 py-3 bg-indigo-600/10 border-b border-indigo-500/20 flex items-center justify-between flex-wrap gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30 shrink-0">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5 flex-wrap">
              <span>Final Collaborative Deliverable</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono uppercase">
                Ready
              </span>
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Synthesized by the Finalizer from all agent contributions ({wordCount} words)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Copy Prompt Only Button (If prompt block detected) */}
          {extractedPrompt && (
            <button
              type="button"
              onClick={handleCopyPromptOnly}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 transition-all shadow-sm active:scale-95"
              title="Copy only the ready-to-paste prompt without markdown formatting"
            >
              {copiedPromptOnly ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Prompt Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Prompt Only</span>
                </>
              )}
            </button>
          )}

          {/* Copy Full Result */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleCopyFull}
            className="bg-indigo-600 hover:bg-indigo-500 text-xs shadow-sm"
            leftIcon={copiedFull ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copiedFull ? "Copied!" : "Copy Full Report"}
          </Button>

          {/* Download Markdown */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] transition-colors"
            title="Download as Markdown file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 bg-[var(--bg-secondary)]">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
}
