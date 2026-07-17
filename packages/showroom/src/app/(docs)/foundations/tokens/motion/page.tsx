'use client';

import { useState } from 'react';
import { ShowroomLink as Link } from '@/composition/components/showroom-link';
import {
  Badge,
  Box,
  Button,
  Card,
  DesignSystemProvider,
  Flex,
  Stack,
  Text,
} from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import { CodeBlock } from '@/composition/components/playground';
import { useShowroom } from '@/composition/components/showroom-context';

function TransitionDemo({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  const tokens = useTokens();
  const [active, setActive] = useState(false);

  return (
    <Box
      style={{
        padding: tokens.spacing[4],
        borderRadius: tokens.borderRadius.lg,
        border: '1px solid var(--ds-color-neutral-200)',
        background: 'var(--ds-color-white)',
      }}
    >
      <Stack spacing="sm">
        <Flex align="center" justify="between">
          <Stack spacing={2}>
            <Text
              size="sm"
              weight="semibold"
              style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
            >
              {label}
            </Text>
            <Text
              size="xs"
              style={{
                color: 'var(--ds-color-text-muted)',
                fontFamily: 'var(--font-geist-mono, monospace)',
              }}
            >
              {value}
            </Text>
          </Stack>
          <Button size="sm" onClick={() => setActive((current) => !current)}>
            {active ? 'Reset' : 'Play'}
          </Button>
        </Flex>
        <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
          {description}
        </Text>
        <Box
          style={{
            height: 56,
            position: 'relative',
            borderRadius: tokens.borderRadius.full,
            background: 'var(--ds-color-neutral-50)',
            overflow: 'hidden',
          }}
        >
          <Box
            style={{
              position: 'absolute',
              top: 12,
              left: active ? 'calc(100% - 44px)' : '12px',
              width: 32,
              height: 32,
              borderRadius: tokens.borderRadius.md,
              background: 'var(--ds-color-primary-500)',
              transition: `left ${value}`,
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
}

function HoverDemo({
  label,
  transform,
}: {
  label: string;
  transform: string;
}) {
  const tokens = useTokens();

  return (
    <Box style={{ textAlign: 'center' }}>
      <Box
        style={{
          width: 72,
          height: 72,
          margin: '0 auto',
          borderRadius: tokens.borderRadius.lg,
          background: 'var(--ds-color-primary-100)',
          border: '1px solid var(--ds-color-primary-300)',
          transition: `all ${tokens.motion.hover}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        onMouseEnter={(event: React.MouseEvent<HTMLDivElement>) => {
          const element = event.currentTarget;
          element.style.transform = transform;
          element.style.boxShadow = tokens.shadows.md;
          element.style.background = 'var(--ds-color-primary-200)';
        }}
        onMouseLeave={(event: React.MouseEvent<HTMLDivElement>) => {
          const element = event.currentTarget;
          element.style.transform = 'none';
          element.style.boxShadow = 'none';
          element.style.background = 'var(--ds-color-primary-100)';
        }}
      >
        <Text size="xs" weight="semibold" style={{ color: 'var(--ds-color-primary-700)' }}>
          Hover
        </Text>
      </Box>
      <Text
        size="xs"
        style={{
          marginTop: 8,
          color: 'var(--ds-color-text-secondary)',
          fontFamily: 'var(--font-geist-mono, monospace)',
        }}
      >
        {label}
      </Text>
    </Box>
  );
}

function EntranceDemo() {
  const tokens = useTokens();
  const [key, setKey] = useState(0);

  const entrances = [
    { name: 'fadeIn', style: { animation: `fadeIn 600ms ${tokens.motion.spring} forwards` } },
    { name: 'slideUp', style: { animation: `slideUp 420ms ${tokens.motion.spring} forwards` } },
    { name: 'scaleIn', style: { animation: `scaleIn 420ms ${tokens.motion.spring} forwards` } },
  ];

  return (
    <Card style={{ padding: tokens.spacing[5] }}>
      <Stack spacing="md">
        <Flex align="center" justify="between" style={{ flexWrap: 'wrap' }}>
          <Box>
            <Text as={"h2" as any} size="lg" weight="semibold">
              Entrance choreography
            </Text>
            <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
              Useful presets for modules entering premium documentation and workspace UI.
            </Text>
          </Box>
          <Button size="sm" onClick={() => setKey((current) => current + 1)}>
            Replay
          </Button>
        </Flex>
        <Flex gap={24} style={{ flexWrap: 'wrap' }}>
          {entrances.map((entrance) => (
            <Box key={`${entrance.name}-${key}`} style={{ textAlign: 'center' }}>
              <Box
                style={{
                  width: 72,
                  height: 72,
                  margin: '0 auto',
                  borderRadius: tokens.borderRadius.lg,
                  background: 'var(--ds-color-primary-500)',
                  opacity: 0,
                  ...entrance.style,
                }}
              />
              <Text
                size="xs"
                style={{
                  marginTop: 8,
                  fontFamily: 'var(--font-geist-mono, monospace)',
                  color: 'var(--ds-color-text-secondary)',
                }}
              >
                {entrance.name}
              </Text>
            </Box>
          ))}
        </Flex>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.92); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </Stack>
    </Card>
  );
}

function MotionProfilePreview({
  engine,
  label,
}: {
  engine: 'classic' | 'modern' | 'rustic';
  label: string;
}) {
  const { tenantSlug } = useShowroom();

  return (
    <DesignSystemProvider tenantSlug={tenantSlug} forceEngine={engine}>
      <MotionProfilePreviewContent label={label} />
    </DesignSystemProvider>
  );
}

function MotionProfilePreviewContent({ label }: { label: string }) {
  const tokens = useTokens();

  return (
    <Card style={{ padding: tokens.spacing[4], height: '100%' }}>
      <Stack spacing="md">
        <Flex align="center" justify="between">
          <Text size="sm" weight="semibold">
            {label}
          </Text>
          <Badge variant="secondary">{tokens.motion.durationScale}x</Badge>
        </Flex>
        <Stack spacing={6}>
          <Text
            size="xs"
            style={{
              color: 'var(--ds-color-text-muted)',
              fontFamily: 'var(--font-geist-mono, monospace)',
            }}
          >
            hover: {tokens.motion.hover}
          </Text>
          <Text
            size="xs"
            style={{
              color: 'var(--ds-color-text-muted)',
              fontFamily: 'var(--font-geist-mono, monospace)',
            }}
          >
            transform: {tokens.motion.transform || 'none'}
          </Text>
          <Text
            size="xs"
            style={{
              color: 'var(--ds-color-text-muted)',
              fontFamily: 'var(--font-geist-mono, monospace)',
            }}
          >
            spring: {tokens.motion.spring}
          </Text>
        </Stack>
        <Box
          style={{
            height: 54,
            borderRadius: 999,
            background: 'var(--ds-color-neutral-50)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            style={{
              position: 'absolute',
              top: 11,
              left: 12,
              width: 32,
              height: 32,
              borderRadius: tokens.borderRadius.md,
              background: 'var(--ds-color-primary-500)',
              animation: `motion-profile-slide ${Math.max(tokens.motion.durationScale, 0.6) * 1.3}s ${tokens.motion.spring} infinite alternate`,
            }}
          />
        </Box>
        <style>{`
          @keyframes motion-profile-slide {
            from { transform: translateX(0); }
            to { transform: translateX(120px); }
          }
        `}</style>
      </Stack>
    </Card>
  );
}

export default function MotionPage() {
  const tokens = useTokens();

  return (
    <Stack spacing="lg">
      <Box
        style={{
          padding: tokens.spacing[5],
          borderRadius: tokens.borderRadius.xl,
          background:
            'radial-gradient(circle at top left, rgba(0,102,204,0.14), transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94))',
          border: '1px solid rgba(0, 102, 204, 0.1)',
        }}
      >
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: tokens.spacing[5],
            alignItems: 'start',
          }}
        >
          <Stack spacing="lg">
            <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
              <Link
                href="/foundations/tokens"
                style={{
                  textDecoration: 'none',
                  color: 'var(--ds-color-primary-600)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                Tokens
              </Link>
              <Text size="sm" style={{ color: 'var(--ds-color-text-muted)' }}>
                /
              </Text>
              <Badge variant="secondary">Interaction cadence</Badge>
            </Flex>
            <Stack spacing="sm">
              <Text as={"h1" as any} size="2xl" weight="bold" style={{ letterSpacing: '-0.04em' }}>
                Motion is where a neutral component API starts to feel product-specific.
              </Text>
              <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
                Hover timing, lift transforms, spring easing, and duration
                scaling give each engine a different sense of confidence.
                Motion should clarify interaction, not perform for its own sake.
              </Text>
            </Stack>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: tokens.spacing[4],
              }}
            >
              {[
                {
                  label: 'Hover',
                  value: tokens.motion.hover,
                  detail: 'Applied to most micro-interactions.',
                },
                {
                  label: 'Transform',
                  value: tokens.motion.transform || 'none',
                  detail: 'Lift or scale personality on hover.',
                },
                {
                  label: 'Duration scale',
                  value: `${tokens.motion.durationScale}x`,
                  detail: 'Controls overall motion pacing.',
                },
              ].map((item) => (
                <Card key={item.label} style={{ padding: tokens.spacing[4] }}>
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
                      {item.label}
                    </Text>
                    <Text size="sm" weight="bold" style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}>
                      {item.value}
                    </Text>
                    <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                      {item.detail}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </Box>
          </Stack>

          <Card style={{ padding: tokens.spacing[5], background: 'rgba(15,23,42,0.95)', color: 'var(--ds-color-white)' }}>
            <Stack spacing="md">
              <Text size="sm" weight="semibold">
                Active motion profile
              </Text>
              <Box
                style={{
                  height: 64,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    width: 32,
                    height: 32,
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.92)',
                    animation: `motion-hero-slide ${Math.max(tokens.motion.durationScale, 0.6) * 1.5}s ${tokens.motion.spring} infinite alternate`,
                  }}
                />
              </Box>
              <style>{`
                @keyframes motion-hero-slide {
                  from { transform: translateX(0) ${tokens.motion.transform || ''}; }
                  to { transform: translateX(152px) ${tokens.motion.transform || ''}; }
                }
              `}</style>
              <Text size="xs" style={{ color: 'rgba(255,255,255,0.66)' }}>
                Same component, different choreography depending on engine.
              </Text>
            </Stack>
          </Card>
        </Box>
      </Box>

      <Stack spacing="md">
        <Flex align="center" justify="between" style={{ flexWrap: 'wrap' }}>
          <Text as={"h2" as any} size="lg" weight="semibold">
            Engine motion profiles
          </Text>
          <Badge variant="secondary">Three personalities</Badge>
        </Flex>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: tokens.spacing[4],
          }}
        >
          <MotionProfilePreview engine="classic" label="Classic" />
          <MotionProfilePreview engine="modern" label="Modern" />
          <MotionProfilePreview engine="rustic" label="Rustic" />
        </Box>
      </Stack>

      <Card style={{ padding: tokens.spacing[5] }}>
        <Stack spacing="md">
          <Flex align="center" justify="between" style={{ flexWrap: 'wrap' }}>
            <Text as={"h2" as any} size="lg" weight="semibold">
              Transition presets
            </Text>
            <Badge variant="secondary">Micro-interactions</Badge>
          </Flex>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: tokens.spacing[4],
            }}
          >
            <TransitionDemo
              label="fast"
              value="100ms ease"
              description="Useful for toggles, checks, and icon state changes."
            />
            <TransitionDemo
              label="normal"
              value="200ms ease"
              description="The everyday hover and focus baseline."
            />
            <TransitionDemo
              label="slow"
              value="300ms ease"
              description="Panel open states and deliberate layout shifts."
            />
            <TransitionDemo
              label="slower"
              value="500ms ease"
              description="Use sparingly for narrative transitions and dramatic reveals."
            />
          </Box>
        </Stack>
      </Card>

      <Card style={{ padding: tokens.spacing[5] }}>
        <Stack spacing="md">
          <Text as={"h2" as any} size="lg" weight="semibold">
            Hover behavior
          </Text>
            <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
              Hover is where engines advertise their personality. Try the cards
              below to feel lift, scale, and combined movement.
            </Text>
          <Flex gap={32} style={{ flexWrap: 'wrap', paddingTop: tokens.spacing[2] }}>
            <HoverDemo label="Lift" transform={tokens.motion.transform || 'translateY(-2px)'} />
            <HoverDemo label="Scale" transform="scale(1.04)" />
            <HoverDemo label="Combined" transform={`scale(1.02) ${tokens.motion.transform || 'translateY(-1px)'}`} />
          </Flex>
        </Stack>
      </Card>

      <EntranceDemo />

      <CodeBlock
        title="Motion usage"
        language="tsx"
        code={`const tokens = useTokens();

<Box
  style={{
    transition: \`all \${tokens.motion.hover}\`,
    transform: isHovered ? tokens.motion.transform : 'none',
  }}
/>

transition: var(--ds-transition-normal);`}
      />
    </Stack>
  );
}
