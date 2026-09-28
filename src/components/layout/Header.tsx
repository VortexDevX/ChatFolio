import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Sparkles,
  ChevronDown,
  Sun,
  Moon,
  Sliders,
  Eye,
  Download,
  Code2,
  Atom,
  BookOpen,
  Database,
  UtensilsCrossed,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SampleChatSummary, ThemeId } from '@/types/chat';
import { THEMES } from '@/tokens/theme';
import { useClickOutside } from '@/hooks/useClickOutside';
import { cn } from '@/lib/utils';

interface HeaderProps {
  samples: SampleChatSummary[];
  onSelectSample: (id: string) => void;
  onOpenRawModal: () => void;
  onToggleExportDrawer: () => void;
  isDrawerOpen: boolean;
  onExportPdf: () => void;
  onPrintBrowser: () => void;
  onAutoRedact: () => void;
  onUndoRedact: () => void;
  redactedCount: number;
  isExporting: boolean;
  hasConversation: boolean;
  theme: ThemeId;
  onOpenPreview?: () => void;
  onExportMarkdown?: () => void;
  onExportHtml?: () => void;
  siteTheme?: 'light' | 'dark';
  onToggleSiteTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  samples,
  onSelectSample,
  onOpenRawModal,
  onToggleExportDrawer,
  isDrawerOpen,
  onExportPdf,
  hasConversation,
  theme,
  onOpenPreview,
  siteTheme = 'light',
  onToggleSiteTheme,
  isExporting,
}) => {
  const [showSamplesMenu, setShowSamplesMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useClickOutside(dropdownRef, () => setShowSamplesMenu(false), showSamplesMenu);

  const currentTheme = THEMES[theme] || THEMES.obsidian;

  const getSampleIcon = (id: string) => {
    if (id.includes('express') || id.includes('api') || id.includes('code')) {
      return <Code2 className="w-3.5 h-3.5 text-emerald-500" />;
    }
    if (id.includes('quantum') || id.includes('physics')) {
      return <Atom className="w-3.5 h-3.5 text-cyan-500" />;
    }
    if (id.includes('story') || id.includes('lighthouse')) {
      return <BookOpen className="w-3.5 h-3.5 text-amber-500" />;
    }
    if (id.includes('postgres') || id.includes('schema') || id.includes('db')) {
      return <Database className="w-3.5 h-3.5 text-purple-500" />;
    }
    if (id.includes('meal') || id.includes('prep')) {
      return <UtensilsCrossed className="w-3.5 h-3.5 text-rose-500" />;
    }
    return <FileText className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between select-none transition-colors">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm"
        >
          <FileText className="w-4 h-4 stroke-[2.2]" />
        </motion.div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              GPT-PDF
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20">
              Studio
            </span>
            {hasConversation && (
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pl-1">
                <span>•</span>
                <span>{currentTheme.name}</span>
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            Turn ChatGPT conversations into beautiful documents
          </span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Sample Chats Dropdown with Click-Outside Closing */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSamplesMenu((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Examples</span>
            <ChevronDown
              className={cn(
                'w-3 h-3 text-slate-400 transition-transform duration-200',
                showSamplesMenu && 'rotate-180'
              )}
            />
          </motion.button>

          <AnimatePresence>
            {showSamplesMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-76 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-2xl py-2 z-50 overflow-hidden"
              >
                <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                    Try an Example Chat
                  </span>
                  <span className="text-[10px] text-slate-400">5 curated</span>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-0.5 px-1.5">
                  {samples.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        onSelectSample(s.id);
                        setShowSamplesMenu(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors flex items-center gap-2.5 cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center shrink-0 group-hover:border-emerald-500/40">
                        {getSampleIcon(s.id)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          {s.title}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                          <span className="font-medium text-slate-500 dark:text-slate-400">{s.category || 'General'}</span>
                          <span>•</span>
                          <span>{s.message_count} messages</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Paste Text / Raw Input */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenRawModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
          title="Paste conversation text directly"
        >
          <Code2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Paste Text</span>
        </motion.button>

        {/* Live Preview Button */}
        {hasConversation && onOpenPreview && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20 transition-all cursor-pointer shadow-2xs"
            title="Preview how the PDF will look"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </motion.button>
        )}

        {/* Settings / Customize Drawer Trigger */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onToggleExportDrawer}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shadow-2xs border',
            isDrawerOpen
              ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
              : 'text-slate-700 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700'
          )}
          title="Customize document style, layout, and privacy"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Settings</span>
        </motion.button>

        {/* Primary Export CTA */}
        {hasConversation && (
          <Button
            variant="primary"
            size="sm"
            onClick={onExportPdf}
            loading={isExporting}
            icon={<Download className="w-3.5 h-3.5" />}
            className="shadow-sm font-medium ml-0.5 rounded-xl"
          >
            <span>PDF</span>
          </Button>
        )}

        {/* Light Mode / Dark Mode Switcher */}
        {onToggleSiteTheme && (
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onToggleSiteTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer ml-1"
            title={siteTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle website theme"
          >
            {siteTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 transition-transform duration-300 rotate-0 hover:-rotate-12" />
            )}
          </motion.button>
        )}
      </div>
    </header>
  );
};
