import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-SKIN-06 checkpoint CK-B/P -- the patterns/misc header family
// (CockpitHeader, PageShell, WorkbenchHeader) data-part contract evidence.
//
// The pre-step stamps `data-part` plus state attributes (data-loading,
// data-compact, data-sticky, data-variant, data-active, data-interactive,
// data-last, data-has-label) onto the four engine files in this checkpoint
// without moving any paint. Every interaction in this cluster is React state
// (useState + onMouseEnter/onMouseLeave/onFocus/onBlur) -- there is not one
// imperative `.style.x =` write in any of the four files, so every hover and
// focus below is already directly expressible as `:hover` / `:focus`.
//
// WHAT THESE BASELINES EXIST TO PROTECT
//
// 1. TWO BackButtons, not three. The checkpoint brief and inventory both
//    describe "three BackButtons, no two alike" (cockpit 34x34 with a border on
//    hover + neutral-50; page-shell padding-sized, border always none,
//    neutral-100, optional text label; workbench 32x32, border none,
//    neutral-100). Only the first two can ever render. WorkbenchHeader's
//    BackButton is defined at engines/modern.tsx:135 and mounted by nothing --
//    `WorkbenchHeaderProps` has no `onBack` field, so no consumer can ask for
//    one. It is unreachable, it cannot be photographed, and it is pinned as
//    dead in HeadersPatternsBatch.contract.test.tsx instead.
//
//    STANDING RULING: MIGRATE its paint like any other site; do NOT delete it.
//    "Zero importers" is not dead code -- the question is not "who references
//    this?" but "what SHOULD reference this, and does that thing exist?", and
//    here it is a consumer wanting a back button on a workbench header: the
//    component is written and correct, only the prop is missing. Migrating it
//    is pixel-neutral BY CONSTRUCTION (it renders nothing today, so no baseline
//    can move), workbench reaches 0 honestly, and the rules sit inert until
//    someone wires `onBack`. Those sites are therefore migrated but
//    UNPHOTOGRAPHED, and that is declared rather than silent.
//
//    The two BackButtons that DO render are pinned here, in hover AND focus,
//    because they key on `isHighlighted = hovered || focused` and a migration
//    that converges them onto one rule would otherwise leave no trace.
//
// 2. The tab strip's ACCESSIBILITY asymmetry. page-shell's `TabButton` and
//    workbench's `SavedViewTab` share every colour and border value, so one
//    rule set is correct for colour -- but `SavedViewTab` tracks onFocus/onBlur
//    (and sets `outline: 'none'`, painting its own focus state) while
//    `TabButton` tracks hover ONLY, with no focus handling and no outline
//    reset. Both are photographed on keyboard focus below. The page-shell shot
//    showing no focus affordance is the POINT: it is what stops a migration
//    from silently handing page-shell a keyboard affordance it has never had,
//    or taking workbench's away, as a side effect of sharing one rule.
//
// 3. page-shell/rustic has ZERO interactive paint -- no hover on its back
//    button, its breadcrumb links, or its inactive tabs -- while its modern
//    sibling has hover/focus on all three. The widest engine gap in the
//    cluster. It is protected by photographing each of those three elements
//    TWICE, at rest and under hover: the `-rest` and `-hovered` baselines must
//    come out BYTE-IDENTICAL (`cmp` them), and the `-hovered` baseline -- a
//    picture of nothing happening -- is what goes red the day someone invents a
//    rustic hover.
//
// 4. `--ds-page-shell-subtitle-color` IS A LOADED GUN. STANDING RULING:
//    page-shell/modern and page-shell/rustic transcribe their subtitle colour
//    VERBATIM (`--ds-color-text-secondary` and `--ds-color-text-muted`
//    respectively) and MUST NOT adopt `--ds-page-shell-subtitle-color` --
//    house style notwithstanding.
//
//    That token is DECLARED by the rottay tenant (`#A0A0A5` dark / `#6B6B6B`
//    light, artifacts/rottay/index.css:905 and :2475) and READ by exactly one
//    engine: `classic` (page-shell/engines/classic.tsx:128). Modern and rustic
//    have never obeyed it. But the DS's own house style in CLAUDE.md instructs
//    modern-engine authors to write `var(--ds-{component}-{property},
//    var(--ds-generic))` -- so FOLLOWING THE HOUSE RULE is what detonates this:
//    under the default theme the token resolves to text-secondary and reads as
//    a no-op, while under rottay -- the exact fixture these baselines are
//    recorded on -- the subtitle silently repaints. Every value byte-identical;
//    the cascade is not. Adopting the token is a deliberate VISUAL change with
//    re-recorded baselines, in its own work order. The rest shots below
//    photograph page-shell's subtitle in both engines on the rottay fixture,
//    which is the gate that catches it if someone steps on it anyway.
//
// WHY THE "rustic" REST SHOT IS NOT WHAT IT LOOKS LIKE
//
// Only PageShell HAS a rustic engine. CockpitHeader and WorkbenchHeader map
// rustic -> `./engines/classic` in their `createEngineComponent` call and have
// no `engines/rustic.tsx` on disk at all. So in the rustic rest shot below,
// only the PageShell band is a rustic file this checkpoint owns; the cockpit
// and workbench bands are the CLASSIC engine, which is outside the WO-06 census
// by construction (it reads as 0 sites because it was never asked, not because
// it is clean). The shot is still required -- the migration must not change
// those pixels either -- but it is not evidence about a rustic file that does
// not exist.
//
// REST TRUTH NOTE: Playwright's toHaveScreenshot disables CSS animations by
// default, so the three loading skeletons' `animation: 'pulse 1.5s ease-in-out
// infinite'` (the global keyframe in foundation/animations/keyframes.css)
// freezes to its frame-zero paint. `isCompact` is driven by dispatching a
// synthetic scroll event with a stubbed `window.scrollY`, never by actually
// scrolling: the scroll position is not a paint value, it only selects between
// two fixed ones, and moving the viewport would move every other fixture too.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const CONTAINER_SELECTOR = '[data-testid="probe-headers-patterns"]';

/**
 * Waits until the tenant ground has actually painted before a screenshot is
 * taken. Same timing artifact and same polling strategy as
 * record-batch.spec.ts / display1-batch.spec.ts's helper of the same name
 * (duplicated here rather than shared -- e2e/visual has no cross-spec helpers
 * module).
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
  await page.setViewportSize({ width: 1280, height: 1600 });
  await page.goto(
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=1280&slug=button&headers-patterns=1`,
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
 * Waits until an element has stopped moving before it is photographed.
 *
 * A fixed settle timeout photographs whatever frame is on screen when it
 * expires. Every interactive element in this family transitions colour,
 * background and border-color over `--ds-motion-fast`, so under full-suite load
 * a fixed wait catches them mid-transition: the shot differs by a few pixels,
 * the diff fails, and it reads as a migration defect rather than a timing
 * artifact. This polls the element's own opacity, transform and box-shadow
 * until they are unchanged across three consecutive frames, so the shot is
 * taken when the animation is over rather than when a clock says it should be.
 *
 * (box-shadow is in the key because the cockpit's compact-on-scroll elevation
 * and workbench's primary quick-action both transition one.)
 */
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

/**
 * Resolves a component inside its fixture band, anchored on the component's own
 * SCOPE CLASS -- never on a bare `[data-part]`.
 *
 * `data-part` is a shared vocabulary, not an identifier. The `actions` /
 * `badge` / `headerContent` / `children` props of all three of these components
 * are consumer slots that render foreign components, and those stamp their own
 * `data-part='root'` (a DS Button does exactly that). A bare
 * `[data-part='root']` inside a band would match whichever came first in DOM
 * order. Anchoring on the scope class is the same law the skins themselves must
 * obey, and it is what makes these probes survive a fixture edit.
 */
const SCOPE: Record<string, string> = {
  cockpit: '.ds-pattern-cockpit-header',
  'cockpit-sticky': '.ds-pattern-cockpit-header',
  'page-shell': '.ds-pattern-page-shell',
  workbench: '.ds-pattern-workbench-header',
};

const band = (container: Locator, name: string): Locator =>
  container.locator(`[data-testid="probe-headers-patterns-${name}"] ${SCOPE[name]}`);

// ---------------------------------------------------------------------------
// 4 rest shots -- both fixtures, both engines, full probe-headers-patterns grid.
// ---------------------------------------------------------------------------

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / headers-patterns / ${engine} @ w1280`, async ({ page }) => {
      test.setTimeout(60_000);

      const container = await openProbe(page, fixture.id, engine);
      await expect(container).toHaveScreenshot(`${fixture.id}-headers-patterns-${engine}.png`);
    });
  }
}

// ---------------------------------------------------------------------------
// The two REACHABLE BackButtons, hover + focus (rottay/modern).
//
// They key on `isHighlighted = hovered || focused`, so both doors are pinned.
// Their token sets diverge on all three axes -- size (34x34 vs padding-sized),
// border (a real 1px border on cockpit's highlight vs `none` always on
// page-shell's), and neutral step (50 vs 100) -- and only a photograph of each
// keeps a migration from quietly converging them.
// ---------------------------------------------------------------------------

test('rottay (dark) / headers-patterns / modern: cockpit BackButton hovered', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern');
  const back = band(container, 'cockpit').locator("[data-part='back']").first();
  await back.hover();
  await waitForSettled(page, back);

  await expect(back).toHaveScreenshot('rottay-headers-patterns-cockpit-back-modern-hovered.png');
});

test('rottay (dark) / headers-patterns / modern: cockpit BackButton focused', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern');
  const back = band(container, 'cockpit').locator("[data-part='back']").first();
  // The component keys on React's onFocus, which fires for programmatic focus
  // too -- so `.focus()` exercises exactly the condition a `:focus` rule will
  // key on, without depending on the page's whole tab order.
  await back.focus();
  await waitForSettled(page, back);

  await expect(back).toHaveScreenshot('rottay-headers-patterns-cockpit-back-modern-focused.png');
});

test('rottay (dark) / headers-patterns / modern: page-shell BackButton hovered', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern');
  const back = band(container, 'page-shell').locator("[data-part='back']").first();
  await back.hover();
  await waitForSettled(page, back);

  await expect(back).toHaveScreenshot('rottay-headers-patterns-pageshell-back-modern-hovered.png');
});

test('rottay (dark) / headers-patterns / modern: page-shell BackButton focused', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern');
  const back = band(container, 'page-shell').locator("[data-part='back']").first();
  await back.focus();
  await waitForSettled(page, back);

  await expect(back).toHaveScreenshot('rottay-headers-patterns-pageshell-back-modern-focused.png');
});

// ---------------------------------------------------------------------------
// Breadcrumb hover-links (rottay/modern).
//
// cockpit's `BreadcrumbLink` and page-shell's `BreadcrumbItem` are
// value-identical (hovered -> text-secondary, else text-muted). This is the one
// duplicate in the cluster that unifies cleanly -- so both are pinned, and if a
// shared rule ever drifts one of them, one of these two goes red.
// ---------------------------------------------------------------------------

test('rottay (dark) / headers-patterns / modern: cockpit breadcrumb link hovered', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern');
  const crumbs = band(container, 'cockpit').locator("[data-part='breadcrumb']").first();
  const link = crumbs.locator("[data-part='crumb'][data-interactive='true']").first();
  await link.hover();
  await waitForSettled(page, link);

  await expect(crumbs).toHaveScreenshot('rottay-headers-patterns-cockpit-crumb-modern-hovered.png');
});

test('rottay (dark) / headers-patterns / modern: page-shell breadcrumb link hovered', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern');
  const crumbs = band(container, 'page-shell').locator("[data-part='breadcrumb']").first();
  const link = crumbs.locator("[data-part='crumb'][data-interactive='true']").first();
  await link.hover();
  await waitForSettled(page, link);

  await expect(crumbs).toHaveScreenshot('rottay-headers-patterns-pageshell-crumb-modern-hovered.png');
});

// ---------------------------------------------------------------------------
// The tab strip -- same colours, different accessibility surface (rottay/modern).
//
// Hover: both components paint text-primary + neutral-50 on an inactive tab.
// Focus: workbench's SavedViewTab paints the SAME highlight (it tracks
// onFocus/onBlur and resets `outline`); page-shell's TabButton paints NOTHING
// (it has no focus handling at all). The two focus baselines are therefore
// expected to look DIFFERENT, and that difference is the contract.
// ---------------------------------------------------------------------------

test('rottay (dark) / headers-patterns / modern: page-shell inactive tab hovered', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern');
  const tabs = band(container, 'page-shell').locator("[data-part='tabs']").first();
  const inactive = tabs.locator("[data-part='tab'][data-active='false']").first();
  await inactive.hover();
  await waitForSettled(page, inactive);

  await expect(tabs).toHaveScreenshot('rottay-headers-patterns-pageshell-tab-modern-hovered.png');
});

test('rottay (dark) / headers-patterns / modern: page-shell inactive tab focused (NO affordance)', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern');
  const tabs = band(container, 'page-shell').locator("[data-part='tabs']").first();
  const inactive = tabs.locator("[data-part='tab'][data-active='false']").first();
  await inactive.focus();
  await waitForSettled(page, inactive);

  // page-shell's TabButton has NO onFocus handler. This baseline is a picture
  // of a focused tab that does not react, and it exists so that a shared
  // tab-strip rule cannot silently give it workbench's keyboard affordance.
  await expect(tabs).toHaveScreenshot('rottay-headers-patterns-pageshell-tab-modern-focused.png');
});

test('rottay (dark) / headers-patterns / modern: workbench saved-view tab hovered', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern');
  const tabs = band(container, 'workbench').locator("[data-part='tabs']").first();
  const inactive = tabs.locator("[data-part='tab'][data-active='false']").first();
  await inactive.hover();
  await waitForSettled(page, inactive);

  await expect(tabs).toHaveScreenshot('rottay-headers-patterns-workbench-tab-modern-hovered.png');
});

test('rottay (dark) / headers-patterns / modern: workbench saved-view tab focused (HAS affordance)', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern');
  const tabs = band(container, 'workbench').locator("[data-part='tabs']").first();
  const inactive = tabs.locator("[data-part='tab'][data-active='false']").first();
  await inactive.focus();
  await waitForSettled(page, inactive);

  // SavedViewTab tracks onFocus/onBlur: `isInteractive = (hovered || focused)
  // && !isActive`. This baseline is the keyboard affordance workbench HAS and
  // page-shell does not -- do not let a shared rule take it away.
  await expect(tabs).toHaveScreenshot('rottay-headers-patterns-workbench-tab-modern-focused.png');
});

// ---------------------------------------------------------------------------
// workbench QuickActionButton -- the P-78 shape (rottay/modern).
//
// `variantStyles` (engines/modern.tsx:48-116) spreads a `hover` sub-object OVER
// a `base` object: `{...vs.base, ...(isInteractive && !action.disabled ? vs.hover : {})}`.
// A later key silently overwrites an earlier spread, so `primary`'s hover
// replaces background + borderColor + boxShadow but INHERITS `color` and the
// `border` shorthand from base. All three variants are pinned hovered, because
// a migration that splits those objects into separate CSS rules has to
// reproduce the spread's precedence exactly.
// ---------------------------------------------------------------------------

for (const variant of ['primary', 'danger', 'default'] as const) {
  test(`rottay (dark) / headers-patterns / modern: workbench quick-action ${variant} hovered`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', 'modern');
    const action = band(container, 'workbench')
      .locator(`[data-part='action'][data-variant='${variant}']`)
      .first();
    await action.hover();
    await waitForSettled(page, action);

    await expect(action).toHaveScreenshot(
      `rottay-headers-patterns-workbench-action-${variant}-modern-hovered.png`,
    );
  });
}

// ---------------------------------------------------------------------------
// cockpit compact-on-scroll (rottay/modern).
//
// `isCompact` comes from `window.scrollY > 60` behind a `sticky` gate. It
// selects between two fixed paint values (padding, font-size, and a
// `boxShadow: var(--ds-elevation-2)` that only exists when compact) -- it is
// STATE-SELECTED, not runtime paint. Driven by stubbing scrollY and dispatching
// the event the component listens for, so the viewport never moves and no other
// fixture in the grid shifts under it.
// ---------------------------------------------------------------------------

test('rottay (dark) / headers-patterns / modern: cockpit compact (scrolled)', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern');
  // band() already resolves the scope-class root, which is the node carrying
  // data-compact.
  const cockpit = band(container, 'cockpit-sticky');

  await expect(cockpit).toHaveAttribute('data-compact', 'false');

  await page.evaluate(() => {
    Object.defineProperty(window, 'scrollY', { value: 120, configurable: true, writable: true });
    window.dispatchEvent(new Event('scroll'));
  });

  await expect(cockpit).toHaveAttribute('data-compact', 'true');
  await waitForSettled(page, cockpit);

  await expect(cockpit).toHaveScreenshot('rottay-headers-patterns-cockpit-modern-compact.png');
});

// ---------------------------------------------------------------------------
// page-shell/rustic -- the proof that NOTHING happens (rottay/rustic).
//
// Its back button, breadcrumb links and inactive tabs have no hover paint at
// all, while its modern sibling has hover/focus on all three. Each is shot
// twice, at rest and under hover. The two baselines in each pair MUST come out
// byte-identical -- `cmp` them after recording -- and the `-hovered` one, a
// photograph of nothing happening, is what goes red if a migration invents a
// rustic hover by sharing modern's rule.
// ---------------------------------------------------------------------------

for (const state of ['rest', 'hovered'] as const) {
  test(`rottay (dark) / headers-patterns / rustic: page-shell BackButton ${state}`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', 'rustic');
    const back = band(container, 'page-shell').locator("[data-part='back']").first();
    if (state === 'hovered') {
      await back.hover();
      await waitForSettled(page, back);
    }

    await expect(back).toHaveScreenshot(`rottay-headers-patterns-pageshell-back-rustic-${state}.png`);
  });

  test(`rottay (dark) / headers-patterns / rustic: page-shell breadcrumb ${state}`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', 'rustic');
    const crumbs = band(container, 'page-shell').locator("[data-part='breadcrumb']").first();
    if (state === 'hovered') {
      const link = crumbs.locator("[data-part='crumb'][data-interactive='true']").first();
      await link.hover();
      await waitForSettled(page, link);
    }

    await expect(crumbs).toHaveScreenshot(`rottay-headers-patterns-pageshell-crumb-rustic-${state}.png`);
  });

  test(`rottay (dark) / headers-patterns / rustic: page-shell inactive tab ${state}`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', 'rustic');
    const tabs = band(container, 'page-shell').locator("[data-part='tabs']").first();
    if (state === 'hovered') {
      const inactive = tabs.locator("[data-part='tab'][data-active='false']").first();
      await inactive.hover();
      await waitForSettled(page, inactive);
    }

    await expect(tabs).toHaveScreenshot(`rottay-headers-patterns-pageshell-tab-rustic-${state}.png`);
  });
}
