'use client';

import { use } from 'react';
import { ShowroomLink as Link } from '@/components/showroom-link';
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { ChevronLeftIcon } from '@rottay/design-system/icons';
import {
  VerticalCategoryAppendix,
  type VerticalDemoItem,
} from '../../vertical-category-appendix';

interface CategoryData {
  label: string;
  summary: string;
  operators: string[];
  tempo: string;
  principles: string[];
  demos: VerticalDemoItem[];
}

const BITHIRE_DEMOS: Record<string, CategoryData> = {
  pipeline: {
    label: 'Pipeline',
    summary:
      'Pipeline surfaces are the operating room of BitHire. They make movement, prioritization, and candidate momentum visible to recruiters at a glance.',
    operators: ['Recruiters', 'Hiring leads', 'Talent ops'],
    tempo: 'High-frequency triage and movement',
    principles: [
      'Stage progression should feel spatial and obvious.',
      'Signal density matters more than ornamental chrome.',
      'Quick actions should keep momentum high.',
    ],
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
    summary:
      'Interview tooling turns subjective conversations into structured, comparable signal without slowing teams down.',
    operators: ['Interviewers', 'Recruiters', 'Hiring managers'],
    tempo: 'Structured evaluation checkpoints',
    principles: [
      'Capture evidence close to the moment.',
      'Keep criteria legible and weighted.',
      'Make feedback easy to consolidate.',
    ],
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
    summary:
      'AI agent surfaces should feel like explainable copilots, not black boxes. They accelerate sourcing and screening while preserving human judgment.',
    operators: ['Recruiters', 'Talent intelligence', 'Hiring leads'],
    tempo: 'Assistive and insight-driven',
    principles: [
      'Show rationale next to recommendations.',
      'Balance confidence scores with human override.',
      'Keep AI suggestions actionable, not abstract.',
    ],
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
    summary:
      'Position management frames the work before candidates ever arrive. These views define role quality, approvals, and hiring readiness.',
    operators: ['Recruiters', 'Hiring managers', 'People ops'],
    tempo: 'Planned setup with approval loops',
    principles: [
      'Clarify scope before publishing.',
      'Separate approval status from editing state.',
      'Keep requirements and incentives readable.',
    ],
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
    summary:
      'Analytics views turn recruiting into a measurable system, making funnel quality, speed, and fairness visible across the hiring process.',
    operators: ['Leads', 'Ops analysts', 'Executives'],
    tempo: 'Review and decision support',
    principles: [
      'Lead with trend direction, not raw chart novelty.',
      'Keep comparison surfaces easy to scan.',
      'Tie insights back to action.',
    ],
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
    summary:
      'Team views ensure recruiting effort stays balanced across recruiters and interviewers instead of overloading a few people invisibly.',
    operators: ['Talent ops', 'Recruiting leads', 'Coordinators'],
    tempo: 'Capacity planning and balancing',
    principles: [
      'Show current load before assignment.',
      'Make utilization visible and comparable.',
      'Support redistribution without losing context.',
    ],
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
    summary:
      'Workflow tooling scales recruiting operations by encoding repeatable transitions, notifications, and automation rules directly into the product.',
    operators: ['Talent ops', 'Recruiters', 'Admins'],
    tempo: 'Rule-based process optimization',
    principles: [
      'Make automations inspectable.',
      'Keep transition logic discoverable.',
      'Treat notifications as part of the workflow, not an afterthought.',
    ],
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
  const data = BITHIRE_DEMOS[category];

  if (!data) {
    return (
      <Stack spacing="lg" fullWidth>
        <Link href="/verticals/bithire" style={{ textDecoration: 'none' }}>
          <Flex align="center" gap={4}>
            <ChevronLeftIcon size={16} />
            <Text size="sm" color="primary">Back to BitHire</Text>
          </Flex>
        </Link>
        <Card
          style={{
            padding: 'var(--ds-spacing-5, 20px)',
            border: '1px solid var(--ds-color-border, rgba(148, 163, 184, 0.28))',
            background:
              'linear-gradient(180deg, rgba(99, 102, 241, 0.08), transparent 36%), var(--ds-color-bg-container, #ffffff)',
          }}
        >
          <Stack spacing="md">
            <Badge variant="secondary">Unknown category</Badge>
            <Box>
              <Text
                as={"h1" as any}
                size="2xl"
                weight="bold"
                style={{ display: 'block' }}
              >
                Category not found
              </Text>
              <Text
                size="md"
                style={{
                  display: 'block',
                  marginTop: 8,
                  color: 'var(--ds-color-text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                The category &quot;{category}&quot; does not exist in the BitHire vertical.
              </Text>
            </Box>
            <Box
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--ds-border-radius-lg, 16px)',
                background: 'var(--ds-color-bg-secondary, #f1f5f9)',
                border: '1px solid var(--ds-color-border, rgba(148, 163, 184, 0.28))',
              }}
            >
              <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.5 }}>
                Open the parent vertical to pick a supported recruiting lane and inspect the live showcase from there.
              </Text>
            </Box>
          </Stack>
        </Card>
      </Stack>
    );
  }

  return (
    <VerticalCategoryAppendix
      backHref="/verticals/bithire"
      backLabel="Back to BitHire"
      label={data.label}
      headline={`${data.label} in BitHire is built for speed, visibility, and decision support.`}
      summary={`${data.summary} These scenarios stay BitHire-specific in workflow and copy, but the live visuals should still come from the active docs runtime instead of a local preset.`}
      operators={data.operators}
      tempo={data.tempo}
      principles={data.principles}
      demos={data.demos}
    />
  );
}

export default function BitHireCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);

  return <BitHireCategoryContent category={category} />;
}
