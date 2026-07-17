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
  DesignSystemProvider,
  getKnownTenantConfig,
} from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import { CodeBlock } from '@/composition/components/playground';
import { getShowroomVerticalKey, useShowroom } from '@/composition/components/showroom-context';
import { FoundationTopRail } from '../foundation-top-rail';

type EngineName = 'classic' | 'modern' | 'rustic';

interface EngineInfo {
  name: EngineName;
  label: string;
  foundation: string;
  description: string;
  characteristics: string[];
  bestFor: string;
}

const ENGINES: EngineInfo[] = [
  {
    name: 'classic',
    label: 'Classic',
    foundation: 'Ant Design 5.21',
    description:
      'Structured, enterprise-weighted, and familiar for data-heavy admin surfaces.',
    characteristics: ['Sharper radius', 'Corporate shadows', 'Dense layout bias', 'Operational tone'],
    bestFor: 'Control planes, governance, admin-intensive products.',
  },
  {
    name: 'modern',
    label: 'Modern',
    foundation: 'Tailwind / DaisyUI',
    description:
      'Rounded, contemporary, and more expressive for product experiences with visible brand energy.',
    characteristics: ['Rounded corners', 'Confident elevation', 'Generous rhythm', 'Soft motion'],
    bestFor: 'Growth products, recruiting, mixed marketing-product flows.',
  },
  {
    name: 'rustic',
    label: 'Rustic',
    foundation: 'Vanilla CSS',
    description:
      'Minimal and quiet, designed to reduce visual noise while still supporting the same API.',
    characteristics: ['Minimal radius', 'Whisper shadows', 'Reserved motion', 'Calm surfaces'],
    bestFor: 'Low-noise workflows, premium restraint, bespoke white-label UI.',
  },
];

function EnginePreviewColumn({ engine }: { engine: EngineInfo }) {
  const { tenantSlug } = useShowroom();
  const resolvedTenantSlug = tenantSlug === 'bithire' || tenantSlug === 'evnto'
    ? tenantSlug
    : 'rottay';
  const tenantConfig =
    getKnownTenantConfig(resolvedTenantSlug) ?? getKnownTenantConfig('rottay');

  if (!tenantConfig) {
    return null;
  }

  return (
    <DesignSystemProvider
      forceEngine={engine.name}
      tenantConfig={tenantConfig}
      vertical={getShowroomVerticalKey(resolvedTenantSlug)}
    >
      <EnginePreviewContent engine={engine} />
    </DesignSystemProvider>
  );
}

function EnginePreviewContent({ engine }: { engine: EngineInfo }) {
  const tokens = useTokens();

  return (
    <Card
      style={{
        padding: tokens.spacing[5],
        height: '100%',
        border: '1px solid var(--ds-color-border-secondary)',
        background:
          'linear-gradient(180deg, var(--ds-color-bg-elevated), var(--ds-color-bg-primary))',
      }}
    >
      <Stack spacing="md">
        <Flex align="center" justify="between">
          <Stack spacing={1}>
            <Text as={"h3" as any} size="lg" weight="bold">
              {engine.label}
            </Text>
            <Text size="xs" style={{ color: 'var(--ds-color-text-muted)', lineHeight: 1.55 }}>
              {engine.foundation}
            </Text>
          </Stack>
          <Badge variant="primary">{engine.name}</Badge>
        </Flex>

        <Box
          style={{
            padding: tokens.spacing[3],
            borderRadius: tokens.borderRadius.lg,
            background: 'var(--ds-color-bg-overlay)',
            border: '1px solid var(--ds-color-border-secondary)',
          }}
        >
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
            {engine.description}
          </Text>
        </Box>

        <Flex gap={6} style={{ flexWrap: 'wrap' }}>
          {engine.characteristics.map((characteristic) => (
            <Badge key={characteristic}>{characteristic}</Badge>
          ))}
        </Flex>

        <Box
          style={{
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.xl,
            background: 'var(--ds-color-bg-overlay)',
            border: '1px solid var(--ds-color-border-secondary)',
          }}
        >
          <Stack spacing="md">
            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              <Button variant="primary">Approve</Button>
              <Button>Secondary</Button>
            </Flex>
            <Input placeholder="Search tenant or company..." />
            <Card
              style={{
                padding: tokens.spacing[4],
                border: '1px solid var(--ds-color-border-secondary)',
                background: 'var(--ds-color-bg-primary)',
              }}
            >
              <Stack spacing="sm">
                <Flex align="center" justify="between">
                  <Text size="sm" weight="semibold">
                    Workflow module
                  </Text>
                  <Badge variant="success">Active</Badge>
                </Flex>
                <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                  borderRadius.md = {tokens.borderRadius.md}
                </Text>
                <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                  shadows.md = {tokens.shadows.md}
                </Text>
              </Stack>
            </Card>
          </Stack>
        </Box>

        <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
          Best fit: {engine.bestFor}
        </Text>
      </Stack>
    </Card>
  );
}

export default function EnginesPage() {
  const tokens = useTokens();

  return (
    <Stack spacing="lg" fullWidth>
      <FoundationTopRail
        backHref="/foundations"
        backLabel="Foundations"
        badge="Rendering layer"
        title="Engines"
        description="Engines keep the component API stable while changing rendering posture, spacing feel, motion cadence, and overall product silhouette."
        panels={[
          {
            title: 'What changes',
            body: 'Implementation strategy, visual tone, radius, shadow, and motion interpretation.',
            tone: 'accent',
          },
          {
            title: 'What stays fixed',
            body: 'Imports, component names, and semantic usage contracts across apps.',
          },
          {
            title: 'Use this page for',
            body: 'Comparing visual personality before teams commit to a product direction or tenant rollout.',
            tone: 'dark',
          },
        ]}
        links={[
          { label: 'Classic' },
          { label: 'Modern' },
          { label: 'Rustic' },
          { label: 'Runtime switching' },
        ]}
        stats={[
          { label: 'Engines', value: `${ENGINES.length}`, detail: 'Three renderer personalities' },
          { label: 'API promise', value: 'Shared', detail: 'One component contract' },
          { label: 'Switch model', value: 'Runtime', detail: 'Resolved by provider context' },
          { label: 'Token shift', value: 'Automatic', detail: 'Radius, shadow, motion follow engine' },
        ]}
      />

      <Card style={{ width: '100%', padding: tokens.spacing[5] }}>
        <Stack spacing="md" fullWidth>
          <Flex align="center" justify="between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <Box>
              <Text as={"h2" as any} size="xl" weight="semibold">
                Runtime selection model
              </Text>
              <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                Engine swapping is an implementation concern, not a route or API fork.
              </Text>
            </Box>
            <Badge variant="secondary">createEngineComponent</Badge>
          </Flex>
          <CodeBlock
            title="createEngineComponent"
            language="tsx"
            code={`const Button = createEngineComponent({
  classic: ClassicButton,
  modern: ModernButton,
  rustic: RusticButton,
});

<DesignSystemProvider forceEngine="modern">
  <Button />
</DesignSystemProvider>`}
          />
        </Stack>
      </Card>

      <Stack spacing="md" fullWidth>
        <Flex align="center" justify="between" style={{ flexWrap: 'wrap' }}>
          <Text as={"h2" as any} size="xl" weight="semibold">
            Side-by-side engine previews
          </Text>
          <Badge variant="secondary">Same workflow frame</Badge>
        </Flex>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: tokens.spacing[5],
          }}
        >
          {ENGINES.map((engine) => (
            <EnginePreviewColumn key={engine.name} engine={engine} />
          ))}
        </Box>
      </Stack>

      <Card style={{ width: '100%', padding: tokens.spacing[5] }}>
        <Stack spacing="md" fullWidth>
          <Flex align="center" justify="between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <Text as={"h2" as any} size="lg" weight="semibold">
              Choosing the right engine
            </Text>
            <Badge variant="secondary">Selection heuristics</Badge>
          </Flex>
          <Box
            style={{
              display: 'grid',
              gap: tokens.spacing[3],
            }}
          >
            {ENGINES.map((engine, index) => (
              <Box
                key={engine.name}
                style={{
                  padding: tokens.spacing[4],
                  borderRadius: tokens.borderRadius.lg,
                  border: '1px solid var(--ds-color-border-secondary)',
                  background:
                    index === 0
                      ? 'linear-gradient(180deg, rgba(239,246,255,0.92), rgba(255,255,255,0.92))'
                      : 'var(--ds-color-bg-overlay)',
                }}
              >
                <Flex align="start" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
                  <Box style={{ minWidth: 0, maxWidth: 520 }}>
                    <Text size="sm" weight="semibold">
                      {engine.label}
                    </Text>
                    <Text
                      size="xs"
                      style={{
                        marginTop: tokens.spacing[1],
                        color: 'var(--ds-color-text-secondary)',
                        lineHeight: 1.55,
                      }}
                    >
                      {engine.bestFor}
                    </Text>
                  </Box>
                  <Badge variant="secondary">{engine.foundation}</Badge>
                </Flex>

                <Text
                  size="xs"
                  style={{
                    marginTop: tokens.spacing[2],
                    color: 'var(--ds-color-text-secondary)',
                    lineHeight: 1.55,
                  }}
                >
                  {engine.description}
                </Text>

                <Flex gap={6} style={{ flexWrap: 'wrap', marginTop: tokens.spacing[2] }}>
                  {engine.characteristics.map((characteristic) => (
                    <Badge key={characteristic} variant={index === 0 ? 'primary' : 'secondary'}>
                      {characteristic}
                    </Badge>
                  ))}
                </Flex>
              </Box>
            ))}
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
