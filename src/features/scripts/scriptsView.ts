/**
 * Content Scripts Feature (Linked to Songs)
 */
import { AppState, setState, getState, ContentScript } from '../../core/store';
import { showToast } from '../../ui/toast';

export function renderScriptsView(state: AppState): string {
  return `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h2 style="font-size:1.3rem; font-weight:700;">สคริปต์และบทพูด (Content Scripts)</h2>
          <p style="font-size:0.85rem; color:var(--text-muted);">เขียนบทพูด แคปชัน ผูกกับเพลงของทีม</p>
        </div>
        <button id="btn-add-script" class="btn-solid-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>เขียนสคริปต์ใหม่</span>
        </button>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:12px;">
        ${state.scripts.length === 0 ? `
          <div class="glass-panel" style="grid-column:1/-1; text-align:center; padding:36px 16px;">
            <div style="font-size:2.5rem; margin-bottom:8px;">📝</div>
            <div style="font-weight:700; margin-bottom:4px;">ยังไม่มีสคริปต์ในระบบ</div>
            <p style="color:var(--text-muted); font-size:0.85rem;">กดปุ่มด้านบนเพื่อเริ่มเขียนสคริปต์แรก</p>
          </div>
        ` : state.scripts.map(sc => {
          const linkedSong = state.songs.find(s => s.id === sc.linkedSongId);

          return `
            <div class="glass-panel" style="display:flex; flex-direction:column; justify-content:space-between; gap:10px; padding:16px;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                  <h3 style="font-size:1.05rem; font-weight:700;">${sc.title}</h3>
                  <button class="btn-del-script btn-secondary" data-id="${sc.id}" style="min-height:28px; padding:2px 8px; font-size:0.75rem; color:#ef4444;">
                    ลบ
                  </button>
                </div>

                <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.5; white-space:pre-wrap; max-height:100px; overflow:hidden; text-overflow:ellipsis;">
                  ${sc.content || '(ยังไม่มีเนื้อหา)'}
                </p>
              </div>

              ${linkedSong ? `
                <div style="display:inline-flex; align-items:center; gap:6px; font-size:0.75rem; background:rgba(255,92,138,0.1); color:var(--color-primary-600); padding:4px 8px; border-radius:6px; width:fit-content; font-weight:600;">
                  🎵 ${linkedSong.title}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

export function attachScriptsEvents(): void {
  document.getElementById('btn-add-script')?.addEventListener('click', () => openScriptModal());

  document.querySelectorAll('.btn-del-script').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id;
      if (!confirm('คุณต้องการลบสคริปต์นี้ใช่หรือไม่?')) return;

      const state = getState();
      setState({ scripts: state.scripts.filter(s => s.id !== id) });
      showToast('ลบสคริปต์เรียบร้อยแล้ว', 'info');
    });
  });
}

function openScriptModal(): void {
  const existing = document.getElementById('modal-script');
  if (existing) existing.remove();

  const state = getState();
  const modal = document.createElement('div');
  modal.id = 'modal-script';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);
    z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px;
  `;

  modal.innerHTML = `
    <div class="glass-panel" style="width:100%; max-width:480px; padding:20px; display:flex; flex-direction:column; gap:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="font-size:1.15rem; font-weight:700;">📝 เพิ่มสคริปต์ใหม่</h3>
        <button id="btn-close-script-modal" style="font-size:1.4rem; padding:4px 8px;">✕</button>
      </div>

      <form id="form-script" style="display:flex; flex-direction:column; gap:12px;">
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:4px;">ชื่อสคริปต์ *</label>
          <input type="text" id="sc-title" placeholder="เช่น บทพูดเปิดคลิป..." required autofocus>
        </div>

        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:4px;">ผูกกับเพลง (ถ้ามี)</label>
          <select id="sc-song">
            <option value="">— ไม่ผูกเพลง —</option>
            ${state.songs.map(s => `<option value="${s.id}">${s.title}</option>`).join('')}
          </select>
        </div>

        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:4px;">เนื้อหาสคริปต์</label>
          <textarea id="sc-content" placeholder="พิมพ์เนื้อหาสคริปต์ที่นี่..." style="height:120px;"></textarea>
        </div>

        <button type="submit" class="btn-solid-primary" style="justify-content:center;">
          ✓ บันทึกสคริปต์
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('btn-close-script-modal')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  modal.querySelector('#form-script')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = (document.getElementById('sc-title') as HTMLInputElement).value.trim();
    if (!title) return;

    const linkedSongId = (document.getElementById('sc-song') as HTMLSelectElement).value || undefined;
    const content = (document.getElementById('sc-content') as HTMLTextAreaElement).value.trim();

    const newScript: ContentScript = {
      id: `script-${Date.now()}`,
      title,
      content,
      linkedSongId,
      updatedAt: new Date().toISOString()
    };

    setState({ scripts: [newScript, ...state.scripts] });
    modal.remove();
    showToast(`เพิ่มสคริปต์ "${title}" เรียบร้อยแล้ว`, 'success');
  });
}
