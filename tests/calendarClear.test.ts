import { describe, it, expect } from 'vitest';
import { clearCalendarRange, undoClearCalendar } from '../src/features/calendar/calendarClear';

describe('Calendar Clear & Atomic Undo', () => {
  it('clears only within the specified range and person filter', () => {
    const calendar = {
      '2026-10-10': ['s1', 's2'],
      '2026-10-15': ['s1'],
      '2026-10-25': ['s1']
    };
    const songs = [
      { id: 's1', singers: ['ราคุ'] },
      { id: 's2', singers: ['โบ'] }
    ];

    // Clear range 10-20 Oct, only for Raku
    const result = clearCalendarRange(calendar, songs, {
      startDate: '2026-10-10',
      endDate: '2026-10-20',
      personFilter: 'ราคุ'
    });

    // 10 Oct: Raku cleared, Bo kept
    expect(result.newCalendar['2026-10-10']).toEqual(['s2']);
    // 15 Oct: Raku cleared (empty)
    expect(result.newCalendar['2026-10-15']).toBeUndefined();
    // 25 Oct: Outside range, kept
    expect(result.newCalendar['2026-10-25']).toEqual(['s1']);
    expect(result.clearedEntries.length).toBe(2);
  });

  it('restores only cleared entries without wiping concurrent teammate additions', () => {
    const clearedEntries = [
      { date: '2026-10-10', songId: 's1' }
    ];

    // Meanwhile, teammate added 's99' to 2026-10-10
    const concurrentCalendar = {
      '2026-10-10': ['s99']
    };

    const restored = undoClearCalendar(concurrentCalendar, clearedEntries);
    // Both s99 and s1 must be present!
    expect(restored['2026-10-10']).toContain('s99');
    expect(restored['2026-10-10']).toContain('s1');
  });
});
