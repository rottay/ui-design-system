import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-SKIN-04 checkpoint N -- the navigation family (Menu, FloatButton, Tabs,
// Steps, Stepper, Pagination, Segmented, BackTop, Breadcrumb, BottomTabBar,
// Anchor, MobileHeader, ActionDock, Affix, Link) data-part contract evidence.
//
// The pre-step stamps `data-part` (plus data-status/data-selected/data-active/
// data-disabled/data-open/data-current/data-placement/data-variant/data-shape/
// data-tone/data-sticky/data-state) onto all fifteen components and their
// compounds without moving any paint -- every mechanism (Menu's injected
// document-global :focus-visible stylesheet, Tabs' per-render @keyframes,
// Steps/Stepper's DaisyUI pseudo-element circle+connector per P-73/N1,
// FloatButton's layered `.btn:hover`/`.btn:active` scale per N2, Breadcrumb's
// second-emitter `.breadcrumbs` pair per N3) stays exactly where it was.
// Nothing in this family is portaled and nothing paints from the wall clock,
// so there is no open-panel dance and no clock pinning required -- every rest
// fixture below is a static, deterministic render.
//
// REST TRUTH NOTE: Playwright's toHaveScreenshot disables CSS animations by
// default, so Tabs' fade-in keyframe and any transition tail both freeze to
// their frame-zero paint in the 4 rest shots below.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const CONTAINER_SELECTOR = '[data-testid="probe-nav"]';

/**
 * Waits until the tenant ground has actually painted before a screenshot is
 * taken. Same timing artifact and same polling strategy as
 * status-batch.spec.ts's helper of the same name (duplicated here rather
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
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=1280&slug=button&nav=1`,
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

// ---------------------------------------------------------------------------
// 4 rest shots -- both fixtures, both engines, full probe-nav grid.
// ---------------------------------------------------------------------------

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / nav / ${engine} @ w1280`, async ({ page }) => {
      test.setTimeout(60_000);

      const container = await openProbe(page, fixture.id, engine);
      await expect(container).toHaveScreenshot(`${fixture.id}-nav-${engine}.png`);
    });
  }
}

// ---------------------------------------------------------------------------
// Interaction-state pins (rottay/w1280 only).
//
// FloatButton hovered in BOTH engines is MANDATORY (checkpoint N contract,
// decision N2): its hover/active scale transform is delivered by a
// layered `.btn:hover`/`.btn:active` rule in theme.css with no runtime-paint
// footprint on the modern engine, so this screenshot catches a future migration
// silently dropping the interaction. Also pinned: Menu item hovered, Tabs
// hovered, Pagination hovered, Segmented hovered -- the family's remaining
// components with real interaction paint per the checkpoint N inventory.
// ---------------------------------------------------------------------------

for (const engine of ENGINES) {
  test(`rottay (dark) / nav / ${engine}: FloatButton hovered`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    const floatButtonRoot = container.locator('[data-testid="probe-nav-floatbutton"]').first();
    const trigger = floatButtonRoot.locator('[data-part="trigger"]').first();
    await trigger.hover();
    await page.waitForTimeout(300);

    await expect(floatButtonRoot).toHaveScreenshot(`rottay-nav-floatbutton-${engine}-hovered.png`);
  });
}

for (const engine of ENGINES) {
  test(`rottay (dark) / nav / ${engine}: Menu item hovered`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    const menuRoot = container.locator('[data-testid="probe-nav-menu"]').first();
    const item = menuRoot.locator('[data-part="item"]:not([data-disabled="true"])').first();
    await item.hover();
    await page.waitForTimeout(300);

    await expect(menuRoot).toHaveScreenshot(`rottay-nav-menu-${engine}-item-hovered.png`);
  });
}

for (const engine of ENGINES) {
  test(`rottay (dark) / nav / ${engine}: Tabs hovered`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    const tabsRoot = container.locator('[data-testid="probe-nav-tabs"]').first();
    const tab = tabsRoot.locator('[data-part="tab-button"][data-selected="false"]:not([data-disabled="true"])').first();
    await tab.hover();
    await page.waitForTimeout(300);

    await expect(tabsRoot).toHaveScreenshot(`rottay-nav-tabs-${engine}-hovered.png`);
  });
}

for (const engine of ENGINES) {
  test(`rottay (dark) / nav / ${engine}: Pagination hovered`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    const paginationRoot = container.locator('[data-testid="probe-nav-pagination"]').first();
    const pageButton = paginationRoot.locator('[data-part="pagination-page-button"][data-current="false"]').first();
    await pageButton.hover();
    await page.waitForTimeout(300);

    await expect(paginationRoot).toHaveScreenshot(`rottay-nav-pagination-${engine}-hovered.png`);
  });
}

for (const engine of ENGINES) {
  test(`rottay (dark) / nav / ${engine}: Segmented hovered`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    const segmentedRoot = container.locator('[data-testid="probe-nav-segmented"]').first();
    const option = segmentedRoot.locator('[data-part="option"][data-selected="false"]:not([data-disabled="true"])').first();
    await option.hover();
    await page.waitForTimeout(300);

    await expect(segmentedRoot).toHaveScreenshot(`rottay-nav-segmented-${engine}-hovered.png`);
  });
}
