import { ShowroomLink as Link } from '@/components/showroom-link';
import {
  DocsMetricTile,
  DocsPanel,
  SectionDivider,
} from '@/components/showroom-ui';
import { notFound } from 'next/navigation';
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import {
  structureGroups,
  structuresByGroup,
  type StructureGroup,
} from '@/data/registry';

const GROUP_PROFILES: Record<
  StructureGroup,
  {
    summary: string;
    evaluate: string[];
    patterns: string[];
    surfaces: string[];
  }
> = {
  headers: {
    summary:
      'Header structures set context, count, status, and top-level actions before the user scans deeper modules.',
    evaluate: ['context at a glance', 'action priority', 'density without clutter'],
    patterns: ['stats grids', 'detail panels', 'commands'],
    surfaces: ['DashboardSurface', 'ListSurface', 'DetailSurface'],
  },
  workspace: {
    summary:
      'Workspace structures make collection pages usable by grouping search, filters, view modes, and bulk actions.',
    evaluate: ['control grouping', 'operator pace', 'workspace memory'],
    patterns: ['data tables', 'kanban boards', 'gallery views'],
    surfaces: ['CollectionWorkspaceSurface', 'ListSurface', 'ReportSurface'],
  },
  record: {
    summary:
      'Record structures shape detail and edit experiences into readable sections instead of long generic forms.',
    evaluate: ['sectioning', 'metadata hierarchy', 'edit-read balance'],
    patterns: ['form builders', 'comment threads', 'activity logs'],
    surfaces: ['DetailSurface', 'DetailFormSurface', 'ProfileSurface'],
  },
  dashboard: {
    summary:
      'Dashboard structures organize insight-heavy screens so signal lands before ornament.',
    evaluate: ['signal framing', 'scan rhythm', 'cross-module hierarchy'],
    patterns: ['stats grids', 'charts', 'insight panels'],
    surfaces: ['DashboardSurface', 'OperationalSurface', 'VisualizationSurface'],
  },
  feedback: {
    summary:
      'Feedback structures turn waiting, loading, and transition states into designed moments instead of dead air.',
    evaluate: ['reassurance', 'status clarity', 'handoff back to content'],
    patterns: ['empty states', 'result states', 'skeletons'],
    surfaces: ['all surfaces', 'async workflows', 'mutation-heavy screens'],
  },
};

const PANEL_SURFACE =
  'var(--ds-surface-panel, var(--ds-color-bg-tertiary, var(--ds-color-neutral-100)))';
const CARD_SURFACE =
  'var(--ds-surface-card, var(--ds-color-bg-elevated, var(--ds-color-neutral-50)))';
const SUBTLE_BORDER =
  '1px solid var(--ds-color-border-subtle, var(--ds-color-neutral-200))';
const SHADOW = '0 22px 52px var(--ds-color-shadow, rgba(0, 0, 0, 0.22))';
const HERO_OVERLAY =
  'radial-gradient(circle at top right, color-mix(in srgb, var(--ds-color-primary-500) 16%, transparent), transparent 28%), radial-gradient(circle at left bottom, color-mix(in srgb, var(--ds-color-success-500) 8%, transparent), transparent 34%)';

function groupLabel(slug: StructureGroup): string {
  const group = structureGroups.find((item) => item.slug === slug);
  return group?.label ?? slug;
}

export function generateStaticParams() {
  return structureGroups.map((group) => ({ group: group.slug }));
}

export default async function StructureGroupPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group } = await params;
  const groupSlug = group as StructureGroup;
  const entries = structuresByGroup[groupSlug] ?? [];
  const label = groupLabel(groupSlug);
  const profile = GROUP_PROFILES[groupSlug];

  if (!profile) {
    notFound();
  }

  return (
    <Stack spacing="lg" fullWidth>
      <Card
        style={{
          padding: 24,
          border: SUBTLE_BORDER,
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 6%, var(--ds-color-bg-secondary)) 0%, var(--ds-color-bg-elevated) 100%)',
          boxShadow: SHADOW,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: HERO_OVERLAY,
            pointerEvents: 'none',
          }}
        />

        <Stack spacing="md" style={{ position: 'relative' }}>
          <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
            <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
              <Link href="/structures" style={{ textDecoration: 'none' }}>
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
              </Link>
              <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
                /
              </Text>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  color: 'var(--ds-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {label}
              </Text>
            </Flex>
            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="primary">{entries.length} structures</Badge>
              <Badge variant="secondary">Structure group</Badge>
            </Flex>
          </Flex>

          <SectionDivider />

          <Box
            className="showroom-structures-group-hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.15fr) minmax(300px, 0.85fr)',
              gap: 16,
              alignItems: 'start',
            }}
          >
            <Stack spacing="md" fullWidth>
              <Stack spacing="xs">
                <Text
                  as={"h1" as any}
                  size="2xl"
                  weight="bold"
                  style={{ lineHeight: 1.1, maxWidth: 760 }}
                >
                  {label}
                </Text>
                <Text
                  size="sm"
                  style={{
                    color: 'var(--ds-color-text-secondary)',
                    maxWidth: 760,
                    lineHeight: 1.65,
                  }}
                >
                  {profile.summary}
                </Text>
              </Stack>

              <Box
                style={{
                  padding: 18,
                  borderRadius: 20,
                  border: SUBTLE_BORDER,
                  background:
                    'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated) 94%, var(--ds-color-primary-500) 6%) 0%, var(--ds-surface-panel, var(--ds-color-bg-tertiary)) 100%)',
                }}
              >
                <Stack spacing="sm" fullWidth>
                  <Flex align="center" justify="between" gap={10} style={{ flexWrap: 'wrap' }}>
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
                      Audit lens
                    </Text>
                    <Badge variant="secondary">Review hierarchy before chrome polish</Badge>
                  </Flex>

                  <Box
                    className="showroom-structures-group-audit-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: 10,
                    }}
                  >
                    {profile.evaluate.map((item, index) => (
                      <Box
                        key={item}
                        style={{
                          padding: 12,
                          borderRadius: 16,
                          border: SUBTLE_BORDER,
                          background: CARD_SURFACE,
                        }}
                      >
                        <Text
                          size="xs"
                          weight="semibold"
                          style={{
                            display: 'block',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: 'var(--ds-color-text-muted)',
                          }}
                        >
                          {`Check ${String(index + 1).padStart(2, '0')}`}
                        </Text>
                        <Text
                          size="sm"
                          weight="semibold"
                          style={{
                            display: 'block',
                            marginTop: 8,
                            color: 'var(--ds-color-text-primary)',
                            lineHeight: 1.45,
                          }}
                        >
                          {item}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                </Stack>
              </Box>
            </Stack>

            <Stack spacing="md" fullWidth>
              <Box
                className="showroom-structures-group-metrics-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 10,
                }}
              >
                <DocsMetricTile
                  label="Structures"
                  value={`${entries.length}`}
                  detail="Exports indexed in this group."
                  tone="accent"
                />
                <DocsMetricTile
                  label="Patterns"
                  value={`${profile.patterns.length}`}
                  detail="Common task layers these structures frame."
                />
                <DocsMetricTile
                  label="Surfaces"
                  value={`${profile.surfaces.length}`}
                  detail="Route contracts where this group usually lands."
                  tone="success"
                />
              </Box>

              <Box
                style={{
                  padding: 18,
                  borderRadius: 20,
                  border: SUBTLE_BORDER,
                  background:
                    'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 4%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-panel, var(--ds-color-bg-tertiary)) 100%)',
                }}
              >
                <Stack spacing="sm" fullWidth>
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
                    Common pairings
                  </Text>
                  <Text
                    size="sm"
                    style={{
                      display: 'block',
                      color: 'var(--ds-color-text-secondary)',
                      lineHeight: 1.6,
                    }}
                  >
                    Use these as the supporting task and route layers when you audit whether the
                    structure is carrying the right amount of page chrome.
                  </Text>

                  <Box
                    className="showroom-structures-group-pairings-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: 10,
                    }}
                  >
                    <Box
                      style={{
                        padding: 12,
                        borderRadius: 16,
                        border: SUBTLE_BORDER,
                        background: CARD_SURFACE,
                      }}
                    >
                      <Text
                        size="xs"
                        weight="semibold"
                        style={{
                          display: 'block',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        Patterns
                      </Text>
                      <Flex gap={6} style={{ flexWrap: 'wrap', marginTop: 8 }}>
                        {profile.patterns.map((item) => (
                          <Badge key={item} variant="secondary">
                            {item}
                          </Badge>
                        ))}
                      </Flex>
                    </Box>

                    <Box
                      style={{
                        padding: 12,
                        borderRadius: 16,
                        border: SUBTLE_BORDER,
                        background: PANEL_SURFACE,
                      }}
                    >
                      <Text
                        size="xs"
                        weight="semibold"
                        style={{
                          display: 'block',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        Surfaces
                      </Text>
                      <Flex gap={6} style={{ flexWrap: 'wrap', marginTop: 8 }}>
                        {profile.surfaces.map((item) => (
                          <Badge key={item} variant="secondary">
                            {item}
                          </Badge>
                        ))}
                      </Flex>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Card>

      <DocsPanel
        eyebrow="Catalog"
        title="Exports"
        description="Structure docs in this group, with their primary audit lens and the route contexts they usually support."
        actions={
          <Flex gap={8} style={{ flexWrap: 'wrap' }}>
            {profile.evaluate.map((item) => (
              <Badge key={item} variant="secondary">
                {item}
              </Badge>
            ))}
          </Flex>
        }
        tone="accent"
      >
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 16,
          }}
        >
          {entries.map((entry, index) => (
            <Link
              key={entry.slug}
              href={`/structures/${groupSlug}/${entry.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <Card
                hoverable
                style={{
                  height: '100%',
                  padding: 20,
                  border: SUBTLE_BORDER,
                  background:
                    'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 4%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
                  boxShadow: SHADOW,
                }}
              >
                <Stack spacing="md" style={{ height: '100%' }}>
                  <Flex align="start" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
                    <Box style={{ minWidth: 0, flex: '1 1 220px' }}>
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
                        {`Structure ${String(index + 1).padStart(2, '0')}`}
                      </Text>
                      <Text
                        as={"h3" as any}
                        size="lg"
                        weight="semibold"
                        style={{ display: 'block', marginTop: 6, lineHeight: 1.2 }}
                      >
                        {entry.name}
                      </Text>
                    </Box>
                    <Badge variant="secondary">{entry.engines.length} engines</Badge>
                  </Flex>

                  <Text
                    size="sm"
                    style={{
                      display: 'block',
                      color: 'var(--ds-color-text-secondary)',
                      lineHeight: 1.6,
                    }}
                  >
                    {entry.description}
                  </Text>

                  <Box
                    className="showroom-structures-group-export-card-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: 10,
                    }}
                  >
                    <Box
                      style={{
                        padding: 12,
                        borderRadius: 16,
                        border: SUBTLE_BORDER,
                        background:
                          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 4%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-panel, var(--ds-color-bg-tertiary)) 100%)',
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
                        Audit with
                      </Text>
                      <Text
                        size="sm"
                        weight="semibold"
                        style={{
                          display: 'block',
                          marginTop: 8,
                          color: 'var(--ds-color-text-primary)',
                          lineHeight: 1.45,
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {profile.evaluate[index % profile.evaluate.length]}
                      </Text>
                    </Box>

                    <Box
                      style={{
                        padding: 12,
                        borderRadius: 16,
                        border: SUBTLE_BORDER,
                        background: CARD_SURFACE,
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
                        Pairs with
                      </Text>
                      <Text
                        size="sm"
                        weight="semibold"
                        style={{
                          display: 'block',
                          marginTop: 8,
                          color: 'var(--ds-color-text-primary)',
                          lineHeight: 1.45,
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {profile.patterns[index % profile.patterns.length]}
                      </Text>
                    </Box>
                  </Box>

                  <Box
                    style={{
                      marginTop: 'auto',
                      padding: 12,
                      borderRadius: 16,
                      border: SUBTLE_BORDER,
                      background: PANEL_SURFACE,
                    }}
                  >
                    <Flex align="center" justify="between" gap={10} style={{ flexWrap: 'wrap' }}>
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
                        Usually lands in
                      </Text>
                      <Text
                        size="xs"
                        weight="semibold"
                        style={{
                          display: 'block',
                          color: 'var(--ds-color-primary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        Open detail
                      </Text>
                    </Flex>

                    <Flex gap={6} style={{ flexWrap: 'wrap', marginTop: 8 }}>
                      <Badge variant="secondary">
                        {profile.surfaces[index % profile.surfaces.length]}
                      </Badge>
                      {entry.engines.map((engine) => (
                        <Badge key={engine} variant="secondary">
                          {engine}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                </Stack>
              </Card>
            </Link>
          ))}
        </Box>
      </DocsPanel>

      <style>{`
        @container showroom-content (max-width: 1180px) {
          .showroom-structures-group-hero-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @container showroom-content (max-width: 920px) {
          .showroom-structures-group-audit-grid,
          .showroom-structures-group-metrics-grid,
          .showroom-structures-group-pairings-grid,
          .showroom-structures-group-export-card-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Stack>
  );
}
