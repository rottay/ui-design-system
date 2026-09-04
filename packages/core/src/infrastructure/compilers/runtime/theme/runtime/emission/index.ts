import type { BrandThemeMode } from "@/foundation/contracts/composition/tenants/themes";
import type {
  ThemeCompilation,
  ThemeCompilationModeBlock,
} from "@/foundation/contracts/composition/tenants/themes/compiled";
import type { EmissionScope } from "@/foundation/contracts/composition/tenants/themes/emission";
import {
  containerScope,
  firstPartyScope,
  tenantArtifactScope,
} from "@/infrastructure/compilers/kernel/foundation/css/tenant-selectors";
import { admitCssVariables } from "@/infrastructure/compilers/kernel/foundation/css/value-safety";

export { containerScope, firstPartyScope, tenantArtifactScope };

/**
 * One `  name: value;` line per channel, absent and inadmissible values dropped.
 *
 * This owner is the sole assembler of CSS text in the theme pipeline. Every
 * reader that needs a declaration — the first-party artifact renderer, the DB
 * artifact renderer, the brand-studio preview, visual-authority's admission
 * check — imports it from here rather than restating it: a drift between two
 * copies of this grammar shows up as a mounted artifact the resolver refuses,
 * which is indistinguishable from a compiler bug.
 *
 * Because it is the sole assembler, it is also where value safety is decided.
 * `Theme` declares open string leaves, so a compiled channel can carry any
 * string its author wrote; `admitCssVariables` refuses the ones that would
 * terminate the declaration, close the rule or leave the `<style>` element.
 * Omitted whole, never rewritten, and refused here rather than at each of the
 * six emitters downstream of this line.
 */
export function emitDeclarations(
  variables: Readonly<Record<string, string>>
): string[] {
  return Object.entries(admitCssVariables(variables)).map(
    ([name, value]) => `  ${name}: ${value};`
  );
}

/** One CSS rule from a selector and already-formatted declarations. */
export function emitRule(selector: string, declarations: readonly string[]): string {
  return `${selector} {\n${declarations.join("\n")}\n}`;
}

/**
 * The base rule for a compiled theme at a scope.
 *
 * `leadingDeclarations` land immediately after `color-scheme` and before the
 * channels. The first-party artifact needs exactly that slot for the document
 * root's `color:` declaration, which is artifact-format semantics rather than
 * theme content; giving it a declared position here is what keeps the renderer
 * from assembling the rule itself.
 */
export function emitBaseRule(
  compiled: ThemeCompilation,
  scope: EmissionScope,
  options: { leadingDeclarations?: readonly string[] } = {}
): string {
  const entries = emitDeclarations(compiled.cssVariables);
  const leading = options.leadingDeclarations ?? [];
  if (entries.length === 0 && leading.length === 0 && !compiled.colorScheme) return "";
  return emitRule(scope.baseSelector, [
    ...(compiled.colorScheme ? [`  color-scheme: ${compiled.colorScheme};`] : []),
    ...leading,
    ...entries,
  ]);
}

/** One compiled mode's rule at a scope. */
export function emitModeRule(
  mode: ThemeCompilationModeBlock,
  scope: EmissionScope
): string {
  return emitRule(scope.modeSelector(mode.mode), [
    `  color-scheme: ${mode.colorScheme};`,
    ...emitDeclarations(mode.cssVariables),
  ]);
}

/**
 * Reproduces the compiler's own CSS grammar against an arbitrary scope. The
 * base block is the empty string when it carries neither entries nor a
 * `colorScheme`, and `.filter(Boolean)` drops it before the `\n\n` join, so a
 * zero-mode theme emits no leading blank line.
 */
export function emitThemeCss(compiled: ThemeCompilation, scope: EmissionScope): string {
  return [
    emitBaseRule(compiled, scope),
    ...compiled.modeBlocks.map((mode) => emitModeRule(mode, scope)),
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** One compiled mode overlay of a tenant artifact: the delta, not the block. */
export interface TenantArtifactModeDelta {
  readonly mode: BrandThemeMode;
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
  readonly backgroundMode?: "light" | "dark" | "auto";
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
  const modeRules = (composition.modeDeltas ?? []).map((block) => {
    const modeDeclarations = emitDeclarations(block.variables);
    const explicitRule = emitRule(scope.modeSelector(block.mode), modeDeclarations);
    if (composition.backgroundMode !== "auto" || block.mode !== "dark") {
      return explicitRule;
    }
    const automaticRule =
      "@media (prefers-color-scheme: dark) {\n" +
      `${emitRule(`${scope.baseSelector}:not([data-theme='light'])`, modeDeclarations)}\n}`;
    return `${explicitRule}\n${automaticRule}`;
  });
  return [
    `/* TenantThemeArtifact v1 | ${composition.compilerVersion} | ${composition.digest} */`,
    emitRule(scope.baseSelector, declarations),
    ...modeRules,
    "",
  ].join("\n");
}
