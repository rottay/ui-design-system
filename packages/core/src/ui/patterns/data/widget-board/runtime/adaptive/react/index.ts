'use client';

/**
 * WidgetBoard adaptive layout hook (C2b) — the board's OWN adapter onto the
 * shared adaptive runtime.
 *
 * Division of law: the shared support owner
 * (`patterns/runtime/adaptive-layout`) provides the pure solver, the
 * environment derivation and the persistence gate; THIS module adds only what
 * is genuinely the board's — one ResizeObserver per board container (grid
 * width → collapse tier AND per-cell intrinsic rows through the same observer
 * instance), the CSS-co-authored tier ladder that `widget-board.css` mirrors,
 * bounded re-measure convergence (≤3 passes per epoch, with span hysteresis —
 * an unchanged span never re-enters), and the lowering of `WidgetBoardItem`
 * through `../policy`. The engine receives resolved placements and never
 * observes, measures or memoizes on its own.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';

import type { WidgetBoardItem } from '../../../contracts';
import type {
  PlacementGridStyle,
  ResolvedPlacement,
} from '../../../../../runtime/adaptive-layout/foundation';
import {
  placementsToGridStyles,
  resolveAdaptiveLayout,
} from '../../../../../runtime/adaptive-layout/runtime';
import { useAdaptiveEnvironment } from '../../../../../runtime/adaptive-layout/presentation/react';
import { widgetItemsToAdaptiveInputs } from '../policy';

export type BoardCollapseTier = 'full' | 'mid' | 'single';

const TIER_COLS: Record<BoardCollapseTier, number> = {
  full: 12,
  mid: 6,
  single: 1,
};

const MAX_MEASURE_PASSES = 3;

export interface AdaptiveBoardLayoutInput {
  readonly items: readonly WidgetBoardItem[];
  readonly gridRef: RefObject<HTMLElement | null>;
  readonly cellRefs: RefObject<Map<string, HTMLElement>>;
  readonly narrow: boolean;
  /** Preview substitution during an interactive resize session. */
  readonly previewRows?: Readonly<Record<string, number>>;
}

export interface AdaptiveBoardLayoutResult {
  readonly tier: BoardCollapseTier;
  readonly placements: Readonly<Record<string, PlacementGridStyle>>;
  readonly resolved: readonly ResolvedPlacement[];
  /** The real invalidation key — changes re-measure and re-solve. */
  readonly layoutEpoch: string;
  readonly rowSpans: Readonly<Record<string, number>>;
}

export function useAdaptiveBoardLayout({
  items,
  gridRef,
  cellRefs,
  narrow,
  previewRows,
}: AdaptiveBoardLayoutInput): AdaptiveBoardLayoutResult {
  const environment = useAdaptiveEnvironment();
  const [tier, setTier] = useState<BoardCollapseTier>('full');
  const [rowSpans, setRowSpans] = useState<Record<string, number>>({});
  const [rowUnit, setRowUnit] = useState<{ rowHeight: number; rowGap: number }>({
    rowHeight: 8,
    rowGap: 8,
  });
  const passCountRef = useRef(0);
  const spanBias = environment.posture.spanBias;

  const layoutEpoch = `${environment.envEpoch}:${tier}`;

  // Epoch change invalidates measurements and re-opens the convergence
  // budget — this is what makes density/type/locale/dir changes actually
  // re-measure instead of reusing stale spans.
  const epochRef = useRef(layoutEpoch);
  if (epochRef.current !== layoutEpoch) {
    epochRef.current = layoutEpoch;
    passCountRef.current = 0;
  }
  useEffect(() => {
    setRowSpans({});
  }, [layoutEpoch]);

  const visibleIds = useMemo(
    () =>
      items
        .filter((item) => item.visible)
        .map((item) => item.id)
        .join('|'),
    [items]
  );

  // ONE ResizeObserver per board container: the grid entry resolves the
  // tier (container-first — never the viewport) and each cell entry feeds
  // intrinsic rows, with hysteresis (identical span never re-enters) and a
  // hard 3-pass budget per epoch.
  useEffect(() => {
    const grid = gridRef.current;
    if (narrow || !grid || typeof ResizeObserver === 'undefined') return;

    const rowMetrics = (): { rowHeight: number; rowGap: number } => {
      const style = getComputedStyle(grid);
      return {
        rowHeight: Number.parseFloat(style.gridAutoRows) || 8,
        rowGap: Number.parseFloat(style.rowGap) || 8,
      };
    };

    const observer = new ResizeObserver((entries) => {
      let nextTier: BoardCollapseTier | null = null;
      const spanUpdates: Record<string, number> = {};
      const { rowHeight, rowGap } = rowMetrics();
      // Publish the COMPUTED row unit so authored px heights and measured
      // heights convert with the same live CSS metrics, never a constant.
      setRowUnit((current) =>
        current.rowHeight === rowHeight && current.rowGap === rowGap
          ? current
          : { rowHeight, rowGap }
      );

      for (const entry of entries) {
        if (entry.target === grid) {
          const width = entry.contentRect.width;
          if (width > 0) {
            // These two literals are NOT the tenant ladder and must not become
            // it. `widget-board.css` mirrors them as container queries that
            // repoint the grid itself — `@container ds-widget-board
            // (max-width: 639px)` sets `grid-template-columns: minmax(0, 1fr)`
            // (ONE track) and the 839px query re-spans the cells. The solver's
            // inline `grid-column` wins over those rules, so moving the tier
            // here alone would stamp `1 / span 6` into a one-track grid and
            // manufacture implicit columns — overflow, the exact invariant the
            // posture axis promises not to break. The board's capacity ladder
            // is therefore CSS-co-authored and stays pinned; the tenant
            // posture reaches this board through `spanBias` instead, which is
            // bounded by each item's own contract and cannot desync from any
            // track count. Unifying the two authorities needs the CSS to stop
            // pinning tracks — a separate, CSS-moving change.
            nextTier = width <= 639 ? 'single' : width <= 839 ? 'mid' : 'full';
          }
          continue;
        }
        const element = entry.target as HTMLElement;
        const id = element.dataset.widgetId;
        if (!id) continue;
        const rendered = entry.contentRect.height;
        const height =
          element.dataset.height === 'fixed'
            ? rendered
            : Math.max(element.scrollHeight, rendered);
        if (height <= 0) continue;
        spanUpdates[id] = Math.max(
          1,
          Math.ceil((height + rowGap) / (rowHeight + rowGap))
        );
      }

      if (nextTier) {
        setTier((current) => (current === nextTier ? current : nextTier));
      }
      if (Object.keys(spanUpdates).length > 0) {
        setRowSpans((current) => {
          if (passCountRef.current >= MAX_MEASURE_PASSES) return current;
          let changed = false;
          const next = { ...current };
          for (const [id, span] of Object.entries(spanUpdates)) {
            if (next[id] !== span) {
              next[id] = span;
              changed = true;
            }
          }
          if (!changed) return current;
          passCountRef.current += 1;
          return next;
        });
      }
    });

    observer.observe(grid);
    for (const element of cellRefs.current?.values() ?? []) {
      observer.observe(element);
    }
    return () => observer.disconnect();
    // visibleIds re-subscribes when the cell set changes; layoutEpoch
    // re-subscribes after invalidation resets.
  }, [gridRef, cellRefs, narrow, visibleIds, layoutEpoch]);

  const measuredRows = useMemo(
    () => (previewRows ? { ...rowSpans, ...previewRows } : rowSpans),
    [rowSpans, previewRows]
  );

  const solved = useMemo(() => {
    const { contracts, intents } = widgetItemsToAdaptiveInputs(items, rowUnit);
    // Door 2 of the two-door law: only what geometry computes with. The
    // environment acts through door 1 — `layoutEpoch` in the deps below
    // invalidates measurements, which re-enter through `measuredRows`.
    return resolveAdaptiveLayout(contracts, intents, {
      cols: TIER_COLS[tier],
      posture: tier === 'single' ? 'compact' : tier === 'mid' ? 'standard' : 'expanded',
      measuredRows,
      // E2: the tenant posture reaches the board HERE rather than through the
      // tier, because a span bias is bounded by each item's own contract and
      // by `cols`, so it can never contradict the CSS-pinned track count.
      spanBias,
    });
  }, [items, tier, layoutEpoch, measuredRows, rowUnit, spanBias]);

  const placements = useMemo(
    () => placementsToGridStyles(solved.placements),
    [solved]
  );

  return {
    tier,
    placements,
    resolved: solved.placements,
    layoutEpoch,
    rowSpans,
  };
}
