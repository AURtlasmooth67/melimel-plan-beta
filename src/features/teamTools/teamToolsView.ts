/**
 * Team Tools View: Big Jobs/Deadlines, Week Structure Templates, and Goals/Subscribers
 */
import { AppState, setState, getState } from '../../core/store';
import { formatThaiDate } from '../../core/dates';
import { showToast } from '../../ui/toast';

export function renderTeamToolsView(state: AppState): string {
  return `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <div>
        <h2 style="font-size:1.3rem; font-weight:700;">เครื่องมือทีม (Team Tools)</h2>
        <p style="font-size:0.85rem; color:var(--text-muted);">งานใหญ่/เดดไลน์, โครงสัปดาห์ และเป้าหมายของช่อง</p>
      </div>

      <!-- Section 1: Big Jobs & Deadlines Countdown -->
      <div class="glass-panel" style="padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="font-size:1.05rem; font-weight:700; display:flex; align-items:center; gap:6px;">
            <span>⏳ งานใหญ่และเดดไลน์สำคัญ (Big Jobs)</span>
          </h3>
          <button id="btn-add-big-job" class="btn-secondary" style="min-height:34px; padding:4px 10px; font-size:0.8rem;">
            + เพิ่มงานใหญ่
          </button>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          ${state.bigJobs.map(job => {
            const today = new Date().toISOString().slice(0, 10);
            const daysDiff = Math.ceil((new Date(job.date).getTime() - new Date(today).getTime()) / (1000 * 3600 * 24));
            const countdownText = daysDiff < 0 ? `ผ่านไปแล้ว ${Math.abs(daysDiff)} วัน` : daysDiff === 0 ? 'วันนี้!' : `อีก ${daysDiff} วัน`;

            return `
              <div style="background:var(--surface-muted); border-radius:12px; padding:14px; border:1px solid var(--border-subtle);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                  <div>
                    <h4 style="font-size:1rem; font-weight:700;">${job.title}</h4>
                    <div style="font-size:0.78rem; color:var(--text-muted);">${job.note || '—'}</div>
                  </div>
                  <span style="font-size:0.85rem; font-weight:800; color:var(--color-primary-600); background:rgba(255,92,138,0.1); padding:4px 10px; border-radius:999px;">
                    ${countdownText}
                  </span>
                </div>

                <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px;">
                  📅 กำหนดการ: <b>${formatThaiDate(job.date, true)}</b>
                </div>

                ${job.steps && job.steps.length > 0 ? `
                  <div style="display:flex; flex-direction:column; gap:4px; padding:8px 10px; background:var(--surface-card); border-radius:8px; font-size:0.75rem;">
                    <div style="font-weight:700; color:var(--text-muted);">ขั้นตอนเตรียมงาน:</div>
                    ${job.steps.map(s => `
                      <div style="display:flex; justify-content:space-between;">
                        <span>• ${s.label}</span>
                        <span style="color:var(--text-muted);">ล่วงหน้า ${s.weeksBefore} สัปดาห์</span>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Section 2: Goals & Subscriber Milestones -->
      <div class="glass-panel" style="padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="font-size:1.05rem; font-weight:700; display:flex; align-items:center; gap:6px;">
            <span>🎯 เป้าหมายและยอดซับ (Goals)</span>
          </h3>
          <button id="btn-update-subs" class="btn-secondary" style="min-height:34px; padding:4px 10px; font-size:0.8rem;">
            + อัปเดตยอดซับ
          </button>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          ${state.goals.map(goal => {
            const percent = Math.min(100, Math.round((goal.currentSubs / goal.targetSubs) * 100));

            return `
              <div style="background:var(--surface-muted); border-radius:12px; padding:14px; border:1px solid var(--border-subtle);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                  <span style="font-weight:700; font-size:0.95rem;">${goal.title}</span>
                  <span style="font-size:0.85rem; font-weight:800; color:#10b981;">${goal.currentSubs.toLocaleString()} / ${goal.targetSubs.toLocaleString()} (${percent}%)</span>
                </div>

                <!-- Progress Bar -->
                <div style="height:8px; background:var(--border-subtle); border-radius:999px; overflow:hidden; margin-bottom:8px;">
                  <div style="height:100%; width:${percent}%; background:linear-gradient(90deg, var(--color-primary-500), #10b981); border-radius:999px; transition:width 0.4s ease;"></div>
                </div>

                ${goal.history && goal.history.length > 0 ? `
                  <div style="display:flex; gap:8px; font-size:0.72rem; color:var(--text-muted); overflow-x:auto;">
                    <span>ประวัติ:</span>
                    ${goal.history.map(h => `<span>${h.date}: ${h.subs.toLocaleString()}</span>`).join(' • ')}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Section 3: Week Structure Template -->
      <div class="glass-panel" style="padding:16px;">
        <h3 style="font-size:1.05rem; font-weight:700; margin-bottom:8px;">📅 โครงสัปดาห์ของทีม (Week Structure)</h3>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:12px;">กำหนดวันลงคอนเทนต์ประจำสัปดาห์ของแต่ละคน เพื่อรักษาความสม่ำเสมอ</p>

        <div style="display:flex; flex-direction:column; gap:8px;">
          ${Object.entries(state.weekTemplate).map(([memberName, days]) => `
            <div style="padding:12px; background:var(--surface-muted); border-radius:12px;">
              <div style="font-weight:700; font-size:0.9rem; margin-bottom:6px;">👤 ${memberName}</div>
              <div style="display:flex; flex-wrap:wrap; gap:6px;">
                ${Object.entries(days).map(([dayName, dayPlan]) => `
                  <span style="font-size:0.78rem; background:var(--surface-card); padding:4px 8px; border-radius:8px; border:1px solid var(--border-subtle);">
                    <b>${dayName}:</b> ${dayPlan.type} (${dayPlan.idea || '—'})
                  </span>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

export function attachTeamToolsEvents(): void {
  // Add Big Job
  document.getElementById('btn-add-big-job')?.addEventListener('click', () => {
    const title = prompt('ชื่อโปรเจกต์งานใหญ่:')?.trim();
    if (!title) return;

    const date = prompt('กำหนดวันเดดไลน์ (YYYY-MM-DD):')?.trim();
    if (!date) return;

    const state = getState();
    const newBigJob = {
      id: `big-${Date.now()}`,
      title,
      channel: 'main',
      date,
      steps: [
        { label: 'ส่งงานตัดต่อ/มิกซ์', weeksBefore: 1 }
      ]
    };

    setState({ bigJobs: [newBigJob, ...state.bigJobs] });
    showToast(`เพิ่มงานใหญ่ "${title}" เรียบร้อยแล้ว`, 'success');
  });

  // Update Subs
  document.getElementById('btn-update-subs')?.addEventListener('click', () => {
    const subsStr = prompt('กรอกยอดซับปัจจุบัน:')?.trim();
    if (!subsStr) return;

    const subs = parseInt(subsStr);
    if (isNaN(subs)) return;

    const state = getState();
    const today = new Date().toISOString().slice(0, 10);
    const updatedGoals = state.goals.map(g => {
      const history = g.history || [];
      return {
        ...g,
        currentSubs: subs,
        history: [...history, { date: today, subs }]
      };
    });

    setState({ goals: updatedGoals });
    showToast('อัปเดตยอดซับและบันทึกประวัติแล้ว', 'success');
  });
}
