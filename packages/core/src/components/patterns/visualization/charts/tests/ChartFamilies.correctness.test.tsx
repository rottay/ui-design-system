import React, { useState, type Dispatch, type SetStateAction } from 'react';
import { describe, expect, it } from 'vitest';
import { act, waitFor } from '@testing-library/react';

import { BulletChart, FunnelChart, PieChart, RadarChart } from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

function expectFiniteSvg(container: HTMLElement): void {
  const svgMarkup = container.querySelector('svg')?.innerHTML ?? '';
  expect(svgMarkup).not.toMatch(/NaN|Infinity|-Infinity/);
}

describe('chart family mathematical correctness', () => {
  it('PieChart rejects unsupported values and removes prior marks on empty data', async () => {
    type Variant = 'valid' | 'empty' | 'negative';
    let setVariant: Dispatch<SetStateAction<Variant>> = () => undefined;
    function Harness() {
      const [variant, updateVariant] = useState<Variant>('valid');
      setVariant = updateVariant;
      const data = variant === 'valid'
        ? [{ label: 'A', value: 10 }, { label: 'B', value: 10 }]
        : variant === 'negative'
          ? [{ label: 'Debt', value: -4 }]
          : [];
      return <PieChart width={360} height={260} responsive={false} animate data={data} />;
    }
    const view = renderSurface(<Harness />);

    await waitFor(() => {
      expect(view.container.querySelectorAll('[data-part="pie-slice"]')).toHaveLength(2);
    });

    act(() => setVariant('empty'));

    await waitFor(() => {
      expect(view.container.querySelectorAll('[data-part="pie-slice"]')).toHaveLength(0);
      expect(view.container.querySelector('[data-part="data-fallback"]')).toHaveTextContent('No data');
    });

    act(() => setVariant('negative'));

    await waitFor(() => {
      expect(view.container.querySelector('[data-part="data-fallback"]')).toHaveTextContent('negative');
      expect(view.container.querySelectorAll('[data-part="pie-slice"]')).toHaveLength(0);
    });
    expectFiniteSvg(view.container);
  });

  it('FunnelChart keeps zero/constant/conversion geometry deterministic', async () => {
    type Variant = 'zero' | 'valid' | 'empty';
    let setVariant: Dispatch<SetStateAction<Variant>> = () => undefined;
    function Harness() {
      const [variant, updateVariant] = useState<Variant>('zero');
      setVariant = updateVariant;
      const data = variant === 'zero'
        ? [{ label: 'A', value: 0 }, { label: 'B', value: 0 }]
        : variant === 'valid'
          ? [
              { label: 'Zero entry', value: 0 },
              { label: 'Recovered', value: 5 },
              { label: 'Constant', value: 5 },
            ]
          : [];
      return (
        <FunnelChart
          width={420}
          height={280}
          responsive={false}
          animate={false}
          showConversion
          data={data}
        />
      );
    }
    const view = renderSurface(<Harness />);

    await waitFor(() => {
      expect(view.container.querySelector('[data-part="data-fallback"]')).toHaveTextContent('no positive');
      expect(view.container.querySelectorAll('[data-part="segment"]')).toHaveLength(0);
    });
    expectFiniteSvg(view.container);

    act(() => setVariant('valid'));

    await waitFor(() => {
      expect(view.container.querySelectorAll('[data-part="segment"]')).toHaveLength(3);
      expect(view.container.querySelector('[data-part="conversion-label"]')).toHaveTextContent('N/A');
    });
    expectFiniteSvg(view.container);

    act(() => setVariant('empty'));
    await waitFor(() => {
      expect(view.container.querySelectorAll('[data-part="segment"]')).toHaveLength(0);
    });
  });

  it('RadarChart keeps zero values at the origin and adds a visible zero marker', async () => {
    type Variant = 'zero' | 'negative' | 'empty';
    let setVariant: Dispatch<SetStateAction<Variant>> = () => undefined;
    function Harness() {
      const [variant, updateVariant] = useState<Variant>('zero');
      setVariant = updateVariant;
      const data = variant === 'zero'
        ? [{ axis: 'A', value: 0 }, { axis: 'B', value: 0 }, { axis: 'C', value: 0 }]
        : variant === 'negative'
          ? [{ axis: 'A', value: -1 }, { axis: 'B', value: 2 }, { axis: 'C', value: 3 }]
          : [];
      return <RadarChart width={360} height={300} responsive={false} animate={false} data={data} />;
    }
    const view = renderSurface(<Harness />);

    const area = await waitFor(() => {
      const currentArea = view.container.querySelector('[data-part="series-area"]');
      expect(currentArea).toHaveAttribute('data-state', 'zero-baseline');
      return currentArea as SVGPolygonElement;
    });
    const points = (area.getAttribute('points') ?? '').split(' ').filter(Boolean);
    expect(new Set(points)).toEqual(new Set(['0,0']));
    const zeroMarker = view.container.querySelector('[data-part="zero-baseline"]');
    expect(zeroMarker).toBeInTheDocument();
    expect(Number(zeroMarker?.getAttribute('r'))).toBeGreaterThan(0);
    view.container.querySelectorAll('[data-part="series-point"]').forEach((point) => {
      expect(Number(point.getAttribute('cx'))).toBeCloseTo(0, 6);
      expect(Number(point.getAttribute('cy'))).toBeCloseTo(0, 6);
    });
    expectFiniteSvg(view.container);

    act(() => setVariant('negative'));
    await waitFor(() => {
      expect(view.container.querySelector('[data-part="data-fallback"]')).toHaveTextContent('negative');
      expect(view.container.querySelectorAll('[data-part="series-area"]')).toHaveLength(0);
    });

    act(() => setVariant('empty'));
    await waitFor(() => {
      expect(view.container.querySelector('[data-part="data-fallback"]')).toHaveTextContent('No data');
      expect(view.container.querySelectorAll('[data-part="series-area"]')).toHaveLength(0);
    });
  });

  it('BulletChart renders negative domains on both sides of a zero baseline', async () => {
    const negativeItem = {
      label: 'Variance',
      value: -40,
      target: 20,
      ranges: [-20, 10, 40] as [number, number, number],
    };
    type Variant = 'horizontal' | 'vertical' | 'misordered' | 'invalid' | 'empty';
    let setVariant: Dispatch<SetStateAction<Variant>> = () => undefined;
    function Harness() {
      const [variant, updateVariant] = useState<Variant>('horizontal');
      setVariant = updateVariant;
      const data = variant === 'invalid'
        ? { label: 'Invalid', value: Number.NaN, target: 0 }
        : variant === 'misordered'
          ? { label: 'Misordered', value: 20, target: 25, ranges: [30, 10, 20] as [number, number, number] }
        : variant === 'empty'
          ? []
          : negativeItem;
      return (
        <BulletChart
          width={variant === 'vertical' ? 240 : 440}
          height={variant === 'vertical' ? 260 : 100}
          responsive={false}
          animate={false}
          orientation={variant === 'vertical' ? 'vertical' : 'horizontal'}
          data={data}
        />
      );
    }
    const view = renderSurface(<Harness />);

    await waitFor(() => {
      expect(view.container.querySelector('[data-part="zero-baseline"]')).toBeInTheDocument();
    });
    const baseline = view.container.querySelector('[data-part="zero-baseline"]') as SVGLineElement;
    const valueBar = view.container.querySelector('[data-part="value-bar"]') as SVGRectElement;
    const baselineX = Number(baseline.getAttribute('x1'));
    const valueX = Number(valueBar.getAttribute('x'));
    const valueWidth = Number(valueBar.getAttribute('width'));
    expect(valueBar).toHaveAttribute('data-direction', 'negative');
    expect(valueX).toBeLessThan(baselineX);
    expect(valueX + valueWidth).toBeCloseTo(baselineX, 5);
    expect(valueWidth).toBeGreaterThan(0);
    expectFiniteSvg(view.container);

    act(() => setVariant('vertical'));
    await waitFor(() => {
      const verticalBar = view.container.querySelector('[data-part="value-bar"]');
      expect(verticalBar).toHaveAttribute('data-direction', 'negative');
      expect(Number(verticalBar?.getAttribute('height'))).toBeGreaterThan(0);
    });
    expectFiniteSvg(view.container);

    act(() => setVariant('misordered'));
    await waitFor(() => {
      expect(view.container.querySelector('[data-part="data-fallback"]')).toHaveTextContent('ordered');
      expect(view.container.querySelectorAll('[data-part="item"]')).toHaveLength(0);
    });

    act(() => setVariant('invalid'));
    await waitFor(() => {
      expect(view.container.querySelector('[data-part="data-fallback"]')).toHaveTextContent('finite');
      expect(view.container.querySelectorAll('[data-part="item"]')).toHaveLength(0);
    });

    act(() => setVariant('empty'));
    await waitFor(() => {
      expect(view.container.querySelector('[data-part="data-fallback"]')).toHaveTextContent('No data');
      expect(view.container.querySelectorAll('[data-part="item"]')).toHaveLength(0);
    });
  });
});
