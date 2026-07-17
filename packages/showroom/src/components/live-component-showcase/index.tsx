'use client';

import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Input,
  Stack,
  Text,
} from '@rottay/design-system';
import { RuntimeFingerprint } from '@/composition/components/runtime/runtime-fingerprint';
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
  mixWithSurface,
} from '@/composition/components/playground/surface-tokens';

export interface LiveComponentShowcaseProps {
  mode?: 'compact' | 'full';
  showIntro?: boolean;
  title?: string;
  description?: string;
}

const COMPONENT_NAMES = ['Button', 'Input', 'Badge', 'Card'] as const;

function InsightCard({
  title,
  value,
  detail,
  tone,
}: {
  title: string;
  value: string;
  detail: string;
  tone: string;
}) {
  return (
    <Box
      style={{
        padding: 14,
        borderRadius: 18,
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
        background: `linear-gradient(180deg, ${mixWithSurface(
          tone,
          12,
          SHOWROOM_SURFACES.surface,
        )} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
      }}
    >
      <Text
        size="xs"
        weight="semibold"
        style={{
          color: SHOWROOM_SURFACES.textTertiary,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {title}
      </Text>
      <Text size="lg" weight="bold" style={{ marginTop: 10, color: SHOWROOM_SURFACES.text }}>
        {value}
      </Text>
      <Text
        size="xs"
        style={{
          marginTop: 6,
          color: SHOWROOM_SURFACES.textSecondary,
          lineHeight: 1.55,
        }}
      >
        {detail}
      </Text>
    </Box>
  );
}

export function LiveComponentShowcase({
  mode = 'full',
  showIntro = true,
  title = 'Live runtime sample',
  description = 'These controls render directly from the active provider, so engine and tenant changes should show up in the components themselves instead of a showroom-only skin.',
}: LiveComponentShowcaseProps) {
  const compact = mode === 'compact';
  const padding = compact ? 16 : 22;

  return (
    <Stack spacing={compact ? 'sm' : 'md'} fullWidth>
      {showIntro ? (
        <Box
          style={{
            padding: compact ? 16 : 18,
            borderRadius: 22,
            border: `1px solid ${SHOWROOM_SURFACES.border}`,
            background: `linear-gradient(180deg, ${mixWithSurface(
              'var(--ds-color-primary, #60a5fa)',
              10,
              SHOWROOM_SURFACES.subtle,
            )} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
            boxShadow: SHOWROOM_SURFACES.shadow,
          }}
        >
          <Flex
            align="center"
            justify="between"
            gap={12}
            style={{ flexWrap: 'wrap' }}
          >
            <Box style={{ minWidth: 0, maxWidth: compact ? '100%' : 760 }}>
              <Text size={compact ? 'sm' : 'md'} weight="semibold" style={{ color: SHOWROOM_SURFACES.text }}>
                {title}
              </Text>
              <Text
                size="xs"
                style={{
                  marginTop: 6,
                  color: SHOWROOM_SURFACES.textSecondary,
                  lineHeight: 1.6,
                }}
              >
                {description}
              </Text>
            </Box>

            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              {COMPONENT_NAMES.map((name) => (
                <Badge key={name} variant="secondary">
                  {name}
                </Badge>
              ))}
            </Flex>
          </Flex>
        </Box>
      ) : null}

      <Box
        style={{
          padding,
          borderRadius: 26,
          border: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${mixWithCanvas(
            'var(--ds-color-primary, #60a5fa)',
            9,
          )} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
          boxShadow: SHOWROOM_SURFACES.shadow,
        }}
      >
        <Stack spacing={compact ? 'sm' : 'md'} fullWidth>
          <Flex
            align="center"
            justify="between"
            gap={12}
            style={{ flexWrap: 'wrap' }}
          >
            <Box style={{ minWidth: 0 }}>
              <Text size="xs" weight="semibold" style={{ color: SHOWROOM_SURFACES.textTertiary }}>
                LIVE COMPONENT SHELF
              </Text>
              <Text
                size="sm"
                weight="semibold"
                style={{ marginTop: 6, color: SHOWROOM_SURFACES.text }}
              >
                Operator moment
              </Text>
              <Text
                size="xs"
                style={{
                  marginTop: 6,
                  color: SHOWROOM_SURFACES.textSecondary,
                  lineHeight: 1.55,
                }}
              >
                A runtime-safe control shelf with real DS inputs, badges, buttons, and nested card surfaces.
              </Text>
            </Box>

            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="secondary">Real runtime</Badge>
              <Badge variant="secondary">Tenant-safe framing</Badge>
            </Flex>
          </Flex>

          <Box
            className="showroom-live-component-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: compact
                ? '1fr'
                : 'minmax(0, 1.38fr) minmax(240px, 0.72fr)',
              gap: 14,
              alignItems: 'stretch',
            }}
          >
            <Box
              style={{
                padding: compact ? 14 : 18,
                borderRadius: 22,
                border: `1px solid ${SHOWROOM_SURFACES.border}`,
                background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithSurface(
                  'var(--ds-color-primary, #60a5fa)',
                  7,
                  SHOWROOM_SURFACES.subtle,
                )} 100%)`,
              }}
            >
              <Stack spacing={compact ? 'sm' : 'md'} fullWidth>
                <Flex gap={6}>
                  {['12%', '20%', '28%'].map((opacity, index) => (
                    <Box
                      key={`showcase-dot-${index}`}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: `color-mix(in srgb, var(--ds-color-primary, #60a5fa) ${opacity}, ${SHOWROOM_SURFACES.text})`,
                      }}
                    />
                  ))}
                </Flex>

                <Input placeholder="Search tenants, records, or venues..." />

                <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                  <Button size={compact ? 'sm' : 'md'} variant="ghost">
                    Share
                  </Button>
                  <Button size={compact ? 'sm' : 'md'}>Save draft</Button>
                  <Button size={compact ? 'sm' : 'md'} variant="primary">
                    Publish update
                  </Button>
                </Flex>

                <Box
                  style={{
                    padding: compact ? 12 : 14,
                    borderRadius: 18,
                    border: `1px solid ${SHOWROOM_SURFACES.border}`,
                    background: `linear-gradient(180deg, ${mixWithCanvas(
                      'var(--ds-color-primary, #60a5fa)',
                      6,
                    )} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
                  }}
                >
                  <RuntimeFingerprint compact itemLimit={6} showHeader={false} />
                </Box>
              </Stack>
            </Box>

            <Stack spacing="sm">
              <InsightCard
                title="Provisioning health"
                value="Healthy"
                detail="Validation, emphasis, and containment should move with the runtime instead of being repainted locally."
                tone="#22c55e"
              />
              <InsightCard
                title="Release readiness"
                value="3 checkpoints"
                detail="Semantic badges and layered cards should stay legible even when the tenant is dark-first and primary shifts to white."
                tone="#f59e0b"
              />
              <Card
                style={{
                  padding: compact ? 12 : 14,
                  border: `1px solid ${SHOWROOM_SURFACES.border}`,
                  background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithSurface(
                    '#8b5cf6',
                    8,
                    SHOWROOM_SURFACES.subtle,
                  )} 100%)`,
                  boxShadow: 'none',
                }}
              >
                <Stack spacing="sm">
                  <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                    <Badge variant="secondary">Draft</Badge>
                    <Badge variant="warning">Review</Badge>
                    <Badge variant="error">Blocked</Badge>
                  </Flex>
                  <Text
                    size="xs"
                    style={{
                      color: SHOWROOM_SURFACES.textSecondary,
                      lineHeight: 1.6,
                    }}
                  >
                    This side rail is where contrast issues show up first, so the wrapper stays token-driven instead of assuming a white panel.
                  </Text>
                </Stack>
              </Card>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <style>{`
        @container showroom-content (max-width: 1320px) {
          .showroom-live-component-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Stack>
  );
}
