/**
 * More Hub & Team Members Management
 */
import { AppState, setState, getState, resetToSeedData } from '../../core/store';
import { openImportModal } from '../importer/importModal';
import { openExportModal } from '../exporter/exportModal';
import { showToast } from '../../ui/toast';

export function renderMoreHub(state: AppState): string {
  return `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div>
        <h2 style="font-size:1.3rem; font-weight:700;">ศูนย์รวมเมนูเพิ่มเติม (More Hub)</h2>
        <p style="font-size:0.85rem; color:var(--text-muted);">จัดการสมาชิก การตั้งค่า และเครื่องมือข้อมูลเดิม</p>
      </div>

      <!-- Quick Action Grid -->
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(140px, 1fr)); gap:12px;">
        <button id="btn-open-tickets" class="glass-panel" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:18px 12px; text-align:center; cursor:pointer;">
          <span style="font-size:1.6rem;">🎟️</span>
          <span style="font-weight:700; font-size:0.88rem;">ตั๋วงานของทีม</span>
          <span style="font-size:0.72rem; color:var(--text-muted);">${state.tickets.length} ตั๋วค้าง</span>
        </button>

        <button id="btn-open-scripts" class="glass-panel" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:18px 12px; text-align:center; cursor:pointer;">
          <span style="font-size:1.6rem;">📝</span>
          <span style="font-weight:700; font-size:0.88rem;">สคริปต์/บทพูด</span>
          <span style="font-size:0.72rem; color:var(--text-muted);">${state.scripts.length} บท</span>
        </button>

        <button id="btn-open-team-tools" class="glass-panel" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:18px 12px; text-align:center; cursor:pointer;">
          <span style="font-size:1.6rem;">⏳</span>
          <span style="font-weight:700; font-size:0.88rem;">งานใหญ่ & เป้าหมาย</span>
          <span style="font-size:0.72rem; color:var(--text-muted);">${state.bigJobs.length} โปรเจกต์</span>
        </button>

        <button id="btn-open-scheduler-more" class="glass-panel" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:18px 12px; text-align:center; cursor:pointer;">
          <span style="font-size:1.6rem;">🤖</span>
          <span style="font-weight:700; font-size:0.88rem;">ผู้ช่วยจัดตาราง</span>
          <span style="font-size:0.72rem; color:var(--text-muted);">Auto & Routine</span>
        </button>

        <button id="btn-open-planner-img" class="glass-panel" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:18px 12px; text-align:center; cursor:pointer;">
          <span style="font-size:1.6rem;">🎨</span>
          <span style="font-weight:700; font-size:0.88rem;">สร้างภาพแพลนเนอร์</span>
          <span style="font-size:0.72rem; color:var(--text-muted);">1248×1248 HD Export</span>
        </button>

        <button id="btn-open-export" class="glass-panel" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:18px 12px; text-align:center; cursor:pointer;">
          <span style="font-size:1.6rem;">📤</span>
          <span style="font-weight:700; font-size:0.88rem;">ส่งออกข้อมูล</span>
          <span style="font-size:0.72rem; color:var(--text-muted);">JSON, CSV, ICS</span>
        </button>

        <button id="btn-open-admin-panel" class="glass-panel" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:18px 12px; text-align:center; cursor:pointer;">
          <span style="font-size:1.6rem;">⚙️</span>
          <span style="font-weight:700; font-size:0.88rem;">แผงแอดมิน</span>
          <span style="font-size:0.72rem; color:var(--text-muted);">เปลี่ยนพื้นหลังทีม</span>
        </button>

        <button id="btn-open-importer" class="glass-panel" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:18px 12px; text-align:center; cursor:pointer;">
          <span style="font-size:1.6rem;">📥</span>
          <span style="font-weight:700; font-size:0.88rem;">นำเข้า JSON เดิม</span>
          <span style="font-size:0.72rem; color:var(--text-muted);">Dry-run ก่อนเขียนจริง</span>
        </button>

        <button id="btn-reset-seed" class="glass-panel" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:18px 12px; text-align:center; cursor:pointer;">
          <span style="font-size:1.6rem;">🌱</span>
          <span style="font-weight:700; font-size:0.88rem;">โหลด Seed Data</span>
          <span style="font-size:0.72rem; color:var(--text-muted);">รีเซ็ตข้อมูลตัวอย่าง</span>
        </button>

        <button id="btn-view-gallery" class="glass-panel" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:18px 12px; text-align:center; cursor:pointer;">
          <span style="font-size:1.6rem;">🎨</span>
          <span style="font-weight:700; font-size:0.88rem;">Component Gallery</span>
          <span style="font-size:0.72rem; color:var(--text-muted);">ดู tokens & states</span>
        </button>
      </div>

      <!-- Team Members Section -->
      <div class="glass-panel" style="padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="font-size:1.05rem; font-weight:700;">รายชื่อผู้ที่เข้าได้ (สมาชิกในทีม)</h3>
          <button id="btn-add-member" class="btn-secondary" style="min-height:34px; padding:4px 10px; font-size:0.8rem;">
            + เพิ่มสมาชิก
          </button>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          ${state.members.map(member => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background:var(--surface-muted); border-radius:12px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <span style="width:12px; height:12px; border-radius:50%; background:${member.color};"></span>
                <div>
                  <div style="font-weight:700; font-size:0.9rem;">${member.name}</div>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${member.email}</div>
                </div>
              </div>
              <span style="font-size:0.72rem; padding:2px 8px; border-radius:999px; background:${member.role === 'admin' ? 'rgba(255,92,138,0.15)' : 'rgba(0,0,0,0.06)'}; color:${member.role === 'admin' ? 'var(--color-primary-600)' : 'var(--text-main)'}; font-weight:700;">
                ${member.role === 'admin' ? '👑 แอดมิน' : 'สมาชิก'}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

export function attachMoreHubEvents(): void {
  document.getElementById('btn-open-tickets')?.addEventListener('click', () => {
    setState({ activeTab: 'tickets' });
  });

  document.getElementById('btn-open-scripts')?.addEventListener('click', () => {
    setState({ activeTab: 'scripts' });
  });

  document.getElementById('btn-open-team-tools')?.addEventListener('click', () => {
    setState({ activeTab: 'team-tools' });
  });

  document.getElementById('btn-open-scheduler-more')?.addEventListener('click', () => {
    import('../scheduler/schedulerModal').then(m => m.openSchedulerAssistantModal('auto'));
  });

  document.getElementById('btn-open-planner-img')?.addEventListener('click', () => {
    import('../plannerImage/plannerImageModal').then(m => m.openPlannerImageGeneratorModal(getState()));
  });

  document.getElementById('btn-open-export')?.addEventListener('click', () => {
    openExportModal();
  });

  document.getElementById('btn-open-admin-panel')?.addEventListener('click', () => {
    import('../admin/adminModal').then(m => m.openAdminSettingsModal());
  });

  document.getElementById('btn-open-importer')?.addEventListener('click', () => openImportModal());

  document.getElementById('btn-reset-seed')?.addEventListener('click', () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลเป็น Seed Data หรือไม่?')) {
      resetToSeedData();
      showToast('รีเซ็ตข้อมูลเป็น Seed Data เรียบร้อยแล้ว', 'success');
    }
  });

  document.getElementById('btn-view-gallery')?.addEventListener('click', () => {
    setState({ activeTab: 'dev-ui' });
  });

  document.getElementById('btn-add-member')?.addEventListener('click', () => {
    const email = prompt('กรอกอีเมล Google ของสมาชิกใหม่:')?.trim();
    if (!email) return;

    const name = prompt('กรอกชื่อที่ใช้เรียกในทีม:')?.trim() || email.split('@')[0];
    showToast(`เพิ่มสมาชิก "${name}" (${email}) เรียบร้อยแล้ว`, 'success');
  });
}
