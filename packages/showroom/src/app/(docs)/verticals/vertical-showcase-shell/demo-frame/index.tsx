'use client';

import { useShowroomRuntime } from '@/components/showroom-context';
import {
  Badge,
  Box,
  Card,
  Flex,
  Stack,
  Text,
  useTokens,
} from '@rottay/design-system';

import {
  BORDER,
  ELEVATED_SURFACE,
  PANEL_SHADOW,
  SURFACE,
  TEXT_MUTED,
  TEXT_SECONDARY,
} from '../foundation';

export function DemoFrame({
  title,
  description,
  badge,
  children,
  viewportHeight,
  accentTint,
  accentBorder,
}: {
  title: string;
  description: string;
  badge: string;
  children: React.ReactNode;
  viewportHeight?: number;
  accentTint: string;
  accentBorder: string;
}) {
  const tokens = useTokens();
  const runtime = useShowroomRuntime();

  return (
    <Card
      style={{
        padding: tokens.spacing[4],
        border: `1px solid ${accentBorder}`,
        background: `linear-gradient(180deg, color-mix(in srgb, ${accentTint} 46%, ${SURFACE}) 0%, ${SURFACE} 100%)`,
        overflow: 'hidden',
        alignSelf: 'start',
        boxShadow:
          '0 24px 56px color-mix(in srgb, var(--ds-color-shadow, rgba(15, 23, 42, 0.18)) 24%, transparent)',
      }}
    >
      <Stack spacing="md">
        <Flex
          align="start"
          justify="between"
          style={{
            flexWrap: 'wrap',
            gap: 12,
            paddingBottom: tokens.spacing[3],
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <Box style={{ minWidth: 0, flex: '1 1 220px' }}>
            <Text
              size="xs"
              weight="semibold"
              style={{
                display: 'block',
                color: TEXT_MUTED,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Live frame
            </Text>
            <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: 'block', marginTop: 6 }}>
              {title}
            </Text>
            <Text
              size="sm"
              style={{
                display: 'block',
                marginTop: 8,
                color: TEXT_SECONDARY,
                lineHeight: 1.62,
                maxWidth: '60ch',
              }}
            >
              {description}
            </Text>
          </Box>
          <Badge variant="secondary">{badge}</Badge>
        </Flex>

        <Box
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: tokens.borderRadius.xl,
            padding: tokens.spacing[2],
            background: `linear-gradient(180deg, color-mix(in srgb, ${accentTint} 52%, var(--ds-color-bg-elevated, #ffffff)) 0%, ${ELEVATED_SURFACE} 100%)`,
            overflow: 'hidden',
            boxShadow: PANEL_SHADOW,
          }}
        >
          <Flex
            align="center"
            justify="between"
            gap={8}
            style={{
              flexWrap: 'wrap',
              marginBottom: tokens.spacing[3],
              paddingBottom: tokens.spacing[3],
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="primary">Live DS runtime</Badge>
              <Text size="xs" style={{ display: 'block', color: TEXT_MUTED }}>
                No local skin override
              </Text>
            </Flex>
            <Box
              style={{
                padding: '8px 10px',
                borderRadius: 999,
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
              }}
            >
              <Text
                size="xs"
                style={{
                  display: 'block',
                  color: TEXT_SECONDARY,
                  fontFamily: 'var(--font-geist-mono, monospace)',
                  lineHeight: 1.35,
                }}
              >
                {runtime.tenantName} / {runtime.engine} / {runtime.productProfileLabel}
              </Text>
            </Box>
          </Flex>
          <Box
            style={{
              position: 'relative',
              minWidth: 0,
              overflow: 'hidden',
              borderRadius: tokens.borderRadius.lg,
              border: `1px solid color-mix(in srgb, ${accentBorder} 88%, ${BORDER})`,
              background: `linear-gradient(180deg, color-mix(in srgb, ${SURFACE} 88%, ${accentTint}) 0%, ${SURFACE} 100%)`,
              boxShadow:
                'inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 72%, transparent)',
            }}
          >
            <Box
              style={{
                minWidth: 0,
                maxHeight: viewportHeight,
                overflowY: viewportHeight ? 'auto' : 'visible',
                overflowX: 'hidden',
                padding: viewportHeight ? `0 ${tokens.spacing[1]}px 0 0` : 0,
                borderRadius: `calc(${tokens.borderRadius.lg} - 1px)`,
              }}
            >
              {children}
            </Box>
            {viewportHeight ? (
              <Box
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 'auto 0 0 0',
                  height: 72,
                  pointerEvents: 'none',
                  background:
                    'linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, var(--ds-color-bg-container, #ffffff) 82%)',
                }}
              />
            ) : null}
          </Box>
        </Box>
      </Stack>
    </Card>
  );
}
