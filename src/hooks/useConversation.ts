import { useState, useEffect, useCallback } from 'react';
import { ChatConversation, SampleChatSummary } from '@/types/chat';
import * as api from '@/lib/api';
import { redactConversation } from '@/lib/redaction';

function sanitizeChat(chat: ChatConversation): ChatConversation {
  const cleanMessages = chat.messages.filter((m) => {
    const role = (m.role || '').toLowerCase();
    if (role === 'system' || role === 'tool') return false;
    const content = (m.content || '').toLowerCase().trim();
    if (content.includes('the output of this plugin was redacted')) return false;
    if (content.startsWith('original custom instructions no longer available')) return false;
    if (!content && (!m.assets || m.assets.length === 0)) return false;
    return true;
  });
  return { ...chat, messages: cleanMessages };
}

export function useConversation() {
  const [chat, setChat] = useState<ChatConversation | null>(null);
  const [originalChat, setOriginalChat] = useState<ChatConversation | null>(null);
  const [preRedactionChat, setPreRedactionChat] = useState<ChatConversation | null>(null);
  const [samples, setSamples] = useState<SampleChatSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [redactedCount, setRedactedCount] = useState<number>(0);

  // Load sample list on mount
  useEffect(() => {
    api.getSamples()
      .then((data) => setSamples(data))
      .catch((err) => console.warn('Could not load samples:', err));
  }, []);

  const loadSample = useCallback(async (sampleId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSample(sampleId);
      const clean = sanitizeChat(data);
      setChat(clean);
      setOriginalChat(JSON.parse(JSON.stringify(clean)));
      setPreRedactionChat(null);
      setRedactedCount(0);
    } catch (err: any) {
      setError(err.message || 'Failed to load sample conversation.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUrl = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchConversation(url);
      const clean = sanitizeChat(data);
      setChat(clean);
      setOriginalChat(JSON.parse(JSON.stringify(clean)));
      setPreRedactionChat(null);
      setRedactedCount(0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch conversation.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRaw = useCallback(async (raw: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.parseRaw(raw);
      const clean = sanitizeChat(data);
      setChat(clean);
      setOriginalChat(JSON.parse(JSON.stringify(clean)));
      setPreRedactionChat(null);
      setRedactedCount(0);
    } catch (err: any) {
      setError(err.message || 'Failed to parse conversation.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMessageContent = useCallback((id: string, newContent: string) => {
    setChat((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        messages: prev.messages.map((m) => (m.id === id ? { ...m, content: newContent } : m)),
      };
    });
  }, []);

  const redactMessages = useCallback(() => {
    if (!chat) return 0;
    const { messages, count } = redactConversation(chat.messages);
    if (count > 0) {
      setPreRedactionChat(JSON.parse(JSON.stringify(chat)));
      setChat((prev) => (prev ? { ...prev, messages } : null));
      setRedactedCount(count);
    }
    return count;
  }, [chat]);

  const undoRedaction = useCallback(() => {
    if (preRedactionChat) {
      setChat(JSON.parse(JSON.stringify(preRedactionChat)));
      setRedactedCount(0);
      setPreRedactionChat(null);
    } else if (originalChat) {
      setChat(JSON.parse(JSON.stringify(originalChat)));
      setRedactedCount(0);
    }
  }, [preRedactionChat, originalChat]);

  const updateTitle = useCallback((title: string) => {
    setChat((prev) => (prev ? { ...prev, title } : null));
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setChat((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        messages: prev.messages.filter((m) => m.id !== id),
      };
    });
  }, []);

  const loadChatDirect = useCallback((directChat: ChatConversation) => {
    const clean = sanitizeChat(directChat);
    setChat(clean);
    setOriginalChat(JSON.parse(JSON.stringify(clean)));
    setPreRedactionChat(null);
    setRedactedCount(0);
  }, []);

  return {
    chat,
    samples,
    loading,
    error,
    redactedCount,
    loadUrl,
    loadRaw,
    loadSample,
    loadChatDirect,
    updateMessageContent,
    deleteMessage,
    redactMessages,
    undoRedaction,
    updateTitle,
  };
}
