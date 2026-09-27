'use client';

import { useEffect, useMemo } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
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
  emitTenantThemeArtifactForSsr,
  getCodeOwnedRuntimeConfig,
  isCodeOwnedTenantConfig,
  resolveVisualAuthority,
  type VisualAuthorityResolution,
  tenantThemeAnatomyAttributes,
  tenantThemeArtifactRootAttributes,
  type TenantThemeArtifact,
} from '@rottay/design-system/server';

import { dbTenantConfig, type VisualAuthorityTenant } from './config';

// ---------------------------------------------------------------------------
// P0-A visual-authority probe.
//
// ONE tree, rendered under both authority paths, so a reviewer can photograph
// them side by side:
//
//   ?tenant=themanagement  DB tenant. The page mounts the document through the
//                          probe-ground kernel's legacy source under the
//                          code-owned bithire envelope, the artifact CSS mounts once, and
//                          the provider receives the TYPED declaration plus the
//                          same `normalizedAppearance` echoed back on
//                          `TenantConfig.appearance` -- exactly what
//                          `buildTenantConfig` hands it in app-bithire. This is
//                          the input that used to report double authority and
//                          throw in development.
//   ?tenant=bithire        Bundled static vertical. No declaration, provider
//                          authority, every emitter live. The control.
//
//   ?ground=light|dark  optional; absent paints the tenant's own background
//                       mode (themanagement dark, bithire light).
//
// The fact strip and `window.__visualAuthorityProbe` report the resolution the
// provider itself computed, so the sighted check and the machine check read the
// same numbers.
// ---------------------------------------------------------------------------

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

export function VisualAuthorityProbe({
  tenant,
  artifact,
}: {
  tenant: VisualAuthorityTenant;
  /** The artifact the page mounted; `null` for the bundled static vertical. */
  artifact: TenantThemeArtifact | null;
}) {
  // The ground mounts the element; this re-mint only feeds the declaration the reported
  // resolution is computed from, exactly as the provider receives it.
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
    <Box {...rootAttributes} {...anatomyAttributes} data-testid="visual-authority-root">
      <ProbeContent payload={payload} />
    </Box>
  );
}
