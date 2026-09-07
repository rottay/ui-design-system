/**
 * The root layout of the same application for a CUSTOM tenant.
 *
 * Two published doors, one mount. `documentThemeAdmission` admits the v2
 * decision document and reports which of its decisions moved nothing, so the
 * app can tell the tenant the truth without diffing a patch. The artifact
 * compiler produces the bytes the client matches its mount proof against, and
 * `mountTenantTheme` re-admits both as one call.
 *
 * The artifact is an INPUT because a `ThemeIntent` names a baseline and carries
 * a patch; it does not carry the `tenantId`/`rowVersion` the digest is computed
 * over. WO-EMI-02 keeps accepting it and verifies it against its own compile.
 */
import type { ReactNode } from 'react';
import {
  buildThemePrepaintScript,
  compileTenantThemeConfig,
  documentThemeAdmission,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  mountTenantTheme,
  type DocumentAdmission,
  type MountedTenantTheme,
  type TenantThemeArtifact,
} from '@rottay/design-system/server';

import {
  TENANT_DOCUMENT_V2,
  TENANT_IDENTITY,
  TENANT_SLUG,
  TENANT_TRANSPORT_V1,
} from './tenant-document';

export interface TenantMount {
  mounted: MountedTenantTheme;
  admission: DocumentAdmission;
  artifact: TenantThemeArtifact;
}

/** The bytes this tenant's compiled identity ships as. */
export function compileTenantArtifact(): TenantThemeArtifact {
  return compileTenantThemeConfig(
    hydrateTenantThemeConfig(TENANT_TRANSPORT_V1, TENANT_IDENTITY),
    { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire') },
  );
}

export async function mountTenant(): Promise<TenantMount> {
  const { intent, admission } = documentThemeAdmission({
    vertical: 'bithire',
    slug: TENANT_SLUG,
    document: TENANT_DOCUMENT_V2,
  });
  const artifact = compileTenantArtifact();
  const mounted = await mountTenantTheme(intent, {
    artifact,
    themeMode: 'light',
    locale: 'en',
  });
  return { mounted, admission, artifact };
}

export default async function TenantRootLayout({ children }: { children: ReactNode }) {
  const { mounted } = await mountTenant();
  const { lang, dir, ...scopedRootAttributes } = mounted.rootAttributes;

  return (
    <html lang={lang} dir={dir} {...scopedRootAttributes} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: buildThemePrepaintScript() }} />
        {mounted.styleElements.map((element) => (
          <style
            key={element.id}
            id={element.id}
            {...element.attributes}
            dangerouslySetInnerHTML={{ __html: element.css }}
          />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}
