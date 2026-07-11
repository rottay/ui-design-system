import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-ARC-09 checkpoint 2 -- FieldFiltersPanel data-part contract evidence.
//
// The pre-step stamps `data-part`/`data-tone` attributes and the
// `ds-field-filters-panel__control` class on the panel without moving any
// paint. This spec captures the panel's current appearance (8 element
// screenshots) as the pre-migration baseline, and separately pins the
// rustic-input focus-suppression cascade fact recorded in the WO-ARC-09
// checkpoint 2 contract: today the panel's inline `controlStyle` outranks
// the rustic input skin's `[data-state~='focused']` rules on every channel
// it sets, so focusing that control paints nothing. The migration's skin
// selectors must reproduce that exactly (P-64/(0,8,0) escalation), and this
// equality block is what proves it stayed true byte for byte.
//
// This is NOT states.spec.ts: that file's "every focusable subject paints a
// keyboard focus indicator" invariant would flag the rustic input's
// pre-existing suppression as a defect. It belongs here instead, scoped to
// this component only.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];
const WIDTHS = [360, 1280] as const;

const CONTAINER_SELECTOR = '[data-testid="probe-field-filters"]';
const CONTROL_SELECTOR = '.ds-field-filters-panel__control';
const EXPECTED_CONTROL_COUNT = 4;

/**
 * Waits until the tenant ground has actually painted before a screenshot is
 * taken. Same timing artifact and same polling strategy as
 * flagships.spec.ts / container-axis.spec.ts's helper of the same name
 * (duplicated here rather than shared -- e2e/visual has no cross-spec
 * helpers module): ThemeProvider writes the `data-theme`/`data-tenant`
 * attributes that the ground's background token resolves through in a
 * layout effect on hydration, so there is a narrow window where the ground
 * can paint with the wrong palette before flipping to the requested
 * tenant's.
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
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=${width}&slug=button&fieldfilters=1`,
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
    for (const w of WIDTHS) {
      test(`${fixture.id} (${fixture.ground}) / field-filters / ${engine} @ w${w}`, async ({ page }) => {
        test.setTimeout(60_000);

        const container = await openProbe(page, fixture.id, engine, w);
        await expect(container).toHaveScreenshot(`${fixture.id}-field-filters-${engine}-w${w}.png`);
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Focus-suppression equality pins.
// ---------------------------------------------------------------------------

const PAINT_CHANNELS = [
  'backgroundColor',
  'backgroundImage',
  'borderColor',
  'borderTopWidth',
  'boxShadow',
  'borderRadius',
] as const;

type Paint = Record<(typeof PAINT_CHANNELS)[number], string>;

async function readControlPaint(control: Locator): Promise<Paint> {
  return control.evaluate((el, channels) => {
    const computed = getComputedStyle(el);
    const cell: Record<string, string> = {};
    for (const channel of channels) cell[channel] = computed[channel as never] as string;
    return cell as Paint;
  }, PAINT_CHANNELS as unknown as string[]);
}

/**
 * Focuses whatever is actually focusable for a control landing element: the
 * landing itself where the caller's className/style land on the real input
 * root (the rustic Input case), or the focusable descendant the engine
 * nests it around otherwise (every other landing -- see the contract's
 * cascade-facts section for which is which per engine).
 */
async function focusControl(control: Locator): Promise<void> {
  const focusableSelector = 'input, button, [tabindex]';
  const isSelfFocusable = await control.evaluate(
    (el, sel) => (el as HTMLElement).matches(sel),
    focusableSelector,
  );
  if (isSelfFocusable) {
    await control.evaluate((el) => (el as HTMLElement).focus());
  } else {
    await control.locator(focusableSelector).first().focus();
  }
}

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / field-filters / ${engine}: focus never repaints a control`, async ({
      page,
    }) => {
      test.setTimeout(60_000);

      await openProbe(page, fixture.id, engine, 1280);

      const controls = page.locator(CONTROL_SELECTOR);
      await expect(controls).toHaveCount(EXPECTED_CONTROL_COUNT);

      for (let index = 0; index < EXPECTED_CONTROL_COUNT; index += 1) {
        const control = controls.nth(index);
        const rest = await readControlPaint(control);

        await focusControl(control);
        const focused = await readControlPaint(control);

        expect(
          focused,
          `${fixture.id}/${engine}: control #${index} repainted on focus`,
        ).toEqual(rest);

        await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      }
    });
  }
}
