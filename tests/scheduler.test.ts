import { describe, it, expect } from 'vitest';
import { autoSchedule, Song } from '../src/features/scheduler/scheduler';

describe('Auto Scheduler Specification Tests (Cases A - D)', () => {
  // Start date Friday 2026-10-09, skipWeekends = true
  const startDate = '2026-10-09';

  it('Case A: Solo songs 4 tracks for Raku, duration 28 days, cap 1, lag 3', () => {
    const songs: Song[] = [
      { id: 's1', title: 'Song 1', singers: ['ราคุ'], type: 'solo', kind: 'todo' },
      { id: 's2', title: 'Song 2', singers: ['ราคุ'], type: 'solo', kind: 'todo' },
      { id: 's3', title: 'Song 3', singers: ['ราคุ'], type: 'solo', kind: 'todo' },
      { id: 's4', title: 'Song 4', singers: ['ราคุ'], type: 'solo', kind: 'todo' },
    ];

    const result = autoSchedule(songs, {}, {
      person: 'ราคุ',
      startDate,
      durationDays: 28,
      capPerDay: 1,
      lagDays: 3,
      skipWeekends: true
    });

    expect(result.unscheduled.length).toBe(0);
    expect(result.scheduled.length).toBe(4);

    // Verify record -> release pairs (Friday 9 -> Monday 12, etc.)
    expect(result.scheduled[0].recordDate).toBe('2026-10-09');
    expect(result.scheduled[0].releaseDate).toBe('2026-10-12');

    expect(result.scheduled[1].recordDate).toBe('2026-10-16');
    expect(result.scheduled[1].releaseDate).toBe('2026-10-19');

    expect(result.scheduled[2].recordDate).toBe('2026-10-23');
    expect(result.scheduled[2].releaseDate).toBe('2026-10-26');

    expect(result.scheduled[3].recordDate).toBe('2026-10-30');
    expect(result.scheduled[3].releaseDate).toBe('2026-11-02');
  });

  it('Case B: Duet (Raku+Bo), Solo Raku, Solo Bo, duration 7 days, cap 1, lag 3', () => {
    const songs: Song[] = [
      { id: 'duet', title: 'Duet Song', singers: ['ราคุ', 'โบ'], type: 'duet', kind: 'todo' },
      { id: 'solo-raku', title: 'Raku Solo', singers: ['ราคุ'], type: 'solo', kind: 'todo' },
      { id: 'solo-bo', title: 'Bo Solo', singers: ['โบ'], type: 'solo', kind: 'todo' },
    ];

    const result = autoSchedule(songs, {}, {
      startDate,
      durationDays: 7,
      capPerDay: 1,
      lagDays: 3,
      skipWeekends: true
    });

    expect(result.scheduled.length).toBe(3);
    const duet = result.scheduled.find(s => s.songId === 'duet');
    const sRaku = result.scheduled.find(s => s.songId === 'solo-raku');
    const sBo = result.scheduled.find(s => s.songId === 'solo-bo');

    // Duet goes first: 9 Oct -> 12 Oct
    expect(duet?.recordDate).toBe('2026-10-09');
    expect(duet?.releaseDate).toBe('2026-10-12');

    // Solo Raku shifts to next available days without colliding with cap 1 on 12 Oct
    expect(sRaku?.recordDate).toBe('2026-10-13');
    expect(sRaku?.releaseDate).toBe('2026-10-16');

    // Solo Bo
    expect(sBo?.recordDate).toBe('2026-10-14');
    expect(sBo?.releaseDate).toBe('2026-10-19');
  });

  it('Case C: Song already has record date but initial release date is full -> shifts to next day', () => {
    const songs: Song[] = [
      { id: 's1', title: 'Existing Song', singers: ['ราคุ'], type: 'solo', kind: 'todo', recordDate: '2026-10-09' }
    ];
    // Calendar already has an event for Raku on 2026-10-12
    const existingCal = {
      '2026-10-12': ['other-song']
    };
    const otherSong: Song = { id: 'other-song', title: 'Other', singers: ['ราคุ'], type: 'solo', kind: 'recording' };

    const result = autoSchedule([...songs, otherSong], existingCal, {
      person: 'ราคุ',
      startDate,
      durationDays: 14,
      capPerDay: 1,
      lagDays: 3,
      skipWeekends: true
    });

    const s1 = result.scheduled.find(s => s.songId === 's1');
    expect(s1).toBeDefined();
    // 12 Oct was full (cap=1), so it must shift to 13 Oct
    expect(s1?.releaseDate).toBe('2026-10-13');
  });

  it('Case D: Post-recording without record date -> gets release date; cap 2 allows 2 items; no weekends in output', () => {
    const songs: Song[] = [
      { id: 'p1', title: 'Post 1', singers: ['ราคุ'], type: 'solo', kind: 'post-recording' },
      { id: 'p2', title: 'Post 2', singers: ['ราคุ'], type: 'solo', kind: 'post-recording' },
    ];

    const result = autoSchedule(songs, {}, {
      person: 'ราคุ',
      startDate,
      durationDays: 7,
      capPerDay: 2, // Allows 2 items on same day
      lagDays: 3,
      skipWeekends: true
    });

    expect(result.scheduled.length).toBe(2);
    // Both songs are scheduled (e.g. 9 Oct and 13 Oct spread across window) and respects cap <= 2
    expect(result.scheduled[0].releaseDate).toBeDefined();
    expect(result.scheduled[1].releaseDate).toBeDefined();

    // Ensure no weekend dates
    for (const item of result.scheduled) {
      const d = new Date(item.releaseDate);
      expect(d.getDay()).not.toBe(0); // not Sunday
      expect(d.getDay()).not.toBe(6); // not Saturday
    }
  });
});
