/**
 * ResponsiveProvider tests
 *
 * Validates:
 * - SSR defaults (no provider = backward compat)
 * - Provider at phone width (375px)
 * - Provider at tablet width (768px)
 * - Provider at desktop width (1280px)
 * - useResponsive() returns correct deviceClass
 * - Coarse pointer detection
 * - useBreakpoints reads from context when provider exists
 * - useResponsiveValue reads from context when provider exists
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import React from 'react';

import { ResponsiveProvider, useResponsive } from './index';
import { useBreakpoints } from '../../../hooks/responsive/useBreakpoints';
import { useResponsiveValue } from '../../../hooks/responsive/useResponsiveValue';

// ---------------------------------------------------------------------------
// matchMedia mock infrastructure
// ---------------------------------------------------------------------------

type MediaQueryListener = (e: MediaQueryListEvent) => void;

interface MockMQL {
  matches: boolean;
  media: string;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  addListener: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
  dispatchEvent: ReturnType<typeof vi.fn>;
  onchange: null;
}

/**
 * Configurable matchMedia mock. Callers specify a `resolver` function that,
 * given a query string, returns whether it should match.
 */
function createMatchMediaMock(resolver: (query: string) => boolean) {
  const listeners = new Map<string, Set<MediaQueryListener>>();

  const matchMedia = vi.fn((query: string): MockMQL => {
    if (!listeners.has(query)) {
      listeners.set(query, new Set());
    }

    const mql: MockMQL = {
      matches: resolver(query),
      media: query,
      addEventListener: vi.fn((event: string, cb: MediaQueryListener) => {
        if (event === 'change') {
          listeners.get(query)!.add(cb);
        }
      }),
      removeEventListener: vi.fn((event: string, cb: MediaQueryListener) => {
        if (event === 'change') {
          listeners.get(query)!.delete(cb);
        }
      }),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    };

    return mql;
  });

  return { matchMedia, listeners };
}

/**
 * Returns a resolver function that simulates a viewport of the given width.
 * Parses min-width, max-width, and combined range queries.
 */
function viewportResolver(width: number, options?: { touch?: boolean; landscape?: boolean; reducedMotion?: boolean }) {
  return (query: string): boolean => {
    // Touch device
    if (query === '(hover: none) and (pointer: coarse)') {
      return options?.touch ?? false;
    }

    // Orientation
    if (query === '(orientation: landscape)') {
      return options?.landscape ?? false;
    }

    // Reduced motion
    if (query === '(prefers-reduced-motion: reduce)') {
      return options?.reducedMotion ?? false;
    }

    // Parse width queries
    const minMatch = query.match(/min-width:\s*(\d+)px/);
    const maxMatch = query.match(/max-width:\s*(\d+)px/);

    const minWidth = minMatch ? parseInt(minMatch[1], 10) : 0;
    const maxWidth = maxMatch ? parseInt(maxMatch[1], 10) : Infinity;

    return width >= minWidth && width <= maxWidth;
  };
}

// ---------------------------------------------------------------------------
// Test utilities
// ---------------------------------------------------------------------------

/** Component that renders all responsive context values as data-testid attrs. */
function ResponsiveConsumer() {
  const ctx = useResponsive();
  return (
    <div>
      <span data-testid="deviceClass">{ctx.deviceClass}</span>
      <span data-testid="activeBreakpoint">{ctx.activeBreakpoint}</span>
      <span data-testid="isPhone">{String(ctx.isPhone)}</span>
      <span data-testid="isTablet">{String(ctx.isTablet)}</span>
      <span data-testid="isDesktop">{String(ctx.isDesktop)}</span>
      <span data-testid="pointer">{ctx.pointer}</span>
      <span data-testid="orientation">{ctx.orientation}</span>
      <span data-testid="prefersReducedMotion">{String(ctx.prefersReducedMotion)}</span>
      <span data-testid="isPhoneOrTablet">{String(ctx.isPhoneOrTablet)}</span>
      <span data-testid="isTabletOrDesktop">{String(ctx.isTabletOrDesktop)}</span>
      <span data-testid="isTouchDevice">{String(ctx.isTouchDevice)}</span>
    </div>
  );
}

/** Component that uses useBreakpoints and renders its values. */
function BreakpointsConsumer() {
  const bp = useBreakpoints();
  return (
    <div>
      <span data-testid="bp-isMobile">{String(bp.isMobile)}</span>
      <span data-testid="bp-isTablet">{String(bp.isTablet)}</span>
      <span data-testid="bp-isDesktop">{String(bp.isDesktop)}</span>
      <span data-testid="bp-isTouchDevice">{String(bp.isTouchDevice)}</span>
      <span data-testid="bp-prefersReducedMotion">{String(bp.prefersReducedMotion)}</span>
    </div>
  );
}

/** Component that uses useResponsiveValue and renders the resolved value. */
function ResponsiveValueConsumer() {
  const cols = useResponsiveValue({ base: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 });
  return <span data-testid="rv-cols">{cols}</span>;
}

// ---------------------------------------------------------------------------
// Store originals
// ---------------------------------------------------------------------------

let originalMatchMedia: typeof window.matchMedia;

beforeEach(() => {
  originalMatchMedia = window.matchMedia;
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ResponsiveProvider', () => {
  describe('SSR defaults (no provider)', () => {
    it('useResponsive returns phone defaults when no provider exists', () => {
      const { result } = renderHook(() => useResponsive());

      expect(result.current.deviceClass).toBe('phone');
      expect(result.current.isPhone).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.pointer).toBe('coarse');
      expect(result.current.orientation).toBe('portrait');
      expect(result.current.prefersReducedMotion).toBe(false);
      expect(result.current.isPhoneOrTablet).toBe(true);
      expect(result.current.isTabletOrDesktop).toBe(false);
      expect(result.current.isTouchDevice).toBe(true);
    });
  });

  describe('phone width (375px)', () => {
    it('reports phone deviceClass at 375px viewport', () => {
      const { matchMedia } = createMatchMediaMock(viewportResolver(375, { touch: true }));
      window.matchMedia = matchMedia as any;

      render(
        <ResponsiveProvider>
          <ResponsiveConsumer />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('deviceClass').textContent).toBe('phone');
      expect(screen.getByTestId('isPhone').textContent).toBe('true');
      expect(screen.getByTestId('isTablet').textContent).toBe('false');
      expect(screen.getByTestId('isDesktop').textContent).toBe('false');
      expect(screen.getByTestId('pointer').textContent).toBe('coarse');
      expect(screen.getByTestId('isPhoneOrTablet').textContent).toBe('true');
      expect(screen.getByTestId('isTabletOrDesktop').textContent).toBe('false');
      expect(screen.getByTestId('isTouchDevice').textContent).toBe('true');
    });
  });

  describe('tablet width (768px)', () => {
    it('reports tablet deviceClass at 768px viewport', () => {
      const { matchMedia } = createMatchMediaMock(viewportResolver(768));
      window.matchMedia = matchMedia as any;

      render(
        <ResponsiveProvider>
          <ResponsiveConsumer />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('deviceClass').textContent).toBe('tablet');
      expect(screen.getByTestId('isPhone').textContent).toBe('false');
      expect(screen.getByTestId('isTablet').textContent).toBe('true');
      expect(screen.getByTestId('isDesktop').textContent).toBe('false');
      expect(screen.getByTestId('pointer').textContent).toBe('fine');
      expect(screen.getByTestId('isPhoneOrTablet').textContent).toBe('true');
      expect(screen.getByTestId('isTabletOrDesktop').textContent).toBe('true');
    });
  });

  describe('desktop width (1280px)', () => {
    it('reports desktop deviceClass at 1280px viewport', () => {
      const { matchMedia } = createMatchMediaMock(viewportResolver(1280));
      window.matchMedia = matchMedia as any;

      render(
        <ResponsiveProvider>
          <ResponsiveConsumer />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('deviceClass').textContent).toBe('desktop');
      expect(screen.getByTestId('isPhone').textContent).toBe('false');
      expect(screen.getByTestId('isTablet').textContent).toBe('false');
      expect(screen.getByTestId('isDesktop').textContent).toBe('true');
      expect(screen.getByTestId('pointer').textContent).toBe('fine');
      expect(screen.getByTestId('isPhoneOrTablet').textContent).toBe('false');
      expect(screen.getByTestId('isTabletOrDesktop').textContent).toBe('true');
    });
  });

  describe('coarse pointer detection', () => {
    it('detects touch device when pointer is coarse', () => {
      const { matchMedia } = createMatchMediaMock(viewportResolver(1280, { touch: true }));
      window.matchMedia = matchMedia as any;

      render(
        <ResponsiveProvider>
          <ResponsiveConsumer />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('isTouchDevice').textContent).toBe('true');
      expect(screen.getByTestId('pointer').textContent).toBe('coarse');
    });

    it('reports fine pointer when not a touch device', () => {
      const { matchMedia } = createMatchMediaMock(viewportResolver(1280, { touch: false }));
      window.matchMedia = matchMedia as any;

      render(
        <ResponsiveProvider>
          <ResponsiveConsumer />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('isTouchDevice').textContent).toBe('false');
      expect(screen.getByTestId('pointer').textContent).toBe('fine');
    });
  });

  describe('orientation detection', () => {
    it('reports landscape when orientation query matches', () => {
      const { matchMedia } = createMatchMediaMock(viewportResolver(1280, { landscape: true }));
      window.matchMedia = matchMedia as any;

      render(
        <ResponsiveProvider>
          <ResponsiveConsumer />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('orientation').textContent).toBe('landscape');
    });

    it('reports portrait when orientation query does not match', () => {
      const { matchMedia } = createMatchMediaMock(viewportResolver(375, { landscape: false }));
      window.matchMedia = matchMedia as any;

      render(
        <ResponsiveProvider>
          <ResponsiveConsumer />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('orientation').textContent).toBe('portrait');
    });
  });

  describe('reduced motion detection', () => {
    it('respects prefers-reduced-motion setting', () => {
      const { matchMedia } = createMatchMediaMock(viewportResolver(1280, { reducedMotion: true }));
      window.matchMedia = matchMedia as any;

      render(
        <ResponsiveProvider>
          <ResponsiveConsumer />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('prefersReducedMotion').textContent).toBe('true');
    });
  });

  describe('useBreakpoints reads from context', () => {
    it('maps context values to useBreakpoints result at phone width', () => {
      const { matchMedia } = createMatchMediaMock(viewportResolver(375, { touch: true }));
      window.matchMedia = matchMedia as any;

      render(
        <ResponsiveProvider>
          <BreakpointsConsumer />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('bp-isMobile').textContent).toBe('true');
      expect(screen.getByTestId('bp-isTablet').textContent).toBe('false');
      expect(screen.getByTestId('bp-isDesktop').textContent).toBe('false');
      expect(screen.getByTestId('bp-isTouchDevice').textContent).toBe('true');
    });

    it('maps context values to useBreakpoints result at desktop width', () => {
      const { matchMedia } = createMatchMediaMock(viewportResolver(1280));
      window.matchMedia = matchMedia as any;

      render(
        <ResponsiveProvider>
          <BreakpointsConsumer />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('bp-isMobile').textContent).toBe('false');
      expect(screen.getByTestId('bp-isTablet').textContent).toBe('false');
      expect(screen.getByTestId('bp-isDesktop').textContent).toBe('true');
    });
  });

  describe('useResponsiveValue reads from context', () => {
    it('resolves base value at phone width', () => {
      const { matchMedia } = createMatchMediaMock(viewportResolver(375));
      window.matchMedia = matchMedia as any;

      render(
        <ResponsiveProvider>
          <ResponsiveValueConsumer />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('rv-cols').textContent).toBe('1');
    });

    it('resolves md value at tablet width (768px)', () => {
      const { matchMedia } = createMatchMediaMock(viewportResolver(768));
      window.matchMedia = matchMedia as any;

      render(
        <ResponsiveProvider>
          <ResponsiveValueConsumer />
        </ResponsiveProvider>
      );

      // At 768px (tablet), both sm and md match. Largest-first: md => 3.
      expect(screen.getByTestId('rv-cols').textContent).toBe('3');
    });

    it('resolves xl value at 1280px (not 2xl)', () => {
      const { matchMedia } = createMatchMediaMock(viewportResolver(1280));
      window.matchMedia = matchMedia as any;

      render(
        <ResponsiveProvider>
          <ResponsiveValueConsumer />
        </ResponsiveProvider>
      );

      // At 1280px, activeBreakpoint is 'xl' (2xl starts at 1536px). xl => 5.
      expect(screen.getByTestId('rv-cols').textContent).toBe('5');
    });

    it('resolves 2xl value at 1536px', () => {
      const { matchMedia } = createMatchMediaMock(viewportResolver(1536));
      window.matchMedia = matchMedia as any;

      render(
        <ResponsiveProvider>
          <ResponsiveValueConsumer />
        </ResponsiveProvider>
      );

      // At 1536px, activeBreakpoint is '2xl'. 2xl => 6.
      expect(screen.getByTestId('rv-cols').textContent).toBe('6');
    });

    it('cascades correctly with gaps (base + lg only)', () => {
      const { matchMedia } = createMatchMediaMock(viewportResolver(1280));
      window.matchMedia = matchMedia as any;

      function GapConsumer() {
        const val = useResponsiveValue({ base: 'small', lg: 'large' });
        return <span data-testid="gap-val">{val}</span>;
      }

      render(
        <ResponsiveProvider>
          <GapConsumer />
        </ResponsiveProvider>
      );

      expect(screen.getByTestId('gap-val').textContent).toBe('large');
    });

    it('returns base for tablet when only base + lg are defined', () => {
      const { matchMedia } = createMatchMediaMock(viewportResolver(768));
      window.matchMedia = matchMedia as any;

      function GapConsumer() {
        const val = useResponsiveValue({ base: 'small', lg: 'large' });
        return <span data-testid="gap-val">{val}</span>;
      }

      render(
        <ResponsiveProvider>
          <GapConsumer />
        </ResponsiveProvider>
      );

      // Tablet (640-1023) with only base and lg defined: lg doesn't apply => base
      expect(screen.getByTestId('gap-val').textContent).toBe('small');
    });
  });

  describe('activeBreakpoint at each boundary', () => {
    const cases: Array<{ width: number; expectedBreakpoint: string; expectedDevice: string }> = [
      { width: 375, expectedBreakpoint: 'xs', expectedDevice: 'phone' },
      { width: 639, expectedBreakpoint: 'xs', expectedDevice: 'phone' },
      { width: 640, expectedBreakpoint: 'sm', expectedDevice: 'tablet' },
      { width: 767, expectedBreakpoint: 'sm', expectedDevice: 'tablet' },
      { width: 768, expectedBreakpoint: 'md', expectedDevice: 'tablet' },
      { width: 1023, expectedBreakpoint: 'md', expectedDevice: 'tablet' },
      { width: 1024, expectedBreakpoint: 'lg', expectedDevice: 'desktop' },
      { width: 1279, expectedBreakpoint: 'lg', expectedDevice: 'desktop' },
      { width: 1280, expectedBreakpoint: 'xl', expectedDevice: 'desktop' },
      { width: 1535, expectedBreakpoint: 'xl', expectedDevice: 'desktop' },
      { width: 1536, expectedBreakpoint: '2xl', expectedDevice: 'desktop' },
      { width: 1920, expectedBreakpoint: '2xl', expectedDevice: 'desktop' },
    ];

    cases.forEach(({ width, expectedBreakpoint, expectedDevice }) => {
      it(`${width}px -> activeBreakpoint="${expectedBreakpoint}", deviceClass="${expectedDevice}"`, () => {
        const { matchMedia } = createMatchMediaMock(viewportResolver(width));
        window.matchMedia = matchMedia as any;

        render(
          <ResponsiveProvider>
            <ResponsiveConsumer />
          </ResponsiveProvider>
        );

        expect(screen.getByTestId('activeBreakpoint').textContent).toBe(expectedBreakpoint);
        expect(screen.getByTestId('deviceClass').textContent).toBe(expectedDevice);
      });
    });
  });

  describe('useResponsiveValue { base: 1, md: 2, xl: 4 } at each width', () => {
    function MdXlConsumer() {
      const val = useResponsiveValue({ base: 1, md: 2, xl: 4 });
      return <span data-testid="mdxl-val">{val}</span>;
    }

    const cases: Array<{ width: number; expected: number; reason: string }> = [
      { width: 375, expected: 1, reason: 'xs -> base' },
      { width: 640, expected: 1, reason: 'sm -> cascades to base (no sm defined)' },
      { width: 768, expected: 2, reason: 'md -> md=2' },
      { width: 1024, expected: 2, reason: 'lg -> cascades to md=2 (no lg defined)' },
      { width: 1280, expected: 4, reason: 'xl -> xl=4' },
      { width: 1536, expected: 4, reason: '2xl -> cascades to xl=4 (no 2xl defined)' },
    ];

    cases.forEach(({ width, expected, reason }) => {
      it(`${width}px -> ${expected} (${reason})`, () => {
        const { matchMedia } = createMatchMediaMock(viewportResolver(width));
        window.matchMedia = matchMedia as any;

        render(
          <ResponsiveProvider>
            <MdXlConsumer />
          </ResponsiveProvider>
        );

        expect(screen.getByTestId('mdxl-val').textContent).toBe(String(expected));
      });
    });
  });

  describe('context path vs fallback path produce same results', () => {
    function FallbackValueConsumer() {
      // Without a provider, useResponsiveValue uses the fallback path
      const cols = useResponsiveValue({ base: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 });
      return <span data-testid="fb-cols">{cols}</span>;
    }

    const cases: Array<{ width: number; expected: number }> = [
      { width: 375, expected: 1 },
      { width: 640, expected: 2 },
      { width: 768, expected: 3 },
      { width: 1024, expected: 4 },
      { width: 1280, expected: 5 },
      { width: 1536, expected: 6 },
    ];

    cases.forEach(({ width, expected }) => {
      it(`${width}px -> both paths resolve to ${expected}`, () => {
        const { matchMedia } = createMatchMediaMock(viewportResolver(width));
        window.matchMedia = matchMedia as any;

        // Context path (with provider)
        const { unmount: unmount1 } = render(
          <ResponsiveProvider>
            <ResponsiveValueConsumer />
          </ResponsiveProvider>
        );
        const contextResult = screen.getByTestId('rv-cols').textContent;
        unmount1();

        // Fallback path (without provider)
        render(<FallbackValueConsumer />);
        const fallbackResult = screen.getByTestId('fb-cols').textContent;

        expect(contextResult).toBe(String(expected));
        expect(fallbackResult).toBe(String(expected));
      });
    });
  });
});
