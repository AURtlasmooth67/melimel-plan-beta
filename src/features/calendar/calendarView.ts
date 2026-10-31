/**
 * Interactive Calendar View supporting Weekly/Monthly Views,
 * Tap to Add/Move (< 2 taps), Clear Range & Atomic Undo
 */
import { AppState, setState, getState } from '../../core/store';
import { toISODate, addDays, formatThaiDate } from '../../core/dates';
import { clearCalendarRange, undoClearCalendar } from './calendarClear';
import { openSchedulerAssistantModal } from '../scheduler/schedulerModal';
import { showToast } from '../../ui/toast';

let selectedDate: string = toISODate();
let calendarViewMode: 'week' | 'month' = 'week';

export function renderCalendarView(state: AppState): string {
  const currentWeekDays = getWeekDays(selectedDate);

  return `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <!-- Header Controls -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h2 style="font-size:1.3rem; font-weight:700;">ปฏิทินงานคอนเทนต์</h2>
          <p style="font-size:0.85rem; color:var(--text-muted);">${formatThaiDate(selectedDate, true)}</p>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button id="btn-open-scheduler-assistant" class="btn-solid-primary" style="min-height:38px; padding:6px 14px; font-size:0.85rem;">
            🤖 ผู้ช่วยจัดตาราง 3 ขั้น
          </button>
          <button id="btn-cal-prev" class="btn-secondary" style="min-height:38px; padding:6px 12px;">←</button>
          <button id="btn-cal-today" class="btn-secondary" style="min-height:38px; padding:6px 12px; font-weight:600;">วันนี้</button>
          <button id="btn-cal-next" class="btn-secondary" style="min-height:38px; padding:6px 12px;">→</button>

          <button id="btn-cal-mode" class="btn-secondary" style="min-height:38px; padding:6px 12px;">
            ${calendarViewMode === 'week' ? '📅 สลับดูรายเดือน' : '📅 สลับดูรายสัปดาห์'}
          </button>

          <button id="btn-cal-clear-range" class="btn-secondary" style="min-height:38px; padding:6px 12px; color:#ef4444;" title="เคลียร์ตาราง">
            🧹 เคลียร์ช่วงนี้
          </button>
        </div>
      </div>

      <!-- Undo Banner if lastCalendarUndo exists -->
      ${state.lastCalendarUndo ? `
        <div class="glass-panel" style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,92,138,0.08); border-color:var(--color-primary-500); padding:10px 14px;">
          <div style="font-size:0.85rem; font-weight:600; color:var(--color-primary-600);">
            🧹 เคลียร์ตารางไป ${state.lastCalendarUndo.deletedEntries.length} รายการ
          </div>
          <button id="btn-undo-cal-clear" class="btn-solid-primary" style="min-height:32px; padding:4px 12px; font-size:0.8rem;">
            ↩️ เลิกทำ (กู้คืน)
          </button>
        </div>
      ` : ''}

      <!-- Weekly Day Grid (Mobile Touch Friendly) -->
      <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:6px;">
        ${currentWeekDays.map(dayIso => {
          const isSelected = dayIso === selectedDate;
          const dayDate = new Date(dayIso);
          const dayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
          const songsForDay = state.calendar[dayIso] || [];

          return `
            <div class="cal-day-col glass-panel ${isSelected ? 'selected' : ''}" data-date="${dayIso}" style="padding:10px 6px; text-align:center; cursor:pointer; ${isSelected ? 'border-color:var(--color-primary-500); box-shadow:0 0 0 2px var(--color-primary-500);' : ''}">
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">${dayNames[dayDate.getDay()]}</div>
              <div style="font-size:1.1rem; font-weight:800; margin:4px 0;">${dayDate.getDate()}</div>
              <div style="font-size:0.7rem; font-weight:600; color:${songsForDay.length > 0 ? 'var(--color-primary-600)' : 'var(--text-muted)'};">
                ${songsForDay.length > 0 ? `● ${songsForDay.length} เพลง` : '—'}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Detail Card for Selected Date (Bottom Sheet on Mobile) -->
      <div class="glass-panel" style="padding:18px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <div>
            <h3 style="font-size:1.05rem; font-weight:700;">รายการงานวันที่ ${formatThaiDate(selectedDate, true)}</h3>
            <p style="font-size:0.8rem; color:var(--text-muted);">แตะเพื่อจัดการ ย้ายวัน หรือนำเพลงลงตาราง</p>
          </div>
          <button id="btn-add-song-to-date" class="btn-solid-primary" style="min-height:36px; padding:6px 14px; font-size:0.85rem;">
            + นำเพลงลงวันนี้ (≤2 แตะ)
          </button>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          ${(state.calendar[selectedDate] || []).length === 0 ? `
            <div style="text-align:center; padding:24px 0; color:var(--text-muted); font-size:0.88rem;">
              ยังไม่มีเพลงที่กำหนดลงในวันนี้
            </div>
          ` : (state.calendar[selectedDate] || []).map(sid => {
            const song = state.songs.find(s => s.id === sid);
            return `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:var(--surface-muted); border-radius:12px; border:1px solid var(--border-subtle);">
                <div>
                  <div style="font-weight:700; font-size:0.92rem;">${song?.title || 'เพลงไม่ทราบชื่อ'}</div>
                  <div style="font-size:0.75rem; color:var(--text-muted);">ผู้ทำ: ${song?.singers.join(', ') || '—'}</div>
                </div>

                <div style="display:flex; align-items:center; gap:6px;">
                  <button class="btn-move-date btn-secondary" data-id="${sid}" style="min-height:32px; padding:4px 8px; font-size:0.75rem;" title="ย้ายไปวันอื่น">
                    ย้ายวัน
                  </button>
                  <button class="btn-remove-from-cal btn-secondary" data-id="${sid}" style="min-height:32px; padding:4px 8px; font-size:0.75rem; color:#ef4444;" title="เอาออกจากวันนี้">
                    ลบ
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function getWeekDays(centerIso: string): string[] {
  const d = new Date(centerIso);
  const day = d.getDay();
  // Start on Monday (or Sunday)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const mondayIso = addDays(centerIso, diffToMonday);

  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(mondayIso, i));
  }
  return days;
}

export function attachCalendarEvents(): void {
  document.getElementById('btn-open-scheduler-assistant')?.addEventListener('click', () => {
    openSchedulerAssistantModal('auto');
  });

  document.querySelectorAll('.cal-day-col').forEach(col => {
    col.addEventListener('click', (e) => {
      const date = (e.currentTarget as HTMLElement).dataset.date;
      if (date) {
        selectedDate = date;
        setState({});
      }
    });
  });

  document.getElementById('btn-cal-prev')?.addEventListener('click', () => {
    selectedDate = addDays(selectedDate, -7);
    setState({});
  });
  document.getElementById('btn-cal-next')?.addEventListener('click', () => {
    selectedDate = addDays(selectedDate, 7);
    setState({});
  });
  document.getElementById('btn-cal-today')?.addEventListener('click', () => {
    selectedDate = toISODate();
    setState({});
  });

  // Tap to place song in day (< 2 taps)
  document.getElementById('btn-add-song-to-date')?.addEventListener('click', () => {
    openPickSongForDateModal(selectedDate);
  });

  // Remove song from calendar
  document.querySelectorAll('.btn-remove-from-cal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sid = (e.currentTarget as HTMLElement).dataset.id;
      if (!sid) return;

      const state = getState();
      const currentList = state.calendar[selectedDate] || [];
      const updated = {
        ...state.calendar,
        [selectedDate]: currentList.filter(id => id !== sid)
      };
      if (updated[selectedDate].length === 0) {
        delete updated[selectedDate];
      }

      setState({ calendar: updated });
      showToast('นำเพลงออกจากปฏิทินวันนี้แล้ว', 'info');
    });
  });

  // Move song to another date
  document.querySelectorAll('.btn-move-date').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sid = (e.currentTarget as HTMLElement).dataset.id;
      if (!sid) return;

      const targetDate = prompt('กรอกวันที่ที่ต้องการย้ายไป (YYYY-MM-DD):', selectedDate);
      if (!targetDate || targetDate === selectedDate) return;

      const state = getState();
      const currentList = state.calendar[selectedDate] || [];
      const updated = { ...state.calendar };

      // Remove from old
      updated[selectedDate] = currentList.filter(id => id !== sid);
      if (updated[selectedDate].length === 0) delete updated[selectedDate];

      // Add to target
      if (!updated[targetDate]) updated[targetDate] = [];
      if (!updated[targetDate].includes(sid)) updated[targetDate].push(sid);

      setState({ calendar: updated });
      showToast(`ย้ายเพลงไปวันที่ ${targetDate} แล้ว`, 'success');
    });
  });

  // Clear range modal with undo
  document.getElementById('btn-cal-clear-range')?.addEventListener('click', () => {
    const weekDays = getWeekDays(selectedDate);
    const startIso = weekDays[0];
    const endIso = weekDays[6];

    if (confirm(`คุณต้องการเคลียร์งานในสัปดาห์นี้ (${startIso} ถึง ${endIso}) ใช่หรือไม่? (สามารถเลิกทำได้)`)) {
      const state = getState();
      const { clearedEntries, newCalendar } = clearCalendarRange(state.calendar, state.songs, {
        startDate: startIso,
        endDate: endIso
      });

      setState({
        calendar: newCalendar,
        lastCalendarUndo: {
          deletedEntries: clearedEntries,
          timestamp: Date.now()
        }
      });
      showToast(`เคลียร์ตารางแล้ว ${clearedEntries.length} รายการ (กดเลิกทำได้)`, 'warn');
    }
  });

  // Undo Clear
  document.getElementById('btn-undo-cal-clear')?.addEventListener('click', () => {
    const state = getState();
    if (!state.lastCalendarUndo) return;

    const restored = undoClearCalendar(state.calendar, state.lastCalendarUndo.deletedEntries);
    setState({
      calendar: restored,
      lastCalendarUndo: null
    });
    showToast('กู้คืนตารางที่เคลียร์เรียบร้อยแล้ว', 'success');
  });
}

function openPickSongForDateModal(targetDate: string): void {
  const state = getState();
  const scheduledSongIds = new Set(Object.values(state.calendar).flat());
  const unscheduledSongs = state.songs.filter(s => !scheduledSongIds.has(s.id));

  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);
    z-index: 200; display: flex; align-items: flex-end; justify-content: center;
  `;

  modal.innerHTML = `
    <div class="glass-panel" style="width:100%; max-width:480px; border-bottom-left-radius:0; border-bottom-right-radius:0; padding:20px 20px 32px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <h3 style="font-size:1.1rem; font-weight:700;">เลือกเพลงลงวันที่ ${formatThaiDate(targetDate, true)} (แตะ 1 ครั้ง)</h3>
        <button id="btn-close-pick-modal" style="font-size:1.4rem; padding:4px 8px;">✕</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; max-height:320px; overflow-y:auto;">
        ${unscheduledSongs.length === 0 ? `
          <div style="text-align:center; padding:20px; color:var(--text-muted);">
            เพลงทั้งหมดลงตารางครบแล้ว!
          </div>
        ` : unscheduledSongs.map(song => `
          <button class="btn-pick-song btn-secondary" data-id="${song.id}" style="justify-content:space-between; text-align:left; padding:12px;">
            <div>
              <div style="font-weight:700; font-size:0.92rem;">${song.title}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${song.singers.join(', ')}</div>
            </div>
            <span class="badge-status" data-kind="${song.kind}">+ วางลงวัน</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('btn-close-pick-modal')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  modal.querySelectorAll('.btn-pick-song').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const songId = (e.currentTarget as HTMLElement).dataset.id;
      if (!songId) return;

      const currentList = state.calendar[targetDate] || [];
      const updated = {
        ...state.calendar,
        [targetDate]: [...currentList, songId]
      };

      setState({ calendar: updated });
      modal.remove();
      showToast('วางเพลงลงในปฏิทินเรียบร้อยแล้ว (≤ 2 แตะ)', 'success');
    });
  });
}
