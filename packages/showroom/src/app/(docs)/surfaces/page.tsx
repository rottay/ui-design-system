'use client';

import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';

interface SurfaceGroup {
  title: string;
  description: string;
  href: string;
  surfaces: string[];
}

const SURFACE_GROUPS: SurfaceGroup[] = [
  {
    title: 'Data',
    description: 'Surfaces for displaying data in various modes: lists, dashboards, details, reports, search, comparisons, and visualizations.',
    href: '/surfaces/data',
    surfaces: [
      'ListSurface', 'DashboardSurface', 'DetailSurface',
      'ReportSurface', 'SearchSurface', 'CompareSurface',
      'VisualizationSurface',
    ],
  },
  {
    title: 'Forms',
    description: 'Surfaces for data entry: standard forms, detail forms, guided draft forms, and multi-step wizards.',
    href: '/surfaces/forms',
    surfaces: [
      'FormSurface', 'DetailFormSurface', 'GuidedDraftFormSurface',
      'WizardSurface',
    ],
  },
  {
    title: 'Workspace',
    description: 'Full workspace surfaces for collection management, record workbenches, command centers, and decision inboxes.',
    href: '/surfaces/workspace',
    surfaces: [
      'CollectionWorkspaceSurface', 'RecordWorkbenchSurface',
      'CommandCenterSurface', 'DecisionInboxSurface',
    ],
  },
  {
    title: 'Experience',
    description: 'User-facing experience surfaces: auth, chat, editor, onboarding, pricing, notifications, and marketing.',
    href: '/surfaces/experience',
    surfaces: [
      'AuthSurface', 'ChatSurface', 'EditorSurface',
      'EmptyStateSurface', 'MarketingSurface', 'MediaSurface',
      'NotificationSurface', 'OnboardingSurface', 'PricingSurface',
    ],
  },
  {
    title: 'Admin',
    description: 'Administrative surfaces for settings, teams, profiles, billing, auditing, imports/exports, and integrations.',
    href: '/surfaces/admin',
    surfaces: [
      'SettingsSurface', 'TeamSurface', 'ProfileSurface',
      'BillingSurface', 'AuditSurface', 'ImportExportSurface',
      'IntegrationSurface', 'FileBrowserSurface',
    ],
  },
  {
    title: 'Operations',
    description: 'Operational surfaces for kanban workflows, scheduling, activity tracking, and operational dashboards.',
    href: '/surfaces/operations',
    surfaces: [
      'KanbanSurface', 'SchedulerSurface', 'ActivitySurface',
      'OperationalSurface',
    ],
  },
];

export default function SurfacesPage() {
  const tokens = useTokens();
  const totalSurfaces = SURFACE_GROUPS.reduce((sum, g) => sum + g.surfaces.length, 0);

  return (
    <Stack spacing="lg">
      {/* Page header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            Surfaces
          </Text>
          <Badge variant="primary">{totalSurfaces} surfaces</Badge>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: "var(--ds-color-text-secondary)" }}>
            Surfaces are declarative page-level recipes. They compose patterns,
            structures, and primitives into a full screen contract. The app owns
            domain wiring (data fetching, routes, permissions), while the surface
            defines which structures appear and how the screen is composed.
          </Text>
        </Box>
      </Box>

      {/* How surfaces work */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            The Surface Contract
          </Text>
          <Text size="sm" style={{ color: "var(--ds-color-text-secondary)" }}>
            A surface is a configuration object, not a component. The app passes
            a config describing its data, columns, actions, and permissions. The
            surface renders the full screen using the correct structures and
            patterns.
          </Text>
          <Box
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '0.8125rem',
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.md,
              background: 'var(--ds-color-neutral-900)',
              color: 'var(--ds-color-neutral-100)',
              lineHeight: 1.7,
              overflowX: 'auto',
            }}
          >
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-400)' }}>
              {`// Example: declarative list surface`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`<ListSurface`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-300)' }}>
              {`  config={{`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-300)' }}>
              {`    title: 'Users',`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-300)' }}>
              {`    columns: [...],`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-300)' }}>
              {`    data: users,`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-300)' }}>
              {`    actions: { create: true, export: true },`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-300)' }}>
              {`  }}`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`/>`}
            </Text>
          </Box>
        </Stack>
      </Card>

      {/* Group cards */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: tokens.spacing[5],
        }}
      >
        {SURFACE_GROUPS.map((group) => (
          <Link
            key={group.href}
            href={group.href}
            style={{ textDecoration: 'none' }}
          >
            <Card
              hoverable
              style={{
                height: '100%',
                cursor: 'pointer',
                transition: 'box-shadow 200ms ease, transform 200ms ease',
              }}
            >
              <Stack spacing="md">
                <Flex align="center" justify="between">
                  <Text as={"h3" as any} size="lg" weight="semibold">
                    {group.title}
                  </Text>
                  <Badge>{group.surfaces.length} surfaces</Badge>
                </Flex>

                <Text size="sm" style={{ color: "var(--ds-color-text-secondary)" }}>
                  {group.description}
                </Text>

                {/* Surface names */}
                <Flex gap={4} style={{ flexWrap: 'wrap' }}>
                  {group.surfaces.map((name) => (
                    <Box
                      key={name}
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'var(--ds-color-neutral-100)',
                        fontSize: '0.75rem',
                        color: 'var(--ds-color-text-secondary)',
                        fontFamily: 'var(--font-geist-mono)',
                      }}
                    >
                      {name}
                    </Box>
                  ))}
                </Flex>
              </Stack>
            </Card>
          </Link>
        ))}
      </Box>

      {/* Ownership model */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            Ownership: DS vs App
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: tokens.spacing[5],
            }}
          >
            <Box
              style={{
                padding: tokens.spacing[4],
                borderRadius: tokens.borderRadius.md,
                background: 'var(--ds-color-primary-50)',
                border: '1px solid var(--ds-color-primary-200)',
              }}
            >
              <Text size="sm" weight="semibold" style={{ color: "var(--ds-color-primary)" }}>
                Design System Owns
              </Text>
              <Stack spacing="xs" style={{ marginTop: tokens.spacing[2] }}>
                {[
                  'Which structures appear on screen',
                  'How the screen is composed',
                  'Visual configuration options',
                  'Layout, chrome, and widget placement',
                ].map((item) => (
                  <Flex key={item} align="baseline" gap={6}>
                    <Text size="xs" style={{ color: "var(--ds-color-text-muted)" }}>-</Text>
                    <Text size="xs" style={{ color: "var(--ds-color-text-secondary)" }}>{item}</Text>
                  </Flex>
                ))}
              </Stack>
            </Box>
            <Box
              style={{
                padding: tokens.spacing[4],
                borderRadius: tokens.borderRadius.md,
                background: 'var(--ds-color-neutral-50)',
                border: '1px solid var(--ds-color-neutral-200)',
              }}
            >
              <Text size="sm" weight="semibold">
                App Owns
              </Text>
              <Stack spacing="xs" style={{ marginTop: tokens.spacing[2] }}>
                {[
                  'Data fetching and route params',
                  'Labels, copy, and domain semantics',
                  'Permissions and policy decisions',
                  'Entity adapters and feature flags',
                ].map((item) => (
                  <Flex key={item} align="baseline" gap={6}>
                    <Text size="xs" style={{ color: "var(--ds-color-text-muted)" }}>-</Text>
                    <Text size="xs" style={{ color: "var(--ds-color-text-secondary)" }}>{item}</Text>
                  </Flex>
                ))}
              </Stack>
            </Box>
          </Box>
        </Stack>
      </Card>

      {/* Full layer model */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            The 4-Tier Model
          </Text>
          <Stack spacing="xs">
            {[
              { tier: 'Primitives', analogy: 'A brick', detail: 'Smallest engine-switched building blocks' },
              { tier: 'Patterns', analogy: 'A reusable machine', detail: 'Task-level widgets made of bricks' },
              { tier: 'Structures', analogy: 'The frame', detail: 'Page chrome that wraps machines' },
              { tier: 'Surfaces', analogy: 'The whole room', detail: 'Declarative full-page recipes' },
            ].map((item, index) => (
              <Flex
                key={item.tier}
                align="center"
                gap={12}
                style={{
                  padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
                  borderRadius: tokens.borderRadius.md,
                  background: index === 3
                    ? 'var(--ds-color-primary-50)'
                    : 'var(--ds-color-neutral-50)',
                  border: index === 3
                    ? '1px solid var(--ds-color-primary-200)'
                    : '1px solid var(--ds-color-neutral-200)',
                }}
              >
                <Box style={{ flex: '0 0 100px' }}>
                  <Text
                    size="sm"
                    weight="semibold"
                    color={index === 3 ? 'primary' : 'default'}
                  >
                    {item.tier}
                  </Text>
                </Box>
                <Box style={{ flex: '0 0 160px' }}>
                  <Text size="xs" style={{ color: "var(--ds-color-text-muted)" }}>{item.analogy}</Text>
                </Box>
                <Box style={{ flex: 1 }}>
                  <Text size="xs" style={{ color: "var(--ds-color-text-secondary)" }}>{item.detail}</Text>
                </Box>
              </Flex>
            ))}
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
