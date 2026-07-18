import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MotionProvider } from '@/infrastructure/runtime/motion';
import { useCollectionStagger } from '..';

describe('useCollectionStagger', () => {
  it('resolves the collection.insert preset under a motion-permitting policy', () => {
    // The shared test setup reports no OS reduce preference, so the default
    // policy permits motion (same basis as motion-recipe-presentation tests).
    const { result } = renderHook(() => useCollectionStagger(6));

    expect(result.current.animated).toBe(true);
    expect(result.current.containerClassName).toBe('ds-collection-stagger');
    // step is the recipe's 30ms; a container publishes it so the CSS clamp and
    // the JS timing move together under a tenant durationScale.
    expect(result.current.stepCss).toBe('30ms');
  });

  it('caps the stagger window for a large batch inside the 150-300ms budget', () => {
    const { result } = renderHook(() => useCollectionStagger(1000));

    expect(result.current.animated).toBe(true);
    // 1000 items * 30ms would run 30s; the recipe caps the window at 240ms.
    expect(result.current.maxCss).toBe('240ms');

    const capNumber = Number(result.current.maxCss.replace('ms', ''));
    expect(capNumber).toBeLessThanOrEqual(300);
    expect(capNumber).toBeGreaterThanOrEqual(150);
  });

  it('scales the window down for a small batch (never exceeds the item budget)', () => {
    const { result } = renderHook(() => useCollectionStagger(4));

    // (4 - 1) * 30ms = 90ms, under the 240ms cap.
    expect(result.current.maxCss).toBe('90ms');
  });

  it('renders every item at its final state under reduced motion', () => {
    const { result } = renderHook(() => useCollectionStagger(1000), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MotionProvider reducedMotion>{children}</MotionProvider>
      ),
    });

    // No class, no timing -- the surface stamps nothing, so items paint in place.
    expect(result.current.animated).toBe(false);
    expect(result.current.containerClassName).toBe('');
    expect(result.current.stepCss).toBe('');
    expect(result.current.maxCss).toBe('');
  });
});
