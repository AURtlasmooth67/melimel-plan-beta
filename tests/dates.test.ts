import { describe, it, expect } from 'vitest';
import { formatThaiDate, addDays, isWeekend, getDaysInRange } from '../src/core/dates';

describe('Date Utilities (ค.ศ. & พ.ศ.)', () => {
  it('formats dates in Buddhist Era (พ.ศ.) and Gregorian (ค.ศ.)', () => {
    const iso = '2026-10-12';
    expect(formatThaiDate(iso, true)).toBe('12 ต.ค. 2569');
    expect(formatThaiDate(iso, false)).toBe('12 ต.ค. 2026');
  });

  it('correctly calculates day offsets and leap days', () => {
    expect(addDays('2026-10-09', 3)).toBe('2026-10-12');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('identifies weekends correctly', () => {
    // 2026-10-09 is Friday, 2026-10-10 is Saturday, 2026-10-11 is Sunday
    expect(isWeekend('2026-10-09')).toBe(false);
    expect(isWeekend('2026-10-10')).toBe(true);
    expect(isWeekend('2026-10-11')).toBe(true);
    expect(isWeekend('2026-10-12')).toBe(false);
  });

  it('generates date ranges skipping weekends when requested', () => {
    const days = getDaysInRange('2026-10-09', 4, true);
    // Friday (9), skip Sat(10) & Sun(11), Mon (12), Tue (13), Wed (14)
    expect(days).toEqual(['2026-10-09', '2026-10-12', '2026-10-13', '2026-10-14']);
  });
});
