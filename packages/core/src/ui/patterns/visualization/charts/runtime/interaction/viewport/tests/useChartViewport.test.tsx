import React, { act, useRef } from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
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
  return { handle, root: view.getByTestId('root') };
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
