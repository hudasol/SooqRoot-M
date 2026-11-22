import { defineConfig } from '@playwright/test';

/* Visual checks run against the production build served by vite preview.
   Uses the Microsoft Edge already installed on the machine, so no browser download is needed. */
export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    channel: 'msedge',
    headless: true,
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --host 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
