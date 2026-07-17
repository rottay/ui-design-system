'use client';

import { ShowroomLink as Link } from '@/components/showroom-link';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Stack,
  Text,
} from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import { ArrowLeftIcon } from '@rottay/design-system/icons';
import { CodeBlock } from '@/components/playground';
import { useShowroom } from '@/components/showroom-context';
import { DocsCompactList, DocsSectionHeader } from '@/components/docs/editorial-chrome';

interface Step {
  number: string;
  title: string;
  description: string;
  code: string;
  language: string;
  codeTitle: string;
  successSignal: string;
  watchFor: string;
}

const STEPS: Step[] = [
  {
    number: '1',
    title: 'Install the package in the real app workspace',
    description:
      'Add the design system where the UI actually renders so imports, types, and styles resolve from the same workspace boundary.',
    code: 'pnpm add @rottay/design-system',
    language: 'bash',
    codeTitle: 'Install',
    successSignal: 'The app can import DS components without alias hacks or duplicate package copies.',
    watchFor: 'Install once at the UI workspace instead of sprinkling local wrappers across packages.',
  },
  {
    number: '2',
    title: 'Mount DesignSystemProvider at the correct boundary',
    description:
      'The provider establishes engine, tenant variables, and token access. Put it high enough that real route content shares the same runtime context.',
    code: `import { DesignSystemProvider } from '@rottay/design-system';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <DesignSystemProvider forceEngine="modern" tenantSlug="rottay">
          {children}
        </DesignSystemProvider>
      </body>
    </html>
  );
}`,
    language: 'tsx',
    codeTitle: 'Root layout',
    successSignal: 'Tokens, engine styles, and tenant variables are available to every DS child below.',
    watchFor: 'Do not mount the provider so low that neighboring route content uses different runtime assumptions.',
  },
  {
    number: '3',
    title: 'Render one convincing DS panel',
    description:
      'Use DS primitives and cards to prove composition is healthy before introducing custom wrappers or route-specific utility layers.',
    code: `import { Badge, Card, Flex, Stack, Text } from '@rottay/design-system';

export function TeamPanel() {
  return (
    <Card>
      <Stack spacing="md">
        <Flex align="center" justify="between">
          <Text as={"h2" as any} size="lg" weight="semibold">Users</Text>
          <Badge variant="success">Healthy</Badge>
        </Flex>
        <Text size="sm">Use DS layout primitives before inventing wrappers.</Text>
      </Stack>
    </Card>
  );
}`,
    language: 'tsx',
    codeTitle: 'First panel',
    successSignal: 'The UI already looks like product software, not a starter template with tokens bolted on.',
    watchFor: 'Reach for Box, Flex, Stack, Text, Card, Button, and Badge before raw DOM scaffolding.',
  },
  {
    number: '4',
    title: 'Choose engine posture deliberately',
    description:
      'Classic, Modern, and Rustic preserve the same consuming API while changing tone, density, and framing underneath.',
    code: `<DesignSystemProvider forceEngine="classic" tenantSlug="rottay">
  <Button variant="primary">Classic enterprise tone</Button>
</DesignSystemProvider>

<DesignSystemProvider forceEngine="modern" tenantSlug="rottay">
  <Button variant="primary">Modern product tone</Button>
</DesignSystemProvider>`,
    language: 'tsx',
    codeTitle: 'Engine choice',
    successSignal: 'The same markup can pivot tone without any API churn in the route code.',
    watchFor: 'Engine choice is a product posture decision, not a styling afterthought.',
  },
  {
    number: '5',
    title: 'Let tenant branding handle last-mile identity',
    description:
      'Keep business semantics in the app while BrandTheme variables control color, radius, shadow, and chrome details across the same component tree.',
    code: `<DesignSystemProvider tenantSlug="bithire" forceEngine="modern">
  <App />
</DesignSystemProvider>`,
    language: 'tsx',
    codeTitle: 'Tenant identity',
    successSignal: 'Brand identity moves through variables while the component tree remains stable and reusable.',
    watchFor: 'Do not bury tenant-specific colors or spacing values inside route components.',
  },
] as const;

const PREFLIGHT_CHECKLIST = [
  'Know which workspace owns the app shell that should render the DS.',
  'Pick the initial engine before polishing the first route.',
  'Pick a tenantSlug or baseline brand for the first success state.',
  'Verify TypeScript resolves the workspace package correctly.',
] as const;

const FAILURE_MODES = [
  {
    title: 'Healthy render never happens',
    detail:
      'Teams keep talking about tokens and architecture without ever proving the DS can render a real panel in the actual app shell.',
    fix: 'Render one small but credible route immediately and use that as the baseline.',
  },
  {
    title: 'Too many wrappers, too early',
    detail:
      'Custom layout utilities appear before the DS primitives are given a real chance to compose the screen.',
    fix: 'Author the first route with DS primitives directly, then create wrappers only where repetition is undeniable.',
  },
  {
    title: 'Engine choice is left implicit',
    detail:
      'A route inherits whatever visual tone happened to be mounted instead of selecting the product posture intentionally.',
    fix: 'Choose Classic, Modern, or Rustic early and validate that choice with the playground.',
  },
] as const;

const NEXT_MOVES = [
  {
    title: 'Need the ownership model next?',
    href: '/developers/architecture',
    description: 'Use the 4-tier architecture guide before adding shared APIs or abstractions.',
  },
  {
    title: 'Need visual proof next?',
    href: '/playground',
    description: 'Compare scenes across engines and tenants before polishing product code.',
  },
  {
    title: 'Need brand overrides next?',
    href: '/playground/theme-builder',
    description: 'Inspect which brand variables move the UI most without changing the markup.',
  },
] as const;

function QuickstartPreview() {
  const { engine, tenantSlug } = useShowroom();

  return (
    <Card
      style={{
        padding: 22,
        border: '1px solid var(--ds-color-border-secondary)',
        background:
          'linear-gradient(180deg, var(--ds-color-bg-elevated), var(--ds-color-bg-primary))',
      }}
    >
      <Stack spacing="md">
        <Flex align="center" justify="between" style={{ gap: 12, flexWrap: 'wrap' }}>
          <Stack spacing={2}>
            <Text as={"h3" as any} size="lg" weight="semibold">
              First successful render
            </Text>
            <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
              The baseline that proves the DS is mounted correctly
            </Text>
          </Stack>
          <Badge variant="success">Healthy</Badge>
        </Flex>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: 10,
          }}
        >
          {[
            { label: 'Provider', value: 'Mounted' },
            { label: 'Engine', value: engine },
            { label: 'Tenant', value: tenantSlug },
            { label: 'Outcome', value: 'Credible UI' },
          ].map((item) => (
            <Box
              key={item.label}
              style={{
                padding: 12,
                borderRadius: 12,
                border: '1px solid var(--ds-color-border-secondary)',
                background:
                  'linear-gradient(180deg, var(--ds-color-bg-overlay), var(--ds-color-bg-primary))',
              }}
            >
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
                <Text size="sm" weight="semibold" style={{ textTransform: 'capitalize' }}>
                  {item.value}
                </Text>
              </Stack>
            </Box>
          ))}
        </Box>

        <Box
          style={{
            padding: 12,
            borderRadius: 14,
            background: 'var(--ds-color-bg-overlay)',
            border: '1px solid var(--ds-color-border-secondary)',
          }}
        >
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
            If this level of composition renders cleanly, the next problems are
            classification and scale, not setup uncertainty.
          </Text>
        </Box>

        <Flex gap={8} style={{ flexWrap: 'wrap' }}>
          <Button variant="primary">Primary action</Button>
          <Button>Default</Button>
        </Flex>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 8,
          }}
        >
          {['Provider mounted', 'Engine selected', 'Tenant resolved'].map((item) => (
            <Box
              key={item}
              style={{
                padding: '8px 10px',
                borderRadius: 999,
                border: '1px solid var(--ds-color-border-secondary)',
                background: 'var(--ds-color-bg-overlay)',
              }}
            >
              <Text size="xs" weight="medium" style={{ color: 'var(--ds-color-text-secondary)' }}>
                {item}
              </Text>
            </Box>
          ))}
        </Box>
      </Stack>
    </Card>
  );
}

export default function GettingStartedPage() {
  const tokens = useTokens();

  return (
    <Stack spacing="xl" fullWidth>
      <Link
        href="/developers"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.875rem',
          color: 'var(--ds-color-link)',
          textDecoration: 'none',
        }}
      >
        <ArrowLeftIcon size={14} /> Back to Developers
      </Link>

      <Card
        style={{
          overflow: 'hidden',
          border: '1px solid var(--ds-color-border-secondary)',
          background:
            'linear-gradient(180deg, var(--ds-color-bg-secondary), var(--ds-color-bg-surface))',
          boxShadow: tokens.shadows.lg,
        }}
      >
        <Box
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `
              radial-gradient(circle at top left, var(--ds-color-info-bg) 0%, transparent 34%),
              radial-gradient(circle at 84% 18%, var(--ds-color-warning-bg) 0%, transparent 26%),
              linear-gradient(180deg, transparent 0%, var(--ds-color-bg-surface) 100%)
            `,
            opacity: 0.7,
          }}
        />
        <Box
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: tokens.spacing[5],
            alignItems: 'start',
          }}
        >
          <Stack spacing="lg">
            <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="primary">Getting started</Badge>
              <Badge variant="secondary">First 30 minutes of adoption</Badge>
            </Flex>

            <Stack spacing="sm">
              <Text
                as={"h1" as any}
                size="2xl"
                weight="bold"
                style={{ letterSpacing: '-0.04em' }}
              >
                The fastest path to value is direct: install, mount, render one
                healthy panel, then choose engine and tenant with intent.
              </Text>
              <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
                This page is optimized for the first successful render. It blocks
                the common failure mode where teams discuss architecture or theming
                before the design system has ever produced a credible route inside
                the app.
              </Text>
            </Stack>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: tokens.spacing[3],
              }}
            >
              {[
                {
                  label: 'Primary goal',
                  value: 'One healthy route',
                  detail: 'Prove the DS is alive before discussing abstractions.',
                },
                {
                  label: 'Key decisions',
                  value: 'Engine + tenant',
                  detail: 'Choose posture and brand intentionally, not by accident.',
                },
                {
                  label: 'Authoring habit',
                  value: 'Use DS primitives first',
                  detail: 'Avoid wrapper debt until real repetition appears.',
                },
              ].map((item) => (
                <Box
                  key={item.label}
                  style={{
                    padding: tokens.spacing[4],
                    borderRadius: tokens.borderRadius.lg,
                    background: 'var(--ds-color-bg-overlay)',
                    border: '1px solid var(--ds-color-border-secondary)',
                    minHeight: 136,
                  }}
                >
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
                  <Text size="sm" weight="semibold" style={{ marginTop: tokens.spacing[2], lineHeight: 1.3 }}>
                    {item.value}
                  </Text>
                  <Box
                    style={{
                      marginTop: tokens.spacing[2],
                      paddingTop: tokens.spacing[2],
                      borderTop: '1px solid var(--ds-color-border-secondary)',
                    }}
                  >
                    <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                      {item.detail}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>

            <Box
              style={{
                padding: tokens.spacing[4],
                borderRadius: tokens.borderRadius.xl,
                background: 'var(--ds-color-bg-overlay)',
                border: '1px solid var(--ds-color-border-secondary)',
              }}
            >
              <Text size="sm" weight="semibold">
                Recommended sequence
              </Text>
              <Text size="sm" style={{ marginTop: tokens.spacing[2], color: 'var(--ds-color-text-secondary)', lineHeight: 1.6 }}>
                Install once, mount the provider, render one convincing route,
                validate engine posture, then let tenant branding handle the
                identity layer.
              </Text>
              <Flex gap={8} style={{ flexWrap: 'wrap', marginTop: tokens.spacing[3] }}>
                {['Install', 'Mount', 'Render', 'Choose engine', 'Apply tenant'].map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </Flex>
            </Box>
          </Stack>

          <Stack spacing="md">
            <QuickstartPreview />
            <Card
              style={{
                padding: tokens.spacing[5],
                border: '1px solid var(--ds-color-border-secondary)',
                background:
                  'linear-gradient(180deg, var(--ds-color-bg-primary), var(--ds-color-bg-elevated))',
              }}
            >
              <Stack spacing="sm">
                <Text size="sm" weight="semibold" style={{ color: 'var(--ds-color-text-muted)' }}>
                  Preflight checklist
                </Text>
                <DocsCompactList
                  numbered
                  items={PREFLIGHT_CHECKLIST.map((item, index) => ({
                    title: item,
                    tone: index === 0 ? 'accent' : 'default',
                  }))}
                />
              </Stack>
            </Card>
          </Stack>
        </Box>
      </Card>

      <Stack spacing="md">
        <DocsSectionHeader
          eyebrow="Delivery sequence"
          title="Setup runway"
          description="Follow this sequence to get from zero to a credible product panel without wrapper debt or runtime confusion."
          actions={<Badge variant="secondary">{STEPS.length} setup steps</Badge>}
          tone="accent"
        />

        <Stack spacing="md">
          {STEPS.map((step) => (
            <Card key={step.number} style={{ padding: tokens.spacing[5] }}>
              <Box
                className="developers-start-step-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.12fr) minmax(280px, 0.88fr)',
                  gap: tokens.spacing[4],
                  alignItems: 'start',
                }}
              >
                <Stack spacing="md">
                  <Flex align="start" gap={12}>
                    <Box
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        background: 'var(--ds-color-primary-500)',
                        color: 'var(--ds-color-text-inverse, #ffffff)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {step.number}
                    </Box>
                    <Box style={{ minWidth: 0 }}>
                      <Text as={"h3" as any} size="lg" weight="semibold">
                        {step.title}
                      </Text>
                      <Text
                        size="sm"
                        style={{
                          marginTop: tokens.spacing[2],
                          color: 'var(--ds-color-text-secondary)',
                          lineHeight: 1.55,
                        }}
                      >
                        {step.description}
                      </Text>
                    </Box>
                  </Flex>

                  <Box
                    className="developers-start-step-check-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: tokens.spacing[3],
                    }}
                  >
                    <Box
                      style={{
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.lg,
                        background: 'var(--ds-color-success-bg)',
                        border: '1px solid var(--ds-color-success-border)',
                      }}
                    >
                      <Stack spacing={4}>
                        <Text
                          size="xs"
                          weight="semibold"
                          style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
                        >
                          Success signal
                        </Text>
                        <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                          {step.successSignal}
                        </Text>
                      </Stack>
                    </Box>

                    <Box
                      style={{
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.lg,
                        background: 'var(--ds-color-warning-bg)',
                        border: '1px solid var(--ds-color-warning-border)',
                      }}
                    >
                      <Stack spacing={4}>
                        <Text
                          size="xs"
                          weight="semibold"
                          style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
                        >
                          Watch for
                        </Text>
                        <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                          {step.watchFor}
                        </Text>
                      </Stack>
                    </Box>
                  </Box>
                </Stack>

                <CodeBlock title={step.codeTitle} language={step.language} code={step.code} />
              </Box>
            </Card>
          ))}
        </Stack>
      </Stack>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: tokens.spacing[5],
          alignItems: 'start',
        }}
      >
        <Card style={{ padding: tokens.spacing[6] }}>
          <Stack spacing="md">
            <DocsSectionHeader
              eyebrow="Risk audit"
              title="Common failure modes"
              description="These are the adoption mistakes that make docs feel abstract and implementation feel slower than it needs to be."
              tone="warning"
            />
            <DocsCompactList
              items={FAILURE_MODES.map((item) => ({
                title: item.title,
                detail: item.detail,
                metaLabel: 'Fix',
                meta: item.fix,
                tone: 'warning',
              }))}
            />
          </Stack>
        </Card>

        <Card style={{ padding: tokens.spacing[6] }}>
          <Stack spacing="md">
            <DocsSectionHeader
              eyebrow="Next step"
              title="After the first render"
              description="Once the provider is healthy and one route feels real, the next decision is where to deepen: ownership, visual proof, or brand overrides."
              tone="success"
            />
            <DocsCompactList
              items={NEXT_MOVES.map((move, index) => ({
                title: move.title,
                detail: move.description,
                href: move.href,
                tone: index === 0 ? 'accent' : 'default',
              }))}
            />
          </Stack>
        </Card>
      </Box>

      <style>{`
        @container showroom-content (max-width: 1080px) {
          .developers-start-step-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @container showroom-content (max-width: 760px) {
          .developers-start-step-check-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Stack>
  );
}
