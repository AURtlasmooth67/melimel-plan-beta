/**
 * Calendar Clear & Atomic Undo Manager
 * Preserves other collaborative additions made in the background
 */
export interface ClearScopeOptions {
  startDate: string; // ISO string
  endDate: string; // ISO string
  personFilter?: string; // Optional filter
}

export interface ClearResult {
  clearedEntries: Array<{ date: string; songId: string }>;
  newCalendar: Record<string, string[]>;
}

export function clearCalendarRange(
  calendar: Record<string, string[]>,
  songs: Array<{ id: string; singers: string[] }>,
  options: ClearScopeOptions
): ClearResult {
  const { startDate, endDate, personFilter } = options;
  const clearedEntries: Array<{ date: string; songId: string }> = [];
  const newCalendar: Record<string, string[]> = {};

  Object.entries(calendar).forEach(([date, ids]) => {
    if (date < startDate || date > endDate) {
      newCalendar[date] = [...ids];
      return;
    }

    const remaining: string[] = [];
    ids.forEach(sid => {
      if (personFilter) {
        const song = songs.find(s => s.id === sid);
        const matchesPerson = song && song.singers.includes(personFilter);
        if (matchesPerson) {
          clearedEntries.push({ date, songId: sid });
        } else {
          remaining.push(sid);
        }
      } else {
        clearedEntries.push({ date, songId: sid });
      }
    });

    if (remaining.length > 0) {
      newCalendar[date] = remaining;
    }
  });

  return { clearedEntries, newCalendar };
}

export function undoClearCalendar(
  currentCalendar: Record<string, string[]>,
  deletedEntries: Array<{ date: string; songId: string }>
): Record<string, string[]> {
  const restored: Record<string, string[]> = {};

  // Copy current calendar (to avoid overwriting newly added songs by teammates)
  Object.entries(currentCalendar).forEach(([date, ids]) => {
    restored[date] = [...ids];
  });

  // Re-inject only the specific deleted entries
  deletedEntries.forEach(({ date, songId }) => {
    if (!restored[date]) {
      restored[date] = [];
    }
    if (!restored[date].includes(songId)) {
      restored[date].push(songId);
    }
  });

  return restored;
}
