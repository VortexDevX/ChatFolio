import React, { useState } from 'react';
import {
  MessageSquare,
  Palette,
  Settings2,
  Search,
} from 'lucide-react';
import { ChatConversation, ExportOptions, ThemeId } from '@/types/chat';
import { THEMES } from '@/tokens/theme';
import { MessageBubble } from '@/components/messages/MessageBubble';

interface StudioInspectorProps {
  chat: ChatConversation;
  selectedIds: Set<string>;
  onToggleMessage: (id: string, index: number, isShiftKey: boolean) => void;
  onUpdateMessage: (id: string, newContent: string) => void;
  onDeleteMessage: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onSelectRole: (role: 'user' | 'assistant') => void;
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  options: ExportOptions;
  onOptionsChange: (options: ExportOptions | ((prev: ExportOptions) => ExportOptions)) => void;
  onAutoRedact: () => void;
  onUndoRedact: () => void;
  redactedCount: number;
}

export const StudioInspector: React.FC<StudioInspectorProps> = ({
  chat,
  selectedIds,
  onToggleMessage,
  onUpdateMessage,
  onDeleteMessage,
  onSelectAll,
  onClearSelection,
  onSelectRole,
  theme,
  onThemeChange,
  options,
  onOptionsChange,
  onAutoRedact,
  onUndoRedact,
  redactedCount,
}) => {
  const [activeTab, setActiveTab] = useState<'messages' | 'design' | 'setup'>('messages');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMessages = chat.messages
    .map((msg, idx) => ({ msg, originalIndex: idx }))
    .filter(({ msg }) => {
      if (!searchQuery.trim()) return true;
      return msg.content.toLowerCase().includes(searchQuery.toLowerCase());
    });

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#0c1220] border-r border-slate-200 dark:border-slate-800 shrink-0 transition-colors select-none">
      {/* Inspector Tabs Header */}
      <div className="h-11 px-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 shrink-0 bg-slate-50/80 dark:bg-slate-900/40">
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'messages'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Messages ({chat.messages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('design')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'design'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Design & Theme</span>
        </button>

        <button
          onClick={() => setActiveTab('setup')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'setup'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Page Setup</span>
        </button>
      </div>

      {/* Tab 1: Messages List */}
      {activeTab === 'messages' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Quick Selection & Search Toolbar */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] flex flex-col gap-2 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter messages..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1">
                <button
                  onClick={onSelectAll}
                  className="px-2 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  All
                </button>
                <button
                  onClick={() => onSelectRole('assistant')}
                  className="px-2 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Answers
                </button>
                <button
                  onClick={() => onSelectRole('user')}
                  className="px-2 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Questions
                </button>
                <button
                  onClick={onClearSelection}
                  className="px-2 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  None
                </button>
              </div>

              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {selectedIds.size} of {chat.messages.length} in PDF
              </span>
            </div>
          </div>

          {/* Scrollable Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {filteredMessages.map(({ msg, originalIndex }) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                index={originalIndex}
                isSelected={selectedIds.has(msg.id)}
                onToggle={onToggleMessage}
                onUpdateContent={onUpdateMessage}
                onDeleteMessage={onDeleteMessage}
                showThoughts={options.show_thoughts}
                theme={theme}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Design & Theme */}
      {activeTab === 'design' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Themes Gallery */}
          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-2">
              Document Visual Theme
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
                const t = THEMES[tId];
                const isSelected = tId === theme;
                return (
                  <button
                    key={tId}
                    onClick={() => onThemeChange(tId)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-500/5 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {t.name}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    {/* Swatch Previews */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                        style={{ backgroundColor: t.paperBg }}
                        title="Paper background"
                      />
                      <div
                        className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                        style={{ backgroundColor: t.swatchAccent }}
                        title="Accent color"
                      />
                      <div
                        className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                        style={{ backgroundColor: t.userBubbleBg }}
                        title="User bubble"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typography */}
          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-2">
              Typography Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'system', name: 'Inter (Modern Sans)', desc: 'Clean, versatile' },
                { id: 'serif', name: 'Merriweather (Book Serif)', desc: 'Literary & warm' },
                { id: 'mono', name: 'JetBrains (Monospace)', desc: 'Technical & code' },
                { id: 'elegant', name: 'Playfair (Editorial)', desc: 'Elegant & formal' },
              ].map((font) => (
                <button
                  key={font.id}
                  onClick={() =>
                    onOptionsChange((prev) => ({ ...prev, font_family: font.id as any }))
                  }
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    options.font_family === font.id
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xs font-medium">{font.name}</div>
                  <div className="text-[10px] text-slate-400">{font.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Margins */}
          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-2">
              Page Margins
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'narrow', label: 'Compact (15mm)' },
                { id: 'normal', label: 'Standard (20mm)' },
                { id: 'wide', label: 'Spacious (28mm)' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => onOptionsChange((prev) => ({ ...prev, margins: m.id as any }))}
                  className={`py-2 px-1 text-center rounded-lg border text-xs font-medium transition-all ${
                    options.margins === m.id
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Page Setup & Document Metadata */}
      {activeTab === 'setup' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-1">
              Paper Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'A4', label: 'A4' },
                { id: 'Letter', label: 'US Letter' },
                { id: 'Continuous', label: 'Continuous' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => onOptionsChange((prev) => ({ ...prev, paper_size: p.id as any }))}
                  className={`py-2 text-center rounded-lg border text-xs font-medium transition-all ${
                    options.paper_size === p.id
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-1">
              Document Subtitle
            </label>
            <input
              type="text"
              value={options.custom_subtitle || ''}
              onChange={(e) =>
                onOptionsChange((prev) => ({ ...prev, custom_subtitle: e.target.value }))
              }
              placeholder="e.g. Technical Architecture Review"
              className="w-full px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-1">
              Author / Prepared By
            </label>
            <input
              type="text"
              value={options.author_tag || ''}
              onChange={(e) =>
                onOptionsChange((prev) => ({ ...prev, author_tag: e.target.value }))
              }
              placeholder="e.g. Product Engineering Team"
              className="w-full px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Include Thinking Process
                </span>
                <span className="text-[11px] text-slate-500">
                  Export model reasoning steps in PDF
                </span>
              </div>
              <input
                type="checkbox"
                checked={options.show_thoughts}
                onChange={(e) =>
                  onOptionsChange((prev) => ({ ...prev, show_thoughts: e.target.checked }))
                }
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Document Header & Metadata
                </span>
                <span className="text-[11px] text-slate-500">
                  Print title, author, and date banner on page 1
                </span>
              </div>
              <input
                type="checkbox"
                checked={options.show_metadata_banner}
                onChange={(e) =>
                  onOptionsChange((prev) => ({
                    ...prev,
                    show_metadata_banner: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Code Line Numbers
                </span>
                <span className="text-[11px] text-slate-500">
                  Add line numbers to code snippets
                </span>
              </div>
              <input
                type="checkbox"
                checked={options.show_line_numbers}
                onChange={(e) =>
                  onOptionsChange((prev) => ({ ...prev, show_line_numbers: e.target.checked }))
                }
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          </div>

          {/* Privacy Anonymizer */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Auto-Redact Sensitive Data
                </span>
                <span className="text-[11px] text-slate-500">
                  Mask API keys, emails, and passwords
                </span>
              </div>
              {redactedCount > 0 ? (
                <button
                  onClick={onUndoRedact}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200"
                >
                  Undo ({redactedCount})
                </button>
              ) : (
                <button
                  onClick={onAutoRedact}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Sanitize
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
