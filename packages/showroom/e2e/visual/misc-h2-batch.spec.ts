import { test, expect, type Locator, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// WO-SKIN-06 checkpoint CK-H2 -- category-A patterns/misc visual evidence.
//
// The fixture is gated by ?miscH2=1 and keeps each component/state family in
// its own data-testid band. The four engine-split patterns are photographed
// under both real tenant grounds and both skin engines. TokenInspector is
// engine-agnostic and intentionally hardcoded, so it gets a dedicated active,
// populated, unpinned/pinned proof instead of four redundant tenant/engine
// copies.
// ---------------------------------------------------------------------------

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const ROOT_SELECTOR = '[data-testid="probe-misc-h2"]';

const REST_BANDS = [
  'file-manager',
  'user-profile',
  'pricing',
  'empty-state',
] as const;

const HIGH_RISK_BANDS = [
  'file-list',
  'file-grid',
  'user-full',
  'user-compact',
  'pricing-monthly',
  'pricing-yearly',
] as const;

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

async function waitForSettled(page: Page, locator: Locator): Promise<void> {
  const handle = await locator.elementHandle();
  if (!handle) return;
  await page.waitForFunction(
    (el) => {
      const cs = getComputedStyle(el as Element);
      const key = `${(el as Element).textContent}|${cs.opacity}|${cs.transform}|${cs.boxShadow}|${cs.color}|${cs.backgroundColor}|${cs.borderColor}`;
      const w = window as unknown as { __miscH2Settle?: { key: string; hits: number } };
      if (!w.__miscH2Settle || w.__miscH2Settle.key !== key) {
        w.__miscH2Settle = { key, hits: 1 };
        return false;
      }
      w.__miscH2Settle.hits += 1;
      return w.__miscH2Settle.hits >= 3;
    },
    handle,
    { timeout: 10_000, polling: 'raf' },
  );
}

async function openProbe(page: Page, fixture: Fixture, engine: Engine): Promise<Locator> {
  await page.setViewportSize({ width: 1440, height: 4200 });
  await page.goto(
    `/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=1280&slug=button&miscH2=1`,
    { waitUntil: 'domcontentloaded' },
  );

  const root = page.locator(ROOT_SELECTOR);
  await root.waitFor({ timeout: 30_000 });
  await page.waitForFunction(
    (expected) => document.documentElement.getAttribute('data-engine') === expected,
    engine,
  );
  await page.evaluate(() => document.fonts.ready);

  const fixtureGround = FIXTURES.find((candidate) => candidate.id === fixture)?.ground ?? 'dark';
  await waitForGroundPaint(page, fixtureGround);
  await waitForSettled(page, root);
  return root;
}

// Four rest evidence sets. Every screenshot subject is an isolated testid band,
// so a height change in one component cannot invalidate the other components.
for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / misc H2 / ${engine}: isolated rest bands`, async ({ page }) => {
      test.setTimeout(90_000);
      const root = await openProbe(page, fixture.id, engine);

      for (const bandName of REST_BANDS) {
        const band = root.locator(`[data-testid="probe-misc-h2-${bandName}"]`);
        await waitForSettled(page, band);
        await expect(band).toHaveScreenshot(`${fixture.id}-misc-h2-${engine}-${bandName}.png`, {
          maxDiffPixelRatio: 0.0005,
        });
      }
    });
  }
}

// State-selected paint at highest risk is pinned separately on rottay/dark for
// both engines: file list/grid selected + unselected rows/cards and all MIME
// branches, profile status/action/online branches, and pricing cycle/highlight/
// feature tri-state branches. The assertions prevent a fixture regression from
// silently recording a baseline that no longer exercises the selector.
for (const engine of ENGINES) {
  test(`rottay (dark) / misc H2 / ${engine}: explicit high-risk state bands`, async ({ page }) => {
    test.setTimeout(90_000);
    const root = await openProbe(page, 'rottay', engine);

    const list = root.locator('[data-testid="probe-misc-h2-file-list"]');
    const grid = root.locator('[data-testid="probe-misc-h2-file-grid"]');
    for (const band of [list, grid]) {
      await expect(band.locator('[data-selected="true"]').first()).toBeVisible();
      await expect(band.locator('[data-selected="false"]').first()).toBeVisible();
      for (const kind of ['folder', 'image', 'pdf', 'text', 'other']) {
        await expect(band.locator(`[data-file-kind="${kind}"]`).first()).toBeVisible();
      }
    }

    const fullProfiles = root.locator('[data-testid="probe-misc-h2-user-full"]');
    for (const status of ['active', 'away', 'busy', 'offline']) {
      await expect(fullProfiles.locator(`[data-part="status-badge"][data-status="${status}"]`)).toHaveCount(1);
    }
    await expect(fullProfiles.locator('[data-part="presence-dot"][data-online="true"]').first()).toBeVisible();
    await expect(fullProfiles.locator('[data-part="presence-dot"][data-online="false"]').first()).toBeVisible();
    for (const variant of ['primary', 'default', 'danger']) {
      await expect(fullProfiles.locator(`[data-part="action-button"][data-variant="${variant}"]`)).toHaveCount(1);
    }

    for (const cycle of ['monthly', 'yearly']) {
      const pricing = root.locator(`[data-testid="probe-misc-h2-pricing-${cycle}"]`);
      await expect(pricing.locator(`[data-part="toggle"][data-cycle="${cycle}"]`)).toHaveCount(1);
      await expect(pricing.locator('[data-part="plan-card"][data-highlighted="true"]')).toHaveCount(1);
      await expect(pricing.locator('[data-part="plan-card"][data-highlighted="false"]')).toHaveCount(1);
      for (const state of ['included', 'excluded', 'custom']) {
        await expect(pricing.locator(`[data-part="feature-value"][data-feature-state="${state}"]`).first()).toBeVisible();
      }
    }

    for (const bandName of HIGH_RISK_BANDS) {
      const band = root.locator(`[data-testid="probe-misc-h2-${bandName}"]`);
      await waitForSettled(page, band);
      await expect(band).toHaveScreenshot(`rottay-misc-h2-${engine}-${bandName}-state.png`, {
        maxDiffPixelRatio: 0.0005,
      });
    }
  });
}

test('rottay (dark) / misc H2: token-inspector active with color/text rows, unpinned then pinned', async ({ page }) => {
  test.setTimeout(90_000);
  const root = await openProbe(page, 'rottay', 'modern');
  const target = root.locator('[data-testid="probe-misc-h2-token-target"]');

  // Dispatch the component's public Ctrl+Shift+T contract directly to window;
  // browser chrome can reserve this chord before a page-level keyboard event.
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'T',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    }));
  });

  const panel = page.locator('.ds-pattern-token-inspector[data-part="panel"]');
  await panel.waitFor({ state: 'visible' });
  await target.hover({ position: { x: 48, y: 24 } });
  await expect(panel.locator('[data-part="token-row"]').first()).toBeVisible();
  await expect(panel.locator('[data-part="token-value"][data-value-kind="color"]').first()).toBeVisible();
  await expect(panel.locator('[data-part="token-value"][data-value-kind="text"]').first()).toBeVisible();
  await expect(panel).toHaveAttribute('data-pinned', 'false');
  await waitForSettled(page, panel);
  await expect(panel).toHaveScreenshot('rottay-misc-h2-token-inspector-unpinned.png', {
    maxDiffPixelRatio: 0.0005,
  });

  await target.click({ position: { x: 48, y: 24 } });
  await expect(panel).toHaveAttribute('data-pinned', 'true');
  await expect(panel.locator('[data-part="pinned-badge"]')).toHaveAttribute('data-pinned', 'true');
  await waitForSettled(page, panel);
  await expect(panel).toHaveScreenshot('rottay-misc-h2-token-inspector-pinned.png', {
    maxDiffPixelRatio: 0.0005,
  });

  await target.click({ position: { x: 48, y: 24 } });
  await expect(panel).toHaveAttribute('data-pinned', 'false');
});
