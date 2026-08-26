"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function CodeBlock({ children, className, ...props }: any) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : "";
  const codeString = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const isInline = !match && !codeString.includes("\n");

  if (isInline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-mono text-[#adc6ff] font-medium"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-[#0b0e15] shadow-sm">
      {/* Code Header Bar from Stitch */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] font-mono">
        <div className="flex items-center gap-1.5">
          <FileCode className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span>{lang ? `snippet.${lang}` : "code"}</span>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#4edea3]" />
              <span className="text-[#4edea3]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-3.5 overflow-x-auto">
        <pre className="font-mono text-xs leading-relaxed">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none text-[var(--text-primary)] leading-relaxed space-y-3 font-sans text-sm",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code: CodeBlock,
          a: ({ node, ...props }) => (
            <a
              className="text-[#adc6ff] hover:text-[#d8e2ff] underline underline-offset-2 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-[var(--border-subtle)]">
              <table className="w-full text-left text-xs border-collapse font-mono" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              className="bg-[var(--bg-elevated)] px-3 py-2 border-b border-[var(--border-subtle)] font-semibold text-[var(--text-primary)]"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="px-3 py-2 border-b border-[var(--border-subtle)]/50 text-[var(--text-secondary)]"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1 text-xs" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1 text-xs" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-2 border-[#adc6ff] pl-3.5 italic text-[var(--text-secondary)] my-2"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
