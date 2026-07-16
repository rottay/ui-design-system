'use client';

import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { MotionConfig } from 'motion/react';

import {
  MotionContext,
  useMotionPreference,
  type MotionContextValue,
} from './MotionPreference';
import { useSystemReducedMotion } from './reduced-motion-store';

export { MotionContext, useMotionPreference };
export type { MotionContextValue };

export interface MotionProviderProps {
  children: ReactNode;
  /**
   * Additively force reduced motion. React motion policy is inherited by this
   * subtree; while an explicit override is mounted, the conservative CSS seam
   * also marks the whole document so CSS-only effects cannot keep animating.
   * `false` never overrides an OS request to reduce motion.
   *
   * The OS media query remains the no-JS authority. If an explicit app/tenant
   * policy must apply before hydration, the document shell should emit
   * `data-ds-motion="reduced"` on `<html>`; this provider preserves and restores
   * that shell-owned value around its client registration.
   */
  reducedMotion?: boolean;
}

const forcedReducedMotionProviders = new Set<symbol>();
let attributeBeforeFirstForcedProvider: string | null | undefined;
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

function syncForcedReducedMotionAttribute(): void {
  if (typeof document === 'undefined') return;

  if (forcedReducedMotionProviders.size > 0) {
    document.documentElement.setAttribute('data-ds-motion', 'reduced');
  } else if (attributeBeforeFirstForcedProvider === null) {
    document.documentElement.removeAttribute('data-ds-motion');
    attributeBeforeFirstForcedProvider = undefined;
  } else if (attributeBeforeFirstForcedProvider !== undefined) {
    document.documentElement.setAttribute(
      'data-ds-motion',
      attributeBeforeFirstForcedProvider,
    );
    attributeBeforeFirstForcedProvider = undefined;
  }
}

function registerForcedReducedMotion(): () => void {
  const registration = Symbol('forced-reduced-motion-provider');
  if (
    forcedReducedMotionProviders.size === 0 &&
    typeof document !== 'undefined'
  ) {
    attributeBeforeFirstForcedProvider =
      document.documentElement.getAttribute('data-ds-motion');
  }
  forcedReducedMotionProviders.add(registration);
  syncForcedReducedMotionAttribute();

  let registered = true;
  return () => {
    if (!registered) return;
    registered = false;
    forcedReducedMotionProviders.delete(registration);
    syncForcedReducedMotionAttribute();
  };
}

/**
 * Single runtime authority for reduced motion. It also configures Motion so
 * raw motion components and DS adapters observe the same effective policy.
 */
export function MotionProvider({
  children,
  reducedMotion = false,
}: MotionProviderProps): React.ReactElement {
  const parentContext = useContext(MotionContext);
  const systemPrefersReducedMotion = useSystemReducedMotion();
  const prefersReducedMotion =
    Boolean(parentContext?.prefersReducedMotion) ||
    systemPrefersReducedMotion ||
    reducedMotion;
  const value = useMemo(
    () => ({ systemPrefersReducedMotion, prefersReducedMotion }),
    [systemPrefersReducedMotion, prefersReducedMotion],
  );

  // CSS-only effects cannot consume React context. Mirror explicit provider
  // overrides onto <html> and ref-count registrations so unmounting one nested
  // provider never clears an override that is still owned by another. This is
  // a hydration-time seam; server-known explicit policy belongs on the shell.
  useIsomorphicLayoutEffect(() => {
    if (!reducedMotion) return undefined;
    return registerForcedReducedMotion();
  }, [reducedMotion]);

  return (
    <MotionContext.Provider value={value}>
      <MotionConfig reducedMotion={prefersReducedMotion ? 'always' : 'never'}>
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  );
}
