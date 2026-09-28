import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Type,
  Layout,
  FileCheck,
  ShieldCheck,
  X,
  Sparkles,
  BookOpen,
  Sliders,
  Check,
  Bookmark,
  Plus,
  Trash2,
} from 'lucide-react';
import { ExportOptions, ThemeId } from '@/types/chat';
import { THEMES } from '@/tokens/theme';
import {
  EditorialPreset,
  getEditorialPresets,
  saveCustomPreset,
  deleteCustomPreset,
} from '@/lib/storage';

interface FinishesCabinetProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  options: ExportOptions;
  onOptionsChange: (options: ExportOptions | ((prev: ExportOptions) => ExportOptions)) => void;
  onAutoRedact: () => void;
  onUndoRedact: () => void;
  redactedCount: number;
}

export const FinishesCabinet: React.FC<FinishesCabinetProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  options,
  onOptionsChange,
  onAutoRedact,
  onUndoRedact,
  redactedCount,
}) => {
  const [presets, setPresets] = useState<EditorialPreset[]>([]);
  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const loadPresets = async () => {
    const list = await getEditorialPresets();
    setPresets(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadPresets();
      setIsAddingPreset(false);
      setNewPresetName('');
    }
  }, [isOpen]);

  const handleApplyPreset = (preset: EditorialPreset) => {
    onThemeChange(preset.theme);
    onOptionsChange((prev) => ({
      ...prev,
      font_family: preset.font_family,
      font_size: preset.font_size,
      margins: preset.margins,
      page_break_mode: preset.page_break_mode,
      show_thoughts: preset.show_thoughts,
      show_metadata_banner: preset.show_metadata_banner,
      show_line_numbers: preset.show_line_numbers,
    }));
  };

  const handleSavePreset = async () => {
    if (newPresetName.trim()) {
      await saveCustomPreset(newPresetName.trim(), theme, options);
      await loadPresets();
      setNewPresetName('');
      setIsAddingPreset(false);
    }
  };

  const handleDeletePreset = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteCustomPreset(id);
    await loadPresets();
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs"
      />

      {/* Sliding Cabinet Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 240 }}
        className="relative w-full max-w-md h-full bg-white dark:bg-[#0c101c] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 overflow-hidden"
      >
        {/* Cabinet Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-[#111728]/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Finishes & Print Cabinet
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Editorial styling, paper geometry & typography
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

        {/* Cabinet Scroll Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Section 0: Editorial Style Presets */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 dark:from-[#11172a] dark:to-[#0e1424] border border-blue-200/70 dark:border-blue-800/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                  Publishing Presets
                </label>
              </div>

              {!isAddingPreset && (
                <button
                  onClick={() => setIsAddingPreset(true)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100/60 dark:hover:bg-blue-950/60 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Save Current</span>
                </button>
              )}
            </div>

            {isAddingPreset && (
              <div className="mb-3 p-2 rounded-xl bg-white dark:bg-[#161f36] border border-blue-300 dark:border-blue-700/60 flex items-center gap-2">
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSavePreset();
                    if (e.key === 'Escape') setIsAddingPreset(false);
                  }}
                  placeholder="e.g. ACM Monograph Format"
                  autoFocus
                  className="flex-1 text-xs bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400"
                />
                <button
                  onClick={handleSavePreset}
                  disabled={!newPresetName.trim()}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsAddingPreset(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => {
                const isActive =
                  theme === p.theme &&
                  options.font_family === p.font_family &&
                  (options.page_break_mode || 'pair') === (p.page_break_mode || 'pair');

                return (
                  <div
                    key={p.id}
                    onClick={() => handleApplyPreset(p)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all relative group flex flex-col justify-between ${
                      isActive
                        ? 'border-blue-500 bg-white dark:bg-[#16203a] shadow-xs ring-1 ring-blue-500/30'
                        : 'border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-[#111728]/70 hover:border-blue-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {p.name}
                      </span>
                      {isActive ? (
                        <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      ) : p.isCustom ? (
                        <button
                          onClick={(e) => handleDeletePreset(e, p.id)}
                          className="p-0.5 rounded text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          title="Delete custom preset"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      ) : null}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {p.description}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 1: Folio Finishes (Themes) */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3">
              Folio Finish / Aesthetic
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
                        ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#111728]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {t.name}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-500" />}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                        style={{ backgroundColor: t.paperBg }}
                        title="Paper"
                      />
                      <div
                        className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                        style={{ backgroundColor: t.swatchAccent }}
                        title="Accent"
                      />
                      <div
                        className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                        style={{ backgroundColor: t.userBubbleBg }}
                        title="Card"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Book Typography */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3">
              Book Typography
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'system', name: 'Plus Jakarta', desc: 'Modern geometric sans' },
                { id: 'serif', name: 'Newsreader', desc: 'Literary editorial serif' },
                { id: 'mono', name: 'JetBrains', desc: 'Code & technical mono' },
                { id: 'elegant', name: 'Playfair', desc: 'Display headline serif' },
              ].map((font) => (
                <button
                  key={font.id}
                  onClick={() =>
                    onOptionsChange((prev) => ({ ...prev, font_family: font.id as any }))
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    options.font_family === font.id
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#111728]'
                  }`}
                >
                  <div className="text-xs font-semibold">{font.name}</div>
                  <div className="text-[10px] text-slate-400">{font.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Paper Geometry & Margins */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
              Paper Geometry
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { id: 'A4', label: 'ISO A4' },
                { id: 'Letter', label: 'US Letter' },
                { id: 'Continuous', label: 'Continuous' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => onOptionsChange((prev) => ({ ...prev, paper_size: p.id as any }))}
                  className={`py-2 text-center rounded-xl border text-xs font-semibold transition-all ${
                    options.paper_size === p.id
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 bg-white dark:bg-[#111728]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
              Page Margins
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'narrow', label: 'Pocket (12mm)' },
                { id: 'normal', label: 'Editorial (20mm)' },
                { id: 'wide', label: 'Gallery (28mm)' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => onOptionsChange((prev) => ({ ...prev, margins: m.id as any }))}
                  className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition-all ${
                    options.margins === m.id
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 bg-white dark:bg-[#111728]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Page Break Flow */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Page Break Flow
                </label>
                <span className="text-[10px] text-blue-500 font-semibold">Q&A Pagination</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'continuous', label: 'Continuous', desc: 'Flow naturally' },
                  { id: 'pair', label: 'Per Q&A Turn', desc: 'Fresh page/turn' },
                  { id: 'message', label: 'Per Message', desc: 'Fresh page/msg' },
                ].map((pb) => {
                  const isSelected = (options.page_break_mode || 'pair') === pb.id;
                  return (
                    <button
                      key={pb.id}
                      onClick={() =>
                        onOptionsChange((prev) => ({ ...prev, page_break_mode: pb.id as any }))
                      }
                      className={`py-2 px-2 text-center rounded-xl border transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200 font-bold ring-1 ring-blue-500/30'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 bg-white dark:bg-[#111728]'
                      }`}
                    >
                      <div className="text-xs font-bold leading-tight">{pb.label}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">
                        {pb.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 italic">
                {options.page_break_mode === 'pair'
                  ? 'Starts each new prompt/question on a fresh page. Responses flow directly below.'
                  : options.page_break_mode === 'message'
                  ? 'Starts each prompt and each assistant response on its own clean page.'
                  : 'Manuscript flows continuously without forced blank breaks.'}
              </p>
            </div>
          </div>

          {/* Section 4: Front Matter & Attribution */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Front Matter & Attribution
            </label>

            <div>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                Document Subtitle
              </span>
              <input
                type="text"
                value={options.custom_subtitle || ''}
                onChange={(e) =>
                  onOptionsChange((prev) => ({ ...prev, custom_subtitle: e.target.value }))
                }
                placeholder="e.g. Technical Monograph or Research Synthesis"
                className="w-full px-3 py-1.5 text-xs bg-slate-100 dark:bg-[#161f36] border border-slate-200 dark:border-slate-700/60 rounded-lg text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                Author / Curator Attribution
              </span>
              <input
                type="text"
                value={options.author_tag || ''}
                onChange={(e) =>
                  onOptionsChange((prev) => ({ ...prev, author_tag: e.target.value }))
                }
                placeholder="e.g. Curated by Research Team"
                className="w-full px-3 py-1.5 text-xs bg-slate-100 dark:bg-[#161f36] border border-slate-200 dark:border-slate-700/60 rounded-lg text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111728] cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Front Title Banner
                </span>
                <span className="text-[11px] text-slate-500">
                  Include title, author, and date banner on Page 1
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
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111728] cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Exclude AI Reasoning
                </span>
                <span className="text-[11px] text-slate-500">
                  Omit internal model thought processes and reasoning chains
                </span>
              </div>
              <input
                type="checkbox"
                checked={!options.show_thoughts}
                onChange={(e) =>
                  onOptionsChange((prev) => ({ ...prev, show_thoughts: !e.target.checked }))
                }
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>

          {/* Section 5: Privacy Sanitizer */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-[#111a33] dark:to-[#0f172a] border border-blue-200/80 dark:border-blue-800/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Privacy Redaction Shield
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Automatically mask API keys, emails & tokens
                </span>
              </div>
              {redactedCount > 0 ? (
                <button
                  onClick={onUndoRedact}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300"
                >
                  Undo ({redactedCount})
                </button>
              ) : (
                <button
                  onClick={onAutoRedact}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                >
                  Redact Now
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
