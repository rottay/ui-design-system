import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-SKIN-06 checkpoint CK-G -- the patterns/navigation family
// (command-palette, environment-toggle, workspace-switcher, shortcuts-overlay,
// locale-switcher) data-part contract evidence.
//
// FILE NAME: this is `navigation-PATTERNS-batch`, distinct from the existing
// `navigation-batch.spec.ts`, which is the WO-SKIN-04 PRIMITIVES nav family
// (Menu/Tabs/Steps/… on `?nav=1` / `probe-nav`). Mirrors the shipped
// `headers-patterns-batch` vs primitives split. This one drives `?navigation=1`
// / `probe-navigation-patterns`.
//
// The inert pre-step stamps the pattern-tier scope class `ds-pattern-<comp>` +
// `ds-engine-<engine>` (matching every shipped pattern skin) plus `data-part`
// and state attributes (data-active, data-focused, data-variant, data-position)
// onto all ten engine files without moving any paint. The family is 100% raw
// DOM and NOT portaled (no `createPortal` anywhere in patterns/navigation), so
// every stamp reaches the DOM and ordinary descendant selectors from the scope
// class reach every element. (The `rottay-*` in the screenshot names below is
// the rottay TENANT FIXTURE, not a scope class.)
//
// WHERE ALL THE RISK IS: command-palette. It holds the checkpoint's ONLY
// imperative writes -- ten `.style.x =` mutations (modern 4, rustic 6), every
// one live because no first-party className contests them. The migration
// transcribes each to a CSS rule; the counter sees THAT a write exists, never
// WHAT it wrote, so these baselines are the only thing that catches a wrong
// colour, a wrong fallback, or a dropped guard. The other four components are
// 100% STATE-SELECTED / HATCH with zero imperative writes (inventory §2/§5), so
// they appear only in the 4 rest shots -- there is no imperative-write shape to
// mis-transcribe in them.
//
// THE activeIndex GUARD -- the highest-risk pin. Both engines' rows write hover
// paint ONLY when `activeIndex !== idx`, so pointer hover never fights keyboard
// selection. The migration MUST reproduce that as `:hover:not([data-active='true'])`.
//   - Hovering an INACTIVE row (a different row than the keyboard-selected one)
//     lights that row while the active row keeps its selection paint -- the
//     "hover row N while row M is keyboard-selected" case. (row-hover-guard shots)
//   - Hovering the ACTIVE row must do NOTHING (the guard suppresses it). A
//     migration that drops the `:not([data-active])` would paint hover over the
//     selection -- only the active-row-hover shots catch that. (active-row-hover shots)
//
// P-78 / the token split (rendered, not asserted here, but protected by these
// shots): command-palette carries a Recent section AND grouped sections, so the
// modern "Recent" heading (spread colour -> text-muted) and the grouped header
// (spread + `--ds-search-category-color` override) both render in every shot; a
// migration that collapses them into one rule moves the grouped header's tenant
// channel onto the Recent heading and these shots go red. rustic reads
// `--ds-command-palette-*` while modern reads generic tokens -- both fixtures
// exercise it.
//
// REST TRUTH NOTE: Playwright's toHaveScreenshot disables animations by default,
// so rustic's `ds-cmd-panel-in` entrance keyframe and its rows' `transition: all`
// both freeze to their end-state frame. The two fixed overlays are wrapped in a
// transform'd band in the torture page so they render inside their band rather
// than over the viewport -- their paint is unchanged. command-palette and
// shortcuts-overlay auto-focus their input ~50ms after mount, so the rustic
// search wrapper's inset focus line is present at rest; openProbe's settle wait
// outlasts that so it is deterministic.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const CONTAINER_SELECTOR = '[data-testid="probe-navigation-patterns"]';

/**
 * Waits until the tenant ground has actually painted before a screenshot is
 * taken. Same timing artifact and polling strategy as headers-patterns-batch.ts's
 * helper of the same name (duplicated here -- e2e/visual has no shared helpers
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
  await page.setViewportSize({ width: 1280, height: 1800 });
  await page.goto(
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=1280&slug=button&navigation=1`,
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

  // Settle the overlays' entrance tail (and the ~50ms input auto-focus) so the
  // final rendered frame is what gets diffed.
  await page.waitForTimeout(300);

  return container;
}

/**
 * Waits until an element has stopped moving before it is photographed. Polls the
 * element's own opacity/transform/box-shadow/colour until unchanged across three
 * consecutive frames, so the shot is taken when the transition is over rather
 * than when a fixed clock says it should be. NEVER use waitForTimeout after a
 * hover -- a baseline recorded mid-transition is inherited forever.
 *
 * (box-shadow and border-color are in the key because rustic's row hover writes
 * borderLeftColor and its input focus writes an inset box-shadow.)
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
 * Resolves a component inside its band, anchored on the component's own SCOPE
 * CLASS -- never on a bare `[data-part]`. `data-part` is a shared vocabulary,
 * not an identifier; anchoring on the scope class is the same law the skins must
 * obey.
 */
const SCOPE: Record<string, string> = {
  'command-palette': '.ds-pattern-command-palette',
  'shortcuts-overlay': '.ds-pattern-shortcuts-overlay',
  'environment-toggle': '.ds-pattern-environment-toggle',
  'workspace-switcher': '.ds-pattern-workspace-switcher',
  'locale-switcher': '.ds-pattern-locale-switcher',
};

const band = (container: Locator, name: keyof typeof SCOPE): Locator =>
  container.locator(`[data-testid="probe-navigation-patterns-${name}"] ${SCOPE[name]}`);

// ---------------------------------------------------------------------------
// 4 rest shots -- both fixtures, both engines, the full probe-navigation-patterns
// grid. command-palette + shortcuts-overlay render open (contained); the two
// switchers render at rest; environment-toggle shows the segmented variant with
// its non-production banner.
// ---------------------------------------------------------------------------

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / navigation-patterns / ${engine} @ w1280`, async ({ page }) => {
      test.setTimeout(60_000);

      const container = await openProbe(page, fixture.id, engine);
      await expect(container).toHaveScreenshot(`${fixture.id}-navigation-patterns-${engine}.png`);
    });
  }
}

// ---------------------------------------------------------------------------
// command-palette -- the ten imperative writes, all on the rottay fixture.
//
// Each hover shot photographs the whole DIALOG, so both the hovered row and the
// keyboard-active row are in frame: a shared `:hover` rule that ignores the
// guard would light two rows and this diff is where that shows.
// ---------------------------------------------------------------------------

const cmdDialog = (container: Locator): Locator =>
  band(container, 'command-palette').locator("[data-part='dialog']").first();

for (const engine of ENGINES) {
  // Hover a DIFFERENT row than the keyboard-selected one (activeIndex 0). The
  // active row must keep its selection paint while the inactive row lights.
  // modern writes .style.background; rustic writes .style.borderLeftColor + .style.background.
  test(`rottay (dark) / navigation-patterns / ${engine}: command-palette inactive row hovered (guard)`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    const dialog = cmdDialog(container);
    const inactive = dialog.locator("[data-part='item'][data-active='false']").first();
    await inactive.hover();
    await waitForSettled(page, inactive);

    await expect(dialog).toHaveScreenshot(`rottay-navigation-patterns-cmdpal-${engine}-row-hover-guard.png`);
  });

  // Hover the ACTIVE row. The guard (`activeIndex !== idx`) suppresses the write,
  // so the row keeps its selection paint and does NOT take hover paint. This is
  // the shot that catches a migration that dropped `:not([data-active='true'])`.
  test(`rottay (dark) / navigation-patterns / ${engine}: command-palette active row hovered (no-op)`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    const dialog = cmdDialog(container);
    const active = dialog.locator("[data-part='item'][data-active='true']").first();
    await active.hover();
    await waitForSettled(page, active);

    await expect(dialog).toHaveScreenshot(`rottay-navigation-patterns-cmdpal-${engine}-active-row-hover.png`);
  });
}

// rustic-only: the input focus write. onFocus sets `.style.boxShadow` on the
// PARENT (the search wrapper) to fake an inset focus line; modern's input has no
// focus paint, so there is no modern counterpart. Photograph the search wrapper.
test('rottay (dark) / navigation-patterns / rustic: command-palette input focused (inset line)', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'rustic');
  const search = band(container, 'command-palette').locator("[data-part='search']").first();
  const input = search.locator("[data-part='input']").first();
  await input.focus();
  await waitForSettled(page, search);

  await expect(search).toHaveScreenshot('rottay-navigation-patterns-cmdpal-rustic-input-focus.png');
});
