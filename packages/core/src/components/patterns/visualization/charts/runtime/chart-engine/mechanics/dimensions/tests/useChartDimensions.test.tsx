import React, { act } from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useChartDimensions, type ChartDimensionsOptions } from '..';

interface Captured {
  width: number;
  height: number;
}

const captured: Captured = { width: 0, height: 0 };

function Harness(props: {
  w?: number | string;
  h?: number;
  e?: boolean;
  options?: ChartDimensionsOptions;
}): React.ReactElement {
  const result = props.options
    ? useChartDimensions(props.options)
    : useChartDimensions(props.w, props.h, props.e);
  captured.width = result.dimensions.width;
  captured.height = result.dimensions.height;
  return <div ref={result.containerRef} data-testid="container" />;
}

class MockResizeObserver {
  static instances: MockResizeObserver[] = [];
  readonly callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

let rectSpy: ReturnType<typeof vi.spyOn>;
const originalResizeObserver = globalThis.ResizeObserver;

function setRect(width: number, height: number): void {
  rectSpy.mockReturnValue({
    width, height, top: 0, left: 0, right: width, bottom: height, x: 0, y: 0,
    toJSON: () => ({}),
  } as DOMRect);
}

beforeEach(() => {
  MockResizeObserver.instances = [];
  (globalThis as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;
  rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect');
  setRect(800, 300);
});

afterEach(() => {
  cleanup();
  rectSpy.mockRestore();
  (globalThis as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = originalResizeObserver;
});

describe('useChartDimensions positional legacy signature', () => {
  it('measures width and keeps the fixed height', () => {
    render(<Harness w={600} h={250} e />);
    expect(captured).toEqual({ width: 800, height: 250 });
  });

  it('seeds a numeric fallback width and never observes when disabled', () => {
    render(<Harness w="100%" h={400} e={false} />);
    expect(captured).toEqual({ width: 600, height: 400 });
    expect(MockResizeObserver.instances).toHaveLength(0);
  });
});

describe('useChartDimensions options signature', () => {
  it('derives height from the measured width via aspect ratio', () => {
    render(<Harness options={{ aspectRatio: 2 }} />);
    expect(captured).toEqual({ width: 800, height: 400 });
  });

  it('clamps the aspect-ratio height between min and max', () => {
    render(<Harness options={{ aspectRatio: 2, maxHeight: 350 }} />);
    expect(captured).toEqual({ width: 800, height: 350 });
    cleanup();
    render(<Harness options={{ aspectRatio: 8, minHeight: 180 }} />);
    expect(captured).toEqual({ width: 800, height: 180 });
  });

  it('observes the container height when height is auto', () => {
    render(<Harness options={{ height: 'auto' }} />);
    expect(captured).toEqual({ width: 800, height: 300 });
  });

  it('keeps a numeric fixed height through the options door', () => {
    render(<Harness options={{ height: 220 }} />);
    expect(captured).toEqual({ width: 800, height: 220 });
  });

  it('does not commit again when the measured size is unchanged', () => {
    render(<Harness options={{ aspectRatio: 2 }} />);
    const observer = MockResizeObserver.instances[0];
    const settled = { ...captured };
    // A repeat measurement with the same rect must be a no-op (loop safety).
    setRect(800, 300);
    act(() => { observer.callback([], observer as unknown as ResizeObserver); });
    expect(captured).toEqual(settled);
  });
});
