/**
 * @fileoverview useAdaptivePosture — resolves an AdaptiveConfig into
 * a SurfacePosture for the current breakpoint.
 *
 * Consumers declare their adaptive behavior per breakpoint in a
 * single config object. This hook detects the current breakpoint
 * and cascades the config (phone <- tablet <- desktop).
 *
 * @example
 * ```tsx
 * const posture = useAdaptivePosture({
 *   desktop: { collection: 'table', pane: 'inline', filters: 'inline' },
 *   phone: { collection: 'cards', pane: 'sheet', filters: 'sheet', compactHeader: true },
 * });
 *
 * // posture.collection === 'cards' on phone, 'table' on desktop
 * ```
 */

import { useMemo } from 'react';
import { useBreakpoints } from '@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state';
import type { AdaptiveConfig, SurfacePosture, Breakpoint } from '../../foundation/contracts/adaptive';
import { resolvePosture, toBreakpoint } from '../../foundation/contracts/adaptive';

export interface UseAdaptivePostureResult extends SurfacePosture {
  /** Current breakpoint key. */
  breakpoint: Breakpoint;
  /** True when phone breakpoint is active. */
  isPhone: boolean;
  /** True when tablet breakpoint is active. */
  isTablet: boolean;
  /** True when desktop breakpoint is active. */
  isDesktop: boolean;
}

/**
 * Resolves adaptive surface config for the current viewport breakpoint.
 */
export function useAdaptivePosture(
  config?: AdaptiveConfig,
): UseAdaptivePostureResult {
  const { isMobile, isTablet, isDesktop } = useBreakpoints();

  const breakpoint = toBreakpoint({ isMobile, isTablet });

  const posture = useMemo(
    () => resolvePosture(config, breakpoint),
    [config, breakpoint],
  );

  return {
    ...posture,
    breakpoint,
    isPhone: isMobile,
    isTablet,
    isDesktop,
  };
}
