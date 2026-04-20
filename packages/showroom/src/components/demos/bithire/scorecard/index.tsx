'use client';

import { useState } from 'react';
import { Box, Flex, Stack, Text, Card, Badge, Avatar, Button, Textarea } from '@rottay/design-system';
import { StarIcon } from '@rottay/design-system/icons';

interface ScoringDimension {
  id: string;
  label: string;
  description: string;
}

const SCORING_DIMENSIONS: ScoringDimension[] = [
  { id: 'technical', label: 'Technical Skills', description: 'Coding ability, system design, domain knowledge' },
  { id: 'communication', label: 'Communication', description: 'Clarity of expression, active listening, collaboration' },
  { id: 'problem-solving', label: 'Problem Solving', description: 'Analytical thinking, creativity, approach to challenges' },
  { id: 'culture-fit', label: 'Culture Fit', description: 'Values alignment, teamwork, adaptability' },
  { id: 'leadership', label: 'Leadership', description: 'Initiative, mentoring potential, decision-making' },
];

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <Flex gap={4}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Box
          key={star}
          style={{
            cursor: 'pointer',
            color: star <= (hovered || value) ? '#6366f1' : 'var(--ds-color-neutral-300)',
            transition: 'color 150ms ease, transform 150ms ease',
            transform: star <= hovered ? 'scale(1.15)' : 'scale(1)',
          }}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          <StarIcon size={22} />
        </Box>
      ))}
    </Flex>
  );
}

function ScoreDimensionRow({
  dimension,
  score,
  onScoreChange,
}: {
  dimension: ScoringDimension;
  score: number;
  onScoreChange: (value: number) => void;
}) {
  return (
    <Flex align="center" justify="between" style={{ padding: '12px 0', borderBottom: '1px solid var(--ds-color-neutral-100)' }}>
      <Box style={{ flex: 1 }}>
        <Text size="sm" weight="semibold">
          {dimension.label}
        </Text>
        <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
          {dimension.description}
        </Text>
      </Box>
      <Flex align="center" gap={12}>
        <StarRating value={score} onChange={onScoreChange} />
        <Box style={{ width: 32, textAlign: 'center' }}>
          <Text size="sm" weight="bold" style={{ color: score > 0 ? 'var(--ds-color-primary)' : 'var(--ds-color-text-muted)' }}>
            {score > 0 ? score : '-'}
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
}

function getOverallBadge(avg: number): { label: string; variant: 'success' | 'warning' | 'error' | 'primary' } {
  if (avg >= 4.5) return { label: 'Strong Hire', variant: 'success' };
  if (avg >= 3.5) return { label: 'Hire', variant: 'primary' };
  if (avg >= 2.5) return { label: 'Maybe', variant: 'warning' };
  return { label: 'No Hire', variant: 'error' };
}

export function ScorecardDemo() {
  const [scores, setScores] = useState<Record<string, number>>({
    technical: 4,
    communication: 5,
    'problem-solving': 3,
    'culture-fit': 4,
    leadership: 3,
  });
  const [notes, setNotes] = useState(
    'Strong technical background with excellent React and TypeScript knowledge. ' +
    'Good communication during pair programming exercise. Could improve on system design explanations.'
  );

  const scoredDimensions = Object.values(scores).filter((s) => s > 0);
  const avgScore = scoredDimensions.length > 0
    ? scoredDimensions.reduce((a, b) => a + b, 0) / scoredDimensions.length
    : 0;
  const overall = getOverallBadge(avgScore);

  return (
    <Stack spacing="lg">
      {/* Candidate Header */}
      <Card>
        <Flex align="center" gap={16}>
          <Avatar name="David Okafor" size="lg" shape="circle" />
          <Box style={{ flex: 1 }}>
            <Text as={"h2" as any} size="xl" weight="bold">
              David Okafor
            </Text>
            <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
              Tech Lead - Engineering
            </Text>
            <Flex align="center" gap={8} style={{ marginTop: 4 }}>
              <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
                Interview Date: April 15, 2026
              </Text>
              <Badge variant="primary" size="sm">Round 3 - Technical</Badge>
            </Flex>
          </Box>
          <Box style={{ textAlign: 'center' }}>
            <Text size="xs" style={{ color: 'var(--ds-color-text-muted)', marginBottom: 4, display: 'block' }}>
              Overall
            </Text>
            <Text size="2xl" weight="bold" style={{ color: 'var(--ds-color-primary)' }}>
              {avgScore > 0 ? avgScore.toFixed(1) : '-'}
            </Text>
            <Box style={{ marginTop: 4 }}>
              <Badge variant={overall.variant}>{overall.label}</Badge>
            </Box>
          </Box>
        </Flex>
      </Card>

      {/* Scoring Dimensions */}
      <Card>
        <Stack spacing="sm">
          <Flex align="center" justify="between" style={{ marginBottom: 8 }}>
            <Text as={"h3" as any} size="lg" weight="semibold">
              Evaluation
            </Text>
            <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
              {scoredDimensions.length}/{SCORING_DIMENSIONS.length} dimensions rated
            </Text>
          </Flex>
          {SCORING_DIMENSIONS.map((dim) => (
            <ScoreDimensionRow
              key={dim.id}
              dimension={dim}
              score={scores[dim.id] || 0}
              onScoreChange={(value) => setScores((prev) => ({ ...prev, [dim.id]: value }))}
            />
          ))}
        </Stack>
      </Card>

      {/* Notes */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            Interview Notes
          </Text>
          <Textarea
            value={notes}
            onChange={(value) => setNotes(value)}
            rows={4}
            placeholder="Add your interview notes here..."
            autoSize={{ minRows: 3, maxRows: 8 }}
          />
        </Stack>
      </Card>

      {/* Action Buttons */}
      <Flex gap={12} justify="end">
        <Button variant="default">Save Draft</Button>
        <Button variant="primary">Submit Scorecard</Button>
      </Flex>
    </Stack>
  );
}

export default ScorecardDemo;
