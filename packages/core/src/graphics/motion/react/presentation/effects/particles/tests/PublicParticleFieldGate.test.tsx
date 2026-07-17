import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EffectRuntimeProvider } from '@/infrastructure/runtime/effects/composition/react/provider';

const gate = vi.hoisted(() => ({
  moduleRequests: 0,
  policy: {
    allowAmbientMotion: true,
    maxContinuousLoops: 1 as 0 | 1,
    pointer: 'fine' as const,
    power: 'normal' as const,
    reduce: false,
    visible: true,
  },
  visible: false,
}));

vi.mock('@/infrastructure/runtime/motion', () => ({
  useMotionPolicy: () => gate.policy,
}));

vi.mock('../runtime/canvas', () => {
  gate.moduleRequests += 1;
  return {
    ParticleField: () => <div data-testid="mock-particle-runtime" />,
  };
});

import { ParticleField } from '..';

beforeEach(() => {
  gate.moduleRequests = 0;
  gate.visible = false;
  gate.policy = {
    allowAmbientMotion: true,
    maxContinuousLoops: 1,
    pointer: 'fine',
    power: 'normal',
    reduce: false,
    visible: true,
  };

  class IntersectionObserverMock {
    constructor(private readonly callback: IntersectionObserverCallback) {}

    disconnect = vi.fn();
    observe = vi.fn((element: Element) => {
      this.callback([{
        isIntersecting: gate.visible,
        target: element,
      } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    });
    root = null;
    rootMargin = '200px';
    thresholds = [0];
    takeRecords = vi.fn(() => []);
    unobserve = vi.fn();
  }

  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('public ParticleField lazy admission', () => {
  it.each([
    ['offscreen', false, {}, 'offscreen'],
    ['reduced', true, { reduce: true }, 'reduced-motion'],
    ['coarse', true, { pointer: 'coarse' as const }, 'coarse-pointer'],
    ['save-data/constrained', true, { power: 'constrained' as const }, 'constrained-power'],
    ['hidden', true, { visible: false }, 'page-hidden'],
    ['ambient opt-out', true, { allowAmbientMotion: false }, 'ambient-disabled'],
  ] as const)('does not request the canvas module when %s', async (_name, visible, override, reason) => {
    gate.visible = visible;
    gate.policy = { ...gate.policy, ...override };

    const { container } = render(
      <ParticleField><span>Stable product content</span></ParticleField>,
    );

    await waitFor(() => {
      expect(container.firstElementChild).toHaveAttribute(
        'data-particle-field-runtime',
        'static',
      );
    });
    expect(gate.moduleRequests).toBe(0);
    expect(container.firstElementChild).toHaveAttribute('data-effect-mode', 'static');
    expect(container.firstElementChild).toHaveAttribute('data-effect-reason', reason);
    expect(screen.getByText('Stable product content')).toBeVisible();
  });

  it('does not request the canvas module for an explicitly empty field', async () => {
    gate.visible = true;
    const { container } = render(<ParticleField count={0} />);

    await waitFor(() => {
      expect(container.firstElementChild).toHaveAttribute(
        'data-particle-field-runtime',
        'static',
      );
    });
    expect(gate.moduleRequests).toBe(0);
    expect(container.firstElementChild).toHaveAttribute('data-effect-reason', 'inactive');
  });

  it('keeps the static fallback under global and per-instance DS controls', async () => {
    gate.visible = true;
    const { container, rerender } = render(
      <EffectRuntimeProvider enabled={false}>
        <ParticleField><span>Static content</span></ParticleField>
      </EffectRuntimeProvider>,
    );

    await waitFor(() => {
      expect(container.firstElementChild).toHaveAttribute(
        'data-effect-reason',
        'effect-disabled',
      );
    });
    expect(gate.moduleRequests).toBe(0);
    expect(screen.getByText('Static content')).toBeVisible();

    rerender(
      <EffectRuntimeProvider enabled>
        <ParticleField enabled={false}><span>Static content</span></ParticleField>
      </EffectRuntimeProvider>,
    );
    expect(container.firstElementChild).toHaveAttribute(
      'data-effect-reason',
      'effect-disabled',
    );
    expect(gate.moduleRequests).toBe(0);
  });

  it('requests the canvas module only after policy and viewport become eligible', async () => {
    gate.visible = true;
    const { container } = render(
      <ParticleField><span>Stable product content</span></ParticleField>,
    );

    await waitFor(() => expect(gate.moduleRequests).toBe(1));
    expect(await screen.findByTestId('mock-particle-runtime')).toBeVisible();
    expect(container.firstElementChild).toHaveAttribute(
      'data-particle-field-runtime',
      'loading',
    );
    expect(container.firstElementChild).toHaveAttribute('data-effect-mode', 'active');
    expect(container.firstElementChild).toHaveAttribute('data-effect-reason', 'eligible');
    expect(screen.getByText('Stable product content')).toBeVisible();
  });

  it('emits one frozen resolution followed by stable transition telemetry', async () => {
    gate.visible = true;
    const onTelemetry = vi.fn();
    const { container, rerender } = render(
      <ParticleField enabled={false} onTelemetry={onTelemetry} />,
    );

    await waitFor(() => expect(onTelemetry).toHaveBeenCalledTimes(1));
    expect(onTelemetry.mock.calls[0]?.[0]).toEqual({
      schemaVersion: 1,
      name: 'ds.effect.resolution',
      effectId: 'particle-field',
      current: { mode: 'static', reason: 'effect-disabled' },
    });

    rerender(<ParticleField enabled onTelemetry={onTelemetry} />);
    await waitFor(() => expect(onTelemetry).toHaveBeenCalledTimes(2));
    expect(onTelemetry.mock.calls[1]?.[0]).toEqual({
      schemaVersion: 1,
      name: 'ds.effect.transition',
      effectId: 'particle-field',
      previous: { mode: 'static', reason: 'effect-disabled' },
      current: { mode: 'active', reason: 'eligible' },
    });
    expect(Object.isFrozen(onTelemetry.mock.calls[1]?.[0])).toBe(true);
    expect(Object.isFrozen(onTelemetry.mock.calls[1]?.[0].previous)).toBe(true);
    expect(Object.isFrozen(onTelemetry.mock.calls[1]?.[0].current)).toBe(true);
    expect(container.firstElementChild).toHaveAttribute('data-effect-mode', 'active');

    rerender(<ParticleField enabled onTelemetry={onTelemetry} />);
    await waitFor(() => expect(onTelemetry).toHaveBeenCalledTimes(2));
  });
});
