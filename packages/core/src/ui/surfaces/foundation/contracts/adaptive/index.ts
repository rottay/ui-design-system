/**
 * @fileoverview Adaptive surface contracts.
 *
 * Typed posture declarations that surfaces use to describe their
 * breakpoint-aware behavior. Instead of scattering media queries and
 * isMobile checks, surfaces declare their posture transforms here
 * and the runtime resolves them.
 *
 * Three contract levels:
 * - AdaptivePosture: the resolved behavior for the current breakpoint
 * - AdaptiveConfig: the full declaration (phone + tablet + desktop)
 * - useAdaptivePosture(): hook that resolves config -> posture
 */

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
  /** Form section navigation layout. */
  formLayout?: FormSectionLayout;
  /** Supporting pane (sidebar, preview rail) behavior. */
  pane?: PanePosture;
  /** Action bar positioning. */
  actionBar?: ActionBarPosture;
  /** Filter presentation. */
  filters?: FilterPosture;
  /** In-surface navigation. */
  nav?: NavPosture;
  /** Whether the header collapses to compact mode. */
  compactHeader?: boolean;
  /** Number of grid columns (for dashboards, card grids). */
  gridColumns?: number;
  /** Custom flags for app-specific posture decisions. */
  custom?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Adaptive config (declared by consumers)
// ---------------------------------------------------------------------------

/**
 * Full adaptive configuration declared on a surface.
 *
 * Each breakpoint key is optional. Missing breakpoints inherit
 * from the next larger breakpoint (phone <- tablet <- desktop).
 *
 * @example
 * ```ts
 * const adaptive: AdaptiveConfig = {
 *   desktop: { collection: 'table', pane: 'inline', filters: 'inline' },
 *   tablet: { collection: 'table', pane: 'sheet', filters: 'dropdown' },
 *   // `route` opens the dedicated record destination. Use `hidden` when the
 *   // supporting pane should disappear without introducing navigation.
 *   phone: { collection: 'cards', pane: 'route', filters: 'sheet', compactHeader: true },
 * };
 * ```
 */
export interface AdaptiveConfig {
  desktop?: SurfacePosture;
  tablet?: SurfacePosture;
  phone?: SurfacePosture;
}

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

/** Breakpoint key as detected by useBreakpoints(). */
export type Breakpoint = 'phone' | 'tablet' | 'desktop';

/**
 * Resolves an AdaptiveConfig into a single SurfacePosture for the
 * current breakpoint. Cascades: phone <- tablet <- desktop.
 */
export function resolvePosture(
  config: AdaptiveConfig | undefined,
  breakpoint: Breakpoint,
): SurfacePosture {
  if (!config) return {};

  const desktop = config.desktop ?? {};
  const tablet = { ...desktop, ...config.tablet };
  const phone = { ...tablet, ...config.phone };

  switch (breakpoint) {
    case 'phone':
      return phone;
    case 'tablet':
      return tablet;
    case 'desktop':
    default:
      return desktop;
  }
}

/**
 * Maps useBreakpoints() booleans to a Breakpoint key.
 */
export function toBreakpoint(flags: {
  isMobile: boolean;
  isTablet: boolean;
}): Breakpoint {
  if (flags.isMobile) return 'phone';
  if (flags.isTablet) return 'tablet';
  return 'desktop';
}
