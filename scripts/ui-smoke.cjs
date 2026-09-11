const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  fs.mkdirSync('artifacts/ui', { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const base = process.env.UI_BASE_URL || 'http://127.0.0.1:5173';
  let apiCalls = 0;
  let transferred = false;
  const lead = { _id: 'ui-check', firstName: 'Mayank', lastName: 'Rai', mobile: '1234567890', email: 'mayank@example.com', status: 'won', source: 'walk_in', budget: { min: 400000, max: 4500000 }, buyerRequirement: { propertyType: ['apartment'], bhk: ['2 BHK', '1 BHK'], preferredLocation: 'Vasai', possessionPreference: 'ready_to_move', purpose: 'self_use' }, qualification: { leadTemperature: 'hot' }, financialRequirement: { loanRequired: 'yes', preferredBank: 'HDFC', loanStatus: 'planning_to_apply' }, assignedTo: { firstName: 'Sameer', lastName: 'Mishra' } };
  await page.route('**/api/v1/**', async route => {
    apiCalls++;
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith('/leads/ui-check') ? { ...lead, isTransferred: transferred, receivedFrom: { organizationName: 'Partner Agency' } } : [];
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data }) });
  });
  await page.goto(base);
  await page.getByRole('heading', { name: 'Great relationships. Even better deals.' }).waitFor();
  assert.equal(apiCalls, 0, 'Public home must not depend on API session restoration');
  await page.screenshot({ path: 'artifacts/ui/landing-desktop.png', fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'Properties', exact: true }).filter({ visible: true }).click();
  await page.getByRole('heading', { name: 'Find their next place.' }).waitFor();
  await page.getByRole('button', { name: 'Revenue', exact: true }).filter({ visible: true }).click();
  await page.getByRole('heading', { name: 'Good relationships. Real returns.' }).waitFor();
  await page.getByRole('button', { name: 'Overview', exact: true }).filter({ visible: true }).click();
  await page.locator('summary').first().click();
  assert.equal(await page.locator('details').first().getAttribute('open'), '');
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Landing overflow at ${width}px`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByText('How it works').click();
  assert.equal(await page.locator('#landing-mobile-menu').count(), 0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'artifacts/ui/landing-mobile.png', fullPage: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('.hero-intro').evaluate(el => getComputedStyle(el).animationName), 'none');

  // Isolated browser fixtures exercise the UI without real credentials or backend writes.
  await page.addInitScript(() => {
    localStorage.setItem('accessToken', 'ui-fixture');
    localStorage.setItem('currentUser', JSON.stringify({ firstName: 'UI', lastName: 'Reviewer', role: 'super_admin' }));
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/app/leads/ui-check`);
  await page.getByRole('heading', { name: 'Mayank Rai', exact: true }).waitFor();
  assert.match(await page.locator('.lead-summary-facts').innerText(), /₹4 L – ₹45 L/);
  assert.equal(await page.locator('[aria-current="step"]').count(), 1);
  await page.screenshot({ path: 'artifacts/ui/lead-desktop.png', fullPage: true });
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert(await page.locator('.product-canvas').evaluate(el => el.scrollWidth <= el.clientWidth), `Lead overflow at ${width}px`);
  }
  await page.getByRole('button', { name: 'All available', exact: false }).click();
  await page.getByRole('button', { name: 'Matched', exact: false }).click();
  await page.getByRole('button', { name: 'Audit Timeline', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: 'Audit Timeline', exact: true }).getAttribute('aria-pressed'), 'true');
  await page.getByRole('button', { name: 'Overview', exact: true }).click();
  await page.getByRole('button', { name: 'Edit lead', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  await page.reload();
  await page.getByRole('heading', { name: 'Mayank Rai', exact: true }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'artifacts/ui/lead-mobile.png', fullPage: true });
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.lead-profile dd a')).color.match(/\d+/)[0]) > 200);
  await page.screenshot({ path: 'artifacts/ui/lead-dark-mobile.png', fullPage: true });
  lead.status = 'qualified';
  await page.reload();
  await page.locator('.lead-composer summary').click();
  await page.getByLabel('Interaction summary').fill('Browser check only; not submitted.');
  assert.equal(await page.locator('.lead-composer').getAttribute('open'), '');
  transferred = true;
  await page.reload();
  await page.getByRole('heading', { name: 'Transfer details' }).waitFor();
  assert.equal(await page.locator('.lead-profile a[href^="tel:"], .lead-profile a[href^="mailto:"], .lead-actions a').count(), 0, 'Transferred contacts must remain protected');
  assert.deepEqual(errors, []);
  console.log('PASS: landing and lead layouts at 320/390/768/1024/1440px; preview controls, FAQ, navigation, workspace sections, edit drawer, budget, transferred privacy, reduced motion, no browser exceptions. API requests are mocked.');
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
