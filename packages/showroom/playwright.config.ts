import { defineConfig, devices } from '@playwright/test';

// ---------------------------------------------------------------------------
// Showroom e2e harness (WO-GAT-04 accessibility CI; shared with WO-GAT-01/03).
//
// The a11y specs (e2e/a11y/) drive the WO-ENG-02 flagship galleries at
// /probe/engine-modern under the modern engine and assert accessibility on
// three axes: axe (axe.spec.ts) and focus-visible (focus.spec.ts). The APCA
// axis lives in the node ratchet (scripts/engine-token-audit.mjs), not here.
//
// webServer runs the showroom dev server on port 7001 (matching package.json
// `dev`). Locally an already-running server is reused; in CI Playwright starts
// its own (after the workflow builds @rottay/design-system, which the dev
// server imports).
// ---------------------------------------------------------------------------

const PORT = 7001;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  // Dev-server compile contention makes parallel navigation flaky; the a11y
  // sweep is read-only and cheap, so a single worker in series is both stable
  // and fast enough (all specs hit one route; Next compiles it once).
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    // Settle the galleries for deterministic axe/focus reads: the DS honors
    // prefers-reduced-motion, so entrance transitions are disabled and computed
    // colors/rings are stable rather than mid-animation.
    reducedMotion: 'reduce',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
