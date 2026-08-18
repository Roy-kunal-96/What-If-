import React, { useMemo } from 'react';
import {
  Milestone,
  Calendar,
  Sparkles,
  Home,
  Baby,
  Car,
  Sun,
  GraduationCap,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { FinancialProfile, FinancialAssumptions, ScenarioDefinition } from '../types';
import { runSimulation } from '../engine/projection';
import { formatINR } from '../utils/formatters';

interface TimelineViewProps {
  profile: FinancialProfile;
  assumptions: FinancialAssumptions;
  activeScenarios: ScenarioDefinition[];
  onOpenWhatIf: () => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  profile,
  assumptions,
  activeScenarios,
  onOpenWhatIf,
}) => {
  const result = useMemo(() => {
    return runSimulation(profile, assumptions, activeScenarios);
  }, [profile, assumptions, activeScenarios]);

  // Key life milestone points
  const milestones = [
    {
      year: new Date().getFullYear(),
      age: profile.age,
      title: 'Current Baseline',
      subtitle: `Starting capital: ${formatINR(profile.equityValue + profile.debtValue + profile.goldValue + profile.cashValue)}`,
      icon: TrendingUp,
      type: 'base',
    },
    {
      year: new Date().getFullYear() + 2,
      age: profile.age + 2,
      title: 'Upgrade Electric Car',
      subtitle: 'Target budget: ₹20L (EMI ~₹35K/mo)',
      icon: Car,
      type: 'purchase',
    },
    {
      year: new Date().getFullYear() + 3,
      age: profile.age + 3,
      title: 'Buy Family House',
      subtitle: '₹80L property acquisition with 20% down payment',
      icon: Home,
      type: 'purchase',
    },
    {
      year: new Date().getFullYear() + 5,
      age: profile.age + 5,
      title: 'Welcome a Child',
      subtitle: 'Recurring childcare & early schooling fund setup',
      icon: Baby,
      type: 'life',
    },
    {
      year: new Date().getFullYear() + 14,
      age: profile.age + 14,
      title: 'Higher Education Fund Release',
      subtitle: 'College & university tuition corpus maturity',
      icon: GraduationCap,
      type: 'goal',
    },
    {
      year: new Date().getFullYear() + (result.fiAge - profile.age),
      age: result.fiAge,
      title: 'Financial Independence Milestone',
      subtitle: `Projected liquid net worth crosses 25x living expenses`,
      icon: Sun,
      type: 'fi',
    },
    {
      year: new Date().getFullYear() + (profile.targetRetirementAge - profile.age),
      age: profile.targetRetirementAge,
      title: 'Planned Retirement Horizon',
      subtitle: `Target corpus: ${formatINR(profile.targetRetirementCorpus)}`,
      icon: Sun,
      type: 'retirement',
    },
  ].sort((a, b) => a.age - b.age);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Life Roadmap
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Life & Financial Timeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            See how major life decisions map along your chronological compounding curve from today until full retirement.
          </p>
        </div>

        <button
          onClick={onOpenWhatIf}
          className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>+ Add Life Event</span>
        </button>
      </div>

      {/* Vertical Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8 relative">
        <div className="absolute left-8 sm:left-12 top-12 bottom-12 w-0.5 bg-slate-200" />

        {milestones.map((m, idx) => {
          const Icon = m.icon;
          const point = result.timeline.find((t) => t.age === m.age);
          const netWorthAtAge = point ? point.netWorth : 0;
          const isFi = m.type === 'fi';

          return (
            <div key={idx} className="relative flex items-start gap-4 sm:gap-6 group">
              {/* Icon Marker */}
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-transform group-hover:scale-110 shadow-sm ${
                  isFi
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                    : m.type === 'base'
                      ? 'bg-slate-900 text-white'
                      : 'bg-indigo-600 text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Event Content Card */}
              <div
                className={`flex-1 p-5 rounded-2xl border transition-all ${
                  isFi
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-slate-50/70 border-slate-200/80 group-hover:bg-white group-hover:shadow-md'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200/60 shadow-2xs">
                      Year {m.year} • Age {m.age}
                    </span>
                    {isFi && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">
                        ★ Independence Achieved
                      </span>
                    )}
                  </div>

                  {netWorthAtAge > 0 && (
                    <span className="text-xs font-extrabold text-slate-900">
                      Net Worth: {formatINR(netWorthAtAge)}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 mt-1.5">
                  {m.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {m.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
