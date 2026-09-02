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
    id: 'midnight-cyber',
    name: 'Midnight Cyber',
    fullTitle: 'Midnight Cyber Deep Neon',
    tagline: 'Deep space cyan neon with dark cyber matrix',
    bestFor: 'Dark mode lovers, terminal wizards, night hacking',
    icon: '🌙',
    category: 'Animated',
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
  {
    id: 'daylight-neo',
    name: 'Daylight Neo',
    fullTitle: 'Daylight Neo Amber Clean',
    tagline: 'High contrast vibrant warm daylight palette',
    bestFor: 'Daytime reading, documentation, clean clarity',
    icon: '🌞',
    category: 'Animated',
    isDark: false,
    colors: {
      bgMain: '#F4F5F8',
      bgCard: '#FFFFFF',
      primary: '#F59E0B',
      secondary: '#EA580C',
      textMain: '#18181B',
      textMuted: '#71717A',
      border: '#E4E4E7',
      success: '#10B981',
      error: '#EF4444',
    },
  },
  {
    id: 'cyberpunk-2077',
    name: 'Cyberpunk 2077',
    fullTitle: 'Cyberpunk 2077 Neon High-Voltage',
    tagline: 'High-voltage electric yellow, hot pink & neon cyan',
    bestFor: 'Futuristic dashboards, extreme visual impact',
    icon: '⚡',
    category: 'Animated',
    isDark: true,
    colors: {
      bgMain: '#0A0A10',
      bgCard: '#131320',
      primary: '#FEE715',
      secondary: '#FF0055',
      textMain: '#FFFDF0',
      textMuted: '#9E9EAA',
      border: '#2E2A45',
      success: '#00FF9F',
      error: '#FF0055',
    },
  },
  {
    id: 'synthwave-80s',
    name: 'Synthwave 80s',
    fullTitle: 'Synthwave 80s Retro Neon',
    tagline: 'Retro-future magenta, neon purple & arcade glow',
    bestFor: 'Creative developers, retro aesthetics, vibrant vibes',
    icon: '👾',
    category: 'Animated',
    isDark: true,
    colors: {
      bgMain: '#12072B',
      bgCard: '#1D0F3F',
      primary: '#FF2A85',
      secondary: '#9D4EDD',
      textMain: '#FCE7F3',
      textMuted: '#A78BFA',
      border: '#3B1C78',
      success: '#06D6A0',
      error: '#EF476F',
    },
  },
  {
    id: 'cosmic-aurora',
    name: 'Cosmic Aurora',
    fullTitle: 'Cosmic Aurora Deep Nebula',
    tagline: 'Deep space purple, cyan nebula & aurora borealis flow',
    bestFor: 'Immersive learning, elegant deep dark aesthetic',
    icon: '🌌',
    category: 'Animated',
    isDark: true,
    colors: {
      bgMain: '#060B1E',
      bgCard: '#0E1738',
      primary: '#8B5CF6',
      secondary: '#06B6D4',
      textMain: '#EDE9FE',
      textMuted: '#94A3B8',
      border: '#1F2E63',
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
  const [theme, setThemeState] = useState('electric-dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('qarp_theme');
      const valid = THEMES.some((t) => t.id === saved);
      if (saved && valid) {
        setThemeState(saved);
        document.documentElement.setAttribute('data-theme', saved);
      } else {
        document.documentElement.setAttribute('data-theme', 'electric-dark');
      }
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'electric-dark');
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme) => {
    const valid = THEMES.some((t) => t.id === newTheme);
    if (!valid) return;
    setThemeState(newTheme);
    try {
      localStorage.setItem('qarp_theme', newTheme);
    } catch (e) {}
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
