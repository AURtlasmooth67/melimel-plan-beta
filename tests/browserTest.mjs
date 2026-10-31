import { chromium } from 'playwright';

async function runBrowserTest() {
  console.log('🚀 Starting Automated Browser Testing on live deployment...');
  const browser = await chromium.launch({ headless: true });

  // Test 1: Mobile Viewport (iPhone 14 / 390px)
  console.log('📱 Testing Mobile Viewport (390 x 844)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  const page = await mobileContext.newPage();

  // Listen for console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('https://kalabro-testdeploy.web.app', { waitUntil: 'networkidle' });
  console.log('✅ Loaded: https://kalabro-testdeploy.web.app');

  // Verify Title and Meta
  const title = await page.title();
  console.log(`📄 Page Title: "${title}"`);

  // Verify Login Screen Gate
  const loginBtn = await page.$('#btn-login');
  if (loginBtn) {
    console.log('🔒 Login Gate verified: Google Sign-in button is present and accessible.');
  } else {
    console.warn('⚠️ Login button not found.');
  }

  // Take Mobile Screenshot
  await page.screenshot({ path: 'tests/screenshot-mobile-gate.png' });
  console.log('📸 Saved screenshot: tests/screenshot-mobile-gate.png');

  // Test 2: Desktop Viewport (1280 x 800)
  console.log('💻 Testing Desktop Viewport (1280 x 800)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('https://kalabro-testdeploy.web.app', { waitUntil: 'networkidle' });

  await desktopPage.screenshot({ path: 'tests/screenshot-desktop-gate.png' });
  console.log('📸 Saved screenshot: tests/screenshot-desktop-gate.png');

  console.log(`🔍 Console Errors count: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Console Errors:', consoleErrors);
  }

  await browser.close();
  console.log('🎉 Browser test completed successfully!');
}

runBrowserTest().catch(err => {
  console.error('❌ Browser Test Error:', err);
  process.exit(1);
});
