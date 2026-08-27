"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Sparkles,
  Code2,
  Image as ImageIcon,
  Check,
  Zap,
} from "lucide-react";
import { AgentConfig, AgentRole, ProviderName } from "@/types/api.types";
import { AGENT_ROLES, DEFAULT_PIPELINE, MODELS, PIPELINE_RECIPES, PROVIDERS } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface PipelineConfiguratorProps {
  agents: AgentConfig[];
  onChange: (agents: AgentConfig[]) => void;
}

export function PipelineConfigurator({ agents, onChange }: PipelineConfiguratorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
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

  const handleApplyRecipe = (recipeKey: keyof typeof PIPELINE_RECIPES) => {
    onChange(PIPELINE_RECIPES[recipeKey]);
    setIsGuideOpen(false);
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] font-mono">
            AI Collaboration Chain ({agents.length} Models)
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Guide & Recommended Chains Button */}
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="text-[11px] text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded-md font-medium"
            title="View Recommended Chains and Guidelines"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guide & Recipes</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-[var(--bg-tertiary)]"
            title="Reset to default multi-agent pipeline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
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
                  {agent.provider}/{agent.model.split("/").pop()?.replace(/:free/, "")}
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
                            {m.name}
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

      {/* Guide & Recommended Recipes Modal */}
      <Modal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        title="AI Pipeline Guide & Recommended Sequences"
        description="Proven multi-agent combinations tailored for Prompting, Coding, Visuals, and Research."
        maxWidth="xl"
      >
        <div className="space-y-6 mt-3 max-h-[75vh] overflow-y-auto pr-1">
          {/* 1. The Core Rule */}
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1.5">
            <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Golden Rule of Multi-Agent Sequences
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Always follow the sequence: <strong>Creator (1st)</strong> ➔ <strong>Reviewer (2nd)</strong> ➔ <strong>Critic (3rd)</strong> ➔ <strong>Optimizer (4th)</strong> ➔ <strong>Finalizer (Last)</strong>. The Finalizer must always be the final step to synthesize all previous critiques into a clean final deliverable.
            </p>
          </div>

          {/* 2. One-Click Apply Recipes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-[var(--text-muted)]">
              Instant Pre-Built Recipes (Click to Apply)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Prompt Engineering Recipe */}
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-amber-500/30 space-y-3 flex flex-col justify-between hover:border-amber-500/50 transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Prompt Engineering (5 Models)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Gemini (Draft) ➔ Groq (Check) ➔ DeepSeek R1 (Logic) ➔ NVIDIA (Refactor) ➔ OpenRouter Qwen3 (Finalize).
                  </p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleApplyRecipe("prompt_engineering")}
                  className="w-full text-xs bg-amber-600 hover:bg-amber-500 text-white"
                  rightIcon={<Check className="w-3 h-3" />}
                >
                  Apply Prompting Chain
                </Button>
              </div>

              {/* Coding Recipe */}
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-indigo-500/30 space-y-3 flex flex-col justify-between hover:border-indigo-500/50 transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5" />
                      Software & Coding (5 Models)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300">
                      Full-Stack
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Gemini 2.5 (Code) ➔ Groq Llama 3.3 (Bugs) ➔ DeepSeek R1 (Critic) ➔ DeepSeek V3 (Optimize) ➔ NVIDIA (Final).
                  </p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleApplyRecipe("coding")}
                  className="w-full text-xs bg-indigo-600 hover:bg-indigo-500 text-white"
                  rightIcon={<Check className="w-3 h-3" />}
                >
                  Apply Coding Chain
                </Button>
              </div>

              {/* Visuals & Prompting */}
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Visuals & Image Prompts (3 Models)
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Gemini 2.5 (Draft) ➔ Groq Llama 3.3 (Lighting & Lens Critique) ➔ OpenRouter Qwen3 (Final Prompt).
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyRecipe("visuals")}
                  className="w-full text-xs"
                >
                  Apply Visuals Chain
                </Button>
              </div>

              {/* Deep Research */}
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      Deep Research & Analysis (4 Models)
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Gemini 2.5 Pro (Massive Context) ➔ DeepSeek R1 (Deep Logic) ➔ NVIDIA 70B (Structure) ➔ Gemini (Final).
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyRecipe("research")}
                  className="w-full text-xs"
                >
                  Apply Research Chain
                </Button>
              </div>
            </div>
          </div>

          {/* 3. Detailed Model Roles Cheatsheet */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-[var(--text-muted)]">
              Model Role Cheatsheet
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-start gap-2.5">
                <Badge variant="role" role="creator" size="sm">Creator</Badge>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  <strong>Best:</strong> Google Gemini 2.5 Flash. Ultra-fast initial drafts, comprehensive structure, and zero hallucinations on initial structure.
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-start gap-2.5">
                <Badge variant="role" role="reviewer" size="sm">Reviewer</Badge>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  <strong>Best:</strong> Groq LPU (Llama 3.3 70B). Sub-second inference for catching syntax bugs, missing edge cases, and prompt logic issues.
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-start gap-2.5">
                <Badge variant="role" role="critic" size="sm">Critic</Badge>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  <strong>Best:</strong> DeepSeek Reasoner (R1). Chain-of-thought mathematical and algorithmic analysis to uncover deep failure modes and security gaps.
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-start gap-2.5">
                <Badge variant="role" role="optimizer" size="sm">Optimizer</Badge>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  <strong>Best:</strong> NVIDIA NIM (Llama 3.1 70B) or DeepSeek Chat (V3). Refactors and enhances the output by applying all previous critiques.
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-start gap-2.5">
                <Badge variant="role" role="finalizer" size="sm">Finalizer</Badge>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  <strong>Best:</strong> OpenRouter Qwen3 235B or Gemini 2.5 Flash. Produces the single definitive, production-ready deliverable.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

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
