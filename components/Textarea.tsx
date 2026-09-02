"use client";

import { cn } from "@/lib/utils";
import { type TextareaHTMLAttributes, type ReactNode } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  helperText?: string;
}

export default function Textarea({
  label,
  error,
  icon,
  helperText,
  className,
  id,
  ...props
}: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-secondary"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-3 text-text-muted">
            {icon}
          </span>
        )}
        <textarea
          id={inputId}
          className={cn(
            "w-full rounded-xl bg-white border border-border-primary px-4 py-2.5 text-sm text-text-primary resize-y shadow-sm",
            "placeholder:text-text-muted",
            "focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/20",
            "transition-all duration-200",
            !!icon && "pl-10",
            error && "border-error-500/50 focus:border-error-500/50 focus:ring-error-500/20",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-error-400">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-text-muted">{helperText}</p>
      )}
    </div>
  );
}
