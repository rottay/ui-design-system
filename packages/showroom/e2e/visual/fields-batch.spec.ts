import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-SKIN-02 checkpoint A -- the field family (15 components) data-part
// contract evidence.
//
// The pre-step stamps `data-part`/`data-state`-like attributes on all 15
// components without moving any paint (every useState hover/focus pair and
// every imperative handler stays in place -- Radio/Checkbox/Switch modern's
// hover state, Input's two clear-button imperative writes, OTPInput modern's
// imperative focus/blur border write, Form's per-mount keyframe `<style>`
// tags). This spec captures the field grid's current appearance (4 rest
// shots covering both engines on both fixtures) as the pre-migration
// baseline, plus interaction-state screenshots on rottay/w1280 only for the
// components the inventory flagged as carrying real interaction paint. The
// migration must reproduce every one of these byte for byte.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const CONTAINER_SELECTOR = '[data-testid="probe-fields"]';

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

async function openProbe(page: Page, fixture: Fixture, engine: Engine): Promise<Locator> {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto(
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=1280&slug=button&fields=1`,
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

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / fields / ${engine} @ w1280`, async ({ page }) => {
      test.setTimeout(60_000);

      const container = await openProbe(page, fixture.id, engine);
      await expect(container).toHaveScreenshot(`${fixture.id}-fields-${engine}.png`);
    });
  }
}

// ---------------------------------------------------------------------------
// Interaction-state pins (rottay/w1280 only). Every locator scopes to the
// per-component `data-testid` group the probe page stamps, so a `.first()`
// always resolves to the intended fixture instance even though several
// component families share the same `data-part` vocabulary (e.g. `root`).
// ---------------------------------------------------------------------------

test('rottay (dark) / fields / modern: radio circle hovered', async ({ page }) => {
  test.setTimeout(60_000);

  await openProbe(page, 'rottay', 'modern');
  const circle = page.locator('[data-testid="probe-fields-radio"] [data-part="circle"]').first();
  await circle.hover();
  await page.waitForTimeout(300);

  await expect(circle).toHaveScreenshot('rottay-fields-radio-modern-hovered.png');
});

test('rottay (dark) / fields / modern: checkbox box hovered', async ({ page }) => {
  test.setTimeout(60_000);

  await openProbe(page, 'rottay', 'modern');
  const box = page.locator('[data-testid="probe-fields-checkbox"] [data-part="box"]').first();
  await box.hover();
  await page.waitForTimeout(300);

  await expect(box).toHaveScreenshot('rottay-fields-checkbox-modern-hovered.png');
});

test('rottay (dark) / fields / modern: switch track hovered', async ({ page }) => {
  test.setTimeout(60_000);

  await openProbe(page, 'rottay', 'modern');
  const track = page.locator('[data-testid="probe-fields-switch"] [data-part="track"]').first();
  await track.hover();
  await page.waitForTimeout(300);

  await expect(track).toHaveScreenshot('rottay-fields-switch-modern-hovered.png');
});

test('rottay (dark) / fields / modern: input clear-button hovered', async ({ page }) => {
  test.setTimeout(60_000);

  await openProbe(page, 'rottay', 'modern');
  const clearButton = page.locator('[data-testid="probe-fields-input"] [data-part="clear-button"]').first();
  await clearButton.hover();
  await page.waitForTimeout(300);

  await expect(clearButton).toHaveScreenshot('rottay-fields-input-clear-button-hovered.png');
});

test('rottay (dark) / fields / modern: OTP slot focused', async ({ page }) => {
  test.setTimeout(60_000);

  await openProbe(page, 'rottay', 'modern');
  const slot = page.locator('[data-testid="probe-fields-otpinput"] [data-part="slot"]').first();
  await slot.focus();
  await page.waitForTimeout(300);

  await expect(slot).toHaveScreenshot('rottay-fields-otpinput-modern-focused.png');
});

test('rottay (dark) / fields / rustic: slider handle focused', async ({ page }) => {
  test.setTimeout(60_000);

  await openProbe(page, 'rottay', 'rustic');
  const rangeInput = page.locator('[data-testid="probe-fields-slider"] input[type="range"]').first();
  const handle = page.locator('[data-testid="probe-fields-slider"] [data-part="handle"]').first();
  await rangeInput.focus();
  await page.waitForTimeout(300);

  await expect(handle).toHaveScreenshot('rottay-fields-slider-rustic-handle-focused.png');
});

test('rottay (dark) / fields / modern: button-icon hovered', async ({ page }) => {
  test.setTimeout(60_000);

  await openProbe(page, 'rottay', 'modern');
  const trigger = page.locator('[data-testid="probe-fields-button-icon"] [data-part="trigger"]').first();
  await trigger.hover();
  await page.waitForTimeout(300);

  await expect(trigger).toHaveScreenshot('rottay-fields-button-icon-hovered.png');
});
