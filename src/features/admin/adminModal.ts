/**
 * Admin Panel Modal: Change Team Background, Discord Webhook, YouTube Key,
 * Dynamic Kanban Columns Manager, and Activity Logs
 */
import { setState, getState } from '../../core/store';
import { refreshYouTubeStats } from '../youtube/youtubeService';
import { sendDiscordTodaySchedule } from '../discord/discordService';
import { showToast } from '../../ui/toast';

export function openAdminSettingsModal(): void {
  const existing = document.getElementById('modal-admin-settings');
  if (existing) existing.remove();

  const state = getState();

  const modal = document.createElement('div');
  modal.id = 'modal-admin-settings';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
    z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px;
  `;

  modal.innerHTML = `
    <div class="glass-panel" style="width:100%; max-width:620px; padding:22px; max-height:90vh; overflow-y:auto; display:flex; flex-direction:column; gap:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="font-size:1.15rem; font-weight:800; display:flex; align-items:center; gap:8px;">
          <span>⚙️ แผงควบคุมผู้ดูแลระบบ (Admin Control Center)</span>
        </h3>
        <button id="btn-close-admin-modal" style="font-size:1.4rem; padding:4px 8px;">✕</button>
      </div>

      <!-- Section: Team Background Image -->
      <div class="glass-panel" style="padding:14px; display:flex; flex-direction:column; gap:10px;">
        <div style="font-weight:700; font-size:0.92rem;">🖼️ ภาพพื้นหลังส่วนกลางของทีม (เห็นทุกคน)</div>
        <input type="url" id="admin-input-bg-url" value="${state.teamBgUrl}" placeholder="https://example.com/wallpaper.jpg" style="font-size:0.85rem;">
        
        <div style="display:flex; gap:8px;">
          <button id="btn-save-team-bg" class="btn-solid-primary" style="flex:1; justify-content:center;">
            บันทึกภาพพื้นหลัง
          </button>
          <button id="btn-clear-team-bg" class="btn-secondary" style="justify-content:center;">
            ลบพื้นหลัง
          </button>
        </div>
      </div>

      <!-- Section: Discord Webhook Integration -->
      <div class="glass-panel" style="padding:14px; display:flex; flex-direction:column; gap:10px;">
        <div style="font-weight:700; font-size:0.92rem;">💬 Discord Webhook (แจ้งเตือนงานและตาราง)</div>
        <p style="font-size:0.78rem; color:var(--text-muted); line-height:1.4;">
          คัดลอก Webhook URL จากห้อง Discord ของทีมมาวางเพื่อส่งสรุปงานวันนี้เข้าแชท
        </p>
        <input type="url" id="admin-input-discord-wh" value="${state.discordWebhook}" placeholder="https://discord.com/api/webhooks/..." style="font-size:0.85rem;">
        
        <div style="display:flex; gap:8px;">
          <button id="btn-save-discord-wh" class="btn-solid-primary" style="flex:1; justify-content:center;">
            บันทึก Webhook
          </button>
          <button id="btn-test-discord-wh" class="btn-secondary" style="justify-content:center;">
            📢 ทดสอบส่งงานวันนี้
          </button>
        </div>
      </div>

      <!-- Section: YouTube Data API v3 -->
      <div class="glass-panel" style="padding:14px; display:flex; flex-direction:column; gap:10px;">
        <div style="font-weight:700; font-size:0.92rem;">📈 YouTube Data API v3 (ดึงยอดวิว/ยอดซับ)</div>
        <p style="font-size:0.78rem; color:var(--text-muted); line-height:1.4;">
          คีย์เก็บเฉพาะฝั่งแอดมินเท่านั้น ยอดวิวที่ดึงได้จะซิงก์ให้เพื่อนทุกคนในทีมเห็น
        </p>
        <input type="password" id="admin-input-yt-key" value="${state.ytKey}" placeholder="AIzaSy..." style="font-size:0.85rem;">
        
        <div style="display:flex; gap:8px;">
          <button id="btn-save-yt-key" class="btn-solid-primary" style="flex:1; justify-content:center;">
            บันทึก API Key
          </button>
          <button id="btn-fetch-yt-stats" class="btn-secondary" style="justify-content:center;">
            🔄 ดึงยอดวิวตอนนี้
          </button>
        </div>
      </div>

      <!-- Section: Activity Log -->
      <div class="glass-panel" style="padding:14px; display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-weight:700; font-size:0.92rem;">📜 บันทึกกิจกรรมระบบ (Activity Log)</div>
          <span style="font-size:0.75rem; color:var(--text-muted);">${state.logs.length} รายการ</span>
        </div>
        <div style="font-size:0.75rem; color:var(--text-muted); line-height:1.6; font-family:monospace; background:var(--surface-muted); padding:10px; border-radius:8px; max-height:160px; overflow-y:auto;">
          ${state.logs.map(l => `
            <div>
              <span style="color:#64748b;">${new Date(l.timestamp).toLocaleTimeString('th-TH')}</span>
              <b style="color:${l.type === 'ERROR' ? '#ef4444' : 'var(--color-primary-600)'};">[${l.type}]</b>
              <span>${l.author}:</span>
              <span>${l.message}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('btn-close-admin-modal')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // Save Team BG
  document.getElementById('btn-save-team-bg')?.addEventListener('click', () => {
    const url = (document.getElementById('admin-input-bg-url') as HTMLInputElement).value.trim();
    setState({ teamBgUrl: url });
    showToast('บันทึกภาพพื้นหลังทีมเรียบร้อยแล้ว ทุกคนจะเห็นตรงกัน', 'success');
  });

  document.getElementById('btn-clear-team-bg')?.addEventListener('click', () => {
    setState({ teamBgUrl: '' });
    showToast('ลบภาพพื้นหลังทีมแล้ว', 'info');
  });

  // Save Discord
  document.getElementById('btn-save-discord-wh')?.addEventListener('click', () => {
    const wh = (document.getElementById('admin-input-discord-wh') as HTMLInputElement).value.trim();
    setState({ discordWebhook: wh });
    showToast('บันทึก Discord Webhook แล้ว', 'success');
  });

  document.getElementById('btn-test-discord-wh')?.addEventListener('click', async () => {
    await sendDiscordTodaySchedule();
  });

  // Save YouTube Key
  document.getElementById('btn-save-yt-key')?.addEventListener('click', () => {
    const key = (document.getElementById('admin-input-yt-key') as HTMLInputElement).value.trim();
    setState({ ytKey: key });
    showToast('บันทึก YouTube API Key แล้ว', 'success');
  });

  document.getElementById('btn-fetch-yt-stats')?.addEventListener('click', async () => {
    await refreshYouTubeStats();
  });
}
