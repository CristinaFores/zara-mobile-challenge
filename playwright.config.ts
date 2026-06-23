import { defineConfig, devices } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
// Workers spawned by --ui do not receive --ui in argv; use E2E_UI from the npm script.
// PLAYWRIGHT_TRACING_NO_WEBSOCKET_FRAMES=1 avoids UI zip corruption (Playwright #41351, Node 24).
const isUiMode =
  process.env.E2E_UI === '1' ||
  process.argv.some((arg) => arg === '--ui' || arg.startsWith('--ui='))
const isCi = !!process.env.CI

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: !isUiMode,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isUiMode || isCi ? 1 : undefined,
  reporter: isCi ? 'github' : isUiMode ? 'list' : 'html',
  use: {
    baseURL: BASE_URL,
    // UI mode + Node 24 corrupts live trace/screenshot zips (Playwright #37837).
    trace: isUiMode ? 'off' : isCi ? 'on-first-retry' : 'off',
    screenshot: isUiMode ? 'off' : 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !isCi,
    timeout: 120_000,
  },
})
