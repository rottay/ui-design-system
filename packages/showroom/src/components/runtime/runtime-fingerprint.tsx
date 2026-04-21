'use client';

import type { ReactNode } from 'react';
import { Badge, Box, Flex, Stack, Text, useTokens } from '@rottay/design-system';
import { useShowroomRuntime } from '@/components/showroom-context';

export interface RuntimeFingerprintProps {
  compact?: boolean;
  itemLimit?: number;
  showHeader?: boolean;
}

interface RuntimeMetric {
  label: string;
  note?: string;
  preview: ReactNode;
  value: string;
  mono?: boolean;
}

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getBadgeRadius(shape: 'rounded' | 'pill' | 'square', radius: string) {
  switch (shape) {
    case 'pill':
      return '999px';
    case 'square':
      return '10px';
    case 'rounded':
    default:
      return radius;
  }
}

export function RuntimeFingerprint({
  compact = false,
  itemLimit,
  showHeader = true,
}: RuntimeFingerprintProps) {
  const runtime = useShowroomRuntime();
  const tokens = useTokens();
  const badgeRadius = getBadgeRadius(
    tokens.personality.accent.badgeShape,
    tokens.borderRadius.md
  );
  const densityGap =
    tokens.personality.card.paddingDensity === 'compact'
      ? 4
      : tokens.personality.card.paddingDensity === 'spacious'
        ? 10
        : 7;
  const accentPreviewStyle =
    tokens.personality.accent.barPosition === 'left'
      ? {
          inset: '10px auto 10px 10px',
          width: `${tokens.personality.accent.barThickness}px`,
          height: 'calc(100% - 20px)',
        }
      : {
          inset: '10px 10px auto 10px',
          width: 'calc(100% - 20px)',
          height: `${tokens.personality.accent.barThickness}px`,
        };

  const metrics: RuntimeMetric[] = [
    {
      label: 'Runtime',
      value: `${runtime.tenantName} / ${toTitleCase(runtime.engine)}`,
      note: runtime.productProfileLabel,
      preview: (
        <Flex gap={6} style={{ flexWrap: 'wrap' }}>
          <Badge variant="secondary">{runtime.verticalLabel}</Badge>
          <Badge variant="secondary">{runtime.tenantName}</Badge>
        </Flex>
      ),
    },
    {
      label: 'Primary',
      value: tokens.colors.primary,
      note: `Secondary ${tokens.colors.secondary}`,
      mono: true,
      preview: (
        <Flex align="center" gap={8}>
          {[tokens.colors.primary, tokens.colors.secondary, tokens.colors.info].map((swatch, index) => (
            <Box
              key={`${swatch}-${index}`}
              style={{
                width: compact ? 16 : 18,
                height: compact ? 16 : 18,
                borderRadius: 999,
                background: swatch,
                border: '1px solid var(--ds-color-border-subtle, rgba(15, 23, 42, 0.08))',
                boxShadow: `0 0 0 4px color-mix(in srgb, ${swatch} 14%, transparent)`,
              }}
            />
          ))}
        </Flex>
      ),
    },
    {
      label: 'Radius',
      value: tokens.borderRadius.lg,
      note: `xl ${tokens.borderRadius.xl}`,
      mono: true,
      preview: (
        <Box
          style={{
            width: compact ? 52 : 60,
            height: compact ? 34 : 38,
            borderRadius: tokens.borderRadius.lg,
            border: '1px solid var(--ds-color-border-subtle)',
            background:
              'linear-gradient(135deg, color-mix(in srgb, var(--ds-color-primary, #ffffff) 16%, var(--ds-color-bg-elevated, #ffffff)) 0%, color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 82%, var(--ds-color-bg-elevated, #ffffff)) 100%)',
            boxShadow: tokens.shadows.sm,
          }}
        />
      ),
    },
    {
      label: 'Density',
      value: tokens.personality.card.paddingDensity,
      note: tokens.personality.card.showBorder ? 'Bordered cards' : 'Border-light cards',
      preview: (
        <Stack spacing="xs" style={{ gap: densityGap, width: compact ? 56 : 72 }}>
          {[1, 2, 3].map((row) => (
            <Box
              key={row}
              style={{
                height: row === 1 ? 6 : 5,
                borderRadius: 999,
                background:
                  row === 1
                    ? 'color-mix(in srgb, var(--ds-color-primary, #ffffff) 68%, transparent)'
                    : 'color-mix(in srgb, var(--ds-color-text-secondary, #6b7280) 18%, transparent)',
              }}
            />
          ))}
        </Stack>
      ),
    },
    {
      label: 'Accent',
      value: tokens.personality.accent.badgeShape,
      note: `${tokens.personality.accent.barPosition} bar · ${tokens.personality.accent.dividerStyle} dividers`,
      preview: (
        <Flex align="center" gap={10}>
          <Box
            style={{
              position: 'relative',
              width: compact ? 40 : 48,
              height: compact ? 34 : 38,
              borderRadius: tokens.borderRadius.lg,
              border: '1px solid var(--ds-color-border-subtle)',
              background: 'var(--ds-color-bg-elevated, #ffffff)',
              overflow: 'hidden',
            }}
          >
            <Box
              style={{
                position: 'absolute',
                background:
                  tokens.personality.accent.barStyle === 'animated'
                    ? 'linear-gradient(90deg, var(--ds-color-primary, #ffffff) 0%, var(--ds-color-secondary, #ffffff) 100%)'
                    : 'var(--ds-color-primary, #ffffff)',
                ...accentPreviewStyle,
              }}
            />
          </Box>
          <Box
            style={{
              padding: compact ? '5px 8px' : '6px 10px',
              borderRadius: badgeRadius,
              border: '1px solid var(--ds-color-border-subtle)',
              background:
                'color-mix(in srgb, var(--ds-color-primary, #ffffff) 12%, var(--ds-color-bg-elevated, #ffffff))',
            }}
          >
            <Text
              size="xs"
              weight="semibold"
              style={{ display: 'block', color: 'var(--ds-color-text-primary)' }}
            >
              Badge
            </Text>
          </Box>
        </Flex>
      ),
    },
    {
      label: 'Motion',
      value: tokens.personality.animation.entrance,
      note: `Hover lift ${tokens.personality.animation.hoverLift}px`,
      preview: (
        <Flex align="end" gap={6}>
          {[10, 16, 24].map((height, index) => (
            <Box
              key={height}
              style={{
                width: compact ? 8 : 10,
                height,
                borderRadius: 999,
                background:
                  index === 2
                    ? 'var(--ds-color-primary, #ffffff)'
                    : 'color-mix(in srgb, var(--ds-color-primary, #ffffff) 26%, transparent)',
                transform:
                  index === 2 && tokens.personality.animation.hoverLift > 0
                    ? `translateY(-${Math.min(tokens.personality.animation.hoverLift, 4)}px)`
                    : 'none',
                transition: tokens.motion.hover,
              }}
            />
          ))}
        </Flex>
      ),
    },
  ];

  const visibleMetrics = itemLimit ? metrics.slice(0, itemLimit) : metrics;
  const gap = compact ? 8 : 12;
  const tileRadius = compact ? tokens.borderRadius.lg : tokens.borderRadius.xl;
  const compactColumns = compact ? 3 : 4;

  return (
    <Stack spacing={compact ? 'xs' : 'sm'} fullWidth>
      {showHeader ? (
        <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
          <Box>
            <Text size="sm" weight="semibold">
              Runtime fingerprint
            </Text>
            <Text
              size="xs"
              style={{
                marginTop: 4,
                color: 'var(--ds-color-text-secondary)',
              }}
            >
              These values come from the active tenant, vertical, engine, and resolved DS tokens.
            </Text>
          </Box>
          <Flex gap={8} style={{ flexWrap: 'wrap' }}>
            <Badge variant="secondary">Real DS state</Badge>
            <Badge variant="secondary">No local skin</Badge>
          </Flex>
        </Flex>
      ) : null}

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: compact
            ? 'repeat(3, minmax(0, 1fr))'
            : 'repeat(auto-fit, minmax(196px, 1fr))',
          gap,
        }}
      >
        {visibleMetrics.map((metric) => (
          <Box
            key={metric.label}
            style={{
              minWidth: 0,
              display: 'grid',
              alignContent: 'start',
              gap: compact ? 8 : 10,
              padding: compact ? '9px 10px' : 14,
              minHeight: compact ? 132 : undefined,
              borderRadius: tileRadius,
              border: '1px solid var(--ds-color-border-subtle, #e5e7eb)',
              background:
                compact
                  ? 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 84%, var(--ds-color-primary, #ffffff) 5%) 0%, color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 78%, var(--ds-color-bg-elevated, #ffffff)) 100%)'
                  : 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 88%, var(--ds-color-primary, #ffffff) 7%) 0%, color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 76%, var(--ds-color-bg-elevated, #ffffff)) 100%)',
              boxShadow: compact ? 'none' : tokens.shadows.md,
            }}
          >
            <Flex align="center" justify="between" gap={10}>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: 'block',
                  color: 'var(--ds-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  fontSize: compact ? 10 : undefined,
                }}
              >
                {metric.label}
              </Text>
              {compact ? null : (
                <Badge variant="secondary">
                  {metric.label === 'Runtime' ? runtime.tenantName : toTitleCase(runtime.engine)}
                </Badge>
              )}
            </Flex>

            <Box
              style={{
                minWidth: 0,
                padding: compact ? '0' : '12px 13px',
                borderRadius: compact ? undefined : tokens.borderRadius.lg,
                border: compact
                  ? 'none'
                  : '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 84%, transparent)',
                background: compact
                  ? 'transparent'
                  : 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 72%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 82%, transparent) 100%)',
              }}
            >
              {metric.preview}
            </Box>

            <Box
              style={{
                minWidth: 0,
                paddingTop: compact ? 6 : 8,
                borderTop: compact
                  ? '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 72%, transparent)'
                  : '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 84%, transparent)',
              }}
            >
              <Text
                size={compact ? 'xs' : 'sm'}
                weight="semibold"
                style={{
                  display: 'block',
                  minWidth: 0,
                  lineHeight: compact ? 1.2 : 1.35,
                  wordBreak: 'break-word',
                  fontFamily: metric.mono ? 'var(--font-geist-mono)' : undefined,
                }}
              >
                {metric.value}
              </Text>
              {metric.note ? (
                <Text
                  size="xs"
                  style={{
                    display: 'block',
                    marginTop: compact ? 3 : 5,
                    color: 'var(--ds-color-text-secondary)',
                    lineHeight: compact ? 1.35 : 1.5,
                    maxHeight: compact ? 34 : undefined,
                    overflow: compact ? 'auto' : undefined,
                  }}
                >
                  {metric.note}
                </Text>
              ) : null}
            </Box>
          </Box>
        ))}
      </Box>
      {compact ? (
        <Text
          size="xs"
          style={{
            color: 'var(--ds-color-text-muted)',
            lineHeight: 1.45,
          }}
        >
          Compact runtime evidence across {Math.min(visibleMetrics.length, compactColumns)}+ token signals.
        </Text>
      ) : null}
    </Stack>
  );
}
