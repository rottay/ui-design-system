/**
 * WO-INV-01 clause 4 -- icon RTL mirroring, MEASURED IN A REAL BROWSER.
 *
 * PROJECT LABEL. This file runs in the vitest `integration` project, but the
 * transform it asserts is NOT produced by that project's DOM runner:
 * happy-dom and jsdom do not implement the `:dir()` pseudo-class and do not
 * resolve a matched rule into a computed `transform` matrix, so a simulated
 * DOM would report `none` for both directions and the assertion would be
 * vacuous. Every matrix below comes from a real Chromium process driven by
 * `--dump-dom`; the runner only spawns it and reads the result back. The
 * sibling suites that measure in the simulated DOM say so themselves
 * (`Icon.test.tsx`, `unit`, happy-dom: the stamped attribute and the CSS text).
 *
 * WHAT IT PROVES, on markup rendered by the real components:
 *   - a semantic icon whose corpus row is `autoMirror: true` computes
 *     `matrix(-1, 0, 0, 1, 0, 0)` under `dir="rtl"` and `none` under `ltr`;
 *   - a semantic icon that does not mirror computes `none` in both;
 *   - a LEGACY compatibility export (`ArrowLeftIcon`), which carries only the
 *     `rottay-icon` class, mirrors the same way -- the attribute-only rule in
 *     the icon skin reaches it;
 *   - a non-directional legacy export (`ArrowUpIcon`) computes `none` in both.
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

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';

import { findChromium } from '@checks/modern-rescue/cascade/probe/browser-analysis/index.mjs';

import { Undo2Icon, WorkflowIcon } from '../../../../glyphs/presentation/catalog/compatibility';
import { ArrowLeftIcon, ArrowUpIcon } from '../../../../glyphs/presentation/catalog/navigation';
import { Icon } from '..';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(HERE, '../../../../../../..');
const ICON_SKIN = 'src/foundation/tokens/css/presentation/components/semantic-icon/index.css';

const MIRRORED_MATRIX = 'matrix(-1, 0, 0, 1, 0, 0)';

interface ProbeRow {
  readonly id: string;
  readonly ltr: string;
  readonly rtl: string;
  readonly mirroredAttribute: string | null;
}

function buildPage(): string {
  const probes = [
    ['semantic-auto', renderToStaticMarkup(createElement(Icon, { name: 'navigation.back', decorative: true }))],
    ['semantic-static', renderToStaticMarkup(createElement(Icon, { name: 'status.success', decorative: true }))],
    ['legacy-directional', renderToStaticMarkup(createElement(ArrowLeftIcon, {}))],
    ['legacy-static', renderToStaticMarkup(createElement(ArrowUpIcon, {}))],
    ['legacy-renamed', renderToStaticMarkup(createElement(Undo2Icon, {}))],
    ['legacy-frozen', renderToStaticMarkup(createElement(WorkflowIcon, {}))],
  ] as const;

  const scene = (direction: 'ltr' | 'rtl'): string =>
    `<div dir="${direction}">${probes
      .map(([id, markup]) => `<span data-probe="${direction}:${id}">${markup}</span>`)
      .join('')}</div>`;

  const script = `
    const rows = ${JSON.stringify(probes.map(([id]) => id))}.map((id) => {
      const read = (direction) => {
        const host = document.querySelector('[data-probe="' + direction + ':' + id + '"]');
        const svg = host.querySelector('svg');
        return { transform: getComputedStyle(svg).transform, mirrored: svg.getAttribute('data-icon-mirrored') };
      };
      const ltr = read('ltr');
      const rtl = read('rtl');
      return { id, ltr: ltr.transform, rtl: rtl.transform, mirroredAttribute: ltr.mirrored };
    });
    document.documentElement.setAttribute('data-probe-result', JSON.stringify(rows));
  `;

  const workspace = mkdtempSync(join(tmpdir(), 'ds-icon-mirroring-'));
  const page = join(workspace, 'index.html');
  writeFileSync(
    page,
    [
      '<!doctype html><html><head><meta charset="utf-8">',
      `<style>${readFileSync(join(PACKAGE_ROOT, ICON_SKIN), 'utf8')}</style>`,
      '</head><body>',
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

describe('icon RTL mirroring in Chromium', () => {
  let rows: Map<string, ProbeRow>;

  beforeAll(() => {
    const binary = findChromium();
    if (!binary) {
      throw new Error(
        'no Chromium binary found; install one or point CASCADE_PROBE_CHROMIUM at it. A missing browser is not a pass.',
      );
    }
    rows = new Map(measure(binary, buildPage()).map((row) => [row.id, row]));
  }, 120000);

  it('mirrors a semantic icon whose corpus row declares auto mirroring', () => {
    const row = rows.get('semantic-auto')!;
    expect(row.mirroredAttribute).toBe('auto');
    expect(row.ltr).toBe('none');
    expect(row.rtl).toBe(MIRRORED_MATRIX);
  });

  it('leaves a non-directional semantic icon unmirrored in both directions', () => {
    const row = rows.get('semantic-static')!;
    expect(row.mirroredAttribute).toBe('false');
    expect(row.ltr).toBe('none');
    expect(row.rtl).toBe('none');
  });

  it('mirrors a directional legacy compatibility export through the attribute-only rule', () => {
    const row = rows.get('legacy-directional')!;
    expect(row.mirroredAttribute).toBe('auto');
    expect(row.ltr).toBe('none');
    expect(row.rtl).toBe(MIRRORED_MATRIX);
  });

  it('leaves a non-directional legacy export unmirrored in both directions', () => {
    const row = rows.get('legacy-static')!;
    expect(row.mirroredAttribute).toBeNull();
    expect(row.ltr).toBe('none');
    expect(row.rtl).toBe('none');
  });

  it('mirrors a legacy export whose name hides its directional supplier', () => {
    // Undo2Icon is drawn by ArrowUUpLeft. Keying the decision on the export
    // name left this glyph flat under RTL while its semantic twin mirrored.
    const row = rows.get('legacy-renamed')!;
    expect(row.mirroredAttribute).toBe('auto');
    expect(row.ltr).toBe('none');
    expect(row.rtl).toBe(MIRRORED_MATRIX);
  });

  it('leaves a frozen-prefix legacy export unmirrored, matching its semantic twin', () => {
    // WorkflowIcon is drawn by FlowArrow, which owes a mirror; its corpus row
    // system.workflow sits in the fingerprinted v4 prefix and stays unflagged.
    const row = rows.get('legacy-frozen')!;
    expect(row.mirroredAttribute).toBeNull();
    expect(row.ltr).toBe('none');
    expect(row.rtl).toBe('none');
  });
});
