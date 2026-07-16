'use client';

import { createContext, useContext } from 'react';

import { useSystemReducedMotion } from './reduced-motion-store';

export interface MotionContextValue {
  /** Raw operating-system preference. */
  systemPrefersReducedMotion: boolean;
  /** Effective policy after the provider's additive override. */
  prefersReducedMotion: boolean;
}

export const MotionContext = createContext<MotionContextValue | null>(null);

/**
 * Resolve the effective preference. Outside MotionProvider it falls back to
 * the singleton OS store, preserving standalone and SSR-safe behavior without
 * pulling the Motion renderer into consumers that only need the policy.
 */
export function useMotionPreference(): boolean {
  const context = useContext(MotionContext);
  const systemPrefersReducedMotion = useSystemReducedMotion();
  return context?.prefersReducedMotion ?? systemPrefersReducedMotion;
}
