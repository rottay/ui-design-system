import type { BrandThemeMode } from "@/foundation/contracts/composition/tenants/themes";
import type {
  ThemeCompilation,
  ThemeCompilationModeBlock,
} from "@/foundation/contracts/composition/tenants/themes/compiled";
import type { EmissionScope } from "@/foundation/contracts/composition/tenants/themes/emission";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import {
  brandTenantSelector,
  themeModeSelector,
} from "@/infrastructure/compilers/kernel/runtime/brand-theme";

/** The static first-party artifact scope: `html[data-tenant='<slug>']`. */
export function firstPartyScope(slug: FirstPartyVerticalId): EmissionScope {
  const baseSelector = brandTenantSelector(slug);
  return {
    baseSelector,
    modeSelector: (mode: BrandThemeMode) => themeModeSelector(baseSelector, mode),
  };
}

/**
 * The validated DB artifact scope. Requiring both tenant presence and the exact
 * tenant value is semantically redundant but yields specificity (0,4,0), so the
 * artifact always wins on its own root without `!important`.
 */
export function tenantArtifactScope(verticalKey: string, slug: string): EmissionScope {
  const baseSelector = `[data-ds-root][data-vertical="${verticalKey}"][data-tenant][data-tenant="${slug}"]`;
  return {
    baseSelector,
    modeSelector: (mode: BrandThemeMode) => themeModeSelector(baseSelector, mode),
  };
}

/** An arbitrary container scope, for the preview. */
export function containerScope(baseSelector: string): EmissionScope {
  return {
    baseSelector,
    modeSelector: (mode: BrandThemeMode) => themeModeSelector(baseSelector, mode),
  };
}

function block(selector: string, declarations: readonly string[]): string {
  return `${selector} {\n${declarations.join("\n")}\n}`;
}

function baseBlock(compiled: ThemeCompilation, scope: EmissionScope): string {
  const entries = Object.entries(compiled.cssVariables).filter(([, v]) => v != null);
  if (entries.length === 0 && !compiled.colorScheme) return "";
  return block(scope.baseSelector, [
    ...(compiled.colorScheme ? [`  color-scheme: ${compiled.colorScheme};`] : []),
    ...entries.map(([k, v]) => `  ${k}: ${v};`),
  ]);
}

function modeBlock(mode: ThemeCompilationModeBlock, scope: EmissionScope): string {
  const entries = Object.entries(mode.cssVariables).filter(([, v]) => v != null);
  return block(scope.modeSelector(mode.mode), [
    `  color-scheme: ${mode.colorScheme};`,
    ...entries.map(([k, v]) => `  ${k}: ${v};`),
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
    baseBlock(compiled, scope),
    ...compiled.modeBlocks.map((mode) => modeBlock(mode, scope)),
  ]
    .filter(Boolean)
    .join("\n\n");
}
