import React, { useState, useEffect, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { ChatConversation, ExportOptions, ThemeId } from '@/types/chat';
import { THEMES } from '@/tokens/theme';
import { exportHtml } from '@/lib/api';

interface LiveDocumentCanvasProps {
  chat: ChatConversation;
  theme: ThemeId;
  options: ExportOptions;
  selectedIds: Set<string>;
}

export const LiveDocumentCanvas: React.FC<LiveDocumentCanvasProps> = ({
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

  // Fetch true backend-rendered HTML debounced
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
          setError(err instanceof Error ? err.message : 'Could not generate live preview');
          setIsLoading(false);
        }
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [chat, theme, options, selectedIds]);

  // Paper width styles based on paper size
  const paperWidthClass =
    options.paper_size === 'Letter'
      ? 'w-[750px] min-h-[970px]'
      : options.paper_size === 'Continuous'
      ? 'w-[750px] min-h-[1400px]'
      : 'w-[750px] min-h-[1060px]'; // A4 default

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-[#070b13] overflow-hidden select-none border-l border-slate-200 dark:border-slate-800 transition-colors">
      {/* Canvas Top Bar */}
      <div className="h-10 px-4 bg-white/90 dark:bg-[#0c1220]/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 shrink-0">
        <div className="flex items-center gap-2 font-medium">
          <FileText className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-slate-800 dark:text-slate-200 font-semibold">Live Document Preview</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-[11px] text-slate-500">{options.paper_size}</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-[11px] capitalize text-slate-500">{options.margins} Margins</span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))))}
            className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setZoom(1.0)}
            className="px-1.5 py-0.5 text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors"
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
        <div className="h-0.5 w-full bg-emerald-500/20 overflow-hidden shrink-0">
          <div className="h-full bg-emerald-500 animate-pulse w-2/3" />
        </div>
      )}

      {/* Canvas Workspace Viewport */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start relative"
      >
        {error ? (
          <div className="max-w-md my-auto p-6 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 shadow-xl text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Preview Generation Error
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              Try Again
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
            {/* The Realistic Paper Sheet */}
            <div
              className={`${paperWidthClass} rounded-xs shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] ring-1 ring-slate-900/10 dark:ring-white/10 overflow-hidden relative`}
              style={{
                backgroundColor: tConfig.paperBg || '#ffffff',
              }}
            >
              {previewHtml ? (
                <iframe
                  ref={iframeRef}
                  srcDoc={previewHtml}
                  title="Live Document Preview"
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
                <div className="w-full h-[600px] flex items-center justify-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
