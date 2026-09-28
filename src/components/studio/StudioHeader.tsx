import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  ArrowLeft,
  Sun,
  Moon,
  Download,
  Loader2,
  Check,
  Edit2,
  Columns,
  Maximize2,
  Layout,
  ChevronDown,
} from 'lucide-react';
import { ChatConversation, ThemeId } from '@/types/chat';
import { THEMES } from '@/tokens/theme';
import { useClickOutside } from '@/hooks/useClickOutside';

interface StudioHeaderProps {
  chat: ChatConversation;
  onBackToLanding: () => void;
  onUpdateTitle: (title: string) => void;
  activeView: 'split' | 'editor' | 'preview';
  onViewChange: (view: 'split' | 'editor' | 'preview') => void;
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  siteTheme: 'light' | 'dark';
  onToggleSiteTheme: () => void;
  onExportPdf: () => void;
  isExporting: boolean;
  selectedCount: number;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  chat,
  onBackToLanding,
  onUpdateTitle,
  activeView,
  onViewChange,
  theme,
  onThemeChange,
  siteTheme,
  onToggleSiteTheme,
  onExportPdf,
  isExporting,
  selectedCount,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(chat.title || 'Untitled Document');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(themeMenuRef, () => setShowThemeMenu(false), showThemeMenu);

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      onUpdateTitle(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const currentTheme = THEMES[theme] || THEMES.editorial;

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0c1220]/95 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between z-30 shrink-0 select-none transition-colors">
      {/* Left: Back + Brand + Document Title */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Back to Link Importer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden md:inline">New Document</span>
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* Editable Document Title */}
        <div className="flex items-center gap-1.5 min-w-0 max-w-[200px] sm:max-w-[320px] lg:max-w-[460px]">
          {isEditingTitle ? (
            <div className="flex items-center gap-1 min-w-0">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') {
                    setTempTitle(chat.title);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                className="text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-900 border border-emerald-500 rounded-md px-2 py-0.5 text-slate-900 dark:text-white outline-none w-full"
              />
              <button
                onClick={handleSaveTitle}
                className="p-1 rounded bg-emerald-500 text-white hover:bg-emerald-600"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTempTitle(chat.title);
                setIsEditingTitle(true);
              }}
              className="group flex items-center gap-1.5 text-left text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 truncate rounded px-1.5 py-0.5 -mx-1.5 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors"
              title="Click to rename document"
            >
              <span className="truncate">{chat.title || 'Untitled Document'}</span>
              <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          )}

          {chat.model && (
            <span className="hidden xl:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
              {chat.model}
            </span>
          )}
        </div>
      </div>

      {/* Center: View Switcher (Desktop) */}
      <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium">
        <button
          onClick={() => onViewChange('split')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
            activeView === 'split'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Columns className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Split Studio</span>
        </button>

        <button
          onClick={() => onViewChange('editor')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
            activeView === 'editor'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layout className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>Messages</span>
        </button>

        <button
          onClick={() => onViewChange('preview')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
            activeView === 'preview'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Document Preview</span>
        </button>
      </div>

      {/* Right: Theme Selector + Light/Dark Toggle + Primary PDF Export */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Theme Dropdown with Click-Outside Closing */}
        <div className="relative" ref={themeMenuRef}>
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs"
            title="Change Document Theme"
          >
            <span
              className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
              style={{ backgroundColor: currentTheme.swatchAccent }}
            />
            <span className="hidden sm:inline">{currentTheme.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          <AnimatePresence>
            {showThemeMenu && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-1.5 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xl p-1.5 z-50 text-slate-800 dark:text-slate-200"
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Document Theme
                </div>
                {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
                  const t = THEMES[tId];
                  const isSelected = tId === theme;
                  return (
                    <button
                      key={tId}
                      onClick={() => {
                        onThemeChange(tId);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: t.swatchAccent }}
                        />
                        <span>{t.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={onToggleSiteTheme}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${siteTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {siteTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Primary Export Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onExportPdf}
          disabled={isExporting || selectedCount === 0}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </>
          )}
        </motion.button>
      </div>
    </header>
  );
};
