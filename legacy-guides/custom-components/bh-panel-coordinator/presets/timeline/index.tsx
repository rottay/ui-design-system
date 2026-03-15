'use client';

/**
 * BhPanelCoordinator - Timeline Preset
 * Full stage progression with member scores, dimension breakdowns, and consensus.
 * Slite-inspired: generous whitespace, warm neutrals, soft shadows, minimal borders.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhPanelCoordinatorProps, InterviewStage, PanelMember } from '../../core';
import {
  getRecommendationColors, getStageStatusColors,
  getRecommendationLabel, getAggregationLabel,
} from '../../core';
import {
  createCardStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  createFilterPillStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEntranceAnimation,
  createStaggerDelay,
  createPersonalityAccentBar,

  createCardHoverStyles,
  createDividerStyle,
  createPersonalitySectionHeaderStyle,
} from '../../../helpers';
import {
  Users, UserCheck, CheckCircle2, Clock, AlertCircle,
  ChevronRight, MessageSquare, BarChart3, Award,
} from 'lucide-react';

export const TimelineBhPanelCoordinator = createPreset<BhPanelCoordinatorProps>({
  name: 'BhPanelCoordinator.Timeline',
  render: ({ primitives, props, tokens }: PresetContext<BhPanelCoordinatorProps>) => {
    const { Box, Flex, Stack, Text } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const recColors = getRecommendationColors(tokens);
    const stageColors = getStageStatusColors(tokens);

    const {
      stages: rawStages = [], members: rawMembers = [], consensus, candidateName, positionTitle,
      selectedStageId: selectedStageIdProp, onStageSelect,
      selectedMemberId: selectedMemberIdProp, onMemberSelect,
      onFinalDecision, loading, className, style,
    } = props;

    const stages = Array.isArray(rawStages) ? rawStages : [];
    const members = Array.isArray(rawMembers) ? rawMembers : [];

    const [internalStage, setInternalStage] = useState(selectedStageIdProp ?? '');
    const [internalMember, setInternalMember] = useState(selectedMemberIdProp ?? '');

    const selectedStageId = selectedStageIdProp ?? internalStage;
    const selectedMemberId = selectedMemberIdProp ?? internalMember;

    const handleStageSelect = useCallback((id: string) => { setInternalStage(id); onStageSelect?.(id); }, [onStageSelect]);
    const handleMemberSelect = useCallback((id: string) => { setInternalMember(id); onMemberSelect?.(id); }, [onMemberSelect]);

    const sortedStages = useMemo(() => [...stages].sort((a, b) => a.order - b.order), [stages]);
    const completedCount = sortedStages.filter(s => s.status === 'completed').length;
    const selectedMember = members.find(m => m.id === selectedMemberId);

    const card = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hov = useMemo(() => createHoverStyle(tokens), [tokens]);
    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
    });

    const hoverStyles = useMemo(() => createCardHoverStyles(tokens), [tokens]);

    if (loading) {
      return (
        <Flex align="center" justify="center" style={{ padding: tokens.spacing[10], ...style }} className={className}>
          <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>Loading panel data...</Text>
        </Flex>
      );
    }

    /* ── Stage status icon ─────────────────────────────── */
    const StageIcon = ({ status }: { status: string }) => {
      const size = 14;
      switch (status) {
        case 'completed': return <CheckCircle2 size={size} color={tokens.colors.successScale[500]} />;
        case 'in_progress': return <Clock size={size} color={tokens.colors.infoScale[500]} />;
        case 'cancelled': return <AlertCircle size={size} color={tokens.colors.errorScale[500]} />;
        default: return <Clock size={size} color={tokens.colors.neutral[400]} />;
      }
    };

    /* ── Sparkline for score distribution ───────────────── */
    const ScoreSparkline = ({ scores }: { scores: number[] }) => {
      if (scores.length === 0) return null;
      const max = Math.max(...scores, 1);
      const w = 80, h = 24, barW = Math.min(12, (w - (scores.length - 1) * 2) / scores.length);
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {scores.map((s, i) => {
            const barH = Math.max(2, (s / max) * (h - 2));
            const x = i * (barW + 2);
            const color = s / max >= 0.7 ? tokens.colors.successScale[400]
              : s / max >= 0.4 ? tokens.colors.warningScale[400]
              : tokens.colors.errorScale[400];
            return <rect key={i} x={x} y={h - barH} width={barW} height={barH} rx={2} fill={color} opacity={0.8} />;
          })}
        </svg>
      );
    };

    return (
      <Box className={className} style={{
        display: 'flex', flexDirection: 'column' as const,
        gap: tokens.spacing[5], ...style,
      }}>
        {accentBar && <Box style={accentBar} />}
        {/* ── Header ───────────────────────────────────── */}
        <Flex align="center" justify="between">
          <Stack gap={2}>
            <Text style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: ptypo.headingWeight,
              letterSpacing: ptypo.headingLetterSpacing,
              color: tokens.colors.neutral[900],
            }}>
              {candidateName ?? 'Panel Coordination'}
            </Text>
            {positionTitle && (
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                {positionTitle}
              </Text>
            )}
          </Stack>
          <Flex gap={8}>
            <Flex align="center" gap={4} style={{
              ...createFilterPillStyle(tokens, { active: false }),
            }}>
              <BarChart3 size={12} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                {completedCount}/{sortedStages.length} stages
              </Text>
            </Flex>
            <Flex align="center" gap={4} style={{
              ...createFilterPillStyle(tokens, { active: false }),
            }}>
              <Users size={12} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                {members.length} panelists
              </Text>
            </Flex>
          </Flex>
        </Flex>

        {/* ── Stage Timeline Bar ───────────────────────── */}
        <Box style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <Box style={createPanelHeaderStyle(tokens)}>
            <Flex align="center" gap={6}>
              <Award size={14} color={tokens.colors.neutral[500]} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                Stage Progression
              </Text>
            </Flex>
          </Box>
          <Flex gap={0}>
            {sortedStages.map((stage, i) => {
              const sc = stageColors[stage.status] ?? { bgColor: tokens.colors.neutral[200], color: tokens.colors.neutral[600] };
              const isSelected = selectedStageId === stage.id;
              const stageMembers = members.filter(m => m.stageId === stage.id);
              const memberScores = stageMembers.map(m => m.overallScore ?? 0);
              return (
                <Box key={stage.id} role="button" tabIndex={0} aria-label={`Stage: ${stage.name}`} aria-pressed={isSelected} onClick={() => handleStageSelect(stage.id)} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleStageSelect(stage.id); }} style={{ ...animStyle(i), display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1],
                  flex: 1, padding: `${tokens.spacing[4]}px ${tokens.spacing[3]}px`,
                  borderRight: i < sortedStages.length - 1
                    ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
                    : 'none',
                  backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                  cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                }}>
                  <Flex align="center" gap={6} style={{ marginBottom: tokens.spacing[2] }}>
                    <Box style={{
                      width: 24, height: 24, borderRadius: tokens.borderRadius.full,
                      backgroundColor: sc.bgColor, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <StageIcon status={stage.status} />
                    </Box>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[800],
                    }}>
                      {stage.name}
                    </Text>
                  </Flex>
                  <Flex align="center" gap={6} style={{ marginBottom: tokens.spacing[2] }}>
                    <Box style={{
                      padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: sc.bgColor, display: 'inline-flex',
                    }}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs, color: sc.color,
                        textTransform: 'capitalize' as const,
                      }}>
                        {stage.status.replace('_', ' ')}
                      </Text>
                    </Box>
                  </Flex>
                  {stage.aggregatedScore !== undefined && (
                    <Flex justify="between" align="center" style={{ marginBottom: tokens.spacing[1] }}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xl || '1.25rem',
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[800],
                      }}>
                        {stage.aggregatedScore}
                      </Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        {getAggregationLabel(stage.aggregationStrategy)}
                      </Text>
                    </Flex>
                  )}
                  <Flex align="center" gap={6}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                      {stageMembers.length} panelist{stageMembers.length !== 1 ? 's' : ''}
                    </Text>
                    {stage.interviewMode && (
                      <Flex align="center" gap={4} style={{
                        padding: `0 ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: (stage.interviewMode === 'ai_voice' || stage.interviewMode === 'ai_chat') ? tokens.colors.infoScale[50] : tokens.colors.secondaryScale[50],
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${(stage.interviewMode === 'ai_voice' || stage.interviewMode === 'ai_chat') ? tokens.colors.infoScale[200] : tokens.colors.secondaryScale[200]}`,
                      }}>
                        <Text style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: (stage.interviewMode === 'ai_voice' || stage.interviewMode === 'ai_chat') ? tokens.colors.infoScale[700] : tokens.colors.secondaryScale[700],
                        }}>
                          {stage.interviewMode.replace(/_/g, ' ')}
                        </Text>
                      </Flex>
                    )}
                    {stage.weight != null && (
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        w:{stage.weight}
                      </Text>
                    )}
                    <ScoreSparkline scores={memberScores} />
                  </Flex>
                </Box>
              );
            })}
          </Flex>
        </Box>

        {/* ── Panelists + Detail ───────────────────────── */}
        <Box style={{ display: 'grid', gridTemplateColumns: selectedMember || consensus ? '1fr 340px' : '1fr', gap: tokens.spacing[5] }}>
          {/* Panelist List */}
          <Box style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <Box style={createPanelHeaderStyle(tokens)}>
              <Flex align="center" gap={6}>
                <UserCheck size={14} color={tokens.colors.neutral[500]} />
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                  Panelists
                </Text>
              </Flex>
            </Box>
            <Stack gap={0} style={{ maxHeight: 380, overflowY: 'auto' as const }}>
              {members.map(m => {
                const isSelected = selectedMemberId === m.id;
                const rc = m.recommendation ? recColors[m.recommendation] : null;
                const memberStage = stages.find(s => s.id === m.stageId);
                return (
                  <Box key={m.id} role="button" tabIndex={0} aria-label={`Panelist: ${m.name}`} aria-pressed={isSelected} onClick={() => handleMemberSelect(m.id)} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleMemberSelect(m.id); }}
                    onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
                    onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
                    style={createListItemStyle(tokens, { active: isSelected, interactive: true })}>
                    <Flex justify="between" align="center">
                      <Stack gap={2}>
                        <Text style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[800],
                        }}>
                          {m.name}
                        </Text>
                        <Flex gap={8}>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                            {m.role}
                          </Text>
                          {memberStage && (
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                              {memberStage.name}
                            </Text>
                          )}
                        </Flex>
                      </Stack>
                      <Flex align="center" gap={8}>
                        {m.overallScore !== undefined && (
                          <Text style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.bold,
                            color: tokens.colors.neutral[700],
                          }}>
                            {m.overallScore}
                          </Text>
                        )}
                        {m.recommendation && rc && (
                          <Flex align="center" gap={4} style={{
                            padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: rc.bgColor,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${rc.border}`,
                          }}>
                            <Box style={createStatusDotStyle(tokens, rc.color)} />
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: rc.color }}>
                              {getRecommendationLabel(m.recommendation)}
                            </Text>
                          </Flex>
                        )}
                        <ChevronRight size={14} color={tokens.colors.neutral[300]} />
                      </Flex>
                    </Flex>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Detail Panel */}
          <Box>
            {selectedMember ? (
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], ...card, padding: tokens.spacing[5] }}>
                <Flex align="center" gap={8} style={{ marginBottom: tokens.spacing[4] }}>
                  <Box style={{
                    width: 36, height: 36, borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.primaryScale[100],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <UserCheck size={16} color={tokens.colors.primaryScale[600]} />
                  </Box>
                  <Stack gap={1}>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[800],
                    }}>
                      {selectedMember.name}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      {selectedMember.role}
                    </Text>
                  </Stack>
                </Flex>

                {/* Dimension Scores */}
                {selectedMember.dimensionScores && selectedMember.dimensionScores.length > 0 && (
                  <Stack gap={10}>
                    {selectedMember.dimensionScores.map(ds => {
                      const pct = ds.maxScore > 0 ? (ds.score / ds.maxScore) * 100 : 0;
                      const barColor = pct >= 70 ? tokens.colors.successScale[500]
                        : pct >= 40 ? tokens.colors.warningScale[500]
                        : tokens.colors.errorScale[500];
                      const progressStyles = createProgressBarStyle(tokens, { color: barColor, percent: pct });
                      return (
                        <Box key={ds.dimension}>
                          <Flex justify="between" style={{ marginBottom: 4 }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>
                              {ds.dimension}
                            </Text>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                              {ds.score}/{ds.maxScore}
                            </Text>
                          </Flex>
                          <Box style={{ ...progressStyles.track, height: 5 }}>
                            <Box style={progressStyles.fill} />
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}

                {/* Notes */}
                {selectedMember.notes && (
                  <Flex align="start" gap={6} style={{
                    marginTop: tokens.spacing[4], padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    backgroundColor: tokens.colors.neutral[50],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  }}>
                    <MessageSquare size={14} color={tokens.colors.neutral[400]} style={{ flexShrink: 0, marginTop: tokens.spacing[1] }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], lineHeight: 1.5 }}>
                      {selectedMember.notes}
                    </Text>
                  </Flex>
                )}
              </Box>
            ) : consensus ? (
              <Box style={{ ...card, padding: tokens.spacing[5] }}>
                <Text style={{
                  ...createSectionHeaderStyle(tokens),
                  marginBottom: tokens.spacing[4],
                }}>
                  Panel Consensus
                </Text>

                {/* Main recommendation */}
                {(() => {
                  const rc = recColors[consensus.recommendation];
                  return (
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1],
                      textAlign: 'center' as const, padding: tokens.spacing[4],
                      marginBottom: tokens.spacing[4], borderRadius: tokens.borderRadius.lg,
                      backgroundColor: rc.bgColor,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${rc.border}`,
                    }}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.lg || '1.125rem',
                        fontWeight: tokens.typography.fontWeight.bold, color: rc.color,
                      }}>
                        {getRecommendationLabel(consensus.recommendation)}
                      </Text>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600],
                        marginTop: tokens.spacing[1],
                      }}>
                        {consensus.isUnanimous ? 'Unanimous decision' : `${consensus.agreementPercentage}% agreement`}
                      </Text>
                    </Box>
                  );
                })()}

                {/* Distribution */}
                <Stack gap={6}>
                  {(Object.entries(consensus.distribution) as [string, number][])
                    .filter(([, count]) => count > 0)
                    .map(([rec, count]) => {
                      const rc = recColors[rec as keyof typeof recColors];

                      return (
                        <Flex key={rec} justify="between" align="center">
                          <Flex gap={6} align="center">
                            <Box style={createStatusDotStyle(tokens, rc.color)} />
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>
                              {getRecommendationLabel(rec as any)}
                            </Text>
                          </Flex>
                          <Text style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.bold,
                            color: tokens.colors.neutral[700],
                          }}>
                            {count}
                          </Text>
                        </Flex>
                      );
                    })}
                </Stack>

                {/* Dissenting */}
                {consensus.dissentingMembers.length > 0 && (
                  <Flex align="start" gap={6} style={{
                    marginTop: tokens.spacing[4], padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    backgroundColor: tokens.colors.warningScale[50],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
                  }}>
                    <AlertCircle size={14} color={tokens.colors.warningScale[600]} style={{ flexShrink: 0, marginTop: tokens.spacing[1] }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[700] }}>
                      Dissenting: {consensus.dissentingMembers.join(', ')}
                    </Text>
                  </Flex>
                )}
              </Box>
            ) : (
              <Box style={{
                ...card, padding: tokens.spacing[8],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
                  Select a panelist for details
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  },
});
