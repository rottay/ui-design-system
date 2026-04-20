import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import {
  patterns,
  patternGroups,
  type PatternGroup,
} from '@/data/registry';

// ---------------------------------------------------------------------------
// SSG
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return patterns.map((p) => ({
    group: p.group,
    pattern: p.slug,
  }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function groupLabel(slug: PatternGroup): string {
  const entry = patternGroups.find((g) => g.slug === slug);
  return entry?.label ?? slug;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PatternDetailPage({
  params,
}: {
  params: Promise<{ group: string; pattern: string }>;
}) {
  const { group, pattern } = await params;
  const entry = patterns.find(
    (p) => p.group === group && p.slug === pattern,
  );

  if (!entry) {
    return (
      <Stack spacing="md">
        <Text as={"h1" as any} size="2xl" weight="bold">
          Pattern Not Found
        </Text>
        <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
          No pattern matches &quot;{pattern}&quot; in group &quot;{group}&quot;.
        </Text>
        <Link
          href={`/patterns/${group}`}
          style={{ color: 'var(--ds-color-primary)', textDecoration: 'none' }}
        >
          ← Back to {groupLabel(group as PatternGroup)} Patterns
        </Link>
      </Stack>
    );
  }

  const importPath = `import { ${entry.name} } from '@rottay/design-system';`;

  return (
    <Stack spacing="lg">
      {/* Back link */}
      <Box>
        <Link
          href={`/patterns/${group}`}
          style={{
            fontSize: '0.8125rem',
            color: 'var(--ds-color-primary)',
            textDecoration: 'none',
          }}
        >
          ← Back to {groupLabel(entry.group)} Patterns
        </Link>
      </Box>

      {/* Header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            {entry.name}
          </Text>
          <Badge variant="primary">{entry.group}</Badge>
        </Flex>
        <Box style={{ marginTop: 8 }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            {entry.description}
          </Text>
        </Box>
      </Box>

      {/* Live demo placeholder */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            Live Demo
          </Text>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200,
              borderRadius: 8,
              border: '2px dashed var(--ds-color-neutral-300)',
              background: 'var(--ds-color-neutral-50)',
            }}
          >
            <Text
              size="sm"
              style={{ color: 'var(--ds-color-text-muted)' }}
            >
              Live demo for {entry.name} will be rendered here.
            </Text>
          </Box>
        </Stack>
      </Card>

      {/* Import snippet */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            Import
          </Text>
          <Box
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '0.8125rem',
              padding: 16,
              borderRadius: 8,
              background: 'var(--ds-color-neutral-900)',
              color: 'var(--ds-color-neutral-100)',
              overflowX: 'auto',
            }}
          >
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {importPath}
            </Text>
          </Box>
        </Stack>
      </Card>

      {/* Engine support */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            Engine Support
          </Text>
          <Flex gap={8}>
            {entry.engines.map((eng) => (
              <Badge key={eng} variant="default">
                {eng}
              </Badge>
            ))}
          </Flex>
        </Stack>
      </Card>
    </Stack>
  );
}
