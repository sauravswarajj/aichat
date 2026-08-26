import React from "react";
import Link from "next/link";
import { Bot, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-8 text-center space-y-6 shadow-2xl">
        <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 items-center justify-center text-white shadow-lg shadow-indigo-500/25">
          <Bot className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Single-Owner Architecture
          </h1>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            This workspace is designed as a personal multi-AI development environment. It uses a single-owner security model configured directly via <code className="text-indigo-400 font-mono">AUTH_EMAIL</code> and <code className="text-indigo-400 font-mono">AUTH_PASSWORD</code> in the backend environment.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] flex items-start gap-2.5 text-left">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            Public registration is intentionally disabled to protect your private AI provider quotas and database state.
          </span>
        </div>

        <Link href="/login">
          <Button variant="primary" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Proceed to Login
          </Button>
        </Link>
      </div>
    </div>
  );
}
