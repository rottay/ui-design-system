import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-SKIN-06 checkpoint CK-F -- the patterns/communication family
// (comment-thread, notification-center, activity-log, live-feed, assistant's
// 8 exports, presence's 3 exports) visual evidence.
//
// The pre-step stamps scope classes (`ds-pattern-<comp> ds-engine-<engine>`
// on the four engine-split components; `ds-assistant-<export>` /
// `ds-presence-<export>` on assistant's 8 and presence's 3 exports) plus
// `data-part` and state attributes (`data-active`, `data-type`,
// `data-unread`, `data-action-category`, `data-status`, `data-tone`,
// `data-change`, `data-diff-side`) onto all 10 files WITHOUT moving any
// paint. This spec captures the family under both tenants and both skin
// engines so the migration is a byte-exact refactor against these baselines.
//
// SIX SKINS, NOT ONE (inventory §0): three of the six components have
// modern/rustic engines that independently reinvented the same concept with
// different values (comment-thread's text-on-primary token, notification-
// center's info-type token + unread tint, activity-log's action classifier).
// Both engines are captured in every shot pair so neither divergence is lost.
//
// THE ONE IMPERATIVE-WRITE RISK IN THIS FAMILY (trap 4): notification-center
// modern's dismiss button brightens on hover via `.style.opacity =`
// (uncounted -- opacity is outside the paint-channel set). rustic's dismiss
// has NO hover treatment at all (a static, permanently-dimmed opacity) --
// preserved asymmetry, not a defect. The modern-hover shot below is the only
// thing that pins this before the migration converts it to a CSS `:hover`
// rule.
//
// DETERMINISM: Playwright disables CSS animations/transitions for
// toHaveScreenshot, so activity-log modern's `ds-activity-shimmer` and
// live-feed rustic's local `pulse`/`feedPulse` keyframes all freeze to their
// resting frame -- none of this family's animation state is photographed
// mid-flight.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const CONTAINER_SELECTOR = '[data-testid="probe-communication"]';

/**
 * Waits until the tenant ground has actually painted before a screenshot is
 * taken. Same helper (duplicated -- e2e/visual has no shared module) as
 * navigation-patterns-batch.spec.ts / dashboard-widgets-batch.spec.ts.
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
  await page.setViewportSize({ width: 1280, height: 2400 });
  await page.goto(
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=1280&slug=button&communication=1`,
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

  // The cursor outline is now skin-owned. Resolve the token through a real
  // browser style so a missing selector cannot hide inside screenshot tolerance.
  const outlinePaintMatchesToken = await container
    .locator(".ds-presence-live-cursor [data-part='cursor-outline']")
    .first()
    .evaluate((outline) => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--ds-color-surface, #fff)';
      document.body.append(probe);
      const expected = getComputedStyle(probe).color;
      probe.remove();
      return getComputedStyle(outline).stroke === expected;
    });
  expect(outlinePaintMatchesToken).toBe(true);

  return container;
}

/**
 * Polls an element until a digest of its rendered state (paint channels +
 * textContent) holds identical across three consecutive RAF frames. NEVER a
 * fixed waitForTimeout after an interaction -- a baseline recorded
 * mid-transition is inherited forever.
 */
async function waitForSettled(page: Page, locator: Locator): Promise<void> {
  const handle = await locator.elementHandle();
  if (!handle) return;
  await page.waitForFunction(
    (el) => {
      const cs = getComputedStyle(el as Element);
      const key = `${(el as Element).textContent}|${cs.opacity}|${cs.transform}|${cs.boxShadow}|${cs.color}|${cs.backgroundColor}`;
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
// 4 rest shots -- both fixtures, both engines, the full probe-communication
// grid (all 6 components, all their fixture-exercised states, in one shot).
// ---------------------------------------------------------------------------

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / communication / ${engine} @ w1280`, async ({ page }) => {
      test.setTimeout(60_000);

      const container = await openProbe(page, fixture.id, engine);
      await waitForSettled(page, container);
      await expect(container).toHaveScreenshot(`${fixture.id}-communication-${engine}.png`, {
        maxDiffPixelRatio: 0.0005,
      });
    });
  }
}

// ---------------------------------------------------------------------------
// notification-center -- trap 4, the family's one imperative-write risk.
// modern's dismiss button brightens .style.opacity on hover; rustic's has no
// hover treatment at all (static opacity: 0.5, preserved asymmetry).
// ---------------------------------------------------------------------------

const notifBand = (container: Locator): Locator =>
  container.locator('[data-testid="probe-communication-notification-center"] .ds-pattern-notification-center');

test('rottay (dark) / communication / modern: notification-center dismiss hover (imperative opacity)', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'modern');
  const band = notifBand(container);
  const dismiss = band.locator("[data-part='dismiss']").first();
  await dismiss.hover();
  await waitForSettled(page, dismiss);

  await expect(band).toHaveScreenshot('rottay-communication-notif-modern-dismiss-hover.png', {
    maxDiffPixelRatio: 0.0005,
  });
});

test('rottay (dark) / communication / rustic: notification-center dismiss at rest (no hover treatment)', async ({ page }) => {
  test.setTimeout(60_000);

  const container = await openProbe(page, 'rottay', 'rustic');
  const band = notifBand(container);
  const dismiss = band.locator("[data-part='dismiss']").first();
  await dismiss.hover();
  await waitForSettled(page, dismiss);

  // Asserted equal to the (non-hovered) rest shot's region by construction --
  // rustic's dismiss has no hover rule, so hovering it must not move a pixel.
  await expect(band).toHaveScreenshot('rottay-communication-notif-rustic-dismiss-hover.png', {
    maxDiffPixelRatio: 0.0005,
  });
});
