'use client';

import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import { ArrowLeftIcon } from '@rottay/design-system/icons';
import { CodeBlock } from '@/components/playground';

interface Step {
  number: string;
  title: string;
  description: string;
  code: string;
  language: string;
  codeTitle: string;
}

const STEPS: Step[] = [
  {
    number: '1',
    title: 'Install the package',
    description:
      'Add @rottay/design-system to your project. The package includes all primitives, patterns, structures, surfaces, icons, and charts.',
    code: 'pnpm add @rottay/design-system',
    language: 'bash',
    codeTitle: 'Terminal',
  },
  {
    number: '2',
    title: 'Wrap your app with DesignSystemProvider',
    description:
      'The provider establishes engine context, injects tenant CSS variables, and makes tokens available to all child components. Place it at the root of your application.',
    code: `import { DesignSystemProvider } from '@rottay/design-system';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <DesignSystemProvider
          forceEngine="modern"
          tenantSlug="rottay"
        >
          {children}
        </DesignSystemProvider>
      </body>
    </html>
  );
}`,
    language: 'tsx',
    codeTitle: 'app/layout.tsx',
  },
  {
    number: '3',
    title: 'Import and use components',
    description:
      'All components are available from the main entry point. Use DS components instead of raw HTML elements. Icons come from the /icons subpath.',
    code: `import { Button, Card, Flex, Stack, Text, Badge } from '@rottay/design-system';
import { SearchIcon, PlusIcon } from '@rottay/design-system/icons';

export function MyComponent() {
  return (
    <Card>
      <Stack spacing="md">
        <Flex align="center" justify="between">
          <Text as={"h2" as any} size="lg" weight="semibold">
            Users
          </Text>
          <Button variant="primary">
            <PlusIcon size={16} />
            Add User
          </Button>
        </Flex>
        <Flex gap={8}>
          <Badge variant="success">12 active</Badge>
          <Badge variant="warning">3 pending</Badge>
        </Flex>
      </Stack>
    </Card>
  );
}`,
    language: 'tsx',
    codeTitle: 'components/my-component.tsx',
  },
  {
    number: '4',
    title: 'Choose an engine',
    description:
      'The DS ships three rendering engines: Classic (Ant Design), Modern (Tailwind/DaisyUI), and Rustic (vanilla CSS). Set the engine via forceEngine on the provider. Each engine produces different visual output from the same component API.',
    code: `// Classic -- corporate, enterprise-grade, sharp corners
<DesignSystemProvider forceEngine="classic" tenantSlug="rottay">
  <Button variant="primary">Enterprise Action</Button>
</DesignSystemProvider>

// Modern -- clean, rounded, contemporary
<DesignSystemProvider forceEngine="modern" tenantSlug="rottay">
  <Button variant="primary">Modern Action</Button>
</DesignSystemProvider>

// Rustic -- minimal, elegant, understated
<DesignSystemProvider forceEngine="rustic" tenantSlug="rottay">
  <Button variant="primary">Rustic Action</Button>
</DesignSystemProvider>`,
    language: 'tsx',
    codeTitle: 'Engine options',
  },
  {
    number: '5',
    title: 'Set up tenant branding',
    description:
      'Each tenant can customize ~140 CSS variables via BrandTheme. Pass the tenant slug to the provider and the theme system resolves the merge chain: DS base -> engine overrides -> vertical baseline -> BrandTheme.',
    code: `import { DesignSystemProvider } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';

// The provider injects tenant-specific CSS variables
<DesignSystemProvider tenantSlug="bithire">
  <MyApp />
</DesignSystemProvider>

// Components read tokens from context
function MyApp() {
  const tokens = useTokens();

  return (
    <Box
      style={{
        borderRadius: tokens.borderRadius.md,
        boxShadow: tokens.shadows.md,
        padding: tokens.spacing[4],
      }}
    >
      <Text>Themed content</Text>
    </Box>
  );
}`,
    language: 'tsx',
    codeTitle: 'Tenant branding',
  },
];

const RULES = [
  { rule: 'Use DS components', detail: 'Never use raw <div>, <span>, <p>, <h1>. Use Box, Flex, Stack, Text instead.' },
  { rule: 'No hardcoded colors', detail: 'Use CSS variables: var(--ds-color-primary), var(--ds-color-text-muted), etc.' },
  { rule: 'Icons from DS', detail: 'Import from @rottay/design-system/icons, not directly from lucide-react.' },
  { rule: 'Text headings', detail: 'Use <Text as={"h1" as any}> instead of raw <h1> elements.' },
  { rule: 'Flex gap as number', detail: 'Flex gap prop accepts numbers only: <Flex gap={8}> not gap="8".' },
  { rule: 'Input onChange', detail: 'Input onChange signature is (value: string) => void, not an event handler.' },
];

export default function GettingStartedPage() {
  const tokens = useTokens();

  return (
    <Stack spacing="lg">
      {/* Back link */}
      <Link
        href="/developers"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.875rem',
          color: 'var(--ds-color-primary-500)',
          textDecoration: 'none',
        }}
      >
        <ArrowLeftIcon size={14} /> Back to Developers
      </Link>

      {/* Page header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            Getting Started
          </Text>
          <Badge variant="primary">5 steps</Badge>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            A step-by-step guide to integrating the Rottay Design System into your
            application. From installation to tenant branding, everything you need
            to get running.
          </Text>
        </Box>
      </Box>

      {/* Steps */}
      {STEPS.map((step) => (
        <Card key={step.number}>
          <Stack spacing="md">
            {/* Step header */}
            <Flex align="center" gap={12}>
              <Box
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--ds-color-primary-500)',
                  color: 'var(--ds-color-text-inverse, #ffffff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                }}
              >
                {step.number}
              </Box>
              <Text as={"h3" as any} size="lg" weight="semibold">
                {step.title}
              </Text>
            </Flex>

            {/* Description */}
            <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
              {step.description}
            </Text>

            {/* Code block */}
            <CodeBlock
              title={step.codeTitle}
              language={step.language}
              code={step.code}
            />
          </Stack>
        </Card>
      ))}

      {/* Important rules */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            Important Rules
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            These conventions must be followed across all applications consuming
            the design system.
          </Text>

          <Stack spacing="xs">
            {RULES.map((item) => (
              <Box
                key={item.rule}
                style={{
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  background: 'var(--ds-color-neutral-50)',
                  border: '1px solid var(--ds-color-neutral-200)',
                }}
              >
                <Text size="sm" weight="semibold">{item.rule}</Text>
                <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)', marginTop: 2 }}>
                  {item.detail}
                </Text>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
