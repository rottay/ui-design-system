'use client';

import { createContext, useContext, useMemo } from 'react';

import type { MotionPolicy } from '../../contracts/motion';
import { useMotionEnvironment } from './motion-environment-store';
import { resolveMotionPolicy } from './policy';
import { useSystemReducedMotion } from './reduced-motion-store';

export interface MotionContextValue {
  /** Raw operating-system preference. */
  systemPrefersReducedMotion: boolean;
  /** Effective policy after the provider's additive override. */
  prefersReducedMotion: boolean;
  /** Complete semantic/device policy resolved by the nearest provider. */
  policy: MotionPolicy;
}

export const MotionContext = createContext<MotionContextValue | null>(null);

/**
 * Resolve the effective preference. Outside MotionProvider it falls back to
 * the singleton OS store, preserving standalone and SSR-safe behavior without
 * pulling the Motion renderer into consumers that only need the policy.
 */
export function useMotionPolicy(): MotionPolicy {
  const context = useContext(MotionContext);
  const systemPrefersReducedMotion = useSystemReducedMotion();
  const environment = useMotionEnvironment();

  return useMemo(
    () => context?.policy ?? resolveMotionPolicy({
      profile: 'calm',
      reduce: systemPrefersReducedMotion,
      pointer: environment.pointer,
      power: environment.power,
      visible: environment.visible,
    }),
    [context?.policy, environment.pointer, environment.power, environment.visible, systemPrefersReducedMotion],
  );
}

export function useMotionPreference(): boolean {
  return useMotionPolicy().reduce;
}
