import { expect, test, type Locator, type Page } from '@playwright/test';

// WO-SKIN-06 CK-H1 inert baseline matrix. Snapshots are intentionally created
// by the orchestrated production-build pass, never by this source-only pre-step.

type Fixture = 'rottay' | 'bithire';
type Engine = 'modern' | 'rustic';

const FIXTURES: readonly { id: Fixture; ground: 'dark' | 'light' }[] = [
  { id: 'rottay', ground: 'dark' },
  { id: 'bithire', ground: 'light' },
];
const ENGINES: readonly Engine[] = ['modern', 'rustic'];

const ROOT_SELECTOR = '[data-testid="probe-ck-h1"]';

async function waitForGroundPaint(page: Page, ground: 'dark' | 'light'): Promise<void> {
  await page.waitForFunction(
    (isDark) => {
      const channels = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g);
      if (!channels || channels.length < 3) return false;
      const [r, g, b] = channels.map(Number);
      const luminance = (r + g + b) / 3;
      return isDark ? luminance < 40 : luminance > 200;
    },
    ground === 'dark',
    { timeout: 10_000 }
  );
}

async function waitForSettled(page: Page, locator: Locator): Promise<void> {
  const handle = await locator.elementHandle();
  if (!handle) return;
  await page.waitForFunction(
    (element) => {
      const style = getComputedStyle(element as Element);
      const key = `${(element as Element).textContent}|${style.opacity}|${style.transform}|${style.color}|${
        style.backgroundColor
      }|${style.borderColor}`;
      const state = window as unknown as {
        __ckH1Settle?: { key: string; hits: number };
      };
      if (!state.__ckH1Settle || state.__ckH1Settle.key !== key) {
        state.__ckH1Settle = { key, hits: 1 };
        return false;
      }
      state.__ckH1Settle.hits += 1;
      return state.__ckH1Settle.hits >= 3;
    },
    handle,
    { timeout: 10_000, polling: 'raf' }
  );
}

async function openProbe(page: Page, fixture: Fixture, engine: Engine, ground: 'dark' | 'light'): Promise<Locator> {
  await page.setViewportSize({ width: 1440, height: 6000 });
  await page.goto(`/probe/whitelabel-torture?fixture=${fixture}&engine=${engine}&w=1280&slug=button&ckH1=1`, {
    waitUntil: 'domcontentloaded',
  });

  const root = page.locator(ROOT_SELECTOR);
  await root.waitFor({ timeout: 30_000 });
  await page.waitForFunction((expected) => document.documentElement.getAttribute('data-engine') === expected, engine);
  await page.evaluate(() => document.fonts.ready);
  await waitForGroundPaint(page, ground);
  await waitForSettled(page, root);
  return root;
}

for (const fixture of FIXTURES) {
  for (const engine of ENGINES) {
    test(`${fixture.id} (${fixture.ground}) / CK-H1 tenant-preview / ${engine}`, async ({ page }) => {
      test.setTimeout(90_000);
      const root = await openProbe(page, fixture.id, engine, fixture.ground);
      const band = root.locator('[data-testid="probe-ck-h1-tenant-preview"]');
      const preview = band.locator(`.ds-pattern-tenant-preview.ds-engine-${engine}[data-part="root"]`);

      await expect(preview).toHaveCount(1);
      for (const palette of ['primary', 'secondary']) {
        await expect(preview.locator(`[data-part="swatch"][data-palette="${palette}"]`)).toHaveCount(10);
        for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) {
          await expect(
            preview.locator(`[data-part="swatch"][data-palette="${palette}"][data-step="${step}"]`)
          ).toHaveCount(1);
        }
      }
      for (const variant of ['primary', 'outlined', 'default']) {
        await expect(preview.locator(`[data-part="button"][data-variant="${variant}"]`)).toHaveCount(1);
      }
      for (const status of ['active', 'pending', 'draft']) {
        await expect(preview.locator(`[data-part="badge"][data-status="${status}"]`).first()).toBeVisible();
      }

      await waitForSettled(page, band);
      await expect(band).toHaveScreenshot(`${fixture.id}-misc-h1-${engine}-tenant-preview-prestep.png`, {
        maxDiffPixelRatio: 0.0005,
      });
    });
  }

  test(`${fixture.id} (${fixture.ground}) / CK-H1 branding sandbox full state`, async ({ page }) => {
    test.setTimeout(90_000);
    const root = await openProbe(page, fixture.id, 'modern', fixture.ground);
    const band = root.locator('[data-testid="probe-ck-h1-branding-sandbox"]');
    const sandbox = band.locator('.ds-pattern-branding-preview-sandbox[data-part="root"][data-state="full"]');

    await expect(sandbox).toHaveCount(1);
    for (const variant of ['primary', 'secondary', 'default', 'ghost']) {
      await expect(sandbox.locator(`[data-part="button"][data-variant="${variant}"]`)).toHaveCount(1);
    }
    for (const state of ['active', 'warning', 'error', 'info']) {
      await expect(sandbox.locator(`[data-part="badge"][data-state="${state}"]`).first()).toBeVisible();
    }
    await expect(sandbox.locator('[data-part="input"][data-state="error"]')).toHaveCount(1);
    await expect(sandbox.locator('[data-part="card"][data-state="elevated"]')).toHaveCount(1);
    await expect(sandbox.locator('[data-part="table"]')).toHaveCount(1);

    await waitForSettled(page, band);
    await expect(band).toHaveScreenshot(`${fixture.id}-misc-h1-branding-sandbox-prestep.png`, {
      maxDiffPixelRatio: 0.0005,
    });
  });

  test(`${fixture.id} (${fixture.ground}) / CK-H1 Brand Studio both scoped grounds`, async ({ page }) => {
    test.setTimeout(90_000);
    const root = await openProbe(page, fixture.id, 'modern', fixture.ground);
    const band = root.locator('[data-testid="probe-ck-h1-brand-studio"]');
    const studio = band.locator('.ds-pattern-brand-studio[data-part="root"]');

    await expect(studio).toHaveCount(1);
    await expect(studio.locator('.ds-pattern-brand-studio__color-swatch').first()).toBeVisible();
    for (const ground of ['dark', 'light']) {
      await expect(
        studio.locator(`[data-part="preview-panel"][data-surface="${ground}"][data-ground="${ground}"]`)
      ).toHaveCount(1);
      await expect(
        studio.locator(`[data-part="preview-content"][data-surface="${ground}"][data-ground="${ground}"]`)
      ).toBeVisible();
      await expect(studio.locator(`[data-part="contrast-summary"][data-ground="${ground}"]`)).toHaveCount(1);
    }

    await waitForSettled(page, band);
    await expect(band).toHaveScreenshot(`${fixture.id}-misc-h1-brand-studio-prestep.png`, {
      maxDiffPixelRatio: 0.0005,
    });
  });
}
