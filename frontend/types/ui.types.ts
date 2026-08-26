import { AgentRole, ProviderName, TaskType } from "./api.types";

export type Theme = "dark" | "light";

export interface ModelOption {
  id: string;
  name: string;
  provider: ProviderName;
  description: string;
  contextWindow?: string;
  isFree?: boolean;
  recommendedFor?: TaskType[];
}

export interface TaskTypeOption {
  type: TaskType;
  label: string;
  description: string;
  iconName: string;
  defaultPrompt: string;
  suggestedRoles: AgentRole[];
}

export interface RoleOption {
  role: AgentRole;
  label: string;
  color: string; // Tailored badge/accent color class
  description: string;
  defaultSystemPrompt: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
