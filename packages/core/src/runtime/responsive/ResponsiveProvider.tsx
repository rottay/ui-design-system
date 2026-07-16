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
 * - **Virtual keyboard**: bottom viewport occlusion while editing at scale 1
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
import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';

import { buildMinWidthQuery } from '../../hooks/responsive/breakpoints';
import { useMotionPreference } from '../motion';

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
  /**
   * True after the browser has published its first real matchMedia snapshot.
   * Optional for backward compatibility with legacy custom context providers.
   */
  hasResolvedViewport?: boolean;
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
  /** Bottom inset, in CSS pixels, currently occluded by the virtual keyboard. */
  virtualKeyboardInset?: number;
  /** True when an editable control is focused and the virtual keyboard occludes the viewport. */
  isVirtualKeyboardOpen?: boolean;
}

/** Fully normalized responsive value returned by `useResponsive()`. */
export interface ResolvedResponsiveContextValue extends ResponsiveContextValue {
  hasResolvedViewport: boolean;
  virtualKeyboardInset: number;
  isVirtualKeyboardOpen: boolean;
}

// ---------------------------------------------------------------------------
// SSR-safe defaults (mobile-first)
// ---------------------------------------------------------------------------

const SSR_DEFAULTS: ResolvedResponsiveContextValue = {
  hasResolvedViewport: false,
  deviceClass: 'phone',
  activeBreakpoint: 'xs',
  isPhone: true,
  isTablet: false,
  isDesktop: false,
  pointer: 'coarse',
  orientation: 'portrait',
  prefersReducedMotion: true,
  isPhoneOrTablet: true,
  isTabletOrDesktop: false,
  isTouchDevice: true,
  virtualKeyboardInset: 0,
  isVirtualKeyboardOpen: false,
};

// ---------------------------------------------------------------------------
// Media query strings (computed once, reused for every provider instance)
// ---------------------------------------------------------------------------

const SM_QUERY = buildMinWidthQuery('sm');
const MD_QUERY = buildMinWidthQuery('md');
const LG_QUERY = buildMinWidthQuery('lg');
const XL_QUERY = buildMinWidthQuery('xl');
const XXL_QUERY = buildMinWidthQuery('2xl');
const TOUCH_QUERY = '(hover: none) and (pointer: coarse)';
const LANDSCAPE_QUERY = '(orientation: landscape)';
const NON_EDITING_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
]);

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

/**
 * React context holding the shared responsive state. `null` signals that no
 * provider is present, enabling hooks to fall back gracefully.
 */
export const ResponsiveContext = createContext<ResponsiveContextValue | null>(null);

// ---------------------------------------------------------------------------
// Atomic media snapshot
// ---------------------------------------------------------------------------

interface ResponsiveMediaSnapshot {
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2xl: boolean;
  isTouchDevice: boolean;
  isLandscape: boolean;
}

interface VirtualKeyboardSnapshot {
  inset: number;
  isOpen: boolean;
}

type ResponsiveMediaQueries = Record<keyof ResponsiveMediaSnapshot, MediaQueryList>;

const SSR_MEDIA_SNAPSHOT: ResponsiveMediaSnapshot = {
  isSm: false,
  isMd: false,
  isLg: false,
  isXl: false,
  is2xl: false,
  isTouchDevice: true,
  isLandscape: false,
};

const SSR_VIRTUAL_KEYBOARD_SNAPSHOT: VirtualKeyboardSnapshot = {
  inset: 0,
  isOpen: false,
};

function readResponsiveSnapshot(queries: ResponsiveMediaQueries): ResponsiveMediaSnapshot {
  return {
    isSm: queries.isSm.matches,
    isMd: queries.isMd.matches,
    isLg: queries.isLg.matches,
    isXl: queries.isXl.matches,
    is2xl: queries.is2xl.matches,
    isTouchDevice: queries.isTouchDevice.matches,
    isLandscape: queries.isLandscape.matches,
  };
}

function responsiveSnapshotsEqual(left: ResponsiveMediaSnapshot, right: ResponsiveMediaSnapshot): boolean {
  return (
    left.isSm === right.isSm &&
    left.isMd === right.isMd &&
    left.isLg === right.isLg &&
    left.isXl === right.isXl &&
    left.is2xl === right.is2xl &&
    left.isTouchDevice === right.isTouchDevice &&
    left.isLandscape === right.isLandscape
  );
}

function virtualKeyboardSnapshotsEqual(left: VirtualKeyboardSnapshot, right: VirtualKeyboardSnapshot): boolean {
  return left.inset === right.inset && left.isOpen === right.isOpen;
}

/**
 * Whether the focused element can summon a software keyboard. Read-only and
 * non-textual inputs are deliberately excluded: focus alone does not imply
 * keyboard occlusion for those controls.
 */
function isEditableElement(element: Element | null): boolean {
  if (!(element instanceof HTMLElement)) return false;

  if (element instanceof HTMLTextAreaElement) {
    return !element.disabled && !element.readOnly;
  }

  if (element instanceof HTMLSelectElement) {
    return !element.disabled;
  }

  if (element instanceof HTMLInputElement) {
    return !element.disabled && !element.readOnly && !NON_EDITING_INPUT_TYPES.has(element.type);
  }

  if (element.isContentEditable) return true;

  const editableAncestor = element.closest('[contenteditable]');
  return editableAncestor !== null && editableAncestor.getAttribute('contenteditable') !== 'false';
}

function readVirtualKeyboardSnapshot(
  viewport: VisualViewport | null,
  editableHasFocus: boolean
): VirtualKeyboardSnapshot {
  if (!viewport || !editableHasFocus || viewport.scale !== 1) {
    return SSR_VIRTUAL_KEYBOARD_SNAPSHOT;
  }

  const inset = Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop));

  return {
    inset,
    isOpen: inset > 0,
  };
}

/** Subscribe one shared callback to a query, including legacy Safari. */
function subscribeToMediaQuery(query: MediaQueryList, listener: (event: MediaQueryListEvent) => void): () => void {
  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }

  if (typeof query.addListener === 'function') {
    query.addListener(listener);
    return () => query.removeListener(listener);
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
  is2xl: boolean
): ActiveBreakpoint {
  if (is2xl) return '2xl';
  if (isXl) return 'xl';
  if (isLg) return 'lg';
  if (isMd) return 'md';
  if (isSm) return 'sm';
  return 'xs';
}

function buildContextValue(
  media: ResponsiveMediaSnapshot,
  prefersReducedMotion: boolean,
  virtualKeyboard: VirtualKeyboardSnapshot,
  hasResolvedViewport: boolean
): ResolvedResponsiveContextValue {
  const deviceClass: DeviceClass = media.isLg ? 'desktop' : media.isSm ? 'tablet' : 'phone';
  const activeBreakpoint = deriveActiveBreakpoint(media.isSm, media.isMd, media.isLg, media.isXl, media.is2xl);

  return {
    hasResolvedViewport,
    deviceClass,
    activeBreakpoint,
    isPhone: deviceClass === 'phone',
    isTablet: deviceClass === 'tablet',
    isDesktop: deviceClass === 'desktop',
    pointer: media.isTouchDevice ? 'coarse' : 'fine',
    orientation: media.isLandscape ? 'landscape' : 'portrait',
    prefersReducedMotion,
    isPhoneOrTablet: deviceClass === 'phone' || deviceClass === 'tablet',
    isTabletOrDesktop: deviceClass === 'tablet' || deviceClass === 'desktop',
    isTouchDevice: media.isTouchDevice,
    virtualKeyboardInset: virtualKeyboard.inset,
    isVirtualKeyboardOpen: virtualKeyboard.isOpen,
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
 * shares viewport/device subscriptions plus the canonical MotionProvider
 * preference with every `useResponsive()` consumer, eliminating per-component
 * reduced-motion listeners.
 *
 * SSR-safe: on the server, all consumers receive mobile-first defaults
 * (phone, coarse pointer, portrait orientation).
 */
export function ResponsiveProvider({ children }: ResponsiveProviderProps): React.ReactElement {
  const [mediaSnapshot, setMediaSnapshot] = useState<ResponsiveMediaSnapshot>(SSR_MEDIA_SNAPSHOT);
  const [virtualKeyboardSnapshot, setVirtualKeyboardSnapshot] =
    useState<VirtualKeyboardSnapshot>(SSR_VIRTUAL_KEYBOARD_SNAPSHOT);
  const [hasResolvedViewport, setHasResolvedViewport] = useState(false);
  const prefersReducedMotion = useMotionPreference();

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const queries: ResponsiveMediaQueries = {
      isSm: window.matchMedia(SM_QUERY),
      isMd: window.matchMedia(MD_QUERY),
      isLg: window.matchMedia(LG_QUERY),
      isXl: window.matchMedia(XL_QUERY),
      is2xl: window.matchMedia(XXL_QUERY),
      isTouchDevice: window.matchMedia(TOUCH_QUERY),
      isLandscape: window.matchMedia(LANDSCAPE_QUERY),
    };

    // Every media-query event reads the entire live set before committing one
    // object. Boundary changes therefore cannot expose desktop+md or a
    // transient phone tier while sibling events are still being delivered.
    const publishSnapshot = (): void => {
      const next = readResponsiveSnapshot(queries);
      setMediaSnapshot((current) => (responsiveSnapshotsEqual(current, next) ? current : next));
      setHasResolvedViewport(true);
    };
    const listener = (): void => publishSnapshot();

    publishSnapshot();
    const cleanups = Object.values(queries).map((query) => subscribeToMediaQuery(query, listener));

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    const viewport = window.visualViewport;
    let editableHasFocus = isEditableElement(document.activeElement);

    const publishSnapshot = (): void => {
      const next = readVirtualKeyboardSnapshot(viewport, editableHasFocus);
      setVirtualKeyboardSnapshot((current) => (virtualKeyboardSnapshotsEqual(current, next) ? current : next));
    };

    const handleFocusIn = (event: FocusEvent): void => {
      editableHasFocus = isEditableElement(event.target as Element | null);
      publishSnapshot();
    };

    const handleFocusOut = (event: FocusEvent): void => {
      editableHasFocus = isEditableElement(event.relatedTarget as Element | null);
      publishSnapshot();
    };

    publishSnapshot();
    viewport?.addEventListener('resize', publishSnapshot);
    viewport?.addEventListener('scroll', publishSnapshot);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      viewport?.removeEventListener('resize', publishSnapshot);
      viewport?.removeEventListener('scroll', publishSnapshot);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const value = useMemo(
    () => buildContextValue(mediaSnapshot, prefersReducedMotion, virtualKeyboardSnapshot, hasResolvedViewport),
    [mediaSnapshot, prefersReducedMotion, virtualKeyboardSnapshot, hasResolvedViewport]
  );

  return <ResponsiveContext.Provider value={value}>{children}</ResponsiveContext.Provider>;
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
export function useResponsive(): ResolvedResponsiveContextValue {
  const context = useContext(ResponsiveContext);

  // Graceful fallback: no provider means we return SSR defaults.
  // This enables gradual adoption -- existing code that uses useBreakpoints
  // without a provider will still work (the hook itself falls back to its
  // own matchMedia subscriptions).
  if (!context) {
    return SSR_DEFAULTS;
  }

  if (
    context.hasResolvedViewport !== undefined &&
    context.virtualKeyboardInset !== undefined &&
    context.isVirtualKeyboardOpen !== undefined
  ) {
    return context as ResolvedResponsiveContextValue;
  }

  const virtualKeyboardInset = context.virtualKeyboardInset ?? 0;

  return {
    ...context,
    // A caller-provided legacy context already represents an intentional
    // viewport snapshot. Only the provider's SSR value is unresolved.
    hasResolvedViewport: context.hasResolvedViewport ?? true,
    virtualKeyboardInset,
    isVirtualKeyboardOpen:
      context.isVirtualKeyboardOpen ?? virtualKeyboardInset > 0,
  };
}
