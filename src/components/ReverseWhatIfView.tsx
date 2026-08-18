import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Target,
  ArrowRight,
  TrendingUp,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Zap,
} from 'lucide-react';
import {
  FinancialProfile,
  FinancialAssumptions,
  ReverseWhatIfPath,
} from '../types';
import { solveReverseWhatIf } from '../engine/projection';
import { formatINR, formatCompactINR } from '../utils/formatters';

interface ReverseWhatIfViewProps {
  profile: FinancialProfile;
  assumptions: FinancialAssumptions;
  onApplyPathAsScenario?: (sipAmount: number) => void;
}

export const ReverseWhatIfView: React.FC<ReverseWhatIfViewProps> = ({
  profile,
  assumptions,
  onApplyPathAsScenario,
}) => {
  const [targetCorpus, setTargetCorpus] = useState<number>(profile.targetRetirementCorpus || 50000000);
  const [targetAge, setTargetAge] = useState<number>(profile.targetRetirementAge || 50);

  const paths = useMemo(() => {
    return solveReverseWhatIf(profile, assumptions, targetCorpus, targetAge);
  }, [profile, assumptions, targetCorpus, targetAge]);

  const yearsRemaining = Math.max(1, targetAge - profile.age);
  const currentInvestments = profile.equityValue + profile.debtValue + profile.goldValue + profile.cashValue;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Goal Back-Solver
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            "What Needs to Happen?"
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Instead of asking "What if I do X?", specify your dream target corpus and discovery date. The engine reverse-calculates all mathematically viable paths.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 min-w-[220px] text-right">
          <p className="text-xs text-indigo-600 font-medium">Target Time Horizon</p>
          <p className="text-2xl font-black text-indigo-950">{yearsRemaining} Years</p>
          <p className="text-xs text-slate-500">From Age {profile.age} to {targetAge}</p>
        </div>
      </div>

      {/* Target Configuration Sliders */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <h2 className="font-bold text-base text-slate-900">
            Define Your Target Outcome
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Target Corpus Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">
                Target Wealth Goal
              </label>
              <span className="font-bold text-sm font-mono text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                {formatINR(targetCorpus)}
              </span>
            </div>
            <input
              type="range"
              min={10000000}
              max={150000000}
              step={2500000}
              value={targetCorpus}
              onChange={(e) => setTargetCorpus(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹1 Cr</span>
              <span>₹15 Cr</span>
            </div>
          </div>

          {/* Target Age Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">
                Target Achievement Age
              </label>
              <span className="font-bold text-sm font-mono text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                Age {targetAge} ({yearsRemaining} yrs)
              </span>
            </div>
            <input
              type="range"
              min={profile.age + 3}
              max={65}
              step={1}
              value={targetAge}
              onChange={(e) => setTargetAge(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Age {profile.age + 3}</span>
              <span>Age 65</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs text-slate-600">
          <span>Starting Assets Today: <strong className="text-slate-900">{formatINR(currentInvestments)}</strong></span>
          <span>Target by Age {targetAge}: <strong className="text-indigo-600">{formatINR(targetCorpus)}</strong></span>
        </div>
      </div>

      {/* Generated Multi-Paths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paths.map((path, idx) => (
          <div
            key={path.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  Path 0{idx + 1} • {path.badge}
                </span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {path.estimatedProbability}% Feasibility
                </span>
              </div>

              <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                {path.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {path.description}
              </p>

              {/* Large Metric */}
              <div className="my-5 p-4 rounded-2xl bg-slate-50 group-hover:bg-indigo-50/50 border border-slate-100 transition-colors">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{path.primaryAction}</p>
                <p className="text-2xl font-black text-slate-900 group-hover:text-indigo-950 mt-0.5">
                  {path.primaryValue}
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                {path.secondaryDetails.map((detail, dIdx) => (
                  <p key={dIdx} className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{detail}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Effort: <strong className="text-slate-700">{path.effortLevel}</strong>
              </span>
              <span className="font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>View projection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
