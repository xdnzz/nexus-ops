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

function pad(value: number, size = 2) {
  return String(value).padStart(size, '0');
}

export function formatClockTime(timestamp: number) {
  const date = new Date(timestamp);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

export function formatPlainAmount(amount: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactUsd(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

export function shortenAccount(value: string) {
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}
