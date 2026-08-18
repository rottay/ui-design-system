/**
 * Runtime verification and ownership for tenant visual artifacts.
 *
 * This file is a compatibility facade over `foundation/admission` (snapshot,
 * verification, mount proof, SSR receipt minting, and authority resolution) and
 * `runtime/retention` (MutationObserver watch, document ledger, prepared
 * claims, and diagnostics). Those are this owner's two layers, not two peers:
 * retention consumes admission and never the reverse.
 *
 * @deprecated Prefer importing from `./foundation/admission` or
 * `./runtime/retention` directly.
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
} from "./foundation/admission";
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
} from "./foundation/admission";

export {
  retainMountedTenantThemeArtifact,
  armMountedTenantThemeArtifact,
  prepareMountedTenantThemeArtifactClaim,
  resetVisualAuthorityDiagnostics,
  reportVisualAuthorityConflict,
} from "./runtime/retention";
export type {
  RetainedArtifactWatchHandle,
  PreparedTenantThemeArtifactClaim,
} from "./runtime/retention";
