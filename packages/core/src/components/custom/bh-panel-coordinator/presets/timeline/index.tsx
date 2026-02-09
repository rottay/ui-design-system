'use client';

/**
 * BhPanelCoordinator - Timeline Preset
 * Full stage progression with member scores and consensus
 */

import { useState, useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { BhPanelCoordinatorProps } from '../../core';
import { getRecommendationColors, getStageStatusColors, getRecommendationLabel, getAggregationLabel } from '../../core';
import {
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
} from '../../../helpers';

export const TimelineBhPanelCoordinator = createPreset<BhPanelCoordinatorProps>({
  name: 'BhPanelCoordinator.Timeline',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhPanelCoordinatorProps>) => {
    const { Box, Flex, Stack, Text, Grid } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const recColors = getRecommendationColors(tokens);
    const stageColors = getStageStatusColors(tokens);

    const {
      stages,
      members,
      consensus,
      candidateName,
      positionTitle,
      selectedStageId: selectedStageIdProp,
      onStageSelect,
      selectedMemberId: selectedMemberIdProp,
      onMemberSelect,
      onFinalDecision,
      loading,
      className,
      style,
    } = props;

    const [internalSelectedStage, setInternalSelectedStage] = useState(selectedStageIdProp ?? '');
    const [internalSelectedMember, setInternalSelectedMember] = useState(selectedMemberIdProp ?? '');

    const selectedStageId = selectedStageIdProp ?? internalSelectedStage;
    const selectedMemberId = selectedMemberIdProp ?? internalSelectedMember;

    const handleStageSelect = (id: string) => {
      setInternalSelectedStage(id);
      onStageSelect?.(id);
    };

    const handleMemberSelect = (id: string) => {
      setInternalSelectedMember(id);
      onMemberSelect?.(id);
    };

    const sortedStages = useMemo(() => [...stages].sort((a, b) => a.order - b.order), [stages]);
    const completedStages = sortedStages.filter(s => s.status === 'completed').length;
    const selectedMember = members.find(m => m.id === selectedMemberId);

    if (loading) {
      return (
        <Flex align="center" justify="center" style={{ padding: tokens.spacing[8], ...style }} className={className}>
          <Text style={{ color: tokens.colors.neutral[500] }}>Loading panel data...</Text>
        </Flex>
      );
    }

    return (
      <Box className={className} style={{ ...style }}>
        {/* Header */}
        <Flex align="center" justify="between" style={{ marginBottom: tokens.spacing[4] }}>
          <Stack gap={2}>
            <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
              {candidateName ?? 'Panel Coordination'}
            </Text>
            {positionTitle && <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{positionTitle}</Text>}
          </Stack>
          <Flex gap={8}>
            <Box style={createFilterPillStyle(tokens, { active: false })}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                {completedStages}/{sortedStages.length} stages
              </Text>
            </Box>
            <Box style={createFilterPillStyle(tokens, { active: false })}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{members.length} panelists</Text>
            </Box>
          </Flex>
        </Flex>

        {/* Stage Timeline */}
        <Box style={{ ...createCardStyle(tokens, { glass: isGlass, padding: 0 }), overflow: 'hidden', marginBottom: tokens.spacing[4] }}>
          <Box style={createPanelHeaderStyle(tokens)}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Stage Progression</Text>
          </Box>
          <Flex gap={0}>
            {sortedStages.map((stage, i) => {
              const sc = stageColors[stage.status];
              const isSelected = selectedStageId === stage.id;
              const stageMembers = members.filter(m => m.stageId === stage.id);
              return (
                <Box
                  key={stage.id}
                  onClick={() => handleStageSelect(stage.id)}
                  style={{
                    flex: 1,
                    padding: tokens.spacing[3],
                    borderRight: i < sortedStages.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` : 'none',
                    background: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  <Flex gap={6} align="center" style={{ marginBottom: tokens.spacing[1] }}>
                    <Box style={{ width: 20, height: 20, borderRadius: tokens.borderRadius.full, background: sc.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: sc.color }}>{stage.order}</Text>
                    </Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{stage.name}</Text>
                  </Flex>
                  <Box style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, background: sc.bgColor, display: 'inline-block', marginBottom: tokens.spacing[1] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: sc.color, textTransform: 'capitalize' as const }}>{stage.status.replace('_', ' ')}</Text>
                  </Box>
                  {stage.aggregatedScore !== undefined && (
                    <Flex justify="between" align="center">
                      <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{stage.aggregatedScore}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{getAggregationLabel(stage.aggregationStrategy)}</Text>
                    </Flex>
                  )}
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1] }}>{stageMembers.length} panelist{stageMembers.length !== 1 ? 's' : ''}</Text>
                </Box>
              );
            })}
          </Flex>
        </Box>

        <Flex gap={16}>
          {/* Panelists */}
          <Box style={{ flex: 1, ...createCardStyle(tokens, { glass: isGlass, padding: 0 }), overflow: 'hidden' }}>
            <Box style={createPanelHeaderStyle(tokens)}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Panelists</Text>
            </Box>
            <Stack gap={0} style={{ maxHeight: 320, overflowY: 'auto' }}>
              {members.map(m => {
                const isSelected = selectedMemberId === m.id;
                const rc = m.recommendation ? recColors[m.recommendation] : null;
                const memberStage = stages.find(s => s.id === m.stageId);
                return (
                  <Box
                    key={m.id}
                    onClick={() => handleMemberSelect(m.id)}
                    style={createListItemStyle(tokens, { active: isSelected, interactive: true })}
                  >
                    <Flex justify="between" align="center">
                      <Stack gap={2}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{m.name}</Text>
                        <Flex gap={6}>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{m.role}</Text>
                          {memberStage && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Stage: {memberStage.name}</Text>}
                        </Flex>
                      </Stack>
                      <Flex gap={6} align="center">
                        {m.overallScore !== undefined && (
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{m.overallScore}</Text>
                        )}
                        {m.recommendation && rc && (
                          <Box style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, background: rc.bgColor, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${rc.border}` }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: rc.color }}>{getRecommendationLabel(m.recommendation)}</Text>
                          </Box>
                        )}
                      </Flex>
                    </Flex>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Member Detail / Consensus */}
          <Box style={{ width: 300 }}>
            {selectedMember ? (
              <Box style={createCardStyle(tokens)}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800], marginBottom: tokens.spacing[3] }}>
                  {selectedMember.name}
                </Text>
                {selectedMember.dimensionScores && selectedMember.dimensionScores.length > 0 && (
                  <Stack gap={8}>
                    {selectedMember.dimensionScores.map(ds => {
                      const pct = ds.maxScore > 0 ? (ds.score / ds.maxScore) * 100 : 0;
                      const barColor = pct >= 70 ? tokens.colors.successScale[500] : pct >= 40 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500];
                      const progressStyles = createProgressBarStyle(tokens, { color: barColor, percent: pct });
                      return (
                        <Box key={ds.dimension}>
                          <Flex justify="between" style={{ marginBottom: 3 }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{ds.dimension}</Text>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{ds.score}/{ds.maxScore}</Text>
                          </Flex>
                          <Box style={{ ...progressStyles.track, height: 5 }}>
                            <div style={progressStyles.fill} />
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
                {selectedMember.notes && (
                  <Box style={{ marginTop: tokens.spacing[2], padding: tokens.spacing[2], borderRadius: tokens.borderRadius.md, background: tokens.colors.neutral[50] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{selectedMember.notes}</Text>
                  </Box>
                )}
              </Box>
            ) : consensus ? (
              <Box style={createCardStyle(tokens)}>
                <Text style={createSectionHeaderStyle(tokens)}>
                  Consensus
                </Text>
                {(() => {
                  const rc = recColors[consensus.recommendation];
                  return (
                    <Box style={{ textAlign: 'center' as const, marginBottom: tokens.spacing[3] }}>
                      <Box style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.lg, background: rc.bgColor, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${rc.border}`, display: 'inline-block' }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: rc.color }}>
                          {getRecommendationLabel(consensus.recommendation)}
                        </Text>
                      </Box>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], marginTop: tokens.spacing[1] }}>
                        {consensus.isUnanimous ? 'Unanimous' : `${consensus.agreementPercentage}% agreement`}
                      </Text>
                    </Box>
                  );
                })()}
                {/* Distribution */}
                <Stack gap={4}>
                  {(Object.entries(consensus.distribution) as [string, number][]).filter(([, count]) => count > 0).map(([rec, count]) => {
                    const rc = recColors[rec as keyof typeof recColors];
                    return (
                      <Flex key={rec} justify="between" align="center">
                        <Flex gap={4} align="center">
                          <Box style={createStatusDotStyle(tokens, rc.color)} />
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{getRecommendationLabel(rec as any)}</Text>
                        </Flex>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{count}</Text>
                      </Flex>
                    );
                  })}
                </Stack>
                {consensus.dissentingMembers.length > 0 && (
                  <Box style={{ marginTop: tokens.spacing[2], padding: tokens.spacing[2], borderRadius: tokens.borderRadius.md, background: tokens.colors.warningScale[50], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}` }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[700] }}>
                      Dissenting: {consensus.dissentingMembers.join(', ')}
                    </Text>
                  </Box>
                )}
              </Box>
            ) : (
              <Box style={{ padding: tokens.spacing[5], textAlign: 'center' as const }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Select a panelist for details</Text>
              </Box>
            )}
          </Box>
        </Flex>
      </Box>
    );
  },
});
