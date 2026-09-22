import type { FlatThemeMode } from "@/foundation/contracts/composition/tenants/themes";
import {
  systemModeSelector,
  tenantArtifactScope,
} from "@/infrastructure/compilers/kernel/foundation/css/tenant-selectors";

import { emitDeclarations, emitRule } from "../css";

/** One compiled mode overlay of a tenant artifact: the delta, not the block. */
export interface TenantArtifactModeDelta {
  readonly mode: FlatThemeMode;
  readonly variables: Readonly<Record<string, string>>;
}

/** Everything the artifact format needs that the compile does not carry. */
export interface TenantArtifactComposition {
  readonly verticalKey: string;
  readonly slug: string;
  /** Stamped into the banner; injected because the version owner sits ABOVE this one. */
  readonly compilerVersion: string;
  readonly digest: string;
  readonly variables: Readonly<Record<string, string>>;
  readonly modeDeltas?: readonly TenantArtifactModeDelta[];
  /**
   * Whether the document defers its canvas to the viewer (`backgroundMode:
   * "auto"`), which is the only thing this format does with that field. A
   * boolean, read off the artifact by both the producer and the verifier: it
   * used to be the three-valued mode with a light-first default on each side,
   * and a default here states a canvas this owner cannot know.
   */
  readonly followsSystem?: boolean;
}

/**
 * The COMPLETE tenant artifact stylesheet: banner, base rule, mode rules and
 * the `auto` media copy.
 *
 * The artifact FORMAT lives here, not only its declarations and rules: the
 * producer writes these bytes and the verifier rebuilds them to compare, so a
 * second spelling of the banner, the base rule or the media copy would make a
 * drift surface as a mounted artifact the resolver refuses for no visible
 * reason. One function; the producer and the verifier both call it.
 *
 * The tenant overlay stays UNLAYERED on purpose: in the author origin, normal
 * declarations outside a cascade layer outrank every named layer, so putting
 * this rule in `@layer tenant` would make the unlayered vertical baseline
 * impossible to override regardless of source order or specificity.
 */
export function emitTenantArtifactCss(composition: TenantArtifactComposition): string {
  const scope = tenantArtifactScope(composition.verticalKey, composition.slug);
  const declarations = emitDeclarations(composition.variables);
  // Under `auto` the viewer chooses, so exactly ONE media copy exists: the
  // delta block itself. A compile states a block for the mode its base rule is
  // NOT, so the block's own mode is the preference to key on -- read off the
  // artifact's shape rather than told, which is why a dark-first vertical is
  // no longer a light-first guess.
  const modeRules = (composition.modeDeltas ?? []).map((block) => {
    const modeDeclarations = emitDeclarations(block.variables);
    const explicitRule = emitRule(scope.modeSelector(block.mode), modeDeclarations);
    if (composition.followsSystem !== true) return explicitRule;
    const automaticRule =
      `@media (prefers-color-scheme: ${block.mode}) {\n` +
      `${emitRule(
        systemModeSelector(scope.baseSelector, block.mode),
        modeDeclarations
      )}\n}`;
    return `${explicitRule}\n${automaticRule}`;
  });
  return [
    `/* TenantThemeArtifact v1 | ${composition.compilerVersion} | ${composition.digest} */`,
    emitRule(scope.baseSelector, declarations),
    ...modeRules,
    "",
  ].join("\n");
}
