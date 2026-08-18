import {
  FinancialProfile,
  FinancialAssumptions,
  YearlyProjectionPoint,
  SimulationResult,
  ScenarioDefinition,
  ScenarioImpactComparison,
  WhyExplanationNode,
  ReverseWhatIfPath,
  LifeShockResult,
} from '../types';
import { formatINR } from '../utils/formatters';

export const DEFAULT_ASSUMPTIONS: FinancialAssumptions = {
  equityReturn: 0.12, // 12% p.a.
  debtReturn: 0.07, // 7% p.a.
  goldReturn: 0.08, // 8% p.a.
  cashReturn: 0.04, // 4% p.a.
  inflationRate: 0.06, // 6% p.a.
  incomeGrowthRate: 0.08, // 8% p.a.
  propertyAppreciationRate: 0.06, // 6% p.a.
  loanInterestRate: 0.085, // 8.5% p.a.
  swrRate: 0.04, // 4% safe withdrawal rate (25x annual expenses)
};

export const DEFAULT_PROFILE: FinancialProfile = {
  name: 'Kunal',
  age: 32,
  monthlyIncome: 150000, // ₹1.5L / mo
  monthlyExpenses: 70000, // ₹70K / mo
  monthlySip: 45000, // ₹45K / mo
  
  equityValue: 1200000, // ₹12L
  debtValue: 500000, // ₹5L
  goldValue: 300000, // ₹3L
  cashValue: 200000, // ₹2L
  propertyValue: 0,
  otherAssetsValue: 0,

  homeLoanBalance: 0,
  homeLoanEmi: 0,
  carLoanBalance: 0,
  carLoanEmi: 0,
  otherLoansBalance: 0,
  otherLoansEmi: 0,

  targetRetirementAge: 50,
  targetRetirementCorpus: 50000000, // ₹5 Cr
};

/**
 * Calculates monthly EMI for a loan using standard formula:
 * EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateEMI(principal: number, annualRate: number, tenureYears: number): number {
  if (principal <= 0 || tenureYears <= 0) return 0;
  const monthlyRate = annualRate / 12;
  const numMonths = tenureYears * 12;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numMonths)) / 
              (Math.pow(1 + monthlyRate, numMonths) - 1);
  return Math.round(emi);
}

/**
 * Run deterministic simulation projection for given profile, assumptions, and optional active scenarios
 */
export function runSimulation(
  profile: FinancialProfile,
  assumptions: FinancialAssumptions = DEFAULT_ASSUMPTIONS,
  activeScenarios: ScenarioDefinition[] = []
): SimulationResult {
  const currentYear = new Date().getFullYear();
  const startAge = profile.age;
  const endAge = 80;
  const totalYears = endAge - startAge;

  const timeline: YearlyProjectionPoint[] = [];

  // Initial asset balances
  let equity = profile.equityValue;
  let debt = profile.debtValue;
  let gold = profile.goldValue;
  let cash = profile.cashValue;
  let property = profile.propertyValue;
  let totalLiabilities = profile.homeLoanBalance + profile.carLoanBalance + profile.otherLoansBalance;
  
  let currentMonthlyIncome = profile.monthlyIncome;
  let currentMonthlyExpenses = profile.monthlyExpenses;
  let currentMonthlySip = profile.monthlySip;

  let totalCapitalInvested = equity + debt + gold + cash;
  let fiAge = endAge;
  let fiAchieved = false;

  // Track active loans created by scenarios: { balance, emi, remainingMonths }
  const activeLoans: { name: string; balance: number; annualRate: number; emi: number; remainingMonths: number }[] = [];
  if (profile.homeLoanBalance > 0 && profile.homeLoanEmi > 0) {
    activeLoans.push({ name: 'Home Loan', balance: profile.homeLoanBalance, annualRate: assumptions.loanInterestRate, emi: profile.homeLoanEmi, remainingMonths: 180 });
  }
  if (profile.carLoanBalance > 0 && profile.carLoanEmi > 0) {
    activeLoans.push({ name: 'Car Loan', balance: profile.carLoanBalance, annualRate: 0.09, emi: profile.carLoanEmi, remainingMonths: 48 });
  }

  // Pre-calculate asset allocation proportions
  let totalInvestments = Math.max(1, equity + debt + gold + cash);
  let eqWeight = equity / totalInvestments;
  let debtWeight = debt / totalInvestments;
  let goldWeight = gold / totalInvestments;
  let cashWeight = cash / totalInvestments;

  // Process scenario modifications that alter initial state or persistent parameters
  for (const sc of activeScenarios) {
    if (sc.type === 'change_allocation') {
      const eqPct = (sc.parameters.equityPct ?? 60) / 100;
      const debtPct = (sc.parameters.debtPct ?? 20) / 100;
      const goldPct = (sc.parameters.goldPct ?? 10) / 100;
      const cashPct = (sc.parameters.cashPct ?? 10) / 100;
      eqWeight = eqPct;
      debtWeight = debtPct;
      goldWeight = goldPct;
      cashWeight = cashPct;
    }
  }

  for (let y = 0; y <= totalYears; y++) {
    const age = startAge + y;
    const year = currentYear + y;
    const isRetired = age >= profile.targetRetirementAge;
    const events: string[] = [];

    // Scenario events for this specific year / age
    let yearlyLumpSum = 0;
    let incomeMultiplier = 1.0;
    let extraExpensesMonthly = 0;
    let sipAdjustmentMonthly = 0;
    let equityReturnShock = 0;
    let isSipStopped = false;

    // Apply active scenarios
    for (const sc of activeScenarios) {
      const startScenarioAge = sc.parameters.startAge ?? profile.age;
      const durationYears = sc.parameters.durationYears ?? 99;
      const isScenarioActiveYear = age >= startScenarioAge && age < (startScenarioAge + durationYears);

      if (sc.type === 'increase_sip' || sc.type === 'decrease_sip') {
        const delta = sc.parameters.newSip ? (sc.parameters.newSip - profile.monthlySip) : (sc.parameters.deltaSip ?? 10000);
        if (isScenarioActiveYear) {
          sipAdjustmentMonthly += delta;
          if (y === 0) events.push(`SIP altered to ${formatINR(profile.monthlySip + delta)}/mo`);
        }
      } else if (sc.type === 'lump_sum_investment') {
        if (age === startScenarioAge) {
          const lump = sc.parameters.amount ?? 500000;
          yearlyLumpSum += lump;
          events.push(`Invested ${formatINR(lump)} lump sum`);
        }
      } else if (sc.type === 'stop_investing') {
        if (isScenarioActiveYear) {
          isSipStopped = true;
          events.push(`Paused SIP investments`);
        }
      } else if (sc.type === 'salary_increase') {
        const hikePct = (sc.parameters.hikePct ?? 20) / 100;
        if (age >= startScenarioAge) {
          incomeMultiplier *= (1 + hikePct);
          if (age === startScenarioAge) events.push(`Salary increased by ${Math.round(hikePct * 100)}%`);
        }
      } else if (sc.type === 'salary_decrease') {
        const dropPct = (sc.parameters.dropPct ?? 20) / 100;
        if (isScenarioActiveYear) {
          incomeMultiplier *= (1 - dropPct);
          if (age === startScenarioAge) events.push(`Salary reduced by ${Math.round(dropPct * 100)}%`);
        }
      } else if (sc.type === 'job_loss') {
        const months = sc.parameters.months ?? 6;
        if (age === startScenarioAge) {
          // Income lost for N months
          const lossFraction = Math.min(1, months / 12);
          incomeMultiplier *= (1 - lossFraction);
          events.push(`Job loss for ${months} months`);
        }
      } else if (sc.type === 'career_break') {
        if (isScenarioActiveYear) {
          incomeMultiplier = 0;
          isSipStopped = true;
          events.push(`Career sabbatical (0 income)`);
        }
      } else if (sc.type === 'buy_house') {
        if (age === startScenarioAge) {
          const cost = sc.parameters.houseCost ?? 8000000;
          const downPaymentPct = (sc.parameters.downPaymentPct ?? 20) / 100;
          const downPayment = cost * downPaymentPct;
          const loanPrincipal = cost - downPayment;
          const tenureYears = sc.parameters.loanTenureYears ?? 20;
          const emi = calculateEMI(loanPrincipal, assumptions.loanInterestRate, tenureYears);

          // Deduct down payment from cash & debt & equity
          let needed = downPayment;
          const cashUsed = Math.min(cash, needed);
          cash -= cashUsed;
          needed -= cashUsed;
          const debtUsed = Math.min(debt, needed);
          debt -= debtUsed;
          needed -= debtUsed;
          const eqUsed = Math.min(equity, needed);
          equity -= eqUsed;
          needed -= eqUsed;

          property += cost;
          activeLoans.push({
            name: 'House Loan',
            balance: loanPrincipal,
            annualRate: assumptions.loanInterestRate,
            emi: emi,
            remainingMonths: tenureYears * 12,
          });
          events.push(`Bought house worth ${formatINR(cost)} (Down payment ${formatINR(downPayment)})`);
        }
      } else if (sc.type === 'buy_car') {
        if (age === startScenarioAge) {
          const cost = sc.parameters.carCost ?? 2000000;
          const downPayment = cost * 0.2;
          const loanPrincipal = cost - downPayment;
          const emi = calculateEMI(loanPrincipal, 0.09, 5);

          // Deduct down payment from cash
          let needed = downPayment;
          const cashUsed = Math.min(cash, needed);
          cash -= cashUsed;
          needed -= cashUsed;
          const debtUsed = Math.min(debt, needed);
          debt -= debtUsed;

          activeLoans.push({
            name: 'Car Loan',
            balance: loanPrincipal,
            annualRate: 0.09,
            emi: emi,
            remainingMonths: 60,
          });
          events.push(`Bought car worth ${formatINR(cost)} (EMI: ${formatINR(emi)}/mo)`);
        }
      } else if (sc.type === 'have_child') {
        if (age === startScenarioAge) {
          const upfront = sc.parameters.upfrontCost ?? 300000;
          const monthly = sc.parameters.monthlyCost ?? 15000;
          cash = Math.max(0, cash - upfront);
          events.push(`Welcomed a child (Upfront ${formatINR(upfront)})`);
        }
        if (age >= startScenarioAge && age < startScenarioAge + 22) {
          extraExpensesMonthly += sc.parameters.monthlyCost ?? 15000;
        }
      } else if (sc.type === 'marriage') {
        if (age === startScenarioAge) {
          const cost = sc.parameters.marriageCost ?? 1500000;
          let needed = cost;
          const cashUsed = Math.min(cash, needed);
          cash -= cashUsed;
          needed -= cashUsed;
          const debtUsed = Math.min(debt, needed);
          debt -= debtUsed;
          needed -= debtUsed;
          equity = Math.max(0, equity - needed);
          events.push(`Marriage expenses ${formatINR(cost)}`);
        }
      } else if (sc.type === 'support_parents') {
        if (isScenarioActiveYear) {
          extraExpensesMonthly += sc.parameters.monthlySupport ?? 20000;
        }
      } else if (sc.type === 'relocation') {
        if (isScenarioActiveYear) {
          // Negative extra expense = expense savings
          const savingsMonthly = sc.parameters.monthlySavings ?? 25000;
          extraExpensesMonthly -= savingsMonthly;
          if (age === startScenarioAge) events.push(`Relocated to tier-2 city (Saved ${formatINR(savingsMonthly)}/mo)`);
        }
      } else if (sc.type === 'unexpected_expense') {
        if (age === startScenarioAge) {
          const amount = sc.parameters.amount ?? 1000000;
          const isWindfall = sc.parameters.isWindfall === 1;
          if (isWindfall) {
            cash += amount;
            events.push(`Received unexpected windfall of ${formatINR(amount)}`);
          } else {
            let needed = amount;
            const cashUsed = Math.min(cash, needed);
            cash -= cashUsed;
            needed -= cashUsed;
            const debtUsed = Math.min(debt, needed);
            debt -= debtUsed;
            needed -= debtUsed;
            equity = Math.max(0, equity - needed);
            events.push(`Unexpected emergency expense of ${formatINR(amount)}`);
          }
        }
      } else if (sc.type === 'market_crash') {
        if (age === startScenarioAge) {
          const dropPct = (sc.parameters.crashPct ?? 30) / 100;
          equityReturnShock = -dropPct;
          events.push(`Market crash: Equity fell ${Math.round(dropPct * 100)}%`);
        }
      } else if (sc.type === 'higher_inflation') {
        // Will be handled in assumptions
      } else if (sc.type === 'custom_cashflow') {
        if (isScenarioActiveYear) {
          const deltaMonthly = sc.parameters.monthlyDelta ?? 0;
          sipAdjustmentMonthly += deltaMonthly;
        }
      }
    }

    // Adjust income and expenses for this year
    let effectiveMonthlyIncome = 0;
    if (!isRetired) {
      // Annual salary growth
      effectiveMonthlyIncome = profile.monthlyIncome * Math.pow(1 + assumptions.incomeGrowthRate, y) * incomeMultiplier;
    }

    // Annual inflation-adjusted expenses
    let effectiveMonthlyExpenses = (profile.monthlyExpenses + extraExpensesMonthly) * Math.pow(1 + assumptions.inflationRate, y);

    // Process loans EMI
    let totalEmiThisYear = 0;
    for (const loan of activeLoans) {
      if (loan.remainingMonths > 0) {
        const monthsToPay = Math.min(12, loan.remainingMonths);
        const emiYear = loan.emi * monthsToPay;
        totalEmiThisYear += emiYear;
        loan.remainingMonths -= monthsToPay;

        // Approximate amortization balance reduction
        const interestPortion = loan.balance * (loan.annualRate / 12) * monthsToPay;
        const principalPortion = Math.max(0, emiYear - interestPortion);
        loan.balance = Math.max(0, loan.balance - principalPortion);
      }
    }

    totalLiabilities = activeLoans.reduce((sum, l) => sum + (l.remainingMonths > 0 ? l.balance : 0), 0);

    // Determine actual SIP this year
    let effectiveMonthlySip = 0;
    if (!isRetired && !isSipStopped) {
      const baseSipInflated = (profile.monthlySip + sipAdjustmentMonthly) * Math.pow(1 + assumptions.incomeGrowthRate * 0.5, y);
      effectiveMonthlySip = Math.max(0, baseSipInflated);
    }

    const annualSipInvested = effectiveMonthlySip * 12 + yearlyLumpSum;
    totalCapitalInvested += annualSipInvested;

    // Investment returns for the year
    const effectiveEqRate = assumptions.equityReturn + equityReturnShock;
    equity = equity * (1 + effectiveEqRate) + annualSipInvested * eqWeight;
    debt = debt * (1 + assumptions.debtReturn) + annualSipInvested * debtWeight;
    gold = gold * (1 + assumptions.goldReturn) + annualSipInvested * goldWeight;
    cash = cash * (1 + assumptions.cashReturn) + annualSipInvested * cashWeight;

    // Property appreciation
    if (property > 0) {
      property = property * (1 + assumptions.propertyAppreciationRate);
    }

    // If retired, withdraw annual expenses from portfolio (cash -> debt -> gold -> equity)
    if (isRetired) {
      let annualWithdrawalNeeded = (effectiveMonthlyExpenses * 12) + totalEmiThisYear;
      
      const cashUsed = Math.min(cash, annualWithdrawalNeeded);
      cash -= cashUsed;
      annualWithdrawalNeeded -= cashUsed;

      const debtUsed = Math.min(debt, annualWithdrawalNeeded);
      debt -= debtUsed;
      annualWithdrawalNeeded -= debtUsed;

      const goldUsed = Math.min(gold, annualWithdrawalNeeded);
      gold -= goldUsed;
      annualWithdrawalNeeded -= goldUsed;

      const eqUsed = Math.min(equity, annualWithdrawalNeeded);
      equity = Math.max(0, equity - eqUsed);
    }

    const totalLiquidAssets = equity + debt + gold + cash;
    const totalAssets = totalLiquidAssets + property;
    const netWorth = totalAssets - totalLiabilities;

    // Check Financial Independence condition (Liquid assets >= 25x annual expenses)
    const annualExpenses = effectiveMonthlyExpenses * 12;
    const fiThreshold = annualExpenses / assumptions.swrRate;
    if (!fiAchieved && totalLiquidAssets >= fiThreshold && age >= profile.age) {
      fiAchieved = true;
      fiAge = age;
      events.push(`Achieved Financial Independence! (25x expenses: ${formatINR(fiThreshold)})`);
    }

    // Optimistic and Stress curve projections
    const optMultiplier = Math.pow(1 + 0.025, y);
    const stressMultiplier = Math.pow(1 - 0.035, y);
    const optimisticNetWorth = Math.round(netWorth * optMultiplier);
    const stressNetWorth = Math.max(0, Math.round(netWorth * stressMultiplier));

    timeline.push({
      age,
      year,
      income: Math.round(effectiveMonthlyIncome * 12),
      expenses: Math.round(effectiveMonthlyExpenses * 12 + totalEmiThisYear),
      sip: Math.round(effectiveMonthlySip),
      cashFlow: Math.round((effectiveMonthlyIncome - effectiveMonthlyExpenses) * 12 - totalEmiThisYear),
      equity: Math.round(equity),
      debt: Math.round(debt),
      gold: Math.round(gold),
      cash: Math.round(cash),
      property: Math.round(property),
      totalAssets: Math.round(totalAssets),
      totalLiabilities: Math.round(totalLiabilities),
      netWorth: Math.round(netWorth),
      totalInvested: Math.round(totalCapitalInvested),
      totalGains: Math.round(Math.max(0, netWorth - totalCapitalInvested)),
      isRetired,
      isFiAchieved: totalLiquidAssets >= fiThreshold,
      events,
      optimisticNetWorth,
      stressNetWorth,
    });
  }

  const getNetWorthAtAge = (targetAge: number): number => {
    const pt = timeline.find((t) => t.age === targetAge);
    return pt ? pt.netWorth : timeline[timeline.length - 1].netWorth;
  };

  const currentNetWorth = timeline[0]?.netWorth ?? (profile.equityValue + profile.debtValue + profile.goldValue + profile.cashValue);
  const wealthAt40 = getNetWorthAtAge(40);
  const wealthAt50 = getNetWorthAtAge(50);
  const wealthAt60 = getNetWorthAtAge(60);
  const wealthAtRetirement = getNetWorthAtAge(profile.targetRetirementAge);
  const finalNetWorth = timeline[timeline.length - 1]?.netWorth ?? 0;

  const monthlyBurn = profile.monthlyExpenses + profile.homeLoanEmi + profile.carLoanEmi;
  const emergencyFundMonths = monthlyBurn > 0 ? Math.round((profile.cashValue + profile.debtValue * 0.5) / monthlyBurn) : 12;

  return {
    timeline,
    currentNetWorth,
    wealthAt40,
    wealthAt50,
    wealthAt60,
    wealthAtRetirement,
    finalNetWorth,
    fiAge: fiAchieved ? fiAge : endAge,
    fiAchieved,
    fiCorpusTarget: (profile.monthlyExpenses * 12) / assumptions.swrRate,
    emergencyFundMonths,
    totalCapitalInvested: Math.round(totalCapitalInvested),
    totalCompoundedGains: Math.round(Math.max(0, finalNetWorth - totalCapitalInvested)),
    successRate: fiAchieved ? (fiAge <= profile.targetRetirementAge ? 96 : 82) : 64,
  };
}

/**
 * Compare a Baseline simulation vs a Scenario simulation and generate mathematical explanation nodes
 */
export function compareScenarios(
  baseline: SimulationResult,
  scenario: SimulationResult,
  scenarioDef?: ScenarioDefinition
): ScenarioImpactComparison {
  const wealth50Delta = scenario.wealthAt50 - baseline.wealthAt50;
  const fiAgeDelta = scenario.fiAge - baseline.fiAge;
  const capitalDelta = scenario.totalCapitalInvested - baseline.totalCapitalInvested;
  const gainsDelta = scenario.totalCompoundedGains - baseline.totalCompoundedGains;

  // Build intelligent Why nodes
  const whyExplanation: WhyExplanationNode[] = [];

  if (scenarioDef) {
    if (scenarioDef.type === 'increase_sip' || scenarioDef.type === 'decrease_sip') {
      const deltaSip = scenarioDef.parameters.newSip ? (scenarioDef.parameters.newSip - 45000) : (scenarioDef.parameters.deltaSip ?? 10000);
      const isInc = deltaSip >= 0;
      whyExplanation.push({
        title: `${isInc ? '+' : ''}${formatINR(deltaSip)}/mo in SIP`,
        description: `Direct change to your recurring monthly investment commitment.`,
        type: isInc ? 'positive' : 'negative',
      });
      whyExplanation.push({
        title: `${isInc ? '+' : ''}${formatINR(deltaSip * 12)} yearly capital`,
        description: `Cumulative principal channeled directly into wealth generation assets.`,
        type: 'neutral',
      });
      whyExplanation.push({
        title: `Power of Compounding Growth`,
        description: `Over 15-20 years at ~12% expected returns, interest generates more than principal.`,
        type: 'neutral',
      });
      whyExplanation.push({
        title: `${formatINR(Math.abs(wealth50Delta), { showSign: true })} Projected Wealth @ 50`,
        description: fiAgeDelta < 0 
          ? `Accelerates Financial Independence potentially ${Math.abs(fiAgeDelta)} years earlier (Age ${scenario.fiAge}).`
          : `Delays Financial Independence by ${fiAgeDelta} years.`,
        type: 'outcome',
      });
    } else if (scenarioDef.type === 'buy_house') {
      const cost = scenarioDef.parameters.houseCost ?? 8000000;
      const downPayment = cost * 0.2;
      whyExplanation.push({
        title: `${formatINR(downPayment)} Down Payment Deployment`,
        description: `Initial capital redeployed from liquid investments (equity/debt) into real estate equity.`,
        type: 'negative',
      });
      whyExplanation.push({
        title: `Home Loan EMI Commitment`,
        description: `Monthly cash flow diverted to service principal and interest amortizations.`,
        type: 'negative',
      });
      whyExplanation.push({
        title: `Real Estate Appreciation (~6% p.a.)`,
        description: `Physical asset value compounds over decades as a foundational family anchor.`,
        type: 'positive',
      });
      whyExplanation.push({
        title: `Net Worth @ 50: ${formatINR(scenario.wealthAt50)}`,
        description: `Shifted from pure liquid stocks to mixed real estate + equity portfolio.`,
        type: 'outcome',
      });
    } else if (scenarioDef.type === 'job_loss' || scenarioDef.type === 'career_break') {
      const duration = scenarioDef.parameters.months ?? (scenarioDef.parameters.durationYears ? scenarioDef.parameters.durationYears * 12 : 6);
      whyExplanation.push({
        title: `${duration} Months of Zero Salary Inflow`,
        description: `Living expenses are temporarily serviced directly from liquid emergency cash & debt buffers.`,
        type: 'negative',
      });
      whyExplanation.push({
        title: `Compounding Interruption`,
        description: `Pause in new SIP contributions reduces late-stage exponential terminal wealth.`,
        type: 'negative',
      });
      whyExplanation.push({
        title: `Emergency Fund Resilience`,
        description: `Your emergency reserves prevent distressed fire-sales of equity holdings.`,
        type: 'positive',
      });
      whyExplanation.push({
        title: `FI Timeline Impact: ${fiAgeDelta > 0 ? `+${fiAgeDelta} yrs` : 'Protected'}`,
        description: `Calculated recovery window before your original compounding trajectory resumes.`,
        type: 'outcome',
      });
    } else {
      // Generic explanation
      whyExplanation.push({
        title: `Cash Flow & Allocation Adjustment`,
        description: `Modifications in cash flows impact capital accumulation velocity.`,
        type: 'neutral',
      });
      whyExplanation.push({
        title: `Compounded Asset Return Rate`,
        description: `Long-term difference between asset yields and living cost inflation.`,
        type: 'neutral',
      });
      whyExplanation.push({
        title: `Milestone Projection @ 50: ${formatINR(scenario.wealthAt50)}`,
        description: `Net delta of ${formatINR(wealth50Delta, { showSign: true })} compared to baseline.`,
        type: 'outcome',
      });
    }
  }

  let summaryHeadline = '';
  let summarySubtext = '';
  if (wealth50Delta > 0) {
    summaryHeadline = `${formatINR(wealth50Delta, { showSign: true })} Projected Additional Wealth`;
    summarySubtext = fiAgeDelta < 0 
      ? `Potentially achieves Financial Independence ${Math.abs(fiAgeDelta)} years earlier (Age ${scenario.fiAge}).`
      : `Strengthens your retirement nest egg significantly.`;
  } else if (wealth50Delta < 0) {
    summaryHeadline = `${formatINR(wealth50Delta)} Impact on Projected Wealth @ 50`;
    summarySubtext = fiAgeDelta > 0
      ? `May shift Financial Independence target by +${fiAgeDelta} years to age ${scenario.fiAge}.`
      : `Requires planning to sustain your desired retirement lifestyle.`;
  } else {
    summaryHeadline = `Neutral Projected Impact`;
    summarySubtext = `Your overall timeline and wealth trajectories remain stable.`;
  }

  return {
    baseline,
    scenario,
    deltas: {
      monthlyInvestmentDelta: (scenario.timeline[0]?.sip ?? 0) - (baseline.timeline[0]?.sip ?? 0),
      wealthAt40Delta: scenario.wealthAt40 - baseline.wealthAt40,
      wealthAt50Delta: wealth50Delta,
      wealthAt60Delta: scenario.wealthAt60 - baseline.wealthAt60,
      wealthAtRetirementDelta: scenario.wealthAtRetirement - baseline.wealthAtRetirement,
      fiAgeDelta: fiAgeDelta,
      capitalInvestedDelta: capitalDelta,
      totalGainsDelta: gainsDelta,
    },
    whyExplanation,
    summaryHeadline,
    summarySubtext,
  };
}

/**
 * Solve Reverse "What If?": "I want ₹Target by age TargetAge. What should I do?"
 */
export function solveReverseWhatIf(
  profile: FinancialProfile,
  assumptions: FinancialAssumptions,
  targetCorpus: number = 50000000, // ₹5 Cr
  targetAge: number = 50
): ReverseWhatIfPath[] {
  const years = Math.max(1, targetAge - profile.age);
  const currentInvestments = profile.equityValue + profile.debtValue + profile.goldValue + profile.cashValue;
  
  // Future value of current investments at weighted ~10.5% return
  const blendedRate = 0.105;
  const fvCurrent = currentInvestments * Math.pow(1 + blendedRate, years);
  const gap = Math.max(0, targetCorpus - fvCurrent);

  // Path 1: Fixed monthly SIP required
  const monthlyRate = blendedRate / 12;
  const numMonths = years * 12;
  const sipFactor = (Math.pow(1 + monthlyRate, numMonths) - 1) / monthlyRate;
  const requiredFixedSip = Math.round(gap / sipFactor);

  // Path 2: Step-up SIP (starts lower, increases 10% annually)
  const requiredStepUpSip = Math.round(requiredFixedSip * 0.68);

  // Path 3: Modest SIP + Annual Lump-sum bonus
  const modestSip = Math.max(25000, profile.monthlySip);
  const fvModestSip = modestSip * sipFactor;
  const lumpGap = Math.max(0, gap - fvModestSip);
  const annualFactor = (Math.pow(1 + blendedRate, years) - 1) / blendedRate;
  const requiredAnnualBonus = Math.round(lumpGap / annualFactor);

  // Path 4: Aggressive Equity Tilt (12.5% return)
  const aggressiveRate = 0.125;
  const aggMonthlyRate = aggressiveRate / 12;
  const aggSipFactor = (Math.pow(1 + aggMonthlyRate, numMonths) - 1) / aggMonthlyRate;
  const fvAggCurrent = currentInvestments * Math.pow(1 + aggressiveRate, years);
  const aggGap = Math.max(0, targetCorpus - fvAggCurrent);
  const requiredAggSip = Math.round(aggGap / aggSipFactor);

  return [
    {
      id: 'path-fixed-sip',
      title: 'Direct Monthly SIP',
      badge: 'Most Direct',
      description: 'Maintain a disciplined, unwavering monthly SIP in diversified mutual funds.',
      primaryAction: 'Monthly SIP',
      primaryValue: `${formatINR(requiredFixedSip)}/month`,
      secondaryDetails: [
        `Starts immediately at age ${profile.age}`,
        `No step-up required; constant discipline`,
        `Assumes standard 60:40 balanced portfolio returns (~10.5% p.a.)`,
      ],
      estimatedProbability: 88,
      effortLevel: 'Disciplined',
    },
    {
      id: 'path-step-up',
      title: 'Annual Step-Up SIP (10%)',
      badge: 'Most Realistic',
      description: 'Start with a lighter monthly burden today and scale contributions with career salary hikes.',
      primaryAction: 'Start at',
      primaryValue: `${formatINR(requiredStepUpSip)}/mo + 10% YoY`,
      secondaryDetails: [
        `Lower initial friction today (${formatINR(requiredStepUpSip)}/mo vs ${formatINR(requiredFixedSip)}/mo)`,
        `Matches your expected 8-10% annual salary growth`,
        `Comfortably cushions early lifestyle expenses`,
      ],
      estimatedProbability: 92,
      effortLevel: 'Moderate',
    },
    {
      id: 'path-bonus-lump',
      title: 'Baseline SIP + Annual Lump Sum',
      badge: 'Flexible Cash Flow',
      description: 'Keep regular monthly deductions easy and direct annual work bonuses or dividends toward the goal.',
      primaryAction: 'SIP + Yearly Bonus',
      primaryValue: `${formatINR(modestSip)}/mo + ${formatINR(requiredAnnualBonus)}/yr`,
      secondaryDetails: [
        `Predictable monthly living cash flow`,
        `Utilizes Diwali/appraisal performance incentives`,
        `High flexibility during lean quarters`,
      ],
      estimatedProbability: 84,
      effortLevel: 'Balanced',
    },
    {
      id: 'path-aggressive-tilt',
      title: 'Aggressive Allocation (75% Equity)',
      badge: 'High Alpha',
      description: 'Tilt asset allocation aggressively toward high-growth equities to lower the required monthly savings.',
      primaryAction: 'Aggressive SIP',
      primaryValue: `${formatINR(requiredAggSip)}/month`,
      secondaryDetails: [
        `Lower monthly cash outflow needed due to higher return velocity (~12.5% p.a.)`,
        `Higher short-term portfolio volatility`,
        `Ideal for investors with 10+ year time horizons`,
      ],
      estimatedProbability: 79,
      effortLevel: 'Aggressive',
    },
  ];
}

/**
 * Run Life Shock Stress Test Suite
 */
export function runLifeShockScenarios(profile: FinancialProfile): LifeShockResult[] {
  const monthlyExpenses = profile.monthlyExpenses + profile.homeLoanEmi + profile.carLoanEmi;
  const liquidReserves = profile.cashValue + profile.debtValue;
  const runwayMonths = Math.round(liquidReserves / (monthlyExpenses || 1));

  return [
    {
      id: 'shock-income-drop',
      title: 'Income Drops 30% for 12 Months',
      prompt: 'What if industry headwinds or a temporary restructuring cuts your salary by 30% for 1 full year?',
      icon: 'Briefcase',
      severity: 'medium',
      emergencyFundMonths: runwayMonths,
      retirementImpactYears: 1.2,
      netWorthLoss: 540000,
      recoveryTimeYears: 1.8,
      keyMitigations: [
        'Pause voluntary discretionary spending temporarily',
        'Redirect savings into liquidity buffers',
        'Avoid breaking long-term equity mutual funds',
      ],
    },
    {
      id: 'shock-medical-emergency',
      title: 'Unexpected Medical/Family Expense (₹10L)',
      prompt: 'What if an urgent family medical expense requires ₹10,00,000 out-of-pocket payment at age 38?',
      icon: 'HeartPulse',
      severity: 'high',
      emergencyFundMonths: Math.max(1, runwayMonths - 6),
      retirementImpactYears: 1.5,
      netWorthLoss: 1000000,
      recoveryTimeYears: 2.3,
      keyMitigations: [
        'Ensure comprehensive Super Top-Up Health Insurance (₹50L+ cover)',
        'Maintain a dedicated ₹5L separate emergency liquid mutual fund',
        'Protect term insurance coverage',
      ],
    },
    {
      id: 'shock-market-crash',
      title: 'Severe Market Crash (-30%)',
      prompt: 'What if a global liquidity crisis drops equity markets by 30% right when you turn 35?',
      icon: 'TrendingDown',
      severity: 'medium',
      emergencyFundMonths: runwayMonths,
      retirementImpactYears: 0.8,
      netWorthLoss: Math.round(profile.equityValue * 0.3),
      recoveryTimeYears: 2.1,
      keyMitigations: [
        'Never panic sell units during drawdown cycles',
        'Continue SIP uninterrupted to average unit costs down',
        'Rebalance debt gains into discounted equity',
      ],
    },
    {
      id: 'shock-career-break',
      title: '2-Year Sabbatical / Startup Attempt',
      prompt: 'What if you step away from corporate employment for 24 months to explore a venture or study?',
      icon: 'Compass',
      severity: 'critical',
      emergencyFundMonths: Math.max(0, runwayMonths - 18),
      retirementImpactYears: 2.9,
      netWorthLoss: 1800000,
      recoveryTimeYears: 3.5,
      keyMitigations: [
        'Pre-fund 2 full years of living costs in low-risk Arbitrage/Debt funds',
        'Keep minimal recurring EMIs or clear car loans prior to break',
        'Monetize consulting side-gigs',
      ],
    },
  ];
}
