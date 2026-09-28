import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Pencil,
  MessageSquare,
  User,
  Bot,
  Sparkles,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { ChatMessage, ThemeId } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/navigation/Pagination';

interface MessageListProps {
  messages: ChatMessage[];
  title: string;
  selectedIds: Set<string>;
  onToggleMessage: (id: string, index: number, isShiftKey: boolean) => void;
  onUpdateMessage: (id: string, newContent: string) => void;
  onDeleteMessage: (id: string) => void;
  onUpdateTitle: (newTitle: string) => void;
  showThoughts: boolean;
  theme?: ThemeId;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  title,
  selectedIds,
  onToggleMessage,
  onUpdateMessage,
  onDeleteMessage,
  onUpdateTitle,
  showThoughts,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const handleSaveTitle = () => {
    if (draftTitle.trim()) {
      onUpdateTitle(draftTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const userCount = messages.filter((m) => m.role === 'user').length;
  const aiCount = messages.filter((m) => m.role === 'assistant').length;
  const includedCount = messages.filter((m) => selectedIds.has(m.id)).length;

  // Pagination calculations
  const totalItems = messages.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedMessages =
    pageSize >= totalItems ? messages : messages.slice(startIndex, startIndex + pageSize);

  const maxPage = Math.max(1, Math.ceil(totalItems / pageSize));
  if (currentPage > maxPage) {
    setCurrentPage(maxPage);
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-36 px-4 sm:px-6">
      {/* Document Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm relative overflow-hidden transition-colors"
      >
        <div className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <FileText className="w-3.5 h-3.5" />
          <span>Document Title</span>
        </div>

        {isEditingTitle ? (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              className="flex-1 rounded-xl px-4 py-2.5 text-base font-semibold bg-slate-50 dark:bg-slate-900 border border-emerald-500 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
            />
            <Button
              variant="primary"
              size="md"
              onClick={handleSaveTitle}
              icon={<Check className="w-4 h-4" />}
              className="rounded-xl"
            >
              <span>Save</span>
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title || 'Untitled Conversation'}
            </h1>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setDraftTitle(title);
                setIsEditingTitle(true);
              }}
              className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-2xs"
            >
              <Pencil className="w-3 h-3 text-slate-400" />
              <span>Rename</span>
            </motion.button>
          </div>
        )}

        {/* Conversation Summary Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-medium">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>{messages.length} Total Messages</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 font-medium">
            <User className="w-3.5 h-3.5 text-rose-500" />
            <span>{userCount} Questions</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium">
            <Bot className="w-3.5 h-3.5 text-emerald-500" />
            <span>{aiCount} Answers</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold ml-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{includedCount} of {messages.length} in PDF</span>
          </span>
        </div>
      </motion.div>

      {/* Messages List with Staggered Entrance */}
      <div className="flex flex-col gap-4">
        {paginatedMessages.map((msg, idx) => {
          const globalIdx = startIndex + idx;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.3) }}
            >
              <MessageBubble
                message={msg}
                index={globalIdx}
                isSelected={selectedIds.has(msg.id)}
                onToggle={onToggleMessage}
                onUpdateContent={onUpdateMessage}
                onDeleteMessage={onDeleteMessage}
                showThoughts={showThoughts}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalItems > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
};
