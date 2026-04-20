'use client';

import { useState } from 'react';
import { Box, Flex, Stack, Text, Card, Badge, Avatar } from '@rottay/design-system';

interface CandidateCard {
  id: string;
  name: string;
  role: string;
  daysInStage: number;
  matchScore: number;
  avatar?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  candidates: CandidateCard[];
}

const INITIAL_COLUMNS: KanbanColumn[] = [
  {
    id: 'applied',
    title: 'Applied',
    color: '#6366f1',
    candidates: [
      { id: '1', name: 'Sarah Chen', role: 'Senior Frontend Engineer', daysInStage: 2, matchScore: 92 },
      { id: '2', name: 'Marcus Rivera', role: 'Backend Developer', daysInStage: 1, matchScore: 87 },
      { id: '3', name: 'Aisha Patel', role: 'Full Stack Developer', daysInStage: 3, matchScore: 78 },
    ],
  },
  {
    id: 'screening',
    title: 'Screening',
    color: '#8b5cf6',
    candidates: [
      { id: '4', name: 'James Wu', role: 'DevOps Engineer', daysInStage: 4, matchScore: 95 },
      { id: '5', name: 'Elena Kowalski', role: 'Senior Frontend Engineer', daysInStage: 6, matchScore: 88 },
    ],
  },
  {
    id: 'interview',
    title: 'Interview',
    color: '#a78bfa',
    candidates: [
      { id: '6', name: 'David Okafor', role: 'Tech Lead', daysInStage: 3, matchScore: 91 },
      { id: '7', name: 'Lina Zhang', role: 'Backend Developer', daysInStage: 5, matchScore: 84 },
      { id: '8', name: 'Tom Bergstrom', role: 'Full Stack Developer', daysInStage: 7, matchScore: 90 },
    ],
  },
  {
    id: 'offer',
    title: 'Offer',
    color: '#c4b5fd',
    candidates: [
      { id: '9', name: 'Priya Sharma', role: 'Senior Frontend Engineer', daysInStage: 2, matchScore: 96 },
      { id: '10', name: 'Carlos Mendez', role: 'DevOps Engineer', daysInStage: 1, matchScore: 93 },
    ],
  },
];

function getScoreBadgeVariant(score: number): 'success' | 'warning' | 'error' | 'primary' {
  if (score >= 90) return 'success';
  if (score >= 80) return 'primary';
  if (score >= 70) return 'warning';
  return 'error';
}

function CandidateItem({ candidate }: { candidate: CandidateCard }) {
  return (
    <Card
      style={{
        marginBottom: 8,
        cursor: 'grab',
        transition: 'box-shadow 150ms ease, transform 150ms ease',
      }}
      hoverable
    >
      <Stack spacing="sm">
        <Flex align="center" gap={8}>
          <Avatar name={candidate.name} size="sm" shape="circle" />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text size="sm" weight="semibold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {candidate.name}
            </Text>
          </Box>
        </Flex>
        <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
          {candidate.role}
        </Text>
        <Flex align="center" justify="between">
          <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
            {candidate.daysInStage}d in stage
          </Text>
          <Badge variant={getScoreBadgeVariant(candidate.matchScore)} size="sm">
            {candidate.matchScore}%
          </Badge>
        </Flex>
      </Stack>
    </Card>
  );
}

export function PipelineKanbanDemo() {
  const [columns] = useState<KanbanColumn[]>(INITIAL_COLUMNS);

  return (
    <Box style={{ width: '100%', overflowX: 'auto' }}>
      <Flex gap={16} style={{ minWidth: 900, padding: '4px 0' }}>
        {columns.map((column) => (
          <Box
            key={column.id}
            style={{
              flex: 1,
              minWidth: 220,
              background: 'var(--ds-color-neutral-50)',
              borderRadius: 12,
              padding: 12,
            }}
          >
            <Flex align="center" justify="between" style={{ marginBottom: 12 }}>
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
              <Badge variant="default" size="sm">
                {column.candidates.length}
              </Badge>
            </Flex>
            <Stack spacing="xs">
              {column.candidates.map((candidate) => (
                <CandidateItem key={candidate.id} candidate={candidate} />
              ))}
            </Stack>
          </Box>
        ))}
      </Flex>
    </Box>
  );
}

export default PipelineKanbanDemo;
