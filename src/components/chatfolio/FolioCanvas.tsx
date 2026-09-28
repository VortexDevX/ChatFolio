import React, { useState, useEffect, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Loader2,
  AlertCircle,
  FileText,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { ChatConversation, ExportOptions, ThemeId } from '@/types/chat';
import { THEMES } from '@/tokens/theme';
import { exportHtml } from '@/lib/api';

interface FolioCanvasProps {
  chat: ChatConversation;
  theme: ThemeId;
  options: ExportOptions;
  selectedIds: Set<string>;
}

export const FolioCanvas: React.FC<FolioCanvasProps> = ({
  chat,
  theme,
  options,
  selectedIds,
}) => {
  const [zoom, setZoom] = useState<number>(1.0);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const tConfig = THEMES[theme] || THEMES.editorial;

  useEffect(() => {
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
          setError(err instanceof Error ? err.message : 'Could not generate manuscript preview');
          setIsLoading(false);
        }
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [chat, theme, options, selectedIds]);

  const paperWidthClass =
    options.paper_size === 'Letter'
      ? 'w-[780px] min-h-[1010px]'
      : options.paper_size === 'Continuous'
      ? 'w-[780px] min-h-[1400px]'
      : 'w-[780px] min-h-[1100px]';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f1f3f7] dark:bg-[#07090e] overflow-hidden select-none transition-colors relative">
      {/* Desk Surface Subtle Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40 dark:opacity-20" />

      {/* Canvas Top Stage Bar */}
      <div className="h-11 px-4 sm:px-6 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
            Printing Desk Canvas
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-[11px] font-medium text-slate-500">{options.paper_size} Format</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-[11px] font-medium capitalize text-slate-500">{options.margins} Margins</span>
        </div>

        {/* Zoom & Fit Controls */}
        <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-[#161f36] px-2 py-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700/60">
          <button
            onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))))}
            className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setZoom(1.0)}
            className="px-1.5 py-0.5 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 hover:text-blue-500 transition-colors"
            title="Reset Zoom to 100%"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(1))))}
            className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Loading Progress Bar */}
      {isLoading && (
        <div className="h-0.5 w-full bg-blue-500/20 overflow-hidden shrink-0 z-10">
          <div className="h-full bg-gradient-to-r from-blue-600 to-sky-500 animate-pulse w-3/4" />
        </div>
      )}

      {/* The Virtual Printing Stage */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 sm:p-10 flex justify-center items-start relative z-0"
      >
        {error ? (
          <div className="max-w-md my-auto p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-rose-200 dark:border-rose-900/40 shadow-xl text-center">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Manuscript Rendering Error
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
            >
              Regenerate Page
            </button>
          </div>
        ) : (
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="transition-transform"
          >
            {/* The Physical Sheet on the Desk */}
            <div
              className={`${paperWidthClass} rounded-xs shadow-[0_25px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_30px_70px_rgba(0,0,0,0.7)] ring-1 ring-slate-900/10 dark:ring-blue-500/20 overflow-hidden relative transition-all`}
              style={{
                backgroundColor: tConfig.paperBg || '#ffffff',
              }}
            >
              {previewHtml ? (
                <iframe
                  ref={iframeRef}
                  srcDoc={previewHtml}
                  title="Live Manuscript Preview"
                  sandbox="allow-same-origin"
                  className="w-full min-h-[1100px] border-none block"
                  style={{
                    backgroundColor: tConfig.paperBg || '#ffffff',
                  }}
                  onLoad={() => {
                    try {
                      if (iframeRef.current?.contentDocument?.body) {
                        const h = iframeRef.current.contentDocument.body.scrollHeight;
                        if (h > 500) {
                          iframeRef.current.style.height = `${h + 100}px`;
                        }
                      }
                    } catch {
                      // cross-origin safe
                    }
                  }}
                />
              ) : (
                <div className="w-full h-[650px] flex items-center justify-center text-slate-400">
                  <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
