/**
 * Data Exporter supporting JSON, CSV and iCalendar (.ics)
 */
import { AppState } from '../../core/store';

export function exportToJSON(state: AppState): string {
  const exportPayload = {
    version: '2.0.0-beta',
    exportedAt: new Date().toISOString(),
    songs: state.songs,
    plan: state.calendar,
    columns: state.columns,
    members: state.members,
    tickets: state.tickets,
    bigJobs: state.bigJobs,
    goals: state.goals,
    weekTemplate: state.weekTemplate
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function exportSongsToCSV(state: AppState): string {
  const headers = ['ID', 'ชื่อเพลง', 'ผู้ทำ', 'ประเภท', 'สถานะ', 'วันอัด', 'วันลง', 'แท็ก'];
  const rows = state.songs.map(s => [
    `"${s.id}"`,
    `"${(s.title || '').replace(/"/g, '""')}"`,
    `"${s.singers.join(', ')}"`,
    `"${s.type}"`,
    `"${s.kind}"`,
    `"${s.recordDate || ''}"`,
    `"${s.releaseDate || ''}"`,
    `"${(s.tags || []).join(', ')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function exportCalendarToICS(state: AppState): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MELiMEL FRUITY//Content Planner BETA//TH',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:MELiMEL Content Schedule'
  ];

  Object.entries(state.calendar).forEach(([dateIso, songIds]) => {
    songIds.forEach(sid => {
      const song = state.songs.find(s => s.id === sid);
      const title = song ? song.title : 'เพลงคอนเทนต์';
      const singers = song ? song.singers.join(', ') : 'สมาชิก';

      // Date formatted as YYYYMMDD
      const dtDate = dateIso.replace(/-/g, '');

      lines.push(
        'BEGIN:VEVENT',
        `UID:${sid}-${dtDate}@melimel.beta`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART;VALUE=DATE:${dtDate}`,
        `SUMMARY:🎬 ${title} (${singers})`,
        `DESCRIPTION:ลงคลิปเพลง ${title} โดย ${singers}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
