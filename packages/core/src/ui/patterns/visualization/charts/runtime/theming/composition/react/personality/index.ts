'use client';

/**
 * @fileoverview useChartPersonality hook -- resolves product personality tokens
 * into concrete chart rendering decisions (animation, line mode, dots, gradient
 * fills, tooltip style, color scheme). Respects prefers-reduced-motion and
 * allows per-chart overrides via ChartPersonalityOptions.
 */

import { useMemo, useRef } from 'react';
import { useTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';
import { useTranslation } from '@/infrastructure/runtime/i18n';
import { useReducedMotion } from '@/graphics/motion/react/runtime';
import type { ChartColorScheme } from '@ui/patterns/visualization/charts/contracts';
import { COLOR_SCHEME_MAP } from '@ui/patterns/visualization/charts/foundation/palettes';
import { resolveChartSeriesPaint } from '@ui/patterns/visualization/charts/runtime/chart-engine/foundation/grammar/palette';

/**
 * The legacy `default` and `accessible` schemes resolve through the canonical
 * consumption chain (category > generated series > mode-aware channel >
 * literal) instead of the raw-hex arrays, so compiler-generated tenant
 * palettes reach every family without a local definition shadowing them.
 * Both map onto the `accessible` channel because `DEFAULT_COLORS` has always
 * aliased `ACCESSIBLE_COLORS` on this path: the channel's light values equal
 * those legacy hexes byte-for-byte, keeping standalone light rendering
 * byte-stable. Scheme-faithful `default`-channel adoption arrives with each
 * family's migration onto the engine renderers, where baselines gate it.
 */
const LEGACY_SERIES_PAINT: string[] = [...resolveChartSeriesPaint('accessible')];

export interface ChartPersonalityOptions {
  animate?: boolean;
  showDots?: boolean;
  curved?: boolean;
  tooltip?: boolean;
  /** Override the personality-driven color scheme */
  colorScheme?: ChartColorScheme;
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
  const prefersReducedMotion = useReducedMotion();
  const { t } = useTranslation('components');
  const resolvedStaticRef = useRef(prefersReducedMotion);

  // SSR and a live reduced-motion request both expose the final chart. Keep
  // that decision monotonic for this mount so resolving back to non-reduced
  // cannot tear down a settled chart and replay its entrance animation.
  if (prefersReducedMotion) {
    resolvedStaticRef.current = true;
  }
  const resolvedStatic = resolvedStaticRef.current;

  // Memoized because every chart in the tree calls this hook, and the
  // personality tokens rarely change. The dep array is kept granular
  // (individual option fields rather than the `options` object) to avoid
  // unnecessary recomputation when the consumer creates a new options
  // object reference on each render.
  return useMemo(() => {
    const chartPersonality = tokens.personality.chart;
    // Color scheme cascade: explicit option -> personality token -> 'default'.
    const scheme = options.colorScheme ?? chartPersonality.colorScheme ?? 'default';
    const colors = scheme === 'default' || scheme === 'accessible'
      ? LEGACY_SERIES_PAINT
      : COLOR_SCHEME_MAP[scheme] ?? LEGACY_SERIES_PAINT;

    return {
      animate: !resolvedStatic && (options.animate ?? chartPersonality.animateOnMount),
      animationDuration: resolvedStatic ? 0 : chartPersonality.mountDuration,
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
  }, [options.animate, options.colorScheme, options.curved, options.showDots, options.tooltip, resolvedStatic, t, tokens.personality.chart]);
}
