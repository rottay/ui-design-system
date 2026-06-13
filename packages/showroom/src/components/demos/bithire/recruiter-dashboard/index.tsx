'use client';

import { useShowroomRuntime } from '@/components/showroom-context';
import {
  Badge,
  Box,
  Card,
  Flex,
  LineChart,
  RadarChart,
  Stack,
  Text,
  useTokens,
} from '@rottay/design-system';
import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
} from '@rottay/design-system/icons';

const SURFACE = 'var(--ds-color-bg-container, #ffffff)';
const ELEVATED_SURFACE = 'var(--ds-color-bg-elevated, #f8fafc)';
const BORDER = 'var(--ds-color-border, rgba(148, 163, 184, 0.28))';
const TEXT_SECONDARY = 'var(--ds-color-text-secondary)';
const TEXT_MUTED = 'var(--ds-color-text-muted)';
const CARD_SHADOW = 'var(--ds-shadow-lg, 0 20px 48px rgba(15, 23, 42, 0.1))';
const PANEL_SHADOW = 'var(--ds-shadow-md, 0 12px 28px rgba(15, 23, 42, 0.08))';
const PANEL_BACKGROUND = `linear-gradient(180deg, color-mix(in srgb, ${ELEVATED_SURFACE} 92%, ${SURFACE} 8%) 0%, ${SURFACE} 100%)`;

interface KPICardData {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}

const KPI_DATA: KPICardData[] = [
  {
    label: 'Critical reqs',
    value: '7',
    change: '3 close-ready this week',
    icon: <BriefcaseIcon size={20} />,
  },
  {
    label: 'Live loops',
    value: '24',
    change: '2 need interviewer fill',
    icon: <UsersIcon size={20} />,
  },
  {
    label: 'Median advance time',
    value: '42h',
    change: '-9h vs last sprint',
    icon: <ClockIcon size={20} />,
  },
  {
    label: 'Offer close rate',
    value: '81%',
    change: '+6 pts after comp refresh',
    icon: <CheckCircleIcon size={20} />,
  },
];

const HIRING_MOMENTUM = [
  { x: 'W1', y: 12 },
  { x: 'W2', y: 16 },
  { x: 'W3', y: 14 },
  { x: 'W4', y: 19 },
  { x: 'W5', y: 22 },
  { x: 'W6', y: 20 },
  { x: 'W7', y: 24 },
  { x: 'W8', y: 27 },
];

const SIGNAL_COVERAGE = [
  { axis: 'Source mix', value: 8 },
  { axis: 'Panel fill', value: 6 },
  { axis: 'Hiring bar', value: 9 },
  { axis: 'Close readiness', value: 7 },
  { axis: 'Executive urgency', value: 8 },
];

const HIRING_SLATE = [
  {
    role: 'Senior Frontend Engineer',
    stage: 'Offer prep',
    note: 'Priya Sharma is ready for comp approval after final manager sync.',
    owner: 'A. Patel',
    target: 'Target start May 12',
  },
  {
    role: 'People Analytics Lead',
    stage: 'Pipeline risk',
    note: 'Only two calibrated profiles remain after onsite drop-off.',
    owner: 'M. Rivera',
    target: 'Needs sourcing reset today',
  },
  {
    role: 'Staff Product Designer',
    stage: 'Exec loop',
    note: 'Panel is aligned, but portfolio debrief still needs written evidence.',
    owner: 'S. Chen',
    target: 'Decision review at 4:30 PM',
  },
];

const RECRUITER_PODS = [
  {
    title: 'Frontend pod',
    detail: '3 recruiters across product engineering, 6 active loops, no coordinator gaps.',
  },
  {
    title: 'Leadership pod',
    detail: 'Exec scheduling is the constraint; two loops need interviewer confirmation.',
  },
  {
    title: 'Data pod',
    detail: 'Healthy source mix, but compensation alignment is slowing one close.',
  },
];

const INTERVENTIONS = [
  {
    label: 'Comp approvals',
    detail: '2 packages are ready and waiting on finance sign-off before close calls.',
  },
  {
    label: 'Panel calibration',
    detail: '1 interviewer packet needs sharper written evidence before debrief.',
  },
  {
    label: 'Source expansion',
    detail: 'People Analytics needs outbound expansion to avoid a Friday stall.',
  },
];

function KPICard({ data }: { data: KPICardData }) {
  return (
    <Card
      style={{
        padding: '16px',
        flex: 1,
        minWidth: 180,
        border: `1px solid ${BORDER}`,
        background: PANEL_BACKGROUND,
        boxShadow: PANEL_SHADOW,
      }}
    >
      <Stack spacing="sm">
        <Flex align="center" justify="between">
          <Box
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {data.icon}
          </Box>
          <Badge variant="success" size="sm">
            {data.change}
          </Badge>
        </Flex>
        <Box>
          <Text size="2xl" weight="bold">
            {data.value}
          </Text>
          <Text size="xs" style={{ color: TEXT_MUTED }}>
            {data.label}
          </Text>
        </Box>
      </Stack>
    </Card>
  );
}

export function RecruiterDashboardDemo() {
  const runtime = useShowroomRuntime();
  const tokens = useTokens();

  return (
    <Stack spacing="lg">
      <Card
        style={{
          padding: tokens.spacing[4],
          border: `1px solid ${BORDER}`,
          background:
            'linear-gradient(180deg, rgba(99, 102, 241, 0.16), transparent 46%), var(--ds-color-bg-container, #ffffff)',
          boxShadow: CARD_SHADOW,
        }}
      >
        <Stack spacing="md">
          <Flex align="start" justify="between" style={{ gap: 12, flexWrap: 'wrap' }}>
            <Box style={{ minWidth: 0, flex: '1 1 320px' }}>
              <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
                <Badge variant="primary">Recruiter command center</Badge>
                <Badge variant="secondary">{runtime.tenantName}</Badge>
                <Badge variant="secondary">Q2 hiring slate</Badge>
              </Flex>
              <Text as={"h2" as any} size="xl" weight="bold" style={{ marginTop: 12 }}>
                Executive hiring slate
              </Text>
              <Text size="sm" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
                This view should read like recruiting operations, not generic
                B2B analytics: requisition pressure, close timing, panel
                readiness, and candidate momentum all need to be visible at a
                glance.
              </Text>
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: tokens.spacing[3],
                  marginTop: tokens.spacing[4],
                }}
              >
                {[
                  {
                    label: 'Priority openings',
                    value: '7 reqs',
                    detail: '4 engineering, 2 leadership, 1 analytics',
                  },
                  {
                    label: 'Offer-ready loops',
                    value: '3 candidates',
                    detail: 'Two approvals pending, one executive callback',
                  },
                  {
                    label: 'Coordinator fill',
                    value: '91%',
                    detail: 'Only one onsite still missing an interviewer',
                  },
                ].map((item) => (
                  <Box
                    key={item.label}
                    style={{
                      padding: '14px 16px',
                      borderRadius: tokens.borderRadius.lg,
                      background: SURFACE,
                      border: `1px solid ${BORDER}`,
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
                      {item.label}
                    </Text>
                    <Text size="lg" weight="bold" style={{ marginTop: 8 }}>
                      {item.value}
                    </Text>
                    <Text size="xs" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
                      {item.detail}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box
              style={{
                padding: '12px 14px',
                borderRadius: tokens.borderRadius.xl,
                background: PANEL_BACKGROUND,
                border: `1px solid ${BORDER}`,
                minWidth: 220,
                boxShadow: PANEL_SHADOW,
              }}
            >
              <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
                Close plan this week
              </Text>
              <Stack spacing="xs" style={{ marginTop: 10 }}>
                {[
                  'Priya Sharma: comp approval before Thursday close call.',
                  'Staff Designer: written panel evidence still missing.',
                  'People Analytics: sourcing reset required before Friday.',
                ].map((item) => (
                  <Box
                    key={item}
                    style={{
                      padding: '10px 12px',
                      borderRadius: tokens.borderRadius.lg,
                      background: SURFACE,
                      border: `1px solid ${BORDER}`,
                      boxShadow: PANEL_SHADOW,
                    }}
                  >
                    <Text size="sm" style={{ color: TEXT_SECONDARY }}>
                      {item}
                    </Text>
                  </Box>
                ))}
              </Stack>
              <Text size="xs" style={{ marginTop: 10, color: TEXT_MUTED }}>
                Runtime check: these cues should still feel brisk and legible
                when the showroom switches tenant or engine.
              </Text>
            </Box>
          </Flex>

          <Flex gap={16} style={{ flexWrap: 'wrap' }}>
            {KPI_DATA.map((kpi) => (
              <KPICard key={kpi.label} data={kpi} />
            ))}
          </Flex>
        </Stack>
      </Card>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(260px, 0.85fr)',
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
          <Stack spacing="md">
            <Box>
              <Text as={"h3" as any} size="lg" weight="semibold">
                Hiring momentum
              </Text>
              <Text size="sm" style={{ marginTop: 4, color: TEXT_SECONDARY }}>
                Weekly candidate movement from recruiter screen to close-ready
                loops across the active slate.
              </Text>
            </Box>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: tokens.spacing[3],
              }}
            >
              {[
                { label: 'Screens', value: '34' },
                { label: 'Onsites', value: '11' },
                { label: 'Offer-ready', value: '4' },
              ].map((item) => (
                <Box
                  key={item.label}
                  style={{
                    padding: '12px 14px',
                    borderRadius: tokens.borderRadius.lg,
                    background: SURFACE,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <Text size="xs" style={{ color: TEXT_MUTED }}>
                    {item.label}
                  </Text>
                  <Text size="lg" weight="bold" style={{ marginTop: 6 }}>
                    {item.value}
                  </Text>
                </Box>
              ))}
            </Box>
            <LineChart
              series={[{ name: 'Moved forward', data: HIRING_MOMENTUM }]}
              height={280}
              curved
              showDots
              showArea
              xAxisLabel="Week"
              yAxisLabel="Candidates advanced"
            />
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
            <Stack spacing="md">
              <Box>
                <Text as={"h3" as any} size="lg" weight="semibold">
                  Signal coverage
                </Text>
                <Text size="sm" style={{ marginTop: 4, color: TEXT_SECONDARY }}>
                  A healthy recruiting operation balances source quality,
                  decision signal, and close readiness.
                </Text>
              </Box>
              <RadarChart
                data={SIGNAL_COVERAGE}
                height={250}
                maxValue={10}
                levels={5}
                showLabels
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
              <Text as={"h3" as any} size="md" weight="semibold">
                Requisition heat
              </Text>
              {HIRING_SLATE.map((item) => (
                <Box
                  key={item.role}
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    background: SURFACE,
                    border: `1px solid ${BORDER}`,
                    boxShadow: PANEL_SHADOW,
                  }}
                >
                  <Flex align="center" justify="between" gap={8} style={{ flexWrap: 'wrap' }}>
                    <Stack spacing="xs">
                      <Text size="sm" weight="semibold">
                        {item.role}
                      </Text>
                      <Text size="xs" style={{ color: TEXT_MUTED }}>
                        Owner {item.owner}
                      </Text>
                    </Stack>
                    <Badge variant="secondary">{item.stage}</Badge>
                  </Flex>
                  <Text size="xs" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
                    {item.note}
                  </Text>
                  <Text size="xs" weight="semibold" style={{ marginTop: 8 }}>
                    {item.target}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Card>
        </Stack>
      </Box>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: tokens.spacing[4],
        }}
      >
        <Card
          style={{
            padding: tokens.spacing[4],
            border: `1px solid ${BORDER}`,
            background: `linear-gradient(180deg, rgba(99, 102, 241, 0.08), transparent 40%), ${SURFACE}`,
            boxShadow: PANEL_SHADOW,
          }}
        >
          <Stack spacing="sm">
            <Text as={"h3" as any} size="md" weight="semibold">
              Recruiter pods
            </Text>
            {RECRUITER_PODS.map((item) => (
              <Box
                key={item.title}
                style={{
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.lg,
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                }}
              >
                <Text size="sm" weight="semibold">
                  {item.title}
                </Text>
                <Text size="xs" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
                  {item.detail}
                </Text>
              </Box>
            ))}
          </Stack>
        </Card>

        <Card
          style={{
            padding: tokens.spacing[4],
            border: `1px solid ${BORDER}`,
            background: `linear-gradient(180deg, rgba(99, 102, 241, 0.08), transparent 40%), ${SURFACE}`,
            boxShadow: PANEL_SHADOW,
          }}
        >
          <Stack spacing="sm">
            <Text as={"h3" as any} size="md" weight="semibold">
              Today&apos;s interventions
            </Text>
            {INTERVENTIONS.map((item) => (
              <Box
                key={item.label}
                style={{
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.lg,
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                }}
              >
                <Text size="sm" weight="semibold">
                  {item.label}
                </Text>
                <Text size="xs" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
                  {item.detail}
                </Text>
              </Box>
            ))}
          </Stack>
        </Card>

        <Card
          style={{
            padding: tokens.spacing[4],
            border: `1px solid ${BORDER}`,
            background: `linear-gradient(180deg, rgba(99, 102, 241, 0.08), transparent 40%), ${SURFACE}`,
            boxShadow: PANEL_SHADOW,
          }}
        >
          <Stack spacing="sm">
            <Text as={"h3" as any} size="md" weight="semibold">
              Why this demo matters
            </Text>
            <Text size="sm" style={{ color: TEXT_SECONDARY }}>
              BitHire only feels premium when the narrative is recruiting-first:
              requisition urgency, panel quality, and close-plan confidence have
              to read as one operating surface instead of a chart wall.
            </Text>
          </Stack>
        </Card>
      </Box>
    </Stack>
  );
}

export default RecruiterDashboardDemo;
