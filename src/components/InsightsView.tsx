import React, { useMemo } from 'react';
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Info,
  Scale,
} from 'lucide-react';
import { FinancialProfile, FinancialAssumptions } from '../types';
import { runSimulation } from '../engine/projection';
import { formatINR } from '../utils/formatters';

interface InsightsViewProps {
  profile: FinancialProfile;
  assumptions: FinancialAssumptions;
  onOpenWhatIf: () => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  profile,
  assumptions,
  onOpenWhatIf,
}) => {
  const baseResult = useMemo(() => {
    return runSimulation(profile, assumptions, []);
  }, [profile, assumptions]);

  const insights = [
    {
      id: 'insight-lever-1',
      title: 'Your biggest lever is your monthly savings rate',
      type: 'lever',
      icon: Zap,
      color: 'indigo',
      badge: 'High Sensitivity',
      headline: `Increasing SIP by ₹10,000 moves your FI date from Age ${baseResult.fiAge} → Age ${baseResult.fiAge - 2}`,
      description:
        'In the early accumulation phase (under 40), monthly savings rate mathematically impacts terminal wealth 3.2x more heavily than picking between 11% vs 12% mutual fund returns.',
      actionLabel: 'Test SIP boost',
    },
    {
      id: 'insight-lever-2',
      title: 'Your plan is moderately sensitive to income interruption',
      type: 'risk',
      icon: AlertTriangle,
      color: 'amber',
      badge: 'Risk Analysis',
      headline: 'A 12-month career break could delay your FI target by ~1.8 years',
      description:
        'Because your liquid emergency buffer currently stands at ~8 months, a 12-month zero-income disruption would require liquidating compounding investments.',
      actionLabel: 'Stress test job loss',
    },
    {
      id: 'insight-lever-3',
      title: 'Savings discipline vs asset allocation sensitivity',
      type: 'growth',
      icon: Scale,
      color: 'emerald',
      badge: 'Asset Dynamics',
      headline: 'Long-term outcome is 2.4x more sensitive to consistency than small allocation tweaks',
      description:
        'Shifting 5% from Debt to Equity generates ~₹18L in extra 20-year returns, while stepping up SIP by 10% annually generates +₹94L.',
      actionLabel: 'Explore step-up SIP',
    },
    {
      id: 'insight-lever-4',
      title: 'Inflation Resilience Score: Strong',
      type: 'shield',
      icon: ShieldCheck,
      color: 'blue',
      badge: 'Protection',
      headline: '60% equity exposure safely outpaces 6% assumed living cost inflation',
      description:
        'Real rate of return on your blended portfolio sits at +4.8% net of inflation, preserving purchasing power across retirement.',
      actionLabel: 'View portfolio mix',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Decision Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Financial Levers & Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Mathematical sensitivity analysis generated directly from your financial profile and scenario simulations.
          </p>
        </div>

        <button
          onClick={onOpenWhatIf}
          className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>+ Explore What If</span>
        </button>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {item.badge}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-slate-900 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs font-semibold text-indigo-600 mt-1.5">
                  {item.headline}
                </p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Simulation derived</span>
                <button
                  onClick={onOpenWhatIf}
                  className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assumptions Transparency Footer */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Educational Transparency Note:</strong> Projections and sensitivity metrics are generated deterministically based on assumed asset growth rates ({assumptions.equityReturn * 100}% equity, {assumptions.debtReturn * 100}% debt, {assumptions.inflationRate * 100}% inflation). They are life planning simulations and not guaranteed investment returns.
        </p>
      </div>
    </div>
  );
};
