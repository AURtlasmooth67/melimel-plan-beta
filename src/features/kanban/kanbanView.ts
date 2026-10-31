/**
 * Kanban Board View with Drag & Drop, Status Progression, and Confetti Celebration on 'Done'
 */
import { AppState, setState, getState } from '../../core/store';
import { ColumnKind } from '../scheduler/scheduler';
import { showToast } from '../../ui/toast';
import confetti from 'canvas-confetti';

export function renderKanbanView(state: AppState): string {
  return `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h2 style="font-size:1.3rem; font-weight:700;">คัมบังสถานะงาน (Kanban Board)</h2>
          <p style="font-size:0.85rem; color:var(--text-muted);">ลากการ์ดหรือแตะปุ่มเพื่อเลื่อนขั้นตอนเพลง</p>
        </div>
      </div>

      <!-- Columns Horizontal Scroll Container -->
      <div style="display:flex; gap:14px; overflow-x:auto; padding-bottom:16px; scrollbar-width:thin;">
        ${state.columns.map(col => {
          const songsInCol = state.songs.filter(s => s.kind === col.kind);

          return `
            <div class="kanban-column glass-panel" data-kind="${col.kind}" style="min-width:270px; max-width:320px; flex:1; display:flex; flex-direction:column; gap:12px; padding:14px; background:var(--surface-muted);">
              <!-- Column Header -->
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="width:10px; height:10px; border-radius:50%; background:${col.color};"></span>
                  <span style="font-weight:700; font-size:0.95rem;">${col.name}</span>
                </div>
                <span style="font-size:0.75rem; font-weight:700; background:rgba(0,0,0,0.06); padding:2px 8px; border-radius:999px;">
                  ${songsInCol.length}
                </span>
              </div>

              <!-- Column Song Cards Drop Target -->
              <div class="kanban-drop-zone" data-kind="${col.kind}" style="display:flex; flex-direction:column; gap:10px; min-height:120px;">
                ${songsInCol.length === 0 ? `
                  <div style="border:2px dashed var(--border-subtle); border-radius:12px; padding:24px 10px; text-align:center; color:var(--text-muted); font-size:0.78rem;">
                    ลากเพลงมาวางที่นี่
                  </div>
                ` : songsInCol.map(song => `
                  <div class="kanban-card glass-panel" draggable="true" data-id="${song.id}" style="padding:12px; cursor:grab; user-select:none;">
                    <div style="font-weight:700; font-size:0.92rem; margin-bottom:4px;">${song.title}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px;">👤 ${song.singers.join(', ')}</div>

                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <span class="badge-status" data-kind="${song.kind}" style="font-size:0.68rem; padding:2px 6px;">
                        ${col.name}
                      </span>

                      <!-- Mobile Tap Progression Menu -->
                      <select class="select-move-stage" data-id="${song.id}" style="width:auto; padding:2px 6px; font-size:0.75rem; min-height:30px; border-radius:8px;">
                        ${state.columns.map(targetCol => `
                          <option value="${targetCol.kind}" ${targetCol.kind === song.kind ? 'selected' : ''}>
                            ย้ายไป: ${targetCol.name}
                          </option>
                        `).join('')}
                      </select>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

export function attachKanbanEvents(): void {
  // Drag & drop logic
  let draggedSongId: string | null = null;

  document.querySelectorAll('.kanban-card').forEach(card => {
    card.addEventListener('dragstart', (e) => {
      draggedSongId = (e.currentTarget as HTMLElement).dataset.id || null;
      (e.currentTarget as HTMLElement).style.opacity = '0.5';
    });
    card.addEventListener('dragend', (e) => {
      (e.currentTarget as HTMLElement).style.opacity = '1';
    });
  });

  document.querySelectorAll('.kanban-drop-zone').forEach(zone => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).style.background = 'rgba(255,92,138,0.06)';
    });
    zone.addEventListener('dragleave', (e) => {
      (e.currentTarget as HTMLElement).style.background = 'transparent';
    });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).style.background = 'transparent';
      const targetKind = (e.currentTarget as HTMLElement).dataset.kind as ColumnKind;
      if (draggedSongId && targetKind) {
        updateSongKind(draggedSongId, targetKind);
      }
    });
  });

  // Mobile select change
  document.querySelectorAll('.select-move-stage').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const songId = (e.currentTarget as HTMLElement).dataset.id;
      const targetKind = (e.target as HTMLSelectElement).value as ColumnKind;
      if (songId && targetKind) {
        updateSongKind(songId, targetKind);
      }
    });
  });
}

function updateSongKind(songId: string, newKind: ColumnKind): void {
  const state = getState();
  const song = state.songs.find(s => s.id === songId);
  if (!song || song.kind === newKind) return;

  const oldKind = song.kind;
  const updatedSongs = state.songs.map(s => {
    if (s.id === songId) return { ...s, kind: newKind };
    return s;
  });

  setState({ songs: updatedSongs });

  // Celebration if changed to 'done' (โพสต์แล้ว)
  if (newKind === 'done' && oldKind !== 'done') {
    if (!state.reducedMotion) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#ff5c8a', '#10b981', '#14b8a6', '#ffd166']
        });
      } catch (e) {
        // Safe fallback
      }
    }
    showToast(`🎉 ยินดีด้วย! "${song.title}" โพสต์แล้ว!`, 'success');
  } else {
    showToast(`เปลี่ยนสถานะ "${song.title}" เรียบร้อยแล้ว`, 'info');
  }
}
