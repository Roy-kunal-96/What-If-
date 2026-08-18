import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Sliders,
  X,
} from 'lucide-react';
import {
  ScenarioDefinition,
  FinancialProfile,
  FinancialAssumptions,
} from '../types';
import { runSimulation, compareScenarios } from '../engine/projection';
import { SCENARIO_CATALOG } from '../engine/scenarios';
import { formatINR, formatCompactINR } from '../utils/formatters';
import { IconHelper } from './IconHelper';
import { ProjectionChart } from './ProjectionChart';

interface ScenarioStackingViewProps {
  profile: FinancialProfile;
  assumptions: FinancialAssumptions;
  stackedScenarios: ScenarioDefinition[];
  onUpdateStack: (scenarios: ScenarioDefinition[]) => void;
  onOpenWhatIfModal: () => void;
}

export const ScenarioStackingView: React.FC<ScenarioStackingViewProps> = ({
  profile,
  assumptions,
  stackedScenarios,
  onUpdateStack,
  onOpenWhatIfModal,
}) => {
  // Baseline simulation
  const baseline = useMemo(() => {
    return runSimulation(profile, assumptions, []);
  }, [profile, assumptions]);

  // Combined stack simulation
  const combinedResult = useMemo(() => {
    return runSimulation(profile, assumptions, stackedScenarios);
  }, [profile, assumptions, stackedScenarios]);

  const comparison = useMemo(() => {
    return compareScenarios(baseline, combinedResult);
  }, [baseline, combinedResult]);

  const handleRemoveScenario = (id: string) => {
    onUpdateStack(stackedScenarios.filter((s) => s.id !== id));
  };

  const handleAddPreset = (scenarioId: string) => {
    const sc = SCENARIO_CATALOG.find((s) => s.id === scenarioId);
    if (sc && !stackedScenarios.some((s) => s.id === sc.id)) {
      onUpdateStack([...stackedScenarios, sc]);
    }
  };

  const wealth50Diff = combinedResult.wealthAt50 - baseline.wealthAt50;
  const fiAgeDiff = combinedResult.fiAge - baseline.fiAge;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Multi-Scenario Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Scenario Stacking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Real life happens in combinations. Combine buying a house, welcoming a child, and increasing your SIP to see the combined future trajectory.
          </p>
        </div>

        <button
          onClick={onOpenWhatIfModal}
          className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm shadow-indigo-200 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Scenario to Stack</span>
        </button>
      </div>

      {/* Active Stack Chips & Quick Add Presets */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Active Stack ({stackedScenarios.length} Scenarios)</span>
          </h3>

          {stackedScenarios.length > 0 && (
            <button
              onClick={() => onUpdateStack([])}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {stackedScenarios.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <p className="text-sm font-semibold text-slate-700">No scenarios stacked yet</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Select presets below or click "+ Add Scenario to Stack" to test combining multiple life decisions.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={() => handleAddPreset('sc-buy-house-80l')}
                className="text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 font-medium text-slate-700 cursor-pointer"
              >
                + Buy ₹80L House
              </button>
              <button
                onClick={() => handleAddPreset('sc-have-child')}
                className="text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 font-medium text-slate-700 cursor-pointer"
              >
                + Have a Child
              </button>
              <button
                onClick={() => handleAddPreset('sc-inc-sip-10k')}
                className="text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 font-medium text-slate-700 cursor-pointer"
              >
                + Increase SIP by ₹20K
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stackedScenarios.map((sc) => (
              <div
                key={sc.id}
                className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <IconHelper name={sc.iconName} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{sc.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{sc.subtitle}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveScenario(sc.id)}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Combined Results Banner */}
      {stackedScenarios.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-1">
            <p className="text-xs text-slate-400 font-medium">Combined Net Worth @ 50</p>
            <div className="flex items-baseline gap-2">
              <span className="text-slate-400 line-through text-sm">
                {formatINR(baseline.wealthAt50)}
              </span>
              <span className="text-xl font-black text-slate-900">
                {formatINR(combinedResult.wealthAt50)}
              </span>
            </div>
            <p className={`text-xs font-bold ${wealth50Diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatINR(wealth50Diff, { showSign: true })} Net Delta
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-1">
            <p className="text-xs text-slate-400 font-medium">Combined FI Age</p>
            <div className="flex items-baseline gap-2">
              <span className="text-slate-400 line-through text-sm">
                Age {baseline.fiAge}
              </span>
              <span className="text-xl font-black text-slate-900">
                Age {combinedResult.fiAge}
              </span>
            </div>
            <p className={`text-xs font-bold ${fiAgeDiff <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {fiAgeDiff === 0 ? 'No change' : fiAgeDiff < 0 ? `${Math.abs(fiAgeDiff)} yrs earlier` : `+${fiAgeDiff} yrs delay`}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-1">
            <p className="text-xs text-slate-400 font-medium">Retirement Corpus (@ {profile.targetRetirementAge})</p>
            <p className="text-xl font-black text-slate-900">
              {formatINR(combinedResult.wealthAtRetirement)}
            </p>
            <p className="text-xs text-slate-500">
              Target: {formatINR(profile.targetRetirementCorpus)}
            </p>
          </div>
        </div>
      )}

      {/* Projection Chart */}
      <ProjectionChart
        baseline={baseline}
        scenarioResult={combinedResult}
        activeScenarios={stackedScenarios}
        profile={profile}
        height={340}
      />
    </div>
  );
};
