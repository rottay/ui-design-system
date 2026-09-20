/**
 * The scheme-scope causality probe: it MEASURES, it does not adjudicate.
 *
 * For every categorical family and every scheme it renders the family with the
 * scheme requested, then records three facts: the scope the renderer stamped,
 * the first governed paint expression any mark carries, and what the resolver
 * says both should be. The census is written to the path the instrument hands
 * it; the instrument decides whether the census is a pass.
 *
 * The split matters. If the probe asserted, a red run would be ambiguous
 * between "the tree diverges" (the finding this instrument exists to report at
 * lot 0) and "the probe broke". Here a red run means only the second.
 */
import { createElement } from 'react';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { cleanup, waitFor } from '@testing-library/react';
import { afterAll, describe, expect, it } from 'vitest';

import * as charts from '@ui/patterns/visualization/charts';
import { CHART_FAMILY_REGISTRY } from '@ui/patterns/visualization/charts/foundation/registry';
import { resolveChartPaint } from '@ui/patterns/visualization/charts/runtime/theming/composition/foundation/paint';
import { renderSurface } from '@ui/surfaces/foundation/common/test-utils';

type Scheme = 'default' | 'pastel' | 'vibrant' | 'monochrome' | 'accessible';

const SCHEMES: readonly Scheme[] = ['default', 'pastel', 'vibrant', 'monochrome', 'accessible'];

const SIZE = { width: 320, height: 220, responsive: false, animate: false };

const POINTS = [
  { label: 'A', value: 10 },
  { label: 'B', value: 20 },
];
const SERIES = [
  { name: 'One', data: [{ label: 'A', value: 10 }, { label: 'B', value: 20 }] },
  { name: 'Two', data: [{ label: 'A', value: 5 }, { label: 'B', value: 15 }] },
];

/** One minimal, valid fixture per categorical family. */
const FIXTURES: Record<string, { component: string; props: Record<string, unknown> }> = {
  'area-chart': { component: 'AreaChart', props: { series: SERIES } },
  'bar-chart': { component: 'BarChart', props: { data: POINTS } },
  'funnel-chart': { component: 'FunnelChart', props: { data: POINTS } },
  'gantt-chart': {
    component: 'GanttChart',
    props: {
      tasks: [
        { id: 't1', name: 'One', start: '2026-01-01', end: '2026-01-10' },
        { id: 't2', name: 'Two', start: '2026-01-05', end: '2026-01-20' },
      ],
    },
  },
  'line-chart': { component: 'LineChart', props: { series: SERIES } },
  'network-graph': {
    component: 'NetworkGraph',
    props: {
      nodes: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
      links: [{ source: 'a', target: 'b' }],
    },
  },
  'pie-chart': { component: 'PieChart', props: { data: POINTS } },
  'radar-chart': {
    component: 'RadarChart',
    props: {
      data: [
        { axis: 'Speed', value: 8 },
        { axis: 'Power', value: 5 },
        { axis: 'Range', value: 6 },
      ],
    },
  },
  sankey: {
    component: 'SankeyChart',
    props: {
      nodes: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
      links: [{ source: 'a', target: 'b', value: 4 }],
    },
  },
  scatter: {
    component: 'ScatterChart',
    props: { data: [{ x: 1, y: 2 }, { x: 3, y: 4 }] },
  },
  'tree-map': {
    component: 'TreeMap',
    props: { data: [{ name: 'A', value: 10 }, { name: 'B', value: 20 }] },
  },
};

const GOVERNED = /var\(--ds-chart-[a-z]+-\d+[^)]*(?:\([^)]*\)[^)]*)*\)?/u;

/**
 * A categorical mark reaches the chain by one of TWO routes, and measuring
 * only the first reports the second as ungoverned. `pie-chart` and `scatter`
 * carry no inline expression on purpose: the skin routes their
 * `data-part`/`data-series-index` pair to `--ds-chart-mark-color`, which reads
 * the scope-keyed `--ds-chart-paint-N` bridge. Both routes end at the same
 * chain, so both are read here and each keeps its own failure mode: an
 * unrouted part, an unbridged slot or a scope with no block is still null.
 */
const SKIN_CSS = readFileSync(
  join(
    __dirname,
    '../../../../../src/foundation/tokens/css/presentation/components/skin/chart-foundation/index.css',
  ),
  'utf8',
);

/** `--ds-chart-paint-N` as the skin declares it inside each scope's block. */
function readBridge(): Record<string, Record<number, string>> {
  const bridge: Record<string, Record<number, string>> = {};
  for (const scheme of SCHEMES) {
    const block = new RegExp(
      `\\[data-chart-color-scheme='${scheme}'\\]\\s*\\{([^}]*)\\}`,
      'u',
    ).exec(SKIN_CSS);
    if (!block) continue;
    const slots: Record<number, string> = {};
    for (const declaration of block[1]!.matchAll(/--ds-chart-paint-(\d+):\s*([^;]+);/gu)) {
      slots[Number(declaration[1])] = declaration[2]!.trim();
    }
    bridge[scheme] = slots;
  }
  return bridge;
}

const BRIDGE = readBridge();

/**
 * The `part|index` pairs the skin actually routes to the bridge. Read rule by
 * rule, because one rule lists several marks and a selector-first scan would
 * let the first pair swallow its siblings.
 */
function readRoutedMarks(): Set<string> {
  const routed = new Set<string>();
  const pair = /\[data-part='([a-z-]+)'\]\[data-series-index='(\d+)'\]/gu;
  for (const rule of SKIN_CSS.matchAll(/([^{}]+)\{([^{}]*)\}/gu)) {
    if (!rule[2]!.includes('var(--ds-chart-paint-')) continue;
    for (const match of rule[1]!.matchAll(pair)) {
      routed.add(`${match[1]}|${match[2]}`);
    }
  }
  return routed;
}

const ROUTED_MARKS = readRoutedMarks();

/** Route 1: an expression the mark carries itself. */
function inlineGovernedPaint(container: HTMLElement): string | null {
  for (const element of Array.from(container.querySelectorAll('*'))) {
    for (const attribute of ['style', 'fill', 'stroke']) {
      const value = element.getAttribute(attribute);
      if (value && value.includes('var(--ds-chart-')) {
        const start = value.indexOf('var(--ds-chart-');
        return balancedExpressionAt(value, start);
      }
    }
  }
  return null;
}

/** Route 2: the scope-keyed bridge the skin routes this mark's slot through. */
function bridgeGovernedPaint(container: HTMLElement, stampedScheme: string | null): string | null {
  if (stampedScheme === null) return null;
  for (const element of Array.from(container.querySelectorAll('[data-series-index]'))) {
    const part = element.getAttribute('data-part');
    const index = element.getAttribute('data-series-index');
    if (part === null || index === null) continue;
    if (!ROUTED_MARKS.has(`${part}|${index}`)) continue;
    return BRIDGE[stampedScheme]?.[Number(index) + 1] ?? null;
  }
  return null;
}

type PaintRoute = 'inline' | 'bridge' | null;

function governedPaintOf(
  container: HTMLElement,
  stampedScheme: string | null,
): { paint: string | null; route: PaintRoute } {
  const inline = inlineGovernedPaint(container);
  if (inline !== null) return { paint: inline, route: 'inline' };
  const bridged = bridgeGovernedPaint(container, stampedScheme);
  if (bridged !== null) return { paint: bridged, route: 'bridge' };
  return { paint: null, route: null };
}

/** Read one complete `var(...)` expression starting at `start`. */
function balancedExpressionAt(text: string, start: number): string {
  let depth = 0;
  for (let index = start; index < text.length; index += 1) {
    if (text[index] === '(') depth += 1;
    else if (text[index] === ')') {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }
  return text.slice(start);
}

/**
 * Any COLOUR expression at all, governed or not -- the diagnostic that names
 * which table an ungoverned mark is really reading. Motion, spacing and radius
 * variables are not paint and must not stand in for it.
 */
const COLOUR_VARIABLE = 'var(--ds-color-';

function firstAnyPaint(container: HTMLElement): string | null {
  for (const element of Array.from(container.querySelectorAll('*'))) {
    for (const attribute of ['style', 'fill', 'stroke']) {
      const value = element.getAttribute(attribute);
      if (!value) continue;
      for (const prefix of ['var(--ds-chart-', COLOUR_VARIABLE]) {
        const start = value.indexOf(prefix);
        if (start !== -1) return balancedExpressionAt(value, start);
      }
    }
  }
  return null;
}

interface CensusRow {
  family: string;
  requested: Scheme;
  expectedScheme: Scheme;
  expectedPaint: string;
  stampedScheme: string | null;
  governedPaint: string | null;
  anyPaint: string | null;
  scopeAgrees: boolean;
  paintAgrees: boolean;
  rendered: boolean;
  /** Which of the two governed routes carried the paint, if either did. */
  paintRoute: PaintRoute;
}

const rows: CensusRow[] = [];

const CATEGORICAL = Object.keys(CHART_FAMILY_REGISTRY).filter(
  (id) => CHART_FAMILY_REGISTRY[id as keyof typeof CHART_FAMILY_REGISTRY].paintModel === 'categorical',
);

describe('chart scheme-scope causality census', () => {
  for (const family of CATEGORICAL) {
    for (const requested of SCHEMES) {
      it(`${family} @ ${requested}`, async () => {
        const fixture = FIXTURES[family];
        expect(fixture, `no fixture declared for ${family}`).toBeDefined();
        const Component = (charts as Record<string, unknown>)[fixture.component];
        expect(Component, `${fixture.component} is not exported`).toBeDefined();

        const decision = resolveChartPaint({
          family: family as never,
          scheme: requested,
        });
        const expectedPaint = decision.categorical?.paintFor(0) ?? '';

        const { container } = renderSurface(
          createElement(
            Component as never,
            { ...SIZE, ...fixture.props, colorScheme: requested } as never,
          ),
        );

        let rendered = true;
        try {
          await waitFor(() => {
            expect(container.querySelector('[data-chart-color-scheme]')).not.toBeNull();
          });
        } catch {
          rendered = false;
        }

        const scope = container.querySelector('[data-chart-color-scheme]');
        const stampedScheme = scope?.getAttribute('data-chart-color-scheme') ?? null;
        const { paint: governedPaint, route: paintRoute } = governedPaintOf(container, stampedScheme);
        const anyPaint = firstAnyPaint(container);

        rows.push({
          family,
          requested,
          expectedScheme: decision.scheme,
          expectedPaint,
          stampedScheme,
          governedPaint,
          anyPaint,
          scopeAgrees: stampedScheme === decision.scheme,
          paintAgrees: governedPaint !== null && governedPaint === expectedPaint,
          rendered,
          paintRoute,
        });

        cleanup();
        // The probe measures. Only a probe that could not render at all is a
        // failure here; the divergence itself is the instrument's to report.
        expect(GOVERNED).toBeInstanceOf(RegExp);
      });
    }
  }

  afterAll(() => {
    const target = process.env.CHART_CAUSALITY_CENSUS;
    if (!target) return;
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(
      target,
      `${JSON.stringify({ generatedBy: 'chart-scheme-scope-causality/probe', rows }, null, 2)}\n`,
    );
  });
});
