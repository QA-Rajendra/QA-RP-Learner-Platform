'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export const THEMES = [
  {
    id: 'electric-dark',
    name: 'Electric Dark',
    fullTitle: 'Premium Dark + Electric Blue',
    tagline: 'Technical, high-end SaaS aesthetic',
    bestFor: 'SaaS, QA/testing platforms, admin dashboards, developer tools',
    icon: '⚡',
    category: 'Curated Pro',
    isDark: true,
    colors: {
      bgMain: '#0B1020',
      bgCard: '#151C2F',
      primary: '#3B82F6',
      secondary: '#60A5FA',
      textMain: '#F8FAFC',
      textMuted: '#94A3B8',
      success: '#22C55E',
      error: '#EF4444',
      border: '#1E293B',
    },
  },
  {
    id: 'clean-light',
    name: 'Clean White',
    fullTitle: 'Clean White + Indigo/Purple',
    tagline: 'Trustworthy, modern, clean readability',
    bestFor: 'Portfolios, business websites, content platforms, professional applications',
    icon: '✨',
    category: 'Curated Pro',
    isDark: false,
    colors: {
      bgMain: '#FFFFFF',
      bgCard: '#F8FAFC',
      primary: '#4F46E5',
      secondary: '#7C3AED',
      textMain: '#111827',
      textMuted: '#6B7280',
      border: '#E5E7EB',
      success: '#16A34A',
      error: '#DC2626',
    },
  },
  {
    id: 'winter-teal',
    name: 'Winter Teal',
    fullTitle: 'Winter Teal Ice (Color Hunt)',
    tagline: 'Cold winter teal, ice mint & crisp arctic clarity',
    bestFor: 'Daytime learning, refreshing contrast, cold teal palette lovers',
    icon: '❄️',
    category: 'Color Hunt',
    isDark: false,
    colors: {
      bgMain: '#E3FDFD',
      bgCard: '#FFFFFF',
      primary: '#0F766E',
      secondary: '#71C9CE',
      textMain: '#0B2527',
      textMuted: '#2E5A5E',
      border: '#A6E3E9',
      success: '#0D9488',
      error: '#E11D48',
    },
  },
  {
    id: 'midnight-cyber',
    name: 'Midnight Cyber',
    fullTitle: 'Midnight Cyber Deep Neon',
    tagline: 'Deep space cyan neon with dark cyber matrix',
    bestFor: 'Dark mode lovers, terminal wizards, night hacking',
    icon: '🌙',
    category: 'Curated Dark',
    isDark: true,
    colors: {
      bgMain: '#050811',
      bgCard: '#0B1120',
      primary: '#06B6D4',
      secondary: '#3B82F6',
      textMain: '#F1F5F9',
      textMuted: '#64748B',
      border: '#16223D',
      success: '#10B981',
      error: '#F43F5E',
    },
  },
];

const ThemeContext = createContext({
  theme: 'electric-dark',
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: true,
  currentTheme: THEMES[0],
  themes: THEMES,
  mounted: false,
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('qarp_theme');
        const valid = THEMES.some((t) => t.id === saved);
        if (saved && valid) return saved;
      } catch {
        // ignore
      }
    }
    return 'electric-dark';
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      document.documentElement.setAttribute('data-theme', theme);
    }, 0);
    return () => clearTimeout(timer);
  }, [theme]);

  const setTheme = (newTheme) => {
    const valid = THEMES.some((t) => t.id === newTheme);
    if (!valid) return;
    setThemeState(newTheme);
    try {
      localStorage.setItem('qarp_theme', newTheme);
    } catch {
      // ignore
    }
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleTheme = () => {
    const currentIndex = THEMES.findIndex((t) => t.id === theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex].id);
  };

  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[0];
  const isDark = currentTheme.isDark;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark,
        currentTheme,
        themes: THEMES,
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
