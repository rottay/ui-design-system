import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-ARC-09 checkpoint 5 -- DetailPanel data-part contract evidence.
//
// The pre-step stamps `data-part`/`data-variant`/`data-active`/`data-disabled`/
// `data-loading` attributes on both engines without moving any paint (the
// three modern useState hover/focus pairs and every rustic imperative
// handler stay in place). This spec captures the panel's current appearance
// (8 element screenshots covering both the full instance and the loading
// instance) as the pre-migration baseline, plus interaction-state
// screenshots (action-button hover/focus, tab hover, breadcrumb-link hover)
// on rottay/w1280 only. The migration must reproduce every one of these byte
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

const CONTAINER_SELECTOR = '[data-testid="probe-detail-panel"]';

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
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=${width}&slug=button&detailpanel=1`,
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
  // toHaveScreenshot's default animations:'disabled' handles the skeleton's
  // CSS `@keyframes pulse`/`ds-detail-panel-pulse`, so the loading instance's
  // screenshot is deterministic across runs -- there is no timing-dependent
  // opacity to race, only a frozen first frame.
  await page.waitForTimeout(300);

  return container;
}

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    for (const w of WIDTHS) {
      test(`${fixture.id} (${fixture.ground}) / detail-panel / ${engine} @ w${w}`, async ({ page }) => {
        test.setTimeout(60_000);

        const container = await openProbe(page, fixture.id, engine, w);
        await expect(container).toHaveScreenshot(`${fixture.id}-detail-panel-${engine}-w${w}.png`);
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Interaction-state pins (rottay/w1280 only). Every locator scopes to the
// full (non-loading) instance's parts -- the loading instance only ever
// renders `skeleton-*` parts, so `[data-part="action-button"]` etc. can only
// match the full instance.
// ---------------------------------------------------------------------------

test('rottay (dark) / detail-panel / modern: primary action-button hovered', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern', 1280);
  const button = container.locator('[data-part="action-button"][data-variant="primary"]').first();
  await button.hover();
  await page.waitForTimeout(300);

  await expect(button).toHaveScreenshot('rottay-detail-panel-modern-action-primary-hovered.png');
});

test('rottay (dark) / detail-panel / modern: primary action-button focused', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern', 1280);
  const button = container.locator('[data-part="action-button"][data-variant="primary"]').first();
  await button.focus();
  await page.waitForTimeout(300);

  await expect(button).toHaveScreenshot('rottay-detail-panel-modern-action-primary-focused.png');
});

test('rottay (dark) / detail-panel / modern: inactive tab hovered', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern', 1280);
  const tab = container
    .locator('[data-part="tab-button"][data-active="false"][data-disabled="false"]')
    .first();
  await tab.hover();
  await page.waitForTimeout(300);

  await expect(tab).toHaveScreenshot('rottay-detail-panel-modern-tab-hovered.png');
});

test('rottay (dark) / detail-panel / modern: breadcrumb-link hovered', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern', 1280);
  const link = container.locator('[data-part="breadcrumb-link"]').first();
  await link.hover();
  await page.waitForTimeout(300);

  await expect(link).toHaveScreenshot('rottay-detail-panel-modern-breadcrumb-link-hovered.png');
});

test('rottay (dark) / detail-panel / rustic: ghost action-button hovered', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'rustic', 1280);
  const button = container.locator('[data-part="action-button"][data-variant="ghost"]').first();
  await button.hover();
  await page.waitForTimeout(300);

  await expect(button).toHaveScreenshot('rottay-detail-panel-rustic-action-ghost-hovered.png');
});

test('rottay (dark) / detail-panel / rustic: primary action-button hovered (no tint)', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'rustic', 1280);
  const button = container.locator('[data-part="action-button"][data-variant="primary"]').first();
  await button.hover();
  await page.waitForTimeout(300);

  await expect(button).toHaveScreenshot('rottay-detail-panel-rustic-action-primary-hovered.png');
});

test('rottay (dark) / detail-panel / rustic: action-button focused (double ring)', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'rustic', 1280);
  const button = container.locator('[data-part="action-button"][data-variant="primary"]').first();
  await button.focus();
  await page.waitForTimeout(300);

  await expect(button).toHaveScreenshot('rottay-detail-panel-rustic-action-focused.png');
});
