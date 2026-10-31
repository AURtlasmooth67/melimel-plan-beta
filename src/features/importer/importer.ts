/**
 * JSON Importer with Dry-Run validation for legacy Melimel content-planner.html exports
 */
import { Song, ColumnKind } from '../scheduler/scheduler';

export interface LegacyExportData {
  songs?: any[];
  plan?: Record<string, string[]>;
  members?: any[];
  people?: any[];
  kanbanColumns?: any[];
  kCols?: any[];
  dl?: any[];
  tickets?: any[];
}

export interface DryRunReport {
  isValid: boolean;
  songCount: number;
  planDateCount: number;
  memberCount: number;
  newSongs: number;
  duplicateTitles: string[];
  warnings: string[];
  parsedSongs: Song[];
  parsedPlan: Record<string, string[]>;
}

export function dryRunImport(jsonString: string, currentSongs: Song[]): DryRunReport {
  const warnings: string[] = [];
  const duplicateTitles: string[] = [];

  let data: LegacyExportData;
  try {
    data = JSON.parse(jsonString);
  } catch (err: any) {
    return {
      isValid: false,
      songCount: 0,
      planDateCount: 0,
      memberCount: 0,
      newSongs: 0,
      duplicateTitles: [],
      warnings: ['ไฟล์ไม่ใช่รูปแบบ JSON ที่ถูกต้อง: ' + err.message],
      parsedSongs: [],
      parsedPlan: {}
    };
  }

  const rawSongs = data.songs || [];
  const rawPlan = data.plan || {};
  const rawMembers = data.members || data.people || [];

  const existingTitles = new Set(currentSongs.map(s => s.title.trim().toLowerCase()));
  const parsedSongs: Song[] = [];

  rawSongs.forEach((item, index) => {
    if (!item.title) {
      warnings.push(`รายการที่ ${index + 1} ไม่มีชื่อเพลง (ข้ามรายการนี้)`);
      return;
    }

    const title = String(item.title).trim();
    if (existingTitles.has(title.toLowerCase())) {
      duplicateTitles.push(title);
    }

    // Determine makers / singers
    let singers: string[] = [];
    if (Array.isArray(item.singers)) {
      singers = item.singers;
    } else if (Array.isArray(item.makers)) {
      singers = item.makers;
    } else if (item.channel && item.channel !== 'all' && item.channel !== 'main') {
      singers = [item.channel];
    } else {
      singers = ['ราคุ'];
    }

    // Map kind
    let kind: ColumnKind = 'todo';
    const statusStr = String(item.status || item.kind || '').toLowerCase();
    if (statusStr.includes('rec') || statusStr.includes('อัด')) {
      kind = 'recording';
    } else if (statusStr.includes('post') || statusStr.includes('mix') || statusStr.includes('มิกซ์') || statusStr.includes('ตัดต่อ')) {
      kind = 'post-recording';
    } else if (statusStr.includes('done') || statusStr.includes('โพส') || statusStr.includes('เสร็จ')) {
      kind = 'done';
    }

    parsedSongs.push({
      id: item.id || `imported-${Date.now()}-${index}`,
      title,
      singers,
      type: item.type === 'duet' || item.type === 'group' ? item.type : 'solo',
      kind,
      recordDate: item.recordDate || item.rec || undefined,
      releaseDate: item.releaseDate || item.post || undefined,
      channel: item.channel || 'main',
      tags: Array.isArray(item.tags) ? item.tags : []
    });
  });

  const parsedPlan: Record<string, string[]> = {};
  Object.entries(rawPlan).forEach(([date, ids]) => {
    if (Array.isArray(ids)) {
      parsedPlan[date] = ids.map(String);
    }
  });

  return {
    isValid: true,
    songCount: parsedSongs.length,
    planDateCount: Object.keys(parsedPlan).length,
    memberCount: rawMembers.length,
    newSongs: parsedSongs.length - duplicateTitles.length,
    duplicateTitles,
    warnings,
    parsedSongs,
    parsedPlan
  };
}
