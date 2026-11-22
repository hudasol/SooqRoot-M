import { defineConfig } from 'vitest/config';

// Unit tests live next to the code. Playwright specs in e2e/ run with `npx playwright test`.
export default defineConfig({
  test: { include: ['src/**/*.test.ts'] },
});
