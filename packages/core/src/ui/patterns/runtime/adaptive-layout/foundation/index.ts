/**
 * Adaptive layout contracts (C2) — the vocabulary the ONE deterministic
 * placement engine solves over, shared by WidgetBoard, DashboardSurface and
 * every future adaptive composition.
 *
 * This owner lives in the patterns SUPPORT layer (`ui/patterns/runtime/`),
 * not inside any one family: the solver was previously private to
 * `patterns/data/widget-board/runtime/solver`, which forced DashboardSurface
 * to reach into another family's internals to place its sections. Support is
 * shared by declaration here, so no consumer has to cross a family boundary
 * to reach geometry. `patterns/runtime/` is a declared non-family territory,
 * so this owner holds no component-inventory row and exports no component.
 *
 * This is the CONTRACT layer only: pure types plus the one declarative
 * vocabulary table. It imports nothing. Geometry lives one layer up in
 * `../runtime` (pure, no DOM), and measurement/observers/epochs live in
 * `../presentation/react` — the house shape for a React binding layer under a
 * UI owner (`patterns/visualization/charts/runtime/chart-engine` declares the
 * same foundation/runtime/presentation triple). The local rank order is
 * foundation -> runtime -> presentation, so a contract can never depend on a
 * decision and a decision can never depend on a browser.
 *
 * There is deliberately NO barrel at `adaptive-layout/`: a barrel would
 * re-export the `'use client'` React layer into the pure geometry consumers
 * this split exists to keep server-safe. Each consumer imports the layer it
 * actually needs.
 *
 * These contracts canonize doc 05 and SUPERSEDE the B-LYT-1 draft — one spec
 * lives. They exist to kill the six recorded B-LYT-0 defects:
 * (a) rich item contract (min/preferred/max spans, content modes, priority,
 *     overflow policy) instead of a 4-size enum;
 * (b) the solver resolves for the REAL tier capacity — a collapsed 1-column
 *     tier never inherits 12-column row indices;
 * (c) no backfill across `visualReorder: 'forbid'` items — the visual
 *     row-major order of interactive items equals their DOM/focus order;
 * (d) spans are module-1 grid units and row residue is redistributed under
 *     `maxSpan`, so no size vocabulary can leave unfillable columns;
 * (e) user hints persist in GRID UNITS (`spanHint`), never raw pixels;
 * (f) posture is CONTAINER-first: the env carries resolved columns and a
 *     container posture bucket — the solver never reads a viewport.
 */

export type ContainerPosture = 'compact' | 'standard' | 'expanded';

/** Tenant-reachable responsive posture axis (previously ABSENT — R1.B). */
export interface ResponsivePostureProfile {
  readonly id: string;
  readonly revision: number;
  /** Container-width thresholds in px — of the BOUNDARY, never the viewport. */
  readonly thresholds: {
    readonly compactMaxPx: number;
    readonly standardMaxPx: number;
  };
  readonly adjustments?: Partial<
    Record<
      ContainerPosture,
      {
        readonly density?: 'compact' | 'comfortable' | 'spacious';
        readonly labelPolicy?: 'full' | 'truncate' | 'iconify';
        readonly mediaPolicy?: 'show' | 'collapse' | 'hide';
      }
    >
  >;
}

export interface GridSpan {
  readonly cols: number;
  readonly rows?: number;
}

export interface AdaptiveContentMode {
  readonly id: 'full' | 'compact' | 'summary';
  readonly minSpan: GridSpan;
  readonly minPosture?: ContainerPosture;
}

export interface ResizePolicy {
  readonly axes: 'none' | 'inline' | 'block' | 'both';
  /** LOGICAL handles — RTL costs nothing. */
  readonly handles: ReadonlyArray<
    'inline-start' | 'inline-end' | 'block-end' | 'corner'
  >;
  /** Semantic snap step in grid units, never px. */
  readonly step: GridSpan;
  readonly commit: 'on-release';
  readonly undo: true;
}

/** Replaces `WidgetBoardItem` as the adaptive contract (adapter provided). */
export interface AdaptiveItemContract {
  readonly id: string;
  readonly accessibleTitle: string;
  readonly minSpan: GridSpan;
  readonly preferredSpan: GridSpan;
  readonly maxSpan: GridSpan;
  readonly blockPolicy:
    | { readonly mode: 'intrinsic'; readonly minRows?: number }
    | { readonly mode: 'fitted'; readonly minRows: number; readonly maxRows: number }
    | {
        readonly mode: 'fixed-bounded';
        readonly rows: number;
        readonly scroll: 'none' | 'bounded';
      };
  /** Ordered, most complete first. */
  readonly contentModes: readonly AdaptiveContentMode[];
  readonly priority: 'critical' | 'primary' | 'secondary';
  readonly pinned?: boolean;
  readonly overflowPolicy:
    | 'shrink-to-min'
    | 'demote-mode'
    | 'defer'
    | 'hide-secondary';
  /** Interactive content declares 'forbid': DOM = focus = visual. */
  readonly visualReorder: 'forbid' | 'allow';
  readonly resize?: ResizePolicy;
}

/** The ONLY thing persisted for a user. Grid units and ids — never px. */
export interface LayoutIntent {
  readonly itemId: string;
  readonly order: number;
  readonly visible: boolean;
  readonly spanHint?: Partial<GridSpan>;
  readonly modeHint?: AdaptiveContentMode['id'];
  readonly pinned?: boolean;
}

/** Versioned persistence envelope; orphan intents die at the revision gate. */
export interface LayoutProfileRevision {
  readonly schemaVersion: 1;
  readonly profileId: string;
  readonly revision: number;
  readonly scope: 'user' | 'tenant' | 'vertical';
  readonly baseCatalogRevision: string;
  readonly intents: readonly LayoutIntent[];
  readonly updatedAt: string;
}

export type PlacementReason =
  | 'clamped-min'
  | 'clamped-max'
  | 'demoted-mode'
  | 'deferred'
  | 'intent-honored'
  | 'grown-to-fill'
  | 'shrunk-to-fit';

/** Derived output — NEVER persisted. */
export interface ResolvedPlacement {
  readonly itemId: string;
  readonly colStart: number;
  readonly colSpan: number;
  readonly rowStart: number;
  readonly rowSpan: number;
  readonly modeId: AdaptiveContentMode['id'];
  readonly posture: ContainerPosture;
  readonly reasons: readonly PlacementReason[];
}

/**
 * The pure solve environment (C2c two-door law). Environment reaches layout
 * through exactly two doors: (1) the RUNTIME door — direction, locale,
 * density, type scale, font epochs and artifact revision fold into the
 * runtime's layout epoch, which invalidates measurements and re-enters the
 * convergence loop; (2) THIS door — the values geometry actually computes
 * with. Direction is deliberately absent: placements are logical
 * (`grid-column` start/span) and CSS Grid mirrors them natively under RTL,
 * a law the type system now pins (passing `dir` is a compile error).
 * Density and type scale reach geometry exclusively through measured rows
 * and the computed row unit — never as free-floating multipliers.
 */
export interface AdaptiveLayoutEnv {
  /** Real capacity of the CURRENT tier (a collapsed tier passes 1). */
  readonly cols: number;
  readonly posture: ContainerPosture;
  /**
   * Measured intrinsic rows per item (runtime feeds the convergence loop,
   * ≤3 passes with hysteresis). Absent → blockPolicy minimums.
   */
  readonly measuredRows?: Readonly<Record<string, number>>;
  /**
   * E2 tenant responsive posture: where inside its OWN declared
   * `minSpan..maxSpan` range an item resolves before packing. A preference,
   * never a bound — the value is clamped to the contract range and then to the
   * tier capacity, so no bias can overflow, reorder, or open an avoidable
   * hole. Absent is `'preferred'`, the pre-capability behavior.
   */
  readonly spanBias?: AdaptiveSpanBias;
}

/** Where in its declared range an item resolves. See `AdaptiveLayoutEnv`. */
export type AdaptiveSpanBias = 'min' | 'preferred' | 'max';

export interface AdaptiveLayoutResult {
  readonly placements: readonly ResolvedPlacement[];
  /** Items excluded from render, with the reason (hidden intent or deferred). */
  readonly excluded: ReadonlyArray<{
    readonly itemId: string;
    readonly reason: 'hidden' | 'deferred';
  }>;
  /**
   * Machine-checkable law: holes the redistribution pass could have filled
   * MUST be zero. Unavoidable residue (nothing shrinkable/growable fits) is
   * reported separately and is legal.
   */
  readonly avoidableHoleCount: number;
  readonly unavoidableResidueCells: number;
}

/** Solver output → the two inline grid lines a cell stamps. */
export interface PlacementGridStyle {
  readonly gridColumn: string;
  readonly gridRow: string;
}

/**
 * Adapter for the legacy `WidgetBoardItem` size vocabulary (defect a/d/e):
 * sizes become honest span ranges; raw px heights become row hints exactly
 * once at the persistence migration, never at render.
 */
export const LEGACY_SIZE_SPANS: Record<
  'sm' | 'md' | 'lg' | 'wide',
  { min: number; preferred: number; max: number }
> = {
  sm: { min: 2, preferred: 3, max: 4 },
  md: { min: 3, preferred: 4, max: 6 },
  lg: { min: 4, preferred: 6, max: 8 },
  wide: { min: 6, preferred: 12, max: 12 },
};
