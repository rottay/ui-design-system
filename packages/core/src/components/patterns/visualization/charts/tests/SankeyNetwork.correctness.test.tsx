import React, { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NetworkGraph, SankeyChart } from '..';
import type { NetworkLink, NetworkNode } from '../families/network-graph';
import type { SankeyLink, SankeyNode } from '../families/sankey';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

const SANKEY_NODES: SankeyNode[] = [
  { id: 'source', label: 'Source' },
  { id: 'middle', label: 'Middle' },
  { id: 'target', label: 'Target' },
];

describe('SankeyChart defensive data handling', () => {
  it('rejects a cycle before layout and renders a deterministic visible code', () => {
    const { container } = renderSurface(
      <SankeyChart
        title="Cyclic flow"
        width={520}
        height={280}
        responsive={false}
        animate={false}
        nodes={SANKEY_NODES}
        links={[
          { source: 'source', target: 'middle', value: 4 },
          { source: 'middle', target: 'target', value: 3 },
          { source: 'target', target: 'source', value: 2 },
        ]}
      />,
    );

    const fallback = container.querySelector('[data-error-code="CYCLIC_FLOW"]');
    expect(fallback).toBeVisible();
    expect(fallback).toHaveTextContent('CYCLIC_FLOW');
    expect(container.querySelector('[data-part="plot-area"]')).toBeNull();
  });

  it.each([
    {
      caseName: 'duplicate node ids',
      nodes: [SANKEY_NODES[0], { id: 'source', label: 'Duplicate' }],
      links: [],
    },
    {
      caseName: 'a link with an unknown endpoint',
      nodes: SANKEY_NODES,
      links: [{ source: 'source', target: 'missing', value: 2 }],
    },
    {
      caseName: 'a non-positive flow value',
      nodes: SANKEY_NODES,
      links: [{ source: 'source', target: 'target', value: 0 }],
    },
    {
      caseName: 'a non-finite flow value',
      nodes: SANKEY_NODES,
      links: [{ source: 'source', target: 'target', value: Number.NaN }],
    },
  ] satisfies Array<{ caseName: string; nodes: SankeyNode[]; links: SankeyLink[] }>) (
    'renders INVALID_DATA for $caseName',
    ({ nodes, links }) => {
      const { container } = renderSurface(
        <SankeyChart
          width={520}
          height={280}
          responsive={false}
          animate={false}
          nodes={nodes}
          links={links}
        />,
      );

      const fallback = container.querySelector('[data-error-code="INVALID_DATA"]');
      expect(fallback).toBeVisible();
      expect(fallback).toHaveTextContent('INVALID_DATA');
      expect(container.querySelector('[data-part="plot-area"]')).toBeNull();
    },
  );

  it('clears an existing layout when the graph becomes empty', () => {
    function EmptyableSankey() {
      const [empty, setEmpty] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setEmpty(true)}>Empty Sankey</button>
          <SankeyChart
            width={520}
            height={280}
            responsive={false}
            animate={false}
            nodes={empty ? [] : SANKEY_NODES}
            links={empty ? [] : [{ source: 'source', target: 'target', value: 2 }]}
          />
        </>
      );
    }

    const { container } = renderSurface(<EmptyableSankey />);
    expect(container.querySelectorAll('.sankey-node')).toHaveLength(3);

    fireEvent.click(screen.getByRole('button', { name: 'Empty Sankey' }));

    expect(container.querySelector('.sankey-node')).toBeNull();
    expect(container.querySelector('.sankey-link')).toBeNull();
    expect(container.querySelector('[data-error-code]')).toBeNull();
    expect(container.querySelector('[data-part="chart-fallback"][data-state="empty"]'))
      .toHaveTextContent('No flow data to display.');
  });

  it('lays out frozen inputs without mutating consumer-owned data', () => {
    const nodes = Object.freeze(
      SANKEY_NODES.map((node) => Object.freeze({ ...node })),
    ) as unknown as SankeyNode[];
    const links = Object.freeze([
      Object.freeze({ source: 'source', target: 'target', value: 2 }),
    ]) as unknown as SankeyLink[];
    const before = JSON.stringify({ nodes, links });

    const { container } = renderSurface(
      <SankeyChart
        nodes={nodes}
        links={links}
        animate={false}
        width={520}
        height={280}
        responsive={false}
      />,
    );

    expect(container.querySelectorAll('[data-part="node"]')).toHaveLength(3);
    expect(JSON.stringify({ nodes, links })).toBe(before);
  });
});

describe('NetworkGraph instance and lifecycle correctness', () => {
  it('uses instance-unique marker ids and keeps every reference local to its svg', () => {
    const graph = {
      nodes: [{ id: 'a' }, { id: 'b' }],
      links: [{ source: 'a', target: 'b' }],
    };
    const { container } = renderSurface(
      <>
        <NetworkGraph {...graph} directed animate={false} width={320} height={220} responsive={false} />
        <NetworkGraph {...graph} directed animate={false} width={320} height={220} responsive={false} />
      </>,
    );

    const svgs = [...container.querySelectorAll<SVGSVGElement>('.ds-chart-network-graph svg')];
    const markerIds = svgs.map((svg) => svg.querySelector('marker')?.id);
    const definitionsIds = svgs.map((svg) => svg.querySelector('defs')?.id);
    expect(markerIds).toHaveLength(2);
    expect(new Set(markerIds).size).toBe(2);
    expect(definitionsIds).toHaveLength(2);
    expect(new Set(definitionsIds).size).toBe(2);

    for (const svg of svgs) {
      const marker = svg.querySelector('marker');
      const definitions = svg.querySelector('defs');
      const edge = svg.querySelector('[data-part="edge"]');
      expect(marker?.id).toBeTruthy();
      expect(definitions?.id).toMatch(/^network-definitions-/);
      expect(edge?.getAttribute('marker-end')).toBe(`url(#${marker!.id})`);
      expect(document.getElementById(marker!.id)).toBe(marker);
      expect(document.getElementById(definitions!.id)).toBe(definitions);
    }
  });

  it.each([
    {
      caseName: 'duplicate node ids',
      nodes: [{ id: 'a' }, { id: 'a' }],
      links: [],
    },
    {
      caseName: 'an unknown endpoint',
      nodes: [{ id: 'a' }, { id: 'b' }],
      links: [{ source: 'a', target: 'missing', value: 4 }],
    },
    {
      caseName: 'a non-finite edge value',
      nodes: [{ id: 'a' }, { id: 'b' }],
      links: [{ source: 'a', target: 'b', value: Number.NaN }],
    },
    {
      caseName: 'a non-positive node size',
      nodes: [{ id: 'a', size: 0 }, { id: 'b' }],
      links: [],
    },
  ] satisfies Array<{ caseName: string; nodes: NetworkNode[]; links: NetworkLink[] }>) (
    'rejects $caseName before starting the simulation',
    ({ nodes, links }) => {
      const { container } = renderSurface(
        <NetworkGraph
          nodes={nodes}
          links={links}
          animate={false}
          width={360}
          height={240}
          responsive={false}
        />,
      );

      expect(container.querySelector('[data-error-code="INVALID_DATA"]')).toBeVisible();
      expect(container.querySelector('[data-part="node"]')).toBeNull();
      expect(container.querySelector('[data-part="edge"]')).toBeNull();
      expect(container.querySelector('svg')?.innerHTML).not.toContain('NaN');
    },
  );

  it('simulates frozen inputs without mutating consumer-owned data', () => {
    const nodes = Object.freeze([
      Object.freeze({ id: 'a', label: 'A' }),
      Object.freeze({ id: 'b', label: 'B' }),
    ]) as unknown as NetworkNode[];
    const links = Object.freeze([
      Object.freeze({ source: 'a', target: 'b', value: 2 }),
    ]) as unknown as NetworkLink[];
    const before = JSON.stringify({ nodes, links });

    const { container } = renderSurface(
      <NetworkGraph
        nodes={nodes}
        links={links}
        animate={false}
        width={360}
        height={240}
        responsive={false}
      />,
    );

    expect(container.querySelectorAll('[data-part="node"]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-part="edge"]')).toHaveLength(1);
    expect(container.querySelector('svg')?.innerHTML).not.toContain('NaN');
    expect(JSON.stringify({ nodes, links })).toBe(before);
  });

  it('preserves positions by node id across rerenders and clears on empty', () => {
    function StatefulNetwork() {
      const [mode, setMode] = useState<'initial' | 'reordered' | 'empty'>('initial');
      const initialNodes = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
      const graphNodes = mode === 'empty'
        ? []
        : mode === 'reordered'
          ? [...initialNodes].reverse()
          : initialNodes;

      return (
        <>
          <button type="button" onClick={() => setMode('reordered')}>Reorder Network</button>
          <button type="button" onClick={() => setMode('empty')}>Empty Network</button>
          <NetworkGraph
            nodes={graphNodes}
            links={[]}
            animate
            width={360}
            height={240}
            responsive={false}
          />
        </>
      );
    }

    const { container, unmount } = renderSurface(<StatefulNetwork />);
    const positionsById = () => Object.fromEntries(
      [...container.querySelectorAll<SVGGElement>('[data-part="node"]')]
        .map((node) => [node.dataset.nodeId!, node.getAttribute('transform')]),
    );

    const initialPositions = positionsById();
    expect(Object.keys(initialPositions)).toHaveLength(3);

    fireEvent.click(screen.getByRole('button', { name: 'Reorder Network' }));
    expect(positionsById()).toEqual(initialPositions);

    fireEvent.click(screen.getByRole('button', { name: 'Empty Network' }));
    expect(container.querySelector('[data-part="node"]')).toBeNull();
    expect(container.querySelector('[data-part="edge"]')).toBeNull();
    expect(container.querySelector('[data-part="definitions"]')).toBeNull();
    expect(container.querySelector('[data-part="chart-fallback"][data-state="empty"]'))
      .toHaveTextContent('No network data to display.');

    unmount();
    expect(container).toBeEmptyDOMElement();
  });

  it('stops a live simulation when unmounted', () => {
    const { container, unmount } = renderSurface(
      <NetworkGraph
        nodes={[{ id: 'a' }, { id: 'b' }]}
        links={[{ source: 'a', target: 'b' }]}
        animate
        width={360}
        height={240}
        responsive={false}
      />,
    );

    expect(container.querySelectorAll('[data-part="node"]')).toHaveLength(2);
    unmount();
    expect(container).toBeEmptyDOMElement();
  });
});
