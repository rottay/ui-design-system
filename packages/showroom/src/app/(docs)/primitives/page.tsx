import { ShowroomLink as Link } from '@/components/showroom-link';
import { Badge, Box, Card, Flex, Stack, Text } from '@/components/showroom-ui';
import {
  primitiveCategories,
  primitives,
  primitivesByCategory,
  type PrimitiveCategory,
} from '@/data/registry/primitives';
import {
  AlertCircleIcon,
  EditIcon,
  EyeIcon,
  LayersIcon,
  LayoutGridIcon,
  PanelRightCloseIcon,
  ScanSearchIcon,
} from '@rottay/design-system/icons';
import { LiveComponentShowcaseDeferred } from './live-component-showcase-deferred';

interface PrimitiveEditorial {
  headline: string;
  description: string;
  bestFor: string;
  buildHint: string;
  accent: string;
  tint: string;
  icon: React.ReactNode;
}

const CATEGORY_EDITORIAL: Record<PrimitiveCategory, PrimitiveEditorial> = {
  display: {
    headline: 'Show evidence, hierarchy, and content density.',
    description:
      'Display primitives carry the visible payload: cards, stats, tables, avatars, tags, media, and textual structure.',
    bestFor:
      'Use this track when the product question is how to present information clearly, not how to orchestrate a workflow.',
    buildHint: 'Dashboards, record summaries, media galleries, metadata blocks',
    accent: 'var(--ds-color-primary-600)',
    tint: 'var(--ds-color-primary-50)',
    icon: <EyeIcon size={20} />,
  },
  inputs: {
    headline: 'Capture intent, edits, and decisions.',
    description:
      'Inputs are the action layer of the system, from basic buttons and fields to structured selectors, uploads, and authoring controls.',
    bestFor:
      'Start here when you are assembling forms, CRUD screens, filters, inline editing, or approval actions.',
    buildHint: 'Settings forms, creation flows, search bars, action toolbars',
    accent: 'var(--ds-color-success-700)',
    tint: 'var(--ds-color-success-50)',
    icon: <EditIcon size={20} />,
  },
  feedback: {
    headline: 'Explain state changes and keep users oriented.',
    description:
      'Feedback primitives handle alerts, toasts, progress, modals, skeletons, and operation results that make systems feel trustworthy.',
    bestFor:
      'Reach here when the product needs to acknowledge loading, success, warnings, errors, or interruption moments.',
    buildHint: 'Loading states, confirmations, notices, async outcomes',
    accent: 'var(--ds-color-warning-700)',
    tint: 'var(--ds-color-warning-50)',
    icon: <AlertCircleIcon size={20} />,
  },
  layout: {
    headline: 'Control rhythm, spacing, and responsive composition.',
    description:
      'Layout primitives replace raw HTML scaffolding with system-aware containers like Box, Flex, Grid, Stack, and Container.',
    bestFor:
      'Open layout when the UI is structurally right in concept but the spacing, balance, or responsiveness still feels improvised.',
    buildHint: 'Page scaffolds, adaptive sections, balanced spacing systems',
    accent: 'var(--ds-color-primary-700)',
    tint: 'var(--ds-color-neutral-100)',
    icon: <LayoutGridIcon size={20} />,
  },
  navigation: {
    headline: 'Move users through the product without losing context.',
    description:
      'Navigation primitives define pathfinding, orientation, and mode switching for both wide desktop workspaces and tighter mobile flows.',
    bestFor:
      'Use this set for shell navigation, tabs, view switching, anchors, breadcrumbs, and movement across hierarchies.',
    buildHint: 'Collection tabs, section anchors, shells, mobile navigation',
    accent: 'var(--ds-color-primary-600)',
    tint: 'var(--ds-color-primary-50)',
    icon: <ScanSearchIcon size={20} />,
  },
  overlay: {
    headline: 'Layer high-attention UI above the page.',
    description:
      'Overlay primitives handle popovers, menus, tours, sheets, and dialogs that need their own layer, focus rules, or interruption behavior.',
    bestFor:
      'Choose overlay when the interaction belongs above the current surface instead of inside normal page flow.',
    buildHint: 'Menus, confirmations, coach marks, contextual actions',
    accent: 'var(--ds-color-error-700)',
    tint: 'var(--ds-color-error-50)',
    icon: <PanelRightCloseIcon size={20} />,
  },
};

const ENTRY_PATHS = [
  {
    title: 'Ship a fast CRUD baseline',
    href: '/primitives/display/card',
    detail:
      'Cards, badges, tables, and inputs cover a surprising amount of product before you need a higher-order pattern.',
  },
  {
    title: 'Stress-test interaction quality',
    href: '/primitives/inputs/button',
    detail:
      'Buttons, inputs, selects, and toggles are where engine differences show up immediately under real usage pressure.',
  },
  {
    title: 'Judge page rhythm first',
    href: '/primitives/layout/stack',
    detail:
      'Layout primitives reveal whether the system can make dense screens feel deliberate instead of improvised.',
  },
];

const BUILD_RECIPES = [
  {
    title: 'CRUD starter kit',
    components: ['Button', 'Input', 'Table', 'Badge', 'Modal'],
    description:
      'Enough to assemble a strong collection screen before you decide whether it deserves a packaged pattern.',
  },
  {
    title: 'Settings and authoring',
    components: ['Form', 'FormField', 'Select', 'Switch', 'Alert'],
    description:
      'Use these when you need validation detail and local field control without inventing custom form chrome.',
  },
  {
    title: 'Shell and navigation',
    components: ['Box', 'Flex', 'Menu', 'Tabs', 'Drawer'],
    description:
      'These establish page scaffolding and view switching before full structures or surfaces enter the conversation.',
  },
];

const SHELF_GUIDE = [
  'Start from the local UI problem, not the abstraction tier.',
  'Compare the same primitive across engines before you approve a visual direction.',
  'Escalate only when the interaction logic repeats across screens.',
];

const LAYER_LADDER = [
  {
    label: 'Primitives',
    detail: 'Local UI building blocks',
    active: true,
  },
  {
    label: 'Patterns',
    detail: 'Repeatable task behavior',
    active: false,
  },
  {
    label: 'Structures',
    detail: 'Page-level framing',
    active: false,
  },
  {
    label: 'Surfaces',
    detail: 'Full screen contracts',
    active: false,
  },
];

const PANEL_SURFACE =
  'var(--ds-surface-panel, var(--ds-color-bg-tertiary, var(--ds-color-neutral-100)))';
const CARD_SURFACE =
  'var(--ds-surface-card, var(--ds-color-bg-elevated, var(--ds-color-neutral-50)))';
const INSET_SURFACE =
  'var(--ds-surface-inset, var(--ds-color-bg-secondary, var(--ds-color-neutral-50)))';
const SUBTLE_BORDER =
  '1px solid var(--ds-color-border-subtle, var(--ds-color-neutral-200))';
const EMPHASIS_BORDER =
  '1px solid color-mix(in srgb, var(--ds-color-primary-500) 18%, var(--ds-color-border-subtle, var(--ds-color-neutral-200)))';
const SHADOW = '0 24px 56px var(--ds-color-shadow, rgba(0, 0, 0, 0.24))';
const HERO_OVERLAY =
  'radial-gradient(circle at top right, color-mix(in srgb, var(--ds-color-primary-500) 18%, transparent), transparent 30%), radial-gradient(circle at left bottom, color-mix(in srgb, var(--ds-color-primary-500) 10%, transparent), transparent 34%)';

function MetricTile({
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
        padding: 18,
        borderRadius: 20,
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated) 92%, var(--ds-color-primary-500) 8%) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
        border: SUBTLE_BORDER,
        boxShadow: SHADOW,
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
        {label}
      </Text>
      <Text size="xl" weight="bold" style={{ display: 'block', lineHeight: 1.05 }}>
        {value}
      </Text>
      <Box
        aria-hidden="true"
        style={{
          marginTop: 8,
          height: 1,
          borderRadius: 999,
          background:
            'color-mix(in srgb, var(--ds-color-primary-500) 18%, var(--ds-color-border-subtle, var(--ds-color-neutral-200)))',
        }}
      />
      <Text
        size="xs"
        style={{
          display: 'block',
          marginTop: 8,
          color: 'var(--ds-color-text-secondary)',
          lineHeight: 1.45,
        }}
      >
        {detail}
      </Text>
    </Box>
  );
}

function LayerRail() {
  return (
    <Box
      className="showroom-primitives-layer-rail"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
      }}
    >
      {LAYER_LADDER.map((item) => (
        <Box
          key={item.label}
          style={{
            padding: '12px 14px',
            borderRadius: 18,
            border: item.active ? EMPHASIS_BORDER : SUBTLE_BORDER,
            background: item.active
              ? 'color-mix(in srgb, var(--ds-color-primary-500) 12%, var(--ds-color-bg-elevated))'
              : CARD_SURFACE,
            minWidth: 0,
          }}
        >
          <Text
            size="xs"
            weight="semibold"
            style={{
              color: item.active
                ? 'var(--ds-color-primary-700)'
                : 'var(--ds-color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {item.label}
          </Text>
          <Text size="xs" style={{ marginTop: 6, color: 'var(--ds-color-text-secondary)' }}>
            {item.detail}
          </Text>
        </Box>
      ))}
    </Box>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  badge,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <Box style={{ paddingBottom: 14, borderBottom: SUBTLE_BORDER }}>
      <Flex align="end" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
        <Box style={{ maxWidth: 780 }}>
          {eyebrow ? (
            <Text
              size="xs"
              weight="semibold"
              style={{
                display: 'block',
                marginBottom: 6,
                color: 'var(--ds-color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {eyebrow}
            </Text>
          ) : null}
          <Text as={"h2" as any} size="xl" weight="semibold">
            {title}
          </Text>
          <Text size="sm" style={{ marginTop: 6, color: 'var(--ds-color-text-secondary)' }}>
            {description}
          </Text>
        </Box>
        {badge ? <Badge variant="secondary">{badge}</Badge> : null}
      </Flex>
    </Box>
  );
}

export default function PrimitivesPage() {
  return (
    <Stack spacing="lg" fullWidth>
      <Card
        style={{
          overflow: 'hidden',
          border: EMPHASIS_BORDER,
          background:
            'linear-gradient(140deg, color-mix(in srgb, var(--ds-color-primary-500) 10%, var(--ds-color-bg-secondary)) 0%, var(--ds-color-bg-elevated) 52%, color-mix(in srgb, var(--ds-color-primary-500) 5%, var(--ds-color-bg-tertiary)) 100%)',
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

        <Stack spacing="lg" style={{ position: 'relative' }}>
          <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="primary">{primitives.length} engine-switched primitives</Badge>
              <Badge variant="secondary">Local UI building blocks</Badge>
            </Flex>
            <Badge variant="success">Start here before packaging flow logic</Badge>
          </Flex>

          <Box
            className="showroom-primitives-hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.18fr) minmax(320px, 0.82fr)',
              gap: 18,
              alignItems: 'start',
            }}
          >
            <Stack spacing="md">
              <Stack spacing="sm">
                <Text
                  as={"h1" as any}
                  size="2xl"
                  weight="bold"
                  style={{ letterSpacing: '-0.04em', maxWidth: 880 }}
                >
                  Browse the building blocks before you reach for bigger abstractions.
                </Text>
                <Text size="md" style={{ maxWidth: 860, color: 'var(--ds-color-text-secondary)' }}>
                  The primitives shelf should prove the system under real product mechanics before
                  teams reach for higher-order packaging. Browse by job, compare live output, and
                  decide whether the work stays local or needs to move up into patterns.
                </Text>
                <Text size="sm" style={{ maxWidth: 760, color: 'var(--ds-color-text-muted)' }}>
                  This index is strongest when it behaves like a routing map: each category should
                  answer what kind of UI problem it solves, what good looks like, and when to
                  escalate.
                </Text>
              </Stack>

              <Box
                className="showroom-primitives-entry-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                  gap: 14,
                }}
              >
                {ENTRY_PATHS.map((path) => (
                  <Link key={path.href} href={path.href} style={{ textDecoration: 'none' }}>
                    <Box
                      style={{
                        height: '100%',
                        padding: 18,
                        borderRadius: 22,
                        border: SUBTLE_BORDER,
                        background:
                          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 4%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
                        boxShadow: SHADOW,
                      }}
                    >
                      <Badge variant="secondary">Path</Badge>
                      <Text
                        size="sm"
                        weight="semibold"
                        style={{
                          display: 'block',
                          marginTop: 10,
                          color: 'var(--ds-color-text-primary)',
                          lineHeight: 1.4,
                        }}
                      >
                        {path.title}
                      </Text>
                      <Box style={{ marginTop: 10, paddingTop: 10, borderTop: SUBTLE_BORDER }}>
                        <Text
                          size="xs"
                          style={{
                            display: 'block',
                            color: 'var(--ds-color-text-secondary)',
                            lineHeight: 1.5,
                          }}
                        >
                          {path.detail}
                        </Text>
                      </Box>
                    </Box>
                  </Link>
                ))}
              </Box>
            </Stack>

            <Stack spacing="md">
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 12,
                }}
              >
                <MetricTile
                  label="Categories"
                  value={`${primitiveCategories.length}`}
                  detail="Six jobs that cover local rendering, input, layout, navigation, and layered UI."
                />
                <MetricTile
                  label="Engines"
                  value="3"
                  detail="Classic, modern, and rustic should all stay legible through the same API."
                />
                <MetricTile
                  label="Shared API"
                  value="1"
                  detail="One primitive contract should travel across providers without layout drift."
                />
                <MetricTile
                  label="Primary scope"
                  value="Local UI"
                  detail="This layer solves rendering and interaction quality before workflow orchestration."
                />
              </Box>

              <Box
              style={{
                padding: 18,
                borderRadius: 24,
                border: SUBTLE_BORDER,
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 3%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
                }}
              >
                <Stack spacing="sm">
                  <Flex align="center" gap={8}>
                    <LayersIcon size={18} />
                    <Text size="sm" weight="semibold" style={{ display: 'block' }}>
                      Taxonomy fit
                    </Text>
                  </Flex>
                  <Text
                    size="sm"
                    style={{
                      display: 'block',
                      color: 'var(--ds-color-text-secondary)',
                      lineHeight: 1.55,
                    }}
                  >
                    Primitives should answer local rendering, spacing, control, and overlay
                    behavior before teams start composing reusable workflows.
                  </Text>
                  <LayerRail />
                  <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                    {SHELF_GUIDE.map((line) => (
                      <Badge key={line} variant="secondary">
                        {line}
                      </Badge>
                    ))}
                  </Flex>
                </Stack>
              </Box>

              <Box
              style={{
                padding: 18,
                borderRadius: 24,
                border: SUBTLE_BORDER,
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 3%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
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
                    Category balance
                  </Text>
                  {primitiveCategories.map((category) => {
                    const editorial = CATEGORY_EDITORIAL[category.slug];

                    return (
                      <Box
                        key={category.slug}
                        style={{
                          padding: '14px 14px 13px',
                          borderRadius: 16,
                          border: SUBTLE_BORDER,
                          background: PANEL_SURFACE,
                        }}
                      >
                        <Flex align="center" justify="between" gap={12}>
                          <Flex align="center" gap={10} style={{ minWidth: 0 }}>
                            <Box
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 12,
                                background: editorial.tint,
                                color: editorial.accent,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {editorial.icon}
                            </Box>
                            <Box style={{ minWidth: 0 }}>
                              <Text size="sm" weight="semibold" style={{ display: 'block' }}>
                                {category.label}
                              </Text>
                              <Text
                                size="xs"
                                style={{
                                  display: 'block',
                                  marginTop: 2,
                                  color: 'var(--ds-color-text-secondary)',
                                  lineHeight: 1.5,
                                }}
                              >
                                {editorial.headline}
                              </Text>
                            </Box>
                          </Flex>
                          <Badge variant="secondary">{category.count}</Badge>
                        </Flex>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            </Stack>
          </Box>

          <Box
            style={{
              padding: 22,
              borderRadius: 24,
              border: SUBTLE_BORDER,
              background: CARD_SURFACE,
            }}
          >
            <Stack spacing="md">
              <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
                <Box style={{ minWidth: 0, maxWidth: 760 }}>
                  <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: 'block' }}>
                    Live DS runtime
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
                    This shelf renders imported DS components through the active provider, so
                    tenant and engine switches should be visible here before you open a detail
                    page.
                  </Text>
                </Box>
                <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                  <Badge variant="primary">Runtime proof</Badge>
                  <Badge variant="secondary">Imported components</Badge>
                </Flex>
              </Flex>

              <LiveComponentShowcaseDeferred />
            </Stack>
          </Box>
        </Stack>
      </Card>

      <Card
        style={{
          border: SUBTLE_BORDER,
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 4%, var(--ds-color-bg-elevated)) 0%, var(--ds-color-bg-secondary) 100%)',
          boxShadow: SHADOW,
        }}
      >
          <Stack spacing="md">
            <SectionHeading
              eyebrow="Taxonomy guide"
              title="Browse by job"
              description="Each category is framed around the screen responsibility it owns so teams can move quickly from intent to the right shelf."
              badge="Browse the taxonomy, not a flat inventory"
            />

          <Box
            className="showroom-primitives-category-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: 16,
            }}
          >
            {primitiveCategories.map((category) => {
              const editorial = CATEGORY_EDITORIAL[category.slug];
              const entries = primitivesByCategory[category.slug];
              const leadEntry = entries[0];

              return (
                <Link
                  key={category.slug}
                  href={`/primitives/${category.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Card
                    hoverable
                    style={{
                      height: '100%',
                      padding: 20,
                      cursor: 'pointer',
                      border: SUBTLE_BORDER,
                      background: CARD_SURFACE,
                      boxShadow: SHADOW,
                    }}
                  >
                    <Stack spacing="md" fullWidth style={{ height: '100%' }}>
                      <Flex align="start" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
                        <Flex align="start" gap={12} style={{ minWidth: 0, flex: '1 1 220px' }}>
                          <Box
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: 18,
                              background: editorial.tint,
                              color: editorial.accent,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow:
                                'inset 0 0 0 1px color-mix(in srgb, var(--ds-color-border-subtle) 88%, transparent)',
                            }}
                          >
                            {editorial.icon}
                          </Box>
                          <Box style={{ minWidth: 0 }}>
                            <Text as={"h3" as any} size="lg" weight="semibold">
                              {category.label}
                            </Text>
                            <Text size="xs" style={{ marginTop: 4, color: 'var(--ds-color-text-muted)' }}>
                              {editorial.headline}
                            </Text>
                          </Box>
                        </Flex>
                        <Badge variant="secondary">{entries.length} items</Badge>
                      </Flex>

                      <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                        {editorial.description}
                      </Text>

                      <Box
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.88fr)',
                          gap: 12,
                        }}
                      >
                        <Box
                        style={{
                          padding: 14,
                          borderRadius: 16,
                          border: SUBTLE_BORDER,
                          background: editorial.tint,
                          }}
                        >
                          <Text
                            size="xs"
                            weight="semibold"
                            style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
                          >
                            Use for
                          </Text>
                          <Text size="sm" style={{ marginTop: 8, color: 'var(--ds-color-text-secondary)' }}>
                            {editorial.bestFor}
                          </Text>
                        </Box>

                        <Box
                        style={{
                          padding: 14,
                          borderRadius: 16,
                          border: SUBTLE_BORDER,
                          background: PANEL_SURFACE,
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
                            Typical outcome
                          </Text>
                          <Text size="sm" style={{ marginTop: 8, color: 'var(--ds-color-text-secondary)' }}>
                            {editorial.buildHint}
                          </Text>
                        </Box>
                      </Box>

                      <Box
                        style={{
                          padding: 14,
                          borderRadius: 16,
                          border: SUBTLE_BORDER,
                          background: INSET_SURFACE,
                        }}
                      >
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
                            First references
                          </Text>
                          {leadEntry ? <Badge variant="secondary">Open {leadEntry.name}</Badge> : null}
                        </Flex>
                        <Flex gap={6} style={{ flexWrap: 'wrap', marginTop: 10 }}>
                          {entries.slice(0, 4).map((entry) => (
                            <Box
                              key={entry.slug}
                              style={{
                                padding: '5px 10px',
                                borderRadius: 999,
                                background: 'var(--ds-color-neutral-100)',
                              }}
                            >
                              <Text
                                size="xs"
                                style={{
                                  color: 'var(--ds-color-text-secondary)',
                                  fontFamily: 'var(--font-geist-mono)',
                                }}
                              >
                                {entry.name}
                              </Text>
                            </Box>
                          ))}
                          {entries.length > 4 ? <Badge variant="secondary">+{entries.length - 4} more</Badge> : null}
                        </Flex>
                      </Box>
                    </Stack>
                  </Card>
                </Link>
              );
            })}
          </Box>
        </Stack>
      </Card>

      <Box
        className="showroom-primitives-recipes-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <Card
        style={{
          border: SUBTLE_BORDER,
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 3%, var(--ds-color-bg-elevated)) 0%, var(--ds-color-bg-secondary) 100%)',
          }}
        >
          <Stack spacing="md">
            <SectionHeading
              eyebrow="Starter trays"
              title="Build fast, then escalate"
              description="Use these bundles to stand up a convincing screen quickly, then decide whether the work still belongs in primitives."
            />

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                gap: 14,
              }}
            >
              {BUILD_RECIPES.map((recipe) => (
                <Box
                  key={recipe.title}
                  style={{
                    padding: 18,
                    borderRadius: 20,
                    border: SUBTLE_BORDER,
                    background: PANEL_SURFACE,
                  }}
                >
                  <Text size="sm" weight="semibold">
                    {recipe.title}
                  </Text>
                  <Box style={{ marginTop: 10, paddingTop: 10, borderTop: SUBTLE_BORDER }}>
                    <Text
                      size="xs"
                      style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.5 }}
                    >
                      {recipe.description}
                    </Text>
                    <Flex gap={6} style={{ flexWrap: 'wrap', marginTop: 12 }}>
                      {recipe.components.map((component) => (
                        <Badge key={component} variant="secondary">
                          {component}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                </Box>
              ))}
            </Box>
          </Stack>
        </Card>

        <Card
          style={{
            border: SUBTLE_BORDER,
            background: CARD_SURFACE,
          }}
        >
          <Stack spacing="md">
            <SectionHeading
              eyebrow="Decision support"
              title="Escalation guide"
              description="The goal is to keep work in primitives while it still depends on local rendering, and to move up only when the interaction becomes a reusable task."
            />
            {[
              {
                title: 'Stay in primitives when',
                body: 'The value comes from rendering, editing, spacing, local interaction quality, or engine parity.',
              },
              {
                title: 'Jump to patterns when',
                body: 'You need reusable task behavior like sorting, filtering, approvals, kanban rules, or guided authoring.',
              },
              {
                title: 'Hand off to structures later',
                body: 'Once the task is working, structures help frame headers, rails, filters, and supporting chrome around it.',
              },
            ].map((item) => (
              <Box
                key={item.title}
                style={{
                  padding: 16,
                  borderRadius: 18,
                  border: SUBTLE_BORDER,
                  background: PANEL_SURFACE,
                }}
              >
                <Text
                  size="xs"
                  weight="semibold"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  {item.title}
                </Text>
                <Text size="sm" style={{ marginTop: 8, color: 'var(--ds-color-text-secondary)' }}>
                  {item.body}
                </Text>
              </Box>
            ))}
          </Stack>
        </Card>
      </Box>

      <style>{`
        @container showroom-content (max-width: 1280px) {
          .showroom-primitives-hero-grid,
          .showroom-primitives-recipes-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @container showroom-content (max-width: 1080px) {
          .showroom-primitives-entry-grid {
            grid-template-columns: 1fr !important;
          }

          .showroom-primitives-category-grid > * > * > * > div:nth-child(4) {
            grid-template-columns: 1fr !important;
          }
        }

        @container showroom-content (max-width: 920px) {
          .showroom-primitives-layer-rail {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
      `}</style>
    </Stack>
  );
}
