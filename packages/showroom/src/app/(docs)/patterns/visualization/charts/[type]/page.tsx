import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import { charts, chartFamilies, type ChartFamily } from '@/data/registry';

// ---------------------------------------------------------------------------
// SSG
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return charts.map((c) => ({ type: c.slug }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function familyLabel(slug: ChartFamily): string {
  const entry = chartFamilies.find((f) => f.slug === slug);
  return entry?.label ?? slug;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ChartDetailPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const chart = charts.find((c) => c.slug === type);

  if (!chart) {
    return (
      <Stack spacing="md">
        <Text as={"h1" as any} size="2xl" weight="bold">
          Chart Not Found
        </Text>
        <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
          No chart matches &quot;{type}&quot;.
        </Text>
        <Link
          href="/patterns/visualization/charts"
          style={{ color: 'var(--ds-color-primary)', textDecoration: 'none' }}
        >
          ← Back to Charts
        </Link>
      </Stack>
    );
  }

  const importPath = `import { ${chart.name} } from '@rottay/design-system';`;

  return (
    <Stack spacing="lg">
      {/* Back link */}
      <Box>
        <Link
          href="/patterns/visualization/charts"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--ds-color-primary)',
            textDecoration: 'none',
          }}
        >
          ← Back to Charts
        </Link>
      </Box>

      {/* Header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            {chart.name}
          </Text>
          <Badge variant="primary">{familyLabel(chart.family)}</Badge>
        </Flex>
        <Box style={{ marginTop: 8 }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            {chart.description}
          </Text>
        </Box>
      </Box>

      {/* Variants */}
      {chart.variants && chart.variants.length > 0 && (
        <Card>
          <Stack spacing="md">
            <Text as={"h3" as any} size="lg" weight="semibold">
              Variants
            </Text>
            <Flex gap={8}>
              {chart.variants.map((v) => (
                <Badge key={v} variant="default">
                  {v}
                </Badge>
              ))}
            </Flex>
          </Stack>
        </Card>
      )}

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
              minHeight: 300,
              borderRadius: 8,
              border: '2px dashed var(--ds-color-neutral-300)',
              background: 'var(--ds-color-neutral-50)',
            }}
          >
            <Text
              size="sm"
              style={{ color: 'var(--ds-color-text-muted)' }}
            >
              Live {chart.name} demo with sample data will be rendered here.
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

      {/* Hooks */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            Related Hooks
          </Text>
          <Flex gap={4} style={{ flexWrap: 'wrap' }}>
            {[
              'useChartTheme',
              'useChartPersonality',
              'useChartDimensions',
              'useChartCompact',
            ].map((hook) => (
              <Box
                key={hook}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  background: 'var(--ds-color-neutral-100)',
                  fontSize: '0.75rem',
                  color: 'var(--ds-color-text-secondary)',
                  fontFamily: 'var(--font-geist-mono)',
                }}
              >
                {hook}
              </Box>
            ))}
          </Flex>
        </Stack>
      </Card>
    </Stack>
  );
}
