import React from 'react';
import {
  LayoutDashboard,
  GitBranch,
  Target,
  PieChart,
  Plus,
  MoreHorizontal,
} from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenWhatIfModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenWhatIfModal,
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          id="mobile-nav-dashboard"
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-medium cursor-pointer ${
            currentTab === 'dashboard' ? 'text-indigo-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          id="mobile-nav-scenarios"
          onClick={() => onSelectTab('scenarios')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-medium cursor-pointer ${
            currentTab === 'scenarios' ? 'text-indigo-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <GitBranch className="w-5 h-5" />
          <span>Scenarios</span>
        </button>

        {/* Center Floating + What if? button (Sharp, Compact, Shadowed) */}
        <button
          id="mobile-nav-what-if"
          onClick={onOpenWhatIfModal}
          className="flex flex-col items-center justify-center -mt-4 w-10 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-md shadow-indigo-600/40 border border-indigo-500/40 transition-transform cursor-pointer"
          title="What if simulator"
          aria-label="Open What if simulator"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        <button
          id="mobile-nav-goals"
          onClick={() => onSelectTab('goals')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-medium cursor-pointer ${
            currentTab === 'goals' ? 'text-indigo-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <Target className="w-5 h-5" />
          <span>Goals</span>
        </button>

        <button
          id="mobile-nav-portfolio"
          onClick={() => onSelectTab('portfolio')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-medium cursor-pointer ${
            ['portfolio', 'timeline', 'insights', 'reverse', 'shock'].includes(currentTab)
              ? 'text-indigo-600 font-semibold'
              : 'text-slate-500'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span>Portfolio</span>
        </button>
      </div>
    </nav>
  );
};
