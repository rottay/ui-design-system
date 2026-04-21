import { ShowroomLink as Link } from '@/components/showroom-link';
import { Badge, Box, Card, Flex, Stack, Text } from '@/components/showroom-ui';
import {
  structureGroups,
  structures,
  structuresByGroup,
  type StructureGroup,
} from '@/data/registry/structures';
import { surfaces } from '@/data/registry/surfaces';
import {
  BarChart3Icon,
  FileTextIcon,
  LayoutTemplateIcon,
  LoaderCircleIcon,
  ScanSearchIcon,
} from '@rottay/design-system/icons';

interface StructureEditorial {
  role: string;
  description: string;
  bestFor: string;
  pairings: string[];
  tint: string;
  accent: string;
  icon: React.ReactNode;
}

const STRUCTURE_EDITORIAL: Record<StructureGroup, StructureEditorial> = {
  headers: {
    role: 'Titles, status, counts, breadcrumbs, and primary actions.',
    description:
      'Headers establish page identity fast so the screen does not need extra orientation copy.',
    bestFor: 'Collections, details, forms, dashboards',
    pairings: ['PatternDataTable', 'PatternFormBuilder', 'DashboardSurface'],
    tint: 'var(--ds-color-primary-50)',
    accent: 'var(--ds-color-primary-600)',
    icon: <LayoutTemplateIcon size={20} />,
  },
  workspace: {
    role: 'Search, filters, view modes, selections, and operator controls.',
    description:
      'Workspace structures wrap dense patterns with the command layer needed for repeat use.',
    bestFor: 'Admin collections, queues, operator desks',
    pairings: ['PatternDataTable', 'PatternGridView', 'CollectionWorkspaceSurface'],
    tint: 'var(--ds-color-success-50)',
    accent: 'var(--ds-color-success-700)',
    icon: <ScanSearchIcon size={20} />,
  },
  record: {
    role: 'Sectioning and field framing for entity-heavy screens.',
    description:
      'Record structures keep inspection and editing readable once the page moves beyond a simple form.',
    bestFor: 'Profiles, account detail, settings, entity editing',
    pairings: ['DetailSurface', 'DetailFormSurface', 'RecordWorkbenchSurface'],
    tint: 'var(--ds-color-warning-50)',
    accent: 'var(--ds-color-warning-700)',
    icon: <FileTextIcon size={20} />,
  },
  dashboard: {
    role: 'Insight framing, metric rhythm, and supporting context.',
    description:
      'Dashboard structures help statistics and supporting modules land in the right order.',
    bestFor: 'Analytics, KPI walls, operations reporting',
    pairings: ['PatternStatsGrid', 'DashboardSurface', 'OperationalSurface'],
    tint: 'var(--ds-color-primary-50)',
    accent: 'var(--ds-color-primary-700)',
    icon: <BarChart3Icon size={20} />,
  },
  feedback: {
    role: 'Route-level waiting, transition, and blocking states.',
    description:
      'Feedback structures keep loading and high-attention states consistent instead of leaving dead air.',
    bestFor: 'Loading routes, long-running actions, blocking states',
    pairings: ['FormSurface', 'CommandCenterSurface', 'Loading states'],
    tint: 'var(--ds-color-error-50)',
    accent: 'var(--ds-color-error-700)',
    icon: <LoaderCircleIcon size={20} />,
  },
};

const QUICK_GUIDE = [
  {
    title: 'Use when',
    description:
      'The task widget already exists, but the screen around it still needs hierarchy, command placement, or breathing room.',
  },
  {
    title: 'Expect',
    description:
      'Headers, toolbars, section framing, guidance trays, rails, and loading shells that make dense pages readable.',
  },
  {
    title: 'Escalate after',
    description:
      'Patterns prove the reusable task first. Structures then frame that task before surfaces take over full-route contracts.',
  },
];

const LAYER_ROUTE = [
  {
    label: 'Patterns',
    detail: 'Reusable task behavior',
    active: false,
  },
  {
    label: 'Structures',
    detail: 'Page framing around the task',
    active: true,
  },
  {
    label: 'Surfaces',
    detail: 'Full route contract',
    active: false,
  },
];

const PANEL_SURFACE =
  'var(--ds-surface-panel, var(--ds-color-bg-tertiary, var(--ds-color-neutral-100)))';
const SUBTLE_BORDER =
  '1px solid var(--ds-color-border-subtle, var(--ds-color-neutral-200))';
const SHADOW = '0 22px 52px var(--ds-color-shadow, rgba(0, 0, 0, 0.22))';
const HERO_OVERLAY =
  'radial-gradient(circle at top right, color-mix(in srgb, var(--ds-color-primary-500) 16%, transparent), transparent 30%), radial-gradient(circle at left bottom, color-mix(in srgb, var(--ds-color-warning-500) 8%, transparent), transparent 34%)';
const PAGE_GAP = 16;
const PANEL_GAP = 12;
const PANEL_RADIUS = 16;

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Box
      style={{
        minWidth: 0,
        padding: 16,
        borderRadius: 20,
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated) 92%, var(--ds-color-primary-500) 8%) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
        border: SUBTLE_BORDER,
        boxShadow: SHADOW,
      }}
    >
      <Stack spacing="sm" fullWidth>
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
        <Text size="xl" weight="bold" style={{ lineHeight: 1.1 }}>
          {value}
        </Text>
        <Box
          aria-hidden="true"
          style={{
            height: 1,
            borderRadius: 999,
            background:
              'color-mix(in srgb, var(--ds-color-primary-500) 18%, var(--ds-color-border-subtle, var(--ds-color-neutral-200)))',
          }}
        />
        <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
          {detail}
        </Text>
      </Stack>
    </Box>
  );
}

function QuickGuideCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card
      style={{
        height: '100%',
        padding: 18,
        border: SUBTLE_BORDER,
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 4%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
        boxShadow: SHADOW,
      }}
    >
      <Stack spacing="sm" fullWidth style={{ height: '100%' }}>
        <Badge variant="secondary">{title}</Badge>
        <Text
          size="sm"
          weight="semibold"
          style={{ color: 'var(--ds-color-text-primary)', lineHeight: 1.45 }}
        >
          {description}
        </Text>
        <Box
          aria-hidden="true"
          style={{
            marginTop: 'auto',
            height: 1,
            borderRadius: 999,
            background:
              'color-mix(in srgb, var(--ds-color-primary-500) 16%, var(--ds-color-border-subtle, var(--ds-color-neutral-200)))',
          }}
        />
      </Stack>
    </Card>
  );
}

export default function StructuresPage() {
  const workspaceTools = structuresByGroup.workspace?.length ?? 0;

  return (
    <Stack spacing="lg" fullWidth>
      <Card
        style={{
          padding: 20,
          border:
            '1px solid color-mix(in srgb, var(--ds-color-primary-500) 18%, var(--ds-color-border-subtle, var(--ds-color-neutral-200)))',
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 8%, var(--ds-color-bg-secondary)) 0%, var(--ds-color-bg-elevated) 100%)',
          boxShadow: SHADOW,
          position: 'relative',
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

        <Box
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.16fr) minmax(300px, 0.84fr)',
            gap: PAGE_GAP,
            alignItems: 'start',
          }}
          className="showroom-structures-hero-grid"
        >
          <Stack spacing="md" style={{ minWidth: 0 }}>
            <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="primary">{structures.length} structures</Badge>
              <Badge variant="secondary">{structureGroups.length} groups</Badge>
            </Flex>
            <Stack spacing="xs">
              <Text as={"h1" as any} size="2xl" weight="bold">
                Structures
              </Text>
              <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', maxWidth: 720 }}>
                The page-scaffolding layer for headers, command rails, record framing,
                dashboard context, and feedback shells.
              </Text>
            </Stack>
            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              {['Identity', 'Control', 'Context', 'Feedback'].map((item) => (
                <Badge key={item} variant="secondary">
                  {item}
                </Badge>
              ))}
            </Flex>

            <Box
              style={{
                padding: 18,
                borderRadius: 22,
                border: SUBTLE_BORDER,
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 4%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-panel, var(--ds-color-bg-tertiary)) 100%)',
              }}
            >
              <Stack spacing="sm" fullWidth>
                <Flex align="center" justify="between" gap={10} style={{ flexWrap: 'wrap' }}>
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      color: 'var(--ds-color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    How to read this layer
                  </Text>
                  <Badge variant="secondary">Page chrome before surfaces</Badge>
                </Flex>
                <Text
                  size="sm"
                  style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.6 }}
                >
                  Reach for structures once the underlying pattern is chosen and the remaining
                  problem is page-level hierarchy, separators, command placement, or supporting
                  context.
                </Text>
                <Box
                  className="showroom-structures-layer-rail"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: PANEL_GAP,
                  }}
                >
                  {LAYER_ROUTE.map((item) => (
                    <Box
                      key={item.label}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 16,
                        border: item.active
                          ? '1px solid color-mix(in srgb, var(--ds-color-primary-500) 20%, var(--ds-color-border-subtle, var(--ds-color-neutral-200)))'
                          : SUBTLE_BORDER,
                        background: item.active
                          ? 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 12%, var(--ds-color-bg-elevated)) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)'
                          : 'var(--ds-surface-card, var(--ds-color-bg-elevated))',
                      }}
                    >
                      <Text
                        size="xs"
                        weight="semibold"
                        style={{
                          color: item.active
                            ? 'var(--ds-color-primary)'
                            : 'var(--ds-color-text-secondary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        {item.label}
                      </Text>
                      <Text
                        size="xs"
                        style={{
                          marginTop: 8,
                          color: 'var(--ds-color-text-secondary)',
                          lineHeight: 1.55,
                        }}
                      >
                        {item.detail}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Stack>
            </Box>
          </Stack>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: PANEL_GAP,
            }}
          >
            <StatCard
              label="Groups"
              value={`${structureGroups.length}`}
              detail="Headers, workspaces, records, dashboards, and feedback shells."
            />
            <StatCard
              label="Surface recipes"
              value={`${surfaces.length}`}
              detail="Structures should stay reusable across surface-level route contracts."
            />
            <StatCard
              label="Workspace tools"
              value={`${workspaceTools}`}
              detail="The densest group proves how much command scaffolding the system can support."
            />
            <StatCard
              label="Primary scope"
              value="Page chrome"
              detail="This layer is about framing, section rhythm, and supporting context around tasks."
            />
          </Box>
        </Box>
      </Card>

      <Card
        style={{
          padding: 18,
          border: SUBTLE_BORDER,
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 3%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
          boxShadow: SHADOW,
        }}
      >
        <Stack spacing="md" fullWidth>
          <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
            <Box style={{ minWidth: 0, maxWidth: 760 }}>
              <Text as={"h2" as any} size="lg" weight="semibold">
                Read The Layer Fast
              </Text>
              <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.6 }}>
                These cues should help teams decide quickly whether the problem belongs in
                structures or should stay lower in the stack.
              </Text>
            </Box>
            <Badge variant="secondary">Premium docs guidance tray</Badge>
          </Flex>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: PANEL_GAP,
            }}
          >
            {QUICK_GUIDE.map((item) => (
              <QuickGuideCard
                key={item.title}
                title={item.title}
                description={item.description}
              />
            ))}
          </Box>
        </Stack>
      </Card>

      <Flex
        align="center"
        justify="between"
        style={{ gap: PANEL_GAP, flexWrap: 'wrap' }}
      >
        <Box>
          <Text as={"h2" as any} size="xl" weight="semibold">
            Browse Groups
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Start with the screen responsibility, then drill into the structure export.
          </Text>
        </Box>
        <Badge variant="secondary">Patterns to Structures to Surfaces</Badge>
      </Flex>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: PAGE_GAP,
          alignItems: 'stretch',
        }}
      >
        {structureGroups.map((group) => {
          const editorial = STRUCTURE_EDITORIAL[group.slug];
          const entries = structuresByGroup[group.slug];
          const entryNames = entries.map((entry) => entry.name);
          const visibleNames = entryNames.slice(0, 4);
          const hiddenCount = Math.max(entryNames.length - visibleNames.length, 0);

          return (
            <Link
              key={group.slug}
              href={`/structures/${group.slug}`}
              style={{ textDecoration: 'none' }}
            >
            <Card
              hoverable
              style={{
                height: '100%',
                cursor: 'pointer',
                border: SUBTLE_BORDER,
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 4%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
                boxShadow: SHADOW,
              }}
            >
                <Stack spacing="md" style={{ height: '100%' }}>
                  <Flex align="start" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
                    <Flex align="start" gap={12} style={{ minWidth: 0, flex: '1 1 220px' }}>
                      <Box
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: PANEL_RADIUS,
                          background: editorial.tint,
                          color: editorial.accent,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: SUBTLE_BORDER,
                        }}
                      >
                        {editorial.icon}
                      </Box>
                      <Box style={{ minWidth: 0 }}>
                        <Text as={"h3" as any} size="lg" weight="semibold" style={{ lineHeight: 1.2 }}>
                          {group.label}
                        </Text>
                        <Text size="xs" style={{ color: 'var(--ds-color-text-muted)', marginTop: 4 }}>
                          {entries.length} exports
                        </Text>
                      </Box>
                    </Flex>
                    <Badge variant="secondary">{group.slug}</Badge>
                  </Flex>

                  <Box
                    style={{
                      padding: 14,
                      borderRadius: 18,
                      border: SUBTLE_BORDER,
                      background:
                        'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 4%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-panel, var(--ds-color-bg-tertiary)) 100%)',
                    }}
                  >
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{
                        color: 'var(--ds-color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      What this group solves
                    </Text>
                    <Text
                      size="sm"
                      style={{
                        marginTop: 8,
                        color: 'var(--ds-color-text-secondary)',
                        lineHeight: 1.6,
                      }}
                    >
                      {editorial.description}
                    </Text>
                  </Box>

                  <Box
                    className="showroom-structures-group-card-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: PANEL_GAP,
                    }}
                  >
                    <Box
                      style={{
                        padding: 14,
                        borderRadius: PANEL_RADIUS,
                        background:
                          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 6%, var(--ds-surface-panel, var(--ds-color-bg-tertiary))) 0%, var(--ds-surface-panel, var(--ds-color-bg-tertiary)) 100%)',
                        border: SUBTLE_BORDER,
                        minHeight: 104,
                      }}
                    >
                      <Text size="xs" weight="semibold">
                        Owns
                      </Text>
                      <Text size="xs" style={{ marginTop: 8, color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                        {editorial.role}
                      </Text>
                    </Box>

                    <Box
                      style={{
                        padding: 14,
                        borderRadius: PANEL_RADIUS,
                        background:
                          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated) 94%, var(--ds-color-primary-500) 6%) 0%, var(--ds-surface-panel, var(--ds-color-bg-tertiary)) 100%)',
                        border: SUBTLE_BORDER,
                        minHeight: 104,
                      }}
                    >
                      <Text size="xs" weight="semibold">
                        Best for
                      </Text>
                      <Text size="xs" style={{ marginTop: 8, color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                        {editorial.bestFor}
                      </Text>
                    </Box>
                  </Box>

                  <Box
                    style={{
                      padding: 14,
                      borderRadius: PANEL_RADIUS,
                      border: SUBTLE_BORDER,
                      background: PANEL_SURFACE,
                    }}
                  >
                    <Stack spacing="xs">
                      <Flex align="center" justify="between" gap={8} style={{ flexWrap: 'wrap' }}>
                        <Text size="xs" weight="semibold">
                          Key exports
                        </Text>
                        <Badge variant="secondary">Route into detail view</Badge>
                      </Flex>
                      <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                        {visibleNames.map((name) => (
                          <Box
                            key={name}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 999,
                              background: 'var(--ds-color-neutral-100)',
                              border: SUBTLE_BORDER,
                            }}
                          >
                            <Text
                              size="xs"
                              style={{
                                color: 'var(--ds-color-text-secondary)',
                                fontFamily: 'var(--font-geist-mono, monospace)',
                              }}
                            >
                              {name}
                            </Text>
                          </Box>
                        ))}
                        {hiddenCount > 0 ? (
                          <Badge variant="secondary">{`+${hiddenCount} more`}</Badge>
                        ) : null}
                      </Flex>
                    </Stack>
                  </Box>

                  <Box
                    style={{
                      marginTop: 'auto',
                      padding: 14,
                      borderRadius: PANEL_RADIUS,
                      border: SUBTLE_BORDER,
                      background:
                        'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 4%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
                    }}
                  >
                    <Stack spacing="xs" fullWidth>
                      <Flex align="center" justify="between" gap={8} style={{ flexWrap: 'wrap' }}>
                        <Text size="xs" weight="semibold">
                          Pairings
                        </Text>
                        <Text
                          size="xs"
                          weight="semibold"
                          style={{
                            color: 'var(--ds-color-primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                          }}
                        >
                          Open group docs
                        </Text>
                      </Flex>
                      <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                        {editorial.pairings.map((item) => (
                          <Badge key={item} variant="secondary">
                            {item}
                          </Badge>
                        ))}
                      </Flex>
                    </Stack>
                  </Box>

                </Stack>
              </Card>
            </Link>
          );
        })}
      </Box>

      <Card
        style={{
          padding: 16,
          border: SUBTLE_BORDER,
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 3%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
          boxShadow: SHADOW,
        }}
      >
        <Stack spacing="sm">
          <Flex align="center" justify="between" style={{ gap: 12, flexWrap: 'wrap' }}>
            <Text as={"h2" as any} size="lg" weight="semibold">
              Layer Fit
            </Text>
            <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
              Structures frame the page around reusable tasks.
            </Text>
          </Flex>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 10,
            }}
          >
            {[
              { label: 'Primitives', active: false },
              { label: 'Patterns', active: false },
              { label: 'Structures', active: true },
              { label: 'Surfaces', active: false },
            ].map(({ label, active }) => (
              <Box
                key={label}
                style={{
                  padding: '12px 14px',
                  borderRadius: 14,
                  textAlign: 'center',
                  background: active
                    ? 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 12%, var(--ds-color-bg-elevated)) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)'
                    : PANEL_SURFACE,
                  border: active
                    ? '1px solid color-mix(in srgb, var(--ds-color-primary-500) 20%, var(--ds-color-border-subtle, var(--ds-color-neutral-200)))'
                    : SUBTLE_BORDER,
                }}
              >
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    color: active
                      ? 'var(--ds-color-primary)'
                      : 'var(--ds-color-text-secondary)',
                  }}
                >
                  {label}
                </Text>
              </Box>
            ))}
          </Box>
        </Stack>
      </Card>

      <style>{`
        @container showroom-content (max-width: 1180px) {
          .showroom-structures-hero-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @container showroom-content (max-width: 920px) {
          .showroom-structures-layer-rail,
          .showroom-structures-group-card-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Stack>
  );
}
