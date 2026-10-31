/**
 * Home View: "Today / วันนี้ของฉัน"
 * Know what to record/release/review within 3 seconds
 */
import { AppState } from '../../core/store';
import { toISODate, addDays, formatThaiDate } from '../../core/dates';
import { openAddSongModal } from '../songs/addSongModal';

export function renderTodayHome(state: AppState): string {
  const todayIso = toISODate();
  const tomorrowIso = addDays(todayIso, 1);

  // Songs scheduled for today and tomorrow
  const todaySongIds = state.calendar[todayIso] || [];
  const tomorrowSongIds = state.calendar[tomorrowIso] || [];

  const todaySongs = state.songs.filter(s => todaySongIds.includes(s.id));
  const tomorrowSongs = state.songs.filter(s => tomorrowSongIds.includes(s.id));

  // Urgent pending songs
  const recordingSongs = state.songs.filter(s => s.kind === 'recording');
  const postSongs = state.songs.filter(s => s.kind === 'post-recording');

  return `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <!-- Hero 3-Second Action Summary Card -->
      <div class="glass-panel" style="padding:18px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h2 style="font-size:1.15rem; font-weight:800; display:flex; align-items:center; gap:8px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-500)" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <span>งานวันนี้ของฉัน (${formatThaiDate(todayIso, true)})</span>
          </h2>
          <span style="font-size:0.75rem; background:rgba(255,92,138,0.12); color:var(--color-primary-600); padding:3px 10px; border-radius:999px; font-weight:700;">
            3 วิ รู้เรื่อง
          </span>
        </div>

        <!-- Today's Action List -->
        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:14px;">
          ${todaySongs.length === 0 ? `
            <div style="padding:14px; background:var(--surface-muted); border-radius:12px; text-align:center; color:var(--text-muted); font-size:0.88rem;">
              วันนี้ไม่มีคิวอัดหรือลงคลิปที่กำหนดไว้ ชิลล์ได้เลย! ☕
            </div>
          ` : todaySongs.map(song => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px; background:var(--surface-muted); border-radius:12px; border:1px solid var(--border-subtle);">
              <div>
                <div style="font-weight:700; font-size:0.95rem;">${song.title}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">ผู้ทำ: ${song.singers.join(', ')} • นัดวันนี้</div>
              </div>
              <span class="badge-status" data-kind="${song.kind}">
                ${state.columns.find(c => c.kind === song.kind)?.name || song.kind}
              </span>
            </div>
          `).join('')}
        </div>

        <button id="btn-home-quick-add" class="btn-solid-primary" style="width:100%; justify-content:center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>เพิ่มเพลงด่วน (≤ 3 แตะ ≤ 10 วิ)</span>
        </button>
      </div>

      <!-- Quick Status Overview 2-Column Grid -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
        <!-- Card: Tomorrow's Schedule -->
        <div class="glass-panel" style="padding:16px;">
          <h3 style="font-size:0.95rem; font-weight:700; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>เตรียมตัววันพรุ่งนี้ (${formatThaiDate(tomorrowIso, true)})</span>
          </h3>
          <div style="font-size:0.85rem; color:var(--text-muted);">
            ${tomorrowSongs.length > 0 ? `${tomorrowSongs.map(s => `• <b>${s.title}</b> (${s.singers.join(', ')})`).join('<br>')}` : 'ไม่มีคิวที่ลงไว้พรุ่งนี้'}
          </div>
        </div>

        <!-- Card: Urgent Stages -->
        <div class="glass-panel" style="padding:16px;">
          <h3 style="font-size:0.95rem; font-weight:700; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>เพลงที่กำลังดำเนินการ</span>
          </h3>
          <div style="display:flex; gap:8px;">
            <span class="badge-status" data-kind="recording">กำลังอัด ${recordingSongs.length}</span>
            <span class="badge-status" data-kind="post-recording">มิกซ์/ตัดต่อ ${postSongs.length}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function attachTodayHomeEvents(): void {
  document.getElementById('btn-home-quick-add')?.addEventListener('click', () => openAddSongModal());
}
