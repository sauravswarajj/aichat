"use client";

import React, { useState } from "react";
import {
  Activity,
  Shield,
  LogOut,
  Laptop,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { healthService } from "@/services/health.service";
import { useAuth } from "@/providers/AuthProvider";
import { PROVIDERS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export default function SettingsPage() {
  const { logout, logoutAll } = useAuth();
  const [logoutAllModalOpen, setLogoutAllModalOpen] = useState(false);

  const {
    data: health,
    isLoading: healthLoading,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ["health"],
    queryFn: () => healthService.check(),
  });

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Settings & Diagnostics</h2>
        <p className="text-xs text-[var(--text-secondary)]">
          Manage backend connectivity, AI provider configurations, and device sessions.
        </p>
      </div>

      {/* 1. Backend & Database Status */}
      <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-sm text-[var(--text-primary)]">
              Backend Server & Database Status
            </h3>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetchHealth()}
            isLoading={healthLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Check Status
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-1">
            <div className="text-[11px] text-[var(--text-muted)] uppercase font-mono">API Server</div>
            <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{health?.status === "ok" ? "Operational" : "Checking..."}</span>
            </div>
            <div className="text-[10px] text-[var(--text-muted)] font-mono">
              Port: 4000
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-1">
            <div className="text-[11px] text-[var(--text-muted)] uppercase font-mono">Database</div>
            <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  health?.databaseConnected ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span className="capitalize">{health?.database || "Checking"}</span>
            </div>
            <div className="text-[10px] text-[var(--text-muted)] font-mono">
              MongoDB Atlas
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-1">
            <div className="text-[11px] text-[var(--text-muted)] uppercase font-mono">Uptime</div>
            <div className="text-sm font-semibold text-[var(--text-primary)] font-mono">
              {health?.uptimeSeconds ? `${Math.floor(health.uptimeSeconds / 60)} min` : "N/A"}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] font-mono">
              Process runtime
            </div>
          </div>
        </div>
      </div>

      {/* 2. Provider API Quotas & Config */}
      <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="font-semibold text-sm text-[var(--text-primary)]">
              Supported AI Providers
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Provider API keys are securely stored server-side in your <code className="text-indigo-400 font-mono">.env</code> file.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PROVIDERS.map((prov) => (
            <div
              key={prov.id}
              className="p-3.5 rounded-lg bg-[var(--bg-tertiary)]/60 border border-[var(--border-subtle)] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-[var(--text-primary)]">
                  {prov.name}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${prov.badgeClass}`}>
                  {prov.id}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                {prov.description}
              </p>
              <div className="text-[10px] font-mono text-[var(--text-secondary)]">
                Default: <span className="text-indigo-400">{prov.defaultModel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Multi-Device Sessions & Security */}
      <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="font-semibold text-sm text-[var(--text-primary)]">
              Session Management & Security
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Manage active logins across your devices.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
          <div>
            <div className="text-xs font-semibold text-[var(--text-primary)]">
              Current Device Session
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              Revoke session on this browser only.
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={logout} leftIcon={<LogOut className="w-3.5 h-3.5" />}>
            Log Out This Device
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-lg bg-rose-500/5 border border-rose-500/20">
          <div>
            <div className="text-xs font-semibold text-rose-400">
              Revoke All Device Sessions
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              Instantly logs out every computer, phone, and tablet logged into this workspace.
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setLogoutAllModalOpen(true)}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Log Out All Devices
          </Button>
        </div>
      </div>

      {/* Logout All Confirmation Modal */}
      <Modal
        isOpen={logoutAllModalOpen}
        onClose={() => setLogoutAllModalOpen(false)}
        title="Log Out Everywhere?"
        description="This will instantly invalidate all active login sessions on all devices and return you to the login screen."
      >
        <div className="flex items-center justify-end gap-2 mt-4">
          <Button variant="ghost" size="sm" onClick={() => setLogoutAllModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setLogoutAllModalOpen(false);
              logoutAll();
            }}
          >
            Confirm Logout Everywhere
          </Button>
        </div>
      </Modal>
    </div>
  );
}
