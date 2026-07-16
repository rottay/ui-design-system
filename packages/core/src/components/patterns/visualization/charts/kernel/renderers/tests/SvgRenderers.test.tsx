import React, { act, type CSSProperties } from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { TenantConfig } from '@/contracts';
import { DesignSystemProvider } from '@/runtime/bootstrap';
import { ChartFrame } from '../../ChartFrame';
import { SvgBarRenderer } from '../SvgBarRenderer';
import { SvgHeatMapRenderer } from '../SvgHeatMapRenderer';
import { SvgLineRenderer } from '../SvgLineRenderer';

const defaultResizeObserver = globalThis.ResizeObserver;

function measuredRect(width: number, height = 240): DOMRect {
  return {
    x: 0,
    y: 0,
    width,
    height,
    top: 0,
    right: width,
    bottom: height,
    left: 0,
    toJSON: () => ({}),
  };
}

function testTenant(slug: string, primaryColor: string): TenantConfig {
  return {
    slug,
    name: slug,
    engine: 'rustic',
    theme: 'light',
    plan: 'enterprise',
    features: ['all'],
    branding: {
      companyName: slug,
      primaryColor,
      accentColor: '#0f766e',
      darkPrimaryColor: '#93c5fd',
      darkAccentColor: '#5eead4',
    },
  };
}

function withProvider(tenant: TenantConfig, child: React.ReactElement): React.ReactElement {
  return (
    <DesignSystemProvider
      tenantConfig={tenant}
      productProfile="generic.default"
      forceEngine="rustic"
      skipCssLoading
    >
      {child}
    </DesignSystemProvider>
  );
}

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  globalThis.ResizeObserver = defaultResizeObserver;
  vi.restoreAllMocks();
});

describe('React-owned SVG renderers', () => {
  it('mounts as the declared full renderer inside ChartFrame', () => {
    render(
      <ChartFrame
        title="Quarterly profit"
        question="Which quarter contributed most?"
        projection={{
          desktop: { mode: 'full', rendererId: 'profit.svg-bar' },
          phone: {
            mode: 'summary',
            rendererId: 'profit.summary',
            summaryId: 'profit.total',
          },
        }}
        deviceClass="desktop"
        renderView={(view) => view.rendererId === 'profit.svg-bar' ? (
          <SvgBarRenderer
            ariaLabel="Profit by quarter"
            data={[{ id: 'q1', category: 'Q1', value: 12 }]}
          />
        ) : <div>Summary</div>}
      />,
    );

    expect(screen.getByRole('region', { name: 'Quarterly profit' })).toHaveAttribute(
      'data-renderer-id',
      'profit.svg-bar',
    );
    expect(screen.getByRole('img', { name: 'Profit by quarter' })).toBeInTheDocument();
  });

  it('server-renders and hydrates the same semantic bar tree', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(() => measuredRect(320, 280));
    const element = (
      <SvgBarRenderer
        ariaLabel="Profit by quarter"
        ariaDescription="Positive and negative profit values"
        width={480}
        height={280}
        data={[
          { id: 'q1', category: 'Q1', value: -4 },
          { id: 'q2', category: 'Q2', value: 12 },
        ]}
      />
    );
    const html = renderToString(element);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let root: Root | undefined;

    expect(container.querySelectorAll('[data-part="bar"]')).toHaveLength(2);
    expect(container.querySelector('svg title')?.textContent).toBe('Profit by quarter');
    expect(container.querySelector('svg desc')?.textContent).toBe(
      'Positive and negative profit values',
    );

    await act(async () => {
      root = hydrateRoot(container, element);
    });

    expect(container.querySelectorAll('[data-part="bar"]')).toHaveLength(2);
    expect(
      consoleError.mock.calls.some((call) => String(call[0]).toLowerCase().includes('hydration')),
    ).toBe(false);
    await waitFor(() => {
      expect(container.querySelector('[data-part="chart-svg"]'))
        .toHaveAttribute('viewBox', '0 0 320 280');
    });

    await act(async () => root?.unmount());
    container.remove();
  });

  it('hydrates the owner-dependent heatmap without replacing its semantic tree', async () => {
    const element = (
      <SvgHeatMapRenderer
        ariaLabel="Provider heatmap"
        ariaDescription="One provider-scoped cell"
        width={320}
        height={220}
        responsive={false}
        data={[{ id: 'cell-a', column: 'A', row: 'Only', value: 4 }]}
      />
    );
    const html = renderToString(element);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let root: Root | undefined;

    expect(container.querySelectorAll('[data-part="cell"]')).toHaveLength(1);
    expect(container.querySelector('svg title')?.textContent).toBe('Provider heatmap');

    await act(async () => {
      root = hydrateRoot(container, element);
    });

    await waitFor(() => {
      expect(container.querySelectorAll('[data-part="cell"]')).toHaveLength(1);
      expect(container.querySelector('svg desc')?.textContent).toBe('One provider-scoped cell');
    });
    expect(
      consoleError.mock.calls.some((call) => String(call[0]).toLowerCase().includes('hydration')),
    ).toBe(false);

    await act(async () => root?.unmount());
    container.remove();
  });

  it('reflows every renderer from the shared container observer without scaling its SVG', async () => {
    const resizeCallbacks: ResizeObserverCallback[] = [];
    const disconnects: Array<ReturnType<typeof vi.fn>> = [];
    class ControlledResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeCallbacks.push(callback);
        disconnects.push(this.disconnect);
      }

      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    globalThis.ResizeObserver = ControlledResizeObserver as unknown as typeof ResizeObserver;

    let containerWidth = 288;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(() => measuredRect(containerWidth));

    const { container, unmount } = render(
      <>
        <SvgBarRenderer
          ariaLabel="Responsive bars"
          height={240}
          data={[{ id: 'bar-a', category: 'A', value: 4 }]}
        />
        <SvgLineRenderer
          ariaLabel="Responsive line"
          height={240}
          series={[{
            id: 'line-a',
            label: 'A',
            points: [{ id: 'point-a', x: 'A', value: 4 }],
          }]}
        />
        <SvgHeatMapRenderer
          ariaLabel="Responsive heatmap"
          height={240}
          data={[{ id: 'cell-a', column: 'A', row: 'Only', value: 4 }]}
        />
      </>,
    );

    const chartSvg = (rendererId: string) => container.querySelector(
      `[data-part="chart-renderer"][data-renderer-id="${rendererId}"] > [data-part="chart-svg"]`,
    );

    await waitFor(() => {
      for (const rendererId of ['svg.bar', 'svg.line', 'svg.heatmap']) {
        expect(chartSvg(rendererId)).toHaveAttribute('viewBox', '0 0 288 240');
        expect(chartSvg(rendererId)).toHaveAttribute('width', '288');
        expect(chartSvg(rendererId)).toHaveAttribute('height', '240');
      }
    });
    expect(resizeCallbacks).toHaveLength(3);

    containerWidth = 640;
    await act(async () => {
      for (const callback of resizeCallbacks) {
        callback([], {} as ResizeObserver);
      }
    });

    await waitFor(() => {
      for (const rendererId of ['svg.bar', 'svg.line', 'svg.heatmap']) {
        expect(chartSvg(rendererId)).toHaveAttribute('viewBox', '0 0 640 240');
        expect(chartSvg(rendererId)).toHaveAttribute('width', '640');
      }
    });

    unmount();
    expect(disconnects).toHaveLength(3);
    for (const disconnect of disconnects) expect(disconnect).toHaveBeenCalledOnce();
  });

  it('preserves explicit geometry when responsive measurement is disabled', async () => {
    let observerCount = 0;
    class CountingResizeObserver {
      constructor() {
        observerCount += 1;
      }

      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    globalThis.ResizeObserver = CountingResizeObserver as unknown as typeof ResizeObserver;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(() => measuredRect(288));

    const { container } = render(
      <SvgBarRenderer
        ariaLabel="Fixed bars"
        width={480}
        height={280}
        responsive={false}
        data={[{ id: 'fixed-a', category: 'A', value: 4 }]}
      />,
    );

    const renderer = container.querySelector('[data-part="chart-renderer"]');
    const svg = container.querySelector('[data-part="chart-svg"]');
    await waitFor(() => {
      expect(renderer).toHaveAttribute('data-responsive', 'false');
      expect(svg).toHaveAttribute('viewBox', '0 0 480 280');
      expect(svg).toHaveAttribute('width', '480');
      expect(svg).toHaveAttribute('height', '280');
    });
    expect(observerCount).toBe(0);
  });

  it('reconciles line updates without retaining stale imperative marks', () => {
    const { rerender } = render(
      <SvgLineRenderer
        ariaLabel="Pipeline trend"
        series={[{
          id: 'pipeline',
          label: 'Pipeline',
          points: [
            { id: 'old-a', x: 'Jan', value: 10 },
            { id: 'old-b', x: 'Feb', value: 20 },
          ],
        }]}
      />,
    );

    rerender(
      <SvgLineRenderer
        ariaLabel="Pipeline trend"
        series={[{
          id: 'pipeline',
          label: 'Pipeline',
          points: [
            { id: 'new-a', x: 'Mar', value: 30 },
            { id: 'new-b', x: 'Apr', value: 15 },
          ],
        }]}
      />,
    );

    expect(document.querySelector('[data-datum-id="old-a"]')).not.toBeInTheDocument();
    expect(document.querySelector('[data-datum-id="old-b"]')).not.toBeInTheDocument();
    expect(document.querySelector('[data-datum-id="new-a"]')).toBeInTheDocument();
    expect(document.querySelector('[data-datum-id="new-b"]')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Pipeline trend' }).querySelector('title'))
      .toHaveTextContent('Pipeline trend');
  });

  it('preserves keyed bar nodes across prepend/reorder and exposes no hybrid tab stops', () => {
    const { rerender } = render(
      <SvgBarRenderer
        ariaLabel="Stable categories"
        data={[
          { id: 'beta', category: 'Beta', value: 2 },
          { id: 'gamma', category: 'Gamma', value: 3 },
        ]}
      />,
    );
    const betaBefore = document.querySelector('[data-datum-id="beta"]');

    rerender(
      <SvgBarRenderer
        ariaLabel="Stable categories"
        data={[
          { id: 'alpha', category: 'Alpha', value: 1 },
          { id: 'gamma', category: 'Gamma', value: 3 },
          { id: 'beta', category: 'Beta', value: 2 },
        ]}
      />,
    );

    expect(document.querySelector('[data-datum-id="beta"]')).toBe(betaBefore);
    expect(document.querySelectorAll('[data-part="bar-mark"][tabindex]')).toHaveLength(0);
    expect(screen.getByRole('img', { name: 'Stable categories' }))
      .not.toHaveAttribute('data-interaction');
    expect(screen.getByRole('img', { name: 'Stable categories' }).closest('[data-part="chart-renderer"]'))
      .toHaveAttribute('data-interaction', 'static');
  });

  it('keeps provider-scoped heatmap interpolation isolated across concurrent roots', async () => {
    const firstContainer = document.createElement('div');
    const secondContainer = document.createElement('div');
    document.body.append(firstContainer, secondContainer);
    const firstRoot = createRoot(firstContainer);
    const secondRoot = createRoot(secondContainer);
    const data = [
      { id: 'low', column: 'Low', row: 'Only', value: 0 },
      { id: 'high', column: 'High', row: 'Only', value: 10 },
    ];

    await act(async () => {
      firstRoot.render(withProvider(testTenant('tenant-one', '#005ea8'),
        <SvgHeatMapRenderer
          ariaLabel="Tenant one heatmap"
          data={data}
          style={{
            '--tenant-low': '#102030',
            '--tenant-high': '#405060',
          } as CSSProperties}
          colorRange={['var(--tenant-low)', 'var(--tenant-high)']}
        />,
      ));
      secondRoot.render(withProvider(testTenant('tenant-two', '#7c2d12'),
        <SvgHeatMapRenderer
          ariaLabel="Tenant two heatmap"
          data={data}
          style={{
            '--tenant-low': '#a0b0c0',
            '--tenant-high': '#d0e0f0',
          } as CSSProperties}
          colorRange={['var(--tenant-low)', 'var(--tenant-high)']}
        />,
      ));
    });

    await waitFor(() => {
      expect(firstContainer.querySelectorAll('[data-part="cell"]')).toHaveLength(2);
      expect(secondContainer.querySelectorAll('[data-part="cell"]')).toHaveLength(2);
    });

    const firstCells = [...firstContainer.querySelectorAll<SVGRectElement>('[data-part="cell"]')];
    const secondCells = [...secondContainer.querySelectorAll<SVGRectElement>('[data-part="cell"]')];
    const cellColor = (cell: SVGRectElement | undefined) =>
      cell?.style.getPropertyValue('--ds-chart-cell-color');

    await waitFor(() => {
      expect(cellColor(firstCells[0])).toBe('rgb(16, 32, 48)');
      expect(cellColor(firstCells[1])).toBe('rgb(64, 80, 96)');
      expect(cellColor(secondCells[0])).toBe('rgb(160, 176, 192)');
      expect(cellColor(secondCells[1])).toBe('rgb(208, 224, 240)');
    });
    expect(cellColor(firstCells[0])).not.toBe(cellColor(secondCells[0]));

    const firstTitleId = firstContainer.querySelector('svg')?.getAttribute('aria-labelledby');
    const secondTitleId = secondContainer.querySelector('svg')?.getAttribute('aria-labelledby');
    expect(firstTitleId).toBeTruthy();
    expect(secondTitleId).toBeTruthy();
    expect(firstTitleId).not.toBe(secondTitleId);

    await act(async () => {
      firstRoot.unmount();
      secondRoot.unmount();
    });
  });
});
