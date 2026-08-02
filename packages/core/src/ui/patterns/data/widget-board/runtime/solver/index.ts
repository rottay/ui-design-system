/**
 * Adaptive layout solver (C2) — the ONE deterministic placement engine for
 * WidgetBoard, DashboardSurface and every future adaptive composition.
 *
 * `resolveAdaptiveLayout(contracts, intents, env)` is a PURE function: no
 * DOM, no dates, no randomness, no observers. The runtime layer owns
 * measurement (one shared ResizeObserver per boundary, write→read batched in
 * rAF), memoization by input hash, FLIP continuity and persistence; the
 * solver owns geometry and explains every decision through
 * `ResolvedPlacement.reasons`.
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
 *
 * Hard hierarchy (in order): no-overlap/no-overflow > content and touch
 * minimums > DOM/focus coherence > a mode valid at the resolved size >
 * posture adaptation > stale preferences never reach render. Soft costs (in
 * order): avoidable holes > deviation from explicit preference > movement vs
 * the previous frame > unnecessary mode demotion > internal truncation.
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

const POSTURE_RANK: Record<ContainerPosture, number> = {
  compact: 0,
  standard: 1,
  expanded: 2,
};

function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

interface WorkItem {
  contract: AdaptiveItemContract;
  intent?: LayoutIntent;
  order: number;
  pinned: boolean;
  reasons: Set<PlacementReason>;
  colSpan: number;
  rowSpan: number;
  modeId: AdaptiveContentMode['id'];
}

function resolveRowSpan(
  contract: AdaptiveItemContract,
  measuredRows: Readonly<Record<string, number>> | undefined
): number {
  const measured = measuredRows?.[contract.id];
  const policy = contract.blockPolicy;
  if (policy.mode === 'fixed-bounded') return Math.max(1, policy.rows);
  if (policy.mode === 'fitted') {
    const base = measured ?? policy.minRows;
    return clampInt(base, policy.minRows, policy.maxRows);
  }
  const floor = policy.minRows ?? 1;
  return Math.max(floor, measured ?? floor);
}

function resolveMode(
  contract: AdaptiveItemContract,
  colSpan: number,
  posture: ContainerPosture,
  hint: AdaptiveContentMode['id'] | undefined,
  reasons: Set<PlacementReason>
): AdaptiveContentMode['id'] {
  const fits = (mode: AdaptiveContentMode): boolean =>
    mode.minSpan.cols <= colSpan &&
    (mode.minPosture === undefined ||
      POSTURE_RANK[posture] >= POSTURE_RANK[mode.minPosture]);
  if (hint) {
    const hinted = contract.contentModes.find((mode) => mode.id === hint);
    if (hinted && fits(hinted)) {
      reasons.add('intent-honored');
      return hinted.id;
    }
  }
  const chosen = contract.contentModes.find(fits);
  if (chosen) {
    if (chosen.id !== contract.contentModes[0]?.id) reasons.add('demoted-mode');
    return chosen.id;
  }
  // Nothing fits the resolved size: the last (most degraded) declared mode
  // still renders — hard hierarchy prefers a degraded mode over a hole.
  reasons.add('demoted-mode');
  return contract.contentModes[contract.contentModes.length - 1]?.id ?? 'summary';
}

/**
 * Resolve the adaptive layout. Pure and deterministic: identical inputs give
 * identical output, key order and all. See module docblock for the law
 * hierarchy this encodes.
 */
export function resolveAdaptiveLayout(
  contracts: readonly AdaptiveItemContract[],
  intents: readonly LayoutIntent[],
  env: AdaptiveLayoutEnv
): AdaptiveLayoutResult {
  const cols = Math.max(1, Math.floor(env.cols));
  const intentById = new Map<string, LayoutIntent>();
  for (const intent of intents) {
    // Unknown ids are stale/orphan preferences: they never reach render.
    if (contracts.some((contract) => contract.id === intent.itemId)) {
      intentById.set(intent.itemId, intent);
    }
  }

  const excluded: Array<{ itemId: string; reason: 'hidden' | 'deferred' }> = [];
  const work: WorkItem[] = [];
  contracts.forEach((contract, index) => {
    const intent = intentById.get(contract.id);
    if (intent && intent.visible === false) {
      excluded.push({ itemId: contract.id, reason: 'hidden' });
      return;
    }
    const reasons = new Set<PlacementReason>();
    const minCols = Math.max(1, contract.minSpan.cols);
    const maxCols = Math.max(minCols, contract.maxSpan.cols);
    // E2 span bias (door 2): the tenant posture chooses WHERE in the item's
    // own declared range it starts, never what that range is. `min`/`max` are
    // the range ends the contract already published, so the bias cannot widen
    // authority — an explicit spanHint below still overrides it entirely.
    const preferred = clampInt(contract.preferredSpan.cols, minCols, maxCols);
    const biased =
      env.spanBias === 'min'
        ? minCols
        : env.spanBias === 'max'
          ? maxCols
          : preferred;
    let target = biased;
    if (intent?.spanHint?.cols !== undefined) {
      const hinted = clampInt(intent.spanHint.cols, minCols, maxCols);
      if (hinted === intent.spanHint.cols) reasons.add('intent-honored');
      else reasons.add(hinted < intent.spanHint.cols ? 'clamped-max' : 'clamped-min');
      target = hinted;
    }
    // The tier capacity is a hard ceiling: a 12-col contract on a 4-col
    // tier resolves to 4, and on the collapsed 1-col tier everything is 1.
    if (target > cols) {
      target = Math.max(Math.min(minCols, cols), Math.min(target, cols));
      reasons.add('clamped-max');
    }
    let rowSpan = resolveRowSpan(contract, env.measuredRows);
    if (intent?.spanHint?.rows !== undefined) {
      const policy = contract.blockPolicy;
      const minRows =
        policy.mode === 'fixed-bounded'
          ? policy.rows
          : policy.mode === 'fitted'
            ? policy.minRows
            : policy.minRows ?? 1;
      const maxRows =
        policy.mode === 'fixed-bounded'
          ? policy.rows
          : policy.mode === 'fitted'
            ? policy.maxRows
            : Number.MAX_SAFE_INTEGER;
      rowSpan = clampInt(intent.spanHint.rows, Math.max(1, minRows), maxRows);
    }
    work.push({
      contract,
      intent,
      order: intent?.order ?? index,
      pinned: intent?.pinned ?? contract.pinned ?? false,
      reasons,
      colSpan: target,
      rowSpan,
      modeId: contract.contentModes[0]?.id ?? 'full',
    });
  });

  // Deterministic order: pinned first, then intent/DOM order, id tiebreak.
  work.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.order !== b.order) return a.order - b.order;
    return a.contract.id < b.contract.id ? -1 : 1;
  });

  // Posture pressure valve (deterministic, explainable): on a COMPACT
  // container, secondary items degrade by their own declared policy —
  // `hide-secondary` leaves render entirely (reason 'deferred');
  // `defer` keeps rendering but yields its position to the end of the
  // board. Critical and primary items are never touched, and no policy
  // fires outside the compact posture.
  if (env.posture === 'compact') {
    for (let index = work.length - 1; index >= 0; index -= 1) {
      const item = work[index];
      if (item.contract.priority !== 'secondary') continue;
      if (item.contract.overflowPolicy === 'hide-secondary') {
        excluded.push({ itemId: item.contract.id, reason: 'deferred' });
        work.splice(index, 1);
      }
    }
    const deferred = work.filter(
      (item) =>
        item.contract.priority === 'secondary' &&
        item.contract.overflowPolicy === 'defer'
    );
    if (deferred.length > 0) {
      const kept = work.filter((item) => !deferred.includes(item));
      for (const item of deferred) item.reasons.add('deferred');
      work.length = 0;
      work.push(...kept, ...deferred);
    }
  }

  // Row-major skyline WITHOUT backfill: rows are filled strictly in item
  // order, so the row-major visual order always equals DOM/focus order —
  // for every item, not only `forbid` ones (v1 keeps the strongest form of
  // defect (c)'s fix; `visualReorder: 'allow'` becomes meaningful when a
  // future wave adds opt-in hole-filling).
  interface Row {
    items: WorkItem[];
    used: number;
    rowStart: number;
  }
  const itemPlacements = new Map<
    string,
    { colStart: number; colSpan: number; rowStart: number; rowSpan: number }
  >();
  const rows: Row[] = [];
  let current: Row = { items: [], used: 0, rowStart: 1 };

  const closeRow = (): void => {
    if (current.items.length === 0) return;
    let residue = cols - current.used;
    if (residue > 0) {
      // Redistribute the residue under maxSpan, left to right (defect d).
      for (const item of current.items) {
        if (residue === 0) break;
        const growable = Math.min(
          residue,
          Math.max(0, Math.min(cols, item.contract.maxSpan.cols) - item.colSpan)
        );
        if (growable > 0) {
          item.colSpan += growable;
          item.reasons.add('grown-to-fill');
          residue -= growable;
        }
      }
    }
    // Assign col starts sequentially now that spans are final.
    let cursor = 1;
    for (const item of current.items) {
      itemPlacements.set(item.contract.id, {
        colStart: cursor,
        colSpan: item.colSpan,
        rowStart: current.rowStart,
        rowSpan: item.rowSpan,
      });
      cursor += item.colSpan;
    }
    const height = Math.max(...current.items.map((item) => item.rowSpan));
    rows.push(current);
    current = { items: [], used: 0, rowStart: current.rowStart + height };
  };

  for (const item of work) {
    const remaining = cols - current.used;
    if (item.colSpan > remaining && current.items.length > 0) {
      // Soft-cost order: before accepting a hole, try shrinking THIS item
      // toward its minimum so it completes the row (shrink beats hole).
      const minCols = Math.min(cols, Math.max(1, item.contract.minSpan.cols));
      if (
        item.contract.overflowPolicy === 'shrink-to-min' &&
        minCols <= remaining
      ) {
        item.colSpan = remaining;
        item.reasons.add('shrunk-to-fit');
      } else {
        closeRow();
      }
    }
    item.colSpan = Math.min(item.colSpan, cols);
    current.items.push(item);
    current.used += item.colSpan;
    if (current.used >= cols) closeRow();
  }
  closeRow();

  // Independent hole audit — NOT the placement code grading itself: a row's
  // trailing residue is AVOIDABLE exactly when some member still sits under
  // its own maxSpan (the redistribution pass must have filled it), otherwise
  // it is legal unavoidable residue.
  let avoidableHoleCount = 0;
  let unavoidableResidueCells = 0;
  for (const row of rows) {
    const used = row.items.reduce((sum, item) => sum + item.colSpan, 0);
    const residue = cols - used;
    if (residue <= 0) continue;
    const anyUnderMax = row.items.some(
      (item) => item.colSpan < Math.min(cols, item.contract.maxSpan.cols)
    );
    if (anyUnderMax) avoidableHoleCount += residue;
    else unavoidableResidueCells += residue;
  }

  const placements: ResolvedPlacement[] = work.map((item) => {
    const cell = itemPlacements.get(item.contract.id)!;
    const modeId = resolveMode(
      item.contract,
      cell.colSpan,
      env.posture,
      item.intent?.modeHint,
      item.reasons
    );
    return {
      itemId: item.contract.id,
      colStart: cell.colStart,
      colSpan: cell.colSpan,
      rowStart: cell.rowStart,
      rowSpan: cell.rowSpan,
      modeId,
      posture: env.posture,
      reasons: [...item.reasons].sort(),
    };
  });

  return {
    placements,
    excluded,
    avoidableHoleCount,
    unavoidableResidueCells,
  };
}

/**
 * Container width → posture bucket. Bucketized so per-pixel resizes never
 * recompute a layout: the runtime re-solves only when `cols` or the posture
 * bucket actually change.
 */
export function resolveContainerPosture(
  widthPx: number,
  profile: Pick<ResponsivePostureProfile, 'thresholds'>
): ContainerPosture {
  if (widthPx <= profile.thresholds.compactMaxPx) return 'compact';
  if (widthPx <= profile.thresholds.standardMaxPx) return 'standard';
  return 'expanded';
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
