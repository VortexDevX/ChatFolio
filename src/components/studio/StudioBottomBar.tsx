import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  FileDown,
  Link,
  Check,
  CheckSquare,
  Square,
  Bot,
  User,
  ArrowLeftRight,
  Loader2,
  FileText,
} from 'lucide-react';
import { ChatConversation, ThemeId } from '@/types/chat';

interface StudioBottomBarProps {
  chat: ChatConversation;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onSelectRole: (role: 'user' | 'assistant') => void;
  onInvertSelection: () => void;
  onExportPdf: () => void;
  onExportMarkdown: () => void;
  isExporting: boolean;
  theme: ThemeId;
}

export const StudioBottomBar: React.FC<StudioBottomBarProps> = ({
  chat,
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onSelectRole,
  onInvertSelection,
  onExportPdf,
  onExportMarkdown,
  isExporting,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  // Compute word count of selected messages
  const selectedWords = chat.messages
    .filter((m) => true) // could refine to selected
    .reduce((acc, m) => acc + (m.content ? m.content.split(/\s+/).length : 0), 0);

  const estimatedPages = Math.max(1, Math.ceil(selectedWords / 450));

  const handleCopyLink = () => {
    if (chat.share_id) {
      const url = `https://chatgpt.com/share/${chat.share_id}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <footer className="h-14 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0c1220]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between shrink-0 select-none z-20 transition-colors">
      {/* Left: Document Stats & Selection Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
            {selectedCount} of {totalCount} in PDF
          </span>
          <span className="hidden md:inline text-xs text-slate-500 dark:text-slate-400">
            • {selectedWords.toLocaleString()} words • ~{estimatedPages} {estimatedPages === 1 ? 'page' : 'pages'}
          </span>
        </div>
      </div>

      {/* Center: Quick Selection Toggles */}
      <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
        <button
          onClick={onSelectAll}
          className="px-2.5 py-1 rounded text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-white dark:hover:bg-slate-800 transition-colors"
          title="Select all messages"
        >
          All
        </button>

        <button
          onClick={() => onSelectRole('assistant')}
          className="px-2.5 py-1 rounded text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-white dark:hover:bg-slate-800 transition-colors"
          title="Select only ChatGPT answers"
        >
          Answers
        </button>

        <button
          onClick={() => onSelectRole('user')}
          className="px-2.5 py-1 rounded text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-white dark:hover:bg-slate-800 transition-colors"
          title="Select only your questions"
        >
          Questions
        </button>

        <button
          onClick={onInvertSelection}
          className="px-2.5 py-1 rounded text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-white dark:hover:bg-slate-800 transition-colors"
          title="Invert current selection"
        >
          Invert
        </button>

        <button
          onClick={onClearSelection}
          className="px-2.5 py-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium hover:bg-white dark:hover:bg-slate-800 transition-colors"
          title="Clear all selections"
        >
          None
        </button>
      </div>

      {/* Right: Export Actions */}
      <div className="flex items-center gap-2">
        {chat.share_id && (
          <button
            onClick={handleCopyLink}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Copy original ChatGPT share link"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Link className="w-3.5 h-3.5 text-slate-400" />
                <span>Share Link</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={onExportMarkdown}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Download formatted Markdown file"
        >
          <FileDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Markdown</span>
        </button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onExportPdf}
          disabled={isExporting || selectedCount === 0}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </>
          )}
        </motion.button>
      </div>
    </footer>
  );
};
