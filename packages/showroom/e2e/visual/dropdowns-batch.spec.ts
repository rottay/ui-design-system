import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-SKIN-02 checkpoint B -- the dropdown family (Select, TreeSelect,
// Cascader, AutoComplete, Mentions) data-part contract evidence.
//
// The pre-step stamps `data-part` (plus a handful of literal `data-*` state
// attributes -- data-selected, data-disabled, data-active, data-open, etc.)
// onto all five components without moving any paint -- every useState hover/
// focus pair and every imperative handler (TreeSelect rustic's search-input
// focus/blur ring, Cascader rustic's row hover, Select's imperative
// clear/tag-remove hover) stays exactly where it was.
//
// An open popup is not capturable at rest (open state = interaction), so the
// 4 rest shots below only cover the closed-trigger grid (placeholders,
// values, tags, disabled). Popup content is captured separately by the
// open-popup shots, which click a trigger and wait for the popup before
// screenshotting it. Portal posture is per-engine and NOT symmetric within a
// component (the mirror-image trap the inventory documented): Select portals
// only in modern's custom-dropdown branch, TreeSelect and Cascader portal
// only in rustic, AutoComplete and Mentions never portal. Portaled popups are
// located page-wide by their own standalone class (they render under
// document.body, not under the probe container); in-tree popups are located
// container-scoped.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const CONTAINER_SELECTOR = '[data-testid="probe-dropdowns"]';

/**
 * Waits until the tenant ground has actually painted before a screenshot is
 * taken. Same timing artifact and same polling strategy as
 * fields-batch.spec.ts's helper of the same name (duplicated here rather than
 * shared -- e2e/visual has no cross-spec helpers module).
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
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=1280&slug=button&dropdowns=1`,
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
// 4 rest shots -- closed-trigger grid only (both engines, both fixtures).
// ---------------------------------------------------------------------------

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / dropdowns / ${engine} @ w1280`, async ({ page }) => {
      test.setTimeout(60_000);

      const container = await openProbe(page, fixture.id, engine);
      await expect(container).toHaveScreenshot(`${fixture.id}-dropdowns-${engine}.png`);
    });
  }
}

// ---------------------------------------------------------------------------
// Open-popup shots (rottay/w1280 only) -- 5 components x 2 engines = 10.
//
// Each component group in the probe renders several fixture instances in a
// fixed order (see DropdownsStates in the torture page); the index picked
// below is the first non-disabled instance whose props force the richest
// branch for that engine (the Select `multiple` instance forces modern's
// custom-dropdown branch instead of the plain native-<select> fallback the
// placeholder instance would take).
// ---------------------------------------------------------------------------

async function clickTrigger(container: Locator, testId: string, part: string, nth = 0): Promise<void> {
  const trigger = container.locator(`[data-testid="${testId}"] [data-part="${part}"]`).nth(nth);
  await trigger.click();
}

for (const engine of ENGINES) {
  test(`rottay (dark) / dropdowns / ${engine}: Select popup open`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    // nth(2) = the `multiple` fixture instance; on modern this is the only
    // instance guaranteed to take the custom-dropdown branch (native <select>
    // has no popup DOM to capture).
    await clickTrigger(container, 'probe-dropdowns-select', 'trigger', 2);

    const popup = engine === 'modern'
      ? page.locator('.rottay-select__dropdown[data-part="dropdown"]')
      : container.locator('[data-testid="probe-dropdowns-select"] [data-part="dropdown"]');
    await popup.waitFor({ timeout: 10_000 });
    await page.waitForTimeout(300);

    await expect(popup).toHaveScreenshot(`rottay-dropdowns-select-${engine}-open.png`);
  });

  test(`rottay (dark) / dropdowns / ${engine}: TreeSelect popup open`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    await clickTrigger(container, 'probe-dropdowns-treeselect', 'trigger', 0);

    // Portal posture is the inverse of Select: TreeSelect portals in rustic,
    // stays in-tree in modern.
    const popup = engine === 'rustic'
      ? page.locator('.rottay-treeselect__dropdown[data-part="dropdown"]')
      : container.locator('[data-testid="probe-dropdowns-treeselect"] [data-part="dropdown"]');
    await popup.waitFor({ timeout: 10_000 });
    await page.waitForTimeout(300);

    await expect(popup).toHaveScreenshot(`rottay-dropdowns-treeselect-${engine}-open.png`);
  });

  test(`rottay (dark) / dropdowns / ${engine}: Cascader popup open`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    await clickTrigger(container, 'probe-dropdowns-cascader', 'trigger', 0);

    // Cascader portals only in rustic -- modern's engine file has no
    // createPortal import (grep-verified), contradicting the checkpoint
    // contract's "Cascader both engines" note; the code is ground truth.
    const popup = engine === 'rustic'
      ? page.locator('.rottay-cascader__dropdown[data-part="dropdown"]')
      : container.locator('[data-testid="probe-dropdowns-cascader"] [data-part="dropdown"]');
    await popup.waitFor({ timeout: 10_000 });
    await page.waitForTimeout(300);

    await expect(popup).toHaveScreenshot(`rottay-dropdowns-cascader-${engine}-open.png`);
  });

  test(`rottay (dark) / dropdowns / ${engine}: AutoComplete popup open`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    // AutoComplete never portals in either engine; clicking the empty-value
    // instance focuses it, which opens the dropdown with all options shown.
    await clickTrigger(container, 'probe-dropdowns-autocomplete', 'input', 0);

    const popup = container.locator('[data-testid="probe-dropdowns-autocomplete"] [data-part="dropdown"]');
    await popup.waitFor({ timeout: 10_000 });
    await page.waitForTimeout(300);

    await expect(popup).toHaveScreenshot(`rottay-dropdowns-autocomplete-${engine}-open.png`);
  });

  test(`rottay (dark) / dropdowns / ${engine}: Mentions popup open`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    // Mentions never portals; the popup only opens once an active `@mention`
    // trigger is being typed (click alone does not open it), so this
    // interaction types into the empty-value instance rather than just
    // clicking -- the only way to reach the popup at all.
    const textarea = container.locator('[data-testid="probe-dropdowns-mentions"] [data-part="textarea"]').nth(0);
    await textarea.click();
    await textarea.pressSequentially('@a');

    const popup = container.locator('[data-testid="probe-dropdowns-mentions"] [data-part="dropdown"]');
    await popup.waitFor({ timeout: 10_000 });
    await page.waitForTimeout(300);

    await expect(popup).toHaveScreenshot(`rottay-dropdowns-mentions-${engine}-open.png`);
  });
}

// ---------------------------------------------------------------------------
// Focus/hover state pins (rottay/w1280 only) -- the inventory's flagged
// interaction-paint sites, ~6 shots.
// ---------------------------------------------------------------------------

test('rottay (dark) / dropdowns / rustic: TreeSelect search-input focused (hardcoded ring)', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'rustic');
  await clickTrigger(container, 'probe-dropdowns-treeselect', 'trigger', 0);

  const searchInput = page.locator('.rottay-treeselect__dropdown [data-part="search-input"]').first();
  await searchInput.waitFor({ timeout: 10_000 });
  await searchInput.focus();
  await page.waitForTimeout(300);

  await expect(searchInput).toHaveScreenshot('rottay-dropdowns-treeselect-rustic-search-focused.png');
});

test('rottay (dark) / dropdowns / rustic: Cascader search-input focused (hardcoded ring)', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'rustic');
  await clickTrigger(container, 'probe-dropdowns-cascader', 'trigger', 0);

  const searchInput = page.locator('.rottay-cascader__dropdown [data-part="search-input"]').first();
  await searchInput.waitFor({ timeout: 10_000 });
  await searchInput.focus();
  await page.waitForTimeout(300);

  await expect(searchInput).toHaveScreenshot('rottay-dropdowns-cascader-rustic-search-focused.png');
});

for (const engine of ENGINES) {
  test(`rottay (dark) / dropdowns / ${engine}: Select option hovered`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    await clickTrigger(container, 'probe-dropdowns-select', 'trigger', 2);

    const option = engine === 'modern'
      ? page.locator('.rottay-select__dropdown [data-part="option"]').first()
      : container.locator('[data-testid="probe-dropdowns-select"] [data-part="option"]').first();
    await option.waitFor({ timeout: 10_000 });
    await option.hover();
    await page.waitForTimeout(300);

    await expect(option).toHaveScreenshot(`rottay-dropdowns-select-${engine}-option-hovered.png`);
  });
}

test('rottay (dark) / dropdowns / rustic: Cascader menu-item hovered (imperative)', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'rustic');
  await clickTrigger(container, 'probe-dropdowns-cascader', 'trigger', 0);

  const option = page.locator('.rottay-cascader__dropdown [data-part="option"]').first();
  await option.waitFor({ timeout: 10_000 });
  await option.hover();
  await page.waitForTimeout(300);

  await expect(option).toHaveScreenshot('rottay-dropdowns-cascader-rustic-option-hovered.png');
});

test('rottay (dark) / dropdowns / rustic: TreeSelect tree-node hovered (imperative)', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'rustic');
  await clickTrigger(container, 'probe-dropdowns-treeselect', 'trigger', 0);

  const option = page.locator('.rottay-treeselect__dropdown [data-part="option"]').first();
  await option.waitFor({ timeout: 10_000 });
  await option.hover();
  await page.waitForTimeout(300);

  await expect(option).toHaveScreenshot('rottay-dropdowns-treeselect-rustic-option-hovered.png');
});
