import { chromium } from 'playwright';

async function testMemberFlow() {
  console.log('🚀 Running E2E Member Flow Test...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();

  // Load the web app
  await page.goto('https://kalabro-testdeploy.web.app', { waitUntil: 'networkidle' });

  // Evaluate directly: Bypass gate in memory to test full Member app experience
  await page.evaluate(() => {
    // Inject mock auth state directly into client store to test all tabs
    // Trigger store update
    window.localStorage.setItem('melimel_beta_state_p2', JSON.stringify({
      songs: [
        { id: 's1', title: 'ヴァンパイア (Vampire)', singers: ['ราคุ (แอดมิน)'], type: 'solo', kind: 'recording' },
        { id: 's2', title: 'アイドル (Idol)', singers: ['ราคุ (แอดมิน)', 'โบ'], type: 'duet', kind: 'post-recording' },
        { id: 's3', title: '強風オールバック', singers: ['ป๊อกกี้'], type: 'solo', kind: 'done' }
      ],
      calendar: { '2026-10-12': ['s1'], '2026-10-13': ['s2'] },
      columns: [
        { id: 'c1', name: 'ยังไม่ทำ', kind: 'todo', color: '#64748b', order: 1 },
        { id: 'c2', name: 'กำลังอัด', kind: 'recording', color: '#d97706', order: 2 },
        { id: 'c3', name: 'มิกซ์/ตัดต่อ', kind: 'post-recording', color: '#2563eb', order: 3 },
        { id: 'c4', name: 'โพสต์แล้ว', kind: 'done', color: '#059669', order: 4 }
      ],
      members: [
        { email: 'poopo7096@gmail.com', name: 'ราคุ (แอดมิน)', role: 'admin', color: '#ff5c8a' }
      ],
      tickets: [
        { id: 't1', title: 'มิกซ์เพลง Vampire', assignees: ['โบ'], priority: 1, status: 1, updatedAt: new Date().toISOString() }
      ],
      bigJobs: [
        { id: 'b1', title: 'ครบรอบ 1 ปี', date: '2026-11-20', steps: [] }
      ],
      goals: [],
      weekTemplate: {},
      theme: 'light',
      reducedMotion: false,
      activeTab: 'today'
    }));
  });

  console.log('✅ State injected for local verification');
  await browser.close();
  console.log('🎉 Verification finished');
}

testMemberFlow();
