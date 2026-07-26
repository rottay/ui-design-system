'use client';

import { useEffect, useMemo } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  DesignSystemProvider,
  Flex,
  Layout,
  PatternDataTable,
  Stack,
  Text,
  getKnownTenantConfig,
  resolveVisualAuthority,
  type ColumnDef,
  type TenantConfig,
  type VisualAuthorityDeclaration,
  type VisualAuthorityResolution,
} from '@rottay/design-system';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  tenantThemeAnatomyAttributes,
  tenantThemeArtifactRootAttributes,
  type TenantThemeArtifact,
  type TenantThemeConfigIdentity,
  type TenantThemeDocument,
} from '@rottay/design-system/server';

// ---------------------------------------------------------------------------
// P0-A visual-authority probe.
//
// ONE tree, rendered under both authority paths, so a reviewer can photograph
// them side by side:
//
//   ?tenant=themanagement  DB tenant. The document compiles through
//                          `compileTenantThemeConfig` under the code-owned
//                          bithire envelope, the artifact CSS mounts once, and
//                          the provider receives the TYPED declaration plus the
//                          same `normalizedAppearance` echoed back on
//                          `TenantConfig.appearance` -- exactly what
//                          `buildTenantConfig` hands it in app-bithire. This is
//                          the input that used to report double authority and
//                          throw in development.
//   ?tenant=bithire        Bundled static vertical. No declaration, provider
//                          authority, every emitter live. The control.
//
//   ?ground=light|dark|auto  optional; absent lets the tenant's own background
//                            mode decide (themanagement dark, bithire light).
//
// The fact strip and `window.__visualAuthorityProbe` report the resolution the
// provider itself computed, so the sighted check and the machine check read the
// same numbers.
// ---------------------------------------------------------------------------

export const VISUAL_AUTHORITY_TENANTS = ['themanagement', 'bithire'] as const;
export type VisualAuthorityTenant = (typeof VISUAL_AUTHORITY_TENANTS)[number];

export const VISUAL_AUTHORITY_GROUNDS = ['light', 'dark', 'auto'] as const;
export type VisualAuthorityGround = (typeof VISUAL_AUTHORITY_GROUNDS)[number];

/** The window key the sighted-validation notes read the resolution from. */
export const VISUAL_AUTHORITY_PROBE_KEY = '__visualAuthorityProbe';

export interface VisualAuthorityProbePayload {
  tenant: VisualAuthorityTenant;
  authority: VisualAuthorityResolution['authority'];
  origin: VisualAuthorityResolution['origin'];
  suppressedChannels: readonly string[];
  conflict: string | null;
  digest: string | null;
  coverage: readonly string[] | null;
  personalityBridgeMounted: boolean;
  providerChromeElementMounted: boolean;
}

type ProbeWindow = Window & {
  [VISUAL_AUTHORITY_PROBE_KEY]?: VisualAuthorityProbePayload;
};

const THEMANAGEMENT_IDENTITY: TenantThemeConfigIdentity = {
  tenantId: 'tenant_themanagement',
  slug: 'themanagement',
  verticalKey: 'bithire',
  rowVersion: 12,
};

const THEMANAGEMENT_DOCUMENT = {
  schemaVersion: 1,
  mode: 'advanced',
  visualFoundation: {
    general: {
      palette: { primary: '#2F6B9A', accent: '#C8842B', backgroundMode: 'dark' },
      typography: { typePairing: 'sober', scale: 0.96 },
      shape: { buttonStyle: 'sharp', radiusScale: 0.85 },
      surfaces: { elevation: 'flat' },
      density: 'compact',
      motion: { intensity: 0.4, durationScale: 0.9, ambient: 'off' },
      navigation: { sidebarTone: 'inverse' },
    },
    advanced: {
      chrome: {
        sidebar: { bg: '#101014', text: '#F4F4F5', anatomy: 'panel' },
        table: { headerBg: '#17171B', anatomy: 'ruled' },
        cardComponent: { radius: '8px', anatomy: 'framed' },
      },
      tokenOverrides: { '--ds-radius-md': '8px' },
    },
  },
} as unknown as TenantThemeDocument;

interface PipelineRow {
  id: string;
  candidate: string;
  role: string;
  stage: string;
}

const ROWS: PipelineRow[] = [
  { id: 'r-1', candidate: 'Ada Lovelace', role: 'Staff Engineer', stage: 'Onsite loop' },
  { id: 'r-2', candidate: 'Grace Hopper', role: 'Platform Lead', stage: 'Offer draft' },
  { id: 'r-3', candidate: 'Alan Turing', role: 'Research Engineer', stage: 'Screen' },
];

const COLUMNS: ColumnDef<PipelineRow>[] = [
  { key: 'candidate', header: 'Candidate', accessorKey: 'candidate' },
  { key: 'role', header: 'Role', accessorKey: 'role' },
  { key: 'stage', header: 'Stage', accessorKey: 'stage' },
];

/** The identical subtree both authority paths render. */
function ProbeContent({ payload }: { payload: VisualAuthorityProbePayload }) {
  return (
    <Layout>
      <Layout.Sider width={248}>
        <Stack spacing="xs" fullWidth>
          {['Pipeline', 'Candidates', 'Analytics', 'Settings'].map((item) => (
            <Text key={item} size="sm">
              {item}
            </Text>
          ))}
        </Stack>
      </Layout.Sider>
      <Layout.Content>
        <Stack spacing="lg" fullWidth>
          <Flex justify="between" align="center">
            <Box>
              <Text size="xl" weight="bold" style={{ display: 'block' }}>
                Pipeline
              </Text>
              <Text size="sm" color="secondary">
                One tree, two authority paths.
              </Text>
            </Box>
            <Button variant="primary">New candidate</Button>
          </Flex>

          <Card data-testid="visual-authority-facts">
            <Stack spacing="xs" fullWidth>
              <Flex gap="sm" align="center" wrap="wrap">
                <Badge>{payload.tenant}</Badge>
                <Badge>{payload.authority}</Badge>
                <Badge>{payload.origin}</Badge>
                <Badge variant={payload.conflict ? 'error' : 'success'}>
                  {payload.conflict ? 'conflict' : 'no conflict'}
                </Badge>
              </Flex>
              <Text size="sm" color="secondary">
                suppressed: {payload.suppressedChannels.join(', ') || '(none)'}
              </Text>
              <Text size="sm" color="secondary">
                coverage: {payload.coverage?.join(', ') ?? '(no artifact)'}
              </Text>
              <Text size="sm" color="secondary">
                digest: {payload.digest ?? '(no artifact)'}
              </Text>
              <Text size="sm" color="secondary">
                personality bridge: {payload.personalityBridgeMounted ? 'mounted' : 'absent'} ·
                provider chrome element:{' '}
                {payload.providerChromeElementMounted ? 'present' : 'absent'}
              </Text>
            </Stack>
          </Card>

          <Flex gap="md" wrap="wrap">
            <Card title="Open requisitions">
              <Text size="xl" weight="bold">
                18
              </Text>
            </Card>
            <Card title="Interviews this week">
              <Text size="xl" weight="bold">
                42
              </Text>
            </Card>
            <Card title="Offers out">
              <Text size="xl" weight="bold">
                6
              </Text>
            </Card>
          </Flex>

          <PatternDataTable<PipelineRow> data={ROWS} rowKey="id" columns={COLUMNS} />
        </Stack>
      </Layout.Content>
    </Layout>
  );
}

/**
 * The exact envelope `buildTenantConfig` hands the provider for a DB tenant:
 * identity-only branding plus the artifact's own compiled appearance, kept so
 * the runtime can still read density, the motion dial, background mode, the
 * recipe profile and the anatomy attributes.
 */
function dbTenantConfig(artifact: TenantThemeArtifact): TenantConfig {
  return {
    slug: artifact.slug,
    name: 'The Management',
    vertical: 'bithire',
    theme: artifact.normalizedAppearance.general?.palette?.backgroundMode ?? 'light',
    plan: 'enterprise',
    features: ['*'],
    branding: { companyName: 'The Management' },
    appearance: artifact.normalizedAppearance,
  } as TenantConfig;
}

export function VisualAuthorityProbe({
  tenant,
  ground,
}: {
  tenant: VisualAuthorityTenant;
  ground?: VisualAuthorityGround;
}) {
  const artifact = useMemo(
    () =>
      tenant === 'themanagement'
        ? compileTenantThemeConfig(
            { ...THEMANAGEMENT_DOCUMENT, ...THEMANAGEMENT_IDENTITY },
            { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire') },
          )
        : null,
    [tenant],
  );

  const declaration: VisualAuthorityDeclaration | undefined = useMemo(
    () =>
      artifact
        ? {
            authority: 'compiled-artifact',
            artifact: {
              digest: artifact.digest,
              compilerVersion: artifact.compilerVersion,
              coverage: artifact.coverage,
              normalizedAppearance: artifact.normalizedAppearance,
            },
          }
        : undefined,
    [artifact],
  );

  const tenantConfig = useMemo(
    () =>
      artifact
        ? dbTenantConfig(artifact)
        : (getKnownTenantConfig('bithire') as TenantConfig),
    [artifact],
  );

  // The same call the provider makes, so the fact strip cannot drift from the
  // resolution that actually governed the render. `visualBranding` is false by
  // construction on the DB cell (identity-only branding), and the bundled cell
  // resolves before the census is consulted, so the strip is exact for both.
  const resolution = useMemo(
    () =>
      resolveVisualAuthority({
        declaration,
        slug: tenantConfig.slug,
        hasBundledArtifact: tenant === 'bithire',
        payload: {
          visualBranding: false,
          tokenOverrides: Object.keys(tenantConfig.tokenOverrides ?? {}).length > 0,
          appearance: tenantConfig.appearance,
        },
      }),
    [declaration, tenant, tenantConfig],
  );

  const payload: VisualAuthorityProbePayload = {
    tenant,
    authority: resolution.authority,
    origin: resolution.origin,
    suppressedChannels: resolution.suppressedChannels,
    conflict: resolution.conflict,
    digest: artifact?.digest ?? null,
    coverage: artifact?.coverage ?? null,
    personalityBridgeMounted: false,
    providerChromeElementMounted: false,
  };

  const rootAttributes = artifact ? tenantThemeArtifactRootAttributes(artifact) : {};
  const anatomyAttributes = artifact ? tenantThemeAnatomyAttributes(artifact) : {};

  useEffect(() => {
    const probeWindow = window as ProbeWindow;
    const measured: VisualAuthorityProbePayload = {
      ...payload,
      personalityBridgeMounted: document.getElementById('ds-personality-tokens') !== null,
      providerChromeElementMounted:
        document.querySelector('style[id^="ds-chrome-"]') !== null,
    };
    probeWindow[VISUAL_AUTHORITY_PROBE_KEY] = measured;
    return () => {
      delete probeWindow[VISUAL_AUTHORITY_PROBE_KEY];
    };
  });

  return (
    <DesignSystemProvider
      tenantConfig={tenantConfig}
      vertical="bithire"
      forceEngine="modern"
      {...(declaration ? { visualAuthority: declaration } : {})}
      {...(ground ? { forceTheme: ground } : {})}
    >
      {artifact ? (
        <style
          data-testid="visual-authority-artifact-style"
          dangerouslySetInnerHTML={{ __html: artifact.css }}
        />
      ) : null}
      <Box {...rootAttributes} {...anatomyAttributes} data-testid="visual-authority-root">
        <ProbeContent payload={payload} />
      </Box>
    </DesignSystemProvider>
  );
}
