import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link,
  ClipboardPaste,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  ShieldCheck,
  Code2,
  FileCode,
  Compass,
  X,
  Loader2,
  ChevronDown,
  BookOpen,
  Zap,
  FolderArchive,
  Clock,
} from 'lucide-react';
import { SampleChatSummary } from '@/types/chat';
import { SavedFolio } from '@/lib/storage';
import { useClickOutside } from '@/hooks/useClickOutside';
import { ChatFolioLogo } from '@/components/brand/ChatFolioLogo';

interface ChatFolioLandingProps {
  onFetchUrl: (url: string) => Promise<void>;
  onSelectSample: (id: string) => Promise<void>;
  onOpenRawModal: () => void;
  samples: SampleChatSummary[];
  loading: boolean;
  siteTheme: 'light' | 'dark';
  onToggleSiteTheme: () => void;
  onOpenArchive?: () => void;
  recentCount?: number;
  recentFolios?: SavedFolio[];
  onSelectRecentFolio?: (folio: SavedFolio) => void;
}

export const ChatFolioLanding: React.FC<ChatFolioLandingProps> = ({
  onFetchUrl,
  onSelectSample,
  onOpenRawModal,
  samples,
  loading,
  siteTheme,
  onToggleSiteTheme,
  onOpenArchive,
  recentCount = 0,
  recentFolios = [],
  onSelectRecentFolio,
}) => {
  const [url, setUrl] = useState('');
  const [showSamplesMenu, setShowSamplesMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setShowSamplesMenu(false), showSamplesMenu);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onFetchUrl(url.trim());
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        if (text.includes('chatgpt.com/share/') || text.includes('chat.openai.com/share/')) {
          onFetchUrl(text.trim());
        }
      }
    } catch {
      // clipboard permission fallback
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 transition-colors select-none relative overflow-x-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="fixed top-0 left-1/4 w-[650px] h-[650px] bg-blue-600/10 dark:bg-blue-600/8 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-[600px] h-[600px] bg-sky-600/10 dark:bg-sky-600/6 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Top Studio Navbar */}
      <header className="h-16 px-4 sm:px-8 border-b border-slate-200/80 dark:border-slate-800/60 bg-white/70 dark:bg-[#090d16]/70 backdrop-blur-md flex items-center justify-between z-20 shrink-0">
        <ChatFolioLogo size="md" />

        <div className="flex items-center gap-3">
          {/* Curated Anthology Dropdown with Click-Outside Closing */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowSamplesMenu(!showSamplesMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-[#121727]/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:border-blue-400 dark:hover:border-blue-700/60 transition-colors shadow-xs"
            >
              <Compass className="w-3.5 h-3.5 text-blue-500" />
              <span>Anthology Samples</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <AnimatePresence>
              {showSamplesMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-2xl p-2.5 z-50 text-slate-800 dark:text-slate-200"
                >
                  <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Curated Folio Demonstrations
                  </div>
                  {samples.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        onSelectSample(s.id);
                        setShowSamplesMenu(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#18233a] transition-colors group flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          {s.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {s.message_count} chapters
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-500 transition-colors line-clamp-1">
                        {s.title}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Archive / Recent Folios */}
          {onOpenArchive && (
            <button
              onClick={onOpenArchive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-[#121727]/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:border-blue-400 dark:hover:border-blue-700/60 transition-colors shadow-xs"
              title="Open Recent Folios & Archive"
            >
              <FolderArchive className="w-3.5 h-3.5 text-blue-500" />
              <span>Archive</span>
              {recentCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-mono">
                  {recentCount}
                </span>
              )}
            </button>
          )}

          {/* Paste Raw Text / Prompt */}
          <button
            onClick={onOpenRawModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-[#121727]/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:border-blue-400 dark:hover:border-blue-700/60 transition-colors shadow-xs"
          >
            <FileCode className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Paste Prompt</span>
          </button>

          {/* Sun / Moon Switch */}
          <button
            onClick={onToggleSiteTheme}
            className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161f36] transition-colors"
            title={`Switch to ${siteTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {siteTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-600" />
            )}
          </button>
        </div>
      </header>

      {/* Hero Curator Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mb-8"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/50 mb-5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>The Editorial AI Publishing Studio</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-4">
            Turn Raw AI Dialogues into <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Publication-Grade Folios
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
            Drop any ChatGPT conversation link to open our interactive bookmaker studio. Curate chapters, typeset formulas in native KaTeX, highlight code, and bind into vector-crisp PDFs.
          </p>
        </motion.div>

        {/* The Magic Link Importer Card */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-2xl mb-12"
        >
          <form
            onSubmit={handleSubmit}
            className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 shadow-2xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="relative flex-1 w-full flex items-center">
              <Link className="w-4 h-4 absolute left-3.5 text-slate-400 shrink-0" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste ChatGPT link (https://chatgpt.com/share/...)"
                disabled={loading}
                className="w-full pl-10 pr-20 py-2.5 text-xs sm:text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {url ? (
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Clear"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#18233a] transition-colors"
                    title="Paste from clipboard"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>Paste</span>
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Typesetting...</span>
                </>
              ) : (
                <>
                  <span>Open in Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Recent Folios Quick Shelf */}
        {recentFolios.length > 0 && onSelectRecentFolio && (
          <div className="w-full max-w-4xl mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Recent Manuscripts
                </span>
              </div>
              {onOpenArchive && (
                <button
                  onClick={onOpenArchive}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View All ({recentCount}) →
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {recentFolios.slice(0, 3).map((f) => (
                <div
                  key={f.id}
                  onClick={() => onSelectRecentFolio(f)}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#0f172a] border border-blue-500/30 dark:border-blue-500/20 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all group flex flex-col justify-between text-left"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300">
                        {f.model}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {f.messageCount} turns
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors line-clamp-1 mb-1">
                      {f.title}
                    </h4>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>{f.wordCount.toLocaleString()} words</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform">
                      Resume →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery of Featured Folios Showcase */}
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Curated Folio Anthology
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Click any volume to open in Studio
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {samples.map((sample) => (
              <motion.button
                key={sample.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectSample(sample.id)}
                className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 shadow-xs hover:shadow-xl dark:hover:shadow-blue-950/30 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                      {sample.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {sample.message_count} chapters
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-500 transition-colors line-clamp-2 mb-2 leading-snug">
                    {sample.title}
                  </h3>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Model: {sample.model || 'gpt-4o'}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Examine →
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* 3 Core Publishing Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl mt-12 pt-8 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-[#0f172a]/50 border border-slate-200/60 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                True Vector PDF Output
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Zero blurry canvas images. Text and formulas remain razor-sharp at any zoom.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-[#0f172a]/50 border border-slate-200/60 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Native KaTeX & Code
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Mathematical equations and multi-language syntax rendered to journal standards.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-[#0f172a]/50 border border-slate-200/60 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                100% Client-Side Safe
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Processed in-memory. Your personal conversations are never stored on any server.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
