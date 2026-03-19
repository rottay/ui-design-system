'use client';

/**
 * @fileoverview ResponsiveProvider - Rottay Design System
 * @description Centralised responsive context that shares a single set of
 * matchMedia subscriptions across all consumers. Replaces the per-component
 * subscription model where each call to useBreakpoints / useResponsiveValue
 * would spin up its own listeners.
 *
 * @remarks
 * The provider detects:
 * - **Device class**: phone (0-639), tablet (640-1023), desktop (1024+)
 * - **Pointer type**: coarse (touch) or fine (mouse)
 * - **Orientation**: portrait or landscape
 * - **Reduced motion**: respects OS accessibility setting
 *
 * SSR-safe: returns mobile-first defaults (phone, coarse, portrait) when
 * window is undefined so server-rendered markup matches the smallest layout.
 *
 * @example
 * ```tsx
 * import { ResponsiveProvider, useResponsive } from '@rottay/design-system';
 *
 * function App() {
 *   return (
 *     <ResponsiveProvider>
 *       <Layout />
 *     </ResponsiveProvider>
 *   );
 * }
 *
 * function Layout() {
 *   const { deviceClass, isDesktop, isTouchDevice } = useResponsive();
 *   return isDesktop ? <Sidebar /> : <Drawer />;
 * }
 * ```
 *
 * @module System/Providers/Responsive
 * @category System
 * @package @rottay/design-system
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

import {
  RESPONSIVE_BREAKPOINTS,
  buildRangeQuery,
  buildMinWidthQuery,
} from '../../hooks/responsive/breakpoints';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Device classification derived from viewport width breakpoints. */
export type DeviceClass = 'phone' | 'tablet' | 'desktop';

/** Pointer precision reported by the primary input device. */
export type PointerType = 'coarse' | 'fine';

/** Current viewport orientation. */
export type Orientation = 'portrait' | 'landscape';

/**
 * Responsive context value exposed to all consumers via `useResponsive()`.
 *
 * All boolean flags are derived from the canonical `deviceClass` to guarantee
 * mutual consistency (e.g. `isPhone` is always `deviceClass === 'phone'`).
 */
/** Precise breakpoint key matching the current viewport width. */
export type ActiveBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ResponsiveContextValue {
  /** Canonical device tier: phone (0-639), tablet (640-1023), desktop (1024+). */
  deviceClass: DeviceClass;
  /** Precise active breakpoint for accurate ResponsiveValue resolution. */
  activeBreakpoint: ActiveBreakpoint;
  /** True when viewport width is below 640px. */
  isPhone: boolean;
  /** True when viewport width is 640-1023px. */
  isTablet: boolean;
  /** True when viewport width is 1024px or above. */
  isDesktop: boolean;
  /** Primary pointer precision (coarse = touch, fine = mouse/trackpad). */
  pointer: PointerType;
  /** Current viewport orientation. */
  orientation: Orientation;
  /** True when the OS-level "reduce motion" setting is enabled. */
  prefersReducedMotion: boolean;
  /** Convenience: phone or tablet. */
  isPhoneOrTablet: boolean;
  /** Convenience: tablet or desktop. */
  isTabletOrDesktop: boolean;
  /** True when pointer is coarse (touch-primary device). */
  isTouchDevice: boolean;
}

// ---------------------------------------------------------------------------
// SSR-safe defaults (mobile-first)
// ---------------------------------------------------------------------------

const SSR_DEFAULTS: ResponsiveContextValue = {
  deviceClass: 'phone',
  activeBreakpoint: 'xs',
  isPhone: true,
  isTablet: false,
  isDesktop: false,
  pointer: 'coarse',
  orientation: 'portrait',
  prefersReducedMotion: false,
  isPhoneOrTablet: true,
  isTabletOrDesktop: false,
  isTouchDevice: true,
};

// ---------------------------------------------------------------------------
// Media query strings (computed once, reused for every provider instance)
// ---------------------------------------------------------------------------

const PHONE_QUERY = buildRangeQuery('xs', 'sm'); // (max-width: 639px)
const TABLET_QUERY = buildRangeQuery('sm', 'lg'); // (min-width: 640px) and (max-width: 1023px)
const DESKTOP_QUERY = buildMinWidthQuery('lg'); // (min-width: 1024px)
const TOUCH_QUERY = '(hover: none) and (pointer: coarse)';
const LANDSCAPE_QUERY = '(orientation: landscape)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

/**
 * React context holding the shared responsive state. `null` signals that no
 * provider is present, enabling hooks to fall back gracefully.
 */
export const ResponsiveContext = createContext<ResponsiveContextValue | null>(null);

// ---------------------------------------------------------------------------
// Helper: subscribe to a single media query
// ---------------------------------------------------------------------------

/**
 * Creates a matchMedia subscription and returns a cleanup function.
 * Handles legacy Safari (<14) addListener/removeListener API.
 */
function subscribeToQuery(
  query: string,
  onChange: (matches: boolean) => void,
): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }

  const mql = window.matchMedia(query);

  // Set initial value synchronously
  onChange(mql.matches);

  const listener = (e: MediaQueryListEvent) => onChange(e.matches);

  if (mql.addEventListener) {
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }

  // Legacy fallback
  if ('addListener' in mql && typeof mql.addListener === 'function') {
    mql.addListener(listener as any);
    return () => {
      if ('removeListener' in mql && typeof mql.removeListener === 'function') {
        mql.removeListener(listener as any);
      }
    };
  }

  return () => {};
}

// ---------------------------------------------------------------------------
// Helper: derive full context value from raw booleans
// ---------------------------------------------------------------------------

/**
 * Derive the precise active breakpoint from individual breakpoint matches.
 * Checks largest-first so the most specific match wins.
 */
function deriveActiveBreakpoint(
  isSm: boolean,
  isMd: boolean,
  isLg: boolean,
  isXl: boolean,
  is2xl: boolean,
): ActiveBreakpoint {
  if (is2xl) return '2xl';
  if (isXl) return 'xl';
  if (isLg) return 'lg';
  if (isMd) return 'md';
  if (isSm) return 'sm';
  return 'xs';
}

function buildContextValue(
  isPhone: boolean,
  isTablet: boolean,
  isDesktop: boolean,
  isTouchDevice: boolean,
  isLandscape: boolean,
  prefersReducedMotion: boolean,
  activeBreakpoint: ActiveBreakpoint,
): ResponsiveContextValue {
  const deviceClass: DeviceClass = isDesktop
    ? 'desktop'
    : isTablet
      ? 'tablet'
      : 'phone';

  return {
    deviceClass,
    activeBreakpoint,
    isPhone: deviceClass === 'phone',
    isTablet: deviceClass === 'tablet',
    isDesktop: deviceClass === 'desktop',
    pointer: isTouchDevice ? 'coarse' : 'fine',
    orientation: isLandscape ? 'landscape' : 'portrait',
    prefersReducedMotion,
    isPhoneOrTablet: deviceClass === 'phone' || deviceClass === 'tablet',
    isTabletOrDesktop: deviceClass === 'tablet' || deviceClass === 'desktop',
    isTouchDevice,
  };
}

// ---------------------------------------------------------------------------
// Provider component
// ---------------------------------------------------------------------------

export interface ResponsiveProviderProps {
  children: ReactNode;
}

/**
 * Provides shared responsive state to the entire subtree via React context.
 *
 * A single instance of this provider should wrap the application root. It
 * creates exactly six matchMedia subscriptions (phone, tablet, desktop, touch,
 * orientation, reduced-motion) and shares the derived state with every
 * `useResponsive()` consumer, eliminating per-component listener overhead.
 *
 * SSR-safe: on the server, all consumers receive mobile-first defaults
 * (phone, coarse pointer, portrait orientation).
 */
// Breakpoint-level min-width queries for precise activeBreakpoint detection
const SM_QUERY = buildMinWidthQuery('sm');
const MD_QUERY = buildMinWidthQuery('md');
const LG_QUERY = buildMinWidthQuery('lg');
const XL_QUERY = buildMinWidthQuery('xl');
const XXL_QUERY = buildMinWidthQuery('2xl');

export function ResponsiveProvider({ children }: ResponsiveProviderProps): React.ReactElement {
  const [isPhone, setIsPhone] = useState(true);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Precise breakpoint tracking for useResponsiveValue resolution
  const [isSm, setIsSm] = useState(false);
  const [isMd, setIsMd] = useState(false);
  const [isLg, setIsLg] = useState(false);
  const [isXl, setIsXl] = useState(false);
  const [is2xl, setIs2xl] = useState(false);

  useEffect(() => {
    const cleanups = [
      subscribeToQuery(PHONE_QUERY, setIsPhone),
      subscribeToQuery(TABLET_QUERY, setIsTablet),
      subscribeToQuery(DESKTOP_QUERY, setIsDesktop),
      subscribeToQuery(TOUCH_QUERY, setIsTouchDevice),
      subscribeToQuery(LANDSCAPE_QUERY, setIsLandscape),
      subscribeToQuery(REDUCED_MOTION_QUERY, setPrefersReducedMotion),
      // Precise breakpoint subscriptions
      subscribeToQuery(SM_QUERY, setIsSm),
      subscribeToQuery(MD_QUERY, setIsMd),
      subscribeToQuery(LG_QUERY, setIsLg),
      subscribeToQuery(XL_QUERY, setIsXl),
      subscribeToQuery(XXL_QUERY, setIs2xl),
    ];

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  const activeBreakpoint = deriveActiveBreakpoint(isSm, isMd, isLg, isXl, is2xl);

  const value = useMemo(
    () => buildContextValue(isPhone, isTablet, isDesktop, isTouchDevice, isLandscape, prefersReducedMotion, activeBreakpoint),
    [isPhone, isTablet, isDesktop, isTouchDevice, isLandscape, prefersReducedMotion, activeBreakpoint],
  );

  return (
    <ResponsiveContext.Provider value={value}>{children}</ResponsiveContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

/**
 * Returns the shared responsive state from the nearest `ResponsiveProvider`.
 *
 * If no provider exists in the tree, returns SSR-safe defaults (phone,
 * coarse, portrait) so components degrade gracefully during gradual adoption.
 *
 * @example
 * ```tsx
 * const { deviceClass, isDesktop, isTouchDevice } = useResponsive();
 * ```
 */
export function useResponsive(): ResponsiveContextValue {
  const context = useContext(ResponsiveContext);

  // Graceful fallback: no provider means we return SSR defaults.
  // This enables gradual adoption -- existing code that uses useBreakpoints
  // without a provider will still work (the hook itself falls back to its
  // own matchMedia subscriptions).
  if (!context) {
    return SSR_DEFAULTS;
  }

  return context;
}
