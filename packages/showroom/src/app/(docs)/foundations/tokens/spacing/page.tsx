'use client';

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

const SPACING_STEPS = [
  { index: 0, label: '0', px: 0, use: 'Reset / collapse' },
  { index: 1, label: '1', px: 4, use: 'Inline micro gap' },
  { index: 2, label: '2', px: 8, use: 'Icon + label' },
  { index: 3, label: '3', px: 12, use: 'Small stack rhythm' },
  { index: 4, label: '4', px: 16, use: 'Default card padding' },
  { index: 5, label: '5', px: 20, use: 'Panel separation' },
  { index: 6, label: '6', px: 24, use: 'Generous content block' },
  { index: 7, label: '7', px: 32, use: 'Section separation' },
  { index: 8, label: '8', px: 40, use: 'Page sub-section' },
  { index: 9, label: '9', px: 48, use: 'Hero breathing room' },
  { index: 10, label: '10', px: 64, use: 'Page-level framing' },
  { index: 11, label: '11', px: 80, use: 'Large module gap' },
  { index: 12, label: '12', px: 96, use: 'Maximum roomy rhythm' },
];

function SpacingRow({
  index,
  basePx,
  actualPx,
  use,
}: {
  index: number;
  basePx: number;
  actualPx: number;
  use: string;
}) {
  return (
        <Box
          style={{
            padding: '12px 0',
            borderBottom: '1px solid var(--ds-color-neutral-100)',
          }}
        >
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <Flex align="center" gap={10} style={{ flexWrap: 'wrap' }}>
          <Text
            size="sm"
            weight="semibold"
            style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
          >
            {index}
          </Text>
          <Text
            size="xs"
            style={{
              color: 'var(--ds-color-text-muted)',
              fontFamily: 'var(--font-geist-mono, monospace)',
            }}
          >
            {actualPx}px
          </Text>
          <Text
            size="xs"
            style={{
              color: 'var(--ds-color-text-muted)',
              fontFamily: 'var(--font-geist-mono, monospace)',
            }}
          >
            base {basePx}px
          </Text>
        </Flex>
        <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)', textAlign: 'right' }}>
          {use}
        </Text>
      </Box>
      <Box
        style={{
          marginTop: 10,
          width: '100%',
        }}
      >
        <Box
          style={{
            width: Math.max(actualPx, 2),
            height: 14,
            borderRadius: 999,
            background:
              index >= 8
                ? 'var(--ds-color-primary-600)'
                : index >= 4
                  ? 'var(--ds-color-primary-400)'
                  : 'var(--ds-color-primary-200)',
          }}
        />
      </Box>
    </Box>
  );
}

function EngineSpacingSnapshot({
  engine,
  label,
}: {
  engine: 'classic' | 'modern' | 'rustic';
  label: string;
}) {
  const { tenantSlug } = useShowroom();

  return (
    <DesignSystemProvider tenantSlug={tenantSlug} forceEngine={engine}>
      <EngineSpacingSnapshotContent label={label} />
    </DesignSystemProvider>
  );
}

function EngineSpacingSnapshotContent({ label }: { label: string }) {
  const tokens = useTokens();

  return (
    <Card style={{ padding: tokens.spacing[4], height: '100%' }}>
      <Stack spacing="md">
        <Flex align="center" justify="between">
          <Text size="sm" weight="semibold">
            {label}
          </Text>
          <Badge variant="secondary">{(tokens.spacing[4] / 16).toFixed(3)}x</Badge>
        </Flex>
        <Stack spacing={8}>
          {[2, 4, 6, 8].map((step) => (
            <Flex key={step} align="center" gap={10}>
              <Text
                size="xs"
                style={{
                  width: 16,
                  color: 'var(--ds-color-text-muted)',
                  fontFamily: 'var(--font-geist-mono, monospace)',
                }}
              >
                {step}
              </Text>
              <Box
                style={{
                  width: tokens.spacing[step],
                  height: 10,
                  borderRadius: 999,
                  background: 'var(--ds-color-primary-400)',
                }}
              />
            </Flex>
          ))}
        </Stack>
        <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
          spacing[4] resolves to {tokens.spacing[4]}px on this engine.
        </Text>
      </Stack>
    </Card>
  );
}

export default function SpacingPage() {
  const tokens = useTokens();

  return (
    <Stack spacing="lg" fullWidth>
      <FoundationTopRail
        backHref="/foundations/tokens"
        backLabel="Tokens"
        badge="Rhythm scale"
        title="Spacing"
        description="Spacing is infrastructure for dense UI. These steps control inline gaps, stack rhythm, panel padding, and page cadence without resorting to arbitrary pixel picks."
        panels={[
          {
            title: 'What to validate',
            body: 'Default card padding, section cadence, and whether engine density still preserves semantic step meaning.',
            tone: 'accent',
          },
          {
            title: 'Authoring rule',
            body: 'Think in semantic steps and layout intent first, not one-off pixel tweaks.',
          },
          {
            title: 'Current baseline',
            body: `spacing[4] resolves to ${tokens.spacing[4]}px and spacing[8] resolves to ${tokens.spacing[8]}px on this page.`,
            tone: 'dark',
          },
        ]}
        links={[
          { label: '0-12 scale' },
          { label: 'Density comparison' },
          { label: 'Layout recipes' },
        ]}
        stats={[
          { label: 'Steps', value: `${SPACING_STEPS.length}`, detail: '0 through 12' },
          { label: 'Default rhythm', value: `${tokens.spacing[4]}px`, detail: 'Common component padding' },
          { label: 'Section cadence', value: `${tokens.spacing[8]}px`, detail: 'Module separation' },
          { label: 'Density scale', value: `${(tokens.spacing[4] / 16).toFixed(3)}x`, detail: 'Resolved against 16px baseline' },
        ]}
      />

      <Stack spacing="md">
        <Flex align="center" justify="between" style={{ flexWrap: 'wrap' }}>
          <Box>
            <Text as={"h2" as any} size="xl" weight="semibold">
              Full scale
            </Text>
            <Text
              size="sm"
              style={{ color: 'var(--ds-color-text-secondary)' }}
            >
              The base scale runs from 0 to 96px. Engines can resolve those
              steps slightly differently without breaking layout intent.
            </Text>
          </Box>
          <Badge variant="secondary">{SPACING_STEPS.length} steps</Badge>
        </Flex>
        <Card style={{ padding: tokens.spacing[4] }}>
          <Stack spacing={0}>
            {SPACING_STEPS.map((step) => (
              <SpacingRow
                key={step.index}
                index={step.index}
                basePx={step.px}
                actualPx={tokens.spacing[step.index]}
                use={step.use}
              />
            ))}
          </Stack>
        </Card>
      </Stack>

      <Stack spacing="md">
        <Flex align="center" justify="between" style={{ flexWrap: 'wrap' }}>
          <Box>
            <Text as={"h2" as any} size="lg" weight="semibold">
              Engine density comparison
            </Text>
            <Text
              size="sm"
              style={{ color: 'var(--ds-color-text-secondary)' }}
            >
              Same semantic spacing keys, different tactile feel.
            </Text>
          </Box>
          <Badge variant="secondary">Classic vs Modern vs Rustic</Badge>
        </Flex>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: tokens.spacing[4],
          }}
        >
          <EngineSpacingSnapshot engine="classic" label="Classic" />
          <EngineSpacingSnapshot engine="modern" label="Modern" />
          <EngineSpacingSnapshot engine="rustic" label="Rustic" />
        </Box>
      </Stack>

      <Card style={{ padding: tokens.spacing[5] }}>
        <Stack spacing="md">
          <Text as={"h2" as any} size="lg" weight="semibold">
            Common layout recipes
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: tokens.spacing[4],
            }}
          >
            {[
              {
                title: 'Compact toolbar',
                steps: 'gap 2 / padding 3',
                detail: 'Icons, labels, and filters stay tight without touching.',
              },
              {
                title: 'Standard card',
                steps: 'padding 4 / stack 3',
                detail: 'The default admin module baseline.',
              },
              {
                title: 'Feature section',
                steps: 'padding 6 / gap 6',
                detail: 'Used where copy and examples need extra air.',
              },
              {
                title: 'Editorial hero',
                steps: 'padding 8-10',
                detail: 'Reserve the largest steps for framing moments.',
              },
            ].map((recipe) => (
              <Box
                key={recipe.title}
                style={{
                  padding: tokens.spacing[4],
                  borderRadius: tokens.borderRadius.lg,
                  border: '1px solid var(--ds-color-neutral-200)',
                  background: 'var(--ds-color-neutral-50)',
                }}
              >
                <Stack spacing={4}>
                  <Text size="sm" weight="semibold">
                    {recipe.title}
                  </Text>
                  <Text
                    size="xs"
                    style={{
                      color: 'var(--ds-color-primary-600)',
                      fontFamily: 'var(--font-geist-mono, monospace)',
                    }}
                  >
                    {recipe.steps}
                  </Text>
                  <Text
                    size="xs"
                    style={{
                      color: 'var(--ds-color-text-secondary)',
                      lineHeight: 1.55,
                    }}
                  >
                    {recipe.detail}
                  </Text>
                </Stack>
              </Box>
            ))}
          </Box>
        </Stack>
      </Card>

      <CodeBlock
        title="Spacing usage"
        language="tsx"
        code={`const tokens = useTokens();

<Card style={{ padding: tokens.spacing[4] }}>
  <Stack spacing={tokens.spacing[3]}>
    <Text>Compact content rhythm</Text>
  </Stack>
</Card>

<Box style={{ marginTop: tokens.spacing[8] }}>
  <Section />
</Box>`}
      />
    </Stack>
  );
}
