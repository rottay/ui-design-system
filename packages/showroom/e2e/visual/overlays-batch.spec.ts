import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-SKIN-03 checkpoint O -- the overlays family (Modal, Drawer, Toast,
// Message, Notification, Result) data-part contract evidence.
//
// The pre-step stamps `data-part` (plus data-tone/data-placement/data-open)
// onto all six components without moving any paint -- every imperative
// handler (Modal/Drawer modern close-button hover, Message/Notification
// rustic close-button hover), keyframe, and portal target stays exactly
// where it was. Portal posture is per-component and NOT symmetric (the
// inventory's documented cross-component divergence): Modal portals in both
// engines via the shared Portal util; Toast portals ONLY at the
// Toast.Container stacking layer (a standalone inline `<Toast>` never
// portals); Drawer/Message/Notification/Result do not portal in either
// engine. Portaled surfaces are located page-wide (they render under
// document.body, outside the probe container); in-tree parts are located
// container-scoped.
//
// Modal and Drawer render CLOSED at rest (their internal DOM does not exist
// until a trigger is clicked -- both early-return an empty fragment while
// closed), so the 4 rest shots below only cover the closed-trigger grid plus
// the always-static Toast/Message/Notification/Result instances. Open-panel
// content is captured separately by the open-surface shots below.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const CONTAINER_SELECTOR = '[data-testid="probe-overlayfb"]';

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
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=1280&slug=button&overlayfb=1`,
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
// 4 rest shots -- closed Modal/Drawer triggers + the always-static Toast/
// Message/Notification/Result instances (both fixtures, both engines).
// ---------------------------------------------------------------------------

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / overlayfb / ${engine} @ w1280`, async ({ page }) => {
      test.setTimeout(60_000);

      const container = await openProbe(page, fixture.id, engine);
      await expect(container).toHaveScreenshot(`${fixture.id}-overlayfb-${engine}.png`);
    });
  }
}

// ---------------------------------------------------------------------------
// Open-surface shots (rottay/w1280 only) -- Modal (both engines, portaled to
// document.body) and Drawer (both engines, in-tree, container-scoped).
// ---------------------------------------------------------------------------

for (const engine of ENGINES) {
  test(`rottay (dark) / overlayfb / ${engine}: Modal surface open`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    await container.locator('[data-testid="probe-overlayfb-modal-trigger"]').click();

    // Modal portals to document.body in both engines -- the surface is never
    // a descendant of the render container. Drawer also stamps
    // data-part="surface" but always carries data-placement, so excluding it
    // resolves this to exactly the portaled modal panel (Drawer is closed in
    // this test and has no DOM at all, but the exclusion keeps the locator
    // honest regardless of test order).
    const surface = page.locator('[data-part="surface"]:not([data-placement])');
    await surface.waitFor({ timeout: 10_000 });
    expect(await container.locator('[data-part="surface"]').count()).toBe(0);
    await page.waitForTimeout(300);

    await expect(surface).toHaveScreenshot(`rottay-overlayfb-modal-${engine}-open.png`);
  });
}

for (const engine of ENGINES) {
  test(`rottay (dark) / overlayfb / ${engine}: Drawer surface open`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    await container.locator('[data-testid="probe-overlayfb-drawer-trigger"]').click();

    // Drawer does not portal in either engine -- the surface stays in-tree,
    // container-scoped. data-placement disambiguates it from Modal's surface.
    const surface = container.locator('[data-part="surface"][data-placement]');
    await surface.waitFor({ timeout: 10_000 });
    await page.waitForTimeout(300);

    await expect(surface).toHaveScreenshot(`rottay-overlayfb-drawer-${engine}-open.png`);
  });
}

// ---------------------------------------------------------------------------
// Container-toast open shot (rottay/w1280 only) -- Toast.Container portals
// to document.body; the per-toast showProgress bar is an imperative rAF loop
// recomputing width from Date.now() elapsed time (checkpoint contract
// decision 3), so the clock MUST be pinned before the trigger is clicked.
// Freezing Date.now() to a single fixed instant makes every elapsed-time
// computation resolve to 0 for the lifetime of the test, holding the
// progress bar at its initial width -- deterministic and replayable, not a
// mid-depletion sample.
// ---------------------------------------------------------------------------

for (const engine of ENGINES) {
  test(`rottay (dark) / overlayfb / ${engine}: container toast open (clock-pinned)`, async ({ page }) => {
    test.setTimeout(60_000);

    await page.clock.setFixedTime(new Date('2026-07-11T20:00:00'));

    const container = await openProbe(page, 'rottay', engine);
    await container.locator('[data-testid="probe-overlayfb-toast-trigger"]').click();

    // Toast.Container is the only component in this batch that portals per
    // its own engine-agnostic stacking layer (not per Modal/Toast-root
    // engine); its class name predates this checkpoint and is the anchor a
    // live personality.css rule already targets, so it is used here instead
    // of the new data-part to keep the locator resilient to that external
    // dependency.
    const stackContainer = page.locator('.rottay-toast-container');
    await stackContainer.waitFor({ timeout: 10_000 });
    await page.waitForTimeout(300);

    await expect(stackContainer).toHaveScreenshot(`rottay-overlayfb-container-toast-${engine}-open.png`);
  });
}

// ---------------------------------------------------------------------------
// Close-button hover pins (rottay/w1280 only) -- ONLY the four sites the
// inventory documents as having real hover paint: Modal modern (imperative
// background-color), Drawer modern (imperative background-color), Message
// rustic (imperative color), Notification rustic (imperative color). Modal
// rustic, Drawer rustic, Toast (both engines), Message modern, Notification
// modern, and Result have zero hover mechanism on their close buttons (or,
// for Result, no close button at all) -- confirmed by the inventory's
// per-engine grep, not assumed symmetric.
// ---------------------------------------------------------------------------

test('rottay (dark) / overlayfb / modern: Modal close-button hovered', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern');
  await container.locator('[data-testid="probe-overlayfb-modal-trigger"]').click();

  const closeButton = page.locator('[data-part="surface"]:not([data-placement]) [data-part="close-button"]');
  await closeButton.waitFor({ timeout: 10_000 });
  await closeButton.hover();
  await page.waitForTimeout(300);

  await expect(closeButton).toHaveScreenshot('rottay-overlayfb-modal-modern-close-button-hovered.png');
});

test('rottay (dark) / overlayfb / modern: Drawer close-button hovered', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern');
  await container.locator('[data-testid="probe-overlayfb-drawer-trigger"]').click();

  const closeButton = container.locator('[data-part="surface"][data-placement] [data-part="close-button"]');
  await closeButton.waitFor({ timeout: 10_000 });
  await closeButton.hover();
  await page.waitForTimeout(300);

  await expect(closeButton).toHaveScreenshot('rottay-overlayfb-drawer-modern-close-button-hovered.png');
});

test('rottay (dark) / overlayfb / rustic: Message close-button hovered', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'rustic');
  const closeButton = container.locator('[data-testid="probe-overlayfb-message"] [data-part="close-button"]');
  await closeButton.hover();
  await page.waitForTimeout(300);

  await expect(closeButton).toHaveScreenshot('rottay-overlayfb-message-rustic-close-button-hovered.png');
});

test('rottay (dark) / overlayfb / rustic: Notification close-button hovered', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'rustic');
  const closeButton = container.locator('[data-testid="probe-overlayfb-notification"] [data-part="close-button"]');
  await closeButton.hover();
  await page.waitForTimeout(300);

  await expect(closeButton).toHaveScreenshot('rottay-overlayfb-notification-rustic-close-button-hovered.png');
});
