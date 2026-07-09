import { defineConfig, devices } from '@playwright/test';

// ---------------------------------------------------------------------------
// Showroom visual-regression harness (WO-GAT-01, proposal P-11).
//
// SEPARATE from playwright.config.ts (the WO-GAT-04 a11y harness, which runs
// e2e/a11y/ against the DEV server). Visual regression runs against the
// PRODUCTION build (`next start`) instead: dev-mode Turbopack/HMR paints
// non-deterministically (a rottay dark-ground pre-theme light-paint timing
// artifact was directly observed against the dev server), which is fatal to a
// pixel-diff net. `webServer` below builds nothing itself — the production
// bundle must already exist (`pnpm --filter @rottay/showroom run build`)
// before this config's webServer starts `next start`.
//
// Do not add a third Playwright config to this package. e2e/a11y/ runs on
// playwright.config.ts (dev server); e2e/visual/ and e2e/whitelabel/ both run
// on this one. The whitelabel torture probe (WO-GAT-03) belongs here rather
// than on the a11y config for two reasons: it captures screenshots (which the
// dev server's pre-theme paint artifact would poison), and CI runs it in the
// same invocation as the visual suite so one production `next start` serves
// both. It asserts computed styles, not pixels, so it takes no baselines from
// `snapshotPathTemplate` below.
// ---------------------------------------------------------------------------

const PORT = 7001;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  // Both production-server spec directories, and only those: a bare
  // `playwright test --config playwright.visual.config.ts` runs the visual
  // suite and the whitelabel probe together (one webServer boot), while
  // `test:visual` / `test:whitelabel` narrow to one via a path filter.
  testMatch: ['visual/**/*.spec.ts', 'whitelabel/**/*.spec.ts'],
  // One flagship gallery page serves every cell in the matrix; parallel
  // workers would fight over the same production server's compile/response
  // cache for no benefit, so this mirrors the a11y harness's single-worker,
  // in-order execution.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  timeout: 120_000,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      // 0.0005 (0.05%) is deliberately tight: on the flagship galleries a
      // single-token color shift (e.g. --ds-color-primary) changes enough
      // pixels across the button/badge/tabs states to fail at this ratio,
      // while still being loose enough to absorb sub-pixel antialiasing
      // noise from font rendering. Never loosen this to green a flake —
      // fix the gallery's determinism instead (see e2e/README.md).
      maxDiffPixelRatio: 0.0005,
    },
  },
  // Embeds {platform} so a baseline generated on macOS (`darwin`) and one
  // generated on the Linux self-hosted runner never collide under the same
  // snapshot name — each platform keeps and compares against its own file.
  //
  // Spelled with {testFileDir}/{testFileName} rather than {testFilePath} so the
  // baselines stay beside their spec (e2e/visual/__screenshots__/...) no matter
  // how far above them `testDir` sits. {testFilePath} is relative to testDir, so
  // it would silently relocate every baseline the moment testDir moves — and a
  // relocated baseline is not a failure, it is Playwright writing a brand-new
  // one and passing.
  snapshotPathTemplate: '{testDir}/{testFileDir}/__screenshots__/{testFileName}/{arg}-{projectName}-{platform}{ext}',
  use: {
    baseURL: BASE_URL,
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    // The DS honors prefers-reduced-motion (entrance transitions disabled),
    // so galleries settle into their final state without an animation tail.
    reducedMotion: 'reduce',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm --filter @rottay/showroom run start',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
