import Link from 'next/link';
import { Box, Flex, Stack, Text, Badge } from '@rottay/design-system';
import {
  primitives,
  primitivesByCategory,
  primitiveCategories,
} from '@/data/registry';
import type { PrimitiveCategory } from '@/data/registry';
import { EngineComparison } from '@/components/playground';
import { CodeBlock } from '@/components/playground';
import { PropTable } from '@/components/playground';
import type { PropDefinition } from '@/components/playground';
import { LivePreview } from './live-preview';

// ---------------------------------------------------------------------------
// SSG
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return primitives.map((p) => ({
    category: p.category,
    component: p.slug,
  }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCategoryLabel(slug: string): string {
  const cat = primitiveCategories.find((c) => c.slug === slug);
  return cat ? cat.label : slug;
}

/** Placeholder props -- will be replaced with real introspection later. */
function getPlaceholderProps(componentName: string): PropDefinition[] {
  return [
    {
      name: 'children',
      type: 'ReactNode',
      description: `Content rendered inside the ${componentName} component.`,
      required: false,
    },
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS class names.',
      required: false,
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description: 'Inline style overrides.',
      required: false,
    },
    {
      name: 'id',
      type: 'string',
      description: 'HTML id attribute.',
      required: false,
    },
  ];
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PrimitiveComponentPage({
  params,
}: {
  params: Promise<{ category: string; component: string }>;
}) {
  const { category, component } = await params;
  const categoryKey = category as PrimitiveCategory;
  const categoryLabel = getCategoryLabel(category);

  const entry = (primitivesByCategory[categoryKey] ?? []).find(
    (e) => e.slug === component,
  );

  // Fallback for unknown slugs
  if (!entry) {
    return (
      <Stack spacing="md">
        <Text as={"h1" as any} size="2xl" weight="bold">
          Component Not Found
        </Text>
        <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
          No component matches &quot;{component}&quot; in {categoryLabel}.
        </Text>
        <Link
          href={`/primitives/${category}`}
          style={{ color: 'var(--ds-color-primary)', textDecoration: 'none' }}
        >
          Back to {categoryLabel}
        </Link>
      </Stack>
    );
  }

  const importStatement = `import { ${entry.name} } from '@rottay/design-system';`;
  const placeholderProps = getPlaceholderProps(entry.name);

  return (
    <Stack spacing="lg">
      {/* Breadcrumb */}
      <Flex align="center" gap={8}>
        <Link href="/primitives" style={{ textDecoration: 'none' }}>
          <Text
            size="sm"
            style={{ color: 'var(--ds-color-primary)', cursor: 'pointer' }}
          >
            Primitives
          </Text>
        </Link>
        <Text size="sm" style={{ color: 'var(--ds-color-text-muted)' }}>
          /
        </Text>
        <Link
          href={`/primitives/${category}`}
          style={{ textDecoration: 'none' }}
        >
          <Text
            size="sm"
            style={{ color: 'var(--ds-color-primary)', cursor: 'pointer' }}
          >
            {categoryLabel}
          </Text>
        </Link>
        <Text size="sm" style={{ color: 'var(--ds-color-text-muted)' }}>
          /
        </Text>
        <Text size="sm" weight="semibold">
          {entry.name}
        </Text>
      </Flex>

      {/* Header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            {entry.name}
          </Text>
          <Badge variant="primary">{categoryLabel}</Badge>
        </Flex>
        <Box style={{ marginTop: 4 }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            {entry.description}
          </Text>
        </Box>
      </Box>

      {/* Engine support badges */}
      <Flex gap={8}>
        {entry.engines.map((engine) => (
          <Badge key={engine} variant="secondary">
            {engine}
          </Badge>
        ))}
      </Flex>

      {/* Engine comparison -- live DS component */}
      <EngineComparison>
        <LivePreview slug={component} />
      </EngineComparison>

      {/* Import snippet */}
      <CodeBlock code={importStatement} language="tsx" title="Import" />

      {/* Props table */}
      <PropTable title={`${entry.name} Props`} props={placeholderProps} />

      {/* Back link */}
      <Box>
        <Link
          href={`/primitives/${category}`}
          style={{
            fontSize: '0.8125rem',
            color: 'var(--ds-color-primary)',
            textDecoration: 'none',
          }}
        >
          Back to {categoryLabel}
        </Link>
      </Box>
    </Stack>
  );
}
