'use client';

import { Box, Flex, Stack, Text, Card, Badge, Button, Input } from '@rottay/design-system';
import { DesignSystemProvider } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';

type EngineName = 'classic' | 'modern' | 'rustic';

interface EngineInfo {
  name: EngineName;
  label: string;
  foundation: string;
  description: string;
  characteristics: string[];
}

const ENGINES: EngineInfo[] = [
  {
    name: 'classic',
    label: 'Classic',
    foundation: 'Ant Design 5.21',
    description: 'Corporate, structured, and enterprise-grade. Sharp corners, subtle shadows, and professional typography.',
    characteristics: ['Sharp border radius', 'Corporate shadows', 'Dense spacing', 'Enterprise feel'],
  },
  {
    name: 'modern',
    label: 'Modern',
    foundation: 'Tailwind / DaisyUI',
    description: 'Clean, rounded, and contemporary. Bold shadows, generous spacing, and smooth transitions.',
    characteristics: ['Rounded corners', 'Bold shadows', 'Generous spacing', 'Smooth motion'],
  },
  {
    name: 'rustic',
    label: 'Rustic',
    foundation: 'Vanilla CSS',
    description: 'Minimal, elegant, and understated. Whisper-thin shadows, flat borders, and quiet aesthetics.',
    characteristics: ['Minimal radius', 'Whisper shadows', 'Flat design', 'Quiet aesthetics'],
  },
];

function EnginePreviewColumn({ engine }: { engine: EngineInfo }) {
  return (
    <DesignSystemProvider forceEngine={engine.name} tenantSlug="rottay">
      <EnginePreviewContent engine={engine} />
    </DesignSystemProvider>
  );
}

function EnginePreviewContent({ engine }: { engine: EngineInfo }) {
  const tokens = useTokens();

  return (
    <Card style={{ height: '100%' }}>
      <Stack spacing="md">
        {/* Engine label */}
        <Flex align="center" justify="between">
          <Stack spacing={1}>
            <Text as={"h3" as any} size="lg" weight="bold">
              {engine.label}
            </Text>
            <Text size="xs" style={{ color: "var(--ds-color-text-muted)" }}>{engine.foundation}</Text>
          </Stack>
          <Badge variant="primary">{engine.name}</Badge>
        </Flex>

        {/* Description */}
        <Text size="sm" style={{ color: "var(--ds-color-text-secondary)" }}>
          {engine.description}
        </Text>

        {/* Characteristics */}
        <Flex gap={4} style={{ flexWrap: 'wrap' }}>
          {engine.characteristics.map((c) => (
            <Badge key={c}>{c}</Badge>
          ))}
        </Flex>

        {/* Divider */}
        <Box
          style={{
            height: 1,
            background: 'var(--ds-color-neutral-200)',
          }}
        />

        {/* Sample components */}
        <Stack spacing="md">
          <Text size="sm" weight="semibold" style={{ color: "var(--ds-color-text-secondary)" }}>
            Component Preview
          </Text>

          {/* Buttons */}
          <Flex gap={8} style={{ flexWrap: 'wrap' }}>
            <Button variant="primary">Primary</Button>
            <Button>Default</Button>
            <Button variant="secondary">Dashed</Button>
          </Flex>

          {/* Input */}
          <Input placeholder="Type something..." />

          {/* Card within card */}
          <Card
            style={{
              background: 'var(--ds-color-neutral-50)',
            }}
          >
            <Stack spacing="sm">
              <Text size="sm" weight="semibold">Nested Card</Text>
              <Text size="xs" style={{ color: "var(--ds-color-text-secondary)" }}>
                Notice how border radius, shadow depth, and spacing differ across engines.
              </Text>
            </Stack>
          </Card>

          {/* Token values */}
          <Box
            style={{
              padding: tokens.spacing[3],
              borderRadius: tokens.borderRadius.md,
              background: 'var(--ds-color-neutral-50)',
              border: '1px solid var(--ds-color-neutral-200)',
            }}
          >
            <Stack spacing={4}>
              <Text size="xs" weight="semibold" style={{ color: "var(--ds-color-text-muted)" }}>Resolved Tokens</Text>
              <Flex justify="between">
                <Text size="xs" style={{ color: "var(--ds-color-text-secondary)" }}>borderRadius.md</Text>
                <Text size="xs" weight="medium" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                  {tokens.borderRadius.md}
                </Text>
              </Flex>
              <Flex justify="between">
                <Text size="xs" style={{ color: "var(--ds-color-text-secondary)" }}>shadows.md</Text>
                <Text
                  size="xs"
                  weight="medium"
                  style={{
                    fontFamily: 'var(--font-geist-mono)',
                    maxWidth: 180,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tokens.shadows.md}
                </Text>
              </Flex>
              <Flex justify="between">
                <Text size="xs" style={{ color: "var(--ds-color-text-secondary)" }}>surface.borderWidth</Text>
                <Text size="xs" weight="medium" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                  {tokens.surface.borderWidth}
                </Text>
              </Flex>
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Card>
  );
}

export default function EnginesPage() {
  const tokens = useTokens();

  return (
    <Stack spacing="lg">
      {/* Page header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            Engines
          </Text>
          <Badge variant="secondary">3 engines</Badge>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: "var(--ds-color-text-secondary)" }}>
            The Rottay Design System ships three rendering engines. Each engine
            wraps a different CSS foundation and produces distinct visual output
            from the same component API. A fourth engine, Custom, is reserved for
            white-label tenants with pluggable component packs.
          </Text>
        </Box>
      </Box>

      {/* Side-by-side comparison */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: tokens.spacing[5],
          alignItems: 'stretch',
        }}
      >
        {ENGINES.map((engine) => (
          <EnginePreviewColumn key={engine.name} engine={engine} />
        ))}
      </Box>

      {/* How engines work */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            How Engine Selection Works
          </Text>
          <Text size="sm" style={{ color: "var(--ds-color-text-secondary)" }}>
            Each primitive component has engine-specific implementations under
            engines/classic/, engines/modern/, and engines/rustic/. The
            createEngineComponent() factory reads the active engine from context
            and renders the correct implementation at runtime. This means:
          </Text>
          <Stack spacing="xs">
            {[
              'Same component API regardless of engine',
              'Engine is resolved from tenant config, vertical preset, or forceEngine prop',
              'Token values (radius, shadows, motion) are automatically differentiated',
              'Components can be previewed in any engine via the showroom header controls',
            ].map((item, i) => (
              <Flex key={i} align="baseline" gap={8}>
                <Text size="sm" style={{ color: "var(--ds-color-text-muted)" }}>-</Text>
                <Text size="sm" style={{ color: "var(--ds-color-text-secondary)" }}>{item}</Text>
              </Flex>
            ))}
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
