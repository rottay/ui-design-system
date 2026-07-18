import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React, { act, type CSSProperties } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { TenantConfig } from '@/foundation/contracts';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { resolveChartSeriesPaint } from '../../../../foundation/grammar/palette';
import { ChartFrame } from '../../projection/frame';
import { SvgBarRenderer } from '../bar';
import { SvgHeatMapRenderer } from '../heat-map';
import { createSvgLineDatumKey } from '../line/datum-key';
import { SvgLineRenderer } from '../line';
import { SvgScatterRenderer } from '../scatter';

const defaultResizeObserver = globalThis.ResizeObserver;
const CHART_FOUNDATION_CSS = readFileSync(
  join(__dirname, '../../../../../../../../../../foundation/tokens/css/presentation/components/skin/chart-foundation.css'),
  'utf8',
);

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
  it('keeps every bounded palette mapped to the same provider-scoped CSS channels', () => {
    for (const scheme of ['default', 'accessible', 'monochrome', 'pastel', 'vibrant'] as const) {
      expect(CHART_FOUNDATION_CSS).toContain(`data-chart-color-scheme='${scheme}'`);
      resolveChartSeriesPaint(scheme).forEach((paint, index) => {
        expect(CHART_FOUNDATION_CSS).toContain(`--ds-chart-paint-${index + 1}: ${paint};`);
      });
    }
  });

  it('never defines the reserved tenant series channel in the skin', () => {
    // --ds-chart-series-N is owned exclusively by the tenant appearance
    // compiler; a skin-level definition would shadow the inherited tenant
    // palette. The skin may only CONSUME it inside var() chains.
    expect(CHART_FOUNDATION_CSS).not.toMatch(/--ds-chart-series-\d+\s*:/);
  });

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
        <SvgScatterRenderer
          ariaLabel="Responsive scatter"
          height={240}
          data={[{ id: 'point-a', label: 'A', x: 1, y: 4 }]}
        />
      </>,
    );

    const chartSvg = (rendererId: string) => container.querySelector(
      `[data-part="chart-renderer"][data-renderer-id="${rendererId}"] > [data-part="chart-svg"]`,
    );

    await waitFor(() => {
      for (const rendererId of ['svg.bar', 'svg.line', 'svg.heatmap', 'svg.scatter']) {
        expect(chartSvg(rendererId)).toHaveAttribute('viewBox', '0 0 288 240');
        expect(chartSvg(rendererId)).toHaveAttribute('width', '288');
        expect(chartSvg(rendererId)).toHaveAttribute('height', '240');
      }
    });
    expect(resizeCallbacks).toHaveLength(4);

    containerWidth = 640;
    await act(async () => {
      for (const callback of resizeCallbacks) {
        callback([], {} as ResizeObserver);
      }
    });

    await waitFor(() => {
      for (const rendererId of ['svg.bar', 'svg.line', 'svg.heatmap', 'svg.scatter']) {
        expect(chartSvg(rendererId)).toHaveAttribute('viewBox', '0 0 640 240');
        expect(chartSvg(rendererId)).toHaveAttribute('width', '640');
      }
    });

    unmount();
    expect(disconnects).toHaveLength(4);
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

  it('explores bars with one roving focus target and an anchored accessible tooltip', async () => {
    const changes = vi.fn();
    const { container } = render(
      <SvgBarRenderer
        ariaLabel="Interactive pipeline"
        responsive={false}
        data={[
          { id: 'screening', category: 'Screening', value: 12 },
          { id: 'offer', category: 'Offer', value: 4 },
        ]}
        interaction={{
          mode: 'explore',
          onActiveChange: changes,
          renderTooltip: ({ datum }) => datum.id === 'offer'
            ? 0
            : `${datum.category}: ${datum.value}`,
        }}
      />,
    );
    const screening = screen.getByRole('img', { name: 'Screening: 12' });
    const offer = screen.getByRole('img', { name: 'Offer: 4' });
    const chart = screen.getByRole('group', { name: 'Interactive pipeline' });

    expect(chart).toHaveAttribute('data-interaction', 'explore');
    const initialTabStops = container.querySelectorAll(
      '[data-chart-datum-key][tabindex="0"]',
    );
    expect(initialTabStops).toHaveLength(1);
    expect(initialTabStops.item(0)).toBe(screening);
    expect(container.querySelectorAll('[data-part="interaction-target"]')).toHaveLength(2);

    fireEvent.pointerOver(screening, { pointerType: 'mouse' });
    const hoverTooltip = screen.getByRole('tooltip');
    expect(hoverTooltip).toHaveAttribute('data-side', 'bottom');
    fireEvent.pointerOut(screening, {
      pointerType: 'mouse',
      relatedTarget: hoverTooltip,
    });
    expect(screen.getByRole('tooltip')).toBe(hoverTooltip);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.pointerOver(screening, { pointerType: 'mouse' });
    const reopenedTooltip = screen.getByRole('tooltip');
    fireEvent.pointerOut(screening, {
      pointerType: 'mouse',
      relatedTarget: reopenedTooltip,
    });
    fireEvent.pointerOut(reopenedTooltip, {
      pointerType: 'mouse',
      relatedTarget: container,
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.focus(screening);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Screening: 12');
    expect(screening).toHaveAttribute('aria-describedby', screen.getByRole('tooltip').id);

    fireEvent.keyDown(screening, { key: 'ArrowRight' });
    await waitFor(() => expect(document.activeElement).toBe(offer));
    const movedTabStops = container.querySelectorAll(
      '[data-chart-datum-key][tabindex="0"]',
    );
    expect(movedTabStops).toHaveLength(1);
    expect(movedTabStops.item(0)).toBe(offer);
    expect(screen.getByRole('tooltip')).toHaveTextContent('0');
    expect(screen.getByRole('tooltip')).toHaveAttribute('data-side', 'top');
    expect(changes).toHaveBeenLastCalledWith(
      expect.objectContaining({ key: 'offer', datum: expect.objectContaining({ id: 'offer' }) }),
      { input: 'keyboard', reason: 'focus' },
    );
  });

  it('invokes select actions from delegated pointer and keyboard input', () => {
    const action = vi.fn();
    render(
      <SvgBarRenderer
        ariaLabel="Selectable stages"
        responsive={false}
        data={[
          { id: 'first', category: 'First', value: 1 },
          { id: 'second', category: 'Second', value: 2 },
        ]}
        interaction={{
          mode: 'select',
          actionLabel: 'Select stage',
          onAction: action,
        }}
      />,
    );
    const first = screen.getByRole('button', { name: 'First: 1. Select stage' });
    const second = screen.getByRole('button', { name: 'Second: 2. Select stage' });

    fireEvent.pointerDown(second, { pointerType: 'mouse' });
    fireEvent.click(second);
    expect(action).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ key: 'second', datum: expect.objectContaining({ id: 'second' }) }),
      { input: 'pointer', pointerType: 'mouse', reason: 'action' },
    );

    fireEvent.focus(first);
    fireEvent.keyDown(first, { key: 'Enter' });
    expect(action).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ key: 'first', datum: expect.objectContaining({ id: 'first' }) }),
      { input: 'keyboard', reason: 'action' },
    );
  });

  it('keeps repeated line point ids unique and interactive when dots are visually hidden', () => {
    const { container } = render(
      <SvgLineRenderer
        ariaLabel="Two projections"
        responsive={false}
        showDots={false}
        series={[
          {
            id: 'forecast',
            label: 'Forecast',
            points: [{ id: 'july', x: 'Jul', value: 8 }],
          },
          {
            id: 'actual',
            label: 'Actual',
            points: [{ id: 'july', x: 'Jul', value: 7 }],
          },
        ]}
        interaction={{ mode: 'explore' }}
      />,
    );
    const marks = [...container.querySelectorAll('[data-part="line-point-mark"]')];

    expect(marks).toHaveLength(2);
    expect(marks.map((mark) => mark.getAttribute('data-chart-datum-key'))).toEqual([
      createSvgLineDatumKey('forecast', 'july'),
      createSvgLineDatumKey('actual', 'july'),
    ]);
    expect(new Set(marks.map((mark) => mark.getAttribute('data-chart-datum-key'))).size).toBe(2);
    expect(container.querySelectorAll('[data-part="point"]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-part="interaction-target"]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-chart-datum-key][tabindex="0"]')).toHaveLength(1);
  });

  it('navigates heatmap cells by visual row and column', async () => {
    const { container } = render(
      <SvgHeatMapRenderer
        ariaLabel="Capacity matrix"
        responsive={false}
        data={[
          { id: 'r1c1', column: 'Week 1', row: 'Team A', value: 1 },
          { id: 'r1c2', column: 'Week 2', row: 'Team A', value: 2 },
          { id: 'r2c1', column: 'Week 1', row: 'Team B', value: 3 },
          { id: 'r2c2', column: 'Week 2', row: 'Team B', value: 4 },
        ]}
        interaction={{ mode: 'explore' }}
      />,
    );
    const cell = (id: string) => container.querySelector(
      `[data-part="heatmap-cell-mark"][data-datum-id="${id}"]`,
    ) as SVGGElement;

    fireEvent.focus(cell('r1c1'));
    fireEvent.keyDown(cell('r1c1'), { key: 'ArrowRight' });
    await waitFor(() => expect(document.activeElement).toBe(cell('r1c2')));
    fireEvent.keyDown(cell('r1c2'), { key: 'ArrowDown' });
    await waitFor(() => expect(document.activeElement).toBe(cell('r2c2')));
    const finalTabStops = container.querySelectorAll(
      '[data-chart-datum-key][tabindex="0"]',
    );
    expect(finalTabStops).toHaveLength(1);
    expect(finalTabStops.item(0)).toBe(cell('r2c2'));
  });

  it('keeps Line vertical navigation aligned to visual X when series are sparse', async () => {
    render(
      <SvgLineRenderer
        ariaLabel="Sparse series"
        responsive={false}
        series={[
          {
            id: 'forecast',
            label: 'Forecast',
            points: [
              { id: 'jan', x: 'Jan', value: 2 },
              { id: 'mar', x: 'Mar', value: 4 },
            ],
          },
          {
            id: 'actual',
            label: 'Actual',
            points: [
              { id: 'jan', x: 'Jan', value: 1 },
              { id: 'feb', x: 'Feb', value: 3 },
              { id: 'mar', x: 'Mar', value: 5 },
            ],
          },
        ]}
        interaction={{ mode: 'explore' }}
      />,
    );
    const forecastMarch = screen.getByRole('img', { name: 'Forecast, Mar: 4' });
    const actualMarch = screen.getByRole('img', { name: 'Actual, Mar: 5' });

    fireEvent.focus(forecastMarch);
    fireEvent.keyDown(forecastMarch, { key: 'ArrowDown' });
    await waitFor(() => expect(document.activeElement).toBe(actualMarch));
  });

  it('hydrates colocated interactive renderers with stable unique tooltip ids', async () => {
    const element = (
      <>
        <SvgBarRenderer
          ariaLabel="First interactive chart"
          responsive={false}
          data={[{ id: 'first', category: 'First', value: 1 }]}
          interaction={{
            mode: 'explore',
            defaultActiveKey: 'first',
            renderTooltip: ({ label }) => label,
          }}
        />
        <SvgBarRenderer
          ariaLabel="Second interactive chart"
          responsive={false}
          data={[{ id: 'second', category: 'Second', value: 2 }]}
          interaction={{
            mode: 'explore',
            defaultActiveKey: 'second',
            renderTooltip: ({ label }) => label,
          }}
        />
      </>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(element);
    document.body.appendChild(container);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let root: Root | undefined;
    const idsBefore = [...container.querySelectorAll('[role="tooltip"]')]
      .map((tooltip) => tooltip.id);

    expect(idsBefore).toHaveLength(2);
    expect(new Set(idsBefore).size).toBe(2);
    await act(async () => {
      root = hydrateRoot(container, element);
    });
    expect([...container.querySelectorAll('[role="tooltip"]')].map((tooltip) => tooltip.id))
      .toEqual(idsBefore);
    expect(
      consoleError.mock.calls.some((call) => String(call[0]).toLowerCase().includes('hydration')),
    ).toBe(false);

    await act(async () => root?.unmount());
    container.remove();
  });

  it('routes overlapping dense hit targets to the nearest visual datum', () => {
    const action = vi.fn();
    const points = Array.from({ length: 20 }, (_, index) => ({
      id: `point-${index + 1}`,
      x: `P${index + 1}`,
      value: 1,
    }));
    const { container } = render(
      <SvgLineRenderer
        ariaLabel="Dense selectable series"
        width={160}
        height={160}
        responsive={false}
        series={[{ id: 'dense', label: 'Dense', points }]}
        interaction={{
          mode: 'select',
          actionLabel: 'Select point',
          onAction: action,
        }}
      />,
    );
    const svg = container.querySelector('[data-part="chart-svg"]') as SVGSVGElement;
    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue(measuredRect(160, 160));
    const targets = [...container.querySelectorAll<SVGCircleElement>(
      '[data-part="interaction-target"]',
    )];
    const firstTarget = targets[0]!;
    const paintedLastTarget = targets[targets.length - 1]!;
    const clientX = Number(firstTarget.getAttribute('cx'));
    const clientY = Number(firstTarget.getAttribute('cy'));

    expect(targets).toHaveLength(20);
    expect(targets.every((target) => target.getAttribute('r') === '12')).toBe(true);
    fireEvent.pointerDown(paintedLastTarget, {
      pointerType: 'mouse',
      pointerId: 12,
      clientX,
      clientY,
    });
    fireEvent.click(paintedLastTarget, { detail: 1, clientX, clientY });

    expect(action).toHaveBeenCalledWith(
      expect.objectContaining({
        key: createSvgLineDatumKey('dense', 'point-1'),
        datum: expect.objectContaining({
          point: expect.objectContaining({ id: 'point-1' }),
        }),
      }),
      { input: 'pointer', pointerType: 'mouse', reason: 'action' },
    );
  });

  it('keeps static marks inert and preserves redundant forced-color encodings', () => {
    const { container } = render(
      <>
        <SvgBarRenderer
          ariaLabel="Static bars"
          responsive={false}
          data={[{ id: 'bar', category: 'Bar', value: 7 }]}
        />
        <SvgLineRenderer
          ariaLabel="Static lines"
          responsive={false}
          series={[
            { id: 'first', label: 'First', points: [{ id: 'a', x: 'A', value: 1 }] },
            { id: 'second', label: 'Second', points: [{ id: 'a', x: 'A', value: 2 }] },
          ]}
        />
        <SvgHeatMapRenderer
          ariaLabel="Static heatmap"
          responsive={false}
          data={[{ id: 'cell', column: 'A', row: 'One', value: 3 }]}
        />
      </>,
    );

    expect(container.querySelectorAll('[data-part="chart-renderer"][data-interaction="static"]'))
      .toHaveLength(3);
    expect(container.querySelector('[data-part="interaction-target"]')).not.toBeInTheDocument();
    expect(container.querySelectorAll('[data-part="forced-color-value-label"]')).toHaveLength(2);
    expect(container.querySelector('[data-series-id="second"]')).toHaveAttribute(
      'data-series-index',
      '1',
    );
    expect(CHART_FOUNDATION_CSS).toContain(
      "[data-interaction]:not([data-interaction='static'])\n  [data-part='bar-mark']:hover",
    );
    expect(CHART_FOUNDATION_CSS).toContain(
      "[data-part='line-series'][data-series-index='1'] [data-part='line']",
    );
  });
});
