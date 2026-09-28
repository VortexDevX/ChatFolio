import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { ThemeId } from '@/types/chat';
import { THEMES } from '@/tokens/theme';

interface ScrollToTopProps {
  theme?: ThemeId;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({ theme = 'editorial' }) => {
  const [visible, setVisible] = useState(false);
  const t = THEMES[theme] || THEMES.editorial;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      title="Scroll to Top"
      aria-label="Scroll to top of conversation"
      className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105 cursor-pointer backdrop-blur-sm border"
      style={{
        backgroundColor: t.cardBg,
        borderColor: t.cardBorder,
        color: t.cardText,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
      }}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};

