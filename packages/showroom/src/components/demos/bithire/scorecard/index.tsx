'use client';

import { useState } from 'react';
import { useShowroomRuntime } from '@/components/showroom-context';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Stack,
  Text,
  Textarea,
  useTokens,
} from '@rottay/design-system';
import { StarIcon } from '@rottay/design-system/icons';

const SURFACE = 'var(--ds-color-bg-container, #ffffff)';
const ELEVATED_SURFACE = 'var(--ds-color-bg-elevated, #f8fafc)';
const BORDER = 'var(--ds-color-border, rgba(148, 163, 184, 0.28))';
const TEXT_SECONDARY = 'var(--ds-color-text-secondary)';
const TEXT_MUTED = 'var(--ds-color-text-muted)';
const CARD_SHADOW = 'var(--ds-shadow-lg, 0 20px 48px rgba(15, 23, 42, 0.1))';
const PANEL_SHADOW = 'var(--ds-shadow-md, 0 12px 28px rgba(15, 23, 42, 0.08))';
const PANEL_BACKGROUND = `linear-gradient(180deg, color-mix(in srgb, ${ELEVATED_SURFACE} 92%, ${SURFACE} 8%) 0%, ${SURFACE} 100%)`;

interface ScoringDimension {
  id: string;
  label: string;
  description: string;
}

const SCORING_DIMENSIONS: ScoringDimension[] = [
  { id: 'technical', label: 'Technical depth', description: 'Coding ability, architecture, and technical judgment' },
  { id: 'communication', label: 'Communication', description: 'Clarity, collaboration, and active listening' },
  { id: 'problem-solving', label: 'Problem solving', description: 'Analytical reasoning and solution shaping' },
  { id: 'product', label: 'Product sense', description: 'User empathy, tradeoffs, and partnership with PM/design' },
  { id: 'leadership', label: 'Leadership', description: 'Ownership, mentoring potential, and decision-making' },
];

const EVIDENCE_POINTS = [
  'Led a strong front-end architecture walkthrough with concrete migration tradeoffs.',
  'Paired effectively and narrated decisions without over-indexing on jargon.',
  'Needs a crisper articulation of long-horizon org design decisions.',
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
            color:
              star <= (hovered || value)
                ? 'rgba(99, 102, 241, 0.95)'
                : 'var(--ds-color-text-muted)',
            transition: 'color 150ms ease, transform 150ms ease',
            transform: star <= hovered ? 'scale(1.12)' : 'scale(1)',
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
    <Flex
      align="center"
      justify="between"
      style={{
        padding: '14px 0',
        borderBottom: `1px solid ${BORDER}`,
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <Box style={{ flex: '1 1 260px' }}>
        <Text size="sm" weight="semibold">
          {dimension.label}
        </Text>
        <Text size="xs" style={{ marginTop: 4, color: TEXT_MUTED }}>
          {dimension.description}
        </Text>
      </Box>
      <Flex align="center" gap={12}>
        <StarRating value={score} onChange={onScoreChange} />
        <Box style={{ width: 32, textAlign: 'center' }}>
          <Text
            size="sm"
            weight="bold"
            style={{
              color: score > 0 ? 'var(--ds-color-text-primary)' : TEXT_MUTED,
            }}
          >
            {score > 0 ? score : '-'}
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
}

function getOverallBadge(avg: number): { label: string; variant: 'success' | 'warning' | 'error' | 'primary' } {
  if (avg >= 4.4) return { label: 'Strong Hire', variant: 'success' };
  if (avg >= 3.6) return { label: 'Hire', variant: 'primary' };
  if (avg >= 2.6) return { label: 'Maybe', variant: 'warning' };
  return { label: 'No Hire', variant: 'error' };
}

export function ScorecardDemo() {
  const runtime = useShowroomRuntime();
  const tokens = useTokens();
  const [scores, setScores] = useState<Record<string, number>>({
    technical: 4,
    communication: 5,
    'problem-solving': 4,
    product: 3,
    leadership: 3,
  });
  const [notes, setNotes] = useState(
    'Strong technical background with excellent React and TypeScript judgment. ' +
      'Paired calmly, explained tradeoffs clearly, and handled stakeholder questions well.'
  );

  const scoredDimensions = Object.values(scores).filter((score) => score > 0);
  const avgScore =
    scoredDimensions.length > 0
      ? scoredDimensions.reduce((sum, score) => sum + score, 0) / scoredDimensions.length
      : 0;
  const overall = getOverallBadge(avgScore);

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
        <Flex align="start" justify="between" gap={16} style={{ flexWrap: 'wrap' }}>
          <Flex align="center" gap={16} style={{ flex: '1 1 320px', minWidth: 0 }}>
            <Avatar name="David Okafor" size="lg" shape="circle" />
            <Box style={{ minWidth: 0 }}>
              <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
                <Badge variant="primary">Interview packet</Badge>
                <Badge variant="secondary">{runtime.tenantName}</Badge>
              </Flex>
              <Text as={"h2" as any} size="xl" weight="bold" style={{ marginTop: 10 }}>
                David Okafor
              </Text>
              <Text size="sm" style={{ marginTop: 4, color: TEXT_SECONDARY }}>
                Staff Frontend Engineer candidate, round 3 technical loop
              </Text>
              <Text size="xs" style={{ marginTop: 6, color: TEXT_MUTED }}>
                April 15, 2026 · Interviewers: Sarah Chen, Marcus Rivera
              </Text>
            </Box>
          </Flex>

          <Box
            style={{
              minWidth: 220,
              padding: tokens.spacing[3],
              borderRadius: tokens.borderRadius.xl,
              background: PANEL_BACKGROUND,
              border: `1px solid ${BORDER}`,
              boxShadow: PANEL_SHADOW,
            }}
          >
            <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
              Current recommendation
            </Text>
            <Text size="2xl" weight="bold" style={{ marginTop: 6 }}>
              {avgScore > 0 ? avgScore.toFixed(1) : '-'}
            </Text>
            <Box style={{ marginTop: 8 }}>
              <Badge variant={overall.variant}>{overall.label}</Badge>
            </Box>
          </Box>
        </Flex>
      </Card>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(260px, 0.85fr)',
          gap: tokens.spacing[4],
          alignItems: 'start',
        }}
      >
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
              <Flex align="center" justify="between" style={{ gap: 8, flexWrap: 'wrap' }}>
                <Text as={"h3" as any} size="lg" weight="semibold">
                  Evaluation rubric
                </Text>
                <Text size="xs" style={{ color: TEXT_MUTED }}>
                  {scoredDimensions.length}/{SCORING_DIMENSIONS.length} dimensions rated
                </Text>
              </Flex>
              {SCORING_DIMENSIONS.map((dimension) => (
                <ScoreDimensionRow
                  key={dimension.id}
                  dimension={dimension}
                  score={scores[dimension.id] || 0}
                  onScoreChange={(value) =>
                    setScores((previous) => ({ ...previous, [dimension.id]: value }))
                  }
                />
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
            <Stack spacing="md">
              <Text as={"h3" as any} size="lg" weight="semibold">
                Interview notes
              </Text>
              <Textarea
                value={notes}
                onChange={(value) => setNotes(value)}
                rows={5}
                placeholder="Add your interview notes here..."
              />
            </Stack>
          </Card>
        </Stack>

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
              <Text as={"h3" as any} size="md" weight="semibold">
                Evidence highlights
              </Text>
              {EVIDENCE_POINTS.map((point) => (
                <Box
                  key={point}
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    background: SURFACE,
                    border: `1px solid ${BORDER}`,
                    boxShadow: PANEL_SHADOW,
                  }}
                >
                  <Text size="sm" style={{ color: TEXT_SECONDARY }}>
                    {point}
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
                Runtime expectation
              </Text>
              <Text size="sm" style={{ color: TEXT_SECONDARY }}>
                This scorecard should still feel intentional and premium when
                Platform or Evnto is active. The mood can change, but the
                scoring clarity cannot.
              </Text>
            </Stack>
          </Card>
        </Stack>
      </Box>

      <Flex gap={12} justify="end">
        <Button variant="default">Save draft</Button>
        <Button variant="primary">Submit scorecard</Button>
      </Flex>
    </Stack>
  );
}

export default ScorecardDemo;
