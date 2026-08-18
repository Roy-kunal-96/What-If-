import React, { useState } from 'react';
import {
  GitBranch,
  Layers,
  GitCompare,
  History,
  Plus,
  ArrowRight,
  Trash2,
  Sparkles,
  Search,
  CheckCircle2,
} from 'lucide-react';
import {
  ScenarioDefinition,
  SavedScenario,
  FinancialProfile,
  FinancialAssumptions,
  ScenarioCategory,
} from '../types';
import { SCENARIO_CATALOG } from '../engine/scenarios';
import { ScenarioStackingView } from './ScenarioStackingView';
import { ScenarioCompareView } from './ScenarioCompareView';
import { IconHelper } from './IconHelper';
import { formatINR } from '../utils/formatters';

interface ScenariosViewProps {
  profile: FinancialProfile;
  assumptions: FinancialAssumptions;
  stackedScenarios: ScenarioDefinition[];
  savedScenarios: SavedScenario[];
  onSelectScenario: (scenario: ScenarioDefinition) => void;
  onUpdateStack: (scenarios: ScenarioDefinition[]) => void;
  onDeleteSavedScenario: (id: string) => void;
  onOpenWhatIfModal: () => void;
  onCreateCustom: () => void;
}

export const ScenariosView: React.FC<ScenariosViewProps> = ({
  profile,
  assumptions,
  stackedScenarios,
  savedScenarios,
  onSelectScenario,
  onUpdateStack,
  onDeleteSavedScenario,
  onOpenWhatIfModal,
  onCreateCustom,
}) => {
  const [subTab, setSubTab] = useState<'library' | 'stacking' | 'compare' | 'history'>('library');
  const [categoryFilter, setCategoryFilter] = useState<ScenarioCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCatalog = SCENARIO_CATALOG.filter((sc) => {
    const matchesCat = categoryFilter === 'all' || sc.category === categoryFilter;
    const matchesSearch =
      sc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Sub navigation bar */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setSubTab('library')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              subTab === 'library'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Scenario Library</span>
          </button>

          <button
            onClick={() => setSubTab('stacking')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              subTab === 'stacking'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Scenario Stacking ({stackedScenarios.length})</span>
          </button>

          <button
            onClick={() => setSubTab('compare')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              subTab === 'compare'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare Futures</span>
          </button>

          <button
            onClick={() => setSubTab('history')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              subTab === 'history'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Saved History ({savedScenarios.length})</span>
          </button>
        </div>

        <button
          onClick={onOpenWhatIfModal}
          className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 hover:shadow-lg hover:shadow-indigo-600/40 border border-indigo-500/30 transition-all duration-150 cursor-pointer tracking-tight"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>+ What if?</span>
        </button>
      </div>

      {/* View router based on subTab */}
      {subTab === 'stacking' && (
        <ScenarioStackingView
          profile={profile}
          assumptions={assumptions}
          stackedScenarios={stackedScenarios}
          onUpdateStack={onUpdateStack}
          onOpenWhatIfModal={onOpenWhatIfModal}
        />
      )}

      {subTab === 'compare' && (
        <ScenarioCompareView
          profile={profile}
          assumptions={assumptions}
          onOpenWhatIfModal={onOpenWhatIfModal}
        />
      )}

      {subTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Saved Simulation History</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and revisit previously simulated life scenarios.
            </p>
          </div>

          {savedScenarios.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
              <History className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No saved scenarios yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                When you run a What If simulation, click "Save Scenario" to keep it in your history for quick comparisons.
              </p>
              <button
                onClick={onOpenWhatIfModal}
                className="mt-2 py-2 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-indigo-600 transition-colors cursor-pointer"
              >
                + Run your first What If
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedScenarios.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Saved on {item.createdAt}</span>
                      <button
                        onClick={() => onDeleteSavedScenario(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mt-1">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Projected Impact @ 50:</span>
                      <span className={`font-bold ${item.impactWealth50Delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatINR(item.impactWealth50Delta, { showSign: true })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const def = SCENARIO_CATALOG.find((s) => s.id === item.definitionId);
                      if (def) {
                        onSelectScenario({ ...def, parameters: { ...item.parameters } });
                      }
                    }}
                    className="w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Re-run Simulation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {subTab === 'library' && (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search scenarios by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {(['all', 'investment', 'purchase', 'career', 'life', 'goal'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap capitalize transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Custom card */}
            <div
              onClick={onCreateCustom}
              className="p-5 rounded-3xl border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/70 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600">
                  ✨ Custom Scenario Builder
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Design bespoke financial cash flows, career sabbaticals, or unique milestone investments.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-600">
                <span>Start builder</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Catalog Items */}
            {filteredCatalog.map((sc) => (
              <div
                key={sc.id}
                onClick={() => onSelectScenario(sc)}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <IconHelper name={sc.iconName} className="w-5 h-5" />
                    </div>
                    {sc.badge && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                        {sc.badge}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {sc.title}
                  </h4>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">{sc.subtitle}</p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {sc.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-indigo-600">
                  <span>Simulate scenario</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
