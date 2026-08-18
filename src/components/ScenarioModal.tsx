import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Plus,
  Sparkles,
  TrendingUp,
  Home,
  Briefcase,
  Heart,
  Target,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { ScenarioDefinition, ScenarioCategory } from '../types';
import { SCENARIO_CATALOG } from '../engine/scenarios';
import { IconHelper } from './IconHelper';

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: ScenarioDefinition) => void;
  onCreateCustom: () => void;
}

export const ScenarioModal: React.FC<ScenarioModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
  onCreateCustom,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ScenarioCategory | 'all'>('all');

  const categories = [
    { id: 'all', label: 'All Scenarios', icon: Sparkles },
    { id: 'investment', label: '💰 Investment', icon: TrendingUp },
    { id: 'purchase', label: '🏠 Purchases', icon: Home },
    { id: 'career', label: '💼 Career', icon: Briefcase },
    { id: 'life', label: '❤️ Life', icon: Heart },
    { id: 'goal', label: '🎯 Goals', icon: Target },
  ];

  const filteredScenarios = useMemo(() => {
    return SCENARIO_CATALOG.filter((sc) => {
      const matchesCategory = selectedCategory === 'all' || sc.category === selectedCategory;
      const matchesSearch =
        sc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                What do you want to explore?
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Change one thing in your life and see how your financial future changes.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Tabs */}
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search scenarios (e.g. Increase SIP, Buy house, Job loss, Have child)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scenarios Grid */}
        <div className="p-6 overflow-y-auto max-h-[55vh] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Custom Scenario Card */}
          <div
            onClick={onCreateCustom}
            className="p-4 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/80 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-sm shadow-indigo-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                ✨ Create Custom Scenario
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Model unique cash flows, side business revenue, or personal life goals.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600">
              <span>Start builder</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Scenario Catalog Items */}
          {filteredScenarios.map((sc) => (
            <div
              key={sc.id}
              onClick={() => onSelectScenario(sc)}
              className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <IconHelper name={sc.iconName} className="w-5 h-5" />
                  </div>
                  {sc.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                      {sc.badge}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {sc.title}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  {sc.subtitle}
                </p>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {sc.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-indigo-600">
                <span>Simulate scenario</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Select any scenario to customize parameters with real-time feedback.</span>
          </div>
          <span className="font-medium text-slate-400">
            {filteredScenarios.length} scenarios available
          </span>
        </div>
      </div>
    </div>
  );
};
