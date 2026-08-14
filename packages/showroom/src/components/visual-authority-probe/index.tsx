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
  type ColumnDef,
  type TenantConfig,
  type VisualAuthorityDeclaration,
} from '@rottay/design-system';
import {
  censusRuntimeVisualPayload,
  compileTenantThemeConfig,
  emitTenantThemeArtifactForSsr,
  getCodeOwnedRuntimeConfig,
  isCodeOwnedTenantConfig,
  resolveVisualAuthority,
  type VisualAuthorityResolution,
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

  // The element the resolver verifies, and the receipt covering the SSR pass
  // where there is no document to verify against.
  const emission = useMemo(
    () =>
      artifact
        ? emitTenantThemeArtifactForSsr(artifact, {
            slug: artifact.slug,
            verticalKey: artifact.verticalKey,
          })
        : null,
    [artifact],
  );

  // The WHOLE artifact. An earlier version passed a four-field subset --
  // digest, compilerVersion, coverage, normalizedAppearance -- which reads like
  // "everything the provider needs" and is exactly what the resolver refuses:
  // it re-derives the digest from the v1 source and re-renders `css`
  // deterministically, so an artifact missing its own inputs cannot be
  // verified and the surface blocks.
  const declaration: VisualAuthorityDeclaration | undefined = useMemo(
    () =>
      artifact && emission
        ? { authority: 'compiled-artifact', artifact, ssrReceipt: emission.receipt }
        : undefined,
    [artifact, emission],
  );

  const tenantConfig = useMemo(
    () =>
      artifact
        ? dbTenantConfig(artifact)
        : (getKnownTenantConfig('bithire') as TenantConfig),
    [artifact],
  );

  // The same call the provider makes, so the fact strip cannot drift from the
  // resolution that actually governed the render. The census comes from the
  // design system's own reader rather than a hand-built literal: the earlier
  // version omitted `personality` and `brandTheme` and passed a
  // `hasBundledArtifact` flag the resolver has never accepted, so the strip
  // could report a clean resolution for a payload that blocks.
  const resolution = useMemo(
    () =>
      resolveVisualAuthority({
        declaration,
        slug: tenantConfig.slug,
        verticalKey: typeof tenantConfig.vertical === 'string' ? tenantConfig.vertical : undefined,
        // The projection runs BEFORE the census, exactly as it does inside the
        // provider: the bundled cell's brandTheme is stripped, so the control
        // resolves `no-visual-payload` rather than being reported as a tenant
        // carrying an uncompiled payload.
        payload: censusRuntimeVisualPayload(
          isCodeOwnedTenantConfig(tenantConfig)
            ? getCodeOwnedRuntimeConfig(tenantConfig)
            : tenantConfig,
        ),
      }),
    [declaration, tenantConfig],
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
    <>
      {/* OUTSIDE the provider, and that placement is the whole point of this
          probe: the provider verifies the mount during its own render, before
          any child has been committed. Mounted as a child — where this style
          used to live — the artifact is invisible to the proof, the provider
          blocks, the children never commit, and the artifact never mounts. The
          probe would show a permanent loading screen for a document whose CSS
          is correct. */}
      {emission ? (
        <style
          {...emission.attributes}
          data-testid="visual-authority-artifact-style"
          dangerouslySetInnerHTML={{ __html: emission.css }}
        />
      ) : null}
      <DesignSystemProvider
        tenantConfig={tenantConfig}
        vertical="bithire"
        forceEngine="modern"
        {...(declaration ? { visualAuthority: declaration } : {})}
        {...(ground ? { forceTheme: ground } : {})}
      >
        <Box {...rootAttributes} {...anatomyAttributes} data-testid="visual-authority-root">
          <ProbeContent payload={payload} />
        </Box>
      </DesignSystemProvider>
    </>
  );
}
