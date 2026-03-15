import React, { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChartScaffold } from '../chart-scaffold';

describe('ChartScaffold advanced coverage', () => {
  it('omits summary keyboard affordances when the summary is empty', () => {
    const containerRef = createRef<HTMLDivElement>();
    const svgRef = createRef<SVGSVGElement>();

    render(
      <ChartScaffold
        containerRef={containerRef}
        svgRef={svgRef}
        height={240}
        ariaLabel="Latency chart"
        ariaDescription="Latency chart without summary items."
        summary={{ headers: ['Label', 'Value'], rows: [] }}
      />
    );

    const chart = screen.getByRole('img', { name: 'Latency chart' });
    expect(chart).not.toHaveAttribute('aria-keyshortcuts');
    expect(screen.queryByText(/active data point/i)).not.toBeInTheDocument();

    fireEvent.keyDown(chart, { key: 'ArrowRight' });
    expect(screen.queryByText(/active data point/i)).not.toBeInTheDocument();
  });

  it('covers up/down navigation and default width styling when there is no title block', () => {
    const containerRef = createRef<HTMLDivElement>();
    const svgRef = createRef<SVGSVGElement>();

    const { container } = render(
      <ChartScaffold
        containerRef={containerRef}
        svgRef={svgRef}
        height={260}
        ariaLabel="Orders chart"
        ariaDescription="Orders chart with summary navigation."
        summary={{
          headers: ['Month', 'Orders'],
          rows: [
            ['Jan', 12],
            ['Feb', 24],
            ['Mar', 8],
          ],
        }}
      />
    );

    const chart = screen.getByRole('img', { name: 'Orders chart' });
    expect(container.firstChild).toHaveStyle({ width: '100%' });
    expect(screen.getByText(/active data point: month: jan, orders: 12/i)).toBeInTheDocument();

    fireEvent.keyDown(chart, { key: 'ArrowDown' });
    expect(screen.getByText(/active data point: month: feb, orders: 24/i)).toBeInTheDocument();

    fireEvent.keyDown(chart, { key: 'ArrowUp' });
    expect(screen.getByText(/active data point: month: jan, orders: 12/i)).toBeInTheDocument();
  });
});
