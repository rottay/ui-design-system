'use client';

import { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Card,
  DesignSystemProvider,
  Flex,
  Stack,
  Text,
} from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import { CodeBlock } from '@/components/playground';
import { useShowroom } from '@/components/showroom-context';
import { FoundationTopRail } from '../../foundation-top-rail';

const COLOR_SCALES = [
  { name: 'neutral', label: 'Neutral', key: 'neutral' as const },
  { name: 'primary', label: 'Primary', key: 'primaryScale' as const },
  { name: 'secondary', label: 'Secondary', key: 'secondaryScale' as const },
  { name: 'success', label: 'Success', key: 'successScale' as const },
  { name: 'warning', label: 'Warning', key: 'warningScale' as const },
  { name: 'error', label: 'Error', key: 'errorScale' as const },
  { name: 'info', label: 'Info', key: 'infoScale' as const },
] as const;

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

function rgbToHex(rgb: string): string {
  const match = rgb.match(/(\d+)/g);
  if (!match || match.length < 3) return rgb;
  const [r, g, b] = match.map(Number);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)}`;
}

function ColorSwatch({
  cssVar,
  step,
  scaleName,
}: {
  cssVar: string;
  step: number;
  scaleName: string;
}) {
  const [copied, setCopied] = useState(false);
  const [resolvedHex, setResolvedHex] = useState('');

  useEffect(() => {
    const probe = document.createElement('div');
    probe.style.background = cssVar;
    probe.style.position = 'absolute';
    probe.style.pointerEvents = 'none';
    probe.style.opacity = '0';
    document.body.appendChild(probe);
    const computed = getComputedStyle(probe).backgroundColor;
    setResolvedHex(rgbToHex(computed));
    document.body.removeChild(probe);
  }, [cssVar]);

  const variableName = `--ds-color-${scaleName}-${step}`;
  const isDark = step >= 600;

  return (
    <Box
      as="button"
      onClick={() => {
        navigator.clipboard.writeText(variableName).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        });
      }}
      style={{
        width: '100%',
        border: 'none',
        padding: '12px 16px',
        background: cssVar,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'transform 180ms ease',
      }}
    >
      <Flex align="center" justify="between">
        <Text
          size="xs"
          weight="semibold"
          style={{
            color: isDark ? 'rgba(255,255,255,0.92)' : 'rgba(15,23,42,0.76)',
            fontFamily: 'var(--font-geist-mono, monospace)',
          }}
        >
          {step}
        </Text>
        <Text
          size="xs"
          style={{
            color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.58)',
            fontFamily: 'var(--font-geist-mono, monospace)',
          }}
        >
          {copied ? 'Copied' : resolvedHex}
        </Text>
      </Flex>
    </Box>
  );
}

function ColorScaleCard({
  scale,
}: {
  scale: (typeof COLOR_SCALES)[number];
}) {
  const tokens = useTokens();
  const colorScale = tokens.colors[scale.key];

  return (
    <Card style={{ overflow: 'hidden', padding: 0, height: '100%' }}>
      <Stack spacing={0}>
        <Box
          style={{
            padding: '18px 20px',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.92))',
          }}
        >
          <Flex align="center" justify="between">
            <Stack spacing={4}>
              <Text as={"h3" as any} size="md" weight="semibold">
                {scale.label}
              </Text>
              <Text
                size="xs"
                style={{
                  color: 'var(--ds-color-text-muted)',
                  fontFamily: 'var(--font-geist-mono, monospace)',
                  lineHeight: 1.55,
                }}
              >
                --ds-color-{scale.name}-*
              </Text>
            </Stack>
            <Badge variant="secondary">10 stops</Badge>
          </Flex>
        </Box>
        <Box>
          {STEPS.map((step) => (
            <ColorSwatch
              key={step}
              cssVar={colorScale[step]}
              step={step}
              scaleName={scale.name}
            />
          ))}
        </Box>
      </Stack>
    </Card>
  );
}

function BrandScalePreview({
  tenantSlug,
  label,
}: {
  tenantSlug: string;
  label: string;
}) {
  const { engine } = useShowroom();

  return (
    <DesignSystemProvider tenantSlug={tenantSlug} forceEngine={engine}>
      <BrandScalePreviewContent label={label} />
    </DesignSystemProvider>
  );
}

function BrandScalePreviewContent({ label }: { label: string }) {
  const tokens = useTokens();

  return (
    <Card style={{ padding: tokens.spacing[4], height: '100%' }}>
      <Stack spacing="md">
        <Flex align="center" justify="between">
          <Text size="sm" weight="semibold">
            {label}
          </Text>
          <Badge variant="secondary">Primary</Badge>
        </Flex>
        <Flex gap={2}>
          {STEPS.map((step) => (
            <Box
              key={step}
              style={{
                flex: 1,
                height: 36,
                borderRadius:
                  step === 50
                    ? '8px 0 0 8px'
                    : step === 900
                      ? '0 8px 8px 0'
                      : 0,
                background: `var(--ds-color-primary-${step})`,
              }}
            />
          ))}
        </Flex>
        <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
          Same token names, different visual identity through tenant overrides.
        </Text>
      </Stack>
    </Card>
  );
}

export default function ColorsPage() {
  const tokens = useTokens();
  const semanticPairs = [
    {
      label: 'Text primary',
      value: 'var(--ds-color-text-primary)',
      surface: 'var(--ds-color-white)',
    },
    {
      label: 'Text secondary',
      value: 'var(--ds-color-text-secondary)',
      surface: 'var(--ds-color-neutral-50)',
    },
    {
      label: 'Info state',
      value: 'var(--ds-color-info-500)',
      surface: 'var(--ds-color-info-50)',
    },
    {
      label: 'Error state',
      value: 'var(--ds-color-error-600)',
      surface: 'var(--ds-color-error-50)',
    },
  ];

  return (
    <Stack spacing="lg" fullWidth>
      <FoundationTopRail
        backHref="/foundations/tokens"
        backLabel="Tokens"
        badge="Color system"
        title="Colors"
        description="Color tokens carry both brand personality and interface meaning. This page shows the raw scale inventory, semantic pairings, and how the same token names adapt across tenants."
        panels={[
          {
            title: 'What to inspect',
            body: 'Brand scales for recognition, neutrals for dense UI scaffolding, and semantic scales for reliable state feedback.',
            tone: 'accent',
          },
          {
            title: 'Interaction',
            body: 'Click any swatch below to copy its CSS custom property name.',
          },
          {
            title: 'Portable contract',
            body: 'Token names stay stable while theme values shift by tenant.',
            tone: 'dark',
          },
        ]}
        links={[
          { label: 'Neutral' },
          { label: 'Primary' },
          { label: 'Secondary' },
          { label: 'Semantic feedback' },
        ]}
        stats={[
          { label: 'Scales', value: `${COLOR_SCALES.length}`, detail: 'Neutral + brand + semantic families' },
          { label: 'Stops', value: '10 each', detail: '50 through 900' },
          { label: 'Semantic pairs', value: `${semanticPairs.length}`, detail: 'Text and state references' },
          { label: 'Tenant previews', value: '3', detail: 'Same names, different identities' },
        ]}
      />

      <Stack spacing="md">
        <Flex align="center" justify="between" style={{ flexWrap: 'wrap' }}>
          <Box>
            <Text as={"h2" as any} size="xl" weight="semibold">
              Full scale inventory
            </Text>
            <Text
              size="sm"
              style={{ color: 'var(--ds-color-text-secondary)' }}
            >
              Explore the entire color contract, from soft surfaces at `50` to
              contrast-heavy accents at `900`.
            </Text>
          </Box>
          <Badge variant="secondary">Copyable CSS vars</Badge>
        </Flex>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: tokens.spacing[5],
          }}
        >
          {COLOR_SCALES.map((scale) => (
            <ColorScaleCard key={scale.name} scale={scale} />
          ))}
        </Box>
      </Stack>

      <Card style={{ padding: tokens.spacing[5] }}>
        <Stack spacing="md">
          <Flex align="center" justify="between" style={{ flexWrap: 'wrap' }}>
            <Text as={"h2" as any} size="lg" weight="semibold">
              Semantic pairings
            </Text>
            <Badge variant="secondary">Usage guidance</Badge>
          </Flex>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: tokens.spacing[4],
            }}
          >
          {semanticPairs.map((pair) => (
              <Box
                key={pair.label}
                style={{
                  padding: tokens.spacing[4],
                  borderRadius: tokens.borderRadius.lg,
                  background: pair.surface,
                  border: '1px solid var(--ds-color-neutral-200)',
                }}
              >
                <Stack spacing={8}>
                  <Flex align="center" gap={8}>
                    <Box
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 6,
                        background: pair.value,
                        border: '1px solid rgba(15,23,42,0.08)',
                      }}
                    />
                    <Text size="sm" weight="semibold">
                      {pair.label}
                    </Text>
                  </Flex>
                  <Box
                    style={{
                      padding: '8px 10px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.52)',
                      border: '1px solid var(--ds-color-neutral-200)',
                    }}
                  >
                  <Text
                    size="xs"
                    style={{
                      color: 'var(--ds-color-text-muted)',
                      fontFamily: 'var(--font-geist-mono, monospace)',
                      lineHeight: 1.55,
                    }}
                  >
                    {pair.value}
                  </Text>
                  </Box>
                </Stack>
              </Box>
            ))}
          </Box>
        </Stack>
      </Card>

      <Stack spacing="md">
        <Flex align="center" justify="between" style={{ flexWrap: 'wrap' }}>
          <Box>
            <Text as={"h2" as any} size="lg" weight="semibold">
              Same token names, different brands
            </Text>
            <Text
              size="sm"
              style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.6 }}
            >
              Primary scale stays portable because its meaning is stable, even
              when tenant personality changes.
            </Text>
          </Box>
          <Badge variant="secondary">Theme comparison</Badge>
        </Flex>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: tokens.spacing[4],
          }}
        >
          <BrandScalePreview tenantSlug="rottay" label="Rottay" />
          <BrandScalePreview tenantSlug="bithire" label="BitHire" />
          <BrandScalePreview tenantSlug="evnto" label="Evnto" />
        </Box>
      </Stack>

      <CodeBlock
        title="Color authoring"
        language="tsx"
        code={`const tokens = useTokens();

<Box
  style={{
    background: tokens.colors.primaryScale[50],
    borderColor: tokens.colors.primaryScale[200],
    color: 'var(--ds-color-text-primary)',
  }}
/>;

<Text style={{ color: 'var(--ds-color-text-secondary)' }}>
  Prefer semantic text aliases over raw palette picks.
</Text>`}
      />
    </Stack>
  );
}
