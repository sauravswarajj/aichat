"use client";

import React from "react";
import Link from "next/link";
import { User, ShieldCheck, MessageSquare, Plus, Settings, Activity } from "lucide-react";
import { useThreadsQuery } from "@/hooks/useThreads";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  const { logout } = useAuth();
  const { data: threads } = useThreadsQuery();

  const totalThreads = threads?.length || 0;
  const totalTurns = threads?.reduce((acc, t) => acc + (t.turnCount || 0), 0) || 0;

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
      {/* Profile Header */}
      <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-indigo-500/25">
            <User className="w-10 h-10" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Workspace Owner
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                <span>AUTHENTICATED</span>
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Single-owner administrator profile for personal multi-AI collaboration environment.
            </p>
          </div>
        </div>

        {/* Workspace Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <div className="p-4 rounded-xl bg-[var(--bg-tertiary)]/70 border border-[var(--border-subtle)] space-y-1">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase">Saved Threads</span>
            <div className="text-2xl font-bold text-[var(--text-primary)] font-mono">
              {totalThreads}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-tertiary)]/70 border border-[var(--border-subtle)] space-y-1">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase">Total AI Turns</span>
            <div className="text-2xl font-bold text-indigo-400 font-mono">
              {totalTurns}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-tertiary)]/70 border border-[var(--border-subtle)] space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase">Ecosystem</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              6 Providers
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                New Chat
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="secondary" size="sm" leftIcon={<Settings className="w-3.5 h-3.5" />}>
                Settings
              </Button>
            </Link>
          </div>

          <Button variant="ghost" size="sm" onClick={logout} className="text-rose-400 hover:bg-rose-500/10">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
