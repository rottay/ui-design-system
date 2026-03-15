import React, { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChartScaffold, describeChart } from '../chart-scaffold';

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

    const chart = screen.getByRole('img', { name: 'Revenue chart' });
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Weekly performance')).toBeInTheDocument();
    expect(screen.getByText('Legend node')).toBeInTheDocument();
    expect(screen.getByText(/active data point: day: mon, value: 12/i)).toBeInTheDocument();

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
