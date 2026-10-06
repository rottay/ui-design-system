import { expect, test, type Page, type Route } from '@playwright/test';

import { expectHydrated } from '../support/hydration';

// `?w=` declares the probe's tier; first paint is read with chunks held, and the recorder logs every
// tier any element ever carries, so a flip between first paint and settled cannot hide.

const ROOT = '[data-testid="probe-long-tail"]';
const WITNESS = '[data-testid="probe-viewport"]';

const POSTURE_RECORDER = `
  window.__w25Tiers = [];
  const read = (el) => {
    const tier = (el.getAttribute('data-posture') || '').split(' ')[0];
    if (tier && !window.__w25Tiers.includes(tier)) window.__w25Tiers.push(tier);
  };
  const visit = (node) => {
    if (!(node instanceof Element)) return;
    if (node.hasAttribute('data-posture')) read(node);
    node.querySelectorAll('[data-posture]').forEach(read);
  };
  new MutationObserver((records) => {
    for (const entry of records) {
      if (entry.type === 'attributes') read(entry.target);
      entry.addedNodes.forEach(visit);
    }
  }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-posture'] });
`;

async function holdHydration(page: Page): Promise<() => void> {
  let release = (): void => undefined;
  const gate = new Promise<void>((resolve) => {
    release = () => resolve();
  });
  await page.route('**/_next/static/chunks/**', async (route: Route) => {
    await gate;
    await route.continue();
  });
  return release;
}

interface PostureReading {
  readonly hint: string | null;
  readonly deviceClass: string | null;
  readonly resolved: string | null;
  readonly tiers: string[];
  readonly hydrated: boolean;
}

async function readPostures(page: Page): Promise<PostureReading> {
  return page.evaluate(
    ([root, witness]) => {
      const tiers = new Set<string>();
      document.querySelectorAll(`${root} [data-posture]`).forEach((el) => {
        tiers.add((el.getAttribute('data-posture') ?? '').split(' ')[0] ?? '');
      });
      const published = document.querySelector(witness);
      return {
        hint: document.documentElement.getAttribute('data-ds-viewport'),
        deviceClass: published?.getAttribute('data-device-class') ?? null,
        resolved: published?.getAttribute('data-resolved') ?? null,
        tiers: [...tiers].sort(),
        hydrated: Object.keys(document.body).some((key) => key.startsWith('__reactFiber$')),
      };
    },
    [ROOT, WITNESS] as const,
  );
}

async function measure(
  page: Page,
  query: string,
): Promise<{ firstPaint: PostureReading; settled: PostureReading; everSeen: string[] }> {
  await page.addInitScript(POSTURE_RECORDER);
  const release = await holdHydration(page);
  await page.goto(`/probe/whitelabel-torture?fixture=rottay&engine=modern&slug=button&longTail=1${query}`, {
    waitUntil: 'commit',
  });
  await page.locator(ROOT).waitFor({ state: 'attached', timeout: 30_000 });
  const firstPaint = await readPostures(page);

  release();
  await expectHydrated(page);
  await expect(page.locator(WITNESS)).toHaveAttribute('data-resolved', 'true', { timeout: 30_000 });
  const settled = await readPostures(page);
  const everSeen = await page.evaluate(() => [...((window as { __w25Tiers?: string[] }).__w25Tiers ?? [])].sort());
  return { firstPaint, settled, everSeen };
}

const CASES = [
  { w: '360', device: { width: 390, height: 844 }, tier: 'phone' },
  { w: '768', device: { width: 820, height: 1180 }, tier: 'tablet' },
  { w: '1280', device: { width: 1440, height: 900 }, tier: 'desktop' },
] as const;

test.describe.configure({ mode: 'serial' });

test.describe('first paint of /probe/whitelabel-torture carries the declared ?w= tier', () => {
  for (const { w, device, tier } of CASES) {
    test(`w=${w} on a ${device.width}px device paints ${tier} before hydration and never flips`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ viewport: device });
      const page = await context.newPage();
      try {
        const { firstPaint, settled, everSeen } = await measure(page, `&w=${w}`);
        test.info().annotations.push({
          type: 'posture',
          description: JSON.stringify({ w, device: device.width, firstPaint, settled, everSeen }),
        });

        expect(firstPaint.hydrated, 'the first-paint read must precede hydration').toBe(false);
        expect(firstPaint.hint).toBe(tier);
        expect(firstPaint.deviceClass).toBe(tier);
        expect(firstPaint.resolved).toBe('false');
        expect(firstPaint.tiers, 'the server bytes must already carry postures').toEqual([tier]);

        expect(settled.hydrated).toBe(true);
        expect(settled.deviceClass).toBe(tier);
        expect(settled.tiers).toEqual([tier]);
        expect(everSeen, 'no other tier may paint between first frame and settled').toEqual([tier]);
      } finally {
        await context.close();
      }
    });
  }

  // Control: an undeclared load must flip, proving the recorder sees one and the default is not desktop.
  test('an undeclared load stays unhinted: phone first, corrected to desktop after hydration', async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    try {
      const { firstPaint, settled, everSeen } = await measure(page, '');
      test.info().annotations.push({
        type: 'posture',
        description: JSON.stringify({ w: null, device: 1440, firstPaint, settled, everSeen }),
      });

      expect(firstPaint.hydrated).toBe(false);
      expect(firstPaint.hint).toBeNull();
      expect(firstPaint.deviceClass).toBe('phone');
      expect(firstPaint.tiers).toEqual(['phone']);
      expect(settled.deviceClass).toBe('desktop');
      expect(settled.tiers).toEqual(['desktop']);
      expect(everSeen).toEqual(['desktop', 'phone']);
    } finally {
      await context.close();
    }
  });
});
