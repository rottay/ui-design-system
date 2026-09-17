/**
 * WO-INV-01 -- the selected-preset checkmark centring, MEASURED IN A REAL
 * BROWSER.
 *
 * PROJECT LABEL. This file runs in the vitest `integration` project, but the
 * geometry it asserts is NOT produced by that project's DOM runner: neither
 * happy-dom nor jsdom implements `:dir()`, inherits a custom property from an
 * ancestor rule, resolves `inset-inline-start` into a used edge, or lays a
 * pseudo-element out at all -- every assertion below would be vacuous there.
 * Each number comes from a real Chromium process driven by `--dump-dom`; the
 * runner only spawns it and reads the result back. The sibling
 * `ColorPicker.check-centring-direction.test.ts` says the same about the
 * simulated DOM and derives the cascade by hand instead.
 *
 * WHAT IT PROVES: the check's border box is centred on the swatch's inline
 * centre under `dir=ltr` AND under `dir=rtl`. Before the mirror, RTL measured
 * 12px on a 20px swatch (the check's whole border-box width), because the
 * skin's `inset-inline-start: 50%` anchored on the right edge while the
 * producer's `translate(-50%, ...)` kept pulling left.
 *
 * NO SILENT SKIP. If no Chromium binary is installed the test FAILS with the
 * override env var named. A missing browser is "not run", and "not run" must
 * never read as "passed".
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { beforeAll, describe, expect, it } from 'vitest';

import { findChromium } from '@checks/modern-rescue/cascade/probe/browser-analysis/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(HERE, '../../../../../..');
const PRODUCER = 'src/foundation/tokens/css/presentation/components/color-picker/index.css';
const SKIN = 'src/foundation/tokens/css/runtime/engines/modern/skin/color-picker/index.css';

/**
 * The foundation channels the two sheets read. Pinned here so the scene
 * measures the color-picker's own geometry and not a token drift elsewhere.
 */
const SCENE_ROOT = `:root {
  --ds-spacing-1: 4px;
  --ds-spacing-5: 20px;
  --ds-focus-ring-width: 2px;
  --ds-edge-hairline-width: 1px;
  --ds-radius-sm: 4px;
  --ds-color-border: #cccccc;
  --ds-color-white: #ffffff;
  --ds-color-neutral-900: #111111;
  --ds-input-transition-duration: 0s;
  --ds-input-transition-timing: linear;
  --ds-state-disabled-opacity: 0.5;
  --ds-touch-target-min: 44px;
}`;

interface ProbeRow {
  readonly direction: 'ltr' | 'rtl';
  readonly computedDirection: string;
  /** The check's border-box centre minus the swatch's inline centre, in px. */
  readonly offset: number;
  readonly checkWidth: number;
}

/**
 * The anatomy the modern engine stamps for a selected preset:
 * `partAttributes('preset-swatch', ...)` plus `data-selected`, inside the
 * panel's root class. Pinned against drift by the unit sibling.
 */
function scene(direction: 'ltr' | 'rtl'): string {
  return `<div dir="${direction}"><div class="ds-color-picker-panel ds-color-picker-panel--modern">
    <div data-part="preset-row">
      <button type="button" data-part="preset-swatch" data-selected="true" data-probe="${direction}"></button>
    </div>
  </div></div>`;
}

function buildPage(): string {
  const script = `
    const rows = ['ltr', 'rtl'].map((direction) => {
      const swatch = document.querySelector('[data-probe="' + direction + '"]');
      const rect = swatch.getBoundingClientRect();
      const own = getComputedStyle(swatch);
      const check = getComputedStyle(swatch, '::after');
      const matrix = /matrix\\(([^)]*)\\)/.exec(check.transform);
      const translateX = matrix ? Number(matrix[1].split(',')[4]) : NaN;
      // The pseudo's containing block is the swatch's padding box, and a
      // percentage translate resolves against the pseudo's BORDER box.
      const borderBoxWidth = parseFloat(check.width) + parseFloat(check.borderLeftWidth)
        + parseFloat(check.borderRightWidth);
      const centre = rect.left + parseFloat(own.borderLeftWidth) + parseFloat(check.left)
        + translateX + borderBoxWidth / 2;
      return {
        direction,
        computedDirection: own.direction,
        offset: Number((centre - (rect.left + rect.width / 2)).toFixed(3)),
        checkWidth: borderBoxWidth,
      };
    });
    document.documentElement.setAttribute('data-probe-result', JSON.stringify(rows));
  `;

  const workspace = mkdtempSync(join(tmpdir(), 'ds-color-picker-check-'));
  const page = join(workspace, 'index.html');
  writeFileSync(
    page,
    [
      '<!doctype html><html><head><meta charset="utf-8"><style>',
      SCENE_ROOT,
      readFileSync(join(PACKAGE_ROOT, PRODUCER), 'utf8'),
      readFileSync(join(PACKAGE_ROOT, SKIN), 'utf8'),
      '</style></head><body>',
      scene('ltr'),
      scene('rtl'),
      `<script>${script}<\/script>`,
      '</body></html>',
    ].join('\n'),
    'utf8',
  );
  return page;
}

function measure(binary: string, page: string): ProbeRow[] {
  const dom = execFileSync(
    binary,
    ['--headless', '--disable-gpu', '--no-sandbox', '--virtual-time-budget=5000', '--dump-dom', `file://${page}`],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] },
  );
  const match = /data-probe-result="([^"]*)"/.exec(dom);
  if (!match) {
    throw new Error('the scene never reported a measurement; the page did not render');
  }
  const decoded = match[1]!
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  return JSON.parse(decoded) as ProbeRow[];
}

describe('ColorPicker selected-check centring in Chromium', () => {
  let rows: Map<string, ProbeRow>;

  beforeAll(() => {
    const binary = findChromium();
    if (!binary) {
      throw new Error(
        'no Chromium binary found; install one or point CASCADE_PROBE_CHROMIUM at it. A missing browser is not a pass.',
      );
    }
    rows = new Map(measure(binary, buildPage()).map((row) => [row.direction, row]));
  }, 120000);

  it('centres the check on the swatch under dir=ltr', () => {
    const row = rows.get('ltr')!;
    expect(row.computedDirection).toBe('ltr');
    expect(Math.abs(row.offset)).toBeLessThanOrEqual(0.5);
  });

  it('centres the check on the swatch under dir=rtl', () => {
    const row = rows.get('rtl')!;
    expect(row.computedDirection).toBe('rtl');
    // Before the mirror this measured 12px off-centre (one full check width).
    expect(Math.abs(row.offset)).toBeLessThanOrEqual(0.5);
  });

  it('draws the same glyph in both directions', () => {
    expect(rows.get('rtl')!.checkWidth).toBe(rows.get('ltr')!.checkWidth);
    expect(rows.get('ltr')!.checkWidth).toBeGreaterThan(0);
  });
});
