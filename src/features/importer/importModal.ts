/**
 * Dry-run Importer Modal for legacy MELiMEL JSON data
 */
import { getState, setState } from '../../core/store';
import { dryRunImport, DryRunReport } from './importer';
import { showToast } from '../../ui/toast';

export function openImportModal(): void {
  const existingModal = document.getElementById('modal-import-json');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'modal-import-json';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);
    z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px;
  `;

  modal.innerHTML = `
    <div class="glass-panel" style="width:100%; max-width:540px; padding:22px; max-height:90vh; overflow-y:auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <h3 style="font-size:1.15rem; font-weight:700;">นำเข้าข้อมูลเดิม (JSON) พร้อม Dry-Run ตรวจสอบ</h3>
        <button id="btn-close-import-modal" style="font-size:1.4rem; padding:4px 8px;">✕</button>
      </div>

      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:14px; line-height:1.5;">
        วางเนื้อหาไฟล์ JSON ที่ส่งออกจากเว็บเดิม ระบบจะแสดงรายงานตรวจสอบความถูกต้อง (Dry-Run) ก่อนเขียนข้อมูลจริง เพื่อความปลอดภัย 100%
      </p>

      <textarea id="textarea-import-json" placeholder="วางข้อมูล JSON ที่นี่..." style="height:120px; font-family:monospace; font-size:0.8rem; margin-bottom:12px;"></textarea>

      <button id="btn-run-dry-run" class="btn-secondary" style="width:100%; justify-content:center; margin-bottom:14px;">
        🔍 เริ่มตรวจรายงาน Dry-Run ก่อนนำเข้า
      </button>

      <div id="dry-run-report-container" style="display:none; flex-direction:column; gap:10px; padding:14px; background:var(--surface-muted); border-radius:12px; margin-bottom:14px;">
      </div>

      <button id="btn-confirm-import" class="btn-solid-primary" style="width:100%; justify-content:center; display:none;">
        ✓ ยืนยันเขียนข้อมูลเข้าสู่ระบบทดสอบ
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('btn-close-import-modal')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  let latestReport: DryRunReport | null = null;

  document.getElementById('btn-run-dry-run')?.addEventListener('click', () => {
    const jsonStr = (document.getElementById('textarea-import-json') as HTMLTextAreaElement).value.trim();
    if (!jsonStr) {
      showToast('กรุณาวางข้อมูล JSON ก่อน', 'warn');
      return;
    }

    const state = getState();
    latestReport = dryRunImport(jsonStr, state.songs);

    const reportContainer = document.getElementById('dry-run-report-container')!;
    const confirmBtn = document.getElementById('btn-confirm-import')!;

    reportContainer.style.display = 'flex';

    if (!latestReport.isValid) {
      reportContainer.innerHTML = `
        <div style="color:#ef4444; font-weight:700;">❌ ตรวจสอบไม่ผ่าน:</div>
        <div style="font-size:0.82rem; color:#ef4444;">${latestReport.warnings.join('<br>')}</div>
      `;
      confirmBtn.style.display = 'none';
      return;
    }

    reportContainer.innerHTML = `
      <div style="font-weight:700; color:#10b981;">📋 ผลรายงานการตรวจสอบ (Dry-Run):</div>
      <div style="font-size:0.85rem; line-height:1.6;">
        • พบเพลงทั้งหมด: <b>${latestReport.songCount} เพลง</b><br>
        • เพลงใหม่ที่จะเพิ่ม: <b>${latestReport.newSongs} เพลง</b><br>
        • ชื่อเพลงที่ซ้ำกับระบบปัจจุบัน: <b>${latestReport.duplicateTitles.length} เพลง</b><br>
        • รายการวันที่ในปฏิทิน: <b>${latestReport.planDateCount} วัน</b><br>
        • สมาชิกเดิม: <b>${latestReport.memberCount} คน</b>
      </div>
      ${latestReport.warnings.length > 0 ? `
        <div style="font-size:0.8rem; color:#d97706; margin-top:4px;">
          ⚠️ ข้อควรระวัง: ${latestReport.warnings.join(', ')}
        </div>
      ` : ''}
    `;

    confirmBtn.style.display = 'flex';
  });

  document.getElementById('btn-confirm-import')?.addEventListener('click', () => {
    if (!latestReport || !latestReport.isValid) return;

    const state = getState();
    const updatedSongs = [...state.songs, ...latestReport.parsedSongs];
    const updatedCalendar = { ...state.calendar, ...latestReport.parsedPlan };

    setState({
      songs: updatedSongs,
      calendar: updatedCalendar
    });

    modal.remove();
    showToast(`นำเข้าข้อมูลสำเร็จ: เพิ่ม ${latestReport.parsedSongs.length} เพลง`, 'success');
  });
}
