import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-4 animate-pulse">
      {/* Skeleton Header */}
      <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-3">
        <div className="h-4 w-28 bg-zinc-800 rounded" />
        <div className="h-6 w-3/4 bg-zinc-800 rounded" />
        <div className="h-3 w-1/2 bg-zinc-800/60 rounded" />
      </div>

      {/* Skeleton Bubbles */}
      <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-zinc-800" />
          <div className="h-3 w-20 bg-zinc-800 rounded" />
        </div>
        <div className="h-4 w-full bg-zinc-800/80 rounded" />
        <div className="h-4 w-5/6 bg-zinc-800/60 rounded" />
      </div>

      <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-zinc-800" />
          <div className="h-3 w-24 bg-zinc-800 rounded" />
        </div>
        <div className="h-4 w-full bg-zinc-800/80 rounded" />
        <div className="h-4 w-11/12 bg-zinc-800/70 rounded" />
        <div className="h-4 w-2/3 bg-zinc-800/50 rounded" />
        <div className="h-28 w-full bg-zinc-950 border border-zinc-850 rounded-lg mt-3" />
      </div>
    </div>
  );
};
