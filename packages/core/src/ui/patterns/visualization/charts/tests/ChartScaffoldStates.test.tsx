import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChartScaffold, resolveChartScaffoldState } from '../presentation/scaffold';

function scaffoldRefs() {
  return {
    containerRef: createRef<HTMLDivElement>(),
    svgRef: createRef<SVGSVGElement>(),
  };
}

const BASE_PROPS = {
  height: 320,
  loadingLabel: 'Loading revenue',
  ariaLabel: 'Revenue chart',
  ariaDescription: 'Revenue chart states.',
} as const;

describe('ChartScaffold lifecycle states', () => {
  it('renders the empty state with app copy, polite announcement, and no plot', () => {
    const plot = vi.fn(() => <svg data-testid="plot-svg" />);
    const { container } = render(
      <ChartScaffold
        {...scaffoldRefs()}
        {...BASE_PROPS}
        title="Revenue"
        state="empty"
        emptyLabel="No revenue yet"
        emptyDescription="Connect a source to populate this chart."
        emptyAction={<button type="button">Connect</button>}
        plot={plot}
      />,
    );

    const scaffold = container.querySelector('[data-part="chart-scaffold"]');
    expect(scaffold).toHaveAttribute('data-state', 'empty');

    const state = screen.getByRole('status');
    expect(state).toHaveAttribute('aria-live', 'polite');
    expect(state).toHaveAttribute('data-state', 'empty');
    expect(screen.getByText('No revenue yet')).toBeInTheDocument();
    expect(screen.getByText('Connect a source to populate this chart.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();

    expect(plot).not.toHaveBeenCalled();
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('renders the error state as an assertive alert without mounting the plot', () => {
    const plot = vi.fn(() => <svg data-testid="plot-svg" />);
    const { container } = render(
      <ChartScaffold
        {...scaffoldRefs()}
        {...BASE_PROPS}
        state="error"
        errorLabel="Revenue failed to load"
        errorDescription="The data service rejected the request."
        plot={plot}
      />,
    );

    const scaffold = container.querySelector('[data-part="chart-scaffold"]');
    expect(scaffold).toHaveAttribute('data-state', 'error');

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(screen.getByText('Revenue failed to load')).toBeInTheDocument();
    expect(screen.getByText('The data service rejected the request.')).toBeInTheDocument();

    expect(plot).not.toHaveBeenCalled();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('keeps the legacy loading alias and the explicit loading state equivalent', () => {
    const plot = vi.fn(() => <svg data-testid="plot-svg" />);
    const legacy = render(
      <ChartScaffold {...scaffoldRefs()} {...BASE_PROPS} loading plot={plot} />,
    );
    const legacyScaffold = legacy.container.querySelector('[data-part="chart-scaffold"]');
    expect(legacyScaffold).toHaveAttribute('data-state', 'loading');
    expect(legacy.container.querySelector('[data-part="loading"]')).toHaveTextContent('Loading revenue');
    legacy.unmount();

    const explicit = render(
      <ChartScaffold {...scaffoldRefs()} {...BASE_PROPS} state="loading" plot={plot} />,
    );
    const explicitScaffold = explicit.container.querySelector('[data-part="chart-scaffold"]');
    expect(explicitScaffold).toHaveAttribute('data-state', 'loading');
    expect(explicit.container.querySelector('[data-part="loading"]')).toHaveTextContent('Loading revenue');

    expect(plot).not.toHaveBeenCalled();
  });

  it('renders the skeleton loading variant with decorative bars and an announced label', () => {
    const { container } = render(
      <ChartScaffold {...scaffoldRefs()} {...BASE_PROPS} state="loading" skeleton />,
    );

    const scaffold = container.querySelector('[data-part="chart-scaffold"]');
    expect(scaffold).toHaveAttribute('data-state', 'loading');
    expect(scaffold).toHaveAttribute('data-skeleton', 'true');

    const skeleton = container.querySelector('[data-part="skeleton"]');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('[data-part="skeleton-bar"]').length).toBeGreaterThanOrEqual(3);

    expect(screen.getByRole('status')).toHaveTextContent('Loading revenue');
    expect(container.querySelector('svg')).toBeNull();
  });

  it('does not stamp the skeleton attribute on the default loading presentation', () => {
    const { container } = render(
      <ChartScaffold {...scaffoldRefs()} {...BASE_PROPS} loading />,
    );

    const scaffold = container.querySelector('[data-part="chart-scaffold"]');
    expect(scaffold).not.toHaveAttribute('data-skeleton');
    expect(container.querySelector('[data-part="skeleton"]')).toBeNull();
  });

  it('mounts the plot only in the ready state', () => {
    const plot = vi.fn(() => <svg role="img" aria-label="Ready plot" data-testid="plot-svg" />);
    render(<ChartScaffold {...scaffoldRefs()} {...BASE_PROPS} plot={plot} />);

    expect(plot).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('plot-svg')).toBeInTheDocument();
  });
});

describe('resolveChartScaffoldState', () => {
  it('lets an explicit state win over every other fact', () => {
    expect(
      resolveChartScaffoldState({ state: 'error', loading: true, dataCount: 0, emptyLabel: 'Empty' }),
    ).toBe('error');
  });

  it('maps the legacy loading alias to the loading state', () => {
    expect(resolveChartScaffoldState({ loading: true, dataCount: 5 })).toBe('loading');
  });

  it('activates the automatic empty state only with app-supplied copy', () => {
    expect(resolveChartScaffoldState({ dataCount: 0, emptyLabel: 'Nothing yet' })).toBe('empty');
    expect(resolveChartScaffoldState({ dataCount: 0 })).toBe('ready');
    expect(resolveChartScaffoldState({ dataCount: 0, emptyLabel: null })).toBe('ready');
  });

  it('resolves to ready when data is present', () => {
    expect(resolveChartScaffoldState({ dataCount: 3, emptyLabel: 'Nothing yet' })).toBe('ready');
  });
});
