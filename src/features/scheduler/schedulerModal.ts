/**
 * 3-Step Auto-Scheduler & Routine Assistant Modal
 * Step 1: Select Scope (Person, Weeks, Cap, Lag, Skip WE)
 * Step 2: Preview Results & Diagnostics
 * Step 3: Confirm & Apply with Undo
 */
import { getState, setState } from '../../core/store';
import { autoSchedule, ScheduleOutput } from './scheduler';
import { toISODate } from '../../core/dates';
import { showToast } from '../../ui/toast';

export function openSchedulerAssistantModal(initialMode: 'auto' | 'routine' = 'auto'): void {
  const existing = document.getElementById('modal-scheduler-assistant');
  if (existing) existing.remove();

  const state = getState();
  const todayIso = toISODate();

  let mode = initialMode;
  let currentStep = 1;
  let calculatedResult: ScheduleOutput | null = null;

  const modal = document.createElement('div');
  modal.id = 'modal-scheduler-assistant';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);
    z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px;
  `;

  function renderModalContent(): string {
    return `
      <div class="glass-panel" style="width:100%; max-width:580px; padding:22px; max-height:90vh; overflow-y:auto;">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <h3 style="font-size:1.15rem; font-weight:800;">ผู้ช่วยจัดตารางอัจฉริยะ (Smart Scheduler)</h3>
              <span class="beta-pill" style="font-size:0.65rem;">ขั้นที่ ${currentStep}/3</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
              ${mode === 'routine' ? 'โหมด Routine ประจำคน: วางแผนรายบุคคลอย่างสม่ำเสมอ' : 'โหมดจัดอัตโนมัติ: กระจายเพลงที่ค้างของทั้งทีม'}
            </p>
          </div>
          <button id="btn-close-sched-modal" style="font-size:1.4rem; padding:4px 8px;">✕</button>
        </div>

        <!-- Mode Tabs -->
        <div style="display:flex; gap:8px; margin-bottom:16px;">
          <button id="tab-mode-auto" class="btn-secondary" style="flex:1; justify-content:center; ${mode === 'auto' ? 'border-color:var(--color-primary-500); color:var(--color-primary-600); font-weight:700;' : ''}">
            🤖 จัดอัตโนมัติ (ทั้งทีม)
          </button>
          <button id="tab-mode-routine" class="btn-secondary" style="flex:1; justify-content:center; ${mode === 'routine' ? 'border-color:var(--color-primary-500); color:var(--color-primary-600); font-weight:700;' : ''}">
            🔁 Routine (รายคน)
          </button>
        </div>

        <!-- STEP 1: OPTIONS FORM -->
        <div id="step-1-container" style="display:${currentStep === 1 ? 'flex' : 'none'}; flex-direction:column; gap:12px;">
          <div>
            <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:4px;">
              ${mode === 'routine' ? 'เลือกคน (บังคับ 1 คน) *' : 'เลือกคน (ว่าง = ทุกคน)'}
            </label>
            <select id="sched-input-person">
              ${mode === 'auto' ? '<option value="">ทุกคนในทีม</option>' : ''}
              ${state.members.map(m => `<option value="${m.name}">${m.name}</option>`).join('')}
            </select>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:4px;">จำนวนเพลง (ว่าง = ทั้งหมด)</label>
              <input type="number" id="sched-input-limit" placeholder="เช่น 4" value="${mode === 'routine' ? '4' : ''}">
            </div>
            <div>
              <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:4px;">ระยะเวลา (สัปดาห์)</label>
              <input type="number" id="sched-input-weeks" value="${mode === 'routine' ? '4' : '8'}" min="1">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:4px;">งานสูงสุดต่อคนต่อวัน (Cap)</label>
              <input type="number" id="sched-input-cap" value="1" min="1">
            </div>
            <div>
              <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:4px;">เว้นลงหลังอัดกี่วัน (Lag)</label>
              <input type="number" id="sched-input-lag" value="3" min="0">
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
            <input type="checkbox" id="sched-input-skip-we" checked style="width:18px; height:18px; min-height:auto;">
            <label for="sched-input-skip-we" style="font-size:0.85rem; font-weight:600; cursor:pointer;">
              ข้ามเสาร์-อาทิตย์ (ไม่นัดวันหยุด)
            </label>
          </div>

          <button id="btn-calc-schedule" class="btn-solid-primary" style="margin-top:10px; width:100%; justify-content:center;">
            ⚡ ไปขั้นที่ 2: คำนวณและดูตัวอย่าง
          </button>
        </div>

        <!-- STEP 2: PREVIEW RESULTS & DIAGNOSTICS -->
        <div id="step-2-container" style="display:${currentStep === 2 ? 'flex' : 'none'}; flex-direction:column; gap:14px;">
          ${calculatedResult ? `
            <div style="background:var(--surface-muted); border-radius:12px; padding:14px;">
              <div style="font-weight:700; margin-bottom:8px; color:var(--text-main);">
                📋 ผลการจัดตารางล่วงหน้า (${calculatedResult.scheduled.length} เพลง)
              </div>

              ${calculatedResult.scheduled.length === 0 ? `
                <div style="font-size:0.85rem; color:var(--text-muted); text-align:center; padding:12px 0;">
                  ไม่พบเพลงที่สามารถจัดลงตารางได้ตามเงื่อนไข
                </div>
              ` : `
                <div style="display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;">
                  ${calculatedResult.scheduled.map(item => `
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.82rem; padding:8px 10px; background:var(--surface-card); border-radius:8px; border:1px solid var(--border-subtle);">
                      <div>
                        <b>${item.title}</b>
                        <div style="color:var(--text-muted); font-size:0.75rem;">👤 ${item.singers.join(', ')}</div>
                      </div>
                      <div style="text-align:right;">
                        <span style="color:#d97706;">🎙️ ${item.recordDate || '—'}</span> →
                        <span style="color:#10b981; font-weight:700;">🎬 ${item.releaseDate}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}

              ${calculatedResult.unscheduled.length > 0 ? `
                <div style="margin-top:12px; padding:10px; background:rgba(239,68,68,0.08); border-radius:8px; border:1px solid rgba(239,68,68,0.2);">
                  <div style="font-weight:700; font-size:0.82rem; color:#ef4444; margin-bottom:4px;">
                    ⚠️ จัดไม่ลง ${calculatedResult.unscheduled.length} เพลง:
                  </div>
                  ${calculatedResult.unscheduled.map(u => `
                    <div style="font-size:0.75rem; color:var(--text-muted);">
                      • <b>${u.song.title}</b>: ${u.reason} (${u.tip})
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>

            <div style="display:flex; gap:10px;">
              <button id="btn-back-step-1" class="btn-secondary" style="flex:1; justify-content:center;">
                ← ย้อนกลับไปแก้ไข
              </button>
              <button id="btn-apply-schedule" class="btn-solid-primary" style="flex:2; justify-content:center;" ${calculatedResult.scheduled.length === 0 ? 'disabled' : ''}>
                ✓ ขั้นที่ 3: ใช้ตารางนี้จริง
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  function attachInnerEvents() {
    document.getElementById('btn-close-sched-modal')?.addEventListener('click', () => modal.remove());

    document.getElementById('tab-mode-auto')?.addEventListener('click', () => {
      mode = 'auto';
      modal.innerHTML = renderModalContent();
      attachInnerEvents();
    });

    document.getElementById('tab-mode-routine')?.addEventListener('click', () => {
      mode = 'routine';
      modal.innerHTML = renderModalContent();
      attachInnerEvents();
    });

    // Step 1 -> Calculate
    document.getElementById('btn-calc-schedule')?.addEventListener('click', () => {
      const person = (document.getElementById('sched-input-person') as HTMLSelectElement).value;
      const limitVal = parseInt((document.getElementById('sched-input-limit') as HTMLInputElement).value) || 0;
      const weeksVal = parseInt((document.getElementById('sched-input-weeks') as HTMLInputElement).value) || 4;
      const capVal = parseInt((document.getElementById('sched-input-cap') as HTMLInputElement).value) || 1;
      const lagVal = parseInt((document.getElementById('sched-input-lag') as HTMLInputElement).value) || 3;
      const skipWe = (document.getElementById('sched-input-skip-we') as HTMLInputElement).checked;

      calculatedResult = autoSchedule(state.songs, state.calendar, {
        person: person || undefined,
        maxSongs: limitVal > 0 ? limitVal : undefined,
        startDate: todayIso,
        durationDays: weeksVal * 7,
        capPerDay: capVal,
        lagDays: lagVal,
        skipWeekends: skipWe
      });

      currentStep = 2;
      modal.innerHTML = renderModalContent();
      attachInnerEvents();
    });

    // Step 2 -> Back
    document.getElementById('btn-back-step-1')?.addEventListener('click', () => {
      currentStep = 1;
      modal.innerHTML = renderModalContent();
      attachInnerEvents();
    });

    // Step 2 -> Apply
    document.getElementById('btn-apply-schedule')?.addEventListener('click', () => {
      if (!calculatedResult || calculatedResult.scheduled.length === 0) return;

      const updatedCalendar = { ...state.calendar };
      const updatedSongs = [...state.songs];

      calculatedResult.scheduled.forEach(item => {
        // Update song recordDate & releaseDate
        const songIdx = updatedSongs.findIndex(s => s.id === item.songId);
        if (songIdx !== -1) {
          updatedSongs[songIdx] = {
            ...updatedSongs[songIdx],
            recordDate: item.recordDate || updatedSongs[songIdx].recordDate,
            releaseDate: item.releaseDate
          };
        }

        // Put into calendar
        const dateKey = item.releaseDate;
        if (!updatedCalendar[dateKey]) updatedCalendar[dateKey] = [];
        if (!updatedCalendar[dateKey].includes(item.songId)) {
          updatedCalendar[dateKey].push(item.songId);
        }
      });

      setState({
        songs: updatedSongs,
        calendar: updatedCalendar
      });

      modal.remove();
      showToast(`🎉 จัดตารางเรียบร้อยแล้ว ${calculatedResult.scheduled.length} เพลง`, 'success');
    });
  }

  modal.innerHTML = renderModalContent();
  document.body.appendChild(modal);
  attachInnerEvents();
}
