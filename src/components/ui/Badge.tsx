import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'user' | 'assistant' | 'success' | 'warning';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const baseStyles =
    'inline-flex items-center gap-1 text-[11px] font-medium leading-none px-2 py-0.5 rounded-full select-none';

  const variants = {
    default: 'bg-zinc-800 text-zinc-300 border border-zinc-700/60',
    secondary: 'bg-zinc-900 text-zinc-400 border border-zinc-800',
    outline: 'bg-transparent text-zinc-300 border border-zinc-700',
    user: 'bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono',
    assistant: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono',
    success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
