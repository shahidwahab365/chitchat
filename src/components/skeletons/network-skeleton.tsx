import React from "react";

export function NetworkListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 animate-pulse"
        >
          {/* Left */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="size-11 rounded-full bg-muted ring-1 ring-border" />
            <div className="min-w-0 space-y-2">
              <div className="h-4 w-44 max-w-[60vw] rounded bg-muted" />
              <div className="h-4 w-64 max-w-[70vw] rounded bg-muted" />
              <div className="h-3 w-28 rounded bg-muted" />
            </div>
          </div>

          {/* Right actions (varies by tab, so keep generic blocks) */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="h-9 w-24 rounded-lg bg-muted" />
            <div className="h-9 w-24 rounded-lg bg-muted" />
          </div>

          {/* Mobile action placeholder */}
          <div className="sm:hidden h-9 w-20 rounded-lg bg-muted" />
        </div>
      ))}
    </div>
  );
}