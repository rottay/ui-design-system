'use client';

/**
 * BhPanelCoordinator - Timeline Preset
 * Full stage progression with member scores, dimension breakdowns, and consensus.
 * Slite-inspired: generous whitespace, warm neutrals, soft shadows, minimal borders.
 */

import { useState, useMemo } from 'react';
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
} from '../../../helpers';
import {
  Users, UserCheck, CheckCircle2, Clock, AlertCircle,
  ChevronRight, MessageSquare, BarChart3, Award,
} from 'lucide-react';

const MOCK_STAGES: InterviewStage[] = [
  { id: 's-1', name: 'Technical Screen', order: 1, status: 'completed', aggregationStrategy: 'average', aggregatedScore: 82, maxScore: 100, completedDate: '2025-01-15', panelMemberIds: ['m-1', 'm-2'] },
  { id: 's-2', name: 'System Design', order: 2, status: 'completed', aggregationStrategy: 'weighted_average', aggregatedScore: 75, maxScore: 100, completedDate: '2025-01-18', panelMemberIds: ['m-3'] },
  { id: 's-3', name: 'Behavioral', order: 3, status: 'in_progress', aggregationStrategy: 'consensus', maxScore: 100, scheduledDate: '2025-01-22', panelMemberIds: ['m-4'] },
  { id: 's-4', name: 'Hiring Manager', order: 4, status: 'pending', aggregationStrategy: 'average', maxScore: 100, panelMemberIds: [] },
];

const MOCK_MEMBERS: PanelMember[] = [
  { id: 'm-1', name: 'Alex Rivera', role: 'Senior Engineer', stageId: 's-1', overallScore: 85, recommendation: 'hire', submittedAt: '2025-01-15T14:00:00Z', dimensionScores: [{ dimension: 'Problem Solving', score: 9, maxScore: 10 }, { dimension: 'Code Quality', score: 8, maxScore: 10 }], notes: 'Strong problem-solving skills. Clean code approach.' },
  { id: 'm-2', name: 'Jordan Park', role: 'Staff Engineer', stageId: 's-1', overallScore: 79, recommendation: 'hire', submittedAt: '2025-01-15T16:00:00Z', dimensionScores: [{ dimension: 'Problem Solving', score: 8, maxScore: 10 }, { dimension: 'Code Quality', score: 7, maxScore: 10 }] },
  { id: 'm-3', name: 'Morgan Lee', role: 'Principal Architect', stageId: 's-2', overallScore: 75, recommendation: 'hire', submittedAt: '2025-01-18T11:00:00Z', dimensionScores: [{ dimension: 'System Design', score: 8, maxScore: 10 }, { dimension: 'Scalability', score: 7, maxScore: 10 }] },
  { id: 'm-4', name: 'Casey Kim', role: 'Engineering Manager', stageId: 's-3' },
];

export const TimelineBhPanelCoordinator = createPreset<BhPanelCoordinatorProps>({
  name: 'BhPanelCoordinator.Timeline',
  render: ({ primitives, props, tokens }: PresetContext<BhPanelCoordinatorProps>) => {
    const { Box, Flex, Stack, Text } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const recColors = getRecommendationColors(tokens);
    const stageColors = getStageStatusColors(tokens);

    const {
      stages = MOCK_STAGES, members = MOCK_MEMBERS, consensus, candidateName, positionTitle,
      selectedStageId: selectedStageIdProp, onStageSelect,
      selectedMemberId: selectedMemberIdProp, onMemberSelect,
      onFinalDecision, loading, className, style,
    } = props;

    const [internalStage, setInternalStage] = useState(selectedStageIdProp ?? '');
    const [internalMember, setInternalMember] = useState(selectedMemberIdProp ?? '');

    const selectedStageId = selectedStageIdProp ?? internalStage;
    const selectedMemberId = selectedMemberIdProp ?? internalMember;

    const handleStageSelect = (id: string) => { setInternalStage(id); onStageSelect?.(id); };
    const handleMemberSelect = (id: string) => { setInternalMember(id); onMemberSelect?.(id); };

    const sortedStages = useMemo(() => [...stages].sort((a, b) => a.order - b.order), [stages]);
    const completedCount = sortedStages.filter(s => s.status === 'completed').length;
    const selectedMember = members.find(m => m.id === selectedMemberId);

    const card = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hov = useMemo(() => createHoverStyle(tokens), [tokens]);

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
        {/* ── Header ───────────────────────────────────── */}
        <Flex align="center" justify="between">
          <Stack gap={2}>
            <Text style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.bold,
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
              const sc = stageColors[stage.status];
              const isSelected = selectedStageId === stage.id;
              const stageMembers = members.filter(m => m.stageId === stage.id);
              const memberScores = stageMembers.map(m => m.overallScore ?? 0);
              return (
                <Box key={stage.id} onClick={() => handleStageSelect(stage.id)} style={{
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
                    <ScoreSparkline scores={memberScores} />
                  </Flex>
                </Box>
              );
            })}
          </Flex>
        </Box>

        {/* ── Panelists + Detail ───────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedMember || consensus ? '1fr 340px' : '1fr', gap: tokens.spacing[5] }}>
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
                  <Box key={m.id} onClick={() => handleMemberSelect(m.id)}
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
              <Box style={{ ...card, padding: tokens.spacing[5] }}>
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
                            <div style={progressStyles.fill} />
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
                    <MessageSquare size={14} color={tokens.colors.neutral[400]} style={{ flexShrink: 0, marginTop: 2 }} />
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
                    <Box style={{
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
                    <AlertCircle size={14} color={tokens.colors.warningScale[600]} style={{ flexShrink: 0, marginTop: 2 }} />
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
        </div>
      </Box>
    );
  },
});
