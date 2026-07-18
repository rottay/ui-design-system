/**
 * W4 divergence-demo fixture documents — SHOWROOM COPY.
 *
 * SOURCE OF TRUTH: packages/core/src/foundation/tokens/ts/presentation/
 * brand-themes/fixtures/{divergence-sober,divergence-editorial}/index.ts.
 * Core fixtures are excluded from the published tarball (pack-inventory gate
 * forbids fixtures/ paths), so the showroom cannot import them through the
 * package boundary; this copy follows the torture-surface convention. The
 * divergence Playwright spec (e2e/whitelabel/divergence.spec.ts) asserts deep
 * equality between this copy and the core modules on every run, so drift
 * fails the gate instead of silently forking the certification inputs.
 */

import type {
  TenantThemeConfigIdentityV1,
  TenantThemeDocument,
} from '@rottay/design-system/server';

export type DivergenceFixtureId = 'sober' | 'editorial';

export interface DivergenceFixture {
  readonly id: DivergenceFixtureId;
  readonly displayName: string;
  readonly identity: TenantThemeConfigIdentityV1;
  readonly document: TenantThemeDocument;
}

export const DIVERGENCE_FIXTURES: Readonly<
  Record<DivergenceFixtureId, DivergenceFixture>
> = {
  sober: {
    id: 'sober',
    displayName: 'Divergence Sober',
    identity: {
      tenantId: 'tenant_divergence_sober',
      slug: 'divergence-sober',
      verticalKey: 'bithire',
      rowVersion: 1,
    },
    document: {
      schemaVersion: 1,
      mode: 'advanced',
      visualFoundation: {
        general: {
          palette: {
            primary: '#2F6B9A',
            backgroundMode: 'light',
          },
          typography: {
            typePairing: 'sober',
            scale: 0.96,
          },
          shape: {
            buttonStyle: 'sharp',
          },
          surfaces: {
            elevation: 'flat',
          },
        },
        advanced: {
          chrome: {
            cardComponent: { anatomy: 'framed' },
            table: { anatomy: 'ruled' },
            sidebar: { anatomy: 'rail' },
            layout: { anatomy: 'flat' },
          },
          tokenOverrides: {
            '--ds-density-scale': 0.92,
          },
        },
      },
    },
  },
  editorial: {
    id: 'editorial',
    displayName: 'Divergence Editorial',
    identity: {
      tenantId: 'tenant_divergence_editorial',
      slug: 'divergence-editorial',
      verticalKey: 'bithire',
      rowVersion: 1,
    },
    document: {
      schemaVersion: 1,
      mode: 'advanced',
      visualFoundation: {
        general: {
          palette: {
            primary: '#A23B72',
            backgroundMode: 'auto',
            dark: {
              primary: '#D06A9F',
              background: '#181117',
            },
          },
          typography: {
            typePairing: 'editorial',
            scale: 1.06,
          },
          shape: {
            buttonStyle: 'pill',
          },
          surfaces: {
            elevation: 'soft',
          },
          navigation: {
            sidebarTone: 'inverse',
          },
        },
        advanced: {
          chrome: {
            cardComponent: { anatomy: 'underline' },
            table: { anatomy: 'open' },
            sidebar: { anatomy: 'panel' },
            layout: { anatomy: 'floating' },
          },
          tokenOverrides: {
            '--ds-density-scale': 1.08,
          },
        },
      },
    },
  },
};

export const DIVERGENCE_FIXTURE_IDS: readonly DivergenceFixtureId[] = [
  'sober',
  'editorial',
];
