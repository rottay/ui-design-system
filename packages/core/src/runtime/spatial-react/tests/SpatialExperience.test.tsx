import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StrictMode, useEffect, useRef, type ComponentProps } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { MotionPolicy } from '../../../contracts/motion';
import { SpatialExperience } from '../SpatialExperience';
import { getSpatialContextLeaseCount, resetSpatialContextLeaseForTests } from '../context-lease';
import type { SpatialSceneRuntimeProps } from '../types';
import { resetWebGL2CapabilityForTests } from '../webgl2-capability';

const motion = vi.hoisted(() => ({
  policy: {
    reduce: false,
    pointer: 'fine',
    power: 'normal',
    visible: true,
    allowAmbientMotion: true,
    allowContinuousMotion: true,
    allowHoverEffects: true,
    maxContinuousLoops: 1,
  } as MotionPolicy,
}));

vi.mock('../../motion/MotionPreference', () => ({
  useMotionPolicy: () => motion.policy,
}));

interface ObserverRecord {
  callback: IntersectionObserverCallback;
  disconnect: ReturnType<typeof vi.fn>;
}

let observers: ObserverRecord[] = [];

interface MediaQueryRecord {
  readonly addEventListener: ReturnType<typeof vi.fn>;
  readonly removeEventListener: ReturnType<typeof vi.fn>;
  readonly addListener: ReturnType<typeof vi.fn>;
  readonly removeListener: ReturnType<typeof vi.fn>;
}

let mediaQueries: MediaQueryRecord[] = [];

function installViewport(phone = false, tablet = false): void {
  mediaQueries = [];
  window.matchMedia = vi.fn((query: string) => {
    const record: MediaQueryRecord = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    };
    mediaQueries.push(record);
    return {
      matches: query.includes('767') ? phone : query.includes('1024') ? tablet : false,
      media: query,
      onchange: null,
      ...record,
      dispatchEvent: vi.fn(() => true),
    };
  }) as typeof window.matchMedia;
}

function setViewport(isIntersecting: boolean, index = 0): void {
  const observer = observers[index];
  if (!observer) throw new Error(`missing observer ${index}`);
  act(() => {
    observer.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
  });
}

function enterViewport(index = 0): void {
  setViewport(true, index);
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

function createScene(dispose = vi.fn(), marker?: string) {
  let latestProps: SpatialSceneRuntimeProps | null = null;
  let latestCanvas: HTMLCanvasElement | null = null;

  function Scene(props: SpatialSceneRuntimeProps) {
    latestProps = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return undefined;
      latestCanvas = canvas;
      const unregister = props.registerCanvas(canvas, dispose);
      props.reportReady();
      return unregister;
    }, [props.registerCanvas, props.reportReady]);

    return <canvas ref={canvasRef} data-testid={marker ?? `scene-${props.id}`} />;
  }

  return {
    dispose,
    canvas: () => latestCanvas,
    module: { version: 1 as const, backend: 'webgl2' as const, Scene },
    props: () => latestProps,
  };
}

function baseProps(
  loadScene: ComponentProps<typeof SpatialExperience>['loadScene'],
): ComponentProps<typeof SpatialExperience> {
  return {
    id: 'ecosystem',
    label: 'Ecosystem map',
    purpose: 'explanation',
    description: 'How the system layers connect.',
    poster: <div>Static architecture</div>,
    reduced: <div>Reduced architecture</div>,
    loadScene,
  };
}

beforeEach(() => {
  observers = [];
  class IntersectionObserverMock {
    readonly callback: IntersectionObserverCallback;
    readonly disconnect = vi.fn();
    readonly observe = vi.fn();
    readonly takeRecords = vi.fn(() => []);
    readonly unobserve = vi.fn();
    readonly root = null;
    readonly rootMargin = '0px';
    readonly thresholds = [0];

    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
      observers.push({ callback, disconnect: this.disconnect });
    }
  }
  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
  installViewport();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockImplementation(((type: string) => (
      type === 'webgl2'
        ? { getExtension: () => ({ loseContext: vi.fn() }) }
        : null
    )) as typeof HTMLCanvasElement.prototype.getContext);
  motion.policy = {
    ...motion.policy,
    reduce: false,
    pointer: 'fine',
    power: 'normal',
    visible: true,
  };
  resetSpatialContextLeaseForTests();
  resetWebGL2CapabilityForTests();
});

afterEach(() => {
  cleanup();
  resetSpatialContextLeaseForTests();
  resetWebGL2CapabilityForTests();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('SpatialExperience', () => {
  it('server-renders the meaningful poster and never probes or loads', () => {
    const loader = vi.fn();
    const html = renderToString(
      <SpatialExperience
        {...baseProps(loader)}
        labels={{ pause: 'Pause spatial view', resume: 'Resume spatial view' }}
      />,
    );

    expect(html).toContain('Static architecture');
    expect(html).toContain('data-spatial-mode="static"');
    expect(html).not.toContain('Pause spatial view');
    expect(loader).not.toHaveBeenCalled();
    expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled();
  });

  it('keeps reduced motion final without probing or loading the scene', async () => {
    motion.policy = { ...motion.policy, reduce: true };
    const loader = vi.fn();
    render(<SpatialExperience {...baseProps(loader)} />);
    enterViewport();

    expect(await screen.findByText('Reduced architecture')).toBeVisible();
    expect(screen.getByRole('region')).toHaveAttribute('data-spatial-mode', 'reduced');
    expect(loader).not.toHaveBeenCalled();
    expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled();
  });

  it('loads only after hydration, viewport, WebGL2 and the context lease', async () => {
    const scene = createScene();
    const loader = vi.fn(async () => scene.module);
    render(<SpatialExperience {...baseProps(loader)} />);

    expect(loader).not.toHaveBeenCalled();
    enterViewport();

    await waitFor(() => expect(screen.getByRole('region')).toHaveAttribute(
      'data-spatial-reason',
      'eligible-high',
    ), { timeout: 2000 });
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(1));
    expect(await screen.findByTestId('scene-ecosystem')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('region')).toHaveAttribute('data-spatial-mode', 'live-high');
    expect(screen.getByRole('region')).toHaveAttribute('data-spatial-ready', 'true');
    expect(getSpatialContextLeaseCount()).toBe(1);
  });

  it('keeps a second host static until the first owner releases the global lease', async () => {
    const firstScene = createScene();
    const secondScene = createScene();
    const firstLoader = vi.fn(async () => firstScene.module);
    const secondLoader = vi.fn(async () => secondScene.module);
    const first = render(<SpatialExperience {...baseProps(firstLoader)} id="first" />);
    enterViewport(0);
    await waitFor(() => expect(firstLoader).toHaveBeenCalledTimes(1));

    render(<SpatialExperience {...baseProps(secondLoader)} id="second" />);
    enterViewport(1);
    await waitFor(() => expect(screen.getAllByRole('region')[1]).toHaveAttribute(
      'data-spatial-reason',
      'context-busy',
    ));
    expect(secondLoader).not.toHaveBeenCalled();

    first.unmount();
    await waitFor(() => expect(secondLoader).toHaveBeenCalledTimes(1));
    expect(await screen.findByTestId('scene-second')).toBeVisible();
  });

  it('falls back and releases the lease on context loss, then retries explicitly', async () => {
    const scene = createScene();
    const loader = vi.fn(async () => scene.module);
    render(
      <SpatialExperience
        {...baseProps(loader)}
        labels={{ retry: 'Try spatial view again' }}
      />,
    );
    enterViewport();
    const canvas = await screen.findByTestId('scene-ecosystem');

    const lost = new Event('webglcontextlost', { cancelable: true });
    fireEvent(canvas, lost);
    expect(lost.defaultPrevented).toBe(true);
    expect(await screen.findByText('Static architecture')).toBeVisible();
    await waitFor(() => expect(getSpatialContextLeaseCount()).toBe(0));
    expect(scene.dispose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Try spatial view again' }));
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(2));
    expect(await screen.findByTestId('scene-ecosystem')).toBeVisible();
  });

  it('requires controls and an equivalent alternative for interactive scenes', () => {
    const scene = createScene();
    const loader = vi.fn(async () => scene.module);
    render(<SpatialExperience {...baseProps(loader)} interaction="inspect" />);
    enterViewport();

    expect(screen.getByRole('region')).toHaveAttribute('data-spatial-reason', 'contract-not-ready');
    expect(loader).not.toHaveBeenCalled();
    expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled();
  });

  it('downgrades auto quality after sustained slow frames without replacing meaning', async () => {
    const scene = createScene();
    const loader = vi.fn(async () => scene.module);
    render(<SpatialExperience {...baseProps(loader)} quality="auto" />);
    enterViewport();
    await screen.findByTestId('scene-ecosystem');

    act(() => {
      for (let index = 0; index < 8; index += 1) {
        scene.props()?.reportPerformance({ frameTimeMs: 30 });
      }
    });

    await waitFor(() => expect(screen.getByRole('region')).toHaveAttribute(
      'data-spatial-mode',
      'live-low',
    ));
    expect(scene.props()?.quality.maxDpr).toBeLessThanOrEqual(1.25);
    expect(scene.dispose).not.toHaveBeenCalled();
  });

  it('disconnects observers/listeners and ignores a loader that settles after rapid unmount', async () => {
    const pending = deferred<ReturnType<typeof createScene>['module']>();
    const loader = vi.fn(() => pending.promise);
    const onEvent = vi.fn();
    const view = render(<SpatialExperience {...baseProps(loader)} onEvent={onEvent} />);
    enterViewport();
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(1));

    view.unmount();
    expect(observers[0]?.disconnect).toHaveBeenCalledTimes(1);
    expect(mediaQueries).toHaveLength(2);
    expect(mediaQueries.every((query) => query.removeEventListener.mock.calls.length === 1))
      .toBe(true);
    expect(getSpatialContextLeaseCount()).toBe(0);

    const staleScene = createScene();
    await act(async () => {
      pending.resolve(staleScene.module);
      await pending.promise;
    });
    expect(onEvent.mock.calls.some(([event]) => event.type === 'ready' || event.type === 'error'))
      .toBe(false);
    expect(staleScene.dispose).not.toHaveBeenCalled();
  });

  it('ignores a stale loader after the loader prop is replaced', async () => {
    const staleScene = createScene(vi.fn(), 'stale-scene');
    const freshScene = createScene(vi.fn(), 'fresh-scene');
    const pending = deferred<typeof staleScene.module>();
    const staleLoader = vi.fn(() => pending.promise);
    const freshLoader = vi.fn(async () => freshScene.module);
    const view = render(<SpatialExperience {...baseProps(staleLoader)} />);
    enterViewport();
    await waitFor(() => expect(staleLoader).toHaveBeenCalledTimes(1));

    view.rerender(<SpatialExperience {...baseProps(freshLoader)} />);
    expect(await screen.findByTestId('fresh-scene')).toBeVisible();
    expect(freshLoader).toHaveBeenCalledTimes(1);

    await act(async () => {
      pending.resolve(staleScene.module);
      await pending.promise;
    });
    expect(screen.queryByTestId('stale-scene')).not.toBeInTheDocument();
    expect(screen.getByTestId('fresh-scene')).toBeVisible();
  });

  it('revokes stale scene callbacks across offscreen and document-hidden lifecycles', async () => {
    const scene = createScene();
    const loader = vi.fn(async () => scene.module);
    const onEvent = vi.fn();
    const props = { ...baseProps(loader), onEvent };
    const view = render(<SpatialExperience {...props} />);
    enterViewport();
    await screen.findByTestId('scene-ecosystem');
    const staleRuntime = scene.props();
    if (!staleRuntime) throw new Error('missing scene runtime');

    setViewport(false);
    await waitFor(() => expect(screen.queryByTestId('scene-ecosystem')).not.toBeInTheDocument());
    await waitFor(() => expect(getSpatialContextLeaseCount()).toBe(0));
    const eventCount = onEvent.mock.calls.length;
    const staleDispose = vi.fn();
    act(() => {
      staleRuntime.reportReady();
      staleRuntime.reportError(new Error('late scene error'));
      for (let index = 0; index < 12; index += 1) {
        staleRuntime.reportPerformance({ frameTimeMs: 40 });
      }
      staleRuntime.registerCanvas(document.createElement('canvas'), staleDispose);
    });
    expect(staleDispose).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledTimes(eventCount);

    setViewport(true);
    expect(await screen.findByTestId('scene-ecosystem')).toBeVisible();
    expect(loader).toHaveBeenCalledTimes(1);
    motion.policy = { ...motion.policy, visible: false };
    view.rerender(<SpatialExperience {...props} />);
    await waitFor(() => expect(screen.queryByTestId('scene-ecosystem')).not.toBeInTheDocument());
    await waitFor(() => expect(getSpatialContextLeaseCount()).toBe(0));

    motion.policy = { ...motion.policy, visible: true };
    view.rerender(<SpatialExperience {...props} />);
    expect(await screen.findByTestId('scene-ecosystem')).toBeVisible();
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('keeps pause focus and the equivalent alternative stable while live work unmounts', async () => {
    const scene = createScene();
    const loader = vi.fn(async () => scene.module);
    const { container } = render(
      <SpatialExperience
        {...baseProps(loader)}
        alternative={<div>Equivalent applicant list</div>}
        controls={<button type="button">Inspect applicant</button>}
        interaction="inspect"
        labels={{
          alternative: 'View equivalent list',
          controls: 'Spatial inspection controls',
          pause: 'Pause spatial view',
          resume: 'Resume spatial view',
        }}
      />,
    );
    const alternative = container.querySelector('[data-spatial-alternative="true"]');
    expect(alternative).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pause spatial view' })).not.toBeInTheDocument();
    enterViewport();
    await screen.findByTestId('scene-ecosystem');
    expect(screen.getByRole('group', { name: 'Spatial inspection controls' })).toBeVisible();

    const pause = screen.getByRole('button', { name: 'Pause spatial view' });
    pause.focus();
    fireEvent.click(pause);
    await waitFor(() => expect(screen.queryByTestId('scene-ecosystem')).not.toBeInTheDocument());
    expect(document.activeElement).toBe(pause);
    expect(pause).toHaveAttribute('aria-pressed', 'true');
    expect(pause).toHaveTextContent('Resume spatial view');
    expect(container.querySelector('[data-spatial-alternative="true"]')).toBe(alternative);
    expect(screen.getByText('Equivalent applicant list')).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Spatial inspection controls' }))
      .not.toBeInTheDocument();

    fireEvent.click(pause);
    expect(await screen.findByTestId('scene-ecosystem')).toBeVisible();
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('deduplicates StrictMode, ready and adaptive-quality events', async () => {
    const scene = createScene();
    const loader = vi.fn(async () => scene.module);
    const onEvent = vi.fn();
    render(
      <StrictMode>
        <SpatialExperience {...baseProps(loader)} onEvent={onEvent} />
      </StrictMode>,
    );
    const initialModeEvents = onEvent.mock.calls
      .map(([event]) => event)
      .filter((event) => event.type === 'mode');
    expect(new Set(initialModeEvents.map((event) => JSON.stringify(event))).size)
      .toBe(initialModeEvents.length);

    const activeObserverIndex = observers.length - 1;
    enterViewport(activeObserverIndex);
    await screen.findByTestId('scene-ecosystem');
    const runtime = scene.props();
    if (!runtime) throw new Error('missing scene runtime');
    act(() => {
      runtime.reportReady();
      runtime.reportReady();
      for (let index = 0; index < 16; index += 1) {
        runtime.reportPerformance({ frameTimeMs: 30 });
      }
    });

    const events = onEvent.mock.calls.map(([event]) => event);
    expect(events.filter((event) => event.type === 'ready')).toHaveLength(1);
    expect(events.filter((event) => event.type === 'quality')).toHaveLength(1);
  });

  it('rolls back semantic mutations when Canvas listener registration is hostile', async () => {
    const nativeAddEventListener = HTMLCanvasElement.prototype.addEventListener;
    vi.spyOn(HTMLCanvasElement.prototype, 'addEventListener').mockImplementation(function add(
      this: HTMLCanvasElement,
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) {
      if (type === 'webglcontextlost') throw new Error('hostile canvas');
      nativeAddEventListener.call(this, type, listener, options);
    });
    const scene = createScene();
    const loader = vi.fn(async () => scene.module);
    const onEvent = vi.fn();
    render(<SpatialExperience {...baseProps(loader)} onEvent={onEvent} />);
    enterViewport();

    await waitFor(() => expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error',
      phase: 'scene',
    })));
    const canvas = scene.canvas();
    expect(canvas).not.toBeNull();
    expect(canvas).not.toHaveAttribute('aria-hidden');
    expect(canvas).not.toHaveAttribute('role');
    expect(canvas).not.toHaveAttribute('tabindex');
    expect(canvas).not.toHaveAttribute('data-spatial-experience-canvas');
    expect(scene.dispose).toHaveBeenCalledTimes(1);
  });

  it('fails one duplicate Canvas registration and disposes both renderer owners once', async () => {
    const firstDispose = vi.fn();
    const duplicateDispose = vi.fn();
    const onEvent = vi.fn();
    let canvas: HTMLCanvasElement | null = null;

    function DuplicateScene(props: SpatialSceneRuntimeProps) {
      const canvasRef = useRef<HTMLCanvasElement>(null);
      useEffect(() => {
        const node = canvasRef.current;
        if (!node) return undefined;
        canvas = node;
        const unregisterFirst = props.registerCanvas(node, firstDispose);
        const unregisterDuplicate = props.registerCanvas(node, duplicateDispose);
        props.reportReady();
        return () => {
          unregisterDuplicate();
          unregisterFirst();
        };
      }, [props.registerCanvas, props.reportReady]);
      return <canvas data-testid="duplicate-scene" ref={canvasRef} />;
    }

    const loader = vi.fn(async () => ({
      version: 1 as const,
      backend: 'webgl2' as const,
      Scene: DuplicateScene,
    }));
    render(<SpatialExperience {...baseProps(loader)} onEvent={onEvent} />);
    enterViewport();

    await waitFor(() => expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error',
      phase: 'scene',
    })));
    await waitFor(() => expect(getSpatialContextLeaseCount()).toBe(0));
    expect(onEvent.mock.calls.filter(([event]) => event.type === 'error')).toHaveLength(1);
    expect(onEvent.mock.calls.filter(([event]) => event.type === 'ready')).toHaveLength(0);
    expect(firstDispose).toHaveBeenCalledTimes(1);
    expect(duplicateDispose).toHaveBeenCalledTimes(1);
    expect(canvas).not.toHaveAttribute('data-spatial-experience-canvas');
  });

  it('times out a loader that never settles, releases its lease and ignores a late module', async () => {
    const pending = deferred<ReturnType<typeof createScene>['module']>();
    const loader = vi.fn(() => pending.promise);
    const onEvent = vi.fn();
    const timeoutSpy = vi.spyOn(window, 'setTimeout');
    render(
      <SpatialExperience
        {...baseProps(loader)}
        labels={{ retry: 'Retry spatial scene' }}
        onEvent={onEvent}
      />,
    );
    enterViewport();
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(1));
    expect(getSpatialContextLeaseCount()).toBe(1);

    const loadTimeout = timeoutSpy.mock.calls.find(([, timeout]) => (
      typeof timeout === 'number' && timeout >= 14_000
    ));
    expect(loadTimeout).toBeDefined();
    const timeoutHandler = loadTimeout?.[0];
    if (typeof timeoutHandler !== 'function') throw new Error('missing load timeout handler');
    act(() => timeoutHandler());

    expect(await screen.findByRole('button', { name: 'Retry spatial scene' })).toBeVisible();
    await waitFor(() => expect(getSpatialContextLeaseCount()).toBe(0));
    expect(onEvent.mock.calls.filter(([event]) => (
      event.type === 'error' && event.phase === 'load'
    ))).toHaveLength(1);

    const lateScene = createScene(vi.fn(), 'late-scene');
    await act(async () => {
      pending.resolve(lateScene.module);
      await pending.promise;
    });
    expect(screen.queryByTestId('late-scene')).not.toBeInTheDocument();
    expect(getSpatialContextLeaseCount()).toBe(0);
  });

  it('denies probing and loading for phone, coarse, constrained, hidden and offscreen hosts', async () => {
    const cases: Array<{
      enter: boolean;
      name: string;
      reason: string;
      setup: () => void;
    }> = [
      {
        enter: true,
        name: 'phone',
        reason: 'phone',
        setup: () => installViewport(true),
      },
      {
        enter: true,
        name: 'coarse pointer',
        reason: 'coarse-pointer',
        setup: () => {
          installViewport();
          motion.policy = { ...motion.policy, pointer: 'coarse' };
        },
      },
      {
        enter: true,
        name: 'constrained power',
        reason: 'constrained-power',
        setup: () => {
          installViewport();
          motion.policy = { ...motion.policy, power: 'constrained' };
        },
      },
      {
        enter: true,
        name: 'hidden page',
        reason: 'page-hidden',
        setup: () => {
          installViewport();
          motion.policy = { ...motion.policy, visible: false };
        },
      },
      {
        enter: false,
        name: 'offscreen host',
        reason: 'offscreen',
        setup: () => installViewport(),
      },
    ];

    for (const scenario of cases) {
      motion.policy = {
        ...motion.policy,
        pointer: 'fine',
        power: 'normal',
        visible: true,
      };
      scenario.setup();
      resetWebGL2CapabilityForTests();
      const getContext = vi.mocked(HTMLCanvasElement.prototype.getContext);
      getContext.mockClear();
      const loader = vi.fn();
      const observerIndex = observers.length;
      const view = render(<SpatialExperience {...baseProps(loader)} id={scenario.name} />);
      if (scenario.enter) enterViewport(observerIndex);

      await waitFor(() => expect(screen.getByRole('region')).toHaveAttribute(
        'data-spatial-reason',
        scenario.reason,
      ));
      expect(loader, scenario.name).not.toHaveBeenCalled();
      expect(getContext, scenario.name).not.toHaveBeenCalled();

      view.unmount();
      expect(observers[observerIndex]?.disconnect, scenario.name).toHaveBeenCalledTimes(1);
      expect(getSpatialContextLeaseCount(), scenario.name).toBe(0);
    }
  });

  it('rolls back partial modern media listeners and cleans the legacy fallback', async () => {
    const records = Array.from({ length: 2 }, () => ({
      addEventListener: vi.fn(() => {
        throw new Error('partial modern MediaQueryList');
      }),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));
    let queryIndex = 0;
    window.matchMedia = vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      ...records[queryIndex++]!,
      dispatchEvent: vi.fn(() => true),
    })) as typeof window.matchMedia;

    const view = render(<SpatialExperience {...baseProps(vi.fn())} />);
    await waitFor(() => expect(records.every((record) => (
      record.addListener.mock.calls.length === 1
    ))).toBe(true));
    expect(records.every((record) => record.removeEventListener.mock.calls.length === 1))
      .toBe(true);

    view.unmount();
    expect(records.every((record) => record.removeListener.mock.calls.length === 1)).toBe(true);
  });
});
