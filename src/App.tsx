import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code2, Sparkles, Loader2 } from 'lucide-react';
import { useConversation } from '@/hooks/useConversation';
import { useSelection } from '@/hooks/useSelection';
import { useExport } from '@/hooks/useExport';
import { useSiteTheme } from '@/hooks/useSiteTheme';
import { ChatFolioLanding } from '@/components/chatfolio/ChatFolioLanding';
import { ChatFolioStudio } from '@/components/chatfolio/ChatFolioStudio';
import { FolioArchiveDrawer } from '@/components/chatfolio/FolioArchiveDrawer';
import { ExportStashModal } from '@/components/chatfolio/ExportStashModal';
import { ExportOptions, ThemeId } from '@/types/chat';
import {
  SavedFolio,
  saveFolioToArchive,
  getRecentFolios,
  getExportStash,
} from '@/lib/storage';

export function App() {
  const {
    chat,
    samples,
    loading,
    error,
    redactedCount,
    loadUrl,
    loadRaw,
    loadSample,
    loadChatDirect,
    updateMessageContent,
    deleteMessage,
    redactMessages,
    undoRedaction,
    updateTitle,
  } = useConversation();

  const {
    selectedIds,
    toggleMessage,
    selectAll,
    clearSelection,
    selectRole,
    invertSelection,
    resetSelection,
  } = useSelection(chat?.messages || []);

  const { isExporting, exportPdf, exportMarkdown } = useExport();
  const { siteTheme, toggleSiteTheme } = useSiteTheme();

  // Document Styling Finish Preset (Default to Editorial Paper for elegant light theme)
  const [theme, setTheme] = useState<ThemeId>('editorial');
  const [isRawModalOpen, setIsRawModalOpen] = useState(false);
  const [rawInput, setRawInput] = useState('');

  // Storage Drawers & History State
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isStashOpen, setIsStashOpen] = useState(false);
  const [recentFolios, setRecentFolios] = useState<SavedFolio[]>([]);
  const [stashCount, setStashCount] = useState<number>(0);

  const [options, setOptions] = useState<ExportOptions>({
    paper_size: 'A4',
    font_family: 'system',
    font_size: 'medium',
    margins: 'normal',
    page_break_mode: 'message',
    custom_title: '',
    custom_subtitle: '',
    author_tag: '',
    watermark: '',
    show_user_msgs: true,
    show_ai_msgs: true,
    show_thoughts: false,
    show_metadata_banner: true,
    show_line_numbers: false,
  });

  const refreshStorage = () => {
    getRecentFolios().then(setRecentFolios);
    getExportStash().then((items) => setStashCount(items.length));
  };

  useEffect(() => {
    refreshStorage();
  }, []);

  // Debounced auto-save current folio to local archive whenever edits occur
  useEffect(() => {
    if (!chat || !chat.messages || chat.messages.length === 0) return;
    const timer = setTimeout(async () => {
      await saveFolioToArchive(chat, theme, options, Array.from(selectedIds));
      getRecentFolios().then(setRecentFolios);
    }, 600);
    return () => clearTimeout(timer);
  }, [chat, theme, options, selectedIds]);

  // Sync selection when switching conversations
  const prevShareIdRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (chat) {
      if (prevShareIdRef.current !== chat.share_id) {
        prevShareIdRef.current = chat.share_id;
        resetSelection(chat.messages);
      }
      setOptions((prev) => ({
        ...prev,
        custom_title: prev.custom_title || chat.title || 'Untitled Folio',
      }));
    }
  }, [chat?.share_id, chat?.title, resetSelection]);

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRawModalOpen) {
        setIsRawModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRawModalOpen]);

  const handleSelectSavedFolio = (saved: SavedFolio) => {
    loadChatDirect(saved.chat);
    setTheme(saved.theme);
    setOptions(saved.options);
    setIsArchiveOpen(false);
  };

  const handleExportPdf = async () => {
    if (!chat) return;
    try {
      await exportPdf(chat, theme, options, Array.from(selectedIds));
      const stash = await getExportStash();
      setStashCount(stash.length);
    } catch {
      // Handled in hook
    }
  };

  const handleExportMarkdown = () => {
    if (!chat) return;
    exportMarkdown(chat, options, Array.from(selectedIds));
    setTimeout(async () => {
      const stash = await getExportStash();
      setStashCount(stash.length);
    }, 300);
  };

  const handleRawSubmit = async () => {
    if (!rawInput.trim()) return;
    try {
      await loadRaw(rawInput.trim());
      setIsRawModalOpen(false);
      setRawInput('');
    } catch {
      // Handled in hook
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans bg-slate-50 dark:bg-[#07080f] text-slate-900 dark:text-slate-100 overflow-hidden transition-colors">
      {/* If no conversation is open: The Curator's Gallery */}
      {!chat && (
        <ChatFolioLanding
          onFetchUrl={loadUrl}
          onSelectSample={loadSample}
          onOpenRawModal={() => setIsRawModalOpen(true)}
          samples={samples}
          loading={loading}
          siteTheme={siteTheme}
          onToggleSiteTheme={toggleSiteTheme}
          onOpenArchive={() => setIsArchiveOpen(true)}
          recentCount={recentFolios.length}
          recentFolios={recentFolios}
          onSelectRecentFolio={handleSelectSavedFolio}
        />
      )}

      {/* If conversation is open: The Master Studio Workbench */}
      {chat && (
        <ChatFolioStudio
          chat={chat}
          onBackToLanding={() => window.location.reload()}
          onUpdateTitle={updateTitle}
          selectedIds={selectedIds}
          onToggleMessage={toggleMessage}
          onUpdateMessage={updateMessageContent}
          onDeleteMessage={deleteMessage}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          onSelectRole={selectRole}
          onInvertSelection={invertSelection}
          theme={theme}
          onThemeChange={setTheme}
          options={options}
          onOptionsChange={setOptions}
          onAutoRedact={redactMessages}
          onUndoRedact={undoRedaction}
          redactedCount={redactedCount}
          onExportPdf={handleExportPdf}
          onExportMarkdown={handleExportMarkdown}
          isExporting={isExporting}
          siteTheme={siteTheme}
          onToggleSiteTheme={toggleSiteTheme}
          onOpenArchive={() => setIsArchiveOpen(true)}
          onOpenStash={() => setIsStashOpen(true)}
          stashCount={stashCount}
        />
      )}

      {/* Raw Prompt / JSON Input Modal */}
      <AnimatePresence>
        {isRawModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setIsRawModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl cursor-default"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-blue-500" />
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Paste Raw AI Dialogue or JSON
                  </h3>
                </div>
                <button
                  onClick={() => setIsRawModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="Paste conversation transcript or raw JSON here..."
                rows={9}
                className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#161f36] text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 mb-4"
              />

              <div className="flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setIsRawModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161f36]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRawSubmit}
                  disabled={!rawInput.trim() || loading}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 shadow-md shadow-blue-500/20"
                >
                  Typeset Folio
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Folio Archive Drawer (Recent Manuscripts) */}
      <AnimatePresence>
        {isArchiveOpen && (
          <FolioArchiveDrawer
            isOpen={isArchiveOpen}
            onClose={() => {
              setIsArchiveOpen(false);
              refreshStorage();
            }}
            onSelectFolio={handleSelectSavedFolio}
            currentFolioId={chat?.share_id}
          />
        )}
      </AnimatePresence>

      {/* Export Stash Modal (Cached Downloads & History) */}
      <AnimatePresence>
        {isStashOpen && (
          <ExportStashModal
            isOpen={isStashOpen}
            onClose={() => {
              setIsStashOpen(false);
              refreshStorage();
            }}
            onStashCountChange={setStashCount}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
