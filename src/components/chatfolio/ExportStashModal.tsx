import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Trash2,
  X,
  FileText,
  FileCode,
  Clock,
  Sparkles,
  Check,
  HardDrive,
} from 'lucide-react';
import {
  ExportStashItem,
  getExportStash,
  downloadStashedItem,
  deleteStashedItem,
  clearExportStash,
} from '@/lib/storage';
import { useClickOutside } from '@/hooks/useClickOutside';

interface ExportStashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStashCountChange?: (count: number) => void;
}

export const ExportStashModal: React.FC<ExportStashModalProps> = ({
  isOpen,
  onClose,
  onStashCountChange,
}) => {
  const [items, setItems] = useState<ExportStashItem[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const loadStash = async () => {
    const list = await getExportStash();
    setItems(list);
    if (onStashCountChange) {
      onStashCountChange(list.length);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStash();
    }
  }, [isOpen]);

  useClickOutside(modalRef, onClose, isOpen);

  const handleDownload = async (item: ExportStashItem) => {
    setDownloadingId(item.id);
    await downloadStashedItem(item);
    setTimeout(() => setDownloadingId(null), 1000);
  };

  const handleDelete = async (id: string) => {
    await deleteStashedItem(id);
    await loadStash();
  };

  const handleClearAll = async () => {
    await clearExportStash();
    await loadStash();
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-xs"
      />

      {/* Modal Card */}
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-white dark:bg-[#0c101c] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-[#111728]/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Export Stash & History
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {items.length} cached
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Instant 1-click re-download without waiting for engine re-rendering
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

        {/* Stash Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {items.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 mx-auto flex items-center justify-center mb-3">
                <Download className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                No exported files in stash
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Whenever you publish a Vector PDF or download Markdown, a copy is automatically cached here for instant retrieval.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const isPdf = item.format === 'pdf';
              const isDownloading = downloadingId === item.id;
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111728] hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isPdf
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {isPdf ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <FileCode className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        <span className="uppercase font-bold text-[10px] px-1 rounded bg-slate-100 dark:bg-[#1a233d]">
                          {item.format}
                        </span>
                        {item.sizeBytes && <span>• {formatBytes(item.sizeBytes)}</span>}
                        <span>•</span>
                        <span className="flex items-center gap-1 font-sans">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatRelativeTime(item.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleDownload(item)}
                      disabled={isDownloading}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-xs font-bold transition-all shadow-2xs"
                      title="Download file immediately"
                    >
                      {isDownloading ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Get</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Remove from stash"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c101c] flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Cached locally in browser memory
            </span>
            <button
              onClick={handleClearAll}
              className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors"
            >
              Clear Stash
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
