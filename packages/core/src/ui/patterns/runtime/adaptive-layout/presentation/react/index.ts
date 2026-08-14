'use client';

/**
 * Shared adaptive runtime (C2b) — the ONE owner of environment derivation,
 * epoch invalidation, container measurement and the persistence gate for
 * adaptive compositions.
 *
 * Division of law: `../../foundation` declares the vocabulary, `../../runtime`
 * is pure geometry, and THIS module owns everything environmental — a REAL
 * `layoutEpoch` slice derived from direction, locale, effective density
 * posture, the live `--ds-type-scale` value, font readiness and the tenant
 * artifact revision; container-first posture measurement through one
 * ResizeObserver per boundary; and the versioned persistence gate.
 *
 * Consumers own only their OWN geometry adapter: WidgetBoard's board hook
 * (`patterns/data/widget-board/runtime/adaptive/react`) adds the board's
 * per-cell measurement and CSS-co-authored tier ladder, DashboardSurface
 * packs sections with `useContainerPosture` — neither derives environment,
 * re-implements the posture ladder, or reaches into the other's internals.
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
import { TenantContext } from '@/infrastructure/runtime/tenant/foundation/context';
import {
  resolveResponsivePosture,
  type ResponsivePostureDefinition,
} from '@/foundation/tokens/ts/presentation/responsive-postures';

import type {
  ContainerPosture,
  LayoutIntent,
  LayoutProfileRevision,
  ResponsivePostureProfile,
} from '../../foundation';
import { resolveContainerPosture } from '../../runtime';

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
 * Every adaptive consumer — WidgetBoard's board hook, DashboardSurface
 * packing — reads THIS hook; none derives environment on its own.
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
