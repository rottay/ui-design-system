import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DesignSystemProvider } from '../../../../../infrastructure/runtime/bootstrap';
import type { TenantConfig } from '../../../../../foundation/contracts';
import { useChartPersonality } from '../runtime';
import {
  CHART_CATEGORICAL_SIZE,
  resolveChartSeriesPaint,
} from '../runtime/chart-engine/foundation/grammar/palette';
import { mockMatchMedia } from '@tests/support/browser/match-media';

const CHART_TEST_TENANT: TenantConfig = {
  slug: 'chart-test',
  name: 'Chart Test',
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
  it('resolves default and accessible to their OWN channels, not one shared table', () => {
    mockMatchMedia(1440, false);

    // Consumption expressions, not raw hexes: authored category > generated
    // tenant series > mode-aware channel > audited literal. `default` reads
    // `--ds-chart-default-*` and `accessible` reads `--ds-chart-accessible-*`;
    // the two tables are different decisions and this hook must not collapse
    // them, which it did while DEFAULT_COLORS aliased ACCESSIBLE_COLORS.
    const literals = {
      default: [
        '#0f766e', '#8c6d46', '#b24d3a', '#296f68', '#735838', '#963f31',
        '#3d756f', '#7d6140', '#a04435', '#5e5a52', '#366916', '#716901',
      ],
      accessible: [
        '#2f6b9a', '#a23b72', '#1f7a55', '#9a5700', '#355cb5', '#7a4595',
        '#5f6368', '#006d77', '#9b4a5a', '#4d6a00', '#a53426', '#6d5a24',
      ],
    } as const;

    for (const colorScheme of ['default', 'accessible'] as const) {
      const { result } = renderHook(() => useChartPersonality({ colorScheme }), {
        wrapper: buildWrapper('events.organizer'),
      });

      expect(result.current.colors).toHaveLength(CHART_CATEGORICAL_SIZE);
      result.current.colors.forEach((color, index) => {
        const slot = index + 1;
        expect(color).toBe(
          `var(--ds-chart-category-${slot}, var(--ds-chart-series-${slot}, var(--ds-chart-${colorScheme}-${slot}, ${literals[colorScheme][index]})))`,
        );
      });
    }
  });

  it('resolves every bounded scheme through the chain, so a tenant palette reaches it', () => {
    mockMatchMedia(1440, false);

    // Every scheme carries both tenant channels above the mode-aware scheme
    // channel and the audited literal. A palette expressed as raw
    // `--ds-color-primary-N` ramp reads names no chart channel at all, so a
    // compiler-generated tenant palette cannot reach it.
    for (const colorScheme of ['monochrome', 'pastel', 'vibrant'] as const) {
      const { result } = renderHook(() => useChartPersonality({ colorScheme }), {
        wrapper: buildWrapper('events.organizer'),
      });

      expect(result.current.colors).toEqual([...resolveChartSeriesPaint(colorScheme)]);
      result.current.colors.forEach((color, index) => {
        const slot = index + 1;
        expect(color).toMatch(
          new RegExp(
            `^var\\(--ds-chart-category-${slot}, var\\(--ds-chart-series-${slot}, var\\(--ds-chart-${colorScheme}-${slot}, #[0-9a-f]{6}\\)\\)\\)$`,
          ),
        );
      });
      expect(result.current.colors).not.toEqual([...resolveChartSeriesPaint('accessible')]);
    }
  });

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
