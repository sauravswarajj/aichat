import { AgentRole, ProviderName, TaskType } from "@/types/api.types";
import { ModelOption, RoleOption, TaskTypeOption } from "@/types/ui.types";

export const STORAGE_KEYS = {
  AUTH_TOKEN: "aichat_session_token",
  THEME: "aichat_theme",
  SAVED_PIPELINE: "aichat_custom_pipeline",
} as const;

export const PROVIDERS: {
  id: ProviderName;
  name: string;
  badgeClass: string;
  description: string;
  defaultModel: string;
}[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    description: "Multimodal and high-speed Flash & Pro reasoning models.",
    defaultModel: "gemini-2.5-flash",
  },
  {
    id: "nvidia",
    name: "NVIDIA NIM",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    description: "OpenAI-compatible hosted Llama & Mistral enterprise models.",
    defaultModel: "meta/llama-3.1-70b-instruct",
  },
  {
    id: "qwen",
    name: "Alibaba Qwen",
    badgeClass: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    description: "Alibaba Cloud DashScope international high-capacity models.",
    defaultModel: "qwen-plus",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    description: "Universal unified gateway proxying top community & free models.",
    defaultModel: "meta-llama/llama-3.3-70b-instruct:free",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    description: "High-performance coding, math, and deep reasoning models.",
    defaultModel: "deepseek-chat",
  },
  {
    id: "grok",
    name: "xAI Grok",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    description: "Truth-seeking reasoning, frontier context and coding from xAI.",
    defaultModel: "grok-2-latest",
  },
];

export const MODELS: ModelOption[] = [
  // Gemini
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "gemini",
    description: "Next-gen ultra fast multimodal model with generous quota.",
    contextWindow: "1M tokens",
    recommendedFor: ["coding", "prompt_engineering", "general"],
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "gemini",
    description: "Deep reasoning across huge contexts and complex architectures.",
    contextWindow: "2M tokens",
    recommendedFor: ["study_research", "coding"],
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "gemini",
    description: "Lightweight, responsive model for high-throughput pipelines.",
    contextWindow: "1M tokens",
    recommendedFor: ["general", "image_prompt"],
  },

  // NVIDIA NIM
  {
    id: "meta/llama-3.1-70b-instruct",
    name: "Llama 3.1 70B Instruct",
    provider: "nvidia",
    description: "Flagship open weights model hosted on NVIDIA infrastructure.",
    contextWindow: "128k tokens",
    recommendedFor: ["coding", "study_research", "general"],
  },
  {
    id: "meta/llama-3.1-8b-instruct",
    name: "Llama 3.1 8B Instruct",
    provider: "nvidia",
    description: "Ultra lightweight Llama model for fast critique and review.",
    contextWindow: "128k tokens",
    recommendedFor: ["prompt_engineering"],
  },
  {
    id: "mistralai/mistral-large-2-instruct",
    name: "Mistral Large 2 Instruct",
    provider: "nvidia",
    description: "Frontier multilingual and precise code generation model.",
    contextWindow: "128k tokens",
    recommendedFor: ["coding", "video_prompt"],
  },

  // Qwen
  {
    id: "qwen-plus",
    name: "Qwen Plus",
    provider: "qwen",
    description: "Balanced high-performance model from Alibaba DashScope.",
    contextWindow: "128k tokens",
    recommendedFor: ["general", "study_research", "prompt_engineering"],
  },
  {
    id: "qwen-max",
    name: "Qwen Max",
    provider: "qwen",
    description: "Deep cognitive capabilities and complex prompt crafting.",
    contextWindow: "32k tokens",
    recommendedFor: ["coding", "study_research"],
  },
  {
    id: "qwen-turbo",
    name: "Qwen Turbo",
    provider: "qwen",
    description: "Sub-second response speed for real-time iterative critiques.",
    contextWindow: "128k tokens",
    recommendedFor: ["general"],
  },

  // OpenRouter
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B (Free)",
    provider: "openrouter",
    description: "Free community tier tier on OpenRouter.",
    isFree: true,
    recommendedFor: ["general", "prompt_engineering"],
  },
  {
    id: "google/gemini-2.0-flash-exp:free",
    name: "Gemini 2.0 Flash Exp (Free)",
    provider: "openrouter",
    description: "Experimental frontier speed from Google on OpenRouter.",
    isFree: true,
    recommendedFor: ["coding", "video_prompt"],
  },

  // DeepSeek
  {
    id: "deepseek-chat",
    name: "DeepSeek Chat (V3)",
    provider: "deepseek",
    description: "State-of-the-art general language and code generation.",
    contextWindow: "64k tokens",
    recommendedFor: ["coding", "general"],
  },
  {
    id: "deepseek-reasoner",
    name: "DeepSeek Reasoner (R1)",
    provider: "deepseek",
    description: "Chain-of-thought mathematical and algorithmic deep reasoning.",
    contextWindow: "64k tokens",
    recommendedFor: ["study_research", "coding"],
  },

  // Grok
  {
    id: "grok-2-latest",
    name: "Grok 2 Latest",
    provider: "grok",
    description: "Unfiltered frontier reasoning and coding capabilities.",
    contextWindow: "128k tokens",
    recommendedFor: ["coding", "prompt_engineering", "study_research"],
  },
  {
    id: "grok-beta",
    name: "Grok Beta",
    provider: "grok",
    description: "Fast response experimental Grok preview model.",
    contextWindow: "128k tokens",
    recommendedFor: ["general", "image_prompt"],
  },
];

export const AGENT_ROLES: Record<AgentRole, RoleOption> = {
  creator: {
    role: "creator",
    label: "Creator",
    color: "role-creator",
    description: "Drafts the initial architecture, code, or creative draft.",
    defaultSystemPrompt:
      "You are the CREATOR agent. Your job is to produce a high-quality, comprehensive, and clear initial solution or draft for the user's task. Be structured, precise, and thorough.",
  },
  reviewer: {
    role: "reviewer",
    label: "Reviewer",
    color: "role-reviewer",
    description: "Scrutinizes the draft for logic flaws, bugs, and edge cases.",
    defaultSystemPrompt:
      "You are the REVIEWER agent. Review the previous solution carefully. Identify any logical bugs, potential failure modes, missing edge cases, code quality issues, or structural flaws. Provide clear, actionable critiques.",
  },
  critic: {
    role: "critic",
    label: "Critic",
    color: "role-critic",
    description: "Stress tests feasibility, standards compliance, and performance.",
    defaultSystemPrompt:
      "You are the CRITIC agent. Challenge the assumptions and implementation details. Evaluate performance overhead, security vulnerabilities, API ergonomics, and alignment with modern industry best practices.",
  },
  optimizer: {
    role: "optimizer",
    label: "Optimizer",
    color: "role-optimizer",
    description: "Refines the draft by incorporating critiques and boosting efficiency.",
    defaultSystemPrompt:
      "You are the OPTIMIZER agent. Take the initial solution and all the feedback provided by the Reviewer and Critic. Synthesize the improvements, refactor the code/prompt, and produce an enhanced version.",
  },
  finalizer: {
    role: "finalizer",
    label: "Finalizer",
    color: "role-finalizer",
    description: "Delivers the polished, production-ready final deliverable.",
    defaultSystemPrompt:
      "You are the FINALIZER agent. Synthesize all previous agent contributions into ONE definitive, polished, production-ready final output. Output the complete final result clearly formatted with zero placeholder code.",
  },
};

export const TASK_TYPES: TaskTypeOption[] = [
  {
    type: "coding",
    label: "Software & Coding",
    description: "Full-stack code generation, algorithms, refactoring, and architecture reviews.",
    iconName: "Code2",
    defaultPrompt: "Design and implement a robust TypeScript function with unit test cases for...",
    suggestedRoles: ["creator", "reviewer", "critic", "finalizer"],
  },
  {
    type: "prompt_engineering",
    label: "Prompt Engineering",
    description: "Craft, iterate, and benchmark production-grade LLM system prompts.",
    iconName: "Sparkles",
    defaultPrompt: "Design an optimized multi-step system prompt with few-shot examples for...",
    suggestedRoles: ["creator", "reviewer", "optimizer", "finalizer"],
  },
  {
    type: "image_prompt",
    label: "Image Prompt Studio",
    description: "Detailed Midjourney/Flux/SD prompting with lighting, lens, and composition depth.",
    iconName: "Image",
    defaultPrompt: "Create an ultra-photorealistic cinematic 16:9 prompt describing...",
    suggestedRoles: ["creator", "critic", "finalizer"],
  },
  {
    type: "video_prompt",
    label: "Video Prompt & Flow",
    description: "Continuous motion vectors, camera motion, and timeline prompts for video models.",
    iconName: "Video",
    defaultPrompt: "Generate a continuous 8-second cinematic camera transition prompt for...",
    suggestedRoles: ["creator", "reviewer", "finalizer"],
  },
  {
    type: "study_research",
    label: "Study & Deep Research",
    description: "Synthesize literature, comparative analysis, and structured academic study notes.",
    iconName: "BookOpen",
    defaultPrompt: "Perform a comprehensive comparative technical analysis between...",
    suggestedRoles: ["creator", "critic", "optimizer", "finalizer"],
  },
  {
    type: "general",
    label: "General Collaboration",
    description: "Collaborative multi-mind brainstorming, writing, and problem solving.",
    iconName: "Bot",
    defaultPrompt: "Collaborate on a detailed strategy and execution plan for...",
    suggestedRoles: ["creator", "reviewer", "finalizer"],
  },
];

/**
 * Default multi-agent collaboration pipeline
 */
export const DEFAULT_PIPELINE = [
  {
    role: "creator" as AgentRole,
    provider: "gemini" as ProviderName,
    model: "gemini-2.5-flash",
    systemPrompt: AGENT_ROLES.creator.defaultSystemPrompt,
  },
  {
    role: "reviewer" as AgentRole,
    provider: "nvidia" as ProviderName,
    model: "meta/llama-3.1-70b-instruct",
    systemPrompt: AGENT_ROLES.reviewer.defaultSystemPrompt,
  },
  {
    role: "critic" as AgentRole,
    provider: "qwen" as ProviderName,
    model: "qwen-plus",
    systemPrompt: AGENT_ROLES.critic.defaultSystemPrompt,
  },
  {
    role: "finalizer" as AgentRole,
    provider: "gemini" as ProviderName,
    model: "gemini-2.5-flash",
    systemPrompt: AGENT_ROLES.finalizer.defaultSystemPrompt,
  },
];
