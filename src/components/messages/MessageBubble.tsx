import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  User,
  Bot,
  Pencil,
  Copy,
  Check,
  Trash2,
  Save,
  X,
  Brain,
  ChevronDown,
  ChevronUp,
  Paperclip,
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import renderMathInElement from 'katex/contrib/auto-render';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import { cn } from '@/lib/utils';
import { ChatMessage, ThemeId } from '@/types/chat';
import { Button } from '@/components/ui/Button';

interface MessageBubbleProps {
  message: ChatMessage;
  index: number;
  isSelected: boolean;
  onToggle: (id: string, index: number, isShiftKey: boolean) => void;
  onUpdateContent: (id: string, newContent: string) => void;
  onDeleteMessage: (id: string) => void;
  showThoughts: boolean;
  theme?: ThemeId;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  index,
  isSelected,
  onToggle,
  onUpdateContent,
  onDeleteMessage,
  showThoughts,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(message.content);
  const [copied, setCopied] = useState(false);
  const [isThoughtExpanded, setIsThoughtExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const isUser = message.role === 'user';

  // Keep draft in sync if external edit happens
  useEffect(() => {
    setDraftContent(message.content);
  }, [message.content]);

  // Apply KaTeX & Prism highlighting when content or selection changes
  useEffect(() => {
    if (contentRef.current && !isEditing) {
      try {
        Prism.highlightAllUnder(contentRef.current);
      } catch (err) {
        console.warn('Prism highlight error:', err);
      }

      try {
        renderMathInElement(contentRef.current, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true },
          ],
          throwOnError: false,
        });
      } catch (err) {
        console.warn('KaTeX render error:', err);
      }
    }
  }, [message.content, message.thought, isSelected, isEditing, isThoughtExpanded]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateContent(message.id, draftContent);
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraftContent(message.content);
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteMessage(message.id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isEditing) return;
    onToggle(message.id, index, e.shiftKey);
  };

  function isSafeUrl(url?: string): boolean {
    if (!url) return false;
    const u = url.trim().toLowerCase();
    return u.startsWith('https://') || u.startsWith('http://') || u.startsWith('data:image/');
  }

  // Safe sanitized markdown render
  const parsedHtml = DOMPurify.sanitize(marked.parse(message.content) as string);

  return (
    <article
      onClick={handleCardClick}
      className={cn(
        'group relative rounded-2xl border transition-all duration-200 select-text p-5 sm:p-6 cursor-pointer',
        isSelected
          ? 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-sm'
          : 'bg-slate-50/70 dark:bg-[#0b0f19]/60 border-slate-200/80 dark:border-slate-800/80 opacity-60 hover:opacity-85'
      )}
    >
      {/* Top Bar: Role Pill + Inclusion Status + Edit / Copy / Delete Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 select-none">
        {/* Left: Role Pill and Status */}
        <div className="flex items-center gap-2.5">
          {/* Inclusion Pill */}
          <div
            className={cn(
              'no-print inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all',
              isSelected
                ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
            )}
            title="Click card to include or exclude from PDF"
          >
            {isSelected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>In PDF</span>
              </>
            ) : (
              <>
                <Circle className="w-3.5 h-3.5 opacity-50" />
                <span>Skipped</span>
              </>
            )}
          </div>

          {/* Role Pill */}
          {isUser ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300">
              <User className="w-3.5 h-3.5 text-rose-500" />
              <span>You</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              <Bot className="w-3.5 h-3.5 text-emerald-500" />
              <span>ChatGPT</span>
            </div>
          )}

          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            #{index + 1}
          </span>
        </div>

        {/* Right: Action Buttons with Lucide Icons */}
        <div className="no-print flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-2xs"
              title="Edit text before exporting"
            >
              <Pencil className="w-3 h-3 text-slate-400" />
              <span>Edit</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-2xs"
            title="Copy message content"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-500 font-bold" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1 p-1.5 rounded-lg border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer text-xs"
            title="Remove message from this conversation"
            aria-label="Remove message"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsible Thought Process */}
      {showThoughts && message.thought && (
        <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080d1a] overflow-hidden text-xs">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsThoughtExpanded(!isThoughtExpanded);
            }}
            className="w-full px-3.5 py-2 flex items-center justify-between text-left text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer font-medium"
          >
            <div className="flex items-center gap-2">
              <Brain className="w-3.5 h-3.5 text-cyan-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                Thought Process / Reasoning
              </span>
            </div>
            {isThoughtExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {isThoughtExpanded && (
            <div className="px-3.5 pb-3 text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 pt-2 font-sans leading-relaxed whitespace-pre-wrap">
              {message.thought}
            </div>
          )}
        </div>
      )}

      {/* Message Content: In-Place Editor OR Rendered Markdown */}
      {isEditing ? (
        <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
          <textarea
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            rows={Math.min(18, Math.max(4, draftContent.split('\n').length + 1))}
            className="w-full rounded-xl p-3.5 font-mono text-xs leading-relaxed outline-none border transition-all resize-y bg-slate-50 dark:bg-slate-900 border-emerald-500 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20"
            autoFocus
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              icon={<X className="w-3.5 h-3.5" />}
            >
              <span>Cancel</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              icon={<Save className="w-3.5 h-3.5" />}
            >
              <span>Save Changes</span>
            </Button>
          </div>
        </div>
      ) : (
        <div
          ref={contentRef}
          className="prose max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: parsedHtml }}
        />
      )}

      {/* Attachments & Images */}
      {message.assets && message.assets.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
          {message.assets.map((asset, aIdx) => {
            if (!asset.url || !isSafeUrl(asset.url)) return null;

            if (asset.asset_type === 'image') {
              return (
                <div
                  key={aIdx}
                  className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-w-md shadow-2xs"
                >
                  <img
                    src={asset.url}
                    alt={asset.filename || 'Attached image'}
                    className="max-h-80 w-auto object-cover"
                    loading="lazy"
                  />
                </div>
              );
            }

            return (
              <a
                key={aIdx}
                href={asset.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-emerald-600 dark:text-emerald-400 transition-colors"
              >
                <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                <span>{asset.filename || 'Download attachment'}</span>
              </a>
            );
          })}
        </div>
      )}
    </article>
  );
};
