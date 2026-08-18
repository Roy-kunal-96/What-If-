import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { ScenarioDefinition, ScenarioCategory } from '../types';

interface CustomScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateScenario: (scenario: ScenarioDefinition) => void;
  userAge: number;
}

export const CustomScenarioModal: React.FC<CustomScenarioModalProps> = ({
  isOpen,
  onClose,
  onCreateScenario,
  userAge,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ScenarioCategory>('career');
  const [monthlyDelta, setMonthlyDelta] = useState<number>(25000);
  const [isPositiveMonthly, setIsPositiveMonthly] = useState<boolean>(true);
  const [startAge, setStartAge] = useState<number>(userAge);
  const [durationYears, setDurationYears] = useState<number>(5);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const actualMonthlyDelta = isPositiveMonthly ? Math.abs(monthlyDelta) : -Math.abs(monthlyDelta);

    const customDef: ScenarioDefinition = {
      id: `custom-${Date.now()}`,
      type: 'custom_cashflow',
      category: category,
      title: title.trim(),
      subtitle: `${isPositiveMonthly ? '+' : '-'}${Math.abs(actualMonthlyDelta).toLocaleString('en-IN')}/mo for ${durationYears} yrs`,
      description: description.trim() || 'Custom user-created life & cash flow scenario.',
      iconName: isPositiveMonthly ? 'TrendingUp' : 'Coins',
      badge: 'Custom',
      isCustom: true,
      parameters: {
        monthlyDelta: actualMonthlyDelta,
        startAge: startAge,
        durationYears: durationYears,
      },
      parameterDefs: [
        {
          key: 'monthlyDelta',
          label: 'Monthly Cash Flow Impact',
          type: 'slider',
          min: isPositiveMonthly ? 5000 : -100000,
          max: isPositiveMonthly ? 200000 : -5000,
          step: 5000,
          unit: '₹',
          defaultValue: actualMonthlyDelta,
        },
        {
          key: 'durationYears',
          label: 'Duration (Years)',
          type: 'slider',
          min: 1,
          max: 20,
          step: 1,
          unit: 'yrs',
          defaultValue: durationYears,
        },
      ],
    };

    onCreateScenario(customDef);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Create Custom Scenario
              </h2>
              <p className="text-xs text-slate-500">
                Model any unique life event or cash flow
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Scenario Title
            </label>
            <input
              type="text"
              placeholder="e.g. Start SaaS Side Business / Moving Abroad"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ScenarioCategory)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 bg-white"
              >
                <option value="career">💼 Career & Business</option>
                <option value="investment">💰 Investment</option>
                <option value="life">❤️ Life Event</option>
                <option value="purchase">🏠 Major Purchase</option>
                <option value="goal">🎯 Goal</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Cash Flow Direction</label>
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setIsPositiveMonthly(true)}
                  className={`flex-1 py-1.5 rounded-lg font-semibold text-center cursor-pointer transition-colors ${
                    isPositiveMonthly ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  + Income
                </button>
                <button
                  type="button"
                  onClick={() => setIsPositiveMonthly(false)}
                  className={`flex-1 py-1.5 rounded-lg font-semibold text-center cursor-pointer transition-colors ${
                    !isPositiveMonthly ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  - Outflow
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="font-semibold text-slate-700">
                Monthly Amount: <strong className={isPositiveMonthly ? 'text-emerald-600' : 'text-rose-600'}>{isPositiveMonthly ? '+' : '-'}₹{monthlyDelta.toLocaleString('en-IN')}</strong>
              </label>
            </div>
            <input
              type="range"
              min={5000}
              max={200000}
              step={5000}
              value={monthlyDelta}
              onChange={(e) => setMonthlyDelta(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Start Age</label>
              <input
                type="number"
                min={userAge}
                max={70}
                value={startAge}
                onChange={(e) => setStartAge(parseInt(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Duration (Years)</label>
              <input
                type="number"
                min={1}
                max={30}
                value={durationYears}
                onChange={(e) => setDurationYears(parseInt(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Build Scenario</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
