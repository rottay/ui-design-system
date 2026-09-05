import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FIRST_PARTY_VERTICAL_SLUGS } from '@/foundation/contracts/kernel/verticals';
import type { FirstPartyVerticalId } from '@/foundation/contracts/kernel/verticals';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';
import {
  documentThemeIntent,
  staticThemeIntent,
} from '@/infrastructure/compilers/runtime/theme';
import {
  FIRST_PARTY_ARTIFACT_SPECS,
  renderFirstPartyArtifact,
} from '@/infrastructure/compilers/runtime/tenant-css';
import {
  TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE,
  auditTenantThemeArtifactSsrReceipt,
} from '../../../foundation/visual-authority';
import { mountTenantTheme } from '..';

/**
 * The committed artifact for a vertical: the exact bytes an application loads
 * through `@rottay/design-system/styles.css`. The mount's proof is checked
 * against BOTH the renderer and this file, because equalling the renderer alone
 * would still pass if the shipped stylesheet had drifted from it.
 */
function committedArtifactCss(vertical: FirstPartyVerticalId): string {
  return readFileSync(
    resolve(__dirname, `../../../../../../foundation/tokens/css/facade/artifacts/${vertical}/index.css`),
    'utf8',
  );
}

function specFor(vertical: FirstPartyVerticalId) {
  const spec = FIRST_PARTY_ARTIFACT_SPECS.find((row) => row.slug === vertical);
  if (!spec) throw new Error(`no first-party artifact spec for ${vertical}`);
  return spec;
}

const DOCUMENT = {
  schemaVersion: 1,
  mode: 'simple',
  appearance: {
    palette: { primary: '#2F6B9A', backgroundMode: 'dark' },
    density: 'compact',
    motion: { intensity: 0.4, durationScale: 0.9, ambient: 'off' },
  },
} as const;

const IDENTITY = {
  tenantId: 'tenant_themanagement',
  slug: 'themanagement',
  verticalKey: 'bithire',
  rowVersion: 7,
} as const;

const ARTIFACT = compileTenantThemeConfig(
  hydrateTenantThemeConfig(DOCUMENT, IDENTITY),
  { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire') },
);

describe('mountTenantTheme — static first-party verticals', () => {
  for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
    it(`${vertical}: the mounted bytes are the current pipeline's bytes`, async () => {
      const mounted = await mountTenantTheme(staticThemeIntent(vertical));
      const rendered = renderFirstPartyArtifact({ spec: specFor(vertical) }).css;

      expect(mounted.hydrationProof.css).toBe(rendered);
      expect(mounted.hydrationProof.css).toBe(committedArtifactCss(vertical));
    });

    it(`${vertical}: inlines nothing and stamps the governed root scope`, async () => {
      const mounted = await mountTenantTheme(staticThemeIntent(vertical));

      // The bytes ship in the stylesheet the app already loads; a second inline
      // copy would be a competing visual layer.
      expect(mounted.styleElements).toEqual([]);
      expect(mounted.rootAttributes).toMatchObject({
        'data-ds-root': '',
        'data-vertical': vertical,
        'data-tenant': vertical,
        'data-theme': 'light',
        'data-tenant-theme-mode': 'light',
        'data-engine': 'modern',
        lang: 'en',
        dir: 'ltr',
      });
      expect(mounted.artifactDigest).toMatch(/^sha256-[a-f0-9]{64}$/);
      expect(mounted.hydrationProof.receipt).toBeUndefined();
    });
  }

  it('preserves an `auto` mode for the pre-paint script instead of resolving it', async () => {
    const mounted = await mountTenantTheme(staticThemeIntent('bithire'), {
      themeMode: 'auto',
      autoFallback: 'dark',
      locale: 'ar',
    });

    expect(mounted.rootAttributes['data-tenant-theme-mode']).toBe('auto');
    expect(mounted.rootAttributes['data-theme']).toBe('dark');
    expect(mounted.rootAttributes.lang).toBe('ar');
    expect(mounted.rootAttributes.dir).toBe('rtl');
  });

  it('refuses a static intent scoped under a foreign slug by name', async () => {
    await expect(
      mountTenantTheme(staticThemeIntent('bithire', 'themanagement')),
    ).rejects.toThrow(/"themanagement" is not "bithire"/);
  });

  it('refuses a compiled tenant artifact on a static intent by name', async () => {
    await expect(
      mountTenantTheme(staticThemeIntent('bithire'), { artifact: ARTIFACT }),
    ).rejects.toThrow(/has no compiled tenant artifact/);
  });
});

describe('mountTenantTheme — tenant documents', () => {
  const intent = documentThemeIntent({
    vertical: 'bithire',
    slug: IDENTITY.slug,
    document: DOCUMENT,
  });

  it('emits the compiler\'s artifact bytes unchanged', async () => {
    const mounted = await mountTenantTheme(intent, { artifact: ARTIFACT });

    expect(mounted.styleElements).toHaveLength(1);
    expect(mounted.styleElements[0].css).toBe(ARTIFACT.css);
    expect(mounted.hydrationProof.css).toBe(ARTIFACT.css);
    expect(mounted.artifactDigest).toBe(ARTIFACT.digest);
  });

  it('emits the three proof attributes the resolver reads', async () => {
    const mounted = await mountTenantTheme(intent, { artifact: ARTIFACT });
    const { attributes, id } = mounted.styleElements[0];

    expect(attributes[TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE]).toBe(ARTIFACT.digest);
    expect(attributes[TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE]).toBe(ARTIFACT.slug);
    expect(attributes[TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE]).toBe(ARTIFACT.verticalKey);
    expect(attributes.id).toBe(id);
  });

  it('mints a receipt the visual-authority resolver admits for these exact bytes', async () => {
    const mounted = await mountTenantTheme(intent, { artifact: ARTIFACT });

    expect(auditTenantThemeArtifactSsrReceipt(ARTIFACT, mounted.hydrationProof.receipt)).toBeNull();
  });

  it('stamps the artifact scope and its closed anatomy selections', async () => {
    const mounted = await mountTenantTheme(intent, { artifact: ARTIFACT });

    expect(mounted.rootAttributes).toMatchObject({
      'data-ds-root': '',
      'data-vertical': 'bithire',
      'data-tenant': IDENTITY.slug,
    });
  });

  it('refuses a tenant-authored intent with no artifact by name', async () => {
    await expect(mountTenantTheme(intent)).rejects.toThrow(
      /"tenant-document" intent must be handed the artifact/,
    );
  });

  it('refuses an artifact compiled for another tenant by name', async () => {
    const foreign = documentThemeIntent({
      vertical: 'bithire',
      slug: 'someone-else',
      document: DOCUMENT,
    });

    await expect(mountTenantTheme(foreign, { artifact: ARTIFACT })).rejects.toThrow(
      /is not the tenant this intent mounts/,
    );
  });
});
