'use client';

/**
 * Shared adaptive runtime (C2b) — the ONE owner of measurement, epoch
 * invalidation and solving for adaptive boards.
 *
 * Division of law: the SOLVER (`../solver`) is pure geometry; THIS module
 * owns everything environmental — one ResizeObserver per board container
 * (grid width → tier/posture AND per-cell intrinsic rows through the same
 * observer instance), a REAL `layoutEpoch` derived from direction, locale,
 * effective density posture, the live `--ds-type-scale` value, font
 * readiness and the container tier, bounded re-measure convergence (≤3
 * passes per epoch, with span hysteresis — an unchanged span never
 * re-enters), and the versioned persistence gate. Consumers (WidgetBoard
 * today, any future composition) receive resolved placements and never
 * observe, measure or memo on their own.
 */
import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { RefObject } from 'react';

import { I18nContext } from '@/infrastructure/runtime/i18n/runtime/context/provider';
import { useDensity } from '@/infrastructure/runtime/foundation/density';
import { TenantContext } from '@/infrastructure/runtime/tenant/composition/react/provider';
import {
  resolveResponsivePosture,
  type ResponsivePostureDefinition,
} from '@/foundation/tokens/ts/presentation/responsive-postures';

import type { WidgetBoardItem } from '../../../contracts';
import type {
  ContainerPosture,
  LayoutIntent,
  LayoutProfileRevision,
  ResolvedPlacement,
  ResponsivePostureProfile,
} from '..';
import { resolveAdaptiveLayout, resolveContainerPosture } from '..';
import { placementsToGridStyles, widgetItemsToAdaptiveInputs } from '../policy';
import type { PlacementGridStyle } from '../policy';

export type BoardCollapseTier = 'full' | 'mid' | 'single';

const TIER_COLS: Record<BoardCollapseTier, number> = {
  full: 12,
  mid: 6,
  single: 1,
};

const MAX_MEASURE_PASSES = 3;

function readTypeScale(): string {
  if (typeof document === 'undefined') return '1';
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue('--ds-type-scale')
    .trim();
  return value.length > 0 ? value : '1';
}

/**
 * PURE derivation of the active responsive posture from a tenant
 * configuration — the single source every adaptive consumer shares, mirroring
 * `resolveActiveIconExpressiveProfile`. Precedence is the canon: the DB
 * appearance (`advanced.responsivePosture`, carried verbatim in the compiled
 * artifact's normalizedAppearance) beats the static BrandTheme selection.
 *
 * Resolution is fail-closed and TOTAL: an absent, unknown, malformed or
 * foreign-schema id yields `rottay/standard-posture@1`, whose thresholds are
 * literally the 639/839 pair this runtime hardcoded before the axis opened.
 * Absent is therefore byte-for-byte the pre-capability ladder, which is what
 * makes "unset it" a true rollback.
 */
export function resolveActiveResponsivePosture(
  config: { appearance?: unknown; brandTheme?: unknown } | null | undefined
): ResponsivePostureDefinition {
  const appearance = config?.appearance as
    | { advanced?: { responsivePosture?: string } }
    | undefined;
  const fromDocument = appearance?.advanced?.responsivePosture;
  if (fromDocument !== undefined) return resolveResponsivePosture(fromDocument);
  const selection = (
    config?.brandTheme as
      | { responsive?: { posture?: string; schemaVersion?: number } }
      | undefined
  )?.responsive;
  return resolveResponsivePosture(selection?.posture, selection?.schemaVersion);
}

/**
 * The ONE context read of the active ladder. Every adaptive consumer resolves
 * its thresholds through this hook; none reads a breakpoint constant.
 */
export function useActiveResponsivePosture(): ResponsivePostureDefinition {
  const tenant = useContext(TenantContext);
  const config = tenant?.config;
  return useMemo(() => resolveActiveResponsivePosture(config), [config]);
}

export interface AdaptiveEnvironment {
  readonly direction: 'ltr' | 'rtl';
  readonly locale: string;
  readonly densityPosture: string;
  readonly densityFactor: number;
  readonly typeScale: number;
  readonly typeScaleRaw: string;
  readonly fontsEpoch: number;
  readonly artifactRevision: number;
  /** Active container ladder (E2 tenant axis); baseline when unset. */
  readonly posture: ResponsivePostureDefinition;
  /** Environmental slice of any consumer's layout epoch. */
  readonly envEpoch: string;
}

/**
 * The ONE derivation of the adaptive environment (C2c): direction and locale
 * from the i18n context, effective density, the LIVE `--ds-type-scale`
 * computed value, a font-loading epoch that also counts `loadingdone` (late
 * subsets after a locale switch), and the tenant artifact revision (a config
 * identity change is metrics-changing even when density and locale hold).
 * Every adaptive consumer — WidgetBoard's runtime, DashboardSurface packing —
 * reads THIS hook; none derives environment on its own.
 */
export function useAdaptiveEnvironment(): AdaptiveEnvironment {
  const i18n = useContext(I18nContext);
  const direction: 'ltr' | 'rtl' = i18n?.direction === 'rtl' ? 'rtl' : 'ltr';
  const locale = i18n?.locale ?? 'en';
  const density = useDensity();
  const posture = useActiveResponsivePosture();
  const [typeScaleRaw, setTypeScaleRaw] = useState('1');
  const [fontsEpoch, setFontsEpoch] = useState(0);

  const tenant = useContext(TenantContext);
  const revisionRef = useRef<{ config: unknown; revision: number }>({
    config: tenant?.config,
    revision: 0,
  });
  if (revisionRef.current.config !== tenant?.config) {
    revisionRef.current = {
      config: tenant?.config,
      revision: revisionRef.current.revision + 1,
    };
  }
  const artifactRevision = revisionRef.current.revision;

  useEffect(() => {
    if (typeof document === 'undefined' || !('fonts' in document)) {
      setFontsEpoch(1);
      return;
    }
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setFontsEpoch((count) => count + 1);
    });
    const onLoadingDone = () => setFontsEpoch((count) => count + 1);
    document.fonts.addEventListener('loadingdone', onLoadingDone);
    return () => {
      cancelled = true;
      document.fonts.removeEventListener('loadingdone', onLoadingDone);
    };
  }, []);

  useEffect(() => {
    setTypeScaleRaw(readTypeScale());
  }, [fontsEpoch, density.posture, artifactRevision]);

  const densityFactor =
    density.posture === 'compact' ? 0.85 : density.posture === 'spacious' ? 1.15 : 1;

  return {
    direction,
    locale,
    densityPosture: density.posture,
    densityFactor,
    typeScale: Number.parseFloat(typeScaleRaw) || 1,
    typeScaleRaw,
    fontsEpoch,
    artifactRevision,
    posture,
    // The ladder needs no slot of its own in the epoch: it is derived from the
    // tenant config, and `artifactRevision` already increments on every config
    // identity change. A live posture swap therefore invalidates measurements
    // and saved layouts for free, through the same door a palette swap uses.
    envEpoch: `${direction}:${locale}:${density.posture}:${typeScaleRaw}:f${fontsEpoch}:r${artifactRevision}`,
  };
}

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

/**
 * Versioned persistence gate (fail-closed): a stored revision only yields
 * intents when its schema version is supported AND it was written against
 * the CURRENT catalog revision; otherwise the whole revision is discarded
 * (baseline layout) rather than partially applied. Orphan item ids are
 * additionally dropped by the solver itself.
 */
export function normalizeLayoutRevision(
  revision: unknown,
  currentCatalogRevision: string
): readonly LayoutIntent[] {
  if (typeof revision !== 'object' || revision === null) return [];
  const candidate = revision as Partial<LayoutProfileRevision>;
  if (candidate.schemaVersion !== 1) return [];
  if (candidate.baseCatalogRevision !== currentCatalogRevision) return [];
  if (!Array.isArray(candidate.intents)) return [];
  return candidate.intents.filter(
    (intent): intent is LayoutIntent =>
      typeof intent === 'object' &&
      intent !== null &&
      typeof (intent as LayoutIntent).itemId === 'string' &&
      typeof (intent as LayoutIntent).order === 'number' &&
      typeof (intent as LayoutIntent).visible === 'boolean'
  );
}

/**
 * Container-first posture for any adaptive consumer that has no board grid
 * of its own (DashboardSurface's packed sections). One ResizeObserver per
 * container; when the environment cannot measure (SSR, jsdom), the caller's
 * fallback posture governs — measurement upgrades it, never downgrades to a
 * guess.
 *
 * E2: with no explicit `thresholds` the ladder comes from the tenant's active
 * responsive posture instead of a constant, so the axis reaches every consumer
 * that never asked for one. An explicit argument still wins — the caller-props
 * law applies to thresholds exactly as it does to recipe defaults.
 */
export function useContainerPosture(
  containerRef: RefObject<HTMLElement | null>,
  fallback: ContainerPosture,
  thresholds?: ResponsivePostureProfile['thresholds']
): ContainerPosture {
  const active = useActiveResponsivePosture();
  const { compactMaxPx, standardMaxPx } = thresholds ?? active.thresholds;
  const [measured, setMeasured] = useState<ContainerPosture | null>(null);
  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width <= 0) continue;
        const next = resolveContainerPosture(width, {
          thresholds: { compactMaxPx, standardMaxPx },
        });
        setMeasured((current) => (current === next ? current : next));
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [containerRef, compactMaxPx, standardMaxPx]);
  return measured ?? fallback;
}
