import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-SKIN-06 checkpoint CK-A -- dashboard-widgets family (activity ticker/
// timeline/compact/cards, metrics minimal/cards/chart/rows, data-terminal-card
// four variant bodies + DataTerminalStat, stats-header) visual evidence.
//
// The pre-step stamps scope classes + data-part + state attributes onto all
// ten files without moving any paint. This spec captures the family under both
// tenants and both skin engines so the migration is a byte-exact refactor
// against these baselines.
//
// DETERMINISM NOTES (this family is livelier than status/record):
//  - useSmoothCounter (metrics values, DTC values, StatsHeader count-up) is a
//    requestAnimationFrame count-up that does NOT honor prefers-reduced-motion,
//    so `reducedMotion: 'reduce'` does not stop it. `waitForSettled` below
//    therefore digests the container's textContent (not just style) and holds
//    for 3 stable RAF frames -- the numbers stop changing once every counter
//    reaches its target (~1.2s), and only then does the digest stabilize.
//  - ActivityTicker auto-rotates its centre item every 5000ms via setInterval.
//    The settle completes (~1.3s) inside the first [0,5s) window with the
//    ticker at currentIndex=0, and toHaveScreenshot's two stabilization frames
//    land in the same window. If a slow runner ever crosses the 5s boundary,
//    freeze it with page.clock.install()/runFor before goto -- flagged for the
//    baseline owner, not enabled here.
//  - Playwright disables CSS animations for toHaveScreenshot, so every
//    per-mount `<style>`/@keyframes glow/pulse/shimmer freezes to frame zero.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const CONTAINER_SELECTOR = '[data-testid="probe-dashboard"]';

/**
 * Waits until the tenant ground has actually painted before a screenshot is
 * taken. Same helper (duplicated -- e2e/visual has no shared module) as
 * record-batch.spec.ts / status-batch.spec.ts.
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

/**
 * Polls a locator until a digest of its rendered state holds identical across
 * three consecutive RAF frames. The digest includes textContent so the
 * useSmoothCounter count-ups (which reducedMotion does not stop) are settled,
 * plus opacity/transform/boxShadow so any transition tail is settled too.
 * Never a fixed waitForTimeout after an interaction.
 */
async function waitForSettled(page: Page, locator: Locator): Promise<void> {
  const handle = await locator.elementHandle();
  if (!handle) return;
  await page.waitForFunction(
    (el) => {
      const cs = getComputedStyle(el as Element);
      const key = `${(el as Element).textContent}|${cs.opacity}|${cs.transform}|${cs.boxShadow}`;
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

async function openProbe(page: Page, fixture: Fixture, engine: Engine): Promise<Locator> {
  await page.setViewportSize({ width: 1280, height: 2200 });
  await page.goto(
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=1280&slug=button&dashboard=1`,
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

  // Settle the count-up animations + any entrance tail before diffing.
  await waitForSettled(page, container);

  return container;
}

// ---------------------------------------------------------------------------
// 4 rest shots -- both fixtures, both engines, full probe-dashboard grid.
// ---------------------------------------------------------------------------

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / dashboard / ${engine} @ w1280`, async ({ page }) => {
      test.setTimeout(60_000);

      const container = await openProbe(page, fixture.id, engine);
      await expect(container).toHaveScreenshot(`${fixture.id}-dashboard-${engine}.png`);
    });
  }
}

// ---------------------------------------------------------------------------
// Interaction-state pins (rottay/w1280 only) -- the hover paint this family
// leans on. Each hover is anchored to the component's own scope class (data-part
// is shared vocabulary), the hovered node is settled with waitForSettled (never
// waitForTimeout), then that node is the screenshot subject.
//   1. timeline item  -> isHovered swaps item-content borderColor to a
//      type-tinted -200 + translateX + reveals the chevron (the nested
//      concat-in-ternary the contract named).
//   2. compact item   -> isHovered widens the accent-bar (config.gradient) +
//      scales the icon + reveals the chevron.
//   3. metrics-minimal row -> isHovered swaps the value colour + scales the
//      icon + reveals the chevron.
//   4. stats-header card   -> hovered lifts the card (translateY + boxShadow),
//      the 3-way pressed/hovered/default priority chain's hovered branch.
// ---------------------------------------------------------------------------

const HOVERS: ReadonlyArray<{
  name: string;
  container: string;
  target: string;
}> = [
  { name: 'timeline-item', container: '[data-testid="probe-dashboard-activity-timeline"]', target: '.ds-activity-timeline [data-part="item"]' },
  { name: 'compact-item', container: '[data-testid="probe-dashboard-activity-compact"]', target: '.ds-activity-compact [data-part="item"]' },
  { name: 'minimal-row', container: '[data-testid="probe-dashboard-metrics-minimal"]', target: '.ds-metrics-minimal [data-part="metric-row"]' },
  { name: 'stats-card', container: '[data-testid="probe-dashboard-stats"]', target: '.ds-stats-header [data-part="stat-card"]' },
];

for (const engine of ENGINES) {
  for (const hov of HOVERS) {
    test(`rottay (dark) / dashboard / ${engine}: ${hov.name} hovered`, async ({ page }) => {
      test.setTimeout(60_000);

      await openProbe(page, 'rottay', engine);
      const wrap = page.locator(hov.container);
      const target = wrap.locator(hov.target).first();
      await target.hover();
      await waitForSettled(page, target);

      await expect(wrap).toHaveScreenshot(`rottay-dashboard-${engine}-${hov.name}-hover.png`);
    });
  }
}
