import { ThemeId } from '@/types/chat';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  iconName: 'book' | 'file' | 'moon' | 'bot' | 'printer' | 'terminal';
  description: string;
  swatchBg: string;
  swatchBorder: string;
  swatchAccent: string;
  
  // PDF Paper Styles
  paperBg: string;
  paperText: string;
  paperBorder: string;
  userBubbleBg: string;
  aiBubbleBg: string;
  codeBg: string;

  // Whole-Website Theme Styles
  siteBg: string;
  siteText: string;
  headerBg: string;
  headerBorder: string;
  cardBg: string;
  cardBorder: string;
  cardText: string;
  mutedText: string;
  accentBtnBg: string;
  accentBtnText: string;
  userCardBg: string;
  userCardBorder: string;
  aiCardBg: string;
  aiCardBorder: string;
  toolbarBg: string;
  toolbarBorder: string;
  toolbarText: string;
  modalBg: string;
  modalBorder: string;

  // Typography & Code Tokens for Legibility
  codeBlockBg: string;
  codeBlockText: string;
  codeBlockBorder: string;
  inlineCodeBg: string;
  inlineCodeText: string;
  inlineCodeBorder: string;
  quoteBorder: string;
  quoteText: string;
  linkColor: string;
  tableHeaderBg: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  editorial: {
    id: 'editorial',
    name: 'Warm Paper',
    iconName: 'book',
    description: 'Cozy stationery paper with warm tones and classic typography',
    swatchBg: '#faf8f5',
    swatchBorder: '#e2d9c8',
    swatchAccent: '#b45309',
    paperBg: '#faf8f5',
    paperText: '#1c1917',
    paperBorder: '#e7e0d3',
    userBubbleBg: '#f4ece1',
    aiBubbleBg: '#ffffff',
    codeBg: '#ede4d6',

    // Site UI
    siteBg: '#FAF7F2',
    siteText: '#1C1917',
    headerBg: 'rgba(255, 255, 255, 0.95)',
    headerBorder: '#EBE4DA',
    cardBg: '#FFFFFF',
    cardBorder: '#EBE4DA',
    cardText: '#1C1917',
    mutedText: '#78716C',
    accentBtnBg: '#059669',
    accentBtnText: '#FFFFFF',
    userCardBg: '#FFF1F2',
    userCardBorder: '#FECDD3',
    aiCardBg: '#FFFFFF',
    aiCardBorder: '#EBE4DA',
    toolbarBg: 'rgba(255, 255, 255, 0.96)',
    toolbarBorder: '#D6CFC7',
    toolbarText: '#1C1917',
    modalBg: '#FFFFFF',
    modalBorder: '#E7E2DA',

    // Typography & Code Tokens
    codeBlockBg: '#F5ECE3',
    codeBlockText: '#292524',
    codeBlockBorder: '#E3D7C8',
    inlineCodeBg: '#F3EBE1',
    inlineCodeText: '#854D0E',
    inlineCodeBorder: '#E5DCCE',
    quoteBorder: '#D4A373',
    quoteText: '#57534E',
    linkColor: '#059669',
    tableHeaderBg: '#F4ECE1',
  },
  academic: {
    id: 'academic',
    name: 'Clean White',
    iconName: 'file',
    description: 'Crisp minimalist white paper with subtle cool gray borders',
    swatchBg: '#ffffff',
    swatchBorder: '#cbd5e1',
    swatchAccent: '#2563eb',
    paperBg: '#ffffff',
    paperText: '#0f172a',
    paperBorder: '#cbd5e1',
    userBubbleBg: '#f8fafc',
    aiBubbleBg: '#ffffff',
    codeBg: '#f1f5f9',

    // Site UI
    siteBg: '#F8FAFC',
    siteText: '#0F172A',
    headerBg: 'rgba(255, 255, 255, 0.95)',
    headerBorder: '#E2E8F0',
    cardBg: '#FFFFFF',
    cardBorder: '#E2E8F0',
    cardText: '#0F172A',
    mutedText: '#64748B',
    accentBtnBg: '#2563EB',
    accentBtnText: '#FFFFFF',
    userCardBg: '#EFF6FF',
    userCardBorder: '#BFDBFE',
    aiCardBg: '#FFFFFF',
    aiCardBorder: '#E2E8F0',
    toolbarBg: 'rgba(255, 255, 255, 0.96)',
    toolbarBorder: '#CBD5E1',
    toolbarText: '#0F172A',
    modalBg: '#FFFFFF',
    modalBorder: '#CBD5E1',

    // Typography & Code Tokens
    codeBlockBg: '#F1F5F9',
    codeBlockText: '#0F172A',
    codeBlockBorder: '#E2E8F0',
    inlineCodeBg: '#EFF6FF',
    inlineCodeText: '#1D4ED8',
    inlineCodeBorder: '#DBEAFE',
    quoteBorder: '#3B82F6',
    quoteText: '#475569',
    linkColor: '#2563EB',
    tableHeaderBg: '#F8FAFC',
  },
  obsidian: {
    id: 'obsidian',
    name: 'Atelier Noir',
    iconName: 'moon',
    description: 'Precision obsidian dark finish with electric cobalt blue and crisp typography',
    swatchBg: '#090d16',
    swatchBorder: '#1e293b',
    swatchAccent: '#2563eb',
    paperBg: '#090d16',
    paperText: '#f8fafc',
    paperBorder: '#1e293b',
    userBubbleBg: '#161f30',
    aiBubbleBg: '#0f172a',
    codeBg: '#060913',

    // Site UI
    siteBg: '#090D16',
    siteText: '#F8FAFC',
    headerBg: 'rgba(15, 23, 42, 0.95)',
    headerBorder: '#1E293B',
    cardBg: '#0F172A',
    cardBorder: '#1E293B',
    cardText: '#F8FAFC',
    mutedText: '#94A3B8',
    accentBtnBg: '#2563EB',
    accentBtnText: '#FFFFFF',
    userCardBg: '#161F30',
    userCardBorder: '#2D3748',
    aiCardBg: '#0F172A',
    aiCardBorder: '#1E293B',
    toolbarBg: 'rgba(15, 23, 42, 0.96)',
    toolbarBorder: '#2D3748',
    toolbarText: '#F8FAFC',
    modalBg: '#0F172A',
    modalBorder: '#2D3748',

    // Typography & Code Tokens
    codeBlockBg: '#060913',
    codeBlockText: '#F8FAFC',
    codeBlockBorder: '#1E293B',
    inlineCodeBg: '#172554',
    inlineCodeText: '#60A5FA',
    inlineCodeBorder: '#1E3A8A',
    quoteBorder: '#2563EB',
    quoteText: '#94A3B8',
    linkColor: '#38BDF8',
    tableHeaderBg: '#0E1726',
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT Classic',
    iconName: 'bot',
    description: 'Faithful dark charcoal styling inspired by OpenAI web chat',
    swatchBg: '#212327',
    swatchBorder: '#383a40',
    swatchAccent: '#10a37f',
    paperBg: '#212327',
    paperText: '#ececf1',
    paperBorder: '#383a40',
    userBubbleBg: '#2f3136',
    aiBubbleBg: '#212327',
    codeBg: '#18191c',

    // Site UI
    siteBg: '#212327',
    siteText: '#ECECF1',
    headerBg: 'rgba(33, 35, 39, 0.95)',
    headerBorder: '#383A40',
    cardBg: '#2F3136',
    cardBorder: '#383A40',
    cardText: '#ECECF1',
    mutedText: '#B0B4C0',
    accentBtnBg: '#10A37F',
    accentBtnText: '#FFFFFF',
    userCardBg: '#2A2B32',
    userCardBorder: '#40414F',
    aiCardBg: '#212327',
    aiCardBorder: '#383A40',
    toolbarBg: 'rgba(47, 49, 54, 0.96)',
    toolbarBorder: '#40414F',
    toolbarText: '#ECECF1',
    modalBg: '#2F3136',
    modalBorder: '#40414F',

    // Typography & Code Tokens
    codeBlockBg: '#17181C',
    codeBlockText: '#ECECF1',
    codeBlockBorder: '#383A40',
    inlineCodeBg: '#383A40',
    inlineCodeText: '#10A37F',
    inlineCodeBorder: '#4E5058',
    quoteBorder: '#10A37F',
    quoteText: '#B0B4C0',
    linkColor: '#10A37F',
    tableHeaderBg: '#1E2024',
  },
  monochrome: {
    id: 'monochrome',
    name: 'Printer Friendly',
    iconName: 'printer',
    description: 'High contrast black and white minimal ink design',
    swatchBg: '#ffffff',
    swatchBorder: '#000000',
    swatchAccent: '#000000',
    paperBg: '#ffffff',
    paperText: '#000000',
    paperBorder: '#000000',
    userBubbleBg: '#f5f5f5',
    aiBubbleBg: '#ffffff',
    codeBg: '#f0f0f0',

    // Site UI
    siteBg: '#FFFFFF',
    siteText: '#000000',
    headerBg: 'rgba(255, 255, 255, 0.98)',
    headerBorder: '#000000',
    cardBg: '#FFFFFF',
    cardBorder: '#000000',
    cardText: '#000000',
    mutedText: '#555555',
    accentBtnBg: '#000000',
    accentBtnText: '#FFFFFF',
    userCardBg: '#F8F8F8',
    userCardBorder: '#000000',
    aiCardBg: '#FFFFFF',
    aiCardBorder: '#000000',
    toolbarBg: '#FFFFFF',
    toolbarBorder: '#000000',
    toolbarText: '#000000',
    modalBg: '#FFFFFF',
    modalBorder: '#000000',

    // Typography & Code Tokens
    codeBlockBg: '#F4F4F4',
    codeBlockText: '#000000',
    codeBlockBorder: '#000000',
    inlineCodeBg: '#EAEAEA',
    inlineCodeText: '#000000',
    inlineCodeBorder: '#000000',
    quoteBorder: '#000000',
    quoteText: '#333333',
    linkColor: '#000000',
    tableHeaderBg: '#EAEAEA',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Neon Terminal',
    iconName: 'terminal',
    description: 'Electric cyan and neon magenta terminal hacker vibe',
    swatchBg: '#090a10',
    swatchBorder: '#ff007f',
    swatchAccent: '#00f0ff',
    paperBg: '#090a10',
    paperText: '#00f0ff',
    paperBorder: '#ff007f',
    userBubbleBg: '#121124',
    aiBubbleBg: '#090a10',
    codeBg: '#050508',

    // Site UI
    siteBg: '#090A10',
    siteText: '#00F0FF',
    headerBg: 'rgba(9, 10, 16, 0.95)',
    headerBorder: '#FF007F',
    cardBg: '#121124',
    cardBorder: '#FF007F',
    cardText: '#00F0FF',
    mutedText: '#FF70A6',
    accentBtnBg: '#00F0FF',
    accentBtnText: '#090A10',
    userCardBg: '#1A0B2E',
    userCardBorder: '#FF007F',
    aiCardBg: '#0D1117',
    aiCardBorder: '#00F0FF',
    toolbarBg: 'rgba(18, 17, 36, 0.96)',
    toolbarBorder: '#FF007F',
    toolbarText: '#00F0FF',
    modalBg: '#121124',
    modalBorder: '#FF007F',

    // Typography & Code Tokens
    codeBlockBg: '#05050A',
    codeBlockText: '#00F0FF',
    codeBlockBorder: '#FF007F',
    inlineCodeBg: '#1A0B2E',
    inlineCodeText: '#00F0FF',
    inlineCodeBorder: '#FF007F',
    quoteBorder: '#FF007F',
    quoteText: '#FF70A6',
    linkColor: '#00F0FF',
    tableHeaderBg: '#121124',
  },
};
