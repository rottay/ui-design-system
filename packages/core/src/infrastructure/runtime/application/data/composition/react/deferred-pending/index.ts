'use client';

/**
 * @fileoverview Deferred pending-state hook - Rottay Design System
 * @description Gates a busy indicator against the async-state thresholds so a
 * mutation never flashes a spinner on a sub-perceptual wait. Returns two
 * booleans the consumer maps to its own affordances: a lightweight spinner once
 * a wait passes `--ds-async-spinner-delay`, and a structural Skeleton once it
 * passes the longer `--ds-async-skeleton-after`.
 *
 * ## Ownership: app-facing utility
 *
 * The DS ships no action-result envelope. Apps own their mutation lifecycle and
 * pass its `isPending` flag here; the hook only standardizes the STATE timing.
 *
 * @example
 * ```tsx
 * const { showSpinner, showSkeleton } = useDeferredPending(isPending);
 * if (showSkeleton) return <Skeleton.Table rows={5} />;
 * return <Button pending={showSpinner}>Save</Button>;
 * ```
 *
 * @status app-facing
 * @module System/Hooks/Data
 * @category App-Facing
 * @package @rottay/design-system
 */

import { useEffect, useRef, useState } from 'react';
import { useMotionPreference } from '@/infrastructure/runtime/motion';

// Fallbacks used before the document is reachable (SSR, and any host that does
// not load the DS token sheet). They must equal the token values in
// foundation/tokens/css/foundation/themes/default.css.
const FALLBACK_SPINNER_DELAY_MS = 150;
const FALLBACK_SKELETON_AFTER_MS = 500;

/**
 * Resolves a duration token off the document root, so a tenant that overrides
 * `--ds-async-*` moves this hook's timing with it. Without this read the tokens
 * would be inert: a tenant could set them and nothing would change, leaving the
 * CSS law and the JS timing as two sources of truth that silently disagree.
 * Follows the same resolve-a-token-in-JS pattern as `useChartTheme`.
 */
function resolveDurationToken(name: string, fallback: number): number {
  if (typeof window === 'undefined' || typeof document === 'undefined') return fallback;
  const raw = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return fallback;
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return fallback;
  return raw.endsWith('ms') ? value : raw.endsWith('s') ? value * 1000 : fallback;
}

/**
 * Options for {@link useDeferredPending}.
 */
export interface UseDeferredPendingOptions {
  /**
   * Milliseconds a wait must exceed before a spinner is allowed to appear.
   * @default the resolved `--ds-async-spinner-delay` token (150ms unresolved)
   */
  spinnerDelay?: number;

  /**
   * Milliseconds a wait must exceed before a structural Skeleton supersedes the
   * spinner. Mirrors `--ds-async-skeleton-after`. Must be greater than
   * `spinnerDelay` for the escalation to read as spinner-then-skeleton.
   * @default 500
   */
  skeletonAfter?: number;
}

/**
 * Result of {@link useDeferredPending}.
 */
export interface UseDeferredPendingResult {
  /**
   * True once the wait has passed `spinnerDelay` but not `skeletonAfter` (a
   * lightweight busy indicator is warranted). Under reduced motion this stays
   * true for the rest of the wait, since the Skeleton escalation is suppressed.
   */
  showSpinner: boolean;

  /**
   * True once the wait has passed `skeletonAfter` (a structural Skeleton is
   * warranted in place of a spinner). Always false under reduced motion.
   */
  showSkeleton: boolean;
}

type DeferredPhase = 'idle' | 'spinner' | 'skeleton';

/**
 * Deferred busy-state gating for the async-state law.
 *
 * Given the app's `isPending` flag, returns `{ showSpinner, showSkeleton }`
 * staged against the two thresholds:
 *
 * - `< spinnerDelay`: both false (a sub-perceptual wait never flashes an indicator)
 * - `[spinnerDelay, skeletonAfter)`: `showSpinner` true
 * - `>= skeletonAfter`: `showSkeleton` true, `showSpinner` false
 *
 * Under `prefers-reduced-motion`, the staged escalation to a Skeleton is
 * suppressed and the hook holds a single spinner state after `spinnerDelay`;
 * the delay is retained so there is still no sub-150ms flash.
 *
 * SSR-safe: both are false on the server and until the first threshold elapses.
 *
 * @param isPending - Whether the app-owned mutation is in flight.
 * @param options - Threshold overrides (default to the async-state tokens).
 * @returns Gated `showSpinner` / `showSkeleton` booleans.
 */
export function useDeferredPending(
  isPending: boolean,
  options: UseDeferredPendingOptions = {},
): UseDeferredPendingResult {
  // Resolved once per mount: the tokens are theme-scoped, not per-render state.
  const tokenDefaults = useRef<{ spinner: number; skeleton: number } | null>(null);
  if (tokenDefaults.current === null) {
    tokenDefaults.current = {
      spinner: resolveDurationToken('--ds-async-spinner-delay', FALLBACK_SPINNER_DELAY_MS),
      skeleton: resolveDurationToken('--ds-async-skeleton-after', FALLBACK_SKELETON_AFTER_MS),
    };
  }

  const {
    spinnerDelay = tokenDefaults.current.spinner,
    skeletonAfter = tokenDefaults.current.skeleton,
  } = options;

  const prefersReducedMotion = useMotionPreference();

  const [phase, setPhase] = useState<DeferredPhase>('idle');

  // Keep the latest reduced-motion preference available to the timer callbacks
  // without re-arming the timers when only the preference changes mid-wait.
  const reducedMotionRef = useRef(prefersReducedMotion);
  reducedMotionRef.current = prefersReducedMotion;

  useEffect(() => {
    if (!isPending) {
      setPhase('idle');
      return;
    }

    const spinnerTimer = setTimeout(() => {
      setPhase('spinner');
    }, Math.max(0, spinnerDelay));

    // The Skeleton escalation is a motion affordance; a motion-sensitive viewer
    // keeps the single spinner state instead.
    let skeletonTimer: ReturnType<typeof setTimeout> | undefined;
    if (!reducedMotionRef.current) {
      skeletonTimer = setTimeout(() => {
        setPhase('skeleton');
      }, Math.max(0, skeletonAfter));
    }

    return () => {
      clearTimeout(spinnerTimer);
      if (skeletonTimer !== undefined) {
        clearTimeout(skeletonTimer);
      }
    };
  }, [isPending, spinnerDelay, skeletonAfter, prefersReducedMotion]);

  return {
    showSpinner: phase === 'spinner',
    showSkeleton: phase === 'skeleton',
  };
}
