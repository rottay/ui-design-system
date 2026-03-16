'use client';

/**
 * @fileoverview useChartPersonality hook -- resolves product personality tokens
 * into concrete chart rendering decisions (animation, line mode, dots, gradient
 * fills, tooltip style, color scheme). Respects prefers-reduced-motion and
 * allows per-chart overrides via ChartPersonalityOptions.
 */

import { useMemo } from 'react';
import { useTokens } from '../../../../hooks/tokens';
import { useBreakpoints } from '../../../../hooks/responsive/useBreakpoints';
import { useTranslation } from '../../../../i18n';
import { DEFAULT_COLORS, COLOR_SCHEME_MAP } from '../Charts.types';

export interface ChartPersonalityOptions {
  animate?: boolean;
  showDots?: boolean;
  curved?: boolean;
  tooltip?: boolean;
  /** Override the personality-driven color scheme */
  colorScheme?: 'default' | 'pastel' | 'vibrant' | 'monochrome' | 'accessible';
}

export interface ResolvedChartPersonality {
  animate: boolean;
  animationDuration: number;
  lineMode: 'sharp' | 'smooth' | 'step';
  showDots: boolean;
  curved: boolean;
  useGradientFill: boolean;
  tooltip: boolean;
  tooltipStyle: 'minimal' | 'detailed' | 'glass';
  /** Resolved color palette based on colorScheme */
  colors: string[];
  loadingLabel: string;
}

/**
 * Resolves product personality tokens into concrete chart rendering decisions.
 *
 * Chart components should not guess whether a product wants sharp lines,
 * playful mount animations, or dots on every data point. Those defaults belong
 * to the resolved product personality and only get overridden by explicit
 * `ChartPersonalityOptions` props.
 *
 * Respects `prefers-reduced-motion` at the OS level: when enabled, animation
 * duration is forced to 0 regardless of personality or option overrides.
 *
 * @param options - Optional per-chart overrides that take precedence over personality tokens.
 * @returns A fully resolved personality object ready for chart rendering logic.
 *
 * @example
 * ```tsx
 * const personality = useChartPersonality({ colorScheme: 'accessible' });
 * // personality.animate, personality.colors, personality.lineMode, etc.
 * ```
 */
export function useChartPersonality(
  options: ChartPersonalityOptions = {}
): ResolvedChartPersonality {
  const tokens = useTokens();
  const { prefersReducedMotion } = useBreakpoints();
  const { t } = useTranslation('components');

  // Memoized because every chart in the tree calls this hook, and the
  // personality tokens rarely change. The dep array is kept granular
  // (individual option fields rather than the `options` object) to avoid
  // unnecessary recomputation when the consumer creates a new options
  // object reference on each render.
  return useMemo(() => {
    const chartPersonality = tokens.personality.chart;
    // Color scheme cascade: explicit option -> personality token -> 'default'.
    const scheme = options.colorScheme ?? chartPersonality.colorScheme ?? 'default';
    const colors = COLOR_SCHEME_MAP[scheme] ?? DEFAULT_COLORS;

    return {
      animate: options.animate ?? (chartPersonality.animateOnMount && !prefersReducedMotion),
      animationDuration: prefersReducedMotion ? 0 : chartPersonality.mountDuration,
      lineMode: chartPersonality.lineStyle,
      showDots: options.showDots ?? chartPersonality.showDots,
      curved:
        options.curved ??
        (chartPersonality.lineStyle === 'smooth' || chartPersonality.lineStyle === 'step'),
      useGradientFill: chartPersonality.useGradientFill,
      tooltip: options.tooltip ?? true,
      tooltipStyle: chartPersonality.tooltipStyle,
      colors,
      loadingLabel: t('chart.loading'),
    };
  }, [options.animate, options.colorScheme, options.curved, options.showDots, options.tooltip, prefersReducedMotion, t, tokens.personality.chart]);
}
