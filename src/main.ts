import './ui/main.css';
import { getState, setState, subscribeStore, AppState } from './core/store';
import { getAuthState, subscribeAuthState, loginWithGoogle, logoutUser } from './core/auth';
import { showToast } from './ui/toast';
import { renderComponentGallery } from './ui/gallery';

// Phase 1 Views & Handlers
import { renderTodayHome, attachTodayHomeEvents } from './features/home/todayView';
import { renderSongLibrary, attachSongLibraryEvents } from './features/songs/libraryView';
import { renderCalendarView, attachCalendarEvents } from './features/calendar/calendarView';
import { renderKanbanView, attachKanbanEvents } from './features/kanban/kanbanView';
import { renderTicketsView, attachTicketsEvents } from './features/tickets/ticketsView';
import { renderScriptsView, attachScriptsEvents } from './features/scripts/scriptsView';
import { renderTeamToolsView, attachTeamToolsEvents } from './features/teamTools/teamToolsView';
import { renderMoreHub, attachMoreHubEvents } from './features/more/moreHubView';
import { renderPlannerImageView, attachPlannerImageEvents } from './features/plannerImage/plannerImageModal';

// Register Service Worker for PWA
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.info('[PWA] Service Worker registration skipped in current host:', err);
    });
  });
}

const appEl = document.getElementById('app')!;

function renderApp() {
  const state = getState();
  const authState = getAuthState();

  // Apply theme & reduced motion attributes
  document.documentElement.setAttribute('data-theme', state.theme);
  document.documentElement.setAttribute('data-reduced-motion', String(state.reducedMotion));

  // Team background
  const bgOverlay = document.getElementById('team-background-overlay');
  if (bgOverlay) {
    if (state.teamBgUrl) {
      bgOverlay.style.backgroundImage = `url("${state.teamBgUrl}")`;
      bgOverlay.style.opacity = '0.15';
    } else {
      bgOverlay.style.backgroundImage = 'none';
    }
  }

  // If auth is still checking
  if (authState.loading) {
    appEl.innerHTML = `
      <div style="min-height:100dvh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px;">
        <div class="skeleton" style="width:64px; height:64px; border-radius:50%;"></div>
        <div style="font-weight:600; color:var(--text-muted);">กำลังเชื่อมต่อ MELiMEL FRUITY♡ BETA...</div>
      </div>
    `;
    return;
  }

  // Login Gate Screen
  if (!authState.user) {
    appEl.innerHTML = `
      <div style="min-height:100dvh; display:flex; align-items:center; justify-content:center; padding:20px;">
        <div class="glass-panel" style="max-width:400px; width:100%; text-align:center; padding:32px 24px;">
          <div style="display:inline-flex; align-items:center; gap:8px; margin-bottom:16px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-500)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span style="font-size:1.3rem; font-weight:800; color:var(--color-primary-600);">MELiMEL FRUITY♡</span>
            <span class="beta-pill">BETA</span>
          </div>
          <h1 style="font-size:1.2rem; font-weight:700; margin-bottom:8px;">ระบบตารางคอนเทนต์ครีเอเตอร์</h1>
          <p style="color:var(--text-muted); font-size:0.88rem; line-height:1.5; margin-bottom:24px;">
            กรุณาล็อกอินด้วยบัญชี Google เพื่อเข้าสู่ระบบทดสอบเฉพาะสมาชิกในทีม
          </p>

          <button id="btn-login" class="btn-solid-primary" style="width:100%; justify-content:center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.35 11.1h-9.17v2.98h5.27c-.23 1.25-.93 2.31-1.98 3.02v2.51h3.2c1.88-1.73 2.96-4.28 2.96-7.3 0-.7-.06-1.37-.18-2.21z"/>
              <path d="M12.18 22c2.7 0 4.96-.89 6.62-2.42l-3.2-2.51c-.9.6-2.05.96-3.42.96-2.63 0-4.86-1.77-5.66-4.15H3.2v2.6C4.85 19.74 8.24 22 12.18 22z"/>
              <path d="M6.52 13.88c-.2-.6-.32-1.24-.32-1.88s.12-1.28.32-1.88V7.52H3.2A10.02 10.02 0 0 0 2 12c0 1.62.39 3.14 1.2 4.48l3.32-2.6z"/>
              <path d="M12.18 5.96c1.47 0 2.78.51 3.82 1.5l2.86-2.86C17.13 2.98 14.87 2 12.18 2 8.24 2 4.85 4.26 3.2 7.52l3.32 2.6c.8-2.38 3.03-4.16 5.66-4.16z"/>
            </svg>
            <span>เข้าสู่ระบบด้วย Google</span>
          </button>

          <div style="margin-top:24px; padding-top:16px; border-top:1px solid var(--border-subtle); font-size:0.75rem; color:var(--text-sub);">
            🔒 ปลอดภัยด้วย Firebase Security Rules (แยกจากเว็บเดิม 100%)
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-login')?.addEventListener('click', async () => {
      try {
        await loginWithGoogle();
        showToast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับครับ', 'success');
      } catch (err: any) {
        showToast('การล็อกอินล้มเหลว: ' + err.message, 'error');
      }
    });
    return;
  }

  // Not a registered team member or admin
  if (!authState.isMember) {
    appEl.innerHTML = `
      <div style="min-height:100dvh; display:flex; align-items:center; justify-content:center; padding:20px;">
        <div class="glass-panel" style="max-width:420px; text-align:center; padding:32px 24px;">
          <div style="font-size:3rem; margin-bottom:12px;">🚫</div>
          <h2 style="font-weight:700; margin-bottom:8px;">ยังไม่อยู่ในรายชื่อผู้ที่เข้าได้</h2>
          <p style="color:var(--text-muted); font-size:0.88rem; margin-bottom:20px;">
            อีเมล <b>${authState.user.email}</b> ยังไม่ได้รับอนุญาตให้เข้าใช้งานเว็บทดสอบ กรุณาติดต่อแอดมิน (${import.meta.env.VITE_INITIAL_ADMIN_EMAIL})
          </p>
          <button id="btn-logout-unauth" class="btn-secondary" style="width:100%;">ออกจากระบบ</button>
        </div>
      </div>
    `;
    document.getElementById('btn-logout-unauth')?.addEventListener('click', () => logoutUser());
    return;
  }

  // Authenticated Member Main App View
  appEl.innerHTML = `
    <!-- Top Sticky Header -->
    <header class="top-header">
      <div class="brand-badge">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        <span>MELiMEL</span>
        <span class="beta-pill">BETA</span>
      </div>

      <div style="display:flex; align-items:center; gap:8px;">
        <span style="display:inline-flex; align-items:center; gap:4px; font-size:0.75rem; color:#10b981; background:rgba(16,185,129,0.1); padding:4px 8px; border-radius:999px;">
          <span style="width:6px; height:6px; border-radius:50%; background:#10b981;"></span>
          ซิงก์เรียลไทม์
        </span>

        <button id="btn-theme-toggle" class="btn-secondary" style="min-height:36px; padding:6px 10px;" aria-label="สลับธีม">
          ${state.theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <button id="btn-user-profile" class="btn-secondary" style="min-height:36px; padding:6px 10px;" title="ออกจากระบบ (${authState.user.email})">
          🚪
        </button>
      </div>
    </header>

    <!-- Main Dynamic Viewport -->
    <main class="main-viewport">
      ${renderCurrentTabContent(state)}
    </main>

    <!-- Bottom App Navigation (Max 5 items) -->
    <nav class="bottom-nav">
      <button class="nav-tab-btn ${state.activeTab === 'today' ? 'active' : ''}" data-tab="today">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>วันนี้</span>
      </button>

      <button class="nav-tab-btn ${state.activeTab === 'songs' ? 'active' : ''}" data-tab="songs">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        <span>คลังเพลง</span>
      </button>

      <button class="nav-tab-btn ${state.activeTab === 'calendar' ? 'active' : ''}" data-tab="calendar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span>ปฏิทิน</span>
      </button>

      <button class="nav-tab-btn ${state.activeTab === 'kanban' ? 'active' : ''}" data-tab="kanban">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
        <span>คัมบัง</span>
      </button>

      <button class="nav-tab-btn ${state.activeTab === 'more' || state.activeTab === 'dev-ui' ? 'active' : ''}" data-tab="more">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        <span>เพิ่มเติม</span>
      </button>
    </nav>
  `;

  // Attach Top & Nav Events
  document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
    setState({ theme: state.theme === 'light' ? 'dark' : 'light' });
  });

  document.getElementById('btn-user-profile')?.addEventListener('click', async () => {
    if (confirm(`คุณต้องการออกจากระบบจาก ${authState.user?.email} ใช่หรือไม่?`)) {
      await logoutUser();
      showToast('ออกจากระบบแล้ว', 'info');
    }
  });

  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetTab = (e.currentTarget as HTMLElement).dataset.tab as any;
      if (targetTab) setState({ activeTab: targetTab });
    });
  });

  // Attach View-Specific Events
  if (state.activeTab === 'today') {
    attachTodayHomeEvents();
  } else if (state.activeTab === 'songs') {
    attachSongLibraryEvents();
  } else if (state.activeTab === 'calendar') {
    attachCalendarEvents();
  } else if (state.activeTab === 'kanban') {
    attachKanbanEvents();
  } else if (state.activeTab === 'tickets') {
    attachTicketsEvents();
  } else if (state.activeTab === 'scripts') {
    attachScriptsEvents();
  } else if (state.activeTab === 'team-tools') {
    attachTeamToolsEvents();
  } else if (state.activeTab === 'more') {
    attachMoreHubEvents();
  } else if (state.activeTab === 'image-editor') {
    attachPlannerImageEvents();
  }
}

function renderCurrentTabContent(state: AppState): string {
  if (state.activeTab === 'dev-ui') {
    return renderComponentGallery();
  }
  if (state.activeTab === 'image-editor') {
    return renderPlannerImageView();
  }
  if (state.activeTab === 'songs') {
    return renderSongLibrary(state);
  }
  if (state.activeTab === 'calendar') {
    return renderCalendarView(state);
  }
  if (state.activeTab === 'kanban') {
    return renderKanbanView(state);
  }
  if (state.activeTab === 'tickets') {
    return renderTicketsView(state);
  }
  if (state.activeTab === 'scripts') {
    return renderScriptsView(state);
  }
  if (state.activeTab === 'team-tools') {
    return renderTeamToolsView(state);
  }
  if (state.activeTab === 'more') {
    return renderMoreHub(state);
  }
  return renderTodayHome(state);
}

// Reactive subscriptions
subscribeStore(() => renderApp());
subscribeAuthState(() => renderApp());
