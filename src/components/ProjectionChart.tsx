import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { SimulationResult, ScenarioDefinition, FinancialProfile } from '../types';
import { formatINR, formatCompactINR } from '../utils/formatters';
import { Eye, EyeOff, Layers, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';

interface ProjectionChartProps {
  baseline: SimulationResult;
  scenarioResult?: SimulationResult;
  activeScenarios?: ScenarioDefinition[];
  profile: FinancialProfile;
  height?: number;
  primaryHex?: string;
}

export const ProjectionChart: React.FC<ProjectionChartProps> = ({
  baseline,
  scenarioResult,
  activeScenarios = [],
  profile,
  height = 360,
  primaryHex = '#4f46e5',
}) => {
  const [showOptimistic, setShowOptimistic] = useState<boolean>(true);
  const [showStress, setShowStress] = useState<boolean>(true);
  const [showBaseline, setShowBaseline] = useState<boolean>(true);
  const [showScenario, setShowScenario] = useState<boolean>(true);

  const hasScenario = !!scenarioResult && activeScenarios.length > 0;

  // Build combined chart data points from age 32 to 75
  const chartData = baseline.timeline
    .filter((pt) => pt.age <= 75)
    .map((basePt) => {
      const scenPt = scenarioResult?.timeline.find((t) => t.age === basePt.age);
      const isRetirementAge = basePt.age === profile.targetRetirementAge;
      const isFiAgeBase = basePt.age === baseline.fiAge;
      const isFiAgeScen = scenarioResult && basePt.age === scenarioResult.fiAge;

      return {
        age: basePt.age,
        year: basePt.year,
        baselineNetWorth: basePt.netWorth,
        scenarioNetWorth: scenPt ? scenPt.netWorth : basePt.netWorth,
        optimistic: (scenPt ?? basePt).optimisticNetWorth,
        stress: (scenPt ?? basePt).stressNetWorth,
        baselineInvested: basePt.totalInvested,
        scenarioInvested: scenPt?.totalInvested ?? basePt.totalInvested,
        events: [
          ...(basePt.events || []),
          ...(scenPt ? scenPt.events : []),
        ],
        isRetirementAge,
        isFiAgeBase,
        isFiAgeScen,
      };
    });

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload;
    if (!data) return null;

    const baseVal = data.baselineNetWorth;
    const scenVal = data.scenarioNetWorth;
    const diff = scenVal - baseVal;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-2 min-w-[220px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-medium">
          <span className="text-slate-300">Age {data.age} ({data.year})</span>
          {data.isRetirementAge && (
            <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
              Retirement
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          {showBaseline && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Current Plan
              </span>
              <span className="font-semibold text-slate-200">{formatINR(baseVal)}</span>
            </div>
          )}

          {hasScenario && showScenario && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-indigo-300">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Scenario
              </span>
              <span className="font-bold text-indigo-300">{formatINR(scenVal)}</span>
            </div>
          )}

          {hasScenario && Math.abs(diff) > 0 && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="text-slate-400">Difference</span>
              <span className={`font-bold ${diff > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {diff > 0 ? '+' : ''}{formatINR(diff)}
              </span>
            </div>
          )}

          {showOptimistic && (
            <div className="flex items-center justify-between text-[11px] text-emerald-400/80">
              <span>Optimistic</span>
              <span>{formatINR(data.optimistic)}</span>
            </div>
          )}

          {showStress && (
            <div className="flex items-center justify-between text-[11px] text-rose-400/80">
              <span>Stress</span>
              <span>{formatINR(data.stress)}</span>
            </div>
          )}
        </div>

        {data.events && data.events.length > 0 && (
          <div className="pt-1.5 border-t border-slate-800 text-[10px] text-amber-200/90 space-y-0.5">
            {data.events.slice(0, 2).map((ev: string, idx: number) => (
              <p key={idx} className="truncate">• {ev}</p>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
      {/* Chart Header & Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
              Wealth Projection Trajectory
            </h3>
            {hasScenario && (
              <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200/50">
                Comparing with {activeScenarios.length} Scenario{activeScenarios.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Portfolio value compounding from Age {profile.age} to 75 (inflation-adjusted & returns modeling)
          </p>
        </div>

        {/* Legend / Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowBaseline(!showBaseline)}
            className={`px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              showBaseline
                ? 'bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-white border-dashed border-slate-200 text-slate-400'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-400" />
            <span>Current Plan</span>
          </button>

          {hasScenario && (
            <button
              onClick={() => setShowScenario(!showScenario)}
              className={`px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                showScenario
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-dashed border-slate-200 text-slate-400'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
              <span>What If Scenario</span>
            </button>
          )}

          <button
            onClick={() => setShowOptimistic(!showOptimistic)}
            className={`px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              showOptimistic
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-dashed border-slate-200 text-slate-400'
            }`}
          >
            <span className="w-2.5 h-1 rounded-sm bg-emerald-500" />
            <span>Optimistic</span>
          </button>

          <button
            onClick={() => setShowStress(!showStress)}
            className={`px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              showStress
                ? 'bg-rose-50 border-rose-300 text-rose-700'
                : 'bg-white border-dashed border-slate-200 text-slate-400'
            }`}
          >
            <span className="w-2.5 h-1 rounded-sm bg-rose-400" />
            <span>Stress</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ width: '100%', height: height }} className="relative select-none">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScenario" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryHex} stopOpacity={0.25} />
                <stop offset="95%" stopColor={primaryHex} stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="age"
              tickFormatter={(age) => `Age ${age}`}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />

            <YAxis
              tickFormatter={(val) => formatCompactINR(val)}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Reference Line for Target Retirement Age */}
            <ReferenceLine
              x={profile.targetRetirementAge}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{
                value: `Retire (${profile.targetRetirementAge})`,
                fill: '#d97706',
                fontSize: 10,
                position: 'top',
              }}
            />

            {/* Optimistic Band */}
            {showOptimistic && (
              <Line
                type="monotone"
                dataKey="optimistic"
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
                name="Optimistic"
              />
            )}

            {/* Stress Band */}
            {showStress && (
              <Line
                type="monotone"
                dataKey="stress"
                stroke="#f43f5e"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
                name="Stress"
              />
            )}

            {/* Baseline Curve */}
            {showBaseline && (
              <Area
                type="monotone"
                dataKey="baselineNetWorth"
                stroke="#64748b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorBaseline)"
                name="Current Plan"
              />
            )}

            {/* Scenario Curve */}
            {hasScenario && showScenario && (
              <Area
                type="monotone"
                dataKey="scenarioNetWorth"
                stroke={primaryHex}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorScenario)"
                name="Scenario"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Scrubber & Key Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-slate-400 font-medium">Wealth @ Age 40</p>
          <p className="text-sm sm:text-base font-bold text-slate-900">
            {formatINR(hasScenario && scenarioResult ? scenarioResult.wealthAt40 : baseline.wealthAt40)}
          </p>
          {hasScenario && scenarioResult && (
            <p className="text-[11px] text-slate-500">
              vs {formatINR(baseline.wealthAt40)} base
            </p>
          )}
        </div>

        <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
          <p className="text-indigo-600 font-medium">Wealth @ Age 50</p>
          <p className="text-sm sm:text-base font-bold text-indigo-950">
            {formatINR(hasScenario && scenarioResult ? scenarioResult.wealthAt50 : baseline.wealthAt50)}
          </p>
          {hasScenario && scenarioResult && (
            <p className={`text-[11px] font-semibold ${scenarioResult.wealthAt50 >= baseline.wealthAt50 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatINR(scenarioResult.wealthAt50 - baseline.wealthAt50, { showSign: true })}
            </p>
          )}
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-slate-400 font-medium">Financial Independence</p>
          <p className="text-sm sm:text-base font-bold text-slate-900">
            Age {hasScenario && scenarioResult ? scenarioResult.fiAge : baseline.fiAge}
          </p>
          {hasScenario && scenarioResult && (
            <p className={`text-[11px] font-semibold ${scenarioResult.fiAge <= baseline.fiAge ? 'text-emerald-600' : 'text-rose-600'}`}>
              {scenarioResult.fiAge === baseline.fiAge 
                ? 'Same age' 
                : scenarioResult.fiAge < baseline.fiAge 
                  ? `${baseline.fiAge - scenarioResult.fiAge} yrs earlier`
                  : `+${scenarioResult.fiAge - baseline.fiAge} yrs delay`}
            </p>
          )}
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-slate-400 font-medium">Emergency Runway</p>
          <p className="text-sm sm:text-base font-bold text-slate-900">
            {baseline.emergencyFundMonths} Months
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">
            Healthy buffer
          </p>
        </div>
      </div>
    </div>
  );
};
