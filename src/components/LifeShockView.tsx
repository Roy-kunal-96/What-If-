import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Dices,
  AlertTriangle,
  HeartPulse,
  Briefcase,
  TrendingDown,
  Compass,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { FinancialProfile, FinancialAssumptions, LifeShockResult } from '../types';
import { runLifeShockScenarios, runSimulation } from '../engine/projection';
import { formatINR, formatYears } from '../utils/formatters';

interface LifeShockViewProps {
  profile: FinancialProfile;
  assumptions: FinancialAssumptions;
  onSimulateShock: (shockScenario: any) => void;
}

export const LifeShockView: React.FC<LifeShockViewProps> = ({
  profile,
  assumptions,
  onSimulateShock,
}) => {
  const shockScenarios = useMemo(() => {
    return runLifeShockScenarios(profile);
  }, [profile]);

  const [selectedShockId, setSelectedShockId] = useState<string>(shockScenarios[0]?.id || '');
  const [isSurprising, setIsSurprising] = useState<boolean>(false);

  const activeShock = useMemo(() => {
    return shockScenarios.find((s) => s.id === selectedShockId) || shockScenarios[0];
  }, [shockScenarios, selectedShockId]);

  const handleSurpriseMe = () => {
    setIsSurprising(true);
    let counter = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * shockScenarios.length);
      setSelectedShockId(shockScenarios[randomIdx].id);
      counter++;
      if (counter > 6) {
        clearInterval(interval);
        setIsSurprising(false);
      }
    }, 100);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'high': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
              Resilience & Stress Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Stress Test Your Life
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Real life throws curveballs. Stress-test your financial armor against sudden job transitions, medical shocks, and market drawdowns to measure recovery time.
          </p>
        </div>

        {/* Surprise me CTA button */}
        <button
          onClick={handleSurpriseMe}
          disabled={isSurprising}
          className="py-3 px-5 rounded-2xl bg-slate-900 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Dices className={`w-4 h-4 ${isSurprising ? 'animate-spin' : ''}`} />
          <span>🎲 Surprise Me</span>
        </button>
      </div>

      {/* Shock Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {shockScenarios.map((shock) => {
          const isSelected = selectedShockId === shock.id;
          return (
            <div
              key={shock.id}
              onClick={() => setSelectedShockId(shock.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-rose-50/70 border-rose-300 shadow-sm ring-2 ring-rose-500/20'
                  : 'bg-white hover:bg-slate-50 border-slate-200/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getSeverityBadge(shock.severity)}`}>
                    {shock.severity} Risk
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">
                  {shock.title}
                </h3>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs font-semibold text-rose-600">
                <span>Inspect shock</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Shock In-Depth Impact Dashboard */}
      {activeShock && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getSeverityBadge(activeShock.severity)}`}>
                Simulated Shock
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                {activeShock.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                "{activeShock.prompt}"
              </p>
            </div>
          </div>

          {/* 4 Large Impact Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-xs text-slate-400 font-medium">Emergency Runway</p>
              <p className="text-xl font-black text-slate-900">
                {activeShock.emergencyFundMonths} Months
              </p>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, (activeShock.emergencyFundMonths / 12) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-1">
              <p className="text-xs text-rose-600 font-medium">Retirement Impact</p>
              <p className="text-xl font-black text-rose-950">
                +{activeShock.retirementImpactYears} Years
              </p>
              <p className="text-[11px] text-rose-600 font-medium">
                Delay to baseline FI
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-xs text-slate-400 font-medium">Net Worth Loss</p>
              <p className="text-xl font-black text-rose-600">
                -{formatINR(activeShock.netWorthLoss)}
              </p>
              <p className="text-[11px] text-slate-400">
                Estimated direct draw
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-xs text-slate-400 font-medium">Estimated Recovery</p>
              <p className="text-xl font-black text-slate-900">
                ~{activeShock.recoveryTimeYears} Years
              </p>
              <p className="text-[11px] text-emerald-600 font-medium">
                To reach baseline curve
              </p>
            </div>
          </div>

          {/* Key Mitigations */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Recommended Resilience Safeguards</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-emerald-900">
              {activeShock.keyMitigations.map((item, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-emerald-100 font-medium">
                  • {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
