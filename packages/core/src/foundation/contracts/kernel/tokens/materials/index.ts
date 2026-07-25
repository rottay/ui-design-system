/**
 * Semantic surface-role contracts.
 *
 * A surface role is coordinated paint, not a component-specific recipe and
 * not an integration with Material UI. Components consume these roles so a
 * brand can move from flat and editorial to soft, tactile or luminous without
 * rebuilding its anatomy.
 *
 * The source directory keeps its former `materials` segment for one
 * compatibility cycle. New code must use the `SemanticSurfaceRole*` names.
 */

export const SEMANTIC_SURFACE_ROLES = [
  "canvas",
  "shell",
  "panel",
  "card",
  "inset",
  "control",
  "raised",
  "overlay",
] as const;

export type SemanticSurfaceRole = (typeof SEMANTIC_SURFACE_ROLES)[number];

/** Coordinated paint facets for one semantic surface level. */
export interface SemanticSurfaceRoleTokens {
  /** Main fill or gradient for the role. */
  background?: string;
  /** Hover fill for roles that expose an interactive state. */
  backgroundHover?: string;
  /** Pressed/active fill for roles that expose an interactive state. */
  backgroundActive?: string;
  /** Selected fill; distinct from transient hover/active feedback. */
  backgroundSelected?: string;
  /** Disabled fill. Must remain distinguishable without relying on opacity. */
  backgroundDisabled?: string;
  /** Default readable content color on the role. */
  foreground?: string;
  /** Secondary content color that remains readable on the role. */
  foregroundMuted?: string;
  /** Disabled content color coordinated with the disabled fill. */
  foregroundDisabled?: string;
  /** Quiet edge used by the role at rest. */
  border?: string;
  /** Higher-contrast edge used for selected or emphasized anatomy. */
  borderStrong?: string;
  /** Interactive edge at hover. */
  borderHover?: string;
  /** Pressed/active edge. */
  borderActive?: string;
  /** Persistent selected edge. */
  borderSelected?: string;
  /** Disabled edge coordinated with the disabled fill. */
  borderDisabled?: string;
  /** Accessible focus treatment coordinated with the role. */
  focusRing?: string;
  /** Resting depth. Use `none` for flat/editorial brands. */
  shadow?: string;
  /** Hover/active depth; components decide when the state is meaningful. */
  shadowHover?: string;
  /** Pressed depth; commonly flatter than the resting or hover depth. */
  shadowActive?: string;
  /**
   * Persistent selected depth. May include the selected ring in the same
   * shadow list so flat themes can safely author `none` without producing an
   * invalid `none, <ring>` composite.
   */
  shadowSelected?: string;
  /** Optical top-light or inner highlight. */
  highlight?: string;
  /** Code-owned or safely compiled subtle texture/gradient layer. */
  texture?: string;
}

/**
 * Cross-product surface hierarchy. Every role is optional so vertical and
 * tenant layers can override only the material facets they own.
 */
export type SemanticSurfaceRoleMap = Partial<
  Record<SemanticSurfaceRole, SemanticSurfaceRoleTokens>
>;

/** @deprecated Use `SEMANTIC_SURFACE_ROLES`. Removed in the next schema major. */
export const SEMANTIC_MATERIAL_ROLES = SEMANTIC_SURFACE_ROLES;
/** @deprecated Use `SemanticSurfaceRole`. */
export type SemanticMaterialRole = SemanticSurfaceRole;
/** @deprecated Use `SemanticSurfaceRoleTokens`. */
export type SemanticMaterialRoleTokens = SemanticSurfaceRoleTokens;
/** @deprecated Use `SemanticSurfaceRoleMap`. */
export type SemanticMaterialTokens = SemanticSurfaceRoleMap;
