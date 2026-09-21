import React from 'react';
import { describe, expect, it } from 'vitest';

import { SankeyChart } from '..';
import type { ChartColorScheme } from '../../../contracts';
import { resolveChartSeriesPaint } from '../../../runtime/chart-engine/foundation/grammar/palette';
import {
  CHART_CATEGORICAL_SIZE,
  materializeChartPaint,
  resolveChartPaint,
} from '../../../runtime/theming/composition/foundation/paint';
import { renderSurface } from '../../../../../../surfaces/foundation/common/test-utils';

const SCHEMES = ['accessible', 'default', 'monochrome', 'pastel', 'vibrant'] as const;

/** One past the vocabulary, so the wrap is observed rather than assumed. */
const NODES = Array.from({ length: CHART_CATEGORICAL_SIZE + 1 }, (_, index) => ({
  id: `stage-${index}`,
  label: `Stage ${index + 1}`,
}));

const LINKS = NODES.slice(0, -1).map((node, index) => ({
  source: node.id,
  target: `stage-${index + 1}`,
  value: 120 - index * 8,
}));

function fillsOf(container: HTMLElement): (string | null)[] {
  return [...container.querySelectorAll('[data-part="node-mark"]')]
    .map((mark) => mark.getAttribute('fill'));
}

function renderWithScheme(colorScheme?: ChartColorScheme, extra: Record<string, unknown> = {}) {
  return renderSurface(
    <SankeyChart
      nodes={NODES}
      links={LINKS}
      width={640}
      height={480}
      responsive={false}
      animate={false}
      {...(colorScheme === undefined ? {} : { colorScheme })}
      {...extra}
    />,
  );
}

describe('SankeyChart governed colorScheme input', () => {
  it('selects each scheme own twelve-slot table', () => {
    for (const scheme of SCHEMES) {
      const palette = resolveChartSeriesPaint(scheme);
      const { container, unmount } = renderWithScheme(scheme);

      expect(fillsOf(container), scheme).toEqual(
        NODES.map((_, index) => palette[index % CHART_CATEGORICAL_SIZE]),
      );
      unmount();
    }
  });

  // Distinct tables are what make the input observable at all: a scheme that
  // resolved to the same expressions as another would be an inert prop.
  it('gives the five schemes five distinct slot-1 expressions', () => {
    const slotOne = SCHEMES.map((scheme) => {
      const { container, unmount } = renderWithScheme(scheme);
      const fill = fillsOf(container)[0];
      unmount();
      return fill;
    });

    expect(new Set(slotOne).size).toBe(SCHEMES.length);
  });

  it('reaches boundary slots 9, 10, 11 and 12, then wraps on the thirteenth', () => {
    const palette = resolveChartSeriesPaint('vibrant');
    const { container } = renderWithScheme('vibrant');
    const fills = fillsOf(container);

    for (const slot of [9, 10, 11, 12]) {
      expect(fills[slot - 1], `slot ${slot}`).toBe(palette[slot - 1]);
    }
    expect(new Set(fills.slice(0, CHART_CATEGORICAL_SIZE)).size).toBe(CHART_CATEGORICAL_SIZE);
    expect(fills[CHART_CATEGORICAL_SIZE]).toBe(fills[0]);
  });

  it('stamps the resolved scheme on the renderer root so the skin bridge agrees', () => {
    const { container } = renderWithScheme('monochrome');

    expect(
      container.querySelector('[data-chart-color-scheme]')
        ?.getAttribute('data-chart-color-scheme'),
    ).toBe('monochrome');
  });

  // A link inherits its source node's colour, so the scheme must reach the
  // flow paths and not only the node rectangles.
  it('carries the requested scheme into the link paths', () => {
    const palette = resolveChartSeriesPaint('pastel');
    const { container } = renderWithScheme('pastel');
    const firstLink = container.querySelector('[data-part="link"]');

    expect(firstLink?.getAttribute('stroke')).toBe(palette[0]);
  });

  // An out-of-domain scheme is refused at the type level (ChartPaint.contract
  // R-2). This pins the runtime behaviour a JS caller would still reach: the
  // default table, never an empty palette.
  it('falls back to the default table for a scheme outside the domain', () => {
    const palette = resolveChartSeriesPaint('default');
    const { container } = renderWithScheme('rainbow' as ChartColorScheme);

    expect(fillsOf(container)).toEqual(
      NODES.map((_, index) => palette[index % CHART_CATEGORICAL_SIZE]),
    );
  });

  it('materializes twelve slots in either mode', () => {
    const owner = document.createElement('div');
    document.body.appendChild(owner);
    try {
      const decision = resolveChartPaint({ family: 'sankey', scheme: 'accessible' });

      expect(materializeChartPaint(decision, owner).resolved).toHaveLength(CHART_CATEGORICAL_SIZE);

      for (const [mode, eleven, twelve] of [
        ['light', '#a53426', '#6d5a24'],
        ['dark', '#ff8872', '#c0a76f'],
      ] as const) {
        owner.style.setProperty('--ds-chart-accessible-11', eleven);
        owner.style.setProperty('--ds-chart-accessible-12', twelve);
        const resolved = materializeChartPaint(decision, owner).resolved;

        expect(resolved, mode).toHaveLength(CHART_CATEGORICAL_SIZE);
        expect(resolved[10], mode).toBe(eleven);
        expect(resolved[11], mode).toBe(twelve);
        expect(resolved[10], mode).not.toBe(resolved[0]);
      }
    } finally {
      owner.remove();
    }
  });
});

/**
 * The precedence the resolver actually implements, pinned while `colors` and
 * `colorScheme` coexist: a node colour is applied by the layout after the
 * palette is chosen, and `colors` replaces the scheme-resolved palette
 * outright rather than merging with it.
 */
describe('SankeyChart colors/colorScheme precedence', () => {
  const OVERRIDE = ['#111111', '#222222', '#333333'];

  it('lets an explicit node colour beat both colors and colorScheme', () => {
    const nodes = NODES.map((node, index) => (
      index === 1 ? { ...node, color: '#abcdef' } : node
    ));
    const { container } = renderWithScheme('vibrant', { nodes, colors: [...OVERRIDE] });

    expect(fillsOf(container)[1]).toBe('#abcdef');
  });

  it('lets colors beat colorScheme', () => {
    const { container } = renderWithScheme('vibrant', { colors: [...OVERRIDE] });
    const vibrant = resolveChartSeriesPaint('vibrant');
    const fills = fillsOf(container);

    expect(fills[0]).toBe(OVERRIDE[0]);
    expect(fills[3]).toBe(OVERRIDE[0]);
    expect(fills).not.toContain(vibrant[0]);
  });

  it('lets colorScheme decide once colors is absent', () => {
    const { container } = renderWithScheme('pastel');

    expect(fillsOf(container)[0]).toBe(resolveChartSeriesPaint('pastel')[0]);
  });

  // The whole chain in one render, so a future reordering fails here.
  it('orders the three tiers datum > colors > scheme', () => {
    const nodes = NODES.map((node, index) => (
      index === 0 ? { ...node, color: '#abcdef' } : node
    ));
    const { container } = renderWithScheme('monochrome', { nodes, colors: [...OVERRIDE] });
    const fills = fillsOf(container);

    expect(fills[0]).toBe('#abcdef');
    expect(fills[1]).toBe(OVERRIDE[1]);
    expect(fills).not.toContain(resolveChartSeriesPaint('monochrome')[1]);
  });

  it('keeps the overridden flag on the decision while colors wins', () => {
    expect(
      resolveChartPaint({ family: 'sankey', scheme: 'monochrome', override: OVERRIDE })
        .overridden,
    ).toBe(true);
    expect(
      resolveChartPaint({ family: 'sankey', scheme: 'monochrome' }).overridden,
    ).toBe(false);
  });
});

/* ---- type-level refusals for the new governed input ------------------ */

/* An out-of-domain scheme name is refused at the boundary, so the runtime
 * fallback above is unreachable from TypeScript. */
// @ts-expect-error scheme outside the governed domain
const refusedScheme = <SankeyChart nodes={NODES} links={LINKS} colorScheme="rainbow" />;

/* The input is the governed union, not an open string. */
// @ts-expect-error an arbitrary string is not a governed scheme
const refusedWidening = <SankeyChart nodes={NODES} links={LINKS} colorScheme={'default' as string} />;

void refusedScheme;
void refusedWidening;
