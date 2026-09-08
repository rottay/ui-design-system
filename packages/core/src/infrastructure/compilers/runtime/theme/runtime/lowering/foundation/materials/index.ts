/**
 * @fileoverview Semantic surface-role and material channel writers.
 *
 * @module Compilers/Theme/Lowering/Foundation/materials
 * @category Compilers
 * @package @rottay/design-system
 */

import { SEMANTIC_SURFACE_ROLES } from "@/foundation/contracts/kernel/tokens/materials";
import type { SemanticSurfaceRoleMap } from "@/foundation/contracts/kernel/tokens/materials";

/**
 * Convert a semantic surface-role map to a flat CSS variable map.
 *
 * Emits the channels of the mode being compiled. A theme's other mode is a
 * `modes` overlay that re-enters the same family compilers with its own
 * merged values, so there is exactly one channel family per role and no
 * `dark`-prefixed twin for anything to consume.
 */
export function semanticSurfaceRolesToCssVariables(
  surfaceRoles: SemanticSurfaceRoleMap | undefined
): Record<string, string> {
  if (!surfaceRoles) return {};

  const vars: Record<string, string> = {};
  for (const role of SEMANTIC_SURFACE_ROLES) {
    const surfaceRoleTokens = surfaceRoles[role];
    if (!surfaceRoleTokens) continue;

    const prefix = `--ds-material-${role}`;
    if (surfaceRoleTokens.background) {
      vars[`--ds-surface-${role}`] = surfaceRoleTokens.background;
      // The semantic surface is the single paint authority. Legacy-prefixed
      // compatibility channels remain aliases so a later DB TenantTheme
      // override cannot be masked by a static vertical literal.
      vars[`${prefix}-background`] = `var(--ds-surface-${role})`;
    }
    if (surfaceRoleTokens.backgroundHover)
      vars[`${prefix}-background-hover`] = surfaceRoleTokens.backgroundHover;
    if (surfaceRoleTokens.backgroundActive)
      vars[`${prefix}-background-active`] = surfaceRoleTokens.backgroundActive;
    if (surfaceRoleTokens.backgroundSelected)
      vars[`${prefix}-background-selected`] =
        surfaceRoleTokens.backgroundSelected;
    if (surfaceRoleTokens.backgroundDisabled)
      vars[`${prefix}-background-disabled`] =
        surfaceRoleTokens.backgroundDisabled;
    if (surfaceRoleTokens.foreground)
      vars[`${prefix}-foreground`] = surfaceRoleTokens.foreground;
    if (surfaceRoleTokens.foregroundMuted)
      vars[`${prefix}-foreground-muted`] = surfaceRoleTokens.foregroundMuted;
    if (surfaceRoleTokens.foregroundDisabled)
      vars[`${prefix}-foreground-disabled`] =
        surfaceRoleTokens.foregroundDisabled;
    if (surfaceRoleTokens.border)
      vars[`${prefix}-border`] = surfaceRoleTokens.border;
    if (surfaceRoleTokens.borderStrong)
      vars[`${prefix}-border-strong`] = surfaceRoleTokens.borderStrong;
    if (surfaceRoleTokens.borderHover)
      vars[`${prefix}-border-hover`] = surfaceRoleTokens.borderHover;
    if (surfaceRoleTokens.borderActive)
      vars[`${prefix}-border-active`] = surfaceRoleTokens.borderActive;
    if (surfaceRoleTokens.borderSelected)
      vars[`${prefix}-border-selected`] = surfaceRoleTokens.borderSelected;
    if (surfaceRoleTokens.borderDisabled)
      vars[`${prefix}-border-disabled`] = surfaceRoleTokens.borderDisabled;
    if (surfaceRoleTokens.focusRing)
      vars[`${prefix}-focus-ring`] = surfaceRoleTokens.focusRing;
    if (surfaceRoleTokens.shadow)
      vars[`${prefix}-shadow`] = surfaceRoleTokens.shadow;
    if (surfaceRoleTokens.shadowHover)
      vars[`${prefix}-shadow-hover`] = surfaceRoleTokens.shadowHover;
    if (surfaceRoleTokens.shadowActive)
      vars[`${prefix}-shadow-active`] = surfaceRoleTokens.shadowActive;
    if (surfaceRoleTokens.shadowSelected)
      vars[`${prefix}-shadow-selected`] = surfaceRoleTokens.shadowSelected;
    if (surfaceRoleTokens.highlight)
      vars[`${prefix}-highlight`] = surfaceRoleTokens.highlight;
    if (surfaceRoleTokens.texture)
      vars[`${prefix}-texture`] = surfaceRoleTokens.texture;
  }

  const card = surfaceRoles.card;
  if (card?.background) vars["--ds-surface-card-bg"] = "var(--ds-surface-card)";
  if (card?.border)
    vars["--ds-surface-card-border"] = "var(--ds-material-card-border)";
  if (card?.borderStrong)
    vars["--ds-surface-card-border-strong"] =
      "var(--ds-material-card-border-strong)";
  if (card?.shadow)
    vars["--ds-surface-card-shadow"] = "var(--ds-material-card-shadow)";
  if (card?.shadowHover)
    vars["--ds-surface-card-shadow-hover"] =
      "var(--ds-material-card-shadow-hover)";

  const panel = surfaceRoles.panel;
  if (panel?.background)
    vars["--ds-surface-panel-bg"] = "var(--ds-surface-panel)";
  const control = surfaceRoles.control;
  if (control?.background)
    vars["--ds-surface-control-bg"] = "var(--ds-surface-control)";

  /**
   * `raised` gets no `-bg` alias. Its three siblings above alias inside
   * `--ds-surface-*`; raised aliased into `--ds-color-*`, so a name in the
   * colour family resolved to a surface role that a tenant may author as a
   * gradient — bithire does. Its thirteen real consumers already read
   * `--ds-surface-raised` directly, so the alias had one reader and no job.
   */

  return vars;
}

/**
 * The `--ds-material-*` half of the map above.
 *
 * The two halves are FILTERS over one writer, never a second writer: the role
 * table, the facet list and the alias rules stay in exactly one function, so
 * the materials family and the surfaces family cannot drift about what a role
 * emits. Each family then declares only the channels it owns, which is what
 * keeps them out of the ranked merge's duplicate-producer refusal.
 */
export function semanticSurfaceRolesToMaterialVariables(
  surfaceRoles: SemanticSurfaceRoleMap | undefined
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(semanticSurfaceRolesToCssVariables(surfaceRoles)).filter(
      ([channel]) => channel.startsWith("--ds-material-")
    )
  );
}

/** The `--ds-surface-*` half, including the four compatibility aliases. */
export function semanticSurfaceRolesToSurfaceVariables(
  surfaceRoles: SemanticSurfaceRoleMap | undefined
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(semanticSurfaceRolesToCssVariables(surfaceRoles)).filter(
      ([channel]) => !channel.startsWith("--ds-material-")
    )
  );
}

/**
 * @deprecated Use `semanticSurfaceRolesToCssVariables`.
 * Kept for one compatibility cycle; this does not represent Material UI.
 */
export const semanticMaterialsToCssVariables =
  semanticSurfaceRolesToCssVariables;
