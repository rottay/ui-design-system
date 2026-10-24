'use client';

/**
 * @fileoverview useChartCompact hook -- resolves compact mode for chart components.
 * Merges explicit compact config with defaults when compact mode is active,
 * either via the `compactMode` prop or auto-detection from container width
 * using `useBreakpoints`, then resolves the chart's `adapt` slot over that base
 * through the shared adaptation runtime. The `compact` prop only configures
 * active mode.
 */

import { useMemo } from 'react';
import type { RefObject } from 'react';
import { CONTAINER_POSTURES, type Adapt } from '@/foundation/contracts/kernel/adaptation';
import type {
  ChartAdaptation,
  ResolvedChartAdaptation,
} from '@/foundation/contracts/kernel/adaptation/composition/families/charts';
import { useAdaptation } from '@/infrastructure/runtime/adaptation';
import { useBreakpoints } from '@/infrastructure/runtime/responsive';
import type { ChartCompactConfig } from '../../../contracts';
import { DEFAULT_COMPACT_CONFIG } from '../../../contracts/compactness';

/** Default breakpoint (px) below which auto-compact activates */
const DEFAULT_COMPACT_BREAKPOINT = 640;

export interface UseChartCompactOptions {
  /** Compact configuration from the consumer; does not activate compact mode */
  compact?: ChartCompactConfig;
  /** Whether to activate compact mode explicitly */
  compactMode?: boolean;
  /** Whether to auto-detect compact mode from viewport breakpoint */
  autoCompact?: boolean;
  /** Custom breakpoint for auto-compact (default: 640px) */
  compactBreakpoint?: number;
  /** Current container width from useChartDimensions (used for breakpoint check) */
  containerWidth?: number;
  /**
   * Per-posture compact activation. At the posture in force it outranks
   * `compactMode` and `autoCompact`. A container entry applies only once
   * `containerRef`'s box has been measured; without `containerRef` it never applies.
   */
  adapt?: Adapt<ChartAdaptation>;
  /** The chart's box (the ref handed to `ChartScaffold`); observed only for a container entry. */
  containerRef?: RefObject<HTMLElement | null>;
}

export interface ResolvedChartCompact {
  /** Whether compact mode is currently active */
  isCompact: boolean;
  /** Whether to hide the legend */
  hideLegend: boolean;
  /** Maximum number of axis ticks */
  maxTicks: number;
  /** Whether to use compact (value-only) tooltips */
  compactTooltip: boolean;
  /** Whether to hide series labels */
  hideSeriesLabels: boolean;
  /** Minimum chart height in compact mode */
  minHeight: number;
  /**
   * The `data-posture` value for `ChartScaffold`: the viewport posture, plus the
   * measured container posture while `adapt` declares a container entry.
   */
  postureAttribute: string;
}

/** Inactive compact state -- all features disabled, used when compact mode is off */
const INACTIVE_COMPACT: Omit<ResolvedChartCompact, 'postureAttribute'> = {
  isCompact: false,
  hideLegend: false,
  maxTicks: Infinity,
  compactTooltip: false,
  hideSeriesLabels: false,
  minHeight: 0,
};

/**
 * Resolves compact mode for chart components.
 *
 * Compact mode activates when:
 * 1. `compactMode` is true, OR
 * 2. `autoCompact` is true AND the container width is below the breakpoint
 *    (uses `useBreakpoints().isMobile` when no containerWidth is given).
 *
 * `adapt` then decides at the postures in force: an entry declaring
 * `compactMode` outranks 1 and 2 either way, the measured container entry
 * after the viewport entry.
 *
 * When active, the explicit `compact` config is merged over `DEFAULT_COMPACT_CONFIG`
 * so consumers only need to override the specific settings they care about.
 *
 * @param options - Compact mode options from the chart component.
 * @returns A fully resolved compact configuration ready for chart rendering.
 *
 * @example
 * ```tsx
 * const compactState = useChartCompact({
 *   compact: { maxTicks: 3 },
 *   compactMode: true,
 *   autoCompact: true,
 *   containerWidth: dimensions.width,
 * });
 * // compactState.isCompact, compactState.hideLegend, etc.
 * ```
 */
export function useChartCompact(options: UseChartCompactOptions = {}): ResolvedChartCompact {
  const {
    compact,
    compactMode = false,
    autoCompact = false,
    compactBreakpoint = DEFAULT_COMPACT_BREAKPOINT,
    containerWidth,
    adapt,
    containerRef,
  } = options;
  const { isMobile } = useBreakpoints();

  // Auto-compact uses container width when available, otherwise falls back
  // to the viewport-level isMobile breakpoint.
  const autoCompactActive = autoCompact && (
    containerWidth !== undefined
      ? containerWidth < compactBreakpoint
      : isMobile
  );
  const legacyCompact = compactMode || autoCompactActive;
  const base = useMemo<ResolvedChartAdaptation>(
    () => ({ compactMode: legacyCompact }),
    [legacyCompact],
  );
  const observesContainer = adapt !== undefined
    && CONTAINER_POSTURES.some((posture) => adapt[posture] !== undefined);
  const { adaptation, posture, postureAttribute: resolvedAttribute } = useAdaptation(adapt, {
    base,
    containerRef: observesContainer ? containerRef : undefined,
  });
  // An unobserved box keeps its last measurement; it must not leak into the stamp.
  const postureAttribute = observesContainer ? resolvedAttribute : posture.viewport;
  const isCompact = adaptation.compactMode;

  return useMemo(() => {
    if (!isCompact) {
      return { ...INACTIVE_COMPACT, postureAttribute };
    }

    // Merge explicit config over defaults so consumers only override what they need.
    const merged: Required<ChartCompactConfig> = {
      ...DEFAULT_COMPACT_CONFIG,
      ...compact,
    };

    return {
      isCompact: true,
      hideLegend: merged.hideLegend,
      maxTicks: merged.maxTicks,
      compactTooltip: merged.compactTooltip,
      hideSeriesLabels: merged.hideSeriesLabels,
      minHeight: merged.minHeight,
      postureAttribute,
    };
  }, [compact, isCompact, postureAttribute]);
}
