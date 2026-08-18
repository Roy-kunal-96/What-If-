import { ThemeConfig, ThemeId } from '../types';

export const THEMES: Record<ThemeId, ThemeConfig> = {
  indigo: {
    id: 'indigo',
    name: 'Modern Indigo',
    label: 'Indigo',
    description: 'Crisp slate neutral with electric indigo highlights',
    primaryHex: '#4f46e5',
    secondaryHex: '#6366f1',
    accentHex: '#818cf8',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200/60',
    bgClass: 'bg-slate-50 text-slate-900',
    cardClass: 'bg-white border-slate-200/80',
    textClass: 'text-slate-900',
    primaryBtnClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    isDark: false,
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Wealth',
    label: 'Emerald',
    description: 'Prosperity forest green with clean mint accents',
    primaryHex: '#059669',
    secondaryHex: '#10b981',
    accentHex: '#34d399',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200/60',
    bgClass: 'bg-emerald-50/20 text-slate-900',
    cardClass: 'bg-white border-emerald-100',
    textClass: 'text-slate-900',
    primaryBtnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    isDark: false,
  },
  violet: {
    id: 'violet',
    name: 'Royal Amethyst',
    label: 'Violet',
    description: 'Deep royal purple and amethyst accents',
    primaryHex: '#7c3aed',
    secondaryHex: '#8b5cf6',
    accentHex: '#a78bfa',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200/60',
    bgClass: 'bg-purple-50/20 text-slate-900',
    cardClass: 'bg-white border-purple-100',
    textClass: 'text-slate-900',
    primaryBtnClass: 'bg-purple-600 hover:bg-purple-700 text-white',
    isDark: false,
  },
  amber: {
    id: 'amber',
    name: 'Warm Amber & Gold',
    label: 'Amber',
    description: 'Warm copper and golden solar highlights',
    primaryHex: '#d97706',
    secondaryHex: '#f59e0b',
    accentHex: '#fbbf24',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200/60',
    bgClass: 'bg-amber-50/20 text-slate-900',
    cardClass: 'bg-white border-amber-100',
    textClass: 'text-slate-900',
    primaryBtnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    isDark: false,
  },
  cyan: {
    id: 'cyan',
    name: 'Nordic Oceanic',
    label: 'Ocean',
    description: 'Crisp Arctic cyan and oceanic teal hues',
    primaryHex: '#0284c7',
    secondaryHex: '#06b6d4',
    accentHex: '#38bdf8',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    badgeBorder: 'border-sky-200/60',
    bgClass: 'bg-sky-50/20 text-slate-900',
    cardClass: 'bg-white border-sky-100',
    textClass: 'text-slate-900',
    primaryBtnClass: 'bg-sky-600 hover:bg-sky-700 text-white',
    isDark: false,
  },
  rose: {
    id: 'rose',
    name: 'Rose Gold & Ruby',
    label: 'Rose',
    description: 'Modern luxury rose gold and crimson styling',
    primaryHex: '#e11d48',
    secondaryHex: '#f43f5e',
    accentHex: '#fb7185',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200/60',
    bgClass: 'bg-rose-50/20 text-slate-900',
    cardClass: 'bg-white border-rose-100',
    textClass: 'text-slate-900',
    primaryBtnClass: 'bg-rose-600 hover:bg-rose-700 text-white',
    isDark: false,
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Obsidian',
    label: 'Midnight',
    description: 'Deep obsidian dark canvas with high contrast glowing accents',
    primaryHex: '#6366f1',
    secondaryHex: '#818cf8',
    accentHex: '#a5b4fc',
    badgeBg: 'bg-slate-800',
    badgeText: 'text-indigo-300',
    badgeBorder: 'border-slate-700',
    bgClass: 'bg-slate-950 text-slate-100 dark',
    cardClass: 'bg-slate-900 border-slate-800 text-slate-100',
    textClass: 'text-slate-100',
    primaryBtnClass: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    isDark: true,
  },
};

export const THEME_LIST: ThemeConfig[] = Object.values(THEMES);

export const applyThemeToDocument = (themeId: ThemeId) => {
  const config = THEMES[themeId] || THEMES.indigo;
  const root = document.documentElement;

  // Set CSS variables for dynamic accents
  root.style.setProperty('--color-primary', config.primaryHex);
  root.style.setProperty('--color-secondary', config.secondaryHex);
  root.style.setProperty('--color-accent', config.accentHex);
  
  // Set theme data-attribute
  root.setAttribute('data-theme', themeId);
  
  if (config.isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  try {
    localStorage.setItem('whatif_selected_theme', themeId);
  } catch (e) {
    // Ignore storage restrictions
  }
};
