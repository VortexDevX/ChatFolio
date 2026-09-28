import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderArchive,
  Search,
  Clock,
  Trash2,
  X,
  ExternalLink,
  BookOpen,
  Sparkles,
  Layers,
  Calendar,
} from 'lucide-react';
import { SavedFolio, getRecentFolios, deleteFolio, clearAllFolios } from '@/lib/storage';
import { useClickOutside } from '@/hooks/useClickOutside';

interface FolioArchiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFolio: (folio: SavedFolio) => void;
  currentFolioId?: string;
}

export const FolioArchiveDrawer: React.FC<FolioArchiveDrawerProps> = ({
  isOpen,
  onClose,
  onSelectFolio,
  currentFolioId,
}) => {
  const [folios, setFolios] = useState<SavedFolio[]>([]);
  const [search, setSearch] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const loadFolios = async () => {
    const list = await getRecentFolios();
    setFolios(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadFolios();
      setConfirmClear(false);
    }
  }, [isOpen]);

  useClickOutside(drawerRef, onClose, isOpen);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteFolio(id);
    await loadFolios();
  };

  const handleClearAll = async () => {
    await clearAllFolios();
    await loadFolios();
    setConfirmClear(false);
  };

  const filteredFolios = folios.filter((f) => {
    const q = search.toLowerCase();
    return (
      f.title.toLowerCase().includes(q) ||
      f.model.toLowerCase().includes(q) ||
      (f.category && f.category.toLowerCase().includes(q))
    );
  });

  const formatRelativeTime = (timestamp: number) => {
    const diff = Math.max(0, Date.now() - timestamp);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-xs"
      />

      {/* Drawer */}
      <motion.div
        ref={drawerRef}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 240 }}
        className="relative w-full max-w-md h-full bg-white dark:bg-[#0c101c] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-[#111728]/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FolderArchive className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Folio Archive & History
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {folios.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Local private repository of recent manuscripts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Filter Bar */}
        <div className="p-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0c101c]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, model or topic..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-[#161f36] border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredFolios.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 mx-auto flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                {folios.length === 0 ? 'Archive is empty' : 'No matching folios found'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                {folios.length === 0
                  ? 'Import or edit any conversation in ChatFolio and it will automatically be saved to your private local history.'
                  : 'Try typing a different keyword to filter your saved manuscripts.'}
              </p>
            </div>
          ) : (
            filteredFolios.map((f) => {
              const isCurrent = f.id === currentFolioId;
              return (
                <div
                  key={f.id}
                  onClick={() => {
                    onSelectFolio(f);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all group relative ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 ring-1 ring-blue-500/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111728] hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                      {f.title}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, f.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      title="Delete from archive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-[#1a233d] text-slate-700 dark:text-slate-300">
                      {f.model}
                    </span>
                    <span>•</span>
                    <span>{f.messageCount} turns</span>
                    <span>•</span>
                    <span>{f.wordCount.toLocaleString()} words</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatRelativeTime(f.updatedAt)}
                    </span>
                  </div>

                  {isCurrent && (
                    <div className="mt-2 text-[10px] font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      Currently active in Studio
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {folios.length > 0 && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c101c] flex items-center justify-between">
            {confirmClear ? (
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="text-xs text-rose-500 font-semibold">Clear all manuscripts?</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-500"
                  >
                    Confirm Clear
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="text-[11px] text-slate-400">
                  Auto-saved to device storage
                </span>
                <button
                  onClick={() => setConfirmClear(true)}
                  className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors"
                >
                  Clear Archive
                </button>
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
