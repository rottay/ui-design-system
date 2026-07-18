import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SvgScatterRenderer } from '../scatter';
import type { SvgScatterDatum } from '../../../../foundation/renderers/geometry';

afterEach(cleanup);

const TREND_DATA: SvgScatterDatum[] = [
  { id: '0', label: 'A', x: 1, y: 1, series: '0' },
  { id: '1', label: 'B', x: 2, y: 2, series: '1' },
  { id: '2', label: 'C', x: 3, y: 3, series: '2' },
];

describe('SvgScatterRenderer parity extensions', () => {
  it('paints a finite least-squares trend segment only when requested', () => {
    const { container, rerender } = render(
      <SvgScatterRenderer
        ariaLabel="Trend scatter"
        width={480}
        height={320}
        responsive={false}
        data={TREND_DATA}
      />,
    );
    expect(container.querySelector('[data-part="trend-line"]')).toBeNull();

    rerender(
      <SvgScatterRenderer
        ariaLabel="Trend scatter"
        width={480}
        height={320}
        responsive={false}
        trendLine
        data={TREND_DATA}
      />,
    );
    const trend = container.querySelector('[data-part="trend-line"]') as SVGLineElement | null;
    expect(trend).not.toBeNull();
    for (const attribute of ['x1', 'y1', 'x2', 'y2']) {
      expect(Number(trend?.getAttribute(attribute))).toBeTypeOf('number');
      expect(Number.isFinite(Number(trend?.getAttribute(attribute)))).toBe(true);
    }
  });

  it('renders app-authored axis labels as governed, aria-hidden text parts', () => {
    const { container } = render(
      <SvgScatterRenderer
        ariaLabel="Labelled scatter"
        width={480}
        height={320}
        responsive={false}
        xLabel="Revenue"
        yLabel="Growth"
        data={TREND_DATA}
      />,
    );
    const labels = [...container.querySelectorAll('[data-part="axis-label"]')];
    expect(labels).toHaveLength(2);
    const byAxis = new Map(labels.map((node) => [node.getAttribute('data-axis'), node.textContent]));
    expect(byAxis.get('x')).toBe('Revenue');
    expect(byAxis.get('y')).toBe('Growth');
    for (const label of labels) expect(label).toHaveAttribute('aria-hidden', 'true');
  });

  it('gates the background grid on the grid prop', () => {
    const { container, rerender } = render(
      <SvgScatterRenderer
        ariaLabel="Grid scatter"
        width={480}
        height={320}
        responsive={false}
        data={TREND_DATA}
      />,
    );
    expect(container.querySelector('[data-part="grid"]')).not.toBeNull();

    rerender(
      <SvgScatterRenderer
        ariaLabel="Grid scatter"
        width={480}
        height={320}
        responsive={false}
        grid={false}
        data={TREND_DATA}
      />,
    );
    expect(container.querySelector('[data-part="grid"]')).toBeNull();
  });

  it('forwards point opacity onto the mark fill without an inline colour', () => {
    const { container } = render(
      <SvgScatterRenderer
        ariaLabel="Opacity scatter"
        width={480}
        height={320}
        responsive={false}
        pointOpacity={0.42}
        data={TREND_DATA}
      />,
    );
    const points = [...container.querySelectorAll('[data-part="scatter-point"]')];
    expect(points).toHaveLength(3);
    for (const point of points) {
      expect(point).toHaveAttribute('fill-opacity', '0.42');
      // Governance: the mark carries no inline colour; paint flows through the
      // `--ds-chart-paint-N` skin channel keyed on the mark's series index.
      expect(point).not.toHaveAttribute('fill');
    }
  });
});
