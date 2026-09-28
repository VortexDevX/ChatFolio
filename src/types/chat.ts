export type ChatRole = 'user' | 'assistant' | 'tool' | 'system';

export interface ChatAsset {
  asset_type: 'image' | 'file';
  url: string;
  filename: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  author: string;
  content: string;
  created_at?: number;
  thought?: string | null;
  assets?: ChatAsset[];
}

export interface ChatConversation {
  share_id: string;
  title: string;
  model: string;
  updated_at?: number | null;
  messages: ChatMessage[];
  category?: string;
}

export type PaperSize = 'A4' | 'Letter' | 'Continuous';
export type FontFamily = 'system' | 'serif' | 'mono' | 'elegant';
export type FontSize = 'small' | 'medium' | 'large';
export type PageMargins = 'narrow' | 'normal' | 'wide';
export type PageBreakMode = 'continuous' | 'pair' | 'message';

export type ThemeId =
  | 'obsidian'
  | 'editorial'
  | 'chatgpt'
  | 'academic'
  | 'monochrome'
  | 'cyberpunk';

export interface ExportOptions {
  paper_size: PaperSize;
  font_family: FontFamily;
  font_size: FontSize;
  margins: PageMargins;
  page_break_mode?: PageBreakMode;
  custom_title: string;
  custom_subtitle: string;
  author_tag: string;
  watermark: string;
  show_user_msgs: boolean;
  show_ai_msgs: boolean;
  show_thoughts: boolean;
  show_metadata_banner: boolean;
  show_line_numbers: boolean;
}

export interface SampleChatSummary {
  id: string;
  title: string;
  category: string;
  model: string;
  message_count: number;
}
