import { expect, test, type Page } from '@playwright/test';

const ACTIVE_RUNTIME = '[data-particle-field-runtime="active"]';
const CANVAS = '[data-particle-field-canvas="true"]';
const MAX_PARTICLES = 1_200;
const MAX_DPR = 2;
const MAX_PIXELS = 4_194_304;

interface RafMetrics {
  callbacks: number;
  maxCallbackMs: number;
}

async function installRafMeasurement(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const metrics: RafMetrics = { callbacks: 0, maxCallbackMs: 0 };
    const nativeRequest = window.requestAnimationFrame.bind(window);

    Object.defineProperty(window, '__particleRafMetrics', {
      configurable: false,
      value: metrics,
      writable: false,
    });

    window.requestAnimationFrame = (callback: FrameRequestCallback): number => nativeRequest((timestamp) => {
      const startedAt = performance.now();
      callback(timestamp);
      metrics.callbacks += 1;
      metrics.maxCallbackMs = Math.max(metrics.maxCallbackMs, performance.now() - startedAt);
    });
  });
}

async function rafMetrics(page: Page): Promise<RafMetrics> {
  return page.evaluate(() => (
    window as typeof window & { __particleRafMetrics: RafMetrics }
  ).__particleRafMetrics);
}

test.describe('ParticleField real-browser lifecycle budget', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('bounds one live context, hands it across viewports and recovers from context loss', async ({ page }) => {
    await installRafMeasurement(page);
    await page.goto('/probe/particle-runtime', { waitUntil: 'networkidle' });

    const primary = page.locator('[data-particle-probe="primary"]');
    const secondary = page.locator('[data-particle-probe="secondary"]');
    const primaryRuntime = primary.locator(ACTIVE_RUNTIME);

    await expect(primaryRuntime).toHaveCount(1);
    await expect(secondary.locator(CANVAS)).toHaveCount(0);

    const primaryCanvas = primary.locator(CANVAS);
    await expect(primaryCanvas).toHaveAttribute('data-particle-color', 'rgba(19, 112, 108, 1)');

    const allocation = await primaryCanvas.evaluate((canvas) => ({
      count: Number((canvas as HTMLElement).dataset.particleCount),
      dpr: Number((canvas as HTMLElement).dataset.particleDpr),
      pixels: Number((canvas as HTMLElement).dataset.particlePixels),
    }));
    expect(allocation.count).toBeGreaterThan(0);
    expect(allocation.count).toBeLessThanOrEqual(MAX_PARTICLES);
    expect(allocation.dpr).toBeGreaterThan(0);
    expect(allocation.dpr).toBeLessThanOrEqual(MAX_DPR);
    expect(allocation.pixels).toBeLessThanOrEqual(MAX_PIXELS);

    await secondary.scrollIntoViewIfNeeded();
    await expect(secondary.locator(ACTIVE_RUNTIME)).toHaveCount(1);
    await expect(secondary.locator(CANVAS)).toHaveAttribute(
      'data-particle-color',
      'rgba(217, 120, 100, 1)',
    );
    await expect(primary.locator(ACTIVE_RUNTIME)).toHaveCount(0);
    await expect(primary.locator('[data-particle-field-raf="leased"]')).toHaveCount(0);

    const secondaryCanvas = secondary.locator(CANVAS);
    await secondaryCanvas.dispatchEvent('contextlost');
    await expect(secondary.locator('[data-particle-field-runtime="context-lost"]')).toHaveCount(1);
    await expect(secondary.locator('[data-particle-field-raf="none"]')).toHaveCount(2);

    await secondaryCanvas.dispatchEvent('contextrestored');
    await expect(secondary.locator(ACTIVE_RUNTIME)).toHaveCount(1);

    await expect(page.getByText('Operational signal map')).toBeVisible();
    await expect(page.getByText('Candidate relationship field')).toBeVisible();

    await expect.poll(async () => (await rafMetrics(page)).callbacks).toBeGreaterThan(10);
    expect((await rafMetrics(page)).maxCallbackMs).toBeLessThan(50);
  });

  test('keeps reduced-motion and coarse-pointer environments static with no canvas', async ({ browser }) => {
    for (const options of [
      { reducedMotion: 'reduce' as const, hasTouch: false },
      { reducedMotion: 'no-preference' as const, hasTouch: true },
    ]) {
      const context = await browser.newContext({
        hasTouch: options.hasTouch,
        isMobile: options.hasTouch,
        reducedMotion: options.reducedMotion,
        viewport: { width: 390, height: 844 },
      });
      const page = await context.newPage();

      try {
        await installRafMeasurement(page);
        await page.goto('/probe/particle-runtime', { waitUntil: 'networkidle' });
        await expect(page.locator(CANVAS)).toHaveCount(0);
        await expect(page.locator('[data-particle-field-runtime="static"]')).toHaveCount(2);
        await expect(page.getByText('Operational signal map')).toBeVisible();
        expect((await rafMetrics(page)).callbacks).toBe(0);
      } finally {
        await context.close();
      }
    }
  });
});
