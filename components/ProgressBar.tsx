"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
  animated?: boolean;
}

export default function ProgressBar({
  value,
  size = "md",
  showLabel = true,
  className,
  animated = true,
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  const sizeStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3.5",
  };

  const getGradient = () => {
    if (clampedValue >= 100) return "from-emerald-500 to-emerald-400";
    if (clampedValue >= 60) return "from-accent-600 to-accent-400";
    if (clampedValue >= 30) return "from-amber-600 to-amber-400";
    return "from-secondary-600 to-secondary-400";
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex-1 rounded-full bg-primary-700 overflow-hidden",
          sizeStyles[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out",
            getGradient(),
            animated && "animate-[progress-bar_1s_ease-out]"
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-text-secondary min-w-[3ch] text-right">
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  );
}
