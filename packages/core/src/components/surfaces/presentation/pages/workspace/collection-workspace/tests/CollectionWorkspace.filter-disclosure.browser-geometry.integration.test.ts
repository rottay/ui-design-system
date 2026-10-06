/**
 * The collection workspace's filter disclosure, MEASURED IN A REAL BROWSER.
 *
 * Every number comes from a real Chromium process driven by `--dump-dom`
 * (the `OverlayPlacement.browser-geometry` technique): the scene bundles with
 * the workspace's esbuild, loads the gate-checked rottay vertical bundle and
 * measures itself. happy-dom and jsdom do not lay out, so no assertion here is
 * made against simulated-DOM geometry.
 *
 * WHAT IT PROVES. The disclosure mounts beside the workspace root, never
 * inside it, so a rule scoped under `.ds-surface.ds-collection-workspace`
 * never reaches its action row; that is how the Cancel/Apply row came to sit
 * flush (0 px) against the last filter control. The row's spacing is scoped to
 * the disclosure's own content box: in both layouts the row clears the last
 * control by exactly the `--ds-spacing-md` channel, the rule matches that one
 * row and nothing in the desktop (inline) or phone (sheet) postures.
 *
 * NO SILENT SKIP. A missing Chromium fails with the override env var named.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { beforeAll, describe, expect, it } from 'vitest';

import { findChromium } from '@checks/modern-rescue/cascade/probe/browser-analysis/index.mjs';

import type { DisclosureProbeResult } from './fixtures/filter-disclosure-scene';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(HERE, '../../../../../../../..');
const SCENE = join(HERE, 'fixtures/filter-disclosure-scene/index.tsx');
const ESBUILD = join(PACKAGE_ROOT, 'node_modules/.bin/esbuild');
const STYLES = join(PACKAGE_ROOT, 'artifacts/generated/css/verticals/rottay/index.css');
/** Sub-pixel tolerance: Chromium lays out in fractional px. */
const TOLERANCE_PX = 1;

const WINDOWS = { tablet: '820,1180', desktop: '1440,1000', phone: '390,844' } as const;

type Layout = 'premium' | 'plain';

/** One page per layout: the page declares its variant on `<html data-probe-layout>`. */
function buildPages(): Record<Layout, string> {
  const workspace = mkdtempSync(join(tmpdir(), 'ds-filter-disclosure-'));
  const bundle = join(workspace, 'scene.js');
  execFileSync(
    ESBUILD,
    [
      SCENE,
      '--bundle',
      '--format=iife',
      '--jsx=automatic',
      '--loader:.css=text',
      '--loader:.woff2=empty',
      '--loader:.woff=empty',
      `--alias:@=${join(PACKAGE_ROOT, 'src')}`,
      '--define:process.env.NODE_ENV="production"',
      '--log-level=error',
      `--outfile=${bundle}`,
    ],
    { stdio: 'pipe' },
  );
  const styles = readFileSync(STYLES, 'utf8');
  const pages = {} as Record<Layout, string>;
  for (const layout of ['premium', 'plain'] as const) {
    const page = join(workspace, `${layout}.html`);
    writeFileSync(
      page,
      [
        `<!doctype html><html data-probe-layout="${layout}"><head><meta charset="utf-8">`,
        '<style>body { margin: 0; }</style>',
        `<style>${styles}</style>`,
        '</head><body><div id="root"></div>',
        '<script src="./scene.js"></script>',
        '</body></html>',
      ].join('\n'),
      'utf8',
    );
    pages[layout] = page;
  }
  return pages;
}

function measure(
  binary: string,
  pages: Record<Layout, string>,
  layout: Layout,
  posture: keyof typeof WINDOWS,
): DisclosureProbeResult {
  const dom = execFileSync(
    binary,
    [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      `--window-size=${WINDOWS[posture]}`,
      '--virtual-time-budget=8000',
      '--dump-dom',
      `file://${pages[layout]}`,
    ],
    { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] },
  );
  const match = /data-probe-result="([^"]*)"/.exec(dom);
  if (!match) throw new Error(`the scene never reported a measurement (${layout}, ${posture})`);
  return JSON.parse(match[1]!.replace(/&quot;/g, '"').replace(/&amp;/g, '&')) as DisclosureProbeResult;
}

describe('collection workspace filter disclosure -- real-browser geometry', () => {
  let binary: string;
  let pages: Record<Layout, string>;

  beforeAll(() => {
    const found = findChromium();
    if (!found) {
      throw new Error('no Chromium binary found; set CASCADE_PROBE_CHROMIUM to run this geometry suite');
    }
    binary = found;
    pages = buildPages();
  }, 120_000);

  it.each(['premium', 'plain'] as const)(
    'spaces the action row from the last filter control by the governed gap (%s layout)',
    (layout) => {
      const result = measure(binary, pages, layout, 'tablet');
      expect(result.opened, 'the tablet posture opens the anchored disclosure').toBe(true);
      expect(result.surfaceBackground, 'the skin painted the surface').not.toBe('rgba(0, 0, 0, 0)');
      expect(result.actionsUnderWorkspaceRoot, 'the disclosure mounts beside the workspace root').toBe(false);
      expect(result.matchesRootScopedSelector).toBe(false);
      expect(result.matchesActionsSelector).toBe(true);
      expect(result.spacingMdPx).toBeGreaterThan(0);
      expect(Math.abs((result.controlToActionsGap ?? 0) - result.spacingMdPx)).toBeLessThanOrEqual(TOLERANCE_PX);
      expect(Math.abs((result.panelToActionsGap ?? 0) - result.spacingMdPx)).toBeLessThanOrEqual(TOLERANCE_PX);
      expect(result.censusActionsSelector).toBe(1);
    },
    60_000,
  );

  it.each(['desktop', 'phone'] as const)(
    'matches nothing outside the opened disclosure (%s posture)',
    (posture) => {
      for (const layout of ['premium', 'plain'] as const) {
        const result = measure(binary, pages, layout, posture);
        expect(result.censusActionsSelector, `${layout} ${posture}`).toBe(0);
        expect(result.censusRootScopedSelector, `${layout} ${posture}`).toBe(0);
      }
    },
    60_000,
  );
});
