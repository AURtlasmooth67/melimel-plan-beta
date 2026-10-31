/**
 * Export Modal with JSON, CSV, and ICS download triggers
 */
import { getState } from '../../core/store';
import { exportToJSON, exportSongsToCSV, exportCalendarToICS, downloadFile } from '../exporter/dataExport';
import { toISODate } from '../../core/dates';
import { showToast } from '../../ui/toast';

export function openExportModal(): void {
  const existing = document.getElementById('modal-export-data');
  if (existing) existing.remove();

  const state = getState();
  const today = toISODate();

  const modal = document.createElement('div');
  modal.id = 'modal-export-data';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);
    z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px;
  `;

  modal.innerHTML = `
    <div class="glass-panel" style="width:100%; max-width:480px; padding:22px; display:flex; flex-direction:column; gap:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="font-size:1.15rem; font-weight:800;">📤 ส่งออกข้อมูลของทีม (Export Data)</h3>
        <button id="btn-close-export-modal" style="font-size:1.4rem; padding:4px 8px;">✕</button>
      </div>

      <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.5;">
        สำรองข้อมูลหรือนำไปใช้ต่อในแอปพลิเคชันอื่นได้อย่างอิสระ ไม่มีการผูกขาดข้อมูล
      </p>

      <div style="display:flex; flex-direction:column; gap:10px;">
        <button id="btn-dl-json" class="glass-panel" style="display:flex; align-items:center; justify-content:space-between; padding:14px; cursor:pointer;">
          <div style="text-align:left;">
            <div style="font-weight:700; font-size:0.92rem;">📁 ส่งออกเป็นไฟล์ JSON (ครบทุกข้อมูล)</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">เพลง, ปฏิทิน, ตั๋วงาน, และเป้าหมายทั้งหมด</div>
          </div>
          <span style="font-size:1.2rem;">⬇️</span>
        </button>

        <button id="btn-dl-csv" class="glass-panel" style="display:flex; align-items:center; justify-content:space-between; padding:14px; cursor:pointer;">
          <div style="text-align:left;">
            <div style="font-weight:700; font-size:0.92rem;">📊 ส่งออกรายการเพลงเป็นไฟล์ CSV (Excel)</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">เปิดดูใน Microsoft Excel หรือ Google Sheets</div>
          </div>
          <span style="font-size:1.2rem;">⬇️</span>
        </button>

        <button id="btn-dl-ics" class="glass-panel" style="display:flex; align-items:center; justify-content:space-between; padding:14px; cursor:pointer;">
          <div style="text-align:left;">
            <div style="font-weight:700; font-size:0.92rem;">📅 ส่งออกปฏิทินงานเป็นไฟล์ iCalendar (.ics)</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">นำเข้า Google Calendar หรือ Apple Calendar ได้ทันที</div>
          </div>
          <span style="font-size:1.2rem;">⬇️</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('btn-close-export-modal')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  document.getElementById('btn-dl-json')?.addEventListener('click', () => {
    const jsonStr = exportToJSON(state);
    downloadFile(jsonStr, `MELiMEL-Backup-${today}.json`, 'application/json');
    showToast('ดาวน์โหลดไฟล์สำรองข้อมูล JSON เรียบร้อยแล้ว', 'success');
  });

  document.getElementById('btn-dl-csv')?.addEventListener('click', () => {
    const csvStr = exportSongsToCSV(state);
    downloadFile(csvStr, `MELiMEL-Songs-${today}.csv`, 'text/csv');
    showToast('ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว', 'success');
  });

  document.getElementById('btn-dl-ics')?.addEventListener('click', () => {
    const icsStr = exportCalendarToICS(state);
    downloadFile(icsStr, `MELiMEL-Calendar-${today}.ics`, 'text/calendar');
    showToast('ดาวน์โหลดไฟล์ iCalendar (.ics) เรียบร้อยแล้ว', 'success');
  });
}
