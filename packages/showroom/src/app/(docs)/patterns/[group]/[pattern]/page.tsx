import { ShowroomLink as Link } from '@/components/showroom-link';
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import {
  CodeBlock,
  PropTable,
  type PropDefinition,
} from '@/components/playground';
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
  mixWithSurface,
} from '@/components/playground/surface-tokens';
import { formatShowroomLabel } from '@/components/layout/config';
import {
  patterns,
  patternsByGroup,
  patternGroups,
  type PatternEntry,
  type PatternGroup,
} from '@/data/registry';
import { PatternEnginePreview } from './pattern-engine-preview';

const GROUP_GUIDANCE: Record<
  PatternGroup,
  {
    promise: string;
    evaluate: string[];
    structures: string[];
    surfaces: string[];
  }
> = {
  data: {
    promise:
      'Data patterns should demonstrate density, scanning speed, and operational control without collapsing under real volume.',
    evaluate: [
      'sorting and filtering cues',
      'selection model',
      'states from sparse to dense',
    ],
    structures: ['CollectionHeader', 'TableToolbar', 'ActiveFiltersBar'],
    surfaces: ['ListSurface', 'ReportSurface', 'CollectionWorkspaceSurface'],
  },
  forms: {
    promise:
      'Form patterns should turn complex input into a paced, teachable flow that still scales to power users.',
    evaluate: [
      'step framing',
      'validation timing',
      'clarity of primary actions',
    ],
    structures: ['FormHeader', 'FormSections', 'DetailHeader'],
    surfaces: ['FormSurface', 'WizardSurface', 'DetailFormSurface'],
  },
  visualization: {
    promise:
      'Visualization patterns should make data shape and interaction intent immediately readable.',
    evaluate: [
      'signal emphasis',
      'controls around the view',
      'legend and selection clarity',
    ],
    structures: ['DashboardHeader', 'StatsHeader', 'CollectionHeader'],
    surfaces: ['VisualizationSurface', 'DashboardSurface', 'SchedulerSurface'],
  },
  communication: {
    promise:
      'Communication patterns should show information freshness, authorship, and actionability in the same frame.',
    evaluate: ['message hierarchy', 'presence cues', 'response affordances'],
    structures: ['DetailHeader', 'WorkbenchHeader', 'PageShell'],
    surfaces: ['ChatSurface', 'ActivitySurface', 'NotificationSurface'],
  },
  workflow: {
    promise:
      'Workflow patterns should accelerate decision making while keeping status and exceptions obvious.',
    evaluate: ['queue clarity', 'decision affordances', 'status transitions'],
    structures: ['CollectionHeader', 'SelectionPreviewRail', 'TableToolbar'],
    surfaces: ['DecisionInboxSurface', 'OperationalSurface', 'KanbanSurface'],
  },
  navigation: {
    promise:
      'Navigation patterns should compress a lot of capability into a small footprint without becoming cryptic.',
    evaluate: ['discoverability', 'memory of place', 'mode switching'],
    structures: ['SearchCommandBar', 'PageShell', 'WorkbenchHeader'],
    surfaces: [
      'CollectionWorkspaceSurface',
      'CommandCenterSurface',
      'RecordWorkbenchSurface',
    ],
  },
  feedback: {
    promise:
      'Feedback patterns should adapt interruption and confirmation posture without changing the task contract.',
    evaluate: ['responsive posture', 'dismissal clarity', 'focus continuity'],
    structures: ['LoadingOverlay', 'ActionDock', 'MobileHeader'],
    surfaces: ['FormSurface', 'DetailSurface', 'CommandCenterSurface'],
  },
  misc: {
    promise:
      'Misc patterns still need premium documentation because they often ship as the most visible branded moments in the product.',
    evaluate: [
      'surface readiness',
      'brand flexibility',
      'clarity of call to action',
    ],
    structures: ['PageShell', 'DashboardInsights', 'DetailHeader'],
    surfaces: ['ProfileSurface', 'PricingSurface', 'MarketingSurface'],
  },
};

const SPECIFIC_USAGE_SNIPPETS: Record<string, string> = {
  'data-table': `<PatternDataTable
  data={rows}
  rowKey="id"
  columns={columns}
  toolbar={toolbar}
  onRowClick={openRecord}
/>`,
  'form-builder': `<PatternFormBuilder
  fields={tenantFields}
  layout="grid"
  actions={<Button htmlType="submit">Save</Button>}
  onSubmit={handleSubmit}
/>`,
  'activity-log': `<PatternActivityLog
  activities={activities}
  groupByDay
  onSelectActivity={openEventDetails}
/>`,
  'command-palette': `<PatternCommandPalette
  open={open}
  items={items}
  recentItems={recentItems}
  onSearch={handleSearch}
/>`,
  'approval-workflow': `<PatternApprovalWorkflow
  title="Approval flow"
  entity={entity}
  steps={steps}
  currentStep={currentStep}
  onApprove={approveRequest}
/>`,
};

const SPECIFIC_PROPS: Record<string, PropDefinition[]> = {
  'data-table': [
    {
      name: 'data',
      type: 'T[]',
      required: true,
      description: 'Record set rendered into the table body.',
    },
    {
      name: 'rowKey',
      type: 'keyof T | (item) => string',
      required: false,
      description: 'Unique key accessor used for selection and row identity.',
    },
    {
      name: 'columns',
      type: 'ColumnConfig<T>[]',
      required: true,
      description: 'Column definitions controlling layout, labels, and cell rendering.',
    },
    {
      name: 'toolbar',
      type: 'ReactNode',
      required: false,
      description: 'Optional table-level controls rendered above the data rows.',
    },
  ],
  'form-builder': [
    {
      name: 'fields',
      type: 'FieldConfig[]',
      required: true,
      description: 'Declarative field configuration used to generate the form layout.',
    },
    {
      name: 'layout',
      type: '"stack" | "grid"',
      defaultValue: '"stack"',
      required: false,
      description: 'Controls whether fields render in a vertical stack or responsive grid.',
    },
    {
      name: 'actions',
      type: 'ReactNode',
      required: false,
      description: 'Action rail rendered at the bottom of the generated form.',
    },
    {
      name: 'onSubmit',
      type: '(values) => void',
      required: false,
      description: 'Triggered when the generated form is submitted.',
    },
  ],
  'activity-log': [
    {
      name: 'activities',
      type: 'ActivityItem[]',
      required: true,
      description: 'Chronological activity items to render in the feed.',
    },
    {
      name: 'groupByDay',
      type: 'boolean',
      defaultValue: 'false',
      required: false,
      description: 'Adds date separators when activity spans multiple days.',
    },
    {
      name: 'onSelectActivity',
      type: '(activity) => void',
      required: false,
      description: 'Called when a feed item is selected for deeper inspection.',
    },
  ],
  'command-palette': [
    {
      name: 'items',
      type: 'CommandItem[]',
      required: true,
      description: 'Searchable commands and grouped actions available in the palette.',
    },
    {
      name: 'open',
      type: 'boolean',
      defaultValue: 'false',
      required: false,
      description: 'Controlled open state for products that manage overlays centrally.',
    },
    {
      name: 'recentItems',
      type: 'CommandItem[]',
      required: false,
      description: 'Optional recent actions surfaced above the main results list.',
    },
    {
      name: 'onSearch',
      type: '(query) => void',
      required: false,
      description: 'Async or controlled search callback for the palette input.',
    },
  ],
  'approval-workflow': [
    {
      name: 'steps',
      type: 'ApprovalStage[]',
      required: true,
      description: 'Ordered approval stages with counts, owners, and completion state.',
    },
    {
      name: 'currentStep',
      type: 'number',
      required: false,
      description: 'Index of the active step used to highlight the current review stage.',
    },
    {
      name: 'onApprove',
      type: '() => void',
      required: false,
      description: 'Triggered when the current review stage is approved.',
    },
    {
      name: 'onReject',
      type: '() => void',
      required: false,
      description: 'Triggered when the current stage is rejected or sent back.',
    },
  ],
};

const HERO_OVERLAY =
  'radial-gradient(circle at top right, color-mix(in srgb, var(--ds-color-primary-500) 16%, transparent), transparent 28%), radial-gradient(circle at left bottom, color-mix(in srgb, var(--ds-color-success-500) 8%, transparent), transparent 34%)';

const PATTERN_PREVIEW_NOTES = [
  'Compare density, action placement, and state readability before aesthetic flavor.',
  'Judge the pattern itself, not any showroom-local framing around it.',
  'If the pattern only works with extra chrome, the pattern or preview runtime still needs work.',
];

const PATTERN_USAGE_NOTES = [
  'Import from the published package rather than building route-local wrappers first.',
  'Pass data, config, and callbacks while keeping product semantics in the consuming app.',
  'Escalate to a surface only once the whole screen contract is stable, not just the task module.',
];

function groupLabel(slug: PatternGroup): string {
  const group = patternGroups.find((item) => item.slug === slug);
  return group?.label ?? slug;
}

function getUsageSnippet(entry: PatternEntry): string {
  const specific = SPECIFIC_USAGE_SNIPPETS[entry.slug];
  if (specific) {
    return specific;
  }

  return `<${entry.name}
  data={data}
  config={config}
  onAction={handleAction}
/>`;
}

function getPlaceholderProps(entry: PatternEntry): PropDefinition[] {
  const sharedProps: PropDefinition[] = [
    {
      name: 'className',
      type: 'string',
      required: false,
      description:
        'Additional class names for product-specific composition and layout hooks.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      required: false,
      description:
        'Inline overrides for one-off layout or diagnostic preview adjustments.',
    },
  ];

  const specific = SPECIFIC_PROPS[entry.slug];
  if (specific) {
    return [...specific, ...sharedProps];
  }

  const groupProps: Record<PatternGroup, PropDefinition[]> = {
    data: [
      {
        name: 'items',
        type: 'T[]',
        required: true,
        description: 'Primary collection rendered by the pattern.',
      },
      {
        name: 'filters',
        type: 'FilterState',
        required: false,
        description: 'Active filters, sorts, or view state applied to the collection.',
      },
      {
        name: 'selection',
        type: 'SelectionState',
        required: false,
        description: 'Selection model used for bulk actions or contextual panels.',
      },
      {
        name: 'onAction',
        type: '(action) => void',
        required: false,
        description: 'Handles row-level or collection-level actions emitted by the pattern.',
      },
    ],
    forms: [
      {
        name: 'fields',
        type: 'FieldConfig[]',
        required: true,
        description: 'Field definitions or step configuration rendered by the pattern.',
      },
      {
        name: 'values',
        type: 'Record<string, unknown>',
        required: false,
        description: 'Controlled values for inputs or generated form sections.',
      },
      {
        name: 'errors',
        type: 'Record<string, string>',
        required: false,
        description: 'Validation messages keyed by field identifier.',
      },
      {
        name: 'onSubmit',
        type: '() => void',
        required: false,
        description: 'Primary action callback for final submission or continuation.',
      },
    ],
    visualization: [
      {
        name: 'items',
        type: 'VisualizationItem[]',
        required: true,
        description: 'Renderable items, cards, or lanes shown by the pattern.',
      },
      {
        name: 'view',
        type: 'string',
        required: false,
        description: 'Current view mode or active visualization lens.',
      },
      {
        name: 'controls',
        type: 'ReactNode',
        required: false,
        description: 'Supplemental filters, legends, or action controls around the view.',
      },
      {
        name: 'onSelect',
        type: '(item) => void',
        required: false,
        description: 'Handles selection inside the visualization pattern.',
      },
    ],
    communication: [
      {
        name: 'items',
        type: 'Message[] | ActivityEvent[]',
        required: true,
        description: 'Messages, notifications, or activity items rendered by the pattern.',
      },
      {
        name: 'unreadCount',
        type: 'number',
        required: false,
        description: 'Unread indicator or freshness summary shown near the pattern.',
      },
      {
        name: 'onReply',
        type: '(payload) => void',
        required: false,
        description: 'Response handler for patterns that allow direct inline action.',
      },
      {
        name: 'emptyState',
        type: 'ReactNode',
        required: false,
        description: 'Fallback content when no communication items are available.',
      },
    ],
    workflow: [
      {
        name: 'items',
        type: 'WorkflowItem[]',
        required: true,
        description: 'Queue items, stages, or records involved in the workflow.',
      },
      {
        name: 'status',
        type: 'string',
        required: false,
        description: 'Current workflow state or runtime filter applied to the queue.',
      },
      {
        name: 'onDecision',
        type: '(decision) => void',
        required: false,
        description: 'Decision callback for approve, reject, assign, or escalation actions.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        defaultValue: 'false',
        required: false,
        description: 'Disables workflow actions while data or permissions are unresolved.',
      },
    ],
    navigation: [
      {
        name: 'items',
        type: 'NavigationItem[]',
        required: true,
        description: 'Commands, destinations, or switchable navigation options.',
      },
      {
        name: 'value',
        type: 'string',
        required: false,
        description: 'Current active destination, workspace, or mode.',
      },
      {
        name: 'onChange',
        type: '(value) => void',
        required: false,
        description: 'Called when the active destination or mode changes.',
      },
      {
        name: 'shortcut',
        type: 'string',
        required: false,
        description: 'Optional keyboard hint rendered with the navigation affordance.',
      },
    ],
    feedback: [
      {
        name: 'open',
        type: 'boolean',
        required: true,
        description: 'Controls whether the feedback overlay is visible.',
      },
      {
        name: 'mode',
        type: '"auto" | "modal" | "drawer" | "sheet"',
        defaultValue: '"auto"',
        required: false,
        description:
          'Selects automatic responsive posture or a forced container.',
      },
      {
        name: 'onClose',
        type: '() => void',
        required: false,
        description:
          'Handles dismissal from escape, backdrop, or the active container.',
      },
      {
        name: 'children',
        type: 'ReactNode',
        required: true,
        description:
          'Feedback content rendered inside the resolved overlay posture.',
      },
    ],
    misc: [
      {
        name: 'children',
        type: 'ReactNode',
        required: false,
        description: 'Supplemental content rendered inside the composite pattern.',
      },
      {
        name: 'actions',
        type: 'ReactNode',
        required: false,
        description: 'Action rail or button group placed within the pattern shell.',
      },
      {
        name: 'tone',
        type: 'string',
        required: false,
        description: 'Visual treatment or brand emphasis applied to the pattern.',
      },
      {
        name: 'emptyState',
        type: 'ReactNode',
        required: false,
        description: 'Fallback content when the pattern has nothing meaningful to render.',
      },
    ],
  };

  return [...groupProps[entry.group], ...sharedProps];
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
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
        background: `linear-gradient(180deg, ${mixWithSurface(
          'var(--ds-color-primary, #60a5fa)',
          4,
          SHOWROOM_SURFACES.surface,
        )} 0%, ${mixWithSurface(
          'var(--ds-color-primary, #60a5fa)',
          7,
          SHOWROOM_SURFACES.subtle,
        )} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minHeight: 136,
        boxShadow: `inset 0 1px 0 ${mixWithSurface('var(--ds-color-primary, #60a5fa)', 10, 'transparent')}`,
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
          lineHeight: 1.15,
          overflowWrap: 'anywhere',
          color: SHOWROOM_SURFACES.text,
        }}
      >
        {value}
      </Text>
      <Text
        size="xs"
        style={{
          display: 'block',
          color: SHOWROOM_SURFACES.textSecondary,
          lineHeight: 1.45,
          overflowWrap: 'anywhere',
        }}
      >
        {detail}
      </Text>
    </Box>
  );
}

function GuidanceCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card
      style={{
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
        background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithCanvas(
          'var(--ds-color-primary, #60a5fa)',
          5,
        )} 100%)`,
        boxShadow: SHOWROOM_SURFACES.shadow,
        minHeight: 184,
      }}
    >
      <Stack spacing="sm">
        <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
          <Text
            as={"h2" as any}
            size="md"
            weight="semibold"
            style={{ display: 'block', color: SHOWROOM_SURFACES.text, lineHeight: 1.3 }}
          >
            {title}
          </Text>
          <Badge variant="secondary">{items.length} items</Badge>
        </Flex>
        <Box
          style={{
            height: 1,
            background: `linear-gradient(90deg, ${SHOWROOM_SURFACES.border}, transparent)`,
          }}
        />
        {items.map((item) => (
          <Box
            key={item}
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              border: `1px solid ${SHOWROOM_SURFACES.border}`,
              background: 'linear-gradient(180deg, var(--ds-color-bg-container) 0%, var(--ds-color-bg-secondary) 100%)',
            }}
          >
            <Text
              size="sm"
              style={{
                display: 'block',
                color: SHOWROOM_SURFACES.textSecondary,
                lineHeight: 1.5,
                overflowWrap: 'anywhere',
              }}
            >
              {item}
            </Text>
          </Box>
        ))}
      </Stack>
    </Card>
  );
}

export function generateStaticParams() {
  return patterns.map((pattern) => ({
    group: pattern.group,
    pattern: pattern.slug,
  }));
}

export default async function PatternDetailPage({
  params,
}: {
  params: Promise<{ group: string; pattern: string }>;
}) {
  const { group, pattern } = await params;
  const entry = patterns.find(
    (patternEntry) =>
      patternEntry.group === group && patternEntry.slug === pattern,
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
            Pattern not found
          </Text>
          <Text
            size="md"
            style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
          >
            No pattern matches &quot;{pattern}&quot; in group &quot;{group}&quot;.
          </Text>
          <Link
            href={`/patterns/${group}`}
            style={{
              color: 'var(--ds-color-primary)',
              textDecoration: 'none',
            }}
          >
            Back to {groupLabel(group as PatternGroup)} patterns
          </Link>
        </Stack>
      </Card>
    );
  }

  const guidance = GROUP_GUIDANCE[entry.group];
  const importPath = `import { ${entry.name} } from '@rottay/design-system';`;
  const usageSnippet = getUsageSnippet(entry);
  const placeholderProps = getPlaceholderProps(entry);
  const displayName = formatShowroomLabel(entry.name);
  const siblingPatterns = (patternsByGroup[entry.group] ?? [])
    .filter((patternEntry) => patternEntry.slug !== entry.slug)
    .slice(0, 4);

  return (
    <Stack spacing="xl" fullWidth>
      <Card
        style={{
          border: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithSurface(
            'var(--ds-color-primary, #60a5fa)',
            6,
            SHOWROOM_SURFACES.surface,
          )} 100%)`,
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
              <Link href="/patterns" style={{ textDecoration: 'none' }}>
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
              </Link>
              <Text
                size="xs"
                style={{ display: 'block', color: 'var(--ds-color-text-muted)' }}
              >
                /
              </Text>
              <Link href={`/patterns/${group}`} style={{ textDecoration: 'none' }}>
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
              <Badge variant="secondary">{groupLabel(entry.group)}</Badge>
              <Badge variant="secondary">{entry.engines.length} engines</Badge>
              <Badge variant="secondary">Runtime-driven docs</Badge>
            </Flex>
          </Flex>

          <Box
            className="pattern-detail-header-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.5fr) minmax(280px, 0.95fr)',
              gap: 18,
              alignItems: 'start',
            }}
          >
            <Stack spacing="md">
              <Box>
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
                  size="md"
                  style={{
                    display: 'block',
                    marginTop: 8,
                    color: 'var(--ds-color-text-secondary)',
                    lineHeight: 1.65,
                    maxWidth: 800,
                  }}
                >
                  {entry.description}
                </Text>
              </Box>

              <Text
                size="sm"
                style={{ display: 'block', color: 'var(--ds-color-text-secondary)', lineHeight: 1.6 }}
              >
                {guidance.promise}
              </Text>

              <Box
                style={{
                  padding: 16,
                  borderRadius: 18,
                  border: `1px solid ${SHOWROOM_SURFACES.border}`,
                  background: `linear-gradient(180deg, ${mixWithCanvas(
                    'var(--ds-color-primary, #60a5fa)',
                    4,
                  )} 0%, ${mixWithCanvas(
                    'var(--ds-color-primary, #60a5fa)',
                    5,
                  )} 100%)`,
                }}
              >
                <Stack spacing="sm">
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
                    How to read this page
                  </Text>
                  <Box
                    style={{
                      height: 1,
                      background: `linear-gradient(90deg, ${SHOWROOM_SURFACES.border}, transparent)`,
                    }}
                  />
                  <Text
                    size="sm"
                    style={{
                      display: 'block',
                      color: 'var(--ds-color-text-secondary)',
                      lineHeight: 1.6,
                    }}
                  >
                    Use the showroom switchers in the sidebar to change engine and
                    tenant. The comparison grid below keeps the active tenant and
                    swaps engines so we can inspect the pattern instead of page-local
                    editorial chrome.
                  </Text>
                </Stack>
              </Box>
            </Stack>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: 12,
                alignContent: 'start',
              }}
            >
              <MetaCard
                label="Tier"
                value="Pattern"
                detail="Reusable workflow or composition contract."
              />
              <MetaCard
                label="Group"
                value={groupLabel(entry.group)}
                detail={`Start with ${guidance.evaluate[0]}.`}
              />
              <MetaCard
                label="Best paired with"
                value={guidance.structures[0]}
                detail={`Usually lands inside ${guidance.surfaces[0]}.`}
              />
            </Box>
          </Box>

        </Stack>
      </Card>

      <Card
        style={{
          border: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithCanvas(
            'var(--ds-color-primary, #60a5fa)',
            4,
          )} 100%)`,
          boxShadow: SHOWROOM_SURFACES.shadow,
        }}
      >
        <Stack spacing="md">
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
                Live preview
              </Text>
              <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: 'block' }}>
                Compare the same pattern across engines
              </Text>
            </Box>
            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="secondary">Sidebar tenant drives this</Badge>
              <Badge variant="secondary">{displayName}</Badge>
            </Flex>
          </Flex>

          <Text
            size="sm"
            style={{
              display: 'block',
              color: 'var(--ds-color-text-secondary)',
              lineHeight: 1.55,
            }}
          >
            This comparison is the documentation surface. If the pattern only reads
            well inside local chrome, we should fix the pattern or its preview
            runtime before teams style around it.
          </Text>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
            }}
          >
            <GuidanceCard title="Preview heuristics" items={PATTERN_PREVIEW_NOTES} />
            <GuidanceCard title="Structure pairing" items={guidance.structures} />
          </Box>

          <PatternEnginePreview slug={entry.slug} />

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
            }}
          >
            <GuidanceCard title="What to evaluate" items={guidance.evaluate} />
            <GuidanceCard title="Structure pairing" items={guidance.structures} />
            <GuidanceCard title="Surface fit" items={guidance.surfaces} />
          </Box>
        </Stack>
      </Card>

      <Card
        style={{
          border: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithCanvas(
            'var(--ds-color-primary, #60a5fa)',
            4,
          )} 100%)`,
          boxShadow: SHOWROOM_SURFACES.shadow,
        }}
      >
        <Stack spacing="md">
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
                Consumption
              </Text>
              <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: 'block' }}>
                Import and usage
              </Text>
              <Text
                size="sm"
                style={{
                  display: 'block',
                  marginTop: 6,
                  color: 'var(--ds-color-text-secondary)',
                  lineHeight: 1.55,
                }}
              >
                Treat the pattern as a reusable task contract. Keep route-specific business rules
                outside and use these snippets as the fast-reading baseline.
              </Text>
            </Box>
            <Badge variant="secondary">Consumption contract</Badge>
          </Flex>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
            }}
          >
            <GuidanceCard title="Usage notes" items={PATTERN_USAGE_NOTES} />
            <GuidanceCard title="Surface fit" items={guidance.surfaces} />
          </Box>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 20,
              alignItems: 'start',
            }}
          >
            <CodeBlock code={importPath} language="tsx" title="Import" />
            <CodeBlock code={usageSnippet} language="tsx" title="Usage" />
          </Box>
        </Stack>
      </Card>

      <Card
        style={{
          border: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithCanvas(
            'var(--ds-color-primary, #60a5fa)',
            4,
          )} 100%)`,
          boxShadow: SHOWROOM_SURFACES.shadow,
        }}
      >
        <Stack spacing="md">
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
                API surface
              </Text>
              <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: 'block' }}>
                Props
              </Text>
            </Box>
            <Badge variant="secondary">{placeholderProps.length} rows</Badge>
          </Flex>
          <PropTable title={`${displayName} props`} props={placeholderProps} />
        </Stack>
      </Card>

      {siblingPatterns.length ? (
        <Card
          style={{
            border: `1px solid ${SHOWROOM_SURFACES.border}`,
            background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithCanvas(
              'var(--ds-color-primary, #60a5fa)',
              4,
            )} 100%)`,
            boxShadow: SHOWROOM_SURFACES.shadow,
          }}
        >
          <Stack spacing="md">
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
                  Related patterns
                </Text>
                <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: 'block' }}>
                  Continue within {groupLabel(entry.group)}
                </Text>
              </Box>
              <Link href={`/patterns/${group}`} style={{ textDecoration: 'none' }}>
                <Text
                  size="sm"
                  weight="semibold"
                  style={{ display: 'block', color: 'var(--ds-color-primary)' }}
                >
                  Browse all
                </Text>
              </Link>
            </Flex>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 12,
              }}
            >
              {siblingPatterns.map((patternEntry) => (
                <Link
                  key={patternEntry.slug}
                  href={`/patterns/${entry.group}/${patternEntry.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Box
                    style={{
                      height: '100%',
                      padding: 16,
                      borderRadius: 18,
                      border: `1px solid ${SHOWROOM_SURFACES.border}`,
                      background: `linear-gradient(180deg, ${mixWithCanvas(
                        'var(--ds-color-primary, #60a5fa)',
                        4,
                      )} 0%, ${SHOWROOM_SURFACES.subtle} 100%)`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      minHeight: 118,
                      boxShadow: `inset 0 1px 0 ${mixWithSurface(
                        'var(--ds-color-primary, #60a5fa)',
                        10,
                        'transparent',
                      )}`,
                    }}
                  >
                    <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
                      <Text
                        size="sm"
                        weight="semibold"
                        style={{ display: 'block', lineHeight: 1.3, overflowWrap: 'anywhere' }}
                      >
                        {formatShowroomLabel(patternEntry.name)}
                      </Text>
                      <Badge variant="secondary">
                        {patternEntry.engines.length} engines
                      </Badge>
                    </Flex>
                    <Text
                      size="xs"
                      style={{
                        display: 'block',
                        marginTop: 8,
                        color: 'var(--ds-color-text-secondary)',
                        lineHeight: 1.45,
                      }}
                    >
                      {patternEntry.description}
                    </Text>
                  </Box>
                </Link>
              ))}
            </Box>
          </Stack>
        </Card>
      ) : null}

      <style>{`
        @media (max-width: 980px) {
          .pattern-detail-header-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Stack>
  );
}
