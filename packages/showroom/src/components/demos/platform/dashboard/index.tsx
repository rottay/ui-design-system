'use client';

import { useShowroomRuntime } from '@/components/showroom-context';
import {
  Badge,
  BarChart,
  Box,
  Card,
  Flex,
  PieChart,
  Stack,
  StatsHeader,
  Text,
  useTokens,
} from '@rottay/design-system';
import {
  ActivityIcon,
  Building2Icon,
  ShieldIcon,
  UsersIcon,
} from '@rottay/design-system/icons';

import type { StatItem } from '@rottay/design-system';

const SURFACE = 'var(--ds-color-bg-container, #ffffff)';
const ELEVATED_SURFACE = 'var(--ds-color-bg-elevated, #f8fafc)';
const SUBTLE_SURFACE = 'var(--ds-color-bg-secondary, #f1f5f9)';
const BORDER = 'var(--ds-color-border, rgba(148, 163, 184, 0.28))';
const TEXT_SECONDARY = 'var(--ds-color-text-secondary)';
const TEXT_MUTED = 'var(--ds-color-text-muted)';
const CARD_SHADOW = 'var(--ds-shadow-lg, 0 20px 48px rgba(15, 23, 42, 0.1))';
const PANEL_SHADOW = 'var(--ds-shadow-md, 0 12px 28px rgba(15, 23, 42, 0.08))';
const PANEL_BACKGROUND = `linear-gradient(180deg, color-mix(in srgb, ${ELEVATED_SURFACE} 92%, ${SURFACE} 8%) 0%, ${SURFACE} 100%)`;
const PRIORITY_BACKGROUND = `linear-gradient(180deg, rgba(59, 130, 246, 0.16), rgba(14, 165, 233, 0.06) 58%, ${SURFACE} 100%)`;
const RISK_BACKGROUND = `linear-gradient(180deg, rgba(248, 113, 113, 0.14), rgba(245, 158, 11, 0.08) 58%, ${SURFACE} 100%)`;
const ANALYSIS_BACKGROUND = `linear-gradient(180deg, rgba(99, 102, 241, 0.12), rgba(59, 130, 246, 0.04) 58%, ${SURFACE} 100%)`;

const STATS: StatItem[] = [
  {
    key: 'managed-tenants',
    label: 'Managed Tenants',
    value: 128,
    change: 9,
    changeType: 'increase',
    periodLabel: 'since last month',
    icon: <Building2Icon size={18} />,
    sparkDots: [74, 81, 79, 88, 92, 109, 128],
    accentColor: 'primary',
  },
  {
    key: 'active-admins',
    label: 'Active Admins',
    value: '3,842',
    change: 6,
    changeType: 'increase',
    periodLabel: 'this week',
    icon: <UsersIcon size={18} />,
    sparkDots: [52, 58, 63, 61, 68, 72, 79],
    accentColor: 'info',
  },
  {
    key: 'policy-drift',
    label: 'Policy Drift',
    value: '14 flags',
    change: -3,
    changeType: 'decrease',
    periodLabel: 'vs yesterday',
    icon: <ShieldIcon size={18} />,
    sparkDots: [28, 24, 22, 21, 19, 17, 14],
    accentColor: 'success',
  },
  {
    key: 'runtime-health',
    label: 'Runtime Health',
    value: '99.97%',
    changeType: 'neutral',
    periodLabel: '30-day uptime',
    icon: <ActivityIcon size={18} />,
    sparkDots: [99, 99, 100, 99, 100, 100, 100],
    accentColor: 'success',
  },
];

const LAUNCH_ACTIVITY = [
  { label: 'Jan', value: 8 },
  { label: 'Feb', value: 11 },
  { label: 'Mar', value: 13 },
  { label: 'Apr', value: 9 },
  { label: 'May', value: 14 },
  { label: 'Jun', value: 15 },
  { label: 'Jul', value: 17 },
  { label: 'Aug', value: 18 },
  { label: 'Sep', value: 16 },
  { label: 'Oct', value: 22 },
  { label: 'Nov', value: 19 },
  { label: 'Dec', value: 24 },
];

const PLAN_DISTRIBUTION = [
  { label: 'Enterprise', value: 58 },
  { label: 'Growth', value: 42 },
  { label: 'Starter', value: 28 },
];

const WATCHLIST = [
  {
    tenant: 'Northstar Health',
    issue: 'SAML metadata drift',
    severity: 'warning' as const,
  },
  {
    tenant: 'Canopy Logistics',
    issue: 'Pending SCIM review',
    severity: 'secondary' as const,
  },
  {
    tenant: 'Blue River Capital',
    issue: 'Role escalation requested',
    severity: 'error' as const,
  },
];

const ROLLOUTS = [
  { label: 'SSO enforcement', value: '76%', detail: '97 / 128 tenants' },
  { label: 'Audit logging v2', value: '61%', detail: 'Launch ring 2 of 4' },
  { label: 'Session risk scoring', value: '88%', detail: 'Pilot nearing GA' },
];

const ANALYSIS_LANES = [
  {
    label: 'Identity risk',
    detail: 'Privilege exceptions, dormant admins, and MFA gaps stay above the fold.',
  },
  {
    label: 'Tenant rollout',
    detail: 'Launch velocity only matters when policy gates and migration rings are green.',
  },
  {
    label: 'Plan pressure',
    detail: 'Enterprise-heavy mix should steer the shell toward trust, not marketing gloss.',
  },
];

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Box style={{ minWidth: 0 }}>
      <Text
        size="xs"
        weight="semibold"
        style={{
          color: TEXT_MUTED,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {eyebrow}
      </Text>
      <Text as={"h3" as any} size="lg" weight="semibold" style={{ marginTop: 8 }}>
        {title}
      </Text>
      <Text size="sm" style={{ marginTop: 6, color: TEXT_SECONDARY, lineHeight: 1.65 }}>
        {description}
      </Text>
    </Box>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  detail: string;
  tone?: 'neutral' | 'priority' | 'risk';
}) {
  const background =
    tone === 'risk'
      ? RISK_BACKGROUND
      : tone === 'priority'
        ? PRIORITY_BACKGROUND
        : PANEL_BACKGROUND;
  const borderColor =
    tone === 'risk'
      ? 'rgba(248, 113, 113, 0.26)'
      : tone === 'priority'
        ? 'rgba(59, 130, 246, 0.24)'
        : BORDER;

  return (
    <Box
      style={{
        minWidth: 0,
        padding: '16px 18px',
        borderRadius: 'var(--ds-border-radius-lg, 16px)',
        background,
        border: `1px solid ${borderColor}`,
        boxShadow: PANEL_SHADOW,
      }}
    >
      <Text
        size="xs"
        weight="semibold"
        style={{
          color: TEXT_MUTED,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </Text>
      <Text size="lg" weight="bold" style={{ marginTop: 10, lineHeight: 1.15 }}>
        {value}
      </Text>
      <Text size="xs" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
        {detail}
      </Text>
    </Box>
  );
}

export default function PlatformDashboardDemo() {
  const tokens = useTokens();
  const runtime = useShowroomRuntime();

  return (
    <Stack spacing="lg">
      <Card
        style={{
          padding: tokens.spacing[4],
          border: `1px solid ${BORDER}`,
          background:
            'linear-gradient(180deg, rgba(59, 130, 246, 0.14), transparent 46%), var(--ds-color-bg-container, #ffffff)',
          boxShadow: CARD_SHADOW,
        }}
      >
        <Stack spacing="md">
          <Flex align="start" justify="between" style={{ gap: 12, flexWrap: 'wrap' }}>
            <Box style={{ minWidth: 0, flex: '1 1 320px' }}>
              <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
                <Badge variant="primary">Control plane pulse</Badge>
                <Badge variant="secondary">{runtime.tenantName}</Badge>
              </Flex>
              <Text as={"h2" as any} size="xl" weight="bold" style={{ marginTop: 12 }}>
                Platform runtime dashboard
              </Text>
              <Text size="sm" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
                Governance, tenant launches, and admin risk posture rendered
                through the active DS runtime.
              </Text>
            </Box>

            <Box
              style={{
                padding: '12px 14px',
                borderRadius: tokens.borderRadius.xl,
                background: PANEL_BACKGROUND,
                border: `1px solid ${BORDER}`,
                minWidth: 240,
                boxShadow: PANEL_SHADOW,
              }}
            >
              <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
                Runtime fit
              </Text>
              <Text size="sm" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
                Dark-first safe surfaces, governed contrast, and dense scanning
                are all active requirements here.
              </Text>
            </Box>
          </Flex>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: tokens.spacing[3],
            }}
          >
            <SummaryCard
              label="Launch queue"
              value="6 tenants"
              detail="Three awaiting security sign-off before go-live."
              tone="priority"
            />
            <SummaryCard
              label="Escalation load"
              value="1 P1 / 4 P2"
              detail="No unresolved incidents older than 24 hours."
              tone="risk"
            />
            <SummaryCard
              label="Audit backlog"
              value="23 tasks"
              detail="92% due this sprint already assigned to owners."
            />
          </Box>
        </Stack>
      </Card>

      <Card
        style={{
          padding: tokens.spacing[4],
          border: `1px solid ${BORDER}`,
          background: PRIORITY_BACKGROUND,
          boxShadow: PANEL_SHADOW,
        }}
      >
        <Stack spacing="md">
          <SectionHeader
            eyebrow="Headline metrics"
            title="First-pass command read"
            description="These are the numbers an operator should trust before opening tickets or drilling into tenant detail. They establish health, coverage, and drift in one scan."
          />
          <StatsHeader stats={STATS} />
        </Stack>
      </Card>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: tokens.spacing[4],
          alignItems: 'start',
        }}
      >
        <Card
          style={{
            padding: tokens.spacing[4],
            border: `1px solid ${BORDER}`,
            background: ANALYSIS_BACKGROUND,
            boxShadow: PANEL_SHADOW,
          }}
        >
          <Stack spacing="md">
            <SectionHeader
              eyebrow="Analysis"
              title="Tenant launch velocity"
              description="Launch cadence is useful only after compliance gates are understood. This panel intentionally reads as a second-pass analysis lane, not the main alarm surface."
            />
            <BarChart
              data={LAUNCH_ACTIVITY}
              height={280}
              showValues
              orientation="vertical"
              animate
            />
          </Stack>
        </Card>

        <Stack spacing="md">
          <Card
            style={{
              padding: tokens.spacing[4],
              border: '1px solid rgba(248, 113, 113, 0.22)',
              background: RISK_BACKGROUND,
              boxShadow: PANEL_SHADOW,
            }}
          >
            <Stack spacing="md">
              <SectionHeader
                eyebrow="Risk + status"
                title="Governance watchlist"
                description="Urgent operator work belongs in its own tone. These flags should read as active governance pressure, not as just another analytics card."
              />
              {WATCHLIST.map((item) => (
                <Box
                  key={item.tenant}
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    background: SURFACE,
                    border: '1px solid rgba(248, 113, 113, 0.16)',
                    boxShadow: PANEL_SHADOW,
                  }}
                >
                  <Flex align="center" justify="between" gap={8} style={{ flexWrap: 'wrap' }}>
                    <Box style={{ minWidth: 0, flex: '1 1 180px' }}>
                      <Text size="sm" weight="semibold">
                        {item.tenant}
                      </Text>
                      <Text size="xs" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
                        {item.issue}
                      </Text>
                    </Box>
                    <Badge variant={item.severity}>
                      {item.severity === 'error'
                        ? 'Immediate review'
                        : item.severity === 'warning'
                          ? 'Needs owner'
                          : 'Monitor'}
                    </Badge>
                  </Flex>
                </Box>
              ))}
            </Stack>
          </Card>
        </Stack>
      </Box>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: tokens.spacing[4],
        }}
      >
        <Card
          style={{
            padding: tokens.spacing[4],
            border: '1px solid rgba(59, 130, 246, 0.22)',
            background: PRIORITY_BACKGROUND,
            boxShadow: PANEL_SHADOW,
          }}
        >
          <Stack spacing="sm">
            <SectionHeader
              eyebrow="Status execution"
              title="Rollout readiness"
              description="Ship posture sits between metrics and analysis. These programs tell the operator whether platform work is clearing policy and adoption gates."
            />
            {ROLLOUTS.map((rollout) => (
              <Box key={rollout.label}>
                <Flex align="center" justify="between" gap={8}>
                  <Text size="sm" weight="semibold">
                    {rollout.label}
                  </Text>
                  <Text size="sm" weight="semibold">
                    {rollout.value}
                  </Text>
                </Flex>
                <Box
                  style={{
                    marginTop: 8,
                    height: 8,
                    borderRadius: 999,
                    background: SUBTLE_SURFACE,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    style={{
                      width: rollout.value,
                      height: '100%',
                      borderRadius: 999,
                      background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.85), rgba(14, 165, 233, 0.85))',
                    }}
                  />
                </Box>
                <Text size="xs" style={{ marginTop: 6, color: TEXT_MUTED }}>
                  {rollout.detail}
                </Text>
              </Box>
            ))}
          </Stack>
        </Card>

        <Card
          style={{
            padding: tokens.spacing[4],
            border: `1px solid ${BORDER}`,
            background: ANALYSIS_BACKGROUND,
            boxShadow: PANEL_SHADOW,
          }}
        >
          <Stack spacing="sm">
            <SectionHeader
              eyebrow="Analysis"
              title="Plan mix"
              description="Tenant composition explains why the shell leans enterprise-safe. Higher-tier usage keeps governance, rollout, and reliability at the center of the visual system."
            />
            <PieChart
              data={PLAN_DISTRIBUTION}
              height={220}
              donut
              showPercentage
              animate
            />
          </Stack>
        </Card>

        <Card
          style={{
            padding: tokens.spacing[4],
            border: `1px solid ${BORDER}`,
            background: PANEL_BACKGROUND,
            boxShadow: PANEL_SHADOW,
          }}
        >
          <Stack spacing="sm">
            <SectionHeader
              eyebrow="Operator framing"
              title="Why this demo reads like a control plane"
              description="Platform only feels premium when the dashboard separates alarms from throughput and analytics. Otherwise dense admin work collapses into undifferentiated cards."
            />
            <Stack spacing="sm">
              {ANALYSIS_LANES.map((lane) => (
                <Box
                  key={lane.label}
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    border: `1px solid ${BORDER}`,
                    background: SURFACE,
                    boxShadow: PANEL_SHADOW,
                  }}
                >
                  <Text size="sm" weight="semibold">
                    {lane.label}
                  </Text>
                  <Text size="xs" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
                    {lane.detail}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Card>
      </Box>
    </Stack>
  );
}
