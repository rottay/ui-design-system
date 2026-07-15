'use client';

/**
 * @fileoverview useReducedMotion - Rottay Design System
 * @description Lightweight hook for the browser's `prefers-reduced-motion` setting.
 */

import { useMotionPreference } from '../../../runtime/motion';

/** Read the effective preference from the single runtime motion authority. */
export function useReducedMotion(): boolean {
  return useMotionPreference();
}
