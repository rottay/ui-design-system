import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-ARC-09 checkpoint 4 -- SelectionPreviewRail data-part contract evidence.
//
// The pre-step stamps `data-part`/`data-preview` attributes and the
// `ds-selection-preview-rail__close` class on both engines without moving
// any paint. This spec captures the rail's current appearance (8 element
// screenshots covering both the default and customPreview branches) as the
// pre-migration baseline, plus interaction-state screenshots (close-button
// hover) on rottay/w1280 only. The migration must reproduce every one of
// these byte for byte. The 6 committed container-axis `rail` baselines
// (state-gallery responsive-specs) are untouched and keep gating the
// default branch at three widths -- this spec covers what those baselines
// cannot: the customPreview branch, a subtitle, a match-reason panel, and
// the boolean/empty renderFallbackValue paths.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];
const WIDTHS = [360, 1280] as const;

const CONTAINER_SELECTOR = '[data-testid="probe-rail"]';

/**
 * Waits until the tenant ground has actually painted before a screenshot is
 * taken. Same timing artifact and same polling strategy as
 * filter-panel.spec.ts's helper of the same name (duplicated here rather
 * than shared -- e2e/visual has no cross-spec helpers module).
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

async function openProbe(page: Page, fixture: Fixture, engine: Engine, width: number): Promise<Locator> {
  await page.setViewportSize({ width: Math.max(width, 1280), height: 900 });
  await page.goto(`/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=${width}&slug=button&rail=1`, {
    waitUntil: 'domcontentloaded',
  });

  const container = page.locator(CONTAINER_SELECTOR);
  await container.waitFor({ timeout: 30_000 });
  await page.waitForFunction(
    (expected) => document.documentElement.getAttribute('data-engine') === expected,
    engine,
  );
  await page.evaluate(() => document.fonts.ready);

  const fixtureGround = FIXTURES.find((f) => f.id === fixture)?.ground ?? 'dark';
  await waitForGroundPaint(page, fixtureGround);

  // Settle any remaining transition tail beyond reducedMotion's
  // entrance-disable so the final rendered frame is what gets diffed.
  await page.waitForTimeout(300);

  return container;
}

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    for (const w of WIDTHS) {
      test(`${fixture.id} (${fixture.ground}) / selection-preview-rail / ${engine} @ w${w}`, async ({ page }) => {
        test.setTimeout(60_000);

        const container = await openProbe(page, fixture.id, engine, w);
        await expect(container).toHaveScreenshot(`${fixture.id}-rail-${engine}-w${w}.png`);
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Close-button interaction-state pins (rottay/w1280 only). Only the
// customPreview-branch instance carries the `.ds-selection-preview-rail__close`
// landing className.
// ---------------------------------------------------------------------------

for (const engine of ENGINES) {
  test(`rottay (dark) / selection-preview-rail / ${engine}: close button rest`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine, 1280);
    const closeButton = container.locator('.ds-selection-preview-rail__close').first();
    await expect(closeButton).toHaveScreenshot(`rottay-rail-${engine}-close-rest.png`);
  });

  test(`rottay (dark) / selection-preview-rail / ${engine}: close button hovered`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine, 1280);
    const closeButton = container.locator('.ds-selection-preview-rail__close').first();
    await closeButton.hover();
    await page.waitForTimeout(300);

    await expect(closeButton).toHaveScreenshot(`rottay-rail-${engine}-close-hovered.png`);
  });
}
