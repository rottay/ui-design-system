import type { TenantConfig, TenantPlan } from "@rottay/design-system";
import {
  TENANT_THEME_COMPILER_VERSION,
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  parseTenantThemeConfig,
  type TenantThemeArtifact,
  type TenantThemeConfigIdentity,
  type TenantThemeConfig,
} from "@rottay/design-system/server";

import type {
  RuntimeTenantThemeArtifact,
  RuntimeTenantThemeFallbackCode,
  RuntimeTenantThemeResolution,
} from "@/core/lib/theme/runtime-tenant-theme/contracts";

const STATIC_VERTICAL = "bithire" as const;
const STATIC_VERTICAL_ENVELOPE = getTenantThemeVerticalEnvelope(STATIC_VERTICAL);
if (!STATIC_VERTICAL_ENVELOPE) {
  throw new Error(`Missing canonical tenant-theme envelope for ${STATIC_VERTICAL}`);
}
const STATIC_DS_FEATURES = ["*"] as const;
const MAX_CACHE_ENTRIES = 128;
// Mirrors the canonical TenantThemeConfig v1 slug format (1..64 chars).
const SAFE_TENANT_SLUG = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

interface RuntimeThemeTenantRecord {
  id: string;
  slug: string;
  name: string;
  planType?: string | null;
}

interface RuntimeThemeWhitelabelRecord {
  tenantId: string;
  version?: number | null;
  verticalKey?: string | null;
  config?: (Record<string, unknown> & {
    tenantTheme?: unknown;
  }) | null;
  isActive?: boolean | null;
}

interface RuntimeThemeBrandIdentity {
  companyName: string;
  logo?: string | null;
  logoMark?: string | null;
  favicon?: string | null;
  locale?: string | null;
}

interface ResolveRuntimeTenantThemeInput {
  tenant: RuntimeThemeTenantRecord;
  whitelabel: RuntimeThemeWhitelabelRecord | null;
  branding: RuntimeThemeBrandIdentity;
  /** Newest-first published snapshots returned by the tenancy module. */
  publishedHistory?: readonly PublishedRuntimeTenantThemeHistoryRow[];
}

export interface PublishedRuntimeTenantThemeHistoryRow {
  index?: number;
  version: number;
  config: (Record<string, unknown> & { tenantTheme?: unknown }) | null;
  publishedAt?: string | Date | null;
  publishedBy?: string | null;
}

// Only the canonical DS artifact is version-cached. The provider envelope is
// rebuilt from current app-owned identity/plan/branding so those fields cannot
// become stale behind a theme-only cache key.
const compiledByVersion = new Map<string, TenantThemeArtifact>();
const lastKnownValidByTenantId = new Map<string, TenantThemeArtifact>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) {
      deepFreeze(child);
    }
    Object.freeze(value);
  }
  return value;
}

function setBounded<K, V>(map: Map<K, V>, key: K, value: V): void {
  if (map.has(key)) map.delete(key);
  map.set(key, value);
  while (map.size > MAX_CACHE_ENTRIES) {
    const oldest = map.keys().next().value as K | undefined;
    if (oldest === undefined) break;
    map.delete(oldest);
  }
}

function toTenantPlan(planType: string | null | undefined): TenantPlan {
  switch (planType?.toLowerCase()) {
    case "enterprise":
    case "full_deployment":
      return "enterprise";
    case "pro":
    case "professional":
      return "pro";
    default:
      return "starter";
  }
}

function normalizedRowVersion(value: number | null | undefined): number | null {
  return Number.isSafeInteger(value) && (value as number) >= 0
    ? (value as number)
    : null;
}

function trustedIdentity(
  tenant: RuntimeThemeTenantRecord,
  rowVersion: number,
): TenantThemeConfigIdentity {
  return {
    tenantId: tenant.id,
    slug: tenant.slug.trim().toLowerCase(),
    verticalKey: STATIC_VERTICAL,
    rowVersion,
  };
}

function hasAnyHydratedIdentity(value: Record<string, unknown>): boolean {
  return ["tenantId", "slug", "verticalKey", "rowVersion"].some((key) =>
    Object.prototype.hasOwnProperty.call(value, key),
  );
}

function identitiesMatch(
  config: TenantThemeConfig,
  identity: TenantThemeConfigIdentity,
): boolean {
  return (
    config.tenantId === identity.tenantId
    && config.slug === identity.slug
    && config.verticalKey === identity.verticalKey
    && config.rowVersion === identity.rowVersion
  );
}

function readCanonicalConfig(
  value: unknown,
  identity: TenantThemeConfigIdentity,
): TenantThemeConfig {
  if (isRecord(value) && hasAnyHydratedIdentity(value)) {
    const config = parseTenantThemeConfig(value);
    if (!identitiesMatch(config, identity)) {
      throw new RuntimeThemeResolutionFailure("tenant-mismatch");
    }
    return config;
  }

  return hydrateTenantThemeConfig(value, identity, {
    expectedIdentity: identity,
  });
}

class RuntimeThemeResolutionFailure extends Error {
  readonly code: RuntimeTenantThemeFallbackCode;

  constructor(code: RuntimeTenantThemeFallbackCode) {
    super(code);
    this.name = "RuntimeThemeResolutionFailure";
    this.code = code;
  }
}

/**
 * A customer tenant has no trustworthy DB-owned theme artifact to render.
 *
 * This error deliberately crosses the server boundary so pages and public
 * branding routes fail closed instead of silently impersonating the BitHire
 * vertical baseline. `historyRecoverable` tells the server wrapper whether a
 * same-tenant published snapshot is still an admissible recovery tier.
 */
export class RuntimeTenantThemeUnavailableError extends Error {
  readonly code = "TENANT_THEME_UNAVAILABLE" as const;
  readonly fallbackCode: RuntimeTenantThemeFallbackCode;
  readonly historyRecoverable: boolean;

  constructor(
    fallbackCode: RuntimeTenantThemeFallbackCode,
    historyRecoverable: boolean,
  ) {
    super(`Tenant theme unavailable: ${fallbackCode}`);
    this.name = "RuntimeTenantThemeUnavailableError";
    this.fallbackCode = fallbackCode;
    this.historyRecoverable = historyRecoverable;
  }
}

export function isRuntimeTenantThemeUnavailableError(
  value: unknown,
): value is RuntimeTenantThemeUnavailableError {
  return value instanceof RuntimeTenantThemeUnavailableError
    || (
      isRecord(value)
      && value.code === "TENANT_THEME_UNAVAILABLE"
      && typeof value.fallbackCode === "string"
      && typeof value.historyRecoverable === "boolean"
    );
}

function classifyThemeFailure(value: unknown, fallback: RuntimeTenantThemeFallbackCode): RuntimeTenantThemeFallbackCode {
  if (value instanceof RuntimeThemeResolutionFailure) return value.code;
  if (isRecord(value) && typeof value.schemaVersion === "number" && value.schemaVersion !== 1) {
    return "unknown-schema-version";
  }
  return fallback;
}

function buildTenantConfig(
  tenant: RuntimeThemeTenantRecord,
  branding: RuntimeThemeBrandIdentity,
  artifact: TenantThemeArtifact,
): TenantConfig {
  const appearance = artifact.normalizedAppearance;
  const backgroundMode = appearance.general?.palette?.backgroundMode;

  return {
    slug: artifact.slug,
    name: branding.companyName || tenant.name,
    theme: backgroundMode ?? "light",
    ...(branding.locale ? { locale: branding.locale as TenantConfig["locale"] } : {}),
    plan: toTenantPlan(tenant.planType),
    // DS presentation flags are vertical/app-owned. Product authorization
    // remains in AuthProvider/svc-auth and is never read from the theme row.
    features: [...STATIC_DS_FEATURES],
    vertical: STATIC_VERTICAL,
    branding: {
      companyName: branding.companyName || tenant.name,
      ...(branding.logo ? { logo: branding.logo } : {}),
      ...(branding.logoMark ? { logoMark: branding.logoMark } : {}),
      ...(branding.favicon ? { favicon: branding.favicon } : {}),
    },
    appearance,
  };
}

function compileRuntimeArtifact(
  tenant: RuntimeThemeTenantRecord,
  branding: RuntimeThemeBrandIdentity,
  config: TenantThemeConfig,
  cache: boolean,
): RuntimeTenantThemeArtifact {
  const cacheKey = `${config.tenantId}:${config.rowVersion}:${TENANT_THEME_COMPILER_VERSION}`;
  let artifact: TenantThemeArtifact | undefined;
  if (cache) {
    artifact = compiledByVersion.get(cacheKey);
  }

  if (!artifact) {
    artifact = compileTenantThemeConfig(config, {
      verticalEnvelope: STATIC_VERTICAL_ENVELOPE,
    });
  }
  const runtime = deepFreeze<RuntimeTenantThemeArtifact>({
    cacheKey,
    etag: `"tenant-theme-${artifact.digest}"`,
    artifact,
    tenantConfig: buildTenantConfig(tenant, branding, artifact),
  });

  if (cache) setBounded(compiledByVersion, cacheKey, artifact);
  return runtime;
}

function compileNewestPublishedHistory(
  tenant: RuntimeThemeTenantRecord,
  branding: RuntimeThemeBrandIdentity,
  beforeOrAtRowVersion: number,
  rows: readonly PublishedRuntimeTenantThemeHistoryRow[] | undefined,
): RuntimeTenantThemeArtifact | null {
  if (!rows?.length) return null;

  const newestFirst = [...rows].sort((left, right) => right.version - left.version);
  for (const row of newestFirst) {
    const version = normalizedRowVersion(row.version);
    if (version === null || version > beforeOrAtRowVersion) continue;
    const historicalTheme = row.config?.tenantTheme;
    if (historicalTheme === undefined || historicalTheme === null) continue;

    try {
      // History records are hydrated by tenancy from trusted columns. Repeat
      // the identity checks here so even a faulty adapter cannot cross tenants.
      const historicalConfig = parseTenantThemeConfig(historicalTheme);
      const expected = trustedIdentity(tenant, version);
      if (!identitiesMatch(historicalConfig, expected)) continue;

      return compileRuntimeArtifact(tenant, branding, historicalConfig, true);
    } catch {
      // Retention can span older schema/compiler generations. Continue toward
      // the next same-tenant snapshot; never substitute another tenant.
    }
  }
  return null;
}

function recoverRuntimeTenantTheme(
  tenant: RuntimeThemeTenantRecord,
  branding: RuntimeThemeBrandIdentity,
  rowVersion: number,
  fallbackCode: RuntimeTenantThemeFallbackCode,
  allowRecovery = false,
  publishedHistory?: readonly PublishedRuntimeTenantThemeHistoryRow[],
): RuntimeTenantThemeResolution {
  const normalizedSlug = tenant.slug.trim().toLowerCase();
  const lastKnownValid = lastKnownValidByTenantId.get(tenant.id);

  if (
    allowRecovery
    && lastKnownValid
    && lastKnownValid.tenantId === tenant.id
    && lastKnownValid.slug === normalizedSlug
    && lastKnownValid.verticalKey === STATIC_VERTICAL
    && lastKnownValid.rowVersion <= rowVersion
  ) {
    return deepFreeze({
      status: "last-known-valid",
      runtime: deepFreeze<RuntimeTenantThemeArtifact>({
        cacheKey: `${lastKnownValid.tenantId}:${lastKnownValid.rowVersion}:${lastKnownValid.compilerVersion}`,
        etag: `"tenant-theme-${lastKnownValid.digest}"`,
        artifact: lastKnownValid,
        tenantConfig: buildTenantConfig(tenant, branding, lastKnownValid),
      }),
      fallbackCode,
    });
  }

  if (allowRecovery) {
    const durable = compileNewestPublishedHistory(
      tenant,
      branding,
      rowVersion,
      publishedHistory,
    );
    if (durable) {
      setBounded(lastKnownValidByTenantId, tenant.id, durable.artifact);
      return deepFreeze({
        status: "last-known-valid",
        runtime: durable,
        fallbackCode,
      });
    }
  }

  throw new RuntimeTenantThemeUnavailableError(fallbackCode, allowRecovery);
}

/**
 * Resolve the file-owned BitHire identity. Customer tenants must never call
 * this entrypoint: their complete anatomy is DB-owned and fail-closed below.
 */
export function resolveBundledRuntimeTenantTheme({
  tenant,
  branding,
}: Pick<ResolveRuntimeTenantThemeInput, "tenant" | "branding">): RuntimeTenantThemeResolution {
  const normalizedSlug = tenant.slug.trim().toLowerCase();
  if (tenant.id !== STATIC_VERTICAL || normalizedSlug !== STATIC_VERTICAL) {
    throw new RuntimeTenantThemeUnavailableError("tenant-mismatch", false);
  }

  const baselineConfig = hydrateTenantThemeConfig(
    { schemaVersion: 1, mode: "simple", appearance: {} },
    trustedIdentity(tenant, 0),
  );
  return deepFreeze({
    status: "vertical-baseline",
    runtime: compileRuntimeArtifact(tenant, branding, baselineConfig, false),
  });
}

/**
 * Resolve one tenant's DB document into the sole DS-owned runtime artifact.
 *
 * Cache identity is row-based, never hostname-based. A rejected document may
 * reuse only the same tenant id's last known valid artifact or a validated
 * same-tenant published snapshot. Otherwise resolution fails closed. The
 * static BitHire baseline is available only through the bundled entrypoint.
 */
export function resolveRuntimeTenantTheme({
  tenant,
  whitelabel,
  branding,
  publishedHistory,
}: ResolveRuntimeTenantThemeInput): RuntimeTenantThemeResolution {
  const normalizedSlug = tenant.slug.trim().toLowerCase();
  if (!SAFE_TENANT_SLUG.test(normalizedSlug)) {
    // There is no safe selector that can still represent this tenant identity.
    // Do not substitute BitHire or another shared slug.
    throw new RuntimeTenantThemeUnavailableError("unsafe-tenant-slug", false);
  }

  const rowVersion = normalizedRowVersion(whitelabel?.version);
  const recoveryCeiling = rowVersion ?? Number.MAX_SAFE_INTEGER;

  if (!whitelabel) {
    return recoverRuntimeTenantTheme(
      tenant,
      branding,
      recoveryCeiling,
      "missing-config",
      true,
      publishedHistory,
    );
  }
  if (whitelabel.isActive === false) {
    return recoverRuntimeTenantTheme(tenant, branding, recoveryCeiling, "inactive-config", false);
  }
  if (whitelabel.tenantId !== tenant.id) {
    return recoverRuntimeTenantTheme(tenant, branding, recoveryCeiling, "tenant-mismatch", false);
  }
  if (whitelabel.verticalKey && whitelabel.verticalKey !== STATIC_VERTICAL) {
    return recoverRuntimeTenantTheme(tenant, branding, recoveryCeiling, "vertical-mismatch", false);
  }

  const themePayload = whitelabel.config?.tenantTheme;

  if (themePayload === undefined || themePayload === null) {
    return recoverRuntimeTenantTheme(
      tenant,
      branding,
      recoveryCeiling,
      "invalid-config",
      true,
      publishedHistory,
    );
  }
  if (rowVersion === null) {
    return recoverRuntimeTenantTheme(
      tenant,
      branding,
      recoveryCeiling,
      "invalid-config",
      true,
      publishedHistory,
    );
  }

  const identity = trustedIdentity(tenant, rowVersion);
  try {
    const hydrated = readCanonicalConfig(themePayload, identity);
    const runtime = compileRuntimeArtifact(tenant, branding, hydrated, true);
    setBounded(lastKnownValidByTenantId, tenant.id, runtime.artifact);
    return deepFreeze({ status: "fresh", runtime });
  } catch (error) {
    return recoverRuntimeTenantTheme(
      tenant,
      branding,
      rowVersion,
      classifyThemeFailure(themePayload, classifyThemeFailure(error, "invalid-config")),
      true,
      publishedHistory,
    );
  }
}

/** Test-only cache reset; production callers should never invalidate LKV. */
export function resetRuntimeTenantThemeCachesForTests(): void {
  if (process.env.NODE_ENV !== "test") return;
  compiledByVersion.clear();
  lastKnownValidByTenantId.clear();
}
