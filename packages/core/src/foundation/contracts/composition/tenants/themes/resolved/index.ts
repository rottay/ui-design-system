/**
 * @fileoverview Resolved-theme contracts: provenance, floors and the envelope.
 * @description What the merge destroys, carried beside the resolved `Theme`.
 *
 * @module Contracts/Themes/Resolved
 * @category Types
 * @package @rottay/design-system
 */

import type {
  BrandMotion,
  BrandSurfaces,
  BrandTheme,
  BrandThemeMode,
  BrandTypography,
} from "..";
import type { ThemeIntent } from "../intent";
import type { TenantAuthoredPaths, Theme, ThemePatch } from "../iso";
import { collectPatchAuthoredPaths } from "../iso";

/**
 * The tone vocabulary the status-seed producers key on. Restated as literals
 * because the runtime copy lives in `infrastructure/compilers` and a foundation
 * contract cannot import it; the contract-freeze harness asserts the equality.
 */
export const RESOLVED_TONE_ROLES = ["success", "warning", "error", "info"] as const;
export type ResolvedToneRole = (typeof RESOLVED_TONE_ROLES)[number];

/**
 * The tenant's posture floors: exactly the keypaths `tenantPostureFloors`
 * projects, spelled out rather than aliased to `Partial<BrandTheme>` so the
 * type states what a floor can carry and no reader can mutate one.
 */
export interface ThemeFloors {
  readonly typography?: {
    readonly typePairing?: BrandTypography["typePairing"];
    readonly scale?: BrandTypography["scale"];
    readonly fontFamilyBase?: BrandTypography["fontFamilyBase"];
    readonly fontFamilyHeading?: BrandTypography["fontFamilyHeading"];
  };
  readonly surfaces?: {
    readonly buttonStyle?: BrandSurfaces["buttonStyle"];
    readonly radiusScale?: BrandSurfaces["radiusScale"];
    readonly density?: BrandSurfaces["density"];
    readonly elevation?: BrandSurfaces["elevation"];
  };
  readonly motion?: BrandMotion;
}

/**
 * Whether the tenant's own patch carried each status seed. A sibling of
 * `tenantPatch`, never a widening of it: the floor excludes `palette` and
 * `modes` by design, so it can never answer this question.
 */
export interface TenantStatusSeedAuthorship {
  /** Whether the BASE block's own patch carries this tone's seed. */
  readonly base: Readonly<Record<ResolvedToneRole, boolean>>;
  /** Whether EACH mode overlay's own patch carries this tone's seed. */
  readonly modes: Readonly<
    Partial<Record<BrandThemeMode, Readonly<Record<ResolvedToneRole, boolean>>>>
  >;
}

/**
 * What the merge destroys: whose a value is. Computed from the raw patch
 * BEFORE resolution, because a resolved Theme cannot answer the question.
 */
export interface ThemeProvenance {
  /**
   * False means "not a tenant": the lowering passes no provenance and the
   * compiler reproduces today's bytes. A boolean rather than object identity,
   * which does not survive a second module instance or any transport.
   */
  readonly tenantAuthored: boolean;
  readonly authoredPaths: TenantAuthoredPaths;
  readonly floors: ThemeFloors;
  readonly statusSeedAuthorship: TenantStatusSeedAuthorship;
}

/**
 * The resolved envelope: `provenance` is a sibling of `theme`, never inside it.
 *
 * Named `ThemeResolution` rather than `ResolvedTheme` because
 * `entrypoints/server` already publishes `ResolvedTheme` as the light/dark
 * colour scheme; redefining a published name is the one change a consumer
 * cannot see.
 */
export interface ThemeResolution {
  readonly theme: Theme;
  readonly provenance: ThemeProvenance;
  /** Retained for diagnostics and gates; the lowering never reads it. */
  readonly intent?: ThemeIntent;
}


/**
 * A `ReadonlySet` view over a private copy of `values`.
 *
 * `Object.freeze(new Set())` still accepts `.add`, because Set mutation goes
 * through internal slots rather than properties. Snapshotting into closed-over
 * storage and exposing only the read surface is the only way to hand out a set
 * a caller can neither grow nor drain.
 */
function immutableAuthoredPaths(values: Iterable<string>): TenantAuthoredPaths {
  const stored = new Set(values);
  const view = Object.freeze({
    get size() {
      return stored.size;
    },
    has: (value: string) => stored.has(value),
    keys: () => stored.keys(),
    values: () => stored.values(),
    entries: () => stored.entries(),
    forEach: (
      callback: (value: string, value2: string, set: TenantAuthoredPaths) => void,
      thisArg?: unknown
    ) => {
      for (const value of stored) callback.call(thisArg, value, value, view);
    },
    [Symbol.iterator]: () => stored[Symbol.iterator](),
  });
  return view;
}

function freezeFloors(floors: ThemeFloors): ThemeFloors {
  return Object.freeze({
    typography: floors.typography && Object.freeze({ ...floors.typography }),
    surfaces: floors.surfaces && Object.freeze({ ...floors.surfaces }),
    motion: floors.motion && Object.freeze({ ...floors.motion }),
  });
}

function freezeAuthorship(
  authorship: TenantStatusSeedAuthorship
): TenantStatusSeedAuthorship {
  const modes: Partial<
    Record<BrandThemeMode, Readonly<Record<ResolvedToneRole, boolean>>>
  > = {};
  for (const mode of Object.keys(authorship.modes) as BrandThemeMode[]) {
    const tones = authorship.modes[mode];
    modes[mode] = tones && Object.freeze({ ...tones });
  }
  return Object.freeze({
    base: Object.freeze({ ...authorship.base }),
    modes: Object.freeze(modes),
  });
}

/** "Not a tenant." Compiling with this must reproduce today's bytes exactly. */
export const EMPTY_PROVENANCE: ThemeProvenance = Object.freeze({
  tenantAuthored: false,
  authoredPaths: immutableAuthoredPaths([]),
  floors: Object.freeze({}),
  statusSeedAuthorship: Object.freeze({
    base: Object.freeze({ success: false, warning: false, error: false, info: false }),
    modes: Object.freeze({}),
  }),
});

/**
 * The tenant-authored provenance for one raw patch, snapshotted so that later
 * mutation of the caller's patch — or of anything reachable from the returned
 * value — cannot change what a subsequent compile sees.
 */
export function tenantProvenance(patch: ThemePatch): ThemeProvenance {
  return Object.freeze({
    tenantAuthored: true,
    authoredPaths: immutableAuthoredPaths(collectPatchAuthoredPaths(patch)),
    floors: freezeFloors(tenantPostureFloors(patch)),
    statusSeedAuthorship: freezeAuthorship(deriveTenantStatusSeedAuthorship(patch)),
  });
}

/**
 * The tenant's posture floors, projected out of a migrated patch. Exported so
 * the DB leg and anything reconstructing it read one definition.
 *
 * Only the scalars `resolveTenantPosture` reads cross; `undefined` leaves cost
 * nothing, because the merge skips them and an all-undefined posture collapses
 * to `undefined`. `expressive.*` is deliberately absent: it is expanded and
 * applied at its own position, and routing it here would lower one selection
 * twice.
 *
 * `motion` arrives either wrapped (`Governed<BrandMotion>` on a migrated patch)
 * or bare (on a leaf-built probe patch). The posture reader consults
 * `patch.motion` as-is and never unwraps, so the unwrap has to happen here.
 */
export function tenantPostureFloors(patch: ThemePatch): ThemeFloors {
  const ty = patch.typography;
  const su = patch.surfaces;
  const mo = patch.motion;
  return {
    typography: {
      typePairing: ty?.typePairing,
      scale: ty?.scale,
      fontFamilyBase: ty?.fontFamilyBase,
      fontFamilyHeading: ty?.fontFamilyHeading,
    },
    surfaces: {
      buttonStyle: su?.buttonStyle,
      radiusScale: su?.radiusScale,
      density: su?.density,
      elevation: su?.elevation,
    },
    motion: (mo?.value ?? mo) as BrandMotion | undefined,
  };
}

/**
 * Whether the tenant's own patch carries each status seed, read from the raw
 * patch VALUE and never from `authoredPaths` membership: the migrated patch
 * always constructs all four `{tone}Color` keys, so membership cannot tell a
 * tenant's choice from the builder's construction.
 */
export function deriveTenantStatusSeedAuthorship(
  patch: ThemePatch
): TenantStatusSeedAuthorship {
  const toneRecord = (
    palette: ThemePatch["palette"]
  ): Record<ResolvedToneRole, boolean> =>
    Object.fromEntries(
      RESOLVED_TONE_ROLES.map((role) => [
        role,
        palette?.[`${role}Color`] !== undefined,
      ])
    ) as Record<ResolvedToneRole, boolean>;
  return {
    base: toneRecord(patch.palette),
    modes: {
      light: toneRecord(patch.modes?.light?.palette),
      dark: toneRecord(patch.modes?.dark?.palette),
    },
  };
}
