import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// ---- Spinner ----
export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn("h-6 w-6 animate-spin text-accent-400", className)}
    />
  );
}

// ---- Full Page Loader ----
export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-2 border-primary-700" />
        <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-transparent border-t-accent-500 animate-spin" />
      </div>
      <p className="text-sm text-text-muted animate-pulse">Memuat...</p>
    </div>
  );
}

// ---- Skeleton Block ----
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-primary-700 animate-shimmer",
        className
      )}
    />
  );
}

// ---- Card Skeleton ----
export function CardSkeleton() {
  return (
    <div className="rounded-xl bg-primary-800 border border-border-secondary p-5 space-y-4">
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-2 w-24" />
      </div>
    </div>
  );
}

// ---- Table Skeleton ----
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full rounded-lg" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}
