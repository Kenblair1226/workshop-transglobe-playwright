import 'dotenv/config';
import { defineConfig } from '@playwright/test';
import { DefaultAzureCredential } from '@azure/identity';
import { createAzurePlaywrightConfig, ServiceOS } from '@azure/playwright';
import baseConfig from './playwright.config';

/**
 * Playwright Workspaces (Azure Playwright) cloud execution config.
 *
 * Run with:
 *   PLAYWRIGHT_SERVICE_URL=<your workspace region endpoint> \
 *     npm run test:cloud
 *
 * `PLAYWRIGHT_SERVICE_URL` must be supplied externally (e.g. via a
 * gitignored .env file or CI secret) — it is never hardcoded here.
 * Authentication uses Microsoft Entra ID via DefaultAzureCredential,
 * which picks up `az login` sessions locally or a federated/managed
 * identity in CI. See .env.example for the expected shape of the URL.
 */
const credential = new DefaultAzureCredential();

export default defineConfig(
  baseConfig,
  createAzurePlaywrightConfig(baseConfig, {
    credential,
    os: ServiceOS.LINUX,
    exposeNetwork: '<loopback>',
    connectTimeout: 3 * 60 * 1000,
  }),
  {
    // Cloud demos run only reliable specs; workshop starters, diagnostics,
    // and intentionally brittle examples stay local.
    testMatch: [
      '**/smoke.spec.ts',
      '**/core-flows.spec.ts',
      '**/solutions/solution.spec.ts',
    ],
    reporter: [
      ['html', { open: 'never', outputFolder: 'playwright-report' }], // HTML reporter must come first
      ['@azure/playwright/reporter'], // uploads the HTML report to the workspace, when reporting is enabled
    ],
  },
);
