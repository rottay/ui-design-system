/**
 * Root Layout - Application Shell
 *
 * Wraps the entire BitHire application with:
 *  - Inter font family
 *  - Global CSS + DS styles
 *  - Tenant data attribute for CSS theming (resolved from server headers)
 *  - Theme preference hydration script (prevents FOUC)
 *  - Provider stack (auth, theming, query client)
 *
 * Tenant white-labeling: bundled BitHire uses its static vertical baseline.
 * Custom tenants resolve a versioned DB artifact that is embedded byte-for-byte
 * for SSR and handed to the client for hydration. A custom lookup never falls
 * back to the BitHire identity.
 */
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Fraunces, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import {
  getKnownTenantConfig,
  provideServerIconExpressiveProfile,
  resolveActiveIconExpressiveProfile,
} from "@rottay/design-system/server";
import { Providers } from "@/core/providers";
import { RUNTIME_TENANT_THEME_STYLE_ID } from "@/core/lib/theme/runtime-tenant-theme/contracts";
import { resolveRuntimeTenantThemeSsrState } from "@/core/lib/theme/runtime-tenant-theme/ssr";
import {
  buildThemePrepaintScript,
  resolveDocumentRootAttributes,
} from "@rottay/design-system/server";
import {
  APP_NAME,
  APP_DESCRIPTION,
} from "@/vertical/model/profile/app-identity";
import { BITHIRE_ANATOMY_ATTRIBUTES } from "@/vertical/model/profile/anatomy";
import { isBundledTenantSlug } from "@/core/lib/tenancy/bundled-tenants";
import { resolveRequestTenantSlug } from "@/core/lib/tenancy/request-tenant";
import { readTenantCanaryTenantSlug } from "@/core/lib/tenancy/tenant-canary";
import { resolveBrandAssetUrl } from "@/core/lib/tenancy/brand-presentation";
import { resolveRequestBrandPresentation } from "@/core/lib/tenancy/request-tenant-branding";
import type { TenantBranding } from "@/core/lib/tenancy/get-tenant-branding";
import { resolveHtmlLangDir } from "@/core/lib/i18n";
import "./globals.css";
import "./styles/index.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

// Code-owned BitHire vertical font pack. TenantTheme may reference only the
// stable `--ds-font-pack-*` handle; the DB never supplies a URL or @font-face.
const editorial = Fraunces({
  subsets: ["latin"],
  variable: "--ds-font-pack-editorial-display",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "Times New Roman", "serif"],
});

/**
 * Resolve custom-tenant white-label branding without pulling tenancy/DB modules
 * into the default (bundled-tenant) render path.
 *
 * Mirrors the gated dynamic-import pattern used by the auth layout: bundled
 * tenants and missing slugs short-circuit to `null` (static BitHire identity),
 * and only non-bundled tenants load `getTenantBranding`. The result is memoized
 * per request by the underlying React `cache()`, so calling this from both
 * `generateMetadata` and the layout body resolves the lookup once.
 */
async function resolveCustomTenantBranding(
  accountTenantSlug: string | undefined,
): Promise<TenantBranding | null> {
  if (isBundledTenantSlug(accountTenantSlug)) return null;

  // Dynamic import keeps bundled pages from pulling tenancy/DB modules into
  // the default render path while still supporting custom tenants. Lookup
  // failures propagate; a custom tenant must never render BitHire by accident.
  const { getTenantBranding } = await import(
    "@/core/lib/tenancy/get-tenant-branding"
  );
  const branding = await getTenantBranding(accountTenantSlug);
  if (!branding) notFound();
  return branding;
}

async function getAccountTenantSlug(): Promise<string | undefined> {
  const headersList = await headers();
  return (
    readTenantCanaryTenantSlug(headersList)
    ?? (await resolveRequestTenantSlug(headersList))
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const branding = await resolveCustomTenantBranding(
    await getAccountTenantSlug(),
  );

  // Bundled tenants / dev: keep the static BitHire identity unchanged.
  if (!branding) {
    return {
      title: {
        default: APP_NAME,
        template: `%s | ${APP_NAME}`,
      },
      description: APP_DESCRIPTION,
    };
  }

  // Custom tenant: apply favicon + title suffix from white-label branding.
  const brandName = branding.branding.companyName || APP_NAME;
  const titleSuffix = branding.rendering.titleSuffix;
  const favicon = resolveBrandAssetUrl(branding.branding.favicon);

  return {
    title: {
      default: brandName,
      // Honor an explicit white-label title suffix (e.g. " — Careers"); fall
      // back to the conventional "%s | Brand" template otherwise.
      template: titleSuffix ? `%s${titleSuffix}` : `%s | ${brandName}`,
    },
    description: APP_DESCRIPTION,
    ...(favicon ? { icons: { icon: favicon } } : {}),
  };
}

/**
 * Tint the browser UI (mobile address bar, installed PWA chrome) with the
 * resolved tenant primary: bundled BitHire yields its static brand primary, a
 * custom tenant its compiled `--ds-color-primary`. Shares the request-scoped
 * brand read with the manifest, so `theme-color` and the manifest agree.
 */
export async function generateViewport(): Promise<Viewport> {
  const brand = await resolveRequestBrandPresentation();
  return { themeColor: brand.primaryColor };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side tenant resolution: prefer the header injected by middleware,
  // fall back to "bithire" for local dev / direct access.
  const headersList = await headers();
  // The two-tenant canary renders the same tree under a second identity on one
  // origin, so the session stays valid. The reader re-checks its own gate, so
  // the header is inert wherever the canary may not run.
  const accountTenantSlug =
    readTenantCanaryTenantSlug(headersList)
    ?? (await resolveRequestTenantSlug(headersList));
  const brandArtifactSlug =
    headersList.get("x-brand-artifact-slug") ?? undefined;
  const cssTenantSlug = accountTenantSlug;

  const branding = await resolveCustomTenantBranding(accountTenantSlug);
  const {
    tenantSlug,
    runtimeTheme,
    runtimeArtifact,
    anatomyAttributes,
    configuredTheme,
    // `rootThemeAttributes` and `serverTheme` are no longer read here: the DS
    // projection now owns the tenant scope and resolves the theme from
    // `configuredTheme`. Leaving them destructured would suggest two sources
    // still compete for the same attributes.
  } = resolveRuntimeTenantThemeSsrState({
    accountTenantSlug,
    cssTenantSlug,
    runtimeTheme: branding?.runtimeTheme,
  });

  // Server Components in this request render icons OUTSIDE the client
  // provider tree; the DS per-request seam receives the same posture the
  // provider derives, from the same resolver: the compiled artifact's
  // appearance for a custom tenant, the bundled BrandTheme otherwise.
  provideServerIconExpressiveProfile(
    resolveActiveIconExpressiveProfile(
      runtimeArtifact
        ? { appearance: runtimeArtifact.normalizedAppearance }
        : getKnownTenantConfig(brandArtifactSlug ?? "bithire"),
    ),
  );

  // Bundled BitHire projects its static vertical anatomy onto the root; a
  // resolved DB artifact stamps its own anatomy (anatomyAttributes, spread last)
  // instead, so a custom tenant's chrome selection is never overridden.
  const bundledAnatomyAttributes = runtimeArtifact
    ? {}
    : BITHIRE_ANATOMY_ATTRIBUTES;

  // Every GOVERNED root attribute comes from ONE design-system projection:
  // `data-theme`, `data-tenant-theme-mode`, `data-engine`, `lang`, `dir` and the
  // tenant scope. The layout used to assemble those by hand from three separate
  // resolvers, which is how `data-engine` ended up client-only -- engine-scoped
  // CSS did not match until hydration.
  //
  // `auto` is deliberately NOT resolved here: the server cannot read
  // `prefers-color-scheme`, so the projection renders the declared fallback and
  // preserves the intent for the pre-paint script below.
  const { lang } = resolveHtmlLangDir(branding?.locale ?? undefined);
  const documentRootAttributes = resolveDocumentRootAttributes({
    themeMode: configuredTheme,
    engine: "modern",
    locale: lang,
    tenant: runtimeArtifact
      ? { slug: runtimeArtifact.slug, verticalKey: "bithire" }
      : { slug: tenantSlug, verticalKey: "bithire" },
  });

  // `lang`/`dir` are pulled out of the SAME projection rather than spread, so
  // `jsx-a11y/html-has-lang` can prove the language is set. Static analysis
  // cannot see through a spread, and suppressing the rule would trade a real
  // accessibility guarantee for brevity. One source, still.
  const { lang: documentLang, dir: documentDir, ...scopedRootAttributes } =
    documentRootAttributes;

  return (
    <html
      lang={documentLang}
      dir={documentDir}
      {...scopedRootAttributes}
      {...bundledAnatomyAttributes}
      {...anatomyAttributes}
      // App-owned channels, deliberately distinct from the DS projection:
      // which account the session belongs to, which brand artifact was
      // compiled, and which tenant owns the CSS scope.
      data-account-tenant={accountTenantSlug ?? "bithire"}
      data-brand-artifact={brandArtifactSlug ?? "bithire"}
      data-css-tenant={tenantSlug}
      suppressHydrationWarning
    >
      <head>
        {/* The canonical pre-paint refinement, owned by the design system. Its
            ONLY job is resolving `auto` against the viewer's media query before
            first paint; it returns immediately for an explicit mode, so a
            tenant's declared light/dark can never be overridden by a system
            preference. Keeping it in the DS means the script and the provider
            that later reconciles it cannot drift apart. */}
        <script
          dangerouslySetInnerHTML={{ __html: buildThemePrepaintScript() }}
        />
        {/* The exact server-compiled DB artifact is reused by hydration. */}
        {runtimeArtifact ? (
          <style
            id={RUNTIME_TENANT_THEME_STYLE_ID}
            data-tenant={runtimeArtifact.slug}
            data-digest={runtimeArtifact.digest}
            data-compiler={runtimeArtifact.compilerVersion}
            dangerouslySetInnerHTML={{ __html: runtimeArtifact.css }}
          />
        ) : null}
      </head>
      <body className={`${inter.variable} ${editorial.variable}`}>
        <Providers
          tenantSlug={tenantSlug}
          accountTenantSlug={accountTenantSlug}
          initialRuntimeTheme={runtimeTheme}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
