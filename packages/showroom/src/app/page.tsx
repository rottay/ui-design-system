import type { CSSProperties, ElementType, ReactNode } from 'react';
import type { Metadata } from 'next';
import { ShowroomLink as Link } from '@/components/showroom-link';
import {
  ArrowUpRight,
  Blocks,
  Braces,
  Layers3,
  PartyPopper,
  ShieldCheck,
  Waypoints,
  Workflow,
} from 'lucide-react';
import {
  ArrowRightIcon,
  BriefcaseIcon,
  Building2Icon,
  ChevronRightIcon,
} from '@rottay/design-system/icons';
import { charts } from '@/data/registry/charts';
import { icons } from '@/data/registry/icons';
import { patterns } from '@/data/registry/patterns';
import { primitives } from '@/data/registry/primitives';
import { structures } from '@/data/registry/structures';
import { surfaces } from '@/data/registry/surfaces';
import { Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { LandingRuntimePanel } from './landing-runtime-panel';

export const metadata: Metadata = {
  title: 'Rottay Design System',
  description:
    'Presentation entry for the Rottay Design System with direct routes into foundations, architecture, playground tooling, and the component catalog.',
};

const catalogTotal =
  primitives.length +
  patterns.length +
  structures.length +
  surfaces.length +
  charts.length +
  icons.length;

const heroMetrics = [
  {
    value: `${catalogTotal}`,
    label: 'Catalog entries',
    detail: 'Coverage across components, charts, icons, and full-page recipes.',
  },
  {
    value: '3',
    label: 'Engines',
    detail: 'Classic, Modern, and Rustic render the same component contract.',
  },
  {
    value: '3',
    label: 'Verticals',
    detail: 'Platform, BitHire, and Evnto keep distinct voices without forks.',
  },
  {
    value: '4',
    label: 'Architecture tiers',
    detail: 'Primitives, patterns, structures, and surfaces keep the catalog legible.',
  },
] as const;

const proofCards = [
  {
    label: 'Story lens',
    title: 'Overview before inventory',
    detail:
      'The front door should explain the system shape before the catalog depth takes over.',
  },
  {
    label: 'Runtime lens',
    title: 'Runtime is explained, not reenacted',
    detail:
      'The landing stays visually stable while playground, foundations, and live docs prove real tenant and engine switching.',
  },
  {
    label: 'Handoff lens',
    title: 'Routes stay obvious',
    detail:
      'Foundations, architecture, playground, and catalog stay one click away from the hero.',
  },
] as const;

const tierCards: Array<{
  name: string;
  count: number;
  description: string;
  examples: string;
  href: string;
  icon: ElementType;
}> = [
  {
    name: 'Primitives',
    count: primitives.length,
    description: 'Leaf components with stable APIs and engine-specific rendering.',
    examples: 'Button, Input, Card, Modal, Tabs, Badge, Text.',
    href: '/primitives',
    icon: Layers3,
  },
  {
    name: 'Patterns',
    count: patterns.length,
    description: 'Reusable task modules that package repeatable workflows.',
    examples: 'Data tables, form builders, kanban boards, stats panels.',
    href: '/patterns',
    icon: Workflow,
  },
  {
    name: 'Structures',
    count: structures.length,
    description: 'Screen chrome and layout context around reusable work.',
    examples: 'Headers, command bars, record frames, dashboard scaffolds.',
    href: '/structures',
    icon: Waypoints,
  },
  {
    name: 'Surfaces',
    count: surfaces.length,
    description: 'Declarative page recipes that compose the system into a screen.',
    examples: 'ListSurface, DashboardSurface, FormSurface, workspace shells.',
    href: '/surfaces',
    icon: Braces,
  },
];

const engineCards: Array<{
  name: string;
  foundation: string;
  personality: string;
  summary: string;
  traits: string[];
}> = [
  {
    name: 'Classic',
    foundation: 'Ant Design 5.21',
    personality: 'Structured, precise, enterprise-grade.',
    summary:
      'Best when the product needs disciplined density, professional chrome, and back-office confidence.',
    traits: ['Tighter radius', 'Measured motion', 'Corporate depth'],
  },
  {
    name: 'Modern',
    foundation: 'Tailwind / DaisyUI',
    personality: 'Rounded, spacious, contemporary.',
    summary:
      'Generous rhythm and softer silhouettes turn the same contract into a friendlier product posture.',
    traits: ['Soft corners', 'Expressive depth', 'SaaS-ready feel'],
  },
  {
    name: 'Rustic',
    foundation: 'Vanilla CSS',
    personality: 'Quiet, elegant, intentionally minimal.',
    summary:
      'Lower visual noise and whisper-light shadows keep the product feeling premium without extra chrome.',
    traits: ['Minimal radius', 'Whisper shadows', 'Low-noise UI'],
  },
];

const verticalCards: Array<{
  name: string;
  theme: string;
  engine: string;
  description: string;
  modules: string[];
  icon: ElementType;
  href: string;
}> = [
  {
    name: 'Platform',
    theme: 'Rottay',
    engine: 'Classic engine',
    description:
      'Admin operations for tenants, billing, configuration, and compliance with denser enterprise ergonomics.',
    modules: ['Tenancy', 'Billing', 'Operations'],
    icon: Building2Icon,
    href: '/verticals/platform',
  },
  {
    name: 'BitHire',
    theme: 'BitHire',
    engine: 'Modern engine',
    description:
      'Recruiter dashboards, pipelines, and scorecards with clearer hierarchy and a friendlier SaaS cadence.',
    modules: ['Pipelines', 'Scorecards', 'Hiring flows'],
    icon: BriefcaseIcon,
    href: '/verticals/bithire',
  },
  {
    name: 'Evnto',
    theme: 'Evnto',
    engine: 'Modern engine',
    description:
      'Venue, ticketing, and attendee operations that need more energy, richer color, and event-oriented surfaces.',
    modules: ['Ticketing', 'Venues', 'Engagement'],
    icon: PartyPopper,
    href: '/verticals/evnto',
  },
];

const ownershipColumns = [
  {
    title: 'Belongs in the design system',
    icon: ShieldCheck,
    items: [
      'Shared UI primitives and task-level patterns',
      'Page chrome and full-screen surface recipes',
      'Engine, theme, and token-driven visual behavior',
      'Cross-product charts, icons, and interaction rules',
    ],
  },
  {
    title: 'Stays in consuming products',
    icon: Blocks,
    items: [
      'Business rules, permissions, and domain decisions',
      'Route-specific data fetching and orchestration',
      'Product copy, semantics, and workflow exceptions',
      'Entity-specific mapping from APIs into DS contracts',
    ],
  },
] as const;

const routeCards = [
  {
    label: 'Foundations',
    href: '/foundations',
    description: 'Tokens, engines, themes, and the runtime baseline.',
  },
  {
    label: 'Architecture',
    href: '/developers/architecture',
    description: 'Ownership model, tiers, and integration guidance.',
  },
  {
    label: 'Playground',
    href: '/playground',
    description: 'Live engine and tenant comparison on the real showroom runtime.',
  },
  {
    label: 'Catalog',
    href: '/primitives',
    description: 'Primitives, patterns, structures, and surfaces.',
  },
] as const;

const heroLinkCards = [
  { label: 'Foundations', href: '/foundations' },
  { label: 'Architecture', href: '/developers/architecture' },
  { label: 'Playground', href: '/playground' },
  { label: 'Catalog', href: '/primitives' },
] as const;

const landingTheme: CSSProperties = {
  ['--landing-canvas' as string]: '#f3ede3',
  ['--landing-canvas-strong' as string]: '#ebe2d4',
  ['--landing-surface' as string]: '#fffdfa',
  ['--landing-surface-strong' as string]: '#f7f1e8',
  ['--landing-panel' as string]: '#f3ece2',
  ['--landing-panel-strong' as string]: '#ede2d3',
  ['--landing-border' as string]: 'rgba(36, 30, 24, 0.12)',
  ['--landing-border-strong' as string]: 'rgba(36, 30, 24, 0.18)',
  ['--landing-ink' as string]: '#18130f',
  ['--landing-muted' as string]: '#5f5549',
  ['--landing-subtle' as string]: '#85796c',
  ['--landing-link' as string]: '#2f271f',
  ['--landing-shadow-sm' as string]: '0 16px 36px rgba(27, 22, 17, 0.08)',
  ['--landing-shadow-md' as string]: '0 18px 44px rgba(27, 22, 17, 0.10)',
  ['--landing-shadow-lg' as string]: '0 24px 58px rgba(27, 22, 17, 0.12)',
};

const border = '1px solid var(--landing-border, rgba(36, 30, 24, 0.12))';
const borderStrong = '1px solid var(--landing-border-strong, rgba(36, 30, 24, 0.18))';

function LandingBadge({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: 'default' | 'strong';
}) {
  const isStrong = tone === 'strong';

  return (
    <Box
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 30,
        padding: '6px 12px',
        borderRadius: 999,
        border: isStrong ? '1px solid rgba(255, 255, 255, 0.12)' : border,
        background: isStrong ? 'rgba(24, 19, 15, 0.92)' : 'rgba(255, 255, 255, 0.72)',
        color: isStrong ? '#fffaf5' : 'var(--landing-ink, #18130f)',
        boxShadow: isStrong ? '0 10px 24px rgba(27, 22, 17, 0.10)' : 'none',
        backdropFilter: 'blur(14px)',
      }}
    >
      <Text
        as={"span" as any}
        size="xs"
        weight="semibold"
        style={{ display: 'block', color: 'inherit', letterSpacing: '0.02em' }}
      >
        {children}
      </Text>
    </Box>
  );
}

function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <Stack spacing={8} style={{ maxWidth: 800 }}>
      <Text
        size="xs"
        weight="semibold"
        style={{
          color: 'var(--landing-subtle, #85796c)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {eyebrow}
      </Text>
      <Text
        as={"h2" as any}
        size="xl"
        weight="bold"
        style={{ color: 'var(--landing-ink, #18130f)', letterSpacing: '-0.04em' }}
      >
        {title}
      </Text>
      <Text
        size="sm"
        style={{ color: 'var(--landing-muted, #5f5549)', lineHeight: 1.6 }}
      >
        {body}
      </Text>
    </Stack>
  );
}

function StatTile({
  value,
  label,
  detail,
}: {
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <Box
      style={{
        padding: 16,
        borderRadius: 20,
        border,
        background:
          'linear-gradient(180deg, rgba(255, 255, 255, 0.78) 0%, var(--landing-surface, #fffdfa) 100%)',
        boxShadow: 'var(--landing-shadow-sm, 0 16px 36px rgba(27, 22, 17, 0.08))',
      }}
    >
      <Stack spacing={6}>
        <Text
          size="xs"
          weight="semibold"
          style={{
            color: 'var(--landing-subtle, #85796c)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {label}
        </Text>
        <Text
          size={value.length > 8 ? 'sm' : 'lg'}
          weight="bold"
          style={{ color: 'var(--landing-ink, #18130f)', lineHeight: 1.15 }}
        >
          {value}
        </Text>
        <Text
          size="xs"
          style={{ color: 'var(--landing-muted, #5f5549)', lineHeight: 1.55 }}
        >
          {detail}
        </Text>
      </Stack>
    </Box>
  );
}

function PillLink({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        borderRadius: 999,
        textDecoration: 'none',
        fontWeight: 600,
        color: primary ? '#fffaf5' : 'var(--landing-ink, #18130f)',
        background: primary ? 'rgba(24, 19, 15, 0.92)' : 'rgba(255, 255, 255, 0.72)',
        border: primary ? '1px solid rgba(255, 255, 255, 0.12)' : border,
        boxShadow: primary
          ? '0 12px 28px rgba(27, 22, 17, 0.14)'
          : '0 8px 18px rgba(27, 22, 17, 0.04)',
        backdropFilter: 'blur(14px)',
      }}
    >
      {children}
    </Link>
  );
}

export default function HomePage() {
  return (
    <main
      style={{
        ...landingTheme,
        minHeight: '100vh',
        color: 'var(--landing-ink, #18130f)',
        background:
          'radial-gradient(circle at top left, rgba(201, 185, 163, 0.24), transparent 28%), radial-gradient(circle at 92% 8%, rgba(82, 67, 52, 0.10), transparent 22%), linear-gradient(180deg, var(--landing-canvas, #f3ede3) 0%, var(--landing-canvas-strong, #ebe2d4) 100%)',
        padding: 'clamp(20px, 3vw, 36px)',
      }}
    >
      <Box style={{ maxWidth: 1440, margin: '0 auto' }}>
        <Stack spacing="xl">
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                textDecoration: 'none',
                color: 'var(--landing-ink, #18130f)',
              }}
            >
              <Box
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #18130f 0%, #41362c 100%)',
                  color: '#fffaf5',
                  fontWeight: 800,
                  boxShadow: '0 12px 24px rgba(27, 22, 17, 0.18)',
                }}
              >
                R
              </Box>
              <Box>
                <Text size="sm" weight="bold" style={{ color: 'var(--landing-ink, #18130f)' }}>
                  Rottay Design System
                </Text>
                <Text size="xs" style={{ color: 'var(--landing-muted, #5f5549)' }}>
                  Presentation entry with a clean handoff into docs
                </Text>
              </Box>
            </Link>

            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              {heroLinkCards.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    borderRadius: 999,
                    textDecoration: 'none',
                    border,
                    background: 'rgba(255, 255, 255, 0.66)',
                    color: 'var(--landing-ink, #18130f)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  {item.label}
                  <ArrowUpRight size={14} />
                </Link>
              ))}
            </Flex>
          </Box>

          <Card
            style={{
              padding: 'clamp(22px, 4vw, 34px)',
              borderRadius: 32,
              border,
              background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.84) 0%, var(--landing-surface, #fffdfa) 100%)',
              boxShadow: 'var(--landing-shadow-lg, 0 24px 58px rgba(27, 22, 17, 0.12))',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Box
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background:
                  'radial-gradient(circle at top right, rgba(119, 100, 79, 0.10), transparent 30%), radial-gradient(circle at bottom left, rgba(193, 176, 151, 0.18), transparent 28%)',
              }}
            />

            <Box style={{ position: 'relative', zIndex: 1 }}>
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
                  gap: 24,
                  alignItems: 'start',
                }}
              >
                <Stack spacing="lg">
                  <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                    <LandingBadge tone="strong">Design system front door</LandingBadge>
                    <LandingBadge>Editorial landing</LandingBadge>
                    <LandingBadge>Product-ready</LandingBadge>
                  </Flex>

                  <Stack spacing="sm">
                    <Text
                      as={"h1" as any}
                      size="2xl"
                      weight="bold"
                      style={{
                        color: 'var(--landing-ink, #18130f)',
                        letterSpacing: '-0.05em',
                        maxWidth: 760,
                        lineHeight: 0.96,
                      }}
                    >
                      A premium front door for a multi-engine design system.
                    </Text>
                    <Text
                      size="md"
                      style={{
                        color: 'var(--landing-muted, #5f5549)',
                        maxWidth: 760,
                        lineHeight: 1.65,
                      }}
                    >
                      This landing page should feel like a product argument: what the
                      system covers, where runtime is proven, and which route teams should
                      take next.
                    </Text>
                  </Stack>

                  <Flex gap={10} style={{ flexWrap: 'wrap' }}>
                    <PillLink href="/foundations" primary>
                      Enter foundations
                      <ArrowRightIcon size={14} />
                    </PillLink>
                    <PillLink href="/playground">
                      Open playground
                      <ChevronRightIcon size={14} />
                    </PillLink>
                    <PillLink href="/developers/architecture">
                      Read architecture
                      <ChevronRightIcon size={14} />
                    </PillLink>
                  </Flex>

                  <Box
                    style={{
                      padding: 16,
                      borderRadius: 24,
                      background:
                        'linear-gradient(180deg, rgba(255, 255, 255, 0.68) 0%, var(--landing-panel, #f3ece2) 100%)',
                      border,
                    }}
                  >
                    <Stack spacing={10}>
                      <Text
                        size="xs"
                        weight="semibold"
                        style={{
                          color: 'var(--landing-subtle, #85796c)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        Runtime proof
                      </Text>
                      <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                        {[
                          'Landing stays stable',
                          'Playground stays live',
                          'Docs prove the runtime',
                        ].map((item) => (
                          <LandingBadge key={item}>{item}</LandingBadge>
                        ))}
                      </Flex>
                    </Stack>
                  </Box>

                  <Box
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: 12,
                    }}
                  >
                    {heroMetrics.map((metric) => (
                      <StatTile
                        key={metric.label}
                        value={metric.value}
                        label={metric.label}
                        detail={metric.detail}
                      />
                    ))}
                  </Box>
                </Stack>

                <LandingRuntimePanel />
              </Box>
            </Box>
          </Card>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
              gap: 16,
            }}
          >
            {proofCards.map((card, index) => (
              <Card
                key={card.title}
                style={{
                  padding: 20,
                  borderRadius: 24,
                  border,
                  background:
                    index === 1
                      ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.86), var(--landing-surface-strong, #f7f1e8))'
                      : 'linear-gradient(180deg, rgba(255, 255, 255, 0.74), var(--landing-surface, #fffdfa))',
                  boxShadow: 'var(--landing-shadow-sm, 0 16px 36px rgba(27, 22, 17, 0.08))',
                }}
              >
                <Stack spacing={8}>
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      color: 'var(--landing-subtle, #85796c)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {card.label}
                  </Text>
                  <Text
                    as={"h3" as any}
                    size="lg"
                    weight="semibold"
                    style={{ color: 'var(--landing-ink, #18130f)', lineHeight: 1.15 }}
                  >
                    {card.title}
                  </Text>
                  <Text
                    size="sm"
                    style={{ color: 'var(--landing-muted, #5f5549)', lineHeight: 1.6 }}
                  >
                    {card.detail}
                  </Text>
                </Stack>
              </Card>
            ))}
          </Box>

          <Card
            style={{
              padding: 'clamp(20px, 3vw, 28px)',
              borderRadius: 28,
              border,
              background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.80) 0%, var(--landing-surface, #fffdfa) 100%)',
              boxShadow: 'var(--landing-shadow-md, 0 18px 44px rgba(27, 22, 17, 0.10))',
            }}
          >
            <Stack spacing="md">
              <SectionHeader
                eyebrow="System shape"
                title="The catalog is still the system, but the landing should frame it like a product."
                body="Four tiers keep the model readable, while ownership and runtime guidance make clear what the DS owns and how teams should inspect live behavior."
              />

              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
                  gap: 16,
                }}
              >
                {tierCards.map((tier) => {
                  const Icon = tier.icon;

                  return (
                    <Card
                      key={tier.name}
                      style={{
                        padding: 20,
                        borderRadius: 24,
                        border,
                        background:
                          'linear-gradient(180deg, rgba(255, 255, 255, 0.74), var(--landing-surface, #fffdfa))',
                        boxShadow: 'var(--landing-shadow-sm, 0 16px 36px rgba(27, 22, 17, 0.08))',
                      }}
                    >
                      <Stack spacing="md">
                        <Flex
                          align="center"
                          justify="between"
                          gap={12}
                          style={{ flexWrap: 'wrap' }}
                        >
                          <Flex align="center" gap={12}>
                            <Box
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'var(--landing-panel-strong, #ede2d3)',
                                color: 'var(--landing-ink, #18130f)',
                                border: borderStrong,
                              }}
                            >
                              <Icon size={18} />
                            </Box>
                            <Box>
                              <Text
                                size="xs"
                                style={{ color: 'var(--landing-subtle, #85796c)' }}
                              >
                                {tier.count} items
                              </Text>
                              <Text
                                as={"h3" as any}
                                size="lg"
                                weight="semibold"
                                style={{ color: 'var(--landing-ink, #18130f)' }}
                              >
                                {tier.name}
                              </Text>
                            </Box>
                          </Flex>
                          <LandingBadge>{tier.name}</LandingBadge>
                        </Flex>

                        <Text
                          size="sm"
                          style={{ color: 'var(--landing-muted, #5f5549)', lineHeight: 1.6 }}
                        >
                          {tier.description}
                        </Text>

                        <Box
                          style={{
                            padding: 14,
                            borderRadius: 20,
                            background: 'var(--landing-panel, #f3ece2)',
                            border,
                          }}
                        >
                          <Stack spacing={6}>
                            <Text
                              size="xs"
                              weight="semibold"
                              style={{
                                color: 'var(--landing-subtle, #85796c)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                              }}
                            >
                              Examples
                            </Text>
                            <Text
                              size="xs"
                              style={{ color: 'var(--landing-muted, #5f5549)', lineHeight: 1.55 }}
                            >
                              {tier.examples}
                            </Text>
                          </Stack>
                        </Box>

                        <Link
                          href={tier.href}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            textDecoration: 'none',
                            color: 'var(--landing-link, #2f271f)',
                            fontWeight: 600,
                          }}
                        >
                          Explore {tier.name.toLowerCase()}
                          <ArrowUpRight size={14} />
                        </Link>
                      </Stack>
                    </Card>
                  );
                })}
              </Box>

              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                  gap: 16,
                }}
              >
                {ownershipColumns.map((column, index) => {
                  const Icon = column.icon;

                  return (
                    <Card
                      key={column.title}
                      style={{
                        padding: 20,
                        borderRadius: 24,
                        border,
                        background:
                          index === 0
                            ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.80), var(--landing-surface, #fffdfa))'
                            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.70), var(--landing-surface-strong, #f7f1e8))',
                      }}
                    >
                      <Stack spacing="md">
                        <Flex align="center" gap={12}>
                          <Box
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: 14,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'var(--landing-panel, #f3ece2)',
                              border,
                              color: 'var(--landing-ink, #18130f)',
                            }}
                          >
                            <Icon size={18} />
                          </Box>
                          <Text
                            as={"h3" as any}
                            size="lg"
                            weight="semibold"
                            style={{ color: 'var(--landing-ink, #18130f)' }}
                          >
                            {column.title}
                          </Text>
                        </Flex>
                        <Stack spacing={8}>
                          {column.items.map((item) => (
                            <Box
                              key={item}
                              style={{
                                padding: '10px 12px',
                                borderRadius: 16,
                                background: 'rgba(255, 255, 255, 0.66)',
                                border,
                              }}
                            >
                              <Text
                                size="sm"
                                style={{ color: 'var(--landing-muted, #5f5549)', lineHeight: 1.55 }}
                              >
                                {item}
                              </Text>
                            </Box>
                          ))}
                        </Stack>
                      </Stack>
                    </Card>
                  );
                })}
              </Box>
            </Stack>
          </Card>

          <Card
            style={{
              padding: 'clamp(20px, 3vw, 28px)',
              borderRadius: 28,
              border,
              background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.80) 0%, var(--landing-surface-strong, #f7f1e8) 100%)',
              boxShadow: 'var(--landing-shadow-md, 0 18px 44px rgba(27, 22, 17, 0.10))',
            }}
          >
            <Stack spacing="md">
              <SectionHeader
                eyebrow="Runtime map"
                title="Tenant, engine, and vertical still matter, but this page frames them instead of reenacting them."
                body="The landing stays editorial. The runtime differences become real in playground, foundations, and the live catalog where the same components actually switch behavior."
              />

              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                  gap: 16,
                }}
              >
                <Card
                  style={{
                    padding: 20,
                    borderRadius: 24,
                    border,
                    background:
                      'linear-gradient(180deg, rgba(255, 255, 255, 0.76), var(--landing-surface, #fffdfa))',
                  }}
                >
                  <Stack spacing="md">
                    <Flex
                      align="center"
                      justify="between"
                      gap={12}
                      style={{ flexWrap: 'wrap' }}
                    >
                      <Text
                        as={"h3" as any}
                        size="lg"
                        weight="semibold"
                        style={{ color: 'var(--landing-ink, #18130f)' }}
                      >
                        Engine personalities
                      </Text>
                      <LandingBadge>3 renderers</LandingBadge>
                    </Flex>
                    <Stack spacing={12}>
                      {engineCards.map((engine) => (
                        <Box
                          key={engine.name}
                          style={{
                            padding: 14,
                            borderRadius: 18,
                            border,
                            background: 'rgba(255, 255, 255, 0.62)',
                          }}
                        >
                          <Stack spacing={10}>
                            <Flex
                              align="center"
                              justify="between"
                              gap={10}
                              style={{ flexWrap: 'wrap' }}
                            >
                              <Box style={{ minWidth: 0 }}>
                                <Text
                                  size="sm"
                                  weight="semibold"
                                  style={{ color: 'var(--landing-ink, #18130f)' }}
                                >
                                  {engine.name}
                                </Text>
                                <Text
                                  size="xs"
                                  style={{
                                    color: 'var(--landing-subtle, #85796c)',
                                    lineHeight: 1.55,
                                  }}
                                >
                                  {engine.foundation}
                                </Text>
                              </Box>
                              <LandingBadge>{engine.personality}</LandingBadge>
                            </Flex>

                            <Text
                              size="xs"
                              style={{ color: 'var(--landing-muted, #5f5549)', lineHeight: 1.55 }}
                            >
                              {engine.summary}
                            </Text>

                            <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                              {engine.traits.map((trait) => (
                                <LandingBadge key={trait}>{trait}</LandingBadge>
                              ))}
                            </Flex>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Stack>
                </Card>

                <Card
                  style={{
                    padding: 20,
                    borderRadius: 24,
                    border,
                    background:
                      'linear-gradient(180deg, rgba(255, 255, 255, 0.76), var(--landing-surface, #fffdfa))',
                  }}
                >
                  <Stack spacing="md">
                    <Flex
                      align="center"
                      justify="between"
                      gap={12}
                      style={{ flexWrap: 'wrap' }}
                    >
                      <Text
                        as={"h3" as any}
                        size="lg"
                        weight="semibold"
                        style={{ color: 'var(--landing-ink, #18130f)' }}
                      >
                        Vertical presets
                      </Text>
                      <LandingBadge>3 product voices</LandingBadge>
                    </Flex>

                    <Stack spacing={12}>
                      {verticalCards.map((vertical) => {
                        const Icon = vertical.icon;

                        return (
                          <Box
                            key={vertical.name}
                            style={{
                              padding: 14,
                              borderRadius: 18,
                              border,
                              background: 'rgba(255, 255, 255, 0.62)',
                            }}
                          >
                            <Stack spacing={10}>
                              <Flex align="center" gap={12} style={{ flexWrap: 'wrap' }}>
                                <Box
                                  style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 14,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'var(--landing-panel-strong, #ede2d3)',
                                    color: 'var(--landing-ink, #18130f)',
                                    border: borderStrong,
                                  }}
                                >
                                  <Icon size={18} />
                                </Box>
                                <Box style={{ minWidth: 0 }}>
                                  <Text
                                    size="sm"
                                    weight="semibold"
                                    style={{ color: 'var(--landing-ink, #18130f)' }}
                                  >
                                    {vertical.name}
                                  </Text>
                                  <Text
                                    size="xs"
                                    style={{ color: 'var(--landing-subtle, #85796c)', lineHeight: 1.55 }}
                                  >
                                    {vertical.theme} · {vertical.engine}
                                  </Text>
                                </Box>
                              </Flex>

                              <Text
                                size="xs"
                                style={{ color: 'var(--landing-muted, #5f5549)', lineHeight: 1.55 }}
                              >
                                {vertical.description}
                              </Text>

                              <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                                {vertical.modules.map((module) => (
                                  <LandingBadge key={module}>{module}</LandingBadge>
                                ))}
                              </Flex>

                              <Link
                                href={vertical.href}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  textDecoration: 'none',
                                  color: 'var(--landing-link, #2f271f)',
                                  fontWeight: 600,
                                }}
                              >
                                View {vertical.name.toLowerCase()}
                                <ArrowUpRight size={14} />
                              </Link>
                            </Stack>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Stack>
                </Card>
              </Box>
            </Stack>
          </Card>

          <Card
            style={{
              padding: 'clamp(20px, 3vw, 28px)',
              borderRadius: 28,
              border,
              background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.78) 0%, var(--landing-surface, #fffdfa) 100%)',
              boxShadow: 'var(--landing-shadow-md, 0 18px 44px rgba(27, 22, 17, 0.10))',
            }}
          >
            <Stack spacing="md">
              <SectionHeader
                eyebrow="Next routes"
                title="Move from the overview into the route that matches the question."
                body="The landing should get teams moving quickly, not trap them inside a generic front page."
              />

              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
                  gap: 16,
                }}
              >
                {routeCards.map((route) => (
                  <Link key={route.href} href={route.href} style={{ textDecoration: 'none' }}>
                    <Card
                      hoverable
                      style={{
                        height: '100%',
                        padding: 18,
                        borderRadius: 22,
                        border,
                        background:
                          'linear-gradient(180deg, rgba(255, 255, 255, 0.78) 0%, var(--landing-surface, #fffdfa) 100%)',
                        boxShadow: 'var(--landing-shadow-sm, 0 16px 36px rgba(27, 22, 17, 0.08))',
                      }}
                    >
                      <Stack spacing={10}>
                        <Flex
                          align="center"
                          justify="between"
                          gap={12}
                          style={{ flexWrap: 'wrap' }}
                        >
                          <Text
                            size="sm"
                            weight="semibold"
                            style={{ color: 'var(--landing-ink, #18130f)' }}
                          >
                            {route.label}
                          </Text>
                          <LandingBadge>Open</LandingBadge>
                        </Flex>
                        <Text
                          size="xs"
                          style={{ color: 'var(--landing-muted, #5f5549)', lineHeight: 1.6 }}
                        >
                          {route.description}
                        </Text>
                        <Flex
                          align="center"
                          gap={6}
                          style={{ color: 'var(--landing-link, #2f271f)' }}
                        >
                          <Text size="xs" weight="semibold">
                            Go there
                          </Text>
                          <ArrowUpRight size={14} />
                        </Flex>
                      </Stack>
                    </Card>
                  </Link>
                ))}
              </Box>

              <Box
                style={{
                  padding: 18,
                  borderRadius: 24,
                  border,
                  background:
                    'linear-gradient(180deg, rgba(255, 255, 255, 0.74) 0%, var(--landing-panel, #f3ece2) 100%)',
                }}
              >
                <Flex
                  align="center"
                  justify="between"
                  gap={12}
                  style={{ flexWrap: 'wrap' }}
                >
                  <Box style={{ maxWidth: 760 }}>
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{
                        color: 'var(--landing-subtle, #85796c)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      Ready when you are
                    </Text>
                    <Text
                      as={"h3" as any}
                      size="lg"
                      weight="bold"
                      style={{ marginTop: 6, color: 'var(--landing-ink, #18130f)' }}
                    >
                      Explore documentation, then step into the working system.
                    </Text>
                    <Text
                      size="sm"
                      style={{
                        marginTop: 6,
                        color: 'var(--landing-muted, #5f5549)',
                        lineHeight: 1.6,
                      }}
                    >
                      Foundations explain the system, architecture explains ownership,
                      and the playground shows live rendering behavior.
                    </Text>
                  </Box>
                  <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                    <PillLink href="/foundations" primary>
                      Explore docs
                      <ArrowRightIcon size={14} />
                    </PillLink>
                    <PillLink href="/developers/architecture">
                      Review architecture
                      <ChevronRightIcon size={14} />
                    </PillLink>
                  </Flex>
                </Flex>
              </Box>
            </Stack>
          </Card>
        </Stack>
      </Box>
    </main>
  );
}
