"use client";

export default function LoadingSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="card h-32 animate-pulse overflow-hidden bg-gradient-to-r from-slate-900/40 via-slate-800/60 to-slate-900/40"
        />
      ))}
    </div>
  );
}
