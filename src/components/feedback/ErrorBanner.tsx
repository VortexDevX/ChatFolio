import React from 'react';
import { AlertCircle, RotateCcw, ClipboardCopy } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onOpenImport?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onRetry,
  onOpenImport,
}) => {
  const isCloudflare =
    message.toLowerCase().includes('cloudflare') ||
    message.toLowerCase().includes('challenge') ||
    message.toLowerCase().includes('403');

  return (
    <div className="max-w-2xl mx-auto my-6 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-900 space-y-3 animate-fade-in shadow-sm select-none">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
        <div className="flex-1 text-xs">
          <p className="font-bold text-rose-950 text-sm mb-1">
            {isCloudflare ? 'Cloudflare Verification Detected' : 'Conversion Notice'}
          </p>
          <p className="text-rose-800 leading-relaxed">{message}</p>
          {isCloudflare && (
            <p className="text-rose-700 mt-2">
              ChatGPT has challenged the automated connection. You can bypass this instantly by opening the page, right-clicking &gt; <strong>View Page Source</strong>, and pasting it into the Manual Import modal.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-rose-200 justify-end">
        {onRetry && (
          <Button variant="ghost" size="xs" onClick={onRetry} icon={<RotateCcw className="w-3 h-3" />}>
            <span>Retry</span>
          </Button>
        )}
        {onOpenImport && (
          <Button
            variant="outline"
            size="xs"
            onClick={onOpenImport}
            icon={<ClipboardCopy className="w-3 h-3" />}
          >
            <span>Open Manual Import</span>
          </Button>
        )}
      </div>
    </div>
  );
};
