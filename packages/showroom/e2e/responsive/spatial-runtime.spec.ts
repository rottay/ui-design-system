import { expect, test } from '@playwright/test';

const LIVE = '[data-spatial-mode^="live-"]';
const CANVAS = '[data-spatial-experience-canvas]';
const MAX_DPR = 2;
const MAX_PIXELS = 4_194_304;

test.use({
  launchOptions: {
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader'],
  },
  reducedMotion: 'no-preference',
});

test.describe('SpatialExperience real-browser lifecycle budget', () => {
  test('bounds one live context, hands it across viewports and retries after context loss', async ({ page }) => {
    await page.goto('/probe/spatial-runtime', { waitUntil: 'networkidle' });

    const primary = page.locator('[data-spatial-probe="primary"]');
    const secondary = page.locator('[data-spatial-probe="secondary"]');

    await expect(primary.locator(LIVE)).toHaveCount(1);
    await expect(primary.locator('[data-spatial-ready="true"]')).toHaveCount(1);
    await expect(secondary.locator(CANVAS)).toHaveCount(0);

    const primaryCanvas = primary.locator(CANVAS);
    await expect.poll(async () => Number(await primaryCanvas.getAttribute('data-spatial-probe-frames'))).toBeGreaterThan(5);
    const allocation = await primaryCanvas.evaluate((canvas) => ({
      dpr: Number((canvas as HTMLElement).dataset.spatialProbeDpr),
      height: (canvas as HTMLCanvasElement).height,
      pixels: Number((canvas as HTMLElement).dataset.spatialProbePixels),
      width: (canvas as HTMLCanvasElement).width,
    }));
    expect(allocation.dpr).toBeGreaterThan(0);
    expect(allocation.dpr).toBeLessThanOrEqual(MAX_DPR);
    expect(allocation.height).toBeLessThanOrEqual(2_560);
    expect(allocation.width).toBeLessThanOrEqual(2_560);
    expect(allocation.pixels).toBeLessThanOrEqual(MAX_PIXELS);

    await secondary.scrollIntoViewIfNeeded();
    await expect(secondary.locator(LIVE)).toHaveCount(1);
    await expect(secondary.locator('[data-spatial-ready="true"]')).toHaveCount(1);
    await expect(primary.locator(LIVE)).toHaveCount(0);
    await expect(primary.locator(CANVAS)).toHaveCount(0);

    const secondaryCanvas = secondary.locator(CANVAS);
    await secondaryCanvas.dispatchEvent('webglcontextlost');
    await expect(secondary.locator('[data-spatial-reason="context-lost"]')).toHaveCount(1);
    await expect(secondary.locator(CANVAS)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Retry secondary scene' })).toBeVisible();

    await page.getByRole('button', { name: 'Retry secondary scene' }).click();
    await expect(secondary.locator(LIVE)).toHaveCount(1);
    await expect(secondary.locator('[data-spatial-ready="true"]')).toHaveCount(1);
    await expect(page.getByText('Candidate relationship map')).toBeAttached();
  });

  test('keeps reduced-motion, coarse-pointer and save-data environments static', async ({ browser }) => {
    for (const environment of [
      { mobile: false, reduce: 'reduce' as const, saveData: false },
      { mobile: true, reduce: 'no-preference' as const, saveData: false },
      { mobile: false, reduce: 'no-preference' as const, saveData: true },
    ]) {
      const context = await browser.newContext({
        hasTouch: environment.mobile,
        isMobile: environment.mobile,
        reducedMotion: environment.reduce,
        viewport: environment.mobile ? { height: 844, width: 390 } : { height: 900, width: 1_440 },
      });
      if (environment.saveData) {
        await context.addInitScript(() => {
          Object.defineProperty(navigator, 'connection', {
            configurable: true,
            value: {
              addEventListener: () => undefined,
              effectiveType: '4g',
              removeEventListener: () => undefined,
              saveData: true,
            },
          });
        });
      }
      const page = await context.newPage();

      try {
        await page.goto('/probe/spatial-runtime', { waitUntil: 'networkidle' });
        await expect(page.locator(CANVAS)).toHaveCount(0);
        await expect(page.locator(LIVE)).toHaveCount(0);
        await expect(page.getByText(/(?:Reduced )?operational (?:relationship )?map/i)).toBeVisible();
      } finally {
        await context.close();
      }
    }
  });

  test('fails closed when the browser cannot allocate WebGL2', async ({ page }) => {
    await page.addInitScript(() => {
      const nativeGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function getContext(
        this: HTMLCanvasElement,
        contextId: string,
        ...args: unknown[]
      ) {
        if (contextId === 'webgl2') return null;
        return Reflect.apply(nativeGetContext, this, [contextId, ...args]);
      } as typeof HTMLCanvasElement.prototype.getContext;
    });
    await page.goto('/probe/spatial-runtime', { waitUntil: 'networkidle' });

    await expect(page.locator(CANVAS)).toHaveCount(0);
    await expect(page.locator('[data-spatial-reason="webgl2-unsupported"]')).toHaveCount(1);
    await expect(page.getByText('Operational relationship map')).toBeVisible();
  });
});
