import { useState, useCallback } from 'react';
import { ChatConversation, ExportOptions, ThemeId } from '@/types/chat';
import * as api from '@/lib/api';
import { recordExportToStash } from '@/lib/storage';

function getSafeSlug(title?: string): string {
  const clean = (title || 'chat')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 35);
  return clean || 'chat';
}

export function useExport() {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportPdf = useCallback(
    async (
      chat: ChatConversation,
      theme: ThemeId,
      options: ExportOptions,
      selectedIds: string[]
    ) => {
      setIsExporting(true);
      setExportError(null);
      try {
        const blob = await api.exportPdf(chat, theme, options, selectedIds);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const slug = getSafeSlug(options.custom_title || chat.title);
        const filename = `${slug}-${Date.now()}.pdf`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        // Cache in Stash
        await recordExportToStash(
          options.custom_title || chat.title || 'Untitled Folio',
          filename,
          'pdf',
          theme,
          blob
        );
      } catch (err: any) {
        setExportError(err.message || 'PDF export failed.');
        throw err;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const exportMarkdown = useCallback(
    (chat: ChatConversation, options: ExportOptions, selectedIds: string[]) => {
      const selectedSet = new Set(selectedIds);
      const title = options.custom_title || chat.title || 'ChatGPT Conversation';
      const lines: string[] = [`# ${title}`, ''];

      if (chat.model) {
        lines.push(`*Model: ${chat.model}*`);
        lines.push('');
      }

      const filtered = chat.messages.filter((m) => {
        if (!selectedSet.has(m.id)) return false;
        if (options.show_user_msgs === false && m.role === 'user') return false;
        if (options.show_ai_msgs === false && m.role !== 'user') return false;
        return true;
      });
      filtered.forEach((msg) => {
        const role = msg.role === 'user' ? 'User' : 'ChatGPT';
        lines.push(`### ${msg.author || role}`);
        lines.push('');
        if (options.show_thoughts && msg.thought) {
          lines.push('> **Thought Process / Reasoning:**');
          msg.thought.split('\n').forEach((tl) => lines.push(`> ${tl}`));
          lines.push('');
        }
        lines.push(msg.content.trim());
        lines.push('');
        if (msg.assets && msg.assets.length > 0) {
          msg.assets.forEach((att) => {
            if (att.asset_type === 'image' && att.url) {
              lines.push(`![${att.filename || 'Image'}](${att.url})`);
            } else if (att.url) {
              lines.push(`📎 [${att.filename || 'Attachment'}](${att.url})`);
            }
          });
          lines.push('');
        }
      });

      const mdText = lines.join('\n');
      const blob = new Blob([mdText], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const slug = getSafeSlug(title);
      const filename = `${slug}.md`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      recordExportToStash(title, filename, 'markdown', 'editorial', blob);
    },
    []
  );

  const exportHtml = useCallback(
    async (
      chat: ChatConversation,
      theme: ThemeId,
      options: ExportOptions,
      selectedIds: string[]
    ) => {
      try {
        const html = await api.exportHtml(chat, theme, options, selectedIds);
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const slug = getSafeSlug(options.custom_title || chat.title);
        const filename = `${slug}.html`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        await recordExportToStash(
          options.custom_title || chat.title || 'Untitled Folio',
          filename,
          'html',
          theme,
          blob
        );
      } catch (err: any) {
        setExportError(err.message || 'HTML export failed.');
        throw err;
      }
    },
    []
  );

  const printBrowser = useCallback(() => {
    window.print();
  }, []);

  return {
    isExporting,
    exportError,
    exportPdf,
    exportMarkdown,
    exportHtml,
    printBrowser,
  };
}
