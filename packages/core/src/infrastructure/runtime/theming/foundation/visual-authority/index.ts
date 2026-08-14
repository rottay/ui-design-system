/**
 * Runtime verification and ownership for tenant visual artifacts.
 *
 * This file is a compatibility facade over `admission` (snapshot, verification,
 * mount proof, SSR receipt minting, and authority resolution) and `retention`
 * (MutationObserver watch, document ledger, prepared claims, and diagnostics).
 *
 * @deprecated Prefer importing from `./admission` or `./retention` directly.
 */

export {
  TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_ELEMENT_ID_PREFIX,
  censusRuntimeVisualPayload,
  verifyTenantThemeArtifactV1,
  verifyMountedTenantThemeArtifact,
  auditRetainedTenantThemeArtifact,
  tenantThemeArtifactCssIntegrity,
  tenantThemeArtifactElementId,
  emitTenantThemeArtifactForSsr,
  auditTenantThemeArtifactSsrReceipt,
  appearanceMatchesArtifact,
  resolveVisualAuthority,
} from "./admission";
export type {
  VisualAuthority,
  VisualAuthorityOrigin,
  ProviderDeclaration,
  CompiledArtifactDeclaration,
  VisualAuthorityDeclaration,
  RuntimeVisualPayloadCensus,
  TenantThemeArtifactExpectation,
  TenantThemeArtifactVerification,
  MountedTenantThemeArtifactVerification,
  TenantThemeArtifactSsrEmissionReceipt,
  TenantThemeArtifactSsrEmission,
  VisualAuthorityInput,
  VisualAuthorityResolution,
} from "./admission";

export {
  retainMountedTenantThemeArtifact,
  armMountedTenantThemeArtifact,
  prepareMountedTenantThemeArtifactClaim,
  resetVisualAuthorityDiagnostics,
  reportVisualAuthorityConflict,
} from "./retention";
export type {
  RetainedArtifactWatchHandle,
  PreparedTenantThemeArtifactClaim,
} from "./retention";
