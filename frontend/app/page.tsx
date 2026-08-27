import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Bot,
  Layers,
  Cpu,
  CheckCircle2,
  Lock,
  GitMerge,
  Terminal,
  Clock,
} from "lucide-react";
import { HeroSection } from "@/components/hero/HeroSection";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PROVIDERS } from "@/lib/constants";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Responsive Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 sm:h-16 border-b border-white/10 bg-[#07080b]/90 backdrop-blur-xl px-3 sm:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <span className="font-bold text-xs sm:text-sm tracking-tight text-white truncate">
            Jaishwal AI
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <ThemeToggle />

          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 bg-white/5 hover:bg-white/10 text-white text-[11px] sm:text-xs px-2.5 sm:px-3 h-8"
            >
              Sign In
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button
              variant="primary"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-[11px] sm:text-xs shadow-md shadow-indigo-500/20 px-2.5 sm:px-3 h-8"
              rightIcon={<ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            >
              <span className="hidden xs:inline">Enter</span> Studio
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 1. Cinematic Scroll Hero Section */}
        <HeroSection />

        {/* 2. Philosophy & Value Proposition */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] relative overflow-hidden">
          <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
            <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono border border-indigo-500/20">
                <Zap className="w-3.5 h-3.5" />
                <span>THE MULTI-AGENT ADVANTAGE</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                Why One AI Model Is Never Enough
              </h2>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                Single models hallucinate, miss subtle edge cases, and produce untested assumptions. By orchestrating distinct models with adversarial and constructive roles, output quality multiplies exponentially.
              </p>
            </div>

            {/* Workflow Step Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {[
                {
                  role: "Creator",
                  provider: "Gemini 2.5 Flash",
                  desc: "Generates the initial architecture, code draft, or strategic premise.",
                },
                {
                  role: "Reviewer",
                  provider: "Llama 3.1 70B",
                  desc: "Inspects code for bugs, missing edge cases, and architectural flaws.",
                },
                {
                  role: "Critic",
                  provider: "Qwen Plus",
                  desc: "Stress-tests feasibility, performance costs, and standards compliance.",
                },
                {
                  role: "Optimizer",
                  provider: "DeepSeek Reasoner",
                  desc: "Synthesizes critiques and refactors the code for peak efficiency.",
                },
                {
                  role: "Finalizer",
                  provider: "Gemini 2.5 Flash",
                  desc: "Delivers one definitive, production-ready deliverable with zero placeholders.",
                },
              ].map((step, idx) => (
                <div
                  key={step.role}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/50 p-4 sm:p-5 flex flex-col justify-between space-y-3 relative group hover:border-[var(--border-strong)] transition-colors"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-[var(--text-muted)] font-semibold">
                      STEP 0{idx + 1}
                    </span>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                        {step.role}
                      </h4>
                    </div>
                    <span className="inline-block text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      {step.provider}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Supported AI Ecosystem */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
          <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
            <div className="text-center space-y-3 sm:space-y-4 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-mono border border-purple-500/20">
                <Cpu className="w-3.5 h-3.5" />
                <span>UNIFIED BACKEND ADAPTERS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                6 Frontier AI Providers Under One Roof
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                Switch providers seamlessly per agent role. API keys stay securely server-side in your environment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {PROVIDERS.map((prov) => (
                <div
                  key={prov.id}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 sm:p-6 space-y-3 hover:border-indigo-500/40 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm sm:text-base text-[var(--text-primary)]">
                      {prov.name}
                    </h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${prov.badgeClass}`}>
                      {prov.id}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {prov.description}
                  </p>
                  <div className="pt-2 border-t border-[var(--border-subtle)] text-[10px] sm:text-[11px] font-mono text-[var(--text-muted)]">
                    Default model: <span className="text-indigo-400">{prov.defaultModel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Real-time Streaming & Features */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            <div className="space-y-3 p-5 sm:p-6 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)]">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-[var(--text-primary)]">
                Server-Sent Events Streaming
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Watch each agent think, analyze, and stream its response in real time as the collaboration progresses.
              </p>
            </div>

            <div className="space-y-3 p-5 sm:p-6 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)]">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <GitMerge className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-[var(--text-primary)]">
                Persistent Chat Threads
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Every conversation is saved with MongoDB Atlas persistence. Reopen past threads and continue seamlessly.
              </p>
            </div>

            <div className="space-y-3 p-5 sm:p-6 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] sm:col-span-2 md:col-span-1">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-[var(--text-primary)]">
                Single-Owner Security
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Protected by single-owner credentials with multi-device session tracking and instant global revocation.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Call To Action Banner */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
          <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-cyan-900/40 border border-indigo-500/30 p-6 sm:p-12 text-center space-y-5 sm:space-y-6 shadow-2xl backdrop-blur-md">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Ready to Experience Multi-AI Collaboration?
            </h2>
            <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Launch your personal AI workspace, configure your pipeline, and watch models collaborate on complex tasks.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/dashboard">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-500 text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Launch Workspace Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-6 sm:py-8 px-4 sm:px-6 bg-[var(--bg-secondary)] text-center text-xs text-[var(--text-muted)] space-y-2">
        <p>Personal Multi-AI Developer Collaboration Workspace</p>
        <p className="font-mono text-[10px] sm:text-[11px]">
          Express + TypeScript Backend • Next.js App Router Frontend • MongoDB Atlas
        </p>
      </footer>
    </div>
  );
}
