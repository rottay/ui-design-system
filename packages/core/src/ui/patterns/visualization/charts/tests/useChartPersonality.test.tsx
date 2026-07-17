import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DesignSystemProvider } from '../../../../../infrastructure/runtime/bootstrap';
import type { TenantConfig } from '../../../../../foundation/contracts';
import { useChartPersonality } from '../runtime';
import { mockMatchMedia } from '../../../../../tooling/testing/helpers/browser/match-media';

const CHART_TEST_TENANT: TenantConfig = {
  slug: 'chart-test',
  name: 'Chart Test',
  engine: 'rustic',
  theme: 'light',
  plan: 'enterprise',
  features: ['all'],
  branding: {
    companyName: 'Chart Test',
  },
};

function buildWrapper(productProfile: 'events.organizer' | 'recruiting.operator') {
  return function Wrapper({ children }: { children: React.ReactNode }): React.ReactElement {
    return (
      <DesignSystemProvider
        tenantConfig={CHART_TEST_TENANT}
        productProfile={productProfile}
        forceEngine="rustic"
        skipCssLoading
      >
        {children}
      </DesignSystemProvider>
    );
  };
}

function createReducedMotionController(initial: boolean) {
  let matches = initial;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const matchMedia = (query: string) => {
    const reducedQuery = query.includes('prefers-reduced-motion');
    return {
      get matches() {
        return reducedQuery ? matches : false;
      },
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => {
        if (reducedQuery) listeners.add(listener);
      }),
      removeEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => {
        if (reducedQuery) listeners.delete(listener);
      }),
      dispatchEvent: vi.fn(),
    } as MediaQueryList;
  };

  return {
    matchMedia: vi.fn(matchMedia),
    emit(next: boolean) {
      matches = next;
      listeners.forEach((listener) => listener({
        matches: next,
        media: '(prefers-reduced-motion: reduce)',
      } as MediaQueryListEvent));
    },
  };
}

describe('useChartPersonality', () => {
  it('resolves different chart defaults for expressive and dense product profiles', () => {
    mockMatchMedia(1440, false);

    const eventsResult = renderHook(() => useChartPersonality(), {
      wrapper: buildWrapper('events.organizer'),
    });
    const recruitingResult = renderHook(() => useChartPersonality(), {
      wrapper: buildWrapper('recruiting.operator'),
    });

    expect(eventsResult.result.current.lineMode).toBe('smooth');
    expect(eventsResult.result.current.showDots).toBe(false);
    expect(eventsResult.result.current.useGradientFill).toBe(true);
    expect(recruitingResult.result.current.lineMode).toBe('sharp');
    expect(recruitingResult.result.current.showDots).toBe(true);
    expect(recruitingResult.result.current.useGradientFill).toBe(false);
  });

  it('lets the OS reduced-motion prohibition win over an explicit animate request', () => {
    mockMatchMedia(1440, true);

    const { result } = renderHook(() => useChartPersonality({ animate: true }), {
      wrapper: buildWrapper('events.organizer'),
    });

    expect(result.current.animate).toBe(false);
    expect(result.current.animationDuration).toBe(0);
  });

  it('does not replay a settled chart when reduced motion is disabled live', () => {
    const controller = createReducedMotionController(true);
    window.matchMedia = controller.matchMedia as typeof window.matchMedia;

    const { result } = renderHook(() => useChartPersonality({ animate: true }), {
      wrapper: buildWrapper('events.organizer'),
    });
    expect(result.current.animate).toBe(false);
    expect(result.current.animationDuration).toBe(0);

    act(() => controller.emit(false));

    expect(result.current.animate).toBe(false);
    expect(result.current.animationDuration).toBe(0);
  });
});
