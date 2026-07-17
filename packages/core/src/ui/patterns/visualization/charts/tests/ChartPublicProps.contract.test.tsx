import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  BulletChart,
  HeatMap,
  Histogram,
  SankeyChart,
  ScatterChart,
  Sparkline,
  WaterfallChart,
} from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';
import { mockMatchMedia } from '../../../../../tooling/testing/helpers/browser/match-media';

describe('chart public prop runtime contracts', () => {
  it('applies BulletChart gap, rangeColors, and targetColor', async () => {
    const { container } = renderSurface(
      <BulletChart
        width={440}
        responsive={false}
        animate={false}
        barHeight={20}
        gap={33}
        rangeColors={['#111111', '#222222', '#333333']}
        targetColor="#abcdef"
        data={[
          { label: 'Revenue', value: 70, target: 80, ranges: [40, 70, 100] },
          { label: 'Margin', value: 30, target: 35, ranges: [15, 30, 50] },
        ]}
      />,
    );

    await waitFor(() => {
      expect(container.querySelectorAll('[data-part="item"]')).toHaveLength(2);
    });

    const items = [...container.querySelectorAll<SVGGElement>('[data-part="item"]')];
    expect(items.map((item) => item.getAttribute('transform'))).toEqual([
      'translate(100,12)',
      'translate(100,65)',
    ]);

    const firstItemBands = [
      ...items[0].querySelectorAll<SVGRectElement>('[data-part="range-band"]'),
    ];
    expect(firstItemBands.map((band) => band.getAttribute('fill'))).toEqual([
      '#333333',
      '#222222',
      '#111111',
    ]);
    expect(items[0].querySelector('[data-part="target-marker"]')).toHaveAttribute(
      'fill',
      '#abcdef',
    );
  });

  it('uses explicit HeatMap xLabels and yLabels order', async () => {
    const { container } = renderSurface(
      <HeatMap
        width={420}
        height={260}
        responsive={false}
        animate={false}
        tooltip={false}
        xLabels={['Tue', 'Mon']}
        yLabels={['Evening', 'Morning']}
        data={[
          { x: 'Mon', y: 'Morning', value: 1 },
          { x: 'Tue', y: 'Evening', value: 2 },
        ]}
      />,
    );

    await waitFor(() => {
      expect(container.querySelectorAll('[data-part="axis-tick-label"]')).toHaveLength(4);
    });

    const labels = [
      ...container.querySelectorAll<SVGTextElement>('[data-part="axis-tick-label"]'),
    ].map((label) => label.textContent);
    expect(labels).toEqual(['Tue', 'Mon', 'Evening', 'Morning']);
  });

  it('applies Histogram yLabel, colors, and value formatter', async () => {
    const formatValue = (value: number) => `v:${value.toFixed(1)}`;
    const { container } = renderSurface(
      <Histogram
        width={460}
        height={280}
        responsive={false}
        animate={false}
        tooltip={false}
        values={[1, 2, 2, 3, 4, 5, 6]}
        bins={3}
        yLabel="Occurrences"
        color="#123456"
        cumulativeLine
        cumulativeColor="#654321"
        formatValue={formatValue}
      />,
    );

    await waitFor(() => {
      expect(container.querySelector('[data-part="cumulative-line"]')).toBeInTheDocument();
    });

    expect(
      container.querySelector('[data-part="axis-label"][data-axis="y"]'),
    ).toHaveTextContent('Occurrences');
    container.querySelectorAll('[data-part="bar"][data-series="histogram"]').forEach((bar) => {
      expect(bar).toHaveAttribute('fill', '#123456');
    });
    expect(container.querySelector('[data-part="cumulative-line"]')).toHaveAttribute(
      'stroke',
      '#654321',
    );
    container.querySelectorAll('[data-part="cumulative-point"]').forEach((point) => {
      expect(point).toHaveAttribute('fill', '#654321');
    });

    const xTickLabels = [
      ...container.querySelectorAll<SVGTextElement>(
        '[data-part="axis"][data-axis="x"] [data-part="axis-tick-label"]',
      ),
    ];
    expect(xTickLabels.length).toBeGreaterThan(0);
    xTickLabels.forEach((label) => expect(label.textContent).toMatch(/^v:/));
  });

  it('honors the complete Sankey layout, presentation, formatting, and callback contract', async () => {
    const nodes = [
      { id: 'source', label: 'Source' },
      { id: 'primary', label: 'Primary' },
      { id: 'secondary', label: 'Secondary' },
    ];
    const links = [
      { source: 'source', target: 'primary', value: 16 },
      { source: 'source', target: 'secondary', value: 8 },
    ];
    const onNodeClick = vi.fn();
    const onLinkClick = vi.fn();
    const { container } = renderSurface(
      <SankeyChart
        width={560}
        height={300}
        responsive={false}
        animate={false}
        tooltip={false}
        nodes={nodes}
        links={links}
        nodeWidth={31}
        nodePadding={23}
        linkOpacity={0.21}
        linkHoverOpacity={0.83}
        align="center"
        showLinkValues
        showNodeLabels={false}
        formatValue={(value) => `${value} units`}
        onNodeClick={onNodeClick}
        onLinkClick={onLinkClick}
      />,
    );

    await waitFor(() => {
      expect(container.querySelectorAll('[data-part="node-mark"]')).toHaveLength(3);
      expect(container.querySelectorAll('[data-part="link"]')).toHaveLength(2);
    });

    expect(container.querySelector('[data-part="plot-area"]')).toHaveAttribute(
      'data-variant',
      'center',
    );
    const nodeMarks = [
      ...container.querySelectorAll<SVGRectElement>('[data-part="node-mark"]'),
    ];
    nodeMarks.forEach((mark) => expect(mark).toHaveAttribute('width', '31'));

    const firstTarget = nodeMarks[1];
    const secondTarget = nodeMarks[2];
    const targetGap = Number(secondTarget.getAttribute('y'))
      - Number(firstTarget.getAttribute('y'))
      - Number(firstTarget.getAttribute('height'));
    expect(targetGap).toBeCloseTo(23, 6);

    expect(container.querySelector('[data-part="node-label"]')).toBeNull();
    expect(container.querySelector('[data-part="node-value"]')).toBeNull();
    expect(
      [...container.querySelectorAll('[data-part="link-label"]')].map(
        (label) => label.textContent,
      ),
    ).toEqual(['16 units', '8 units']);

    const firstLink = container.querySelector('[data-part="link"]') as SVGPathElement;
    expect(firstLink).toHaveAttribute('stroke-opacity', '0.21');
    fireEvent.mouseEnter(firstLink);
    expect(firstLink).toHaveAttribute('stroke-opacity', '0.83');
    fireEvent.mouseLeave(firstLink);
    expect(firstLink).toHaveAttribute('stroke-opacity', '0.21');

    fireEvent.click(firstLink);
    fireEvent.click(container.querySelectorAll('[data-part="node"]')[0]);
    expect(onLinkClick).toHaveBeenCalledWith(links[0]);
    expect(onNodeClick).toHaveBeenCalledWith(nodes[0]);
  });

  it('toggles ScatterChart grid and applies point opacity', async () => {
    const { container } = renderSurface(
      <ScatterChart
        width={420}
        height={260}
        responsive={false}
        animate={false}
        tooltip={false}
        grid={false}
        opacity={0.23}
        data={[
          { x: 1, y: 2 },
          { x: 2, y: 4 },
        ]}
      />,
    );

    await waitFor(() => {
      expect(container.querySelectorAll('[data-part="series-point"]')).toHaveLength(2);
    });
    expect(container.querySelector('[data-part="grid"]')).toBeNull();
    container.querySelectorAll('[data-part="series-point"]').forEach((point) => {
      expect(point).toHaveAttribute('fill-opacity', '0.23');
    });
  });

  it('forwards Sparkline strokeWidth, className, and style', () => {
    const { container } = renderSurface(
      <Sparkline
        data={[2, 5, 3]}
        animate={false}
        showEndDot={false}
        strokeWidth={4}
        className="consumer-sparkline"
        style={{ marginTop: 7, opacity: 0.45 }}
      />,
    );

    const sparkline = container.querySelector('[data-part="sparkline"]') as SVGSVGElement;
    expect(sparkline).toHaveClass('ds-chart-sparkline', 'consumer-sparkline');
    expect(sparkline.style.marginTop).toBe('7px');
    expect(sparkline.style.opacity).toBe('0.45');
    expect(sparkline.querySelector('[data-part="line"]')).toHaveAttribute(
      'stroke-width',
      '4',
    );
  });

  it('keeps Sparkline static when animate=true but the OS requests reduced motion', () => {
    mockMatchMedia(1440, true);

    const { container } = renderSurface(
      <Sparkline data={[2, 5, 3]} animate showEndDot={false} />,
    );

    const sparkline = container.querySelector('[data-part="sparkline"]') as SVGSVGElement;
    const line = sparkline.querySelector('[data-part="line"]') as SVGPathElement;
    expect(sparkline.querySelector('style')).toBeNull();
    expect(line.getAttribute('class')).toBeNull();
    expect(line.getAttribute('style')).toBeNull();
  });

  it('uses the resolved chart personality duration for Sparkline animation', () => {
    mockMatchMedia(1440, false);

    const { container } = renderSurface(
      <Sparkline data={[2, 5, 3]} animate showEndDot={false} />,
    );
    const line = container.querySelector('[data-part="line"]') as SVGPathElement;

    // generic.default owns a 700ms chart mount duration.
    expect(line.style.animation).toContain('700ms');
    expect(line.style.animation).not.toContain('800ms');
  });

  it('applies WaterfallChart decreaseColor in horizontal orientation', async () => {
    const { container } = renderSurface(
      <WaterfallChart
        width={440}
        height={260}
        responsive={false}
        animate={false}
        tooltip={false}
        orientation="horizontal"
        decreaseColor="#aa00cc"
        data={[
          { label: 'Revenue', value: 20 },
          { label: 'Costs', value: -7 },
        ]}
      />,
    );

    await waitFor(() => {
      expect(container.querySelectorAll('[data-part="bar"]')).toHaveLength(2);
    });
    expect(container.querySelector('[data-part="plot-area"]')).toHaveAttribute(
      'data-orientation',
      'horizontal',
    );
    const decreaseBar = container.querySelector(
      '[data-part="bar"][data-status="decrease"]',
    );
    expect(decreaseBar).toHaveAttribute('fill', '#aa00cc');
    expect(Number(decreaseBar?.getAttribute('width'))).toBeGreaterThan(0);
  });
});
