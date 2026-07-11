import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-ARC-09 checkpoint 3 -- FilterPanel data-part contract evidence.
//
// The pre-step stamps `data-part`/`data-sidebar`/`data-loading`/`data-tone`
// attributes and the `ds-pattern-filter-panel__option-icon` class on both
// engines without moving any paint. This spec captures the panel's current
// appearance (8 element screenshots) as the pre-migration baseline, plus
// interaction-state screenshots (text-input focus, reset-button hover) on
// rottay/w1280 only. The migration must reproduce every one of these byte
// for byte.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];
const WIDTHS = [360, 1280] as const;

const CONTAINER_SELECTOR = '[data-testid="probe-filter-panel"]';

/**
 * Waits until the tenant ground has actually painted before a screenshot is
 * taken. Same timing artifact and same polling strategy as
 * field-filters.spec.ts's helper of the same name (duplicated here rather
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
  await page.goto(
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=${width}&slug=button&filterpanel=1`,
    { waitUntil: 'domcontentloaded' },
  );

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
      test(`${fixture.id} (${fixture.ground}) / filter-panel / ${engine} @ w${w}`, async ({ page }) => {
        test.setTimeout(60_000);

        const container = await openProbe(page, fixture.id, engine, w);
        await expect(container).toHaveScreenshot(`${fixture.id}-filter-panel-${engine}-w${w}.png`);
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Interaction-state pins (rottay/w1280 only).
// ---------------------------------------------------------------------------

for (const engine of ENGINES) {
  test(`rottay (dark) / filter-panel / ${engine}: text-input focused`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine, 1280);

    const input = container.locator('[data-part="input"]').first();
    await input.focus();
    await page.waitForTimeout(300);

    const fieldRow = container.locator('[data-part="field-row"]').first();
    await expect(fieldRow).toHaveScreenshot(`rottay-filter-panel-${engine}-input-focused.png`);
  });

  test(`rottay (dark) / filter-panel / ${engine}: reset-button hovered`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine, 1280);

    const resetButton = container.locator('[data-part="reset-button"]').first();
    await resetButton.hover();
    await page.waitForTimeout(300);

    await expect(resetButton).toHaveScreenshot(`rottay-filter-panel-${engine}-reset-hovered.png`);
  });
}
