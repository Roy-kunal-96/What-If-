import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Moon, Sun, Sparkles } from 'lucide-react';
import { ThemeId } from '../types';
import { THEMES, THEME_LIST } from '../utils/theme';

interface ThemeSelectorProps {
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeConfig = THEMES[currentTheme] || THEMES.indigo;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Theme Trigger Button */}
      <button
        id="btn-theme-switcher"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white/90 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all duration-150 shadow-xs cursor-pointer group"
        title="Change application color theme"
        aria-label="Change color theme"
      >
        <span 
          className="w-3.5 h-3.5 rounded-full shadow-xs flex items-center justify-center shrink-0 ring-2 ring-white dark:ring-slate-800"
          style={{ backgroundColor: activeConfig.primaryHex }}
        />
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
          <Palette className="w-3.5 h-3.5 text-slate-400 dark:text-slate-300 group-hover:text-slate-600 transition-colors" />
          <span className="hidden md:inline font-semibold">{activeConfig.label}</span>
          <span className="text-[10px] text-slate-400 font-normal hidden lg:inline">Theme</span>
        </div>
      </button>

      {/* Theme Dropdown Panel */}
      {isOpen && (
        <div 
          id="theme-dropdown-panel"
          className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/60 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md"
        >
          <div className="px-2.5 py-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Select Visual Theme
            </span>
            <span className="text-[10px] text-slate-400 font-medium">7 themes</span>
          </div>

          <div className="space-y-1 max-h-80 overflow-y-auto pr-0.5">
            {THEME_LIST.map((theme) => {
              const isSelected = theme.id === currentTheme;
              return (
                <button
                  key={theme.id}
                  id={`theme-option-${theme.id}`}
                  onClick={() => {
                    onSelectTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-300 dark:ring-slate-700'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Dual-color dot preview */}
                    <div className="relative w-6 h-6 rounded-full shrink-0 flex items-center justify-center overflow-hidden shadow-xs border border-slate-200 dark:border-slate-700">
                      <div 
                        className="absolute inset-0 w-1/2" 
                        style={{ backgroundColor: theme.primaryHex }} 
                      />
                      <div 
                        className="absolute inset-0 left-1/2 w-1/2" 
                        style={{ backgroundColor: theme.secondaryHex }} 
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {theme.name}
                        </span>
                        {theme.isDark ? (
                          <Moon className="w-3 h-3 text-indigo-400 shrink-0" />
                        ) : (
                          <Sun className="w-3 h-3 text-amber-500/70 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                        {theme.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: theme.primaryHex }}
                    >
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 px-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Instant live preview</span>
            <span>Saved locally</span>
          </div>
        </div>
      )}
    </div>
  );
};
