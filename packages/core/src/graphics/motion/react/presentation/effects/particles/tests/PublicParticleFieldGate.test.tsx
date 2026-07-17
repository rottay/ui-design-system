import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
    ['offscreen', false, {}],
    ['reduced', true, { reduce: true }],
    ['coarse', true, { pointer: 'coarse' as const }],
    ['save-data/constrained', true, { power: 'constrained' as const }],
    ['hidden', true, { visible: false }],
    ['ambient opt-out', true, { allowAmbientMotion: false }],
  ] as const)('does not request the canvas module when %s', async (_name, visible, override) => {
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
    expect(screen.getByText('Stable product content')).toBeVisible();
  });
});
