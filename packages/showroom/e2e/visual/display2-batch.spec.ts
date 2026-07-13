import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-SKIN-05 checkpoint D2 -- the data-display family (Tree, Calendar, List,
// Timeline, Descriptions, Statistic, Typography, Tooltip, Callout) data-part
// contract evidence.
//
// The pre-step stamps `data-part` (plus data-tone/data-selected/data-expanded/
// data-disabled/data-focused/data-drop-target/data-today/data-mode/
// data-active/data-trend/data-color/data-placement/data-open) onto all nine
// components and their live compounds without moving any paint -- every
// mechanism (Tree's two-layer hover: CSS on the wrapper + imperative JS on
// the row; Calendar's three-mechanism hover split across nav buttons, day
// cells, and month cells; Timeline's DaisyUI `.timeline-start/-middle/-end`
// bridge; Statistic modern's `.stat-title`/`.stat-value` bridge; rustic Tree's
// dedup-guarded keyframe injection) stays exactly where it was.
//
// Calendar is DATE-DRIVEN: its "today" ring is compiled from a real
// `new Date()` inside the component with no override prop, so the clock is
// pinned via `page.clock.setFixedTime` before every navigation -- otherwise
// the committed baselines expire at midnight (the WO-SKIN-02 DatePicker
// lesson). Countdown's 1-second interval and Tooltip/Tree/List's hover
// transitions never fire because Playwright's fake clock does not
// auto-advance timers unless explicitly told to.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const CONTAINER_SELECTOR = '[data-testid="probe-display2"]';

// The recording day this batch's baselines were captured on. Every open
// probe pins the browser clock here first so Calendar's wall-clock "today"
// ring and Countdown's target-time math stay the pre-migration truth they
// were captured as, not whatever day the gate happens to run on.
const RECORDING_DAY = new Date('2026-07-13T20:00:00');

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
  await page.clock.setFixedTime(RECORDING_DAY);
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto(
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=1280&slug=button&display2=1`,
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
 * Waits until a just-touched element has stopped moving.
 *
 * A fixed settle timeout photographs whatever frame happens to be on screen
 * when it expires -- overlay-batch.spec.ts hit exactly this flake once in
 * ~40 runs (a fade caught mid-transition read as a migration defect). This
 * polls a wider channel set than that spec's own helper: this family's
 * hover pins settle via background-color/border/box-shadow (Tree's row and
 * wrapper hover, List's item hover), not the opacity/transform scale
 * entrance overlay-batch's surfaces animate through, so both shapes are
 * tracked together until three consecutive frames read identical.
 */
async function waitForSettled(page: Page, selector: string): Promise<void> {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const read = () => {
        const cs = getComputedStyle(el);
        return [cs.opacity, cs.transform, cs.backgroundColor, cs.borderLeftColor, cs.boxShadow].join('|');
      };
      const w = window as unknown as { __settle?: { key: string; hits: number } };
      const key = read();
      if (!w.__settle || w.__settle.key !== key) {
        w.__settle = { key, hits: 1 };
        return false;
      }
      w.__settle.hits += 1;
      return w.__settle.hits >= 3;
    },
    selector,
    { timeout: 10_000, polling: 'raf' },
  );
}

// ---------------------------------------------------------------------------
// 4 rest shots -- both fixtures, both engines, full probe-display2 grid.
// ---------------------------------------------------------------------------

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / display2 / ${engine} @ w1280`, async ({ page }) => {
      test.setTimeout(60_000);

      const container = await openProbe(page, fixture.id, engine);
      await expect(container).toHaveScreenshot(`${fixture.id}-display2-${engine}.png`);
    });
  }
}

// ---------------------------------------------------------------------------
// Interaction-state pins (rottay/w1280 only).
//
// Tree node hovered in BOTH engines is MANDATORY (checkpoint D2.2): modern's
// hover is a real two-layer system -- the CSS bridge paints the outer
// `.rottay-tree-node` wrapper on `:hover`, and the row's own imperative
// `onMouseEnter` paints the inner row simultaneously. Hovering the row (not
// the wrapper's gutter) fires both, so the row is the element under test.
// ---------------------------------------------------------------------------

for (const engine of ENGINES) {
  test(`rottay (dark) / display2 / ${engine}: Tree node hovered`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    const treeRoot = container.locator('[data-testid="probe-display2-tree"]').first();
    const row = treeRoot.locator("[data-part='row']:not([data-disabled])").first();
    await row.hover();
    await waitForSettled(page, "[data-testid='probe-display2-tree'] [data-part='row']:not([data-disabled])");

    await expect(treeRoot).toHaveScreenshot(`rottay-display2-tree-${engine}-hovered.png`);
  });
}

// ---------------------------------------------------------------------------
// List item hovered -- CONTRADICTS the checkpoint's anticipated state list.
// WO-SKIN-05 D2 pre-step finding: `List.Item` has no `selected`/`clickable`
// prop and neither engine wires an `onMouseEnter`/`:hover` rule to
// `[data-part='item']` today (code over inventory) -- this pin is still
// captured so a future migration has a real "no visible change on hover"
// baseline to diff against, not a fabricated one.
// ---------------------------------------------------------------------------

for (const engine of ENGINES) {
  test(`rottay (dark) / display2 / ${engine}: List item hovered`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    const listRoot = container.locator('[data-testid="probe-display2-list"]').first();
    const item = listRoot.locator("[data-part='item']").first();
    await item.hover();
    await page.waitForTimeout(300);

    await expect(listRoot).toHaveScreenshot(`rottay-display2-list-${engine}-hovered.png`);
  });
}

// ---------------------------------------------------------------------------
// Tooltip open -- closed at rest (matching every other floating component's
// rest posture), opened here via its default hover trigger. Modern portals
// the bubble to `document.body` with NO scope class of its own (checkpoint
// D2 inventory finding: a green-field portal case, same shape as
// WO-SKIN-02's Select dropdown) -- the pre-step deliberately did not mint
// one, so this bubble is located page-wide by its bare `data-part`. Rustic
// renders in-tree, so its bubble is located inside the probe container.
// ---------------------------------------------------------------------------

for (const engine of ENGINES) {
  test(`rottay (dark) / display2 / ${engine}: Tooltip open`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    const trigger = container.locator('[data-testid="probe-display2-tooltip-trigger"]');
    await trigger.hover();

    const bubbleSelector = "[data-part='bubble']";
    const bubble = engine === 'modern' ? page.locator(bubbleSelector) : container.locator(bubbleSelector);
    await bubble.waitFor({ timeout: 10_000 });
    await waitForSettled(page, bubbleSelector);

    await expect(bubble).toHaveScreenshot(`rottay-display2-tooltip-${engine}-open.png`);
  });
}
