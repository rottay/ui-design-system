'use client';

import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';

interface StructureGroup {
  title: string;
  description: string;
  href: string;
  structures: string[];
}

const STRUCTURE_GROUPS: StructureGroup[] = [
  {
    title: 'Headers',
    description: 'Page-level header structures for collections, dashboards, detail views, edit views, and forms.',
    href: '/structures/headers',
    structures: [
      'CollectionHeader', 'DashboardHeader', 'DetailHeader',
      'EditHeader', 'FormHeader',
    ],
  },
  {
    title: 'Workspace',
    description: 'Screen chrome components that organize a page around data patterns: toolbars, filters, search, column menus, and view modes.',
    href: '/structures/workspace',
    structures: [
      'ActiveFiltersBar', 'ColumnMenu', 'ExportButton',
      'FieldFiltersPanel', 'SavedViewsMenu', 'ScopeSwitcher',
      'SearchCommandBar', 'SelectionPreviewRail', 'TableToolbar',
      'ViewModeSwitcher',
    ],
  },
  {
    title: 'Record',
    description: 'Record-level structures for displaying detailed entity information with form sections and field grids.',
    href: '/structures/record',
    structures: ['RecordFieldGrid', 'FormSections'],
  },
  {
    title: 'Dashboard',
    description: 'Dashboard-level structures for insights, stats, and data terminal displays.',
    href: '/structures/dashboard',
    structures: ['DashboardInsights', 'DataTerminalCard', 'StatsHeader'],
  },
  {
    title: 'Feedback',
    description: 'Loading and transition state structures for page-level feedback.',
    href: '/structures/feedback',
    structures: ['LoadingOverlay'],
  },
];

export default function StructuresPage() {
  const tokens = useTokens();
  const totalStructures = STRUCTURE_GROUPS.reduce((sum, g) => sum + g.structures.length, 0);

  return (
    <Stack spacing="lg">
      {/* Page header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            Structures
          </Text>
          <Badge variant="primary">{totalStructures} structures</Badge>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: "var(--ds-color-text-secondary)" }}>
            Structures are page-structure widgets that organize a screen around
            patterns. They define the surrounding screen chrome -- headers,
            toolbars, command bars, record panels, metric cards -- not the whole
            page. Think of a structure as the frame around the machine on a page.
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
        {STRUCTURE_GROUPS.map((group) => (
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
                  <Badge>{group.structures.length}</Badge>
                </Flex>

                <Text size="sm" style={{ color: "var(--ds-color-text-secondary)" }}>
                  {group.description}
                </Text>

                {/* Structure names */}
                <Flex gap={4} style={{ flexWrap: 'wrap' }}>
                  {group.structures.map((name) => (
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

      {/* Layer model */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            Where Structures Fit
          </Text>
          <Text size="sm" style={{ color: "var(--ds-color-text-secondary)" }}>
            The design system has a 4-tier layer model. Structures sit between
            patterns and surfaces:
          </Text>
          <Stack spacing="xs">
            {[
              {
                tier: 'Primitives',
                analogy: 'A brick',
                detail: 'Smallest reusable UI blocks (Button, Input, Card)',
                active: false,
              },
              {
                tier: 'Patterns',
                analogy: 'A reusable machine',
                detail: 'Task-level widgets (DataTable, FormBuilder, KanbanBoard)',
                active: false,
              },
              {
                tier: 'Structures',
                analogy: 'The frame around the machine',
                detail: 'Page chrome that wraps patterns (headers, toolbars, menus)',
                active: true,
              },
              {
                tier: 'Surfaces',
                analogy: 'The whole room layout',
                detail: 'Declarative page recipes using patterns + structures',
                active: false,
              },
            ].map((item) => (
              <Flex
                key={item.tier}
                align="center"
                gap={12}
                style={{
                  padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
                  borderRadius: tokens.borderRadius.md,
                  background: item.active
                    ? 'var(--ds-color-primary-50)'
                    : 'var(--ds-color-neutral-50)',
                  border: item.active
                    ? '1px solid var(--ds-color-primary-200)'
                    : '1px solid var(--ds-color-neutral-200)',
                }}
              >
                <Box style={{ flex: '0 0 120px' }}>
                  <Text
                    size="sm"
                    weight="semibold"
                    color={item.active ? 'primary' : 'default'}
                  >
                    {item.tier}
                  </Text>
                </Box>
                <Box style={{ flex: '0 0 180px' }}>
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
