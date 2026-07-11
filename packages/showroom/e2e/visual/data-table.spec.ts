import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-ARC-09 checkpoint 6 (data-table, the compound case) -- data-part
// contract evidence across five files and two engines.
//
// The pre-step stamps `data-part`/`data-selected`/`data-striped`/
// `data-pinned`/`data-drag-over`/`data-current`/`data-variant`/
// `data-collapsed`/`data-invalid` attributes and a handful of className
// hooks (`ds-data-table__mobile-card[--selected]`, the
// `ds-pattern-data-table ds-data-table--mobile` scope pair) without moving
// any paint -- every imperative row-hover handler, every inline
// `style={{}}` value, and both engines' per-instance `<style>` blocks stay
// exactly as they were. This spec captures the panel's current appearance
// as the pre-migration baseline; the migration must reproduce every one of
// these byte for byte.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];
const WIDTHS = [360, 1280] as const;

const CONTAINER_SELECTOR = '[data-testid="probe-data-table"]';

/**
 * Waits until the tenant ground has actually painted before a screenshot is
 * taken. Same timing artifact and same polling strategy as
 * detail-panel.spec.ts's helper of the same name (duplicated here rather
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
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=${width}&slug=button&datatable=1`,
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

  await page.waitForTimeout(300);

  return container;
}

/** Opens the probe at a real (not container-width) viewport, for the mobile-card branch. */
async function openMobileProbe(page: Page, fixture: Fixture, engine: Engine): Promise<Locator> {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&slug=button&datatable=1`,
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

  await page.waitForTimeout(300);

  return container;
}

// ---------------------------------------------------------------------------
// REST-state: {rottay,bithire} x {modern,rustic} x w{360,1280} = 8.
// ---------------------------------------------------------------------------

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    for (const w of WIDTHS) {
      test(`${fixture.id} (${fixture.ground}) / data-table / ${engine} @ w${w}`, async ({ page }) => {
        test.setTimeout(60_000);

        const container = await openProbe(page, fixture.id, engine, w);
        await expect(container).toHaveScreenshot(`${fixture.id}-data-table-${engine}-w${w}.png`);
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Interaction-state pins (rottay/w1280 only) -- 7 shots.
// ---------------------------------------------------------------------------

test('rottay (dark) / data-table / modern: row hovered', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern', 1280);
  const row = container.locator('[data-part="body-row"]:not([data-selected="true"])').first();
  await row.hover();
  await page.waitForTimeout(300);

  await expect(row).toHaveScreenshot('rottay-data-table-modern-row-hovered.png');
});

test('rottay (dark) / data-table / modern: sortable-header hovered', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern', 1280);
  const header = container.locator('[data-part="header-cell"][data-sortable="true"]').first();
  await header.hover();
  await page.waitForTimeout(300);

  await expect(header).toHaveScreenshot('rottay-data-table-modern-sortable-header-hovered.png');
});

test('rottay (dark) / data-table / modern: resize-handle hovered', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern', 1280);
  const handle = container.locator('[data-part="resize-handle"]').first();
  await handle.hover();
  await page.waitForTimeout(300);

  await expect(handle).toHaveScreenshot('rottay-data-table-modern-resize-handle-hovered.png');
});

test('rottay (dark) / data-table / modern: cell editing', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern', 1280);
  const editableCell = container.locator('td[data-editable="true"]').first();
  await editableCell.dblclick();
  await container.locator('[data-part="editor-input"]').first().waitFor();
  await page.waitForTimeout(300);

  const editingCell = container.locator('td[data-editing="true"]').first();
  await expect(editingCell).toHaveScreenshot('rottay-data-table-modern-cell-editing.png');
});

test('rottay (dark) / data-table / modern: group-header expanded (before click)', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern', 1280);
  const secondGroup = container.locator('[data-part="group-header-row"]').nth(1);
  await page.waitForTimeout(100);

  await expect(secondGroup).toHaveScreenshot('rottay-data-table-modern-group-header-expanded.png');
});

test('rottay (dark) / data-table / modern: group-header collapsed (after clicking the second group\'s chevron)', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern', 1280);
  const secondGroup = container.locator('[data-part="group-header-row"]').nth(1);
  await secondGroup.click();
  await page.waitForTimeout(300);

  await expect(secondGroup).toHaveScreenshot('rottay-data-table-modern-group-header-collapsed.png');
});

test('rottay (dark) / data-table / rustic: row hovered (no hover paint)', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'rustic', 1280);
  const row = container.locator('[data-part="body-row"]:not([data-state="selected"])').first();
  await row.hover();
  await page.waitForTimeout(300);

  await expect(row).toHaveScreenshot('rottay-data-table-rustic-row-hovered.png');
});

// ---------------------------------------------------------------------------
// Mobile block: real viewport 375x800 -- the isMobile gate is WINDOW width,
// so ?w= (a container-width probe) never triggers it. {rottay} x
// {modern,rustic}: cards rest + one selected card visible = 4 shots (per
// the contract's own item-4 arithmetic, 8 + 7 + 4 = ~19 baselines total).
// ---------------------------------------------------------------------------

for (const engine of ENGINES) {
  test(`rottay (dark) / data-table / mobile / ${engine}: cards rest`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openMobileProbe(page, 'rottay', engine);
    await expect(container).toHaveScreenshot(`rottay-data-table-mobile-${engine}.png`);
  });

  test(`rottay (dark) / data-table / mobile / ${engine}: selected card`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openMobileProbe(page, 'rottay', engine);
    const selectedCard = container.locator('.ds-data-table__mobile-card--selected').first();
    await selectedCard.waitFor();

    await expect(selectedCard).toHaveScreenshot(`rottay-data-table-mobile-${engine}-selected-card.png`);
  });
}
