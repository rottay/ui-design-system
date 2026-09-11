/**
 * @fileoverview The modes family: the other mode derived from the SAME
 * decisions, under the same ranked merge as every other family.
 *
 * WHAT CHANGED. A mode block used to be a TRANSCRIPTION: the vertical's
 * authored `modes.<mode>` object was merged over the already tenant-merged
 * theme, so the baseline's hand-written light palette landed on top of a
 * tenant's own decisions purely because it was more specific. The delta for
 * the non-default mode was therefore the vertical's, in every vertical, and a
 * tenant that chose a primary colour got it in one mode and the vertical's in
 * the other.
 *
 * THE LAW. A tenant's MODE-AGNOSTIC decisions cross modes. What a vertical
 * authors per mode is a sanctioned override of its own baseline and ranks
 * exactly there: beneath the tenant, above the derivation. Only the tenant can
 * narrow its own statement, and it narrows it the one way the contract allows
 * -- by authoring that mode itself. A statement that DESCRIBES a mode (a
 * ground, an ink, a chrome surface) is not mode-agnostic and stays where it
 * was written; see `MODE_AGNOSTIC_DECISIONS` for the closed vocabulary.
 *
 * @module Compilers/Theme/Lowering/Runtime/Derivation/modes
 * @category Compilers
 * @package @rottay/design-system
 */

import type {
  BrandPalette,
  BrandTheme,
  BrandThemeMode,
  BrandThemeModeOverlay,
} from "@/foundation/contracts/composition/tenants/themes";
import type { ThemeCompilationModeBlock } from "@/foundation/contracts/composition/tenants/themes/compiled";
import type { TenantAuthoredPaths } from "@/foundation/contracts/composition/tenants/themes/iso";
import { completeChromeShape } from "@/foundation/contracts/composition/tenants/themes/iso";
import type { OnToneRole } from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";
import { ON_TONE_ROLES } from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";
import { themeDefaultMode } from "@/infrastructure/compilers/kernel/foundation/modes";
import type { TenantFacts } from "../../../foundation/contract";
import { PRIMARY_SEED_FIELD } from "../../../foundation/seeds";
import { keepTenantBaseSidebarLeaves } from "../../../foundation/sidebar";

/** Every mode a Theme can carry a block for, in canonical order. */
const MODES: readonly BrandThemeMode[] = Object.freeze(["light", "dark"]);

/**
 * Deep-merge one layer over another.
 *
 * Plain-object branches recurse so a partial like `chrome.controls.input.bg`
 * replaces one leaf and leaves its siblings alone; everything else (strings,
 * numbers, arrays) is a leaf and is replaced wholesale. `undefined` means "not
 * authored", never "unset" -- which is also what keeps the always-emitted keys
 * of a patch builder from counting as tenant statements.
 */
function mergeLayer<T>(base: T, layer: unknown): T {
  if (layer === undefined) return base;
  if (
    !layer ||
    typeof layer !== "object" ||
    Array.isArray(layer) ||
    !base ||
    typeof base !== "object" ||
    Array.isArray(base)
  ) {
    return layer as T;
  }
  const merged: Record<string, unknown> = {
    ...(base as Record<string, unknown>),
  };
  for (const [key, value] of Object.entries(layer)) {
    if (value === undefined) continue;
    merged[key] = mergeLayer((base as Record<string, unknown>)[key], value);
  }
  return merged as T;
}

/** Apply a mode's overlay to a theme body, leaving identity fields alone. */
function applyModeOverlay(
  bt: BrandTheme,
  overlay: BrandThemeModeOverlay
): BrandTheme {
  return {
    ...bt,
    palette: mergeLayer(bt.palette, overlay.palette) as BrandPalette | undefined,
    typography: mergeLayer(bt.typography, overlay.typography),
    surfaces: mergeLayer(bt.surfaces, overlay.surfaces),
    // The merge base is completed to the canonical chrome shape so both
    // transports place an overlay-only key at the SAME (shape) position:
    // sparse static chrome would otherwise APPEND it while the ISO bridge's
    // materialized chrome carries the shape slot, and the authored-order
    // emitters make that placement observable in the mode block's css.
    chrome: mergeLayer(completeChromeShape(bt.chrome), overlay.chrome),
  };
}

/** Does this overlay state any value at all, at any depth? */
export function modeOverlayHasValues(overlay: BrandThemeModeOverlay): boolean {
  for (const family of Object.values(overlay)) {
    if (family && typeof family === "object") {
      for (const value of Object.values(family)) {
        if (value === undefined) continue;
        if (value !== null && typeof value === "object") {
          if (modeOverlayHasValues(value as BrandThemeModeOverlay)) return true;
        } else {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * The decisions that are BRAND IDENTITY rather than canvas.
 *
 * A tenant's identity colours mean the same thing in both modes -- the
 * document ingress says so in its own words, "seeds are mode-agnostic brand
 * identity" -- so a tenant that chooses one has chosen it for every mode, and
 * the derivation re-reads it against each mode's own ground (APCA-safely, per
 * the seed-shadowing tables).
 *
 * Deliberately NOT every leaf the tenant authored. A ground, an ink, a border
 * or a chrome surface DESCRIBES a mode: carrying a light card background into
 * the dark block puts the dark ink on a light surface, and the APCA floor
 * refuses the compile -- which is exactly what happened when this table was
 * "everything". Those live per mode, as `SanctionedOverrides` the tenant
 * authors for the mode it means, and the vertical's own per-mode statement
 * stays the baseline under them.
 *
 * It is a closed vocabulary of DECISIONS, never of verticals: no row here
 * names a slug, and the mode deriver has no branch on one.
 */
const MODE_AGNOSTIC_DECISIONS: readonly string[] = Object.freeze([
  PRIMARY_SEED_FIELD,
  "palette.secondaryColor",
  "palette.accentColor",
  ...ON_TONE_ROLES.map((role) => `palette.${role}Color`),
]);

/**
 * The tenant's own statements that reach INTO this mode.
 *
 * Read from `authoredLeaves`, the honest authorship record, and valued from
 * the effective theme, where the tenant already outranks the baseline at the
 * base block.
 *
 * NOT from `ThemeFloors`: it carries typography, surfaces and motion by design
 * and "excludes `palette` and `modes`", so a floor-based reading is
 * structurally unable to see the one decision F-05 is about. NOT from
 * `authoredPaths` either: the v1 patch builder emits every palette key it
 * knows, `undefined` included, so a document that authored one colour reports
 * fourteen.
 *
 * A leaf the tenant restated for THIS mode is skipped. A tenant that says
 * "blue, but teal in dark" must get teal in dark, and re-asserting the base
 * blue over its own narrower statement would invert the rank inside the
 * tenant's own family.
 */
function tenantDecisionsCrossingInto(
  effective: BrandTheme,
  authoredLeaves: TenantAuthoredPaths,
  modePrefix: string
): readonly (readonly [readonly string[], unknown])[] {
  const crossing: (readonly [readonly string[], unknown])[] = [];
  for (const path of MODE_AGNOSTIC_DECISIONS) {
    if (!authoredLeaves.has(path)) continue;
    if (authoredLeaves.has(`${modePrefix}${path}`)) continue;
    const segments = path.split(".");
    const value = readThemePath(effective, segments);
    if (value === undefined) continue;
    crossing.push([segments, value]);
  }
  return crossing;
}

function readThemePath(root: unknown, segments: readonly string[]): unknown {
  let cursor: unknown = root;
  for (const key of segments) {
    if (!cursor || typeof cursor !== "object" || Array.isArray(cursor)) {
      return undefined;
    }
    cursor = (cursor as Record<string, unknown>)[key];
  }
  return cursor;
}

/** Copy-on-write assignment: nothing the effective theme shares is mutated. */
function withThemePath(
  root: BrandTheme,
  segments: readonly string[],
  value: unknown
): BrandTheme {
  const copy = { ...root } as unknown as Record<string, unknown>;
  let cursor = copy;
  for (const key of segments.slice(0, -1)) {
    const child = cursor[key];
    const next: Record<string, unknown> =
      child && typeof child === "object" && !Array.isArray(child)
        ? { ...(child as Record<string, unknown>) }
        : {};
    cursor[key] = next;
    cursor = next;
  }
  cursor[segments[segments.length - 1] as string] = value;
  return copy as unknown as BrandTheme;
}

/** One block the pipeline still has to lower, with the theme it lowers. */
export interface ModeBlockRequest {
  readonly mode: BrandThemeMode;
  /** The effective theme FOR THIS MODE, after the ranked merge. */
  readonly theme: BrandTheme;
  /** `modes.<mode>.` -- the authorship prefix every family reads paths under. */
  readonly modePrefix: string;
  readonly tenant: TenantFacts | undefined;
}

export interface ModeDerivationInput {
  /** The effective theme: vertical baseline under the tenant floor. */
  readonly theme: BrandTheme;
  readonly tenantFacts: TenantFacts | undefined;
  /**
   * The raw tenant patch, read-only here -- see
   * `applyTenantStatusSeedDerivations`'s docblock for why the merged theme and
   * `authoredPaths` alone cannot tell "the tenant wrote this seed" from "the
   * patch builder always emits this key".
   */
  readonly tenantPatch: Partial<BrandTheme> | undefined;
}

/**
 * Every mode block this theme owes, and the theme each one derives from.
 *
 * The requests go through the SAME pipeline as the base block -- there is no
 * second emission path and no per-vertical branch. What differs is only the
 * mode, the surface and the ranked theme this function assembles.
 */
export function deriveModeThemes(
  input: ModeDerivationInput
): readonly ModeBlockRequest[] {
  const { theme, tenantFacts, tenantPatch } = input;
  const modes = theme.modes;
  if (!modes) return [];
  const defaultMode = themeDefaultMode(theme);
  const requests: ModeBlockRequest[] = [];
  for (const mode of MODES) {
    const overlay = modes[mode];
    if (!overlay) continue;
    if (mode === defaultMode) {
      // Canonical ISO Themes always carry both mode slots; an empty default-mode
      // overlay is a structural placeholder, not an authority violation.
      if (!modeOverlayHasValues(overlay)) continue;
      throw new Error(
        `BrandTheme '${theme.id}' authors modes.${mode}, but ${mode} is its declared defaultMode. ` +
          `The default mode's values belong in the theme body; a mode overlay describes the OTHER mode.`
      );
    }
    const modePrefix = `modes.${mode}.`;
    // Rank, highest last: the vertical's per-mode override over the merged
    // body, then every tenant decision the tenant did not narrow for this mode.
    const authoredLeaves = tenantFacts?.authoredLeaves;
    let modeTheme = applyModeOverlay(theme, overlay);
    const crossed = new Set<string>();
    if (authoredLeaves !== undefined) {
      for (const [segments, value] of tenantDecisionsCrossingInto(
        theme,
        authoredLeaves,
        modePrefix
      )) {
        modeTheme = withThemePath(modeTheme, segments, value);
        crossed.add(segments.join("."));
      }
    }
    requests.push({
      mode,
      theme: modeTheme,
      modePrefix,
      tenant: modeTenantFacts(mode, modePrefix, crossed, tenantFacts, tenantPatch),
    });
  }
  return requests;
}

/**
 * The seed this block compiles from is the TENANT'S when the tenant stated it
 * for this mode, or when its base statement CROSSED into this mode.
 *
 * `crossed` is the crossing rule's own answer, not a second reading of it. The
 * condition used to be "the vertical's overlay does not restate the seed",
 * which was the same question asked of the wrong authority: it described the
 * old contest, in which the overlay won. Asking the rule itself is what keeps
 * the on-tone ink derived for the colour the block actually paints -- derive
 * it for any other and the APCA floor refuses the compile by name.
 */
function modeTenantFacts(
  mode: BrandThemeMode,
  modePrefix: string,
  crossed: ReadonlySet<string>,
  tenantFacts: TenantFacts | undefined,
  tenantPatch: Partial<BrandTheme> | undefined
): TenantFacts | undefined {
  if (!tenantFacts) return undefined;
  const authoredPaths = tenantFacts.authoredPaths;
  const statusSeedAuthorship = tenantFacts.statusSeedAuthorship;
  return {
    ...tenantFacts,
    seedIsTenantAuthored:
      authoredPaths !== undefined &&
      (authoredPaths.has(`${modePrefix}${PRIMARY_SEED_FIELD}`) ||
        crossed.has(PRIMARY_SEED_FIELD)),
    toneSeedIsTenantAuthored: Object.fromEntries(
      ON_TONE_ROLES.map((role) => [
        role,
        statusSeedAuthorship
          ? statusSeedAuthorship.modes[mode]?.[role] ||
            crossed.has(`palette.${role}Color`)
          : tenantPatch?.modes?.[mode]?.palette?.[`${role}Color`] !== undefined ||
            crossed.has(`palette.${role}Color`),
      ])
    ) as Record<OnToneRole, boolean>,
  };
}

/**
 * The DELTA, not the block: only channels whose value actually moves are kept.
 *
 * Everything the mode does not restate keeps cascading from the base block,
 * which is also what lets a `var()` chain authored once (the tint scale mixes
 * against `--ds-color-bg-primary`) re-resolve against the mode's own ground
 * instead of being duplicated.
 */
export function projectModeDelta(
  request: ModeBlockRequest,
  modeVars: Record<string, string>,
  baseVars: Record<string, string>
): ThemeCompilationModeBlock {
  keepTenantBaseSidebarLeaves(
    modeVars,
    baseVars,
    request.tenant?.authoredPaths,
    request.modePrefix
  );
  const cssVariables: Record<string, string> = {};
  for (const [key, value] of Object.entries(modeVars)) {
    if (baseVars[key] !== value) cssVariables[key] = value;
  }
  return { mode: request.mode, cssVariables, colorScheme: request.mode };
}
