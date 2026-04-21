import { ShowroomLink as Link } from '@/components/showroom-link';
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import {
  structures,
  structureGroups,
  type StructureEntry,
  type StructureGroup,
} from '@/data/registry';
import { CodeBlock, EngineComparison } from '@/components/playground';
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
  mixWithSurface,
} from '@/components/playground/surface-tokens';
import { formatShowroomLabel } from '@/components/layout/config';
import { StructurePreview } from './structure-preview';

const HERO_OVERLAY =
  'radial-gradient(circle at top right, color-mix(in srgb, var(--ds-color-primary-500) 16%, transparent), transparent 28%), radial-gradient(circle at left bottom, color-mix(in srgb, var(--ds-color-success-500) 8%, transparent), transparent 34%)';

const GROUP_GUIDANCE: Record<
  StructureGroup,
  {
    promise: string;
    evaluate: string[];
    patterns: string[];
    surfaces: string[];
  }
> = {
  headers: {
    promise:
      'Headers establish page tone, hierarchy, count, and action priority in the first few seconds.',
    evaluate: ['context signal', 'primary action emphasis', 'space efficiency'],
    patterns: ['stats grids', 'detail panels', 'commands'],
    surfaces: ['DashboardSurface', 'ListSurface', 'DetailSurface'],
  },
  workspace: {
    promise:
      'Workspace structures let complex collection pages feel operated rather than endured.',
    evaluate: ['control clustering', 'speed to first action', 'state visibility'],
    patterns: ['tables', 'kanban boards', 'gallery views'],
    surfaces: ['CollectionWorkspaceSurface', 'ListSurface', 'ReportSurface'],
  },
  record: {
    promise:
      'Record structures should turn detail and editing into a readable narrative rather than a long form dump.',
    evaluate: ['section grouping', 'status hierarchy', 'edit-read balance'],
    patterns: ['form builders', 'activity logs', 'comment threads'],
    surfaces: ['DetailSurface', 'DetailFormSurface', 'ProfileSurface'],
  },
  dashboard: {
    promise:
      'Dashboard structures should make insight modules cooperate so users can scan, compare, and decide fast.',
    evaluate: ['module rhythm', 'signal priority', 'supporting context'],
    patterns: ['stats grids', 'charts', 'insight cards'],
    surfaces: ['DashboardSurface', 'OperationalSurface', 'VisualizationSurface'],
  },
  feedback: {
    promise:
      'Feedback structures should reassure the user that the system is working while preparing them for what comes next.',
    evaluate: ['waiting clarity', 'message tone', 'return to task'],
    patterns: ['empty states', 'result states', 'skeletons'],
    surfaces: ['all surfaces', 'loading-heavy flows', 'save-confirm loops'],
  },
};

const DETAIL_CHECK_NOTES = [
  'Should be obvious on the first scan without relying on surface chrome for rescue.',
  'Should stay clear once actions, counts, and support context compete for attention.',
  'Should keep dense content readable instead of turning the screen into a flat stack.',
];

const PREVIEW_GUIDANCE = [
  {
    label: 'Compare engines',
    detail: 'Look for spacing, action placement, and section rhythm before brand flavor.',
  },
  {
    label: 'Ignore wrappers',
    detail: 'Judge the structure itself, not route-level surface chrome or page copy.',
  },
  {
    label: 'Escalate later',
    detail: 'Move higher only when the route contract or workflow packaging is the missing piece.',
  },
];

const USAGE_GUIDANCE = [
  {
    label: 'Import once',
    detail: 'Consumers should get the structure from the published package without extra page-local wrappers.',
  },
  {
    label: 'Stay declarative',
    detail: 'Pass data, actions, and slots. Avoid hiding layout decisions inside screen-specific glue code.',
  },
  {
    label: 'Let surfaces finish',
    detail: 'Structures frame the page. Surface-level route shells should still own the broader contract.',
  },
];

const SPECIFIC_USAGE_SNIPPETS: Record<string, string> = {
  'collection-header': `<CollectionHeader
  title="Users"
  count={1247}
  actions={headerActions}
  breadcrumbs={breadcrumbs}
/>`,
  'table-toolbar': `<TableToolbar
  query={query}
  filters={filters}
  selectedCount={selectedIds.length}
  onQueryChange={setQuery}
/>`,
  record: `<Record
  sections={recordSections}
  aside={<ActivityLog events={events} />}
/>`,
  'dashboard-insights': `<DashboardInsights
  insights={insights}
  onOpenDrilldown={openInsight}
/>`,
};

function groupLabel(slug: StructureGroup): string {
  const group = structureGroups.find((item) => item.slug === slug);
  return group?.label ?? slug;
}

function getUsageSnippet(entry: StructureEntry): string {
  const specific = SPECIFIC_USAGE_SNIPPETS[entry.slug];
  if (specific) {
    return specific;
  }

  return `<${entry.name}
  config={config}
  slots={slots}
  actions={actions}
/>`;
}

function MetaCard({
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
        borderRadius: 18,
        background: `linear-gradient(180deg, ${mixWithSurface(
          'var(--ds-color-primary, #60a5fa)',
          4,
          SHOWROOM_SURFACES.surface,
        )} 0%, ${mixWithSurface(
          'var(--ds-color-primary, #60a5fa)',
          7,
          SHOWROOM_SURFACES.subtle,
        )} 100%)`,
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
      }}
    >
      <Text
        size="xs"
        weight="semibold"
        style={{
          display: 'block',
          color: SHOWROOM_SURFACES.textTertiary,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </Text>
      <Text
        size="sm"
        weight="semibold"
        style={{
          display: 'block',
          marginTop: 8,
          color: SHOWROOM_SURFACES.text,
          lineHeight: 1.35,
        }}
      >
        {value}
      </Text>
      <Text
        size="xs"
        style={{
          display: 'block',
          marginTop: 8,
          color: SHOWROOM_SURFACES.textSecondary,
          lineHeight: 1.55,
        }}
      >
        {detail}
      </Text>
    </Box>
  );
}

export function generateStaticParams() {
  return structures.map((structure) => ({
    group: structure.group,
    structure: structure.slug,
  }));
}

export default async function StructureDetailPage({
  params,
}: {
  params: Promise<{ group: string; structure: string }>;
}) {
  const { group, structure } = await params;
  const entry = structures.find(
    (structureEntry) =>
      structureEntry.group === group && structureEntry.slug === structure,
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
            Structure not found
          </Text>
          <Text
            size="md"
            style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
          >
            No structure matches &quot;{structure}&quot; in group &quot;{group}&quot;.
          </Text>
          <Link
            href={`/structures/${group}`}
            style={{
              color: 'var(--ds-color-primary)',
              textDecoration: 'none',
            }}
          >
            Back to {groupLabel(group as StructureGroup)} structures
          </Link>
        </Stack>
      </Card>
    );
  }

  const guidance = GROUP_GUIDANCE[entry.group];
  const importPath = `import { ${entry.name} } from '@rottay/design-system';`;
  const usageSnippet = getUsageSnippet(entry);
  const displayName = formatShowroomLabel(entry.name);
  const tierItems = [
    { label: 'Primitives', active: false },
    { label: 'Patterns', active: false },
    { label: 'Structures', active: true },
    { label: 'Surfaces', active: false },
  ];

  return (
    <Stack spacing="lg" fullWidth>
      <Card
        style={{
          padding: 24,
          border: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${mixWithCanvas(
            'var(--ds-color-primary, #60a5fa)',
            8,
          )} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
          boxShadow: SHOWROOM_SURFACES.shadow,
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

        <Stack spacing="lg" style={{ position: 'relative' }}>
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
              <Text
                size="xs"
                style={{ display: 'block', color: 'var(--ds-color-text-muted)' }}
              >
                /
              </Text>
              <Link href={`/structures/${group}`} style={{ textDecoration: 'none' }}>
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
              </Link>
            </Flex>
            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="primary">{groupLabel(entry.group)}</Badge>
              <Badge variant="secondary">Structure</Badge>
              <Badge variant="secondary">{entry.engines.length} engines</Badge>
            </Flex>
          </Flex>

          <Box
            className="showroom-structure-detail-hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.42fr) minmax(320px, 0.88fr)',
              gap: 16,
              alignItems: 'start',
            }}
          >
            <Stack spacing="md" fullWidth>
              <Box
                style={{
                  padding: 18,
                  borderRadius: 22,
                  border: `1px solid ${SHOWROOM_SURFACES.border}`,
                  background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithSurface(
                    'var(--ds-color-primary, #60a5fa)',
                    6,
                    SHOWROOM_SURFACES.surface,
                  )} 100%)`,
                }}
              >
                <Stack spacing="md" fullWidth>
                  <Stack spacing="sm" fullWidth>
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
                      style={{ display: 'block', lineHeight: 1.08, maxWidth: 760 }}
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
                      {groupLabel(entry.group)} group export for page-level framing around reusable
                      tasks.
                    </Text>
                  </Stack>

                  <Box
                    className="showroom-structure-detail-summary-grid"
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
                        border: `1px solid ${SHOWROOM_SURFACES.border}`,
                        background: SHOWROOM_SURFACES.surface,
                      }}
                    >
                      <Text
                        size="xs"
                        weight="semibold"
                        style={{
                          display: 'block',
                          color: SHOWROOM_SURFACES.textTertiary,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        What it frames
                      </Text>
                      <Text
                        size="sm"
                        style={{
                          display: 'block',
                          marginTop: 8,
                          color: SHOWROOM_SURFACES.textSecondary,
                          lineHeight: 1.6,
                        }}
                      >
                        {entry.description}
                      </Text>
                    </Box>

                    <Box
                      style={{
                        padding: 14,
                        borderRadius: 16,
                        border: `1px solid ${SHOWROOM_SURFACES.border}`,
                        background: SHOWROOM_SURFACES.subtle,
                      }}
                    >
                      <Text
                        size="xs"
                        weight="semibold"
                        style={{
                          display: 'block',
                          color: SHOWROOM_SURFACES.textTertiary,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        What it should prove
                      </Text>
                      <Text
                        size="sm"
                        style={{
                          display: 'block',
                          marginTop: 8,
                          color: SHOWROOM_SURFACES.textSecondary,
                          lineHeight: 1.6,
                        }}
                      >
                        {guidance.promise}
                      </Text>
                    </Box>
                  </Box>
                </Stack>
              </Box>

              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: 12,
                }}
              >
                <MetaCard
                  label="Layer"
                  value="Structure tier"
                  detail="Page framing around reusable tasks."
                />
                <MetaCard
                  label="Group"
                  value={groupLabel(entry.group)}
                  detail="Shares the same audit lens and pairing rules as its group."
                />
                <MetaCard
                  label="Engines"
                  value={entry.engines.join(' / ')}
                  detail="Expect parity in spacing, priority, and section rhythm."
                />
              </Box>
            </Stack>

            <Box
              style={{
                padding: 18,
                borderRadius: 22,
                border: `1px solid ${SHOWROOM_SURFACES.border}`,
                background: `linear-gradient(180deg, ${mixWithSurface(
                  'var(--ds-color-primary, #60a5fa)',
                  4,
                  SHOWROOM_SURFACES.surface,
                )} 0%, ${mixWithSurface(
                  'var(--ds-color-primary, #60a5fa)',
                  8,
                  SHOWROOM_SURFACES.subtle,
                )} 100%)`,
              }}
            >
              <Stack spacing="md" fullWidth>
                <Box>
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      display: 'block',
                      color: SHOWROOM_SURFACES.textTertiary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Audit tray
                  </Text>
                  <Text
                    size="sm"
                    weight="semibold"
                    style={{
                      display: 'block',
                      marginTop: 8,
                      color: SHOWROOM_SURFACES.text,
                      lineHeight: 1.5,
                    }}
                  >
                    Use this page to judge whether the structure creates hierarchy before the
                    surrounding surface starts doing the heavy lifting.
                  </Text>
                </Box>

                <Box
                  className="showroom-structure-detail-audit-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 10,
                  }}
                >
                  {guidance.evaluate.map((item, index) => (
                    <Box
                      key={item}
                      style={{
                        padding: 12,
                        borderRadius: 16,
                        border: `1px solid ${SHOWROOM_SURFACES.border}`,
                        background: SHOWROOM_SURFACES.surface,
                      }}
                    >
                      <Text
                        size="xs"
                        weight="semibold"
                        style={{
                          display: 'block',
                          color: SHOWROOM_SURFACES.textTertiary,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        {`Review ${String(index + 1).padStart(2, '0')}`}
                      </Text>
                      <Text
                        size="sm"
                        weight="semibold"
                        style={{
                          display: 'block',
                          marginTop: 8,
                          color: SHOWROOM_SURFACES.text,
                          lineHeight: 1.45,
                        }}
                      >
                        {item}
                      </Text>
                      <Text
                        size="xs"
                        style={{
                          display: 'block',
                          marginTop: 8,
                          color: SHOWROOM_SURFACES.textSecondary,
                          lineHeight: 1.55,
                        }}
                      >
                        {DETAIL_CHECK_NOTES[index % DETAIL_CHECK_NOTES.length]}
                      </Text>
                    </Box>
                  ))}
                </Box>

                <Box
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    border: `1px solid ${SHOWROOM_SURFACES.border}`,
                    background: SHOWROOM_SURFACES.surface,
                  }}
                >
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      display: 'block',
                      color: SHOWROOM_SURFACES.textTertiary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Common pairings
                  </Text>
                  <Flex gap={6} style={{ marginTop: 8, flexWrap: 'wrap' }}>
                    {guidance.patterns.map((item) => (
                      <Badge key={item} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                  </Flex>
                </Box>

                <Box
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    border: `1px solid ${SHOWROOM_SURFACES.border}`,
                    background:
                      'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated) 94%, var(--ds-color-primary-500) 6%) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
                  }}
                >
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      display: 'block',
                      color: SHOWROOM_SURFACES.textTertiary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Usually lands in
                  </Text>
                  <Flex gap={6} style={{ marginTop: 8, flexWrap: 'wrap' }}>
                    {guidance.surfaces.map((item) => (
                      <Badge key={item} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                  </Flex>
                </Box>
              </Stack>
            </Box>
          </Box>
        </Stack>
      </Card>

      <Card
        style={{
          padding: 20,
          border: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${SHOWROOM_SURFACES.canvas} 100%)`,
          boxShadow: SHOWROOM_SURFACES.shadow,
        }}
      >
        <Stack spacing="md" fullWidth>
          <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
            <Box style={{ minWidth: 0, maxWidth: 760 }}>
              <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: 'block' }}>
                Live preview
              </Text>
              <Text
                size="sm"
                style={{
                  display: 'block',
                  marginTop: 6,
                  color: 'var(--ds-color-text-secondary)',
                  lineHeight: 1.65,
                }}
              >
                Compare rhythm, action placement, and supporting context across engines while the
                active tenant remains real.
              </Text>
            </Box>
            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              {entry.engines.map((engine) => (
                <Badge key={engine} variant="secondary">
                  {engine}
                </Badge>
              ))}
            </Flex>
          </Flex>

          <Box
            className="showroom-structure-detail-preview-guidance-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 10,
            }}
          >
            {PREVIEW_GUIDANCE.map((item) => (
              <Box
                key={item.label}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  border: `1px solid ${SHOWROOM_SURFACES.border}`,
                  background: SHOWROOM_SURFACES.surface,
                }}
              >
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: 'block',
                    color: SHOWROOM_SURFACES.textTertiary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {item.label}
                </Text>
                <Text
                  size="sm"
                  style={{
                    display: 'block',
                    marginTop: 8,
                    color: SHOWROOM_SURFACES.textSecondary,
                    lineHeight: 1.6,
                  }}
                >
                  {item.detail}
                </Text>
              </Box>
            ))}
          </Box>

          <EngineComparison
            title={`${displayName} render check`}
            description="Each engine gets the same structure with the same tenant. Focus on spacing, hierarchy, and action cadence rather than wrapper chrome."
          >
            <StructurePreview slug={entry.slug} />
          </EngineComparison>
        </Stack>
      </Card>

      <Card
        style={{
          padding: 20,
          border: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${SHOWROOM_SURFACES.canvas} 100%)`,
          boxShadow: SHOWROOM_SURFACES.shadow,
        }}
      >
        <Box
          className="showroom-structure-detail-diagnosis-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(300px, 0.8fr)',
            gap: 16,
            alignItems: 'start',
          }}
        >
          <Stack spacing="md" fullWidth>
            <Box>
              <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: 'block' }}>
                Review checklist
              </Text>
              <Text
                size="sm"
                style={{
                  display: 'block',
                  marginTop: 6,
                  color: 'var(--ds-color-text-secondary)',
                  lineHeight: 1.65,
                }}
              >
                These are the checks that should feel obvious on the first pass, before you audit
                the surrounding surface or route-level content.
              </Text>
            </Box>

            <Box
              className="showroom-structure-detail-review-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: 12,
              }}
            >
              {guidance.evaluate.map((item, index) => (
                <Box
                  key={item}
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    border: `1px solid ${SHOWROOM_SURFACES.border}`,
                    background: SHOWROOM_SURFACES.surface,
                  }}
                >
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      display: 'block',
                      color: SHOWROOM_SURFACES.textTertiary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {`Check ${String(index + 1).padStart(2, '0')}`}
                  </Text>
                  <Text
                    size="sm"
                    weight="semibold"
                    style={{
                      display: 'block',
                      marginTop: 10,
                      color: SHOWROOM_SURFACES.text,
                      lineHeight: 1.45,
                    }}
                  >
                    {item}
                  </Text>
                  <Text
                    size="xs"
                    style={{
                      display: 'block',
                      marginTop: 8,
                      color: SHOWROOM_SURFACES.textSecondary,
                      lineHeight: 1.55,
                    }}
                  >
                    {DETAIL_CHECK_NOTES[index % DETAIL_CHECK_NOTES.length]}
                  </Text>
                </Box>
              ))}
            </Box>
          </Stack>

          <Stack spacing="md" fullWidth>
            <Box
              style={{
                padding: 16,
                borderRadius: 18,
                border: `1px solid ${SHOWROOM_SURFACES.border}`,
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated) 94%, var(--ds-color-primary-500) 6%) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
              }}
            >
              <Stack spacing="sm" fullWidth>
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: 'block',
                    color: SHOWROOM_SURFACES.textTertiary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Layer fit
                </Text>
                <Text
                  size="sm"
                  style={{
                    display: 'block',
                    color: 'var(--ds-color-text-secondary)',
                    lineHeight: 1.6,
                  }}
                >
                  Structures arrange page framing around reusable tasks. They should create order
                  without taking over the whole surface contract.
                </Text>
                <Box
                  className="showroom-detail-checklist-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                    gap: 8,
                  }}
                >
                  {tierItems.map(({ label, active }) => (
                    <Box
                      key={label}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 10,
                        textAlign: 'center',
                        background: active
                          ? mixWithSurface(
                              'var(--ds-color-primary, #60a5fa)',
                              14,
                              SHOWROOM_SURFACES.surface,
                            )
                          : SHOWROOM_SURFACES.subtle,
                        border: active
                          ? `1px solid ${mixWithSurface(
                              'var(--ds-color-primary, #60a5fa)',
                              24,
                              SHOWROOM_SURFACES.border,
                            )}`
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
                </Box>

                <Box
                  className="showroom-structure-detail-fit-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: 10,
                  }}
                >
                  <Box
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      border: `1px solid ${SHOWROOM_SURFACES.border}`,
                      background: SHOWROOM_SURFACES.surface,
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
                      Stay here when
                    </Text>
                    <Text
                      size="xs"
                      style={{
                        display: 'block',
                        marginTop: 8,
                        color: SHOWROOM_SURFACES.textSecondary,
                        lineHeight: 1.55,
                      }}
                    >
                      The missing piece is section rhythm, chrome placement, or page-level context.
                    </Text>
                  </Box>

                  <Box
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      border: `1px solid ${SHOWROOM_SURFACES.border}`,
                      background: SHOWROOM_SURFACES.subtle,
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
                      Escalate when
                    </Text>
                    <Text
                      size="xs"
                      style={{
                        display: 'block',
                        marginTop: 8,
                        color: SHOWROOM_SURFACES.textSecondary,
                        lineHeight: 1.55,
                      }}
                    >
                      You need reusable workflow behavior or a full route shell beyond the framing.
                    </Text>
                  </Box>
                </Box>
              </Stack>
            </Box>

            <Box
              style={{
                padding: 16,
                borderRadius: 18,
                border: `1px solid ${SHOWROOM_SURFACES.border}`,
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated) 94%, var(--ds-color-primary-500) 6%) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
              }}
            >
              <Stack spacing="sm" fullWidth>
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: 'block',
                    color: SHOWROOM_SURFACES.textTertiary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Common pairings
                </Text>
                <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                  {guidance.patterns.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </Flex>

                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: 'block',
                    marginTop: 6,
                    color: SHOWROOM_SURFACES.textTertiary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Usually lands in
                </Text>
                <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                  {guidance.surfaces.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </Flex>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Card>

      <Card
        style={{
          padding: 20,
          border: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${SHOWROOM_SURFACES.canvas} 100%)`,
          boxShadow: SHOWROOM_SURFACES.shadow,
        }}
      >
        <Stack spacing="md" fullWidth>
          <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
            <Box style={{ minWidth: 0, maxWidth: 760 }}>
              <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: 'block' }}>
                Import and usage
              </Text>
              <Text
                size="sm"
                style={{
                  display: 'block',
                  marginTop: 6,
                  color: 'var(--ds-color-text-secondary)',
                  lineHeight: 1.65,
                }}
              >
                The structure should stay easy to consume from the published package: one import,
                one usage shape, and no page-local wrapper assumptions.
              </Text>
            </Box>
            <Badge variant="secondary">Consumer contract</Badge>
          </Flex>

          <Box
            className="showroom-structure-detail-usage-guide-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 10,
            }}
          >
            {USAGE_GUIDANCE.map((item) => (
              <Box
                key={item.label}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  border: `1px solid ${SHOWROOM_SURFACES.border}`,
                  background: SHOWROOM_SURFACES.surface,
                }}
              >
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: 'block',
                    color: SHOWROOM_SURFACES.textTertiary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {item.label}
                </Text>
                <Text
                  size="sm"
                  style={{
                    display: 'block',
                    marginTop: 8,
                    color: SHOWROOM_SURFACES.textSecondary,
                    lineHeight: 1.6,
                  }}
                >
                  {item.detail}
                </Text>
              </Box>
            ))}
          </Box>

          <Box
            className="showroom-structure-detail-code-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: 16,
            }}
          >
            <CodeBlock code={importPath} language="tsx" title="Import" />
            <CodeBlock code={usageSnippet} language="tsx" title="Usage" />
          </Box>
        </Stack>
      </Card>

      <style>{`
        @container showroom-content (max-width: 1280px) {
          .showroom-structure-detail-hero-grid,
          .showroom-structure-detail-diagnosis-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @container showroom-content (max-width: 920px) {
          .showroom-structure-detail-summary-grid,
          .showroom-structure-detail-audit-grid,
          .showroom-structure-detail-preview-guidance-grid,
          .showroom-structure-detail-review-grid,
          .showroom-structure-detail-fit-grid,
          .showroom-structure-detail-usage-guide-grid,
          .showroom-structure-detail-code-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Stack>
  );
}
