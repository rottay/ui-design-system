'use client';

import { useResponsive } from '..';

/**
 * Resolve only the phone breakpoint, for consumers that need no other tier.
 * A projection of the one snapshot; it subscribes to nothing of its own.
 */
export function usePhoneBreakpoint(): boolean {
  return useResponsive().isPhone;
}
