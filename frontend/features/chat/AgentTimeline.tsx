"use client";

import React from "react";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { AgentConfig, AgentRole, WorkflowStatus } from "@/types/api.types";
import { AGENT_ROLES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AgentTimelineProps {
  agents: AgentConfig[];
  activeRole: AgentRole | null;
  status: WorkflowStatus;
  completedRoles: AgentRole[];
  failedRole?: AgentRole | null;
}

export function AgentTimeline({
  agents,
  activeRole,
  status,
  completedRoles,
  failedRole,
}: AgentTimelineProps) {
  return (
    <div className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-2.5 sm:px-4 flex items-center overflow-x-auto whitespace-nowrap shadow-sm">
      <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)] mr-3 shrink-0 uppercase tracking-wider">
        AGENT PIPELINE:
      </span>

      <div className="flex items-center gap-2 shrink-0">
        {agents.map((agent, idx) => {
          const roleMeta = AGENT_ROLES[agent.role];
          const isCompleted = completedRoles.includes(agent.role);
          const isActive = activeRole === agent.role && status === "running";
          const isFailed = failedRole === agent.role;
          const isPending = !isCompleted && !isActive && !isFailed;

          const providerShort = agent.provider.charAt(0).toUpperCase() + agent.provider.slice(1);

          return (
            <React.Fragment key={`${agent.role}-${idx}`}>
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono transition-all duration-200",
                  isActive &&
                    "bg-[#4d8eff]/20 border border-[#adc6ff] text-[#adc6ff] font-medium shadow-[0_0_10px_rgba(77,142,255,0.25)]",
                  isCompleted &&
                    "bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]",
                  isFailed &&
                    "bg-rose-500/20 border border-rose-500/40 text-rose-400 font-medium",
                  isPending &&
                    "bg-[var(--bg-primary)] border border-[var(--border-subtle)] border-dashed text-[var(--text-muted)] opacity-50"
                )}
              >
                {/* Status indicator */}
                {isActive && (
                  <span className="flex gap-0.5 mr-1">
                    <span className="w-1 h-1 rounded-full bg-[#adc6ff] animate-bounce [animation-delay:0ms]" />
                    <span className="w-1 h-1 rounded-full bg-[#adc6ff] animate-bounce [animation-delay:200ms]" />
                    <span className="w-1 h-1 rounded-full bg-[#adc6ff] animate-bounce [animation-delay:400ms]" />
                  </span>
                )}
                {isCompleted && <Check className="w-3 h-3 text-[#4edea3]" />}

                <span>
                  {roleMeta?.label || agent.role} ({providerShort})
                </span>
              </div>

              {/* Connecting Arrow */}
              {idx < agents.length - 1 && (
                <ArrowRight className="w-3 h-3 text-[var(--text-muted)] shrink-0 opacity-60" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
