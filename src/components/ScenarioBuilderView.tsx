import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Layers,
  Save,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Info,
  Sliders,
  GitBranch,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  ScenarioDefinition,
  FinancialProfile,
  FinancialAssumptions,
  SavedScenario,
} from '../types';
import { runSimulation, compareScenarios } from '../engine/projection';
import { formatINR, formatCompactINR, formatAgeDelta } from '../utils/formatters';
import { IconHelper } from './IconHelper';
import { ProjectionChart } from './ProjectionChart';

interface ScenarioBuilderViewProps {
  scenarioDef?: ScenarioDefinition;
  scenario?: ScenarioDefinition;
  profile: FinancialProfile;
  assumptions: FinancialAssumptions;
  primaryHex?: string;
  onBack: () => void;
  onSaveScenario?: (saved: SavedScenario) => void;
  onSaveToHistory?: (scenario: ScenarioDefinition, wealthDelta: number, fiDelta: number) => void;
  onAddToStack?: (scenario: ScenarioDefinition) => void;
  onApplyToStack?: (scenario: ScenarioDefinition) => void;
  onCompare?: (scenario: ScenarioDefinition) => void;
}

export const ScenarioBuilderView: React.FC<ScenarioBuilderViewProps> = ({
  scenarioDef: propScenarioDef,
  scenario: propScenario,
  profile,
  assumptions,
  primaryHex = '#4f46e5',
  onBack,
  onSaveScenario,
  onSaveToHistory,
  onAddToStack,
  onApplyToStack,
  onCompare,
}) => {
  const scenarioDef = (propScenarioDef || propScenario)!;
  // Local state for editable scenario parameters
  const [params, setParams] = useState<Record<string, number>>({ ...(scenarioDef?.parameters || {}) });
  const [isSaved, setIsSaved] = useState(false);

  // Active definition with current parameters
  const activeScenarioDef: ScenarioDefinition = useMemo(() => {
    return {
      ...scenarioDef,
      parameters: { ...params },
    };
  }, [scenarioDef, params]);

  // Run live baseline & scenario projections
  const baselineResult = useMemo(() => {
    return runSimulation(profile, assumptions, []);
  }, [profile, assumptions]);

  const scenarioResult = useMemo(() => {
    return runSimulation(profile, assumptions, [activeScenarioDef]);
  }, [profile, assumptions, activeScenarioDef]);

  const comparison = useMemo(() => {
    return compareScenarios(baselineResult, scenarioResult, activeScenarioDef);
  }, [baselineResult, scenarioResult, activeScenarioDef]);

  const handleParamChange = (key: string, value: number) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsSaved(false);
  };

  const handleSave = () => {
    const saved: SavedScenario = {
      id: `saved-${Date.now()}`,
      definitionId: scenarioDef.id,
      type: scenarioDef.type,
      category: scenarioDef.category,
      name: scenarioDef.title,
      description: `${scenarioDef.subtitle}`,
      iconName: scenarioDef.iconName,
      parameters: { ...params },
      createdAt: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      impactWealth50Delta: comparison.deltas.wealthAt50Delta,
      impactFiAgeDelta: comparison.deltas.fiAgeDelta,
    };
    if (onSaveScenario) {
      onSaveScenario(saved);
    } else if (onSaveToHistory) {
      onSaveToHistory(activeScenarioDef, comparison.deltas.wealthAt50Delta, comparison.deltas.fiAgeDelta);
    }
    setIsSaved(true);
  };

  const handleAdd = () => {
    if (onAddToStack) {
      onAddToStack(activeScenarioDef);
    } else if (onApplyToStack) {
      onApplyToStack(activeScenarioDef);
    }
  };

  const wealth50Diff = comparison.deltas.wealthAt50Delta;
  const fiAgeDiff = comparison.deltas.fiAgeDelta;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header Nav */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer border border-indigo-200/60"
          >
            <Layers className="w-4 h-4" />
            <span>Add to Active Stack</span>
          </button>

          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 hover:bg-indigo-600 text-white'
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved to Library</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Scenario</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scenario Title Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <IconHelper name={scenarioDef.iconName} className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                {scenarioDef.category}
              </span>
              {scenarioDef.badge && (
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  {scenarioDef.badge}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {scenarioDef.title}
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              {scenarioDef.description}
            </p>
          </div>
        </div>

        {/* Live Delta Pill */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-right min-w-[200px]">
          <p className="text-xs text-slate-400 font-medium">Projected Impact @ 50</p>
          <p className={`text-2xl font-black ${wealth50Diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatINR(wealth50Diff, { showSign: true })}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {fiAgeDiff === 0 
              ? 'FI age unaffected' 
              : fiAgeDiff < 0 
                ? `FI ${Math.abs(fiAgeDiff)} yrs earlier (Age ${scenarioResult.fiAge})` 
                : `FI delayed by +${fiAgeDiff} yrs`}
          </p>
        </div>
      </div>

      {/* Interactive Controls & Live Impact Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Sliders (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <h2 className="font-bold text-base text-slate-900">
                Adjust Scenario Parameters
              </h2>
            </div>
            <button
              onClick={() => setParams({ ...scenarioDef.parameters })}
              title="Reset parameters to default"
              className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Dynamic parameter controls */}
          <div className="space-y-5">
            {scenarioDef.parameterDefs.map((def) => {
              const val = params[def.key] ?? def.defaultValue;
              return (
                <div key={def.key} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-slate-700">
                      {def.label}
                    </label>
                    <span className="font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                      {def.unit === '₹' ? formatINR(val) : `${val} ${def.unit || ''}`}
                    </span>
                  </div>

                  {def.type === 'slider' && (
                    <div className="space-y-1">
                      <input
                        type="range"
                        min={def.min ?? 0}
                        max={def.max ?? 100000}
                        step={def.step ?? 1}
                        value={val}
                        onChange={(e) => handleParamChange(def.key, parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>{def.unit === '₹' ? formatCompactINR(def.min ?? 0) : def.min}</span>
                        <span>{def.unit === '₹' ? formatCompactINR(def.max ?? 100) : def.max}</span>
                      </div>
                    </div>
                  )}

                  {def.description && (
                    <p className="text-[11px] text-slate-400">
                      {def.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Context note */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-800 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Moving sliders updates the simulation in real time using your configured 12% equity, 7% debt, and 6% inflation assumptions.
            </p>
          </div>
        </div>

        {/* Right Column: Live Impact Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Metric 1: Wealth @ 50 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-1">
              <p className="text-xs font-semibold text-slate-400">Wealth at Age 50</p>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-slate-400 line-through text-xs sm:text-sm">
                  {formatINR(baselineResult.wealthAt50)}
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900">
                  → {formatINR(scenarioResult.wealthAt50)}
                </span>
              </div>
              <p className={`text-xs font-bold ${wealth50Diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatINR(wealth50Diff, { showSign: true })} delta
              </p>
            </div>

            {/* Metric 2: Financial Independence Age */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-1">
              <p className="text-xs font-semibold text-slate-400">Financial Independence</p>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-slate-400 line-through text-xs sm:text-sm">
                  Age {baselineResult.fiAge}
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900">
                  → Age {scenarioResult.fiAge}
                </span>
              </div>
              <p className={`text-xs font-bold ${fiAgeDiff <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {fiAgeDiff === 0 
                  ? 'No change in FI age' 
                  : fiAgeDiff < 0 
                    ? `${Math.abs(fiAgeDiff)} years earlier` 
                    : `+${fiAgeDiff} years delayed`}
              </p>
            </div>

            {/* Metric 3: Monthly Investment Outflow */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-1">
              <p className="text-xs font-semibold text-slate-400">Monthly Investment</p>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-slate-400 line-through text-xs sm:text-sm">
                  {formatINR(profile.monthlySip)}
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900">
                  → {formatINR(scenarioResult.timeline[0]?.sip ?? profile.monthlySip)}
                </span>
              </div>
              <p className="text-xs font-semibold text-indigo-600">
                {formatINR((scenarioResult.timeline[0]?.sip ?? profile.monthlySip) - profile.monthlySip, { showSign: true })} / month
              </p>
            </div>
          </div>

          {/* Current vs Scenario Comparison Table */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center justify-between">
              <span>Current vs Scenario Comparison</span>
              <span className="text-xs font-normal text-slate-400">Live Mathematical Projection</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-left">
                    <th className="pb-2.5 font-medium">Metric</th>
                    <th className="pb-2.5 font-medium">Current Plan</th>
                    <th className="pb-2.5 font-medium text-indigo-600">Scenario</th>
                    <th className="pb-2.5 font-medium text-right">Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-2.5 font-medium text-slate-900">Monthly SIP</td>
                    <td className="py-2.5">{formatINR(profile.monthlySip)}</td>
                    <td className="py-2.5 font-bold text-indigo-600">{formatINR(scenarioResult.timeline[0]?.sip ?? profile.monthlySip)}</td>
                    <td className="py-2.5 text-right font-semibold">
                      {formatINR((scenarioResult.timeline[0]?.sip ?? profile.monthlySip) - profile.monthlySip, { showSign: true })}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-slate-900">Wealth @ Age 40</td>
                    <td className="py-2.5">{formatINR(baselineResult.wealthAt40)}</td>
                    <td className="py-2.5 font-bold text-indigo-600">{formatINR(scenarioResult.wealthAt40)}</td>
                    <td className={`py-2.5 text-right font-semibold ${comparison.deltas.wealthAt40Delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatINR(comparison.deltas.wealthAt40Delta, { showSign: true })}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-slate-900">Wealth @ Age 50</td>
                    <td className="py-2.5">{formatINR(baselineResult.wealthAt50)}</td>
                    <td className="py-2.5 font-bold text-indigo-600">{formatINR(scenarioResult.wealthAt50)}</td>
                    <td className={`py-2.5 text-right font-semibold ${wealth50Diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatINR(wealth50Diff, { showSign: true })}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-slate-900">FI Age</td>
                    <td className="py-2.5">Age {baselineResult.fiAge}</td>
                    <td className="py-2.5 font-bold text-indigo-600">Age {scenarioResult.fiAge}</td>
                    <td className={`py-2.5 text-right font-semibold ${fiAgeDiff <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {fiAgeDiff === 0 ? '0 yrs' : (fiAgeDiff < 0 ? `${Math.abs(fiAgeDiff)} yrs earlier` : `+${fiAgeDiff} yrs`)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-slate-900">Retirement Corpus (@ {profile.targetRetirementAge})</td>
                    <td className="py-2.5">{formatINR(baselineResult.wealthAtRetirement)}</td>
                    <td className="py-2.5 font-bold text-indigo-600">{formatINR(scenarioResult.wealthAtRetirement)}</td>
                    <td className={`py-2.5 text-right font-semibold ${comparison.deltas.wealthAtRetirementDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatINR(comparison.deltas.wealthAtRetirementDelta, { showSign: true })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Projection Chart comparing Current vs Scenario */}
      <ProjectionChart
        baseline={baselineResult}
        scenarioResult={scenarioResult}
        activeScenarios={[activeScenarioDef]}
        profile={profile}
        height={340}
        primaryHex={primaryHex}
      />

      {/* "Why did this change?" Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Why did this change?
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent breakdown of compounding mathematical drivers behind this scenario
          </p>
        </div>

        {/* Visual Step-by-Step Flow Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {comparison.whyExplanation.map((node, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all relative ${
                node.type === 'outcome'
                  ? 'bg-indigo-50/80 border-indigo-200'
                  : node.type === 'positive'
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : node.type === 'negative'
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                <span>Step 0{idx + 1}</span>
                {node.type === 'outcome' && (
                  <span className="text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                    Final Impact
                  </span>
                )}
              </div>

              <h4 className="font-bold text-sm text-slate-900">
                {node.title}
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {node.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
