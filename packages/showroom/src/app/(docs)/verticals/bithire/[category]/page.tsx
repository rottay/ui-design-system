'use client';

import { use } from 'react';
import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge, DesignSystemProvider } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import { ChevronLeftIcon } from '@rottay/design-system/icons';

interface DemoItem {
  title: string;
  description: string;
  components: string[];
}

const BITHIRE_DEMOS: Record<string, { label: string; demos: DemoItem[] }> = {
  pipeline: {
    label: 'Pipeline',
    demos: [
      {
        title: 'Pipeline Kanban',
        description: 'Drag-and-drop kanban board with stage columns, candidate cards, and quick actions.',
        components: ['PatternKanbanBoard', 'Card', 'Avatar', 'Badge', 'Dropdown'],
      },
      {
        title: 'Pipeline Table',
        description: 'List view of pipeline with sortable columns, inline status updates, and bulk moves.',
        components: ['PatternDataTable', 'CollectionHeader', 'Select', 'Badge', 'Button'],
      },
      {
        title: 'Stage Manager',
        description: 'Pipeline stage configuration with ordering, automation rules, and SLA settings.',
        components: ['FormBuilder', 'Stepper', 'Switch', 'Input', 'Card'],
      },
      {
        title: 'Candidate Quick View',
        description: 'Slide-over panel showing candidate resume, notes, and action history.',
        components: ['Drawer', 'Tabs', 'Timeline', 'Avatar', 'Button'],
      },
    ],
  },
  interviews: {
    label: 'Interviews',
    demos: [
      {
        title: 'Interview Calendar',
        description: 'Weekly calendar view with interview slots, availability, and conflict detection.',
        components: ['Calendar', 'Card', 'Badge', 'Tooltip', 'Avatar'],
      },
      {
        title: 'Scorecard Builder',
        description: 'Structured interview scorecard with rating criteria and weighted scoring.',
        components: ['FormBuilder', 'Rate', 'Slider', 'Textarea', 'Card'],
      },
      {
        title: 'Feedback Summary',
        description: 'Consolidated interview feedback with interviewer scores and decision recommendations.',
        components: ['Table', 'Avatar', 'Rate', 'Badge', 'Statistic'],
      },
    ],
  },
  'ai-agents': {
    label: 'AI Agents',
    demos: [
      {
        title: 'Sourcing Agent',
        description: 'AI agent dashboard showing search queries, matched candidates, and confidence scores.',
        components: ['Card', 'Progress', 'Badge', 'Statistic', 'Table'],
      },
      {
        title: 'Resume Screener',
        description: 'Automated resume analysis with skill extraction, scoring, and recommendation rationale.',
        components: ['Card', 'Tag', 'Progress', 'Text', 'Tooltip'],
      },
      {
        title: 'Match Engine',
        description: 'Candidate-to-role matching interface with similarity scores and skill gap analysis.',
        components: ['Table', 'Progress', 'Tag', 'RadarChart', 'Badge'],
      },
    ],
  },
  positions: {
    label: 'Positions',
    demos: [
      {
        title: 'Position List',
        description: 'Job posting directory with status filters, applicant counts, and quick edit.',
        components: ['PatternDataTable', 'CollectionHeader', 'Badge', 'Tag', 'Button'],
      },
      {
        title: 'Position Editor',
        description: 'Rich text job description editor with requirements, benefits, and preview mode.',
        components: ['FormBuilder', 'Textarea', 'Tag', 'Tabs', 'Button'],
      },
      {
        title: 'Approval Workflow',
        description: 'Position approval chain with reviewer assignments and status tracking.',
        components: ['Steps', 'Avatar', 'Badge', 'Timeline', 'Button'],
      },
    ],
  },
  analytics: {
    label: 'Analytics',
    demos: [
      {
        title: 'Hiring Funnel',
        description: 'Conversion funnel from application to offer with stage-by-stage dropout rates.',
        components: ['FunnelChart', 'Statistic', 'Card', 'Badge', 'Text'],
      },
      {
        title: 'Time-to-Hire',
        description: 'Historical time-to-hire trends with breakdowns by department and role level.',
        components: ['LineChart', 'StatsHeader', 'Select', 'Card', 'Text'],
      },
      {
        title: 'Source Effectiveness',
        description: 'Recruiting source comparison with cost-per-hire and quality metrics.',
        components: ['BarChart', 'Table', 'Statistic', 'Badge', 'Card'],
      },
      {
        title: 'Diversity Dashboard',
        description: 'Diversity metrics across pipeline stages with goal tracking and trend lines.',
        components: ['PieChart', 'BarChart', 'Progress', 'Statistic', 'Card'],
      },
    ],
  },
  teams: {
    label: 'Teams',
    demos: [
      {
        title: 'Team Directory',
        description: 'Hiring team roster with roles, interview capacity, and performance stats.',
        components: ['PatternDataTable', 'Avatar', 'Badge', 'Statistic', 'Tag'],
      },
      {
        title: 'Interviewer Pool',
        description: 'Available interviewer matrix with skills, availability, and utilization rates.',
        components: ['Table', 'Avatar', 'Tag', 'Progress', 'Badge'],
      },
      {
        title: 'Workload Balance',
        description: 'Team workload visualization with interview counts and rebalancing suggestions.',
        components: ['BarChart', 'Card', 'Avatar', 'Progress', 'Button'],
      },
    ],
  },
  workflows: {
    label: 'Workflows',
    demos: [
      {
        title: 'Workflow Builder',
        description: 'Visual workflow editor with drag-and-drop stages, conditions, and action nodes.',
        components: ['Card', 'Select', 'Input', 'Button', 'Badge'],
      },
      {
        title: 'Stage Transitions',
        description: 'Configurable stage transition rules with guard conditions and auto-actions.',
        components: ['FormBuilder', 'Select', 'Switch', 'Tag', 'Card'],
      },
      {
        title: 'Notification Rules',
        description: 'Event-driven notification configuration with templates and channel routing.',
        components: ['Table', 'Switch', 'Select', 'Badge', 'Tag'],
      },
    ],
  },
};

function BitHireCategoryContent({ category }: { category: string }) {
  const tokens = useTokens();
  const data = BITHIRE_DEMOS[category];

  if (!data) {
    return (
      <Stack spacing="md">
        <Link href="/verticals/bithire" style={{ textDecoration: 'none' }}>
          <Flex align="center" gap={4}>
            <ChevronLeftIcon size={16} />
            <Text size="sm" color="primary">Back to BitHire</Text>
          </Flex>
        </Link>
        <Text as={"h1" as any} size="2xl" weight="bold">
          Category not found
        </Text>
        <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
          The category &quot;{category}&quot; does not exist in the BitHire vertical.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack spacing="lg">
      {/* Back link + header */}
      <Box>
        <Link href="/verticals/bithire" style={{ textDecoration: 'none' }}>
          <Flex align="center" gap={4} style={{ marginBottom: tokens.spacing[3] }}>
            <ChevronLeftIcon size={16} />
            <Text size="sm" color="primary">Back to BitHire</Text>
          </Flex>
        </Link>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            {data.label}
          </Text>
          <Badge variant="primary">{data.demos.length} demos</Badge>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            BitHire {data.label.toLowerCase()} demos rendered with the
            modern engine and bithire theme.
          </Text>
        </Box>
      </Box>

      {/* Demo cards */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: tokens.spacing[5],
        }}
      >
        {data.demos.map((demo) => (
          <Card
            key={demo.title}
            style={{ height: '100%' }}
          >
            <Stack spacing="md">
              <Box>
                <Text as={"h3" as any} size="lg" weight="semibold">
                  {demo.title}
                </Text>
                <Box style={{ marginTop: tokens.spacing[1] }}>
                  <Text
                    size="sm"
                    style={{ color: 'var(--ds-color-text-secondary)' }}
                  >
                    {demo.description}
                  </Text>
                </Box>
              </Box>

              {/* Placeholder preview */}
              <Box
                style={{
                  height: 120,
                  borderRadius: tokens.borderRadius.md,
                  background: 'var(--ds-color-neutral-50)',
                  border: '1px dashed var(--ds-color-neutral-300)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  size="xs"
                  style={{ color: 'var(--ds-color-text-muted)' }}
                >
                  Demo preview placeholder
                </Text>
              </Box>

              {/* Component tags */}
              <Flex gap={4} style={{ flexWrap: 'wrap' }}>
                {demo.components.map((name) => (
                  <Box
                    key={name}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: 'var(--ds-color-neutral-100)',
                      fontSize: '0.75rem',
                      color: 'var(--ds-color-text-secondary)',
                      fontFamily: 'var(--font-geist-mono)',
                    }}
                  >
                    {name}
                  </Box>
                ))}
              </Flex>
            </Stack>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}

export default function BitHireCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);

  return (
    <DesignSystemProvider tenantSlug="bithire" forceEngine="modern">
      <BitHireCategoryContent category={category} />
    </DesignSystemProvider>
  );
}
