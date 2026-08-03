'use client';

/**
 * Compatibility family for the public TreeMap contract.
 *
 * The chart-engine now owns pure squarified-hierarchy geometry and React/SVG
 * marks. This adapter preserves the established family props, scaffold,
 * accessible summary, and legend for existing consumers.
 */

import { memo, useMemo, useRef } from 'react';

import type {
  ChartBaseProps,
  ChartColorSchemeProps,
  ChartColorsProps,
  ChartLegendProps,
  ChartStateProps,
} from '../../contracts';
import { ChartScaffold, describeChart, resolveChartScaffoldState } from '../../presentation/scaffold';
import { useChartPersonality } from '../../runtime';
import {
  buildSvgTreeMapGeometry,
  type SvgTreeMapNode,
} from '../../runtime/chart-engine/foundation/renderers/geometry';
import { SvgTreeMapRenderer } from '../../runtime/chart-engine/presentation/react/renderers/treemap';

/** A single node in the treemap hierarchy. Nested `children` create sub-groups. */
export interface TreeMapNode {
  name: string;
  value: number;
  children?: TreeMapNode[];
}

/** Own props for the {@link TreeMap} component (state copy is composed below). */
interface TreeMapOwnProps
  extends ChartBaseProps, ChartLegendProps, ChartColorsProps, ChartColorSchemeProps {
  data: TreeMapNode[];
  showLabels?: boolean;
  padding?: number;
}

/** Props for the {@link TreeMap} component. */
export type TreeMapProps = TreeMapOwnProps & ChartStateProps;

function normalizeTreeNode(node: TreeMapNode): SvgTreeMapNode | null {
  const children = (node.children ?? [])
    .map(normalizeTreeNode)
    .filter((child): child is SvgTreeMapNode => child !== null);
  const value = Number.isFinite(node.value) && node.value > 0 ? node.value : 0;
  if (children.length === 0 && value === 0) return null;
  return {
    name: node.name,
    value,
    ...(children.length > 0 ? { children } : {}),
  };
}

function treeLeaves(
  nodes: readonly SvgTreeMapNode[],
  group: string | null = null,
): { name: string; value: number; group: string | null }[] {
  return nodes.flatMap((node) => (node.children?.length
    ? treeLeaves(node.children, node.name)
    : [{ name: node.name, value: node.value, group }]));
}

/**
 * Public TreeMap compatibility adapter. All SVG ownership is delegated to
 * {@link SvgTreeMapRenderer}; the family contract remains unchanged.
 */
export const TreeMap = memo(function TreeMap({
  data,
  showLabels = true,
  padding = 2,
  width,
  height = 400,
  className,
  style,
  loading = false,
  state,
  emptyLabel,
  emptyDescription,
  emptyAction,
  errorLabel,
  errorDescription,
  errorAction,
  title,
  subtitle,
  legend = false,
  animate = true,
  responsive = true,
  colors,
  colorScheme,
  tooltip = true,
}: TreeMapProps) {
  const scaffoldRef = useRef<HTMLDivElement>(null);
  const legacySvgRef = useRef<SVGSVGElement>(null);
  const chartPersonality = useChartPersonality({ animate, tooltip, colorScheme });
  const palette = colors && colors.length > 0 ? colors : chartPersonality.colors;
  const normalizedData = useMemo(
    () => data.map(normalizeTreeNode).filter((node): node is SvgTreeMapNode => node !== null),
    [data],
  );
  const leavesForSummary = useMemo(() => treeLeaves(normalizedData), [normalizedData]);
  // The legend palette must match the renderer's tile assignment, so both
  // resolve from the same pure engine.
  const model = useMemo(
    () => buildSvgTreeMapGeometry({
      data: normalizedData,
      width: 600,
      height,
      padding,
      colors: palette,
    }),
    [height, normalizedData, padding, palette],
  );
  // Hierarchical context reaches the accessible summary: when the data has
  // nested groups, each leaf row carries its parent group so the textual
  // alternative preserves the grouping the tiles encode spatially.
  const hasHierarchy = leavesForSummary.some((leaf) => leaf.group !== null);
  const summary = {
    caption: title ? `${title} data summary` : 'Treemap data summary',
    headers: hasHierarchy ? ['Group', 'Name', 'Value'] : ['Name', 'Value'],
    rows: leavesForSummary.map((leaf) => (hasHierarchy
      ? [leaf.group ?? '', leaf.name, leaf.value]
      : [leaf.name, leaf.value])),
  };
  const legendNode = legend ? (
    <div data-part="legend" style={{ display: 'flex', gap: 'var(--ds-chart-legend-gap, 16px)', flexWrap: 'wrap', marginTop: 'var(--ds-chart-legend-margin-top, 8px)', justifyContent: 'center' }}>
      {model.tiles.map((tile) => (
        <div key={tile.id} data-part="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-chart-legend-item-gap, 6px)', fontSize: 'var(--ds-chart-legend-font-size, 12px)' }}>
          <span data-part="legend-swatch" data-color-source={tile.colorSource} style={{ width: 12, height: 12, backgroundColor: tile.color, display: 'inline-block' }} />
          <span data-part="legend-label">{tile.name}</span>
        </div>
      ))}
    </div>
  ) : null;

  const resolvedState = resolveChartScaffoldState({
    state,
    loading,
    dataCount: leavesForSummary.length,
    emptyLabel,
  });
  // Rebuild the discriminated state contract from the resolved state so the
  // typed-required copy correlates with the active arm.
  const stateProps: ChartStateProps = resolvedState === 'error'
    ? {
      state: 'error',
      errorLabel: errorLabel ?? '',
      ...(errorDescription === undefined ? {} : { errorDescription }),
      ...(errorAction === undefined ? {} : { errorAction }),
    }
    : resolvedState === 'empty'
      ? {
        state: 'empty',
        emptyLabel: emptyLabel ?? '',
        ...(emptyDescription === undefined ? {} : { emptyDescription }),
        ...(emptyAction === undefined ? {} : { emptyAction }),
      }
      : {
        state: resolvedState,
        ...(emptyLabel === undefined ? {} : { emptyLabel }),
        ...(emptyDescription === undefined ? {} : { emptyDescription }),
        ...(emptyAction === undefined ? {} : { emptyAction }),
      };

  return (
    <ChartScaffold
      containerRef={scaffoldRef}
      svgRef={legacySvgRef}
      width={width}
      height={height}
      className={['ds-chart-treemap', className].filter(Boolean).join(' ')}
      style={style}
      {...stateProps}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Treemap'}
      ariaDescription={describeChart('Treemap', leavesForSummary.length, subtitle)}
      summary={summary}
      legend={legendNode}
      plot={({ descriptionId }) => (
        <SvgTreeMapRenderer
          data={normalizedData}
          ariaLabel={title ?? 'Treemap'}
          ariaDescribedBy={descriptionId}
          width={width}
          height={height}
          responsive={responsive}
          animate={chartPersonality.animate}
          padding={padding}
          showLabels={showLabels}
          colors={palette}
          showTitles={chartPersonality.tooltip}
        />
      )}
    />
  );
});
