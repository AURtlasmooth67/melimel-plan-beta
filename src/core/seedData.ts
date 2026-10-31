export interface SeedData {
  members: Array<{ email: string; name: string; role: 'admin' | 'member'; color: string }>;
  columns: Array<{ id: string; name: string; kind: 'todo' | 'recording' | 'post-recording' | 'done'; color: string; order: number }>;
  songs: Array<{ id: string; title: string; singers: string[]; type: 'solo' | 'duet' | 'group'; kind: string; recordDate?: string; releaseDate?: string; channel: string; tags: string[] }>;
  plan: Record<string, string[]>;
}

export const SEED_DATA: SeedData = {
  members: [
    { email: 'poopo7096@gmail.com', name: 'ราคุ (แอดมิน)', role: 'admin', color: '#ff5c8a' },
    { email: 'bo-member@melimel.mock', name: 'โบ', role: 'member', color: '#14b8a6' },
    { email: 'pocky-member@melimel.mock', name: 'ป๊อกกี้', role: 'member', color: '#8b5cf6' }
  ],
  columns: [
    { id: 'col-todo', name: 'ยังไม่ทำ / ซ้อม', kind: 'todo', color: '#64748b', order: 1 },
    { id: 'col-rec', name: 'กำลังอัดเสียง', kind: 'recording', color: '#d97706', order: 2 },
    { id: 'col-post', name: 'มิกซ์ / ตัดต่อ', kind: 'post-recording', color: '#2563eb', order: 3 },
    { id: 'col-done', name: 'โพสต์แล้ว', kind: 'done', color: '#059669', order: 4 }
  ],
  songs: [
    {
      id: 'song-seed-1',
      title: 'ヴァンパイア (Vampire)',
      singers: ['ราคุ (แอดมิน)'],
      type: 'solo',
      kind: 'recording',
      recordDate: '2026-10-12',
      releaseDate: '2026-10-15',
      channel: 'main',
      tags: ['Vocaloid', 'Cover']
    },
    {
      id: 'song-seed-2',
      title: 'アイドル (Idol)',
      singers: ['ราคุ (แอดมิน)', 'โบ'],
      type: 'duet',
      kind: 'post-recording',
      recordDate: '2026-10-09',
      releaseDate: '2026-10-13',
      channel: 'all',
      tags: ['Anime', 'J-Pop']
    },
    {
      id: 'song-seed-3',
      title: 'フォニイ (Phony)',
      singers: ['โบ'],
      type: 'solo',
      kind: 'todo',
      channel: 'bo',
      tags: ['Solo', 'Fast']
    },
    {
      id: 'song-seed-4',
      title: '強風オールバック',
      singers: ['ป๊อกกี้'],
      type: 'solo',
      kind: 'done',
      recordDate: '2026-10-01',
      releaseDate: '2026-10-05',
      channel: 'pocky',
      tags: ['Meme', 'Fun']
    }
  ],
  plan: {
    '2026-10-12': ['song-seed-1'],
    '2026-10-13': ['song-seed-2'],
    '2026-10-05': ['song-seed-4']
  }
};
