import { defineConfig, devices, type PlaywrightTestConfig } from '@playwright/test';

/**
 * Local, zero-framework Node HTTP server for the TransGlobe Insurance
 * demo portal. Playwright starts and stops it automatically via
 * `webServer` below, so `npm test` needs no manual setup.
 */
const PORT = Number(process.env.PORT) || 4321;
const HOST = process.env.HOST || '127.0.0.1';
const BASE_URL = process.env.BASE_URL || `http://${HOST}:${PORT}`;

// Workshop-only specs are independently gated so the default run stays green
// and enabling one exercise never exposes another one by accident.
const runFailureDemo = process.env.RUN_FAILURE_DEMO === '1';
const runWorkshopLab = process.env.RUN_WORKSHOP_LAB === '1';
const runWorkshopLabSolution = process.env.RUN_WORKSHOP_LAB_SOLUTION === '1';

const testIgnore = [
  ...(runFailureDemo ? [] : ['**/diagnostics/**']),
  ...(runWorkshopLab ? [] : ['**/workshop-lab.spec.ts']),
  ...(runWorkshopLabSolution ? [] : ['**/solutions/workshop-lab-solution.spec.ts']),
];

const reporter: PlaywrightTestConfig['reporter'] = process.env.CI
  ? [
      ['list'],
      ['junit', { outputFile: 'test-results/junit.xml' }],
      ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ]
  : [
      ['list'],
      ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ];

export default defineConfig({
  testDir: './tests',
  testIgnore,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter,
  use: {
    baseURL: BASE_URL,
    trace: runFailureDemo ? 'on' : 'on-first-retry',
    screenshot: runFailureDemo ? 'on' : 'only-on-failure',
    video: runFailureDemo ? 'on' : 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'node server/server.js',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: {
      PORT: String(PORT),
      HOST,
    },
  },
});
