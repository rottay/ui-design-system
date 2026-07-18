'use client';

import { useEffect, useMemo } from 'react';
import {
  Badge,
  Box,
  Button,
  DesignSystemProvider,
  Flex,
  Layout,
  PatternDataTable,
  Stack,
  Text,
  type ColumnDef,
  type TenantConfig,
} from '@rottay/design-system';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  tenantThemeAnatomyAttributes,
  tenantThemeArtifactRootAttributes,
  type TenantThemeArtifactV1,
} from '@rottay/design-system/server';
import {
  BarChart3Icon,
  BriefcaseIcon,
  SettingsIcon,
  UsersIcon,
} from '@rottay/design-system/icons';

import { RecruiterDashboardDemo } from '@/components/demos/bithire/recruiter-dashboard';
import { ScorecardDemo } from '@/components/demos/bithire/scorecard';
import { DIVERGENCE_FIXTURES, type DivergenceFixtureId } from './fixtures';

// ---------------------------------------------------------------------------
// W4 divergence surface (design w4-whitelabel section 9 — wave exit demo).
//
// Renders one bithire demo route under ONE compiled TenantThemeArtifact per
// load. The artifact travels the sanctioned provider path a production app
// takes: `compileTenantThemeConfig` produces the immutable artifact, its
// `css` block mounts as a style element, and the artifact's own root/anatomy
// attribute projections are spread on the DS root wrapper. The provider runs
// with `visualAuthority="compiled-artifact"`, so the artifact is the single
// visual owner — no provider-side emitter competes with it (CMP-02 law).
//
// App-side wiring this surface performs (the same wiring app-bithire's SSR
// spread performs in production, per the W4 landlord handoff):
//   - spreads `tenantThemeArtifactRootAttributes` + `tenantThemeAnatomyAttributes`
//     on the scope root;
//   - applies `color-scheme: var(--ds-color-scheme, <ground>)` on that root so
//     dual-scheme artifacts (`light-dark()` values) actually flip under the
//     viewer's preferred scheme;
//   - drives Layout.Sider's `width` prop from the sidebar anatomy (the sider
//     container width is an inline width, not skin-reachable — the rail/panel
//     skin governs interior rhythm while the app owns the container width).
// ---------------------------------------------------------------------------

export type DivergenceRoute = 'dashboard' | 'list' | 'detail';
export type DivergenceGround = 'light' | 'dark';

export const DIVERGENCE_ROUTES: readonly DivergenceRoute[] = [
  'dashboard',
  'list',
  'detail',
];

/** The window key the divergence spec reads the compiled artifact facts from. */
export const DIVERGENCE_PROBE_KEY = '__divergenceProbe';

export interface DivergenceProbePayload {
  slug: string;
  digest: string;
  compilerVersion: string;
  adjustments: NonNullable<TenantThemeArtifactV1['adjustments']>;
  anatomy: Record<string, string>;
  variables: Readonly<Record<string, string>>;
}

type ProbeWindow = Window & {
  [DIVERGENCE_PROBE_KEY]?: DivergenceProbePayload;
};

/**
 * Sidebar container widths per anatomy. `rail` is the narrow icon-first rail;
 * `panel`/default keep the wide panel. Numbers are the app-owned container
 * dimension the anatomy contract expects the shell to supply.
 */
const SIDER_WIDTH: Record<string, number> = {
  rail: 76,
  panel: 264,
  default: 264,
};

interface PipelineRow {
  id: string;
  candidate: string;
  role: string;
  stage: string;
  owner: string;
  daysInStage: number;
}

const PIPELINE_ROWS: PipelineRow[] = [
  { id: 'c-01', candidate: 'Ada Lovelace', role: 'Staff Engineer', stage: 'Onsite loop', owner: 'M. Reyes', daysInStage: 3 },
  { id: 'c-02', candidate: 'Grace Hopper', role: 'Platform Lead', stage: 'Offer draft', owner: 'M. Reyes', daysInStage: 1 },
  { id: 'c-03', candidate: 'Alan Turing', role: 'Research Engineer', stage: 'Screen', owner: 'J. Chen', daysInStage: 6 },
  { id: 'c-04', candidate: 'Katherine Johnson', role: 'Data Engineer', stage: 'Onsite loop', owner: 'J. Chen', daysInStage: 2 },
  { id: 'c-05', candidate: 'Margaret Hamilton', role: 'Staff Engineer', stage: 'Screen', owner: 'A. Osei', daysInStage: 4 },
  { id: 'c-06', candidate: 'Radia Perlman', role: 'Network Engineer', stage: 'Sourced', owner: 'A. Osei', daysInStage: 9 },
];

const PIPELINE_COLUMNS: ColumnDef<PipelineRow>[] = [
  { key: 'candidate', header: 'Candidate', accessorKey: 'candidate', sortable: true },
  { key: 'role', header: 'Role', accessorKey: 'role' },
  { key: 'stage', header: 'Stage', accessorKey: 'stage' },
  { key: 'owner', header: 'Owner', accessorKey: 'owner' },
  { key: 'daysInStage', header: 'Days in stage', accessorKey: 'daysInStage', align: 'right' },
];

/** Pipeline list route: the collection screen the table anatomy restyles. */
function PipelineListRoute() {
  return (
    <Stack spacing="lg" fullWidth data-testid="divergence-route-list">
      <Box>
        <Text size="xl" weight="bold" style={{ display: 'block' }}>
          Pipeline
        </Text>
        <Text size="sm" color="secondary">
          Active candidates across open requisitions.
        </Text>
      </Box>
      <PatternDataTable<PipelineRow>
        data={PIPELINE_ROWS}
        rowKey="id"
        columns={PIPELINE_COLUMNS}
        striped
      />
    </Stack>
  );
}

const NAV_ITEMS = [
  { key: 'pipeline', label: 'Pipeline', icon: <BriefcaseIcon size={18} /> },
  { key: 'candidates', label: 'Candidates', icon: <UsersIcon size={18} /> },
  { key: 'analytics', label: 'Analytics', icon: <BarChart3Icon size={18} /> },
  { key: 'settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
];

export function DivergenceSurface({
  fixture,
  route,
  ground,
}: {
  fixture: DivergenceFixtureId;
  route: DivergenceRoute;
  ground: DivergenceGround;
}) {
  const spec = DIVERGENCE_FIXTURES[fixture];

  const artifact = useMemo(
    () =>
      compileTenantThemeConfig(
        { ...spec.document, ...spec.identity },
        { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire') },
      ),
    [spec],
  );

  const rootAttributes = tenantThemeArtifactRootAttributes(artifact);
  const anatomyAttributes = tenantThemeAnatomyAttributes(artifact);
  const sidebarAnatomy = anatomyAttributes['data-anatomy-sidebar'] ?? 'default';
  const siderWidth = SIDER_WIDTH[sidebarAnatomy] ?? SIDER_WIDTH.default;
  const isRail = sidebarAnatomy === 'rail';

  const tenantConfig: TenantConfig = useMemo(
    () => ({
      slug: spec.identity.slug,
      name: spec.displayName,
      vertical: 'bithire',
      engine: 'modern',
      theme: ground,
      plan: 'enterprise',
      features: ['*'],
      branding: { companyName: spec.displayName },
    }),
    [spec, ground],
  );

  useEffect(() => {
    const probeWindow = window as ProbeWindow;
    probeWindow[DIVERGENCE_PROBE_KEY] = {
      slug: artifact.slug,
      digest: artifact.digest,
      compilerVersion: artifact.compilerVersion,
      adjustments: artifact.adjustments ?? [],
      anatomy: anatomyAttributes,
      variables: artifact.variables,
    };
    return () => {
      delete probeWindow[DIVERGENCE_PROBE_KEY];
    };
    // anatomyAttributes derives from the artifact; the artifact is the dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artifact]);

  return (
    <DesignSystemProvider
      forceEngine="modern"
      forceTheme={ground}
      vertical="bithire"
      tenantConfig={tenantConfig}
      visualAuthority="compiled-artifact"
    >
      {/* The exact compiled artifact, mounted once — the same block SSR embeds. */}
      <style data-testid="divergence-artifact-style" dangerouslySetInnerHTML={{ __html: artifact.css }} />
      <Box
        {...rootAttributes}
        {...anatomyAttributes}
        data-testid="divergence-root"
        style={{
          minHeight: '100vh',
          position: 'relative',
          colorScheme: `var(--ds-color-scheme, ${ground})`,
          background: 'var(--ds-color-bg-primary)',
          fontFamily: 'var(--ds-font-family-base)',
        }}
      >
        {/* Machine probe swatch, DIRECTLY under the scope root: inside
            Layout.Sider the modern engine pins color-scheme light, which
            forces light-dark() to its light branch — the dual-scheme
            assertion must read an element outside that subtree. */}
        <Box
          aria-hidden
          data-testid="divergence-primary-swatch"
          style={{
            position: 'absolute',
            insetBlockEnd: 4,
            insetInlineEnd: 4,
            width: 8,
            height: 8,
            background: 'var(--ds-color-primary)',
          }}
        />
        <Layout hasSider style={{ minHeight: '100vh' }}>
          {/* Probe target: `.rottay-layout-sider` inside [data-testid=divergence-root].
              The shell consumes the compiled sidebar-tone channels: the
              compiler emits --ds-sidebar-bg/--ds-sidebar-text for
              navigation.sidebarTone and the app shell owns painting them. */}
          <Layout.Sider
            width={siderWidth}
            style={{
              background: 'var(--ds-sidebar-bg, var(--ds-color-bg-container))',
              color: 'var(--ds-sidebar-text, var(--ds-color-text-primary))',
            }}
          >
            <Stack spacing="sm" style={{ padding: isRail ? '16px 8px' : '16px 12px' }}>
              <Flex align="center" justify={isRail ? 'center' : 'start'} gap={8} style={{ minHeight: 32 }}>
                {/* Painted with the tenant primary: under a dual-scheme artifact
                    this is a light-dark() value, so its computed color is the
                    end-to-end proof that color-scheme wiring resolves. */}
                <Box
                  aria-hidden
                  data-testid="divergence-logo"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 'var(--ds-radius-sm)',
                    background: 'var(--ds-color-primary)',
                    flexShrink: 0,
                  }}
                />
                {!isRail && (
                  <Text size="sm" weight="bold" style={{ whiteSpace: 'nowrap', color: 'var(--ds-sidebar-text, inherit)' }}>
                    {spec.displayName}
                  </Text>
                )}
              </Flex>
              <Stack spacing="xs" as="nav">
                {NAV_ITEMS.map((item, index) => (
                  <Flex
                    key={item.key}
                    align="center"
                    justify={isRail ? 'center' : 'start'}
                    gap={10}
                    style={{
                      padding: isRail ? '10px 0' : '8px 10px',
                      borderRadius: 'var(--ds-radius-sm)',
                      color: index === 0 ? 'var(--ds-sidebar-item-color-active, var(--ds-color-primary))' : 'var(--ds-sidebar-text, var(--ds-color-text-secondary))',
                      background: index === 0 ? 'var(--ds-sidebar-item-bg-active, transparent)' : 'transparent',
                    }}
                  >
                    {item.icon}
                    {!isRail && <Text size="sm" style={{ color: 'inherit' }}>{item.label}</Text>}
                  </Flex>
                ))}
              </Stack>
            </Stack>
          </Layout.Sider>
          {/* flex:1 + minWidth:0 — the inner column must FILL the row beside the
              fixed-width sider; without it the column shrink-wraps narrow routes
              (the list table clipped at ~583px in the first sighted pass). */}
          <Layout style={{ flex: 1, minWidth: 0 }}>
            {/* Probe target: `.rottay-layout-header` inside [data-testid=divergence-root]. */}
            <Layout.Header>
              <Flex align="center" justify="between" style={{ width: '100%', minHeight: 48 }}>
                <Flex align="center" gap={12}>
                  {/* Wrapper carries the testid: engine components may not
                      forward data-* (P-79), a Box always does. */}
                  <Box data-testid="divergence-title">
                    <Text
                      size="lg"
                      weight="bold"
                      style={{ fontFamily: 'var(--ds-font-family-heading)', margin: 0 }}
                    >
                      {spec.displayName} Recruiting
                    </Text>
                  </Box>
                  {/* `content` form: the children form takes Badge's hidden-badge
                      branch and paints no chrome (WO-GAT-03 finding). */}
                  <Badge variant="primary" badgeStyle="solid" content="bithire" />
                </Flex>
                <Flex align="center" gap={8}>
                  <Button variant="secondary" size="sm">
                    Import
                  </Button>
                  <Box data-testid="divergence-primary-button">
                    <Button variant="primary" size="sm">
                      New requisition
                    </Button>
                  </Box>
                </Flex>
              </Flex>
            </Layout.Header>
            <Layout.Content style={{ padding: 'var(--ds-spacing-6, 24px)' }}>
              {route === 'dashboard' && <RecruiterDashboardDemo />}
              {route === 'list' && <PipelineListRoute />}
              {route === 'detail' && <ScorecardDemo />}
            </Layout.Content>
          </Layout>
        </Layout>
      </Box>
    </DesignSystemProvider>
  );
}
