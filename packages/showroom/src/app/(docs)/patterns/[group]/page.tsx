import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import {
  patternsByGroup,
  patternGroups,
  type PatternGroup,
} from '@/data/registry';

// ---------------------------------------------------------------------------
// SSG
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return patternGroups.map((g) => ({ group: g.slug }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const GROUP_DESCRIPTIONS: Record<PatternGroup, string> = {
  data: 'Table, grid, gallery, list toolbar, stats, and detail panel patterns for displaying and interacting with datasets.',
  forms: 'Form construction, filtering, step wizards, and invoice templates for structured data entry.',
  visualization: 'Charts, calendar views, kanban boards, map views, timelines, and tree views for data visualization.',
  communication: 'Activity logs, assistant interfaces, comment threads, live feeds, notification centers, and presence indicators.',
  workflow: 'Approval workflows, moderation galleries, operational ledgers, and shift scheduling matrices.',
  navigation: 'Command palette, environment toggle, locale switcher, shortcuts overlay, and workspace switcher.',
  misc: 'Branding preview, cockpit header, empty states, file manager, page shell, pricing tables, and more.',
};

function groupLabel(slug: PatternGroup): string {
  const entry = patternGroups.find((g) => g.slug === slug);
  return entry?.label ?? slug;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PatternGroupPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group } = await params;
  const groupSlug = group as PatternGroup;
  const entries = patternsByGroup[groupSlug] ?? [];
  const label = groupLabel(groupSlug);
  const description = GROUP_DESCRIPTIONS[groupSlug] ?? '';

  return (
    <Stack spacing="lg">
      {/* Back link */}
      <Box>
        <Link
          href="/patterns"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--ds-color-primary)',
            textDecoration: 'none',
          }}
        >
          ← Back to Patterns
        </Link>
      </Box>

      {/* Header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            {label} Patterns
          </Text>
          <Badge variant="primary">{entries.length}</Badge>
        </Flex>
        <Box style={{ marginTop: 8 }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            {description}
          </Text>
        </Box>
      </Box>

      {/* Pattern cards grid */}
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
            href={`/patterns/${groupSlug}/${entry.slug}`}
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
