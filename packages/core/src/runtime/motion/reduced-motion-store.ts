'use client';

import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

type StoreListener = () => void;

const listeners = new Set<StoreListener>();

let mediaQuery: MediaQueryList | null = null;
let mediaQueryFactory: typeof window.matchMedia | null = null;
let detachMediaQuery: (() => void) | null = null;
let snapshot = true;

function canUseMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

function readMediaQuery(): MediaQueryList | null {
  if (!canUseMatchMedia()) return null;
  const currentFactory = window.matchMedia;

  // Cache before React subscribes. useSyncExternalStore may call getSnapshot
  // more than once (and once per consumer) during the initial render; without
  // this assignment every read creates a throwaway MediaQueryList.
  if (
    mediaQuery === null ||
    (detachMediaQuery === null && mediaQueryFactory !== currentFactory)
  ) {
    mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    mediaQueryFactory = currentFactory;
  }
  return mediaQuery;
}

function publish(nextSnapshot: boolean): void {
  if (snapshot === nextSnapshot) return;
  snapshot = nextSnapshot;
  listeners.forEach((listener) => listener());
}

function attachMediaQuery(): void {
  if (detachMediaQuery) return;

  if (!canUseMatchMedia()) return;
  const query = readMediaQuery();
  if (!query) return;

  snapshot = query.matches;
  const onChange = (event: MediaQueryListEvent): void => publish(event.matches);

  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', onChange);
    detachMediaQuery = () => query.removeEventListener('change', onChange);
    return;
  }

  if (typeof query.addListener === 'function') {
    query.addListener(onChange);
    detachMediaQuery = () => query.removeListener(onChange);
  }
}

/**
 * Subscribe to the one browser-level reduced-motion MediaQueryList.
 * React consumers may subscribe independently; the store fans updates out
 * while retaining exactly one active matchMedia listener.
 */
export function subscribeReducedMotion(listener: StoreListener): () => void {
  listeners.add(listener);
  if (listeners.size === 1) attachMediaQuery();

  return () => {
    listeners.delete(listener);
    if (listeners.size > 0) return;

    detachMediaQuery?.();
    detachMediaQuery = null;
    mediaQuery = null;
    mediaQueryFactory = null;
    snapshot = true;
  };
}

/** Return the current OS preference for imperative, non-React entry points. */
export function getReducedMotionSnapshot(): boolean {
  const query = readMediaQuery();
  if (!query) return true;
  snapshot = query.matches;
  return snapshot;
}

/**
 * Server and hydration snapshot. Static/reduced is deliberately conservative:
 * SSR content reaches its final visible state and cannot start motion before
 * the browser preference is known.
 */
export function getReducedMotionServerSnapshot(): boolean {
  return true;
}

/** React binding for the singleton OS preference store. */
export function useSystemReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}
