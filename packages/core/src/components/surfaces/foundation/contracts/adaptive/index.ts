/**
 * @fileoverview Adaptive surface contracts.
 *
 * Typed posture declarations a surface uses to describe its breakpoint-aware
 * behaviour. Instead of scattering media queries and `isMobile` checks, a
 * surface declares its posture per step and the one responsive runtime
 * resolves it.
 *
 * ONE MECHANISM. This owner used to declare `AdaptiveConfig` -- a
 * `{ desktop, tablet, phone }` object with a desktop-first merging cascade of
 * its own -- and `useAdaptivePosture`, a hook that read the viewport itself.
 * That was a second responsive vocabulary and a second responsive authority
 * beside `ResponsiveValue` and `useResponsiveValue`. The declaration is now a
 * `ResponsiveValue` on the one ladder, and resolution is pure, so a surface
 * measuring its own CONTAINER resolves the same declaration through the same
 * function a viewport consumer uses.
 */

import {
  RESPONSIVE_BREAKPOINT_ORDER,
  type ResponsiveBreakpointKey,
} from '@/foundation/contracts/kernel/responsive/breakpoints';
import {
  isResponsiveValue,
  normalizeResponsiveValue,
  type ResponsiveValueObject,
} from '@/foundation/contracts/kernel/responsive/values';

// ---------------------------------------------------------------------------
// Posture values
// ---------------------------------------------------------------------------

/** How a collection surface renders its primary data. */
export type CollectionPosture = 'table' | 'cards' | 'list' | 'board';

/** How a form surface lays out its section navigation. */
export type FormSectionLayout = 'sidebar-nav' | 'pill-nav' | 'dropdown-nav' | 'stacked';

/**
 * How a supporting pane (sidebar, preview rail) is presented.
 *
 * `route` delegates the supporting content to a dedicated destination when the
 * record is activated. `hidden` only suppresses the pane and carries no
 * navigation semantics.
 */
export type PanePosture = 'inline' | 'sheet' | 'accordion' | 'route' | 'hidden';

/** How the action bar is positioned. */
export type ActionBarPosture = 'inline' | 'sticky-bottom' | 'floating';

/** How filters are shown. */
export type FilterPosture = 'inline' | 'sheet' | 'dropdown';

/** How navigation within a surface works. */
export type NavPosture = 'tabs' | 'dropdown' | 'pills' | 'accordion';

// ---------------------------------------------------------------------------
// Posture per breakpoint
// ---------------------------------------------------------------------------

/** Resolved posture for a single breakpoint. */
export interface SurfacePosture {
  /** Data collection posture. */
  collection?: CollectionPosture;
  /**
   * Fixed column count used when the resolved collection posture is `cards`.
   * Values outside the bounded 1..6 integer range fail closed at resolution.
   */
  gridColumns?: number;
  /** Form section navigation layout. */
  formLayout?: FormSectionLayout;
  /** Supporting pane (sidebar, preview rail) behavior. */
  pane?: PanePosture;
  /** Action bar positioning. */
  actionBar?: ActionBarPosture;
  /** Filter presentation. */
  filters?: FilterPosture;
  /** Whether the header collapses to compact mode. */
  compactHeader?: boolean;
}

// ---------------------------------------------------------------------------
// Adaptive declaration
// ---------------------------------------------------------------------------

/**
 * A posture declared per breakpoint, mobile-first.
 *
 * Steps MERGE upward: a step inherits every field declared at or below it and
 * overrides only what it restates. Device aliases (`phone`, `tablet`,
 * `desktop`) and the canonical steps are the same ladder, so both spellings are
 * accepted and mean the same thing.
 *
 * @example
 * ```ts
 * const adaptive: SurfaceAdaptivePosture = {
 *   // `route` opens the dedicated record destination. Use `hidden` when the
 *   // supporting pane should disappear without introducing navigation.
 *   phone: { collection: 'cards', pane: 'route', filters: 'sheet', compactHeader: true },
 *   tablet: { collection: 'table', pane: 'sheet', filters: 'dropdown' },
 *   desktop: { collection: 'table', pane: 'inline', filters: 'inline' },
 * };
 * ```
 */
export type SurfaceAdaptivePosture = ResponsiveValueObject<SurfacePosture>;

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

function withBoundedGridColumns(posture: SurfacePosture): SurfacePosture {
  if (posture.gridColumns === undefined) return posture;

  if (
    typeof posture.gridColumns === 'number'
    && Number.isInteger(posture.gridColumns)
    && posture.gridColumns >= 1
    && posture.gridColumns <= 6
  ) {
    return posture;
  }

  const normalized = { ...posture };
  delete normalized.gridColumns;
  return normalized;
}

/**
 * Resolves a declared posture at one breakpoint. Pure: the caller supplies the
 * step, so a viewport consumer and a container-measured one share it.
 */
export function resolveSurfacePosture(
  declaration: SurfaceAdaptivePosture | undefined,
  breakpoint: ResponsiveBreakpointKey,
): SurfacePosture {
  if (!declaration || !isResponsiveValue<SurfacePosture>(declaration)) return {};

  const byStep = normalizeResponsiveValue(declaration);
  const activeIndex = RESPONSIVE_BREAKPOINT_ORDER.indexOf(breakpoint);
  const upTo = activeIndex < 0 ? RESPONSIVE_BREAKPOINT_ORDER.length - 1 : activeIndex;

  let resolved: SurfacePosture = {};
  for (let step = 0; step <= upTo; step += 1) {
    const declared = byStep[RESPONSIVE_BREAKPOINT_ORDER[step]];
    if (declared) resolved = { ...resolved, ...declared };
  }

  return withBoundedGridColumns(resolved);
}
