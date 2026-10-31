/**
 * Fast Song Creation (< 3 taps, < 10 seconds) with Progressive Disclosure
 */
import { getState, setState } from '../../core/store';
import { Song, ColumnKind } from '../scheduler/scheduler';
import { showToast } from '../../ui/toast';

export function openAddSongModal(): void {
  const existingModal = document.getElementById('modal-add-song');
  if (existingModal) existingModal.remove();

  const state = getState();
  const defaultMaker = state.members[0]?.name || 'ราคุ (แอดมิน)';

  const modal = document.createElement('div');
  modal.id = 'modal-add-song';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);
    z-index: 200; display: flex; align-items: flex-end; justify-content: center;
  `;

  modal.innerHTML = `
    <div class="glass-panel" style="width:100%; max-width:520px; border-bottom-left-radius:0; border-bottom-right-radius:0; padding:20px 20px 32px; animation: sheet-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h3 style="font-size:1.15rem; font-weight:700; display:flex; align-items:center; gap:8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>เพิ่มเพลงใหม่</span>
        </h3>
        <button id="btn-close-song-modal" style="font-size:1.4rem; padding:4px 8px; color:var(--text-muted);">✕</button>
      </div>

      <form id="form-quick-song" style="display:flex; flex-direction:column; gap:14px;">
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:6px;">ชื่อเพลง * (กรอกแค่ชื่อก็บันทึกได้ทันที)</label>
          <input type="text" id="input-song-title" placeholder="เช่น ヴァンパイア, アイドル..." autofocus required>
        </div>

        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:6px;">ผู้ทำ (ค่าเริ่มต้น: ฉัน)</label>
          <select id="select-song-maker">
            ${state.members.map(m => `<option value="${m.name}" ${m.name === defaultMaker ? 'selected' : ''}>${m.name}</option>`).join('')}
          </select>
        </div>

        <!-- Progressive disclosure toggle -->
        <button type="button" id="btn-toggle-details" style="text-align:left; font-size:0.82rem; color:var(--color-primary-600); font-weight:600; padding:4px 0;">
          + ใส่รายละเอียดเพิ่มเติม (ประเภท, สถานะ, แท็ก)
        </button>

        <div id="extra-song-fields" style="display:none; flex-direction:column; gap:12px; padding:12px; background:var(--surface-muted); border-radius:12px;">
          <div>
            <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:4px;">ประเภท</label>
            <select id="select-song-type">
              <option value="solo">เดี่ยว (Solo)</option>
              <option value="duet">คู่ (Duet)</option>
              <option value="group">กลุ่ม (Group)</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:4px;">สถานะเริ่มต้น</label>
            <select id="select-song-kind">
              <option value="todo">ยังไม่ทำ / ซ้อม</option>
              <option value="recording">กำลังอัดเสียง</option>
              <option value="post-recording">มิกซ์ / ตัดต่อ</option>
              <option value="done">โพสต์แล้ว</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:4px;">แท็ก (คั่นด้วยจุลภาค)</label>
            <input type="text" id="input-song-tags" placeholder="Cover, Vocaloid">
          </div>
        </div>

        <button type="submit" class="btn-solid-primary" style="margin-top:6px; width:100%; justify-content:center;">
          <span>บันทึกเพลง (≤ 3 แตะ)</span>
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const titleInput = document.getElementById('input-song-title') as HTMLInputElement;
  setTimeout(() => titleInput?.focus(), 50);

  document.getElementById('btn-close-song-modal')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  const toggleBtn = document.getElementById('btn-toggle-details')!;
  const extraFields = document.getElementById('extra-song-fields')!;
  toggleBtn.addEventListener('click', () => {
    const isHidden = extraFields.style.display === 'none';
    extraFields.style.display = isHidden ? 'flex' : 'none';
    toggleBtn.textContent = isHidden ? '- ซ่อนรายละเอียดเพิ่มเติม' : '+ ใส่รายละเอียดเพิ่มเติม (ประเภท, สถานะ, แท็ก)';
  });

  const form = document.getElementById('form-quick-song') as HTMLFormElement;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    if (!title) return;

    const maker = (document.getElementById('select-song-maker') as HTMLSelectElement).value;
    const type = ((document.getElementById('select-song-type') as HTMLSelectElement)?.value || 'solo') as any;
    const kind = ((document.getElementById('select-song-kind') as HTMLSelectElement)?.value || 'todo') as ColumnKind;
    const tagsInput = (document.getElementById('input-song-tags') as HTMLInputElement)?.value || '';
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    const newSong: Song = {
      id: `song-${Date.now()}`,
      title,
      singers: [maker],
      type,
      kind,
      channel: 'main',
      tags
    };

    setState({
      songs: [newSong, ...state.songs]
    });

    modal.remove();
    showToast(`เพิ่มเพลง "${title}" เรียบร้อยแล้ว`, 'success');
  });
}
