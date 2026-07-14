import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-SKIN-06 checkpoint CK-C -- the workspace-chrome family (list-toolbar,
// saved-views, status-filter-pills, column-menu, saved-views-menu,
// export-button, active-filters-bar, scope-switcher, view-mode-switcher,
// table-toolbar, search-command-bar) visual evidence.
//
// The pre-step stamps scope classes (patterns/data: `ds-pattern-<comp>
// ds-engine-<engine>`; structures/workspace: the shipped two-class
// `ds-structure ds-<comp>`; status-filter-pills: single-class
// `ds-pattern-status-filter-pills`) plus `data-part` and state attributes
// onto all 12 in-scope files WITHOUT moving any paint. This spec captures
// the family at rest under both tenants and both skin engines, plus three
// dedicated shots opening each portaled panel (column-menu, saved-views-menu,
// export-button -- Trap 4) since their content is not visible at rest and
// carries the checkpoint's highest scoping risk.
//
// list-toolbar is modern-only in this spec (contract §2.1: rustic
// re-exports classic, no distinct rustic implementation exists to stamp or
// photograph).
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const CONTAINER_SELECTOR = '[data-testid="probe-workspace"]';

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
  await page.setViewportSize({ width: 1280, height: 3400 });
  await page.goto(
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=1280&slug=button&workspace=1`,
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

  return container;
}

async function waitForSettled(page: Page, locator: Locator): Promise<void> {
  const handle = await locator.elementHandle();
  if (!handle) return;
  await page.waitForFunction(
    (el) => {
      const cs = getComputedStyle(el as Element);
      const key = `${cs.opacity}|${cs.transform}|${cs.boxShadow}|${cs.color}|${cs.backgroundColor}|${cs.borderColor}`;
      const w = window as unknown as { __settle?: { key: string; hits: number } };
      if (!w.__settle || w.__settle.key !== key) {
        w.__settle = { key, hits: 1 };
        return false;
      }
      w.__settle.hits += 1;
      return w.__settle.hits >= 3;
    },
    handle,
    { timeout: 10_000, polling: 'raf' },
  );
}

// ---------------------------------------------------------------------------
// 4 rest shots -- both fixtures, both engines, the full probe-workspace grid.
// ---------------------------------------------------------------------------

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / workspace / ${engine} @ w1280`, async ({ page }) => {
      test.setTimeout(60_000);

      const container = await openProbe(page, fixture.id, engine);
      await waitForSettled(page, container);
      await expect(container).toHaveScreenshot(`${fixture.id}-workspace-${engine}.png`, {
        maxDiffPixelRatio: 0.0005,
      });
    });
  }
}

// ---------------------------------------------------------------------------
// Portal trio (Trap 4) -- each panel's content is not visible at rest;
// open the trigger and photograph the portaled panel directly (it renders
// as a sibling of <body>'s other children, not inside the container band).
// rottay/dark, modern only, to keep this pre-step's scope bounded -- the
// migration units add their own byte-exact per-component specs.
// ---------------------------------------------------------------------------

test('rottay (dark) / workspace / modern: column-menu panel open (portaled)', async ({ page }) => {
  test.setTimeout(60_000);
  await openProbe(page, 'rottay', 'modern');
  const trigger = page.locator('[data-testid="probe-workspace-column-menu"] [data-part="trigger"]');
  await trigger.click();
  const panel = page.locator('[data-part="panel"].ds-column-menu-panel');
  await panel.waitFor({ state: 'visible' });
  await waitForSettled(page, panel);
  await expect(panel).toHaveScreenshot('rottay-workspace-column-menu-panel-modern.png', {
    maxDiffPixelRatio: 0.0005,
  });
});

test('rottay (dark) / workspace / modern: saved-views-menu panel open (portaled)', async ({ page }) => {
  test.setTimeout(60_000);
  await openProbe(page, 'rottay', 'modern');
  const trigger = page.locator('[data-testid="probe-workspace-saved-views-menu"] [data-part="trigger"]');
  await trigger.click();
  const panel = page.locator('[data-part="panel"].ds-saved-views-menu-panel');
  await panel.waitFor({ state: 'visible' });
  await waitForSettled(page, panel);
  await expect(panel).toHaveScreenshot('rottay-workspace-saved-views-menu-panel-modern.png', {
    maxDiffPixelRatio: 0.0005,
  });
});

test('rottay (dark) / workspace / modern: export-button panel open (portaled)', async ({ page }) => {
  test.setTimeout(60_000);
  await openProbe(page, 'rottay', 'modern');
  const trigger = page.locator('[data-testid="probe-workspace-export-button"] [data-part="trigger"]');
  await trigger.click();
  const panel = page.locator('[data-part="panel"].ds-export-button-panel');
  await panel.waitFor({ state: 'visible' });
  await waitForSettled(page, panel);
  await expect(panel).toHaveScreenshot('rottay-workspace-export-button-panel-modern.png', {
    maxDiffPixelRatio: 0.0005,
  });
});
