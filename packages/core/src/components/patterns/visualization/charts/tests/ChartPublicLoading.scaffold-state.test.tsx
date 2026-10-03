import React from 'react';
import { describe, expect, it } from 'vitest';

import { NetworkGraph } from '../families/network-graph';
import { SankeyChart } from '../families/sankey';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

const NODES = [
  { id: 'a', label: 'A' },
  { id: 'b', label: 'B' },
];
const LINKS = [{ source: 'a', target: 'b', value: 5 }];
const SIZE = { width: 480, height: 280, responsive: false, animate: false } as const;

const FAMILIES = [
  {
    name: 'SankeyChart',
    className: 'ds-chart-sankey',
    render: (props: { loading?: boolean; skeleton?: boolean; state?: 'ready' | 'loading' }) => (
      <SankeyChart title="Flow" nodes={NODES} links={LINKS} {...SIZE} {...props} />
    ),
    renderError: () => (
      <SankeyChart title="Flow" nodes={NODES} links={LINKS} {...SIZE} loading state="error" errorLabel="Flow failed" />
    ),
  },
  {
    name: 'NetworkGraph',
    className: 'ds-chart-network-graph',
    render: (props: { loading?: boolean; skeleton?: boolean; state?: 'ready' | 'loading' }) => (
      <NetworkGraph title="Network" nodes={NODES} links={LINKS} {...SIZE} {...props} />
    ),
    renderError: () => (
      <NetworkGraph title="Network" nodes={NODES} links={LINKS} {...SIZE} loading state="error" errorLabel="Network failed" />
    ),
  },
] as const;

describe.each(FAMILIES)('$name public loading flag', ({ className, render, renderError }) => {
  const scaffoldOf = (container: HTMLElement) =>
    container.querySelector(`.${className}[data-part="chart-scaffold"]`);

  it('renders the loading state from the public flag without mounting the plot', () => {
    const { container } = renderSurface(render({ loading: true }));
    const scaffold = scaffoldOf(container);

    expect(scaffold).toHaveAttribute('data-state', 'loading');
    expect(scaffold).not.toHaveAttribute('data-skeleton');
    expect(container.querySelector('[data-part="loading"]')).not.toBeNull();
    expect(container.querySelector('[data-part="skeleton"]')).toBeNull();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('renders the skeleton loading variant from the public flag', () => {
    const { container } = renderSurface(render({ loading: true, skeleton: true }));
    const scaffold = scaffoldOf(container);

    expect(scaffold).toHaveAttribute('data-state', 'loading');
    expect(scaffold).toHaveAttribute('data-skeleton', 'true');
    expect(container.querySelectorAll('[data-part="skeleton-bar"]')).toHaveLength(4);
    expect(container.querySelector('[data-part="loading"]')).toHaveAttribute('role', 'status');
    expect(container.querySelector('svg')).toBeNull();
  });

  it('matches the explicit loading state', () => {
    const flag = renderSurface(render({ loading: true }));
    const flagMarkup = scaffoldOf(flag.container)?.outerHTML;
    flag.unmount();

    const explicit = renderSurface(render({ state: 'loading' }));
    expect(scaffoldOf(explicit.container)?.outerHTML).toBe(flagMarkup);
  });

  it('lets an explicit state win over the flag', () => {
    const ready = renderSurface(render({ loading: true, state: 'ready' }));
    expect(scaffoldOf(ready.container)).toHaveAttribute('data-state', 'ready');
    ready.unmount();

    const error = renderSurface(renderError());
    expect(scaffoldOf(error.container)).toHaveAttribute('data-state', 'error');
  });

  it('stays ready when the flag is off', () => {
    const { container } = renderSurface(render({ loading: false }));
    expect(scaffoldOf(container)).toHaveAttribute('data-state', 'ready');
  });
});
