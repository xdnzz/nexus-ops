import { describe, expect, it } from 'vitest';
import {
  formatClockTime,
  formatCompactUsd,
  formatMoney,
  formatPlainAmount,
  riskTone,
  shortenAccount,
} from '@/lib/format';

describe('format', () => {
  it('classifies risk scores at the tone boundaries', () => {
    expect(riskTone(39)).toBe('low');
    expect(riskTone(40)).toBe('medium');
    expect(riskTone(74)).toBe('medium');
    expect(riskTone(75)).toBe('high');
  });

  it('formats money, plain amounts, and compact USD', () => {
    expect(formatMoney(12480, 'USD')).toBe('$12,480.00');
    expect(formatMoney(10, 'EUR')).toBe('€10.00');
    expect(formatMoney(10.4, 'USD', 0)).toBe('$10');
    expect(formatPlainAmount(12480)).toBe('12,480.00');
    expect(formatCompactUsd(1500)).toBe('$1.5K');
    expect(formatCompactUsd(1_250_000)).toBe('$1.3M');
  });

  it('formats the clock from the local time fields', () => {
    expect(formatClockTime(Date.UTC(2026, 9, 27, 18, 0, 0, 5))).toBe('18:00:00.005');
  });

  it('keeps short accounts and ellipsizes the middle of long ones', () => {
    expect(shortenAccount('abcdefghijkl')).toBe('abcdefghijkl');
    expect(shortenAccount('abcdefghijklm')).toBe('abcdef…jklm');
    expect(shortenAccount('acc_orig_0000')).toBe('acc_or…0000');
  });
});
