import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-SKIN-06 checkpoint CK-D/F -- the patterns/forms family (FilterBuilder,
// FormBuilder, StepWizard, InvoiceTemplate) data-part contract evidence.
//
// The pre-step stamps `data-part` (plus data-root/data-logic/data-field-type/
// data-active/data-completed/data-collapsed/data-open/data-status/
// data-loading and other component-specific state attributes) onto all four
// components under both engines without moving any paint. Per the checkpoint
// contract, this cluster is SIX INDEPENDENT SKINS, not one -- each component
// owns its own private enum-to-style map, sharing no code and mostly no
// values. Nothing in this family is portaled and nothing paints from the
// wall clock, so every rest fixture is a static, deterministic render.
//
// The one live interaction mechanism in this checkpoint is FilterBuilder's
// "Add filter" dropdown row hover (`engines/modern.tsx` and `engines/
// rustic.tsx`, both via `onMouseEnter`/`onMouseLeave` writing
// `el.style.background` directly rather than a `:hover` rule) -- pinned
// below in both engines so a future migration that silently drops the
// interaction is caught.
//
// REST TRUTH NOTE: Playwright's toHaveScreenshot disables CSS animations by
// default, so StepWizard's progress-bar width transition and any other
// transition tail both freeze to their frame-zero paint in the 4 rest shots
// below.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const CONTAINER_SELECTOR = '[data-testid="probe-forms"]';
const FILTER_BUILDER_SELECTOR = '[data-testid="probe-forms-filter-builder"]';

/**
 * Waits until the tenant ground has actually painted before a screenshot is
 * taken. Same timing artifact and same polling strategy as
 * navigation-batch.spec.ts's helper of the same name (duplicated here rather
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
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=1280&slug=button&forms=1`,
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
 * Waits until a just-changed element has stopped moving. Same
 * settle-detection idea as overlay-batch.spec.ts's `waitForSettled` --
 * FilterBuilder's row hover is a synchronous `el.style.background =`
 * mutation with no declared CSS transition, so this resolves on the first
 * poll in practice, but a fixed `waitForTimeout` after a hover is exactly
 * the pattern that produced a flaky baseline elsewhere in this program
 * (HoverCard, documented in overlay-batch.spec.ts) -- never repeat it here.
 */
async function waitForSettled(page: Page, selector: string): Promise<void> {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const read = () => {
        const cs = getComputedStyle(el);
        return `${cs.opacity}|${cs.transform}|${cs.backgroundColor}`;
      };
      const w = window as unknown as { __formsSettle?: { key: string; hits: number } };
      const key = read();
      if (!w.__formsSettle || w.__formsSettle.key !== key) {
        w.__formsSettle = { key, hits: 1 };
        return false;
      }
      w.__formsSettle.hits += 1;
      return w.__formsSettle.hits >= 3;
    },
    selector,
    { timeout: 10_000, polling: 'raf' },
  );
}

// ---------------------------------------------------------------------------
// 4 rest shots -- both fixtures, both engines, full probe-forms grid.
// ---------------------------------------------------------------------------

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / forms / ${engine} @ w1280`, async ({ page }) => {
      test.setTimeout(60_000);

      const container = await openProbe(page, fixture.id, engine);
      await expect(container).toHaveScreenshot(`${fixture.id}-forms-${engine}.png`);
    });
  }
}

// ---------------------------------------------------------------------------
// Interaction pin (rottay/w1280 only, both engines) -- FilterBuilder's "Add
// filter" dropdown, row hovered. This is the checkpoint's only imperative
// paint write (inventory §6); a migration that deletes the handlers without
// transcribing them to a `:hover` rule breaks an interaction no rest shot
// photographs.
// ---------------------------------------------------------------------------

for (const engine of ENGINES) {
  test(`rottay (dark) / forms / ${engine}: FilterBuilder add-filter option hovered`, async ({ page }) => {
    test.setTimeout(60_000);

    await openProbe(page, 'rottay', engine);
    const filterBuilderRoot = page.locator(FILTER_BUILDER_SELECTOR);
    const trigger = filterBuilderRoot.locator('[data-part="add-filter-trigger"]').first();
    await trigger.click();

    const dropdown = filterBuilderRoot.locator('[data-part="add-filter-dropdown"]').first();
    await dropdown.waitFor({ timeout: 10_000 });
    const option = dropdown.locator('[data-part="add-filter-option"]').first();
    await option.hover();
    await waitForSettled(page, '[data-testid="probe-forms-filter-builder"] [data-part="add-filter-dropdown"] [data-part="add-filter-option"]');

    await expect(dropdown).toHaveScreenshot(`rottay-forms-filter-builder-${engine}-add-filter-option-hovered.png`);
  });
}
