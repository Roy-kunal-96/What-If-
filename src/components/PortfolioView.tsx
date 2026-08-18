import React, { useState, useMemo } from 'react';
import {
  PieChart as PieIcon,
  Sliders,
  TrendingUp,
  Shield,
  Sparkles,
  Info,
  ArrowRight,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { FinancialProfile, FinancialAssumptions } from '../types';
import { formatINR, formatPercent } from '../utils/formatters';

interface PortfolioViewProps {
  profile: FinancialProfile;
  assumptions: FinancialAssumptions;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  profile,
  assumptions,
}) => {
  const totalCurrentInvestments = profile.equityValue + profile.debtValue + profile.goldValue + profile.cashValue;

  // Current allocation percentages
  const currentEquityPct = Math.round((profile.equityValue / totalCurrentInvestments) * 100);
  const currentDebtPct = Math.round((profile.debtValue / totalCurrentInvestments) * 100);
  const currentGoldPct = Math.round((profile.goldValue / totalCurrentInvestments) * 100);
  const currentCashPct = 100 - (currentEquityPct + currentDebtPct + currentGoldPct);

  // What If interactive allocation sliders
  const [whatIfEquity, setWhatIfEquity] = useState<number>(70);
  const [whatIfDebt, setWhatIfDebt] = useState<number>(15);
  const [whatIfGold, setWhatIfGold] = useState<number>(10);

  const whatIfCash = Math.max(0, 100 - (whatIfEquity + whatIfDebt + whatIfGold));

  const currentPieData = [
    { name: 'Equity (Stocks & MFs)', value: profile.equityValue, color: '#4f46e5', pct: currentEquityPct },
    { name: 'Debt & Bonds', value: profile.debtValue, color: '#0ea5e9', pct: currentDebtPct },
    { name: 'Physical / SGB Gold', value: profile.goldValue, color: '#f59e0b', pct: currentGoldPct },
    { name: 'Cash & Liquid Bank', value: profile.cashValue, color: '#64748b', pct: currentCashPct },
  ];

  const whatIfPieData = [
    { name: 'Equity (Stocks & MFs)', value: Math.round(totalCurrentInvestments * (whatIfEquity / 100)), color: '#4f46e5', pct: whatIfEquity },
    { name: 'Debt & Bonds', value: Math.round(totalCurrentInvestments * (whatIfDebt / 100)), color: '#0ea5e9', pct: whatIfDebt },
    { name: 'Physical / SGB Gold', value: Math.round(totalCurrentInvestments * (whatIfGold / 100)), color: '#f59e0b', pct: whatIfGold },
    { name: 'Cash & Liquid Bank', value: Math.round(totalCurrentInvestments * (whatIfCash / 100)), color: '#64748b', pct: whatIfCash },
  ];

  // Calculate weighted expected returns
  const currentWeightedReturn =
    (currentEquityPct / 100) * assumptions.equityReturn +
    (currentDebtPct / 100) * assumptions.debtReturn +
    (currentGoldPct / 100) * assumptions.goldReturn +
    (currentCashPct / 100) * assumptions.cashReturn;

  const whatIfWeightedReturn =
    (whatIfEquity / 100) * assumptions.equityReturn +
    (whatIfDebt / 100) * assumptions.debtReturn +
    (whatIfGold / 100) * assumptions.goldReturn +
    (whatIfCash / 100) * assumptions.cashReturn;

  // 18-year compounded portfolio growth
  const years = 18;
  const current18YrValue = totalCurrentInvestments * Math.pow(1 + currentWeightedReturn, years);
  const whatIf18YrValue = totalCurrentInvestments * Math.pow(1 + whatIfWeightedReturn, years);
  const delta18Yr = whatIf18YrValue - current18YrValue;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Asset Allocation Lab
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Portfolio & Asset Allocation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Simulate how modifying your strategic asset mix between Equity, Debt, Gold, and Liquid Cash changes your long-term return potential.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-right min-w-[200px]">
          <p className="text-xs text-slate-400 font-medium">Total Liquid Portfolio</p>
          <p className="text-2xl font-black text-slate-900">{formatINR(totalCurrentInvestments)}</p>
          <p className="text-xs text-indigo-600 font-semibold">Excluding illiquid real estate</p>
        </div>
      </div>

      {/* Side by side Donut comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Donut Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Actual Hold</span>
              <h3 className="font-bold text-base text-slate-900">Current Asset Allocation</h3>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
              ~{formatPercent(currentWeightedReturn)} Expected Return
            </span>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {currentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatINR(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center pointer-events-none">
              <p className="text-[11px] text-slate-400 font-medium">Weighted</p>
              <p className="text-sm font-black text-slate-900">{formatPercent(currentWeightedReturn)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {currentPieData.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate text-slate-600 font-medium">{item.name.split(' ')[0]}</span>
                </div>
                <span className="font-bold text-slate-900">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* What If Donut Card */}
        <div className="bg-white rounded-3xl p-6 border border-indigo-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Simulated Target</span>
              <h3 className="font-bold text-base text-slate-900">What If Asset Allocation</h3>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl">
              ~{formatPercent(whatIfWeightedReturn)} Expected Return
            </span>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={whatIfPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {whatIfPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatINR(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center pointer-events-none">
              <p className="text-[11px] text-indigo-600 font-medium">Weighted</p>
              <p className="text-sm font-black text-indigo-950">{formatPercent(whatIfWeightedReturn)}</p>
            </div>
          </div>

          {/* Allocation Sliders */}
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600">Equity (%)</span>
                <span className="font-bold text-indigo-600">{whatIfEquity}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={90}
                step={5}
                value={whatIfEquity}
                onChange={(e) => setWhatIfEquity(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600">Debt (%)</span>
                <span className="font-bold text-sky-600">{whatIfDebt}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={whatIfDebt}
                onChange={(e) => setWhatIfDebt(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600">Gold (%)</span>
                <span className="font-bold text-amber-600">{whatIfGold}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                step={5}
                value={whatIfGold}
                onChange={(e) => setWhatIfGold(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Return & Volatility Comparison Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-base text-slate-900">
            Compound Impact of Rebalancing Over 18 Years
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="text-slate-400 font-medium">Current Allocation (Age 50)</p>
            <p className="text-xl font-bold text-slate-900">{formatINR(current18YrValue)}</p>
            <p className="text-slate-500">Compounding at {formatPercent(currentWeightedReturn)} p.a.</p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-1">
            <p className="text-indigo-600 font-medium">What If Rebalanced (Age 50)</p>
            <p className="text-xl font-bold text-indigo-950">{formatINR(whatIf18YrValue)}</p>
            <p className="text-indigo-700 font-semibold">Compounding at {formatPercent(whatIfWeightedReturn)} p.a.</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1">
            <p className="text-emerald-700 font-medium">Projected Differential</p>
            <p className="text-xl font-bold text-emerald-700">{formatINR(delta18Yr, { showSign: true })}</p>
            <p className="text-emerald-600">Pure compounding alpha</p>
          </div>
        </div>
      </div>
    </div>
  );
};
