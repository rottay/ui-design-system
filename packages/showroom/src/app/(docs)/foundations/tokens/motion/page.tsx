'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge, Button } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';

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
        borderRadius: tokens.borderRadius.md,
        border: '1px solid var(--ds-color-neutral-200)',
      }}
    >
      <Flex align="center" justify="between" style={{ marginBottom: tokens.spacing[3] }}>
        <Box>
          <Text
            size="sm"
            weight="semibold"
            style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
          >
            {label}
          </Text>
          <Box style={{ marginTop: 2 }}>
            <Text
              size="xs"
              style={{
                fontFamily: 'var(--font-geist-mono, monospace)',
                color: 'var(--ds-color-text-muted)',
              }}
            >
              {value}
            </Text>
          </Box>
        </Box>
        <Button
          size="sm"
          onClick={() => setActive((v) => !v)}
        >
          {active ? 'Reset' : 'Play'}
        </Button>
      </Flex>

      <Text
        size="xs"
        style={{
          color: 'var(--ds-color-text-secondary)',
          marginBottom: tokens.spacing[3],
        }}
      >
        {description}
      </Text>

      {/* Animated preview */}
      <Box
        style={{
          height: 48,
          position: 'relative',
          background: 'var(--ds-color-neutral-50)',
          borderRadius: tokens.borderRadius.sm,
          overflow: 'hidden',
        }}
      >
        <Box
          style={{
            position: 'absolute',
            top: 8,
            left: active ? 'calc(100% - 40px)' : '8px',
            width: 32,
            height: 32,
            borderRadius: tokens.borderRadius.md,
            background: 'var(--ds-color-primary-500)',
            transition: `left ${value}`,
          }}
        />
      </Box>
    </Box>
  );
}

function HoverDemo({
  label,
  hoverTransition,
  transform,
}: {
  label: string;
  hoverTransition: string;
  transform: string;
}) {
  const tokens = useTokens();

  return (
    <Box style={{ textAlign: 'center' }}>
      <Box
        style={{
          width: 64,
          height: 64,
          borderRadius: tokens.borderRadius.md,
          background: 'var(--ds-color-primary-100)',
          border: '1px solid var(--ds-color-primary-300)',
          margin: '0 auto',
          cursor: 'pointer',
          transition: `all ${hoverTransition}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
          const el = e.currentTarget;
          el.style.transform = transform || 'scale(1.05)';
          el.style.boxShadow = tokens.shadows.md;
          el.style.background = 'var(--ds-color-primary-200)';
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
          const el = e.currentTarget;
          el.style.transform = 'none';
          el.style.boxShadow = 'none';
          el.style.background = 'var(--ds-color-primary-100)';
        }}
      >
        <Text size="xs" weight="semibold" style={{ color: 'var(--ds-color-primary-600)' }}>
          Hover
        </Text>
      </Box>
      <Box style={{ marginTop: 8 }}>
        <Text
          size="xs"
          weight="medium"
          style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
        >
          {label}
        </Text>
      </Box>
    </Box>
  );
}

function EntranceDemo() {
  const tokens = useTokens();
  const [key, setKey] = useState(0);

  const entrances = [
    { name: 'fadeIn', style: { animation: `fadeIn 600ms ${tokens.motion.spring} forwards` } },
    { name: 'slideUp', style: { animation: `slideUp 400ms ${tokens.motion.spring} forwards` } },
    { name: 'scaleIn', style: { animation: `scaleIn 400ms ${tokens.motion.spring} forwards` } },
  ];

  return (
    <Card>
      <Stack spacing="md">
        <Flex align="center" justify="between">
          <Text as={"h3" as any} size="md" weight="semibold">
            Entrance animations
          </Text>
          <Button
            size="sm"
            onClick={() => setKey((k) => k + 1)}
          >
            Replay
          </Button>
        </Flex>
        <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
          Common entrance patterns using CSS keyframes and the engine easing
          curve.
        </Text>
        <Flex gap={24}>
          {entrances.map((e) => (
            <Box key={`${e.name}-${key}`} style={{ textAlign: 'center' }}>
              <Box
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: tokens.borderRadius.md,
                  background: 'var(--ds-color-primary-500)',
                  margin: '0 auto',
                  opacity: 0,
                  ...e.style,
                }}
              />
              <Box style={{ marginTop: 8 }}>
                <Text
                  size="xs"
                  weight="medium"
                  style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
                >
                  {e.name}
                </Text>
              </Box>
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
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
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
            Motion
          </Text>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Motion tokens define transition timing, easing curves, hover
            behavior, and duration scales. Classic is fast and linear, Modern
            uses spring physics with lift transforms, and Rustic is quiet with
            minimal motion.
          </Text>
        </Box>
      </Box>

      {/* Current engine motion tokens */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="md" weight="semibold">
            Active motion tokens
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: tokens.spacing[3],
            }}
          >
            {[
              { label: 'hover', value: tokens.motion.hover, desc: 'Hover transition timing' },
              { label: 'transform', value: tokens.motion.transform, desc: 'Hover transform effect' },
              { label: 'spring', value: tokens.motion.spring, desc: 'Easing curve for entrances' },
              { label: 'durationScale', value: String(tokens.motion.durationScale), desc: 'Duration multiplier' },
            ].map((item) => (
              <Box
                key={item.label}
                style={{
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.md,
                  background: 'var(--ds-color-neutral-50)',
                }}
              >
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    fontFamily: 'var(--font-geist-mono, monospace)',
                    color: 'var(--ds-color-primary-600)',
                  }}
                >
                  {item.label}
                </Text>
                <Box style={{ marginTop: 4 }}>
                  <Text
                    size="xs"
                    style={{
                      fontFamily: 'var(--font-geist-mono, monospace)',
                      color: 'var(--ds-color-text-primary)',
                    }}
                  >
                    {item.value}
                  </Text>
                </Box>
                <Box style={{ marginTop: 4 }}>
                  <Text
                    size="xs"
                    style={{ color: 'var(--ds-color-text-muted)' }}
                  >
                    {item.desc}
                  </Text>
                </Box>
              </Box>
            ))}
          </Box>
        </Stack>
      </Card>

      {/* Transition presets */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="md" weight="semibold">
            Transition presets
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Pre-composed transition CSS variables for common durations. Click
            Play to see each timing.
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: tokens.spacing[3],
            }}
          >
            <TransitionDemo
              label="fast"
              value="100ms ease"
              description="Micro-interactions: toggles, checkboxes, icon state changes."
            />
            <TransitionDemo
              label="normal"
              value="200ms ease"
              description="Standard transitions: button hover, card hover, input focus."
            />
            <TransitionDemo
              label="slow"
              value="300ms ease"
              description="Deliberate transitions: panel open, accordion expand."
            />
            <TransitionDemo
              label="slower"
              value="500ms ease"
              description="Dramatic transitions: modal entrance, page transitions."
            />
          </Box>
        </Stack>
      </Card>

      {/* Hover behavior */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="md" weight="semibold">
            Hover behavior
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            The hover token combines duration and easing. Modern adds a
            translateY(-1px) lift transform. Hover over the boxes to see the
            active engine behavior.
          </Text>
          <Flex gap={32} style={{ padding: `${tokens.spacing[4]}px 0` }}>
            <HoverDemo
              label="Scale"
              hoverTransition={tokens.motion.hover}
              transform="scale(1.05)"
            />
            <HoverDemo
              label="Lift"
              hoverTransition={tokens.motion.hover}
              transform={tokens.motion.transform || 'translateY(-2px)'}
            />
            <HoverDemo
              label="Combined"
              hoverTransition={tokens.motion.hover}
              transform={`scale(1.02) ${tokens.motion.transform || 'translateY(-1px)'}`}
            />
          </Flex>
        </Stack>
      </Card>

      {/* Entrance animations */}
      <EntranceDemo />

      {/* Duration scale */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="md" weight="semibold">
            Duration scale
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            The durationScale multiplier adjusts all animation durations. Classic
            (0.8x) feels snappy, Modern (1.0x) is baseline, Rustic (0.6x) is
            even faster because minimal motion should resolve quickly.
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: tokens.spacing[3],
            }}
          >
            {[
              { engine: 'Classic', scale: 0.8, desc: 'Snappy, enterprise-grade' },
              { engine: 'Modern', scale: 1.0, desc: 'Baseline, balanced' },
              { engine: 'Rustic', scale: 0.6, desc: 'Fastest, minimal' },
            ].map((item) => (
              <Box
                key={item.engine}
                style={{
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.md,
                  border: '1px solid var(--ds-color-neutral-200)',
                  background:
                    tokens.motion.durationScale === item.scale
                      ? 'var(--ds-color-primary-50)'
                      : 'transparent',
                }}
              >
                <Flex align="center" justify="between">
                  <Text size="sm" weight="semibold">
                    {item.engine}
                  </Text>
                  {tokens.motion.durationScale === item.scale && (
                    <Badge variant="primary">Active</Badge>
                  )}
                </Flex>
                <Text
                  size="lg"
                  weight="bold"
                  style={{
                    fontFamily: 'var(--font-geist-mono, monospace)',
                    color: 'var(--ds-color-primary-600)',
                    marginTop: 4,
                  }}
                >
                  {item.scale}x
                </Text>
                <Text
                  size="xs"
                  style={{ color: 'var(--ds-color-text-muted)', marginTop: 2 }}
                >
                  {item.desc}
                </Text>
              </Box>
            ))}
          </Box>
        </Stack>
      </Card>

      {/* Code */}
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
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`const tokens = useTokens();`}
            </Text>
            <br />
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-400)' }}>
              {`// Hover transition`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`style={{ transition: \`all \${tokens.motion.hover}\` }}`}
            </Text>
            <br />
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-400)' }}>
              {`// CSS variable presets`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`transition: var(--ds-transition-fast);   // 100ms`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`transition: var(--ds-transition-normal);  // 200ms`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`transition: var(--ds-transition-slow);    // 300ms`}
            </Text>
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
