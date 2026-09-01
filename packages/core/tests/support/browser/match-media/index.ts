/**
 * @fileoverview Configurable matchMedia mock for responsive tests.
 * @description Replaces `window.matchMedia` with a mock that evaluates
 * min-width/max-width, prefers-reduced-motion, and touch heuristics
 * against a caller-supplied viewport width. Useful for testing responsive
 * surface layouts and breakpoint-aware hooks.
 */

import { vi } from 'vitest';

// Lightweight media query evaluator that handles the subset of queries used by
// the DS responsive hooks and motion system. This is intentionally not a full
// CSS media query parser -- it only needs to support min-width, max-width,
// prefers-reduced-motion, and the touch heuristic used by useBreakpoints.
function queryMatches(query: string, width: number, prefersReducedMotion = false): boolean {
  if (query.includes('prefers-reduced-motion')) {
    return prefersReducedMotion && query.includes('reduce');
  }

  const min = query.match(/min-width:\s*(\d+)px/);
  const max = query.match(/max-width:\s*(\d+)px/);

  if (min && width < Number(min[1])) {
    return false;
  }

  if (max && width > Number(max[1])) {
    return false;
  }

  // The DS uses (hover: none) + (pointer: coarse) as a touch device heuristic.
  // In tests we approximate this as "viewport narrower than 1024px".
  if (query.includes('(hover: none)') && query.includes('(pointer: coarse)')) {
    return width < 1024;
  }

  // Unknown queries match by default so tests do not break when new queries
  // are added to the responsive system.
  return true;
}

/**
 * Replaces `window.matchMedia` with a mock that evaluates queries against
 * the given viewport width. Touch heuristics (hover:none + pointer:coarse)
 * return true when width < 1024.
 *
 * @param width - Simulated viewport width in pixels
 * @param prefersReducedMotion - Whether prefers-reduced-motion: reduce matches
 */
export function mockMatchMedia(width: number, prefersReducedMotion = false): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: queryMatches(query, width, prefersReducedMotion),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
