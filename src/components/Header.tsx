import React from 'react';
import { Plus, SlidersHorizontal, Sparkles, RefreshCw, GitBranch } from 'lucide-react';
import { FinancialProfile, NavTab, ThemeId } from '../types';
import { ThemeSelector } from './ThemeSelector';
import { Logo } from './Logo';

interface HeaderProps {
  profile: FinancialProfile;
  currentTab?: NavTab;
  activeScenarioCount?: number;
  currentTheme?: ThemeId;
  onSelectTheme?: (theme: ThemeId) => void;
  onOpenWhatIfModal: () => void;
  onOpenSettingsModal: () => void;
  onResetAllScenarios?: () => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  currentTab,
  activeScenarioCount = 0,
  currentTheme = 'indigo',
  onSelectTheme,
  onOpenWhatIfModal,
  onOpenSettingsModal,
  onResetAllScenarios,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = profile?.name || 'Investor';

  return (
    <header className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3.5 lg:px-8 py-2.5 sm:py-3 sticky top-0 z-30 flex items-center justify-between gap-3 transition-colors">
      {/* Left: Mobile Logo & Greeting */}
      <div className="flex items-center gap-3 min-w-0">
        <Logo size="sm" showText={false} className="lg:hidden shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Simulator
            </span>
            {activeScenarioCount > 0 && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 flex items-center gap-1">
                <GitBranch className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                {activeScenarioCount} stacked
              </span>
            )}
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate mt-0.5">
            {getGreeting()}, {displayName}
          </h2>
        </div>
      </div>

      {/* Right: Theme Selector & Action buttons */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Visual Theme Selector right at the top */}
        {onSelectTheme && (
          <ThemeSelector 
            currentTheme={currentTheme} 
            onSelectTheme={onSelectTheme} 
          />
        )}

        {activeScenarioCount > 0 && onResetAllScenarios && (
          <button
            id="btn-reset-scenarios"
            onClick={onResetAllScenarios}
            title="Reset active scenarios to baseline plan"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}

        <button
          id="btn-header-assumptions"
          onClick={onOpenSettingsModal}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="hidden sm:inline">Assumptions</span>
        </button>

        {/* Primary CTA (Sharp, Compact, Shadowed) */}
        <button
          id="btn-header-what-if"
          onClick={onOpenWhatIfModal}
          className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 hover:shadow-lg hover:shadow-indigo-600/40 border border-indigo-500/30 transition-all duration-150 cursor-pointer tracking-tight"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>+ What if?</span>
        </button>
      </div>
    </header>
  );
};
