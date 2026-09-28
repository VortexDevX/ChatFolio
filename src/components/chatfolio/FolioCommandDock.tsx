import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  FileDown,
  Link,
  Check,
  Sparkles,
  BookOpen,
  Loader2,
  FileText,
  HardDrive,
} from 'lucide-react';
import { ChatConversation, ThemeId } from '@/types/chat';

interface FolioCommandDockProps {
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
  onOpenStash?: () => void;
  stashCount?: number;
}

export const FolioCommandDock: React.FC<FolioCommandDockProps> = ({
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
  onOpenStash,
  stashCount,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  // Compute total word count
  const words = chat.messages
    .reduce((acc, m) => acc + (m.content ? m.content.split(/\s+/).length : 0), 0);

  const estimatedPages = Math.max(1, Math.ceil(words / 450));

  const handleCopyLink = () => {
    if (chat.share_id) {
      const url = `https://chatgpt.com/share/${chat.share_id}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <footer className="h-14 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between shrink-0 select-none z-20 transition-colors">
      {/* Left: Manuscript Statistics */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/40 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          {selectedCount} of {totalCount} chapters active
        </span>
        <span className="hidden md:inline text-xs font-medium text-slate-500 dark:text-slate-400">
          • {words.toLocaleString()} words • ~{estimatedPages} {estimatedPages === 1 ? 'page' : 'pages'}
        </span>
      </div>

      {/* Center: Rapid Batch Selection */}
      <div className="hidden sm:flex items-center gap-1 bg-slate-100/90 dark:bg-[#161f36] p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs">
        <button
          onClick={() => onSelectAll()}
          className="px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold hover:bg-white dark:hover:bg-blue-600 transition-colors"
          title="Select all passages"
        >
          All
        </button>

        <button
          onClick={() => onSelectRole('assistant')}
          className="px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold hover:bg-white dark:hover:bg-blue-600 transition-colors"
          title="Select only ChatGPT discourses"
        >
          Answers
        </button>

        <button
          onClick={() => onSelectRole('user')}
          className="px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold hover:bg-white dark:hover:bg-blue-600 transition-colors"
          title="Select only user prompts"
        >
          Prompts
        </button>

        <button
          onClick={() => onInvertSelection()}
          className="px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold hover:bg-white dark:hover:bg-blue-600 transition-colors"
          title="Invert current chapter selection"
        >
          Invert
        </button>

        <button
          onClick={() => onClearSelection()}
          className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold hover:bg-white dark:hover:bg-blue-600 transition-colors"
          title="Clear all selections"
        >
          None
        </button>
      </div>

      {/* Right: Export & Share Actions */}
      <div className="flex items-center gap-2">
        {chat.share_id && (
          <button
            onClick={handleCopyLink}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#161f36] transition-colors"
            title="Copy original ChatGPT share link"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-blue-600 dark:text-blue-400">Copied!</span>
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#161f36] transition-colors"
          title="Download formatted Markdown file"
        >
          <FileDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Markdown</span>
        </button>

        {onOpenStash && (
          <button
            onClick={onOpenStash}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#161f36] transition-colors"
            title="Open Export History & Quick Stash"
          >
            <HardDrive className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Stash</span>
            {stashCount !== undefined && stashCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-mono">
                {stashCount}
              </span>
            )}
          </button>
        )}

        {/* Primary Vector PDF Export Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onExportPdf}
          disabled={isExporting || selectedCount === 0}
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Publish Vector PDF</span>
            </>
          )}
        </motion.button>
      </div>
    </footer>
  );
};
