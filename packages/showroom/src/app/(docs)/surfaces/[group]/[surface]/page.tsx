import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import {
  surfaces,
  surfaceGroups,
  type SurfaceGroup,
} from '@/data/registry';

// ---------------------------------------------------------------------------
// SSG
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return surfaces.map((s) => ({
    group: s.group,
    surface: s.slug,
  }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function groupLabel(slug: SurfaceGroup): string {
  const entry = surfaceGroups.find((g) => g.slug === slug);
  return entry?.label ?? slug;
}

/** Brief description of what each surface composes. */
const SURFACE_COMPOSITIONS: Record<string, { patterns: string[]; structures: string[] }> = {
  list: {
    patterns: ['PatternDataTable', 'PatternGridView', 'PatternGalleryView'],
    structures: ['CollectionHeader', 'TableToolbar', 'ActiveFiltersBar', 'SearchCommandBar'],
  },
  dashboard: {
    patterns: ['PatternStatsGrid'],
    structures: ['DashboardHeader', 'StatsHeader', 'DashboardInsights'],
  },
  detail: {
    patterns: [],
    structures: ['DetailHeader', 'Record'],
  },
  form: {
    patterns: ['PatternFormBuilder'],
    structures: ['FormHeader', 'FormSections'],
  },
  'detail-form': {
    patterns: ['PatternFormBuilder'],
    structures: ['DetailHeader', 'FormSections'],
  },
  'collection-workspace': {
    patterns: ['PatternDataTable', 'PatternGridView', 'PatternGalleryView', 'PatternKanbanBoard'],
    structures: ['CollectionHeader', 'TableToolbar', 'SearchCommandBar', 'ViewModeSwitcher', 'ColumnMenu', 'ActiveFiltersBar'],
  },
  wizard: {
    patterns: ['StepWizard', 'PatternFormBuilder'],
    structures: ['FormHeader'],
  },
  kanban: {
    patterns: ['PatternKanbanBoard'],
    structures: ['CollectionHeader', 'SearchCommandBar'],
  },
  settings: {
    patterns: ['PatternFormBuilder'],
    structures: ['FormHeader', 'FormSections'],
  },
  auth: {
    patterns: ['PatternFormBuilder'],
    structures: [],
  },
  chat: {
    patterns: ['Assistant', 'CommentThread'],
    structures: [],
  },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SurfaceDetailPage({
  params,
}: {
  params: Promise<{ group: string; surface: string }>;
}) {
  const { group, surface } = await params;
  const entry = surfaces.find(
    (s) => s.group === group && s.slug === surface,
  );

  if (!entry) {
    return (
      <Stack spacing="md">
        <Text as={"h1" as any} size="2xl" weight="bold">
          Surface Not Found
        </Text>
        <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
          No surface matches &quot;{surface}&quot; in group &quot;{group}&quot;.
        </Text>
        <Link
          href="/surfaces"
          style={{ color: 'var(--ds-color-primary)', textDecoration: 'none' }}
        >
          ← Back to Surfaces
        </Link>
      </Stack>
    );
  }

  const composition = SURFACE_COMPOSITIONS[entry.slug];
  const importPath = `import { ${entry.name} } from '@rottay/design-system';`;

  return (
    <Stack spacing="lg">
      {/* Back link */}
      <Box>
        <Link
          href="/surfaces"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--ds-color-primary)',
            textDecoration: 'none',
          }}
        >
          ← Back to Surfaces
        </Link>
      </Box>

      {/* Header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            {entry.name}
          </Text>
          <Badge variant="primary">{groupLabel(entry.group)}</Badge>
        </Flex>
        <Box style={{ marginTop: 8 }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            {entry.description}
          </Text>
        </Box>
      </Box>

      {/* Composition */}
      {composition && (
        <Card>
          <Stack spacing="md">
            <Text as={"h3" as any} size="lg" weight="semibold">
              Composition
            </Text>
            <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
              This surface composes the following patterns and structures into a
              full-page recipe. The app provides the domain wiring (data
              fetching, routes, permissions, entity adapters).
            </Text>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
            >
              {/* Patterns column */}
              <Box
                style={{
                  padding: 16,
                  borderRadius: 8,
                  background: 'var(--ds-color-primary-50)',
                  border: '1px solid var(--ds-color-primary-200)',
                }}
              >
                <Text
                  size="sm"
                  weight="semibold"
                  style={{ color: 'var(--ds-color-primary)' }}
                >
                  Patterns
                </Text>
                <Stack spacing="xs" style={{ marginTop: 8 }}>
                  {composition.patterns.length > 0 ? (
                    composition.patterns.map((p) => (
                      <Text
                        key={p}
                        size="xs"
                        style={{
                          color: 'var(--ds-color-text-secondary)',
                          fontFamily: 'var(--font-geist-mono)',
                        }}
                      >
                        {p}
                      </Text>
                    ))
                  ) : (
                    <Text
                      size="xs"
                      style={{ color: 'var(--ds-color-text-muted)' }}
                    >
                      No specific patterns
                    </Text>
                  )}
                </Stack>
              </Box>

              {/* Structures column */}
              <Box
                style={{
                  padding: 16,
                  borderRadius: 8,
                  background: 'var(--ds-color-neutral-50)',
                  border: '1px solid var(--ds-color-neutral-200)',
                }}
              >
                <Text size="sm" weight="semibold">
                  Structures
                </Text>
                <Stack spacing="xs" style={{ marginTop: 8 }}>
                  {composition.structures.length > 0 ? (
                    composition.structures.map((s) => (
                      <Text
                        key={s}
                        size="xs"
                        style={{
                          color: 'var(--ds-color-text-secondary)',
                          fontFamily: 'var(--font-geist-mono)',
                        }}
                      >
                        {s}
                      </Text>
                    ))
                  ) : (
                    <Text
                      size="xs"
                      style={{ color: 'var(--ds-color-text-muted)' }}
                    >
                      No specific structures
                    </Text>
                  )}
                </Stack>
              </Box>
            </Box>
          </Stack>
        </Card>
      )}

      {/* Code example */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            Usage
          </Text>
          <Box
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '0.8125rem',
              padding: 16,
              borderRadius: 8,
              background: 'var(--ds-color-neutral-900)',
              color: 'var(--ds-color-neutral-100)',
              lineHeight: 1.7,
              overflowX: 'auto',
            }}
          >
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-400)' }}>
              {`// Import`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {importPath}
            </Text>
            <br />
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-400)' }}>
              {`// Config object`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`<${entry.name}`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-300)' }}>
              {`  config={{`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-300)' }}>
              {`    title: 'My Page',`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-300)' }}>
              {`    // ... domain wiring`}
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

      {/* Layer position */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            The Surface Contract
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            A surface is a configuration object, not a component tree. The app
            passes a config describing data, columns, actions, and permissions.
            The surface renders the full screen using the correct structures and
            patterns. Surfaces are the highest tier in the 4-tier model.
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
              { tier: 'Structures', active: false },
              { tier: 'Surfaces', active: true },
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
    </Stack>
  );
}
