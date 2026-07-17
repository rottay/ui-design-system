'use client';

import { ShowroomLink as Link } from '@/components/showroom-link';
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import {
  BracesIcon,
  LayoutTemplateIcon,
  RocketIcon,
  SparklesIcon,
} from '@rottay/design-system/icons';
import { CodeBlock } from '@/components/playground';
import { DocsCompactList, DocsSectionHeader } from '@/components/docs/editorial-chrome';
import { patterns, primitives, structures, surfaces } from '@/data/registry';

const ENTRY_PATHS = [
  {
    title: 'Ship your first screen',
    href: '/developers/getting-started',
    badge: 'Fastest path',
    outcome: 'A healthy DS render in one app route with the provider mounted correctly.',
    whyItMatters:
      'Use this when the team needs a credible baseline before debating taxonomy or architecture.',
    signals: ['Provider mounted', 'Engine chosen', 'One screen rendered'],
  },
  {
    title: 'Classify shared work correctly',
    href: '/developers/architecture',
    badge: 'Ownership model',
    outcome: 'New capability lands in the right tier instead of becoming route-specific glue.',
    whyItMatters:
      'Use this before adding abstractions, wrappers, or screen-level APIs to the shared library.',
    signals: ['4-tier mental model', 'Ownership guardrails', 'Decision matrix'],
  },
  {
    title: 'Compare real rendering behavior',
    href: '/playground',
    badge: 'Live inspection',
    outcome: 'Product posture is validated with engine and tenant comparisons before code spreads.',
    whyItMatters:
      'Use this when feel, density, or brand voice are still undecided and screenshots are not enough.',
    signals: ['Live scenes', 'Engine deltas', 'Theme deltas'],
  },
] as const;

const DAY_ONE_QUESTIONS = [
  {
    question: 'How do I prove the DS is alive inside my app today?',
    route: '/developers/getting-started',
    routeLabel: 'Open getting started',
    answer:
      'Install once, mount the provider high enough, then render a small but convincing panel using DS primitives.',
    artifact: 'A healthy first render with no custom wrapper debt.',
  },
  {
    question: 'Where should a new shared feature actually live?',
    route: '/developers/architecture',
    routeLabel: 'Review architecture',
    answer:
      'Start with the smallest tier that fits the capability: primitive, pattern, structure, or surface.',
    artifact: 'Cleaner ownership and fewer extension mistakes.',
  },
  {
    question: 'How do I compare tone without building product code first?',
    route: '/playground',
    routeLabel: 'Use the playground',
    answer:
      'Compare the same scene across engines and brands so visual choices are made with evidence, not memory.',
    artifact: 'An informed engine and tenant decision.',
  },
  {
    question: 'What should I inspect when the UI feels inconsistent?',
    route: '/foundations',
    routeLabel: 'Read foundations',
    answer:
      'Audit tokens, themes, engines, and icons before changing component APIs or patching route-level CSS.',
    artifact: 'A cleaner diagnosis path for visual drift.',
  },
] as const;

const DELIVERY_LANES = [
  {
    title: 'Mount',
    detail:
      'Install the package, mount the provider, and get one route to render with confidence.',
  },
  {
    title: 'Classify',
    detail:
      'Use the 4-tier model before you add shared APIs, wrappers, or route contracts.',
  },
  {
    title: 'Compare',
    detail:
      'Validate engine, theme, and density with playground scenes before polishing product screens.',
  },
  {
    title: 'Scale',
    detail:
      'Move from primitives to surfaces once the ownership model and visual posture are already stable.',
  },
] as const;

const REFERENCE_SHELVES = [
  {
    title: 'Build screens quickly',
    description: 'Concrete entry points when the team needs production UI, not theory.',
    links: [
      { label: 'Primitives', href: '/primitives' },
      { label: 'Patterns', href: '/patterns' },
      { label: 'Surfaces', href: '/surfaces' },
    ],
  },
  {
    title: 'Understand the system',
    description: 'Use these when the problem is ownership, structure, or consistency.',
    links: [
      { label: 'Foundations', href: '/foundations' },
      { label: 'Architecture', href: '/developers/architecture' },
      { label: 'Structures', href: '/structures' },
    ],
  },
  {
    title: 'Compare rendering tone',
    description: 'Use live routes before making aesthetic decisions in product code.',
    links: [
      { label: 'Playground', href: '/playground' },
      { label: 'Theme Builder', href: '/playground/theme-builder' },
      { label: 'Engines', href: '/foundations/engines' },
    ],
  },
  {
    title: 'Audit data-heavy UI',
    description: 'High-signal references for dashboards, tables, and operational screens.',
    links: [
      { label: 'Charts', href: '/patterns/visualization/charts' },
      { label: 'Visualization', href: '/patterns/visualization' },
      { label: 'Dashboard surface', href: '/surfaces/data/dashboard' },
    ],
  },
] as const;

const TIER_MODEL = [
  {
    title: 'Primitives',
    count: `${primitives.length}`,
    description: 'Leaf components with stable APIs and engine-switched rendering.',
    decisionRule: 'Use when the work is still a single component, not a workflow.',
    accent: 'var(--ds-color-info-bg)',
    border: 'var(--ds-color-info-border)',
  },
  {
    title: 'Patterns',
    count: `${patterns.length}`,
    description: 'Reusable task modules like tables, builders, stats, and flows.',
    decisionRule: 'Use when behavior repeats across products and deserves reuse.',
    accent: 'var(--ds-color-success-bg)',
    border: 'var(--ds-color-success-border)',
  },
  {
    title: 'Structures',
    count: `${structures.length}`,
    description: 'Page chrome around content, patterns, and operational context.',
    decisionRule: 'Use when the problem is page framing, not the whole route contract.',
    accent: 'var(--ds-color-warning-bg)',
    border: 'var(--ds-color-warning-border)',
  },
  {
    title: 'Surfaces',
    count: `${surfaces.length}`,
    description: 'Declarative page-level recipes consumed by product routes.',
    decisionRule: 'Use when the app should configure a whole screen with shared contracts.',
    accent: 'var(--ds-color-error-bg)',
    border: 'var(--ds-color-error-border)',
  },
] as const;

const QA_CHECKS = [
  'Provider mounted at the correct app boundary.',
  'Engine and tenant are chosen intentionally, not left as defaults by accident.',
  'First screen uses DS layout primitives instead of ad hoc wrappers.',
  'New shared work is classified before APIs or folders are created.',
] as const;

export default function DevelopersPage() {
  const tokens = useTokens();

  return (
    <Stack spacing="xl" fullWidth>
      <Card
        style={{
          overflow: 'hidden',
          border: '1px solid var(--ds-color-border-secondary)',
          background:
            'linear-gradient(180deg, var(--ds-color-bg-secondary), var(--ds-color-bg-surface))',
          boxShadow: tokens.shadows.lg,
        }}
      >
        <Box
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `
              radial-gradient(circle at top left, var(--ds-color-info-bg) 0%, transparent 34%),
              radial-gradient(circle at 82% 12%, var(--ds-color-success-bg) 0%, transparent 26%),
              linear-gradient(180deg, transparent 0%, var(--ds-color-bg-surface) 100%)
            `,
            opacity: 0.72,
          }}
        />

        <Box
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: tokens.spacing[5],
            alignItems: 'stretch',
          }}
        >
          <Stack spacing="lg">
            <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="primary">Developer hub</Badge>
              <Badge variant="secondary">Operate the system, do not browse it blindly</Badge>
            </Flex>

            <Stack spacing="sm">
              <Text
                as={"h1" as any}
                size="2xl"
                weight="bold"
                style={{ letterSpacing: '-0.04em', maxWidth: 760 }}
              >
                Developers should feel like a delivery control room: clear next
                steps, clear ownership, and a fast route from first render to shared
                product capability.
              </Text>
              <Text size="md" style={{ color: 'var(--ds-color-text-secondary)', maxWidth: 760 }}>
                This section now frames adoption around tenant-aware runtime proof:
                get one route healthy, classify shared work correctly, then compare
                engines and themes before code spreads.
              </Text>
            </Stack>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: tokens.spacing[3],
              }}
            >
              {[
                {
                  label: 'Primitives',
                  value: `${primitives.length}`,
                  detail: 'Leaf components and local interaction building blocks.',
                },
                {
                  label: 'Patterns',
                  value: `${patterns.length}`,
                  detail: 'Reusable task modules with durable behavior.',
                },
                {
                  label: 'Structures',
                  value: `${structures.length}`,
                  detail: 'Page chrome, toolbars, headers, and framing.',
                },
                {
                  label: 'Surfaces',
                  value: `${surfaces.length}`,
                  detail: 'Full route contracts configured by apps.',
                },
              ].map((item) => (
                <Box
                  key={item.label}
                  style={{
                    padding: tokens.spacing[4],
                    borderRadius: tokens.borderRadius.xl,
                    background:
                      'linear-gradient(180deg, var(--ds-color-bg-overlay), var(--ds-color-bg-primary))',
                    border: '1px solid var(--ds-color-border-secondary)',
                    minHeight: 136,
                  }}
                >
                  <Stack spacing={6}>
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{
                        color: 'var(--ds-color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {item.label}
                    </Text>
                    <Text size="lg" weight="bold" style={{ lineHeight: 1.1 }}>
                      {item.value}
                    </Text>
                    <Box
                      style={{
                        paddingTop: 8,
                        borderTop: '1px solid var(--ds-color-border-secondary)',
                      }}
                    >
                      <Text
                        size="xs"
                        style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}
                      >
                        {item.detail}
                      </Text>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Box>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: tokens.spacing[4],
              }}
            >
              {ENTRY_PATHS.map((path) => (
                <Link key={path.href} href={path.href} style={{ textDecoration: 'none' }}>
                  <Box
                    style={{
                      height: '100%',
                      padding: tokens.spacing[4],
                      borderRadius: tokens.borderRadius.xl,
                      background:
                        'linear-gradient(180deg, var(--ds-color-bg-elevated), var(--ds-color-bg-primary))',
                      border: '1px solid var(--ds-color-border-secondary)',
                      boxShadow: tokens.shadows.md,
                    }}
                  >
                    <Stack spacing="md" style={{ height: '100%' }}>
                      <Flex align="center" justify="between" style={{ gap: 12, flexWrap: 'wrap' }}>
                        <Text size="sm" weight="semibold">
                          {path.title}
                        </Text>
                        <Badge>{path.badge}</Badge>
                      </Flex>
                      <Box
                        style={{
                          padding: tokens.spacing[3],
                          borderRadius: tokens.borderRadius.lg,
                          background: 'var(--ds-color-bg-overlay)',
                          border: '1px solid var(--ds-color-border-secondary)',
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
                          Why open this
                        </Text>
                        <Text
                          size="xs"
                          style={{
                            marginTop: tokens.spacing[1],
                            color: 'var(--ds-color-text-secondary)',
                            lineHeight: 1.55,
                          }}
                        >
                          {path.whyItMatters}
                        </Text>
                      </Box>
                      <Box
                        style={{
                          padding: tokens.spacing[3],
                          borderRadius: tokens.borderRadius.lg,
                          background: 'var(--ds-color-info-bg)',
                          border: '1px solid var(--ds-color-info-border)',
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
                          Outcome
                        </Text>
                        <Text
                          size="sm"
                          style={{
                            marginTop: tokens.spacing[1],
                            color: 'var(--ds-color-text-secondary)',
                            lineHeight: 1.55,
                          }}
                      >
                        {path.outcome}
                      </Text>
                      </Box>
                      <Box
                        style={{
                          marginTop: 'auto',
                          paddingTop: 8,
                          borderTop: '1px solid var(--ds-color-border-secondary)',
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
                          Success signals
                        </Text>
                      <Flex gap={6} style={{ flexWrap: 'wrap', marginTop: 8 }}>
                        {path.signals.map((signal) => (
                          <Badge key={signal} variant="secondary">
                            {signal}
                          </Badge>
                        ))}
                      </Flex>
                      </Box>
                    </Stack>
                  </Box>
                </Link>
              ))}
            </Box>
          </Stack>

          <Card
            style={{
              height: '100%',
              padding: tokens.spacing[5],
              border: '1px solid var(--ds-color-border-secondary)',
              background:
                'linear-gradient(180deg, var(--ds-color-bg-primary), var(--ds-color-bg-elevated))',
            }}
          >
            <Stack spacing="lg">
              <Box>
                <Text size="sm" weight="semibold" style={{ color: 'var(--ds-color-text-muted)' }}>
                  What this hub should unblock today
                </Text>
                <Text as={"h2" as any} size="xl" weight="bold" style={{ marginTop: tokens.spacing[2] }}>
                  Start from the job to be done, not the folder tree.
                </Text>
              </Box>

              <DocsCompactList
                numbered
                items={DELIVERY_LANES.map((lane, index) => ({
                  title: lane.title,
                  detail: lane.detail,
                  tone: index === 0 ? 'accent' : 'default',
                }))}
              />

              <Box
                style={{
                  padding: tokens.spacing[4],
                  borderRadius: tokens.borderRadius.xl,
                  background: 'var(--ds-color-bg-overlay)',
                  border: '1px solid var(--ds-color-border-secondary)',
                }}
              >
                <Text size="sm" weight="semibold">
                  If the team only does one thing first
                </Text>
                <Text size="sm" style={{ marginTop: tokens.spacing[2], color: 'var(--ds-color-text-secondary)' }}>
                  Render one convincing DS panel in the real app shell before
                  inventing wrappers. That single success state unlocks more than
                  any abstract architecture discussion.
                </Text>
              </Box>
            </Stack>
          </Card>
        </Box>
      </Card>

      <Stack spacing="md">
        <DocsSectionHeader
          eyebrow="Developer routing"
          title="Start from the question you need answered"
          description="Each card points to the shortest path through the showroom instead of asking teams to navigate the taxonomy cold."
          actions={<Badge variant="secondary">4 common developer questions</Badge>}
          tone="accent"
        />

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: tokens.spacing[4],
          }}
        >
          {DAY_ONE_QUESTIONS.map((item, index) => (
            <Card
              key={item.question}
              style={{
                height: '100%',
                padding: tokens.spacing[5],
                border: '1px solid var(--ds-color-border-secondary)',
                background:
                  'linear-gradient(180deg, var(--ds-color-bg-elevated), var(--ds-color-bg-primary))',
              }}
            >
              <Stack spacing="md" style={{ height: '100%' }}>
                <Flex align="center" justify="between" style={{ gap: 12, flexWrap: 'wrap' }}>
                  <Badge variant={index === 0 ? 'primary' : 'secondary'}>{`0${index + 1}`}</Badge>
                  <Link href={item.route} style={{ textDecoration: 'none' }}>
                    <Text size="sm" style={{ color: 'var(--ds-color-link)' }}>
                      {item.routeLabel}
                    </Text>
                  </Link>
                </Flex>
                <Text as={"h3" as any} size="lg" weight="semibold">
                  {item.question}
                </Text>
                <Box
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    background: 'var(--ds-color-bg-overlay)',
                    border: '1px solid var(--ds-color-border-secondary)',
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
                    Answer
                  </Text>
                  <Text
                    size="sm"
                    style={{
                      marginTop: tokens.spacing[1],
                      color: 'var(--ds-color-text-secondary)',
                      lineHeight: 1.55,
                    }}
                  >
                    {item.answer}
                  </Text>
                </Box>
                <Box
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    background:
                      index === 0
                        ? 'var(--ds-color-info-bg)'
                        : 'var(--ds-color-bg-overlay)',
                    border: `1px solid ${
                      index === 0
                        ? 'var(--ds-color-info-border)'
                        : 'var(--ds-color-border-secondary)'
                    }`,
                  }}
                >
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
                  >
                    Artifact
                  </Text>
                  <Text
                    size="sm"
                    style={{
                      marginTop: tokens.spacing[1],
                      color: 'var(--ds-color-text-secondary)',
                    }}
                  >
                    {item.artifact}
                  </Text>
                </Box>
              </Stack>
            </Card>
          ))}
        </Box>
      </Stack>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: tokens.spacing[5],
          alignItems: 'start',
        }}
      >
        <Card
          style={{
            padding: tokens.spacing[6],
            height: '100%',
            border: '1px solid var(--ds-color-border-secondary)',
            background:
              'linear-gradient(180deg, var(--ds-color-bg-secondary), var(--ds-color-bg-surface))',
          }}
        >
          <Stack spacing="md">
            <Flex align="center" gap={8}>
              <RocketIcon size={18} />
              <Text as={"h2" as any} size="lg" weight="semibold">
                First-day implementation board
              </Text>
            </Flex>
            <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
              This is the smallest useful slice: install the package, mount the
              provider, and render a credible panel through DS primitives.
            </Text>
            <CodeBlock
              title="Healthy first render"
              language="tsx"
              code={`import { Badge, Card, DesignSystemProvider, Flex, Stack, Text } from '@rottay/design-system';

export function AppShell() {
  return (
    <DesignSystemProvider forceEngine="modern" tenantSlug="rottay">
      <Card>
        <Stack spacing="md">
          <Flex align="center" justify="between">
            <Text as={"h2" as any} size="lg" weight="semibold">Workspace</Text>
            <Badge variant="success">Healthy</Badge>
          </Flex>
          <Text size="sm">Render one convincing screen before creating wrappers.</Text>
        </Stack>
      </Card>
    </DesignSystemProvider>
  );
}`}
            />
          </Stack>
        </Card>

        <Card
          style={{
            padding: tokens.spacing[6],
            height: '100%',
            border: '1px solid var(--ds-color-border-secondary)',
            background:
              'linear-gradient(180deg, var(--ds-color-bg-secondary), var(--ds-color-bg-surface))',
          }}
        >
          <Stack spacing="md">
            <Flex align="center" gap={8}>
              <LayoutTemplateIcon size={18} />
              <Text as={"h2" as any} size="lg" weight="semibold">
                Validation checklist
              </Text>
            </Flex>
            <DocsCompactList
              numbered
              items={QA_CHECKS.map((item, index) => ({
                title: item,
                tone: index === 0 ? 'success' : 'default',
              }))}
            />
          </Stack>
        </Card>
      </Box>

      <Stack spacing="md">
        <DocsSectionHeader
          eyebrow="Ownership model"
          title="Learn the 4-tier system map"
          description="The best developer docs make classification obvious before shared code is written."
          actions={<Badge variant="secondary">Choose the smallest tier that fits</Badge>}
        />

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: tokens.spacing[4],
          }}
        >
          {TIER_MODEL.map((tier) => (
            <Card
              key={tier.title}
              style={{
                padding: tokens.spacing[5],
                height: '100%',
                border: '1px solid var(--ds-color-border-secondary)',
                background:
                  'linear-gradient(180deg, var(--ds-color-bg-elevated), var(--ds-color-bg-primary))',
              }}
            >
              <Stack spacing="md">
                <Flex align="center" justify="between" style={{ gap: 12 }}>
                  <Text as={"h3" as any} size="lg" weight="semibold">
                    {tier.title}
                  </Text>
                  <Badge variant="secondary">{tier.count}</Badge>
                </Flex>
                <Box
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    background: 'var(--ds-color-bg-overlay)',
                    border: '1px solid var(--ds-color-border-secondary)',
                  }}
                >
                  <Text
                    size="sm"
                    style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}
                  >
                    {tier.description}
                  </Text>
                </Box>
                <Box
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    background: tier.accent,
                    border: `1px solid ${tier.border}`,
                  }}
                >
                  <Text size="xs" weight="semibold">
                    Decision rule
                  </Text>
                  <Text
                    size="sm"
                    style={{
                      marginTop: tokens.spacing[1],
                      color: 'var(--ds-color-text-secondary)',
                    }}
                  >
                    {tier.decisionRule}
                  </Text>
                </Box>
              </Stack>
            </Card>
          ))}
        </Box>
      </Stack>

      <Stack spacing="md">
        <DocsSectionHeader
          eyebrow="Reference map"
          title="Reference shelves"
          description="Route people by intent instead of by taxonomy so first render, ownership, and visual comparison stay reachable in one pass."
          actions={
            <Flex align="center" gap={8}>
              <SparklesIcon size={18} />
              <Badge variant="secondary">Intent-led navigation</Badge>
            </Flex>
          }
          tone="success"
        />
        <Card
          style={{
            padding: tokens.spacing[6],
            border: '1px solid var(--ds-color-border-secondary)',
            background:
              'linear-gradient(180deg, var(--ds-color-bg-secondary), var(--ds-color-bg-surface))',
          }}
        >
          <Stack spacing="md">
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: tokens.spacing[4],
            }}
          >
            {REFERENCE_SHELVES.map((shelf) => (
              <Box
                key={shelf.title}
                style={{
                  padding: tokens.spacing[4],
                  borderRadius: tokens.borderRadius.xl,
                  background: 'var(--ds-color-bg-overlay)',
                  border: '1px solid var(--ds-color-border-secondary)',
                }}
              >
                <Stack spacing={4}>
                  <Text size="sm" weight="semibold">
                    {shelf.title}
                  </Text>
                  <Text
                    size="xs"
                    style={{
                      color: 'var(--ds-color-text-secondary)',
                      lineHeight: 1.55,
                    }}
                  >
                    {shelf.description}
                  </Text>
                </Stack>
                <Stack spacing="xs" style={{ marginTop: tokens.spacing[3] }}>
                  {shelf.links.map((link) => (
                    <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                      <Text size="sm" style={{ color: 'var(--ds-color-link)' }}>
                        {link.label}
                      </Text>
                    </Link>
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
          <Box
            style={{
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.xl,
              background: 'var(--ds-color-info-bg)',
              border: '1px solid var(--ds-color-info-border)',
            }}
          >
            <Flex align="center" gap={8}>
              <BracesIcon size={18} />
              <Text size="sm" weight="semibold">
                Working rule
              </Text>
            </Flex>
            <Text
              size="sm"
              style={{
                marginTop: tokens.spacing[2],
                color: 'var(--ds-color-text-secondary)',
              }}
            >
              The docs are healthier when they route people by intent: first render,
              ownership, and visual comparison should all be reachable in one scroll.
            </Text>
          </Box>
          </Stack>
        </Card>
      </Stack>
    </Stack>
  );
}
