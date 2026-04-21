'use client';

import { ShowroomLink as Link } from '@/components/showroom-link';
import { Box, Card, Badge, Flex, Stack, Text } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import { formatShowroomLabel } from '@/components/layout/config';
import {
  surfaceGroups,
  surfaces,
  surfacesByGroup,
  type SurfaceGroup,
} from '@/data/registry';
import { CodeBlock } from '@/components/playground';
import {
  ActivityIcon,
  BarChart3Icon,
  Building2Icon,
  EditIcon,
  LayoutTemplateIcon,
  SparklesIcon,
} from '@rottay/design-system/icons';

interface SurfaceEditorial {
  promise: string;
  description: string;
  bestFor: string;
  examples: string[];
  tint: string;
  accent: string;
  icon: React.ReactNode;
}

const SURFACE_EDITORIAL: Record<SurfaceGroup, SurfaceEditorial> = {
  admin: {
    promise: 'Run internal systems, settings, and governance flows.',
    description:
      'Admin surfaces package repeated back-office screens into reusable page contracts.',
    bestFor: 'Admin consoles, settings, multi-tenant control planes',
    examples: ['SettingsSurface', 'TeamSurface', 'AuditSurface'],
    tint: 'var(--ds-color-primary-50)',
    accent: 'var(--ds-color-primary-600)',
    icon: <Building2Icon size={20} />,
  },
  data: {
    promise: 'Present entities, metrics, search, and analysis as full screens.',
    description:
      'Data surfaces turn lists, dashboards, reports, and comparisons into consistent layouts.',
    bestFor: 'Reporting, analytics, entity browsing, search',
    examples: ['ListSurface', 'DashboardSurface', 'ReportSurface'],
    tint: 'var(--ds-color-success-50)',
    accent: 'var(--ds-color-success-700)',
    icon: <BarChart3Icon size={20} />,
  },
  experience: {
    promise: 'Ship user-facing journeys with a stronger product posture.',
    description:
      'Experience surfaces cover the public and user-facing edges of the system.',
    bestFor: 'Auth, onboarding, messaging, marketing, branded journeys',
    examples: ['AuthSurface', 'OnboardingSurface', 'MarketingSurface'],
    tint: 'var(--ds-color-warning-50)',
    accent: 'var(--ds-color-warning-700)',
    icon: <SparklesIcon size={20} />,
  },
  forms: {
    promise: 'Wrap drafting, editing, and review into page-level flows.',
    description:
      'Form surfaces lift builders and sections into complete authoring screens.',
    bestFor: 'Creation flows, onboarding, editing, reviewable submissions',
    examples: ['FormSurface', 'DetailFormSurface', 'WizardSurface'],
    tint: 'var(--ds-color-primary-50)',
    accent: 'var(--ds-color-primary-700)',
    icon: <EditIcon size={20} />,
  },
  operations: {
    promise: 'Support live work, scheduling, queues, and monitoring.',
    description:
      'Operations surfaces target day-to-day execution work where visibility and action speed matter.',
    bestFor: 'Command centers, staffing, activity streams, live desks',
    examples: ['KanbanSurface', 'SchedulerSurface', 'OperationalSurface'],
    tint: 'var(--ds-color-error-50)',
    accent: 'var(--ds-color-error-700)',
    icon: <ActivityIcon size={20} />,
  },
  workspace: {
    promise: 'Assemble the richest operator desks in the system.',
    description:
      'Workspace surfaces combine multiple views and support rails into heavier working environments.',
    bestFor: 'Decision queues, collection workbenches, multi-mode products',
    examples: ['CollectionWorkspaceSurface', 'DecisionInboxSurface', 'RecordWorkbenchSurface'],
    tint: 'var(--ds-color-neutral-100)',
    accent: 'var(--ds-color-text-primary, #111827)',
    icon: <LayoutTemplateIcon size={20} />,
  },
};

const OWNERSHIP_ROWS = [
  {
    label: 'Design system owns',
    detail: 'Composition, chrome, slots, defaults, and repeatable page behavior.',
  },
  {
    label: 'Application owns',
    detail: 'Data, routes, permissions, mutations, adapters, and domain semantics.',
  },
  {
    label: 'Best split',
    detail: 'Keep the surface declarative and pass domain wiring through config.',
  },
];

const SURFACE_DECISION_POINTS = [
  {
    label: 'Escalate to surfaces when',
    detail: 'The screen needs durable page chrome, layout slots, and action defaults that should repeat across routes.',
  },
  {
    label: 'Stay below the surface when',
    detail: 'The work is still a local interaction, a single task module, or a structure choice rather than a full screen contract.',
  },
  {
    label: 'Keep config readable',
    detail: 'A teammate should be able to scan the config object and understand the page without opening supporting files.',
  },
];

const SURFACE_SNIPPET = `const usersSurface = {
  title: 'Users',
  entityName: 'user',
  views: ['table', 'grid'],
  columns: userColumns,
  data: users,
  actions: {
    create: true,
    export: true,
  },
};

<ListSurface config={usersSurface} />`;

const CARD_SURFACE =
  'var(--ds-surface-card, var(--ds-color-bg-elevated, var(--ds-color-neutral-50)))';
const PANEL_SURFACE =
  'var(--ds-surface-panel, var(--ds-color-bg-tertiary, var(--ds-color-neutral-100)))';
const SUBTLE_BORDER =
  '1px solid var(--ds-color-border-subtle, var(--ds-color-neutral-200))';
const SHADOW = '0 22px 52px var(--ds-color-shadow, rgba(0, 0, 0, 0.22))';
const HERO_OVERLAY =
  'radial-gradient(circle at top right, color-mix(in srgb, var(--ds-color-success-500) 16%, transparent), transparent 30%), radial-gradient(circle at left bottom, color-mix(in srgb, var(--ds-color-primary-500) 10%, transparent), transparent 34%)';

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Box
      style={{
        minWidth: 0,
        padding: 16,
        borderRadius: 20,
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated) 92%, var(--ds-color-success-500) 8%) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
        border: SUBTLE_BORDER,
        boxShadow: SHADOW,
      }}
    >
      <Stack spacing={6}>
        <Text
          size="xs"
          weight="semibold"
          style={{
            display: 'block',
            color: 'var(--ds-color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {label}
        </Text>
        <Text
          size={value.length > 12 ? 'sm' : 'lg'}
          weight="bold"
          style={{
            display: 'block',
            overflowWrap: 'anywhere',
            lineHeight: 1.2,
          }}
        >
          {value}
        </Text>
      </Stack>
    </Box>
  );
}

export default function SurfacesPage() {
  const tokens = useTokens();

  return (
    <Stack spacing="lg" fullWidth>
      <Card
        style={{
          padding: tokens.spacing[5],
          border:
            '1px solid color-mix(in srgb, var(--ds-color-primary-500) 18%, var(--ds-color-border-subtle, var(--ds-color-neutral-200)))',
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-success-500) 8%, var(--ds-color-bg-secondary)) 0%, var(--ds-color-bg-elevated) 100%)',
          boxShadow: SHADOW,
          position: 'relative',
        }}
      >
        <Box
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: HERO_OVERLAY,
            pointerEvents: 'none',
          }}
        />

        <Box
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: tokens.spacing[4],
            alignItems: 'start',
          }}
        >
          <Stack spacing="md" style={{ minWidth: 0 }}>
            <Box style={{ paddingBottom: tokens.spacing[3], borderBottom: SUBTLE_BORDER }}>
              <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
                <Badge variant="primary">{surfaces.length} surfaces</Badge>
                <Badge variant="secondary">{surfaceGroups.length} domains</Badge>
              </Flex>
              <Stack spacing="xs" style={{ marginTop: tokens.spacing[3] }}>
                <Text as={"h1" as any} size="2xl" weight="bold" style={{ display: 'block' }}>
                  Surfaces
                </Text>
                <Text
                  size="sm"
                  style={{
                    display: 'block',
                    color: 'var(--ds-color-text-secondary)',
                    maxWidth: 760,
                    lineHeight: 1.6,
                  }}
                >
                  Full-page contracts that compose structures and patterns while the application
                  supplies data, routing, permissions, and policy.
                </Text>
              </Stack>
            </Box>
            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              {['Config-first', 'Page-level', 'Reusable recipes'].map((item) => (
                <Badge key={item} variant="secondary">
                  {item}
                </Badge>
              ))}
            </Flex>
            <Box
              style={{
                padding: tokens.spacing[4],
                borderRadius: tokens.borderRadius.xl,
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-success-500) 6%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
                border: SUBTLE_BORDER,
              }}
            >
              <Stack spacing="xs">
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: 'block',
                    color: 'var(--ds-color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Contract reading
                </Text>
                <Box style={{ paddingTop: 10, borderTop: SUBTLE_BORDER }}>
                  <Text
                    size="sm"
                    style={{
                      display: 'block',
                      color: 'var(--ds-color-text-secondary)',
                      lineHeight: 1.6,
                    }}
                  >
                    The DS should own composition and defaults while the application keeps the
                    data, routes, and policy visible through config.
                  </Text>
                </Box>
              </Stack>
            </Box>
          </Stack>

          <Stack spacing="md" style={{ minWidth: 0 }}>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: tokens.spacing[3],
              }}
            >
              <StatCard label="Domains" value={`${surfaceGroups.length}`} />
              <StatCard label="Engines" value="3" />
              <StatCard label="Contract style" value="Config-first" />
              <StatCard label="Scope" value="Full page" />
            </Box>

            <Box
              style={{
                padding: tokens.spacing[4],
                borderRadius: tokens.borderRadius.xl,
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 4%, var(--ds-surface-panel, var(--ds-color-bg-tertiary))) 0%, var(--ds-surface-panel, var(--ds-color-bg-tertiary)) 100%)',
                border: SUBTLE_BORDER,
              }}
            >
              <Stack spacing="xs">
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: 'block',
                    color: 'var(--ds-color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Escalation cue
                </Text>
                <Box style={{ paddingTop: 10, borderTop: SUBTLE_BORDER }}>
                  <Text
                    size="sm"
                    style={{
                      display: 'block',
                      color: 'var(--ds-color-text-secondary)',
                      lineHeight: 1.6,
                    }}
                  >
                    Reach for a surface after primitives, patterns, and structures have already
                    answered the smaller questions and the page still needs a consistent shell.
                  </Text>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Card>

      <Card
        style={{
          padding: tokens.spacing[5],
          border: SUBTLE_BORDER,
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 3%, var(--ds-color-bg-elevated)) 0%, var(--ds-color-bg-secondary) 100%)',
        }}
      >
        <Stack spacing="md" fullWidth>
          <Box style={{ paddingBottom: tokens.spacing[3], borderBottom: SUBTLE_BORDER }}>
            <Flex
              align="center"
              justify="between"
              style={{ gap: tokens.spacing[3], flexWrap: 'wrap' }}
            >
              <Box>
                <Text as={"h2" as any} size="xl" weight="semibold" style={{ display: 'block' }}>
                  Read the Surface Contract
                </Text>
                <Text
                  size="sm"
                  style={{
                    display: 'block',
                    color: 'var(--ds-color-text-secondary)',
                    lineHeight: 1.6,
                  }}
                >
                  Tighten the boundary first, then browse a domain recipe with the right expectations.
                </Text>
              </Box>
              <Badge variant="secondary">Declarative first</Badge>
            </Flex>
          </Box>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: tokens.spacing[4],
              alignItems: 'stretch',
            }}
          >
            <Card
              style={{
                height: '100%',
                border: SUBTLE_BORDER,
                background: CARD_SURFACE,
                boxShadow: SHADOW,
              }}
            >
              <Stack spacing="md">
                <Flex
                  align="center"
                  justify="between"
                  gap={12}
                  style={{
                    flexWrap: 'wrap',
                    paddingBottom: 12,
                    borderBottom: SUBTLE_BORDER,
                  }}
                >
                  <Text as={"h3" as any} size="lg" weight="semibold" style={{ display: 'block' }}>
                    Usage Contract
                  </Text>
                  <Badge variant="secondary">Config-first</Badge>
                </Flex>
                <Text
                  size="sm"
                  style={{
                    display: 'block',
                    color: 'var(--ds-color-text-secondary)',
                    lineHeight: 1.6,
                  }}
                >
                  Surfaces work best when the config reads like the screen you want to ship.
                </Text>
                <CodeBlock title="Declarative usage" language="tsx" code={SURFACE_SNIPPET} />
              </Stack>
            </Card>

            <Stack spacing="md" style={{ height: '100%' }}>
              <Card
                style={{
                  border: SUBTLE_BORDER,
                  background:
                    'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 4%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
                  boxShadow: SHADOW,
                }}
              >
                <Stack spacing="md">
                  <Flex
                    align="center"
                    justify="between"
                    gap={12}
                    style={{
                      flexWrap: 'wrap',
                      paddingBottom: 12,
                      borderBottom: SUBTLE_BORDER,
                    }}
                  >
                    <Text as={"h3" as any} size="lg" weight="semibold" style={{ display: 'block' }}>
                      Ownership Split
                    </Text>
                    <Badge variant="secondary">Clear boundary</Badge>
                  </Flex>
                  {OWNERSHIP_ROWS.map((row) => (
                <Box
                  key={row.label}
                  style={{
                    padding: tokens.spacing[4],
                    borderRadius: tokens.borderRadius.lg,
                    background: PANEL_SURFACE,
                    border: SUBTLE_BORDER,
                  }}
                >
                  <Stack spacing={4}>
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{
                        display: 'block',
                        color: 'var(--ds-color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {row.label}
                    </Text>
                    <Text
                      size="xs"
                      style={{
                        display: 'block',
                        color: 'var(--ds-color-text-secondary)',
                        lineHeight: 1.55,
                      }}
                    >
                      {row.detail}
                    </Text>
                  </Stack>
                </Box>
              ))}
            </Stack>
              </Card>

              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: tokens.spacing[3],
                }}
              >
                {SURFACE_DECISION_POINTS.map((item) => (
                <Box
                  key={item.label}
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    background: PANEL_SURFACE,
                    border: SUBTLE_BORDER,
                  }}
                >
                  <Stack spacing={4}>
                    <Text size="xs" weight="semibold" style={{ display: 'block' }}>
                      {item.label}
                    </Text>
                    <Text
                      size="xs"
                      style={{
                        display: 'block',
                        color: 'var(--ds-color-text-secondary)',
                        lineHeight: 1.55,
                      }}
                    >
                      {item.detail}
                    </Text>
                  </Stack>
                </Box>
              ))}
            </Box>
            </Stack>
          </Box>
        </Stack>
      </Card>

      <Card
        style={{
          padding: tokens.spacing[5],
          border: SUBTLE_BORDER,
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-success-500) 3%, var(--ds-color-bg-elevated)) 0%, var(--ds-color-bg-secondary) 100%)',
        }}
      >
        <Stack spacing="md" fullWidth>
          <Flex
            align="center"
            justify="between"
            style={{ gap: tokens.spacing[3], flexWrap: 'wrap' }}
          >
            <Box>
              <Text as={"h2" as any} size="xl" weight="semibold" style={{ display: 'block' }}>
                Browse Domains
              </Text>
              <Text
                size="sm"
                style={{ display: 'block', color: 'var(--ds-color-text-secondary)', lineHeight: 1.6 }}
              >
                Pick the kind of product screen you need, then jump into a surface recipe.
              </Text>
            </Box>
            <Badge variant="secondary">Highest DS layer</Badge>
          </Flex>

          <Box
            style={{
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.xl,
              background: PANEL_SURFACE,
              border: SUBTLE_BORDER,
            }}
          >
            <Text
              size="sm"
              style={{ display: 'block', color: 'var(--ds-color-text-secondary)', lineHeight: 1.6 }}
            >
              Each domain card separates the screen promise, best-fit scenarios, and starter
              recipes so the overview reads like a routing shelf instead of a wall of copy.
            </Text>
          </Box>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: tokens.spacing[4],
              alignItems: 'stretch',
            }}
          >
            {surfaceGroups.map((group) => {
              const editorial = SURFACE_EDITORIAL[group.slug];
              const entries = surfacesByGroup[group.slug];
              const entryNames = entries.map((entry) => entry.name);
              const visibleNames = entryNames.slice(0, 4);
              const hiddenCount = Math.max(entryNames.length - visibleNames.length, 0);

              return (
                <Link
                  key={group.slug}
                  href={`/surfaces/${group.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Card
                    hoverable
                    style={{
                      height: '100%',
                      cursor: 'pointer',
                      border: SUBTLE_BORDER,
                      background:
                        'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-success-500) 4%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)',
                      boxShadow: SHADOW,
                    }}
                  >
                    <Stack spacing="md" style={{ height: '100%' }}>
                      <Flex
                        align="start"
                        justify="between"
                        gap={12}
                        style={{
                          flexWrap: 'wrap',
                          paddingBottom: 12,
                          borderBottom: SUBTLE_BORDER,
                        }}
                      >
                        <Flex align="start" gap={12} style={{ minWidth: 0 }}>
                          <Box
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: tokens.borderRadius.lg,
                              background: editorial.tint,
                              color: editorial.accent,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              border: SUBTLE_BORDER,
                            }}
                          >
                            {editorial.icon}
                          </Box>
                          <Box style={{ minWidth: 0 }}>
                            <Text
                              as={"h3" as any}
                              size="lg"
                              weight="semibold"
                              style={{ display: 'block' }}
                            >
                              {group.label}
                            </Text>
                            <Text
                              size="xs"
                              style={{
                                display: 'block',
                                color: 'var(--ds-color-text-muted)',
                                lineHeight: 1.55,
                              }}
                            >
                              {entries.length} recipes
                            </Text>
                          </Box>
                        </Flex>
                        <Badge variant="secondary">{group.slug}</Badge>
                      </Flex>

                      <Box style={{ paddingTop: 10, borderTop: SUBTLE_BORDER }}>
                        <Text
                          size="sm"
                          style={{
                            display: 'block',
                            color: 'var(--ds-color-text-secondary)',
                            lineHeight: 1.6,
                          }}
                        >
                          {editorial.description}
                        </Text>
                      </Box>

                      <Box
                        style={{
                          padding: tokens.spacing[3],
                          borderRadius: tokens.borderRadius.lg,
                          background: editorial.tint,
                          border: SUBTLE_BORDER,
                        }}
                      >
                        <Stack spacing={4}>
                          <Text size="xs" weight="semibold" style={{ display: 'block' }}>
                            Use when
                          </Text>
                          <Box style={{ paddingTop: 6, borderTop: SUBTLE_BORDER }}>
                            <Text
                              size="xs"
                              style={{
                                display: 'block',
                                color: 'var(--ds-color-text-secondary)',
                                lineHeight: 1.55,
                              }}
                            >
                              {editorial.promise}
                            </Text>
                          </Box>
                        </Stack>
                      </Box>

                      <Box
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                          gap: tokens.spacing[3],
                        }}
                      >
                        <Box
                          style={{
                            padding: tokens.spacing[3],
                            borderRadius: tokens.borderRadius.lg,
                            background: PANEL_SURFACE,
                            border: SUBTLE_BORDER,
                          }}
                        >
                          <Stack spacing={4}>
                            <Text size="xs" weight="semibold" style={{ display: 'block' }}>
                              Best for
                            </Text>
                            <Box style={{ paddingTop: 6, borderTop: SUBTLE_BORDER }}>
                              <Text
                                size="xs"
                                style={{
                                  display: 'block',
                                  color: 'var(--ds-color-text-secondary)',
                                  lineHeight: 1.55,
                                }}
                              >
                                {editorial.bestFor}
                              </Text>
                            </Box>
                          </Stack>
                        </Box>

                        <Box
                          style={{
                            padding: tokens.spacing[3],
                            borderRadius: tokens.borderRadius.lg,
                            background: PANEL_SURFACE,
                            border: SUBTLE_BORDER,
                          }}
                        >
                          <Text size="xs" weight="semibold" style={{ display: 'block' }}>
                            Starts with
                          </Text>
                          <Box style={{ paddingTop: 8, borderTop: SUBTLE_BORDER }}>
                            <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                              {editorial.examples.map((example) => (
                                <Badge key={example} variant="secondary">
                                  {example}
                                </Badge>
                              ))}
                            </Flex>
                          </Box>
                        </Box>
                      </Box>

                      <Box
                        style={{
                          marginTop: 'auto',
                          padding: tokens.spacing[3],
                          borderRadius: tokens.borderRadius.lg,
                          background: PANEL_SURFACE,
                          border: SUBTLE_BORDER,
                        }}
                      >
                          <Stack spacing="xs">
                            <Text size="xs" weight="semibold" style={{ display: 'block' }}>
                              Key surfaces
                            </Text>
                            <Box style={{ paddingTop: 8, borderTop: SUBTLE_BORDER }}>
                              <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                                {visibleNames.map((name) => (
                                  <Box
                                    key={name}
                                    style={{
                                      padding: '4px 10px',
                                      borderRadius: 999,
                                      background: 'var(--ds-color-neutral-100)',
                                      border: '1px solid var(--ds-color-border-secondary)',
                                    }}
                                  >
                                    <Text
                                      size="xs"
                                      style={{
                                        display: 'block',
                                        color: 'var(--ds-color-text-secondary)',
                                        fontFamily: 'var(--font-geist-mono, monospace)',
                                      }}
                                    >
                                      {formatShowroomLabel(name)}
                                    </Text>
                                  </Box>
                                ))}
                                {hiddenCount > 0 ? (
                                  <Badge variant="secondary">{`+${hiddenCount} more`}</Badge>
                                ) : null}
                              </Flex>
                            </Box>
                          </Stack>
                      </Box>
                    </Stack>
                  </Card>
                </Link>
              );
            })}
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
