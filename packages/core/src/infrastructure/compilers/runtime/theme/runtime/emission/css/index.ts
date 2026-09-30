import type {
  ThemeCompilation,
  ThemeCompilationContrastBlock,
  ThemeCompilationDensityScopeBlock,
  ThemeCompilationModeBlock,
} from "@/foundation/contracts/composition/tenants/themes/compiled";
import type { DensityPreference } from "@/foundation/tokens/ts/foundation/base/density";
import type { EmissionScope } from "@/foundation/contracts/composition/tenants/themes/emission";
import {
  containerScope,
  firstPartyScope,
  tenantArtifactScope,
} from "@/infrastructure/compilers/kernel/foundation/css/tenant-selectors";
import { admitCssVariables } from "@/infrastructure/compilers/kernel/foundation/css/value-safety";

import {
  containerAliasRedeclarations,
  type ContainerAliasContext,
  rootAliasRedeclarations,
} from "./root-aliases";

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
  variables: Readonly<Record<string, string>>,
  options: { readonly alsoStated?: Iterable<string>; readonly alsoOutright?: Iterable<string> } = {}
): string[] {
  return Object.entries(
    withRootAliases(admitCssVariables(variables), options.alsoStated, options.alsoOutright)
  ).map(([name, value]) => `  ${name}: ${value};`);
}

/**
 * A block that shares its element with the base rule (a mode, a contrast delta):
 * the base rule's aliases already re-resolve against its operands there, and a
 * restatement here would outrank a value the base rule names outright.
 */
export function emitOverlayDeclarations(
  variables: Readonly<Record<string, string>>
): string[] {
  return Object.entries(admitCssVariables(variables)).map(
    ([name, value]) => `  ${name}: ${value};`
  );
}

/** The dial-scaled radius steps `themes/default` declares once at `:root`. */
export const RADIUS_CHAIN_STEPS = ["sm", "md", "lg", "xl"] as const;

export const RADIUS_SCALE_VARIABLE = "--ds-radius-scale";

/** The `:root` declaration of one step, restated verbatim. */
export function radiusChainValue(step: (typeof RADIUS_CHAIN_STEPS)[number]): string {
  return `calc(var(--ds-radius-${step}-base) * var(${RADIUS_SCALE_VARIABLE}, 1))`;
}

/**
 * The block's own channels followed by every root alias they, or `alsoStated`
 * (operands the scope states on the same element in another rule), re-resolve.
 * A name the block, or `alsoOutright` (another rule on the same element), states
 * outright keeps that value.
 */
export function withRootAliases(
  variables: Readonly<Record<string, string>>,
  alsoStated: Iterable<string> = [],
  alsoOutright: Iterable<string> = []
): Record<string, string> {
  const own = new Set(Object.keys(variables));
  return {
    ...variables,
    ...rootAliasRedeclarations([...own, ...alsoStated], new Set([...own, ...alsoOutright])),
  };
}

/** The admitted names of the rules that share the base rule's element. */
export function sameElementNames(
  blocks: readonly { readonly cssVariables: Readonly<Record<string, string>> }[]
): string[] {
  return blocks.flatMap((block) => Object.keys(admitCssVariables(block.cssVariables)));
}

/**
 * A scope on an element BELOW the document root (the branding sandbox's
 * `[data-preview-…]` box). Such a scope inherits every root alias already
 * resolved at the root, including the ones a root-element scope must not
 * restate, so it takes the container law (`containerAliasRedeclarations`).
 * `outright` names the channels the enclosing root's own rule states (a
 * vertical's compiled channels): their root text is never restated here.
 */
export interface ContainerEmission {
  readonly outright?: Iterable<string>;
}

/** The selector a context rule is re-emitted at: the scope under a matching ancestor, or matching itself. */
export function containerContextSelector(baseSelector: string, context: ContainerAliasContext): string {
  const base = baseSelector.includes(",") ? `:is(${baseSelector})` : baseSelector;
  const under = `:where(${context.selector}) ${base}`;
  return context.rootOnly ? under : `${under}, ${base}:where(${context.selector})`;
}

/** The context rules, consecutive declarations of one context grouped, each wrapped in its at-rules. */
export function emitContainerContextRules(
  contexts: readonly ContainerAliasContext[],
  scope: EmissionScope
): string[] {
  const groups: { context: ContainerAliasContext; lines: string[] }[] = [];
  for (const context of contexts) {
    const last = groups[groups.length - 1];
    const line = `  ${context.name}: ${context.value};`;
    if (last && last.context.selector === context.selector && last.context.at.join("\u0000") === context.at.join("\u0000")) {
      last.lines.push(line);
    } else {
      groups.push({ context, lines: [line] });
    }
  }
  return groups.map(({ context, lines }) =>
    context.at.reduceRight(
      (inner, prelude) => `${prelude} {\n${inner}\n}`,
      emitRule(containerContextSelector(scope.baseSelector, context), lines)
    )
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
  options: { leadingDeclarations?: readonly string[]; container?: ContainerEmission } = {}
): string {
  const alsoStated = sameElementNames([...compiled.modeBlocks, ...(compiled.contrastBlocks ?? [])]);
  if (options.container) return emitContainerBaseRule(compiled, scope, alsoStated, options);
  const entries = emitDeclarations(compiled.cssVariables, { alsoStated });
  const leading = options.leadingDeclarations ?? [];
  if (entries.length === 0 && leading.length === 0 && !compiled.colorScheme) return "";
  return emitRule(scope.baseSelector, [
    ...(compiled.colorScheme ? [`  color-scheme: ${compiled.colorScheme};`] : []),
    ...leading,
    ...entries,
  ]);
}

/** The base rule at a container scope, then the context rules its restatements carry. */
function emitContainerBaseRule(
  compiled: ThemeCompilation,
  scope: EmissionScope,
  alsoStated: readonly string[],
  options: { leadingDeclarations?: readonly string[]; container?: ContainerEmission }
): string {
  const variables = admitCssVariables(compiled.cssVariables);
  const own = Object.keys(variables);
  const { declarations, contexts } = containerAliasRedeclarations(
    [...own, ...alsoStated],
    new Set([...own, ...(options.container?.outright ?? [])])
  );
  const entries = Object.entries({ ...variables, ...declarations }).map(([name, value]) => `  ${name}: ${value};`);
  const leading = options.leadingDeclarations ?? [];
  if (entries.length === 0 && leading.length === 0 && !compiled.colorScheme) return "";
  return [
    emitRule(scope.baseSelector, [
      ...(compiled.colorScheme ? [`  color-scheme: ${compiled.colorScheme};`] : []),
      ...leading,
      ...entries,
    ]),
    ...emitContainerContextRules(contexts, scope),
  ].join("\n\n");
}

/** One compiled mode's rule at a scope. */
export function emitModeRule(
  mode: ThemeCompilationModeBlock,
  scope: EmissionScope
): string {
  return emitRule(scope.modeSelector(mode.mode), [
    `  color-scheme: ${mode.colorScheme};`,
    ...emitOverlayDeclarations(mode.cssVariables),
  ]);
}

export const PREFERS_MORE_CONTRAST = "(prefers-contrast: more)";

/** The `prefers-contrast: more` deltas at a scope in one media rule; nothing declared, no rule. */
export function emitContrastRule(
  blocks: readonly ThemeCompilationContrastBlock[],
  scope: EmissionScope
): string {
  const rules = blocks
    .map((block) => ({ block, declarations: emitOverlayDeclarations(block.cssVariables) }))
    .filter(({ declarations }) => declarations.length > 0)
    .map(({ block, declarations }) =>
      emitRule(
        block.mode === undefined ? scope.baseSelector : scope.modeSelector(block.mode),
        declarations
      )
    );
  if (rules.length === 0) return "";
  return `@media ${PREFERS_MORE_CONTRAST} {\n${rules.join("\n")}\n}`;
}

/** The postures a boundary is spelled with in CSS; `normal` names no scope. */
export const DENSITY_SCOPE_POSTURES = [
  "compact",
  "comfortable",
  "spacious",
] as const satisfies readonly DensityPreference[];

/** Every density boundary below `baseSelector`, unlayered at the base selector's own weight: that
 *  placement is the consumer-override contract. */
export function densityScopeSelector(baseSelector: string): string {
  const boundaries = DENSITY_SCOPE_POSTURES.map(
    (posture) => `[data-density='${posture}']:not(:root)`
  ).join(", ");
  const base = baseSelector.includes(",") ? `:is(${baseSelector})` : baseSelector;
  return `${base} :where(${boundaries})`;
}

/** The boundary block at a scope; nothing declared, no rule. */
export function emitDensityScopeRule(
  block: ThemeCompilationDensityScopeBlock | undefined,
  scope: EmissionScope
): string {
  const declarations = emitDeclarations(block?.cssVariables ?? {});
  if (declarations.length === 0) return "";
  return emitRule(densityScopeSelector(scope.baseSelector), declarations);
}

/**
 * Reproduces the compiler's own CSS grammar against an arbitrary scope. The
 * base block is the empty string when it carries neither entries nor a
 * `colorScheme`, and `.filter(Boolean)` drops it before the `\n\n` join, so a
 * zero-mode theme emits no leading blank line.
 *
 * `container` marks a scope below the document root; every root-element door
 * omits it and emits the same bytes as before the container law existed.
 */
export function emitThemeCss(
  compiled: ThemeCompilation,
  scope: EmissionScope,
  options: { container?: ContainerEmission } = {}
): string {
  return [
    emitBaseRule(compiled, scope, options),
    ...compiled.modeBlocks.map((mode) => emitModeRule(mode, scope)),
    emitContrastRule(compiled.contrastBlocks ?? [], scope),
    emitDensityScopeRule(compiled.densityScopeBlock, scope),
  ]
    .filter(Boolean)
    .join("\n\n");
}
