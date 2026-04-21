import { ShowroomLink as Link } from '@/components/showroom-link';
import { Badge, Box, Card, Flex, Stack, Text } from '@/components/showroom-ui';
import { iconCategories } from '@/data/registry/icons';
import {
  BracesIcon,
  LayersIcon,
  SettingsIcon,
  SparklesIcon,
} from '@rottay/design-system/icons';
import { FoundationTopRail } from './foundation-top-rail';

interface FoundationArea {
  title: string;
  href: string;
  badge: string;
  metric: string;
  description: string;
  whenToUse: string;
  samples: string[];
  icon: React.ReactNode;
  tint: string;
  accent: string;
  panel: string;
  border: string;
}

const ICON_TOTAL = iconCategories.reduce((sum, category) => sum + category.count, 0);
const PAGE_GAP = 16;
const PANEL_GAP = 20;
const PANEL_RADIUS = 16;
const PANEL_RADIUS_LG = 20;
const PANEL_SHADOW = 'var(--ds-shadow-lg, 0 24px 56px rgba(0, 0, 0, 0.18))';

const FOUNDATION_AREAS: FoundationArea[] = [
  {
    title: 'Tokens',
    href: '/foundations/tokens',
    badge: '6 live chapters',
    metric: '~140 runtime variables',
    description:
      'Color, type, spacing, radius, shadow, and motion define the values every component resolves before it renders.',
    whenToUse:
      'A UI feels inconsistent and you need to trace the value that is driving it.',
    samples: ['colors', 'spacing', 'typography', 'motion'],
    icon: <LayersIcon size={22} />,
    tint: 'var(--ds-color-info-bg)',
    accent: 'var(--ds-color-info)',
    panel: 'var(--ds-color-bg-overlay)',
    border: 'var(--ds-color-info-border)',
  },
  {
    title: 'Themes',
    href: '/foundations/themes',
    badge: '3 tenant previews',
    metric: 'brand resolution chain',
    description:
      'Themes layer tenant branding on top of engine and vertical defaults without forking the component set.',
    whenToUse:
      'You need to explain how one system becomes Platform, BitHire, or Evnto at runtime.',
    samples: ['rottay', 'bithire', 'evnto', 'brand themes'],
    icon: <SparklesIcon size={22} />,
    tint: 'var(--ds-color-warning-bg)',
    accent: 'var(--ds-color-warning)',
    panel: 'var(--ds-color-bg-overlay)',
    border: 'var(--ds-color-warning-border)',
  },
  {
    title: 'Engines',
    href: '/foundations/engines',
    badge: '3 renderers',
    metric: 'same API, different personality',
    description:
      'Classic, Modern, and Rustic keep the same API while changing silhouette, depth, and motion.',
    whenToUse:
      'Teams want to compare rendering direction without rewriting application code.',
    samples: ['classic', 'modern', 'rustic', 'runtime switching'],
    icon: <SettingsIcon size={22} />,
    tint: 'var(--ds-color-success-bg)',
    accent: 'var(--ds-color-success)',
    panel: 'var(--ds-color-bg-overlay)',
    border: 'var(--ds-color-success-border)',
  },
  {
    title: 'Icons',
    href: '/foundations/icons',
    badge: `${ICON_TOTAL} curated assets`,
    metric: '10 semantic buckets',
    description:
      'The icon catalog provides a shared visual vocabulary for navigation, actions, status, data, and system chrome.',
    whenToUse:
      'You need recognisable affordances without drifting into custom SVG sets.',
    samples: ['navigation', 'status', 'data', 'currentColor'],
    icon: <BracesIcon size={22} />,
    tint: 'var(--ds-color-bg-overlay)',
    accent: 'var(--ds-color-text-primary)',
    panel: 'var(--ds-color-bg-overlay)',
    border: 'var(--ds-color-border-secondary)',
  },
];

const WALKTHROUGHS = [
  {
    title: 'Brand a tenant',
    routes: ['Themes', 'Tokens', 'Icons'],
    description:
      'Check theme merging first, validate the token palette, then confirm the icon vocabulary.',
  },
  {
    title: 'Choose a rendering direction',
    routes: ['Engines', 'Playground', 'Primitives'],
    description:
      'Compare Classic, Modern, and Rustic, then inspect live primitives with the same switch applied.',
  },
  {
    title: 'Audit visual consistency',
    routes: ['Tokens', 'Themes', 'Surfaces'],
    description:
      'Start with tokens and themes, then confirm full-page surfaces still stay aligned.',
  },
];

function TrackVisual({ area }: { area: FoundationArea }) {
  if (area.title === 'Tokens') {
    return (
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 10,
        }}
      >
        {[
          { label: 'Color', value: 'live' },
          { label: 'Type', value: 'system' },
          { label: 'Space', value: 'scale' },
          { label: 'Motion', value: 'timed' },
        ].map((item, index) => (
          <Box
            key={item.label}
            style={{
              padding: 12,
              borderRadius: 14,
              background:
                index === 0
                  ? 'linear-gradient(180deg, rgba(239,246,255,0.96), rgba(255,255,255,0.92))'
                  : 'var(--ds-color-bg-overlay)',
              border: '1px solid var(--ds-color-border-secondary)',
            }}
          >
            <Text size="xs" weight="semibold" style={{ color: 'var(--ds-color-text-muted)' }}>
              {item.label}
            </Text>
            <Text size="sm" weight="bold" style={{ marginTop: 4 }}>
              {item.value}
            </Text>
          </Box>
        ))}
      </Box>
    );
  }

  if (area.title === 'Themes') {
    return (
      <Stack spacing={8}>
        {[
          { label: 'Rottay', color: 'var(--ds-color-info-bg)' },
          { label: 'BitHire', color: 'var(--ds-color-warning-bg)' },
          { label: 'Evnto', color: 'var(--ds-color-success-bg)' },
        ].map((item) => (
          <Flex key={item.label} gap={10} align="center">
            <Box
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: item.color,
                border: '1px solid var(--ds-color-border-secondary)',
                flexShrink: 0,
              }}
            />
            <Text size="sm" weight="semibold">
              {item.label}
            </Text>
          </Flex>
        ))}
      </Stack>
    );
  }

  if (area.title === 'Engines') {
    return (
      <Flex gap={8} style={{ flexWrap: 'wrap' }}>
        {['classic', 'modern', 'rustic'].map((engine) => (
          <Box
            key={engine}
            style={{
              padding: '6px 10px',
              borderRadius: 999,
              border: '1px solid var(--ds-color-border-secondary)',
              background: 'var(--ds-color-bg-overlay)',
            }}
          >
            <Text
              size="xs"
              weight="semibold"
              style={{ fontFamily: 'var(--ds-font-family-mono, monospace)' }}
            >
              {engine}
            </Text>
          </Box>
        ))}
      </Flex>
    );
  }

  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 10,
      }}
    >
      {[
        <LayersIcon key="layers" size={18} />,
        <SparklesIcon key="sparkles" size={18} />,
        <SettingsIcon key="settings" size={18} />,
        <BracesIcon key="braces" size={18} />,
      ].map((icon, index) => (
        <Box
          key={index}
          style={{
            height: 56,
            borderRadius: 14,
            border: '1px solid var(--ds-color-border-secondary)',
            background:
              index === 0
                ? 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.92))'
                : 'var(--ds-color-bg-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ds-color-text-primary)',
          }}
        >
          {icon}
        </Box>
      ))}
    </Box>
  );
}

function FoundationTrackCard({
  area,
  featured = false,
  wide = false,
}: {
  area: FoundationArea;
  featured?: boolean;
  wide?: boolean;
}) {
  return (
    <Link href={area.href} style={{ textDecoration: 'none', display: 'block' }}>
      <Card
        hoverable
        style={{
          width: '100%',
          height: '100%',
          padding: featured ? 22 : 18,
          cursor: 'pointer',
          border: `1px solid ${area.border}`,
          background:
            area.title === 'Icons'
              ? 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.92))'
              : featured
                ? 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.92))'
                : 'linear-gradient(180deg, var(--ds-color-bg-elevated), var(--ds-color-bg-primary))',
          boxShadow: featured
            ? 'var(--ds-shadow-lg, 0 24px 56px rgba(0, 0, 0, 0.18))'
            : 'var(--ds-shadow-md, 0 16px 40px rgba(0, 0, 0, 0.14))',
        }}
      >
        <Stack spacing={featured ? 'md' : 'sm'} fullWidth style={{ height: '100%' }}>
          <Box
            style={{
              paddingBottom: 12,
              borderBottom: '1px solid var(--ds-color-border-secondary)',
            }}
          >
            <Flex align="start" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
              <Flex align="start" gap={12} style={{ minWidth: 0, flex: '1 1 180px' }}>
                <Box
                  style={{
                    width: featured ? 52 : 44,
                    height: featured ? 52 : 44,
                    borderRadius: featured ? 18 : PANEL_RADIUS,
                    background: area.tint,
                    color: area.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: `1px solid ${area.border}`,
                  }}
                >
                  {area.icon}
                </Box>
                <Box style={{ minWidth: 0 }}>
                  <Text as={"h3" as any} size={featured ? 'xl' : 'lg'} weight="semibold">
                    {area.title}
                  </Text>
                  <Text
                    size="xs"
                    style={{
                      marginTop: 4,
                      color: 'var(--ds-color-text-muted)',
                      fontFamily: 'var(--ds-font-family-mono, monospace)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {area.metric}
                  </Text>
                </Box>
              </Flex>
              <Badge variant={featured ? 'primary' : 'secondary'}>{area.badge}</Badge>
            </Flex>
          </Box>

          <Box
            style={{
              padding: featured ? 14 : 12,
              borderRadius: PANEL_RADIUS,
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-overlay) 70%, white 30%), var(--ds-color-bg-overlay))',
              border: '1px solid var(--ds-color-border-secondary)',
            }}
          >
            <Stack spacing={4}>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  color: 'var(--ds-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Summary
              </Text>
              <Text
                size={featured ? 'md' : 'sm'}
                style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}
              >
                {area.description}
              </Text>
            </Stack>
          </Box>

          <Box
            style={{
              padding: featured ? 16 : '12px 14px',
              borderRadius: PANEL_RADIUS,
              background: area.panel,
              border: `1px solid ${area.border}`,
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
              Open when
            </Text>
            <Text
              size="sm"
              style={{ marginTop: 6, color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}
            >
              {area.whenToUse}
            </Text>
          </Box>

          <Flex gap={6} style={{ flexWrap: 'wrap', marginTop: 'auto' }}>
            {area.samples.map((sample) => (
              <Box
                key={sample}
                style={{
                  padding: '5px 10px',
                  borderRadius: 999,
                  background: 'var(--ds-color-bg-primary)',
                  border: '1px solid var(--ds-color-border-secondary)',
                }}
              >
                <Text
                  size="xs"
                  style={{
                    color: 'var(--ds-color-text-secondary)',
                    fontFamily: 'var(--ds-font-family-mono, monospace)',
                  }}
                >
                  {sample}
                </Text>
              </Box>
            ))}
          </Flex>

          {wide ? <TrackVisual area={area} /> : null}
        </Stack>
      </Card>
    </Link>
  );
}

function QuickRouteRow({
  title,
  routes,
  description,
  highlighted = false,
}: {
  title: string;
  routes: string[];
  description: string;
  highlighted?: boolean;
}) {
  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.2fr) auto',
        gap: 16,
        alignItems: 'center',
        padding: '14px 0',
        borderTop: '1px solid var(--ds-color-border-secondary)',
        background: highlighted
          ? 'linear-gradient(90deg, rgba(239,246,255,0.68), transparent)'
          : 'transparent',
      }}
    >
      <Stack spacing={6}>
        <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
          <Badge variant={highlighted ? 'primary' : 'secondary'}>{routes[0]}</Badge>
          <Text size="sm" weight="semibold">
            {title}
          </Text>
        </Flex>
        <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
          {description}
        </Text>
      </Stack>
      <Flex gap={6} style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {routes.map((route) => (
          <Badge key={route} variant={highlighted ? 'primary' : 'secondary'}>
            {route}
          </Badge>
        ))}
      </Flex>
    </Box>
  );
}

export default function FoundationsPage() {
  return (
    <Stack spacing="lg" fullWidth>
      <FoundationTopRail
        badge="System layer"
        title="Foundations"
        description="The runtime layer behind every showroom preview: tokens, tenant themes, rendering engines, and shared iconography."
        panels={[
          {
            title: 'When to open this',
            body: 'Open foundations when a screen looks wrong everywhere, diverges by tenant, or shifts across engines.',
            tone: 'accent',
          },
          {
            title: 'Reading path',
            body: 'Tokens, then Themes, then Engines covers most diagnosis. Use Icons when the question is vocabulary or affordance.',
          },
        ]}
        links={[
          { label: 'Tokens', href: '/foundations/tokens' },
          { label: 'Themes', href: '/foundations/themes' },
          { label: 'Engines', href: '/foundations/engines' },
          { label: 'Icons', href: '/foundations/icons' },
        ]}
        stats={[
          { label: 'Tracks', value: '4', detail: 'Tokens, themes, engines, icons' },
          { label: 'Runtime vars', value: '~140', detail: 'Themeable at runtime' },
          { label: 'Renderers', value: '3', detail: 'Classic, Modern, Rustic' },
          { label: 'Icons', value: `${ICON_TOTAL}`, detail: 'Shared visual vocabulary' },
        ]}
      />

      <Stack spacing="md" fullWidth>
        <Flex align="center" justify="between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <Box>
            <Text as={"h2" as any} size="xl" weight="semibold">
              Choose a foundation track
            </Text>
            <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
              Each track is framed as a quick diagnostic path, not a passive chapter.
            </Text>
          </Box>
          <Badge variant="secondary">4 live tracks</Badge>
        </Flex>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: PAGE_GAP,
            alignItems: 'stretch',
          }}
        >
          <FoundationTrackCard area={FOUNDATION_AREAS[0]} featured />

          <Stack spacing={PAGE_GAP}>
            <FoundationTrackCard area={FOUNDATION_AREAS[1]} />
            <FoundationTrackCard area={FOUNDATION_AREAS[2]} />
          </Stack>
        </Box>

        <FoundationTrackCard area={FOUNDATION_AREAS[3]} wide />
      </Stack>

      <Card
        style={{
          width: '100%',
          padding: PANEL_GAP,
          border: '1px solid var(--ds-color-border-secondary)',
          background:
            'linear-gradient(180deg, var(--ds-color-bg-secondary), var(--ds-color-bg-primary))',
          boxShadow: PANEL_SHADOW,
        }}
      >
        <Stack spacing="md" fullWidth>
          <Flex align="center" justify="between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <Box>
              <Text as={"h2" as any} size="xl" weight="semibold">
                Quick routes
              </Text>
              <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                Fast entry points for branding, engine comparison, and consistency checks.
              </Text>
            </Box>
            <Badge variant="secondary">Practical entry points</Badge>
          </Flex>

          <Box>
            {WALKTHROUGHS.map((walkthrough, index) => (
              <QuickRouteRow
                key={walkthrough.title}
                title={walkthrough.title}
                routes={walkthrough.routes}
                description={walkthrough.description}
                highlighted={index === 0}
              />
            ))}
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
