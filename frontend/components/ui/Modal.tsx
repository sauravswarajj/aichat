"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 shadow-2xl z-10 transition-all animate-in zoom-in-95 duration-150",
          maxWidthStyles[maxWidth]
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 rounded-md hover:bg-[var(--bg-hover)]"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {(title || description) && (
          <div className="mb-4">
            {title && <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>}
            {description && <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>}
          </div>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
}
