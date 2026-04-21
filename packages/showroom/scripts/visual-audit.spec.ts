/**
 * Legacy placeholder.
 *
 * The canonical showroom visual QA runner now lives in:
 *   `node scripts/showroom-visual-matrix.mjs`
 *
 * We intentionally drive `pnpm dlx playwright screenshot` directly from that
 * runner so the showroom package does not need to depend on `@playwright/test`
 * or a local Playwright config.
 */

export const SHOWROOM_VISUAL_AUDIT_RUNNER =
  'node scripts/showroom-visual-matrix.mjs';
