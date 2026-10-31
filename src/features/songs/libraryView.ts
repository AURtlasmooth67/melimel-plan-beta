/**
 * Song Library View with Filters, Search, Statistics and Progressive Operations
 */
import { AppState, setState, getState } from '../../core/store';
import { openAddSongModal } from './addSongModal';
import { showToast } from '../../ui/toast';

export interface LibraryFilterState {
  searchQuery: string;
  kindFilter: string; // 'all' or ColumnKind
  makerFilter: string; // 'all' or creator name
  onlyUnscheduled: boolean;
}

let filterState: LibraryFilterState = {
  searchQuery: '',
  kindFilter: 'all',
  makerFilter: 'all',
  onlyUnscheduled: false
};

export function renderSongLibrary(state: AppState): string {
  // Check which songs are in the calendar
  const scheduledSongIds = new Set(Object.values(state.calendar).flat());

  // Filter songs
  const filtered = state.songs.filter(s => {
    if (filterState.searchQuery) {
      const q = filterState.searchQuery.toLowerCase();
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchTags = s.tags?.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchTags) return false;
    }

    if (filterState.kindFilter !== 'all' && s.kind !== filterState.kindFilter) {
      return false;
    }

    if (filterState.makerFilter !== 'all' && !s.singers.includes(filterState.makerFilter)) {
      return false;
    }

    if (filterState.onlyUnscheduled && scheduledSongIds.has(s.id)) {
      return false;
    }

    return true;
  });

  // Calculate statistics
  const totalCount = filtered.length;
  const unscheduledCount = filtered.filter(s => !scheduledSongIds.has(s.id)).length;
  const doneCount = filtered.filter(s => s.kind === 'done').length;

  return `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <!-- Top Action & Search Bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
        <div>
          <h2 style="font-size:1.3rem; font-weight:700;">คลังเพลง (Song Library)</h2>
          <p style="font-size:0.85rem; color:var(--text-muted);">จัดการเพลงของทีม ค้นหา และตรวจสอบสถานะ</p>
        </div>
        <button id="btn-add-song-lib" class="btn-solid-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>เพิ่มเพลงใหม่</span>
        </button>
      </div>

      <!-- Stats Bar with Animated Counter Impression -->
      <div class="glass-panel" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; padding:12px 16px; text-align:center;">
        <div>
          <div style="font-size:1.4rem; font-weight:800; color:var(--text-main);">${totalCount}</div>
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">เพลงตามตัวกรอง</div>
        </div>
        <div>
          <div style="font-size:1.4rem; font-weight:800; color:var(--color-primary-600);">${unscheduledCount}</div>
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">ยังไม่ลงตาราง</div>
        </div>
        <div>
          <div style="font-size:1.4rem; font-weight:800; color:#10b981;">${doneCount}</div>
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">โพสต์แล้ว</div>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="glass-panel" style="display:flex; flex-direction:column; gap:10px; padding:14px;">
        <div style="display:flex; gap:8px;">
          <input type="text" id="input-lib-search" value="${filterState.searchQuery}" placeholder="🔍 ค้นหาชื่อเพลง หรือแท็ก..." style="flex:1;">
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
          <select id="select-lib-maker" style="width:auto; flex:1; min-width:130px;">
            <option value="all" ${filterState.makerFilter === 'all' ? 'selected' : ''}>👤 ผู้ทำทุกคน</option>
            ${state.members.map(m => `<option value="${m.name}" ${filterState.makerFilter === m.name ? 'selected' : ''}>${m.name}</option>`).join('')}
          </select>

          <select id="select-lib-kind" style="width:auto; flex:1; min-width:130px;">
            <option value="all" ${filterState.kindFilter === 'all' ? 'selected' : ''}>📌 ทุกสถานะ</option>
            ${state.columns.map(c => `<option value="${c.kind}" ${filterState.kindFilter === c.kind ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>

          <button id="btn-toggle-unscheduled" class="btn-secondary" style="min-height:44px; padding:8px 12px; ${filterState.onlyUnscheduled ? 'border-color:var(--color-primary-500); color:var(--color-primary-600); font-weight:700;' : ''}">
            <span>${filterState.onlyUnscheduled ? '✓ กรองเฉพาะยังไม่ลงตาราง' : 'ยังไม่ลงตาราง'}</span>
          </button>
        </div>
      </div>

      <!-- Song List Items -->
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${filtered.length === 0 ? `
          <div class="glass-panel" style="text-align:center; padding:36px 16px;">
            <div style="font-size:2.5rem; margin-bottom:8px;">🎵</div>
            <div style="font-weight:700; margin-bottom:4px;">ไม่พบเพลงที่ตรงกับตัวกรอง</div>
            <p style="color:var(--text-muted); font-size:0.85rem;">ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรอง</p>
          </div>
        ` : filtered.map(song => {
          const isScheduled = scheduledSongIds.has(song.id);
          return `
            <div class="glass-panel" style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; gap:12px;">
              <div style="flex:1; min-width:0;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                  <span style="font-weight:700; font-size:0.95rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${song.title}</span>
                  <span style="font-size:0.7rem; padding:2px 6px; border-radius:4px; background:var(--surface-muted); color:var(--text-muted);">${song.type}</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px; font-size:0.78rem; color:var(--text-muted);">
                  <span>👤 ${song.singers.join(', ')}</span>
                  <span>•</span>
                  <span>${isScheduled ? '📅 ลงในปฏิทินแล้ว' : '⏳ ยังไม่ลงตาราง'}</span>
                  ${song.tags && song.tags.length ? `<span>• 🏷️ ${song.tags.join(', ')}</span>` : ''}
                </div>
              </div>

              <div style="display:flex; align-items:center; gap:8px;">
                <span class="badge-status" data-kind="${song.kind}">
                  ${state.columns.find(c => c.kind === song.kind)?.name || song.kind}
                </span>

                <button class="btn-delete-song btn-secondary" data-id="${song.id}" style="min-height:36px; padding:6px 10px; color:#ef4444;" title="ลบเพลง">
                  🗑️
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

export function attachSongLibraryEvents(): void {
  document.getElementById('btn-add-song-lib')?.addEventListener('click', () => openAddSongModal());

  const searchInput = document.getElementById('input-lib-search') as HTMLInputElement;
  searchInput?.addEventListener('input', (e) => {
    filterState.searchQuery = (e.target as HTMLInputElement).value;
    setState({});
  });

  const makerSelect = document.getElementById('select-lib-maker') as HTMLSelectElement;
  makerSelect?.addEventListener('change', (e) => {
    filterState.makerFilter = (e.target as HTMLSelectElement).value;
    setState({});
  });

  const kindSelect = document.getElementById('select-lib-kind') as HTMLSelectElement;
  kindSelect?.addEventListener('change', (e) => {
    filterState.kindFilter = (e.target as HTMLSelectElement).value;
    setState({});
  });

  document.getElementById('btn-toggle-unscheduled')?.addEventListener('click', () => {
    filterState.onlyUnscheduled = !filterState.onlyUnscheduled;
    setState({});
  });

  document.querySelectorAll('.btn-delete-song').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const songId = (e.currentTarget as HTMLElement).dataset.id;
      if (!songId) return;

      const state = (window as any).melimelState || getState();
      const song = state.songs.find((s: any) => s.id === songId);
      if (confirm(`คุณต้องการลบเพลง "${song?.title}" ใช่หรือไม่?`)) {
        setState({
          songs: state.songs.filter((s: any) => s.id !== songId)
        });
        showToast('ลบเพลงเรียบร้อยแล้ว', 'info');
      }
    });
  });
}
