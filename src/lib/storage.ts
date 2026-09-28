import { ChatConversation, ExportOptions, ThemeId } from '@/types/chat';

export interface SavedFolio {
  id: string;
  title: string;
  model: string;
  category?: string;
  messageCount: number;
  wordCount: number;
  createdAt: number;
  updatedAt: number;
  chat: ChatConversation;
  theme: ThemeId;
  options: ExportOptions;
  selectedIds: string[];
}

export interface EditorialPreset {
  id: string;
  name: string;
  description: string;
  isCustom?: boolean;
  theme: ThemeId;
  font_family: ExportOptions['font_family'];
  font_size: ExportOptions['font_size'];
  margins: ExportOptions['margins'];
  page_break_mode: ExportOptions['page_break_mode'];
  show_thoughts: boolean;
  show_metadata_banner: boolean;
  show_line_numbers: boolean;
}

export interface ExportStashItem {
  id: string;
  title: string;
  filename: string;
  format: 'pdf' | 'html' | 'markdown';
  timestamp: number;
  theme: ThemeId;
  sizeBytes?: number;
  blob?: Blob;
}

export const BUILTIN_PRESETS: EditorialPreset[] = [
  {
    id: 'executive-brief',
    name: 'Executive Brief',
    description: 'Literary serif, editorial margins & fresh page per Q&A turn',
    isCustom: false,
    theme: 'editorial',
    font_family: 'serif',
    font_size: 'medium',
    margins: 'normal',
    page_break_mode: 'pair',
    show_thoughts: true,
    show_metadata_banner: true,
    show_line_numbers: false,
  },
  {
    id: 'technical-rfc',
    name: 'Technical Whitepaper',
    description: 'Atelier noir dark mode, monospaced code blocks & continuous flow',
    isCustom: false,
    theme: 'obsidian',
    font_family: 'mono',
    font_size: 'small',
    margins: 'narrow',
    page_break_mode: 'continuous',
    show_thoughts: true,
    show_metadata_banner: true,
    show_line_numbers: true,
  },
  {
    id: 'academic-journal',
    name: 'Academic Monograph',
    description: 'Clean academic whitepaper, classic serif & hidden thought scratchpad',
    isCustom: false,
    theme: 'academic',
    font_family: 'serif',
    font_size: 'medium',
    margins: 'wide',
    page_break_mode: 'continuous',
    show_thoughts: false,
    show_metadata_banner: true,
    show_line_numbers: false,
  },
  {
    id: 'clean-minimalist',
    name: 'Modern Atelier',
    description: 'Geometric sans-serif, high-contrast monochrome & per-prompt pagination',
    isCustom: false,
    theme: 'monochrome',
    font_family: 'system',
    font_size: 'medium',
    margins: 'normal',
    page_break_mode: 'message',
    show_thoughts: true,
    show_metadata_banner: true,
    show_line_numbers: false,
  },
];

const DB_NAME = 'chatfolio_storage_v1';
const DB_VERSION = 1;
const STORE_FOLIOS = 'folios';
const STORE_PRESETS = 'presets';
const STORE_STASH = 'export_stash';

// In-memory fallback if IndexedDB is blocked
const memoryFolios: Map<string, SavedFolio> = new Map();
const memoryStash: Map<string, { item: ExportStashItem; blob?: Blob }> = new Map();

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_FOLIOS)) {
          db.createObjectStore(STORE_FOLIOS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_PRESETS)) {
          db.createObjectStore(STORE_PRESETS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_STASH)) {
          db.createObjectStore(STORE_STASH, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// -------------------------------------------------------------
// 1. FOLIO ARCHIVE (RECENT MANUSCRIPTS)
// -------------------------------------------------------------

export async function saveFolioToArchive(
  chat: ChatConversation,
  theme: ThemeId,
  options: ExportOptions,
  selectedIds: string[]
): Promise<SavedFolio> {
  const words = (chat.messages || []).reduce(
    (acc, m) => acc + (m.content ? m.content.split(/\s+/).length : 0),
    0
  );

  const existing = await getFolioById(chat.share_id);
  const now = Date.now();

  const record: SavedFolio = {
    id: chat.share_id,
    title: options.custom_title || chat.title || 'Untitled Folio',
    model: chat.model || 'AI Model',
    category: chat.category || 'General',
    messageCount: chat.messages ? chat.messages.length : 0,
    wordCount: words,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    chat,
    theme,
    options,
    selectedIds,
  };

  const db = await openDatabase();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_FOLIOS, 'readwrite');
        const store = tx.objectStore(STORE_FOLIOS);
        store.put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } else {
    memoryFolios.set(record.id, record);
    try {
      localStorage.setItem(`folio_meta_${record.id}`, JSON.stringify(record));
    } catch {
      // LocalStorage full
    }
  }

  return record;
}

export async function getRecentFolios(): Promise<SavedFolio[]> {
  const db = await openDatabase();
  if (db) {
    return new Promise<SavedFolio[]>((resolve) => {
      try {
        const tx = db.transaction(STORE_FOLIOS, 'readonly');
        const store = tx.objectStore(STORE_FOLIOS);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result as SavedFolio[]) || [];
          list.sort((a, b) => b.updatedAt - a.updatedAt);
          resolve(list);
        };
        req.onerror = () => resolve(Array.from(memoryFolios.values()));
      } catch {
        resolve(Array.from(memoryFolios.values()));
      }
    });
  }

  return Array.from(memoryFolios.values()).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getFolioById(id: string): Promise<SavedFolio | null> {
  const db = await openDatabase();
  if (db) {
    return new Promise<SavedFolio | null>((resolve) => {
      try {
        const tx = db.transaction(STORE_FOLIOS, 'readonly');
        const store = tx.objectStore(STORE_FOLIOS);
        const req = store.get(id);
        req.onsuccess = () => resolve((req.result as SavedFolio) || null);
        req.onerror = () => resolve(memoryFolios.get(id) || null);
      } catch {
        resolve(memoryFolios.get(id) || null);
      }
    });
  }

  return memoryFolios.get(id) || null;
}

export async function deleteFolio(id: string): Promise<void> {
  const db = await openDatabase();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_FOLIOS, 'readwrite');
        const store = tx.objectStore(STORE_FOLIOS);
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
  memoryFolios.delete(id);
}

export async function clearAllFolios(): Promise<void> {
  const db = await openDatabase();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_FOLIOS, 'readwrite');
        const store = tx.objectStore(STORE_FOLIOS);
        store.clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
  memoryFolios.clear();
}

// -------------------------------------------------------------
// 2. EDITORIAL STYLE PRESETS
// -------------------------------------------------------------

export async function getEditorialPresets(): Promise<EditorialPreset[]> {
  let customPresets: EditorialPreset[] = [];

  const db = await openDatabase();
  if (db) {
    customPresets = await new Promise<EditorialPreset[]>((resolve) => {
      try {
        const tx = db.transaction(STORE_PRESETS, 'readonly');
        const store = tx.objectStore(STORE_PRESETS);
        const req = store.getAll();
        req.onsuccess = () => resolve((req.result as EditorialPreset[]) || []);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  } else {
    try {
      const stored = localStorage.getItem('chatfolio_custom_presets');
      if (stored) customPresets = JSON.parse(stored);
    } catch {
      // fallback
    }
  }

  return [...BUILTIN_PRESETS, ...customPresets];
}

export async function saveCustomPreset(
  name: string,
  theme: ThemeId,
  options: ExportOptions
): Promise<EditorialPreset> {
  const preset: EditorialPreset = {
    id: `preset-${Date.now()}`,
    name: name.trim(),
    description: `Custom Preset (${theme}, ${options.font_family})`,
    isCustom: true,
    theme,
    font_family: options.font_family,
    font_size: options.font_size,
    margins: options.margins,
    page_break_mode: options.page_break_mode || 'pair',
    show_thoughts: options.show_thoughts,
    show_metadata_banner: options.show_metadata_banner,
    show_line_numbers: options.show_line_numbers,
  };

  const db = await openDatabase();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_PRESETS, 'readwrite');
        const store = tx.objectStore(STORE_PRESETS);
        store.put(preset);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } else {
    try {
      const current = await getEditorialPresets();
      const customOnly = current.filter((p) => p.isCustom);
      customOnly.push(preset);
      localStorage.setItem('chatfolio_custom_presets', JSON.stringify(customOnly));
    } catch {
      // ignore
    }
  }

  return preset;
}

export async function deleteCustomPreset(id: string): Promise<void> {
  const db = await openDatabase();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_PRESETS, 'readwrite');
        const store = tx.objectStore(STORE_PRESETS);
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } else {
    try {
      const current = await getEditorialPresets();
      const filtered = current.filter((p) => p.isCustom && p.id !== id);
      localStorage.setItem('chatfolio_custom_presets', JSON.stringify(filtered));
    } catch {
      // ignore
    }
  }
}

// -------------------------------------------------------------
// 3. EXPORT HISTORY & QUICK STASH
// -------------------------------------------------------------

export async function recordExportToStash(
  title: string,
  filename: string,
  format: 'pdf' | 'html' | 'markdown',
  theme: ThemeId,
  blob?: Blob
): Promise<ExportStashItem> {
  const item: ExportStashItem = {
    id: `export-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title,
    filename,
    format,
    timestamp: Date.now(),
    theme,
    sizeBytes: blob ? blob.size : undefined,
    blob,
  };

  const db = await openDatabase();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_STASH, 'readwrite');
        const store = tx.objectStore(STORE_STASH);
        store.put(item);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } else {
    memoryStash.set(item.id, { item, blob });
  }

  return item;
}

export async function getExportStash(): Promise<ExportStashItem[]> {
  const db = await openDatabase();
  if (db) {
    return new Promise<ExportStashItem[]>((resolve) => {
      try {
        const tx = db.transaction(STORE_STASH, 'readonly');
        const store = tx.objectStore(STORE_STASH);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result as ExportStashItem[]) || [];
          list.sort((a, b) => b.timestamp - a.timestamp);
          resolve(list);
        };
        req.onerror = () => resolve(Array.from(memoryStash.values()).map((v) => v.item));
      } catch {
        resolve(Array.from(memoryStash.values()).map((v) => v.item));
      }
    });
  }

  return Array.from(memoryStash.values())
    .map((v) => v.item)
    .sort((a, b) => b.timestamp - a.timestamp);
}

export async function downloadStashedItem(item: ExportStashItem): Promise<boolean> {
  let blobToDownload = item.blob;

  if (!blobToDownload) {
    // Try fetching from IndexedDB
    const db = await openDatabase();
    if (db) {
      const fromDb = await new Promise<ExportStashItem | null>((resolve) => {
        try {
          const tx = db.transaction(STORE_STASH, 'readonly');
          const store = tx.objectStore(STORE_STASH);
          const req = store.get(item.id);
          req.onsuccess = () => resolve((req.result as ExportStashItem) || null);
          req.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      });
      if (fromDb?.blob) blobToDownload = fromDb.blob;
    }
  }

  if (!blobToDownload) {
    const fromMem = memoryStash.get(item.id);
    if (fromMem?.blob) blobToDownload = fromMem.blob;
  }

  if (blobToDownload) {
    const url = URL.createObjectURL(blobToDownload);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return true;
  }

  return false;
}

export async function deleteStashedItem(id: string): Promise<void> {
  const db = await openDatabase();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_STASH, 'readwrite');
        const store = tx.objectStore(STORE_STASH);
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
  memoryStash.delete(id);
}

export async function clearExportStash(): Promise<void> {
  const db = await openDatabase();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_STASH, 'readwrite');
        const store = tx.objectStore(STORE_STASH);
        store.clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
  memoryStash.clear();
}
