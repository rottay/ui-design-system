/**
 * @fileoverview Test support that compiles through the productive door.
 *
 * Every compile here is one `compileThemeIntent` call: the intent is resolved,
 * admitted and lowered exactly as a productive caller's is. An authored
 * `FlatTheme` fixture enters as the intent's carried baseline -- the same slot
 * a studio uses for a tenant's already customized theme -- so a sparse or
 * hand-built fixture reaches the lowering as it was authored, but only after
 * ingress and admission have seen it. The result is re-flattened into the
 * field names the suites assert on (`cssVariables`, `cssString`,
 * `personality`, `tokenOverrides`, ...).
 */

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { ThemeIntent } from "@/foundation/contracts/composition/tenants/themes/intent";
import type { ThemeLayerPatch } from "@/foundation/contracts/composition/tenants/themes/iso";
import type { ThemeCompilationModeBlock, ThemeCompilationRuntime } from "@/foundation/contracts/composition/tenants/themes/compiled";
import type { FlatThemeMode } from "@/foundation/contracts/composition/tenants/themes";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import { isFirstPartyVerticalId } from "@/foundation/presets/verticals/roster";
import { brandTenantSelector } from "@/infrastructure/compilers/kernel/foundation/css/tenant-selectors";
import {
  compileThemeIntent,
  containerScope,
  emitThemeCss,
  staticThemeIntent,
} from "@/infrastructure/compilers/runtime/theme";
import { liftAuthoredTheme } from "@/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/intake";

/** The flat view of one door compile the suites assert on. */
export interface DoorCompilation {
  cssVariables: Record<string, string>;
  cssString: string;
  personality: ThemeCompilationRuntime["personality"];
  tokenOverrides: ThemeCompilationRuntime["tokenOverrides"];
  recipeProfile?: string;
  experienceProfile?: string;
  colorScheme?: FlatThemeMode;
  modeBlocks?: readonly ThemeCompilationModeBlock[];
}

/** Compile one intent through `compileThemeIntent` and flatten the result. */
export function compileIntentThroughDoor(intent: ThemeIntent): DoorCompilation {
  const { compiled } = compileThemeIntent(intent);
  return {
    cssVariables: { ...compiled.cssVariables },
    cssString: emitThemeCss(compiled, containerScope(brandTenantSelector(intent.slug))),
    personality: compiled.runtime.personality,
    tokenOverrides: compiled.runtime.tokenOverrides,
    ...(compiled.runtime.recipeProfile ? { recipeProfile: compiled.runtime.recipeProfile } : {}),
    ...(compiled.runtime.experienceProfile
      ? { experienceProfile: compiled.runtime.experienceProfile }
      : {}),
    ...(compiled.colorScheme ? { colorScheme: compiled.colorScheme } : {}),
    ...(compiled.modeBlocks.length > 0 ? { modeBlocks: compiled.modeBlocks } : {}),
  };
}

/** A first-party vertical's own static compile, scoped to `slug`. */
export function compileVerticalThroughDoor(
  vertical: FirstPartyVerticalId,
  slug: string = vertical
): DoorCompilation {
  return compileIntentThroughDoor(staticThemeIntent(vertical, slug));
}

export interface FlatThemeDoorInput {
  flatTheme: FlatTheme;
  tenantSlug?: string;
  /**
   * The roster row the intent names. It picks the engine and the envelope, never
   * the paint: the carried baseline is the fixture. Defaults to the slug or the
   * fixture id when either is a first-party vertical, else `rottay`.
   */
  vertical?: FirstPartyVerticalId;
  /**
   * A tenant's patch over the fixture. Present, the intent is a
   * `tenant-document`: the patch is merged over the carried baseline, its
   * authored paths, floors and status-seed authorship are derived from it by
   * the resolver, and admission measures it -- a claim is made by authoring a
   * value, never by naming a path beside one.
   */
  tenantPatch?: ThemeLayerPatch;
}

/**
 * The intent that carries an authored fixture as its baseline. Without a
 * patch it is static, because a fixture is a whole theme and not a tenant's
 * patch over one: it creates no tenant floor and no status-seed authorship.
 */
export function flatThemeIntent(input: FlatThemeDoorInput): ThemeIntent {
  const slug = input.tenantSlug ?? input.flatTheme.id;
  const vertical =
    input.vertical ??
    ([slug, input.flatTheme.id].find(isFirstPartyVerticalId) as FirstPartyVerticalId | undefined) ??
    "rottay";
  return {
    ...staticThemeIntent(vertical, slug),
    ...(input.tenantPatch !== undefined
      ? { origin: "tenant-document" as const, patch: input.tenantPatch }
      : {}),
    baseline: { ...liftAuthoredTheme(input.flatTheme), id: slug },
  };
}

/** Compile one authored FlatTheme fixture through `compileThemeIntent`. */
export function compileFlatThemeThroughDoor(input: FlatThemeDoorInput): DoorCompilation {
  return compileIntentThroughDoor(flatThemeIntent(input));
}
