import { expect, test } from '@playwright/test';
import path from 'node:path';
import { BATCH_PASSPORTS } from '../src/data/traceability';

const OUT = path.resolve('docs/screenshots/v2');

const SESSION = {
  username: 'Huda',
  displayName: 'Huda Mueen',
  role: 'Founder and CEO',
  loggedInAt: '2026-11-23T08:00:00.000Z',
};

const ROUTES = [
  '/dashboard',
  '/demand',
  '/cycles',
  '/orders',
  '/orders/order-sr-2610',
  '/engine',
  '/farms',
  '/farms/farm-foah-precision',
  '/network',
  '/harvest',
  '/partners',
  '/guides',
  '/exceptions',
  '/fulfilment',
  '/quality',
  '/passports',
  '/index',
  '/analytics',
  '/impact',
  '/copilot',
  '/scenario',
  '/progress',
  '/pilot',
  '/settings',
];

const SHOTS = ['/progress', '/pilot', '/partners', '/guides', '/passports', '/orders/order-sr-2610', '/impact', '/index', '/harvest'];

// Map tiles come from third party servers and are not part of the application.
const IGNORED = /tile|arcgisonline|cartocdn|fonts\.g|ERR_(INTERNET|NAME|CONNECTION|CERT|FAILED|BLOCKED)|Failed to load resource/i;

function watch(page: import('@playwright/test').Page) {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' && !IGNORED.test(m.text())) errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

for (const lang of ['en', 'ar'] as const) {
  test(`signed in routes load without errors (${lang})`, async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.addInitScript(
      ([s, l]) => {
        sessionStorage.setItem('sooqroot:session', JSON.stringify(s));
        localStorage.setItem('sooqroot:v2:lang', JSON.stringify(l));
      },
      [SESSION, lang] as const
    );
    const errors = watch(page);

    for (const route of ROUTES) {
      await page.goto(`/#${route}`);
      await page.waitForTimeout(900);
      const wide = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect.soft(wide, `${route} scrolls horizontally`).toBeLessThanOrEqual(2);
      if (SHOTS.includes(route)) {
        await page.screenshot({
          path: path.join(OUT, `page${route.replace(/\//g, '-')}-${lang}.png`),
          fullPage: true,
        });
      }
    }
    expect(errors, 'console errors').toEqual([]);
  });
}

test('public passport route works without signing in', async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 900 });
  const errors = watch(page);
  const fish = BATCH_PASSPORTS.find((p) => p.coldChainLog) ?? BATCH_PASSPORTS[0];
  for (const lang of ['en', 'ar']) {
    await page.evaluate((l) => localStorage.setItem('sooqroot:v2:lang', JSON.stringify(l)), lang).catch(() => undefined);
    await page.addInitScript((l) => localStorage.setItem('sooqroot:v2:lang', JSON.stringify(l)), lang);
    await page.goto(`/#/passport/${encodeURIComponent(fish.batchId)}`);
    await page.reload(); // a hash only change does not reload, so reload to apply the language
    await page.waitForTimeout(900);
    await expect(page.locator('h1')).toBeVisible();
    await page.screenshot({ path: path.join(OUT, `passport-public-${lang}.png`), fullPage: true });
  }
  expect(errors).toEqual([]);
});

test('login page shows the single sample network line', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/#/login');
  await expect(page.getByText('Figures shown use a sample supply network.')).toBeVisible();
  await page.screenshot({ path: path.join(OUT, 'login.png') });
});
