import { ChatConversation, ExportOptions, SampleChatSummary, ThemeId } from '@/types/chat';

const BASE_URL = '';

export async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getSamples(): Promise<SampleChatSummary[]> {
  const res = await fetch(`${BASE_URL}/api/samples`);
  if (!res.ok) throw new Error('Failed to fetch demo conversations.');
  const data = await res.json();
  return data.samples;
}

export async function getSample(id: string): Promise<ChatConversation> {
  const res = await fetch(`${BASE_URL}/api/samples/${id}`);
  if (!res.ok) throw new Error(`Demo conversation ${id} not found.`);
  return await res.json();
}

export async function fetchConversation(url: string): Promise<ChatConversation> {
  const res = await fetch(`${BASE_URL}/api/fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || 'Could not fetch conversation from link.');
  }

  return await res.json();
}

export async function parseRaw(raw: string): Promise<ChatConversation> {
  const res = await fetch(`${BASE_URL}/api/parse-raw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || 'Could not parse conversation from text.');
  }

  return await res.json();
}

export async function exportPdf(
  chat: ChatConversation,
  theme: ThemeId,
  options: ExportOptions,
  selectedIds: string[]
): Promise<Blob> {
  const res = await fetch(`${BASE_URL}/api/export-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat,
      theme,
      options: {
        ...options,
        selected_ids: selectedIds,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Export failed' }));
    throw new Error(err.detail || 'PDF export failed.');
  }

  return await res.blob();
}

export async function exportHtml(
  chat: ChatConversation,
  theme: ThemeId,
  options: ExportOptions,
  selectedIds: string[]
): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/export-html`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat,
      theme,
      options: {
        ...options,
        selected_ids: selectedIds,
      },
    }),
  });

  if (!res.ok) throw new Error('HTML export failed.');
  return await res.text();
}
