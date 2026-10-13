'use client';

/* Compositions probe fixtures, lane B: SidebarSurface and WorkspaceShell,
   the two composition/layout families with zero or one in-layer consumer. */

import type { ReactNode } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  SidebarSurface,
  Stack,
  Text,
  WorkspaceShell,
} from '@rottay/design-system';
import { Icon, type IconName } from '@rottay/design-system/icons';

// sidebar fixtures

interface WorkspaceNavItem {
  key: string;
  label: string;
  icon: IconName;
  active?: boolean;
}

const primaryNavItems: WorkspaceNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'navigation.home', active: true },
  { key: 'analytics', label: 'Analytics', icon: 'analytics.dashboard' },
  { key: 'files', label: 'Files', icon: 'content.folder' },
];

const accountNavItems: WorkspaceNavItem[] = [
  { key: 'settings', label: 'Settings', icon: 'navigation.settings' },
  { key: 'profile', label: 'Profile', icon: 'navigation.profile' },
];

function WorkspaceNavGroup({ label, items }: { label: string; items: WorkspaceNavItem[] }): ReactNode {
  return (
    <Stack spacing="xs">
      <Text size="xs" color="muted">{label}</Text>
      {items.map((item) => (
        <Button
          key={item.key}
          variant={item.active ? 'primary' : 'ghost'}
          fullWidth
          icon={<Icon name={item.icon} decorative />}
          aria-current={item.active ? 'page' : undefined}
          onClick={() => undefined}
        >
          {item.label}
        </Button>
      ))}
    </Stack>
  );
}

// workspace-shell fixtures

const campaignRows = [
  { key: 'c1', name: 'Spring launch', owner: 'Dana Reyes' },
  { key: 'c2', name: 'Retention push', owner: 'Marcus Webb' },
];

export function ConfigCompositionBSurface({ only }: { only: string }): ReactNode {
  switch (only) {
    case 'sidebar':
      return (
        <SidebarSurface
          config={{
            visual: { collapsible: true, bordered: true, sidebarWidth: 248, asideWidth: 240 },
            presentation: {
              header: <Text weight="semibold">Acme Workspace</Text>,
              sidebar: (
                <Stack spacing="lg">
                  <WorkspaceNavGroup label="Workspace" items={primaryNavItems} />
                  <WorkspaceNavGroup label="Account" items={accountNavItems} />
                </Stack>
              ),
              content: (
                <Stack spacing="sm">
                  <Text weight="semibold">Dashboard</Text>
                  <Text size="sm" color="muted">
                    Overview of workspace activity for the current week.
                  </Text>
                </Stack>
              ),
              footer: <Text size="xs" color="muted">v2.4.0</Text>,
              aside: (
                <Stack spacing="sm">
                  <Text size="sm" weight="medium">Recent activity</Text>
                  <Text size="xs" color="muted">Priya Shah updated the Q3 roadmap.</Text>
                </Stack>
              ),
            },
            behavior: {
              toggleLabel: 'Collapse navigation',
              onCollapsedChange: () => undefined,
            },
          }}
        />
      );
    case 'workspace-shell':
      return (
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
              <Text weight="semibold">Active campaigns</Text>
              <Flex gap={8}>
                <Button size="sm" variant="secondary" onClick={() => undefined}>Filter</Button>
                <Button size="sm" variant="primary" onClick={() => undefined}>New campaign</Button>
              </Flex>
            </Flex>
            <Flex gap={8} wrap="wrap" style={{ padding: '0 16px 12px' }}>
              <Badge>Status: Active</Badge>
              <Badge>Region: EU</Badge>
            </Flex>
            {/* The shell owns no breakpoint behavior, so the consumer wraps its
                own rail; a fixed 220px column overlaps the rows at 390. */}
            <Flex gap={16} align="start" wrap="wrap" style={{ padding: '0 16px 16px' }}>
              <Stack spacing="sm" style={{ flex: '1 1 260px', minWidth: 0 }}>
                {campaignRows.map((row) => (
                  <Flex key={row.key} justify="between" gap={8}>
                    <Text size="sm">{row.name}</Text>
                    <Text size="sm" color="muted">{row.owner}</Text>
                  </Flex>
                ))}
              </Stack>
              <Stack spacing="sm" style={{ flex: '1 1 220px', minWidth: 0 }}>
                <Text size="xs" color="muted">Preview</Text>
                {/* Text renders inline, so two siblings in a bare Box run together
                    as "Spring launchOwned by ..."; Stack gives them block rhythm. */}
                <Stack spacing="xs">
                  <Text size="sm" weight="medium">{campaignRows[0]?.name}</Text>
                  <Text size="xs" color="muted">Owned by {campaignRows[0]?.owner}</Text>
                </Stack>
                <Button size="sm" variant="ghost" onClick={() => undefined}>View report</Button>
              </Stack>
            </Flex>
          </Stack>
        </WorkspaceShell>
      );
    default:
      return null;
  }
}

export const CONFIG_COMPOSITION_B_SLUGS = ['sidebar', 'workspace-shell'];
