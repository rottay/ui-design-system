import React, { useState } from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AreaChart, LineChart } from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

function expectFiniteSvgGeometry(root: Element): void {
  root.querySelectorAll<SVGElement>('[d], [cx], [cy], [transform]').forEach((element) => {
    for (const attribute of ['d', 'cx', 'cy', 'transform'] as const) {
      const value = element.getAttribute(attribute);
      if (value !== null) expect(value).not.toMatch(/NaN|Infinity/);
    }
  });
  expect(root.innerHTML).not.toMatch(/NaN|Infinity/);
}

function numberAttribute(element: Element, attribute: string): number {
  const value = Number(element.getAttribute(attribute));
  expect(Number.isFinite(value)).toBe(true);
  return value;
}

function pathYCoordinates(path: SVGPathElement): number[] {
  const values = (path.getAttribute('d') ?? '').match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi)?.map(Number) ?? [];
  expect(values.length).toBeGreaterThan(0);
  expect(values.length % 2).toBe(0);
  return values.filter((_, index) => index % 2 === 1);
}

const signedLineSeries = [
  {
    name: 'Signed',
    data: [
      { x: -3, y: -5 },
      { x: 0, y: 0 },
      { x: 3, y: 8 },
      { x: Number.NaN, y: 2 },
      { x: 4, y: Number.POSITIVE_INFINITY },
    ],
  },
];

const signedAreaSeries = [
  {
    name: 'Zero',
    data: [
      { x: 'A', y: 0 },
      { x: 'B', y: 0 },
    ],
  },
  {
    name: 'Positive',
    data: [
      { x: 'A', y: 6 },
      { x: 'B', y: 3 },
      { x: 'Invalid value', y: Number.NaN },
    ],
  },
  {
    name: 'Negative one',
    data: [
      { x: 'A', y: -4 },
      { x: 'B', y: -2 },
    ],
  },
  {
    name: 'Negative two',
    data: [
      { x: 'A', y: -3 },
      { x: 'B', y: -1 },
      { x: Number.POSITIVE_INFINITY, y: 9 },
      { x: new Date('invalid'), y: 5 },
    ],
  },
];

function ClearingCharts(): React.ReactElement {
  const [visible, setVisible] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setVisible(false)}>Clear charts</button>
      <LineChart
        title="Clearing line"
        width={420}
        height={260}
        responsive={false}
        animate
        showArea
        xType="linear"
        series={visible ? signedLineSeries : []}
      />
      <AreaChart
        title="Clearing area"
        width={420}
        height={260}
        responsive={false}
        animate
        series={visible ? signedAreaSeries.slice(1, 3) : []}
      />
    </>
  );
}

function GradientCharts({ suffix }: { suffix: string }): React.ReactElement {
  const series = [
    {
      name: `First ${suffix}`,
      data: [
        { x: 'A', y: 2 },
        { x: 'B', y: 4 },
      ],
    },
    {
      name: `Second ${suffix}`,
      data: [
        { x: 'A', y: -1 },
        { x: 'B', y: 3 },
      ],
    },
  ];

  return (
    <>
      <LineChart
        title={`Gradient line ${suffix}`}
        width={360}
        height={240}
        responsive={false}
        animate={false}
        showArea
        series={series}
      />
      <AreaChart
        title={`Gradient area ${suffix}`}
        width={360}
        height={240}
        responsive={false}
        animate={false}
        stacked
        series={series}
      />
    </>
  );
}

describe('AreaChart and LineChart correctness floor', () => {
  let originalGetTotalLength: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalGetTotalLength = Object.getOwnPropertyDescriptor(
      window.SVGElement.prototype,
      'getTotalLength',
    );
    Object.defineProperty(window.SVGElement.prototype, 'getTotalLength', {
      configurable: true,
      value: vi.fn(() => 120),
    });
  });

  afterEach(() => {
    if (originalGetTotalLength) {
      Object.defineProperty(window.SVGElement.prototype, 'getTotalLength', originalGetTotalLength);
    } else {
      delete (window.SVGElement.prototype as SVGElement & { getTotalLength?: () => number })
        .getTotalLength;
    }
  });

  it('keeps signed linear and constant time domains finite while filtering invalid x/y values', async () => {
    renderSurface(
      <>
        <LineChart
          title="Signed linear line"
          width={420}
          height={260}
          responsive={false}
          animate={false}
          legend={false}
          showDots
          showArea
          xType="linear"
          series={signedLineSeries}
        />
        <LineChart
          title="Constant time line"
          width={420}
          height={260}
          responsive={false}
          animate={false}
          legend={false}
          showDots
          xType="time"
          series={[
            {
              name: 'Constant',
              data: [
                { x: '2026-07-15T12:00:00.000Z', y: 0 },
                { x: new Date('2026-07-15T12:00:00.000Z'), y: 0 },
                { x: 'not-a-date', y: 3 },
                { x: '2026-07-15T12:00:00.000Z', y: Number.NaN },
              ],
            },
          ]}
        />
      </>,
      { productProfile: 'events.organizer' },
    );

    const signed = screen.getByRole('img', { name: 'Signed linear line' });
    const constant = screen.getByRole('img', { name: 'Constant time line' });

    await waitFor(() => {
      expect(signed.querySelectorAll('circle[data-part="point"]')).toHaveLength(3);
      expect(constant.querySelectorAll('circle[data-part="point"]')).toHaveLength(2);
    });

    const signedPoints = [...signed.querySelectorAll<SVGCircleElement>('circle[data-part="point"]')];
    const signedX = signedPoints.map((point) => numberAttribute(point, 'cx'));
    const signedY = signedPoints.map((point) => numberAttribute(point, 'cy'));
    expect(signedX[0]).toBeLessThan(signedX[1]);
    expect(signedX[1]).toBeLessThan(signedX[2]);
    expect(signedY[0]).toBeGreaterThan(signedY[1]);
    expect(signedY[1]).toBeGreaterThan(signedY[2]);

    const constantPoints = [...constant.querySelectorAll<SVGCircleElement>('circle[data-part="point"]')];
    const constantX = constantPoints.map((point) => numberAttribute(point, 'cx'));
    const constantY = constantPoints.map((point) => numberAttribute(point, 'cy'));
    expect(constantX[0]).toBeCloseTo(constantX[1], 6);
    expect(constantX[0]).toBeGreaterThan(0);
    expect(constantY[0]).toBeCloseTo(constantY[1], 6);
    expect(constantY[0]).toBeGreaterThan(0);

    expectFiniteSvgGeometry(signed);
    expectFiniteSvgGeometry(constant);
  });

  it('uses diverging stacks so positive and negative layers accumulate away from zero', async () => {
    renderSurface(
      <AreaChart
        title="Signed stacked area"
        width={460}
        height={280}
        responsive={false}
        animate={false}
        curved={false}
        legend={false}
        stacked
        tooltip
        series={signedAreaSeries}
      />,
      { productProfile: 'events.organizer' },
    );

    const chart = screen.getByRole('img', { name: 'Signed stacked area' });
    await waitFor(() => {
      expect(chart.querySelectorAll('path[data-part="area"]')).toHaveLength(4);
    });

    // The legacy `.chart-hover-overlay` crosshair belonged to the pre-renderer
    // D3 body. Live hover on the migrated area family arrives with the Stage-C
    // interaction-controller wire; until then the idle ChartTooltip element is
    // the family's interaction contract and the stack semantics are asserted
    // from the rendered geometry directly.
    expect(document.querySelector("[data-part='chart-tooltip']")).toBeTruthy();

    const paths = [...chart.querySelectorAll<SVGPathElement>('path[data-part="area"]')];
    const [zeroPathY, positivePathY, negativeOnePathY, negativeTwoPathY] = paths.map(pathYCoordinates);
    const zeroY = zeroPathY[0];
    expect(Number.isFinite(zeroY)).toBe(true);
    expect(zeroPathY.every((value) => Math.abs(value - zeroY) < 0.001)).toBe(true);
    expect(Math.min(...positivePathY)).toBeLessThan(zeroY);
    expect(Math.max(...positivePathY)).toBeCloseTo(zeroY, 3);
    expect(Math.min(...negativeOnePathY)).toBeCloseTo(zeroY, 3);
    expect(Math.max(...negativeOnePathY)).toBeGreaterThan(zeroY);
    expect(Math.min(...negativeTwoPathY)).toBeGreaterThan(zeroY);
    expectFiniteSvgGeometry(chart);
  });

  it('matches equivalent Date and ISO timestamps across line series', async () => {
    renderSurface(
      <LineChart
        title="Equivalent time values"
        width={420}
        height={260}
        responsive={false}
        animate={false}
        showDots
        xType="time"
        series={[
          { name: 'ISO', data: [{ x: '2026-07-15T12:00:00.000Z', y: 2 }] },
          { name: 'Date', data: [{ x: new Date('2026-07-15T12:00:00.000Z'), y: 4 }] },
        ]}
      />,
    );

    const chart = screen.getByRole('img', { name: 'Equivalent time values' });
    // Renderer DOM: equivalent Date and ISO timestamps resolve to the same
    // pure-geometry x position, so both series' single points share `cx`.
    const points = await waitFor(() => {
      const current = [...chart.querySelectorAll<SVGCircleElement>('circle[data-part="point"]')];
      expect(current).toHaveLength(2);
      return current;
    });
    const xs = points.map((point) => Number(point.getAttribute('cx')));
    expect(xs[0]).toBeCloseTo(xs[1], 6);
    expect(xs[0]).toBeGreaterThan(0);
  });

  it('normalizes area opacity and rejects an overflowing diverging stack visibly', async () => {
    renderSurface(
      <>
        <AreaChart
          title="Normalized opacity"
          width={420}
          height={260}
          responsive={false}
          animate={false}
          opacity={Number.NaN}
          series={[{ name: 'Finite', data: [{ x: 'A', y: 2 }] }]}
        />
        <AreaChart
          title="Overflowing area"
          width={420}
          height={260}
          responsive={false}
          animate={false}
          stacked
          series={[
            { name: 'First', data: [{ x: 'A', y: 1e308 }] },
            { name: 'Second', data: [{ x: 'A', y: 1e308 }] },
          ]}
        />
      </>,
    );

    const finite = screen.getByRole('img', { name: 'Normalized opacity' });
    const overflow = screen.getByRole('img', { name: 'Overflowing area' });
    await waitFor(() => {
      expect(finite.querySelector('[data-part="area"]')).toHaveAttribute('fill-opacity', '0.3');
      expect(overflow.parentElement?.querySelector('[data-error-code="NUMERIC_OVERFLOW"]')).toBeVisible();
    });
    expect(overflow.querySelector('[data-part="area"]')).toBeNull();
    expectFiniteSvgGeometry(finite);
    expectFiniteSvgGeometry(overflow);
  });

  it('interrupts active transitions and erases stale marks and defs when data becomes empty', async () => {
    const { container } = renderSurface(<ClearingCharts />, {
      productProfile: 'events.organizer',
    });

    // Renderer DOM: the migrated LineChart emits a `line` edge (not the area
    // `series-line`) and a CSS-painted `area` (no gradient defs); the AreaChart
    // renderer keeps its `series-line` edge and per-series gradient defs. So the
    // two `series-line` and two gradients come from the area chart's two series,
    // and the three `area` paths are one from the line plus two from the area.
    await waitFor(() => {
      expect(container.querySelectorAll('path[data-part="line"]')).toHaveLength(1);
      expect(container.querySelectorAll('path[data-part="series-line"]')).toHaveLength(2);
      expect(container.querySelectorAll('path[data-part="area"]')).toHaveLength(3);
      expect(container.querySelectorAll('linearGradient')).toHaveLength(2);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Clear charts' }));
    await waitFor(() => {
      expect(container.querySelectorAll('path[data-part="line"]')).toHaveLength(0);
      expect(container.querySelectorAll('path[data-part="series-line"]')).toHaveLength(0);
      expect(container.querySelectorAll('path[data-part="area"]')).toHaveLength(0);
      expect(container.querySelectorAll('linearGradient')).toHaveLength(0);
    });
  });

  it('keeps gradient references unique per series, instance, and independent React root', async () => {
    const firstRoot = renderSurface(<GradientCharts suffix="one" />, {
      productProfile: 'events.organizer',
    });
    const secondRoot = renderSurface(<GradientCharts suffix="two" />, {
      productProfile: 'events.organizer',
    });

    // Renderer DOM: the migrated LineChart paints its area fill through CSS
    // (no gradient defs), so every gradient here now belongs to the AreaChart
    // renderer -- two per stacked instance -- and must stay uniquely scoped per
    // series, instance, and independent React root.
    await waitFor(() => {
      expect(firstRoot.container.querySelectorAll('linearGradient')).toHaveLength(2);
      expect(secondRoot.container.querySelectorAll('linearGradient')).toHaveLength(2);
    });

    const gradients = [...document.querySelectorAll<SVGLinearGradientElement>('linearGradient[id]')];
    const ids = gradients.map((gradient) => gradient.id);
    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => id.length > 0 && !id.includes(':'))).toBe(true);

    document.querySelectorAll<SVGPathElement>('path[data-part="area"][fill^="url(#"]').forEach((path) => {
      const fill = path.getAttribute('fill') ?? '';
      const id = fill.match(/^url\(#(.+)\)$/)?.[1];
      expect(id).toBeTruthy();
      expect(document.querySelectorAll(`linearGradient[id="${id}"]`)).toHaveLength(1);
      expect(path.closest('svg')?.querySelector(`linearGradient[id="${id}"]`)).toBeTruthy();
    });
  });
});
