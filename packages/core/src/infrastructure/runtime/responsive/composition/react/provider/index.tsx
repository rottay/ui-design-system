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
 * SSR: the snapshot is published through `useSyncExternalStore`, whose server
 * answer is the request's viewport hint, taken from the `ssrViewport` PROP and
 * from nothing else. Only a request that declared nothing falls back to the
 * mobile-first baseline.
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
  useCallback,
  useContext,
  useState,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import { useMotionPreference } from '@/infrastructure/runtime/foundation/motion/composition/react/preference';
import type { DocumentViewportHint, ResponsiveMediaSnapshot } from '../../../runtime/media-snapshot';
import {
  UNHINTED_MEDIA_SNAPSHOT,
  getResponsiveMediaSnapshot,
  mediaSnapshotForViewport,
  subscribeResponsiveMedia,
} from '../../../runtime/media-snapshot';

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

interface VirtualKeyboardSnapshot {
  inset: number;
  isOpen: boolean;
}

const SSR_VIRTUAL_KEYBOARD_SNAPSHOT: VirtualKeyboardSnapshot = {
  inset: 0,
  isOpen: false,
};

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
  /**
   * The viewport tier this REQUEST is for -- the same value `mountTenantTheme`
   * projected as `data-ds-viewport`, handed in as a prop.
   *
   * It must be a PROP and not a document read. `getServerSnapshot` runs twice
   * for one request: once where there is no document at all, and once in the
   * browser during hydration. A read of `<html>` answers `undefined` on the
   * first and `desktop` on the second, which is a hydration mismatch by
   * construction. A prop is the one input both runs see identically, because
   * the server serializes it into the payload the client renders from.
   */
  ssrViewport?: DocumentViewportHint;
}

/**
 * Provides shared responsive state to the entire subtree via React context.
 *
 * A single instance of this provider should wrap the application root. It
 * shares viewport/device subscriptions plus the canonical MotionProvider
 * preference with every `useResponsive()` consumer, eliminating per-component
 * reduced-motion listeners.
 *
 * The server answer is the request's viewport hint, so a desktop request
 * renders a desktop layout on the first paint instead of correcting to one a
 * frame later. `DesignSystemProvider` forwards its own `ssrViewport` here; an
 * application that mounts this provider directly passes the hint itself.
 */
export function ResponsiveProvider({
  children,
  ssrViewport,
}: ResponsiveProviderProps): React.ReactElement {
  const [virtualKeyboardSnapshot, setVirtualKeyboardSnapshot] =
    useState<VirtualKeyboardSnapshot>(SSR_VIRTUAL_KEYBOARD_SNAPSHOT);
  const prefersReducedMotion = useMotionPreference();

  // Pure in `ssrViewport`, deliberately. This function is React's answer for
  // BOTH the server render and the hydration render, so any input the two
  // worlds see differently -- a `document` read above all -- makes them
  // disagree about the very first paint.
  const getServerSnapshot = useCallback(
    (): ResponsiveMediaSnapshot => mediaSnapshotForViewport(ssrViewport),
    [ssrViewport],
  );

  const mediaSnapshot = useSyncExternalStore(
    subscribeResponsiveMedia,
    getResponsiveMediaSnapshot,
    getServerSnapshot,
  );

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
    () =>
      buildContextValue(
        mediaSnapshot,
        prefersReducedMotion,
        virtualKeyboardSnapshot,
        mediaSnapshot.resolved,
      ),
    [mediaSnapshot, prefersReducedMotion, virtualKeyboardSnapshot]
  );

  return <ResponsiveContext.Provider value={value}>{children}</ResponsiveContext.Provider>;
}

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

/**
 * THE responsive snapshot: the one place viewport state is read.
 *
 * Both inputs are read UNCONDITIONALLY. The two hooks this replaced called
 * their fallback -- itself a hook -- only when no provider was present, which
 * is a Rules-of-Hooks violation at the heart of the responsive runtime: a tree
 * that mounts a provider around an already-rendered consumer changes that
 * consumer's hook order mid-life.
 *
 * With a provider the context wins, because it is the only value that carries
 * the request's `ssrViewport` hint and the virtual-keyboard inset. Without one
 * the answer is the shared external store, so a provider-less consumer now
 * reports the REAL viewport instead of degrading to a phone forever. The store
 * is a singleton with one listener set, so being provider-less costs one
 * subscription, not a `matchMedia` per component.
 */
export function useResponsive(): ResolvedResponsiveContextValue {
  const context = useContext(ResponsiveContext);
  const media = useSyncExternalStore(
    subscribeResponsiveMedia,
    getResponsiveMediaSnapshot,
    getUnhintedServerSnapshot,
  );
  const prefersReducedMotion = useMotionPreference();

  return useMemo(
    () =>
      context
        ? normalizeResponsiveContext(context)
        : buildContextValue(
            media,
            prefersReducedMotion,
            SSR_VIRTUAL_KEYBOARD_SNAPSHOT,
            media.resolved,
          ),
    [context, media, prefersReducedMotion],
  );
}

/** The server answer for a consumer with no provider above it. */
function getUnhintedServerSnapshot(): ResponsiveMediaSnapshot {
  return UNHINTED_MEDIA_SNAPSHOT;
}

/**
 * Completes a caller-provided legacy context value.
 *
 * A context an application built by hand already represents an intentional
 * viewport snapshot, so its resolution flag defaults to true; only the
 * provider's own pre-hydration value is unresolved.
 */
function normalizeResponsiveContext(
  context: ResponsiveContextValue,
): ResolvedResponsiveContextValue {
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
    hasResolvedViewport: context.hasResolvedViewport ?? true,
    virtualKeyboardInset,
    isVirtualKeyboardOpen: context.isVirtualKeyboardOpen ?? virtualKeyboardInset > 0,
  };
}
