import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  X,
  Shield,
  RotateCcw,
  BookOpen,
  FileText,
  Moon,
  Bot,
  Printer,
  Terminal,
  Eye,
  Type,
  Layout,
  Sliders,
  Download,
  Check,
  Sparkles,
  FileCode,
  Hash,
  Brain,
  ShieldAlert,
  ArrowRight,
  Maximize2,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { ExportOptions, ThemeId, PaperSize, PageMargins, FontFamily, FontSize } from '@/types/chat';
import { THEMES } from '@/tokens/theme';
import { cn } from '@/lib/utils';

interface ExportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  options: ExportOptions;
  onOptionsChange: (options: ExportOptions) => void;
  onAutoRedact: () => void;
  onUndoRedact: () => void;
  redactedCount: number;
  onOpenPreview?: () => void;
  onExportMarkdown?: () => void;
  onExportHtml?: () => void;
  onPrintBrowser?: () => void;
  onExportPdf?: () => void;
  isExporting?: boolean;
  hasConversation?: boolean;
}

type TabType = 'theme' | 'layout' | 'meta' | 'privacy' | 'export';

export const ExportDrawer: React.FC<ExportDrawerProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  options,
  onOptionsChange,
  onAutoRedact,
  onUndoRedact,
  redactedCount,
  onOpenPreview,
  onExportMarkdown,
  onExportHtml,
  onPrintBrowser,
  onExportPdf,
  isExporting = false,
  hasConversation = true,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('theme');

  const updateOpt = <K extends keyof ExportOptions>(key: K, val: ExportOptions[K]) => {
    onOptionsChange({ ...options, [key]: val });
  };

  const currentThemeConfig = THEMES[theme] || THEMES.obsidian;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'theme', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'layout', label: 'Page Setup', icon: <Layout className="w-4 h-4" /> },
    { id: 'meta', label: 'Title & Cover', icon: <Sliders className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Lock className="w-4 h-4" /> },
    { id: 'export', label: 'Download', icon: <Download className="w-4 h-4" /> },
  ];

  const themeList: {
    id: ThemeId;
    name: string;
    description: string;
    icon: React.ReactNode;
    previewBg: string;
    previewText: string;
    previewAccent: string;
    previewUserBg: string;
  }[] = [
    {
      id: 'editorial',
      name: 'Warm Stationery',
      description: 'Classic warm cream paper with cozy literary typography',
      icon: <BookOpen className="w-4 h-4 text-amber-500" />,
      previewBg: '#faf8f5',
      previewText: '#1c1917',
      previewAccent: '#b45309',
      previewUserBg: '#f4ece1',
    },
    {
      id: 'academic',
      name: 'Modern Clean',
      description: 'Crisp minimalist white paper with professional typography',
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      previewBg: '#ffffff',
      previewText: '#0f172a',
      previewAccent: '#2563eb',
      previewUserBg: '#f8fafc',
    },
    {
      id: 'obsidian',
      name: 'Midnight Dark',
      description: 'Deep soothing dark mode with vibrant emerald accents',
      icon: <Moon className="w-4 h-4 text-emerald-500" />,
      previewBg: '#090d16',
      previewText: '#f1f5f9',
      previewAccent: '#10b981',
      previewUserBg: '#161f30',
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT Classic',
      description: 'OpenAI’s familiar slate and charcoal conversation styling',
      icon: <Bot className="w-4 h-4 text-teal-500" />,
      previewBg: '#212327',
      previewText: '#ececf1',
      previewAccent: '#10a37f',
      previewUserBg: '#2d2f34',
    },
    {
      id: 'monochrome',
      name: 'Printer Friendly',
      description: 'Clean black-and-white layout designed to save printer toner',
      icon: <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />,
      previewBg: '#ffffff',
      previewText: '#000000',
      previewAccent: '#000000',
      previewUserBg: '#f5f5f5',
    },
    {
      id: 'cyberpunk',
      name: 'Neon Terminal',
      description: 'Electric cyan and neon violet developer aesthetic',
      icon: <Terminal className="w-4 h-4 text-cyan-500" />,
      previewBg: '#0a0a12',
      previewText: '#00f0ff',
      previewAccent: '#ffe600',
      previewUserBg: '#1a1633',
    },
  ];

  const fontOptions: { id: FontFamily; name: string; subtitle: string; sample: string; cssFont: string }[] = [
    { id: 'system', name: 'Modern Sans', subtitle: 'Inter UI • Clean & Friendly', sample: 'Modern, highly legible interface typeface', cssFont: "'Inter', sans-serif" },
    { id: 'serif', name: 'Literary Serif', subtitle: 'Newsreader • Book & Article style', sample: 'Graceful editorial serif with classic cadence', cssFont: "'Newsreader', serif" },
    { id: 'mono', name: 'Code & Tech', subtitle: 'JetBrains Mono • Technical look', sample: 'Engineered for crisp code & table readability', cssFont: "'JetBrains Mono', monospace" },
    { id: 'elegant', name: 'Geometric Display', subtitle: 'Outfit • Contemporary style', sample: 'Clean modern geometric headings and body', cssFont: "'Outfit', sans-serif" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with Click-to-Close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-xs z-40 cursor-pointer"
          />

          {/* Drawer Container */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[480px] md:w-[500px] bg-white dark:bg-[#0c1220] border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col select-none text-slate-800 dark:text-slate-100 transition-colors"
          >
            {/* Top Bar */}
            <div className="h-16 px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                    Customize Document
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Personalize styling, layout & export settings</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {onOpenPreview && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onOpenPreview}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20 transition-all cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Preview</span>
                  </motion.button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close settings"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="px-6 py-2 bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {options.paper_size}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 capitalize">
                  {options.margins} Margins
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{currentThemeConfig.name}</span>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 pt-3 pb-2 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0f172a]/40 shrink-0">
              <div className="grid grid-cols-5 p-1 bg-slate-200/60 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 gap-1">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'relative py-2 px-1 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer',
                        isActive
                          ? 'text-slate-900 dark:text-white font-semibold'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeStudioTab"
                          className="absolute inset-0 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-xs"
                          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        />
                      )}
                      <span className="relative z-10">{tab.icon}</span>
                      <span className="relative z-10 text-[11px] tracking-tight">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* TAB 1: APPEARANCE & THEME */}
              {activeTab === 'theme' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  {/* Theme Presets */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Palette className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Document Theme</span>
                      </label>
                      <span className="text-[11px] text-slate-400">Click to apply</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {themeList.map((t) => {
                        const isSelected = theme === t.id;
                        return (
                          <motion.div
                            key={t.id}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onThemeChange(t.id)}
                            className={cn(
                              'relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden',
                              isSelected
                                ? 'bg-emerald-50/50 dark:bg-slate-800/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                                : 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            )}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5">
                                  {t.icon}
                                  <span className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</span>
                                </div>
                                {isSelected && (
                                  <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </div>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3 leading-normal line-clamp-2">
                                {t.description}
                              </p>
                            </div>

                            {/* Miniature Document Preview Card */}
                            <div
                              className="rounded-xl p-2 border shadow-2xs transition-transform"
                              style={{
                                backgroundColor: t.previewBg,
                                borderColor: 'rgba(148, 163, 184, 0.2)',
                              }}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="w-10 h-1.5 rounded-full" style={{ backgroundColor: t.previewAccent }} />
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.previewAccent }} />
                              </div>
                              <div
                                className="p-1 rounded text-[9px] mb-1 leading-none font-medium truncate"
                                style={{
                                  backgroundColor: t.previewUserBg,
                                  color: t.previewText,
                                }}
                              >
                                How does gravity work?
                              </div>
                              <div
                                className="w-full h-1 rounded-sm opacity-40"
                                style={{ backgroundColor: t.previewText }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Typography Font Stack */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Type className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Font Style</span>
                      </label>
                    </div>

                    <div className="space-y-2">
                      {fontOptions.map((f) => {
                        const isSelected = options.font_family === f.id;
                        return (
                          <div
                            key={f.id}
                            onClick={() => updateOpt('font_family', f.id)}
                            className={cn(
                              'p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between',
                              isSelected
                                ? 'bg-emerald-50/50 dark:bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500/20'
                                : 'bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            )}
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 dark:text-white" style={{ fontFamily: f.cssFont }}>
                                  {f.name}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                  {f.subtitle}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic" style={{ fontFamily: f.cssFont }}>
                                "{f.sample}"
                              </span>
                            </div>

                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 ml-3">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Font Sizing Scale */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                      Text Size Scale
                    </label>
                    <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800">
                      {(
                        [
                          { id: 'small', label: 'Compact', desc: '13px / Dense' },
                          { id: 'medium', label: 'Standard', desc: '14.5px / Balanced' },
                          { id: 'large', label: 'Large', desc: '16px / Relaxed' },
                        ] as { id: FontSize; label: string; desc: string }[]
                      ).map((s) => {
                        const isSelected = options.font_size === s.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => updateOpt('font_size', s.id)}
                            className={cn(
                              'py-2.5 px-2 rounded-lg text-center transition-all cursor-pointer',
                              isSelected
                                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 font-semibold shadow-xs'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                            )}
                          >
                            <div className="text-xs">{s.label}</div>
                            <div className="text-[10px] opacity-70">{s.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: PAGE SETUP */}
              {activeTab === 'layout' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  {/* Paper Format */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                      Paper Size
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {(
                        [
                          { id: 'A4', label: 'Standard A4', desc: '210 × 297 mm' },
                          { id: 'Letter', label: 'US Letter', desc: '8.5 × 11 in' },
                          { id: 'Continuous', label: 'Continuous', desc: 'Single long page' },
                        ] as { id: PaperSize; label: string; desc: string }[]
                      ).map((p) => {
                        const isSelected = options.paper_size === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => updateOpt('paper_size', p.id)}
                            className={cn(
                              'p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1',
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-white font-semibold shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                            )}
                          >
                            <span className="text-xs font-semibold">{p.label}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{p.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Margins */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                      Page Margins
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {(
                        [
                          { id: 'narrow', label: 'Compact', desc: 'More per page' },
                          { id: 'normal', label: 'Normal', desc: 'Standard margins' },
                          { id: 'wide', label: 'Relaxed', desc: 'Generous space' },
                        ] as { id: PageMargins; label: string; desc: string }[]
                      ).map((m) => {
                        const isSelected = options.margins === m.id;
                        return (
                          <div
                            key={m.id}
                            onClick={() => updateOpt('margins', m.id)}
                            className={cn(
                              'p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1',
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-white font-semibold shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                            )}
                          >
                            <span className="text-xs font-semibold">{m.label}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">{m.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Elements Toggles */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-3">
                      Content to Include
                    </label>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <Brain className="w-4 h-4 text-emerald-500" />
                          <div>
                            <div className="text-xs font-medium text-slate-900 dark:text-white">AI Thinking & Reasoning</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">Include thought process blocks</div>
                          </div>
                        </div>
                        <Toggle
                          checked={options.show_thoughts ?? true}
                          onChange={(val) => updateOpt('show_thoughts', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <Hash className="w-4 h-4 text-emerald-500" />
                          <div>
                            <div className="text-xs font-medium text-slate-900 dark:text-white">Code Line Numbers</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">Show line numbers in code blocks</div>
                          </div>
                        </div>
                        <Toggle
                          checked={options.show_line_numbers ?? false}
                          onChange={(val) => updateOpt('show_line_numbers', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                          <div>
                            <div className="text-xs font-medium text-slate-900 dark:text-white">Document Stats Banner</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">Show model, word count, and read time</div>
                          </div>
                        </div>
                        <Toggle
                          checked={options.show_metadata_banner ?? true}
                          onChange={(val) => updateOpt('show_metadata_banner', val)}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: TITLE & COVER */}
              {activeTab === 'meta' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={options.custom_title || ''}
                      onChange={(e) => updateOpt('custom_title', e.target.value)}
                      placeholder="e.g. My ChatGPT Research Notes"
                      className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                      Subtitle / Brief Note
                    </label>
                    <input
                      type="text"
                      value={options.custom_subtitle || ''}
                      onChange={(e) => updateOpt('custom_subtitle', e.target.value)}
                      placeholder="e.g. Key takeaways and summary"
                      className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                      Prepared By (Author)
                    </label>
                    <input
                      type="text"
                      value={options.author_tag || ''}
                      onChange={(e) => updateOpt('author_tag', e.target.value)}
                      placeholder="e.g. Alex Smith"
                      className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                      Watermark Stamp (Optional)
                    </label>
                    <input
                      type="text"
                      value={options.watermark || ''}
                      onChange={(e) => updateOpt('watermark', e.target.value)}
                      placeholder="e.g. DRAFT or CONFIDENTIAL"
                      className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    />
                    <div className="flex gap-1.5 mt-2">
                      {['CONFIDENTIAL', 'DRAFT', 'PERSONAL'].map((stamp) => (
                        <button
                          key={stamp}
                          onClick={() => updateOpt('watermark', stamp)}
                          className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          +{stamp}
                        </button>
                      ))}
                      {options.watermark && (
                        <button
                          onClick={() => updateOpt('watermark', '')}
                          className="px-2 py-1 rounded-md text-[10px] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors ml-auto cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: PRIVACY */}
              {activeTab === 'privacy' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-5"
                >
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-2 mb-1 font-bold text-xs text-amber-800 dark:text-amber-400">
                      <ShieldAlert className="w-4 h-4" />
                      <span>One-Click Personal Info Protection</span>
                    </div>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300/80 leading-relaxed">
                      Automatically detects and redacts personal info (email addresses, phone numbers, API keys, passwords, and tokens) before saving your document.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={onAutoRedact}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Auto-Redact Personal Info</span>
                    </button>

                    {redactedCount > 0 && (
                      <button
                        onClick={onUndoRedact}
                        className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Undo ({redactedCount})</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-2 space-y-2.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Include Messages
                    </label>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                      <div className="text-xs font-medium text-slate-800 dark:text-white">Show My Questions</div>
                      <Toggle
                        checked={options.show_user_msgs ?? true}
                        onChange={(val) => updateOpt('show_user_msgs', val)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                      <div className="text-xs font-medium text-slate-800 dark:text-white">Show ChatGPT Answers</div>
                      <Toggle
                        checked={options.show_ai_msgs ?? true}
                        onChange={(val) => updateOpt('show_ai_msgs', val)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: DOWNLOAD & SHARE */}
              {activeTab === 'export' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  {/* Primary PDF Download Action */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5" />
                        <span>Vector PDF Document</span>
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-300 font-medium bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                      Produces a publication-quality PDF with selectable text, crisp math formulas, and page numbers. Ready for reading, printing, or sharing.
                    </p>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={onExportPdf}
                      loading={isExporting}
                      disabled={!hasConversation}
                      className="w-full shadow-md shadow-emerald-500/20 rounded-xl"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      <span>{isExporting ? 'Generating PDF...' : 'Download PDF Document'}</span>
                    </Button>
                  </div>

                  {/* Alternative Formats */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {onExportMarkdown && (
                      <button
                        onClick={onExportMarkdown}
                        disabled={!hasConversation}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      >
                        <FileCode className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-medium">Markdown</span>
                        <span className="text-[10px] text-slate-400">.md text</span>
                      </button>
                    )}

                    {onExportHtml && (
                      <button
                        onClick={onExportHtml}
                        disabled={!hasConversation}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      >
                        <FileText className="w-4 h-4 text-teal-500" />
                        <span className="text-xs font-medium">HTML Page</span>
                        <span className="text-[10px] text-slate-400">Web file</span>
                      </button>
                    )}

                    {onPrintBrowser && (
                      <button
                        onClick={onPrintBrowser}
                        disabled={!hasConversation}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      >
                        <Printer className="w-4 h-4 text-sky-500" />
                        <span className="text-xs font-medium">Print</span>
                        <span className="text-[10px] text-slate-400">Ctrl+P</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sticky Bottom Actions */}
            <div className="p-4 px-6 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-[#0f172a]/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
              {onOpenPreview && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onOpenPreview}
                  icon={<Eye className="w-4 h-4 text-slate-400" />}
                  className="flex-1 rounded-xl"
                >
                  <span>Preview PDF</span>
                </Button>
              )}

              <Button
                variant="primary"
                size="md"
                onClick={onExportPdf}
                loading={isExporting}
                disabled={!hasConversation}
                icon={<Download className="w-4 h-4" />}
                className="flex-1 shadow-sm rounded-xl font-semibold"
              >
                <span>Download PDF</span>
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
