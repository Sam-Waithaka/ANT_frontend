import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'memorial-portal.spec.ts',
  outputDir: './tests/test-results/memorial',
  retries: 0,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:5180',
    browserName: 'chromium',
    channel: 'msedge',
    headless: true,
    viewport: { width: 1440, height: 1100 },
  },
  webServer: {
    command: 'pnpm dev -- --host 127.0.0.1 --port 5180',
    url: 'http://127.0.0.1:5180',
    reuseExistingServer: true,
    timeout: 120000,
  },
});

