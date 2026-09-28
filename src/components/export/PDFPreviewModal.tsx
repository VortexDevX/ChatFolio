import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Download,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ChatConversation, ExportOptions, ThemeId } from '@/types/chat';
import { THEMES } from '@/tokens/theme';
import { exportHtml } from '@/lib/api';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: ChatConversation;
  theme: ThemeId;
  onThemeChange?: (theme: ThemeId) => void;
  options: ExportOptions;
  selectedIds: Set<string>;
  onExportPdf: () => void;
  isExporting: boolean;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  chat,
  theme,
  onThemeChange,
  options,
  selectedIds,
  onExportPdf,
  isExporting,
}) => {
  const [zoom, setZoom] = useState(1.0);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeHeight, setIframeHeight] = useState<number>(1000);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const tConfig = THEMES[theme] || THEMES.obsidian;

  // Fetch true backend-rendered HTML whenever parameters change
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const html = await exportHtml(chat, theme, options, Array.from(selectedIds));
        if (isMounted) {
          setPreviewHtml(html);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to generate preview document');
          setIsLoading(false);
        }
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, chat, theme, options, selectedIds]);

  // Adjust iframe height to fit contents dynamically
  const adjustHeight = () => {
    try {
      if (iframeRef.current && iframeRef.current.contentDocument) {
        const doc = iframeRef.current.contentDocument;
        const body = doc.body;
        const html = doc.documentElement;
        if (body && html) {
          const height = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight
          );
          if (height > 100) {
            setIframeHeight(height + 40);
          }
        }
      }
    } catch {
      // Ignore cross-origin access issues if any
    }
  };

  useEffect(() => {
    if (previewHtml) {
      const timer = setTimeout(adjustHeight, 350);
      return () => clearTimeout(timer);
    }
  }, [previewHtml]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/75 dark:bg-black/85 backdrop-blur-md flex flex-col select-none"
    >
      {/* Top Preview Bar */}
      <div className="h-14 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0c1220]/95 backdrop-blur-xl flex items-center justify-between text-slate-800 dark:text-white shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            <span>Back to Editor</span>
          </Button>

          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

          {/* Theme Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden md:inline">
              Theme:
            </span>
            {onThemeChange ? (
              <select
                value={theme}
                onChange={(e) => onThemeChange(e.target.value as ThemeId)}
                className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1 outline-none cursor-pointer focus:border-emerald-500 font-medium hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
              >
                {(Object.keys(THEMES) as ThemeId[]).map((tId) => (
                  <option key={tId} value={tId}>
                    {THEMES[tId].name}
                  </option>
                ))}
              </select>
            ) : (
              <strong className="text-slate-900 dark:text-white text-xs">{tConfig.name}</strong>
            )}

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
              <FileText className="w-3 h-3 text-slate-400" />
              <span>{options.paper_size}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="capitalize">{options.margins} Margins</span>
            </div>
          </div>
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 text-xs text-slate-700 dark:text-slate-300">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, Math.round((z - 0.1) * 10) / 10))}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded cursor-pointer transition-colors"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1.0)}
              className="px-2 font-mono text-[11px] min-w-12 text-center hover:text-slate-900 dark:hover:text-white cursor-pointer"
              title="Reset Zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(1.6, Math.round((z + 0.1) * 10) / 10))}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded cursor-pointer transition-colors"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onExportPdf}
            loading={isExporting}
            icon={<Download className="w-3.5 h-3.5" />}
            className="shadow-sm rounded-xl font-medium"
          >
            <span>Download PDF</span>
          </Button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ml-1 transition-colors"
            title="Close Preview"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Preview Scroll Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 md:p-12 flex justify-center items-start">
        {/* Loading Spinner */}
        {isLoading && !previewHtml && (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3 my-auto">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <span className="text-sm font-medium">Generating preview document...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-md bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 text-center space-y-4 my-auto shadow-xl">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <div>
              <h3 className="text-slate-900 dark:text-white font-semibold text-base mb-1">
                Preview Generation Failed
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsLoading(true);
                setError(null);
                exportHtml(chat, theme, options, Array.from(selectedIds))
                  .then((html) => {
                    setPreviewHtml(html);
                    setIsLoading(false);
                  })
                  .catch((err) => {
                    setError(err instanceof Error ? err.message : 'Error fetching preview');
                    setIsLoading(false);
                  });
              }}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              className="mx-auto rounded-xl"
            >
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* Live Document Paper Sheet */}
        {previewHtml && (
          <div
            className="w-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden relative transition-all duration-200"
            style={{
              zoom: zoom,
              minHeight: `${iframeHeight}px`,
              border: `1px solid ${tConfig.paperBorder || 'rgba(148,163,184,0.2)'}`,
              backgroundColor: tConfig.paperBg || '#ffffff',
            }}
          >
            {isLoading && (
              <div className="absolute inset-0 bg-black/25 backdrop-blur-xs flex items-center justify-center z-20">
                <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs px-3.5 py-2 rounded-full flex items-center gap-2 shadow-lg border border-slate-200 dark:border-slate-700">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                  <span>Updating layout...</span>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              srcDoc={previewHtml}
              title="PDF Document Preview"
              sandbox="allow-scripts allow-same-origin allow-popups"
              onLoad={adjustHeight}
              className="w-full border-0 block"
              style={{
                height: `${iframeHeight}px`,
                backgroundColor: 'transparent',
              }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};
