/**
 * Surface posture contract: the app-owned, per-device configuration every
 * surface accepts.
 *
 * A posture declares which named regions render, collapse or hide, the
 * navigation mode, the density and the primary action placement, keyed by
 * viewport posture (`phone | tablet | desktop`, the same bands as
 * `useResponsive().deviceClass`). The app owns these declarations per screen
 * (consumer contract, level 2); they are never a tenant decision.
 *
 * Resolution is pure and keyed by the resolved viewport posture alone — the
 * responsive runtime (WO-INV-04) supplies that posture from the SSR hint, so
 * the server renders the phone posture on a phone request with no client
 * measurement involved.
 */

import type { ViewportPosture } from '@/foundation/contracts/kernel/adaptation/foundation';
import type { DensityPosture } from '@/infrastructure/runtime/foundation/density';

/** What a named surface region does under a posture. */
export type SurfaceRegionDisposition = 'render' | 'collapse' | 'hide';

/** How app-level navigation is presented under a posture. */
export type SurfaceNavigationMode = 'sidebar' | 'bottom-bar' | 'drawer';

/** Where the surface's primary action lives under a posture. */
export type PrimaryActionPlacement = 'app-bar' | 'bottom-bar' | 'floating';

/** App-declared posture for one viewport band. Every field is optional. */
export interface SurfacePostureDeclaration {
  /**
   * Per-region disposition by region name. `hide` drops the region from the
   * render output entirely (no markup on any paint), `collapse` keeps the
   * region landmark without its content, `render` shows it.
   */
  readonly regions?: Readonly<Record<string, SurfaceRegionDisposition>>;
  readonly navigation?: SurfaceNavigationMode;
  readonly density?: DensityPosture;
  readonly primaryAction?: PrimaryActionPlacement;
}

/**
 * The `postures` prop every surface accepts. Each band is a delta over the
 * surface family's own defaults; an omitted band resolves to the family
 * default alone.
 */
export type SurfacePostures = Partial<Record<ViewportPosture, SurfacePostureDeclaration>>;

/** Surface families with posture defaults in this contract. */
export type SurfaceFamily = 'app-shell' | 'list' | 'record' | 'workspace' | 'form';

/** The posture in force for one rendered surface. */
export interface ResolvedSurfacePosture {
  readonly viewport: ViewportPosture;
  readonly regions: Readonly<Record<string, SurfaceRegionDisposition>>;
  readonly navigation: SurfaceNavigationMode | undefined;
  readonly density: DensityPosture | undefined;
  readonly primaryAction: PrimaryActionPlacement | undefined;
}

/**
 * The family's neutral baseline per viewport band. Region hiding is
 * application composition, so no default hides a region; the shell family's
 * navigation defaults are the one product decision here (bottom bar on
 * phone, overlay drawer on tablet, track on desktop).
 */
export const DEFAULT_SURFACE_POSTURES: Readonly<Record<SurfaceFamily, SurfacePostures>> =
  Object.freeze({
    'app-shell': {
      phone: { navigation: 'bottom-bar', primaryAction: 'bottom-bar' },
      tablet: { navigation: 'drawer' },
      desktop: { navigation: 'sidebar', primaryAction: 'app-bar' },
    },
    list: {
      phone: { primaryAction: 'bottom-bar' },
      desktop: { primaryAction: 'app-bar' },
    },
    record: {
      phone: { primaryAction: 'bottom-bar' },
    },
    workspace: {
      phone: { navigation: 'drawer' },
    },
    form: {},
  });

/**
 * Resolve the posture in force at one viewport band. The app declaration is
 * a delta over the family default for the same band; region dispositions
 * merge by name, scalars override.
 */
export function resolveSurfacePostures(
  postures: SurfacePostures | undefined,
  viewport: ViewportPosture,
  family: SurfaceFamily = 'list',
): ResolvedSurfacePosture {
  const declared = postures?.[viewport];
  const defaults = DEFAULT_SURFACE_POSTURES[family][viewport];

  return {
    viewport,
    regions: { ...defaults?.regions, ...declared?.regions },
    navigation: declared?.navigation ?? defaults?.navigation,
    density: declared?.density ?? defaults?.density,
    primaryAction: declared?.primaryAction ?? defaults?.primaryAction,
  };
}
