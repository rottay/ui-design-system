import React, { createRef } from 'react';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useInView } from '../in-view';
import { useMousePosition } from '../mouse-position';
import { useMotionPersonality } from '../motion-personality';
import { useReducedMotion } from '../foundation/reduced-motion';
import { useScrollProgress } from '../scroll-progress';
import { useSmoothCounter } from '../smooth-counter';
import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';

class IntersectionObserverMock {
  callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe = vi.fn((element: Element) => {
    this.callback(
      [
        {
          isIntersecting: true,
          target: element,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver
    );
  });

  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('animation hooks', () => {
  it('tracks pointer position relative to an element', async () => {
    function Probe() {
      const ref = createRef<HTMLDivElement>();
      const state = useMousePosition(ref);

      return (
        <div>
          <div
            ref={ref}
            data-testid="target"
            style={{ width: 120, height: 80 }}
          />
          <output data-testid="state">{`${state.x}:${state.y}:${state.isInside}`}</output>
        </div>
      );
    }

    render(<Probe />);

    const target = screen.getByTestId('target');
    Object.defineProperty(target, 'getBoundingClientRect', {
      value: () => ({ left: 10, top: 20, width: 120, height: 80 }),
    });

    fireEvent.mouseMove(target, { clientX: 34, clientY: 46 });
    expect(screen.getByTestId('state')).toHaveTextContent('24:26:true');

    fireEvent.mouseLeave(target);
    expect(screen.getByTestId('state')).toHaveTextContent('24:26:false');
  });

  it('computes scroll progress for a target element', async () => {
    function Probe() {
      const ref = React.useRef<HTMLDivElement>(null);
      const progress = useScrollProgress(ref);

      return (
        <div>
          <div ref={ref} data-testid="target" />
          <output data-testid="progress">{progress.toFixed(2)}</output>
        </div>
      );
    }

    render(<Probe />);

    const target = screen.getByTestId('target');
    Object.defineProperty(target, 'scrollHeight', { value: 300, configurable: true });
    Object.defineProperty(target, 'clientHeight', { value: 100, configurable: true });
    Object.defineProperty(target, 'scrollTop', { value: 100, configurable: true, writable: true });

    fireEvent.scroll(target);
    await waitFor(() => expect(screen.getByTestId('progress')).toHaveTextContent('0.50'));
  });

  it('animates a smooth counter until the target value', async () => {
    vi.useFakeTimers();
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const { result } = renderHook(() => useSmoothCounter(0, 100, 100));

    expect(result.current).toBe(0);

    act(() => {
      const callback = frames.shift();
      callback?.(0);
    });

    act(() => {
      const callback = frames.shift();
      callback?.(100);
    });

    expect(result.current).toBe(100);
    vi.useRealTimers();
  });

  it('renders a zero-duration smooth counter at its final value without scheduling a frame', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })));
    const requestFrame = vi.fn();
    vi.stubGlobal('requestAnimationFrame', requestFrame);

    const { result } = renderHook(() => useSmoothCounter(0, 100, 0));

    expect(result.current).toBe(100);
    expect(Number.isNaN(result.current)).toBe(false);
    expect(requestFrame).not.toHaveBeenCalled();
  });

  it('cancels an active smooth counter and jumps final on a live reduced-motion change', () => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    let matches = false;
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      get matches() {
        return matches;
      },
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener)),
      removeEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener)),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })));
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 42));
    const cancelFrame = vi.fn();
    vi.stubGlobal('cancelAnimationFrame', cancelFrame);

    const { result } = renderHook(() => useSmoothCounter(0, 100, 1000));
    expect(result.current).toBe(0);

    act(() => {
      matches = true;
      listeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent));
    });

    expect(cancelFrame).toHaveBeenCalledWith(42);
    expect(result.current).toBe(100);
  });

  it('reads the prefers-reduced-motion media query', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(() => ({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));

    const { result } = renderHook(() => useReducedMotion());

    await waitFor(() => expect(result.current).toBe(true));
  });

  it('reports in-view state through IntersectionObserver', async () => {
    function Probe() {
      const ref = React.useRef<HTMLDivElement>(null);
      const { inView } = useInView(ref, { once: true });

      return (
        <div>
          <div ref={ref}>Viewport target</div>
          <output data-testid="in-view">{String(inView)}</output>
        </div>
      );
    }

    render(<Probe />);

    await waitFor(() => expect(screen.getByTestId('in-view')).toHaveTextContent('true'));
  });

  it('resolves motion personality values from the provider stack', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(() => ({
      matches: false,
      media: '(prefers-reduced-motion: no-preference)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));

    function Probe() {
      const motion = useMotionPersonality();

      return (
        <output data-testid="motion">
          {`${motion.durationSeconds}:${motion.delaySeconds}:${motion.durationMs}:${motion.delayMs}:${motion.offsetDistance}:${motion.hoverLift}`}
        </output>
      );
    }

    render(
      <DesignSystemProvider
        tenantConfig={{
          slug: 'motion-test',
          name: 'Motion Test',
          engine: 'rustic',
          theme: 'light',
          locale: 'en',
          fallbackLocale: 'en',
          plan: 'enterprise',
          features: [],
          branding: {
            companyName: 'Motion Test',
            primaryColor: '#0a66c2',
            darkPrimaryColor: '#60a5fa',
            accentColor: '#0f766e',
            darkAccentColor: '#5eead4',
          },
        }}
        productProfile="events.organizer"
        forceEngine="rustic"
        skipCssLoading
      >
        <Probe />
      </DesignSystemProvider>
    );

    await waitFor(() => {
      const raw = screen.getByTestId('motion').textContent ?? '';
      const [duration, delay, durationMs, delayMs, offset, hoverLift] = raw.split(':').map(Number);
      expect(duration).toBeGreaterThan(0);
      expect(delay).toBeGreaterThanOrEqual(0);
      expect(durationMs).toBe(duration * 1000);
      expect(delayMs).toBe(delay * 1000);
      expect(offset).toBeGreaterThan(0);
      expect(hoverLift).toBeGreaterThanOrEqual(0);
    });
  });
});
