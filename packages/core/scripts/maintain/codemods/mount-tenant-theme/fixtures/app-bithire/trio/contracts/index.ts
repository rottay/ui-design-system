import {
  TENANT_THEME_COMPILER_VERSION,
  type TenantConfig,
} from "@rottay/design-system";
import {
  TENANT_THEME_V1_COVERAGE,
  TENANT_VISUAL_CHANNELS,
  tenantThemeAnatomyAttributes,
  type TenantThemeArtifact,
} from "@rottay/design-system/server";

const SAFE_TENANT_SLUG = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

/** Shared by SSR layout emission and the client refresh hook. */
export const RUNTIME_TENANT_THEME_STYLE_ID = "ds-runtime-tenant-theme" as const;

export type RuntimeTenantThemeFallbackCode =
  | "missing-config"
  | "inactive-config"
  | "invalid-config"
  | "tenant-mismatch"
  | "unknown-schema-version"
  | "unsafe-tenant-slug"
  | "vertical-mismatch";

/**
 * App transport around the canonical DS artifact.
 *
 * The DS remains the sole owner of schemaVersion, compilerVersion, digest,
 * variables, CSS, and provider scopes. BitHire adds only an immutable cache
 * key, HTTP validator, and the exact TenantConfig identity/branding envelope
 * consumed by its provider.
 */
export interface RuntimeTenantThemeArtifact {
  /** `${tenantId}:${rowVersion}:${compilerVersion}`. */
  cacheKey: string;
  /** Strong ETag derived from the DS-owned artifact digest. */
  etag: string;
  artifact: TenantThemeArtifact;
  tenantConfig: TenantConfig;
}

export interface RuntimeTenantThemeResolution {
  status: "fresh" | "last-known-valid" | "vertical-baseline";
  runtime: RuntimeTenantThemeArtifact;
  fallbackCode?: RuntimeTenantThemeFallbackCode;
}

/** Public branding route shape needed by the client refresh hook. */
export interface RuntimeTenantBrandingPayload {
  slug?: unknown;
  runtimeTheme?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCompiledVariableMap(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.entries(value).every(
    ([key, tokenValue]) => key.startsWith("--ds-") && typeof tokenValue === "string",
  );
}

/**
 * The artifact's coverage is what the provider suppresses, so a payload that
 * under-declares it would leave a provider emitter painting over the compiled
 * artifact. Accept only the exact v1 set.
 */
function isV1Coverage(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  const channels = TENANT_VISUAL_CHANNELS as readonly string[];
  return (
    value.length === TENANT_THEME_V1_COVERAGE.length
    && value.every((entry) => typeof entry === "string" && channels.includes(entry))
    && new Set(value).size === value.length
    && TENANT_THEME_V1_COVERAGE.every((channel) => value.includes(channel))
  );
}

/**
 * Narrow an untrusted API payload before it can replace the currently rendered
 * tenant. The DS/server performs full schema validation; the browser repeats
 * the identity/digest envelope checks to prevent cross-tenant state reuse.
 */
function isRuntimeTenantThemeResolution(
  value: unknown,
  expectedTenantSlug?: string,
): value is RuntimeTenantThemeResolution {
  if (!isRecord(value) || !isRecord(value.runtime)) return false;
  const runtime = value.runtime;
  if (!isRecord(runtime.artifact) || !isRecord(runtime.tenantConfig)) {
    return false;
  }

  const artifact = runtime.artifact;
  const normalizedExpectedSlug = expectedTenantSlug?.trim().toLowerCase();
  const digest = artifact.digest;
  const expectedCacheKey = `${artifact.tenantId}:${artifact.rowVersion}:${artifact.compilerVersion}`;
  const expectedSelector = typeof artifact.slug === "string"
    ? `[data-ds-root][data-vertical="bithire"][data-tenant][data-tenant="${artifact.slug}"]`
    : "";
  const scopes = artifact.scopes;
  const tenantConfig = runtime.tenantConfig;

  return (
    (value.status === "fresh"
      || value.status === "last-known-valid"
      || (
        value.status === "vertical-baseline"
        && artifact.tenantId === "bithire"
        && artifact.slug === "bithire"
      ))
    && artifact.schemaVersion === 1
    && typeof artifact.tenantId === "string"
    && artifact.tenantId.length > 0
    && typeof artifact.slug === "string"
    && SAFE_TENANT_SLUG.test(artifact.slug)
    && (!normalizedExpectedSlug || artifact.slug === normalizedExpectedSlug)
    && artifact.verticalKey === "bithire"
    && typeof artifact.rowVersion === "number"
    && Number.isSafeInteger(artifact.rowVersion)
    && artifact.rowVersion >= 0
    && artifact.compilerVersion === TENANT_THEME_COMPILER_VERSION
    && typeof artifact.verticalEnvelopeDigest === "string"
    && /^sha256-[a-f0-9]{64}$/.test(artifact.verticalEnvelopeDigest)
    && typeof digest === "string"
    && /^sha256-[a-f0-9]{64}$/.test(digest)
    && typeof artifact.css === "string"
    && artifact.css.includes(digest)
    && artifact.css.includes(expectedSelector)
    && !artifact.css.includes("@layer")
    && isCompiledVariableMap(artifact.variables)
    && isV1Coverage(artifact.coverage)
    && isRecord(artifact.normalizedAppearance)
    && isRecord(scopes)
    && isRecord(scopes.root)
    && scopes.root.attribute === "data-ds-root"
    && scopes.root.selector === ":where([data-ds-root])"
    && isRecord(scopes.vertical)
    && scopes.vertical.attribute === "data-vertical"
    && scopes.vertical.value === "bithire"
    && scopes.vertical.selector === ':where([data-ds-root][data-vertical="bithire"])'
    && isRecord(scopes.tenant)
    && scopes.tenant.attribute === "data-tenant"
    && scopes.tenant.value === artifact.slug
    && scopes.tenant.selector === `:where([data-ds-root][data-tenant="${artifact.slug}"])`
    && scopes.combinedSelector === expectedSelector
    && runtime.cacheKey === expectedCacheKey
    && runtime.etag === `"tenant-theme-${digest}"`
    && tenantConfig.slug === artifact.slug
    && tenantConfig.vertical === "bithire"
    && (tenantConfig.theme === "light"
      || tenantConfig.theme === "dark"
      || tenantConfig.theme === "auto")
    && Array.isArray(tenantConfig.features)
    && tenantConfig.features.length === 1
    && tenantConfig.features[0] === "*"
    && isRecord(tenantConfig.branding)
    && typeof tenantConfig.branding.companyName === "string"
    && !Object.prototype.hasOwnProperty.call(tenantConfig, "engine")
    && !Object.prototype.hasOwnProperty.call(tenantConfig, "brandTheme")
    && !Object.prototype.hasOwnProperty.call(tenantConfig, "personality")
    && !Object.prototype.hasOwnProperty.call(tenantConfig, "componentPack")
  );
}

export function readRuntimeTenantThemeResolution(
  payload: RuntimeTenantBrandingPayload | null | undefined,
  expectedTenantSlug: string,
): RuntimeTenantThemeResolution | null {
  const normalizedSlug = expectedTenantSlug.trim().toLowerCase();
  if (payload?.slug !== normalizedSlug) return null;

  return isRuntimeTenantThemeResolution(payload.runtimeTheme, normalizedSlug)
    ? payload.runtimeTheme
    : null;
}

/**
 * Project the compiled artifact's closed anatomy selections into the
 * `data-anatomy-*` root attributes stamped by SSR and client hydration alike.
 *
 * Fails closed: a missing artifact or a non-record appearance envelope stamps
 * nothing rather than throwing at render, and the DS projection itself already
 * drops `default`/absent/out-of-vocabulary values, so pre-anatomy tenants emit
 * zero attributes.
 */
export function runtimeTenantThemeAnatomyAttributes(
  artifact: Pick<TenantThemeArtifact, "normalizedAppearance"> | null | undefined,
): Record<string, string> {
  if (!artifact || !isRecord(artifact.normalizedAppearance)) return {};
  return tenantThemeAnatomyAttributes(artifact);
}
