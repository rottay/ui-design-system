import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PROVIDER_PAINT_ATTRIBUTE_FILTER } from '@/infrastructure/runtime/dom/runtime/css-color-resolution';

const motion = vi.hoisted(() => ({
  policy: {
    profile: 'expressive' as const,
    intensity: 0.8,
    durationScale: 1,
    ambient: 'subtle' as const,
    allowAmbientMotion: true,
    allowContinuousMotion: true,
    allowHoverEffects: true,
    maxContinuousLoops: 1 as 0 | 1,
    pointer: 'fine' as const,
    power: 'normal' as const,
    reduce: false,
    visible: true,
  },
}));

vi.mock('@/infrastructure/runtime/motion', () => ({
  useMotionPolicy: () => motion.policy,
}));

import { ParticleField } from '../index';
import { ParticleFieldLoadingFallback } from '../../..';
import { PARTICLE_RUNTIME_LIMITS } from '@/graphics/motion/foundation/particles/config';
import { installInheritedCustomPropertyModel } from '@/graphics/motion/foundation/particles/config/tests/support/inherited-custom-properties';
import { resetParticleAnimationLeaseForTests } from '../governance/animation-lease';

interface MockIntersectionObserverInstance {
  callback: IntersectionObserverCallback;
  disconnect: ReturnType<typeof vi.fn>;
  observe: ReturnType<typeof vi.fn>;
}

interface MockResizeObserverInstance {
  callback: ResizeObserverCallback;
  disconnect: ReturnType<typeof vi.fn>;
  observe: ReturnType<typeof vi.fn>;
}

interface MockMutationObserverInstance {
  callback: MutationCallback;
  disconnect: ReturnType<typeof vi.fn>;
  observe: ReturnType<typeof vi.fn>;
}

let intersectionVisible = true;
let intersectionObservers: MockIntersectionObserverInstance[] = [];
let resizeObservers: MockResizeObserverInstance[] = [];
let mutationObservers: MockMutationObserverInstance[] = [];
let rafCallbacks = new Map<number, FrameRequestCallback>();
let nextFrameId = 1;
let context: CanvasRenderingContext2D;
let requestFrame: ReturnType<typeof vi.fn>;
let cancelFrame: ReturnType<typeof vi.fn>;

function installObservers(): void {
  class IntersectionObserverMock implements MockIntersectionObserverInstance {
    callback: IntersectionObserverCallback;
    disconnect = vi.fn();
    observe = vi.fn((element: Element) => {
      this.callback([
        {
          isIntersecting: intersectionVisible,
          target: element,
        } as IntersectionObserverEntry,
      ], this as unknown as IntersectionObserver);
    });

    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
      intersectionObservers.push(this);
    }

    root = null;
    rootMargin = '200px';
    thresholds = [0];
    takeRecords = vi.fn(() => []);
    unobserve = vi.fn();
  }

  class ResizeObserverMock implements MockResizeObserverInstance {
    callback: ResizeObserverCallback;
    disconnect = vi.fn();
    observe = vi.fn();

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
      resizeObservers.push(this);
    }

    unobserve = vi.fn();
  }

  class MutationObserverMock implements MockMutationObserverInstance {
    callback: MutationCallback;
    disconnect = vi.fn();
    observe = vi.fn();

    constructor(callback: MutationCallback) {
      this.callback = callback;
      mutationObservers.push(this);
    }

    takeRecords = vi.fn(() => []);
  }

  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  vi.stubGlobal('MutationObserver', MutationObserverMock);
}

function eligiblePolicy(): typeof motion.policy {
  return {
    profile: 'expressive',
    intensity: 0.8,
    durationScale: 1,
    ambient: 'subtle',
    allowAmbientMotion: true,
    allowContinuousMotion: true,
    allowHoverEffects: true,
    maxContinuousLoops: 1,
    pointer: 'fine',
    power: 'normal',
    reduce: false,
    visible: true,
  };
}

function fieldRoot(container: HTMLElement): HTMLElement {
  const root = container.firstElementChild;
  if (!(root instanceof HTMLElement)) throw new Error('ParticleField root missing');
  return root;
}

beforeEach(() => {
  intersectionVisible = true;
  intersectionObservers = [];
  resizeObservers = [];
  mutationObservers = [];
  rafCallbacks = new Map();
  nextFrameId = 1;
  motion.policy = eligiblePolicy();
  resetParticleAnimationLeaseForTests();
  installObservers();
  installInheritedCustomPropertyModel();

  requestFrame = vi.fn((callback: FrameRequestCallback) => {
    const id = nextFrameId;
    nextFrameId += 1;
    rafCallbacks.set(id, callback);
    return id;
  });
  cancelFrame = vi.fn((id: number) => {
    rafCallbacks.delete(id);
  });
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(requestFrame);
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(cancelFrame);
  vi.spyOn(window, 'devicePixelRatio', 'get').mockReturnValue(3);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    bottom: 500,
    height: 500,
    left: 0,
    right: 800,
    toJSON: () => ({}),
    top: 0,
    width: 800,
    x: 0,
    y: 0,
  });

  context = {
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
    globalAlpha: 1,
    setTransform: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
});

afterEach(() => {
  resetParticleAnimationLeaseForTests();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('ParticleField governed runtime', () => {
  it('stays static and schedules zero RAF when IntersectionObserver is absent', () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    const { container } = render(
      <ParticleField><span>Stable child</span></ParticleField>,
    );

    expect(fieldRoot(container)).toHaveAttribute('data-particle-field-runtime', 'static');
    expect(requestFrame).not.toHaveBeenCalled();
    expect(screen.getByText('Stable child')).toBeVisible();
  });

  it.each([
    ['offscreen', { inView: false }],
    ['reduced', { reduce: true }],
    ['coarse', { pointer: 'coarse' as const }],
    ['save-data/constrained', { power: 'constrained' as const }],
    ['hidden', { visible: false }],
    ['ambient opt-out', { allowAmbientMotion: false }],
  ])('schedules zero RAF when %s', async (_name, condition) => {
    // `inView` drives the intersection stub, every other key is a policy
    // field; splitting them keeps the policy spread free of a foreign key.
    const { inView, ...policyOverride } = condition as {
      inView?: boolean;
    } & Partial<ReturnType<typeof eligiblePolicy>>;
    intersectionVisible = inView ?? true;
    motion.policy = { ...eligiblePolicy(), ...policyOverride };

    const { container } = render(<ParticleField />);

    await waitFor(() => {
      expect(fieldRoot(container)).toHaveAttribute('data-particle-field-policy', 'blocked');
    });
    expect(requestFrame).not.toHaveBeenCalled();
    expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled();
  });

  it('emits bounded allocation/color evidence and preserves accessible content', async () => {
    const provider = document.createElement('section');
    provider.style.setProperty('--tenant-particle', '#123456');
    document.body.appendChild(provider);

    const rendered = render(
      <ParticleField
        color="color-mix(in srgb, var(--tenant-particle) 25%, transparent)"
        count={Number.MAX_SAFE_INTEGER}
      >
        <button type="button">Continue</button>
      </ParticleField>,
      { container: provider },
    );

    await waitFor(() => {
      expect(fieldRoot(rendered.container)).toHaveAttribute('data-particle-field-runtime', 'active');
    });
    const canvas = rendered.container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
    expect(canvas).toHaveAttribute('role', 'presentation');
    expect(Number(canvas?.dataset.particleCount)).toBeLessThanOrEqual(
      PARTICLE_RUNTIME_LIMITS.maxParticles,
    );
    expect(Number(canvas?.dataset.particleDpr)).toBeLessThanOrEqual(
      PARTICLE_RUNTIME_LIMITS.maxDevicePixelRatio,
    );
    expect(Number(canvas?.dataset.particlePixels)).toBeLessThanOrEqual(
      PARTICLE_RUNTIME_LIMITS.maxCanvasPixels,
    );
    expect(canvas?.dataset.particleColor).toBe('rgba(18, 52, 86, 0.25)');
    expect(requestFrame).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Continue' })).toBeVisible();
  });

  it('keeps count=0 static with zero RAF even under an eligible policy', async () => {
    const { container } = render(<ParticleField count={0} />);

    await waitFor(() => {
      expect(fieldRoot(container)).toHaveAttribute('data-particle-field-policy', 'blocked');
    });
    expect(container.querySelector('canvas')).toHaveAttribute('data-particle-count', '0');
    expect(fieldRoot(container)).toHaveAttribute('data-particle-field-runtime', 'static');
    expect(requestFrame).not.toHaveBeenCalled();
  });

  it('grants one global context/RAF lease and promotes the unallocated waiter on release', async () => {
    const first = render(<ParticleField className="first" />);
    await waitFor(() => {
      expect(fieldRoot(first.container)).toHaveAttribute('data-particle-field-runtime', 'active');
    });
    const firstCanvas = first.container.querySelector('canvas');
    const second = render(<ParticleField className="second" />);
    await waitFor(() => {
      expect(fieldRoot(second.container)).toHaveAttribute(
        'data-particle-field-runtime',
        'lease-waiting',
      );
    });
    const getContext = vi.mocked(HTMLCanvasElement.prototype.getContext);
    const secondCanvas = second.container.querySelector('canvas');
    expect(PARTICLE_RUNTIME_LIMITS.maxActiveCanvasContexts).toBe(1);
    expect(getContext).toHaveBeenCalledTimes(1);
    expect(secondCanvas).toHaveAttribute('data-particle-count', '0');
    expect(secondCanvas).toHaveAttribute('data-particle-dpr', '0');
    expect(secondCanvas).toHaveAttribute('data-particle-pixels', '0');
    expect(requestFrame).toHaveBeenCalledTimes(1);

    first.unmount();

    expect(firstCanvas).toHaveAttribute('width', '1');
    expect(firstCanvas).toHaveAttribute('height', '1');
    expect(firstCanvas).toHaveAttribute('data-particle-count', '0');
    expect(firstCanvas).toHaveAttribute('data-particle-pixels', '0');

    await waitFor(() => {
      expect(fieldRoot(second.container)).toHaveAttribute('data-particle-field-runtime', 'active');
    });
    expect(getContext).toHaveBeenCalledTimes(2);
    expect(Number(secondCanvas?.dataset.particleCount)).toBeGreaterThan(0);
    expect(requestFrame).toHaveBeenCalledTimes(2);
    expect(cancelFrame).toHaveBeenCalledTimes(1);
  });

  it('releases the runtime lease when context acquisition fails and preserves fallback content', async () => {
    const getContext = vi.mocked(HTMLCanvasElement.prototype.getContext);
    getContext.mockReturnValueOnce(null).mockReturnValue(context);

    const unavailable = render(
      <ParticleField><span>Static meaning</span></ParticleField>,
    );
    await waitFor(() => {
      expect(fieldRoot(unavailable.container)).toHaveAttribute(
        'data-particle-field-runtime',
        'no-context',
      );
    });
    expect(fieldRoot(unavailable.container)).toHaveAttribute('data-particle-field-raf', 'none');
    expect(unavailable.container.querySelector('canvas')).toHaveAttribute('data-particle-count', '0');
    expect(screen.getByText('Static meaning')).toBeVisible();

    const successor = render(<ParticleField />);
    await waitFor(() => {
      expect(fieldRoot(successor.container)).toHaveAttribute('data-particle-field-runtime', 'active');
    });
    expect(getContext).toHaveBeenCalledTimes(2);
    expect(requestFrame).toHaveBeenCalledTimes(1);
  });

  it('cancels on context loss, restores deterministically, and cleans every source once', async () => {
    const rendered = render(<ParticleField />);
    await waitFor(() => {
      expect(fieldRoot(rendered.container)).toHaveAttribute('data-particle-field-runtime', 'active');
    });
    const canvas = rendered.container.querySelector('canvas');
    if (!canvas) throw new Error('canvas missing');
    const initialSeed = canvas.dataset.particleSeed;
    const removeEventListener = vi.spyOn(canvas, 'removeEventListener');

    fireEvent(canvas, new Event('contextlost', { cancelable: true }));
    expect(fieldRoot(rendered.container)).toHaveAttribute(
      'data-particle-field-runtime',
      'context-lost',
    );
    expect(cancelFrame).toHaveBeenCalledTimes(1);
    expect(requestFrame).toHaveBeenCalledTimes(1);

    fireEvent(canvas, new Event('contextrestored'));
    await waitFor(() => {
      expect(fieldRoot(rendered.container)).toHaveAttribute('data-particle-field-runtime', 'active');
    });
    expect(canvas.dataset.particleSeed).toBe(initialSeed);
    expect(requestFrame).toHaveBeenCalledTimes(2);

    rendered.unmount();
    expect(cancelFrame).toHaveBeenCalledTimes(2);
    expect(removeEventListener.mock.calls.filter(([type]) => type === 'contextlost')).toHaveLength(1);
    expect(removeEventListener.mock.calls.filter(([type]) => type === 'contextrestored')).toHaveLength(1);
    expect(resizeObservers.every((observer) => observer.disconnect.mock.calls.length === 1)).toBe(true);
    expect(mutationObservers.every((observer) => observer.disconnect.mock.calls.length === 1)).toBe(true);
  });

  it('uses ResizeObserver without a duplicate window listener or same-size allocation', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener');
    render(<ParticleField />);
    const transformCalls = vi.mocked(context.setTransform).mock.calls.length;
    const observer = resizeObservers.at(-1);
    if (!observer) throw new Error('ResizeObserver missing');

    observer.callback([], observer as unknown as ResizeObserver);
    observer.callback([], observer as unknown as ResizeObserver);

    expect(vi.mocked(context.setTransform)).toHaveBeenCalledTimes(transformCalls);
    expect(addEventListener.mock.calls.filter(([type]) => type === 'resize')).toHaveLength(0);
  });

  it('reacts to the owning provider ancestry without leaking color across roots', async () => {
    const firstProvider = document.createElement('section');
    const secondProvider = document.createElement('section');
    firstProvider.style.setProperty('--tenant-particle', '#112233');
    secondProvider.style.setProperty('--tenant-particle', '#445566');
    document.body.append(firstProvider, secondProvider);
    const first = render(
      <ParticleField color="var(--tenant-particle)" />,
      { container: firstProvider },
    );
    const second = render(
      <ParticleField color="var(--tenant-particle)" />,
      { container: secondProvider },
    );

    await waitFor(() => {
      expect(first.container.querySelector('canvas')?.dataset.particleColor)
        .toBe('rgba(17, 34, 51, 1)');
      expect(second.container.querySelector('canvas')?.dataset.particleColor)
        .toBe('rgba(68, 85, 102, 1)');
    });
    const firstObserver = mutationObservers.find((observer) =>
      observer.observe.mock.calls.some(([target]) => target === firstProvider));
    if (!firstObserver) throw new Error('first provider MutationObserver missing');
    expect(firstObserver.observe).toHaveBeenCalledWith(firstProvider, {
      attributes: true,
      attributeFilter: [...PROVIDER_PAINT_ATTRIBUTE_FILTER],
    });

    firstProvider.style.setProperty('--tenant-particle', '#abcdef');
    firstObserver.callback([], firstObserver as unknown as MutationObserver);

    expect(first.container.querySelector('canvas')?.dataset.particleColor)
      .toBe('rgba(171, 205, 239, 1)');
    expect(second.container.querySelector('canvas')?.dataset.particleColor)
      .toBe('rgba(68, 85, 102, 1)');
  });
});

describe('ParticleField loading boundary', () => {
  it('keeps the same positioned content wrapper while the runtime loads', () => {
    const { container } = render(
      <ParticleFieldLoadingFallback className="field" style={{ minHeight: 200 }}>
        <span>Stable fallback child</span>
      </ParticleFieldLoadingFallback>,
    );

    expect(fieldRoot(container)).toHaveAttribute('data-particle-field-runtime', 'loading');
    expect(fieldRoot(container)).toHaveStyle({
      isolation: 'isolate',
      minHeight: '200px',
      position: 'relative',
    });
    expect(container.querySelector('[data-particle-field-content="true"]')).not.toBeNull();
    expect(screen.getByText('Stable fallback child')).toBeVisible();
  });
});
