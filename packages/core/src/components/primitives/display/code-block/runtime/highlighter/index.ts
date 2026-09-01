'use client';

/**
 * @fileoverview Highlighter adapter registry.
 *
 * A single module-level registry holds the app-registered
 * {@link HighlighterAdapter}. The design system ships no highlighter, so with
 * no registration CodeBlock renders its honest plain default. This mirrors the
 * icon-supplier boundary: the concrete highlighter (shiki/prism/highlight.js)
 * lives in the app and is registered through this port; its types never cross
 * into the DS public surface.
 *
 * The registry is exposed to React through `useSyncExternalStore` so a late
 * registration re-renders mounted blocks. `getServerSnapshot` returns the
 * current adapter deterministically, keeping SSR stable.
 */

import { useSyncExternalStore } from 'react';

import type { HighlighterAdapter } from '../../contracts';

let activeAdapter: HighlighterAdapter | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

/**
 * Register (or replace) the active syntax highlighter. Pass `null` to clear it
 * and fall back to the plain renderer. Returns an unregister function that
 * restores the previously active adapter.
 */
export function registerHighlighter(adapter: HighlighterAdapter | null): () => void {
  const previous = activeAdapter;
  activeAdapter = adapter;
  emit();
  return () => {
    activeAdapter = previous;
    emit();
  };
}

/** Read the currently registered adapter, or `null` when none is set. */
export function getHighlighter(): HighlighterAdapter | null {
  return activeAdapter;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Subscribe a component to the active highlighter. Re-renders when the
 * registration changes.
 */
export function useHighlighter(): HighlighterAdapter | null {
  return useSyncExternalStore(subscribe, getHighlighter, getHighlighter);
}
