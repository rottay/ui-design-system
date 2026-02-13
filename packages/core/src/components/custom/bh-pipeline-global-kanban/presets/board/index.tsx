'use client';

/**
 * BhPipelineGlobalKanban - Board Preset
 * Full Kanban board with scrollable columns per stage, stage-colored headers,
 * candidate cards, drop zone indicators, add candidate buttons, WIP limit warnings.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Columns3, Plus, Users, AlertTriangle, Star,
  Clock, GripVertical, ChevronRight, Tag,
  ArrowRight, XCircle, Search,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  BhPipelineGlobalKanbanProps,
  KanbanStage,
  KanbanStageCandidate,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getScoreBadgeKey(score: number): 'success' | 'warning' | 'error' {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'error';
}

function getDaysInStage(appliedAt: Date): number {
  return Math.floor((Date.now() - appliedAt.getTime()) / (1000 * 60 * 60 * 24));
}

function getDaysColor(days: number, t: DesignTokens): string {
  if (days <= 3) return t.colors.successScale[600];
  if (days <= 7) return t.colors.warningScale[600];
  return t.colors.errorScale[600];
}

function getDefaultStageColor(index: number, t: DesignTokens): string {
  const palette = [
    t.colors.primaryScale[500],
    t.colors.infoScale[500],
    t.colors.warningScale[500],
    t.colors.successScale[500],
    t.colors.errorScale[500],
    t.colors.secondaryScale?.[500] ?? t.colors.primaryScale[600],
  ];
  return palette[index % palette.length];
}

function getDefaultStageColorLight(index: number, t: DesignTokens): string {
  const palette = [
    t.colors.primaryScale[50],
    t.colors.infoScale[50],
    t.colors.warningScale[50],
    t.colors.successScale[50],
    t.colors.errorScale[50],
    t.colors.secondaryScale?.[50] ?? t.colors.primaryScale[100],
  ];
  return palette[index % palette.length];
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_STAGES: KanbanStage[] = [
  {
    id: 'applied',
    name: 'Applied',
    limit: 30,
    candidates: [
      { id: 'c-1', name: 'Sarah Johnson', avatarInitial: 'SJ', score: 85, appliedAt: new Date(Date.now() - 86400000 * 1), tags: ['Referred'] },
      { id: 'c-2', name: 'Michael Chen', avatarInitial: 'MC', score: 72, appliedAt: new Date(Date.now() - 86400000 * 2), tags: ['Senior'] },
      { id: 'c-3', name: 'Emily Rodriguez', avatarInitial: 'ER', score: 91, appliedAt: new Date(Date.now() - 86400000 * 1), tags: ['Remote'] },
      { id: 'c-4', name: 'David Park', avatarInitial: 'DP', score: 68, appliedAt: new Date(Date.now() - 86400000 * 3) },
    ],
  },
  {
    id: 'screening',
    name: 'Phone Screen',
    limit: 15,
    candidates: [
      { id: 'c-5', name: 'Anna Kowalski', avatarInitial: 'AK', score: 78, appliedAt: new Date(Date.now() - 86400000 * 4), tags: ['Mid-level'] },
      { id: 'c-6', name: 'James Kim', avatarInitial: 'JK', score: 65, appliedAt: new Date(Date.now() - 86400000 * 5) },
      { id: 'c-7', name: 'Lisa Wang', avatarInitial: 'LW', score: 88, appliedAt: new Date(Date.now() - 86400000 * 3), tags: ['Senior', 'Referred'] },
    ],
  },
  {
    id: 'technical',
    name: 'Technical Interview',
    limit: 8,
    candidates: [
      { id: 'c-8', name: 'Robert Taylor', avatarInitial: 'RT', score: 82, appliedAt: new Date(Date.now() - 86400000 * 7), tags: ['Lead'] },
      { id: 'c-9', name: 'Maria Santos', avatarInitial: 'MS', score: 94, appliedAt: new Date(Date.now() - 86400000 * 6) },
    ],
  },
  {
    id: 'final',
    name: 'Final Round',
    limit: 5,
    candidates: [
      { id: 'c-10', name: 'Thomas Brown', avatarInitial: 'TB', score: 89, appliedAt: new Date(Date.now() - 86400000 * 10), tags: ['Senior'] },
    ],
  },
  {
    id: 'offer',
    name: 'Offer',
    limit: 3,
    candidates: [],
  },
];

/* ================================================================== */
/*  Board Preset                                                       */
/* ================================================================== */

export const BoardBhPipelineGlobalKanban = createPreset<BhPipelineGlobalKanbanProps>({
  name: 'BhPipelineGlobalKanban.Board',
  render: (ctx: PresetContext<BhPipelineGlobalKanbanProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      stages = MOCK_STAGES,
      onCardMove,
      onCardClick,
      onStageClick,
      onAddCandidate,
      selectedCardId,
      filters,
      className,
      style,
    } = props;

    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [dragOverStage, setDragOverStage] = useState<string | null>(null);


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const handleCardClick = useCallback((id: string) => {
      onCardClick?.(id);
    }, [onCardClick]);

    const handleStageClick = useCallback((id: string) => {
      onStageClick?.(id);
    }, [onStageClick]);

    const handleAddCandidate = useCallback((stageId: string) => {
      onAddCandidate?.(stageId);
    }, [onAddCandidate]);

    /* Total candidates count */
    const totalCandidates = useMemo(
      () => stages.reduce((sum, s) => sum + s.candidates.length, 0),
      [stages],
    );

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: t.colors.neutral[50],
          fontFamily: 'inherit',
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* Board Header */}
        <Box style={{
          padding: `${t.spacing[4]}px ${t.spacing[6]}px`,
          backgroundColor: t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[50] })}>
              <Columns3 size={20} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
                display: 'block',
              }}>
                Pipeline Board
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                {totalCandidates} candidates across {stages.length} stages
              </Text>
            </Box>
          </Box>
          <Box style={{
            ...createBadgeStyle(t, 'primary'),
            borderRadius: badgeRadius,
          }}>
            <Users size={12} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: t.typography.fontSize.xs }}>{totalCandidates} total</Text>
          </Box>
        </Box>

        {/* Columns Container */}
        <Box style={{
          flex: 1,
          display: 'flex',
          gap: t.spacing[4],
          padding: t.spacing[4],
          overflow: 'auto',
        }}>
          {stages.map((stage, stageIndex) => {
            const stageColor = stage.color ?? getDefaultStageColor(stageIndex, t);
            const stageColorLight = getDefaultStageColorLight(stageIndex, t);
            const isOverLimit = stage.limit != null && stage.candidates.length >= stage.limit;
            const isDragOver = dragOverStage === stage.id;

            return (
              <Box
                key={stage.id}
                style={{
                  minWidth: 280,
                  maxWidth: 320,
                  flex: '1 0 280px',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: t.colors.common.white,
                  borderRadius: t.borderRadius.lg,
                  boxShadow: t.shadows.sm,
                  border: isDragOver
                    ? `2px dashed ${stageColor}`
                    : `1px solid ${t.colors.neutral[100]}`,
                  overflow: 'hidden',
                  ...animStyle(stageIndex),
                  ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
                }}
                onDragOver={(e: React.DragEvent) => {
                  e.preventDefault();
                  setDragOverStage(stage.id);
                }}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={() => setDragOverStage(null)}
                role="region"
                aria-label={`${stage.name} stage, ${stage.candidates.length} candidates`}
              >
                {/* Column Header */}
                <Box
                  style={{
                    padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                    borderBottom: `2px solid ${stageColor}`,
                    backgroundColor: stageColorLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                  onClick={() => handleStageClick(stage.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${stage.name} stage details`}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStageClick(stage.id); } }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Box style={{
                      width: 8, height: 8, borderRadius: t.borderRadius.full,
                      backgroundColor: stageColor, flexShrink: 0,
                    }} />
                    <Text style={{
                      fontSize: t.typography.fontSize.sm,
                      fontWeight: ptypo.headingWeight,
                      color: t.colors.neutral[800],
                      letterSpacing: ptypo.headingLetterSpacing,
                    }}>
                      {stage.name}
                    </Text>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    {isOverLimit && (
                      <AlertTriangle size={12} color={t.colors.warningScale[600]} aria-label="WIP limit reached" />
                    )}
                    <Box style={{
                      ...createBadgeStyle(t, isOverLimit ? 'warning' : 'secondary'),
                      borderRadius: badgeRadius,
                      padding: `0px ${t.spacing[2]}px`,
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold }}>
                        {stage.candidates.length}
                        {stage.limit != null && `/${stage.limit}`}
                      </Text>
                    </Box>
                  </Box>
                </Box>

                {/* WIP Limit Warning */}
                {isOverLimit && (
                  <Box style={{
                    padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                    backgroundColor: t.colors.warningScale[50],
                    borderBottom: `1px solid ${t.colors.warningScale[100]}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing[1],
                  }} role="alert">
                    <AlertTriangle size={10} color={t.colors.warningScale[600]} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.warningScale[700], fontWeight: t.typography.fontWeight.medium }}>
                      WIP limit reached
                    </Text>
                  </Box>
                )}

                {/* Cards Container */}
                <Box style={{
                  flex: 1,
                  overflow: 'auto',
                  padding: t.spacing[2],
                  display: 'flex',
                  flexDirection: 'column',
                  gap: t.spacing[2],
                }} role="list" aria-label={`${stage.name} candidates`}>
                  {stage.candidates.length === 0 && (
                    <Box style={{
                      ...createEmptyStateStyle(t),
                      padding: `${t.spacing[6]}px ${t.spacing[3]}px`,
                      borderRadius: t.borderRadius.md,
                      border: `1px dashed ${t.colors.neutral[200]}`,
                      backgroundColor: t.colors.neutral[50],
                    }}>
                      <Users size={24} style={{ marginBottom: t.spacing[1], opacity: 0.3 }} color={t.colors.neutral[400]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                        No candidates
                      </Text>
                    </Box>
                  )}

                  {stage.candidates.map((candidate, cardIndex) => {
                    const isSelected = selectedCardId === candidate.id;
                    const isHovered = hoveredCard === candidate.id;
                    const daysInStage = getDaysInStage(candidate.appliedAt);

                    return (
                      <Box
                        key={candidate.id}
                        role="listitem"
                        tabIndex={0}
                        aria-label={`${candidate.name}, score ${candidate.score ?? 'N/A'}, ${daysInStage} days`}
                        draggable
                        onClick={() => handleCardClick(candidate.id)}
                        onMouseEnter={() => setHoveredCard(candidate.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(candidate.id); } }}
                        style={{
                          ...card,
                          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                          cursor: 'pointer',
                          borderColor: isSelected ? t.colors.primaryScale[400] : undefined,
                          backgroundColor: isSelected
                            ? t.colors.primaryScale[50]
                            : isHovered
                              ? (hoverStyles.hover.backgroundColor ?? t.colors.common.white)
                              : t.colors.common.white,
                          transform: isHovered ? hoverStyles.hover.transform : 'none',
                          boxShadow: isHovered ? (hoverStyles.hover.boxShadow ?? card.boxShadow) : card.boxShadow,
                          transition: `all ${t.motion.hover}`,
                        }}
                      >
                        {/* Card row 1: avatar + name + score */}
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
                          <Box style={{
                            color: t.colors.neutral[300], cursor: 'grab', flexShrink: 0,
                            display: 'flex', alignItems: 'center',
                          }}>
                            <GripVertical size={12} />
                          </Box>
                          <Box style={{
                            width: 26, height: 26, borderRadius: t.borderRadius.full,
                            backgroundColor: stageColorLight,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <Text style={{ fontSize: 9, fontWeight: t.typography.fontWeight.bold, color: stageColor }}>
                              {candidate.avatarInitial}
                            </Text>
                          </Box>
                          <Text style={{
                            fontSize: t.typography.fontSize.xs,
                            fontWeight: t.typography.fontWeight.medium,
                            color: t.colors.neutral[900],
                            flex: 1, minWidth: 0,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {candidate.name}
                          </Text>
                          {candidate.score != null && (
                            <Box style={{
                              ...createBadgeStyle(t, getScoreBadgeKey(candidate.score)),
                              borderRadius: badgeRadius,
                              padding: `0px ${t.spacing[1]}px`,
                              flexShrink: 0,
                            }}>
                              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold }}>{candidate.score}</Text>
                            </Box>
                          )}
                        </Box>

                        {/* Card row 2: time + tags */}
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], paddingLeft: 22, flexWrap: 'wrap' }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Clock size={9} color={getDaysColor(daysInStage, t)} />
                            <Text style={{ fontSize: 9, color: getDaysColor(daysInStage, t) }}>{daysInStage}d</Text>
                          </Box>
                          {candidate.tags?.map((tag) => (
                            <Box key={tag} style={{
                              ...createBadgeStyle(t, 'secondary'),
                              borderRadius: badgeRadius,
                              padding: `0px ${t.spacing[1]}px`,
                            }}>
                              <Text style={{ fontSize: 9 }}>{tag}</Text>
                            </Box>
                          ))}
                        </Box>

                        {/* Quick actions on hover */}
                        {isHovered && (
                          <Box style={{
                            display: 'flex', gap: t.spacing[1], justifyContent: 'flex-end',
                            marginTop: t.spacing[1], paddingTop: t.spacing[1],
                            borderTop: `1px solid ${t.colors.neutral[100]}`,
                          }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); onCardMove?.(candidate.id, stage.id, stages[stageIndex + 1]?.id ?? stage.id); }}
                              aria-label={`Advance ${candidate.name}`}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: t.spacing[1],
                                padding: `1px ${t.spacing[2]}px`,
                                borderRadius: badgeRadius, fontSize: 9,
                                border: `1px solid ${t.colors.successScale[200]}`,
                                backgroundColor: t.colors.successScale[50], color: t.colors.successScale[700],
                                cursor: 'pointer', transition: `all ${t.motion.hover}`,
                              }}
                            >
                              <ArrowRight size={9} />
                              Advance
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); }}
                              aria-label={`Reject ${candidate.name}`}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: t.spacing[1],
                                padding: `1px ${t.spacing[2]}px`,
                                borderRadius: badgeRadius, fontSize: 9,
                                border: `1px solid ${t.colors.errorScale[200]}`,
                                backgroundColor: t.colors.errorScale[50], color: t.colors.errorScale[700],
                                cursor: 'pointer', transition: `all ${t.motion.hover}`,
                              }}
                            >
                              <XCircle size={9} />
                              Reject
                            </button>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>

                {/* Add Candidate Button */}
                <Box style={{
                  padding: t.spacing[2],
                  borderTop: `1px solid ${t.colors.neutral[100]}`,
                  flexShrink: 0,
                }}>
                  <button
                    onClick={() => handleAddCandidate(stage.id)}
                    aria-label={`Add candidate to ${stage.name}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: t.spacing[1],
                      width: '100%',
                      padding: `${t.spacing[2]}px`,
                      borderRadius: t.borderRadius.md,
                      border: `1px dashed ${t.colors.neutral[300]}`,
                      backgroundColor: 'transparent',
                      color: t.colors.neutral[500],
                      cursor: 'pointer',
                      fontSize: t.typography.fontSize.xs,
                      transition: `all ${t.motion.hover}`,
                    }}
                  >
                    <Plus size={14} />
                    Add candidate
                  </button>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
