import React from "react";
import { AgentRole, ProviderName, WorkflowStatus } from "@/types/api.types";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "role" | "provider" | "status" | "outline";
  role?: AgentRole;
  provider?: ProviderName;
  status?: WorkflowStatus;
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  role,
  provider,
  status,
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  let specificStyle = "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-subtle)]";

  if (variant === "role" && role) {
    switch (role) {
      case "creator":
        specificStyle = "bg-[var(--role-creator-bg)] text-[var(--role-creator-text)] border-[var(--role-creator-border)]";
        break;
      case "reviewer":
        specificStyle = "bg-[var(--role-reviewer-bg)] text-[var(--role-reviewer-text)] border-[var(--role-reviewer-border)]";
        break;
      case "critic":
        specificStyle = "bg-[var(--role-critic-bg)] text-[var(--role-critic-text)] border-[var(--role-critic-border)]";
        break;
      case "optimizer":
        specificStyle = "bg-[var(--role-optimizer-bg)] text-[var(--role-optimizer-text)] border-[var(--role-optimizer-border)]";
        break;
      case "finalizer":
        specificStyle = "bg-[var(--role-finalizer-bg)] text-[var(--role-finalizer-text)] border-[var(--role-finalizer-border)]";
        break;
    }
  } else if (variant === "status" && status) {
    switch (status) {
      case "running":
        specificStyle = "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse";
        break;
      case "completed":
        specificStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
        break;
      case "failed":
        specificStyle = "bg-rose-500/10 text-rose-400 border-rose-500/30";
        break;
      case "idle":
        specificStyle = "bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-[var(--border-subtle)]";
        break;
    }
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full border tracking-wide uppercase font-mono",
        sizeClasses,
        specificStyle,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
