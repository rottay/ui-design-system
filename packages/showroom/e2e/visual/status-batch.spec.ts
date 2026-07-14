import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-SKIN-03 checkpoint S -- the status family (Skeleton, Alert, Progress,
// Spinner, Rate) data-part contract evidence.
//
// The pre-step stamps `data-part` (plus data-tone, data-status, data-state,
// data-active) onto all five components without moving any paint -- every
// animation mechanism (Skeleton's modern DaisyUI class / rustic injected
// pulse+wave keyframes / compound shimmer, Spinner's per-engine injected
// spin keyframes, Rate's per-engine hover mechanism) stays exactly where it
// was. Unlike pickers-batch.spec.ts, nothing in this family is portaled and
// nothing paints from the wall clock, so there is no open-panel dance and no
// clock pinning required -- every fixture below is a static, deterministic
// render (fixed percent/value props, no live data).
//
// REST TRUTH NOTE: Playwright's toHaveScreenshot disables CSS animations by
// default, so Skeleton's shimmer/pulse/wave and Spinner's rotation both
// freeze to their frame-zero paint in the 4 rest shots below -- the
// screenshot is that frozen first frame, not a mid-animation sample.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const CONTAINER_SELECTOR = '[data-testid="probe-statusfb"]';

/**
 * Waits until the tenant ground has actually painted before a screenshot is
 * taken. Same timing artifact and same polling strategy as
 * pickers-batch.spec.ts's helper of the same name (duplicated here rather
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
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=1280&slug=button&statusfb=1`,
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
// 4 rest shots -- both fixtures, both engines, full probe-statusfb grid.
// ---------------------------------------------------------------------------

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / statusfb / ${engine} @ w1280`, async ({ page }) => {
      test.setTimeout(60_000);

      const container = await openProbe(page, fixture.id, engine);
      await expect(container).toHaveScreenshot(`${fixture.id}-statusfb-${engine}.png`);
    });
  }
}

// ---------------------------------------------------------------------------
// Interaction-state pins (rottay/w1280 only) -- Rate star hovered per engine,
// the only hover paint in this family (rustic's react-state scale transform
// vs modern's real CSS :hover, per the checkpoint contract's decision 4).
// Hovering the third star of the "full" Rate instance (defaultValue=5)
// drives displayValue from 5 down to 3, so the shot also proves the
// per-star color recompute reacts to the hover value, not just the hovered
// star itself.
// ---------------------------------------------------------------------------

for (const engine of ENGINES) {
  test(`rottay (dark) / statusfb / ${engine}: Rate star hovered`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    // Anchored to Rate's own scope class: `data-part` is a shared vocabulary, and
    // the fixture's `<Text>` label stamps `root` too, so a bare part selector would
    // pick the label instead of the Rate.
    const rateRoot = container
      .locator('[data-testid="probe-statusfb-rate"] .rottay-rate[data-part="root"]')
      .first();
    const thirdStar = rateRoot.locator('[data-part="star"]').nth(2);
    await thirdStar.hover();
    await page.waitForTimeout(300);

    await expect(rateRoot).toHaveScreenshot(`rottay-statusfb-rate-${engine}-star-hovered.png`);
  });
}
