/**
 * The app-bithire mount, reduced to the block this codemod rewrites.
 *
 * It imports the VERBATIM trio beside it, so what the test typechecks after the
 * transform is the real `runtime-tenant-theme/{ssr,contracts,artifact-resolution}`
 * files compiled against the real `@rottay/design-system/server` types.
 */
import type { ReactNode } from "react";
import {
  buildThemePrepaintScript,
  resolveDocumentRootAttributes,
  type TenantThemeDocument,
} from "@rottay/design-system/server";
import { RUNTIME_TENANT_THEME_STYLE_ID } from "@/core/lib/theme/runtime-tenant-theme/contracts";
import { resolveRuntimeTenantThemeSsrState } from "@/core/lib/theme/runtime-tenant-theme/ssr";

/**
 * The tenant's stored document. The migration packet's one prerequisite: the
 * app already reads this row to compile its artifact, and `mountTenantTheme`
 * takes a `ThemeIntent`, which only `documentThemeIntent` can name.
 */
const runtimeDocument: TenantThemeDocument = {
  schemaVersion: 1,
  mode: "simple",
  appearance: {},
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const lang = "en" as const;
  const { tenantSlug, runtimeArtifact, anatomyAttributes, configuredTheme } =
    resolveRuntimeTenantThemeSsrState({ accountTenantSlug: "bithire" });

  const documentRootAttributes = resolveDocumentRootAttributes({
    themeMode: configuredTheme,
    engine: "modern",
    locale: lang,
    tenant: { slug: tenantSlug, verticalKey: "bithire" },
  });
  const { lang: documentLang, dir: documentDir, ...scopedRootAttributes } =
    documentRootAttributes;

  return (
    <html
      lang={documentLang}
      dir={documentDir}
      {...scopedRootAttributes}
      {...anatomyAttributes}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: buildThemePrepaintScript() }}
        />
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
      <body>{children}</body>
    </html>
  );
}
