import { expect, test, type Locator, type Page } from '@playwright/test';

import { expectHydrated } from '../support/hydration';

// Paint probes for liveness rows whose terminal no CSS graph can see: an
// inline bodyStyle read on a portalled Sheet body, and canvas pixels.

const ROUTE = '/probe/liveness-paint';
const DRAWER_CHANNEL = '--ds-app-shell-navigation-drawer-body-padding';

interface Box4 {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

async function bodyPadding(body: Locator): Promise<Box4> {
  return body.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      top: computed.paddingTop,
      right: computed.paddingRight,
      bottom: computed.paddingBottom,
      left: computed.paddingLeft,
    };
  });
}

const uniform = (value: string): Box4 => ({ top: value, right: value, bottom: value, left: value });

test.describe('drawer body padding follows its channel', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('--ds-app-shell-navigation-drawer-body-padding paints the Modern Sheet body', async ({ page }) => {
    await page.goto(`${ROUTE}?scene=drawer`, { waitUntil: 'networkidle' });
    await expectHydrated(page);

    const trigger = page.locator('[data-part="navigation-trigger"]');
    await expect(trigger).toBeVisible();
    await trigger.click();

    const surface = page.locator('.ds-sheet--modern[data-motion="final"] > [data-part="surface"][data-open="true"]').filter({
      has: page.getByTestId('liveness-drawer-nav'),
    });
    await expect(surface).toBeVisible();
    const body = surface.locator('[data-part="body"]');
    await expect(body).toHaveCount(1);

    const inlinePadding = await body.evaluate((element) => (element as HTMLElement).style.padding);
    expect(inlinePadding).toBe(`var(${DRAWER_CHANNEL}, 0)`);
    const authored = await body.evaluate(
      (element, name) => getComputedStyle(element).getPropertyValue(name).trim(),
      DRAWER_CHANNEL,
    );
    expect(authored).toBe('0');
    expect(await bodyPadding(body)).toEqual(uniform('0px'));

    for (const value of ['7px', '13px']) {
      await surface.evaluate(
        (element, [name, next]) => (element as HTMLElement).style.setProperty(name, next),
        [DRAWER_CHANNEL, value] as const,
      );
      await expect.poll(() => bodyPadding(body)).toEqual(uniform(value));
    }

    await surface.evaluate(
      (element, name) => (element as HTMLElement).style.removeProperty(name),
      DRAWER_CHANNEL,
    );
    await expect.poll(() => bodyPadding(body)).toEqual(uniform('0px'));

    const unrelated = '--ds-app-shell-navigation-drawer-body-padding-unrelated';
    await surface.evaluate(
      (element, name) => (element as HTMLElement).style.setProperty(name, '21px'),
      unrelated,
    );
    expect(await bodyPadding(body)).toEqual(uniform('0px'));
  });
});

interface CanvasInk {
  color: string;
  count: number;
  inked: number;
  dominant: [number, number, number] | null;
  dominantShare: number;
}

async function readCanvasInk(page: Page, fieldClass: string, minAlpha: number): Promise<CanvasInk> {
  const canvas = page.locator(`.${fieldClass} [data-particle-field-canvas="true"]`);
  await expect(canvas).toHaveCount(1);
  await expect
    .poll(async () => Number(await canvas.getAttribute('data-particle-count')))
    .toBeGreaterThan(0);

  return canvas.evaluate((element, alphaFloor) => {
    const node = element as HTMLCanvasElement;
    const context = node.getContext('2d');
    if (!context) throw new Error('canvas has no 2d context');
    const { data } = context.getImageData(0, 0, node.width, node.height);
    const buckets = new Map<string, number>();
    let inked = 0;
    for (let index = 0; index < data.length; index += 4) {
      if (data[index + 3] < alphaFloor) continue;
      inked += 1;
      const key = [data[index], data[index + 1], data[index + 2]].map((v) => Math.round(v / 8) * 8).join(',');
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    let dominant: [number, number, number] | null = null;
    let best = 0;
    for (const [key, hits] of buckets) {
      if (hits > best) {
        best = hits;
        dominant = key.split(',').map(Number) as [number, number, number];
      }
    }
    return {
      color: node.dataset.particleColor ?? '',
      count: Number(node.dataset.particleCount),
      inked,
      dominant,
      dominantShare: inked === 0 ? 0 : best / inked,
    };
  }, minAlpha);
}

function expectNear(actual: [number, number, number] | null, expected: [number, number, number]): void {
  expect(actual).not.toBeNull();
  actual!.forEach((channel, index) => expect(Math.abs(channel - expected[index])).toBeLessThanOrEqual(16));
}

const PARTICLE_CASES = [
  {
    scene: 'particle-primary',
    channel: '--ds-workspace-shell-particle-primary',
    fieldClass: 'ds-collection-shell__orbital-field',
    override: '#ff00ff',
    rgb: [255, 0, 255] as [number, number, number],
    minAlpha: 24,
    // The authored rest resolves to a concrete colour of its own.
    authoredInk: null,
  },
  {
    scene: 'particle-secondary',
    channel: '--ds-workspace-shell-particle-secondary',
    fieldClass: 'ds-collection-shell__ambient-field',
    override: '#00ff00',
    rgb: [0, 255, 0] as [number, number, number],
    minAlpha: 4,
    // The authored rest is a three-colour color-mix(), invalid in Chromium, so
    // the canvas paints the runtime's DEFAULT_COLOR instead of the channel's rest.
    authoredInk: 'rgba(255, 255, 255, 0.88)',
  },
] as const;

test.describe('workspace-shell particle inks reach canvas pixels', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  for (const probe of PARTICLE_CASES) {
    test(`${probe.channel}: the shipped field geometry collapses the canvas`, async ({ page }) => {
      await page.goto(
        `${ROUTE}?scene=${probe.scene}&override=${encodeURIComponent(probe.override)}`,
        { waitUntil: 'networkidle' },
      );
      await expectHydrated(page);
      const field = page.locator(`.${probe.fieldClass}`);
      const canvas = field.locator('[data-particle-field-canvas="true"]');
      await expect(canvas).toHaveCount(1);
      await expect(canvas).toHaveAttribute('data-particle-color', `rgba(${probe.rgb.join(', ')}, 1)`);

      const geometry = await field.evaluate((element) => ({
        position: getComputedStyle(element).position,
        fieldHeight: element.getBoundingClientRect().height,
        shellHeight: element.parentElement!.getBoundingClientRect().height,
        canvasHeight: (element.querySelector('[data-particle-field-canvas="true"]') as HTMLCanvasElement).height,
      }));
      expect(geometry.position).toBe('relative');
      expect(geometry.fieldHeight).toBe(0);
      expect(geometry.shellHeight).toBeGreaterThan(600);
      expect(geometry.canvasHeight).toBeLessThanOrEqual(1);

      test.info().annotations.push({
        type: 'liveness-paint',
        description: JSON.stringify({ channel: probe.channel, geometry }),
      });
    });

    test(`${probe.channel}: paints the canvas pixels once the field has the skin geometry`, async ({ page }) => {
      await page.goto(`${ROUTE}?scene=${probe.scene}&geometry=assisted`, { waitUntil: 'networkidle' });
      await expectHydrated(page);
      await expect(page.locator('[data-particle-field-mode="live"]')).toHaveCount(1);

      const authored = await page
        .locator(`.${probe.fieldClass}`)
        .evaluate((element, name) => getComputedStyle(element).getPropertyValue(name).trim(), probe.channel);
      expect(authored).not.toBe('');
      const authoredIsColor = await page.evaluate((value) => CSS.supports('color', value), authored);
      expect(authoredIsColor).toBe(probe.authoredInk === null);
      const baseline = await readCanvasInk(page, probe.fieldClass, probe.minAlpha);
      expect(baseline.inked).toBeGreaterThan(20);
      expect(baseline.color).not.toBe(`rgba(${probe.rgb.join(', ')}, 1)`);
      if (probe.authoredInk !== null) expect(baseline.color).toBe(probe.authoredInk);

      await page.goto(
        `${ROUTE}?scene=${probe.scene}&geometry=assisted&override=${encodeURIComponent(probe.override)}`,
        { waitUntil: 'networkidle' },
      );
      await expectHydrated(page);
      const overridden = await readCanvasInk(page, probe.fieldClass, probe.minAlpha);
      expect(overridden.color).toBe(`rgba(${probe.rgb.join(', ')}, 1)`);
      expect(overridden.inked).toBeGreaterThan(20);
      expectNear(overridden.dominant, probe.rgb);
      expect(overridden.dominantShare).toBeGreaterThan(0.9);
      expect(baseline.dominant).not.toEqual(overridden.dominant);

      test.info().annotations.push({
        type: 'liveness-paint',
        description: JSON.stringify({ channel: probe.channel, authored, authoredIsColor, baseline, overridden }),
      });
    });
  }
});
