import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  User,
  Bot,
  Sparkles,
} from 'lucide-react';
import { ChatConversation, ThemeId } from '@/types/chat';
import { MessageBubble } from '@/components/messages/MessageBubble';

interface StoryboardDeckProps {
  chat: ChatConversation;
  selectedIds: Set<string>;
  onToggleMessage: (id: string, index: number, isShiftKey: boolean) => void;
  onUpdateMessage: (id: string, newContent: string) => void;
  onDeleteMessage: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onSelectRole: (role: 'user' | 'assistant') => void;
  showThoughts: boolean;
  theme: ThemeId;
}

export const StoryboardDeck: React.FC<StoryboardDeckProps> = ({
  chat,
  selectedIds,
  onToggleMessage,
  onUpdateMessage,
  onDeleteMessage,
  onSelectAll,
  onClearSelection,
  onSelectRole,
  showThoughts,
  theme,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'assistant'>('all');

  const filtered = chat.messages
    .map((msg, index) => ({ msg, originalIndex: index }))
    .filter(({ msg }) => {
      if (roleFilter !== 'all' && msg.role !== roleFilter) return false;
      if (!search.trim()) return true;
      return msg.content.toLowerCase().includes(search.toLowerCase());
    });

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/70 dark:bg-[#0c0e17] border-r border-slate-200/80 dark:border-slate-800/60 select-none transition-colors">
      {/* Deck Header */}
      <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800/60 bg-white/80 dark:bg-[#101424]/80 backdrop-blur-md flex flex-col gap-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
              §
            </div>
            <span className="text-xs font-extrabold tracking-wide uppercase text-slate-700 dark:text-slate-300">
              Manuscript Storyboard
            </span>
          </div>

          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50">
            {selectedIds.size} of {chat.messages.length} active
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search manuscript passages..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100/90 dark:bg-[#161f36] border border-slate-200 dark:border-slate-700/60 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
          />
        </div>

        {/* Quick Filter Segmented Control */}
        <div className="flex items-center justify-between text-[11px] pt-1">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#161f36] p-0.5 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
            <button
              onClick={() => {
                setRoleFilter('all');
                onSelectAll();
              }}
              className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                roleFilter === 'all'
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setRoleFilter('assistant');
                onSelectRole('assistant');
              }}
              className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                roleFilter === 'assistant'
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              ChatGPT
            </button>
            <button
              onClick={() => {
                setRoleFilter('user');
                onSelectRole('user');
              }}
              className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                roleFilter === 'user'
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Prompts
            </button>
          </div>

          <button
            onClick={onClearSelection}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Chapter Filmstrip Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400 dark:text-slate-500">
            No matching chapters found.
          </div>
        ) : (
          filtered.map(({ msg, originalIndex }) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              index={originalIndex}
              isSelected={selectedIds.has(msg.id)}
              onToggle={onToggleMessage}
              onUpdateContent={onUpdateMessage}
              onDeleteMessage={onDeleteMessage}
              showThoughts={showThoughts}
              theme={theme}
            />
          ))
        )}
      </div>
    </div>
  );
};
