import React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: ToggleProps) {
  return (
    <label
      className={cn(
        'flex items-start justify-between gap-3 cursor-pointer select-none group',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs font-semibold text-inherit transition-opacity group-hover:opacity-100">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] opacity-70 leading-tight mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 mt-0.5',
          checked ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-700'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm ring-0 transition duration-150 ease-in-out mt-[1px] ml-[1px]',
            checked ? 'translate-x-3' : 'translate-x-0'
          )}
        />
      </button>
    </label>
  );
}
