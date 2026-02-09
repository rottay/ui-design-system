'use client';

/**
 * BhSkillGapMap - List Preset
 * Premium gap list with heatmap-style skill bars, severity indicators,
 * category badges, summary counters, and recommendation callouts.
 */

import { useState, useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { BhSkillGapMapProps, SkillGapItem } from '../../core';
import { getPriorityColors } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createListItemStyle,
  createProgressBarStyle,
  createBadgeStyle,
  createAccentBarStyle,
  createHoverStyle,
  getHoverTransform,
  getCardHoverShadow,
  createStatusDotStyle,
  createSectionHeaderStyle,
} from '../../../helpers';

/* ------------------------------------------------------------------ */
/*  Child component to avoid useMemo inside .map() callback           */
/* ------------------------------------------------------------------ */
function GapRow({
  gap,
  tokens,
  engine,
  priorityColors,
  onGapSelect,
  primitives,
}: {
  gap: SkillGapItem;
  tokens: any;
  engine: string;
  priorityColors: ReturnType<typeof getPriorityColors>;
  onGapSelect?: (id: string) => void;
  primitives: any;
}) {
  const { Box, Flex, Text } = primitives;
  const [hovered, setHovered] = useState(false);

  const pc = priorityColors[gap.priority];
  const pct = gap.requiredLevel > 0 ? Math.round((gap.currentLevel / gap.requiredLevel) * 100) : 0;
  const barColor = pct >= 70
    ? tokens.colors.successScale[500]
    : pct >= 40
      ? tokens.colors.warningScale[500]
      : tokens.colors.errorScale[500];

  const progressStyles = useMemo(
    () => createProgressBarStyle(tokens, { color: barColor, percent: pct }),
    [tokens, barColor, pct],
  );

  const rowStyle = useMemo(() => ({
    ...createListItemStyle(tokens, { interactive: !!onGapSelect }),
    borderLeft: `3px solid ${pc.color}`,
    ...(hovered
      ? {
          backgroundColor: tokens.colors.neutral[50],
          boxShadow: getCardHoverShadow(tokens),
          ...getHoverTransform(tokens),
        }
      : {}),
  }), [tokens, onGapSelect, pc.color, hovered]);

  const codeBadgeStyle = useMemo(
    () => createBadgeStyle(tokens, 'secondary'),
    [tokens],
  );

  return (
    <Box
      onClick={() => onGapSelect?.(gap.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={rowStyle}
    >
      {/* Top row: dimension + priority badge */}
      <Flex justify="between" align="center" style={{ marginBottom: tokens.spacing[1] }}>
        <Flex gap={6} align="center">
          <Box style={codeBadgeStyle}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.secondaryScale[700] }}>
              {gap.dimensionCode}
            </Text>
          </Box>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
            {gap.dimension}
          </Text>
        </Flex>
        <Box style={{
          padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`,
          borderRadius: tokens.borderRadius.full,
          background: pc.bgColor,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${pc.border}`,
        }}>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: pc.color, textTransform: 'capitalize' as const }}>
            {gap.priority}
          </Text>
        </Box>
      </Flex>

      {/* Skill level bar */}
      <Flex gap={8} align="center" style={{ marginBottom: tokens.spacing[1] }}>
        <Box style={{ flex: 1, ...progressStyles.track }}>
          <div style={progressStyles.fill} />
        </Box>
        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[600], minWidth: 36, textAlign: 'right' as const }}>
          {gap.currentLevel}/{gap.requiredLevel}
        </Text>
      </Flex>

      {/* Bottom row: candidate count + gap size */}
      <Flex justify="between" align="center">
        <Flex gap={8} align="center">
          <Flex gap={4} align="center">
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
              Gap:
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: pc.color }}>
              {gap.gapSize}
            </Text>
          </Flex>
          <Box style={{
            ...createBadgeStyle(tokens, 'info'),
            padding: `0 ${tokens.spacing[1]}px`,
          }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.infoScale[700] }}>
              {gap.candidateCount} candidates
            </Text>
          </Box>
        </Flex>
      </Flex>

      {/* Recommendation callout */}
      {gap.recommendation && (
        <Box style={{
          marginTop: tokens.spacing[2],
          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
          borderRadius: tokens.borderRadius.md,
          background: tokens.colors.infoScale[50],
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[200]}`,
        }}>
          <Flex gap={6} align="start">
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.infoScale[600], flexShrink: 0, lineHeight: 1.5 }}>
              i
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.infoScale[700], lineHeight: 1.5 }}>
              {gap.recommendation}
            </Text>
          </Flex>
        </Box>
      )}
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Main preset                                                       */
/* ------------------------------------------------------------------ */
export const ListBhSkillGapMap = createPreset<BhSkillGapMapProps>({
  name: 'BhSkillGapMap.List',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhSkillGapMapProps>) => {
    const { Box, Flex, Stack, Text, Spinner } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;
    const priorityColors = getPriorityColors(tokens);

    const { gaps, onGapSelect, loading, className, style } = props;

    /* Priority summary counts */
    const summaryCounts = useMemo(() => {
      const counts = { critical: 0, high: 0, medium: 0, low: 0 };
      gaps.forEach(g => { counts[g.priority]++; });
      return counts;
    }, [gaps]);

    const cardStyle = useMemo(() => ({
      ...createCardStyle(tokens, { glass: isGlass, padding: 0 }),
      overflow: 'hidden' as const,
      ...style,
    }), [tokens, isGlass, style]);

    if (loading) {
      return (
        <Flex align="center" justify="center" direction="column" gap={8} style={{ padding: tokens.spacing[8], ...style }} className={className}>
          <Spinner size="sm" />
          <Text style={{ color: tokens.colors.neutral[500], fontSize: tokens.typography.fontSize.xs }}>
            Loading skill gaps...
          </Text>
        </Flex>
      );
    }

    return (
      <Box className={className} style={cardStyle}>
        {/* Accent bar */}
        <div style={createAccentBarStyle(tokens, { position: 'top' })} />

        {/* Header */}
        <Box style={createPanelHeaderStyle(tokens)}>
          <Flex justify="between" align="center">
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
              Skill Gaps ({gaps.length})
            </Text>
          </Flex>
        </Box>

        {/* Summary counters */}
        <Flex gap={12} align="center" style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
          {((['critical', 'high', 'medium', 'low'] as const).map(p => (
            <Flex key={p} gap={4} align="center">
              <Box style={createStatusDotStyle(tokens, priorityColors[p].color)} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], textTransform: 'capitalize' as const }}>
                {p}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: priorityColors[p].color }}>
                {summaryCounts[p]}
              </Text>
            </Flex>
          )))}
        </Flex>

        {/* Gap rows */}
        <Stack gap={0} style={{ maxHeight: 400, overflowY: 'auto' as const }}>
          {gaps.map(gap => (
            <GapRow
              key={gap.id}
              gap={gap}
              tokens={tokens}
              engine={engine}
              priorityColors={priorityColors}
              onGapSelect={onGapSelect}
              primitives={primitives}
            />
          ))}
        </Stack>
      </Box>
    );
  },
});
