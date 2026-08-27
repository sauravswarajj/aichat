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
    description: "Multimodal and ultra fast Flash & Pro models.",
    defaultModel: "gemini-3.6-flash",
  },
  {
    id: "groq",
    name: "Groq LPU",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    description: "Ultra-fast low-latency LPU inference on open models.",
    defaultModel: "openai/gpt-oss-120b",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    description: "Universal API gateway proxying free & community models.",
    defaultModel: "liquid/lfm-2.5-2.6b:free",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    description: "State-of-the-art coding, reasoning, and chat models.",
    defaultModel: "deepseek-chat",
  },
  {
    id: "nvidia",
    name: "NVIDIA NIM",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    description: "High-throughput hosted Llama & Mistral models.",
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
    id: "grok",
    name: "xAI Grok",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    description: "Truth-seeking reasoning and frontier context from xAI.",
    defaultModel: "grok-2-latest",
  },
];

/**
 * Top Verified Active Models per Provider
 */
export const MODELS: ModelOption[] = [
  // 1. Google Gemini (Verified Active)
  {
    id: "gemini-3.6-flash",
    name: "1. Gemini 3.6 Flash [Top 1: Latest Fast Prompt Drafting & Coding]",
    provider: "gemini",
    description: "Google's newest high-speed reasoning model. Verified active.",
    contextWindow: "1M tokens",
    recommendedFor: ["coding", "prompt_engineering", "general"],
  },
  {
    id: "gemini-3.7-flash",
    name: "2. Gemini 3.7 Flash [Top 2: Frontier Multi-Step Reasoning]",
    provider: "gemini",
    description: "Next-generation Flash model with deep reasoning capabilities.",
    contextWindow: "1M tokens",
    recommendedFor: ["study_research", "coding", "prompt_engineering"],
  },
  {
    id: "gemini-3.5-flash",
    name: "3. Gemini 3.5 Flash [Top 3: High-Throughput Quick Responses]",
    provider: "gemini",
    description: "Proven fast Flash model for high concurrency pipelines.",
    contextWindow: "1M tokens",
    recommendedFor: ["study_research", "general"],
  },
  {
    id: "gemini-flash-latest",
    name: "4. Gemini Flash Latest [Top 4: Auto-Updating Flash Alias]",
    provider: "gemini",
    description: "Always routes to the newest stable Flash tier.",
    contextWindow: "1M tokens",
    recommendedFor: ["general", "image_prompt"],
  },

  // 2. Groq LPU (Verified Active)
  {
    id: "openai/gpt-oss-120b",
    name: "1. GPT-OSS 120B [Top 1: Flagship 120B Open Architecture on LPU]",
    provider: "groq",
    description: "Massive 120B model running with sub-second LPU speed. Verified active.",
    contextWindow: "128k tokens",
    recommendedFor: ["coding", "prompt_engineering", "general"],
  },
  {
    id: "openai/gpt-oss-20b",
    name: "2. GPT-OSS 20B [Top 2: Fast 20B Architecture on LPU]",
    provider: "groq",
    description: "Ultra-fast response model for quick validations and reviews.",
    contextWindow: "128k tokens",
    recommendedFor: ["coding", "prompt_engineering"],
  },
  {
    id: "qwen/qwen3.6-27b",
    name: "3. Qwen 3.6 27B [Top 3: Frontier Math & Logic Prompts on LPU]",
    provider: "groq",
    description: "Alibaba's specialized reasoning model accelerated on Groq LPU chips.",
    contextWindow: "128k tokens",
    recommendedFor: ["coding", "study_research"],
  },
  {
    id: "groq/compound",
    name: "4. Groq Compound [Top 4: Multi-Model Synthetic Pipeline]",
    provider: "groq",
    description: "Synthesizes multi-step reasoning directly on Groq hardware.",
    contextWindow: "128k tokens",
    recommendedFor: ["prompt_engineering", "general"],
  },

  // 3. OpenRouter (Verified Free Models)
  {
    id: "liquid/lfm-2.5-2.6b:free",
    name: "1. Liquid LFM 2.5 2.6B (Free) [Top 1: Lightweight Fast Prompting]",
    provider: "openrouter",
    description: "High-efficiency neural architecture on OpenRouter free tier. Verified active.",
    isFree: true,
    recommendedFor: ["prompt_engineering", "general"],
  },
  {
    id: "nvidia/nemotron-3.5-lightning:free",
    name: "2. Nemotron 3.5 Lightning (Free) [Top 2: GPU Prompt Optimization]",
    provider: "openrouter",
    description: "Fast NVIDIA open model available on free tier.",
    isFree: true,
    recommendedFor: ["coding", "general"],
  },
  {
    id: "cohere/north-mini-code:free",
    name: "3. Cohere North Mini Code (Free) [Top 3: Clean Code Generation]",
    provider: "openrouter",
    description: "Specialized code generation model on free tier.",
    isFree: true,
    recommendedFor: ["coding"],
  },

  // 4. DeepSeek
  {
    id: "deepseek-chat",
    name: "1. DeepSeek Chat (V3) [Top 1: Complex Prompt Refactoring & Fast Coding]",
    provider: "deepseek",
    description: "State-of-the-art general language, API design, and prompt refactoring.",
    contextWindow: "64k tokens",
    recommendedFor: ["coding", "general", "prompt_engineering"],
  },
  {
    id: "deepseek-reasoner",
    name: "2. DeepSeek Reasoner (R1) [Top 2: Chain-of-Thought Prompt Critique & Edge Cases]",
    provider: "deepseek",
    description: "Deep CoT reasoning to uncover prompt flaws, security risks, and edge cases.",
    contextWindow: "64k tokens",
    recommendedFor: ["study_research", "coding", "prompt_engineering"],
  },

  // 5. NVIDIA NIM
  {
    id: "meta/llama-3.1-70b-instruct",
    name: "1. Llama 3.1 70B Instruct [Top 1: Prompt Optimization & System Refactoring]",
    provider: "nvidia",
    description: "Flagship open weights model running on NVIDIA enterprise infrastructure.",
    contextWindow: "128k tokens",
    recommendedFor: ["coding", "study_research", "general", "prompt_engineering"],
  },
  {
    id: "mistralai/mistral-large-2-instruct",
    name: "2. Mistral Large 2 [Top 2: Precise Instruction Following & Multilingual Prompts]",
    provider: "nvidia",
    description: "Frontier code generation and precise instruction-following model.",
    contextWindow: "128k tokens",
    recommendedFor: ["coding", "video_prompt", "prompt_engineering"],
  },

  // 6. Alibaba DashScope / Qwen
  {
    id: "qwen-plus",
    name: "1. Qwen Plus [Top 1: Balanced Research & Prompt Crafting]",
    provider: "qwen",
    description: "High-performance general reasoning model from Alibaba DashScope.",
    contextWindow: "128k tokens",
    recommendedFor: ["general", "study_research", "prompt_engineering"],
  },

  // 7. xAI Grok
  {
    id: "grok-2-latest",
    name: "1. Grok 2 Latest [Top 1: Unfiltered Reasoning & Prompting]",
    provider: "grok",
    description: "Frontier reasoning and coding capabilities.",
    contextWindow: "128k tokens",
    recommendedFor: ["coding", "prompt_engineering", "study_research"],
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
      "You are the FINALIZER agent. Synthesize all previous agent contributions into ONE definitive, polished, production-ready final deliverable. Provide a rich, comprehensive master prompt with complete subject details, lighting, camera lens, environmental atmosphere, and negative prompts formatted in fenced code blocks for easy copying.",
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
 * 100% Live Verified Collaboration Pipelines
 */
export const PIPELINE_RECIPES = {
  prompt_engineering: [
    {
      role: "creator" as AgentRole,
      provider: "gemini" as ProviderName,
      model: "gemini-3.6-flash",
      systemPrompt: AGENT_ROLES.creator.defaultSystemPrompt,
    },
    {
      role: "reviewer" as AgentRole,
      provider: "groq" as ProviderName,
      model: "openai/gpt-oss-120b",
      systemPrompt: AGENT_ROLES.reviewer.defaultSystemPrompt,
    },
    {
      role: "critic" as AgentRole,
      provider: "gemini" as ProviderName,
      model: "gemini-3.6-flash",
      systemPrompt: AGENT_ROLES.critic.defaultSystemPrompt,
    },
    {
      role: "optimizer" as AgentRole,
      provider: "groq" as ProviderName,
      model: "qwen/qwen3.6-27b",
      systemPrompt: AGENT_ROLES.optimizer.defaultSystemPrompt,
    },
    {
      role: "finalizer" as AgentRole,
      provider: "openrouter" as ProviderName,
      model: "liquid/lfm-2.5-2.6b:free",
      systemPrompt: AGENT_ROLES.finalizer.defaultSystemPrompt,
    },
  ],
  coding: [
    {
      role: "creator" as AgentRole,
      provider: "gemini" as ProviderName,
      model: "gemini-3.6-flash",
      systemPrompt: AGENT_ROLES.creator.defaultSystemPrompt,
    },
    {
      role: "reviewer" as AgentRole,
      provider: "groq" as ProviderName,
      model: "openai/gpt-oss-120b",
      systemPrompt: AGENT_ROLES.reviewer.defaultSystemPrompt,
    },
    {
      role: "critic" as AgentRole,
      provider: "gemini" as ProviderName,
      model: "gemini-3.6-flash",
      systemPrompt: AGENT_ROLES.critic.defaultSystemPrompt,
    },
    {
      role: "optimizer" as AgentRole,
      provider: "groq" as ProviderName,
      model: "openai/gpt-oss-20b",
      systemPrompt: AGENT_ROLES.optimizer.defaultSystemPrompt,
    },
    {
      role: "finalizer" as AgentRole,
      provider: "gemini" as ProviderName,
      model: "gemini-3.6-flash",
      systemPrompt: AGENT_ROLES.finalizer.defaultSystemPrompt,
    },
  ],
  visuals: [
    {
      role: "creator" as AgentRole,
      provider: "gemini" as ProviderName,
      model: "gemini-3.6-flash",
      systemPrompt: AGENT_ROLES.creator.defaultSystemPrompt,
    },
    {
      role: "critic" as AgentRole,
      provider: "groq" as ProviderName,
      model: "openai/gpt-oss-120b",
      systemPrompt: AGENT_ROLES.critic.defaultSystemPrompt,
    },
    {
      role: "finalizer" as AgentRole,
      provider: "openrouter" as ProviderName,
      model: "liquid/lfm-2.5-2.6b:free",
      systemPrompt: AGENT_ROLES.finalizer.defaultSystemPrompt,
    },
  ],
  research: [
    {
      role: "creator" as AgentRole,
      provider: "gemini" as ProviderName,
      model: "gemini-3.6-flash",
      systemPrompt: AGENT_ROLES.creator.defaultSystemPrompt,
    },
    {
      role: "critic" as AgentRole,
      provider: "gemini" as ProviderName,
      model: "gemini-3.6-flash",
      systemPrompt: AGENT_ROLES.critic.defaultSystemPrompt,
    },
    {
      role: "optimizer" as AgentRole,
      provider: "groq" as ProviderName,
      model: "openai/gpt-oss-120b",
      systemPrompt: AGENT_ROLES.optimizer.defaultSystemPrompt,
    },
    {
      role: "finalizer" as AgentRole,
      provider: "gemini" as ProviderName,
      model: "gemini-3.6-flash",
      systemPrompt: AGENT_ROLES.finalizer.defaultSystemPrompt,
    },
  ],
};

/**
 * Default multi-agent collaboration pipeline
 */
export const DEFAULT_PIPELINE = PIPELINE_RECIPES.prompt_engineering;
