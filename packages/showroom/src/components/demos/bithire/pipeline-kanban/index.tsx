'use client';

import { useShowroomRuntime } from '@/composition/components/showroom-context';
import {
  Avatar,
  Badge,
  Box,
  Card,
  Flex,
  Stack,
  Text,
  useTokens,
} from '@rottay/design-system';

const SURFACE = 'var(--ds-color-bg-container, #ffffff)';
const ELEVATED_SURFACE = 'var(--ds-color-bg-elevated, #f8fafc)';
const SUBTLE_SURFACE = 'var(--ds-color-bg-secondary, #f1f5f9)';
const BORDER = 'var(--ds-color-border, rgba(148, 163, 184, 0.28))';
const TEXT_SECONDARY = 'var(--ds-color-text-secondary)';
const TEXT_MUTED = 'var(--ds-color-text-muted)';
const CARD_SHADOW = 'var(--ds-shadow-lg, 0 20px 48px rgba(15, 23, 42, 0.1))';
const PANEL_SHADOW = 'var(--ds-shadow-md, 0 12px 28px rgba(15, 23, 42, 0.08))';
const PANEL_BACKGROUND = `linear-gradient(180deg, color-mix(in srgb, ${ELEVATED_SURFACE} 92%, ${SURFACE} 8%) 0%, ${SURFACE} 100%)`;

interface CandidateCard {
  id: string;
  name: string;
  role: string;
  location: string;
  salary: string;
  daysInStage: number;
  matchScore: number;
  nextStep: string;
  source: string;
  owner: string;
  blocker: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  focus: string;
  cadence: string;
  candidates: CandidateCard[];
}

const COLUMNS: KanbanColumn[] = [
  {
    id: 'applied',
    title: 'Applied',
    color: 'rgba(99, 102, 241, 0.72)',
    focus: 'Initial qualification',
    candidates: [
      {
        id: '1',
        name: 'Sarah Chen',
        role: 'Senior Frontend Engineer',
        location: 'New York, NY',
        salary: '$175k target',
        daysInStage: 2,
        matchScore: 92,
        nextStep: 'Recruiter intro',
        source: 'Inbound referral',
        owner: 'A. Patel',
        blocker: 'Need HM note',
      },
      {
        id: '2',
        name: 'Marcus Rivera',
        role: 'Backend Developer',
        location: 'Austin, TX',
        salary: '$162k target',
        daysInStage: 1,
        matchScore: 87,
        nextStep: 'Resume review',
        source: 'Outbound search',
        owner: 'J. Kim',
        blocker: 'Awaiting recruiter screen',
      },
    ],
    cadence: '24h triage',
  },
  {
    id: 'screening',
    title: 'Screening',
    color: 'rgba(79, 70, 229, 0.72)',
    focus: 'Signal validation',
    candidates: [
      {
        id: '3',
        name: 'Elena Kowalski',
        role: 'Senior Frontend Engineer',
        location: 'Chicago, IL',
        salary: '$181k target',
        daysInStage: 4,
        matchScore: 95,
        nextStep: 'Take-home review',
        source: 'Top-of-funnel outbound',
        owner: 'A. Patel',
        blocker: 'Portfolio review due today',
      },
      {
        id: '4',
        name: 'Aisha Patel',
        role: 'People Analytics Lead',
        location: 'Remote',
        salary: '$169k target',
        daysInStage: 3,
        matchScore: 84,
        nextStep: 'Recruiter calibration',
        source: 'Referral',
        owner: 'M. Rivera',
        blocker: 'Sourcing lane is thin',
      },
    ],
    cadence: '48h response window',
  },
  {
    id: 'interview',
    title: 'Interview',
    color: 'rgba(129, 140, 248, 0.74)',
    focus: 'Team alignment',
    candidates: [
      {
        id: '5',
        name: 'David Okafor',
        role: 'Tech Lead',
        location: 'Seattle, WA',
        salary: '$208k target',
        daysInStage: 3,
        matchScore: 91,
        nextStep: 'System design',
        source: 'Executive referral',
        owner: 'S. Chen',
        blocker: 'Panel packet incomplete',
      },
      {
        id: '6',
        name: 'Lina Zhang',
        role: 'Backend Developer',
        location: 'Remote',
        salary: '$168k target',
        daysInStage: 5,
        matchScore: 84,
        nextStep: 'Panel debrief',
        source: 'Inbound',
        owner: 'J. Kim',
        blocker: 'Two interview notes missing',
      },
    ],
    cadence: 'Daily debrief',
  },
  {
    id: 'offer',
    title: 'Offer',
    color: 'rgba(168, 85, 247, 0.7)',
    focus: 'Close with confidence',
    candidates: [
      {
        id: '7',
        name: 'Priya Sharma',
        role: 'Senior Frontend Engineer',
        location: 'Brooklyn, NY',
        salary: '$192k target',
        daysInStage: 2,
        matchScore: 96,
        nextStep: 'Comp approval',
        source: 'Referral',
        owner: 'A. Patel',
        blocker: 'Finance sign-off pending',
      },
      {
        id: '8',
        name: 'Carlos Mendez',
        role: 'DevOps Engineer',
        location: 'Denver, CO',
        salary: '$178k target',
        daysInStage: 1,
        matchScore: 93,
        nextStep: 'Sign-off call',
        source: 'Agency partner',
        owner: 'S. Chen',
        blocker: 'Reference still in flight',
      },
    ],
    cadence: 'Close within 72h',
  },
];

function getScoreBadgeVariant(score: number): 'success' | 'warning' | 'error' | 'primary' {
  if (score >= 90) return 'success';
  if (score >= 82) return 'primary';
  if (score >= 74) return 'warning';
  return 'error';
}

function CandidateItem({ candidate }: { candidate: CandidateCard }) {
  const tokens = useTokens();

  return (
    <Card
      style={{
        padding: tokens.spacing[3],
        border: `1px solid ${BORDER}`,
        background: PANEL_BACKGROUND,
        boxShadow: PANEL_SHADOW,
      }}
      hoverable
    >
      <Stack spacing="sm">
        <Flex align="center" gap={10}>
          <Avatar name={candidate.name} size="sm" shape="circle" />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text size="sm" weight="semibold" style={{ lineHeight: 1.3 }}>
              {candidate.name}
            </Text>
            <Text size="xs" style={{ color: TEXT_MUTED }}>
              {candidate.role}
            </Text>
          </Box>
          <Badge variant={getScoreBadgeVariant(candidate.matchScore)} size="sm">
            {candidate.matchScore}%
          </Badge>
        </Flex>

        <Flex gap={8} style={{ flexWrap: 'wrap' }}>
          <Badge variant="secondary">{candidate.source}</Badge>
          <Badge variant="secondary">{candidate.owner}</Badge>
        </Flex>

        <Box
          style={{
            padding: '10px 12px',
            borderRadius: tokens.borderRadius.md,
            background: SURFACE,
            border: `1px solid ${BORDER}`,
          }}
        >
          <Flex align="center" justify="between" gap={8}>
            <Text size="xs" style={{ color: TEXT_MUTED }}>
              {candidate.daysInStage}d in stage
            </Text>
            <Text size="xs" style={{ color: TEXT_SECONDARY }}>
              {candidate.salary}
            </Text>
          </Flex>
          <Text size="xs" weight="semibold" style={{ marginTop: 8 }}>
            Next: {candidate.nextStep}
          </Text>
          <Text size="xs" style={{ marginTop: 4, color: TEXT_SECONDARY }}>
            Blocker: {candidate.blocker}
          </Text>
          <Text size="xs" style={{ marginTop: 4, color: TEXT_MUTED }}>
            {candidate.location}
          </Text>
        </Box>
      </Stack>
    </Card>
  );
}

export function PipelineKanbanDemo() {
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
                <Badge variant="primary">Pipeline operating board</Badge>
                <Badge variant="secondary">{runtime.tenantName}</Badge>
                <Badge variant="secondary">Search cadence</Badge>
              </Flex>
              <Text as={"h2" as any} size="xl" weight="bold" style={{ marginTop: 12 }}>
                Senior Frontend Engineer search
              </Text>
              <Text size="sm" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
                The board should make urgency, ownership, and stage pressure
                obvious. Recruiters need to see who is moving, who is blocked,
                and where close momentum is slipping before the debrief.
              </Text>
            </Box>

            <Box
              style={{
                padding: '12px 14px',
                borderRadius: tokens.borderRadius.xl,
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                minWidth: 220,
              }}
            >
              <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
                Search brief
              </Text>
              <Text size="sm" weight="semibold" style={{ marginTop: 6 }}>
                Staff Frontend Engineer
              </Text>
              <Stack spacing="xs" style={{ marginTop: 8 }}>
                {[
                  'Target: NYC hybrid, design systems depth, staff-level partnership.',
                  'Hiring manager wants one close-ready candidate this week.',
                  'Comp band approved up to $195k plus equity.',
                ].map((item) => (
                  <Text key={item} size="xs" style={{ color: TEXT_SECONDARY }}>
                    {item}
                  </Text>
                ))}
              </Stack>
            </Box>
          </Flex>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: tokens.spacing[3],
            }}
          >
            {[
              {
                label: 'Offer-close',
                value: '2 candidates',
                detail: 'Both require comp and reference confirmation.',
              },
              {
                label: 'Aging risk',
                value: '3 loops',
                detail: 'Interview packets are still incomplete after 48h.',
              },
              {
                label: 'Panel slots',
                value: '4 open',
                detail: 'Two staff interviewers still need to be assigned.',
              },
              {
                label: 'Source mix',
                value: 'Healthy',
                detail: 'Referral and outbound are both contributing this week.',
              },
            ].map((item) => (
              <Box
                key={item.label}
                style={{
                  minWidth: 0,
                  padding: '16px 18px',
                  borderRadius: 'var(--ds-border-radius-lg, 16px)',
                  background: PANEL_BACKGROUND,
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
        </Stack>
      </Card>

      <Box style={{ width: '100%', overflowX: 'auto' }}>
        <Flex
          gap={16}
          style={{
            minWidth: 980,
            padding: tokens.spacing[2],
            borderRadius: tokens.borderRadius.xl,
            background: `linear-gradient(180deg, ${SUBTLE_SURFACE}, ${SURFACE})`,
            border: `1px solid ${BORDER}`,
            boxShadow: PANEL_SHADOW,
          }}
        >
          {COLUMNS.map((column) => (
            <Box
              key={column.id}
              style={{
                flex: 1,
                minWidth: 230,
                borderRadius: tokens.borderRadius.xl,
                padding: tokens.spacing[3],
                background: `linear-gradient(180deg, ${column.color.replace('0.72', '0.18').replace('0.74', '0.18').replace('0.7', '0.18')}, transparent 36%), ${SUBTLE_SURFACE}`,
                border: `1px solid ${BORDER}`,
                boxShadow: PANEL_SHADOW,
              }}
            >
              <Stack spacing="sm">
                <Flex align="center" justify="between" gap={8}>
                  <Box>
                    <Flex align="center" gap={8}>
                      <Box
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: column.color,
                        }}
                      />
                      <Text size="sm" weight="semibold">
                        {column.title}
                      </Text>
                    </Flex>
                    <Text size="xs" style={{ marginTop: 4, color: TEXT_MUTED }}>
                      {column.focus}
                    </Text>
                    <Text size="xs" weight="semibold" style={{ marginTop: 6 }}>
                      {column.cadence}
                    </Text>
                  </Box>
                  <Badge variant="secondary" size="sm">
                    {column.candidates.length}
                  </Badge>
                </Flex>

                <Stack spacing="sm">
                  {column.candidates.map((candidate) => (
                    <CandidateItem key={candidate.id} candidate={candidate} />
                  ))}
                </Stack>
              </Stack>
            </Box>
          ))}
        </Flex>
      </Box>

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
            How recruiters read this board
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: tokens.spacing[3],
            }}
          >
            {[
              {
                title: 'Start with offer',
                detail: 'Close blockers first so approval and reference work never stall the week.',
              },
              {
                title: 'Check interview age',
                detail: 'Anything lingering in interview without written notes creates bad debrief quality.',
              },
              {
                title: 'Reset top-of-funnel',
                detail: 'If screening is thin, recruiters need source expansion before momentum disappears.',
              },
            ].map((item) => (
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
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}

export default PipelineKanbanDemo;
