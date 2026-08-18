export interface FinancialProfile {
  name: string;
  age: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySip: number;
  
  // Current Assets
  equityValue: number;
  debtValue: number;
  goldValue: number;
  cashValue: number;
  propertyValue: number;
  otherAssetsValue: number;

  // Current Liabilities
  homeLoanBalance: number;
  homeLoanEmi: number;
  carLoanBalance: number;
  carLoanEmi: number;
  otherLoansBalance: number;
  otherLoansEmi: number;

  // Retirement & Goals
  targetRetirementAge: number;
  targetRetirementCorpus: number;
}

export interface FinancialAssumptions {
  equityReturn: number; // e.g. 0.12 (12%)
  debtReturn: number; // e.g. 0.07 (7%)
  goldReturn: number; // e.g. 0.08 (8%)
  cashReturn: number; // e.g. 0.04 (4%)
  inflationRate: number; // e.g. 0.06 (6%)
  incomeGrowthRate: number; // e.g. 0.08 (8%)
  propertyAppreciationRate: number; // e.g. 0.06 (6%)
  loanInterestRate: number; // e.g. 0.085 (8.5%)
  swrRate: number; // Safe withdrawal rate e.g. 0.04 (4%)
}

export type ScenarioCategory = 
  | 'investment'
  | 'purchase'
  | 'career'
  | 'life'
  | 'goal'
  | 'shock'
  | 'custom';

export type ScenarioType =
  | 'increase_sip'
  | 'decrease_sip'
  | 'lump_sum_investment'
  | 'change_allocation'
  | 'stop_investing'
  | 'buy_house'
  | 'buy_car'
  | 'take_loan'
  | 'prepay_loan'
  | 'salary_increase'
  | 'salary_decrease'
  | 'job_loss'
  | 'career_break'
  | 'start_business'
  | 'early_retirement'
  | 'have_child'
  | 'marriage'
  | 'support_parents'
  | 'relocation'
  | 'unexpected_expense'
  | 'market_crash'
  | 'higher_inflation'
  | 'custom_cashflow';

export interface ScenarioParameterDef {
  key: string;
  label: string;
  type: 'number' | 'slider' | 'select' | 'percentage';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  defaultValue: number;
  description?: string;
}

export interface ScenarioDefinition {
  id: string;
  type: ScenarioType;
  category: ScenarioCategory;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  badge?: string;
  parameters: Record<string, number>;
  parameterDefs: ScenarioParameterDef[];
  isShock?: boolean;
  isCustom?: boolean;
}

export interface SavedScenario {
  id: string;
  definitionId: string;
  type?: ScenarioType;
  category?: ScenarioCategory;
  name: string;
  description: string;
  iconName?: string;
  parameters: Record<string, number>;
  createdAt: string;
  impactWealth50Delta: number;
  impactFiAgeDelta: number;
  pinnedToDashboard?: boolean;
}

export interface YearlyProjectionPoint {
  age: number;
  year: number;
  income: number;
  expenses: number;
  sip: number;
  cashFlow: number;
  equity: number;
  debt: number;
  gold: number;
  cash: number;
  property: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  totalInvested: number;
  totalGains: number;
  isRetired: boolean;
  isFiAchieved: boolean;
  events: string[];
  
  // Scenario variations
  optimisticNetWorth: number;
  stressNetWorth: number;
}

export interface SimulationResult {
  timeline: YearlyProjectionPoint[];
  currentNetWorth: number;
  wealthAt40: number;
  wealthAt50: number;
  wealthAt60: number;
  wealthAtRetirement: number;
  finalNetWorth: number;
  fiAge: number;
  fiAchieved: boolean;
  fiCorpusTarget: number;
  emergencyFundMonths: number;
  totalCapitalInvested: number;
  totalCompoundedGains: number;
  successRate: number; // 0 - 100%
}

export interface WhyExplanationNode {
  title: string;
  description: string;
  badge?: string;
  type: 'neutral' | 'positive' | 'negative' | 'outcome';
}

export interface ScenarioImpactComparison {
  baseline: SimulationResult;
  scenario: SimulationResult;
  deltas: {
    monthlyInvestmentDelta: number;
    wealthAt40Delta: number;
    wealthAt50Delta: number;
    wealthAt60Delta: number;
    wealthAtRetirementDelta: number;
    fiAgeDelta: number;
    capitalInvestedDelta: number;
    totalGainsDelta: number;
  };
  whyExplanation: WhyExplanationNode[];
  summaryHeadline: string;
  summarySubtext: string;
}

export interface GoalItem {
  id: string;
  name: string;
  category: 'home' | 'retirement' | 'education' | 'car' | 'travel' | 'other';
  icon: string;
  targetAmount: number;
  targetAge: number;
  targetYear: number;
  currentAllocated: number;
  monthlyContribution: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ReverseWhatIfPath {
  id: string;
  title: string;
  badge: string;
  description: string;
  primaryAction: string;
  primaryValue: string;
  secondaryDetails: string[];
  estimatedProbability: number;
  effortLevel: 'Moderate' | 'Aggressive' | 'Disciplined' | 'Balanced';
}

export interface LifeShockResult {
  id: string;
  title: string;
  prompt: string;
  icon: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  emergencyFundMonths: number;
  retirementImpactYears: number;
  netWorthLoss: number;
  recoveryTimeYears: number;
  keyMitigations: string[];
}

export type NavTab = 
  | 'dashboard' 
  | 'scenarios' 
  | 'reverse' 
  | 'shock' 
  | 'goals' 
  | 'portfolio' 
  | 'timeline' 
  | 'insights';

export type ThemeId = 
  | 'indigo' 
  | 'emerald' 
  | 'violet' 
  | 'amber' 
  | 'cyan' 
  | 'rose' 
  | 'midnight';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  label: string;
  description: string;
  primaryHex: string;
  secondaryHex: string;
  accentHex: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  bgClass: string;
  cardClass: string;
  textClass: string;
  primaryBtnClass: string;
  isDark: boolean;
}
