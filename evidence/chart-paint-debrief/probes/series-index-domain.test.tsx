import React from 'react';
import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RadarChart, ScatterChart, LineChart, AreaChart, BarChart } from '@ui/patterns/visualization/charts';
import { renderSurface } from '@ui/surfaces/foundation/common/test-utils';

const AXES = ['a', 'b', 'c'];
const mkRadar = (n: number) => Array.from({ length: n }, (_, i) => ({
  name: `S${i}`, data: AXES.map((ax) => ({ label: ax, value: (i + 1) * 10 })),
}));
const mkXY = (n: number) => Array.from({ length: n }, (_, i) => ({
  name: `S${i}`, data: [{ x: 'Jan', y: i + 1 }, { x: 'Feb', y: i + 2 }],
}));

function domain(container: Element, part: string) {
  return [...container.querySelectorAll(`[data-part="${part}"]`)]
    .map((n) => n.getAttribute('data-series-index'));
}

describe('FAM-09 probe: data-series-index domain per family', () => {
  it('radar with 6 series', async () => {
    const { container } = renderSurface(
      <RadarChart width={320} height={320} responsive={false} animate={false} series={mkRadar(6)} />);
    await waitFor(() => expect(container.querySelector('[data-part="series"]')).not.toBeNull());
    console.log(JSON.stringify({ family: 'radar', part: 'series',
      stamped: domain(container, 'series'), cssKeys: '1,2,3,4 (chart-radar)' }));
  });

  it('scatter with 12 series', async () => {
    const data = Array.from({ length: 12 }, (_, i) => ({ x: i, y: i, series: `S${i}` }));
    const { container } = renderSurface(
      <ScatterChart width={320} height={320} responsive={false} animate={false} data={data} legend />);
    await waitFor(() => expect(container.querySelector('[data-part="scatter-point-mark"]')).not.toBeNull());
    console.log(JSON.stringify({ family: 'scatter',
      marks: domain(container, 'scatter-point-mark'),
      legend: domain(container, 'legend-swatch'),
      cssKeys: '0..9 (chart-foundation)' }));
  });

  it('line with 7 series', async () => {
    const { container } = renderSurface(
      <LineChart width={320} height={320} responsive={false} animate={false} series={mkXY(7)} legend />);
    await waitFor(() => expect(container.querySelector('[data-part="line-series"]')).not.toBeNull());
    console.log(JSON.stringify({ family: 'line',
      marks: domain(container, 'line-series'), legend: domain(container, 'legend-swatch'),
      cssKeys: '1..4 (chart-line)' }));
  });

  it('area with 7 series', async () => {
    const { container } = renderSurface(
      <AreaChart width={320} height={320} responsive={false} animate={false} series={mkXY(7)} legend />);
    await waitFor(() => expect(container.querySelector('[data-part="area-series"]')).not.toBeNull());
    console.log(JSON.stringify({ family: 'area',
      marks: domain(container, 'area-series'), legend: domain(container, 'legend-swatch'),
      cssKeys: '1..4 (chart-area)' }));
  });

  it('bar with 7 series', async () => {
    const { container } = renderSurface(
      <BarChart width={320} height={320} responsive={false} animate={false} series={mkXY(7)} legend />);
    await waitFor(() => expect(container.querySelector('[data-part="bar-mark"]')).not.toBeNull());
    console.log(JSON.stringify({ family: 'bar',
      marks: [...new Set(domain(container, 'bar-mark'))],
      legend: domain(container, 'legend-swatch'),
      cssKeys: '1,3,5,7,9 odd-only (chart-foundation)' }));
  });
});
