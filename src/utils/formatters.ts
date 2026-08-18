/**
 * Indian Rupee (INR) and financial formatting utilities
 */

export function formatINR(value: number, options?: { showSign?: boolean; decimals?: number }): string {
  if (value === undefined || value === null || isNaN(value)) return '₹0';
  
  const absVal = Math.abs(value);
  const sign = value < 0 ? '-' : (options?.showSign && value > 0 ? '+' : '');
  const decimals = options?.decimals ?? 2;

  // Crores (>= 1,00,00,000)
  if (absVal >= 10000000) {
    const cr = absVal / 10000000;
    const formatted = cr >= 10 ? cr.toFixed(1) : cr.toFixed(decimals);
    return `${sign}₹${formatted.replace(/\.00$/, '').replace(/\.0$/, '')} Cr`;
  }
  
  // Lakhs (>= 1,00,000)
  if (absVal >= 100000) {
    const lk = absVal / 100000;
    const formatted = lk >= 10 ? lk.toFixed(1) : lk.toFixed(decimals);
    return `${sign}₹${formatted.replace(/\.00$/, '').replace(/\.0$/, '')}L`;
  }

  // Thousands (>= 1,000)
  if (absVal >= 1000) {
    const k = absVal / 1000;
    const formatted = k >= 10 ? Math.round(k).toString() : k.toFixed(1);
    return `${sign}₹${formatted.replace(/\.0$/, '')}K`;
  }

  return `${sign}₹${Math.round(absVal).toLocaleString('en-IN')}`;
}

export function formatFullINR(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return '₹0';
  const sign = value < 0 ? '-' : '';
  const absVal = Math.round(Math.abs(value));
  return `${sign}₹${absVal.toLocaleString('en-IN')}`;
}

export function formatCompactINR(value: number): string {
  return formatINR(value, { decimals: 1 });
}

export function formatPercent(rate: number): string {
  if (rate === undefined || rate === null) return '0%';
  // rate can be 0.12 or 12
  const pct = rate <= 1 && rate > 0 ? rate * 100 : rate;
  return `${pct.toFixed(1).replace(/\.0$/, '')}%`;
}

export function formatAgeDelta(delta: number): string {
  if (delta === 0) return 'No change';
  if (delta < 0) return `${Math.abs(delta)} years earlier`;
  return `+${delta} years delayed`;
}

export function formatYears(val: number): string {
  if (val === 1) return '1 year';
  return `${val.toFixed(1).replace(/\.0$/, '')} years`;
}
