"use client";

import React, { useState } from "react";
import { Plus, Trash2, SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { AgentConfig, AgentRole, ProviderName } from "@/types/api.types";
import { AGENT_ROLES, DEFAULT_PIPELINE, MODELS, PROVIDERS } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface PipelineConfiguratorProps {
  agents: AgentConfig[];
  onChange: (agents: AgentConfig[]) => void;
}

export function PipelineConfigurator({ agents, onChange }: PipelineConfiguratorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingPromptAgentIdx, setEditingPromptAgentIdx] = useState<number | null>(null);
  const [tempPrompt, setTempPrompt] = useState("");

  const handleAddAgent = () => {
    if (agents.length >= 6) return;
    const newAgent: AgentConfig = {
      role: "optimizer",
      provider: "gemini",
      model: "gemini-2.5-flash",
      systemPrompt: AGENT_ROLES.optimizer.defaultSystemPrompt,
    };
    onChange([...agents, newAgent]);
  };

  const handleRemoveAgent = (index: number) => {
    if (agents.length <= 1) return;
    const updated = agents.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdateAgent = (index: number, updates: Partial<AgentConfig>) => {
    const updated = agents.map((agent, i) => {
      if (i !== index) return agent;
      const merged = { ...agent, ...updates };

      // If provider changed, pick its default model if current model is not from this provider
      if (updates.provider && updates.provider !== agent.provider) {
        const provMeta = PROVIDERS.find((p) => p.id === updates.provider);
        if (provMeta) {
          merged.model = provMeta.defaultModel;
        }
      }

      // If role changed, update system prompt to matching default if desired
      if (updates.role && updates.role !== agent.role) {
        merged.systemPrompt = AGENT_ROLES[updates.role].defaultSystemPrompt;
      }

      return merged;
    });
    onChange(updated);
  };

  const handleResetDefaults = () => {
    onChange(DEFAULT_PIPELINE);
  };

  const openPromptEditor = (index: number) => {
    setEditingPromptAgentIdx(index);
    setTempPrompt(agents[index].systemPrompt);
  };

  const savePrompt = () => {
    if (editingPromptAgentIdx !== null) {
      handleUpdateAgent(editingPromptAgentIdx, { systemPrompt: tempPrompt });
      setEditingPromptAgentIdx(null);
    }
  };

  return (
    <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] font-mono">
            AI Collaboration Chain ({agents.length} Models)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-[var(--bg-tertiary)]"
            title="Reset to default multi-agent pipeline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-indigo-500/10"
          >
            <span>{isExpanded ? "Collapse" : "Customize Chain"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Summary View when collapsed */}
      {!isExpanded && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {agents.map((agent, i) => {
            const roleMeta = AGENT_ROLES[agent.role];
            return (
              <div
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs"
              >
                <Badge variant="role" role={agent.role} size="sm">
                  {roleMeta?.label || agent.role}
                </Badge>
                <span className="text-[var(--text-secondary)] font-mono text-[11px]">
                  {agent.provider}/{agent.model.split("/").pop()}
                </span>
                {i < agents.length - 1 && <span className="text-[var(--text-muted)] ml-1">→</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Expanded Customizer */}
      {isExpanded && (
        <div className="space-y-3 pt-2">
          <div className="space-y-2.5">
            {agents.map((agent, index) => {
              const availableModels = MODELS.filter((m) => m.provider === agent.provider);

              return (
                <div
                  key={index}
                  className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 p-3 rounded-lg bg-[var(--bg-tertiary)]/60 border border-[var(--border-subtle)]"
                >
                  {/* Step Index & Role Selector */}
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] font-mono flex items-center justify-center text-[var(--text-muted)] shrink-0">
                      {index + 1}
                    </span>

                    <select
                      value={agent.role}
                      onChange={(e) => handleUpdateAgent(index, { role: e.target.value as AgentRole })}
                      className="text-xs font-semibold rounded-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] px-2.5 py-1.5 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="creator">Creator (Draft)</option>
                      <option value="reviewer">Reviewer (Bug/Flaw Check)</option>
                      <option value="critic">Critic (Feasibility/Standards)</option>
                      <option value="optimizer">Optimizer (Enhance)</option>
                      <option value="finalizer">Finalizer (Final Synthesis)</option>
                    </select>
                  </div>

                  {/* Provider & Model Selectors */}
                  <div className="flex flex-1 items-center gap-2 flex-wrap">
                    {/* Provider */}
                    <select
                      value={agent.provider}
                      onChange={(e) =>
                        handleUpdateAgent(index, { provider: e.target.value as ProviderName })
                      }
                      className="text-xs rounded-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] px-2.5 py-1.5 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {PROVIDERS.map((prov) => (
                        <option key={prov.id} value={prov.id}>
                          {prov.name}
                        </option>
                      ))}
                    </select>

                    {/* Model */}
                    <select
                      value={agent.model}
                      onChange={(e) => handleUpdateAgent(index, { model: e.target.value })}
                      className="text-xs font-mono rounded-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] px-2.5 py-1.5 text-[var(--text-primary)] flex-1 min-w-[140px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {availableModels.length > 0 ? (
                        availableModels.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} {m.isFree ? "(Free)" : ""}
                          </option>
                        ))
                      ) : (
                        <option value={agent.model}>{agent.model}</option>
                      )}
                    </select>
                  </div>

                  {/* Actions: Edit System Prompt & Delete */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => openPromptEditor(index)}
                      className="text-xs py-1 h-7"
                    >
                      Prompt
                    </Button>

                    <button
                      type="button"
                      disabled={agents.length <= 1}
                      onClick={() => handleRemoveAgent(index)}
                      className="p-1.5 rounded text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Remove agent step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Agent Button */}
          {agents.length < 6 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAgent}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="w-full text-xs py-2 border-dashed border-[var(--border-strong)]"
            >
              Add Collaboration Step (Max 6)
            </Button>
          )}
        </div>
      )}

      {/* System Prompt Modal */}
      <Modal
        isOpen={editingPromptAgentIdx !== null}
        onClose={() => setEditingPromptAgentIdx(null)}
        title={`Custom System Prompt — ${
          editingPromptAgentIdx !== null ? agents[editingPromptAgentIdx].role.toUpperCase() : ""
        }`}
        description="Define the specific persona, constraints, and responsibilities for this agent in the pipeline."
      >
        <div className="space-y-4 mt-2">
          <textarea
            rows={6}
            value={tempPrompt}
            onChange={(e) => setTempPrompt(e.target.value)}
            className="w-full rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] p-3 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y"
            placeholder="Agent instructions..."
          />

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (editingPromptAgentIdx !== null) {
                  setTempPrompt(AGENT_ROLES[agents[editingPromptAgentIdx].role].defaultSystemPrompt);
                }
              }}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Reset to Role Default
            </button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditingPromptAgentIdx(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={savePrompt}>
                Apply Prompt
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
