import React, { useState } from 'react';
import { Sparkles, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SampleChatSummary } from '@/types/chat';

interface EmptyStateProps {
  onFetchUrl: (url: string) => void;
  onSelectSample: (id: string) => void;
  onOpenImportModal: () => void;
  samples: SampleChatSummary[];
  loading: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onFetchUrl,
  onSelectSample,
  onOpenImportModal,
  samples,
  loading,
}) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onFetchUrl(url.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center select-none animate-fade-in">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-medium mb-4">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Precision Vector PDF Exporter</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-800 mb-2">
        Where is your ChatGPT link?
      </h2>
      <p className="text-sm text-stone-600 max-w-lg mx-auto mb-8 leading-relaxed">
        Paste any shared ChatGPT link below to convert it into a publication-ready PDF in seconds.
      </p>

      {/* URL Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-xl mx-auto mb-6">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://chatgpt.com/share/..."
            required
            className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <Button variant="primary" size="md" type="submit" loading={loading} icon={<Sparkles className="w-3.5 h-3.5" />}>
          <span>Fetch Chat</span>
        </Button>
      </form>

      {/* Preloaded Samples */}
      {samples.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-stone-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Or try a demo conversation:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {samples.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectSample(s.id)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-250 text-xs text-stone-700 font-medium transition-colors shadow-2xs cursor-pointer"
              >
                <span>{s.title.split('—')[0].trim()}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
