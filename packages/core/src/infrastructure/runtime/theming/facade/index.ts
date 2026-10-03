/**
 * @fileoverview Theming - Rottay Design System
 * @description Public barrel for runtime theming. Exports the `ThemeProvider`,
 * `ThemeContext`, `useTheme`, and `useThemeContext` so consumers can discover
 * the full theming API from a single import path.
 *
 * @module System/Theming
 * @category System
 * @package @rottay/design-system
 */
export {
  ThemeProvider,
  ThemeContext,
  useThemeContext,
} from '../composition/react/provider';
export type { ThemeProviderProps, VisualAuthority } from '../composition/react/provider';
export type { ThemeConfig, ThemeContextValue } from '../composition/react/provider';

export { useTheme, useThemeContext as useThemeContextAlias } from '../composition/react/provider/theme';

export {
  useTokens,
  useOptionalTokens,
  useColorTokens,
  useSpacingTokens,
  useMotionTokens,
  useTypographyTokens,
  useCardTokens,
  useAccentTokens,
  DEFAULT_PERSONALITY,
} from '../composition/react/tokens';
export type {
  ColorTokens,
  SpacingTokens,
  MotionTokenSlice,
  TypographyTokenSlice,
  CardTokens,
  AccentTokens,
} from '../composition/react/tokens';

export {
  censusRuntimeVisualPayload,
  resolveVisualAuthority,
  appearanceMatchesArtifact,
  verifyTenantThemeArtifactV1,
  verifyMountedTenantThemeArtifact,
  auditRetainedTenantThemeArtifact,
  emitTenantThemeArtifactForSsr,
  auditTenantThemeArtifactSsrReceipt,
  tenantThemeArtifactElementId,
  TENANT_THEME_ARTIFACT_ELEMENT_ID_PREFIX,
  tenantThemeArtifactCssIntegrity,
  TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE,
} from '../foundation/visual-authority/foundation/admission';
export {
  reportVisualAuthorityConflict,
  resetVisualAuthorityDiagnostics,
  retainMountedTenantThemeArtifact,
  // `armMountedTenantThemeArtifact` is deliberately NOT re-exported. It is the
  // ledger's commit-phase write, and the only supported way to reach it is the
  // claim below, which keeps render read-only.
  prepareMountedTenantThemeArtifactClaim,
} from '../foundation/visual-authority/runtime/retention';
export type {
  CompiledArtifactDeclaration,
  ProviderDeclaration,
  RuntimeVisualPayloadCensus,
  VisualAuthorityDeclaration,
  VisualAuthorityInput,
  VisualAuthorityOrigin,
  VisualAuthorityConflictKind,
  VisualAuthorityResolution,
  TenantThemeArtifactExpectation,
  TenantThemeArtifactVerification,
  MountedTenantThemeArtifactVerification,
  TenantThemeArtifactSsrEmission,
  TenantThemeArtifactSsrEmissionReceipt,
} from '../foundation/visual-authority/foundation/admission';
export type { PreparedTenantThemeArtifactClaim } from '../foundation/visual-authority/runtime/retention';

export {
  ROTTAY_CASCADE_LAYER_ORDER,
  PERSONALITY_CASCADE_LAYER,
  TENANT_PAINT_IS_UNLAYERED,
} from '../foundation/cascade-layers';
