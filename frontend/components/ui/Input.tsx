import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-[var(--text-muted)] pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] px-3.5 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-[var(--text-muted)] flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <span className="text-xs text-rose-500">{error}</span>}
        {hint && !error && <span className="text-xs text-[var(--text-muted)]">{hint}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
