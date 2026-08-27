"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Plus,
  Search,
  MessageSquare,
  MoreVertical,
  Edit2,
  Trash2,
  Settings,
  LogOut,
  Bot,
  X,
  Code2,
  Sparkles,
  Image,
  BookOpen,
  Layers,
  FileText,
  PanelLeftClose,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useThreadsQuery, useRenameThreadMutation, useDeleteThreadMutation } from "@/hooks/useThreads";
import { useAuth } from "@/providers/AuthProvider";
import { getThreadTimeGroup, truncateText, cn } from "@/lib/utils";
import { ThreadSummary } from "@/types/api.types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Skeleton } from "@/components/ui/Skeleton";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { data: threads, isLoading } = useThreadsQuery();

  const renameMutation = useRenameThreadMutation();
  const deleteMutation = useDeleteThreadMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Collapsible Workspaces accordion state (collapsed by default to bring Today chats up)
  const [isWorkspacesOpen, setIsWorkspacesOpen] = useState(false);

  // Rename modal state
  const [renamingThread, setRenamingThread] = useState<ThreadSummary | null>(null);
  const [newTitle, setNewTitle] = useState("");

  // Delete modal state
  const [deletingThread, setDeletingThread] = useState<ThreadSummary | null>(null);

  // Auto-close on mobile when link is clicked
  const handleNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onClose();
    }
  };

  // Filter out unused 0-turn empty threads unless currently active or searching
  const filteredThreads = useMemo(() => {
    if (!threads) return [];
    const validThreads = threads.filter(
      (t) => (t.turnCount && t.turnCount > 0) || pathname === `/chat/${t.id}` || searchQuery.trim().length > 0
    );
    if (!searchQuery.trim()) return validThreads;
    return validThreads.filter(
      (t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.preview?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [threads, searchQuery, pathname]);

  const groupedThreads = useMemo(() => {
    const groups: {
      today: ThreadSummary[];
      yesterday: ThreadSummary[];
      previous7Days: ThreadSummary[];
      older: ThreadSummary[];
    } = {
      today: [],
      yesterday: [],
      previous7Days: [],
      older: [],
    };

    for (const t of filteredThreads) {
      const group = getThreadTimeGroup(t.updatedAt || t.createdAt);
      if (groups[group]) {
        groups[group].push(t);
      } else {
        groups.today.push(t);
      }
    }

    return groups;
  }, [filteredThreads]);

  const handleStartRename = (t: ThreadSummary, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(null);
    setRenamingThread(t);
    setNewTitle(t.title);
  };

  const handleConfirmRename = async () => {
    if (!renamingThread || !newTitle.trim()) return;
    await renameMutation.mutateAsync({ id: renamingThread.id, title: newTitle.trim() });
    setRenamingThread(null);
  };

  const handleStartDelete = (t: ThreadSummary, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(null);
    setDeletingThread(t);
  };

  const handleConfirmDelete = async () => {
    if (!deletingThread) return;
    await deleteMutation.mutateAsync(deletingThread.id);
    if (pathname === `/chat/${deletingThread.id}`) {
      router.push("/dashboard");
    }
    setDeletingThread(null);
  };

  const renderThreadItem = (t: ThreadSummary) => {
    const isActive = pathname === `/chat/${t.id}`;

    return (
      <div key={t.id} className="relative group">
        <Link
          href={`/chat/${t.id}`}
          onClick={handleNavClick}
          className={cn(
            "flex items-center justify-between gap-2 px-3 py-1.5 rounded text-sm transition-all duration-150 relative",
            isActive
              ? "bg-[#adc6ff]/10 text-[#adc6ff] font-medium border-l-2 border-[#adc6ff]"
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          )}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <MessageSquare className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-[#adc6ff]" : "text-[var(--text-muted)]")} />
            <div className="truncate text-xs">
              <span className="block truncate font-medium">{t.title || "Untitled Chat"}</span>
              {t.preview && (
                <span className="block truncate text-[10px] text-[var(--text-muted)] opacity-70">
                  {truncateText(t.preview, 34)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {t.turnCount > 1 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                {t.turnCount}
              </span>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveMenuId(activeMenuId === t.id ? null : t.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[var(--bg-tertiary)] rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-opacity"
              aria-label="Thread options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </Link>

        {/* Dropdown Menu */}
        {activeMenuId === t.id && (
          <div
            className="absolute right-2 top-7 z-30 w-36 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-xl py-1 text-xs animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => handleStartRename(t, e)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Rename</span>
            </button>
            <button
              onClick={(e) => handleStartDelete(t, e)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-rose-400 hover:bg-rose-500/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "shrink-0 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col h-full z-40 transition-all duration-300 ease-in-out fixed lg:static top-0 bottom-0 left-0",
          isOpen
            ? "w-[280px] translate-x-0 opacity-100 shadow-2xl lg:shadow-none"
            : "w-0 -translate-x-full lg:w-0 lg:border-r-0 overflow-hidden opacity-0 pointer-events-none"
        )}
      >
        <div className="w-[280px] flex flex-col h-full">
          {/* Workspace Header — Jaishwal AI Branding */}
          <div className="p-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-3">
              <Link href="/dashboard" onClick={handleNavClick} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 flex items-center justify-center shadow-md shadow-blue-500/20 border border-[var(--border-subtle)]">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-sm tracking-tight text-[#adc6ff] font-sans">
                    Jaishwal AI
                  </h1>
                  <span className="block text-[10px] text-[var(--text-muted)] font-mono tracking-wider">
                    Collaborative Engine
                  </span>
                </div>
              </Link>

              {/* Single Clean Collapse Button in Sidebar Header */}
              <button
                onClick={onClose}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded hover:bg-[var(--bg-hover)] transition-colors"
                title="Collapse sidebar (Ctrl+B)"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* New Chat Button */}
            <Link href="/dashboard" onClick={handleNavClick}>
              <button className="w-full bg-[#adc6ff] text-[#002e6a] hover:bg-[#d8e2ff] py-2 px-3 rounded font-mono text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]">
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </button>
            </Link>

            {/* Search Bar */}
            <div className="mt-3 relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search threads..."
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded py-1.5 pl-8 pr-7 text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#adc6ff] focus:ring-1 focus:ring-[#adc6ff]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation & Thread Groups (Scrollable) */}
          <div className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-1">
            {/* Collapsible Workspaces Accordion (> Workspaces) */}
            <div className="pt-1 pb-1">
              <button
                type="button"
                onClick={() => setIsWorkspacesOpen(!isWorkspacesOpen)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors group select-none"
              >
                <div className="flex items-center gap-1.5">
                  {isWorkspacesOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-indigo-400 transition-transform" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-indigo-400 transition-transform" />
                  )}
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Workspaces
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                  5
                </span>
              </button>

              {/* Workspaces List (Revealed when open) */}
              {isWorkspacesOpen && (
                <div className="pl-3.5 pr-1 py-1 space-y-0.5 border-l border-[var(--border-subtle)] ml-3 mt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  <Link
                    href="/dashboard"
                    onClick={handleNavClick}
                    className="flex items-center gap-2 px-2 py-1.5 rounded text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5 text-[#adc6ff]" />
                    <span>Coding</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={handleNavClick}
                    className="flex items-center gap-2 px-2 py-1.5 rounded text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#4edea3]" />
                    <span>Prompting</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={handleNavClick}
                    className="flex items-center gap-2 px-2 py-1.5 rounded text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <Image className="w-3.5 h-3.5 text-[#ffb786]" />
                    <span>Visuals</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={handleNavClick}
                    className="flex items-center gap-2 px-2 py-1.5 rounded text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>Research</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={handleNavClick}
                    className="flex items-center gap-2 px-2 py-1.5 rounded text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#a78bfa]" />
                    <span>General</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Threads History — Immediately visible right below */}
            <div className="pt-1">
              {isLoading ? (
                <div className="space-y-2 p-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--text-muted)] font-mono">
                  {searchQuery ? "No matching chats" : "No saved chats yet"}
                </div>
              ) : (
                <>
                  {groupedThreads.today.length > 0 && (
                    <div className="mb-2">
                      <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Today
                      </div>
                      <div className="space-y-0.5">{groupedThreads.today.map(renderThreadItem)}</div>
                    </div>
                  )}

                  {groupedThreads.yesterday.length > 0 && (
                    <div className="mb-2">
                      <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Yesterday
                      </div>
                      <div className="space-y-0.5">{groupedThreads.yesterday.map(renderThreadItem)}</div>
                    </div>
                  )}

                  {groupedThreads.previous7Days.length > 0 && (
                    <div className="mb-2">
                      <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Previous 7 Days
                      </div>
                      <div className="space-y-0.5">{groupedThreads.previous7Days.map(renderThreadItem)}</div>
                    </div>
                  )}

                  {groupedThreads.older.length > 0 && (
                    <div className="mb-2">
                      <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Older
                      </div>
                      <div className="space-y-0.5">{groupedThreads.older.map(renderThreadItem)}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer (From Stitch Design) */}
          <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]/70 space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-mono text-[var(--text-muted)]">Theme</span>
              <ThemeToggle />
            </div>

            <Link
              href="/settings"
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-mono transition-colors",
                pathname === "/settings"
                  ? "bg-[#adc6ff]/10 text-[#adc6ff] font-medium"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              )}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </Link>

            <Link
              href="/"
              onClick={handleNavClick}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Docs & Showcase</span>
            </Link>

            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-mono text-[var(--text-secondary)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Rename Modal */}
      <Modal
        isOpen={Boolean(renamingThread)}
        onClose={() => setRenamingThread(null)}
        title="Rename Conversation"
        description="Choose a clear title for this chat thread."
      >
        <div className="space-y-4 mt-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Conversation title"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirmRename();
            }}
          />
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setRenamingThread(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={renameMutation.isPending}
              disabled={!newTitle.trim()}
              onClick={handleConfirmRename}
            >
              Save Title
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={Boolean(deletingThread)}
        onClose={() => setDeletingThread(null)}
        title="Delete Conversation"
        description="Are you sure you want to permanently delete this thread? This action cannot be undone."
      >
        <div className="flex items-center justify-end gap-2 mt-4">
          <Button variant="ghost" size="sm" onClick={() => setDeletingThread(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={deleteMutation.isPending}
            onClick={handleConfirmDelete}
          >
            Delete Thread
          </Button>
        </div>
      </Modal>
    </>
  );
}
