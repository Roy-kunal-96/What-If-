import React from 'react';
import {
  LayoutDashboard,
  GitBranch,
  Target,
  PieChart,
  Milestone,
  Lightbulb,
  Settings,
  Plus,
  ShieldAlert,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { FinancialProfile, NavTab } from '../types';
import { Logo } from './Logo';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenWhatIfModal: () => void;
  onOpenSettingsModal: () => void;
  profile: FinancialProfile;
  activeScenarioCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenWhatIfModal,
  onOpenSettingsModal,
  profile,
  activeScenarioCount,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'scenarios' as NavTab, 
      label: 'Scenarios', 
      icon: GitBranch, 
      badge: activeScenarioCount > 0 ? `${activeScenarioCount} active` : undefined 
    },
    { id: 'goals' as NavTab, label: 'Goals', icon: Target },
    { id: 'portfolio' as NavTab, label: 'Portfolio', icon: PieChart },
    { id: 'timeline' as NavTab, label: 'Timeline', icon: Milestone },
    { id: 'insights' as NavTab, label: 'Insights', icon: Lightbulb },
  ];

  const toolsItems = [
    { id: 'reverse' as NavTab, label: 'Reverse What If', icon: Sparkles, badge: 'Target' },
    { id: 'shock' as NavTab, label: 'Life Shock Test', icon: ShieldAlert, badge: 'Stress' },
  ];

  const userName = profile?.name || 'Investor';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md h-screen sticky top-0 px-4 py-5 justify-between select-none transition-colors">
      {/* Brand header */}
      <div className="space-y-4">
        <div className="px-1 py-1">
          <Logo size="md" />
        </div>

        {/* Primary CTA Button: + What if? (Sharp, Compact, Shadowed) */}
        <button
          id="btn-sidebar-what-if"
          onClick={onOpenWhatIfModal}
          className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 hover:shadow-lg hover:shadow-indigo-600/40 border border-indigo-500/40 transition-all duration-150 group cursor-pointer tracking-tight"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-200 group-hover:text-white transition-colors" />
          <span>+ What if?</span>
        </button>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 text-indigo-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4">
            <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
              Exploration Tools
            </p>
            {toolsItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tool-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Footer Profile & Settings */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <button
          id="nav-item-settings"
          onClick={onOpenSettingsModal}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Assumptions & Profile</span>
        </button>

        {/* User Card */}
        <div 
          onClick={onOpenSettingsModal}
          className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-100"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-semibold text-slate-900 truncate">{userName}</p>
            <p className="text-[11px] text-slate-400">Age {profile?.age ?? 32} • Investor</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
