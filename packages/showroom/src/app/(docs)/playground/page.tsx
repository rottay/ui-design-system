'use client';

import { ShowroomLink as Link } from '@/composition/components/showroom-link';
import { ComponentPreview, EngineComparison } from '@/composition/components/playground';
import { useShowroomRuntime } from '@/composition/components/showroom-context';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Input,
  Stack,
  Text,
} from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import {
  RocketIcon,
  SettingsIcon,
  SparklesIcon,
} from '@rottay/design-system/icons';

const ACTIONS = [
  {
    title: 'Theme Builder',
    href: '/playground/theme-builder',
    badge: 'Interactive',
    description:
      'Compare tenant themes side by side with the live provider chain already wired up.',
  },
  {
    title: 'Engine Lens',
    href: '/foundations/engines',
    badge: 'Compare',
    description:
      'See how Classic, Modern, and Rustic shift the same component contract in the DS.',
  },
];

const ENTRY_POINTS = [
  {
    title: 'Theme Builder',
    href: '/playground/theme-builder',
    badge: 'Interactive',
    description:
      'Adjust palette, typography, and surface treatment with immediate DS feedback.',
    icon: <SparklesIcon size={18} />,
  },
  {
    title: 'Engines',
    href: '/foundations/engines',
    badge: 'Compare',
    description:
      'Review how Classic, Modern, and Rustic reshape the same component contract.',
    icon: <SettingsIcon size={18} />,
  },
  {
    title: 'Themes',
    href: '/foundations/themes',
    badge: 'Tenant',
    description:
      'Validate how brand and vertical variables affect the same shared component set.',
    icon: <RocketIcon size={18} />,
  },
];

const HERO_AUDIT_LANES = [
  {
    label: 'What should move',
    title: 'Theme, chrome, and spacing',
    detail:
      'A provider swap should visibly change the mood, shell weight, and surface temperature.',
  },
  {
    label: 'What should stay',
    title: 'Scenario language and workflow',
    detail:
      'Search, actions, and hierarchy still need to read like the same product flow under every runtime.',
  },
  {
    label: 'Best next click',
    title: 'Theme Builder or Engine Lens',
    detail:
      'Use the linked routes below when you want to isolate brand drift versus engine drift.',
  },
] as const;

const RUNTIME_CHECKS = [
  'Real tenant switching should alter palette, chrome, and product profile without route hacks.',
  'Real engine switching should move spacing, shape, and emphasis in the same component tree.',
  'If a state barely changes here, the runtime plumbing needs attention upstream.',
];

const COMMAND_QUEUE = [
  {
    title: 'Tenant color shift landed',
    status: 'Needs review',
    owner: 'Theme audit',
    detail:
      'Check that badge contrast, button emphasis, and queue affordances still read cleanly after the palette update.',
  },
  {
    title: 'Surface density pass',
    status: 'In progress',
    owner: 'Engine lens',
    detail:
      'Spacing should tighten or relax with the engine without flattening the card hierarchy or the action rhythm.',
  },
  {
    title: 'Runtime regression sweep',
    status: 'Stable',
    owner: 'Provider chain',
    detail:
      'The same search and state shell should survive brand, profile, and engine changes without route-specific hacks.',
  },
] as const;

const ENGINE_COMPARE_NOTES = [
  'Watch the same control stack across all three engines.',
  'Treat spacing, rounding, and emphasis as the variables that should move.',
  'If the scene looks identical everywhere, the runtime signal is too weak.',
] as const;

const ENGINE_LABELS: Record<'classic' | 'modern' | 'rustic', string> = {
  classic: 'Classic',
  modern: 'Modern',
  rustic: 'Rustic',
};

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Box
      style={{
        padding: 16,
        borderRadius: 22,
        border: '1px solid var(--ds-color-border-secondary)',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 8%, var(--ds-color-bg-overlay)) 0%, var(--ds-color-bg-primary) 100%)',
        boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--ds-color-primary-500) 10%, transparent)',
      }}
    >
      <Flex align="center" gap={8}>
        <Box
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: 'var(--ds-color-primary-500)',
            boxShadow: '0 0 0 4px color-mix(in srgb, var(--ds-color-primary-500) 12%, transparent)',
            flexShrink: 0,
          }}
        />
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
      </Flex>
      <Box
        style={{
          height: 1,
          marginTop: 10,
          background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)',
        }}
      />
      <Text
        size="sm"
        weight="semibold"
        style={{ display: 'block', marginTop: 10, color: 'var(--ds-color-text-primary)', lineHeight: 1.2 }}
      >
        {value}
      </Text>
      <Text
        size="xs"
        style={{
          display: 'block',
          marginTop: 6,
          color: 'var(--ds-color-text-secondary)',
          lineHeight: 1.5,
        }}
      >
        {detail}
      </Text>
    </Box>
  );
}

function SignalCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Box
      style={{
        padding: '12px 14px',
        borderRadius: 18,
        border: '1px solid var(--ds-color-border-secondary)',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated) 88%, var(--ds-color-primary-500) 12%) 0%, var(--ds-color-bg-surface) 100%)',
        boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--ds-color-primary-500) 8%, transparent)',
      }}
    >
      <Flex align="center" gap={8}>
        <Box
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: 'color-mix(in srgb, var(--ds-color-primary-500) 70%, white)',
            flexShrink: 0,
          }}
        />
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
      </Flex>
      <Box
        style={{
          height: 1,
          marginTop: 8,
          background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)',
        }}
      />
      <Text
        size="sm"
        weight="semibold"
        style={{ display: 'block', marginTop: 8, color: 'var(--ds-color-text-primary)' }}
      >
        {value}
      </Text>
      <Text
        size="xs"
        style={{
          display: 'block',
          marginTop: 4,
          color: 'var(--ds-color-text-secondary)',
          lineHeight: 1.5,
        }}
      >
        {detail}
      </Text>
    </Box>
  );
}

function InsightTile({
  label,
  title,
  detail,
}: {
  label: string;
  title: string;
  detail: string;
}) {
  return (
    <Box
      style={{
        padding: 16,
        borderRadius: 22,
        border: '1px solid var(--ds-color-border-secondary)',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated) 86%, var(--ds-color-primary-500) 14%) 0%, var(--ds-color-bg-primary) 100%)',
        boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--ds-color-primary-500) 10%, transparent)',
      }}
    >
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
        size="sm"
        weight="semibold"
        style={{ display: 'block', marginTop: 10, color: 'var(--ds-color-text-primary)' }}
      >
        {title}
      </Text>
      <Text
        size="xs"
        style={{
          display: 'block',
          marginTop: 8,
          color: 'var(--ds-color-text-secondary)',
          lineHeight: 1.6,
        }}
      >
        {detail}
      </Text>
    </Box>
  );
}

function ActionTile({ title, href, badge, description }: (typeof ACTIONS)[number]) {
  return (
    <Link href={href} style={{ textDecoration: 'none', flex: '1 1 240px', minWidth: 240 }}>
      <Card
        hoverable
        style={{
          height: '100%',
          padding: 16,
          borderRadius: 22,
          border: '1px solid var(--ds-color-border-secondary)',
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 10%, var(--ds-color-bg-elevated)) 0%, var(--ds-color-bg-primary) 100%)',
          boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--ds-color-primary-500) 8%, transparent)',
        }}
      >
        <Stack spacing="sm" fullWidth style={{ height: '100%' }}>
          <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
            <Text size="sm" weight="semibold" style={{ color: 'var(--ds-color-text-primary)' }}>
              {title}
            </Text>
            <Badge variant="secondary">{badge}</Badge>
          </Flex>
          <Box
            style={{
              height: 1,
              background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)',
            }}
          />
          <Text
            size="sm"
            style={{
              color: 'var(--ds-color-text-secondary)',
              lineHeight: 1.6,
            }}
          >
            {description}
          </Text>
          <Text
            size="xs"
            weight="semibold"
            style={{
              marginTop: 'auto',
              color: 'var(--ds-color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Open route
          </Text>
        </Stack>
      </Card>
    </Link>
  );
}

export default function PlaygroundPage() {
  const tokens = useTokens();
  const { engine, tenantName, tenantSlug, productProfileLabel, verticalLabel } =
    useShowroomRuntime();

  return (
    <Stack spacing="lg" fullWidth>
      <Card
        style={{
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
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
              radial-gradient(circle at 72% 82%, var(--ds-color-success-bg) 0%, transparent 20%),
              linear-gradient(180deg, transparent 0%, var(--ds-color-bg-surface) 100%)
            `,
            opacity: 0.72,
          }}
        />

        <Box style={{ position: 'relative', zIndex: 1 }}>
          <Box
            className="showroom-playground-hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)',
              gap: tokens.spacing[5],
              alignItems: 'start',
            }}
          >
            <Stack spacing="md" style={{ minWidth: 0 }}>
              <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                <Badge variant="primary">Live playground</Badge>
                <Badge variant="secondary">Real DS provider</Badge>
                <Badge variant="secondary">No local theme hacks</Badge>
              </Flex>

              <Text
                as={"h1" as any}
                size="2xl"
                weight="bold"
                style={{
                  display: 'block',
                  maxWidth: 820,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.02,
                }}
              >
                Build with the runtime, not around it.
              </Text>

              <Text
                size="md"
                style={{
                  display: 'block',
                  maxWidth: 760,
                  color: 'var(--ds-color-text-secondary)',
                  lineHeight: 1.7,
                }}
              >
                The shell already swaps tenant and engine for real. This page should
                make those shifts obvious: a tighter top fold, denser live scenes,
                and enough hierarchy to trust what the DS is doing.
              </Text>
              <Box
                style={{
                  height: 1,
                  background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)',
                }}
              />

              <Box
                className="showroom-playground-proof-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: tokens.spacing[3],
                }}
              >
                {HERO_AUDIT_LANES.map((lane) => (
                  <InsightTile key={lane.label} {...lane} />
                ))}
              </Box>

              <Box
                style={{
                  padding: 16,
                  borderRadius: 22,
                  border: '1px solid var(--ds-color-border-secondary)',
                  background: 'var(--ds-color-bg-overlay)',
                }}
              >
                <Stack spacing="md">
                  <Box>
                    <Text size="xs" weight="semibold" style={{ color: 'var(--ds-color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Entry points
                    </Text>
                    <Text size="sm" style={{ marginTop: 6, color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                      Jump into the two most useful docs surfaces without leaving this runtime view.
                    </Text>
                  </Box>

                  <Box
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
                      gap: tokens.spacing[3],
                    }}
                  >
                    {ACTIONS.map((action) => (
                      <ActionTile key={action.href} {...action} />
                    ))}
                  </Box>

                  <Box
                    style={{
                      borderTop: '1px solid var(--ds-color-border-secondary)',
                      paddingTop: tokens.spacing[4],
                    }}
                  >
                    <Text size="xs" weight="semibold" style={{ color: 'var(--ds-color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Runtime signals
                    </Text>
                    <Box
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                        gap: tokens.spacing[3],
                        marginTop: tokens.spacing[3],
                      }}
                    >
                      <MetricCard label="Tenant" value={tenantName} detail={tenantSlug} />
                      <MetricCard
                        label="Engine"
                        value={ENGINE_LABELS[engine]}
                        detail="Spacing, shape, and chrome move here"
                      />
                      <MetricCard label="Profile" value={productProfileLabel} detail={verticalLabel} />
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Stack>

            <Card
              style={{
                minWidth: 0,
                padding: 20,
                border: '1px solid var(--ds-color-border-secondary)',
                background:
                  'linear-gradient(180deg, var(--ds-color-bg-elevated), var(--ds-color-bg-primary))',
              }}
            >
              <Stack spacing="md">
                <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
                  <Box>
                    <Text
                      size="sm"
                      weight="semibold"
                      style={{ display: 'block', color: 'var(--ds-color-text-primary)' }}
                    >
                      Runtime snapshot
                    </Text>
                    <Text
                      size="xs"
                      style={{
                        display: 'block',
                        marginTop: 6,
                        color: 'var(--ds-color-text-secondary)',
                        lineHeight: 1.5,
                      }}
                    >
                      The same provider tree is driving these values.
                    </Text>
                  </Box>
                  <Flex gap={6} style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Badge variant="success">Live</Badge>
                    <Badge variant="secondary">{tenantName}</Badge>
                    <Badge variant="secondary">{ENGINE_LABELS[engine]}</Badge>
                  </Flex>
                </Flex>
                <Box
                  style={{
                    height: 1,
                    background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)',
                  }}
                />
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: tokens.spacing[2],
                  }}
                >
                  {[
                    { label: 'Tenant', value: tenantName, detail: tenantSlug },
                    { label: 'Engine', value: ENGINE_LABELS[engine], detail: 'shape + density' },
                    { label: 'Profile', value: productProfileLabel, detail: verticalLabel },
                  ].map((item) => (
                    <Box
                      key={item.label}
                      style={{
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.lg,
                        background: 'var(--ds-color-bg-surface)',
                        border: '1px solid var(--ds-color-border-secondary)',
                      }}
                    >
                      <Text size="xs" style={{ color: 'var(--ds-color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {item.label}
                      </Text>
                      <Text size="sm" weight="semibold" style={{ display: 'block', marginTop: tokens.spacing[1], lineHeight: 1.2 }}>
                        {item.value}
                      </Text>
                      <Text size="xs" style={{ display: 'block', marginTop: 4, color: 'var(--ds-color-text-secondary)', lineHeight: 1.5 }}>
                        {item.detail}
                      </Text>
                    </Box>
                  ))}
                </Box>

                <Stack spacing="sm">
                  {RUNTIME_CHECKS.map((check, index) => (
                    <Box
                      key={check}
                      style={{
                        padding: 14,
                        borderRadius: 18,
                        border: `1px solid ${
                          index === 0
                            ? 'color-mix(in srgb, var(--ds-color-primary-500) 32%, var(--ds-color-border-secondary))'
                            : 'var(--ds-color-border-secondary)'
                        }`,
                        background:
                          index === 0
                            ? 'color-mix(in srgb, var(--ds-color-primary-500) 12%, var(--ds-color-bg-overlay))'
                            : 'var(--ds-color-bg-primary)',
                      }}
                    >
                      <Text
                        size="sm"
                        style={{
                          display: 'block',
                          color: 'var(--ds-color-text-secondary)',
                          lineHeight: 1.6,
                        }}
                      >
                        {check}
                      </Text>
                    </Box>
                  ))}
                </Stack>

                <Box
                  style={{
                    padding: tokens.spacing[4],
                    borderRadius: tokens.borderRadius.xl,
                    background: 'var(--ds-color-bg-overlay)',
                    border: '1px solid var(--ds-color-border-secondary)',
                  }}
                >
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{ color: 'var(--ds-color-text-muted)' }}
                  >
                    Current combination
                  </Text>
                  <Stack spacing="sm" style={{ marginTop: tokens.spacing[3] }}>
                    <SignalCard
                      label="Tenant"
                      value={tenantName}
                      detail="Brand theme and vertical"
                    />
                    <SignalCard
                      label="Engine"
                      value={ENGINE_LABELS[engine]}
                      detail="Spacing and chrome"
                    />
                    <SignalCard
                      label="Profile"
                      value={productProfileLabel}
                      detail="Runtime profile key"
                    />
                  </Stack>
                </Box>
              </Stack>
            </Card>
          </Box>
        </Box>
      </Card>

      <ComponentPreview
        title="Command surface"
        description="A realistic shell of search, actions, and state chips rendered through the active runtime."
        darkModeToggle
      >
        <Stack spacing="md" fullWidth>
          <Box
            style={{
              padding: 16,
              borderRadius: 22,
              border: '1px solid var(--ds-color-border-secondary)',
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 8%, var(--ds-color-bg-overlay)) 0%, var(--ds-color-bg-primary) 100%)',
            }}
          >
            <Stack spacing="md" fullWidth>
              <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
                <Box>
                  <Text size="sm" weight="semibold" style={{ color: 'var(--ds-color-text-primary)' }}>
                    Work queue
                  </Text>
                  <Text
                    size="xs"
                    style={{
                      display: 'block',
                      marginTop: 5,
                      color: 'var(--ds-color-text-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    This scene should feel like a product surface, not a showcase slab.
                  </Text>
                </Box>
                <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                  <Badge variant="primary">Ready</Badge>
                  <Badge variant="secondary">Searchable</Badge>
                  <Badge variant="secondary">Stateful</Badge>
                </Flex>
              </Flex>

              <Box
                className="showroom-playground-command-top"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) auto',
                  gap: tokens.spacing[3],
                  alignItems: 'center',
                }}
              >
                <Input placeholder="Search tickets, tenants, or surfaces..." />

                <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                  <Button variant="primary">Create record</Button>
                  <Button>Save draft</Button>
                  <Button variant="ghost">Share view</Button>
                </Flex>
              </Box>
            </Stack>
          </Box>

          <Box
            className="showroom-playground-surface-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.18fr) minmax(260px, 0.82fr)',
              gap: tokens.spacing[3],
              alignItems: 'start',
            }}
          >
            <Box
              style={{
                padding: 16,
                borderRadius: 22,
                border: '1px solid var(--ds-color-border-secondary)',
                background:
                  'linear-gradient(180deg, var(--ds-color-bg-elevated), var(--ds-color-bg-primary))',
              }}
            >
              <Stack spacing="sm">
                {COMMAND_QUEUE.map((item) => (
                  <Box
                    key={item.title}
                    style={{
                      padding: 14,
                      borderRadius: 18,
                      border: '1px solid var(--ds-color-border-secondary)',
                      background: 'var(--ds-color-bg-overlay)',
                    }}
                  >
                    <Flex align="start" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
                      <Box style={{ minWidth: 0, flex: '1 1 220px' }}>
                        <Text
                          size="sm"
                          weight="semibold"
                          style={{ color: 'var(--ds-color-text-primary)' }}
                        >
                          {item.title}
                        </Text>
                        <Text
                          size="xs"
                          style={{
                            display: 'block',
                            marginTop: 6,
                            color: 'var(--ds-color-text-secondary)',
                            lineHeight: 1.55,
                          }}
                        >
                          {item.detail}
                        </Text>
                        <Box
                          style={{
                            height: 1,
                            marginTop: 10,
                            background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)',
                          }}
                        />
                        <Text
                          size="xs"
                          weight="semibold"
                          style={{
                            display: 'block',
                            marginTop: 10,
                            color: 'var(--ds-color-text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                          }}
                        >
                          {item.owner}
                        </Text>
                      </Box>

                      <Stack spacing="xs" style={{ minWidth: 120 }}>
                        <Badge variant={item.status === 'Stable' ? 'success' : item.status === 'In progress' ? 'secondary' : 'warning'}>
                          {item.status}
                        </Badge>
                        <Box
                          style={{
                            height: 1,
                            background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)',
                          }}
                        />
                        <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.45 }}>
                          review state
                        </Text>
                      </Stack>
                    </Flex>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Stack spacing="sm">
              <Box
                style={{
                  padding: 16,
                  borderRadius: 22,
                  border: '1px solid var(--ds-color-border-secondary)',
                  background:
                    'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated) 88%, var(--ds-color-primary-500) 12%) 0%, var(--ds-color-bg-primary) 100%)',
                }}
              >
                <Text size="xs" weight="semibold" style={{ display: 'block', color: 'var(--ds-color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Review lane
                </Text>
                <Box
                  style={{
                    height: 1,
                    marginTop: 8,
                    background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)',
                  }}
                />
                <Text
                  size="sm"
                  style={{
                    display: 'block',
                    marginTop: 8,
                    color: 'var(--ds-color-text-secondary)',
                    lineHeight: 1.6,
                  }}
                >
                  Searchability, action rhythm, and contrast should survive the active
                  runtime without route-specific rescue code.
                </Text>
              </Box>

              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: tokens.spacing[3],
                }}
              >
                <MetricCard label="Queue depth" value="18 items" detail="6 new in the last hour" />
                <MetricCard label="Focus state" value="Needs review" detail="2 records escalated" />
                <MetricCard label="Alert level" value="Stable" detail="No runtime regressions" />
              </Box>

              <Card
                style={{
                  padding: 16,
                  border: '1px solid var(--ds-color-border-secondary)',
                  background:
                    'linear-gradient(180deg, var(--ds-color-bg-overlay), var(--ds-color-bg-primary))',
                }}
              >
                <Stack spacing="sm">
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{ color: 'var(--ds-color-text-muted)' }}
                  >
                    Surface checks
                  </Text>
                  <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                    <Badge variant="success">Contrast good</Badge>
                    <Badge variant="secondary">Spacing tidy</Badge>
                    <Badge variant="secondary">State visible</Badge>
                  </Flex>
                  <Text
                    size="xs"
                    style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.6 }}
                  >
                    The card stack should still look deliberate under dark-first Rottay,
                    while BitHire and Evnto can add more energy without rewriting the shell.
                  </Text>
                </Stack>
              </Card>
            </Stack>
          </Box>
        </Stack>
      </ComponentPreview>

      <EngineComparison
        tenantSlug={tenantSlug}
        title="Engine lens"
        description="The same tenant, the same tree, and a live engine swap that should move spacing, shape, and emphasis."
      >
        <Stack spacing="sm" fullWidth>
          <Box
            style={{
              padding: 14,
              borderRadius: 18,
              border: '1px solid var(--ds-color-border-secondary)',
              background: 'var(--ds-color-bg-overlay)',
            }}
          >
            <Stack spacing="sm">
              <Flex align="center" justify="between" gap={8} style={{ flexWrap: 'wrap' }}>
                <Text size="sm" weight="semibold" style={{ color: 'var(--ds-color-text-primary)' }}>
                  Shared control bar
                </Text>
                <Badge variant="primary">Active tenant</Badge>
              </Flex>

              <Input placeholder="Filter the same content across all engines..." />

              <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                <Button variant="primary">Primary action</Button>
                <Button>Secondary action</Button>
                <Button variant="ghost">Tertiary</Button>
              </Flex>
            </Stack>
          </Box>

          <Box
            style={{
              padding: 14,
              borderRadius: 18,
              border: '1px solid var(--ds-color-border-secondary)',
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated) 90%, var(--ds-color-primary-500) 10%) 0%, var(--ds-color-bg-primary) 100%)',
            }}
          >
            <Text size="xs" weight="semibold" style={{ color: 'var(--ds-color-text-muted)' }}>
              What to compare
            </Text>
            <Stack spacing="xs" style={{ marginTop: 10 }}>
              {ENGINE_COMPARE_NOTES.map((note) => (
                <Box
                  key={note}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: '1px solid var(--ds-color-border-secondary)',
                    background: 'var(--ds-color-bg-surface)',
                  }}
                >
                  <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                    {note}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 8,
            }}
          >
            <SignalCard
              label="Copy"
              value="Stable"
              detail="Shared text should survive the engine swap"
            />
            <SignalCard
              label="Contrast"
              value="Adaptive"
              detail="Surfaces need to keep hierarchy readable"
            />
            <SignalCard
              label="Motion"
              value="Revealed"
              detail="The engine should feel different, not arbitrary"
            />
          </Box>
        </Stack>
      </EngineComparison>

      <Card
        style={{
          padding: tokens.spacing[4],
          borderRadius: tokens.borderRadius.xl,
          border: '1px solid var(--ds-color-border-secondary)',
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 5%, var(--ds-color-bg-elevated)) 0%, var(--ds-color-bg-primary) 100%)',
        }}
      >
        <Stack spacing="md">
          <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
            <Box style={{ maxWidth: 760 }}>
              <Text as={"h2" as any} size="xl" weight="semibold">
                Keep exploring
              </Text>
              <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                Use these routes when you want to isolate a specific runtime variable
                instead of scanning the broader playground.
              </Text>
            </Box>
            <Badge variant="secondary">{ENTRY_POINTS.length} linked tools</Badge>
          </Flex>
          <Box
            style={{
              height: 1,
              background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)',
            }}
          />

          <Box
            className="showroom-playground-entry-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: 16,
            }}
          >
            {ENTRY_POINTS.map((entry) => (
              <Link key={entry.href} href={entry.href} style={{ textDecoration: 'none' }}>
                <Card
                  hoverable
                  style={{
                    height: '100%',
                    padding: 20,
                    borderRadius: 22,
                    border: '1px solid var(--ds-color-border-secondary)',
                    background:
                      'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated) 90%, var(--ds-color-primary-500) 10%) 0%, var(--ds-color-bg-primary) 100%)',
                    boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--ds-color-primary-500) 8%, transparent)',
                  }}
                >
                  <Stack spacing="sm" fullWidth style={{ height: '100%' }}>
                    <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
                      <Flex align="center" gap={10}>
                        <Box
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--ds-color-bg-overlay)',
                            color: 'var(--ds-color-text-primary)',
                            border: '1px solid var(--ds-color-border-secondary)',
                            flexShrink: 0,
                          }}
                        >
                          {entry.icon}
                        </Box>
                        <Box>
                          <Text size="sm" weight="semibold" style={{ color: 'var(--ds-color-text-primary)' }}>
                            {entry.title}
                          </Text>
                          <Text
                            size="xs"
                            style={{
                              display: 'block',
                              marginTop: 4,
                              color: 'var(--ds-color-text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                            }}
                          >
                            {entry.badge}
                          </Text>
                        </Box>
                      </Flex>
                      <Badge variant="secondary">Open</Badge>
                    </Flex>

                    <Text
                      size="sm"
                      style={{
                        color: 'var(--ds-color-text-secondary)',
                        lineHeight: 1.6,
                      }}
                    >
                      {entry.description}
                    </Text>
                    <Box
                      style={{
                        height: 1,
                        marginTop: 'auto',
                        background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)',
                      }}
                    />
                  </Stack>
                </Card>
              </Link>
            ))}
          </Box>
        </Stack>
      </Card>

      <style>{`
        @container showroom-content (max-width: 1120px) {
          .showroom-playground-hero-grid,
          .showroom-playground-surface-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @container showroom-content (max-width: 900px) {
          .showroom-playground-command-top {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Stack>
  );
}
