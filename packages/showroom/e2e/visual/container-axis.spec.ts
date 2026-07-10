import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-ARC-08 checkpoint 1 -- container-axis capture harness (proposal P-08).
//
// For each workspace slug (data-table, rail) under each tenant palette
// (rottay = dark ground, bithire = light ground) at each CONTAINER width
// (380/620/1160 -- rail / half-split / full), the browser VIEWPORT stays
// fixed at 1280x900 while /probe/container-axis wraps the component in a
// narrower div. An element screenshot of that wrapper (not the page) proves
// the component's "before" response to its container's inline size, ahead
// of the @container adaptations later checkpoints in this WO add -- this is
// the evidence base every later approval in the WO diffs against. 2 slugs x
// 2 tenants x 3 widths = 12 screenshots.
//
// Baselines are committed under e2e/visual/__screenshots__/ (see
// playwright.visual.config.ts's snapshotPathTemplate). This spec runs
// against the PRODUCTION build (playwright.visual.config.ts's webServer
// runs `next start`), same as flagships.spec.ts -- see that file's header
// for why.
// ---------------------------------------------------------------------------

const SLUGS = ['data-table', 'rail'] as const;
const TENANTS = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
] as const;
const CONTAINER_WIDTHS = [380, 620, 1160] as const;

/**
 * Waits until the tenant ground has actually painted before a screenshot is
 * taken. Same timing artifact and same polling strategy as
 * flagships.spec.ts's helper of the same name (duplicated here rather than
 * shared -- e2e/visual has no cross-spec helpers module): ThemeProvider
 * writes the `data-theme`/`data-tenant` attributes that the ground's
 * background token resolves through in a layout effect on hydration, so
 * there is a narrow window where the ground can paint with the wrong
 * palette before flipping to the requested tenant's.
 */
async function waitForGroundPaint(page: Page, ground: 'dark' | 'light'): Promise<void> {
  await page.waitForFunction(
    (isDark) => {
      const bg = getComputedStyle(document.body).backgroundColor;
      const channels = bg.match(/[\d.]+/g);
      if (!channels || channels.length < 3) return false;
      const [r, g, b] = channels.map(Number);
      const luminance = (r + g + b) / 3;
      return isDark ? luminance < 40 : luminance > 200;
    },
    ground === 'dark',
    { timeout: 10_000 },
  );
}

for (const tenant of TENANTS) {
  for (const slug of SLUGS) {
    for (const cw of CONTAINER_WIDTHS) {
      test(`${tenant.id} (${tenant.ground}) / ${slug} @ container ${cw}`, async ({ page }) => {
        test.setTimeout(60_000);

        await page.setViewportSize({ width: 1280, height: 900 });
        await page.goto(`/probe/container-axis?slug=${slug}&tenant=${tenant.id}&cw=${cw}`, {
          waitUntil: 'networkidle',
        });

        const container = page.locator('[data-testid="probe-container-axis"]');
        await container.waitFor({ timeout: 30_000 });
        await page.evaluate(() => document.fonts.ready);
        await waitForGroundPaint(page, tenant.ground);

        // Settle any remaining transition tail beyond reducedMotion's
        // entrance-disable so the final rendered frame is what gets diffed.
        await page.waitForTimeout(300);

        await expect(container).toHaveScreenshot(`${tenant.id}-${slug}-cw${cw}.png`);
      });
    }
  }
}
