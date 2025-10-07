import React from "react";

export function FeaturedSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <div className="h-7 w-56 bg-[hsl(var(--muted))] rounded" />
        <div className="mt-2 h-4 w-80 bg-[hsl(var(--muted))] rounded" />
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-36 rounded-full bg-[hsl(var(--muted))]" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-card/70 p-6">
            <div className="h-40 w-full rounded-xl bg-[hsl(var(--muted))]" />
            <div className="mt-4 h-4 w-48 bg-[hsl(var(--muted))] rounded" />
            <div className="mt-3 grid sm:grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-3 w-full bg-[hsl(var(--muted))] rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GridSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/60 bg-card/70 p-6">
          <div className="h-5 w-48 bg-[hsl(var(--muted))] rounded" />
          <div className="mt-3 h-3 w-full bg-[hsl(var(--muted))] rounded" />
          <div className="mt-2 h-3 w-2/3 bg-[hsl(var(--muted))] rounded" />
        </div>
      ))}
    </div>
  );
}
