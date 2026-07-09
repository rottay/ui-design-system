import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-ENG-20 — themanagementmiami vs bithire sighted comparison.
//
// A companion to torture.spec.ts's differential probe, not a replacement.
// This spec captures bithire and themanagementmiami through the same
// /probe/whitelabel-torture route and flagship gallery at the same 1280
// content width, so the two renders are structurally identical (same
// providers, same layout, same slugs) and any visual difference is
// attributable to the tenant theme alone.
//
// This is a SIGHTED-REVIEW capture, not a mechanical gate: it records
// screenshots for a human/orchestrator to review side by side and confirm
// the two tenants read as two different companies. It does not count
// violations and keeps no baseline. The invariant a tenant configuration may
// never violate -- semantic-color distinguishability -- is asserted
// mechanically in
// packages/core/src/compilers/brand-theme/tests/themanagementmiami-invariants.test.ts,
// not here.
// ---------------------------------------------------------------------------

type SightedFixture = 'bithire' | 'themanagementmiami';

const SIGHTED_FIXTURES: readonly SightedFixture[] = ['bithire', 'themanagementmiami'];
const CAPTURE_WIDTH = 1280;

function repoRoot(): string {
  let dir = test.info().project.testDir;
  while (!existsSync(join(dir, 'pnpm-workspace.yaml'))) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error('pnpm-workspace.yaml not found above testDir');
    dir = parent;
  }
  return dir;
}

const artifactDir = (): string => join(repoRoot(), 'test-artifacts', 'gates', 'gat-03');

/**
 * DOM is ground truth over any screenshot, matching torture.spec.ts's
 * gotoFixture: TenantProvider writes data-tenant and ThemeProvider injects
 * compiled tenant CSS in effects after hydration, so a page that has already
 * painted its heading can still be showing the default palette.
 */
async function gotoSightedFixture(page: Page, fixture: SightedFixture): Promise<void> {
  await page.goto(`/probe/whitelabel-torture?fixture=${fixture}&w=${CAPTURE_WIDTH}`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /whitelabel torture/i }).waitFor({ timeout: 30_000 });

  await page.waitForFunction(
    (slug: string) => {
      if (document.documentElement.getAttribute('data-tenant') !== slug) return false;
      return window.getComputedStyle(document.documentElement).getPropertyValue('--ds-button-primary-bg').trim().length > 0;
    },
    fixture,
    { timeout: 20_000 },
  );

  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
}

test.describe('themanagementmiami vs bithire sighted comparison (WO-ENG-20)', () => {
  for (const fixture of SIGHTED_FIXTURES) {
    test(`capture ${fixture} at ${CAPTURE_WIDTH}`, async ({ page }) => {
      test.setTimeout(60_000);

      await page.setViewportSize({ width: CAPTURE_WIDTH, height: 900 });
      await gotoSightedFixture(page, fixture);

      mkdirSync(artifactDir(), { recursive: true });
      await page.screenshot({ path: join(artifactDir(), `${fixture}-${CAPTURE_WIDTH}.png`), fullPage: true });
    });
  }
});
