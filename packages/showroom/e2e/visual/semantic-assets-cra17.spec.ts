import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test, type Page } from '@playwright/test';

const TENANTS = ['bithire', 'themanagementmiami'] as const;
const ENGINES = ['classic', 'modern', 'rustic'] as const;
const THEMES = ['light', 'dark'] as const;
const ROLE_COUNT = 40;
const SIZE_COUNT = 4;
const PAGE_ROLE_CELLS = ROLE_COUNT * SIZE_COUNT;
const REQUIRED_ROLE_CELLS = ROLE_COUNT * SIZE_COUNT * ENGINES.length * THEMES.length * TENANTS.length;
const MOBILE_VIEWPORT = { width: 390, height: 844 };

interface CaptureRecord {
  readonly bytes: number;
  readonly engine: typeof ENGINES[number];
  readonly file: string;
  readonly roleCells: number;
  readonly sha256: string;
  readonly tenant: typeof TENANTS[number];
  readonly theme: typeof THEMES[number];
}

function probeUrl({
  engine,
  tenant,
  theme,
  direction = 'ltr',
  forcedColors = false,
}: {
  engine: typeof ENGINES[number];
  tenant: typeof TENANTS[number];
  theme: typeof THEMES[number];
  direction?: 'ltr' | 'rtl';
  forcedColors?: boolean;
}): string {
  const search = new URLSearchParams({
    corpus: 'canonical',
    dir: direction,
    engine,
    forcedColors: forcedColors ? '1' : '0',
    tenant,
    theme,
  });
  return `/probe/semantic-assets?${search.toString()}`;
}

async function waitForAtlas(
  page: Page,
  axes: {
    engine: typeof ENGINES[number];
    tenant: typeof TENANTS[number];
    theme: typeof THEMES[number];
  },
): Promise<void> {
  await page.goto(probeUrl(axes), { waitUntil: 'networkidle' });
  const atlas = page.locator('[data-cra17-probe="semantic-assets"]');
  await expect(atlas).toHaveAttribute('data-cra17-ready', 'true');
  await expect(atlas).toHaveAttribute('data-cra17-corpus', 'canonical');
  await expect(atlas).toHaveAttribute('data-cra17-icon-count', String(ROLE_COUNT));
  await expect(atlas).toHaveAttribute('data-cra17-role-cell-count', String(PAGE_ROLE_CELLS));
  await page.waitForFunction(
    ({ engine, tenant, theme }) => (
      document.documentElement.getAttribute('data-engine') === engine
      && document.documentElement.getAttribute('data-tenant') === tenant
      && document.documentElement.getAttribute('data-theme') === theme
    ),
    axes,
  );
  await page.evaluate(() => document.fonts.ready);
}

test.describe.configure({ mode: 'serial' });

test.describe('CRA17 exact mobile optical matrix', () => {
  test.use({ reducedMotion: 'reduce', viewport: MOBILE_VIEWPORT });

  test('covers all 1,920 canonical role cells across tenant, engine and scheme axes', async ({ page }) => {
    test.setTimeout(240_000);
    const captureEnabled = process.env.CRA17_CAPTURE === '1';
    const artifactRoot = resolve(
      test.info().project.testDir,
      '../../../test-artifacts/craft/cra-17/optical-matrix',
    );
    const captures: CaptureRecord[] = [];
    let observedRoleCells = 0;

    if (captureEnabled) mkdirSync(artifactRoot, { recursive: true });

    for (const tenant of TENANTS) {
      for (const engine of ENGINES) {
        for (const theme of THEMES) {
          const axes = { tenant, engine, theme } as const;
          await waitForAtlas(page, axes);

          const iconSection = page.locator('[data-cra17-asset-class="icon"]');
          const rows = iconSection.locator('[data-cra17-asset-name]');
          const cells = iconSection.locator('[data-cra17-capture-key]');
          await expect(rows).toHaveCount(ROLE_COUNT);
          await expect(cells).toHaveCount(PAGE_ROLE_CELLS);
          await expect(cells.locator('svg')).toHaveCount(PAGE_ROLE_CELLS);

          const measurement = await page.evaluate(() => {
            const root = document.documentElement;
            const viewportWidth = root.clientWidth;
            const cells = [...document.querySelectorAll<HTMLElement>(
              '[data-cra17-asset-class="icon"] [data-cra17-capture-key]',
            )];
            return {
              emptyCells: cells.filter((cell) => cell.querySelectorAll('svg').length !== 1).length,
              offViewportCells: cells.filter((cell) => {
                const rect = cell.getBoundingClientRect();
                return rect.left < -1 || rect.right > viewportWidth + 1;
              }).length,
              pageOverflow: root.scrollWidth - root.clientWidth,
              sizes: [...new Set(cells.map((cell) => cell.dataset.cra17AssetSize))].sort(),
              visibleCells: cells.filter((cell) => {
                const rect = cell.getBoundingClientRect();
                const style = getComputedStyle(cell);
                return rect.width > 0 && rect.height > 0 && style.display !== 'none';
              }).length,
            };
          });

          expect(measurement).toEqual({
            emptyCells: 0,
            offViewportCells: 0,
            pageOverflow: 0,
            sizes: ['12', '16', '20', '24'],
            visibleCells: PAGE_ROLE_CELLS,
          });

          const monochromeBrandVariants = await page
            .locator(
              '[data-cra17-asset-class="brand-mark"] [data-mark-name="anthropic"], ' +
                '[data-cra17-asset-class="brand-mark"] [data-mark-name="github"]',
            )
            .evaluateAll((marks) =>
              [...new Set(marks.map((mark) => mark.getAttribute('data-mark-source-variant')))],
            );
          expect(
            monochromeBrandVariants,
            `${tenant}/${engine}/${theme}: ground-aware brand contrast`,
          ).toEqual([theme]);

          observedRoleCells += PAGE_ROLE_CELLS;

          if (captureEnabled) {
            const file = `${tenant}-${engine}-${theme}-mobile.png`;
            const path = resolve(artifactRoot, file);
            await page.locator('[data-cra17-probe="semantic-assets"]').screenshot({
              animations: 'disabled',
              path,
            });
            const bytes = statSync(path).size;
            captures.push({
              ...axes,
              bytes,
              file,
              roleCells: PAGE_ROLE_CELLS,
              sha256: createHash('sha256').update(readFileSync(path)).digest('hex'),
            });
          }
        }
      }
    }

    expect(observedRoleCells).toBe(REQUIRED_ROLE_CELLS);

    if (captureEnabled) {
      writeFileSync(
        resolve(artifactRoot, 'capture-manifest.json'),
        `${JSON.stringify({
          schemaVersion: 1,
          workOrder: 'WO-CRA-17',
          formFactor: 'mobile',
          roleCount: ROLE_COUNT,
          sizesPx: [12, 16, 20, 24],
          engines: ENGINES,
          schemes: THEMES,
          tenantContexts: TENANTS,
          requiredRoleCells: REQUIRED_ROLE_CELLS,
          recordedRoleCells: observedRoleCells,
          screenshotCount: captures.length,
          sightedReview: 'pending',
          captures,
        }, null, 2)}\n`,
        'utf8',
      );
    }
  });

  test('uses real RTL and forced-colors browser state without mirroring marks', async ({ browser }) => {
    const context = await browser.newContext({
      forcedColors: 'active',
      reducedMotion: 'reduce',
      viewport: MOBILE_VIEWPORT,
    });
    const page = await context.newPage();

    try {
      const axes = { tenant: 'themanagementmiami', engine: 'rustic', theme: 'dark' } as const;
      await page.goto(probeUrl({ ...axes, direction: 'rtl', forcedColors: true }), {
        waitUntil: 'networkidle',
      });
      await expect(page.locator('[data-cra17-probe="semantic-assets"]')).toHaveAttribute(
        'data-cra17-direction',
        'rtl',
      );
      await expect.poll(() => page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);

      const transforms = await page.evaluate(() => {
        const directional = document.querySelector<SVGElement>(
          '[data-cra17-asset-name="navigation.forward"] svg',
        );
        const mark = document.querySelector<SVGElement>(
          '[data-cra17-asset-class="brand-mark"] svg',
        );
        if (!directional || !mark) throw new Error('CRA17 RTL capture targets missing');
        return {
          direction: document.documentElement.dir,
          directional: getComputedStyle(directional).transform,
          mark: getComputedStyle(mark).transform,
        };
      });

      expect(transforms.direction).toBe('rtl');
      expect(transforms.directional).toBe('matrix(-1, 0, 0, 1, 0, 0)');
      expect(transforms.mark).toBe('none');
    } finally {
      await context.close();
    }
  });
});
