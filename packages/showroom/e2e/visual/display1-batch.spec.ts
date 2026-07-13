import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-SKIN-05 checkpoint D1 -- the surfaces + media family (Card, Image,
// Carousel, QRCode, Avatar, Badge, Tag, Kbd, Empty) data-part contract
// evidence.
//
// The pre-step stamps `data-part` (plus data-variant/data-tone/data-size/
// data-status/data-bordered/data-selected/data-dot/data-badge-style/
// data-outlined/data-clickable/data-vertical/data-fade/data-direction) onto
// all nine components and their compounds without moving any paint -- every
// mechanism this checkpoint's law names (Card and Badge's existing
// WO-ARC-07/P-43 skins, Avatar's frozen P-75 clip/halo, the modern/rustic
// theme.css bridge rules) stays exactly where it was. Nothing in this family
// is portaled and nothing paints from the wall clock, so there is no
// open-panel dance and no clock pinning required -- every rest fixture below
// is a static, deterministic render (Image's loading/error states are pinned
// via a `src=""` empty-request and a syntactically invalid data-URI, per the
// component's own header comment -- no network, no flake).
//
// REST TRUTH NOTE: Playwright's toHaveScreenshot disables CSS animations by
// default, so Badge's pulse keyframe and any transition tail both freeze to
// their frame-zero paint in the 4 rest shots below.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const CONTAINER_SELECTOR = '[data-testid="probe-display1"]';

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
  await page.setViewportSize({ width: 1280, height: 1600 });
  await page.goto(
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=1280&slug=button&display1=1`,
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
// 4 rest shots -- both fixtures, both engines, full probe-display1 grid.
// ---------------------------------------------------------------------------

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / display1 / ${engine} @ w1280`, async ({ page }) => {
      test.setTimeout(60_000);

      const container = await openProbe(page, fixture.id, engine);
      await expect(container).toHaveScreenshot(`${fixture.id}-display1-${engine}.png`);
    });
  }
}

/**
 * Waits until an element has stopped moving before it is photographed.
 *
 * A fixed settle timeout photographs whatever frame is on screen when it expires.
 * Card's hover lifts (transform + box-shadow transition) and Image's overlay
 * fades, so under full-suite load a fixed wait catches them mid-transition: the
 * shot differs by a few pixels, the diff fails, and it reads as a migration
 * defect rather than a timing artifact. This polls the element's own opacity,
 * transform and box-shadow until they are unchanged across three consecutive
 * frames, so the shot is taken when the animation is over rather than when a
 * clock says it should be.
 */
async function waitForSettled(page: Page, locator: Locator): Promise<void> {
  const handle = await locator.elementHandle();
  if (!handle) return;
  await page.waitForFunction(
    (el) => {
      const cs = getComputedStyle(el as Element);
      const key = `${cs.opacity}|${cs.transform}|${cs.boxShadow}`;
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

// ---------------------------------------------------------------------------
// Interaction-state pins (rottay/w1280 only).
//
// Card hoverable (the outlined card, modern/rustic card.css's real box-shadow
// +translateY / box-shadow-lg hover), Tag closable (the close control's
// hover affordance), and Image preview (the zoomable image's hover overlay +
// zoom indicator, gated on useInteractionState's `hovered`) -- the three
// D1 components with a real interaction-driven paint per the checkpoint
// brief.
// ---------------------------------------------------------------------------

for (const engine of ENGINES) {
  test(`rottay (dark) / display1 / ${engine}: Card hoverable`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    // Engine asymmetry: modern marks an interactive card with `data-interactive`,
    // rustic with `data-hoverable`. Same concept, two attribute names.
    const hoverAttr = engine === 'modern' ? 'data-interactive' : 'data-hoverable';
    const cardRoot = container
      .locator(`[data-testid='probe-display1-card'] [data-variant='outlined'][${hoverAttr}='true']`)
      .first();
    await cardRoot.hover();
    await waitForSettled(page, cardRoot);

    await expect(cardRoot).toHaveScreenshot(`rottay-display1-card-${engine}-hovered.png`);
  });
}

for (const engine of ENGINES) {
  test(`rottay (dark) / display1 / ${engine}: Tag closable`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    const tagRow = container.locator("[data-testid='probe-display1-tag']").first();
    const close = tagRow.locator("[data-part='close']").first();
    await close.hover();
    await waitForSettled(page, close);

    await expect(tagRow).toHaveScreenshot(`rottay-display1-tag-${engine}-close-hovered.png`);
  });
}

for (const engine of ENGINES) {
  test(`rottay (dark) / display1 / ${engine}: Image preview`, async ({ page }) => {
    test.setTimeout(60_000);

    const container = await openProbe(page, 'rottay', engine);
    const zoomableImage = container.locator("[data-testid='probe-display1-image'] [data-zoomable='true']").first();
    await zoomableImage.hover();
    await waitForSettled(page, zoomableImage);

    await expect(zoomableImage).toHaveScreenshot(`rottay-display1-image-${engine}-preview-hovered.png`);
  });
}
