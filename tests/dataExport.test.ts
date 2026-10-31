import { describe, it, expect } from 'vitest';
import { exportToJSON, exportSongsToCSV, exportCalendarToICS } from '../src/features/exporter/dataExport';
import { AppState } from '../src/core/store';

describe('Data Export Utility (JSON, CSV, ICS)', () => {
  const mockState = {
    songs: [
      { id: 's1', title: 'Song 1', singers: ['ราคุ'], type: 'solo', kind: 'todo', tags: ['Vocaloid'] }
    ],
    calendar: {
      '2026-10-15': ['s1']
    },
    columns: [],
    members: [],
    tickets: [],
    bigJobs: [],
    goals: [],
    weekTemplate: {},
    theme: 'light',
    reducedMotion: false,
    activeTab: 'today',
    teamBgUrl: ''
  } as unknown as AppState;

  it('exports valid JSON payload', () => {
    const jsonStr = exportToJSON(mockState);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.songs.length).toBe(1);
    expect(parsed.plan['2026-10-15']).toContain('s1');
  });

  it('exports standard CSV format with headers and quotes', () => {
    const csv = exportSongsToCSV(mockState);
    expect(csv).toContain('ID,ชื่อเพลง,ผู้ทำ,ประเภท,สถานะ,วันอัด,วันลง,แท็ก');
    expect(csv).toContain('"Song 1"');
    expect(csv).toContain('"ราคุ"');
  });

  it('generates standard iCalendar (ICS) structure', () => {
    const ics = exportCalendarToICS(mockState);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('DTSTART;VALUE=DATE:20261015');
    expect(ics).toContain('SUMMARY:🎬 Song 1 (ราคุ)');
    expect(ics).toContain('END:VCALENDAR');
  });
});
