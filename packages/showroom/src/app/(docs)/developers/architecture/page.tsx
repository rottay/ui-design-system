'use client';

import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import { ArrowLeftIcon } from '@rottay/design-system/icons';
import { CodeBlock } from '@/components/playground';

const TIERS = [
  {
    name: 'Primitives',
    path: 'packages/core/src/components/primitives/',
    analogy: 'A brick',
    description:
      'Engine-switched leaf components. Each primitive has 4 engine implementations (classic, modern, rustic, custom) selected at runtime via createEngineComponent(). They solve local UI behavior and styling, not page-level tasks.',
    categories: ['Display (20)', 'Inputs (26)', 'Feedback (12)', 'Layout (17)', 'Navigation (18)', 'Overlay (13)'],
    examples: 'Button, Input, Card, Modal, Tabs, Badge, Text, Box, Flex, Stack',
    decisionRule: 'Is it a leaf component with an engine switch?',
  },
  {
    name: 'Patterns',
    path: 'packages/core/src/components/patterns/',
    analogy: 'A reusable machine made of bricks',
    description:
      'Engine-agnostic, task-level compositions that solve generic UI tasks. They package common interaction logic so apps do not rewrite the same task flow. Patterns should not know what screen they are in.',
    categories: ['Data', 'Forms', 'Visualization', 'Communication', 'Workflow', 'Navigation', 'Misc'],
    examples: 'PatternDataTable, PatternFormBuilder, PatternKanbanBoard, PatternStatsGrid',
    decisionRule: 'Does it solve a repeatable task involving multiple components?',
  },
  {
    name: 'Structures',
    path: 'packages/core/src/components/structures/',
    analogy: 'The frame around the machine on a page',
    description:
      'Page-structure families that wrap or accompany patterns to form page chrome. Think headers, toolbars, command bars, record panels. They define surrounding screen chrome, not the whole page.',
    categories: ['Headers', 'Workspace', 'Record', 'Dashboard', 'Feedback'],
    examples: 'CollectionHeader, SearchCommandBar, TableToolbar, RecordFieldGrid',
    decisionRule: 'Does it organize a page around a task widget?',
  },
  {
    name: 'Surfaces',
    path: 'packages/core/src/components/surfaces/',
    analogy: 'The whole room layout',
    description:
      'Declarative page-level recipes. They compose patterns + structures + primitives into a full screen contract. The app passes a configuration object; the surface handles composition.',
    categories: ['Foundation (types, builders)', 'Layout (shell, header, sidebar)', 'Pages (6 domain groups)'],
    examples: 'ListSurface, DashboardSurface, FormSurface, CollectionWorkspaceSurface',
    decisionRule: 'Does it describe a whole page as a config object?',
  },
];

const ENGINES = [
  {
    name: 'Classic',
    foundation: 'Ant Design 5.21',
    personality: 'Corporate, structured, enterprise-grade. Sharp corners, subtle shadows, professional typography.',
    characteristics: ['Sharp border radius', 'Corporate shadows', 'Dense spacing', 'Enterprise feel'],
  },
  {
    name: 'Modern',
    foundation: 'Tailwind / DaisyUI',
    personality: 'Clean, rounded, contemporary. Bold shadows, generous spacing, smooth transitions.',
    characteristics: ['Rounded corners', 'Bold shadows', 'Generous spacing', 'Smooth motion'],
  },
  {
    name: 'Rustic',
    foundation: 'Vanilla CSS',
    personality: 'Minimal, elegant, understated. Whisper-thin shadows, flat borders, quiet aesthetics.',
    characteristics: ['Minimal radius', 'Whisper shadows', 'Flat design', 'Quiet aesthetics'],
  },
  {
    name: 'Custom',
    foundation: 'Pluggable component pack',
    personality: 'Reserved for white-label tenants. Runtime-registered component overrides.',
    characteristics: ['Tenant-defined', 'Pluggable', 'Runtime registration', 'Full override'],
  },
];

const OWNERSHIP_RULES = [
  {
    belongs: 'Design System',
    items: [
      'Generic UI building blocks (primitives)',
      'Reusable task widgets (patterns)',
      'Page-structure chrome (structures)',
      'Declarative screen recipes (surfaces)',
      'Theme/engine/tenant-aware visual customization',
      'Icon catalog and chart system',
    ],
  },
  {
    belongs: 'Consuming App',
    items: [
      'Domain-specific labels, business rules, and workflows',
      'Route-specific fetch logic',
      'Module-specific permissions and policy decisions',
      'Entity mapping from API/domain to DS configs',
      'Product copy and product semantics',
      'Tenant/company/user/candidate/event-specific logic',
    ],
  },
];

export default function ArchitecturePage() {
  const tokens = useTokens();

  return (
    <Stack spacing="lg">
      {/* Back link */}
      <Link
        href="/developers"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.875rem',
          color: 'var(--ds-color-primary-500)',
          textDecoration: 'none',
        }}
      >
        <ArrowLeftIcon size={14} /> Back to Developers
      </Link>

      {/* Page header */}
      <Box>
        <Text as={"h1" as any} size="2xl" weight="bold">
          Architecture
        </Text>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            A deep dive into the 4-tier component model, the engine system,
            tenant branding, and the ownership model that governs what belongs
            in the design system versus what stays in consuming apps.
          </Text>
        </Box>
      </Box>

      {/* 4-tier model */}
      <Card>
        <Stack spacing="md">
          <Text as={"h2" as any} size="xl" weight="bold">
            4-Tier Component Model
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            The design system organizes all components into four tiers under
            packages/core/src/components/. Each tier has a clear responsibility
            and a decision rule for what belongs there.
          </Text>
        </Stack>
      </Card>

      {/* Tier cards */}
      {TIERS.map((tier, index) => (
        <Card key={tier.name}>
          <Stack spacing="md">
            {/* Tier header */}
            <Flex align="center" gap={12}>
              <Box
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--ds-color-primary-500)',
                  color: 'var(--ds-color-text-inverse, #ffffff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                }}
              >
                {index + 1}
              </Box>
              <Box>
                <Flex align="center" gap={8}>
                  <Text as={"h3" as any} size="lg" weight="bold">
                    {tier.name}
                  </Text>
                  <Badge variant="primary">{tier.analogy}</Badge>
                </Flex>
                <Text
                  size="xs"
                  style={{
                    fontFamily: 'var(--ds-font-mono, monospace)',
                    color: 'var(--ds-color-text-muted)',
                    marginTop: 2,
                  }}
                >
                  {tier.path}
                </Text>
              </Box>
            </Flex>

            {/* Description */}
            <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
              {tier.description}
            </Text>

            {/* Categories */}
            <Box>
              <Text
                size="xs"
                weight="semibold"
                style={{ color: 'var(--ds-color-text-muted)', marginBottom: tokens.spacing[2] }}
              >
                Categories
              </Text>
              <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                {tier.categories.map((cat) => (
                  <Badge key={cat}>{cat}</Badge>
                ))}
              </Flex>
            </Box>

            {/* Examples */}
            <Box>
              <Text
                size="xs"
                weight="semibold"
                style={{ color: 'var(--ds-color-text-muted)', marginBottom: tokens.spacing[1] }}
              >
                Examples
              </Text>
              <Text
                size="sm"
                style={{
                  fontFamily: 'var(--ds-font-mono, monospace)',
                  color: 'var(--ds-color-text-secondary)',
                }}
              >
                {tier.examples}
              </Text>
            </Box>

            {/* Decision rule */}
            <Box
              style={{
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                background: 'var(--ds-color-primary-50)',
                border: '1px solid var(--ds-color-primary-200)',
              }}
            >
              <Text size="xs" weight="semibold" style={{ color: 'var(--ds-color-primary-700)' }}>
                Decision rule
              </Text>
              <Text size="sm" style={{ color: 'var(--ds-color-primary-700)', marginTop: 2 }}>
                {tier.decisionRule}
              </Text>
            </Box>
          </Stack>
        </Card>
      ))}

      {/* Engines */}
      <Card>
        <Stack spacing="md">
          <Text as={"h2" as any} size="xl" weight="bold">
            Engines
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            The DS ships three rendering engines plus a reserved custom engine.
            Each engine wraps a different CSS foundation and produces distinct
            visual output from the same component API. Engine selection happens
            via createEngineComponent() at runtime.
          </Text>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: tokens.spacing[4],
            }}
          >
            {ENGINES.map((engine) => (
              <Box
                key={engine.name}
                style={{
                  padding: tokens.spacing[4],
                  borderRadius: tokens.borderRadius.md,
                  background: 'var(--ds-color-neutral-50)',
                  border: '1px solid var(--ds-color-neutral-200)',
                }}
              >
                <Stack spacing="sm">
                  <Flex align="center" justify="between">
                    <Text size="sm" weight="bold">{engine.name}</Text>
                    <Text
                      size="xs"
                      style={{
                        fontFamily: 'var(--ds-font-mono, monospace)',
                        color: 'var(--ds-color-text-muted)',
                      }}
                    >
                      {engine.foundation}
                    </Text>
                  </Flex>
                  <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
                    {engine.personality}
                  </Text>
                  <Flex gap={4} style={{ flexWrap: 'wrap' }}>
                    {engine.characteristics.map((c) => (
                      <Box
                        key={c}
                        style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'var(--ds-color-neutral-100)',
                          fontSize: '0.7rem',
                          color: 'var(--ds-color-text-secondary)',
                        }}
                      >
                        {c}
                      </Box>
                    ))}
                  </Flex>
                </Stack>
              </Box>
            ))}
          </Box>

          <CodeBlock
            title="Engine selection"
            language="tsx"
            code={`// createEngineComponent reads the active engine from context
// and renders the correct implementation at runtime
import { createEngineComponent } from '@rottay/design-system';

const Button = createEngineComponent({
  classic: ClassicButton,
  modern: ModernButton,
  rustic: RusticButton,
  custom: CustomButton,
});

// Usage -- engine is resolved automatically from the provider
<Button variant="primary">Click me</Button>`}
          />
        </Stack>
      </Card>

      {/* Tenant branding */}
      <Card>
        <Stack spacing="md">
          <Text as={"h2" as any} size="xl" weight="bold">
            Tenant Branding
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Each tenant can define a BrandTheme that controls approximately 140
            CSS custom properties. The theme system uses a layered merge chain
            where each layer can override values from the previous one.
          </Text>

          {/* Merge chain */}
          <Box>
            <Text
              size="xs"
              weight="semibold"
              style={{ color: 'var(--ds-color-text-muted)', marginBottom: tokens.spacing[2] }}
            >
              Merge Chain
            </Text>
            <Stack spacing="xs">
              {[
                { label: 'DS base', desc: 'Default token values for all CSS variables' },
                { label: 'Engine overrides', desc: 'borderRadius, shadows, surface, motion per engine' },
                { label: 'Vertical baseline', desc: 'Platform/BitHire/Evnto preset overrides' },
                { label: 'BrandTheme', desc: 'Tenant-specific customization (~140 CSS variables)' },
              ].map((item, i) => (
                <Flex key={i} align="center" gap={12}>
                  <Box
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'var(--ds-color-primary-100)',
                      color: 'var(--ds-color-primary-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '0.65rem',
                      fontWeight: 600,
                    }}
                  >
                    {i + 1}
                  </Box>
                  <Box>
                    <Text size="sm" weight="medium">{item.label}</Text>
                    <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>{item.desc}</Text>
                  </Box>
                </Flex>
              ))}
            </Stack>
          </Box>

          <CodeBlock
            title="CSS variable pattern"
            language="tsx"
            code={`// Components read component-specific CSS vars with generic fallback
// This enables per-component customization via BrandTheme

background: 'var(--ds-button-primary-bg, var(--ds-color-primary))'
border: 'var(--ds-input-border, var(--ds-color-border))'
color: 'var(--ds-card-title-color, var(--ds-color-text-primary))'

// When the component-specific var is not set,
// the generic token is used automatically`}
          />
        </Stack>
      </Card>

      {/* Ownership model */}
      <Card>
        <Stack spacing="md">
          <Text as={"h2" as any} size="xl" weight="bold">
            Ownership Model
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            The core rule: capability is shared, form is specialized. Before
            adding a new component, ask: &quot;Could another app use this without
            knowing what a tenant, candidate, role, company, interview, or event
            is?&quot; If yes, it belongs in the DS. If no, it belongs in the app.
          </Text>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: tokens.spacing[4],
            }}
          >
            {OWNERSHIP_RULES.map((section) => (
              <Box
                key={section.belongs}
                style={{
                  padding: tokens.spacing[4],
                  borderRadius: tokens.borderRadius.md,
                  background: section.belongs === 'Design System'
                    ? 'var(--ds-color-success-50)'
                    : 'var(--ds-color-warning-50)',
                  border: `1px solid ${
                    section.belongs === 'Design System'
                      ? 'var(--ds-color-success-200)'
                      : 'var(--ds-color-warning-200)'
                  }`,
                }}
              >
                <Text
                  size="sm"
                  weight="bold"
                  style={{
                    color: section.belongs === 'Design System'
                      ? 'var(--ds-color-success-700)'
                      : 'var(--ds-color-warning-700)',
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  Belongs in {section.belongs}
                </Text>
                <Stack spacing={4}>
                  {section.items.map((item, i) => (
                    <Flex key={i} align="baseline" gap={8}>
                      <Text
                        size="xs"
                        style={{
                          color: section.belongs === 'Design System'
                            ? 'var(--ds-color-success-500)'
                            : 'var(--ds-color-warning-500)',
                        }}
                      >
                        -
                      </Text>
                      <Text
                        size="xs"
                        style={{
                          color: section.belongs === 'Design System'
                            ? 'var(--ds-color-success-700)'
                            : 'var(--ds-color-warning-700)',
                        }}
                      >
                        {item}
                      </Text>
                    </Flex>
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
        </Stack>
      </Card>

      {/* Anti-patterns */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            Anti-Patterns to Avoid
          </Text>
          <Stack spacing="xs">
            {[
              'Do not duplicate the same task widget per app if the behavior is the same',
              'Do not move page chrome into patterns/ if it mainly organizes a screen',
              'Do not move full route/page business logic into surfaces/',
              'Do not promote product-specific components into the DS just because they are used twice',
              'Prefer customizing with config, slots, or structures before creating app-specific rewrites',
            ].map((item, i) => (
              <Flex key={i} align="baseline" gap={8}>
                <Text size="sm" style={{ color: 'var(--ds-color-error-500)' }}>-</Text>
                <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>{item}</Text>
              </Flex>
            ))}
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
