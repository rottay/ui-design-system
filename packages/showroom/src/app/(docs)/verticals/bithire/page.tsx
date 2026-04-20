'use client';

import { Box, Flex, Stack, Text, Card, Badge, DesignSystemProvider } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import { PipelineKanbanDemo } from '@/components/demos/bithire/pipeline-kanban';
import { RecruiterDashboardDemo } from '@/components/demos/bithire/recruiter-dashboard';
import { ScorecardDemo } from '@/components/demos/bithire/scorecard';

function BitHireContent() {
  const tokens = useTokens();

  return (
    <Stack spacing="lg">
      {/* Page header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            BitHire
          </Text>
          <Badge variant="primary">3 live demos</Badge>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text
            size="md"
            style={{ color: 'var(--ds-color-text-secondary)' }}
          >
            AI-powered recruiting and talent acquisition. These demos render
            with the modern engine, bithire theme, and comfortable density --
            matching the production BitHire experience.
          </Text>
        </Box>
      </Box>

      {/* Config bar */}
      <Flex gap={12} style={{ flexWrap: 'wrap' }}>
        {[
          { label: 'Engine', value: 'modern' },
          { label: 'Theme', value: 'bithire' },
          { label: 'Density', value: 'comfortable' },
          { label: 'Vertical', value: 'bithire' },
        ].map((tag) => (
          <Flex
            key={tag.label}
            align="center"
            gap={6}
            style={{
              padding: '4px 12px',
              borderRadius: 6,
              background: 'var(--ds-color-neutral-100)',
              border: '1px solid var(--ds-color-neutral-200)',
            }}
          >
            <Text
              size="xs"
              style={{ color: 'var(--ds-color-text-muted)' }}
            >
              {tag.label}:
            </Text>
            <Text size="xs" weight="semibold">
              {tag.value}
            </Text>
          </Flex>
        ))}
      </Flex>

      {/* Demo 1: Pipeline Kanban */}
      <Box>
        <Card>
          <Stack spacing="md">
            <Flex align="center" justify="between">
              <Box>
                <Text as={"h2" as any} size="xl" weight="semibold">
                  Candidate Pipeline
                </Text>
                <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                  Kanban board with drag-ready candidate cards across hiring stages
                </Text>
              </Box>
              <Badge variant="primary">Pipeline</Badge>
            </Flex>
            <Box
              style={{
                padding: 16,
                borderRadius: tokens.borderRadius.md,
                background: 'var(--ds-color-neutral-25, var(--ds-color-neutral-50))',
                border: '1px solid var(--ds-color-neutral-100)',
              }}
            >
              <PipelineKanbanDemo />
            </Box>
          </Stack>
        </Card>
      </Box>

      {/* Demo 2: Recruiter Dashboard */}
      <Box>
        <Card>
          <Stack spacing="md">
            <Flex align="center" justify="between">
              <Box>
                <Text as={"h2" as any} size="xl" weight="semibold">
                  Recruiter Dashboard
                </Text>
                <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                  Analytics overview with KPIs, hiring trends, and skill demand radar
                </Text>
              </Box>
              <Badge variant="primary">Analytics</Badge>
            </Flex>
            <Box
              style={{
                padding: 16,
                borderRadius: tokens.borderRadius.md,
                background: 'var(--ds-color-neutral-25, var(--ds-color-neutral-50))',
                border: '1px solid var(--ds-color-neutral-100)',
              }}
            >
              <RecruiterDashboardDemo />
            </Box>
          </Stack>
        </Card>
      </Box>

      {/* Demo 3: Interview Scorecard */}
      <Box>
        <Card>
          <Stack spacing="md">
            <Flex align="center" justify="between">
              <Box>
                <Text as={"h2" as any} size="xl" weight="semibold">
                  Interview Scorecard
                </Text>
                <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                  Structured evaluation form with star ratings and notes
                </Text>
              </Box>
              <Badge variant="primary">Interviews</Badge>
            </Flex>
            <Box
              style={{
                padding: 16,
                borderRadius: tokens.borderRadius.md,
                background: 'var(--ds-color-neutral-25, var(--ds-color-neutral-50))',
                border: '1px solid var(--ds-color-neutral-100)',
              }}
            >
              <ScorecardDemo />
            </Box>
          </Stack>
        </Card>
      </Box>
    </Stack>
  );
}

export default function BitHirePage() {
  return (
    <DesignSystemProvider tenantSlug="bithire" forceEngine="modern">
      <BitHireContent />
    </DesignSystemProvider>
  );
}
