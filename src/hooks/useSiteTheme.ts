import { useState, useEffect, useCallback } from 'react';

export type SiteThemeMode = 'light' | 'dark';

export function useSiteTheme() {
  const [siteTheme, setSiteThemeState] = useState<SiteThemeMode>(() => {
    try {
      const saved = localStorage.getItem('gpt_pdf_site_theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // Fallback
    }
    return 'light'; // Default to light mode
  });

  // Apply to DOM
  useEffect(() => {
    const root = document.documentElement;
    if (siteTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('gpt_pdf_site_theme', siteTheme);
    } catch {
      // Ignore storage errors
    }
  }, [siteTheme]);

  const toggleSiteTheme = useCallback(() => {
    setSiteThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setSiteTheme = useCallback((mode: SiteThemeMode) => {
    setSiteThemeState(mode);
  }, []);

  return {
    siteTheme,
    isDark: siteTheme === 'dark',
    toggleSiteTheme,
    setSiteTheme,
  };
}
