import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import {
  structures,
  structureGroups,
  type StructureGroup,
} from '@/data/registry';
import { StructurePreview } from './structure-preview';

// ---------------------------------------------------------------------------
// SSG
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return structures.map((s) => ({
    group: s.group,
    structure: s.slug,
  }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function groupLabel(slug: StructureGroup): string {
  const entry = structureGroups.find((g) => g.slug === slug);
  return entry?.label ?? slug;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function StructureDetailPage({
  params,
}: {
  params: Promise<{ group: string; structure: string }>;
}) {
  const { group, structure } = await params;
  const entry = structures.find(
    (s) => s.group === group && s.slug === structure,
  );

  if (!entry) {
    return (
      <Stack spacing="md">
        <Text as={"h1" as any} size="2xl" weight="bold">
          Structure Not Found
        </Text>
        <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
          No structure matches &quot;{structure}&quot; in group &quot;{group}&quot;.
        </Text>
        <Link
          href={`/structures/${group}`}
          style={{ color: 'var(--ds-color-primary)', textDecoration: 'none' }}
        >
          ← Back to {groupLabel(group as StructureGroup)} Structures
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
          href={`/structures/${group}`}
          style={{
            fontSize: '0.8125rem',
            color: 'var(--ds-color-primary)',
            textDecoration: 'none',
          }}
        >
          ← Back to {groupLabel(entry.group)} Structures
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

      {/* Live demo */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            Live Demo
          </Text>
          <Box
            style={{
              minHeight: 120,
              borderRadius: 8,
              border: '1px solid var(--ds-color-neutral-200)',
              background: 'var(--ds-color-neutral-50)',
              overflow: 'hidden',
            }}
          >
            <StructurePreview slug={entry.slug} />
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

      {/* Where structures fit */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            Layer Position
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Structures sit between patterns and surfaces in the 4-tier model.
            They organize a page around task widgets (patterns) without owning
            the full page recipe (surfaces) or the atomic UI blocks (primitives).
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: 8,
            }}
          >
            {[
              { tier: 'Primitives', active: false },
              { tier: 'Patterns', active: false },
              { tier: 'Structures', active: true },
              { tier: 'Surfaces', active: false },
            ].map((item) => (
              <Box
                key={item.tier}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  textAlign: 'center' as const,
                  background: item.active
                    ? 'var(--ds-color-primary-50)'
                    : 'var(--ds-color-neutral-50)',
                  border: item.active
                    ? '1px solid var(--ds-color-primary-200)'
                    : '1px solid var(--ds-color-neutral-200)',
                }}
              >
                <Text
                  size="xs"
                  weight="semibold"
                  color={item.active ? 'primary' : 'default'}
                >
                  {item.tier}
                </Text>
              </Box>
            ))}
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
