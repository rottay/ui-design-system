'use client';

import { ShowroomLink as Link } from '@/components/showroom-link';
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import { ArrowLeftIcon } from '@rottay/design-system/icons';
import { CodeBlock } from '@/components/playground';
import { DocsCompactList, DocsSectionHeader } from '@/components/docs/editorial-chrome';

const TIERS = [
  {
    name: 'Primitives',
    analogy: 'Atomic UI parts',
    path: 'packages/core/src/composition/components/foundation/primitives/',
    description:
      'Engine-aware leaf components with stable APIs. They solve local UI rendering, spacing, and interaction primitives.',
    examples: 'Button, Input, Card, Modal, Text, Badge, Box, Flex, Stack',
    decisionRule: 'Use when the problem is still a single component instead of a workflow.',
    accent: 'var(--ds-color-info-bg)',
    border: 'var(--ds-color-info-border)',
  },
  {
    name: 'Patterns',
    analogy: 'Reusable task widgets',
    path: 'packages/core/src/composition/components/runtime/patterns/',
    description:
      'Repeatable work units such as tables, builders, kanban, stats, or timeline modules. Patterns should not know the route they live in.',
    examples: 'PatternDataTable, PatternFormBuilder, PatternKanbanBoard, PatternStatsGrid',
    decisionRule: 'Use when the same behavior should travel across products and routes.',
    accent: 'var(--ds-color-success-bg)',
    border: 'var(--ds-color-success-border)',
  },
  {
    name: 'Structures',
    analogy: 'Page chrome',
    path: 'packages/core/src/composition/components/composition/structures/',
    description:
      'Headers, toolbars, record framing, dashboard scaffolds, and layout context around patterns and content.',
    examples: 'CollectionHeader, SearchCommandBar, TableToolbar, RecordFieldGrid',
    decisionRule: 'Use when the problem is page framing, not the entire route contract.',
    accent: 'var(--ds-color-warning-bg)',
    border: 'var(--ds-color-warning-border)',
  },
  {
    name: 'Surfaces',
    analogy: 'Full-screen recipes',
    path: 'packages/core/src/composition/components/public/surfaces/',
    description:
      'Declarative route-level contracts that combine structures, patterns, and primitives into a product-ready screen.',
    examples: 'ListSurface, DashboardSurface, FormSurface, CollectionWorkspaceSurface',
    decisionRule: 'Use when the consuming app should configure a whole screen with shared contracts.',
    accent: 'var(--ds-color-error-bg)',
    border: 'var(--ds-color-error-border)',
  },
] as const;

const DECISION_EXAMPLES = [
  {
    question: 'Need a reusable kanban workflow across products?',
    tier: 'Pattern',
    owner: 'Design System',
  },
  {
    question: 'Need a users page header with filters and actions?',
    tier: 'Structure',
    owner: 'Design System',
  },
  {
    question: 'Need a route that wires business data into a complete admin screen?',
    tier: 'Surface + app orchestration',
    owner: 'Shared contract, app-owned semantics',
  },
  {
    question: 'Need a tenant-specific hiring policy or approval rule?',
    tier: 'Consuming app',
    owner: 'Consuming App',
  },
] as const;

const ENGINES = [
  {
    name: 'Classic',
    foundation: 'Ant Design 5.21',
    personality: 'Structured, precise, and admin-heavy.',
  },
  {
    name: 'Modern',
    foundation: 'Tailwind / DaisyUI',
    personality: 'Rounded, spacious, and contemporary.',
  },
  {
    name: 'Rustic',
    foundation: 'Vanilla CSS',
    personality: 'Quiet, minimal, and intentionally restrained.',
  },
] as const;

const OWNERSHIP_RULES = [
  {
    belongs: 'Design System',
    tone: 'success',
    items: [
      'Reusable UI capability and interaction patterns',
      'Engine-aware rendering behavior and visual language',
      'Shared page chrome and config-driven screen recipes',
      'Theme, token, icon, and chart infrastructure',
    ],
  },
  {
    belongs: 'Consuming App',
    tone: 'warning',
    items: [
      'Domain models, permissions, and workflow semantics',
      'Route-specific data fetching and orchestration',
      'Tenant business rules and product-specific exceptions',
      'Mapping API responses into DS configuration objects',
    ],
  },
] as const;

const RUNTIME_FLOW = [
  'App route decides the domain task.',
  'Surface describes the screen contract.',
  'Structures add page chrome and context.',
  'Patterns solve repeated workflows.',
  'Primitives render through the active engine.',
  'Tokens and BrandTheme finish the visual result.',
] as const;

const WARNINGS = [
  'Do not put tenant semantics into shared components.',
  'Do not rebuild page-level contracts with ad hoc primitive glue on every route.',
  'Do not treat engine differences as product forks instead of runtime variants.',
] as const;

export default function ArchitecturePage() {
  const tokens = useTokens();

  return (
    <Stack spacing="xl" fullWidth>
      <Link
        href="/developers"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.875rem',
          color: 'var(--ds-color-link)',
          textDecoration: 'none',
        }}
      >
        <ArrowLeftIcon size={14} /> Back to Developers
      </Link>

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
              radial-gradient(circle at 84% 18%, var(--ds-color-success-bg) 0%, transparent 26%),
              linear-gradient(180deg, transparent 0%, var(--ds-color-bg-surface) 100%)
            `,
            opacity: 0.7,
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
              <Badge variant="primary">Architecture</Badge>
              <Badge variant="secondary">4-tier ownership model</Badge>
            </Flex>

            <Stack spacing="sm">
              <Text
                as={"h1" as any}
                size="2xl"
                weight="bold"
                style={{ letterSpacing: '-0.04em' }}
              >
                The design system scales because capability, page framing, and
                product semantics do not live in the same layer.
              </Text>
              <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
                This page is meant to stop accidental complexity early. It shows
                how engines, tiers, and app-level semantics work together so new
                shared work lands in the right place from the first decision.
              </Text>
            </Stack>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: tokens.spacing[3],
              }}
            >
              {[
                {
                  label: 'Core model',
                  value: '4 tiers',
                  detail: 'Primitives, patterns, structures, and surfaces each own a different level.',
                },
                {
                  label: 'Runtime leverage',
                  value: 'Engines + themes',
                  detail: 'Implementation tone changes without forcing API forks.',
                },
                {
                  label: 'Key decision',
                  value: 'Capability vs semantics',
                  detail: 'Shared UI belongs in DS. Product rules stay in the app.',
                },
              ].map((item) => (
                <Box
                  key={item.label}
                  style={{
                    padding: tokens.spacing[4],
                    borderRadius: tokens.borderRadius.lg,
                    background:
                      'linear-gradient(180deg, var(--ds-color-bg-overlay), var(--ds-color-bg-primary))',
                    border: '1px solid var(--ds-color-border-secondary)',
                    minHeight: 140,
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
                    <Text size="sm" weight="semibold" style={{ lineHeight: 1.3 }}>
                      {item.value}
                    </Text>
                    <Box
                      style={{
                        paddingTop: 8,
                        borderTop: '1px solid var(--ds-color-border-secondary)',
                      }}
                    >
                      <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                        {item.detail}
                      </Text>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Stack>

          <Card
            style={{
              padding: tokens.spacing[5],
              border: '1px solid var(--ds-color-border-secondary)',
              background:
                'linear-gradient(180deg, var(--ds-color-bg-primary), var(--ds-color-bg-elevated))',
            }}
          >
              <Stack spacing="md">
                <Text size="sm" weight="semibold" style={{ color: 'var(--ds-color-text-muted)' }}>
                  Runtime flow
                </Text>
                <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.6 }}>
                  Read this from top to bottom when a team is unsure what belongs in the app,
                  what belongs in shared DS code, and where runtime styling actually resolves.
                </Text>
                <DocsCompactList
                  numbered
                  items={RUNTIME_FLOW.map((step, index) => ({
                    title: step,
                    tone: index === 0 ? 'accent' : 'default',
                  }))}
                />
              </Stack>
            </Card>
        </Box>
      </Card>

      <Stack spacing="md">
        <DocsSectionHeader
          eyebrow="Decision support"
          title="Decision board"
          description="Use this when someone asks where new shared work should land so the answer is based on capability shape, not on folder familiarity."
          actions={
            <Badge variant="secondary">
              {DECISION_EXAMPLES.length} common architecture calls
            </Badge>
          }
          tone="accent"
        />

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: tokens.spacing[4],
          }}
        >
          {DECISION_EXAMPLES.map((example, index) => (
            <Card key={example.question} style={{ padding: tokens.spacing[5], height: '100%' }}>
                <Stack spacing="md" style={{ height: '100%' }}>
                  <Badge variant={index === 0 ? 'primary' : 'secondary'}>{`0${index + 1}`}</Badge>
                  <Text as={"h3" as any} size="lg" weight="semibold">
                    {example.question}
                  </Text>
                  <Box
                    style={{
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.lg,
                      background: 'var(--ds-color-bg-overlay)',
                      border: '1px solid var(--ds-color-border-secondary)',
                    }}
                  >
                    <Stack spacing={4}>
                      <Text
                        size="xs"
                        weight="semibold"
                        style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
                      >
                        Recommended tier
                      </Text>
                      <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                        {example.tier}
                      </Text>
                    </Stack>
                  </Box>
                  <Box
                    style={{
                      padding: '8px 10px',
                      borderRadius: 12,
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
                      Owner
                    </Text>
                    <Text size="sm" style={{ marginTop: 4, color: 'var(--ds-color-text-secondary)', lineHeight: 1.5 }}>
                      {example.owner}
                    </Text>
                  </Box>
                </Stack>
              </Card>
            ))}
        </Box>
      </Stack>

      <Stack spacing="md">
        <DocsSectionHeader
          eyebrow="Shared system map"
          title="The 4-tier model"
          description="Each layer exists to reduce ambiguity in how shared UI grows, so teams can escalate only when the work truly changes shape."
          actions={<Badge variant="secondary">Choose the smallest tier that truly fits</Badge>}
        />

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: tokens.spacing[4],
          }}
        >
          {TIERS.map((tier) => (
            <Card key={tier.name} style={{ padding: tokens.spacing[5], height: '100%' }}>
              <Stack spacing="md" style={{ height: '100%' }}>
                <Flex align="center" justify="between" style={{ gap: 12 }}>
                  <Box>
                    <Text as={"h3" as any} size="lg" weight="semibold">
                      {tier.name}
                    </Text>
                    <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
                      {tier.analogy}
                    </Text>
                  </Box>
                  <Badge variant="secondary">{tier.name}</Badge>
                </Flex>

                <Box
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    background: 'var(--ds-color-bg-overlay)',
                    border: '1px solid var(--ds-color-border-secondary)',
                  }}
                >
                  <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                    {tier.description}
                  </Text>
                </Box>

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
                    Source path
                  </Text>
                  <Text
                    size="xs"
                    style={{
                      marginTop: 4,
                      color: 'var(--ds-color-text-muted)',
                      fontFamily: 'var(--ds-font-family-mono, monospace)',
                      lineHeight: 1.55,
                    }}
                  >
                    {tier.path}
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
                  <Text size="sm" style={{ marginTop: 4, color: 'var(--ds-color-text-secondary)' }}>
                    {tier.decisionRule}
                  </Text>
                  </Box>

                <Box
                  style={{
                    marginTop: 'auto',
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
                    Examples
                  </Text>
                  <Text size="xs" style={{ marginTop: 4, color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                    {tier.examples}
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: tokens.spacing[5],
          alignItems: 'start',
        }}
      >
        <Card style={{ padding: tokens.spacing[6] }}>
          <Stack spacing="md">
            <Text as={"h2" as any} size="lg" weight="semibold">
              Engine model
            </Text>
            <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
              Engines change implementation tone while preserving the consuming
              API. That stability is the reason the same shared system can serve
              different products without fragmentation.
            </Text>
            <Stack spacing="sm">
              {ENGINES.map((engine) => (
                <Box
                  key={engine.name}
                  style={{
                    padding: tokens.spacing[4],
                    borderRadius: tokens.borderRadius.lg,
                    background: 'var(--ds-color-bg-overlay)',
                    border: '1px solid var(--ds-color-border-secondary)',
                  }}
                >
                  <Flex align="center" justify="between" style={{ gap: 12 }}>
                    <Box>
                      <Text size="sm" weight="semibold">
                        {engine.name}
                      </Text>
                      <Text size="xs" style={{ marginTop: 4, color: 'var(--ds-color-text-secondary)' }}>
                        {engine.personality}
                      </Text>
                    </Box>
                    <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
                      {engine.foundation}
                    </Text>
                  </Flex>
                </Box>
              ))}
            </Stack>
            <CodeBlock
              title="Engine selection"
              language="tsx"
              code={`const Button = createEngineComponent({
  classic: ClassicButton,
  modern: ModernButton,
  rustic: RusticButton,
});

<DesignSystemProvider forceEngine="modern" tenantSlug="bithire">
  <Button variant="primary" />
</DesignSystemProvider>`}
            />
          </Stack>
        </Card>

        <Card style={{ padding: tokens.spacing[6] }}>
          <Stack spacing="md">
            <Text as={"h2" as any} size="lg" weight="semibold">
              Guardrails
            </Text>
            <DocsCompactList
              items={WARNINGS.map((warning) => ({
                title: warning,
                tone: 'warning',
              }))}
            />
          </Stack>
        </Card>
      </Box>

      <Card style={{ padding: tokens.spacing[6] }}>
        <Stack spacing="md">
          <Text as={"h2" as any} size="lg" weight="semibold">
            Ownership split
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: tokens.spacing[4],
            }}
          >
            {OWNERSHIP_RULES.map((section) => (
              <Box
                key={section.belongs}
                style={{
                  padding: tokens.spacing[4],
                  borderRadius: tokens.borderRadius.xl,
                  background:
                    section.tone === 'success'
                      ? 'var(--ds-color-success-bg)'
                      : 'var(--ds-color-warning-bg)',
                  border: `1px solid ${
                    section.tone === 'success'
                      ? 'var(--ds-color-success-border)'
                      : 'var(--ds-color-warning-border)'
                  }`,
                }}
              >
                <Text
                  size="sm"
                  weight="bold"
                  style={{ color: 'var(--ds-color-text-primary)' }}
                >
                  Belongs in {section.belongs}
                </Text>
                <Stack spacing={6} style={{ marginTop: tokens.spacing[3] }}>
                  {section.items.map((item) => (
                    <Box
                      key={item}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.38)',
                        border: '1px solid rgba(255,255,255,0.28)',
                      }}
                    >
                      <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                        {item}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
