import { useState, useCallback, useEffect } from 'react';
import { ChatMessage } from '@/types/chat';

export function useSelection(messages: ChatMessage[] = []) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    return new Set(messages.map((m) => m.id));
  });
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

  // Synchronize when conversation changes, preserving existing user selections
  useEffect(() => {
    if (messages.length > 0) {
      setSelectedIds((prev) => {
        const currentIds = new Set(messages.map((m) => m.id));
        const hasOverlap = Array.from(prev).some((id) => currentIds.has(id));
        if (!hasOverlap || prev.size === 0) {
          return currentIds;
        }
        // Preserve user selections, pruning only deleted message IDs
        const next = new Set<string>();
        prev.forEach((id) => {
          if (currentIds.has(id)) next.add(id);
        });
        return next;
      });
      setLastClickedIndex(null);
    }
  }, [messages]);

  const resetSelection = useCallback((newMessages: ChatMessage[]) => {
    setSelectedIds(new Set(newMessages.map((m) => m.id)));
    setLastClickedIndex(null);
  }, []);

  const toggleMessage = useCallback(
    (id: string, index: number, isShiftKey: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);

        // Shift-click range selection
        if (isShiftKey && lastClickedIndex !== null && lastClickedIndex !== index && messages.length > 0) {
          const start = Math.min(lastClickedIndex, index);
          const end = Math.max(lastClickedIndex, index);

          // Check if anchor was selected or unselected
          const anchorSelected = prev.has(messages[lastClickedIndex]?.id);

          for (let i = start; i <= end; i++) {
            if (messages[i]) {
              if (anchorSelected) {
                next.add(messages[i].id);
              } else {
                next.delete(messages[i].id);
              }
            }
          }
        } else {
          // Standard single toggle
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
        }

        return next;
      });

      setLastClickedIndex(index);
    },
    [lastClickedIndex, messages]
  );

  const selectAll = useCallback(
    (allMessages?: ChatMessage[]) => {
      const target = Array.isArray(allMessages) ? allMessages : messages;
      setSelectedIds(new Set(target.map((m) => m.id)));
      setLastClickedIndex(null);
    },
    [messages]
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastClickedIndex(null);
  }, []);

  const selectRole = useCallback(
    (role: 'user' | 'assistant', allMessages?: ChatMessage[]) => {
      const target = Array.isArray(allMessages) ? allMessages : messages;
      setSelectedIds(new Set(target.filter((m) => m.role === role).map((m) => m.id)));
      setLastClickedIndex(null);
    },
    [messages]
  );

  const invertSelection = useCallback(
    (allMessages?: ChatMessage[]) => {
      const target = Array.isArray(allMessages) ? allMessages : messages;
      setSelectedIds((prev) => {
        const next = new Set<string>();
        target.forEach((m) => {
          if (!prev.has(m.id)) next.add(m.id);
        });
        return next;
      });
    },
    [messages]
  );

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    lastClickedIndex,
    isSelected,
    toggleMessage,
    selectAll,
    clearSelection,
    selectRole,
    invertSelection,
    resetSelection,
  };
}
