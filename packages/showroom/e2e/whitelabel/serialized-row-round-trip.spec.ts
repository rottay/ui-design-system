import { createHash } from 'node:crypto';
import { expect, test, type Page, type Route } from '@playwright/test';

import {
  DIVERGENCE_FIXTURES,
  type DivergenceFixtureId,
} from '../../src/components/divergence-surface/fixtures';
import {
  encodeTenantThemeRow as encodeShowroomRow,
  tenantThemeRowOf as showroomRowOf,
} from '../../src/components/probe-ground/row/index.mjs';
import {
  encodeTenantThemeRow,
  TENANT_THEME_ROW_ENCODINGS,
  tenantThemeRowOf,
  type TenantThemeRowEncoding,
} from '../../../core/tests/support/tenant-theme-row';
import { expectHydrated } from '../support/hydration';

// ---------------------------------------------------------------------------
// WO-ARC-21 (DS-side) — a tenant read back from serialized ROW BYTES reaches
// the first paint exactly as the static path does.
//
// THE ROUTE. `/probe/whitelabel-divergence`, the W4 wave-exit probe, with and
// without `?row=json|jsonb`. Without it the page compiles the in-memory
// fixture (the static path the W4 certification photographs). With it the
// fixture is written to one row's bytes and only those bytes, plus the
// request's trusted identity, reach hydrate -> compile -> mount.
//
// WHAT IS COMPARED, and where:
//   1. the SERVED BYTES, with no browser: the tenant <style> element and the
//      root stamp of the row response are byte-identical to the static
//      response's, and the row response names the sha256 of the bytes it read,
//      which this spec recomputes from the core fixture with the core codec;
//   2. the FIRST PAINT, with the framework's chunks held so React cannot
//      hydrate: computed styles and the root projection are equal and the
//      viewport capture is pixel-identical;
//   3. after hydration the client admits the same artifact digest.
//
// The design system reads no database: the bytes are the boundary. The planted
// mutants (a changed byte, a changed column, a malformed row) live in
// core's `tests/integration/transport-parity/drill` and in
// `e2e/diagnostics/probe-ground-row.unit.test.mjs`; this file is the paint leg.
// ---------------------------------------------------------------------------

const PROBE = '/probe/whitelabel-divergence';
const FIXTURE_IDS: readonly DivergenceFixtureId[] = ['sober', 'editorial'];
const VIEWPORT = { width: 1280, height: 900 };
const EXPECTED_TYPE_SCALE: Record<DivergenceFixtureId, string> = { sober: '0.96', editorial: '1.06' };

const STYLE_ELEMENT = /<style[^>]*data-testid="divergence-artifact-style"[^>]*>[\s\S]*?<\/style>/g;
const STAMP_ELEMENT = /<script data-testid="divergence-stamp"([^>]*)>([\s\S]*?)<\/script>/;

const probeUrl = (fixture: DivergenceFixtureId, row: TenantThemeRowEncoding | null): string =>
  `${PROBE}?fixture=${fixture}&route=dashboard&ground=light${row ? `&row=${row}` : ''}`;

const rowBytes = (fixture: DivergenceFixtureId, encoding: TenantThemeRowEncoding): Uint8Array =>
  encodeTenantThemeRow(
    tenantThemeRowOf(DIVERGENCE_FIXTURES[fixture].document, DIVERGENCE_FIXTURES[fixture].identity),
    encoding,
  );

interface ServedMount {
  /** The whole tenant <style> element: proof attributes and css bytes. */
  style: string;
  stampAttributes: string;
  stampScript: string;
}

function servedMount(html: string, label: string): ServedMount {
  const styles = html.match(STYLE_ELEMENT) ?? [];
  expect(styles, `${label} must serve exactly one tenant <style>`).toHaveLength(1);
  const stamp = STAMP_ELEMENT.exec(html);
  if (!stamp) throw new Error(`${label} served no root stamp`);
  return { style: styles[0]!, stampAttributes: stamp[1]!, stampScript: stamp[2]! };
}

interface FirstPaint {
  root: Record<string, string>;
  readings: Record<string, string | null>;
  capture: Buffer;
}

/** Hold the framework's chunks; the returned callback lets them through. */
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

async function firstPaint(page: Page, url: string): Promise<FirstPaint> {
  await page.goto(url, { waitUntil: 'commit' });
  await page.locator('[data-testid="divergence-root"]').waitFor({ state: 'attached' });
  await page.waitForFunction(() =>
    [...document.querySelectorAll('link[rel="stylesheet"]')].every(
      (link) => (link as HTMLLinkElement).sheet !== null,
    ),
  );
  await page.evaluate(() => document.fonts.ready);

  const state = await page.evaluate(() => {
    const expando = (node: object, prefix: string): boolean =>
      Object.keys(node).some((name) => name.startsWith(prefix));
    const root = document.querySelector('[data-testid="divergence-root"]');
    const title = document.querySelector('[data-testid="divergence-title"] *');
    const button = document.querySelector('[data-testid="divergence-primary-button"] button');
    const swatch = document.querySelector('[data-testid="divergence-primary-swatch"]');
    if (!root || !title || !button || !swatch) throw new Error('divergence probe elements missing');
    const rootStyle = window.getComputedStyle(root);
    return {
      hydrated:
        expando(document, '__reactContainer$') ||
        (window as Window & { __divergenceProbe?: unknown }).__divergenceProbe !== undefined,
      root: Object.fromEntries(
        [...document.documentElement.attributes].map((attribute) => [attribute.name, attribute.value]),
      ),
      readings: {
        titleFontFamily: window.getComputedStyle(title).fontFamily,
        bodyFontFamily: rootStyle.fontFamily,
        buttonBorderRadius: window.getComputedStyle(button).borderTopLeftRadius,
        primaryPaint: window.getComputedStyle(swatch).backgroundColor,
        rootBackground: rootStyle.backgroundColor,
        chartSeries1: rootStyle.getPropertyValue('--ds-chart-series-1').trim(),
        typeScale: rootStyle.getPropertyValue('--ds-type-scale').trim(),
        densityScale: rootStyle.getPropertyValue('--ds-density-scale').trim(),
        anatomyTable: root.getAttribute('data-anatomy-table'),
        anatomySidebar: root.getAttribute('data-anatomy-sidebar'),
        scopeTenant: root.getAttribute('data-tenant'),
      },
    };
  });
  expect(state.hydrated, `${url} hydrated before the first-paint measurement`).toBe(false);
  return { root: state.root, readings: state.readings, capture: await page.screenshot({ fullPage: false }) };
}

/** Differing pixels between two same-viewport captures, decoded in the page; any channel delta counts. */
async function differingPixels(page: Page, a: Buffer, b: Buffer): Promise<number> {
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
      if (imageA.naturalWidth !== imageB.naturalWidth || imageA.naturalHeight !== imageB.naturalHeight) {
        throw new Error('capture dimensions differ');
      }
      const pixels = (image: HTMLImageElement) => {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('2d context unavailable');
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, canvas.width, canvas.height).data;
      };
      const dataA = pixels(imageA);
      const dataB = pixels(imageB);
      let differing = 0;
      for (let offset = 0; offset < dataA.length; offset += 4) {
        if (
          dataA[offset] !== dataB[offset] ||
          dataA[offset + 1] !== dataB[offset + 1] ||
          dataA[offset + 2] !== dataB[offset + 2]
        ) {
          differing += 1;
        }
      }
      return differing;
    },
    {
      aSrc: `data:image/png;base64,${a.toString('base64')}`,
      bSrc: `data:image/png;base64,${b.toString('base64')}`,
    },
  );
}

async function admittedDigest(page: Page, slug: string): Promise<string> {
  await expectHydrated(page);
  await page.waitForFunction(
    (expected: string) =>
      (window as Window & { __divergenceProbe?: { slug?: string } }).__divergenceProbe?.slug === expected,
    slug,
    { timeout: 30_000 },
  );
  return page.evaluate(
    () => (window as Window & { __divergenceProbe?: { digest: string } }).__divergenceProbe!.digest,
  );
}

test.describe.configure({ mode: 'serial' });

test.describe('serialized row round-trip to first paint (WO-ARC-21, DS-side)', () => {
  const staticStyles = new Map<DivergenceFixtureId, string>();
  const staticCaptures = new Map<DivergenceFixtureId, Buffer>();

  test('the showroom row codec emits the bytes of the core codec, in two distinct encodings', () => {
    for (const fixture of FIXTURE_IDS) {
      const { document, identity } = DIVERGENCE_FIXTURES[fixture];
      const [json, jsonb] = TENANT_THEME_ROW_ENCODINGS.map((encoding) => {
        const core = Buffer.from(rowBytes(fixture, encoding));
        const showroom = Buffer.from(encodeShowroomRow(showroomRowOf(document, identity), encoding));
        expect(showroom.equals(core), `${fixture} ${encoding} codecs drifted`).toBe(true);
        return core;
      });
      expect(json!.equals(jsonb!), `${fixture}: jsonb must reorder the row`).toBe(false);
    }
  });

  for (const fixture of FIXTURE_IDS) {
    test(`${fixture}: the served <style> and root stamp are the static path's bytes`, async ({ request, baseURL }) => {
      const staticResponse = await request.get(`${baseURL}${probeUrl(fixture, null)}`);
      expect(staticResponse.status()).toBe(200);
      const fromStatic = servedMount(await staticResponse.text(), `${fixture} static`);
      expect(fromStatic.stampAttributes, 'the static path reads no row').not.toContain('data-row-');
      expect(fromStatic.style).toMatch(/data-ds-tenant-theme-digest="sha256-[0-9a-f]{64}"/);
      expect(fromStatic.style).toContain(`data-ds-tenant-theme-slug="${DIVERGENCE_FIXTURES[fixture].identity.slug}"`);
      expect(fromStatic.style.length, 'the artifact must carry css').toBeGreaterThan(1000);
      staticStyles.set(fixture, fromStatic.style);

      for (const encoding of TENANT_THEME_ROW_ENCODINGS) {
        const response = await request.get(`${baseURL}${probeUrl(fixture, encoding)}`);
        expect(response.status()).toBe(200);
        const fromRow = servedMount(await response.text(), `${fixture} ${encoding}`);
        const bytes = rowBytes(fixture, encoding);

        // The page states which bytes it read; the spec recomputes them from the core fixture.
        expect(fromRow.stampAttributes).toContain(`data-row-encoding="${encoding}"`);
        expect(fromRow.stampAttributes).toContain(`data-row-bytes="${bytes.byteLength}"`);
        expect(fromRow.stampAttributes).toContain(
          `data-row-sha256="${createHash('sha256').update(bytes).digest('hex')}"`,
        );

        expect(fromRow.style === fromStatic.style, `${fixture} ${encoding}: tenant <style> bytes differ`).toBe(true);
        expect(fromRow.stampScript).toBe(fromStatic.stampScript);
      }
    });
  }

  test('the two rows are two tenants: their served styles differ', () => {
    expect(staticStyles.size).toBe(FIXTURE_IDS.length);
    expect(staticStyles.get('sober')).not.toBe(staticStyles.get('editorial'));
  });

  for (const fixture of FIXTURE_IDS) {
    test(`${fixture}: the row paints the static first frame before hydration, then admits the same artifact`, async ({ page }) => {
      test.setTimeout(180_000);
      await page.setViewportSize(VIEWPORT);
      await page.emulateMedia({ colorScheme: 'light' });
      const slug = DIVERGENCE_FIXTURES[fixture].identity.slug;

      let release = await holdHydration(page);
      const fromStatic = await firstPaint(page, probeUrl(fixture, null));
      // The artifact, not the bithire baseline, is what painted this frame.
      expect(fromStatic.readings.typeScale).toBe(EXPECTED_TYPE_SCALE[fixture]);
      expect(fromStatic.readings.scopeTenant).toBe(slug);
      expect(fromStatic.root['data-tenant']).toBe(slug);
      staticCaptures.set(fixture, fromStatic.capture);
      release();
      const staticDigest = await admittedDigest(page, slug);
      expect(staticDigest).toMatch(/^sha256-[0-9a-f]{64}$/);
      await page.unroute('**/_next/static/chunks/**');

      for (const encoding of TENANT_THEME_ROW_ENCODINGS) {
        release = await holdHydration(page);
        const fromRow = await firstPaint(page, probeUrl(fixture, encoding));
        expect(fromRow.root, `${fixture} ${encoding}: root projection`).toEqual(fromStatic.root);
        expect(fromRow.readings, `${fixture} ${encoding}: computed styles`).toEqual(fromStatic.readings);
        const differing = await differingPixels(page, fromStatic.capture, fromRow.capture);
        console.log(`[row-round-trip] ${fixture} ${encoding} first-paint differing pixels: ${differing}`);
        expect(differing, `${fixture} ${encoding}: first paint differs from the static path`).toBe(0);
        release();
        expect(await admittedDigest(page, slug)).toBe(staticDigest);
        await page.unroute('**/_next/static/chunks/**');
      }
    });
  }

  test('the pixel comparison has teeth: the two tenants paint different first frames', async ({ page }) => {
    const sober = staticCaptures.get('sober');
    const editorial = staticCaptures.get('editorial');
    if (!sober || !editorial) throw new Error('static first-paint captures missing');
    await page.goto('about:blank');
    const differing = await differingPixels(page, sober, editorial);
    console.log(`[row-round-trip] sober vs editorial first-paint differing pixels: ${differing}`);
    expect(differing).toBeGreaterThan(VIEWPORT.width * VIEWPORT.height * 0.05);
  });
});
