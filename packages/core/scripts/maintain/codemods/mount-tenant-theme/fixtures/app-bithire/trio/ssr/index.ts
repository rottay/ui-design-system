import {
  tenantThemeArtifactRootAttributes,
  type TenantThemeArtifact,
  type TenantThemeRootAttributes,
} from "@rottay/design-system/server";

import {
  runtimeTenantThemeAnatomyAttributes,
  type RuntimeTenantThemeResolution,
} from "../contracts";

const DEFAULT_TENANT_SLUG = "bithire";
const SAFE_TENANT_SLUG = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

export const TENANT_THEME_SSR_HEADER_MISMATCH =
  "TENANT_THEME_SSR_HEADER_MISMATCH" as const;
export const TENANT_THEME_SSR_IDENTITY_MISMATCH =
  "TENANT_THEME_SSR_IDENTITY_MISMATCH" as const;
export const TENANT_THEME_SSR_UNSAFE_SLUG =
  "TENANT_THEME_SSR_UNSAFE_SLUG" as const;

type RuntimeTenantThemeMode = "light" | "dark" | "auto";

interface ResolveRuntimeTenantThemeSsrStateInput {
  accountTenantSlug?: string;
  cssTenantSlug?: string;
  runtimeTheme?: RuntimeTenantThemeResolution | null;
}

interface RuntimeTenantThemeSsrState {
  tenantSlug: string;
  runtimeTheme: RuntimeTenantThemeResolution | null;
  runtimeArtifact: TenantThemeArtifact | undefined;
  rootThemeAttributes: TenantThemeRootAttributes;
  anatomyAttributes: Record<string, string>;
  configuredTheme: RuntimeTenantThemeMode;
  serverTheme: "light" | "dark";
}

function normalizeSlug(value: string | undefined): string | undefined {
  return value?.trim().toLowerCase() || undefined;
}

/**
 * Build the immutable SSR projection shared by the document root, inline
 * artifact, and client hydration. Conflicting headers or artifact identity
 * stop rendering before another tenant's visual identity can be emitted.
 */
export function resolveRuntimeTenantThemeSsrState({
  accountTenantSlug,
  cssTenantSlug,
  runtimeTheme = null,
}: ResolveRuntimeTenantThemeSsrStateInput): RuntimeTenantThemeSsrState {
  const normalizedAccountSlug = normalizeSlug(accountTenantSlug);
  const normalizedCssSlug = normalizeSlug(cssTenantSlug);

  if (
    normalizedAccountSlug
    && normalizedCssSlug
    && normalizedAccountSlug !== normalizedCssSlug
  ) {
    throw new Error(TENANT_THEME_SSR_HEADER_MISMATCH);
  }

  const tenantSlug =
    normalizedCssSlug ?? normalizedAccountSlug ?? DEFAULT_TENANT_SLUG;
  if (!SAFE_TENANT_SLUG.test(tenantSlug)) {
    throw new Error(TENANT_THEME_SSR_UNSAFE_SLUG);
  }

  const runtimeArtifact = runtimeTheme?.runtime.artifact;
  const invalidVerticalBaseline = runtimeTheme?.status === "vertical-baseline"
    && (
      tenantSlug !== DEFAULT_TENANT_SLUG
      || !runtimeArtifact
      || runtimeArtifact.tenantId !== DEFAULT_TENANT_SLUG
      || runtimeArtifact.slug !== DEFAULT_TENANT_SLUG
    );
  if (
    invalidVerticalBaseline
    ||
    runtimeArtifact
    && (
      runtimeArtifact.slug !== tenantSlug
      || runtimeArtifact.verticalKey !== "bithire"
    )
  ) {
    throw new Error(TENANT_THEME_SSR_IDENTITY_MISMATCH);
  }

  const rootThemeAttributes: TenantThemeRootAttributes = runtimeArtifact
    ? tenantThemeArtifactRootAttributes(runtimeArtifact)
    : {
        "data-ds-root": "",
        "data-vertical": "bithire",
        "data-tenant": tenantSlug,
      };
  const anatomyAttributes = runtimeTenantThemeAnatomyAttributes(runtimeArtifact);
  const configured = runtimeTheme?.runtime.tenantConfig.theme;
  const configuredTheme: RuntimeTenantThemeMode =
    configured === "dark" || configured === "auto" ? configured : "light";

  return {
    tenantSlug,
    runtimeTheme,
    runtimeArtifact,
    rootThemeAttributes,
    anatomyAttributes,
    configuredTheme,
    serverTheme: configuredTheme === "dark" ? "dark" : "light",
  };
}
