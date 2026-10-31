/**
 * Central State Store for MELiMEL Plan BETA (Full Legacy Feature Equivalence)
 */
import { SEED_DATA } from './seedData';
import { Song, ColumnKind } from '../features/scheduler/scheduler';

export interface KanbanColumn {
  id: string;
  name: string;
  kind: ColumnKind;
  color: string;
  order: number;
}

export interface Member {
  email: string;
  name: string;
  role: 'admin' | 'member';
  color: string;
}

export interface Ticket {
  id: string;
  title: string;
  desc?: string;
  assignees: string[]; // member names
  priority: 0 | 1 | 2; // 0=ปกติ, 1=ด่วน, 2=ด่วนมาก
  dueDate?: string; // YYYY-MM-DD
  status: 0 | 1 | 2 | 3; // 0=รอรับ, 1=กำลังทำ, 2=รอตรวจ, 3=เสร็จแล้ว
  songId?: string;
  comments?: Array<{ author: string; text: string; date: string }>;
  updatedAt: string;
}

export interface BigJobStep {
  label: string;
  weeksBefore: number;
}

export interface BigJob {
  id: string;
  title: string;
  note?: string;
  channel: string;
  date: string; // YYYY-MM-DD
  color?: string;
  steps?: BigJobStep[];
}

export interface WeekTemplateDay {
  type: string;
  idea?: string;
}

export interface GoalRecord {
  id: string;
  title: string;
  targetSubs: number;
  currentSubs: number;
  history?: Array<{ date: string; subs: number }>;
}

export interface ContentScript {
  id: string;
  title: string;
  content: string;
  linkedSongId?: string;
  updatedAt: string;
}

export interface ActivityLogItem {
  timestamp: string;
  author: string;
  type: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

export interface YouTubeStats {
  views: number;
  likes: number;
  comments: number;
  updatedAt: number;
}

export interface CalendarClearUndoState {
  deletedEntries: Array<{ date: string; songId: string }>;
  timestamp: number;
}

export interface AppState {
  songs: Song[];
  calendar: Record<string, string[]>; // date -> songIds
  columns: KanbanColumn[];
  members: Member[];
  tickets: Ticket[];
  bigJobs: BigJob[];
  weekTemplate: Record<string, Record<string, WeekTemplateDay>>;
  goals: GoalRecord[];
  scripts: ContentScript[];
  logs: ActivityLogItem[];
  ytKey: string;
  ytViews: Record<string, YouTubeStats>; // songId -> stats
  discordWebhook: string;
  theme: 'light' | 'dark';
  reducedMotion: boolean;
  activeTab: 'today' | 'songs' | 'calendar' | 'kanban' | 'tickets' | 'team-tools' | 'scripts' | 'more' | 'dev-ui' | 'image-editor';
  teamBgUrl: string;
  lastCalendarUndo?: CalendarClearUndoState | null;
}

const STORAGE_KEY = 'melimel_beta_state_full_v1';

function loadInitialState(): AppState {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
  }

  return {
    songs: JSON.parse(JSON.stringify(SEED_DATA.songs)) as Song[],
    calendar: JSON.parse(JSON.stringify(SEED_DATA.plan)),
    columns: JSON.parse(JSON.stringify(SEED_DATA.columns)) as KanbanColumn[],
    members: JSON.parse(JSON.stringify(SEED_DATA.members)) as Member[],
    tickets: [
      {
        id: 'ticket-1',
        title: 'มิกซ์เสียงเพลง Vampire ท่อนฮุค',
        desc: 'ปรับเสียงร้องท่อนฮุคให้ใสขึ้น เพิ่ม reverb นิดหน่อย',
        assignees: ['โบ'],
        priority: 1,
        dueDate: '2026-10-15',
        status: 1,
        songId: 'song-seed-1',
        comments: [
          { author: 'ราคุ (แอดมิน)', text: 'ส่งสเตมให้แล้วในไดรฟ์ครับ', date: new Date().toISOString() }
        ],
        updatedAt: new Date().toISOString()
      }
    ],
    bigJobs: [
      {
        id: 'big-1',
        title: 'ฉลองครบรอบ 1 ปี MELiMEL FRUITY♡',
        note: 'สตรีมสด + ปล่อยเพลงพิเศษ 3 เพลงรวด',
        channel: 'main',
        date: '2026-11-20',
        color: '#ff5c8a',
        steps: [
          { label: 'อัดเสียงและส่งมิกซ์ครบทุกเพลง', weeksBefore: 3 },
          { label: 'ภาพประกอบ MV เสร็จสมบูรณ์', weeksBefore: 2 },
          { label: 'ตัดต่อคลิปและขึ้นสตรีมล่วงหน้า', weeksBefore: 1 }
        ]
      }
    ],
    weekTemplate: {
      'ราคุ (แอดมิน)': {
        'จันทร์': { type: 'อัดเพลงเดี่ยว', idea: 'Vocaloid / J-Pop' },
        'ศุกร์': { type: 'ลงคลิปหลัก', idea: 'ปล่อยเพลงสัปดาห์ละคลิป' }
      }
    },
    goals: [
      {
        id: 'goal-1',
        title: 'ยอดซับช่องหลัก',
        targetSubs: 10000,
        currentSubs: 6420,
        history: [
          { date: '2026-09-01', subs: 5200 },
          { date: '2026-10-01', subs: 6100 },
          { date: '2026-10-12', subs: 6420 }
        ]
      }
    ],
    scripts: [
      {
        id: 'script-1',
        title: 'สคริปต์เปิดคลิป Vampire',
        content: 'สวัสดีทุกคนค่า วันนี้พวกเรา MELiMEL มาร้องเพลง Vampire กันค่ะ ฝากกดซับด้วยน้า!',
        linkedSongId: 'song-seed-1',
        updatedAt: new Date().toISOString()
      }
    ],
    logs: [
      {
        timestamp: new Date().toISOString(),
        author: 'ระบบ',
        type: 'INFO',
        message: 'เริ่มต้นระบบตารางคอนเทนต์ MELiMEL FRUITY♡ BETA พร้อมฟีเจอร์ครบทุกส่วน'
      }
    ],
    ytKey: '',
    ytViews: {},
    discordWebhook: '',
    theme: (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light',
    reducedMotion: false,
    activeTab: 'today',
    teamBgUrl: '',
    lastCalendarUndo: null
  };
}

let state: AppState = loadInitialState();
const storeListeners: Array<(s: AppState) => void> = [];

export function getState(): AppState {
  return state;
}

export function setState(patch: Partial<AppState>): void {
  state = { ...state, ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('[Store] LocalStorage set failed:', e);
  }
  storeListeners.forEach(fn => fn(state));
}

export function logActivity(type: 'INFO' | 'WARN' | 'ERROR', message: string, author?: string): void {
  const currentAuthor = author || state.members[0]?.name || 'สมาชิก';
  const newLog: ActivityLogItem = {
    timestamp: new Date().toISOString(),
    author: currentAuthor,
    type,
    message
  };
  setState({ logs: [newLog, ...state.logs.slice(0, 199)] });
}

export function subscribeStore(listener: (s: AppState) => void): () => void {
  storeListeners.push(listener);
  listener(state);
  return () => {
    const idx = storeListeners.indexOf(listener);
    if (idx !== -1) storeListeners.splice(idx, 1);
  };
}

export function resetToSeedData(): void {
  setState({
    songs: JSON.parse(JSON.stringify(SEED_DATA.songs)),
    calendar: JSON.parse(JSON.stringify(SEED_DATA.plan)),
    columns: JSON.parse(JSON.stringify(SEED_DATA.columns)),
    members: JSON.parse(JSON.stringify(SEED_DATA.members)),
    lastCalendarUndo: null
  });
}
