/**
 * The charts adapt slot (WO-FAM-09): `adapt` decides WHEN compact mode is
 * active per posture, `compact` keeps deciding WHAT it hides, and every
 * scaffold-backed chart stamps the postures in force as `data-posture` on its
 * root, in every lifecycle state.
 *
 * The legacy `autoCompact` route is exercised only at hook level with an
 * explicit `containerWidth`: six families never attach their dimensions ref,
 * so a rendered `autoCompact` would be compact for reasons unrelated to `adapt`.
 */

import React from 'react';
import { act, cleanup, render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockMatchMedia } from '@tests/support/browser/match-media';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import { resetResponsiveMediaStore } from '@/infrastructure/runtime/responsive/viewport/media-snapshot';
import type { TenantConfig } from '@/foundation/contracts';
import {
  AreaChart,
  BarChart,
  BulletChart,
  CalendarHeatMap,
  ChartScaffold,
  FunnelChart,
  GanttChart,
  GaugeChart,
  HeatMap,
  Histogram,
  LineChart,
  NetworkGraph,
  PieChart,
  RadarChart,
  SankeyChart,
  ScatterChart,
  TreeMap,
  WaterfallChart,
  type LineChartProps,
} from '..';
import { useChartCompact, type UseChartCompactOptions } from '../runtime';
import { DEFAULT_COMPACT_CONFIG } from '../contracts/compactness';

const TENANT: TenantConfig = {
  slug: 'chart-adapt-test',
  name: 'Chart Adapt Test',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['testing'],
  branding: { companyName: 'Chart Adapt Test' },
};

function Provider({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
    >
      {children}
    </DesignSystemProvider>
  );
}

const PHONE_WIDTH = 390;
const DESKTOP_WIDTH = 1440;

/* Every constructed observer and the elements it was asked to watch, so a
   measurement reaches only the observers bound to that element. */
interface ObserverRecord {
  readonly callback: ResizeObserverCallback;
  readonly targets: Element[];
}

const observers: ObserverRecord[] = [];

class RecordingResizeObserver {
  private readonly record: ObserverRecord;
  constructor(callback: ResizeObserverCallback) {
    this.record = { callback, targets: [] };
    observers.push(this.record);
  }
  observe(target: Element): void {
    this.record.targets.push(target);
  }
  unobserve(): void {}
  disconnect(): void {}
}

function measure(box: Element, width: number): void {
  act(() => {
    for (const observer of observers) {
      if (!observer.targets.includes(box)) continue;
      observer.callback(
        [{ target: box, contentRect: { width, height: 300 } } as unknown as ResizeObserverEntry],
        observer as unknown as ResizeObserver,
      );
    }
  });
}

function measureEveryObserver(width: number): void {
  act(() => {
    for (const observer of observers) {
      for (const target of observer.targets) {
        observer.callback(
          [{ target, contentRect: { width, height: 300 } } as unknown as ResizeObserverEntry],
          observer as unknown as ResizeObserver,
        );
      }
    }
  });
}

const observersOf = (box: Element) => observers.filter((observer) => observer.targets.includes(box));

beforeEach(() => {
  observers.length = 0;
  resetResponsiveMediaStore();
  vi.stubGlobal('ResizeObserver', RecordingResizeObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  resetResponsiveMediaStore();
});

function scaffoldOf(container: HTMLElement): HTMLElement {
  const roots = container.querySelectorAll<HTMLElement>('[data-part="chart-scaffold"]');
  expect(roots).toHaveLength(1);
  return roots[0] as HTMLElement;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SERIES: LineChartProps['series'] = ['Revenue', 'Cost', 'Margin'].map((name, seriesIndex) => ({
  name,
  data: MONTHS.map((x, index) => ({ x, y: 100 + index * 10 + seriesIndex * 25 })),
}));

const xTickLabels = (root: HTMLElement) =>
  root.querySelectorAll('[data-part="axis"][data-axis="x"] [data-part="axis-tick-label"]').length;

describe('useChartCompact -- adapt absent keeps the legacy resolution', () => {
  const legacy = (
    compactMode: boolean,
    autoCompact: boolean,
    containerWidth: number | undefined,
    isMobile: boolean,
  ) => compactMode || (autoCompact && (containerWidth !== undefined ? containerWidth < 640 : isMobile));

  describe.each([
    { viewport: 'phone', width: PHONE_WIDTH, isMobile: true },
    { viewport: 'desktop', width: DESKTOP_WIDTH, isMobile: false },
  ] as const)('on a $viewport viewport', ({ viewport, width, isMobile }) => {
    it('matches the compactMode x autoCompact x containerWidth matrix and constructs no observer', () => {
      mockMatchMedia(width);
      let cases = 0;
      for (const compactMode of [false, true]) {
        for (const autoCompact of [false, true]) {
          for (const containerWidth of [500, 800, undefined]) {
            const { result, unmount } = renderHook(
              () => useChartCompact({ compactMode, autoCompact, containerWidth }),
              { wrapper: Provider },
            );
            const expected = legacy(compactMode, autoCompact, containerWidth, isMobile);
            expect(result.current).toEqual(
              expected
                ? { isCompact: true, ...DEFAULT_COMPACT_CONFIG, postureAttribute: viewport }
                : {
                  isCompact: false,
                  hideLegend: false,
                  maxTicks: Infinity,
                  compactTooltip: false,
                  hideSeriesLabels: false,
                  minHeight: 0,
                  postureAttribute: viewport,
                },
            );
            unmount();
            cases += 1;
          }
        }
      }
      expect(cases).toBe(12);
      expect(observers).toHaveLength(0);
    });
  });

  it('never applies a container entry without a containerRef', () => {
    mockMatchMedia(DESKTOP_WIDTH);
    const { result } = renderHook(
      () => useChartCompact({ adapt: { compact: { compactMode: true } } }),
      { wrapper: Provider },
    );
    measureEveryObserver(320);
    expect(result.current.isCompact).toBe(false);
    expect(result.current.postureAttribute).toBe('desktop');
    expect(observers).toHaveLength(0);
  });
});

describe('useChartCompact -- adapt precedence', () => {
  const resolve = (width: number, options: UseChartCompactOptions) => {
    mockMatchMedia(width);
    return renderHook(() => useChartCompact(options), { wrapper: Provider }).result;
  };

  it('activates a viewport entry only at that viewport', () => {
    expect(resolve(PHONE_WIDTH, { adapt: { phone: { compactMode: true } } }).current.isCompact).toBe(true);
    cleanup();
    resetResponsiveMediaStore();
    expect(resolve(DESKTOP_WIDTH, { adapt: { phone: { compactMode: true } } }).current.isCompact).toBe(false);
  });

  it('ignores an entry for a posture that is not in force', () => {
    const result = resolve(DESKTOP_WIDTH, { adapt: { tablet: { compactMode: true } } });
    expect(result.current.isCompact).toBe(false);
  });

  it('skips an entry that declares nothing', () => {
    expect(resolve(PHONE_WIDTH, { compactMode: true, adapt: { phone: {} } }).current.isCompact).toBe(true);
    cleanup();
    resetResponsiveMediaStore();
    expect(resolve(PHONE_WIDTH, { adapt: { phone: {} } }).current.isCompact).toBe(false);
  });

  it('outranks an explicit compactMode at the posture in force', () => {
    const result = resolve(DESKTOP_WIDTH, { compactMode: true, adapt: { desktop: { compactMode: false } } });
    expect(result.current.isCompact).toBe(false);
    expect(result.current.maxTicks).toBe(Infinity);
  });

  it('outranks an active autoCompact at the posture in force', () => {
    const result = resolve(PHONE_WIDTH, {
      autoCompact: true,
      containerWidth: 500,
      adapt: { phone: { compactMode: false } },
    });
    expect(result.current.isCompact).toBe(false);
  });

  it('applies the measured container entry after the viewport entry', () => {
    mockMatchMedia(PHONE_WIDTH);
    const box = document.createElement('div');
    const { result } = renderHook(
      () => useChartCompact({
        adapt: { phone: { compactMode: false }, compact: { compactMode: true } },
        containerRef: { current: box },
      }),
      { wrapper: Provider },
    );
    expect(result.current.isCompact).toBe(false);
    expect(result.current.postureAttribute).toBe('phone');
    expect(observersOf(box)).toHaveLength(1);

    measure(box, 320);
    expect(result.current.isCompact).toBe(true);
    expect(result.current.postureAttribute).toBe('phone compact');

    measure(box, 1200);
    expect(result.current.isCompact).toBe(false);
    expect(result.current.postureAttribute).toBe('phone expanded');
  });

  it('merges `compact` over the defaults whichever layer activated compact mode', () => {
    const result = resolve(PHONE_WIDTH, {
      compact: { maxTicks: 3 },
      adapt: { phone: { compactMode: true } },
    });
    expect(result.current).toEqual({
      isCompact: true,
      ...DEFAULT_COMPACT_CONFIG,
      maxTicks: 3,
      postureAttribute: 'phone',
    });
  });
});

/* Minimal valid data per family; every compact family declares a legend so
   hiding it is observable. */
const COMPACT_FAMILIES = [
  {
    name: 'AreaChart',
    render: (props: Record<string, unknown>) => <AreaChart series={SERIES} legend {...props} />,
  },
  {
    name: 'BarChart',
    render: (props: Record<string, unknown>) => (
      <BarChart data={[{ label: 'A', value: 4 }, { label: 'B', value: 7 }]} legend {...props} />
    ),
  },
  {
    name: 'BulletChart',
    render: (props: Record<string, unknown>) => (
      <BulletChart data={[{ label: 'Revenue', value: 70, target: 80 }]} legend {...props} />
    ),
  },
  {
    name: 'GaugeChart',
    render: (props: Record<string, unknown>) => <GaugeChart value={62} legend {...props} />,
  },
  {
    name: 'Histogram',
    render: (props: Record<string, unknown>) => <Histogram values={[1, 2, 2, 3, 3, 3, 4, 5]} legend {...props} />,
  },
  {
    name: 'LineChart',
    render: (props: Record<string, unknown>) => <LineChart series={SERIES} legend {...props} />,
  },
  {
    name: 'PieChart',
    render: (props: Record<string, unknown>) => (
      <PieChart data={[{ label: 'A', value: 4 }, { label: 'B', value: 7 }]} legend {...props} />
    ),
  },
  {
    name: 'ScatterChart',
    render: (props: Record<string, unknown>) => (
      <ScatterChart data={[{ x: 1, y: 2 }, { x: 3, y: 5 }]} legend {...props} />
    ),
  },
  {
    name: 'WaterfallChart',
    render: (props: Record<string, unknown>) => (
      <WaterfallChart data={[{ label: 'Start', value: 10 }, { label: 'Gain', value: 4 }]} legend {...props} />
    ),
  },
] as const;

const NON_COMPACT_FAMILIES = [
  {
    name: 'CalendarHeatMap',
    element: <CalendarHeatMap data={[{ date: '2026-01-02', value: 3 }]} />,
  },
  { name: 'FunnelChart', element: <FunnelChart data={[{ label: 'Visit', value: 10 }, { label: 'Buy', value: 3 }]} /> },
  {
    name: 'GanttChart',
    element: <GanttChart tasks={[{ id: 't1', name: 'Plan', start: '2026-01-01', end: '2026-01-05' }]} />,
  },
  { name: 'HeatMap', element: <HeatMap data={[{ x: 'Mon', y: 'AM', value: 2 }]} /> },
  {
    name: 'NetworkGraph',
    element: <NetworkGraph nodes={[{ id: 'a' }, { id: 'b' }]} links={[{ source: 'a', target: 'b' }]} />,
  },
  { name: 'RadarChart', element: <RadarChart data={[{ axis: 'Speed', value: 4 }, { axis: 'Range', value: 6 }]} /> },
  {
    name: 'SankeyChart',
    element: <SankeyChart nodes={[{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }]} links={[{ source: 'a', target: 'b', value: 5 }]} />,
  },
  { name: 'TreeMap', element: <TreeMap data={[{ name: 'A', value: 4 }, { name: 'B', value: 7 }]} /> },
] as const;

describe.each(COMPACT_FAMILIES)('$name honours adapt', ({ render: renderFamily }) => {
  it('runs compact mode at a phone viewport entry: legend hidden, compact min-height, phone stamp', () => {
    mockMatchMedia(PHONE_WIDTH);
    const { container } = render(
      <Provider>{renderFamily({ width: 480, adapt: { phone: { compactMode: true } } })}</Provider>,
    );
    const root = scaffoldOf(container);
    expect(root).toHaveAttribute('data-state', 'ready');
    expect(root).toHaveAttribute('data-posture', 'phone');
    expect(root.querySelector('[data-part="legend"]')).toBeNull();
    expect(root.style.minHeight).toBe(`${DEFAULT_COMPACT_CONFIG.minHeight}px`);
  });

  it('keeps the legend for the same declaration on a desktop viewport', () => {
    mockMatchMedia(DESKTOP_WIDTH);
    const { container } = render(
      <Provider>{renderFamily({ width: 480, adapt: { phone: { compactMode: true } } })}</Provider>,
    );
    const root = scaffoldOf(container);
    expect(root).toHaveAttribute('data-posture', 'desktop');
    expect(root.querySelector('[data-part="legend"]')).not.toBeNull();
    expect(root.style.minHeight).toBe('');
  });
});

describe('a realistic compact container on a desktop viewport', () => {
  it('runs a dashboard side-rail LineChart compact at 320px and full at 1200px, viewport unchanged', () => {
    mockMatchMedia(DESKTOP_WIDTH);
    const matchMedia = window.matchMedia;
    const { container } = render(
      <Provider>
        <LineChart
          title="Revenue by month"
          series={SERIES}
          legend
          animate={false}
          compact={{ maxTicks: 3 }}
          adapt={{ compact: { compactMode: true } }}
        />
      </Provider>,
    );
    const root = scaffoldOf(container);
    expect(root).toHaveAttribute('data-posture', 'desktop');
    expect(root.querySelector('[data-part="legend"]')).not.toBeNull();
    const fullTicks = xTickLabels(root);
    expect(fullTicks).toBeGreaterThan(3);

    const posture = observersOf(root);
    expect(posture).toHaveLength(1);
    expect(posture[0]?.targets).toEqual([root]);

    measure(root, 320);
    expect(window.matchMedia).toBe(matchMedia);
    expect(root).toHaveAttribute('data-posture', 'desktop compact');
    expect(root.querySelector('[data-part="legend"]')).toBeNull();
    expect(xTickLabels(root)).toBeGreaterThan(0);
    expect(xTickLabels(root)).toBeLessThanOrEqual(3);
    expect(root.style.minHeight).toBe('150px');
    expect(root.querySelector('[data-part="title"]')).toHaveTextContent('Revenue by month');

    measure(root, 1200);
    expect(root).toHaveAttribute('data-posture', 'desktop expanded');
    expect(root.querySelector('[data-part="legend"]')).not.toBeNull();
    expect(xTickLabels(root)).toBe(fullTicks);
    expect(root.style.minHeight).toBe('');
  });

  it('drops a stale container token once adapt no longer declares a container entry', () => {
    mockMatchMedia(DESKTOP_WIDTH);
    const view = render(
      <Provider>
        <LineChart series={SERIES} adapt={{ compact: { compactMode: true } }} />
      </Provider>,
    );
    const root = scaffoldOf(view.container);
    measure(root, 320);
    expect(root).toHaveAttribute('data-posture', 'desktop compact');

    view.rerender(
      <Provider>
        <LineChart series={SERIES} adapt={{ phone: { compactMode: true } }} />
      </Provider>,
    );
    expect(scaffoldOf(view.container)).toBe(root);
    expect(root.getAttribute('data-posture')).toBe('desktop');
    expect(root.querySelector('[data-part="legend"]')).not.toBeNull();
  });
});

describe('the scaffold root across lifecycle states', () => {
  it('keeps one observed host node from loading through ready, error and back, stamped in each', () => {
    mockMatchMedia(DESKTOP_WIDTH);
    const adapt = { compact: { compactMode: true } };
    const chart = (props: Partial<LineChartProps>) => (
      <Provider>
        <LineChart series={SERIES} adapt={adapt} {...(props as Record<string, unknown>)} />
      </Provider>
    );
    const view = render(chart({ loading: true }));
    const root = scaffoldOf(view.container);
    expect(root).toHaveAttribute('data-state', 'loading');
    expect(root).toHaveAttribute('data-posture', 'desktop');

    view.rerender(chart({}));
    expect(scaffoldOf(view.container)).toBe(root);
    expect(root).toHaveAttribute('data-state', 'ready');
    expect(root).toHaveAttribute('data-posture', 'desktop');

    view.rerender(chart({ state: 'error', errorLabel: 'Revenue failed to load' }));
    expect(scaffoldOf(view.container)).toBe(root);
    expect(root).toHaveAttribute('data-state', 'error');
    expect(root).toHaveAttribute('data-posture', 'desktop');

    view.rerender(chart({}));
    expect(scaffoldOf(view.container)).toBe(root);
    expect(root).toHaveAttribute('data-state', 'ready');

    measure(root, 320);
    expect(root).toHaveAttribute('data-posture', 'desktop compact');
    expect(root.querySelector('[data-part="legend"]')).toBeNull();
  });

  it('stamps the automatic empty state', () => {
    mockMatchMedia(PHONE_WIDTH);
    const { container } = render(
      <Provider>
        <LineChart series={[]} emptyLabel="No revenue yet" adapt={{ phone: { compactMode: true } }} />
      </Provider>,
    );
    const root = scaffoldOf(container);
    expect(root).toHaveAttribute('data-state', 'empty');
    expect(root).toHaveAttribute('data-posture', 'phone');
  });
});

describe('observers: one only where a container entry can change the chart', () => {
  const lineRoot = (adapt: LineChartProps['adapt']) => {
    const view = render(
      <Provider>
        <LineChart series={SERIES} {...(adapt === undefined ? {} : { adapt })} />
      </Provider>,
    );
    return { view, root: scaffoldOf(view.container) };
  };

  it('adds no observer for viewport-only entries, exactly one on the scaffold root for a container entry', () => {
    mockMatchMedia(DESKTOP_WIDTH);
    const bare = lineRoot(undefined);
    const bareCount = observers.length;
    expect(observersOf(bare.root)).toHaveLength(0);
    bare.view.unmount();

    observers.length = 0;
    const viewportOnly = lineRoot({ phone: { compactMode: true }, desktop: { compactMode: false } });
    expect(observers).toHaveLength(bareCount);
    expect(observersOf(viewportOnly.root)).toHaveLength(0);
    viewportOnly.view.unmount();

    observers.length = 0;
    const contained = lineRoot({ compact: { compactMode: true } });
    expect(observers).toHaveLength(bareCount + 1);
    const posture = observersOf(contained.root);
    expect(posture).toHaveLength(1);
    expect(posture[0]?.targets).toEqual([contained.root]);
    expect(contained.root).toHaveAttribute('data-part', 'chart-scaffold');
  });

  it('constructs no new observer when re-rendered with a fresh but equal inline adapt literal', () => {
    mockMatchMedia(DESKTOP_WIDTH);
    const view = render(
      <Provider>
        <LineChart series={SERIES} adapt={{ compact: { compactMode: true } }} />
      </Provider>,
    );
    const root = scaffoldOf(view.container);
    const constructed = observers.length;
    expect(observersOf(root)).toHaveLength(1);

    view.rerender(
      <Provider>
        <LineChart series={SERIES} adapt={{ compact: { compactMode: true } }} />
      </Provider>,
    );
    expect(observers).toHaveLength(constructed);
    measure(root, 320);
    expect(root).toHaveAttribute('data-posture', 'desktop compact');
  });

  it('a bare ChartScaffold stamps the viewport posture and observes nothing', () => {
    mockMatchMedia(PHONE_WIDTH);
    const { container } = render(
      <Provider>
        <ChartScaffold
          containerRef={React.createRef<HTMLDivElement>()}
          svgRef={React.createRef<SVGSVGElement>()}
          height={200}
          loadingLabel="Loading"
          ariaLabel="Chart"
          ariaDescription="Chart description"
        />
      </Provider>,
    );
    expect(scaffoldOf(container)).toHaveAttribute('data-posture', 'phone');
    expect(observers).toHaveLength(0);
  });

  it.each(NON_COMPACT_FAMILIES)('$name stamps the viewport posture alone, whatever is measured', ({ element }) => {
    mockMatchMedia(DESKTOP_WIDTH);
    const { container } = render(<Provider>{element}</Provider>);
    const root = scaffoldOf(container);
    expect(root).toHaveAttribute('data-posture', 'desktop');
    measureEveryObserver(320);
    expect(root).toHaveAttribute('data-posture', 'desktop');
  });
});
