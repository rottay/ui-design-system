import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import {
  primitivesByCategory,
  primitiveCategories,
} from '@/data/registry';
import type { PrimitiveCategory } from '@/data/registry';

// ---------------------------------------------------------------------------
// SSG
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return primitiveCategories.map((cat) => ({ category: cat.slug }));
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

function getCategoryLabel(slug: string): string {
  const cat = primitiveCategories.find((c) => c.slug === slug);
  return cat ? cat.label : slug;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function PrimitiveCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const categoryKey = category as PrimitiveCategory;
  const entries = primitivesByCategory[categoryKey] ?? [];
  const label = getCategoryLabel(category);

  return (
    <Stack spacing="lg">
      {/* Page header */}
      <Box>
        <Flex align="center" gap={8}>
          <Link href="/primitives" style={{ textDecoration: 'none' }}>
            <Text
              size="sm"
              style={{
                color: 'var(--ds-color-primary)',
                cursor: 'pointer',
              }}
            >
              Primitives
            </Text>
          </Link>
          <Text size="sm" style={{ color: 'var(--ds-color-text-muted)' }}>
            /
          </Text>
          <Text size="sm" weight="semibold">
            {label}
          </Text>
        </Flex>
        <Box style={{ marginTop: 12 }}>
          <Flex align="center" gap={8}>
            <Text as={"h1" as any} size="2xl" weight="bold">
              {label}
            </Text>
            <Badge variant="primary">{entries.length} components</Badge>
          </Flex>
        </Box>
        <Box style={{ marginTop: 4 }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Browse all {label.toLowerCase()} primitives. Each component has
            engine-specific implementations (Classic, Modern, Rustic) selected
            at runtime.
          </Text>
        </Box>
      </Box>

      {/* Component cards grid */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 20,
        }}
      >
        {entries.map((entry) => (
          <Link
            key={entry.slug}
            href={`/primitives/${category}/${entry.slug}`}
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
                  <Text
                    size="md"
                    weight="semibold"
                    style={{ fontFamily: 'var(--font-geist-mono)' }}
                  >
                    {entry.name}
                  </Text>
                  <Badge variant="success">
                    {entry.engines.length} engines
                  </Badge>
                </Flex>

                <Text
                  size="sm"
                  style={{ color: 'var(--ds-color-text-secondary)' }}
                >
                  {entry.description}
                </Text>

                {/* Engine tags */}
                <Flex gap={4} style={{ flexWrap: 'wrap' }}>
                  {entry.engines.map((engine) => (
                    <Box
                      key={engine}
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'var(--ds-color-neutral-100)',
                        fontSize: '0.75rem',
                        color: 'var(--ds-color-text-secondary)',
                        fontFamily: 'var(--font-geist-mono)',
                      }}
                    >
                      {engine}
                    </Box>
                  ))}
                </Flex>
              </Stack>
            </Card>
          </Link>
        ))}
      </Box>

      {/* Empty state */}
      {entries.length === 0 && (
        <Card>
          <Flex justify="center" align="center" style={{ padding: 40 }}>
            <Text
              size="md"
              style={{ color: 'var(--ds-color-text-muted)' }}
            >
              No primitives found for category &quot;{category}&quot;.
            </Text>
          </Flex>
        </Card>
      )}
    </Stack>
  );
}
