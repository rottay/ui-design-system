import React from 'react';
import { describe, expect, it } from 'vitest';

import { NetworkGraph } from '..';
import { renderSurface } from '../../../../../../surfaces/foundation/common/test-utils';

const NODES = [
  { id: 'a', label: 'A' },
  { id: 'b', label: 'B' },
];
const LINKS = [{ source: 'a', target: 'b' }];

describe('NetworkGraph ChartImperativePlot wrap', () => {
  it('runs the force simulation inside the stable renderer surface via the bridge mount', () => {
    const { container } = renderSurface(
      <NetworkGraph
        title="Deps"
        nodes={NODES}
        links={LINKS}
        width={360}
        height={240}
        responsive={false}
        animate={false}
      />,
    );

    const scaffold = container.querySelector('.ds-chart-network-graph[data-part="chart-scaffold"]');
    expect(scaffold).toHaveAttribute('data-state', 'ready');

    const surface = container.querySelector('[data-part="chart-renderer"][data-renderer-id="network-graph"]');
    expect(surface).not.toBeNull();

    const svg = surface!.querySelector('svg[data-part="chart-svg"]');
    expect(svg).not.toBeNull();
    // The surface owns the accessible name a tick-driven redraw cannot erase.
    expect(svg!.querySelector('title')).toHaveTextContent('Deps');

    const mount = svg!.querySelector('[data-part="imperative-mount"]');
    expect(mount).not.toBeNull();
    expect(mount!.querySelectorAll('[data-part="node-mark"]')).toHaveLength(2);
    expect(mount!.querySelectorAll('[data-part="edge"]')).toHaveLength(1);
  });

  it('stamps data-empty on the surface when there is no network to render', () => {
    const { container } = renderSurface(
      <NetworkGraph
        title="Deps"
        nodes={[]}
        links={[]}
        width={360}
        height={240}
        responsive={false}
        animate={false}
      />,
    );

    expect(container.querySelector('[data-part="chart-renderer"]')).toHaveAttribute('data-empty', 'true');
    expect(container.querySelector('[data-part="node"]')).toBeNull();
  });

  it('adopts the caller-declared error state without mounting the simulation', () => {
    const { container, getByRole } = renderSurface(
      <NetworkGraph
        title="Deps"
        nodes={NODES}
        links={LINKS}
        state="error"
        errorLabel="Graph failed to load"
        width={360}
        height={240}
        responsive={false}
        animate={false}
      />,
    );

    expect(container.querySelector('.ds-chart-network-graph[data-part="chart-scaffold"]')).toHaveAttribute('data-state', 'error');
    expect(getByRole('alert')).toHaveTextContent('Graph failed to load');
    expect(container.querySelector('[data-part="chart-renderer"]')).toBeNull();
  });
});
