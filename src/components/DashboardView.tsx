import React, { useMemo } from 'react';
import {
  Plus,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Sun,
  Layers,
  Zap,
  Target,
  RefreshCw,
  GitBranch,
  Dices,
  HelpCircle,
} from 'lucide-react';
import {
  FinancialProfile,
  FinancialAssumptions,
  ScenarioDefinition,
} from '../types';
import { runSimulation, compareScenarios } from '../engine/projection';
import { SCENARIO_CATALOG } from '../engine/scenarios';
import { formatINR, formatCompactINR } from '../utils/formatters';
import { ProjectionChart } from './ProjectionChart';
import { IconHelper } from './IconHelper';

interface DashboardViewProps {
  profile: FinancialProfile;
  assumptions: FinancialAssumptions;
  activeScenarios: ScenarioDefinition[];
  primaryHex?: string;
  onOpenWhatIfModal: () => void;
  onSelectScenario: (scenario: ScenarioDefinition) => void;
  onNavigateToTab: (tab: any) => void;
  onRemoveScenario: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  assumptions,
  activeScenarios,
  primaryHex = '#4f46e5',
  onOpenWhatIfModal,
  onSelectScenario,
  onNavigateToTab,
  onRemoveScenario,
}) => {
  // Baseline simulation (no active scenarios)
  const baselineResult = useMemo(() => {
    return runSimulation(profile, assumptions, []);
  }, [profile, assumptions]);

  // Current active simulation (with stacked scenarios)
  const activeResult = useMemo(() => {
    return runSimulation(profile, assumptions, activeScenarios);
  }, [profile, assumptions, activeScenarios]);

  const comparison = useMemo(() => {
    return compareScenarios(baselineResult, activeResult);
  }, [baselineResult, activeResult]);

  const hasScenarios = activeScenarios.length > 0;
  const wealth50Diff = activeResult.wealthAt50 - baselineResult.wealthAt50;
  const fiAgeDiff = activeResult.fiAge - baselineResult.fiAge;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Hero Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Personal Decision Simulator
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore how today's decisions could change your future.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Simulate life changes, career jumps, major home purchases, and investments to see the compound mathematical impact on your retirement wealth.
          </p>
        </div>

        {/* Primary CTA (Sharp, Compact, Shadowed) */}
        <button
          id="btn-hero-what-if"
          onClick={onOpenWhatIfModal}
          className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 hover:shadow-lg hover:shadow-indigo-600/40 border border-indigo-500/30 transition-all duration-150 cursor-pointer shrink-0 tracking-tight"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ What if?</span>
        </button>
      </div>

      {/* 4 Large Financial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1: Net Worth */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-xs font-medium text-slate-400">Current Net Worth</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatINR(baselineResult.currentNetWorth)}
          </p>
          <p className="text-[11px] text-slate-500">
            Liquid assets & investments
          </p>
        </div>

        {/* Metric 2: Monthly Investment */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-xs font-medium text-slate-400">Monthly Investment</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatINR(hasScenarios ? (activeResult.timeline[0]?.sip ?? profile.monthlySip) : profile.monthlySip)}
          </p>
          <p className="text-[11px] text-indigo-600 font-medium">
            {hasScenarios && activeResult.timeline[0]?.sip !== profile.monthlySip
              ? `${formatINR(activeResult.timeline[0].sip - profile.monthlySip, { showSign: true })} vs baseline`
              : `SIP across equity & debt`}
          </p>
        </div>

        {/* Metric 3: Projected Wealth @ 50 (Dominate Card) */}
        <div className="bg-indigo-50/70 rounded-2xl p-5 border border-indigo-200/80 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-indigo-600">Projected Wealth @ 50</p>
          <p className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">
            {formatINR(hasScenarios ? activeResult.wealthAt50 : baselineResult.wealthAt50)}
          </p>
          <p className="text-[11px] font-semibold text-indigo-700">
            {hasScenarios && wealth50Diff !== 0 ? (
              <span className={wealth50Diff > 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                {formatINR(wealth50Diff, { showSign: true })} scenario impact
              </span>
            ) : (
              `Compounding at ~${assumptions.equityReturn * 100}% equity`
            )}
          </p>
        </div>

        {/* Metric 4: Financial Independence Age */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-1">
          <p className="text-xs font-medium text-slate-400">Financial Independence</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Age {hasScenarios ? activeResult.fiAge : baselineResult.fiAge}
          </p>
          <p className="text-[11px] text-slate-500">
            {hasScenarios && fiAgeDiff !== 0 ? (
              <span className={fiAgeDiff < 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                {fiAgeDiff < 0 ? `${Math.abs(fiAgeDiff)} yrs earlier` : `+${fiAgeDiff} yrs delay`}
              </span>
            ) : (
              `25x Annual Living Buffer`
            )}
          </p>
        </div>
      </div>

      {/* Active Scenarios Banner if stacked */}
      {hasScenarios && (
        <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-900">
              Active Scenario Stack ({activeScenarios.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeScenarios.map((s) => (
                <span
                  key={s.id}
                  className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-white text-indigo-700 border border-indigo-200 shadow-2xs"
                >
                  {s.title}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToTab('scenarios')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
            >
              Manage Stack
            </button>
          </div>
        </div>
      )}

      {/* Wealth Projection Chart */}
      <ProjectionChart
        baseline={baselineResult}
        scenarioResult={hasScenarios ? activeResult : undefined}
        activeScenarios={activeScenarios}
        profile={profile}
        height={380}
        primaryHex={primaryHex}
      />

      {/* Financial Weather / Scenario Range (Optimistic, Expected, Stress) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
              Financial Weather: Your Possible Futures
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Never rely on a single prediction. Real life unfolds across a range of market returns and career conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Optimistic */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-2">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-xs font-bold uppercase tracking-wider">Optimistic</span>
              <span className="text-xs font-extrabold text-emerald-600">~14% Returns</span>
            </div>
            <p className="text-2xl font-black text-emerald-950">
              {formatINR(activeResult.timeline.find((t) => t.age === 50)?.optimisticNetWorth ?? 0)}
            </p>
            <p className="text-xs text-emerald-900/80 leading-relaxed">
              Strong market performance + steady promotions + consistent salary step-ups.
            </p>
          </div>

          {/* Expected */}
          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/60 space-y-2">
            <div className="flex items-center justify-between text-indigo-800">
              <span className="text-xs font-bold uppercase tracking-wider">Expected (Base)</span>
              <span className="text-xs font-extrabold text-indigo-600">12% Returns</span>
            </div>
            <p className="text-2xl font-black text-indigo-950">
              {formatINR(activeResult.wealthAt50)}
            </p>
            <p className="text-xs text-indigo-900/80 leading-relaxed">
              Standard base assumptions: 12% equity, 7% debt, 6% inflation, disciplined SIP.
            </p>
          </div>

          {/* Stress */}
          <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/60 space-y-2">
            <div className="flex items-center justify-between text-rose-800">
              <span className="text-xs font-bold uppercase tracking-wider">Stress Horizon</span>
              <span className="text-xs font-extrabold text-rose-600">~8.5% Returns</span>
            </div>
            <p className="text-2xl font-black text-rose-950">
              {formatINR(activeResult.timeline.find((t) => t.age === 50)?.stressNetWorth ?? 0)}
            </p>
            <p className="text-xs text-rose-900/80 leading-relaxed">
              Lower market yields + income interruptions + higher cost-of-living inflation.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          * Note: Projections are mathematical simulations based on historical asset-class behavior, not guaranteed outcomes.
        </p>
      </div>

      {/* Scenario Discovery Library Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
              Popular "What If?" Scenarios
            </h3>
            <p className="text-xs text-slate-500">
              Click any scenario to adjust parameters with live calculation feedback
            </p>
          </div>

          <button
            onClick={onOpenWhatIfModal}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {SCENARIO_CATALOG.slice(0, 6).map((sc) => (
            <div
              key={sc.id}
              onClick={() => onSelectScenario(sc)}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <IconHelper name={sc.iconName} className="w-5 h-5" />
                  </div>
                  {sc.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                      {sc.badge}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {sc.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {sc.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-indigo-600">
                <span>Simulate scenario</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Feature Highlights: Reverse What If & Life Shock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reverse What If Card */}
        <div
          onClick={() => onNavigateToTab('reverse')}
          className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
              Reverse "What If?": What Needs to Happen?
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              "I want ₹5 Cr by age 50. What should I do?" The engine reverse-engineers multiple achievable paths (SIP, Step-up, Lump-sum, Asset Tilt).
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-600">
            <span>Solve for goal</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Life Shock Simulator Card */}
        <div
          onClick={() => onNavigateToTab('shock')}
          className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Dices className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-rose-600 transition-colors">
              Stress Test Your Life ("Surprise Me 🎲")
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Simulate sudden job loss, 30% market crashes, or unexpected ₹10L emergency expenses to evaluate emergency runway and recovery time.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-rose-600">
            <span>Run stress test</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
