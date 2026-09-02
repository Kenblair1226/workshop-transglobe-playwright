# TransGlobe Insurance — Playwright Lab

A self-contained workshop lab: a small insurance-domain web portal built
with **zero frontend frameworks** (plain Node `http` server + static
HTML/CSS/JS), plus a TypeScript Playwright test suite that exercises it
locally, in **Azure Pipelines**, and — optionally — via **Azure Playwright
Workspaces** in Azure App Testing.

Everything runs offline against the bundled in-memory dataset. There are
no external API calls and no secrets checked into this repo.

## What's inside

```
playwright-lab/
├── server/                 # Zero-framework Node HTTP server
│   ├── server.js            # Static file server + /api/policies + /api/quote
│   ├── quote.js             # Deterministic quote-calculation engine
│   └── data/policies.js     # In-memory policy dataset
├── public/                  # Static portal (no build step)
│   ├── index.html            # Home
│   ├── search.html           # Policy search + detail modal
│   ├── quote.html            # Quote form + result breakdown
│   ├── css/styles.css
│   └── js/search.js, quote.js
├── tests/
│   ├── smoke.spec.ts               # Fast sanity checks
│   ├── core-flows.spec.ts          # Policy search + quote flows
│   ├── workshop-exercise.spec.ts   # Instructor reliability-pattern example
│   ├── workshop-lab.spec.ts        # Gated participant starter (expected red)
│   ├── solutions/solution.spec.ts  # Reliable pattern rewrite
│   ├── solutions/workshop-lab-solution.spec.ts # Gated lab answer
│   ├── diagnostics/failure-demo.spec.ts  # Gated, deterministic failure demo
│   └── utils/fixtures.ts           # Shared quote-form test fixtures
├── playwright.config.ts         # Local run config (starts the server)
├── playwright.service.config.ts # Azure Playwright Workspaces config
└── package.json
```

## Requirements

- Node.js **>= 20**
- (Optional, for `npm run test:cloud`) an Azure Playwright Workspace and
  `az login` session, or another `DefaultAzureCredential`-compatible
  identity.

## Getting started

```bash
npm install
npx playwright install chromium   # first time only
npm test
```

`npm test` starts the local server automatically (via `webServer` in
`playwright.config.ts`), runs the full default suite, and stops it
afterwards. It is deterministic and does not depend on network access.

## Azure DevOps pipeline

The repository-level `../azure-pipelines.yml` runs the same suite on a
Microsoft-hosted Ubuntu agent. It installs Node.js 20, restores dependencies,
installs Chromium and its Linux dependencies, type-checks the project, and
runs `npm test` with `CI=true`.

The CI configuration adds a JUnit reporter so Azure DevOps can show results in
the **Tests** tab. The pipeline also publishes `playwright-report/` on every
test run and `test-results/` when tests fail. This hosted-agent run needs no
Azure subscription or service connection; those are required only when the
later Playwright Workspaces demo moves the browsers to Azure.

## Scripts

| Script                   | What it does                                                            |
|---------------------------|--------------------------------------------------------------------------|
| `npm start`               | Runs the portal standalone at `http://127.0.0.1:4321` for manual poking. |
| `npm test`                | Full default suite (smoke + core flows + workshop exercise + solution). |
| `npm run test:smoke`      | Just the smoke tests.                                                   |
| `npm run test:core`       | Just the policy search / quote core-flow tests.                        |
| `npm run test:patterns`   | Runs the brittle-but-passing reliability examples.                    |
| `npm run test:solution`   | Just the reliable solution rewrite of the exercise.                    |
| `npm run test:lab`        | Runs the gated participant starter; expected red until implemented.   |
| `npm run test:lab:repeat` | Runs the completed lab three times with two workers and no retries.    |
| `npm run test:lab:solution` | Runs the gated reference answer for the participant lab.            |
| `npm run test:failure-demo` | Runs the gated, intentionally-failing diagnostics demo (see below).  |
| `npm run test:report`     | Opens the last HTML report (`playwright-report/`).                     |
| `npm run test:cloud`      | Runs the suite against Azure Playwright Workspaces (needs setup).      |
| `npm run typecheck`       | `tsc --noEmit` over the test suite and configs.                        |

## The participant lab

`tests/workshop-lab.spec.ts` starts with a deliberate TODO failure. Participants
build a new coverage scenario that combines Home + Pending filters, identifies
`POL-100245`, opens the detail modal, and verifies coverage and effective date.
The reference answer is `tests/solutions/workshop-lab-solution.spec.ts`.

The starter and answer are independently gated by environment flags and are
excluded from the default suite. Use the npm scripts above rather than invoking
the files directly.

## Reliability pattern examples

`tests/workshop-exercise.spec.ts` intentionally uses two common
Playwright anti-patterns that currently **pass** against this build:

1. A **CSS structural locator** (`tr:nth-child(2) td:nth-child(5)`)
   instead of a semantic locator — brittle to row/column reordering.
2. A **fixed `page.waitForTimeout(...)`** instead of waiting for the
   real network response or a web-first assertion — brittle to timing
   changes and wastes time even when the UI is already ready.

The instructor contrasts both tests with
`tests/solutions/solution.spec.ts`, which solves the same two scenarios
with `getByRole`/`getByTestId` locators and `waitForResponse` /
auto-retrying assertions instead.

## Diagnostics / failure demo

`tests/diagnostics/failure-demo.spec.ts` is excluded from the default
run (`playwright.config.ts` sets `testIgnore` for `tests/diagnostics/**`
unless `RUN_FAILURE_DEMO=1`, and the spec also self-skips as a second
safety net), so `npm test` always stays green.

Run it deliberately to see a **meaningful, deterministic** UI/business
logic failure (not a random flake) and inspect the resulting evidence:

```bash
npm run test:failure-demo
npx playwright show-report
```

The test asserts a naive, undiscounted annual premium against the quote
engine's actual (5%-discounted) result — it fails the same way every
time, and the config enables `trace: 'on'`, full screenshots and video
whenever `RUN_FAILURE_DEMO=1` so the report always has rich evidence to
walk through.

## Azure Playwright Workspaces (cloud) config

`playwright.service.config.ts` follows the current official pattern:

- `createAzurePlaywrightConfig(baseConfig, { credential, os, exposeNetwork, connectTimeout })`
- Authentication via `DefaultAzureCredential` from `@azure/identity`
  (Entra ID — no access tokens or secrets in this repo).
- `os: ServiceOS.LINUX`, `exposeNetwork: '<loopback>'` (so the cloud
  browser can reach the locally-running server), and a 3-minute
  `connectTimeout`.
- The workspace region endpoint is read from the **`PLAYWRIGHT_SERVICE_URL`**
  environment variable, which must be supplied externally (see
  `.env.example`) — it is never hardcoded.

```bash
export PLAYWRIGHT_SERVICE_URL="wss://<region>.api.playwright.microsoft.com/playwrightworkspaces/<workspace-id>/browsers"
az login
npm run test:cloud
```

## Notes on dependency versions

- `@azure/identity` is pinned to `4.12.0` (rather than the newer
  `4.13.x` line) because `4.13.x` raises its minimum supported Node.js
  version to 22, which conflicts with this project's `engines.node
  >=20` requirement. `4.12.0` is the latest release that still supports
  Node 20. `npm audit` reports a moderate transitive advisory in `uuid`
  via `@azure/msal-node` for this version; fixing it would require the
  Node 22 upgrade, so it's a deliberate trade-off — re-evaluate if the
  Node baseline is raised.
