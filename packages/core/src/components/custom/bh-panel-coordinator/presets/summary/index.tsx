'use client';

/**
 * BhPanelCoordinator - Summary Preset
 * Condensed consensus view with score aggregation
 */

import { useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { BhPanelCoordinatorProps, InterviewStage, PanelMember } from '../../core';
import { getRecommendationColors, getStageStatusColors, getRecommendationLabel, getAggregationLabel } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createListItemStyle,
  createStatusDotStyle,
  createFilterPillStyle,
  createEntranceAnimation,
  createStaggerDelay,

  createPersonalityAccentBar,
  createCardHoverStyles,
  getPersonalityTypography,
  createDividerStyle,
  createPersonalitySectionHeaderStyle,
  createEmptyStateStyle,
} from '../../../helpers';

export const SummaryBhPanelCoordinator = createPreset<BhPanelCoordinatorProps>({
  name: 'BhPanelCoordinator.Summary',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhPanelCoordinatorProps>) => {
    const { Box, Flex, Stack, Text } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const recColors = getRecommendationColors(tokens);
    const stageColors = getStageStatusColors(tokens);

    const { stages: rawStages = [], members: rawMembers = [], consensus, candidateName, positionTitle, loading, className, style } = props;

    const stages = Array.isArray(rawStages) ? rawStages : [];
    const members = Array.isArray(rawMembers) ? rawMembers : [];

    const sortedStages = useMemo(() => [...stages].sort((a, b) => a.order - b.order), [stages]);
    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
    });

    if (loading) {
      const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);
      const hoverStyles = useMemo(() => createCardHoverStyles(tokens), [tokens]);
      const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
      const divider = useMemo(() => createDividerStyle(tokens), [tokens]);
      const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);

      return (
        <Flex align="center" justify="center" style={{ padding: tokens.spacing[8], ...style }} className={className}>
          <Text style={{ color: tokens.colors.neutral[500], fontSize: tokens.typography.fontSize.xs }}>Loading...</Text>
        </Flex>
      );
    }

    return (
      <Box className={className} 
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{ ...createCardStyle(tokens, { glass: isGlass, padding: 0 }), overflow: 'hidden', ...style }}>
        {/* Header */}
        <Flex align="center" justify="between" style={createPanelHeaderStyle(tokens)}>
          <Stack gap={1}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
              {candidateName ?? 'Panel Summary'}
            </Text>
            {positionTitle && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{positionTitle}</Text>}
          </Stack>
          {consensus && (() => {
            const rc = recColors[consensus.recommendation];
            return (
              <Box style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, background: rc.bgColor, border: `1px solid ${rc.border}` }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: rc.color }}>
                  {getRecommendationLabel(consensus.recommendation)}
                </Text>
              </Box>
            );
          })()}
        </Flex>

        {/* Stage Summary */}
        <Stack gap={0}>
          {sortedStages.map(stage => {
            const sc = stageColors[stage.status];
            const stageMembers = members.filter(m => m.stageId === stage.id);
            return (
              <Box key={stage.id} style={createListItemStyle(tokens, { interactive: false })}>
                <Flex justify="between" align="center" style={{ marginBottom: tokens.spacing[1] }}>
                  <Flex gap={6} align="center">
                    <Box style={{ width: 18, height: 18, borderRadius: tokens.borderRadius.full, background: sc.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: sc.color }}>{stage.order}</Text>
                    </Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{stage.name}</Text>
                    <Box style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.full, background: sc.bgColor }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: sc.color, textTransform: 'capitalize' as const }}>{stage.status.replace('_', ' ')}</Text>
                    </Box>
                  </Flex>
                  {stage.aggregatedScore !== undefined && (
                    <Flex gap={4} align="center">
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{stage.aggregatedScore}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>({getAggregationLabel(stage.aggregationStrategy)})</Text>
                    </Flex>
                  )}
                </Flex>
                {/* Members in this stage */}
                <Flex gap={6} wrap="wrap" style={{ paddingLeft: 24 }}>
                  {stageMembers.map(m => {
                    const mrc = m.recommendation ? recColors[m.recommendation] : null;
                    return (
                      <Flex key={m.id} gap={4} align="center" style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, background: tokens.colors.neutral[50], border: `1px solid ${tokens.colors.neutral[100]}` }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{m.name}</Text>
                        {m.overallScore !== undefined && <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600] }}>{m.overallScore}</Text>}
                        {m.recommendation && mrc && (
                          <Box style={createStatusDotStyle(tokens, mrc.color)} />
                        )}
                      </Flex>
                    );
                  })}
                </Flex>
              </Box>
            );
          })}
        </Stack>

        {/* Consensus Footer */}
        {consensus && (
          <Box style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, background: tokens.colors.neutral[50] }}>
            <Flex justify="between" align="center">
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                {consensus.isUnanimous ? 'Unanimous decision' : `${consensus.agreementPercentage}% agreement`}
                {consensus.dissentingMembers.length > 0 && ` (${consensus.dissentingMembers.length} dissenting)`}
              </Text>
              <Flex gap={8}>
                {(Object.entries(consensus.distribution) as [string, number][]).filter(([, c]) => c > 0).map(([rec, count]) => {
                  const rc = recColors[rec as keyof typeof recColors];
                  return (
                    <Flex key={rec} gap={3} align="center">
                      <Box style={createStatusDotStyle(tokens, rc.color)} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{count}</Text>
                    </Flex>
                  );
                })}
              </Flex>
            </Flex>
          </Box>
        )}
      </Box>
    );
  },
});
