import React, { createRef } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BarChart } from '..';
import { ChartScaffold } from '../presentation/scaffold';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

function externalReferences(
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

  it.each([
    {
      caseName: 'with a visual title',
      title: 'Live pipeline',
      accessibleName: 'Live pipeline',
      expectedTitlePart: 'title',
    },
    {
      caseName: 'without a visual title',
      title: undefined,
      accessibleName: 'Bar chart',
      expectedTitlePart: 'accessible-title',
    },
  ])('keeps React-owned ARIA references after a real D3 render $caseName', async ({
    title,
    accessibleName,
    expectedTitlePart,
  }) => {
    const { container } = renderSurface(
      <BarChart
        {...(title ? { title } : {})}
        width={420}
        height={260}
        responsive={false}
        animate={false}
        data={[
          { label: 'Qualified', value: 18 },
          { label: 'Interview', value: 9 },
        ]}
      />,
    );

    await waitFor(() => {
      expect(container.querySelectorAll('svg rect').length).toBeGreaterThan(0);
    });

    const chart = screen.getByRole('img', { name: accessibleName }) as unknown as SVGSVGElement;
    const [accessibleTitle] = externalReferences(chart, 'aria-labelledby');
    expect(accessibleTitle).toHaveAttribute('data-part', expectedTitlePart);
    externalReferences(chart, 'aria-describedby');
    expect(chart.querySelector('title, desc')).toBeNull();
  });
});
