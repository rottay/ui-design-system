'use client';

import { useState } from 'react';
import {
  Box,
  Flex,
  Stack,
  Text,
  Card,
  Badge,
  Button,
  Input,
  DesignSystemProvider,
} from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import {
  EngineSwitcher,
  ThemeSwitcher,
  CodeBlock,
  ComponentPreview,
} from '@/components/playground';
import { useShowroom } from '@/components/showroom-context';

type EngineType = 'classic' | 'modern' | 'rustic';
type ComponentType = 'Button' | 'Input' | 'Card' | 'Badge';

const COMPONENT_OPTIONS: { value: ComponentType; label: string }[] = [
  { value: 'Button', label: 'Button' },
  { value: 'Input', label: 'Input' },
  { value: 'Card', label: 'Card' },
  { value: 'Badge', label: 'Badge' },
];

function getCodeSnippet(component: ComponentType, engine: EngineType, theme: string): string {
  const snippets: Record<ComponentType, string> = {
    Button: `import { Button, DesignSystemProvider } from '@rottay/design-system';

<DesignSystemProvider forceEngine="${engine}" tenantSlug="${theme}">
  <Button variant="primary">Primary Action</Button>
  <Button>Default</Button>
  <Button variant="ghost">Ghost</Button>
</DesignSystemProvider>`,
    Input: `import { Input, DesignSystemProvider } from '@rottay/design-system';

<DesignSystemProvider forceEngine="${engine}" tenantSlug="${theme}">
  <Input placeholder="Enter your email..." />
</DesignSystemProvider>`,
    Card: `import { Card, Text, Badge, Flex, Stack, DesignSystemProvider } from '@rottay/design-system';

<DesignSystemProvider forceEngine="${engine}" tenantSlug="${theme}">
  <Card>
    <Stack spacing="sm">
      <Flex align="center" justify="between">
        <Text size="sm" weight="semibold">Sample Card</Text>
        <Badge variant="success">Active</Badge>
      </Flex>
      <Text size="xs">Card content rendered with the ${engine} engine.</Text>
    </Stack>
  </Card>
</DesignSystemProvider>`,
    Badge: `import { Badge, Flex, DesignSystemProvider } from '@rottay/design-system';

<DesignSystemProvider forceEngine="${engine}" tenantSlug="${theme}">
  <Flex gap={8}>
    <Badge variant="primary">Primary</Badge>
    <Badge variant="success">Success</Badge>
    <Badge variant="warning">Warning</Badge>
    <Badge variant="error">Error</Badge>
  </Flex>
</DesignSystemProvider>`,
  };
  return snippets[component];
}

function LivePreview({
  component,
  engine,
  theme,
}: {
  component: ComponentType;
  engine: EngineType;
  theme: string;
}) {
  return (
    <DesignSystemProvider forceEngine={engine} tenantSlug={theme}>
      <LivePreviewContent component={component} />
    </DesignSystemProvider>
  );
}

function LivePreviewContent({ component }: { component: ComponentType }) {
  switch (component) {
    case 'Button':
      return (
        <Flex gap={8} style={{ flexWrap: 'wrap' }}>
          <Button variant="primary">Primary Action</Button>
          <Button>Default</Button>
          <Button variant="ghost">Ghost</Button>
        </Flex>
      );
    case 'Input':
      return (
        <Box style={{ width: '100%', maxWidth: 400 }}>
          <Input placeholder="Enter your email..." />
        </Box>
      );
    case 'Card':
      return (
        <Box style={{ width: '100%', maxWidth: 400 }}>
          <Card>
            <Stack spacing="sm">
              <Flex align="center" justify="between">
                <Text size="sm" weight="semibold">Sample Card</Text>
                <Badge variant="success">Active</Badge>
              </Flex>
              <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
                Card content rendered with the selected engine.
              </Text>
            </Stack>
          </Card>
        </Box>
      );
    case 'Badge':
      return (
        <Flex gap={8} style={{ flexWrap: 'wrap' }}>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
        </Flex>
      );
  }
}

export default function PlaygroundPage() {
  const tokens = useTokens();
  const { engine, setEngine, tenantSlug: theme, setTenantSlug: setTheme } = useShowroom();
  const [selectedComponent, setSelectedComponent] = useState<ComponentType>('Button');

  return (
    <Stack spacing="lg">
      {/* Page header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            Playground
          </Text>
          <Badge variant="primary">Interactive</Badge>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Experiment with components across engines and themes. Pick a component,
            choose an engine and theme, and see the live result alongside the code
            needed to reproduce it.
          </Text>
        </Box>
      </Box>

      {/* Main playground area */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: tokens.spacing[5],
          alignItems: 'start',
        }}
      >
        {/* Left: Controls */}
        <Card>
          <Stack spacing="md">
            <Text as={"h3" as any} size="md" weight="semibold">
              Controls
            </Text>

            {/* Component selector */}
            <Stack spacing="xs">
              <Text size="sm" weight="medium">Component</Text>
              <Flex gap={0} style={{ borderRadius: 'var(--ds-border-radius-md, 8px)', overflow: 'hidden', border: '1px solid var(--ds-color-border, #e5e7eb)' }}>
                {COMPONENT_OPTIONS.map((opt) => {
                  const isActive = selectedComponent === opt.value;
                  return (
                    <Box
                      key={opt.value}
                      as="button"
                      onClick={() => setSelectedComponent(opt.value)}
                      style={{
                        cursor: 'pointer',
                        flex: 1,
                        padding: '8px 4px',
                        textAlign: 'center' as const,
                        background: isActive
                          ? 'var(--ds-color-primary, #0066cc)'
                          : 'var(--ds-color-bg-container, #ffffff)',
                        color: isActive
                          ? 'var(--ds-color-text-inverse, #ffffff)'
                          : 'var(--ds-color-text-primary, #1a1a1a)',
                        border: 'none',
                        borderRight: opt.value !== 'Badge' ? '1px solid var(--ds-color-border, #e5e7eb)' : 'none',
                        transition: 'background 0.2s ease, color 0.2s ease',
                        outline: 'none',
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {opt.label}
                    </Box>
                  );
                })}
              </Flex>
            </Stack>

            {/* Engine switcher */}
            <Stack spacing="xs">
              <Text size="sm" weight="medium">Engine</Text>
              <EngineSwitcher value={engine} onChange={setEngine} />
            </Stack>

            {/* Theme switcher */}
            <Stack spacing="xs">
              <Text size="sm" weight="medium">Theme</Text>
              <ThemeSwitcher value={theme} onChange={setTheme} />
            </Stack>

            {/* Info */}
            <Box
              style={{
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.md,
                background: 'var(--ds-color-primary-50)',
                border: '1px solid var(--ds-color-primary-200)',
              }}
            >
              <Text size="xs" style={{ color: 'var(--ds-color-primary-700)' }}>
                The preview on the right is wrapped in its own DesignSystemProvider
                with forceEngine=&quot;{engine}&quot; and tenantSlug=&quot;{theme}&quot;.
                Changes here do not affect the showroom shell.
              </Text>
            </Box>
          </Stack>
        </Card>

        {/* Right: Preview and code */}
        <Stack spacing="md">
          {/* Live preview */}
          <ComponentPreview
            title={`${selectedComponent} -- ${engine} engine, ${theme} theme`}
          >
            <LivePreview
              component={selectedComponent}
              engine={engine}
              theme={theme}
            />
          </ComponentPreview>

          {/* Code snippet */}
          <CodeBlock
            title="Code"
            language="tsx"
            code={getCodeSnippet(selectedComponent, engine, theme)}
          />
        </Stack>
      </Box>

      {/* How it works */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            How the Playground Works
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Each preview is wrapped in its own DesignSystemProvider. The provider
            accepts forceEngine to override the engine context and tenantSlug to
            select a tenant theme. This is the same mechanism apps use at the route
            level to render different visual identities.
          </Text>
          <Stack spacing="xs">
            {[
              'forceEngine overrides the engine context for all child components',
              'tenantSlug loads the CSS variables for that tenant brand',
              'Components read tokens from context -- no prop changes needed',
              'Nested providers are supported for mixed-engine previews',
            ].map((item, i) => (
              <Flex key={i} align="baseline" gap={8}>
                <Text size="sm" style={{ color: 'var(--ds-color-text-muted)' }}>-</Text>
                <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>{item}</Text>
              </Flex>
            ))}
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
