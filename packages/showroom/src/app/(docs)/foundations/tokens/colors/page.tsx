'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';

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

function useResolvedColor(cssVar: string): string {
  const [hex, setHex] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const computed = getComputedStyle(ref.current).backgroundColor;
    if (computed && computed !== 'rgba(0, 0, 0, 0)') {
      setHex(rgbToHex(computed));
    }
  }, [cssVar]);

  return hex;
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/(\d+)/g);
  if (!match || match.length < 3) return rgb;
  const [r, g, b] = match.map(Number);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
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
  const swatchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!swatchRef.current) return;
    const el = swatchRef.current;
    const computed = getComputedStyle(el).backgroundColor;
    if (computed && computed !== 'rgba(0, 0, 0, 0)') {
      setResolvedHex(rgbToHex(computed));
    }
  }, [cssVar]);

  const variableName = `--ds-color-${scaleName}-${step}`;
  const isDark = step >= 600;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(variableName).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [variableName]);

  return (
    <Box
      ref={swatchRef}
      onClick={handleCopy}
      style={{
        background: cssVar,
        padding: '12px 16px',
        cursor: 'pointer',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
        position: 'relative',
      }}
    >
      <Flex justify="between" align="center">
        <Text
          size="xs"
          weight="medium"
          style={{
            color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.75)',
            fontFamily: 'var(--font-geist-mono, monospace)',
          }}
        >
          {step}
        </Text>
        <Text
          size="xs"
          style={{
            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
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
    <Card style={{ overflow: 'hidden', padding: 0 }}>
      <Box style={{ padding: '16px 20px' }}>
        <Flex align="center" justify="between">
          <Text as={"h3" as any} size="md" weight="semibold">
            {scale.label}
          </Text>
          <Text
            size="xs"
            style={{
              color: 'var(--ds-color-text-muted)',
              fontFamily: 'var(--font-geist-mono, monospace)',
            }}
          >
            --ds-color-{scale.name}-*
          </Text>
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
    </Card>
  );
}

export default function ColorsPage() {
  const tokens = useTokens();

  return (
    <Stack spacing="lg">
      {/* Header */}
      <Box>
        <Flex align="center" gap={8}>
          <Link
            href="/foundations/tokens"
            style={{
              textDecoration: 'none',
              color: 'var(--ds-color-text-muted)',
              fontSize: '0.875rem',
            }}
          >
            Tokens
          </Link>
          <Text size="sm" style={{ color: 'var(--ds-color-text-muted)' }}>
            /
          </Text>
          <Text as={"h1" as any} size="2xl" weight="bold">
            Colors
          </Text>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Seven color scales -- neutral, primary, secondary, success, warning,
            error, and info -- each with steps from 50 (lightest) to 900
            (darkest). All values are CSS custom properties that tenants can
            override at runtime.
          </Text>
        </Box>
      </Box>

      {/* Semantic tokens */}
      <Card>
        <Stack spacing="sm">
          <Text size="sm" weight="semibold">
            Semantic text colors
          </Text>
          <Flex gap={16} style={{ flexWrap: 'wrap' }}>
            {[
              { label: '--ds-color-text-primary', var: 'var(--ds-color-text-primary)' },
              { label: '--ds-color-text-secondary', var: 'var(--ds-color-text-secondary)' },
              { label: '--ds-color-text-muted', var: 'var(--ds-color-text-muted)' },
            ].map((item) => (
              <Flex key={item.label} align="center" gap={8}>
                <Box
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: item.var,
                    border: '1px solid var(--ds-color-neutral-200)',
                  }}
                />
                <Text
                  size="xs"
                  style={{
                    fontFamily: 'var(--font-geist-mono, monospace)',
                    color: 'var(--ds-color-text-secondary)',
                  }}
                >
                  {item.label}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Stack>
      </Card>

      {/* Color scale grid */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: tokens.spacing[5],
        }}
      >
        {COLOR_SCALES.map((scale) => (
          <ColorScaleCard key={scale.name} scale={scale} />
        ))}
      </Box>

      {/* Usage */}
      <Card>
        <Stack spacing="sm">
          <Text size="sm" weight="semibold">
            Usage
          </Text>
          <Box
            style={{
              fontFamily: 'var(--font-geist-mono, monospace)',
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
              {`// In CSS or style objects`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`background: var(--ds-color-primary-500);`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`color: var(--ds-color-neutral-900);`}
            </Text>
            <br />
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-400)' }}>
              {`// With useTokens()`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`const tokens = useTokens();`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`tokens.colors.primaryScale[500]  // 'var(--ds-color-primary-500)'`}
            </Text>
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
