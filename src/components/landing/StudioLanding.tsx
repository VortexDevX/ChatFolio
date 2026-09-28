import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Link,
  ClipboardPaste,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  ShieldCheck,
  Code2,
  Cpu,
  Layers,
  FileCode,
  Compass,
  X,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { SampleChatSummary } from '@/types/chat';
import { useClickOutside } from '@/hooks/useClickOutside';

interface StudioLandingProps {
  onFetchUrl: (url: string) => Promise<void>;
  onSelectSample: (id: string) => Promise<void>;
  onOpenRawModal: () => void;
  samples: SampleChatSummary[];
  loading: boolean;
  siteTheme: 'light' | 'dark';
  onToggleSiteTheme: () => void;
}

export const StudioLanding: React.FC<StudioLandingProps> = ({
  onFetchUrl,
  onSelectSample,
  onOpenRawModal,
  samples,
  loading,
  siteTheme,
  onToggleSiteTheme,
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
      // clipboard permission denied
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b13] text-slate-900 dark:text-slate-100 transition-colors select-none">
      {/* Landing Header */}
      <header className="h-16 px-4 sm:px-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0c1220]/80 backdrop-blur-md flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                GPT-PDF
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                Studio
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Samples Dropdown with Click-Outside Closing */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowSamplesMenu(!showSamplesMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-500" />
              <span>Explore Samples</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <AnimatePresence>
              {showSamplesMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-2xl p-2 z-50 text-slate-800 dark:text-slate-200"
                >
                  <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Curated Demonstrations
                  </div>
                  {samples.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        onSelectSample(s.id);
                        setShowSamplesMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group flex flex-col gap-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {s.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {s.message_count} msgs
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-500 transition-colors line-clamp-1">
                        {s.title}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Paste Raw Text / Markdown Option */}
          <button
            onClick={onOpenRawModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Paste Text</span>
          </button>

          {/* Sun / Moon Toggle */}
          <button
            onClick={onToggleSiteTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Switch to ${siteTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {siteTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Landing Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-5xl mx-auto w-full">
        {/* Hero Copy */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mb-8"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Turn ChatGPT Chats into Studio-Quality Documents</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            From ChatGPT Link to <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-600 bg-clip-text text-transparent">
              Publication-Grade PDF
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Paste any ChatGPT share link to open our interactive document studio. Customize typography, margins, themes, and export print-ready PDFs with real LaTeX math and code highlighting.
          </p>
        </motion.div>

        {/* Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-2xl mb-12"
        >
          <form
            onSubmit={handleSubmit}
            className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="relative flex-1 w-full flex items-center">
              <Link className="w-4 h-4 absolute left-3.5 text-slate-400 shrink-0" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste ChatGPT share link (https://chatgpt.com/share/...)"
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
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
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

        {/* Curated Sample Grid */}
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Or start instantly with an example
            </span>
            <span className="text-xs text-slate-400 font-medium">Click any card to open in studio</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {samples.map((sample) => (
              <motion.button
                key={sample.id}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectSample(sample.id)}
                className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-xs hover:shadow-lg dark:hover:shadow-emerald-950/30 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:text-emerald-500 transition-colors">
                      {sample.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {sample.message_count} messages
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 transition-colors line-clamp-2 mb-2">
                    {sample.title}
                  </h3>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Model: {sample.model || 'gpt-4o'}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Load →
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
