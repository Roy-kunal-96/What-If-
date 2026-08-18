import React, { useState } from 'react';
import {
  X,
  Sliders,
  User,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Percent,
  Lock,
} from 'lucide-react';
import { FinancialProfile, FinancialAssumptions } from '../types';
import { DEFAULT_PROFILE, DEFAULT_ASSUMPTIONS } from '../engine/projection';
import { formatINR } from '../utils/formatters';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FinancialProfile;
  assumptions: FinancialAssumptions;
  onSaveProfile: (profile: FinancialProfile) => void;
  onSaveAssumptions: (assumptions: FinancialAssumptions) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  assumptions,
  onSaveProfile,
  onSaveAssumptions,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'assumptions'>('profile');
  const [tempProfile, setTempProfile] = useState<FinancialProfile>({ ...profile });
  const [tempAssumptions, setTempAssumptions] = useState<FinancialAssumptions>({ ...assumptions });
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveProfile(tempProfile);
    onSaveAssumptions(tempAssumptions);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  const handleResetDefaults = () => {
    setTempProfile({ ...DEFAULT_PROFILE });
    setTempAssumptions({ ...DEFAULT_ASSUMPTIONS });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Profile & Simulation Assumptions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize your financial baseline data and underlying compounding rates.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              My Financial Profile
            </button>
            <button
              onClick={() => setActiveTab('assumptions')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'assumptions'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Compounding Assumptions
            </button>
          </div>

          <button
            onClick={handleResetDefaults}
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Demo Data</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          {activeTab === 'profile' ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Your Name</label>
                  <input
                    type="text"
                    value={tempProfile.name}
                    onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Current Age</label>
                  <input
                    type="number"
                    value={tempProfile.age}
                    onChange={(e) => setTempProfile({ ...tempProfile, age: parseInt(e.target.value) || 30 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Monthly Income (₹)</label>
                  <input
                    type="number"
                    value={tempProfile.monthlyIncome}
                    onChange={(e) => setTempProfile({ ...tempProfile, monthlyIncome: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Monthly Expenses (₹)</label>
                  <input
                    type="number"
                    value={tempProfile.monthlyExpenses}
                    onChange={(e) => setTempProfile({ ...tempProfile, monthlyExpenses: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Monthly SIP (₹)</label>
                  <input
                    type="number"
                    value={tempProfile.monthlySip}
                    onChange={(e) => setTempProfile({ ...tempProfile, monthlySip: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="font-bold text-slate-800 mb-2">Current Assets</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1">Equity (₹)</label>
                    <input
                      type="number"
                      value={tempProfile.equityValue}
                      onChange={(e) => setTempProfile({ ...tempProfile, equityValue: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Debt (₹)</label>
                    <input
                      type="number"
                      value={tempProfile.debtValue}
                      onChange={(e) => setTempProfile({ ...tempProfile, debtValue: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Gold (₹)</label>
                    <input
                      type="number"
                      value={tempProfile.goldValue}
                      onChange={(e) => setTempProfile({ ...tempProfile, goldValue: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Cash / Bank (₹)</label>
                    <input
                      type="number"
                      value={tempProfile.cashValue}
                      onChange={(e) => setTempProfile({ ...tempProfile, cashValue: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Retirement Age</label>
                  <input
                    type="number"
                    value={tempProfile.targetRetirementAge}
                    onChange={(e) => setTempProfile({ ...tempProfile, targetRetirementAge: parseInt(e.target.value) || 50 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Retirement Corpus (₹)</label>
                  <input
                    type="number"
                    value={tempProfile.targetRetirementCorpus}
                    onChange={(e) => setTempProfile({ ...tempProfile, targetRetirementCorpus: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="font-semibold text-slate-700">Equity Expected Return (%)</label>
                    <span className="font-bold text-indigo-600">{(tempAssumptions.equityReturn * 100).toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.06}
                    max={0.18}
                    step={0.005}
                    value={tempAssumptions.equityReturn}
                    onChange={(e) => setTempAssumptions({ ...tempAssumptions, equityReturn: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="font-semibold text-slate-700">Debt / Bond Return (%)</label>
                    <span className="font-bold text-indigo-600">{(tempAssumptions.debtReturn * 100).toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.04}
                    max={0.10}
                    step={0.005}
                    value={tempAssumptions.debtReturn}
                    onChange={(e) => setTempAssumptions({ ...tempAssumptions, debtReturn: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="font-semibold text-slate-700">Inflation Rate (%)</label>
                    <span className="font-bold text-indigo-600">{(tempAssumptions.inflationRate * 100).toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.03}
                    max={0.10}
                    step={0.005}
                    value={tempAssumptions.inflationRate}
                    onChange={(e) => setTempAssumptions({ ...tempAssumptions, inflationRate: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="font-semibold text-slate-700">Annual Salary Growth (%)</label>
                    <span className="font-bold text-indigo-600">{(tempAssumptions.incomeGrowthRate * 100).toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.02}
                    max={0.15}
                    step={0.005}
                    value={tempAssumptions.incomeGrowthRate}
                    onChange={(e) => setTempAssumptions({ ...tempAssumptions, incomeGrowthRate: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4" /> : null}
            <span>{isSaved ? 'Applied!' : 'Save & Update Simulation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
