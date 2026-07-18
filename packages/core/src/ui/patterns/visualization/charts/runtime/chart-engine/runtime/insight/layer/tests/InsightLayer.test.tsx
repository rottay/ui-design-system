import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React, { act } from 'react';
import { cleanup, render } from '@testing-library/react';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ChartInsightSpec } from '../../../../foundation/spec';
import { SvgBarRenderer } from '../../../../presentation/react/renderers/bar';
import { SvgLineRenderer } from '../../../../presentation/react/renderers/line';
import { ChartInsightSummary } from '../../../../presentation/react/insight/summary';

const CHART_FOUNDATION_CSS = readFileSync(
  join(__dirname, '../../../../../../../../../../foundation/tokens/css/presentation/components/skin/chart-foundation.css'),
  'utf8',
);

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

const FOUR_INSIGHTS = [
  { id: 'target-eight', type: 'target', value: 8, label: 'App target' },
  { id: 'expected-band', type: 'band', lower: 3, upper: 6, label: 'App expected range' },
  { id: 'label-beta', type: 'direct-label', datumId: 'beta', label: 'App Beta label' },
  { id: 'event-beta', type: 'event', at: 'Beta', label: 'App Beta event' },
] as const satisfies readonly ChartInsightSpec[];

describe('ChartInsightLayer', () => {
  it('renders target, band, direct-label and categorical event as clipped static React SVG', () => {
    const { container, rerender } = render(
      <SvgBarRenderer
        ariaLabel="Insight bars"
        width={480}
        height={280}
        responsive={false}
        data={[
          { id: 'alpha', category: 'Alpha', value: 5 },
          { id: 'beta', category: 'Beta', value: 10 },
        ]}
        insights={FOUR_INSIGHTS}
      />,
    );

    const layer = container.querySelector('[data-part="insight-layer"]');
    const renderedInsights = [...container.querySelectorAll<SVGGElement>('[data-part="insight"]')];
    expect(layer).toBeInTheDocument();
    expect(layer).toHaveAttribute('pointer-events', 'none');
    expect(renderedInsights).toHaveLength(4);
    expect(renderedInsights.map((node) => node.getAttribute('data-insight-type'))).toEqual([
      'target',
      'band',
      'direct-label',
      'event',
    ]);
    expect(container.querySelector('[data-insight-id="event-beta"]')).toHaveAttribute(
      'data-event-kind',
      'categorical',
    );
    expect(container.querySelectorAll('[data-part="insight-label"]')).toHaveLength(4);
    expect(container.textContent).toContain('App target');
    expect(container.textContent).toContain('App expected range');
    expect(container.textContent).toContain('App Beta label');
    expect(container.textContent).toContain('App Beta event');

    const clipReference = layer?.getAttribute('clip-path');
    const clipId = clipReference?.match(/^url\(#(.+)\)$/)?.[1];
    expect(clipId).toBeTruthy();
    expect(container.querySelector(`clipPath[id="${clipId}"] rect`)).toMatchObject({
      tagName: 'rect',
    });

    const targetBefore = container.querySelector('[data-insight-id="target-eight"]');
    const targetDomId = targetBefore?.id;
    rerender(
      <SvgBarRenderer
        ariaLabel="Insight bars"
        width={480}
        height={280}
        responsive={false}
        data={[
          { id: 'alpha', category: 'Alpha', value: 5 },
          { id: 'beta', category: 'Beta', value: 10 },
        ]}
        insights={[...FOUR_INSIGHTS].reverse()}
      />,
    );
    expect(container.querySelector('[data-insight-id="target-eight"]')).toBe(targetBefore);
    expect(container.querySelector('[data-insight-id="target-eight"]')?.id).toBe(targetDomId);

    expect(layer?.querySelectorAll('a, button, [tabindex], [data-chart-datum-key]')).toHaveLength(0);
    for (const insight of renderedInsights) {
      expect(insight).not.toHaveAttribute('onClick');
      expect(insight).not.toHaveAttribute('tabindex');
    }
  });

  it('supports numeric and categorical line events without adding interaction', () => {
    const { container } = render(
      <>
        <SvgLineRenderer
          ariaLabel="Numeric events"
          width={480}
          height={280}
          responsive={false}
          xType="linear"
          series={[{
            id: 'numeric',
            label: 'Numeric',
            points: [
              { id: 'zero', x: 0, value: 2 },
              { id: 'ten', x: 10, value: 8 },
            ],
          }]}
          insights={[{ id: 'midpoint', type: 'event', at: 5, label: 'App midpoint' }]}
        />
        <SvgLineRenderer
          ariaLabel="Categorical events"
          width={480}
          height={280}
          responsive={false}
          series={[{
            id: 'months',
            label: 'Months',
            points: [
              { id: 'jan', x: 'Jan', value: 2 },
              { id: 'feb', x: 'Feb', value: 8 },
            ],
          }]}
          insights={[{ id: 'feb-event', type: 'event', at: 'Feb', label: 'App February' }]}
        />
      </>,
    );

    expect(container.querySelector('[data-insight-id="midpoint"]')).toHaveAttribute(
      'data-event-kind',
      'numeric',
    );
    expect(container.querySelector('[data-insight-id="feb-event"]')).toHaveAttribute(
      'data-event-kind',
      'categorical',
    );
    expect(container.querySelectorAll('[data-part="insight-layer"] [tabindex]')).toHaveLength(0);
  });

  it('keeps DOM ids unique and stable when distinct insight ids share a hash', () => {
    const collidingInsights = [
      { id: 'insight-1612qpf-1irm8o5', type: 'target', value: 4, label: 'First target' },
      { id: 'insight-1sij5uw-qiwgbz', type: 'target', value: 8, label: 'Second target' },
    ] as const satisfies readonly ChartInsightSpec[];
    const { container, rerender } = render(
      <SvgBarRenderer
        ariaLabel="Colliding insight ids"
        width={480}
        height={280}
        responsive={false}
        data={[{ id: 'alpha', category: 'Alpha', value: 10 }]}
        insights={collidingInsights}
      />,
    );

    const idsBefore = new Map(
      collidingInsights.map((insight) => [
        insight.id,
        container.querySelector(`[data-insight-id="${insight.id}"]`)?.id,
      ]),
    );
    expect([...new Set(idsBefore.values())]).toHaveLength(2);

    rerender(
      <SvgBarRenderer
        ariaLabel="Colliding insight ids"
        width={480}
        height={280}
        responsive={false}
        data={[{ id: 'alpha', category: 'Alpha', value: 10 }]}
        insights={[...collidingInsights].reverse()}
      />,
    );

    for (const insight of collidingInsights) {
      expect(container.querySelector(`[data-insight-id="${insight.id}"]`)?.id).toBe(
        idsBefore.get(insight.id),
      );
    }
  });

  it('fails closed for missing or ambiguous datum ids, unknown specs and non-finite numbers', () => {
    const hostile = [
      { id: 'missing', type: 'direct-label', datumId: 'not-present', label: 'Missing' },
      { id: 'bad-number', type: 'target', value: Number.NaN, label: 'Bad' },
      { id: 'unknown', type: 'forecast', value: 4, label: 'Unknown' },
    ] as unknown as readonly ChartInsightSpec[];
    const { container } = render(
      <SvgLineRenderer
        ariaLabel="Fail closed insights"
        width={480}
        height={280}
        responsive={false}
        series={[
          { id: 'one', label: 'One', points: [{ id: 'shared', x: 'A', value: 2 }] },
          { id: 'two', label: 'Two', points: [{ id: 'shared', x: 'A', value: 4 }] },
        ]}
        insights={[
          ...hostile,
          { id: 'ambiguous', type: 'direct-label', datumId: 'shared', label: 'Ambiguous' },
        ]}
      />,
    );

    expect(container.querySelector('[data-part="insight-layer"]')).not.toBeInTheDocument();
    expect(container.textContent).not.toContain('Missing');
    expect(container.textContent).not.toContain('Bad');
    expect(container.textContent).not.toContain('Unknown');
    expect(container.textContent).not.toContain('Ambiguous');
  });

  it('server-renders and hydrates stable insight and clip ids', async () => {
    const element = (
      <SvgBarRenderer
        ariaLabel="Hydrated insights"
        width={480}
        height={280}
        responsive={false}
        data={[{ id: 'alpha', category: 'Alpha', value: 10 }]}
        insights={[{ id: 'target-five', type: 'target', value: 5, label: 'App five' }]}
      />
    );
    const html = renderToString(element);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const serverInsightId = container.querySelector('[data-insight-id="target-five"]')?.id;
    const serverClip = container.querySelector('[data-part="insight-layer"]')?.getAttribute('clip-path');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let root: Root | undefined;

    await act(async () => {
      root = hydrateRoot(container, element);
    });

    expect(container.querySelector('[data-insight-id="target-five"]')?.id).toBe(serverInsightId);
    expect(container.querySelector('[data-part="insight-layer"]')).toHaveAttribute(
      'clip-path',
      serverClip,
    );
    expect(
      consoleError.mock.calls.some((call) => String(call[0]).toLowerCase().includes('hydration')),
    ).toBe(false);

    await act(async () => root?.unmount());
    container.remove();
  });

  it('stamps summary mode and provenance while rendering only app-authored copy', () => {
    const { container } = render(
      <ChartInsightSummary
        summary={{
          id: 'summary-throughput',
          mode: 'generated',
          text: 'App-authored interpretation.',
          provenance: {
            sourceIds: ['pipeline.weekly', 'capacity.plan'],
            methodId: 'insight-generator.v2',
          },
        }}
      />,
    );
    const summary = container.querySelector('[data-part="chart-insight-summary"]');

    expect(summary).toHaveAttribute('data-insight-mode', 'generated');
    expect(summary).toHaveAttribute(
      'data-provenance-source-ids',
      '["pipeline.weekly","capacity.plan"]',
    );
    expect(summary).toHaveAttribute('data-provenance-method-id', 'insight-generator.v2');
    expect(summary).toHaveTextContent('App-authored interpretation.');
    expect(summary?.textContent).toBe('App-authored interpretation.');
    expect(summary).not.toHaveAttribute('tabindex');
  });

  it('declares forced-colors and RTL treatments in the shipped chart skin', () => {
    expect(CHART_FOUNDATION_CSS).toContain("[data-part='insight-label']");
    expect(CHART_FOUNDATION_CSS).toContain("[dir='rtl']");
    expect(CHART_FOUNDATION_CSS).toContain('@media (forced-colors: active)');
    expect(CHART_FOUNDATION_CSS).toMatch(
      /\[data-part='insight-band'\][\s\S]*?fill:\s*Highlight;/,
    );
    expect(CHART_FOUNDATION_CSS).toMatch(
      /\[data-part='insight-label'\][\s\S]*?direction:\s*rtl;/,
    );
  });
});
