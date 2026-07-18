import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test, expect, type Page } from '@playwright/test';

import {
  DIVERGENCE_FIXTURES,
  type DivergenceFixtureId,
} from '../../src/components/divergence-surface/fixtures';
import {
  DIVERGENCE_SOBER_DOCUMENT,
  DIVERGENCE_SOBER_EXPECTED_ANATOMY,
  DIVERGENCE_SOBER_IDENTITY,
} from '../../../core/src/foundation/tokens/ts/presentation/brand-themes/fixtures/divergence-sober';
import {
  DIVERGENCE_EDITORIAL_DOCUMENT,
  DIVERGENCE_EDITORIAL_EXPECTED_ANATOMY,
  DIVERGENCE_EDITORIAL_IDENTITY,
} from '../../../core/src/foundation/tokens/ts/presentation/brand-themes/fixtures/divergence-editorial';

// ---------------------------------------------------------------------------
// W4 divergence demo — the wave exit certification (design w4-whitelabel
// section 9). Two tenant-theme documents on the SAME bithire vertical must
// produce DIFFERENT PRODUCTS, not recolors.
//
// The probe drives /probe/whitelabel-divergence across fixture x route x
// ground x viewport, captures the grid for sighted review, and runs the
// machine floor:
//   1. per-tenant stability — the same load twice diffs below a noise floor
//      (each identity is stable);
//   2. the INVERSE pixel assertion — the cross-tenant dashboard pair diffs by
//      MORE than 0.25 of pixels. Recolor-only differences do not reach that
//      floor; anatomy + typography + density + palette together must;
//   3. computed-style divergence — heading font-family, primary Button
//      border-radius, data-anatomy-table, resolved --ds-chart-series-1, and
//      rendered sidebar width all differ between the two tenants;
//   4. artifact.adjustments.length === 0 for both fixtures (well-formed
//      tenants need no APCA autocorrect);
//   5. fixture parity — the showroom copies are deep-equal to the core
//      fixture modules (single source of truth stays single);
//   6. dual-scheme proof — the editorial artifact's light-dark() emission
//      actually flips the painted ground between light and dark loads.
//
// Screenshots land in test-artifacts/gates/w4-divergence/ on every run. The
// cross-tenant ratios are measured on viewport-sized captures decoded in the
// browser (canvas ImageData); a channel delta > 12/255 marks a pixel
// different, absorbing antialiasing noise without hiding real divergence.
//
// GUARD (W3 lesson): a foreign session rebuilding this shared tree mid-run
// poisons the measurement. The suite records .next/BUILD_ID up front and
// fails closed if it shifts before the final assertion.
// ---------------------------------------------------------------------------

type Ground = 'light' | 'dark';
type Route = 'dashboard' | 'list' | 'detail';
type Viewport = 'desktop' | 'mobile';

const FIXTURE_IDS: readonly DivergenceFixtureId[] = ['sober', 'editorial'];
const ROUTES: readonly Route[] = ['dashboard', 'list', 'detail'];
const GROUNDS: readonly Ground[] = ['light', 'dark'];

const VIEWPORTS: Record<Viewport, { width: number; height: number }> = {
  desktop: { width: 1280, height: 900 },
  mobile: { width: 393, height: 852 },
};

const CROSS_TENANT_DASHBOARD_FLOOR = 0.25;
const STABILITY_CEILING = 0.01;

interface ProbePayload {
  slug: string;
  digest: string;
  compilerVersion: string;
  adjustments: unknown[];
  anatomy: Record<string, string>;
  variables: Record<string, string>;
}

interface ComputedReadings {
  titleFontFamily: string;
  bodyFontFamily: string;
  buttonBorderRadius: string;
  anatomyTable: string | null;
  anatomySidebar: string | null;
  anatomyCard: string | null;
  anatomyLayout: string | null;
  chartSeries1: string;
  typeScale: string;
  densityScale: string;
  rootBackground: string;
  colorScheme: string;
  /** Computed paint of the element backed by var(--ds-color-primary). */
  primaryPaint: string;
}

// --- repo paths -------------------------------------------------------------

function repoRoot(): string {
  let dir = test.info().project.testDir;
  while (!existsSync(join(dir, 'pnpm-workspace.yaml'))) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error('pnpm-workspace.yaml not found above testDir');
    dir = parent;
  }
  return dir;
}

const artifactDir = (): string => join(repoRoot(), 'test-artifacts', 'gates', 'w4-divergence');
const buildIdPath = (): string => join(repoRoot(), 'packages', 'showroom', '.next', 'BUILD_ID');

function readBuildId(): string {
  if (!existsSync(buildIdPath())) return '<missing>';
  return readFileSync(buildIdPath(), 'utf8').trim();
}

// --- page driving -----------------------------------------------------------

async function gotoDivergence(
  page: Page,
  fixture: DivergenceFixtureId,
  route: Route,
  ground: Ground,
  viewport: Viewport,
): Promise<void> {
  const slug = DIVERGENCE_FIXTURES[fixture].identity.slug;
  await page.setViewportSize(VIEWPORTS[viewport]);
  await page.emulateMedia({ colorScheme: ground });
  await page.goto(
    `/probe/whitelabel-divergence?fixture=${fixture}&route=${route}&ground=${ground}`,
    { waitUntil: 'networkidle' },
  );

  await page.waitForFunction(
    (expectedSlug: string) => {
      const root = document.querySelector('[data-testid="divergence-root"]');
      if (!root) return false;
      const probe = (window as Window & { __divergenceProbe?: { slug?: string } }).__divergenceProbe;
      if (!probe || probe.slug !== expectedSlug) return false;
      // The artifact style block must be mounted before any read/capture.
      if (!document.querySelector('[data-testid="divergence-artifact-style"]')) return false;
      return window
        .getComputedStyle(root)
        .getPropertyValue('--ds-chart-series-1')
        .trim()
        .length > 0;
    },
    slug,
    { timeout: 30_000 },
  );

  await page.evaluate(() => document.fonts.ready);
  // Charts/entrance settle window; reducedMotion is on, this absorbs the tail.
  await page.waitForTimeout(600);
}

async function readProbePayload(page: Page): Promise<ProbePayload> {
  const payload = await page.evaluate(
    () => (window as Window & { __divergenceProbe?: unknown }).__divergenceProbe,
  );
  if (!payload) throw new Error('window.__divergenceProbe missing after settle');
  return payload as ProbePayload;
}

async function readComputedStyles(page: Page): Promise<ComputedReadings> {
  return page.evaluate(() => {
    const root = document.querySelector('[data-testid="divergence-root"]');
    if (!root) throw new Error('divergence root missing');
    const rootStyle = window.getComputedStyle(root);

    const title = document.querySelector('[data-testid="divergence-title"] span, [data-testid="divergence-title"] *');
    const button = document.querySelector('[data-testid="divergence-primary-button"] button');
    // The swatch sits directly under the scope root: Layout.Sider pins
    // color-scheme light in the modern engine, so an in-sidebar element
    // resolves light-dark() to its light branch regardless of preference.
    const logo = document.querySelector('[data-testid="divergence-primary-swatch"]');
    if (!title || !button || !logo) throw new Error('divergence title/button/swatch probe elements missing');

    return {
      titleFontFamily: window.getComputedStyle(title).fontFamily,
      bodyFontFamily: window.getComputedStyle(root).fontFamily,
      buttonBorderRadius: window.getComputedStyle(button).borderTopLeftRadius,
      anatomyTable: root.getAttribute('data-anatomy-table'),
      anatomySidebar: root.getAttribute('data-anatomy-sidebar'),
      anatomyCard: root.getAttribute('data-anatomy-card'),
      anatomyLayout: root.getAttribute('data-anatomy-layout'),
      chartSeries1: rootStyle.getPropertyValue('--ds-chart-series-1').trim(),
      typeScale: rootStyle.getPropertyValue('--ds-type-scale').trim(),
      densityScale: rootStyle.getPropertyValue('--ds-density-scale').trim(),
      rootBackground: rootStyle.backgroundColor,
      colorScheme: rootStyle.colorScheme,
      primaryPaint: window.getComputedStyle(logo).backgroundColor,
    };
  });
}

async function measureSiderWidth(page: Page): Promise<number> {
  const sider = page.locator('[data-testid="divergence-root"] .rottay-layout-sider').first();
  const box = await sider.boundingBox();
  if (!box) throw new Error('sider not rendered');
  return box.width;
}

/**
 * Ratio of differing pixels between two same-viewport PNG captures, decoded
 * in the live browser via canvas ImageData (no native deps). Dimension
 * mismatch is a hard failure: it means the two captures are not comparable.
 */
async function pixelDiffRatio(page: Page, a: Buffer, b: Buffer): Promise<number> {
  return page.evaluate(
    async ({ aSrc, bSrc }: { aSrc: string; bSrc: string }) => {
      const load = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error('capture decode failed'));
          image.src = src;
        });
      const [imageA, imageB] = await Promise.all([load(aSrc), load(bSrc)]);
      if (
        imageA.naturalWidth !== imageB.naturalWidth ||
        imageA.naturalHeight !== imageB.naturalHeight
      ) {
        throw new Error(
          `capture dimensions differ: ${imageA.naturalWidth}x${imageA.naturalHeight} vs ${imageB.naturalWidth}x${imageB.naturalHeight}`,
        );
      }
      const width = imageA.naturalWidth;
      const height = imageA.naturalHeight;
      const readPixels = (image: HTMLImageElement) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('2d context unavailable');
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, width, height).data;
      };
      const dataA = readPixels(imageA);
      const dataB = readPixels(imageB);
      const total = width * height;
      let differing = 0;
      for (let pixel = 0; pixel < total; pixel += 1) {
        const offset = pixel * 4;
        if (
          Math.abs(dataA[offset] - dataB[offset]) > 12 ||
          Math.abs(dataA[offset + 1] - dataB[offset + 1]) > 12 ||
          Math.abs(dataA[offset + 2] - dataB[offset + 2]) > 12
        ) {
          differing += 1;
        }
      }
      return differing / total;
    },
    {
      aSrc: `data:image/png;base64,${a.toString('base64')}`,
      bSrc: `data:image/png;base64,${b.toString('base64')}`,
    },
  );
}

// --- suite ------------------------------------------------------------------

const captures = new Map<string, Buffer>();
const captureKey = (
  fixture: DivergenceFixtureId,
  route: Route,
  ground: Ground,
  viewport: Viewport,
): string => `${fixture}-${route}-${ground}-${viewport}`;

const computedByFixture = new Map<DivergenceFixtureId, ComputedReadings>();
const probeByFixture = new Map<DivergenceFixtureId, ProbePayload>();
const siderWidthByFixture = new Map<DivergenceFixtureId, number>();
const editorialGroundReadings = new Map<Ground, ComputedReadings>();
const stabilityRecaptures = new Map<DivergenceFixtureId, Buffer>();

let initialBuildId = '<unread>';

test.describe.configure({ mode: 'serial' });

test.describe('W4 divergence demo (wave exit)', () => {
  test.beforeAll(() => {
    initialBuildId = readBuildId();
    mkdirSync(artifactDir(), { recursive: true });
  });

  test('showroom fixture copies match the core source-of-truth modules', () => {
    expect(DIVERGENCE_FIXTURES.sober.document).toEqual(DIVERGENCE_SOBER_DOCUMENT);
    expect(DIVERGENCE_FIXTURES.sober.identity).toEqual(DIVERGENCE_SOBER_IDENTITY);
    expect(DIVERGENCE_FIXTURES.editorial.document).toEqual(DIVERGENCE_EDITORIAL_DOCUMENT);
    expect(DIVERGENCE_FIXTURES.editorial.identity).toEqual(DIVERGENCE_EDITORIAL_IDENTITY);
  });

  for (const fixture of FIXTURE_IDS) {
    test(`capture grid under ${fixture}`, async ({ page }) => {
      test.setTimeout(300_000);

      for (const viewport of ['desktop', 'mobile'] as const) {
        for (const route of ROUTES) {
          for (const ground of GROUNDS) {
            await gotoDivergence(page, fixture, route, ground, viewport);
            const key = captureKey(fixture, route, ground, viewport);
            const shot = await page.screenshot({ fullPage: false });
            captures.set(key, shot);
            await page.screenshot({
              path: join(artifactDir(), `${key}.png`),
              fullPage: true,
            });

            if (route === 'dashboard' && ground === 'light' && viewport === 'desktop') {
              probeByFixture.set(fixture, await readProbePayload(page));
              computedByFixture.set(fixture, await readComputedStyles(page));
              siderWidthByFixture.set(fixture, await measureSiderWidth(page));
            }
            if (fixture === 'editorial' && route === 'dashboard' && viewport === 'desktop') {
              editorialGroundReadings.set(ground, await readComputedStyles(page));
            }
          }
        }
      }

      // Stability recapture: fresh reload of the canonical cell.
      await gotoDivergence(page, fixture, 'dashboard', 'light', 'desktop');
      stabilityRecaptures.set(fixture, await page.screenshot({ fullPage: false }));
    });
  }

  test('per-tenant identity is stable across reloads', async ({ page }) => {
    for (const fixture of FIXTURE_IDS) {
      const first = captures.get(captureKey(fixture, 'dashboard', 'light', 'desktop'));
      const second = stabilityRecaptures.get(fixture);
      if (!first || !second) throw new Error(`${fixture} captures missing`);
      const ratio = await pixelDiffRatio(page, first, second);
      console.log(`[divergence] stability ${fixture} dashboard reload diff ratio: ${ratio.toFixed(5)}`);
      test.info().annotations.push({
        type: 'stability',
        description: `${fixture} dashboard reload diff ratio: ${ratio.toFixed(4)}`,
      });
      expect(
        ratio,
        `${fixture} is not stable across reloads — fix determinism before trusting the divergence floor`,
      ).toBeLessThan(STABILITY_CEILING);
    }
  });

  test('computed styles diverge on every asserted channel', () => {
    const sober = computedByFixture.get('sober');
    const editorial = computedByFixture.get('editorial');
    if (!sober || !editorial) throw new Error('computed readings missing');
    console.log(`[divergence] computed sober: ${JSON.stringify(sober)}`);
    console.log(`[divergence] computed editorial: ${JSON.stringify(editorial)}`);
    console.log(
      `[divergence] sider widths: sober=${siderWidthByFixture.get('sober')} editorial=${siderWidthByFixture.get('editorial')}`,
    );

    expect(sober.titleFontFamily).not.toBe(editorial.titleFontFamily);
    expect(sober.buttonBorderRadius).not.toBe(editorial.buttonBorderRadius);
    expect(sober.buttonBorderRadius).toBe('2px');

    expect(sober.anatomyTable).toBe('ruled');
    expect(editorial.anatomyTable).toBe('open');
    expect(sober.anatomyCard).toBe(DIVERGENCE_SOBER_EXPECTED_ANATOMY['data-anatomy-card']);
    expect(sober.anatomySidebar).toBe(DIVERGENCE_SOBER_EXPECTED_ANATOMY['data-anatomy-sidebar']);
    expect(sober.anatomyLayout).toBe(DIVERGENCE_SOBER_EXPECTED_ANATOMY['data-anatomy-layout']);
    expect(editorial.anatomyCard).toBe(DIVERGENCE_EDITORIAL_EXPECTED_ANATOMY['data-anatomy-card']);
    expect(editorial.anatomySidebar).toBe(DIVERGENCE_EDITORIAL_EXPECTED_ANATOMY['data-anatomy-sidebar']);
    expect(editorial.anatomyLayout).toBe(DIVERGENCE_EDITORIAL_EXPECTED_ANATOMY['data-anatomy-layout']);

    expect(sober.chartSeries1).not.toBe('');
    expect(editorial.chartSeries1).not.toBe('');
    expect(sober.chartSeries1).not.toBe(editorial.chartSeries1);

    expect(sober.typeScale).toBe('0.96');
    expect(editorial.typeScale).toBe('1.06');
    expect(sober.densityScale).toBe('0.92');
    expect(editorial.densityScale).toBe('1.08');

    const soberWidth = siderWidthByFixture.get('sober');
    const editorialWidth = siderWidthByFixture.get('editorial');
    if (soberWidth === undefined || editorialWidth === undefined) {
      throw new Error('sider width readings missing');
    }
    expect(soberWidth, 'rail must render materially narrower than panel').toBeLessThan(
      editorialWidth - 100,
    );
  });

  test('both artifacts compile with zero contrast adjustments', () => {
    for (const fixture of FIXTURE_IDS) {
      const probe = probeByFixture.get(fixture);
      if (!probe) throw new Error(`${fixture} probe payload missing`);
      expect(probe.adjustments, `${fixture} required APCA autocorrect`).toEqual([]);
      expect(probe.compilerVersion).toContain('tenant-theme-compiler');
    }
  });

  test('editorial dual-scheme emission flips the light-dark() primary', () => {
    const light = editorialGroundReadings.get('light');
    const dark = editorialGroundReadings.get('dark');
    if (!light || !dark) throw new Error('editorial ground readings missing');
    // var(--ds-color-primary) = light-dark(#A23B72, #D06A9F): the painted
    // element must resolve the authored seed per scheme, end to end.
    expect(light.primaryPaint).toBe('rgb(162, 59, 114)');
    expect(dark.primaryPaint).toBe('rgb(208, 106, 159)');
    // The CANVAS does not flip today: the bithire vertical baseline is
    // light-pinned and the default.css dark collapse is W6 scope. Recorded
    // as evidence, not asserted as divergence.
    console.log(
      `[divergence] editorial canvas per ground: light=${light.rootBackground} dark=${dark.rootBackground}`,
    );
  });

  test('the production bundle did not shift under the measurement', () => {
    const finalBuildId = readBuildId();
    expect(finalBuildId, 'BUILD_ID shifted mid-run — rebuild and re-measure').toBe(initialBuildId);
    expect(initialBuildId).not.toBe('<missing>');
  });

  // LAST deliberately: in serial mode a floor failure must not skip the
  // computed-style/adjustments/scheme evidence above — the floor is the
  // wave-exit judgment, the rest is the diagnosis that explains it.
  test('cross-tenant divergence clears the different-products floor', async ({ page }) => {
    const ratios: Record<string, number> = {};
    for (const viewport of ['desktop', 'mobile'] as const) {
      for (const route of ROUTES) {
        for (const ground of GROUNDS) {
          const sober = captures.get(captureKey('sober', route, ground, viewport));
          const editorial = captures.get(captureKey('editorial', route, ground, viewport));
          if (!sober || !editorial) throw new Error(`${route}/${ground}/${viewport} captures missing`);
          ratios[`${route}-${ground}-${viewport}`] = await pixelDiffRatio(page, sober, editorial);
        }
      }
    }

    const summary = Object.entries(ratios)
      .map(([key, value]) => `${key}=${value.toFixed(4)}`)
      .join(', ');
    console.log(`[divergence] cross-tenant ratios: ${summary}`);
    test.info().annotations.push({ type: 'cross-tenant-ratios', description: summary });

    expect(
      ratios['dashboard-light-desktop'],
      `dashboard cross-tenant pixel difference must clear ${CROSS_TENANT_DASHBOARD_FLOOR}`,
    ).toBeGreaterThanOrEqual(CROSS_TENANT_DASHBOARD_FLOOR);
  });
});
