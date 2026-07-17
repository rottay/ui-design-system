import type { ReactNode } from 'react';
import { ShowroomLink as Link } from '@/composition/components/showroom-link';
import { Box, Card, Flex, Stack, Text } from '@rottay/design-system';

const panelBorder = '1px solid var(--landing-border, rgba(36, 30, 24, 0.12))';
const panelBorderStrong = '1px solid var(--landing-border-strong, rgba(36, 30, 24, 0.18))';

const RUNTIME_DIMENSIONS = [
  {
    label: 'Tenant',
    value: 'Chooses brand voice',
    detail:
      'Theme and posture should move in the playground and vertical docs, not in this editorial landing.',
  },
  {
    label: 'Engine',
    value: 'Changes renderer feel',
    detail:
      'Classic, Modern, and Rustic reshape density, radius, motion, and chrome on the same component contract.',
  },
  {
    label: 'Vertical',
    value: 'Frames product proof',
    detail:
      'Platform, BitHire, and Evnto organize the same system around different workflows, demos, and route-level stories.',
  },
] as const;

const RUNTIME_LANES = [
  {
    title: 'Playground',
    detail:
      'Switch tenant and engine on the same provider tree to see real runtime changes without landing-page chrome in the way.',
  },
  {
    title: 'Foundations',
    detail:
      'Inspect tokens, themes, and renderer differences in a focused environment that is built for explanation.',
  },
  {
    title: 'Catalog',
    detail:
      'Verify that live components, patterns, structures, and surfaces stay coherent once the runtime actually changes.',
  },
] as const;

function RuntimeBadge({
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
        border: isStrong ? '1px solid rgba(255, 255, 255, 0.12)' : panelBorder,
        background: isStrong ? 'rgba(24, 19, 15, 0.92)' : 'rgba(255, 255, 255, 0.70)',
        color: isStrong ? '#fffaf5' : 'var(--landing-ink, #18130f)',
        boxShadow: isStrong ? '0 10px 24px rgba(27, 22, 17, 0.10)' : 'none',
        backdropFilter: 'blur(12px)',
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

export function LandingRuntimePanel() {
  return (
    <Card
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(20px, 3.2vw, 28px)',
        borderRadius: 28,
        border: panelBorder,
        background:
          'linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, var(--landing-surface, #fffdfa) 100%)',
        boxShadow: 'var(--landing-shadow-md, 0 18px 44px rgba(27, 22, 17, 0.10))',
      }}
    >
      <Box
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at top right, rgba(111, 95, 77, 0.10) 0%, transparent 34%), radial-gradient(circle at bottom left, rgba(195, 178, 154, 0.18) 0%, transparent 40%)',
        }}
      />

      <Stack spacing="md" style={{ position: 'relative', zIndex: 1 }}>
        <Flex align="center" justify="between" gap={10} style={{ flexWrap: 'wrap' }}>
          <RuntimeBadge tone="strong">Editorial landing</RuntimeBadge>
          <RuntimeBadge>Static runtime explainer</RuntimeBadge>
        </Flex>

        <Box
          style={{
            padding: 16,
            borderRadius: 22,
            border: panelBorder,
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.68) 0%, var(--landing-panel, #f3ece2) 100%)',
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
              Runtime model
            </Text>
            <Text
              as={"h2" as any}
              size="xl"
              weight="bold"
              style={{ color: 'var(--landing-ink, #18130f)', letterSpacing: '-0.04em' }}
            >
              This panel intentionally explains runtime instead of mirroring it.
            </Text>
            <Text
              size="sm"
              style={{ color: 'var(--landing-muted, #5f5549)', lineHeight: 1.6 }}
            >
              The premium front door should not restyle itself per tenant. Its job is to
              describe how the system changes, then point teams to the parts of the
              showroom where tenant, engine, and vertical actually reshape the UI.
            </Text>
          </Stack>
        </Box>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
            gap: 10,
          }}
        >
          {RUNTIME_DIMENSIONS.map((item) => (
            <Box
              key={item.label}
              style={{
                minWidth: 0,
                padding: 12,
                borderRadius: 18,
                background: 'rgba(255, 255, 255, 0.62)',
                border: panelBorder,
              }}
            >
              <Stack spacing={4}>
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    color: 'var(--landing-subtle, #85796c)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {item.label}
                </Text>
                <Text
                  size="sm"
                  weight="semibold"
                  style={{ color: 'var(--landing-ink, #18130f)', overflowWrap: 'anywhere' }}
                >
                  {item.value}
                </Text>
                <Text
                  size="xs"
                  style={{ color: 'var(--landing-muted, #5f5549)', lineHeight: 1.5 }}
                >
                  {item.detail}
                </Text>
              </Stack>
            </Box>
          ))}
        </Box>

        <Box
          style={{
            padding: 14,
            borderRadius: 20,
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.66) 0%, var(--landing-panel, #f3ece2) 100%)',
            border: panelBorder,
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
              Where runtime becomes live
            </Text>
            <Stack spacing={8}>
              {RUNTIME_LANES.map((lane) => (
                <Box
                  key={lane.title}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 14,
                    border: panelBorder,
                    background: 'rgba(255, 255, 255, 0.58)',
                  }}
                >
                  <Stack spacing={4}>
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{ color: 'var(--landing-ink, #18130f)' }}
                    >
                      {lane.title}
                    </Text>
                    <Text
                      size="xs"
                      style={{ color: 'var(--landing-muted, #5f5549)', lineHeight: 1.55 }}
                    >
                      {lane.detail}
                    </Text>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Box>

        <Box
          style={{
            padding: 14,
            borderRadius: 20,
            border: panelBorderStrong,
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, var(--landing-surface-strong, #f7f1e8) 100%)',
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
              Practical rule
            </Text>
            <Text
              size="sm"
              style={{ color: 'var(--landing-muted, #5f5549)', lineHeight: 1.6 }}
            >
              Use the landing to orient, use foundations to understand, and use playground
              plus live docs to watch the runtime actually change.
            </Text>
          </Stack>
        </Box>

        <Flex gap={8} style={{ flexWrap: 'wrap' }}>
          <Link
            href="/playground"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 999,
              background: 'rgba(24, 19, 15, 0.92)',
              color: '#fffaf5',
              textDecoration: 'none',
              fontWeight: 600,
              boxShadow: '0 12px 28px rgba(27, 22, 17, 0.14)',
            }}
          >
            Open playground
          </Link>
          <Link
            href="/foundations/themes"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.70)',
              color: 'var(--landing-ink, #18130f)',
              textDecoration: 'none',
              fontWeight: 600,
              border: panelBorder,
              backdropFilter: 'blur(12px)',
            }}
          >
            Review themes
          </Link>
        </Flex>
      </Stack>
    </Card>
  );
}
