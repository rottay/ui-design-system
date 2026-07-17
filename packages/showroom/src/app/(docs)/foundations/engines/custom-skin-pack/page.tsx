'use client';

import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Input,
  Select,
  Stack,
  Text,
  DesignSystemProvider,
  getKnownTenantConfig,
  registerSkinPack,
  EXAMPLE_SKIN_PACK,
} from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import { CodeBlock } from '@/components/playground';
import { getShowroomVerticalKey, useShowroom } from '@/components/showroom-context';
import { FoundationTopRail } from '../../foundation-top-rail';

// Registration happens once, at module load — exactly the "call this at
// startup" pattern the DS's own custom-engine docs demonstrate. Idempotent:
// re-importing this module (Fast Refresh, multiple mounts) just re-sets the
// same Map entry.
registerSkinPack(EXAMPLE_SKIN_PACK);

const SELECT_OPTIONS = [
  { value: 'starter', label: 'Starter' },
  { value: 'growth', label: 'Growth' },
  { value: 'enterprise', label: 'Enterprise' },
];

function FlagshipPreview() {
  const tokens = useTokens();
  const [selectValue, setSelectValue] = useState('growth');

  return (
    <Stack spacing="md">
      <Flex gap={8} style={{ flexWrap: 'wrap' }}>
        <Button variant="primary">Approve</Button>
        <Button variant="secondary">Secondary</Button>
      </Flex>
      <Input placeholder="Search tenant or company..." />
      <Select
        options={SELECT_OPTIONS}
        value={selectValue}
        onChange={(value) => setSelectValue(String(value))}
        placeholder="Choose a plan"
      />
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
            Card, Input, Select, and Button render through this column&apos;s active engine.
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}

function EngineColumn({
  label,
  foundation,
  badge,
  engine,
  componentPack,
}: {
  label: string;
  foundation: string;
  badge: string;
  engine: 'modern' | 'custom';
  componentPack?: string;
}) {
  const { tenantSlug } = useShowroom();
  const resolvedTenantSlug = tenantSlug === 'bithire' || tenantSlug === 'evnto' ? tenantSlug : 'rottay';
  const tenantConfig = getKnownTenantConfig(resolvedTenantSlug) ?? getKnownTenantConfig('rottay');
  if (!tenantConfig) return null;

  return (
    <DesignSystemProvider
      forceEngine={engine}
      tenantConfig={componentPack ? { ...tenantConfig, componentPack } : tenantConfig}
      vertical={getShowroomVerticalKey(resolvedTenantSlug)}
    >
      <Card
        style={{
          padding: 20,
          height: '100%',
          border: '1px solid var(--ds-color-border-secondary)',
          background: 'linear-gradient(180deg, var(--ds-color-bg-elevated), var(--ds-color-bg-primary))',
        }}
      >
        <Stack spacing="md">
          <Flex align="center" justify="between">
            <Stack spacing={1}>
              <Text as={'h3' as any} size="lg" weight="bold">
                {label}
              </Text>
              <Text size="xs" style={{ color: 'var(--ds-color-text-muted)', lineHeight: 1.55 }}>
                {foundation}
              </Text>
            </Stack>
            <Badge variant="primary">{badge}</Badge>
          </Flex>
          <FlagshipPreview />
        </Stack>
      </Card>
    </DesignSystemProvider>
  );
}

const REGISTRATION_CODE = `import { registerSkinPack } from '@rottay/design-system';

registerSkinPack({
  id: 'ds-example-pack',
  // targets [data-part]/[data-state] (Button, Card) plus the two
  // properties rustic's inline styles never set (letter-spacing,
  // text-transform) -- everything else an inline style already owns
  // cannot be beaten by an external stylesheet without !important.
  css: exampleCss,
  // this is the lever that actually reskins every flagship component,
  // because every engine sources its inline styles from var(--ds-*,
  // fallback) -- overriding the custom property wins regardless of
  // where the var() reference lives.
  tokenOverrides: {
    '--ds-button-radius': '2px',
    '--ds-button-primary-bg': 'var(--ds-color-primary)',
    '--ds-card-border-hover': 'var(--ds-color-primary)',
    '--ds-input-border-focus': 'var(--ds-color-primary)',
    '--ds-select-border-focus': 'var(--ds-color-primary)',
    // ...
  },
});

// Activate it for a tenant by naming the pack id -- the same key
// registerCustomComponent(s) already scopes bespoke overrides under.
const tenantConfig = { ...baseTenantConfig, componentPack: 'ds-example-pack' };
<DesignSystemProvider forceEngine="custom" tenantConfig={tenantConfig}>
  <Button variant="primary">Approve</Button>
</DesignSystemProvider>`;

export default function CustomSkinPackPage() {
  const tokens = useTokens();

  return (
    <Stack spacing="lg" fullWidth>
      <FoundationTopRail
        backHref="/foundations/engines"
        backLabel="Engines"
        badge="Custom engine · skin pack API"
        title="Custom engine: skin packs"
        description="A white-label tenant ships a stylesheet plus a bounded token set under registerSkinPack -- zero bespoke React components below."
        panels={[
          {
            title: 'What a pack is',
            body: "An id, a CSS string targeting the anatomy contract's [data-part]/[data-state] selectors, and a bounded --ds-* token map or BrandTheme.",
            tone: 'accent',
          },
          {
            title: 'What still wins',
            body: 'registerCustomComponents remains the escape hatch -- a bespoke component registered under the same pack id always renders instead of the pack skin.',
          },
          {
            title: 'The honest limit',
            body: 'Most visual properties are set inline by the engine, so css selectors can rarely beat them. tokenOverrides can, because every inline value is sourced from var(--ds-*).',
            tone: 'dark',
          },
        ]}
        stats={[
          { label: 'Pack fields', value: '4', detail: 'id, css, tokenOverrides | brandTheme, components?' },
          { label: 'Token bound', value: '200', detail: 'Same cap as TenantAppearanceAdvanced' },
          { label: 'Bespoke escape hatch', value: 'Kept', detail: 'registerCustomComponents unchanged' },
          { label: 'Anatomy-wired here', value: 'Button, Card', detail: '[data-part]/[data-state] present in rustic' },
        ]}
      />

      <Card style={{ width: '100%', padding: tokens.spacing[5] }}>
        <Stack spacing="md" fullWidth>
          <Flex align="center" justify="between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <Box>
              <Text as={'h2' as any} size="xl" weight="semibold">
                registerSkinPack
              </Text>
              <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                Registered once at startup; activated per tenant via componentPack.
              </Text>
            </Box>
            <Badge variant="secondary">runtime/engines/skin-pack.ts</Badge>
          </Flex>
          <CodeBlock title="registerSkinPack" language="tsx" code={REGISTRATION_CODE} />
        </Stack>
      </Card>

      <Stack spacing="md" fullWidth>
        <Flex align="center" justify="between" style={{ flexWrap: 'wrap' }}>
          <Text as={'h2' as any} size="xl" weight="semibold">
            Modern vs. custom + ds-example-pack
          </Text>
          <Badge variant="secondary">Same workflow frame, zero bespoke components</Badge>
        </Flex>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: tokens.spacing[5],
          }}
        >
          <EngineColumn label="Modern" foundation="Rottay-native premium skin" badge="modern" engine="modern" />
          <EngineColumn
            label="Custom + ds-example-pack"
            foundation="registerSkinPack, no bespoke components"
            badge="custom"
            engine="custom"
            componentPack={EXAMPLE_SKIN_PACK.id}
          />
        </Box>
      </Stack>

      <Card style={{ width: '100%', padding: tokens.spacing[5] }}>
        <Stack spacing="md" fullWidth>
          <Text as={'h2' as any} size="lg" weight="semibold">
            Coverage, stated plainly
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.6 }}>
            Button and Card carry the full anatomy contract in the rustic engine (custom&apos;s
            default fallback), so this pack&apos;s <code>css</code> can target
            <code> [data-part]</code>/<code>[data-state]</code> directly. Input and Select expose
            stable pre-anatomy BEM class hooks (<code>.rottay-input--focused</code>,
            <code> .rottay-select--open</code>) instead. Badge, Table, Tabs, and Modal render
            fully from inline styles with only a caller-supplied <code>className</code> passthrough
            today -- this pack does not claim a <code>css</code> selector for them, and reskins
            their color/radius only through <code>tokenOverrides</code>, which every engine reads
            regardless of anatomy wiring. Closing that gap is tracked separately, not asserted here.
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}
