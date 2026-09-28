import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  Square,
  Bot,
  User,
  Download,
  Eye,
  ArrowLeftRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeId } from '@/types/chat';

interface SelectionToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onSelectRole: (role: 'user' | 'assistant') => void;
  onInvertSelection?: () => void;
  onOpenPreview?: () => void;
  onExportPdf: () => void;
  isExporting: boolean;
  theme?: ThemeId;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onSelectRole,
  onInvertSelection,
  onOpenPreview,
  onExportPdf,
  isExporting,
}) => {
  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-3 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-full shadow-xl dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] select-none max-w-[95vw] overflow-x-auto text-slate-800 dark:text-slate-200 transition-colors"
    >
      {/* Selection Stats */}
      <div className="flex items-center gap-1.5 pr-2 sm:pr-3 border-r border-slate-200 dark:border-slate-700">
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
          {selectedCount}
        </span>
        <span className="text-xs whitespace-nowrap font-medium text-slate-500 dark:text-slate-400">
          of {totalCount} in PDF
        </span>
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-1">
        <button
          onClick={allSelected ? onClearSelection : onSelectAll}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {allSelected ? (
            <Square className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
          )}
          <span>{allSelected ? 'None' : 'All'}</span>
        </button>

        {onInvertSelection && (
          <button
            onClick={onInvertSelection}
            title="Invert current selection"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Invert</span>
          </button>
        )}

        <button
          onClick={() => onSelectRole('assistant')}
          title="Select only ChatGPT answers"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Bot className="w-3.5 h-3.5 text-emerald-500" />
          <span>Answers</span>
        </button>

        <button
          onClick={() => onSelectRole('user')}
          title="Select only your questions"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <User className="w-3.5 h-3.5 text-rose-500" />
          <span>Questions</span>
        </button>
      </div>

      {/* Actions: Preview & Download */}
      <div className="flex items-center gap-1.5 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-700">
        {onOpenPreview && (
          <button
            onClick={onOpenPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>Preview</span>
          </button>
        )}
        <Button
          variant="primary"
          size="sm"
          onClick={onExportPdf}
          loading={isExporting}
          icon={<Download className="w-3.5 h-3.5" />}
          className="rounded-full shadow-sm text-xs font-medium px-4 cursor-pointer"
        >
          <span>Download PDF</span>
        </Button>
      </div>
    </motion.div>
  );
};
