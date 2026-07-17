import { ShowroomLink as Link } from '@/composition/components/showroom-link';
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { ENGINE_OPTIONS } from '@/composition/components/layout/runtime-options';
import { CodeBlock } from '@/composition/components/playground';
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
  mixWithSurface,
} from '@/composition/components/playground/surface-tokens';
import { RuntimeFingerprint } from '@/composition/components/runtime/runtime-fingerprint';
import {
  surfaceGroups,
  surfaces,
  type SurfaceEntry,
  type SurfaceGroup,
} from '@/data/registry';
import { formatShowroomLabel } from '@/composition/components/layout/config';

const SURFACE_COMPOSITIONS: Record<
  string,
  { patterns: string[]; structures: string[] }
> = {
  list: {
    patterns: ['PatternDataTable', 'PatternGridView', 'PatternGalleryView'],
    structures: [
      'CollectionHeader',
      'TableToolbar',
      'ActiveFiltersBar',
      'SearchCommandBar',
    ],
  },
  dashboard: {
    patterns: ['PatternStatsGrid', 'Charts'],
    structures: ['DashboardHeader', 'StatsHeader', 'DashboardInsights'],
  },
  detail: {
    patterns: ['ActivityLog', 'CommentThread'],
    structures: ['DetailHeader', 'Record'],
  },
  form: {
    patterns: ['PatternFormBuilder'],
    structures: ['FormHeader', 'FormSections'],
  },
  'detail-form': {
    patterns: ['PatternFormBuilder', 'ActivityLog'],
    structures: ['DetailHeader', 'FormSections'],
  },
  'collection-workspace': {
    patterns: [
      'PatternDataTable',
      'PatternGridView',
      'PatternGalleryView',
      'PatternKanbanBoard',
    ],
    structures: [
      'CollectionHeader',
      'TableToolbar',
      'SearchCommandBar',
      'ViewModeSwitcher',
      'ColumnMenu',
      'ActiveFiltersBar',
    ],
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
    structures: ['FormHeader'],
  },
  chat: {
    patterns: ['Assistant', 'CommentThread'],
    structures: ['DetailHeader', 'WorkbenchHeader'],
  },
};

const GROUP_GUIDANCE: Record<
  SurfaceGroup,
  {
    promise: string;
    evaluate: string[];
    appOwns: string[];
  }
> = {
  admin: {
    promise:
      'Admin surfaces should prove that dense back-office screens can still feel calm, legible, and trustworthy.',
    evaluate: ['permission-aware actions', 'operational density', 'clear recovery paths'],
    appOwns: ['data adapters', 'permissions', 'audit rules'],
  },
  data: {
    promise:
      'Data surfaces turn structures and patterns into a complete decision-making screen with routing, state, and domain wiring.',
    evaluate: ['query state clarity', 'summary to detail flow', 'data-to-action speed'],
    appOwns: ['fetching', 'aggregation', 'filters and routing'],
  },
  experience: {
    promise:
      'Experience surfaces should feel product-ready, branded, and emotionally coherent at first glance.',
    evaluate: ['brand fit', 'narrative clarity', 'call-to-action priority'],
    appOwns: ['content', 'copy', 'feature flags'],
  },
  forms: {
    promise:
      'Form surfaces should make long flows feel guided while still supporting speed for expert users.',
    evaluate: ['progress pacing', 'validation rhythm', 'review affordances'],
    appOwns: ['submission logic', 'draft persistence', 'business validation'],
  },
  operations: {
    promise:
      'Operations surfaces need to stay readable under live change, queue pressure, and multi-step decision making.',
    evaluate: ['real-time signal', 'queue priority', 'exception handling'],
    appOwns: ['live updates', 'command logic', 'domain thresholds'],
  },
  workspace: {
    promise:
      'Workspace surfaces are the clearest proof that the DS can handle multi-panel, multi-mode, serious application UX.',
    evaluate: ['mode switching', 'tool density', 'persistent context'],
    appOwns: ['layout state', 'panel orchestration', 'cross-surface memory'],
  },
};

const SURFACE_BOUNDARY_STEPS = [
  'Route and permissions gate access before the surface renders.',
  'Surface config defines layout, actions, and data hooks for the page recipe.',
  'Structures establish the page chrome and stable navigation frame.',
  'Patterns fill the work area while product-owned logic stays outside the DS contract.',
];

const SURFACE_TIERS = [
  { label: 'Primitives', active: false },
  { label: 'Patterns', active: false },
  { label: 'Structures', active: false },
  { label: 'Surfaces', active: true },
];

function groupLabel(slug: SurfaceGroup): string {
  const group = surfaceGroups.find((item) => item.slug === slug);
  return group?.label ?? slug;
}

function getComposition(entry: SurfaceEntry) {
  return (
    SURFACE_COMPOSITIONS[entry.slug] ?? {
      patterns: ['Pattern-specific widgets'],
      structures: ['Page-level scaffolding'],
    }
  );
}

function getUsageSnippet(entry: SurfaceEntry) {
  return `import { ${entry.name} } from '@rottay/design-system';

<${entry.name}
  config={{
    title: 'Your page title',
    dataSource,
    actions,
    permissions,
    routing,
  }}
/>`;
}

function getEngineMeta(engine: SurfaceEntry['engines'][number]) {
  return ENGINE_OPTIONS.find((option) => option.key === engine);
}

function EngineBadge({ engine }: { engine: SurfaceEntry['engines'][number] }) {
  const meta = getEngineMeta(engine);

  return (
    <Box
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 10px',
        borderRadius: 999,
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
        background: mixWithSurface(meta?.accent ?? 'var(--ds-color-primary, #60a5fa)', 8),
      }}
    >
      <Box
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: meta?.accent ?? 'var(--ds-color-primary)',
          boxShadow: `0 0 0 3px color-mix(in srgb, ${
            meta?.accent ?? 'var(--ds-color-primary)'
          } 16%, transparent)`,
        }}
      />
      <Text size="xs" weight="semibold" style={{ display: 'block' }}>
        {meta?.label ?? engine}
      </Text>
    </Box>
  );
}

export function generateStaticParams() {
  return surfaces.map((surface) => ({
    group: surface.group,
    surface: surface.slug,
  }));
}

export default async function SurfaceDetailPage({
  params,
}: {
  params: Promise<{ group: string; surface: string }>;
}) {
  const { group, surface } = await params;
  const entry = surfaces.find(
    (surfaceEntry) => surfaceEntry.group === group && surfaceEntry.slug === surface,
  );

  if (!entry) {
    return (
      <Card
        style={{
          padding: 28,
          border: `1px dashed ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.subtle} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
        }}
      >
        <Stack spacing="md">
          <Text as={"h1" as any} size="2xl" weight="bold" style={{ display: 'block' }}>
            Surface not found
          </Text>
          <Text
            size="md"
            style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
          >
            No surface matches &quot;{surface}&quot; in group &quot;{group}&quot;.
          </Text>
          <Link
            href="/surfaces"
            style={{
              color: 'var(--ds-color-primary)',
              textDecoration: 'none',
            }}
          >
            Back to surfaces
          </Link>
        </Stack>
      </Card>
    );
  }

  const guidance = GROUP_GUIDANCE[entry.group];
  const composition = getComposition(entry);
  const usageSnippet = getUsageSnippet(entry);
  const importPath = `import { ${entry.name} } from '@rottay/design-system';`;
  const displayName = formatShowroomLabel(entry.name);
  const compositionSummary = `${composition.structures.length} structure${
    composition.structures.length === 1 ? '' : 's'
  } + ${composition.patterns.length} pattern${
    composition.patterns.length === 1 ? '' : 's'
  }`;

  return (
    <Stack spacing="md" fullWidth>
      <Card
        style={{
          padding: 20,
          border: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${mixWithCanvas(
            'var(--ds-color-primary, #60a5fa)',
            8,
          )} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
          boxShadow: SHOWROOM_SURFACES.shadow,
        }}
      >
        <Stack spacing="sm">
          <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
            <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
              <Link href="/surfaces" style={{ textDecoration: 'none' }}>
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: 'block',
                    color: 'var(--ds-color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Surfaces
                </Text>
              </Link>
              <Text
                size="xs"
                style={{ display: 'block', color: 'var(--ds-color-text-muted)' }}
              >
                /
              </Text>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: 'block',
                  color: 'var(--ds-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {groupLabel(entry.group)}
              </Text>
              <Text
                size="xs"
                style={{ display: 'block', color: 'var(--ds-color-text-muted)' }}
              >
                /
              </Text>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: 'block',
                  color: 'var(--ds-color-text-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {displayName}
              </Text>
            </Flex>
            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="primary">{groupLabel(entry.group)}</Badge>
              <Badge variant="secondary">Surface layer</Badge>
            </Flex>
          </Flex>

          <Box
            className="surface-detail-header-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: 16,
              alignItems: 'start',
            }}
          >
            <Stack spacing="sm">
              <Stack spacing="xs">
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: 'block',
                    color: 'var(--ds-color-text-muted)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-geist-mono, monospace)',
                  }}
                >
                  {entry.name}
                </Text>
                <Text
                  as={"h1" as any}
                  size="2xl"
                  weight="bold"
                  style={{
                    display: 'block',
                    maxWidth: 680,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {displayName}
                </Text>
                <Text
                  size="sm"
                  style={{
                    display: 'block',
                    color: 'var(--ds-color-text-secondary)',
                    maxWidth: 760,
                    lineHeight: 1.6,
                  }}
                >
                  {entry.description}
                </Text>
                <Text
                  size="sm"
                  style={{
                    display: 'block',
                    color: 'var(--ds-color-text-secondary)',
                    maxWidth: 760,
                    lineHeight: 1.6,
                  }}
                >
                  {guidance.promise}
                </Text>
              </Stack>

              <Box
                style={{
                  padding: 12,
                  borderRadius: 16,
                  border: `1px solid ${SHOWROOM_SURFACES.border}`,
                  background: SHOWROOM_SURFACES.subtle,
                }}
              >
                <Stack spacing={4}>
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      display: 'block',
                      color: 'var(--ds-color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Summary
                  </Text>
                  <Text
                    size="sm"
                    style={{
                      display: 'block',
                      color: 'var(--ds-color-text-secondary)',
                      lineHeight: 1.55,
                    }}
                  >
                    Surface-owned framing, app-owned wiring, and runtime switching stay cleanly separated here.
                  </Text>
                </Stack>
              </Box>

              <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                {entry.engines.map((engine) => (
                  <EngineBadge key={engine} engine={engine} />
                ))}
                <Badge variant="secondary">{compositionSummary}</Badge>
              </Flex>
            </Stack>

            <Box
              style={{
                padding: 16,
                borderRadius: 20,
                border: `1px solid ${SHOWROOM_SURFACES.border}`,
                background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithCanvas(
                  'var(--ds-color-primary, #60a5fa)',
                  6,
                )} 100%)`,
              }}
            >
              <Stack spacing="sm">
                <Box
                  style={{
                    paddingBottom: 8,
                    borderBottom: `1px solid ${SHOWROOM_SURFACES.border}`,
                  }}
                >
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      display: 'block',
                      color: 'var(--ds-color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Runtime proof
                  </Text>
                  <Text
                    size="sm"
                    style={{
                      display: 'block',
                      marginTop: 6,
                      color: 'var(--ds-color-text-secondary)',
                      lineHeight: 1.6,
                    }}
                  >
                    Sidebar runtime switches should change the surface without page-local restyling.
                  </Text>
                </Box>
                <RuntimeFingerprint compact itemLimit={4} showHeader={false} />
              </Stack>
            </Box>
          </Box>

          <Box
            style={{
              padding: 14,
              borderRadius: 18,
              border: `1px solid ${SHOWROOM_SURFACES.border}`,
              background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.subtle} 0%, ${mixWithCanvas(
                'var(--ds-color-primary, #60a5fa)',
                5,
              )} 100%)`,
            }}
          >
            <Stack spacing="sm">
              <Flex align="center" justify="between" gap={10} style={{ flexWrap: 'wrap' }}>
                <Box>
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      display: 'block',
                      color: 'var(--ds-color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Audit boundary
                  </Text>
                  <Text
                    size="sm"
                    style={{
                      display: 'block',
                      marginTop: 4,
                      color: 'var(--ds-color-text-secondary)',
                      lineHeight: 1.6,
                    }}
                  >
                    Judge the DS-owned screen contract here; keep domain rules and orchestration outside.
                  </Text>
                </Box>
                <Badge variant="secondary">Product wiring stays app-side</Badge>
              </Flex>

                <Box
                  style={{
                    paddingTop: 12,
                    borderTop: `1px solid ${SHOWROOM_SURFACES.border}`,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                    gap: 12,
                  }}
                >
                <Box
                  style={{
                    padding: 12,
                    borderRadius: 16,
                    border: `1px solid ${SHOWROOM_SURFACES.border}`,
                    background: SHOWROOM_SURFACES.surface,
                  }}
                >
                  <Stack spacing={6}>
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{
                        display: 'block',
                        color: 'var(--ds-color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      Review
                    </Text>
                    <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                      {guidance.evaluate.map((item) => (
                        <Badge key={item} variant="secondary">
                          {item}
                        </Badge>
                      ))}
                    </Flex>
                  </Stack>
                </Box>

                <Box
                  style={{
                    padding: 12,
                    borderRadius: 16,
                    border: `1px solid ${SHOWROOM_SURFACES.border}`,
                    background: SHOWROOM_SURFACES.surface,
                  }}
                >
                  <Stack spacing={6}>
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{
                        display: 'block',
                        color: 'var(--ds-color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      App still owns
                    </Text>
                    <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                      {guidance.appOwns.map((item) => (
                        <Badge key={item} variant="secondary">
                          {item}
                        </Badge>
                      ))}
                    </Flex>
                  </Stack>
                </Box>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Card>

      <Card style={{ padding: 18 }}>
        <Stack spacing="sm">
          <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
            <Box>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: 'block',
                  color: 'var(--ds-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Composition
              </Text>
              <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: 'block' }}>
                Recipe map and contract boundary
              </Text>
            </Box>
            <Badge variant="secondary">{compositionSummary}</Badge>
          </Flex>

          <Text
            size="sm"
            style={{ display: 'block', color: 'var(--ds-color-text-secondary)', lineHeight: 1.6 }}
          >
            Surfaces are page recipes: structures hold the frame, patterns carry reusable tasks,
            and the app provides domain state, permissions, and routing.
          </Text>

          <Box
            style={{
              paddingTop: 12,
              borderTop: `1px solid ${SHOWROOM_SURFACES.border}`,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: 14,
              alignItems: 'start',
            }}
          >
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 12,
              }}
            >
              <Box
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: SHOWROOM_SURFACES.subtle,
                  border: `1px solid ${SHOWROOM_SURFACES.border}`,
                }}
              >
                <Stack spacing={6}>
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      display: 'block',
                      color: 'var(--ds-color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Structures
                  </Text>
                  <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                    {composition.structures.map((item) => (
                      <Badge key={item} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                  </Flex>
                </Stack>
              </Box>

              <Box
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: SHOWROOM_SURFACES.subtle,
                  border: `1px solid ${SHOWROOM_SURFACES.border}`,
                }}
              >
                <Stack spacing={6}>
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      display: 'block',
                      color: 'var(--ds-color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Patterns
                  </Text>
                  <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                    {composition.patterns.map((item) => (
                      <Badge key={item} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                  </Flex>
                </Stack>
              </Box>
            </Box>

            <Stack spacing="xs">
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: 'block',
                  color: 'var(--ds-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Boundary flow
              </Text>
              {SURFACE_BOUNDARY_STEPS.map((item) => (
                <Box
                  key={item}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: SHOWROOM_SURFACES.subtle,
                    border: `1px solid ${SHOWROOM_SURFACES.border}`,
                  }}
                >
                  <Text
                    size="sm"
                    style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
                  >
                    {item}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Card>

      <Stack spacing="sm" fullWidth>
        <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
          <Box>
            <Text
              size="xs"
              weight="semibold"
              style={{
                display: 'block',
                color: 'var(--ds-color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              API and code
            </Text>
            <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: 'block' }}>
              Import and usage contract
            </Text>
          </Box>
          <Badge variant="secondary">{displayName}</Badge>
        </Flex>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
            padding: '12px 14px',
            borderRadius: 16,
            border: `1px solid ${SHOWROOM_SURFACES.border}`,
            background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.subtle} 0%, ${mixWithCanvas(
              'var(--ds-color-primary, #60a5fa)',
              5,
            )} 100%)`,
          }}
        >
          <Box>
            <Text
              size="xs"
              weight="semibold"
              style={{
                display: 'block',
                color: 'var(--ds-color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Audit focus
            </Text>
            <Flex gap={6} style={{ marginTop: 8, flexWrap: 'wrap' }}>
              {guidance.evaluate.map((item) => (
                <Badge key={item} variant="secondary">
                  {item}
                </Badge>
              ))}
            </Flex>
          </Box>

          <Box>
            <Text
              size="xs"
              weight="semibold"
              style={{
                display: 'block',
                color: 'var(--ds-color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Layer fit
            </Text>
            <Flex gap={8} style={{ marginTop: 8, flexWrap: 'wrap' }}>
              {SURFACE_TIERS.map(({ label, active }) => (
                <Box
                  key={label}
                  style={{
                    padding: '7px 10px',
                    borderRadius: 999,
                    background: active
                      ? mixWithSurface('#14b8a6', 16, SHOWROOM_SURFACES.surface)
                      : SHOWROOM_SURFACES.subtle,
                    border: active
                      ? `1px solid ${mixWithSurface('#14b8a6', 28, SHOWROOM_SURFACES.border)}`
                      : `1px solid ${SHOWROOM_SURFACES.border}`,
                  }}
                >
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      display: 'block',
                      color: active
                        ? 'var(--ds-color-primary)'
                        : 'var(--ds-color-text-secondary)',
                    }}
                  >
                    {label}
                  </Text>
                </Box>
              ))}
            </Flex>
          </Box>
        </Box>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: 12,
          }}
        >
          <CodeBlock code={importPath} language="tsx" title="Import" />
          <CodeBlock code={usageSnippet} language="tsx" title="Usage contract" />
        </Box>
      </Stack>
    </Stack>
  );
}
