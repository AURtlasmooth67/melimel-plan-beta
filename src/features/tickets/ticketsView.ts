/**
 * Team Tickets System View: Multi-assignee, Priority, Due Date, Comments,
 * and One-Click Copy Text for Chat
 */
import { AppState, setState, getState, Ticket } from '../../core/store';
import { formatTicketShareText, PRIORITY_LABELS, STATUS_LABELS } from './ticketShare';
import { showToast } from '../../ui/toast';

export function renderTicketsView(state: AppState): string {
  return `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h2 style="font-size:1.3rem; font-weight:700;">ตั๋วงานของทีม (Task Tickets)</h2>
          <p style="font-size:0.85rem; color:var(--text-muted);">มอบหมายงาน ติดตามสถานะ และส่งต่อในแชท</p>
        </div>
        <button id="btn-create-ticket" class="btn-solid-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>สร้างตั๋วงานใหม่</span>
        </button>
      </div>

      <!-- Tickets List -->
      <div style="display:flex; flex-direction:column; gap:12px;">
        ${state.tickets.length === 0 ? `
          <div class="glass-panel" style="text-align:center; padding:36px 16px;">
            <div style="font-size:2.5rem; margin-bottom:8px;">🎟️</div>
            <div style="font-weight:700; margin-bottom:4px;">ยังไม่มีตั๋วงานในระบบ</div>
            <p style="color:var(--text-muted); font-size:0.85rem;">สร้างตั๋วงานแรกเพื่อเริ่มประสานงานกับเพื่อนในทีม</p>
          </div>
        ` : state.tickets.map(ticket => {
          const prioColors = ['#64748b', '#d97706', '#ef4444'];
          const statusColors = ['#64748b', '#2563eb', '#8b5cf6', '#10b981'];

          return `
            <div class="glass-panel" style="display:flex; flex-direction:column; gap:10px; padding:16px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
                <div>
                  <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                    <span style="font-size:0.75rem; font-weight:700; padding:2px 8px; border-radius:6px; background:${prioColors[ticket.priority]}22; color:${prioColors[ticket.priority]};">
                      ความสำคัญ: ${PRIORITY_LABELS[ticket.priority]}
                    </span>
                    <span style="font-size:0.75rem; font-weight:700; padding:2px 8px; border-radius:6px; background:${statusColors[ticket.status]}22; color:${statusColors[ticket.status]};">
                      ${STATUS_LABELS[ticket.status]}
                    </span>
                  </div>
                  <h3 style="font-size:1.05rem; font-weight:700;">${ticket.title}</h3>
                </div>

                <div style="display:flex; gap:6px;">
                  <button class="btn-copy-ticket-text btn-secondary" data-id="${ticket.id}" style="min-height:34px; padding:4px 10px; font-size:0.8rem;" title="คัดลอกข้อความส่งต่อในแชท">
                    📋 ส่งต่อแชท
                  </button>
                  <button class="btn-delete-ticket btn-secondary" data-id="${ticket.id}" style="min-height:34px; padding:4px 8px; font-size:0.8rem; color:#ef4444;">
                    🗑️
                  </button>
                </div>
              </div>

              ${ticket.desc ? `<p style="font-size:0.85rem; color:var(--text-muted); line-height:1.5;">${ticket.desc}</p>` : ''}

              <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; color:var(--text-muted); border-top:1px solid var(--border-subtle); padding-top:8px;">
                <div>
                  👤 มอบหมาย: <b>${ticket.assignees.join(', ') || 'ทุกคน'}</b>
                  ${ticket.dueDate ? ` • 📅 กำหนดส่ง: <b>${ticket.dueDate}</b>` : ''}
                </div>

                <!-- Cycle Status Button -->
                <button class="btn-cycle-ticket-status btn-secondary" data-id="${ticket.id}" style="min-height:28px; padding:2px 8px; font-size:0.75rem;">
                  เปลี่ยนสถานะ ❯
                </button>
              </div>

              <!-- Comments Section -->
              ${ticket.comments && ticket.comments.length > 0 ? `
                <div style="display:flex; flex-direction:column; gap:4px; padding:8px 10px; background:var(--surface-muted); border-radius:8px; font-size:0.78rem;">
                  ${ticket.comments.map(c => `
                    <div><b>${c.author}:</b> ${c.text}</div>
                  `).join('')}
                </div>
              ` : ''}

              <div style="display:flex; gap:6px;">
                <input type="text" class="input-comment" data-id="${ticket.id}" placeholder="พิมพ์คอมเมนต์ตอบกลับ..." style="min-height:34px; padding:6px 10px; font-size:0.8rem; flex:1;">
                <button class="btn-add-comment btn-secondary" data-id="${ticket.id}" style="min-height:34px; padding:4px 10px; font-size:0.8rem;">
                  💬 ส่ง
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

export function attachTicketsEvents(): void {
  document.getElementById('btn-create-ticket')?.addEventListener('click', () => openCreateTicketModal());

  // Copy share text to clipboard
  document.querySelectorAll('.btn-copy-ticket-text').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const tid = (e.currentTarget as HTMLElement).dataset.id;
      const state = getState();
      const ticket = state.tickets.find(t => t.id === tid);
      if (!ticket) return;

      const shareText = formatTicketShareText(ticket);
      try {
        await navigator.clipboard.writeText(shareText);
        showToast('คัดลอกข้อความตั๋วงานแล้ว พร้อมวางในแชท!', 'success');
      } catch (err) {
        // Fallback prompt
        prompt('คัดลอกข้อความตั๋วงานด้านล่างนี้ได้เลย:', shareText);
      }
    });
  });

  // Cycle status
  document.querySelectorAll('.btn-cycle-ticket-status').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tid = (e.currentTarget as HTMLElement).dataset.id;
      const state = getState();
      const ticket = state.tickets.find(t => t.id === tid);
      if (!ticket) return;

      const nextStatus = ((ticket.status + 1) % 4) as any;
      const updatedTickets = state.tickets.map(t => t.id === tid ? { ...t, status: nextStatus, updatedAt: new Date().toISOString() } : t);
      setState({ tickets: updatedTickets });
      showToast(`เปลี่ยนสถานะตั๋วเป็น "${STATUS_LABELS[nextStatus]}"`, 'info');
    });
  });

  // Add Comment
  document.querySelectorAll('.btn-add-comment').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tid = (e.currentTarget as HTMLElement).dataset.id;
      const input = document.querySelector(`.input-comment[data-id="${tid}"]`) as HTMLInputElement;
      if (!input || !input.value.trim()) return;

      const text = input.value.trim();
      const state = getState();
      const myName = state.members[0]?.name || 'สมาชิก';

      const updatedTickets = state.tickets.map(t => {
        if (t.id === tid) {
          const currentComments = t.comments || [];
          return {
            ...t,
            comments: [...currentComments, { author: myName, text, date: new Date().toISOString() }],
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      });

      setState({ tickets: updatedTickets });
      input.value = '';
      showToast('เพิ่มคอมเมนต์แล้ว', 'success');
    });
  });

  // Delete Ticket
  document.querySelectorAll('.btn-delete-ticket').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tid = (e.currentTarget as HTMLElement).dataset.id;
      if (!confirm('คุณต้องการลบตั๋วงานนี้ใช่หรือไม่?')) return;

      const state = getState();
      setState({ tickets: state.tickets.filter(t => t.id !== tid) });
      showToast('ลบตั๋วงานเรียบร้อยแล้ว', 'info');
    });
  });
}

function openCreateTicketModal(): void {
  const existing = document.getElementById('modal-create-ticket');
  if (existing) existing.remove();

  const state = getState();
  const modal = document.createElement('div');
  modal.id = 'modal-create-ticket';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);
    z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px;
  `;

  modal.innerHTML = `
    <div class="glass-panel" style="width:100%; max-width:480px; padding:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <h3 style="font-size:1.15rem; font-weight:700;">🎟️ สร้างตั๋วงานใหม่</h3>
        <button id="btn-close-ticket-modal" style="font-size:1.4rem; padding:4px 8px;">✕</button>
      </div>

      <form id="form-ticket" style="display:flex; flex-direction:column; gap:12px;">
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:4px;">หัวข้องาน *</label>
          <input type="text" id="t-input-title" placeholder="เช่น มิกซ์เพลง, วาดรูปปก..." required autofocus>
        </div>

        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:4px;">รายละเอียด</label>
          <textarea id="t-input-desc" placeholder="อธิบายงานหรือแนบลิงก์ไดรฟ์..." style="height:70px;"></textarea>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div>
            <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:4px;">ผู้รับมอบหมาย</label>
            <select id="t-input-assignee">
              ${state.members.map(m => `<option value="${m.name}">${m.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:4px;">ความสำคัญ</label>
            <select id="t-input-prio">
              <option value="0">ปกติ</option>
              <option value="1">ด่วน</option>
              <option value="2">ด่วนมาก</option>
            </select>
          </div>
        </div>

        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:4px;">กำหนดส่ง (Due Date)</label>
          <input type="date" id="t-input-due">
        </div>

        <button type="submit" class="btn-solid-primary" style="margin-top:6px; width:100%; justify-content:center;">
          ✓ สร้างตั๋วงาน
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('btn-close-ticket-modal')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  modal.querySelector('#form-ticket')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = (document.getElementById('t-input-title') as HTMLInputElement).value.trim();
    if (!title) return;

    const desc = (document.getElementById('t-input-desc') as HTMLTextAreaElement).value.trim();
    const assignee = (document.getElementById('t-input-assignee') as HTMLSelectElement).value;
    const prio = parseInt((document.getElementById('t-input-prio') as HTMLSelectElement).value) as any;
    const due = (document.getElementById('t-input-due') as HTMLInputElement).value;

    const newTicket: Ticket = {
      id: `ticket-${Date.now()}`,
      title,
      desc,
      assignees: [assignee],
      priority: prio,
      dueDate: due || undefined,
      status: 0,
      updatedAt: new Date().toISOString()
    };

    setState({ tickets: [newTicket, ...state.tickets] });
    modal.remove();
    showToast(`🎟️ สร้างตั๋วงาน "${title}" เรียบร้อยแล้ว`, 'success');
  });
}
