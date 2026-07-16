'use client';

/**
 * @fileoverview useChartTheme hook -- bridges DS CSS variable tokens to resolved
 * hex values for chart rendering. Charts need resolved hex values for D3 color
 * interpolation (gradients, heatmaps), canvas rendering, third-party chart
 * libraries, and chart export (PNG/SVG with baked colors). For inline SVG
 * rendering, CSS vars work natively -- the raw CSS var strings are also
 * returned via `cssVars` for that use case.
 *
 * Re-resolves automatically when the owning chart element or any of its
 * provider ancestors changes theme-relevant attributes.
 *
 * SSR-safe: returns sensible fallback values when `window` is undefined.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { useChartPersonality } from './use-chart-personality';
import { DEFAULT_COLORS } from '../Charts.types';
import {
  PROVIDER_PAINT_ATTRIBUTE_FILTER,
  resolveCssColor,
  type ChartColorOwner,
} from '../utils/resolve-css-color';

export type { ChartColorOwner } from '../utils/resolve-css-color';

export type ChartThemeOwner =
  | ChartColorOwner
  | RefObject<ChartColorOwner | null>;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChartTheme {
  /** 10 resolved hex colors for data series */
  palette: string[];
  /** Axis and grid chrome */
  axis: {
    lineColor: string;
    tickColor: string;
    labelColor: string;
    gridColor: string;
  };
  /** Surface colors */
  surface: {
    background: string;
    tooltipBg: string;
    tooltipText: string;
    tooltipBorder: string;
  };
  /** Text colors */
  text: {
    title: string;
    subtitle: string;
    legend: string;
    value: string;
  };
  /** Raw CSS variable strings (for inline SVG that doesn't need resolution) */
  cssVars: {
    palette: string[];
    axisLine: string;
    gridLine: string;
    textPrimary: string;
    textSecondary: string;
    background: string;
  };
  /** Personality (pass-through from useChartPersonality) */
  personality: {
    animate: boolean;
    animationDuration: number;
    lineMode: string;
    showDots: boolean;
    useGradientFill: boolean;
    tooltipStyle: string;
  };
}

// ---------------------------------------------------------------------------
// CSS variable mappings
// ---------------------------------------------------------------------------

/** CSS variable names used for axis/grid/surface/text tokens */
const CSS_VARS = {
  axisLine: '--ds-color-border',
  axisTickColor: '--ds-color-border-subtle',
  axisLabelColor: '--ds-color-text-secondary',
  gridColor: '--ds-color-border-subtle',
  surfaceBg: '--ds-color-bg-primary',
  tooltipBg: '--ds-color-bg-elevated',
  tooltipText: '--ds-color-text-primary',
  tooltipBorder: '--ds-color-border',
  textTitle: '--ds-color-text-primary',
  textSubtitle: '--ds-color-text-secondary',
  textLegend: '--ds-color-text-muted',
  textValue: '--ds-color-text-primary',
} as const;

/** Fallback values used during SSR or when resolution fails */
const FALLBACK_HEX = {
  axisLine: '#d9d9d9',
  axisTickColor: '#e8e8e8',
  axisLabelColor: '#8c8c8c',
  gridColor: '#f0f0f0',
  surfaceBg: '#ffffff',
  tooltipBg: '#ffffff',
  tooltipText: '#262626',
  tooltipBorder: '#d9d9d9',
  textTitle: '#262626',
  textSubtitle: '#8c8c8c',
  textLegend: '#bfbfbf',
  textValue: '#262626',
} as const;

function categoricalFallback(index: number): string {
  return DEFAULT_COLORS.at(index % DEFAULT_COLORS.length) ?? '#6366f1';
}

function readChartOwner(
  source: ChartThemeOwner | null,
): ChartColorOwner | null {
  if (!source) return null;
  return 'nodeType' in source ? source : source.current;
}

// ---------------------------------------------------------------------------
// SSR fallback
// ---------------------------------------------------------------------------

function buildFallbackTheme(
  paletteVars: string[],
  personality: ChartTheme['personality'],
): ChartTheme {
  return {
    // Preserve concrete personality colors in SSR and use the already-audited
    // accessible categorical sequence only for variables that need a fallback.
    palette: paletteVars.map((value, index) =>
      resolveCssColor(value, null, categoricalFallback(index)),
    ),
    axis: {
      lineColor: FALLBACK_HEX.axisLine,
      tickColor: FALLBACK_HEX.axisTickColor,
      labelColor: FALLBACK_HEX.axisLabelColor,
      gridColor: FALLBACK_HEX.gridColor,
    },
    surface: {
      background: FALLBACK_HEX.surfaceBg,
      tooltipBg: FALLBACK_HEX.tooltipBg,
      tooltipText: FALLBACK_HEX.tooltipText,
      tooltipBorder: FALLBACK_HEX.tooltipBorder,
    },
    text: {
      title: FALLBACK_HEX.textTitle,
      subtitle: FALLBACK_HEX.textSubtitle,
      legend: FALLBACK_HEX.textLegend,
      value: FALLBACK_HEX.textValue,
    },
    cssVars: {
      palette: paletteVars,
      axisLine: `var(${CSS_VARS.axisLine})`,
      gridLine: `var(${CSS_VARS.gridColor})`,
      textPrimary: `var(${CSS_VARS.textTitle})`,
      textSecondary: `var(${CSS_VARS.textSubtitle})`,
      background: `var(${CSS_VARS.surfaceBg})`,
    },
    personality,
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Resolves DS CSS variable colors to actual hex values for chart rendering.
 *
 * Internally calls `useChartPersonality()` to obtain the current palette
 * (CSS var strings) and personality tokens, then resolves every CSS variable
 * to its computed value via `getComputedStyle`.
 *
 * A `MutationObserver` watches the owner-to-provider ancestor chain so local
 * tenant roots stay isolated while class/style/theme changes remain reactive.
 *
 * @returns A `ChartTheme` object containing resolved hex values, raw CSS var
 *   strings, and personality pass-through values.
 *
 * @example
 * ```tsx
 * const theme = useChartTheme(svgRef);
 *
 * // For D3 / canvas / export -- use resolved hex:
 * const colorScale = d3.scaleOrdinal(theme.palette);
 *
 * // For inline SVG -- use CSS vars directly:
 * <line stroke={theme.cssVars.axisLine} />
 *
 * // Animation decisions from personality:
 * if (theme.personality.animate) { ... }
 * ```
 */
export function useChartTheme(
  ownerSource: ChartThemeOwner | null = null,
): ChartTheme {
  const chartPersonality = useChartPersonality();
  const owner = readChartOwner(ownerSource);

  // A monotonically increasing counter that forces re-resolution when the
  // tenant or theme changes. Using a counter instead of storing the attribute
  // values avoids string comparison in the dep array.
  const [revision, setRevision] = useState(0);
  const revisionRef = useRef(revision);

  // Personality pass-through (stable shape for consumers).
  const personality = useMemo<ChartTheme['personality']>(
    () => ({
      animate: chartPersonality.animate,
      animationDuration: chartPersonality.animationDuration,
      lineMode: chartPersonality.lineMode,
      showDots: chartPersonality.showDots,
      useGradientFill: chartPersonality.useGradientFill,
      tooltipStyle: chartPersonality.tooltipStyle,
    }),
    [
      chartPersonality.animate,
      chartPersonality.animationDuration,
      chartPersonality.lineMode,
      chartPersonality.showDots,
      chartPersonality.useGradientFill,
      chartPersonality.tooltipStyle,
    ],
  );

  // CSS var strings from the palette (stable reference from useChartPersonality).
  const paletteVars = chartPersonality.colors;

  // Bump revision callback for the MutationObserver.
  const bumpRevision = useCallback(() => {
    revisionRef.current += 1;
    setRevision(revisionRef.current);
  }, []);

  // Observe only the real owner ancestry. The chain naturally includes html
  // when it is an ancestor, without using it as a global color lookup root.
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof MutationObserver === 'undefined' ||
      !ownerSource
    ) {
      return;
    }

    // Ref objects are intentionally read again after commit: during the first
    // render `ref.current` is null, then React assigns the element before this
    // effect. The revision turns that normal lifecycle into a resolved theme.
    const effectOwner = readChartOwner(ownerSource);
    if (!effectOwner) return;
    if (effectOwner !== owner) bumpRevision();

    const observer = new MutationObserver(() => {
      bumpRevision();
    });

    let current: Element | null = effectOwner;
    while (current) {
      observer.observe(current, {
        attributes: true,
        attributeFilter: [...PROVIDER_PAINT_ATTRIBUTE_FILTER],
      });
      current = current.parentElement;
    }

    return () => {
      observer.disconnect();
    };
  }, [bumpRevision, owner, ownerSource]);

  // Resolve all CSS variables into concrete values. Re-runs when the palette
  // changes, the owner changes, or a scoped provider mutation bumps revision.
  const theme = useMemo<ChartTheme>(() => {
    if (typeof window === 'undefined' || !owner) {
      return buildFallbackTheme(paletteVars, personality);
    }

    const resolveName = (name: string, fallback: string): string =>
      resolveCssColor(`var(${name})`, owner, fallback);

    return {
      palette: paletteVars.map((value, index) =>
        resolveCssColor(value, owner, categoricalFallback(index)),
      ),
      axis: {
        lineColor: resolveName(CSS_VARS.axisLine, FALLBACK_HEX.axisLine),
        tickColor: resolveName(CSS_VARS.axisTickColor, FALLBACK_HEX.axisTickColor),
        labelColor: resolveName(CSS_VARS.axisLabelColor, FALLBACK_HEX.axisLabelColor),
        gridColor: resolveName(CSS_VARS.gridColor, FALLBACK_HEX.gridColor),
      },
      surface: {
        background: resolveName(CSS_VARS.surfaceBg, FALLBACK_HEX.surfaceBg),
        tooltipBg: resolveName(CSS_VARS.tooltipBg, FALLBACK_HEX.tooltipBg),
        tooltipText: resolveName(CSS_VARS.tooltipText, FALLBACK_HEX.tooltipText),
        tooltipBorder: resolveName(CSS_VARS.tooltipBorder, FALLBACK_HEX.tooltipBorder),
      },
      text: {
        title: resolveName(CSS_VARS.textTitle, FALLBACK_HEX.textTitle),
        subtitle: resolveName(CSS_VARS.textSubtitle, FALLBACK_HEX.textSubtitle),
        legend: resolveName(CSS_VARS.textLegend, FALLBACK_HEX.textLegend),
        value: resolveName(CSS_VARS.textValue, FALLBACK_HEX.textValue),
      },
      cssVars: {
        palette: paletteVars,
        axisLine: `var(${CSS_VARS.axisLine})`,
        gridLine: `var(${CSS_VARS.gridColor})`,
        textPrimary: `var(${CSS_VARS.textTitle})`,
        textSecondary: `var(${CSS_VARS.textSubtitle})`,
        background: `var(${CSS_VARS.surfaceBg})`,
      },
      personality,
    };
    // revision is an intentional invalidation signal for computed CSS.
  }, [owner, paletteVars, personality, revision]);

  return theme;
}
