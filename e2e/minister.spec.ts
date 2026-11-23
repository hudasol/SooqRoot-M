import { expect, test } from '@playwright/test';
import path from 'node:path';

const OUT = path.resolve('docs/screenshots/v2');
const SIZES = [
  { w: 1180, h: 820 },
  { w: 1366, h: 1024 },
];
const LANGS = ['en', 'ar'] as const;

for (const size of SIZES) {
  for (const lang of LANGS) {
    test(`Minister Mode ${size.w}x${size.h} ${lang}`, async ({ page }) => {
      await page.setViewportSize({ width: size.w, height: size.h });
      const errors: string[] = [];
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
      });
      page.on('pageerror', (e) => errors.push(String(e)));

      await page.goto('/#/minister');
      await page.waitForTimeout(600);
      // Minister Mode always opens in English and keeps its own language.
      if (lang === 'ar') await page.getByRole('button', { name: 'عربي' }).click();
      const next = lang === 'ar' ? 'ArrowLeft' : 'ArrowRight';

      for (let step = 0; step < 8; step++) {
        if (step === 1) {
          await page.getByRole('button', { name: /Show the specification|اعرض المواصفات/ }).click();
          await page.waitForTimeout(400);
        }
        await page.waitForTimeout(500);
        const overflow = await page.evaluate(() => {
          const main = document.querySelector('main > div') as HTMLElement | null;
          if (!main) return { v: 0, h: 0 };
          // Any descendant that extends beyond the step container is a layout overflow.
          const box = main.getBoundingClientRect();
          let worst = 0;
          main.querySelectorAll('*').forEach((el) => {
            if (el.closest('svg')) return;
            const r = (el as HTMLElement).getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return;
            worst = Math.max(worst, r.bottom - box.bottom, r.right - box.right, box.left - r.left);
          });
          return { v: main.scrollHeight - main.clientHeight, h: Math.round(worst) };
        });
        await page.screenshot({ path: path.join(OUT, `minister-${size.w}x${size.h}-${lang}-${step}.png`) });
        expect.soft(overflow.v, `step ${step} scrolls vertically`).toBeLessThanOrEqual(1);
        expect.soft(overflow.h, `step ${step} has content outside its frame`).toBeLessThanOrEqual(2);
        await page.keyboard.press(next);
      }
      expect(errors, 'console errors').toEqual([]);
    });
  }
}

test('Minister Mode language does not reach the main application', async ({ page }) => {
  await page.setViewportSize({ width: 1180, height: 820 });
  await page.addInitScript(() => {
    sessionStorage.setItem(
      'sooqroot:session',
      JSON.stringify({ username: 'Huda', displayName: 'Huda Mueen', role: 'Founder and CEO', loggedInAt: '2026-11-23T08:00:00.000Z' })
    );
  });
  await page.goto('/#/minister');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'عربي' }).click();
  await expect(page.locator('h1, [lang="ar"]').first()).toBeVisible();
  await page.getByRole('button', { name: /الخروج من وضع العرض/ }).click();
  await page.goto('/#/progress');
  await page.reload();
  await page.waitForTimeout(800);
  await expect(page.getByRole('heading', { name: 'Progress', exact: true })).toBeVisible();
  // Minister Mode opens in English again.
  await page.goto('/#/minister');
  await page.reload();
  await page.waitForTimeout(600);
  await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
});
