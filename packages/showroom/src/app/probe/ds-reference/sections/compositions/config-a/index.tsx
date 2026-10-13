'use client';

/* Compositions probe fixtures, lane A: PageShellSurface and HeaderSurface,
   the two composition/layout families every other page-chrome surface builds on. */

import type { ReactNode } from 'react';
import {
  Badge,
  Button,
  Flex,
  HeaderSurface,
  PageShellSurface,
  Stack,
  Text,
} from '@rottay/design-system';

// page-shell fixtures

interface PlanMilestone {
  key: string;
  label: string;
  status: string;
}

const PLAN_MILESTONES: PlanMilestone[] = [
  { key: 'm1', label: 'Launch readiness review', status: 'Complete' },
  { key: 'm2', label: 'Budget sign-off', status: 'In progress' },
  { key: 'm3', label: 'Vendor onboarding', status: 'Not started' },
];

// header fixtures

const TEAM_TABS = [
  {
    key: 'members',
    label: 'Members',
    badge: <Badge>12</Badge>,
    content: <Text>12 active members across 3 roles.</Text>,
  },
  {
    key: 'roles',
    label: 'Roles',
    content: <Text>3 roles: Admin, Editor, Viewer.</Text>,
  },
  {
    key: 'defaults',
    label: 'Defaults',
    content: <Text>Default role for new invitations: Viewer.</Text>,
  },
];

export function ConfigCompositionASurface({ only }: { only: string }): ReactNode {
  switch (only) {
    case 'page-shell':
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
            breadcrumbs: [
              { label: 'Records', onClick: () => undefined },
              { label: 'Quarterly launch plan' },
            ],
            badge: <Badge tone="success">Active</Badge>,
            back: { label: 'Records', onClick: () => undefined },
          }}
          actions={
            <Flex gap={8}>
              <Button variant="secondary" onClick={() => undefined}>Export</Button>
              <Button variant="primary" onClick={() => undefined}>Edit plan</Button>
            </Flex>
          }
        >
          <Stack spacing="md">
            <Text>Owner: Alex Rivera. Last reviewed 2026-07-12.</Text>
            <Stack spacing="xs">
              {PLAN_MILESTONES.map((milestone) => (
                <Flex key={milestone.key} justify="between">
                  <Text weight="medium">{milestone.label}</Text>
                  <Text size="sm" color="muted">{milestone.status}</Text>
                </Flex>
              ))}
            </Stack>
          </Stack>
        </PageShellSurface>
      );
    case 'header':
      return (
        <HeaderSurface
          config={{
            visual: { tabsType: 'line' },
            presentation: {
              chrome: {
                title: 'Team settings',
                subtitle: 'Manage members, roles and defaults for this workspace.',
                breadcrumbs: [
                  { label: 'Workspace', onClick: () => undefined },
                  { label: 'Team settings' },
                ],
                badge: <Badge>12 members</Badge>,
                back: { label: 'Workspace', onClick: () => undefined },
              },
              description: 'Changes apply to every member of this workspace.',
              metadata: (
                <Text size="xs" color="muted">
                  Last updated 2026-07-11
                </Text>
              ),
            },
            behavior: {
              tabs: TEAM_TABS,
              activeTab: 'members',
              onTabChange: () => undefined,
              actions: [
                { id: 'invite', label: 'Invite member', variant: 'primary', onClick: () => undefined },
                { id: 'export', label: 'Export roster', onClick: () => undefined },
              ],
            },
          }}
        />
      );
    default:
      return null;
  }
}

export const CONFIG_COMPOSITION_A_SLUGS = ['page-shell', 'header'];
