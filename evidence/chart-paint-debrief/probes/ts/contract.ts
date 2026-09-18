/* The declared API of §2.2-§2.4, verbatim. Family symbols are `declare`d stand-ins. */
import type { ReactNode, FC } from 'react';

export type ChartColorScheme = 'default' | 'pastel' | 'vibrant' | 'monochrome' | 'accessible';
export const CHART_CATEGORICAL_SIZE = 10;

export type ChartFamilyId =
  | 'area-chart' | 'bar-chart' | 'bullet' | 'calendar-heat-map' | 'funnel-chart'
  | 'gantt-chart' | 'gauge' | 'heat-map' | 'histogram' | 'line-chart'
  | 'network-graph' | 'pie-chart' | 'radar-chart' | 'sankey' | 'scatter'
  | 'sparkline' | 'tree-map' | 'waterfall';

export type ChartPaintModel = 'categorical' | 'sequential' | 'semantic' | 'single';

export interface ChartFamilyRow {
  readonly id: ChartFamilyId;
  readonly namespace: `ds-chart-${string}`;
  readonly paintModel: ChartPaintModel;
  readonly cadenceSize: number | null;
  readonly honoursColorsProp: boolean;
  readonly geometry: 'engine' | 'family-owned';
  readonly a11y: 'scaffold' | 'own';
}

export declare const CHART_FAMILY_REGISTRY: Readonly<Record<ChartFamilyId, ChartFamilyRow>>;

export interface ChartPaintRequest {
  readonly family: ChartFamilyId;
  readonly scheme?: ChartColorScheme;
  readonly tokenScheme?: ChartColorScheme;
  readonly override?: readonly string[];
}

export interface ChartCategoricalPaint {
  readonly slots: readonly string[];
  slotIndexFor(seriesIndex: number): number;
  paintFor(seriesIndex: number): string;
  cadenceIndexFor(seriesIndex: number): number | null;
}

export interface ChartSequentialPaint {
  readonly stops: readonly [string, string];
  readonly steps: number;
  stopFor(t: number): string;
}

export interface ChartPaintRootAttributes {
  readonly 'data-chart-color-scheme': ChartColorScheme;
  readonly 'data-chart-paint-model': ChartPaintModel;
}

export interface ChartPaintDecision {
  readonly family: ChartFamilyId;
  readonly model: ChartPaintModel;
  readonly scheme: ChartColorScheme;
  readonly categorical: ChartCategoricalPaint | null;
  readonly sequential: ChartSequentialPaint | null;
  readonly rootAttributes: ChartPaintRootAttributes;
  readonly overridden: boolean;
}

export interface ChartMaterializedPaint {
  readonly scheme: ChartColorScheme;
  readonly resolved: readonly string[];
}

export declare function resolveChartPaint(request: ChartPaintRequest): ChartPaintDecision;
export declare function materializeChartPaint(
  decision: ChartPaintDecision, owner: Element,
): ChartMaterializedPaint;

export declare function useChartPaint(
  request: Omit<ChartPaintRequest, 'tokenScheme'>,
): ChartPaintDecision;
export declare const ChartPaintProvider: FC<{ decision: ChartPaintDecision; children: ReactNode }>;
export declare function useChartPaintDecision(): ChartPaintDecision;

/* ---- the typed `colors` prop gate of §2.3(d) ------------------------------- */
/** A family may declare `colors` only when its registry row honours it. */
export type ChartColorsPropFor<F extends ChartFamilyId> =
  typeof CHART_FAMILY_REGISTRY[F]['honoursColorsProp'] extends true
    ? { colors?: readonly string[] }
    : Record<never, never>;
