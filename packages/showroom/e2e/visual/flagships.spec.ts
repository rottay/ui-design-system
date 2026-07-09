import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-GAT-01 — pixel-diff net over the flagship galleries (proposal P-11).
//
// For each flagship (button, input, select, card, badge, table, tabs, modal)
// under each tenant palette (rottay = dark ground, bithire = light ground) at
// each viewport (360/768/1280 — the WO-ENG-02/WO-ENG-12 matrix), load
// /probe/engine-modern?tenant=<t>&slug=<flagship>&w=<vw> and assert a full-page
// screenshot against a committed baseline. 8 slugs x 2 tenants x 3 viewports =
// 48 screenshots.
//
// Baselines are committed under e2e/visual/__screenshots__/ (see
// playwright.visual.config.ts snapshotPathTemplate). This spec runs against
// the PRODUCTION build (playwright.visual.config.ts's webServer runs
// `next start`), never the dev server — see that file's header for why.
// ---------------------------------------------------------------------------

const FLAGSHIP_SLUGS = ['button', 'input', 'select', 'card', 'badge', 'table', 'tabs', 'modal'] as const;
const TENANTS = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
] as const;
const VIEWPORTS = [360, 768, 1280] as const;

/**
 * Waits until the tenant ground has actually painted before a screenshot is
 * taken. The gallery's ground is the page's `<body>` background, which is
 * bound to a DS token (`--ds-color-bg-secondary`) that resolves through the
 * `data-theme`/`data-tenant` attributes ThemeProvider writes to `<html>`. On
 * the very first paint of a page load, those attributes are not yet applied
 * (they land in a layout effect on hydration), so there is a narrow window
 * where the ground can paint with the wrong palette before flipping to the
 * requested tenant's — exactly the kind of transient frame a pixel-diff net
 * must not capture. This polls the body's COMPUTED (rendered) background
 * luminance until it matches the tenant's expected ground, rather than
 * trusting that the heading being present means the ground already settled.
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
  for (const slug of FLAGSHIP_SLUGS) {
    for (const vw of VIEWPORTS) {
      test(`${tenant.id} (${tenant.ground}) / ${slug} @ ${vw}`, async ({ page }) => {
        test.setTimeout(60_000);

        await page.setViewportSize({ width: vw, height: 900 });
        await page.goto(`/probe/engine-modern?tenant=${tenant.id}&slug=${slug}&w=${vw}`, {
          waitUntil: 'networkidle',
        });
        await page.getByRole('heading', { name: /modern engine evidence/i }).waitFor({ timeout: 30_000 });
        await page.evaluate(() => document.fonts.ready);
        await waitForGroundPaint(page, tenant.ground);

        // The modal flagship's real surface only exists once opened — open it
        // so the screenshot captures the dialog, not just the trigger button.
        if (slug === 'modal') {
          await page.getByRole('button', { name: /open modal/i }).first().click();
          await page.getByRole('dialog').waitFor({ timeout: 10_000 });
        }

        // Settle any remaining transition tail beyond reducedMotion's
        // entrance-disable so the final rendered frame is what gets diffed.
        await page.waitForTimeout(300);

        await expect(page).toHaveScreenshot(`${tenant.id}-${slug}-${vw}.png`, { fullPage: true });
      });
    }
  }
}
