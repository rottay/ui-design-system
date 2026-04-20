'use client';

import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';

interface PatternGroup {
  title: string;
  description: string;
  href: string;
  patterns: string[];
}

const PATTERN_GROUPS: PatternGroup[] = [
  {
    title: 'Data',
    description: 'Table, grid, gallery, list toolbar, stats, and detail panel patterns for displaying and interacting with datasets.',
    href: '/patterns/data',
    patterns: [
      'PatternDataTable', 'PatternGridView', 'PatternGalleryView',
      'ListToolbar', 'StatsGrid', 'DetailPanel', 'SavedViews',
      'StatusFilterPills', 'BulkSelectToggle', 'ColumnSettings',
    ],
  },
  {
    title: 'Forms',
    description: 'Form construction, filtering, step wizards, and invoice templates for structured data entry.',
    href: '/patterns/forms',
    patterns: [
      'PatternFormBuilder', 'FilterBuilder', 'FilterPanel',
      'StepWizard', 'InvoiceTemplate',
    ],
  },
  {
    title: 'Visualization',
    description: 'Charts (19 types), calendar views, kanban boards, map views, timelines, and tree views.',
    href: '/patterns/visualization',
    patterns: [
      'Charts (19 types)', 'CalendarView', 'PatternKanbanBoard',
      'MapView', 'Timeline', 'TreeView',
    ],
  },
  {
    title: 'Communication',
    description: 'Activity logs, assistant interfaces, comment threads, live feeds, notification centers, and presence indicators.',
    href: '/patterns/communication',
    patterns: [
      'ActivityLog', 'Assistant', 'CommentThread',
      'LiveFeed', 'NotificationCenter', 'Presence',
    ],
  },
  {
    title: 'Workflow',
    description: 'Approval workflows, moderation galleries, operational ledgers, and shift scheduling matrices.',
    href: '/patterns/workflow',
    patterns: [
      'ApprovalInbox', 'ApprovalWorkflow', 'ModerationGallery',
      'OperationalLedger', 'ShiftMatrix',
    ],
  },
  {
    title: 'Navigation',
    description: 'Command palette, environment toggle, locale switcher, shortcuts overlay, and workspace switcher.',
    href: '/patterns/navigation',
    patterns: [
      'CommandPalette', 'EnvironmentToggle', 'PatternLocaleSwitcher',
      'ShortcutsOverlay', 'WorkspaceSwitcher',
    ],
  },
  {
    title: 'Misc',
    description: 'Branding preview, cockpit header, empty states, file manager, page shell, pricing tables, and more.',
    href: '/patterns/misc',
    patterns: [
      'BrandingPreviewSandbox', 'CockpitHeader', 'EmptyState',
      'FileManager', 'PageShell', 'PricingTable',
      'TenantPreview', 'TokenInspector', 'UserProfileCard',
      'WorkbenchHeader',
    ],
  },
];

export default function PatternsPage() {
  const tokens = useTokens();
  const totalPatterns = PATTERN_GROUPS.reduce((sum, g) => sum + g.patterns.length, 0);

  return (
    <Stack spacing="lg">
      {/* Page header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            Patterns
          </Text>
          <Badge variant="primary">{totalPatterns}+ patterns</Badge>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: "var(--ds-color-text-secondary)" }}>
            Patterns are reusable task-level widgets. They package common
            interaction logic -- tables, forms, charts, kanban boards -- so apps
            do not rewrite the same task flow. Patterns are engine-agnostic and
            compose primitives internally.
          </Text>
        </Box>
      </Box>

      {/* Group cards */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: tokens.spacing[5],
        }}
      >
        {PATTERN_GROUPS.map((group) => (
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
                  <Badge>{group.patterns.length} patterns</Badge>
                </Flex>

                <Text size="sm" style={{ color: "var(--ds-color-text-secondary)" }}>
                  {group.description}
                </Text>

                {/* Pattern names */}
                <Flex gap={4} style={{ flexWrap: 'wrap' }}>
                  {group.patterns.slice(0, 6).map((name) => (
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
                  {group.patterns.length > 6 && (
                    <Box
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'var(--ds-color-primary-50)',
                        fontSize: '0.75rem',
                        color: 'var(--ds-color-primary-600)',
                        fontWeight: 500,
                      }}
                    >
                      +{group.patterns.length - 6} more
                    </Box>
                  )}
                </Flex>
              </Stack>
            </Card>
          </Link>
        ))}
      </Box>

      {/* Mental model */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            Primitive vs Pattern
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
                background: 'var(--ds-color-neutral-50)',
                border: '1px solid var(--ds-color-neutral-200)',
              }}
            >
              <Text size="sm" weight="semibold">Primitive = a brick</Text>
              <Box style={{ marginTop: tokens.spacing[1] }}>
                <Text size="xs" style={{ color: "var(--ds-color-text-muted)" }}>
                  A single UI building block like Button, Input, or Card. Engine-switched with 4 implementations.
                </Text>
              </Box>
            </Box>
            <Box
              style={{
                padding: tokens.spacing[4],
                borderRadius: tokens.borderRadius.md,
                background: 'var(--ds-color-primary-50)',
                border: '1px solid var(--ds-color-primary-200)',
              }}
            >
              <Text size="sm" weight="semibold" style={{ color: "var(--ds-color-primary)" }}>Pattern = a reusable machine</Text>
              <Box style={{ marginTop: tokens.spacing[1] }}>
                <Text size="xs" style={{ color: "var(--ds-color-text-muted)" }}>
                  A task-level widget made of primitives. Sorting, filtering, pagination, selection -- all packaged for reuse.
                </Text>
              </Box>
            </Box>
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
