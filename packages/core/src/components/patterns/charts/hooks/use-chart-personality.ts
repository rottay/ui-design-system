'use client';

import { useMemo } from 'react';
import { useTokens } from '../../../../core/hooks/tokens';
import { useBreakpoints } from '../../../../core/hooks/responsive/useBreakpoints';
import { useTranslation } from '../../../../theme/i18n';
import { DEFAULT_COLORS, COLOR_SCHEME_MAP } from '../types';

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
 * Chart components should not guess whether a product wants sharp lines,
 * playful mount animations, or dots on every data point. Those defaults belong
 * to the resolved product personality and only get overridden by explicit props.
 */
export function useChartPersonality(
  options: ChartPersonalityOptions = {}
): ResolvedChartPersonality {
  const tokens = useTokens();
  const { prefersReducedMotion } = useBreakpoints();
  const { t } = useTranslation('components');

  return useMemo(() => {
    const chartPersonality = tokens.personality.chart;
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
