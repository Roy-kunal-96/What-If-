import React, { useState } from 'react';
import {
  Target,
  Home,
  Sun,
  GraduationCap,
  Car,
  Plane,
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { GoalItem, FinancialProfile, FinancialAssumptions } from '../types';
import { formatINR, formatCompactINR } from '../utils/formatters';

interface GoalsViewProps {
  profile: FinancialProfile;
  assumptions: FinancialAssumptions;
  onOpenWhatIfModal: () => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  profile,
  assumptions,
  onOpenWhatIfModal,
}) => {
  const [goals, setGoals] = useState<GoalItem[]>([
    {
      id: 'goal-home',
      name: 'Dream Family Home',
      category: 'home',
      icon: 'Home',
      targetAmount: 8000000,
      targetAge: 38,
      targetYear: 2032,
      currentAllocated: 5760000,
      monthlyContribution: 25000,
      priority: 'high',
    },
    {
      id: 'goal-retirement',
      name: 'Financial Freedom & Retirement',
      category: 'retirement',
      icon: 'Sun',
      targetAmount: 50000000,
      targetAge: 50,
      targetYear: 2044,
      currentAllocated: 30500000,
      monthlyContribution: 45000,
      priority: 'high',
    },
    {
      id: 'goal-education',
      name: 'Higher Education Fund',
      category: 'education',
      icon: 'GraduationCap',
      targetAmount: 4000000,
      targetAge: 46,
      targetYear: 2040,
      currentAllocated: 1680000,
      monthlyContribution: 15000,
      priority: 'medium',
    },
    {
      id: 'goal-ev-car',
      name: 'Electric SUV Upgrade',
      category: 'car',
      icon: 'Car',
      targetAmount: 2000000,
      targetAge: 34,
      targetYear: 2028,
      currentAllocated: 1700000,
      monthlyContribution: 10000,
      priority: 'low',
    },
  ]);

  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState(2500000);
  const [newGoalYear, setNewGoalYear] = useState(2035);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName.trim()) return;

    const newGoal: GoalItem = {
      id: `goal-${Date.now()}`,
      name: newGoalName,
      category: 'other',
      icon: 'Target',
      targetAmount: newGoalAmount,
      targetAge: profile.age + (newGoalYear - new Date().getFullYear()),
      targetYear: newGoalYear,
      currentAllocated: Math.round(newGoalAmount * 0.1),
      monthlyContribution: 10000,
      priority: 'medium',
    };

    setGoals([...goals, newGoal]);
    setNewGoalName('');
    setIsAddingGoal(false);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'home': return <Home className="w-5 h-5 text-indigo-600" />;
      case 'retirement': return <Sun className="w-5 h-5 text-amber-500" />;
      case 'education': return <GraduationCap className="w-5 h-5 text-blue-600" />;
      case 'car': return <Car className="w-5 h-5 text-emerald-600" />;
      default: return <Target className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Milestone Tracker
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Life Goals & Targets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Track funded progress across your primary milestones. Simulate how tweaking today's SIP or taking on loans impacts each individual goal's target date.
          </p>
        </div>

        <button
          onClick={() => setIsAddingGoal(!isAddingGoal)}
          className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isAddingGoal ? 'Close Form' : '+ Add New Goal'}</span>
        </button>
      </div>

      {/* Add Goal Form Drawer */}
      {isAddingGoal && (
        <form onSubmit={handleAddGoal} className="bg-white rounded-3xl p-6 border border-indigo-200 shadow-sm space-y-4 animate-in fade-in">
          <h3 className="font-bold text-sm text-slate-900">Add a Custom Milestone Goal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Goal Name</label>
              <input
                type="text"
                placeholder="e.g. World Tour Sabbatical"
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Amount (₹)</label>
              <input
                type="number"
                value={newGoalAmount}
                onChange={(e) => setNewGoalAmount(parseFloat(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Year</label>
              <input
                type="number"
                min={new Date().getFullYear() + 1}
                max={2060}
                value={newGoalYear}
                onChange={(e) => setNewGoalYear(parseInt(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingGoal(false)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
            >
              Save Goal
            </button>
          </div>
        </form>
      )}

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentAllocated / goal.targetAmount) * 100));
          return (
            <div
              key={goal.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                      {getCategoryIcon(goal.category)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{goal.name}</h3>
                      <p className="text-xs text-slate-400">Target Year: {goal.targetYear} (Age {goal.targetAge})</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl">
                    {pct}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 70 ? 'bg-indigo-600' : pct >= 50 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Funded: {formatINR(goal.currentAllocated)}</span>
                    <span className="text-slate-900 font-bold">{formatINR(goal.targetAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Goal Key Parameters */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-400">Monthly Allocation</p>
                  <p className="font-bold text-slate-900">{formatINR(goal.monthlyContribution)}/mo</p>
                </div>
                <div>
                  <p className="text-slate-400">Time Horizon</p>
                  <p className="font-bold text-indigo-600">{goal.targetYear - new Date().getFullYear()} Years</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
