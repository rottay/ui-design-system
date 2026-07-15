import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-SKIN-04 checkpoint P -- the overlay-primitives family (Modal, Tour,
// ConfirmDialog, AlertDialog, Popconfirm, Sheet, ContextMenu, Popover,
// Dropdown, HoverCard, Watermark) data-part contract evidence. AdaptiveOverlay
// owns no DOM of its own (checkpoint contract P4/P6) and has no fixture here.
//
// The pre-step stamps `data-part` (plus data-open/data-placement/data-tone/
// data-variant/data-ok-type/data-loading/data-action/data-current/
// data-disabled) onto all eleven components without moving any paint --
// every imperative handler (Modal/Sheet modern close-button hover,
// ContextMenu/Dropdown rustic item hover), keyframe, and portal target stays
// exactly where it was.
//
// PORTAL POSTURE IS PER-ENGINE, NOT PER-COMPONENT (checkpoint contract P4):
// - Modal, Tour: portal in BOTH engines.
// - ConfirmDialog, AlertDialog, Watermark: portal in NEITHER engine.
// - Popconfirm, Sheet, ContextMenu, Popover, Dropdown, HoverCard: modern does
//   NOT portal (in-tree, descendant of the probe container); rustic DOES
//   (direct createPortal to document.body, outside the probe container).
// This is why the surface locator below is a per-component, per-engine
// function rather than one shared selector -- assuming "the surface is
// inside the container" or "the surface is on document.body" is wrong for
// half of this family, and wrong in different directions for Sheet.
//
// TWO MANDATORY PINS (checkpoint contract P2 -- paint with zero inline
// footprint, invisible to any scan of the component's own source):
// - AlertDialog modern OPEN: the backdrop blur and dialog-box shadow are
//   painted entirely by `personality.css` (`.modal-backdrop`/`.modal-box`,
//   DaisyUI classnames AlertDialog modern deliberately keeps). The general
//   open-shot loop below already exercises this combination; the dedicated
//   test further down exists only to give it an unambiguous, individually
//   named artifact for review.
// - Dropdown modern ITEM HOVERED: the hover background comes from
//   `modern/theme.css`'s `.menu li > button:hover` rule, not from Dropdown's
//   own element styles -- a plain "open" shot would miss it completely, so this
//   one requires an explicit hover step beyond opening the panel.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';
type Interaction = 'click' | 'right-click' | 'hover';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const CONTAINER_SELECTOR = '[data-testid="probe-overlay"]';

/**
 * One floating component's open-shot recipe: how to trigger it, whether its
 * surface portals to `document.body` per engine (checkpoint contract P4),
 * and how to find that surface once open. Each `surfaceSelector` is anchored
 * to the component's own scope class (never a bare `[data-part='surface']`),
 * per the data-part-contracts law that `data-part` is a shared vocabulary,
 * not an identifier -- several of these components are open in the DOM
 * across different tests, so an unanchored selector would be ambiguous.
 */
interface OverlayFixtureConfig {
  key: string;
  triggerTestId: string;
  interaction: Interaction;
  portaled: (engine: Engine) => boolean;
  surfaceSelector: (engine: Engine) => string;
}

const OVERLAY_FIXTURES: readonly OverlayFixtureConfig[] = [
  {
    // Portals both engines (shared Portal util -> #rottay-portal-root).
    key: 'modal',
    triggerTestId: 'probe-overlay-modal-trigger',
    interaction: 'click',
    portaled: () => true,
    surfaceSelector: (engine) =>
      engine === 'modern'
        ? ".rottay-overlay-modal-shell--modern [data-part='surface']"
        : ".rottay-overlay-modal-shell--rustic[data-part='surface']",
  },
  {
    // Portals both engines (direct createPortal, not the shared Portal util).
    key: 'tour',
    triggerTestId: 'probe-overlay-tour-trigger',
    interaction: 'click',
    portaled: () => true,
    surfaceSelector: (engine) => `.rottay-tour--${engine} [data-part='surface']`,
  },
  {
    // Portals in neither engine.
    key: 'confirmdialog',
    triggerTestId: 'probe-overlay-confirmdialog-trigger',
    interaction: 'click',
    portaled: () => false,
    surfaceSelector: (engine) =>
      engine === 'modern'
        ? ".rottay-confirm-dialog--modern [data-part='surface']"
        : ".rottay-confirm-dialog-rustic [data-part='surface']",
  },
  {
    // Portals in neither engine. Modern keeps its DaisyUI `modal`/`modal-box`
    // class list untouched (checkpoint contract P2) -- the added
    // `rottay-alert-dialog--modern` class rides alongside it.
    key: 'alertdialog',
    triggerTestId: 'probe-overlay-alertdialog-trigger',
    interaction: 'click',
    portaled: () => false,
    surfaceSelector: (engine) =>
      engine === 'modern'
        ? ".rottay-alert-dialog--modern [data-part='surface']"
        : ".rottay-alert-dialog-rustic [data-part='surface']",
  },
  {
    // Modern in-tree; rustic portals (direct createPortal).
    key: 'sheet',
    triggerTestId: 'probe-overlay-sheet-trigger',
    interaction: 'click',
    portaled: (engine) => engine === 'rustic',
    surfaceSelector: (engine) => `.rottay-sheet--${engine} [data-part='surface']`,
  },
  {
    key: 'popconfirm',
    triggerTestId: 'probe-overlay-popconfirm-trigger',
    interaction: 'click',
    portaled: (engine) => engine === 'rustic',
    surfaceSelector: (engine) =>
      engine === 'modern'
        ? ".rottay-popconfirm--modern [data-part='surface']"
        : ".rottay-popconfirm--rustic[data-part='surface']",
  },
  {
    // Right-click triggered, not left-click -- the trigger box's own
    // onContextMenu handler, matching the real usage contract.
    key: 'contextmenu',
    triggerTestId: 'probe-overlay-contextmenu-trigger',
    interaction: 'right-click',
    portaled: (engine) => engine === 'rustic',
    surfaceSelector: (engine) =>
      engine === 'modern'
        ? ".rottay-context-menu--modern [data-part='surface']"
        : ".rottay-context-menu--rustic[data-part='surface']",
  },
  {
    // Torture-page fixture forces trigger="click" (Popover defaults to
    // 'hover') so this opens deterministically without a hover-delay race.
    key: 'popover',
    triggerTestId: 'probe-overlay-popover-trigger',
    interaction: 'click',
    portaled: (engine) => engine === 'rustic',
    surfaceSelector: (engine) =>
      engine === 'modern'
        ? ".rottay-popover--modern [data-part='surface']"
        : ".rottay-popover--rustic[data-part='surface']",
  },
  {
    // Torture-page fixture forces trigger={['click']} (Dropdown defaults to
    // ['hover']) for the same determinism reason as Popover.
    key: 'dropdown',
    triggerTestId: 'probe-overlay-dropdown-trigger',
    interaction: 'click',
    portaled: (engine) => engine === 'rustic',
    surfaceSelector: (engine) =>
      engine === 'modern'
        ? ".rottay-dropdown--modern [data-part='surface']"
        : ".rottay-dropdown--rustic[data-part='surface']",
  },
  {
    // Hover-only by design (no click mode exists). Torture-page fixture sets
    // openDelay=0/closeDelay=0 so the hover resolves without a timing race.
    key: 'hovercard',
    triggerTestId: 'probe-overlay-hovercard-trigger',
    interaction: 'hover',
    portaled: (engine) => engine === 'rustic',
    surfaceSelector: (engine) =>
      engine === 'modern'
        ? ".rottay-hover-card--modern [data-part='surface']"
        : ".rottay-hover-card--rustic[data-part='surface']",
  },
];

/**
 * Waits until the tenant ground has actually painted before a screenshot is
 * taken. Same timing artifact and same polling strategy as
 * overlays-batch.spec.ts's helper of the same name (duplicated here rather
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
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=1280&slug=button&overlay=1`,
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

/** Fires the fixture's own trigger interaction against its trigger locator. */
/**
 * Waits until a just-opened surface has stopped moving.
 *
 * A fixed settle timeout photographs whatever frame happens to be on screen when
 * it expires. HoverCard opens on a delay AND fades, so under full-suite load a
 * 300ms wait caught it mid-transition and the diff failed once in ~40 runs while
 * passing every time the spec ran alone — the worst kind of red, because it
 * looks like a migration defect. This polls the surface's own opacity and
 * transform until they are unchanged across two consecutive frames, so the shot
 * is taken when the animation is over rather than when a clock says it should be.
 */
async function waitForSettled(page: Page, selector: string): Promise<void> {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const read = () => {
        const cs = getComputedStyle(el);
        return `${cs.opacity}|${cs.transform}`;
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

async function triggerOpen(page: Page, container: Locator, fixture: OverlayFixtureConfig): Promise<void> {
  const trigger = container.locator(`[data-testid="${fixture.triggerTestId}"]`);
  await trigger.waitFor({ timeout: 10_000 });
  if (fixture.interaction === 'click') {
    await trigger.click();
  } else if (fixture.interaction === 'right-click') {
    await trigger.click({ button: 'right' });
  } else {
    await trigger.hover();
  }
}

// ---------------------------------------------------------------------------
// 4 rest shots -- both fixtures, both engines, full probe-overlay grid.
// Every floating component stays closed at rest (controlled `open` state
// defaulting false, or uncontrolled internal state defaulting closed);
// Watermark is the only always-rendered instance in this grid.
// ---------------------------------------------------------------------------

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / overlay / ${engine} @ w1280`, async ({ page }) => {
      test.setTimeout(60_000);

      const container = await openProbe(page, fixture.id, engine);
      await expect(container).toHaveScreenshot(`${fixture.id}-overlay-${engine}.png`);
    });
  }
}

// ---------------------------------------------------------------------------
// Open-surface shots (rottay/w1280 only) -- every floating component, both
// engines. Portaled surfaces (per fixture.portaled(engine)) are asserted
// absent from the container and located page-wide; in-tree surfaces are
// asserted present in, and located within, the container.
// ---------------------------------------------------------------------------

for (const fixture of OVERLAY_FIXTURES) {
  for (const engine of ENGINES) {
    test(`rottay (dark) / overlay / ${engine}: ${fixture.key} surface open`, async ({ page }) => {
      test.setTimeout(60_000);

      const container = await openProbe(page, 'rottay', engine);
      await triggerOpen(page, container, fixture);

      const selector = fixture.surfaceSelector(engine);
      const isPortaled = fixture.portaled(engine);

      if (isPortaled) {
        const surface = page.locator(selector);
        await surface.waitFor({ timeout: 10_000 });
        expect(await container.locator(selector).count()).toBe(0);
        await waitForSettled(page, selector);
        await expect(surface).toHaveScreenshot(`rottay-overlay-${fixture.key}-${engine}-open.png`);
      } else {
        const surface = container.locator(selector);
        await surface.waitFor({ timeout: 10_000 });
        await waitForSettled(page, selector);
        await expect(surface).toHaveScreenshot(`rottay-overlay-${fixture.key}-${engine}-open.png`);
      }
    });
  }
}

// ---------------------------------------------------------------------------
// MANDATORY PIN (checkpoint contract P2) -- AlertDialog modern open. Named
// separately from the loop above so the backdrop-blur + dialog-shadow
// combination (personality.css-sourced, zero inline footprint) has its own
// unambiguous artifact, even though the loop's
// `rottay-overlay-alertdialog-modern-open.png` already covers the same state.
// ---------------------------------------------------------------------------

test('rottay (dark) / overlay / modern: AlertDialog open (mandatory pin, P2)', async ({ page }) => {
  test.setTimeout(60_000);

  const alertDialogFixture = OVERLAY_FIXTURES.find((f) => f.key === 'alertdialog')!;
  const container = await openProbe(page, 'rottay', 'modern');
  await triggerOpen(page, container, alertDialogFixture);

  const surface = container.locator(alertDialogFixture.surfaceSelector('modern'));
  await surface.waitFor({ timeout: 10_000 });
  await page.waitForTimeout(300);

  await expect(surface).toHaveScreenshot('rottay-overlay-alertdialog-modern-open-mandatory-pin.png');
});

// ---------------------------------------------------------------------------
// MANDATORY PIN (checkpoint contract P2) -- Dropdown modern, item hovered.
// The hover background is painted entirely by `modern/theme.css`'s
// `.menu li > button:hover` rule (not by Dropdown's own inline styles), so a
// plain open shot cannot capture it -- this test hovers the first real item
// row after opening.
// ---------------------------------------------------------------------------

test('rottay (dark) / overlay / modern: Dropdown item hovered (mandatory pin, P2)', async ({ page }) => {
  test.setTimeout(60_000);

  const dropdownFixture = OVERLAY_FIXTURES.find((f) => f.key === 'dropdown')!;
  const container = await openProbe(page, 'rottay', 'modern');
  await triggerOpen(page, container, dropdownFixture);

  const surface = container.locator(dropdownFixture.surfaceSelector('modern'));
  await surface.waitFor({ timeout: 10_000 });

  const item = surface.locator("[data-part='item']").first();
  await item.waitFor({ timeout: 10_000 });
  await item.hover();
  await page.waitForTimeout(300);

  await expect(surface).toHaveScreenshot('rottay-overlay-dropdown-modern-item-hovered.png');
});
