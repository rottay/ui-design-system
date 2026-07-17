'use client';

import { useShowroomRuntime } from '@/composition/components/showroom-context';
import {
  AreaChart,
  Badge,
  Box,
  Card,
  Flex,
  GaugeChart,
  Stack,
  Text,
  useTokens,
} from '@rottay/design-system';
import {
  CalendarIcon,
  StarIcon,
  TrendingUpIcon,
  UserCheckIcon,
} from '@rottay/design-system/icons';

const SURFACE =
  'var(--ds-color-bg-container, var(--ds-color-bg-elevated, var(--ds-color-bg-primary, #ffffff)))';
const ELEVATED_SURFACE =
  'var(--ds-color-bg-elevated, var(--ds-color-bg-primary, #ffffff))';
const SUBTLE_SURFACE =
  'var(--ds-color-bg-secondary, var(--ds-color-bg-elevated, var(--ds-color-bg-primary, #ffffff)))';
const BORDER =
  'var(--ds-color-border-subtle, var(--ds-color-border, rgba(148, 163, 184, 0.28)))';
const TEXT_SECONDARY =
  'var(--ds-color-text-secondary, var(--ds-color-text-muted, #64748b))';
const TEXT_MUTED = 'var(--ds-color-text-muted, #64748b)';
const HERO_BACKGROUND = `radial-gradient(circle at top right, color-mix(in srgb, var(--ds-color-primary, #ffffff) 18%, transparent) 0%, transparent 32%), linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary, #ffffff) 12%, ${ELEVATED_SURFACE}) 0%, ${SURFACE} 100%)`;
const CARD_SHADOW = 'var(--ds-shadow-lg, 0 20px 48px rgba(15, 23, 42, 0.1))';
const PANEL_SHADOW = 'var(--ds-shadow-md, 0 12px 28px rgba(15, 23, 42, 0.08))';
const PANEL_BACKGROUND = `linear-gradient(180deg, color-mix(in srgb, ${ELEVATED_SURFACE} 92%, ${SURFACE} 8%) 0%, ${SURFACE} 100%)`;
const EMPHASIS_SURFACE = `linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary, #ffffff) 18%, ${SUBTLE_SURFACE}) 0%, ${SURFACE} 100%)`;

interface KpiItem {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  trend: string;
}

interface ShowMoment {
  label: string;
  value: string;
  detail: string;
}

interface SignalCard {
  label: string;
  detail: string;
  value: string;
}

interface RunOfShowItem {
  time: string;
  label: string;
  detail: string;
  owner: string;
  status: 'ready' | 'watch';
}

const KPI_DATA: KpiItem[] = [
  {
    label: 'Tickets sold',
    value: '2,340',
    sub: 'of 3,000 capacity',
    icon: <CalendarIcon size={20} />,
    trend: '+12%',
  },
  {
    label: 'Revenue',
    value: '$78.4K',
    sub: 'this event',
    icon: <TrendingUpIcon size={20} />,
    trend: '+8.2%',
  },
  {
    label: 'Check-ins',
    value: '1,890',
    sub: 'current throughput',
    icon: <UserCheckIcon size={20} />,
    trend: '80.7%',
  },
  {
    label: 'Avg rating',
    value: '4.7',
    sub: 'post-session pulse',
    icon: <StarIcon size={20} />,
    trend: '+0.3',
  },
];

const SHOW_MOMENTS: ShowMoment[] = [
  {
    label: 'Doors',
    value: '7:15 PM',
    detail: 'VIP + guest-list arrival window',
  },
  {
    label: 'Headliner',
    value: '8:45 PM',
    detail: 'Main-floor density will spike fast',
  },
  {
    label: 'Last release',
    value: '250',
    detail: 'Tickets left in final public drop',
  },
];

const CROWD_SIGNALS: SignalCard[] = [
  {
    label: 'Floor energy',
    value: 'High',
    detail: 'GA demand is arriving faster than forecast in the last 30 minutes.',
  },
  {
    label: 'Sponsor pulse',
    value: 'On track',
    detail: 'Hospitality reset is green once VIP host handoff lands.',
  },
  {
    label: 'Merch queue',
    value: '12 min',
    detail: 'Acceptable, but it climbs fast once the headline act starts.',
  },
];

const SALES_VELOCITY = [
  { x: 'Day 1', y: 42 },
  { x: 'Day 2', y: 58 },
  { x: 'Day 3', y: 73 },
  { x: 'Day 4', y: 65 },
  { x: 'Day 5', y: 89 },
  { x: 'Day 6', y: 112 },
  { x: 'Day 7', y: 134 },
  { x: 'Day 8', y: 98 },
  { x: 'Day 9', y: 156 },
  { x: 'Day 10', y: 178 },
  { x: 'Day 11', y: 201 },
  { x: 'Day 12', y: 245 },
  { x: 'Day 13', y: 289 },
  { x: 'Day 14', y: 340 },
];

const RUN_OF_SHOW: RunOfShowItem[] = [
  {
    time: '6:30 PM',
    label: 'VIP doors',
    detail: 'Guest list, bottle service, and hospitality teams go live together.',
    owner: 'Front-of-house',
    status: 'ready',
  },
  {
    time: '7:15 PM',
    label: 'Main floor open',
    detail: 'Crowd routing shifts from arrival lane to bar and floor circulation.',
    owner: 'Venue ops',
    status: 'ready',
  },
  {
    time: '8:10 PM',
    label: 'Headline soundcheck',
    detail: 'Keep camera pit and sponsor lounge isolated during rehearsal pass.',
    owner: 'Production',
    status: 'watch',
  },
  {
    time: '8:45 PM',
    label: 'Sponsor hospitality reset',
    detail: 'Final host coverage and table labels need confirmation before peak.',
    owner: 'Partner team',
    status: 'watch',
  },
];

function statusVariant(status: RunOfShowItem['status']): 'success' | 'warning' {
  return status === 'ready' ? 'success' : 'warning';
}

export function EventDashboardDemo() {
  const runtime = useShowroomRuntime();
  const tokens = useTokens();

  return (
    <Stack spacing="lg">
      <Card
        style={{
          padding: tokens.spacing[4],
          border: `1px solid ${BORDER}`,
          background: HERO_BACKGROUND,
          boxShadow: CARD_SHADOW,
        }}
      >
        <Stack spacing="md">
          <Flex align="start" justify="between" style={{ gap: 12, flexWrap: 'wrap' }}>
            <Box style={{ minWidth: 0, flex: '1 1 320px' }}>
              <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
                <Badge variant="primary">Live event pulse</Badge>
                <Badge variant="secondary">{runtime.tenantName}</Badge>
                <Badge variant="secondary">{runtime.engine}</Badge>
              </Flex>
              <Text as={"h2" as any} size="xl" weight="bold" style={{ marginTop: 12 }}>
                Neon Nights operations dashboard
              </Text>
              <Text size="sm" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
                Capacity, revenue, hospitality, and showtime coordination
                rendered through the active DS runtime instead of a local
                mock skin.
              </Text>
            </Box>

            <Card
              style={{
                minWidth: 280,
                flex: '0 1 360px',
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.xl,
                background: EMPHASIS_SURFACE,
                border: `1px solid ${BORDER}`,
                boxShadow: PANEL_SHADOW,
              }}
            >
              <Stack spacing="sm">
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    color: TEXT_MUTED,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Tonight at a glance
                </Text>
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))',
                    gap: tokens.spacing[2],
                  }}
                >
                  {SHOW_MOMENTS.map((moment) => (
                    <Box
                      key={moment.label}
                      style={{
                        padding: tokens.spacing[2],
                        borderRadius: tokens.borderRadius.lg,
                        background: SURFACE,
                        border: `1px solid ${BORDER}`,
                      }}
                    >
                      <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
                        {moment.label}
                      </Text>
                      <Text size="sm" weight="bold" style={{ marginTop: 6 }}>
                        {moment.value}
                      </Text>
                      <Text size="xs" style={{ marginTop: 4, color: TEXT_SECONDARY, lineHeight: 1.45 }}>
                        {moment.detail}
                      </Text>
                    </Box>
                  ))}
                </Box>
                <Text size="xs" style={{ color: TEXT_SECONDARY, lineHeight: 1.5 }}>
                  The page should feel premium enough for an event brand, but
                  the operational priority still has to read instantly.
                </Text>
              </Stack>
            </Card>
          </Flex>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: tokens.spacing[3],
            }}
          >
            {KPI_DATA.map((kpi) => (
              <Card
                key={kpi.label}
                style={{
                  padding: tokens.spacing[3],
                  border: `1px solid ${BORDER}`,
                  background: EMPHASIS_SURFACE,
                  boxShadow: PANEL_SHADOW,
                }}
              >
                <Stack spacing="sm">
                  <Flex align="center" justify="between">
                    <Box
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: tokens.borderRadius.lg,
                        background: SURFACE,
                        border: `1px solid ${BORDER}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {kpi.icon}
                    </Box>
                    <Badge variant="success" size="sm">
                      {kpi.trend}
                    </Badge>
                  </Flex>
                  <Box>
                    <Text size="2xl" weight="bold">
                      {kpi.value}
                    </Text>
                    <Text size="xs" style={{ marginTop: 4, color: TEXT_MUTED }}>
                      {kpi.sub}
                    </Text>
                  </Box>
                  <Text size="sm" style={{ color: TEXT_SECONDARY }}>
                    {kpi.label}
                  </Text>
                </Stack>
              </Card>
            ))}
          </Box>

          <Card
            style={{
              padding: tokens.spacing[3],
              border: `1px solid ${BORDER}`,
              background: PANEL_BACKGROUND,
              boxShadow: PANEL_SHADOW,
            }}
          >
            <Stack spacing="sm">
              <Flex align="center" justify="between" style={{ gap: 12, flexWrap: 'wrap' }}>
                <Box>
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      color: TEXT_MUTED,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Experience pulse
                  </Text>
                  <Text size="sm" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
                    Signals that make Evnto feel like live entertainment rather than a generic ops board.
                  </Text>
                </Box>
                <Badge variant="secondary">Commercial + showtime</Badge>
              </Flex>

              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: tokens.spacing[3],
                }}
              >
                {CROWD_SIGNALS.map((signal) => (
                  <Box
                    key={signal.label}
                    style={{
                      minWidth: 0,
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.lg,
                      background: `linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary, #ffffff) 10%, ${SURFACE}) 0%, ${SURFACE} 100%)`,
                      border: `1px solid ${BORDER}`,
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
                      {signal.label}
                    </Text>
                    <Text size="lg" weight="bold" style={{ marginTop: 8 }}>
                      {signal.value}
                    </Text>
                    <Text size="xs" style={{ marginTop: 6, color: TEXT_SECONDARY, lineHeight: 1.5 }}>
                      {signal.detail}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Stack>
          </Card>
        </Stack>
      </Card>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.05fr) minmax(260px, 0.95fr)',
          gap: tokens.spacing[4],
          alignItems: 'start',
        }}
      >
        <Card
          style={{
            padding: tokens.spacing[4],
            border: `1px solid ${BORDER}`,
            background: PANEL_BACKGROUND,
            boxShadow: PANEL_SHADOW,
          }}
        >
          <Stack spacing="sm">
            <Flex align="center" justify="between" style={{ gap: 12, flexWrap: 'wrap' }}>
              <Box>
                <Text as={"h3" as any} size="lg" weight="semibold">
                  Venue capacity
                </Text>
                <Text size="sm" style={{ color: TEXT_SECONDARY, marginTop: 6 }}>
                  Current occupancy versus safe operating threshold.
                </Text>
              </Box>
              <Badge variant="warning">Peak window approaching</Badge>
            </Flex>
            <Box style={{ display: 'flex', justifyContent: 'center' }}>
              <GaugeChart
                value={78}
                min={0}
                max={100}
                label="Capacity"
                formatValue={(value) => `${value}%`}
                segments={[
                  {
                    from: 0,
                    to: 50,
                    color: 'var(--ds-color-success)',
                    label: 'Low',
                  },
                  {
                    from: 50,
                    to: 80,
                    color: 'var(--ds-color-warning)',
                    label: 'Moderate',
                  },
                  {
                    from: 80,
                    to: 100,
                    color: 'var(--ds-color-error)',
                    label: 'High',
                  },
                ]}
                height={240}
                width={320}
              />
            </Box>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: tokens.spacing[3],
              }}
            >
              {[
                {
                  label: 'Floor release',
                  value: 'On schedule',
                  detail: 'Main-floor density is rising in line with door cadence.',
                },
                {
                  label: 'VIP lounge',
                  value: 'Watch staffing',
                  detail: 'One more host keeps hospitality from bottlenecking.',
                },
                {
                  label: 'Ingress pressure',
                  value: 'Balanced',
                  detail: 'Arrival lane can absorb the next 15-minute traffic wave.',
                },
              ].map((item) => (
                <Box
                  key={item.label}
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    background: SURFACE,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
                    {item.label}
                  </Text>
                  <Text size="sm" weight="semibold" style={{ marginTop: 8 }}>
                    {item.value}
                  </Text>
                  <Text size="xs" style={{ marginTop: 6, color: TEXT_SECONDARY, lineHeight: 1.45 }}>
                    {item.detail}
                  </Text>
                </Box>
              ))}
            </Box>
          </Stack>
        </Card>

        <Stack spacing="md">
          <Card
            style={{
              padding: tokens.spacing[4],
              border: `1px solid ${BORDER}`,
              background: PANEL_BACKGROUND,
              boxShadow: PANEL_SHADOW,
            }}
          >
            <Stack spacing="sm">
              <Flex align="center" justify="between" style={{ gap: 12, flexWrap: 'wrap' }}>
                <Box>
                  <Text as={"h3" as any} size="lg" weight="semibold">
                    Ticket sales velocity
                  </Text>
                  <Text size="sm" style={{ color: TEXT_SECONDARY, marginTop: 6 }}>
                    Daily ticket movement in the final two weeks before doors open.
                  </Text>
                </Box>
                <Badge variant="success">Momentum building</Badge>
              </Flex>
              <AreaChart
                series={[{ name: 'Tickets', data: SALES_VELOCITY }]}
                curved
                height={220}
                xAxisLabel="Day"
                yAxisLabel="Tickets"
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
              <Flex align="center" justify="between" style={{ gap: 12, flexWrap: 'wrap' }}>
                <Text as={"h3" as any} size="md" weight="semibold">
                  Run of show
                </Text>
                <Badge variant="secondary">Crew rhythm</Badge>
              </Flex>
              {RUN_OF_SHOW.map((item) => (
                <Box
                  key={item.label}
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    background: `linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary, #ffffff) 10%, ${SURFACE}) 0%, ${SURFACE} 100%)`,
                    border: `1px solid ${BORDER}`,
                    boxShadow: PANEL_SHADOW,
                  }}
                >
                  <Flex align="center" justify="between" gap={8} style={{ flexWrap: 'wrap' }}>
                    <Box>
                      <Text size="sm" weight="semibold">
                        {item.label}
                      </Text>
                      <Text size="xs" style={{ marginTop: 4, color: TEXT_MUTED }}>
                        {item.time}
                      </Text>
                      <Text size="xs" style={{ marginTop: 8, color: TEXT_SECONDARY, lineHeight: 1.45 }}>
                        {item.detail}
                      </Text>
                    </Box>
                    <Box style={{ textAlign: 'right' }}>
                      <Badge variant={statusVariant(item.status)}>
                        {item.status === 'ready' ? 'Ready' : 'Watch'}
                      </Badge>
                      <Text size="xs" style={{ marginTop: 8, color: TEXT_MUTED }}>
                        {item.owner}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              ))}
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
              <Text as={"h3" as any} size="md" weight="semibold">
                Afterglow signals
              </Text>
              {[
                'Merch bundle attach rate is strongest during the second support act.',
                'Post-session rating is trending above the last three sold-out events.',
                'Sponsor lounge sentiment is strong enough to justify extending premium access next cycle.',
              ].map((note) => (
                <Box
                  key={note}
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    background: SURFACE,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <Text size="sm" style={{ color: TEXT_SECONDARY, lineHeight: 1.5 }}>
                    {note}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Card>
        </Stack>
      </Box>
    </Stack>
  );
}
