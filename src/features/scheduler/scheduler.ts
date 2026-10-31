/**
 * Pure functions for automatic scheduling / Routine according to specification.
 */
import { addDays, isWeekend } from '../../core/dates';

export type ColumnKind = 'todo' | 'recording' | 'post-recording' | 'done';

export interface Song {
  id: string;
  title: string;
  singers: string[]; // List of creator names / makers
  type: 'solo' | 'duet' | 'group';
  kind: ColumnKind;
  recordDate?: string; // YYYY-MM-DD
  releaseDate?: string; // YYYY-MM-DD
  channel?: string;
  tags?: string[];
  notes?: string;
}

export interface SchedulerOptions {
  person?: string; // Empty = everyone. Routine enforces 1 person.
  maxSongs?: number; // Empty = all pending songs
  startDate: string; // ISO string
  durationDays: number; // span
  capPerDay: number; // default 1
  lagDays: number; // calendar lag between record and release, default 3
  skipWeekends: boolean; // default true
  statusFilterKind?: ColumnKind;
}

export interface ScheduleResultItem {
  songId: string;
  title: string;
  singers: string[];
  recordDate?: string;
  releaseDate: string;
}

export interface ScheduleOutput {
  scheduled: ScheduleResultItem[];
  unscheduled: Array<{ song: Song; reason: string; tip: string }>;
}

export function autoSchedule(
  allSongs: Song[],
  existingCalendar: Record<string, string[]>, // date -> songIds
  options: SchedulerOptions
): ScheduleOutput {
  const {
    person,
    maxSongs,
    startDate,
    durationDays,
    capPerDay = 1,
    lagDays = 3,
    skipWeekends = true,
    statusFilterKind
  } = options;

  // 1. Qualifying songs
  let pool = allSongs.filter(s => {
    if (s.kind === 'done') return false;
    const alreadyScheduled = Object.values(existingCalendar).some(list => list.includes(s.id));
    if (alreadyScheduled) return false;
    if (person && !s.singers.includes(person)) return false;
    if (statusFilterKind && s.kind !== statusFilterKind) return false;
    return true;
  });

  // 2. Sort: non-solo (duet/group) before solo
  pool.sort((a, b) => (a.type === 'solo' ? 1 : 0) - (b.type === 'solo' ? 1 : 0));

  if (maxSongs && maxSongs > 0) {
    pool = pool.slice(0, maxSongs);
  }

  // 3. Days list: (span + lag + 7) days
  const totalDays = durationDays + lagDays + 7;
  const days: string[] = [];
  for (let i = 0; i < totalDays * 2; i++) {
    const d = addDays(startDate, i);
    if (skipWeekends && isWeekend(d)) continue;
    days.push(d);
    if (days.length >= totalDays) break;
  }

  // Tracking load: (person, date) -> count
  const load: Record<string, number> = {};
  const getLoad = (p: string, d: string): number => load[`${p}|${d}`] || 0;
  const incLoad = (p: string, d: string) => {
    load[`${p}|${d}`] = getLoad(p, d) + 1;
  };

  // Prepopulate load from existing calendar
  for (const [date, songIds] of Object.entries(existingCalendar)) {
    for (const sid of songIds) {
      const s = allSongs.find(item => item.id === sid);
      if (s) {
        for (const singer of s.singers) {
          incLoad(singer, date);
        }
      }
    }
  }

  const win = days.filter(d => d < addDays(startDate, durationDays));
  const scheduled: ScheduleResultItem[] = [];
  const unscheduled: Array<{ song: Song; reason: string; tip: string }> = [];

  pool.forEach((s, k) => {
    const singers = s.singers.length ? s.singers : (person ? [person] : ['default']);
    const startIdx = Math.min(
      Math.max(0, win.length - 1),
      Math.floor((k * win.length) / Math.max(1, pool.length))
    );
    let done = false;

    const hasPassedRec = s.kind === 'post-recording' || !!s.recordDate;

    for (let i = startIdx; i < days.length && !done; i++) {
      if (hasPassedRec) {
        // Find release date starting from base
        const base = s.recordDate ? addDays(s.recordDate, lagDays) : days[i];
        const minDate = base > days[i] ? base : days[i];

        // Search for the first day >= minDate that does not exceed cap
        const pd = days.find(d => {
          if (d < minDate) return false;
          if (skipWeekends && isWeekend(d)) return false;
          return singers.every(p => getLoad(p, d) < capPerDay);
        });

        if (!pd) continue;

        singers.forEach(p => incLoad(p, pd));
        scheduled.push({
          songId: s.id,
          title: s.title,
          singers: s.singers,
          recordDate: s.recordDate || '',
          releaseDate: pd
        });
        done = true;
      } else {
        // New song: pick record date at days[i]
        const rec = days[i];
        if (singers.some(p => getLoad(p, rec) >= capPerDay)) continue;

        const minPost = addDays(rec, lagDays);
        const pd = days.find(d => {
          if (d < minPost) return false;
          if (skipWeekends && isWeekend(d)) return false;
          return singers.every(p => getLoad(p, d) < capPerDay);
        });

        if (!pd) continue;

        singers.forEach(p => incLoad(p, rec));
        singers.forEach(p => incLoad(p, pd));
        scheduled.push({
          songId: s.id,
          title: s.title,
          singers: s.singers,
          recordDate: rec,
          releaseDate: pd
        });
        done = true;
      }
    }

    if (!done) {
      unscheduled.push({
        song: s,
        reason: 'ไม่พบช่วงวันที่ภาระงานของทีมต่ำกว่าเพดาน',
        tip: 'ลองเพิ่มช่วงเวลา (สัปดาห์) หรือเพิ่มจำนวนงานสูงสุดต่อคนต่อวัน'
      });
    }
  });

  return { scheduled, unscheduled };
}
