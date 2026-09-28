import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Link2,
  Sparkles,
  ClipboardCopy,
  Code2,
  Atom,
  PenLine,
  Database,
  UtensilsCrossed,
  FileText,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SampleChatSummary, ThemeId } from '@/types/chat';
import { cn } from '@/lib/utils';

interface LinkInputBarProps {
  onFetchUrl: (url: string) => void;
  onSelectSample: (id: string) => void;
  onOpenRawModal: () => void;
  samples: SampleChatSummary[];
  loading: boolean;
  compact?: boolean;
  theme?: ThemeId;
}

const sampleCategoryDetails: Record<
  string,
  { icon: React.ReactNode; badge: string; color: string; readTime: string; highlight: string }
> = {
  'sample-express-api': {
    icon: <Code2 className="w-5 h-5 text-emerald-500" />,
    badge: 'Coding & API',
    color: 'emerald',
    readTime: '3 min read',
    highlight: 'Code blocks, status tables, and project layout',
  },
  'sample-quantum-entanglement': {
    icon: <Atom className="w-5 h-5 text-sky-500" />,
    badge: 'Physics & Math',
    color: 'sky',
    readTime: '4 min read',
    highlight: 'Mathematical LaTeX equations & Bell matrices',
  },
  'sample-creative-writing': {
    icon: <PenLine className="w-5 h-5 text-amber-500" />,
    badge: 'Creative Story',
    color: 'amber',
    readTime: '5 min read',
    highlight: 'Literary prose with clean chapter flow',
  },
  'sample-database-schema': {
    icon: <Database className="w-5 h-5 text-purple-500" />,
    badge: 'Database Design',
    color: 'purple',
    readTime: '4 min read',
    highlight: 'SQL schemas, foreign keys, and indexes',
  },
  'sample-meal-prep': {
    icon: <UtensilsCrossed className="w-5 h-5 text-rose-500" />,
    badge: 'Everyday Lifestyle',
    color: 'rose',
    readTime: '3 min read',
    highlight: 'Checklists, grocery tables, and prep schedules',
  },
};

export const LinkInputBar: React.FC<LinkInputBarProps> = ({
  onFetchUrl,
  onSelectSample,
  onOpenRawModal,
  samples,
  loading,
  compact = false,
}) => {
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let cleaned = url.trim();
    if (cleaned) {
      if (
        !/^https?:\/\//i.test(cleaned) &&
        (cleaned.startsWith('chatgpt.com') ||
          cleaned.startsWith('chat.openai.com') ||
          cleaned.includes('.'))
      ) {
        cleaned = `https://${cleaned}`;
      }
      onFetchUrl(cleaned);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setUrl(text.trim());
      }
    } catch {
      // Fallback
    }
  };

  /* ─── Compact Mode (shown above active conversation) ─── */
  if (compact) {
    return (
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0c1220]/70 backdrop-blur-md px-4 py-2.5 select-none transition-colors">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center gap-2">
          <div className="relative flex-1">
            <Link2
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste another ChatGPT link to import..."
              aria-label="ChatGPT conversation share link"
              className="w-full rounded-xl pl-10 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              disabled={loading}
            />
            {url && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            icon={<Sparkles className="w-3.5 h-3.5" />}
            className="rounded-xl shadow-xs"
          >
            <span>Load</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onOpenRawModal}
            title="Paste conversation text directly"
            icon={<ClipboardCopy className="w-3.5 h-3.5" />}
            className="rounded-xl"
          >
            <span className="hidden sm:inline">Paste Text</span>
          </Button>
        </form>
      </div>
    );
  }

  /* ─── Friendly Consumer Hero Landing Page ─── */
  return (
    <div className="w-full max-w-4xl mx-auto py-12 sm:py-20 px-4 sm:px-6 text-center select-none">
      {/* Friendly Badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-6 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 shadow-2xs"
      >
        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
        <span>Easy, Private & Beautiful ChatGPT Exporter</span>
      </motion.div>

      {/* Main Friendly Title */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 leading-tight"
      >
        Turn your ChatGPT chats into{' '}
        <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
          beautiful PDFs
        </span>
      </motion.h1>

      {/* Friendly Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal"
      >
        Paste a public ChatGPT link to create clean, publication-grade documents. Ready to print, save, or share with full formatting.
      </motion.p>

      {/* Central Link Input Box */}
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        onSubmit={handleSubmit}
        className={cn(
          'p-2 sm:p-2.5 rounded-2xl sm:rounded-full bg-white dark:bg-[#111827] border flex flex-col sm:flex-row items-stretch sm:items-center gap-2 transition-all duration-200 max-w-2xl mx-auto shadow-md',
          isFocused
            ? 'border-emerald-500 ring-4 ring-emerald-500/15 shadow-xl'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        )}
      >
        <div className="relative flex-1 flex items-center">
          <Link2
            className={cn(
              'w-5 h-5 ml-3 mr-2 shrink-0 transition-colors',
              isFocused ? 'text-emerald-500' : 'text-slate-400'
            )}
            aria-hidden="true"
          />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Paste a ChatGPT share link (https://chatgpt.com/share/...)"
            aria-label="Paste ChatGPT share link"
            className="w-full py-2.5 text-sm sm:text-base outline-none bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            required
            autoFocus
          />
          {url && (
            <button
              type="button"
              onClick={() => setUrl('')}
              className="p-1.5 mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!url && (
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Paste from clipboard"
            >
              <ClipboardCopy className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="rounded-xl sm:rounded-full px-6 shadow-md shadow-emerald-500/20 font-semibold text-sm w-full sm:w-auto"
          >
            <span>Create PDF</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </motion.form>

      {/* Alternative Action Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400"
      >
        <span>No link?</span>
        <button
          onClick={onOpenRawModal}
          className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
        >
          <ClipboardCopy className="w-3.5 h-3.5" />
          <span>Paste conversation text or JSON directly</span>
        </button>
      </motion.div>

      {/* ─── Visual Showcase Gallery (Try an Example) ─── */}
      <div className="mt-14 sm:mt-16 text-left">
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Or try an example conversation</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any sample below to see how it renders instantly
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {samples.map((s, idx) => {
            const details = sampleCategoryDetails[s.id] || {
              icon: <FileText className="w-5 h-5 text-emerald-500" />,
              badge: s.category || 'General',
              color: 'emerald',
              readTime: `${s.message_count} messages`,
              highlight: 'Formatted conversation with formatting',
            };

            return (
              <motion.div
                key={s.id}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectSample(s.id)}
                className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {details.icon}
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {details.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 mb-1">
                    {s.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {details.highlight}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                  <span>{details.readTime}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Try Demo</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ─── 3 Clean Value Props ─── */}
      <div className="mt-14 pt-8 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">100% Private</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Processed directly on your machine. No accounts, logs, or third-party tracking.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Vector Sharp</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Real selectable text, mathematical formulas, and crisp page breaks for printing.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">6 Beautiful Styles</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              From cozy warm stationery to clean white and deep dark themes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
