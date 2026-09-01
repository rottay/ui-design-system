import React from 'react';
import { describe, expect, it } from 'vitest';

import { SankeyChart } from '..';
import { renderSurface } from '../../../../../../surfaces/foundation/common/test-utils';

const NODES = [
  { id: 'a', label: 'A' },
  { id: 'b', label: 'B' },
];
const LINKS = [{ source: 'a', target: 'b', value: 5 }];

describe('SankeyChart ChartImperativePlot wrap', () => {
  it('draws the d3 body inside the stable renderer surface via the bridge mount', () => {
    const { container } = renderSurface(
      <SankeyChart
        title="Flow"
        nodes={NODES}
        links={LINKS}
        width={480}
        height={280}
        responsive={false}
        animate={false}
      />,
    );

    const scaffold = container.querySelector('.ds-chart-sankey[data-part="chart-scaffold"]');
    expect(scaffold).toHaveAttribute('data-state', 'ready');

    const surface = container.querySelector('[data-part="chart-renderer"][data-renderer-id="sankey"]');
    expect(surface).not.toBeNull();

    const svg = surface!.querySelector('svg[data-part="chart-svg"]');
    expect(svg).not.toBeNull();
    // The surface owns the accessible name, so an imperative redraw of the mount
    // can never erase it. The surface `<title>` is the first title in the svg.
    expect(svg!.querySelector('title')).toHaveTextContent('Flow');

    const mount = svg!.querySelector('[data-part="imperative-mount"]');
    expect(mount).not.toBeNull();
    expect(mount!.querySelector('[data-part="plot-area"]')).not.toBeNull();
    expect(mount!.querySelectorAll('[data-part="node-mark"]')).toHaveLength(2);
  });

  it('stamps data-empty on the surface when there is no renderable flow', () => {
    const { container } = renderSurface(
      <SankeyChart
        title="Flow"
        nodes={[]}
        links={[]}
        width={480}
        height={280}
        responsive={false}
        animate={false}
      />,
    );

    expect(container.querySelector('[data-part="chart-renderer"]')).toHaveAttribute('data-empty', 'true');
    expect(container.querySelector('[data-part="plot-area"]')).toBeNull();
  });

  it('adopts the caller-declared empty state through the shared scaffold without mounting the plot', () => {
    const { container, getByText } = renderSurface(
      <SankeyChart
        title="Flow"
        nodes={[]}
        links={[]}
        state="empty"
        emptyLabel="No pipeline yet"
        width={480}
        height={280}
        responsive={false}
        animate={false}
      />,
    );

    expect(container.querySelector('.ds-chart-sankey[data-part="chart-scaffold"]')).toHaveAttribute('data-state', 'empty');
    expect(getByText('No pipeline yet')).toBeInTheDocument();
    // Non-ready states never mount the plot, so the renderer surface is absent.
    expect(container.querySelector('[data-part="chart-renderer"]')).toBeNull();
  });

  it('adopts the caller-declared error state as an assertive alert', () => {
    const { container, getByRole } = renderSurface(
      <SankeyChart
        title="Flow"
        nodes={NODES}
        links={LINKS}
        state="error"
        errorLabel="Flow failed to load"
        width={480}
        height={280}
        responsive={false}
        animate={false}
      />,
    );

    expect(container.querySelector('.ds-chart-sankey[data-part="chart-scaffold"]')).toHaveAttribute('data-state', 'error');
    expect(getByRole('alert')).toHaveTextContent('Flow failed to load');
    expect(container.querySelector('[data-part="chart-renderer"]')).toBeNull();
  });
});
