import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'honey';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'sm', loading, icon, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer';

    const variants = {
      primary:
        'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border border-emerald-700 font-semibold',
      secondary:
        'bg-white hover:bg-stone-50 text-stone-800 border border-stone-250 shadow-sm',
      outline:
        'bg-white/90 hover:bg-stone-100 text-stone-700 border border-stone-300 shadow-sm',
      ghost:
        'bg-transparent hover:bg-black/10 active:bg-black/20 text-inherit hover:opacity-100 opacity-85 transition-opacity',
      danger:
        'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200',
      honey:
        'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300',
    };

    const sizes = {
      xs: 'h-7 px-2.5 text-xs rounded-lg gap-1.5',
      sm: 'h-8 px-3 text-xs rounded-xl gap-2',
      md: 'h-9 px-4 text-sm rounded-xl gap-2',
      lg: 'h-11 px-5 text-base rounded-2xl gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
