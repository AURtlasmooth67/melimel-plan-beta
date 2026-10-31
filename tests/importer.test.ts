import { describe, it, expect } from 'vitest';
import { dryRunImport } from '../src/features/importer/importer';
import { Song } from '../src/features/scheduler/scheduler';

describe('Legacy JSON Importer with Dry-Run', () => {
  it('correctly reports invalid JSON format without throwing', () => {
    const report = dryRunImport('{ bad json }', []);
    expect(report.isValid).toBe(false);
    expect(report.warnings.length).toBeGreaterThan(0);
  });

  it('performs dry-run with duplicate detection and status kind mapping', () => {
    const currentSongs: Song[] = [
      { id: '1', title: 'Song Exists', singers: ['ราคุ'], type: 'solo', kind: 'todo' }
    ];

    const mockExport = JSON.stringify({
      songs: [
        { title: 'Song Exists', status: 'done', singers: ['ราคุ'] },
        { title: 'New Song', status: 'กำลังอัด', makers: ['โบ'] }
      ],
      plan: {
        '2026-10-15': ['1']
      }
    });

    const report = dryRunImport(mockExport, currentSongs);
    expect(report.isValid).toBe(true);
    expect(report.songCount).toBe(2);
    expect(report.duplicateTitles).toContain('Song Exists');
    expect(report.newSongs).toBe(1);
    expect(report.parsedSongs[0].kind).toBe('done');
    expect(report.parsedSongs[1].kind).toBe('recording');
    expect(report.planDateCount).toBe(1);
  });
});
