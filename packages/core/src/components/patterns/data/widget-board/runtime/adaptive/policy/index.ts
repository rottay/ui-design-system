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
 *
 * This is WidgetBoard's OWN adapter and stays with the board: it is the only
 * code that knows `WidgetBoardItem`. The solver it feeds is shared support
 * (`patterns/runtime/adaptive-layout`), so the board owns its translation and
 * no other family has to learn the board's legacy vocabulary.
 */

import type { WidgetBoardItem, WidgetLayout } from '../../../contracts';
import type {
  AdaptiveItemContract,
  ContainerPosture,
  LayoutIntent,
} from '../../../../../runtime/adaptive-layout/foundation';
import { LEGACY_SIZE_SPANS } from '../../../../../runtime/adaptive-layout/foundation';
import { CONTAINER_POSTURES } from '@/foundation/contracts/kernel/adaptation/foundation';

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

/**
 * The persisted layout of one posture: order, visibility and the preferred
 * column span. `height` px stays the `data-height=fixed` escape, outside the
 * span model, so it never reaches the persisted layout.
 */
export function widgetItemsToLayout(
  items: readonly WidgetBoardItem[],
  posture: ContainerPosture
): WidgetLayout {
  const intents: LayoutIntent[] = items.map((item) => ({
    itemId: item.id,
    order: item.order,
    visible: item.visible,
    spanHint: { cols: (LEGACY_SIZE_SPANS[item.size] ?? LEGACY_SIZE_SPANS.md).preferred },
  }));
  return { [posture]: intents };
}

const INTENT_KEYS = new Set(['itemId', 'order', 'visible', 'spanHint', 'modeHint', 'pinned']);
const SPAN_KEYS = new Set(['cols', 'rows']);

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

function isLayoutIntent(value: unknown): value is LayoutIntent {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const intent = value as Record<string, unknown>;
  if (Object.keys(intent).some((key) => !INTENT_KEYS.has(key))) return false;
  if (typeof intent.itemId !== 'string' || intent.itemId.length === 0) return false;
  if (typeof intent.order !== 'number' || !Number.isInteger(intent.order) || intent.order < 0) return false;
  if (typeof intent.visible !== 'boolean') return false;
  if (intent.pinned !== undefined && typeof intent.pinned !== 'boolean') return false;
  if (intent.modeHint !== undefined && typeof intent.modeHint !== 'string') return false;
  if (intent.spanHint !== undefined) {
    const span = intent.spanHint;
    if (typeof span !== 'object' || span === null || Array.isArray(span)) return false;
    const entries = Object.entries(span as Record<string, unknown>);
    if (entries.some(([key, cell]) => !SPAN_KEYS.has(key) || !isPositiveInteger(cell))) return false;
  }
  return true;
}

/**
 * Fail-closed gate for a stored `WidgetLayout`: a posture key outside the
 * container vocabulary, a non-list, an intent with an unknown field (px
 * included), a malformed value or a repeated item id discards that whole
 * posture, so nothing is ever partially applied.
 */
export function normalizeWidgetLayout(value: unknown): WidgetLayout {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
  const stored = value as Record<string, unknown>;
  const layout: WidgetLayout = {};
  for (const posture of CONTAINER_POSTURES) {
    const intents = stored[posture];
    if (!Array.isArray(intents) || !intents.every(isLayoutIntent)) continue;
    const ids = new Set(intents.map((intent) => intent.itemId));
    if (ids.size !== intents.length) continue;
    layout[posture] = intents;
  }
  return layout;
}

/**
 * The commit tap: every committed item list still reaches `onItemsChange`,
 * and, when the app listens, its layout reaches `onLayoutChange` keyed by the
 * posture the board was in.
 */
export function createLayoutCommit(
  onItemsChange: ((items: WidgetBoardItem[]) => void) | undefined,
  onLayoutChange: ((layout: WidgetLayout, posture: ContainerPosture) => void) | undefined,
  posture: () => ContainerPosture
): ((items: WidgetBoardItem[]) => void) | undefined {
  if (!onLayoutChange) return onItemsChange;
  return (items) => {
    onItemsChange?.(items);
    const current = posture();
    onLayoutChange(widgetItemsToLayout(items, current), current);
  };
}
