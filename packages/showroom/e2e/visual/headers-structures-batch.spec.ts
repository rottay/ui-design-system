import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-SKIN-06 checkpoint CK-B/S -- the structures/headers half of the header
// family (DetailHeader, EditHeader, FormHeader, CollectionHeader,
// DashboardHeader) data-part contract evidence. The `patterns/misc` half
// (cockpit-header, page-shell, workbench-header) has its own spec,
// headers-batch.spec.ts, and its own probe section -- the two must not
// collide, hence the distinct `?headers=1` param and file name here.
//
// The pre-step stamps `data-part` (plus data-archetype/data-active/
// data-embedded/data-title-treatment/data-tone/data-state/data-direction/
// data-compact/data-loading/data-variant) onto all five components without
// moving any paint. Per the checkpoint contract this half is FOUR
// independent token sets, not one: Edit and Form share one archetype
// recipe byte-for-byte (proven by diff, not assumed); Detail is the same
// 8-layer shape with every numeric value diverging; Collection and
// Dashboard are unrelated to either.
//
// Zero hover mechanisms exist anywhere in this half except EditHeader's own
// dead `<style>` block (contract §4): grep-confirmed, no
// onMouseEnter/onMouseLeave/onFocus/onBlur/`:hover` anywhere in detail/
// edit/form/collection/dashboard except the two `:hover` rules inside
// EditHeader's own template-literal stylesheet, both of which lose to an
// inline style on the same element today. DetailHeader's tab strip has no
// hover either -- its paint is 100% keyed on `isActive` (React state set by
// `onClick`), so its pin below is a CLICK-triggered state-transition pin,
// not a hover pin; it exercises the 160ms CSS transition
// (`background/border-color/transform`) declared on the tab item.
//
// REST TRUTH NOTE: Playwright's toHaveScreenshot disables CSS animations by
// default, so DashboardHeader's `live`/`syncing` StatusDot instances (which
// carry `animation: 'pulse 2s infinite'`) freeze to a single consistent
// frame in the 4 rest shots below -- this is why there is no dedicated
// interaction pin for the pulse animation: an infinite animation cannot be
// settled by `waitForSettled` (there is no stable end state to poll for),
// and pinning a moving element produces exactly the flake this program has
// already paid for once (see overlay-batch.spec.ts's HoverCard finding).
// The rest shot already captures a deterministic frame of both animating
// states; that is the full extent of what this checkpoint can safely prove
// about them.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const CONTAINER_SELECTOR = '[data-testid="probe-headers"]';
const EDIT_HEADER_SELECTOR = '[data-testid="probe-headers-edit"]';
const DETAIL_HEADER_SELECTOR = '[data-testid="probe-headers-detail"]';

/**
 * Waits until the tenant ground has actually painted before a screenshot is
 * taken. Same timing artifact and same polling strategy as every other
 * batch spec's helper of the same name (duplicated here rather than shared
 * -- e2e/visual has no cross-spec helpers module).
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
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=1280&slug=button&headers=1`,
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
 * Waits until a just-changed element has stopped moving: polls
 * opacity/transform/box-shadow until unchanged across three consecutive
 * frames. Never a fixed `waitForTimeout` after a hover/click -- a baseline
 * recorded mid-transition is inherited forever (see overlay-batch.spec.ts's
 * HoverCard finding, the canonical example this idiom was built to avoid).
 */
async function waitForSettled(page: Page, selector: string): Promise<void> {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const read = () => {
        const cs = getComputedStyle(el);
        return `${cs.opacity}|${cs.transform}|${cs.boxShadow}`;
      };
      const w = window as unknown as { __headersSettle?: { key: string; hits: number } };
      const key = read();
      if (!w.__headersSettle || w.__headersSettle.key !== key) {
        w.__headersSettle = { key, hits: 1 };
        return false;
      }
      w.__headersSettle.hits += 1;
      return w.__headersSettle.hits >= 3;
    },
    selector,
    { timeout: 10_000, polling: 'raf' },
  );
}

// ---------------------------------------------------------------------------
// 4 rest shots -- both fixtures, both engines, full probe-headers grid.
// ---------------------------------------------------------------------------

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / headers-structures / ${engine} @ w1280`, async ({ page }) => {
      test.setTimeout(60_000);

      const container = await openProbe(page, fixture.id, engine);
      await expect(container).toHaveScreenshot(`${fixture.id}-headers-structures-${engine}.png`);
    });
  }
}

// ---------------------------------------------------------------------------
// MANDATORY interaction pins (rottay/w1280 only, both engines) -- the two
// dead rules from contract §4. `.back-button:hover` and
// `.breadcrumb-link:hover` both lose to an inline style on the same
// element today (an inline declaration beats any non-`!important` author
// rule, and the breadcrumb's `!important` sets the identical value it
// already has). These pins are the whole reason this checkpoint pins a
// hover at all: recorded now, they are the photographic proof of
// deadness -- each should be visually IDENTICAL to the un-hovered rest
// shot. If the migration ever revives either rule (e.g. by lifting the
// chip's inline background/border into the skin without also deleting
// `.back-button:hover`), this baseline goes red.
// ---------------------------------------------------------------------------

for (const engine of ENGINES) {
  test(`rottay (dark) / headers-structures / ${engine}: EditHeader back-button hovered (dead rule, §4)`, async ({ page }) => {
    test.setTimeout(60_000);

    await openProbe(page, 'rottay', engine);
    const editHeaderRoot = page.locator(EDIT_HEADER_SELECTOR);
    const backButton = editHeaderRoot.locator('[data-part="back-button"]').first();
    await backButton.hover();
    await waitForSettled(page, `${EDIT_HEADER_SELECTOR} [data-part="back-button"]`);

    await expect(backButton).toHaveScreenshot(`rottay-headers-structures-editheader-${engine}-back-button-hovered.png`);
  });
}

for (const engine of ENGINES) {
  test(`rottay (dark) / headers-structures / ${engine}: EditHeader breadcrumb-link hovered (dead rule, §4)`, async ({ page }) => {
    test.setTimeout(60_000);

    await openProbe(page, 'rottay', engine);
    const editHeaderRoot = page.locator(EDIT_HEADER_SELECTOR);
    const breadcrumbLink = editHeaderRoot.locator('[data-part="breadcrumb-link"]').first();
    await breadcrumbLink.hover();
    await waitForSettled(page, `${EDIT_HEADER_SELECTOR} [data-part="breadcrumb-link"]`);

    await expect(breadcrumbLink).toHaveScreenshot(`rottay-headers-structures-editheader-${engine}-breadcrumb-link-hovered.png`);
  });
}

// ---------------------------------------------------------------------------
// DetailHeader tab strip -- a CLICK-triggered state-transition pin, not a
// hover pin (no hover mechanism exists on this component; every tab's
// paint is keyed on `isActive`, set by `onClick`). Clicks the first
// currently-inactive tab and waits for the 160ms
// background/border-color/transform CSS transition declared on the tab
// item to settle before shooting, so a future migration that drops the
// transition (or breaks the isActive->CSS mapping) shows up as a diff.
// ---------------------------------------------------------------------------

for (const engine of ENGINES) {
  test(`rottay (dark) / headers-structures / ${engine}: DetailHeader tab clicked (active/inactive transition)`, async ({ page }) => {
    test.setTimeout(60_000);

    await openProbe(page, 'rottay', engine);
    const detailHeaderRoot = page.locator(DETAIL_HEADER_SELECTOR);
    const tabStrip = detailHeaderRoot.locator('[data-part="tab-strip"]').first();
    const inactiveTab = tabStrip.locator('[data-part="tab"][data-active="false"]').first();
    await inactiveTab.click();
    await waitForSettled(page, `${DETAIL_HEADER_SELECTOR} [data-part="tab-strip"]`);

    await expect(tabStrip).toHaveScreenshot(`rottay-headers-structures-detailheader-${engine}-tab-clicked.png`);
  });
}
