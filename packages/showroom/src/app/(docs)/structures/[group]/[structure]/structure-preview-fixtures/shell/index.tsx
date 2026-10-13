'use client';

import { useState } from 'react';
import {
  AppShell,
  Badge,
  BottomTabBar,
  Box,
  Button,
  Flex,
  PageShellSurface,
  SidebarSurface,
  Stack,
  SurfaceActionBar,
  SurfaceSectionCard,
  SurfaceTabbedLabel,
  Text,
  WorkspaceShell,
} from '@rottay/design-system';

import { EntityGroupIcon, LocationGlobalIcon, AnalyticsActivityIcon, noop } from '../foundation';

function BottomTabBarPreview() {
  const [activeKey, setActiveKey] = useState('workspace');

  return (
    <Box
      style={{
        maxWidth: 420,
        paddingTop: 48,
        overflow: 'hidden',
        borderRadius: 18,
        border: '1px solid var(--ds-color-border-secondary)',
        background: 'var(--ds-color-bg-secondary)',
      }}
    >
      <BottomTabBar
        activeKey={activeKey}
        onChange={setActiveKey}
        items={[
          { key: 'workspace', label: 'Workspace', icon: <EntityGroupIcon size={20} /> },
          {
            key: 'activity',
            label: 'Activity',
            icon: <AnalyticsActivityIcon size={20} />,
            badge: 3,
          },
          { key: 'coverage', label: 'Coverage', icon: <LocationGlobalIcon size={20} /> },
        ]}
        style={{ position: 'relative' }}
      />
    </Box>
  );
}

function PageShellSurfacePreview() {
  return (
    <PageShellSurface
      chrome={{
        title: 'Quarterly launch plan',
        subtitle: 'Tracks milestones and sign-offs for this quarter.',
        metadata: (
          <Text size="xs" color="muted">
            Updated 2026-07-14 - 7 of 10 milestones complete
          </Text>
        ),
        breadcrumbs: [{ label: 'Records', onClick: noop }, { label: 'Quarterly launch plan' }],
        badge: <Badge tone="success">Active</Badge>,
        back: { label: 'Records', onClick: noop },
      }}
      actions={
        <Flex gap={8}>
          <Button variant="secondary" onClick={noop}>
            Export
          </Button>
          <Button variant="primary" onClick={noop}>
            Edit plan
          </Button>
        </Flex>
      }
    >
      <Stack spacing={12}>
        <Text>Owner: Alex Rivera. Last reviewed 2026-07-12.</Text>
        <Stack spacing={6}>
          {[
            { key: 'm1', label: 'Launch readiness review', status: 'Complete' },
            { key: 'm2', label: 'Budget sign-off', status: 'In progress' },
            { key: 'm3', label: 'Vendor onboarding', status: 'Not started' },
          ].map((milestone) => (
            <Flex key={milestone.key} justify="between">
              <Text weight="medium">{milestone.label}</Text>
              <Text size="sm" color="muted">
                {milestone.status}
              </Text>
            </Flex>
          ))}
        </Stack>
      </Stack>
    </PageShellSurface>
  );
}

// ---------------------------------------------------------------------------
// Shell layouts
// ---------------------------------------------------------------------------

const SHELL_NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', active: true },
  { key: 'analytics', label: 'Analytics' },
  { key: 'files', label: 'Files' },
];

function ShellNavList({ items }: { items: { key: string; label: string; active?: boolean }[] }) {
  return (
    <Stack spacing={4}>
      {items.map((item) => (
        <Button
          key={item.key}
          size="sm"
          variant={item.active ? 'primary' : 'ghost'}
          fullWidth
          aria-current={item.active ? 'page' : undefined}
          onClick={noop}
        >
          {item.label}
        </Button>
      ))}
    </Stack>
  );
}

function AppShellPreview() {
  return (
    <Box
      style={{
        height: 320,
        overflow: 'hidden',
        borderRadius: 16,
        border: '1px solid var(--ds-color-border-secondary)',
      }}
    >
      <AppShell
        geometry={{ sidebarWidth: 200, sidebarCollapsedWidth: 72, headerHeight: 56, sidebarHeaderHeight: 64 }}
        sidebar={{
          logo: (
            <Text size="sm" weight="semibold">
              Acme
            </Text>
          ),
          nav: <ShellNavList items={SHELL_NAV_ITEMS} />,
          footer: (
            <Text size="xs" color="muted">
              v2.4.0
            </Text>
          ),
        }}
        header={{
          left: <Text weight="semibold">Dashboard</Text>,
          right: (
            <Button size="sm" variant="secondary" onClick={noop}>
              New
            </Button>
          ),
        }}
      >
        <Stack spacing={8}>
          <Text weight="semibold">Page content</Text>
          <Text size="sm" color="muted">
            The shell owns sidebar collapse, header height and the compact
            posture; the page owns everything inside this region.
          </Text>
        </Stack>
      </AppShell>
    </Box>
  );
}

function SidebarSurfacePreview() {
  return (
    <SidebarSurface
      config={{
        visual: { collapsible: true, bordered: true, sidebarWidth: 216, asideWidth: 200 },
        presentation: {
          header: <Text weight="semibold">Acme Workspace</Text>,
          sidebar: (
            <Stack spacing={16}>
              <Stack spacing={6}>
                <Text size="xs" color="muted">
                  Workspace
                </Text>
                <ShellNavList items={SHELL_NAV_ITEMS} />
              </Stack>
              <Stack spacing={6}>
                <Text size="xs" color="muted">
                  Account
                </Text>
                <ShellNavList
                  items={[
                    { key: 'settings', label: 'Settings' },
                    { key: 'profile', label: 'Profile' },
                  ]}
                />
              </Stack>
            </Stack>
          ),
          content: (
            <Stack spacing={8}>
              <Text weight="semibold">Dashboard</Text>
              <Text size="sm" color="muted">
                Overview of workspace activity for the current week.
              </Text>
            </Stack>
          ),
          footer: (
            <Text size="xs" color="muted">
              v2.4.0
            </Text>
          ),
          aside: (
            <Stack spacing={8}>
              <Text size="sm" weight="medium">
                Recent activity
              </Text>
              <Text size="xs" color="muted">
                Priya Shah updated the Q3 roadmap.
              </Text>
            </Stack>
          ),
        },
        behavior: { toggleLabel: 'Collapse navigation', onCollapsedChange: noop },
      }}
    />
  );
}

function SurfaceChromePreview() {
  return (
    <Stack spacing={16}>
      <SurfaceSectionCard
        eyebrow="Workspace"
        title="Retention policy"
        description="Applies to every collection in this workspace."
        actions={
          <SurfaceActionBar
            access={{ mode: 'all' }}
            actions={[
              { id: 'discard', label: 'Discard', variant: 'ghost', onClick: noop },
              { id: 'save', label: 'Save policy', variant: 'primary', onClick: noop },
            ]}
          />
        }
      >
        <Stack spacing={8}>
          <Text size="sm" color="muted">
            Records are archived after 90 days and purged after 365.
          </Text>
          <Flex gap={10} align="center">
            <Text size="sm">
              <SurfaceTabbedLabel view={{ label: 'Archived', badge: 128 }} />
            </Text>
            <Text size="sm">
              <SurfaceTabbedLabel view={{ label: 'Purged' }} />
            </Text>
          </Flex>
        </Stack>
      </SurfaceSectionCard>
    </Stack>
  );
}

// --- workspace-shell -------------------------------------------------------

const SHELL_ROWS = [
  { key: 'row-1', name: 'Spring launch', owner: 'A. Moreau' },
  { key: 'row-2', name: 'Partner rollout', owner: 'D. Okonkwo' },
  { key: 'row-3', name: 'Quarterly review', owner: 'L. Vidal' },
];

function WorkspaceShellPreview() {
  return (
    <Box style={{ width: '100%' }}>
      <WorkspaceShell
        variant="ai-field"
        mood="focus"
        fieldPattern="hybrid"
        intensity="medium"
        continuity="seamless"
        focusReaction
        previewEmphasis
        focusActive
        previewActive
      >
        <Stack spacing="none">
          <Flex justify="between" align="center" gap={12} style={{ padding: 16 }}>
            <Text weight="semibold">Active workstreams</Text>
            <Flex gap={8}>
              <Button size="sm" variant="secondary" onClick={() => undefined}>
                Filter
              </Button>
              <Button size="sm" variant="primary" onClick={() => undefined}>
                New workstream
              </Button>
            </Flex>
          </Flex>
          <Flex gap={8} wrap="wrap" style={{ padding: '0 16px 12px' }}>
            <Badge>Status: Active</Badge>
            <Badge>Region: EU</Badge>
          </Flex>
          {/* The shell owns no breakpoint behavior, so the consumer wraps its own
              rail; a fixed column would overlap the rows at narrow widths. */}
          <Flex gap={16} align="start" wrap="wrap" style={{ padding: '0 16px 16px' }}>
            <Stack spacing="sm" style={{ flex: '1 1 260px', minWidth: 0 }}>
              {SHELL_ROWS.map((row) => (
                <Flex key={row.key} justify="between" gap={8}>
                  <Text size="sm">{row.name}</Text>
                  <Text size="sm" color="muted">
                    {row.owner}
                  </Text>
                </Flex>
              ))}
            </Stack>
            <Stack spacing="sm" style={{ flex: '1 1 220px', minWidth: 0 }}>
              <Text size="xs" color="muted">
                Preview
              </Text>
              <Stack spacing="xs">
                <Text size="sm" weight="medium">
                  {SHELL_ROWS[0]?.name}
                </Text>
                <Text size="xs" color="muted">
                  Owned by {SHELL_ROWS[0]?.owner}
                </Text>
              </Stack>
              <Button size="sm" variant="ghost" onClick={() => undefined}>
                View report
              </Button>
            </Stack>
          </Flex>
        </Stack>
      </WorkspaceShell>
    </Box>
  );
}

export {
  BottomTabBarPreview,
  PageShellSurfacePreview,
  AppShellPreview,
  SidebarSurfacePreview,
  SurfaceChromePreview,
  WorkspaceShellPreview,
};
