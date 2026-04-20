'use client';

import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';

interface TokenCategory {
  title: string;
  description: string;
  href: string;
  sampleCount: string;
  preview: React.ReactNode;
}

function ColorDots() {
  const dots = [
    'var(--ds-color-primary-500)',
    'var(--ds-color-secondary-500)',
    'var(--ds-color-success-500)',
    'var(--ds-color-warning-500)',
    'var(--ds-color-error-500)',
    'var(--ds-color-info-500)',
  ];
  return (
    <Flex gap={4}>
      {dots.map((color, i) => (
        <Box
          key={i}
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: color,
          }}
        />
      ))}
    </Flex>
  );
}

function SpacingBars() {
  const widths = [8, 16, 24, 40, 64];
  return (
    <Stack spacing={3}>
      {widths.map((w) => (
        <Box
          key={w}
          style={{
            height: 4,
            width: w,
            borderRadius: 2,
            background: 'var(--ds-color-primary-300)',
          }}
        />
      ))}
    </Stack>
  );
}

function TypographyPreview() {
  return (
    <Stack spacing={1}>
      <Text size="xs" style={{ color: "var(--ds-color-text-muted)" }}>Aa Bb Cc</Text>
      <Text size="sm" weight="medium">Aa Bb Cc</Text>
      <Text size="md" weight="bold">Aa Bb Cc</Text>
    </Stack>
  );
}

function RadiusPreview() {
  const tokens = useTokens();
  return (
    <Flex gap={6} align="center">
      {[tokens.borderRadius.sm, tokens.borderRadius.md, tokens.borderRadius.lg, tokens.borderRadius.xl].map((r, i) => (
        <Box
          key={i}
          style={{
            width: 24,
            height: 24,
            borderRadius: r,
            border: '2px solid var(--ds-color-primary-400)',
          }}
        />
      ))}
    </Flex>
  );
}

function ShadowPreview() {
  const tokens = useTokens();
  return (
    <Flex gap={8} align="center">
      {[tokens.shadows.sm, tokens.shadows.md, tokens.shadows.lg].map((shadow, i) => (
        <Box
          key={i}
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: 'var(--ds-color-white)',
            boxShadow: shadow,
          }}
        />
      ))}
    </Flex>
  );
}

function MotionPreview() {
  return (
    <Flex gap={6} align="center">
      <Box
        style={{
          width: 20,
          height: 20,
          borderRadius: 4,
          background: 'var(--ds-color-primary-400)',
          transition: 'var(--ds-transition-normal)',
        }}
      />
      <Text size="xs" style={{ color: "var(--ds-color-text-muted)" }}>150ms ease</Text>
    </Flex>
  );
}

function GlassPreview() {
  return (
    <Box
      style={{
        width: 60,
        height: 32,
        borderRadius: 8,
        background: 'var(--ds-glass-bg)',
        backdropFilter: 'var(--ds-glass-blur)',
        border: '1px solid var(--ds-glass-border)',
      }}
    />
  );
}

export default function TokensPage() {
  const tokens = useTokens();

  const TOKEN_CATEGORIES: TokenCategory[] = [
    {
      title: 'Colors',
      description: 'Primary, secondary, neutral, and semantic color scales (50-900) using CSS custom properties for tenant overrides.',
      href: '/foundations/tokens/colors',
      sampleCount: '7 scales',
      preview: <ColorDots />,
    },
    {
      title: 'Spacing',
      description: 'Consistent spacing scale from 0 to 96px used for padding, margins, and gaps across all components.',
      href: '/foundations/tokens/spacing',
      sampleCount: '17 values',
      preview: <SpacingBars />,
    },
    {
      title: 'Typography',
      description: 'Font sizes (xs through 4xl), weights (normal through black), line heights, and letter spacing.',
      href: '/foundations/tokens/typography',
      sampleCount: '10 sizes',
      preview: <TypographyPreview />,
    },
    {
      title: 'Radius',
      description: 'Border radius tokens differentiated by engine: Classic is sharp, Modern is rounded, Rustic is minimal.',
      href: '/foundations/tokens/radius',
      sampleCount: '6 levels',
      preview: <RadiusPreview />,
    },
    {
      title: 'Shadows',
      description: 'Box shadow tokens differentiated by engine: Classic is corporate, Modern is bold, Rustic is a whisper.',
      href: '/foundations/tokens/shadows',
      sampleCount: '5 levels',
      preview: <ShadowPreview />,
    },
    {
      title: 'Motion',
      description: 'Transition and animation tokens for hover, enter/exit, and spring physics. Engine-differentiated behavior.',
      href: '/foundations/tokens/motion',
      sampleCount: '5 transitions',
      preview: <MotionPreview />,
    },
    {
      title: 'Glass',
      description: 'Glassmorphism tokens for blur, background opacity, and border effects. Includes light, standard, and heavy variants.',
      href: '/foundations/tokens/glass',
      sampleCount: '9 values',
      preview: <GlassPreview />,
    },
  ];

  return (
    <Stack spacing="lg">
      {/* Page header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            Tokens
          </Text>
          <Badge variant="secondary">Foundation</Badge>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: "var(--ds-color-text-secondary)" }}>
            Design tokens are the atomic values -- colors, spacing, typography,
            radius, shadows, motion, and glass -- that every component consumes.
            They are expressed as CSS custom properties so tenants can override
            them at runtime without rebuilding the bundle.
          </Text>
        </Box>
      </Box>

      {/* Token categories grid */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: tokens.spacing[5],
        }}
      >
        {TOKEN_CATEGORIES.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            style={{ textDecoration: 'none' }}
          >
            <Card
              hoverable
              style={{
                height: '100%',
                cursor: 'pointer',
                transition: 'box-shadow 200ms ease, transform 200ms ease',
              }}
            >
              <Stack spacing="md">
                <Flex align="center" justify="between">
                  <Box style={{ minHeight: 32 }}>
                    {cat.preview}
                  </Box>
                  <Badge>{cat.sampleCount}</Badge>
                </Flex>
                <Box>
                  <Text as={"h3" as any} size="lg" weight="semibold">
                    {cat.title}
                  </Text>
                  <Box style={{ marginTop: tokens.spacing[1] }}>
                    <Text size="sm" style={{ color: "var(--ds-color-text-secondary)" }}>
                      {cat.description}
                    </Text>
                  </Box>
                </Box>
              </Stack>
            </Card>
          </Link>
        ))}
      </Box>

      {/* Usage hint */}
      <Card>
        <Stack spacing="sm">
          <Text size="sm" weight="semibold">Usage</Text>
          <Box
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '0.8125rem',
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.md,
              background: 'var(--ds-color-neutral-900)',
              color: 'var(--ds-color-neutral-100)',
              lineHeight: 1.6,
              overflowX: 'auto',
            }}
          >
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-400)' }}>
              {`// Access tokens in any component`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`import { useTokens } from '@rottay/design-system';`}
            </Text>
            <br /><br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`const tokens = useTokens();`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`tokens.spacing[4]   // '16px'`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`tokens.shadows.md   // engine-specific shadow`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`tokens.borderRadius.lg  // engine-specific radius`}
            </Text>
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
