import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
  Palette,
  Sparkles,
  BookOpen,
  Sliders,
  FolderArchive,
} from 'lucide-react';
import { ChatConversation, ExportOptions, ThemeId } from '@/types/chat';
import { ChatFolioLogo } from '@/components/brand/ChatFolioLogo';
import { StoryboardDeck } from './StoryboardDeck';
import { FolioCanvas } from './FolioCanvas';
import { FinishesCabinet } from './FinishesCabinet';
import { FolioCommandDock } from './FolioCommandDock';

interface ChatFolioStudioProps {
  chat: ChatConversation;
  onBackToLanding: () => void;
  onUpdateTitle: (title: string) => void;
  selectedIds: Set<string>;
  onToggleMessage: (id: string, index: number, isShiftKey: boolean) => void;
  onUpdateMessage: (id: string, newContent: string) => void;
  onDeleteMessage: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onSelectRole: (role: 'user' | 'assistant') => void;
  onInvertSelection: () => void;
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  options: ExportOptions;
  onOptionsChange: (options: ExportOptions | ((prev: ExportOptions) => ExportOptions)) => void;
  onAutoRedact: () => void;
  onUndoRedact: () => void;
  redactedCount: number;
  onExportPdf: () => void;
  onExportMarkdown: () => void;
  isExporting: boolean;
  siteTheme: 'light' | 'dark';
  onToggleSiteTheme: () => void;
  onOpenArchive?: () => void;
  onOpenStash?: () => void;
  stashCount?: number;
}

export const ChatFolioStudio: React.FC<ChatFolioStudioProps> = ({
  chat,
  onBackToLanding,
  onUpdateTitle,
  selectedIds,
  onToggleMessage,
  onUpdateMessage,
  onDeleteMessage,
  onSelectAll,
  onClearSelection,
  onSelectRole,
  onInvertSelection,
  theme,
  onThemeChange,
  options,
  onOptionsChange,
  onAutoRedact,
  onUndoRedact,
  redactedCount,
  onExportPdf,
  onExportMarkdown,
  isExporting,
  siteTheme,
  onToggleSiteTheme,
  onOpenArchive,
  onOpenStash,
  stashCount,
}) => {
  const [activeView, setActiveView] = useState<'split' | 'manuscript' | 'storyboard'>('split');
  const [isCabinetOpen, setIsCabinetOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(chat.title || 'Untitled Folio');

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      onUpdateTitle(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 overflow-hidden select-none transition-colors">
      {/* Studio Header Command Bar */}
      <header className="h-14 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between z-30 shrink-0">
        {/* Left: Back + Logo + Inline Document Title */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161f36] transition-colors"
            title="Back to Anthology"
          >
            <ArrowLeft className="w-4 h-4 text-blue-500" />
            <span className="hidden md:inline">New Folio</span>
          </button>

          {onOpenArchive && (
            <button
              onClick={onOpenArchive}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161f36] transition-colors"
              title="Open Folio Archive & History"
            >
              <FolderArchive className="w-4 h-4 text-blue-500" />
              <span className="hidden md:inline">Archive</span>
            </button>
          )}

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
                  className="text-xs sm:text-sm font-bold bg-slate-100 dark:bg-[#161f36] border border-blue-500 rounded-lg px-2 py-0.5 text-slate-900 dark:text-white outline-none w-full"
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1 rounded-lg bg-blue-600 text-white hover:bg-blue-500"
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
                className="group flex items-center gap-1.5 text-left text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 hover:text-blue-500 truncate rounded px-1.5 py-0.5 -mx-1.5 hover:bg-slate-100/70 dark:hover:bg-[#161f36]/70 transition-colors"
                title="Click to rename publication"
              >
                <span className="truncate">{chat.title || 'Untitled Folio'}</span>
                <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            )}

            {chat.model && (
              <span className="hidden xl:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/30 shrink-0">
                {chat.model}
              </span>
            )}
          </div>
        </div>

        {/* Center: View Switcher */}
        <div className="hidden lg:flex items-center bg-slate-100/90 dark:bg-[#161f36] p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs font-semibold">
          <button
            onClick={() => setActiveView('split')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              activeView === 'split'
                ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-blue-500 dark:text-blue-200" />
            <span>Book Spread</span>
          </button>

          <button
            onClick={() => setActiveView('manuscript')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              activeView === 'manuscript'
                ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5 text-sky-500 dark:text-sky-200" />
            <span>Manuscript</span>
          </button>

          <button
            onClick={() => setActiveView('storyboard')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              activeView === 'storyboard'
                ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layout className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-200" />
            <span>Storyboard</span>
          </button>
        </div>

        {/* Right: Finishes Trigger + Sun/Moon Switch + Publish PDF Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Finishes & Print Cabinet Button */}
          <button
            onClick={() => setIsCabinetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0f172a] text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:border-blue-400 dark:hover:border-blue-700/60 transition-colors shadow-xs"
            title="Open Finishes, Typography & Page Setup"
          >
            <Palette className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Finishes & Style</span>
          </button>

          {/* Sun / Moon Switch */}
          <button
            onClick={onToggleSiteTheme}
            className="p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161f36] transition-colors"
            title={`Switch to ${siteTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {siteTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-600" />
            )}
          </button>

          {/* Primary Publish PDF Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExportPdf}
            disabled={isExporting || selectedIds.size === 0}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Publish PDF</span>
              </>
            )}
          </motion.button>
        </div>
      </header>

      {/* Main Workbench Body Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Pane: Storyboard Deck */}
        {(activeView === 'split' || activeView === 'storyboard') && (
          <div
            className={`${
              activeView === 'storyboard' ? 'w-full' : 'w-full lg:w-[480px] xl:w-[520px]'
            } h-full overflow-hidden flex flex-col shrink-0`}
          >
            <StoryboardDeck
              chat={chat}
              selectedIds={selectedIds}
              onToggleMessage={onToggleMessage}
              onUpdateMessage={onUpdateMessage}
              onDeleteMessage={onDeleteMessage}
              onSelectAll={onSelectAll}
              onClearSelection={onClearSelection}
              onSelectRole={onSelectRole}
              showThoughts={options.show_thoughts}
              theme={theme}
            />
          </div>
        )}

        {/* Right Pane: Live Folio Canvas */}
        {(activeView === 'split' || activeView === 'manuscript') && (
          <div
            className={`${
              activeView === 'manuscript' ? 'w-full' : 'hidden lg:flex flex-1'
            } h-full overflow-hidden`}
          >
            <FolioCanvas
              chat={chat}
              theme={theme}
              options={options}
              selectedIds={selectedIds}
            />
          </div>
        )}
      </div>

      {/* Docked Control Footer (Permanently Docked, Zero Content Overlap) */}
      <FolioCommandDock
        chat={chat}
        selectedCount={selectedIds.size}
        totalCount={chat.messages.length}
        onSelectAll={onSelectAll}
        onClearSelection={onClearSelection}
        onSelectRole={onSelectRole}
        onInvertSelection={onInvertSelection}
        onExportPdf={onExportPdf}
        onExportMarkdown={onExportMarkdown}
        isExporting={isExporting}
        theme={theme}
        onOpenStash={onOpenStash}
        stashCount={stashCount}
      />

      {/* Sliding Finishes Cabinet */}
      <FinishesCabinet
        isOpen={isCabinetOpen}
        onClose={() => setIsCabinetOpen(false)}
        theme={theme}
        onThemeChange={onThemeChange}
        options={options}
        onOptionsChange={onOptionsChange}
        onAutoRedact={onAutoRedact}
        onUndoRedact={onUndoRedact}
        redactedCount={redactedCount}
      />
    </div>
  );
};
