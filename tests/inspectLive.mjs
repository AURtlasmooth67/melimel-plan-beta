import { chromium } from 'playwright';

async function inspectHtml() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('https://kalabro-testdeploy.web.app', { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  const html = await page.$eval('#app', el => el.innerHTML);
  console.log('--- APP CONTENT ---');
  console.log(html);
  console.log('-------------------');

  await browser.close();
}

inspectHtml();
