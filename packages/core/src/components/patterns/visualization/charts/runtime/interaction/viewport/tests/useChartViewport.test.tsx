import React, { act, useRef } from 'react';
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useChartBrush, type BrushSelection } from '../../brush';
import {
  useChartViewport,
  type ChartViewportConfig,
  type ChartViewportState,
} from '..';

afterEach(cleanup);

interface HarnessHandle {
  current: ChartViewportState | null;
}

function Harness({ config, handle }: { config: ChartViewportConfig; handle: HarnessHandle }): React.ReactElement {
  const viewport = useChartViewport(config);
  handle.current = viewport;
  const root = viewport.getRootProps({ plot: { x: 0, y: 0, width: 100, height: 100 } });
  return (
    <div
      data-testid="root"
      data-x={viewport.domain.x ? `${viewport.domain.x[0]},${viewport.domain.x[1]}` : ''}
      data-y={viewport.domain.y ? `${viewport.domain.y[0]},${viewport.domain.y[1]}` : ''}
      data-default={String(viewport.isDefault)}
      tabIndex={root.tabIndex}
      onWheel={root.onWheel}
      onKeyDown={root.onKeyDown}
    />
  );
}

function mount(config: ChartViewportConfig): { handle: HarnessHandle; root: HTMLElement } {
  const handle: HarnessHandle = { current: null };
  const view = render(<Harness config={config} handle={handle} />);
  return { handle, root: within(view.container).getByTestId('root') };
}

const BASE: ChartViewportConfig = {
  baseDomain: { x: [0, 100] },
  zoom: { enabled: true, wheel: true },
  brush: { enabled: true, axis: 'x' },
  resetLabel: 'Reset zoom',
};

describe('useChartViewport domain transforms', () => {
  it('seeds the active domain from the base domain and reports default', () => {
    const { handle } = mount(BASE);
    expect(handle.current?.domain.x).toEqual([0, 100]);
    expect(handle.current?.isDefault).toBe(true);
  });

  it('zooms in about the centre and clamps zoom-out to the base extent', () => {
    const { handle, root } = mount(BASE);
    act(() => handle.current?.zoomIn('x'));
    // span 100 / 1.25 = 80, centred -> [10, 90]
    expect(handle.current?.domain.x).toEqual([10, 90]);
    expect(root.getAttribute('data-default')).toBe('false');

    // Zoom out repeatedly can never exceed the base [0,100].
    act(() => {
      handle.current?.zoomOut('x');
      handle.current?.zoomOut('x');
      handle.current?.zoomOut('x');
      handle.current?.zoomOut('x');
    });
    expect(handle.current?.domain.x?.[0]).toBeGreaterThanOrEqual(0);
    expect(handle.current?.domain.x?.[1]).toBeLessThanOrEqual(100);
  });

  it('pans within the base extent and cannot slide past the edge', () => {
    const { handle } = mount(BASE);
    act(() => handle.current?.setAxisDomain('x', [40, 60]));
    act(() => handle.current?.pan('x', 5)); // huge shift; must clamp to right edge keeping span 20
    expect(handle.current?.domain.x).toEqual([80, 100]);
    act(() => handle.current?.pan('x', -100));
    expect(handle.current?.domain.x).toEqual([0, 20]);
  });

  it('honours the zoom extent max factor as the minimum span', () => {
    const { handle } = mount({
      baseDomain: { x: [0, 100] },
      zoom: { enabled: true, extent: [1, 4] }, // min span = 100/4 = 25
    });
    act(() => handle.current?.setAxisDomain('x', [48, 52])); // span 4 < 25 -> clamped to 25 about centre 50
    expect(handle.current?.domain.x).toEqual([37.5, 62.5]);
  });

  it('resets to the base domain', () => {
    const { handle } = mount(BASE);
    act(() => handle.current?.zoomIn('x'));
    expect(handle.current?.isDefault).toBe(false);
    act(() => handle.current?.reset());
    expect(handle.current?.domain.x).toEqual([0, 100]);
    expect(handle.current?.isDefault).toBe(true);
  });

  it('ignores transforms on axes absent from the base domain', () => {
    const { handle } = mount(BASE);
    act(() => handle.current?.pan('y', 0.5));
    expect(handle.current?.domain.y).toBeUndefined();
  });
});

describe('useChartViewport brush bridge', () => {
  it('applies a brush selection to the brush axis, clamped', () => {
    const { handle } = mount(BASE);
    const selection: BrushSelection = { start: 20, end: 60 };
    act(() => handle.current?.handleBrushEnd(selection));
    expect(handle.current?.domain.x).toEqual([20, 60]);
  });

  it('ignores a null or degenerate brush selection', () => {
    const { handle } = mount(BASE);
    act(() => handle.current?.handleBrushEnd(null));
    expect(handle.current?.domain.x).toEqual([0, 100]);
    act(() => handle.current?.handleBrushEnd({ start: 50, end: 50 }));
    expect(handle.current?.domain.x).toEqual([0, 100]);
  });

  it('builds a pixel-to-data scale from the active domain', () => {
    const { handle } = mount(BASE);
    act(() => handle.current?.setAxisDomain('x', [0, 50]));
    const scale = handle.current!.getBrushScale(100);
    expect(scale.invert(0)).toBe(0);
    expect(scale.invert(50)).toBe(25);
    expect(scale.invert(100)).toBe(50);
  });
});

describe('useChartViewport controlled operation', () => {
  it('does not self-update and notifies with the next domain when controlled', () => {
    const onDomainChange = vi.fn();
    const { handle } = mount({
      baseDomain: { x: [0, 100] },
      domain: { x: [0, 100] },
      zoom: { enabled: true },
      onDomainChange,
    });
    act(() => handle.current?.zoomIn('x'));
    expect(onDomainChange).toHaveBeenCalledWith({ x: [10, 90] });
    // Controlled: internal domain stays equal to the controlled prop.
    expect(handle.current?.domain.x).toEqual([0, 100]);
  });
});

describe('useChartViewport keyboard and wheel', () => {
  it('pans, zooms, and resets from the keyboard and prevents default', () => {
    const { handle, root } = mount(BASE);
    act(() => handle.current?.setAxisDomain('x', [40, 60]));
    expect(fireEvent.keyDown(root, { key: 'ArrowRight' })).toBe(false);
    expect(handle.current?.domain.x?.[0]).toBeGreaterThan(40);

    act(() => handle.current?.setAxisDomain('x', [40, 60]));
    expect(fireEvent.keyDown(root, { key: '+' })).toBe(false);
    // '+' zooms in -> span < 20
    expect((handle.current!.domain.x![1] - handle.current!.domain.x![0])).toBeLessThan(20);

    expect(fireEvent.keyDown(root, { key: 'Escape' })).toBe(false);
    expect(handle.current?.domain.x).toEqual([0, 100]);

    // Unhandled keys do not preventDefault.
    expect(fireEvent.keyDown(root, { key: 'a' })).toBe(true);
  });

  it('zooms on wheel when wheel is enabled', () => {
    const { handle, root } = mount(BASE);
    fireEvent.wheel(root, { deltaY: -100 });
    const span = handle.current!.domain.x![1] - handle.current!.domain.x![0];
    expect(span).toBeLessThan(100);
  });

  it('exposes no interaction affordances when neither zoom nor brush is enabled', () => {
    const { handle } = mount({ baseDomain: { x: [0, 100] } });
    const root = handle.current!.getRootProps({ plot: { x: 0, y: 0, width: 100, height: 100 } });
    expect(root.tabIndex).toBeUndefined();
    expect(root.onKeyDown).toBeUndefined();
    expect(root.onWheel).toBeUndefined();
  });
});

describe('useChartViewport reset button and no-motion contract', () => {
  it('disables the reset control at the default domain and labels it from app copy', () => {
    const { handle } = mount(BASE);
    expect(handle.current?.getResetButtonProps()).toMatchObject({
      type: 'button',
      disabled: true,
      'aria-label': 'Reset zoom',
      'data-part': 'viewport-reset',
      'data-chart-viewport': 'default',
    });
    act(() => handle.current?.zoomIn('x'));
    expect(handle.current?.getResetButtonProps().disabled).toBe(false);
  });

  it('applies every transform synchronously without scheduling an animation frame', () => {
    const raf = vi.spyOn(globalThis, 'requestAnimationFrame');
    const timeout = vi.spyOn(globalThis, 'setTimeout');
    raf.mockClear();
    timeout.mockClear();
    const { handle } = mount(BASE);
    act(() => {
      handle.current?.zoomIn('x');
      handle.current?.pan('x', 0.1);
      handle.current?.reset();
    });
    // The controller is pure state: it drives no frame loop and no timer of its own.
    expect(raf).not.toHaveBeenCalled();
    expect(timeout).not.toHaveBeenCalled();
    raf.mockRestore();
    timeout.mockRestore();
  });
});

describe('useChartViewport reuses the brush hook end-to-end', () => {
  it('drives the domain from an interactive drag through useChartBrush', () => {
    function BrushHarness({ handle }: { handle: HarnessHandle }): React.ReactElement {
      const svgRef = useRef<SVGSVGElement | null>(null);
      const viewport = useChartViewport(BASE);
      handle.current = viewport;
      const brush = useChartBrush({
        svgRef,
        width: 120,
        height: 100,
        margin: { top: 0, right: 20, bottom: 0, left: 0 },
        xScale: viewport.getBrushScale(100),
        enabled: true,
        onBrushEnd: viewport.handleBrushEnd,
      });
      return (
        <svg ref={svgRef} width={120} height={130}>
          {brush.renderBrush()}
        </svg>
      );
    }
    const handle: HarnessHandle = { current: null };
    render(<BrushHarness handle={handle} />);
    // Feed a settled selection through the viewport bridge (data coordinates).
    act(() => handle.current?.handleBrushEnd({ start: 10, end: 40 }));
    expect(handle.current?.domain.x).toEqual([10, 40]);
  });
});

describe('useChartViewport brush scale axis selection', () => {
  const XY_BASE: ChartViewportConfig['baseDomain'] = { x: [10, 110], y: [200, 600] };

  it('inverts against the y interval for a y brush and the x interval for x, xy and the default', () => {
    const yBrush = mount({ baseDomain: XY_BASE, brush: { enabled: true, axis: 'y' } }).handle;
    expect(yBrush.current?.getBrushScale(100).invert(0)).toBe(200);
    expect(yBrush.current?.getBrushScale(100).invert(25)).toBe(300);
    expect(yBrush.current?.getBrushScale(100).invert(100)).toBe(600);

    const xBrush = mount({ baseDomain: XY_BASE, brush: { enabled: true, axis: 'x' } }).handle;
    const xyBrush = mount({ baseDomain: XY_BASE, brush: { enabled: true, axis: 'xy' } }).handle;
    const unsetAxis = mount({ baseDomain: XY_BASE, brush: { enabled: true } }).handle;
    const noBrush = mount({ baseDomain: XY_BASE }).handle;
    for (const handle of [xBrush, xyBrush, unsetAxis, noBrush]) {
      expect(handle.current?.getBrushScale(100).invert(0)).toBe(10);
      expect(handle.current?.getBrushScale(100).invert(50)).toBe(60);
      expect(handle.current?.getBrushScale(100).invert(100)).toBe(110);
    }
  });

  it('falls back to [0, 1] when the selected axis is absent instead of reading the other axis', () => {
    const missingY = mount({ baseDomain: { x: [10, 110] }, brush: { enabled: true, axis: 'y' } }).handle;
    const missingX = mount({ baseDomain: { y: [200, 600] }, brush: { enabled: true, axis: 'x' } }).handle;
    const missingXForXy = mount({ baseDomain: { y: [200, 600] }, brush: { enabled: true, axis: 'xy' } }).handle;
    for (const handle of [missingY, missingX, missingXForXy]) {
      expect(handle.current?.getBrushScale(100).invert(0)).toBe(0);
      expect(handle.current?.getBrushScale(100).invert(50)).toBe(0.5);
      expect(handle.current?.getBrushScale(100).invert(100)).toBe(1);
    }
  });

  it('reads the current uncontrolled y domain after set, pan and zoom transforms', () => {
    const { handle } = mount({ baseDomain: XY_BASE, zoom: { enabled: true }, brush: { enabled: true, axis: 'y' } });
    act(() => handle.current?.setAxisDomain('y', [300, 500]));
    act(() => handle.current?.setAxisDomain('x', [20, 40]));
    expect(handle.current?.getBrushScale(100).invert(0)).toBe(300);
    expect(handle.current?.getBrushScale(100).invert(100)).toBe(500);

    act(() => handle.current?.pan('y', 0.5));
    expect(handle.current?.domain.y).toEqual([400, 600]);
    expect(handle.current?.getBrushScale(100).invert(0)).toBe(400);
    expect(handle.current?.getBrushScale(100).invert(50)).toBe(500);

    act(() => handle.current?.zoomIn('y'));
    expect(handle.current?.domain.y).toEqual([420, 580]);
    expect(handle.current?.getBrushScale(100).invert(0)).toBe(420);
    expect(handle.current?.getBrushScale(100).invert(100)).toBe(580);
  });

  it('reads the current controlled y domain after the controlled prop changes', () => {
    const handle: HarnessHandle = { current: null };
    const config: ChartViewportConfig = {
      baseDomain: XY_BASE,
      domain: { x: [10, 110], y: [250, 450] },
      brush: { enabled: true, axis: 'y' },
    };
    const view = render(<Harness config={config} handle={handle} />);
    expect(handle.current?.getBrushScale(100).invert(0)).toBe(250);
    expect(handle.current?.getBrushScale(100).invert(100)).toBe(450);

    view.rerender(<Harness config={{ ...config, domain: { x: [10, 110], y: [300, 400] } }} handle={handle} />);
    expect(handle.current?.getBrushScale(100).invert(0)).toBe(300);
    expect(handle.current?.getBrushScale(100).invert(100)).toBe(400);
  });

  it('returns the selected axis lower edge for a zero or negative plot size', () => {
    const yBrush = mount({ baseDomain: XY_BASE, brush: { enabled: true, axis: 'y' } }).handle;
    expect(yBrush.current?.getBrushScale(0).invert(37)).toBe(200);
    expect(yBrush.current?.getBrushScale(-5).invert(37)).toBe(200);

    const xBrush = mount({ baseDomain: XY_BASE, brush: { enabled: true, axis: 'x' } }).handle;
    expect(xBrush.current?.getBrushScale(0).invert(37)).toBe(10);

    const missingY = mount({ baseDomain: { x: [10, 110] }, brush: { enabled: true, axis: 'y' } }).handle;
    expect(missingY.current?.getBrushScale(0).invert(37)).toBe(0);
  });
});

describe('useChartViewport default state across both axes', () => {
  const TWO_AXIS_BASE: ChartViewportConfig['baseDomain'] = { x: [0, 100], y: [200, 600] };
  const TWO_AXIS: ChartViewportConfig = {
    baseDomain: TWO_AXIS_BASE,
    zoom: { enabled: true },
    brush: { enabled: true, axis: 'x' },
  };

  it('leaves default when only y changes and returns to it when y is restored by value', () => {
    const { handle, root } = mount(TWO_AXIS);
    expect(handle.current?.isDefault).toBe(true);
    expect(root.getAttribute('data-default')).toBe('true');
    expect(handle.current?.getResetButtonProps()).toMatchObject({ disabled: true, 'data-chart-viewport': 'default' });

    act(() => handle.current?.setAxisDomain('y', [300, 500]));
    expect(handle.current?.domain.x).toEqual([0, 100]);
    expect(handle.current?.isDefault).toBe(false);
    expect(root.getAttribute('data-default')).toBe('false');
    expect(handle.current?.getRootProps({ plot: { x: 0, y: 0, width: 100, height: 100 } })['data-chart-viewport']).toBe('zoomed');
    expect(handle.current?.getResetButtonProps()).toMatchObject({ disabled: false, 'data-chart-viewport': 'zoomed' });

    act(() => handle.current?.setAxisDomain('y', [200, 600]));
    expect(handle.current?.domain.y).not.toBe(TWO_AXIS_BASE.y);
    expect(handle.current?.isDefault).toBe(true);
    expect(root.getAttribute('data-default')).toBe('true');
  });

  it('leaves default when only x changes while y still matches the base', () => {
    const { handle, root } = mount(TWO_AXIS);
    act(() => handle.current?.setAxisDomain('x', [20, 40]));
    expect(handle.current?.domain.y).toEqual([200, 600]);
    expect(handle.current?.isDefault).toBe(false);
    expect(root.getAttribute('data-default')).toBe('false');
    expect(handle.current?.getResetButtonProps().disabled).toBe(false);
  });

  it('stays zoomed until every changed axis matches again, and reset restores default', () => {
    const { handle, root } = mount(TWO_AXIS);
    act(() => handle.current?.setAxisDomain('x', [20, 40]));
    act(() => handle.current?.setAxisDomain('y', [300, 500]));
    expect(handle.current?.isDefault).toBe(false);

    act(() => handle.current?.setAxisDomain('x', [0, 100]));
    expect(handle.current?.domain.x).toEqual([0, 100]);
    expect(handle.current?.domain.y).toEqual([300, 500]);
    expect(handle.current?.isDefault).toBe(false);
    expect(root.getAttribute('data-default')).toBe('false');

    act(() => handle.current?.setAxisDomain('x', [20, 40]));
    act(() => handle.current?.reset());
    expect(handle.current?.domain).toEqual({ x: [0, 100], y: [200, 600] });
    expect(handle.current?.isDefault).toBe(true);
    expect(root.getAttribute('data-default')).toBe('true');
  });

  it('ignores an active axis that the base domain does not declare', () => {
    const uncontrolled = mount({
      baseDomain: { x: [0, 100] },
      defaultDomain: { x: [0, 100], y: [5, 7] },
      zoom: { enabled: true },
    });
    expect(uncontrolled.handle.current?.domain.y).toEqual([5, 7]);
    expect(uncontrolled.handle.current?.isDefault).toBe(true);
    expect(uncontrolled.root.getAttribute('data-default')).toBe('true');

    act(() => uncontrolled.handle.current?.setAxisDomain('x', [10, 20]));
    expect(uncontrolled.handle.current?.isDefault).toBe(false);

    const controlled = mount({ baseDomain: { y: [200, 600] }, domain: { x: [1, 2], y: [200, 600] } });
    expect(controlled.handle.current?.isDefault).toBe(true);
    expect(controlled.root.getAttribute('data-default')).toBe('true');
  });

  it('is not default when the active domain lacks an axis the base declares', () => {
    const missingY = mount({ baseDomain: TWO_AXIS_BASE, domain: { x: [0, 100] } });
    expect(missingY.handle.current?.isDefault).toBe(false);
    expect(missingY.root.getAttribute('data-default')).toBe('false');

    const missingX = mount({ baseDomain: TWO_AXIS_BASE, domain: { y: [200, 600] } });
    expect(missingX.handle.current?.isDefault).toBe(false);
    expect(missingX.root.getAttribute('data-default')).toBe('false');
  });

  it('is vacuously default for an empty base domain whatever the active domain holds', () => {
    const empty = mount({ baseDomain: {} });
    expect(empty.handle.current?.isDefault).toBe(true);
    expect(empty.root.getAttribute('data-default')).toBe('true');

    const seeded = mount({ baseDomain: {}, defaultDomain: { x: [1, 2], y: [3, 4] } });
    expect(seeded.handle.current?.isDefault).toBe(true);
    expect(seeded.handle.current?.getResetButtonProps().disabled).toBe(true);
  });

  it('recomputes default for a controlled domain across rerenders on either axis', () => {
    const handle: HarnessHandle = { current: null };
    const config: ChartViewportConfig = { baseDomain: TWO_AXIS_BASE, domain: { x: [0, 100], y: [200, 600] } };
    const view = render(<Harness config={config} handle={handle} />);
    const root = within(view.container).getByTestId('root');
    expect(handle.current?.isDefault).toBe(true);
    expect(root.getAttribute('data-default')).toBe('true');

    view.rerender(<Harness config={{ ...config, domain: { x: [0, 100], y: [250, 600] } }} handle={handle} />);
    expect(handle.current?.isDefault).toBe(false);
    expect(root.getAttribute('data-default')).toBe('false');

    view.rerender(<Harness config={{ ...config, domain: { x: [0, 100], y: [200, 600] } }} handle={handle} />);
    expect(handle.current?.isDefault).toBe(true);
    expect(root.getAttribute('data-default')).toBe('true');

    view.rerender(<Harness config={{ ...config, domain: { x: [0, 90], y: [200, 600] } }} handle={handle} />);
    expect(handle.current?.isDefault).toBe(false);
    expect(root.getAttribute('data-default')).toBe('false');
  });

  it('compares each axis within the existing epsilon tolerance', () => {
    const withinTolerance = mount({
      baseDomain: TWO_AXIS_BASE,
      domain: { x: [1e-10, 100 - 1e-10], y: [200 + 1e-10, 600 - 1e-10] },
    });
    expect(withinTolerance.handle.current?.isDefault).toBe(true);

    const yBeyond = mount({ baseDomain: TWO_AXIS_BASE, domain: { x: [0, 100], y: [200 + 1e-6, 600] } });
    expect(yBeyond.handle.current?.isDefault).toBe(false);

    const xBeyond = mount({ baseDomain: TWO_AXIS_BASE, domain: { x: [0, 100 + 1e-6], y: [200, 600] } });
    expect(xBeyond.handle.current?.isDefault).toBe(false);
  });
});
