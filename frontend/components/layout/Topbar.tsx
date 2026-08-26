"use client";

import React from "react";
import Link from "next/link";
import { Menu, Activity, ShieldCheck, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { healthService } from "@/services/health.service";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface TopbarProps {
  title?: string;
  onToggleSidebar?: () => void;
}

export function Topbar({ title = "Collaborative AI Studio", onToggleSidebar }: TopbarProps) {
  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: () => healthService.check(),
    refetchInterval: 30000,
  });

  const isDbConnected = health?.databaseConnected;

  return (
    <header className="h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight max-w-md truncate">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Backend & DB Health Indicator */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]"
          title={`Backend status: ${health?.status || "connecting"} | Database: ${health?.database || "checking"}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isDbConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            }`}
          />
          <span className="text-[var(--text-muted)] text-[10px]">
            {isDbConnected ? "API ONLINE" : "CONNECTING"}
          </span>
        </div>

        <ThemeToggle />

        {/* Public Landing Link */}
        <Link
          href="/"
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors font-medium hidden md:inline-block"
        >
          Landing Showcase
        </Link>

        {/* User Profile avatar */}
        <Link
          href="/profile"
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm hover:ring-2 hover:ring-indigo-400/50 transition-all"
          title="Account Profile"
        >
          <User className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
