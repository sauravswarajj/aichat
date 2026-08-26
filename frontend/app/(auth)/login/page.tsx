"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bot, Lock, Mail, Laptop, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await login({
        email,
        password,
        label: label.trim() || undefined,
      });
    } catch (err: any) {
      setError(
        err?.message || "Invalid credentials. Please check AUTH_EMAIL and AUTH_PASSWORD in .env"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Top right appearance toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Background Decorative Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-8 shadow-2xl space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-1">
            <Bot className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Sign In to Workspace
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Personal single-owner multi-AI collaboration environment
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3.5 flex items-start gap-2.5 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Owner Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
            autoComplete="email"
          />

          <Input
            type="password"
            label="Password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
            autoComplete="current-password"
          />

          <Input
            type="text"
            label="Device Label (Optional)"
            placeholder="e.g. MacBook Pro, Workstation PC"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            leftIcon={<Laptop className="w-4 h-4" />}
            hint="Helps identify this session in multi-device settings"
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2 font-semibold shadow-md shadow-indigo-500/25"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Access Workspace
          </Button>
        </form>

        {/* Footer Note */}
        <div className="pt-4 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)] space-y-1">
          <p>
            Credentials are set in the backend <code className="text-indigo-400 font-mono">.env</code>
          </p>
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 font-medium inline-block">
            ← Back to Landing Showcase
          </Link>
        </div>
      </div>
    </div>
  );
}
