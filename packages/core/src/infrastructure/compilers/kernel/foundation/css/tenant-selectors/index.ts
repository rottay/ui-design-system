/**
 * @fileoverview Tenant selector grammar shared by the lowering and emission.
 *
 * @module Compilers/Kernel/Css/TenantSelectors
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FlatThemeMode } from "@/foundation/contracts/composition/tenants/themes";
import type { EmissionScope } from "@/foundation/contracts/composition/tenants/themes/emission";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";

/** The document-root scope a tenant's compiled block is attached to. */
export function brandTenantSelector(tenantSlug: string): string {
  return `html[data-tenant='${tenantSlug}']`;
}

/** Shared explicit-mode selector grammar for static and DB artifact renderers. */
export function themeModeSelector(
  baseSelector: string,
  mode: FlatThemeMode
): string {
  return `${baseSelector}[data-theme='${mode}'], ${baseSelector}.${mode}`;
}

/**
 * Selector the `auto` media copy of a mode block is scoped to: the copy stands
 * down for the OPPOSITE explicit `data-theme`, the one the pre-paint script
 * writes once the viewer has been asked. The counterpart is spelled here
 * rather than imported, because this file is the only owner of selector text.
 */
export function systemModeSelector(
  baseSelector: string,
  mode: FlatThemeMode
): string {
  return `${baseSelector}:not([data-theme='${mode === "dark" ? "light" : "dark"}'])`;
}

/**
 * Selector a compiled mode block is scoped to.
 *
 * Both arms are the root-state contract's two ways of naming an explicit mode:
 * `data-theme` is what the SSR projection and the DS provider stamp, the class
 * is the legacy hook still used by pre-paint scripts. Both are one attribute
 * more specific than the base block, so a mode wins wherever it speaks and the
 * base supplies everything else — no source-order dependency.
 */
export function brandModeSelector(
  tenantSlug: string,
  mode: FlatThemeMode
): string {
  return themeModeSelector(brandTenantSelector(tenantSlug), mode);
}

/** The static first-party artifact scope: `html[data-tenant='<slug>']`. */
export function firstPartyScope(slug: FirstPartyVerticalId): EmissionScope {
  const baseSelector = brandTenantSelector(slug);
  return {
    baseSelector,
    modeSelector: (mode: FlatThemeMode) => themeModeSelector(baseSelector, mode),
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
    modeSelector: (mode: FlatThemeMode) => themeModeSelector(baseSelector, mode),
  };
}

/** An arbitrary container scope, for the preview. */
export function containerScope(baseSelector: string): EmissionScope {
  return {
    baseSelector,
    modeSelector: (mode: FlatThemeMode) => themeModeSelector(baseSelector, mode),
  };
}
