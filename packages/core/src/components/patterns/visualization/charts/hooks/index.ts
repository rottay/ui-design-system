'use client';

/**
 * @fileoverview Chart hooks barrel -- exports useChartDimensions (responsive
 * container measurement via ResizeObserver), useChartPersonality (personality
 * token resolution for chart rendering behavior), useChartCompact (responsive
 * compact mode), useChartTheme (DS token to resolved hex bridge for
 * chart rendering), and useChartBrush (brush/zoom interaction for
 * time-series charts).
 */

export { useChartDimensions } from './use-chart-dimensions';

export { useChartPersonality } from './use-chart-personality';
export type { ChartPersonalityOptions, ResolvedChartPersonality } from './use-chart-personality';

export { useChartCompact } from './use-chart-compact';
export type { UseChartCompactOptions, ResolvedChartCompact } from './use-chart-compact';

export { useChartTheme } from './use-chart-theme';
export type { ChartColorOwner, ChartTheme, ChartThemeOwner } from './use-chart-theme';

export { useChartTooltip } from './use-chart-tooltip';
export type { UseChartTooltipReturn } from './use-chart-tooltip';

export { useChartBrush } from './use-chart-brush';
export type { BrushSelection, UseChartBrushOptions, UseChartBrushReturn } from './use-chart-brush';

export { useChartExport } from './use-chart-export';
export type { UseChartExportReturn } from './use-chart-export';
