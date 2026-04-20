import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import {
  structuresByGroup,
  structureGroups,
  type StructureGroup,
} from '@/data/registry';

// ---------------------------------------------------------------------------
// SSG
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return structureGroups.map((g) => ({ group: g.slug }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const GROUP_DESCRIPTIONS: Record<StructureGroup, string> = {
  headers:
    'Page-level header structures for collections, dashboards, detail views, edit views, and forms.',
  workspace:
    'Screen chrome components that organize a page around data patterns: toolbars, filters, search, column menus, and view modes.',
  record:
    'Record-level structures for displaying detailed entity information with form sections and field grids.',
  dashboard:
    'Dashboard-level structures for insights, stats, and data terminal displays.',
  feedback:
    'Loading and transition state structures for page-level feedback.',
};

function groupLabel(slug: StructureGroup): string {
  const entry = structureGroups.find((g) => g.slug === slug);
  return entry?.label ?? slug;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function StructureGroupPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group } = await params;
  const groupSlug = group as StructureGroup;
  const entries = structuresByGroup[groupSlug] ?? [];
  const label = groupLabel(groupSlug);
  const description = GROUP_DESCRIPTIONS[groupSlug] ?? '';

  return (
    <Stack spacing="lg">
      {/* Back link */}
      <Box>
        <Link
          href="/structures"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--ds-color-primary)',
            textDecoration: 'none',
          }}
        >
          ← Back to Structures
        </Link>
      </Box>

      {/* Header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            {label} Structures
          </Text>
          <Badge variant="primary">{entries.length}</Badge>
        </Flex>
        <Box style={{ marginTop: 8 }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            {description}
          </Text>
        </Box>
      </Box>

      {/* Structure cards grid */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20,
        }}
      >
        {entries.map((entry) => (
          <Link
            key={entry.slug}
            href={`/structures/${groupSlug}/${entry.slug}`}
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
              <Stack spacing="sm">
                <Flex align="center" justify="between">
                  <Text as={"h3" as any} size="md" weight="semibold">
                    {entry.name}
                  </Text>
                  <Badge variant="default">{groupSlug}</Badge>
                </Flex>

                <Text
                  size="sm"
                  style={{ color: 'var(--ds-color-text-secondary)' }}
                >
                  {entry.description}
                </Text>

                <Flex gap={4} style={{ flexWrap: 'wrap' }}>
                  {entry.engines.map((eng) => (
                    <Box
                      key={eng}
                      style={{
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: 'var(--ds-color-neutral-100)',
                        fontSize: '0.6875rem',
                        color: 'var(--ds-color-text-muted)',
                        fontFamily: 'var(--font-geist-mono)',
                      }}
                    >
                      {eng}
                    </Box>
                  ))}
                </Flex>
              </Stack>
            </Card>
          </Link>
        ))}
      </Box>
    </Stack>
  );
}
