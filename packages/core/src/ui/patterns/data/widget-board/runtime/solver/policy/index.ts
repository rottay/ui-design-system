/**
 * Legacy WidgetBoard → adaptive solver bridge (C2).
 *
 * The four-size vocabulary and the raw-px height escape hatch stay in the
 * public contract for one wave; this adapter lowers them ONCE per render
 * into honest solver inputs:
 * - `size` → the LEGACY_SIZE_SPANS min/preferred/max column range;
 * - `height` px → block rows through the engine's own measured-row formula
 *   (8px auto rows + 8px row gap), so a persisted pixel preference becomes a
 *   grid-unit `spanHint.rows` exactly once — pixels never reach the solver;
 * - `order`/`visible` → a `LayoutIntent` per item.
 *
 * Everything defaults conservative: every item is `primary` (the legacy
 * board had no priority semantics, so nothing may surprise-defer),
 * `visualReorder: 'forbid'` (DOM = focus = visual), and
 * `overflowPolicy: 'shrink-to-min'` (rows complete instead of leaving
 * holes).
 */

import type { WidgetBoardItem } from '../../../contracts';
import type {
  AdaptiveItemContract,
  LayoutIntent,
  ResolvedPlacement,
} from '..';
import { LEGACY_SIZE_SPANS } from '..';

/** Mirrors widget-board.css grid geometry: 8px auto rows, 8px row gap. */
const ROW_HEIGHT_PX = 8;
const ROW_GAP_PX = 8;

/** The engine's own measurement rounding, applied exactly once. */
export function heightPxToRows(
  heightPx: number,
  rowHeightPx: number = ROW_HEIGHT_PX,
  rowGapPx: number = ROW_GAP_PX
): number {
  if (!Number.isFinite(heightPx) || heightPx <= 0) return 1;
  return Math.max(1, Math.ceil((heightPx + rowGapPx) / (rowHeightPx + rowGapPx)));
}

export interface AdaptiveBoardInputs {
  readonly contracts: readonly AdaptiveItemContract[];
  readonly intents: readonly LayoutIntent[];
}

export function widgetItemsToAdaptiveInputs(
  items: readonly WidgetBoardItem[],
  rowUnit?: { readonly rowHeight: number; readonly rowGap: number }
): AdaptiveBoardInputs {
  const contracts: AdaptiveItemContract[] = [];
  const intents: LayoutIntent[] = [];
  for (const item of items) {
    const spans = LEGACY_SIZE_SPANS[item.size] ?? LEGACY_SIZE_SPANS.md;
    contracts.push({
      id: item.id,
      accessibleTitle: item.accessibleTitle,
      minSpan: { cols: spans.min },
      preferredSpan: { cols: spans.preferred },
      maxSpan: { cols: spans.max },
      blockPolicy: { mode: 'intrinsic', minRows: 1 },
      contentModes: [{ id: 'full', minSpan: { cols: 1 } }],
      priority: 'primary',
      overflowPolicy: 'shrink-to-min',
      visualReorder: 'forbid',
    });
    intents.push({
      itemId: item.id,
      order: item.order,
      visible: item.visible,
      ...(typeof item.height === 'number' && Number.isFinite(item.height)
        ? {
            spanHint: {
              rows: heightPxToRows(
                item.height,
                rowUnit?.rowHeight,
                rowUnit?.rowGap
              ),
            },
          }
        : {}),
    });
  }
  return { contracts, intents };
}

export interface PlacementGridStyle {
  readonly gridColumn: string;
  readonly gridRow: string;
}

/** Solver output → the two inline grid lines a cell stamps. */
export function placementsToGridStyles(
  placements: readonly ResolvedPlacement[]
): Readonly<Record<string, PlacementGridStyle>> {
  const styles: Record<string, PlacementGridStyle> = {};
  for (const placement of placements) {
    styles[placement.itemId] = {
      gridColumn: `${placement.colStart} / span ${placement.colSpan}`,
      gridRow: `${placement.rowStart} / span ${placement.rowSpan}`,
    };
  }
  return styles;
}
