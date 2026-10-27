export type RiskTone = 'high' | 'medium' | 'low';

export function riskTone(score: number): RiskTone {
  if (score >= 75) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export const RISK_TEXT_CLASS: Record<RiskTone, string> = {
  high: 'text-rose-600 font-semibold dark:text-rose-400',
  medium: 'text-amber-600 dark:text-amber-400',
  low: 'text-emerald-600 dark:text-emerald-400',
};

export const RISK_BAR_CLASS: Record<RiskTone, string> = {
  high: 'bg-rose-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
};

export function formatMoney(
  amount: number,
  currency: string,
  maximumFractionDigits?: number,
) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    ...(maximumFractionDigits === undefined ? {} : { maximumFractionDigits }),
  }).format(amount);
}

export function formatClockTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}
