"use client";

import React from "react";
import { Code2, Sparkles, Image, BookOpen, Layers, Check } from "lucide-react";
import { TaskType } from "@/types/api.types";
import { cn } from "@/lib/utils";

interface TaskTypeSelectorProps {
  selectedType: TaskType;
  onSelect: (type: TaskType) => void;
}

interface WorkspaceItem {
  type: TaskType;
  label: string;
  desc: string;
  icon: React.ReactNode;
  iconColor: string;
}

const WORKSPACES: WorkspaceItem[] = [
  {
    type: "coding",
    label: "Coding",
    desc: "Software engineering & architecture",
    icon: <Code2 className="w-4 h-4 sm:w-5 sm:h-5" />,
    iconColor: "text-[#adc6ff]",
  },
  {
    type: "prompt_engineering",
    label: "Prompting",
    desc: "System instructions & logic",
    icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />,
    iconColor: "text-[#4edea3]",
  },
  {
    type: "image_prompt",
    label: "Visuals",
    desc: "UI/UX & asset generation",
    icon: <Image className="w-4 h-4 sm:w-5 sm:h-5" />,
    iconColor: "text-[#ffb786]",
  },
  {
    type: "study_research",
    label: "Research",
    desc: "Deep research & analysis",
    icon: <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />,
    iconColor: "text-[#38bdf8]",
  },
  {
    type: "general",
    label: "General",
    desc: "Standard assistant capabilities",
    icon: <Layers className="w-4 h-4 sm:w-5 sm:h-5" />,
    iconColor: "text-[#a78bfa]",
  },
];

export function TaskTypeSelector({ selectedType, onSelect }: TaskTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        Select Workspace Domain
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
        {WORKSPACES.map((ws) => {
          const isSelected = selectedType === ws.type;

          return (
            <button
              key={ws.type}
              type="button"
              onClick={() => onSelect(ws.type)}
              className={cn(
                "glass-panel rounded-lg p-2.5 sm:p-3.5 text-left transition-all duration-200 flex flex-col justify-between gap-2 relative group select-none hover:border-[#adc6ff] hover:bg-[#adc6ff]/5",
                isSelected
                  ? "border-[#adc6ff] ring-1 ring-[#adc6ff]/60 bg-[#adc6ff]/10"
                  : "border-[var(--border-subtle)]"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div className={cn("p-1.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]", ws.iconColor)}>
                  {ws.icon}
                </div>

                {isSelected && (
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#adc6ff] text-[#002e6a] flex items-center justify-center">
                    <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 stroke-[3]" />
                  </div>
                )}
              </div>

              <div>
                <span className="font-mono text-xs font-semibold text-[var(--text-primary)] block">
                  {ws.label}
                </span>
                <span className="font-mono text-[10px] text-[var(--text-muted)] leading-tight block mt-0.5 truncate sm:whitespace-normal">
                  {ws.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
