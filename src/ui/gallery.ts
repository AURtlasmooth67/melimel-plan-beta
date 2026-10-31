/**
 * Component Gallery (/dev/ui) for inspecting all tokens and states
 */
export function renderComponentGallery(): string {
  return `
    <div style="display:flex; flex-direction:column; gap:24px;">
      <div>
        <h2 style="font-size:1.4rem; font-weight:700; margin-bottom:4px;">Component Gallery & States (/dev/ui)</h2>
        <p style="color:var(--text-muted); font-size:0.9rem;">ตรวจสอบ Design Tokens และสถานะต่างๆ ของคอมโพเนนต์ตามระบบใหม่</p>
      </div>

      <!-- Section: Status Badges -->
      <div class="glass-panel">
        <h3 style="font-size:1rem; font-weight:700; margin-bottom:12px;">1. Status Badges (สี + ไอคอน + ข้อความ)</h3>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <span class="badge-status" data-kind="todo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/></svg>
            ยังไม่ทำ / รอดำเนินการ
          </span>
          <span class="badge-status" data-kind="recording">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="6"/></svg>
            กำลังอัดเสียง
          </span>
          <span class="badge-status" data-kind="post-recording">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            มิกซ์ / ตัดต่อ
          </span>
          <span class="badge-status" data-kind="done">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            โพสต์แล้ว (เสร็จสิ้น)
          </span>
        </div>
      </div>

      <!-- Section: Interactive Buttons -->
      <div class="glass-panel">
        <h3 style="font-size:1rem; font-weight:700; margin-bottom:12px;">2. Interactive Buttons</h3>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <button class="btn-solid-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>ปุ่มหลัก (Primary Button)</span>
          </button>
          <button class="btn-secondary">
            <span>ปุ่มรอง (Secondary Button)</span>
          </button>
        </div>
      </div>

      <!-- Section: Skeletons & Loading State -->
      <div class="glass-panel">
        <h3 style="font-size:1rem; font-weight:700; margin-bottom:12px;">3. Skeleton Loading State (กำลังโหลด)</h3>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div class="skeleton" style="height:20px; width:60%;"></div>
          <div class="skeleton" style="height:16px; width:90%;"></div>
          <div class="skeleton" style="height:44px; width:100%; border-radius:12px; margin-top:8px;"></div>
        </div>
      </div>

      <!-- Section: Empty State -->
      <div class="glass-panel" style="text-align:center; padding:32px 16px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-500)" stroke-width="1.8" style="margin-bottom:12px;">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div style="font-weight:700; font-size:1.1rem; margin-bottom:4px;">สถานะว่าง (Empty State)</div>
        <p style="color:var(--text-muted); font-size:0.88rem; max-width:320px; margin:0 auto 16px;">ยังไม่มีข้อมูลในส่วนนี้ คุณสามารถเริ่มต้นได้ด้วยการกดปุ่มด้านล่าง</p>
        <button class="btn-solid-primary" style="margin:0 auto;">+ เพิ่มรายการแรก</button>
      </div>
    </div>
  `;
}
