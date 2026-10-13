import { hierarchy, treemap as createTreemapLayout } from 'd3';

import { DEFAULT_COLORS } from '../../../../../../foundation/palettes';

import { finiteSize, type ChartGeometryRect } from '../foundation';

// ---------------------------------------------------------------------------
// TreeMap (squarified hierarchy) geometry
// ---------------------------------------------------------------------------

export interface SvgTreeMapNode {
  readonly name: string;
  readonly value: number;
  readonly children?: readonly SvgTreeMapNode[];
}

export interface SvgTreeMapTile extends ChartGeometryRect {
  readonly id: string;
  readonly name: string;
  readonly value: number;
  readonly index: number;
  readonly color: string;
  readonly colorSource: 'palette';
  readonly showLabel: boolean;
  readonly showValue: boolean;
}

export interface SvgTreeMapGeometry {
  readonly width: number;
  readonly height: number;
  readonly tiles: readonly SvgTreeMapTile[];
}

export interface BuildSvgTreeMapGeometryOptions {
  readonly data: readonly SvgTreeMapNode[];
  readonly width: number;
  readonly height: number;
  readonly padding?: number;
  readonly colors?: readonly string[];
}

interface MutableTreeNode {
  name: string;
  value: number;
  children?: MutableTreeNode[];
}

function toMutableTreeNodes(nodes: readonly SvgTreeMapNode[]): MutableTreeNode[] {
  return nodes.map((node) => {
    const children = node.children?.length ? toMutableTreeNodes(node.children) : undefined;
    return {
      name: node.name,
      value: Number.isFinite(node.value) && node.value > 0 ? node.value : 0,
      ...(children ? { children } : {}),
    };
  });
}

/**
 * Immutable squarified treemap geometry. D3 contributes the hierarchy sum and
 * tiling layout only; the React renderer draws the positioned rects. Leaves
 * are ordered descending by value so the largest tile is top-left.
 */
export function buildSvgTreeMapGeometry({
  data,
  width: widthInput,
  height: heightInput,
  padding = 2,
  colors,
}: BuildSvgTreeMapGeometryOptions): SvgTreeMapGeometry {
  const width = finiteSize(widthInput, 600);
  const height = finiteSize(heightInput, 400);
  const palette = colors && colors.length > 0 ? colors : DEFAULT_COLORS;
  const safePadding = Number.isFinite(padding) ? Math.max(0, padding) : 2;

  if (width === 0 || height === 0 || data.length === 0) {
    return { width, height, tiles: Object.freeze([]) };
  }

  const root = hierarchy<MutableTreeNode>({
    name: 'root',
    value: 0,
    children: toMutableTreeNodes(data),
  })
    .sum((node) => (node.children?.length ? 0 : node.value))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  const layoutRoot = createTreemapLayout<MutableTreeNode>()
    .size([width, height])
    .padding(safePadding)
    .round(true)(root);

  const tiles = layoutRoot.leaves().flatMap<SvgTreeMapTile>((leaf, index) => {
    const value = leaf.value ?? 0;
    if (value <= 0) return [];
    const rectWidth = Math.max(0, leaf.x1 - leaf.x0);
    const rectHeight = Math.max(0, leaf.y1 - leaf.y0);
    return [{
      id: `treemap-tile-${index}`,
      name: leaf.data.name,
      value,
      index,
      x: leaf.x0,
      y: leaf.y0,
      width: rectWidth,
      height: rectHeight,
      color: palette[index % palette.length] ?? 'var(--ds-color-primary)',
      colorSource: 'palette',
      showLabel: rectWidth > 40 && rectHeight > 20,
      showValue: rectWidth > 40 && rectHeight > 32,
    }];
  });

  return { width, height, tiles: Object.freeze(tiles) };
}
