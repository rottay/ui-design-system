import React, { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChartScaffold, describeChart } from '../presentation/scaffold';

function expectExternalIdReferences(
  svg: SVGSVGElement,
  attribute: 'aria-labelledby' | 'aria-describedby',
): Element[] {
  const ids = svg.getAttribute(attribute)?.split(/\s+/).filter(Boolean) ?? [];
  expect(ids.length).toBeGreaterThan(0);

  return ids.map((id) => {
    const referenced = document.getElementById(id);
    expect(referenced).not.toBeNull();
    expect(svg.contains(referenced)).toBe(false);
    return referenced as Element;
  });
}

describe('ChartScaffold', () => {
  it('renders loading state without mounting the svg shell', () => {
    const containerRef = createRef<HTMLDivElement>();
    const svgRef = createRef<SVGSVGElement>();

    render(
      <ChartScaffold
        containerRef={containerRef}
        svgRef={svgRef}
        height={320}
        loading
        loadingLabel="Loading demand"
        ariaLabel="Demand chart"
        ariaDescription="Loading demand chart."
      />
    );

    expect(screen.getByText('Loading demand')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('binds tabular-nums + detail-size label typography on the chart svg (WO-DES-12)', () => {
    const containerRef = createRef<HTMLDivElement>();
    const svgRef = createRef<SVGSVGElement>();

    render(
      <ChartScaffold
        containerRef={containerRef}
        svgRef={svgRef}
        width={420}
        height={280}
        ariaLabel="Typography chart"
        ariaDescription="Typography chart."
      />
    );

    // Axis + value labels inherit tabular figures at the detail-size token from
    // the scaffold svg, so no chart wires it per-screen (WO-DES-12 §8.3/A5.5).
    // WO-CRA-04: routed through CRA-01's tabular-nums token instead of the
    // literal 'tabular-nums' string it resolves to.
    const svg = screen.getByRole('img', { name: 'Typography chart' }) as unknown as SVGSVGElement;
    expect(svg.style.fontVariantNumeric).toBe('var(--ds-numeric-tabular)');
    expect(svg.style.fontSize).toBe('var(--ds-font-size-xs)');
    expect(expectExternalIdReferences(svg, 'aria-labelledby')[0]).toHaveAttribute(
      'data-part',
      'accessible-title',
    );
    expectExternalIdReferences(svg, 'aria-describedby');
    expect(svg.querySelector('title, desc')).toBeNull();
  });

  it('supports keyboard navigation through summary items and optional title/subtitle/legend', () => {
    const containerRef = createRef<HTMLDivElement>();
    const svgRef = createRef<SVGSVGElement>();

    render(
      <ChartScaffold
        containerRef={containerRef}
        svgRef={svgRef}
        width={420}
        height={280}
        title="Revenue"
        subtitle="Weekly performance"
        ariaLabel="Revenue chart"
        ariaDescription="Revenue chart for the week."
        summary={{
          caption: 'Revenue summary',
          headers: ['Day', 'Value'],
          rows: [
            ['Mon', 12],
            ['Tue', 18],
            ['Wed', 9],
          ],
        }}
        legend={<div>Legend node</div>}
      />
    );

    const chart = screen.getByRole('img', { name: 'Revenue' }) as unknown as SVGSVGElement;
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Weekly performance')).toBeInTheDocument();
    expect(screen.getByText('Legend node')).toBeInTheDocument();
    expect(screen.getByText(/active data point: day: mon, value: 12/i)).toBeInTheDocument();
    const [visualTitle] = expectExternalIdReferences(chart, 'aria-labelledby');
    expect(visualTitle).toHaveAttribute('data-part', 'title');
    expect(visualTitle).toHaveTextContent('Revenue');
    expectExternalIdReferences(chart, 'aria-describedby');
    expect(chart.querySelector('title, desc')).toBeNull();

    fireEvent.keyDown(chart, { key: 'ArrowRight' });
    expect(screen.getByText(/active data point: day: tue, value: 18/i)).toBeInTheDocument();

    fireEvent.keyDown(chart, { key: 'End' });
    expect(screen.getByText(/active data point: day: wed, value: 9/i)).toBeInTheDocument();

    fireEvent.keyDown(chart, { key: 'Home' });
    expect(screen.getByText(/active data point: day: mon, value: 12/i)).toBeInTheDocument();

    fireEvent.keyDown(chart, { key: 'ArrowLeft' });
    expect(screen.getByText(/active data point: day: wed, value: 9/i)).toBeInTheDocument();
  });
});

describe('describeChart', () => {
  it('builds readable descriptions with optional subtitle and extra details', () => {
    expect(describeChart('Line chart', 1)).toBe('Line chart containing 1 data item.');
    expect(describeChart('Line chart', 4, 'Weekly trend', 'Dots are enabled.')).toBe(
      'Weekly trend Line chart containing 4 data items. Dots are enabled.'
    );
  });
});
