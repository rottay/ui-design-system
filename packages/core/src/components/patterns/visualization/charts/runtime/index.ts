'use client';

/**
 * @fileoverview Chart hooks barrel -- exports useChartDimensions (responsive
 * container measurement via ResizeObserver), useChartPersonality (personality
 * token resolution for chart rendering behavior), useChartCompact (responsive
 * compact mode), useChartTheme (DS token to resolved hex bridge for
 * chart rendering), and useChartBrush (brush/zoom interaction for
 * time-series charts).
 */

export { useChartDimensions } from './chart-engine/runtime/dimensions';
export type {
  ChartDimensions,
  ChartDimensionsOptions,
  UseChartDimensionsResult,
} from './chart-engine/runtime/dimensions';

export { useChartPersonality } from './theming/composition/react/personality';
export type { ChartPersonalityOptions, ResolvedChartPersonality } from './theming/composition/react/personality';

export { useChartCompact } from './responsive/compact-mode';
export type { UseChartCompactOptions, ResolvedChartCompact } from './responsive/compact-mode';

export { useChartTheme } from './theming/presentation/react/color-theme';
export type { ChartColorOwner, ChartTheme, ChartThemeOwner } from './theming/presentation/react/color-theme';

export { useChartTooltip } from './interaction/tooltip-state';
export type { UseChartTooltipReturn } from './interaction/tooltip-state';

export { useChartBrush } from './interaction/brush';
export type { BrushSelection, UseChartBrushOptions, UseChartBrushReturn } from './interaction/brush';

export { useChartViewport } from './interaction/viewport';
export type {
  ChartAxisInterval,
  ChartDomain,
  ChartViewportAxis,
  ChartViewportBrushAxis,
  ChartViewportBrushConfig,
  ChartViewportBrushScale,
  ChartViewportConfig,
  ChartViewportPlotRect,
  ChartViewportResetButtonProps,
  ChartViewportRootProps,
  ChartViewportState,
  ChartViewportZoomConfig,
} from './interaction/viewport';

export { applyStreamCommit, useChartStream } from './streaming';
export type {
  ChartStreamOptions,
  ChartStreamState,
  ChartStreamWindow,
} from './streaming';

export { useChartExport } from './exporting/composition/react';
export type { UseChartExportReturn } from './exporting/composition/react';
