import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-SKIN-05 checkpoint L -- the layout family (Box, Layout, Collapse,
// Divider, Splitter) data-part contract evidence.
//
// The pre-step stamps `data-part` (plus data-has-sider/data-theme/
// data-collapsed/data-expanded/data-disabled/data-orientation/data-with-text/
// data-dragging) onto all five components without moving any paint. Per
// L.1, Box's own default `data-part="root"` only applies when a caller has
// not already supplied one (ActionDock/BottomTabBar/MobileHeader keep their
// own explicit part names). Per L.2, Divider's with-text root carries no
// extra border to preserve -- the theme.css bridge that looked live is
// zeroed by Tailwind's own preflight (P-76), confirmed live in a real
// browser, not just here. Per L.3, Layout and Splitter mint brand-new
// `rottay-layout*`/`rottay-splitter*` scope classes (grep-verified free
// across CSS and CSS-in-JS) since neither engine carried any first-party
// classname before this pre-step. Nothing in this family is portaled and
// nothing paints from the wall clock, so every rest fixture below is a
// static, deterministic render -- the sole animated mechanism (Collapse's
// grid-template-rows/opacity expand transition) is exercised by the
// dedicated interaction pin below, not the rest shots.
//
// REST TRUTH NOTE: Playwright's toHaveScreenshot disables CSS animations by
// default, so Collapse's transition freezes to its frame-zero paint (the
// `defaultActiveKey={['open']}` panel already rendered expanded, no
// animation to play) in the 4 rest shots below.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const CONTAINER_SELECTOR = '[data-testid="probe-layout"]';

/**
 * Waits until the tenant ground has actually painted before a screenshot is
 * taken. Same timing artifact and same polling strategy as
 * navigation-batch.spec.ts's helper of the same name (duplicated here rather
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

async function openProbe(page: Page, fixture: Fixture, engine: Engine): Promise<Locator> {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto(
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=1280&slug=button&layout=1`,
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

/**
 * Waits until an already-resolved element has stopped moving. A fixed
 * settle timeout photographs whatever frame happens to be on screen when it
 * expires -- Collapse's expand transition runs on `grid-template-rows`
 * (track) and `opacity` (inner content) in lockstep (both read the same
 * `--ds-collapse-transition-duration` token), so polling the arrow's own
 * `transform` (rotate 0deg -> 90deg, same duration) until it is unchanged
 * across consecutive reads is a reliable proxy for the whole reveal being
 * done. Takes an already-resolved Locator (not a raw selector) because this
 * family's fixture renders three structurally-identical Collapse panels --
 * a bare `[data-part="arrow"]` selector would resolve to the wrong (already
 * static) panel's arrow first. Same settle-detection idea as
 * overlay-batch.spec.ts's `waitForSettled`, reimplemented as Locator
 * polling instead of an in-page selector for that reason.
 */
async function waitForLocatorSettled(locator: Locator): Promise<void> {
  let lastKey: string | null = null;
  let stableHits = 0;
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const key = await locator.evaluate((el) => {
      const cs = getComputedStyle(el);
      return `${cs.opacity}|${cs.transform}`;
    });
    if (key === lastKey) {
      stableHits += 1;
      if (stableHits >= 3) return;
    } else {
      stableHits = 0;
      lastKey = key;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

// ---------------------------------------------------------------------------
// 4 rest shots -- both fixtures, both engines, full probe-layout grid.
// ---------------------------------------------------------------------------

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / layout / ${engine} @ w1280`, async ({ page }) => {
      test.setTimeout(60_000);

      const container = await openProbe(page, fixture.id, engine);
      await expect(container).toHaveScreenshot(`${fixture.id}-layout-${engine}.png`);
    });
  }
}

// ---------------------------------------------------------------------------
// Collapse-expanded pin (rottay/w1280 only, both engines). Rest shots show
// the `defaultActiveKey={['open']}` panel already expanded with no
// transition to play; this pin instead clicks the initially-closed panel
// and waits for the reveal to settle, so a future migration cannot silently
// drop the expand/collapse transition itself.
// ---------------------------------------------------------------------------

for (const engine of ENGINES) {
  test(`rottay (dark) / layout / ${engine}: Collapse panel expanded`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    const collapseRoot = container.locator('[data-testid="probe-layout-collapse"]').first();
    const closedPanel = collapseRoot.locator('[data-part="panel"]', { hasText: 'Closed panel' });
    await closedPanel.locator('[data-part="header"]').click();
    await waitForLocatorSettled(closedPanel.locator('[data-part="arrow"]'));

    await expect(collapseRoot).toHaveScreenshot(`rottay-layout-collapse-${engine}-expanded.png`);
  });
}
