import React, { useState, useMemo } from 'react';
import {
  GitCompare,
  Plus,
  Trash2,
  CheckCircle2,
  TrendingUp,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  ScenarioDefinition,
  FinancialProfile,
  FinancialAssumptions,
} from '../types';
import { runSimulation } from '../engine/projection';
import { SCENARIO_CATALOG } from '../engine/scenarios';
import { formatINR } from '../utils/formatters';
import { IconHelper } from './IconHelper';

interface ScenarioCompareViewProps {
  profile: FinancialProfile;
  assumptions: FinancialAssumptions;
  onOpenWhatIfModal: () => void;
}

export const ScenarioCompareView: React.FC<ScenarioCompareViewProps> = ({
  profile,
  assumptions,
  onOpenWhatIfModal,
}) => {
  // Select up to 3 scenarios from catalog to compare
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'sc-inc-sip-10k',
    'sc-buy-house-80l',
    'sc-salary-increase-20',
  ]);

  const baseline = useMemo(() => {
    return runSimulation(profile, assumptions, []);
  }, [profile, assumptions]);

  const comparedScenarios = useMemo(() => {
    return selectedIds
      .map((id) => SCENARIO_CATALOG.find((s) => s.id === id))
      .filter((s): s is ScenarioDefinition => !!s)
      .map((s) => ({
        def: s,
        result: runSimulation(profile, assumptions, [s]),
      }));
  }, [selectedIds, profile, assumptions]);

  const toggleScenario = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Side-by-Side Matrix
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Compare Futures
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Select up to 3 distinct life decisions and compare their compound wealth trajectories and financial independence milestones.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span>{selectedIds.length} / 3 Scenarios selected</span>
        </div>
      </div>

      {/* Scenario Selector Chips */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
          Pick Scenarios to Compare
        </h3>
        <div className="flex flex-wrap gap-2">
          {SCENARIO_CATALOG.slice(0, 8).map((sc) => {
            const isSelected = selectedIds.includes(sc.id);
            return (
              <button
                key={sc.id}
                onClick={() => toggleScenario(sc.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                }`}
              >
                <IconHelper name={sc.iconName} className="w-3.5 h-3.5" />
                <span>{sc.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side by Side Comparison Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm overflow-x-auto">
        <table className="w-full text-xs sm:text-sm text-left">
          <thead>
            <tr className="border-b border-slate-200 pb-3">
              <th className="py-3 font-semibold text-slate-400 w-1/4">Key Milestone</th>
              <th className="py-3 font-bold text-slate-900 w-1/4">
                <div className="p-2 rounded-xl bg-slate-100/80 border border-slate-200/60">
                  <p className="text-slate-500 font-medium text-xs">Baseline</p>
                  <p className="text-sm font-bold text-slate-900">Current Plan</p>
                </div>
              </th>
              {comparedScenarios.map(({ def, result }) => (
                <th key={def.id} className="py-3 font-bold text-indigo-950 w-1/4">
                  <div className="p-2 rounded-xl bg-indigo-50/70 border border-indigo-200/60">
                    <p className="text-indigo-600 font-medium text-xs truncate">{def.category}</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{def.title}</p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-4 font-semibold text-slate-900">Wealth @ Age 40</td>
              <td className="py-4 font-bold text-slate-700">{formatINR(baseline.wealthAt40)}</td>
              {comparedScenarios.map(({ def, result }) => (
                <td key={def.id} className="py-4 font-bold text-indigo-600">
                  {formatINR(result.wealthAt40)}
                  <span className={`block text-xs font-normal ${result.wealthAt40 >= baseline.wealthAt40 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatINR(result.wealthAt40 - baseline.wealthAt40, { showSign: true })}
                  </span>
                </td>
              ))}
            </tr>

            <tr>
              <td className="py-4 font-semibold text-slate-900">Wealth @ Age 50</td>
              <td className="py-4 font-bold text-slate-700">{formatINR(baseline.wealthAt50)}</td>
              {comparedScenarios.map(({ def, result }) => (
                <td key={def.id} className="py-4 font-bold text-indigo-600">
                  {formatINR(result.wealthAt50)}
                  <span className={`block text-xs font-normal ${result.wealthAt50 >= baseline.wealthAt50 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatINR(result.wealthAt50 - baseline.wealthAt50, { showSign: true })}
                  </span>
                </td>
              ))}
            </tr>

            <tr>
              <td className="py-4 font-semibold text-slate-900">Financial Independence (FI)</td>
              <td className="py-4 font-bold text-slate-700">Age {baseline.fiAge}</td>
              {comparedScenarios.map(({ def, result }) => (
                <td key={def.id} className="py-4 font-bold text-indigo-600">
                  Age {result.fiAge}
                  <span className={`block text-xs font-normal ${result.fiAge <= baseline.fiAge ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {result.fiAge === baseline.fiAge ? 'Same age' : result.fiAge < baseline.fiAge ? `${baseline.fiAge - result.fiAge} yrs earlier` : `+${result.fiAge - baseline.fiAge} yrs delay`}
                  </span>
                </td>
              ))}
            </tr>

            <tr>
              <td className="py-4 font-semibold text-slate-900">Retirement Corpus (@ {profile.targetRetirementAge})</td>
              <td className="py-4 font-bold text-slate-700">{formatINR(baseline.wealthAtRetirement)}</td>
              {comparedScenarios.map(({ def, result }) => (
                <td key={def.id} className="py-4 font-bold text-indigo-600">
                  {formatINR(result.wealthAtRetirement)}
                  <span className={`block text-xs font-normal ${result.wealthAtRetirement >= baseline.wealthAtRetirement ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatINR(result.wealthAtRetirement - baseline.wealthAtRetirement, { showSign: true })}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
