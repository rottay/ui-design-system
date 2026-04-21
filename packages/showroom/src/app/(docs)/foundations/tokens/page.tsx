'use client';

import { ShowroomLink as Link } from '@/components/showroom-link';
import {
  DocsMetricTile,
  DocsPanel,
  SectionDivider,
} from '@/components/showroom-ui';
import {
  Badge,
  Box,
  Card,
  Flex,
  Stack,
  Text,
} from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import {
  BracesIcon,
  LayersIcon,
  SparklesIcon,
  ZapIcon,
} from '@rottay/design-system/icons';
import { CodeBlock } from '@/components/playground';
import { FoundationTopRail } from '../foundation-top-rail';
import { DocsCompactList, DocsSectionHeader } from '@/components/docs/editorial-chrome';

interface TokenCategory {
  title: string;
  href: string;
  badge: string;
  description: string;
  callout: string;
  preview: React.ReactNode;
}

function ColorSpectrumPreview() {
  return (
    <Stack spacing={6}>
      <Flex gap={4}>
        {[
          'var(--ds-color-primary-300)',
          'var(--ds-color-primary-500)',
          'var(--ds-color-primary-700)',
          'var(--ds-color-secondary-500)',
          'var(--ds-color-success-500)',
        ].map((color) => (
          <Box
            key={color}
            style={{
              flex: 1,
              height: 28,
              borderRadius: 999,
              background: color,
            }}
          />
        ))}
      </Flex>
      <Flex gap={8} style={{ flexWrap: 'wrap' }}>
        {[
          'Primary',
          'Secondary',
          'Semantic',
        ].map((label) => (
          <Badge key={label} variant="secondary">
            {label}
          </Badge>
        ))}
      </Flex>
    </Stack>
  );
}

function SpacingRhythmPreview() {
  return (
    <Stack spacing={4}>
      {[8, 16, 24, 40, 64].map((width, index) => (
        <Flex key={width} align="center" gap={8}>
          <Text
            size="xs"
            style={{
              width: 16,
              color: 'var(--ds-color-text-muted)',
              fontFamily: 'var(--ds-font-family-mono, monospace)',
            }}
          >
            {index + 1}
          </Text>
          <Box
            style={{
              width,
              height: 8,
              borderRadius: 999,
              background:
                index >= 3
                  ? 'var(--ds-color-primary-600)'
                  : 'var(--ds-color-primary-300)',
            }}
          />
        </Flex>
      ))}
    </Stack>
  );
}

function TypographySpecimenPreview() {
  return (
    <Stack spacing={2}>
      <Text
        size="2xl"
        weight="bold"
        style={{ letterSpacing: '-0.04em' }}
      >
        Display
      </Text>
      <Text size="lg" weight="semibold">
        Product language with hierarchy
      </Text>
      <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
        Body copy, labels, helpers, and mono diagnostics.
      </Text>
    </Stack>
  );
}

function RadiusPreview() {
  const tokens = useTokens();

  return (
    <Flex gap={8} align="end">
      {[
        tokens.borderRadius.sm,
        tokens.borderRadius.md,
        tokens.borderRadius.lg,
        tokens.borderRadius.full,
      ].map((radius, index) => (
        <Box
          key={`${radius}-${index}`}
          style={{
            width: 42 + index * 8,
            height: 32 + index * 8,
            borderRadius: radius,
            background: 'var(--ds-color-info-bg)',
            border: '1px solid var(--ds-color-info-border)',
          }}
        />
      ))}
    </Flex>
  );
}

function ShadowPreview() {
  const tokens = useTokens();

  return (
    <Flex gap={10} align="end">
      {(['sm', 'md', 'lg'] as const).map((step, index) => (
        <Box
          key={step}
          style={{
            width: 56,
            height: 48 + index * 8,
            borderRadius: tokens.borderRadius.lg,
            background: 'var(--ds-color-bg-primary)',
            boxShadow: tokens.shadows[step],
          }}
        />
      ))}
    </Flex>
  );
}

function MotionPreview() {
  return (
    <Box
      style={{
        position: 'relative',
        height: 52,
        borderRadius: 999,
        background:
          'linear-gradient(90deg, rgba(0,102,204,0.08), rgba(0,102,204,0.18))',
        overflow: 'hidden',
      }}
    >
      <Box
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          width: 32,
          height: 32,
          borderRadius: 12,
          background: 'var(--ds-color-primary-500)',
          animation: 'tokens-motion-preview 1.8s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes tokens-motion-preview {
          0%,
          100% {
            transform: translateX(0) scale(1);
          }
          50% {
            transform: translateX(72px) scale(1.05);
          }
        }
      `}</style>
    </Box>
  );
}

function SurfaceTreatmentsPreview() {
  return (
    <Flex gap={8} align="center">
      <Box
        style={{
          width: 54,
          height: 40,
          borderRadius: 14,
          background: 'var(--ds-color-bg-overlay)',
          backdropFilter: 'blur(14px)',
          border: '1px solid var(--ds-color-border-secondary)',
          boxShadow: 'var(--ds-shadow-md)',
        }}
      />
      <Box
        style={{
          width: 54,
          height: 40,
          borderRadius: 14,
          background:
            'linear-gradient(135deg, rgba(0,102,204,0.14), rgba(15,118,110,0.12))',
          border: '1px solid rgba(0,102,204,0.16)',
        }}
      />
    </Flex>
  );
}

export default function TokensPage() {
  const tokens = useTokens();

  const categories: TokenCategory[] = [
    {
      title: 'Colors',
      href: '/foundations/tokens/colors',
      badge: '7 scales',
      description:
        'Brand, neutral, and semantic scales that keep products recognizable while preserving legibility.',
      callout: 'From palette to semantic intent.',
      preview: <ColorSpectrumPreview />,
    },
    {
      title: 'Spacing',
      href: '/foundations/tokens/spacing',
      badge: '13 steps',
      description:
        'A rhythm scale that keeps lists, cards, forms, and dashboards aligned across densities.',
      callout: 'Whitespace behaves like infrastructure.',
      preview: <SpacingRhythmPreview />,
    },
    {
      title: 'Typography',
      href: '/foundations/tokens/typography',
      badge: 'Hierarchy',
      description:
        'Sizes, weights, line heights, and families for UI copy, headings, diagnostics, and data-heavy screens.',
      callout: 'Readable by default, expressive when needed.',
      preview: <TypographySpecimenPreview />,
    },
    {
      title: 'Radius',
      href: '/foundations/tokens/radius',
      badge: '6 levels',
      description:
        'Corner language that shifts product tone across Classic, Modern, and Rustic without changing APIs.',
      callout: 'A fast way to feel the engine.',
      preview: <RadiusPreview />,
    },
    {
      title: 'Shadows',
      href: '/foundations/tokens/shadows',
      badge: '4 elevations',
      description:
        'Elevation tokens that separate layers, reinforce state, and keep dense admin surfaces scannable.',
      callout: 'Depth with intent, not decoration.',
      preview: <ShadowPreview />,
    },
    {
      title: 'Motion',
      href: '/foundations/tokens/motion',
      badge: 'Timing profile',
      description:
        'Hover, transform, spring, and duration scales that give each engine its interaction cadence.',
      callout: 'Motion is personality plus feedback.',
      preview: <MotionPreview />,
    },
  ];

  const systemFacts = [
    {
      label: 'Runtime-ready',
      value: 'CSS variables',
      detail: 'Tokens resolve without rebuilding bundles.',
    },
    {
      label: 'Engine-aware',
      value: 'Classic / Modern / Rustic',
      detail: 'Radius, shadow, motion, and spacing can diverge safely.',
    },
    {
      label: 'Brandable',
      value: 'Tenant override chain',
      detail: 'Base -> engine -> vertical -> tenant.',
    },
  ];

  return (
    <Stack spacing="lg" fullWidth>
      <FoundationTopRail
        backHref="/foundations"
        backLabel="Foundations"
        badge="Token layer"
        title="Tokens"
        description="Tokens are the runtime contract that every primitive, pattern, and surface resolves before it renders. They keep visual language portable across engines and tenants."
        panels={[
          {
            title: 'Start here when',
            body: 'You need to trace why a screen feels inconsistent, too dense, too soft, or off-brand before changing components.',
            tone: 'accent',
          },
          {
            title: 'What these pages show',
            body: 'Raw values, production-facing previews, and the authoring rules that keep tokens semantic instead of ad hoc.',
          },
          {
            title: 'Resolution pipeline',
            body: 'Base primitives -> engine accents -> tenant overrides.',
            tone: 'dark',
          },
        ]}
        links={categories.map((category) => ({ label: category.title, href: category.href }))}
        stats={[
          { label: 'Detail pages', value: `${categories.length}`, detail: 'Each token family has its own route' },
          { label: 'Runtime model', value: 'CSS variables', detail: 'No rebuild required' },
          { label: 'Engine-aware', value: '3 personalities', detail: 'Classic, Modern, Rustic' },
          { label: 'Brandable', value: 'Tenant chain', detail: 'Base -> engine -> vertical -> tenant' },
        ]}
      />

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: tokens.spacing[4],
          width: '100%',
        }}
      >
        <DocsPanel
          title="Token system facts"
          description="A compact read on the runtime properties that make tokens portable across engines, tenants, and page types."
          actions={<Badge variant="secondary">Authoring baseline</Badge>}
          tone="accent"
          style={{ width: '100%' }}
        >
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: tokens.spacing[4],
            }}
          >
            {systemFacts.map((fact, index) => (
              <DocsMetricTile
                key={fact.label}
                label={fact.label}
                value={fact.value}
                detail={fact.detail}
                tone={index === 0 ? 'accent' : index === 2 ? 'success' : 'default'}
              />
            ))}
          </Box>
        </DocsPanel>

        <DocsPanel
          eyebrow={
            <Flex align="center" gap={8}>
              <LayersIcon size={18} />
              <Text size="sm" weight="semibold">
                Token access
              </Text>
            </Flex>
          }
          actions={<Badge variant="secondary">Live model</Badge>}
          title="Read the token chain in runtime order"
          description="The fastest way to diagnose drift is to read tokens in the same order the UI resolves them: base primitives, engine accents, then tenant overrides."
          tone="accent"
          style={{
            width: '100%',
            background:
              'linear-gradient(180deg, var(--ds-color-bg-primary), var(--ds-color-bg-elevated))',
            border: '1px solid var(--ds-color-border-secondary)',
            boxShadow: tokens.shadows.lg,
          }}
        >
          <Stack spacing="md" fullWidth>
            <Stack spacing={8}>
              {[
                {
                  icon: <BracesIcon size={14} />,
                  label: 'Base primitives',
                  detail: 'Core scales and neutral defaults.',
                },
                {
                  icon: <SparklesIcon size={14} />,
                  label: 'Engine accents',
                  detail: 'Radius, shadows, motion, density.',
                },
                {
                  icon: <ZapIcon size={14} />,
                  label: 'Tenant overrides',
                  detail: 'Brand and vertical-specific values.',
                },
              ].map((step, index) => (
                <Box
                  key={step.label}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 14,
                    border: '1px solid var(--ds-color-border-secondary)',
                    background:
                      index === 0
                        ? 'linear-gradient(180deg, var(--ds-color-bg-overlay), var(--ds-color-bg-primary))'
                        : 'var(--ds-color-bg-overlay)',
                  }}
                >
                  <Flex align="center" gap={12}>
                    <Box
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 12,
                        background:
                          index === 0
                            ? 'var(--ds-color-bg-overlay)'
                            : index === 1
                              ? 'var(--ds-color-info-bg)'
                              : 'var(--ds-color-success-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--ds-color-text-primary)',
                        flexShrink: 0,
                        border: '1px solid var(--ds-color-border-secondary)',
                      }}
                    >
                      {step.icon}
                    </Box>
                    <Box style={{ minWidth: 0 }}>
                      <Text size="sm" weight="semibold">
                        {step.label}
                      </Text>
                      <Text
                        size="xs"
                        style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}
                      >
                        {step.detail}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              ))}
            </Stack>

            <SectionDivider style={{ background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)' }} />

            <CodeBlock
              title="Token access"
              language="tsx"
              code={`const tokens = useTokens();

tokens.spacing[4];
tokens.colors.primaryScale[500];
tokens.borderRadius.md;
tokens.motion.hover;`}
            />
          </Stack>
        </DocsPanel>
      </Box>

      <Stack spacing="md">
        <DocsSectionHeader
          eyebrow="Token catalog"
          title="Token families"
          description="Each detail page shows both raw values and how those tokens change the feel of production UI."
          actions={<Badge variant="secondary">{categories.length} detail pages</Badge>}
          tone="accent"
        />

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: tokens.spacing[5],
          }}
        >
          {categories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              style={{ textDecoration: 'none' }}
            >
              <Card
                hoverable
                style={{
                  height: '100%',
                  padding: tokens.spacing[5],
                  cursor: 'pointer',
                  background:
                    'linear-gradient(180deg, var(--ds-color-bg-elevated), var(--ds-color-bg-primary))',
                  border: '1px solid var(--ds-color-border-secondary)',
                }}
              >
                <Stack spacing="md" style={{ height: '100%' }}>
                  <Flex align="center" justify="between" style={{ gap: 12, flexWrap: 'wrap' }}>
                    <Text as={"h3" as any} size="lg" weight="semibold">
                      {category.title}
                    </Text>
                    <Badge>{category.badge}</Badge>
                  </Flex>
                  <Box
                    style={{
                      minHeight: 112,
                      padding: tokens.spacing[4],
                      borderRadius: tokens.borderRadius.lg,
                      background: 'var(--ds-color-bg-overlay)',
                      border: '1px solid var(--ds-color-border-secondary)',
                    }}
                  >
                    {category.preview}
                  </Box>
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
                        size="sm"
                        style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}
                      >
                        {category.description}
                      </Text>
                      <Box
                        style={{
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
                          Read for
                        </Text>
                        <Text
                          size="xs"
                          weight="semibold"
                          style={{ marginTop: 6, color: 'var(--ds-color-link)' }}
                        >
                          {category.callout}
                        </Text>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Card>
            </Link>
          ))}
        </Box>
      </Stack>

      <DocsPanel
        eyebrow="Inline topic"
        title="Glass and surface treatments live inside the token story"
        description="The previous page promised a dedicated Glass detail page that does not exist. Surface chemistry is documented here instead as part of theme and token composition: blur, translucency, gradients, hairline borders, and layered shadows."
        actions={<Badge variant="secondary">No separate route</Badge>}
        tone="warning"
        style={{
          background:
            'linear-gradient(180deg, var(--ds-color-bg-secondary), var(--ds-color-bg-surface))',
          border: '1px solid var(--ds-color-border-secondary)',
        }}
      >
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: tokens.spacing[5],
            alignItems: 'center',
          }}
        >
          <Stack spacing="md">
            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              {[
                'Glass overlays',
                'Gradient accents',
                'Frosted chrome',
                'Hairline borders',
              ].map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
            </Flex>
          </Stack>

          <Box
            style={{
              padding: tokens.spacing[5],
              borderRadius: tokens.borderRadius.xl,
              background: 'var(--ds-color-bg-overlay)',
              border: '1px solid var(--ds-color-border-secondary)',
              boxShadow: tokens.shadows.md,
            }}
          >
            <Stack spacing="md">
              <SurfaceTreatmentsPreview />
              <Box
                style={{
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.lg,
                  background: 'var(--ds-color-bg-primary)',
                  border: '1px solid var(--ds-color-border-secondary)',
                }}
              >
                <Text size="sm" weight="semibold">
                  Best used for premium framing, not every default surface.
                </Text>
              </Box>
              <Text
                size="xs"
                style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}
              >
                Keep dense data workflows crisp. Spend visual atmosphere on
                heroes, overlays, and story moments.
              </Text>
            </Stack>
          </Box>
        </Box>
      </DocsPanel>

      <Stack spacing="md">
        <DocsSectionHeader
          eyebrow="Authoring rules"
          title="Implementation contract"
          description="These are the habits that keep token docs useful in production instead of turning them into static palette references."
          actions={<Badge variant="secondary">Authoring rules</Badge>}
          tone="success"
        />
        <DocsPanel
          tone="success"
          style={{ padding: tokens.spacing[5] }}
        >
          <DocsCompactList
            items={[
              {
                title: 'Read from context',
                detail:
                  'Reach for useTokens() or CSS custom properties before inventing local values.',
                tone: 'accent',
              },
              {
                title: 'Stay semantic',
                detail:
                  'Prefer semantic aliases for text, feedback, and state instead of raw palette picks.',
              },
              {
                title: 'Let engines differ',
                detail:
                  'Radius, shadow, and motion should change per engine without forcing component API changes.',
              },
              {
                title: 'Brand at the edge',
                detail:
                  'Tenant overrides should personalize the experience while preserving core accessibility and spacing logic.',
              },
            ]}
          />
        </DocsPanel>
      </Stack>

    </Stack>
  );
}
