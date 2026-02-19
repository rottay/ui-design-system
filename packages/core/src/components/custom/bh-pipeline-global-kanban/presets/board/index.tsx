'use client';

/**
 * BhPipelineGlobalKanban - Board Preset
 * Full Kanban board with scrollable columns per stage, stage-colored headers,
 * candidate cards, drop zone indicators, add candidate buttons, WIP limit warnings.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Columns3, Plus, Users, AlertTriangle, Star,
  Clock, GripVertical, ChevronRight, Tag,
  ArrowRight, XCircle, Search, Briefcase,
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

function getDaysInStage(appliedAt: Date | string | null | undefined): number {
  if (!appliedAt) return 0;
  const date = typeof appliedAt === 'string' ? new Date(appliedAt) : appliedAt;
  if (isNaN(date.getTime())) return 0;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
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

function getPriorityBorderColor(priority: string | undefined, t: DesignTokens): string | undefined {
  switch (priority) {
    case 'urgent': return t.colors.errorScale[500];
    case 'high': return t.colors.warningScale[500];
    case 'low': return t.colors.neutral[300];
    default: return undefined;
  }
}

function getPriorityBadgeKey(priority: string | undefined): 'error' | 'warning' | 'info' | 'secondary' {
  switch (priority) {
    case 'urgent': return 'error';
    case 'high': return 'warning';
    case 'low': return 'secondary';
    default: return 'info';
  }
}

function getSourceLabel(source: string | undefined): string {
  if (!source) return '';
  switch (source) {
    case 'direct': return 'Direct';
    case 'referral': return 'Referral';
    case 'agency': return 'Agency';
    case 'linkedin': return 'LinkedIn';
    case 'job_board': return 'Job Board';
    case 'career_site': return 'Career Site';
    default: return source.charAt(0).toUpperCase() + source.slice(1);
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

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
      stages: rawStages = [],
      onCardMove,
      onCardClick,
      onStageClick,
      onAddCandidate,
      selectedCardId,
      filters,
      className,
      style,
    } = props;

    const stages = Array.isArray(rawStages) ? rawStages : [];

    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [dragOverStage, setDragOverStage] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

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
      () => (stages ?? []).reduce((sum, s) => sum + (s.candidates ?? []).length, 0),
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
        {accentBar && <Box style={accentBar} />}
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
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            {/* Active filter indicators */}
            {filters?.priority && (
              <Box style={{
                ...createBadgeStyle(t, getPriorityBadgeKey(filters.priority)),
                borderRadius: badgeRadius,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>
                  {filters.priority.charAt(0).toUpperCase() + filters.priority.slice(1)}
                </Text>
              </Box>
            )}
            {filters?.source && (
              <Box style={{
                ...createBadgeStyle(t, 'info'),
                borderRadius: badgeRadius,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <Briefcase size={10} />
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{getSourceLabel(filters.source)}</Text>
              </Box>
            )}
            {filters?.slaBreached != null && (
              <Box style={{
                ...createBadgeStyle(t, filters.slaBreached ? 'error' : 'success'),
                borderRadius: badgeRadius,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <AlertTriangle size={10} />
                <Text style={{ fontSize: t.typography.fontSize.xs }}>
                  {filters.slaBreached ? 'SLA Breached' : 'SLA OK'}
                </Text>
              </Box>
            )}
            <Box style={{
              ...createBadgeStyle(t, 'primary'),
              borderRadius: badgeRadius,
            }}>
              <Users size={12} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{totalCandidates} total</Text>
            </Box>
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
          {(stages ?? []).map((stage, stageIndex) => {
            const stageCandidates = stage.candidates ?? [];
            const stageColor = stage.color ?? getDefaultStageColor(stageIndex, t);
            const stageColorLight = getDefaultStageColorLight(stageIndex, t);
            const isOverLimit = stage.limit != null && stageCandidates.length >= stage.limit;
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
                  setDragOverStage((stage.id ?? null));
                }}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={() => setDragOverStage(null)}
                role="region"
                aria-label={`${stage.name ?? 'Unknown'} stage, ${stageCandidates.length} candidates`}
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
                  onClick={() => stage.id && handleStageClick(stage.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${stage.name ?? 'Unknown'} stage details`}
                  onKeyDown={(e: React.KeyboardEvent) => { if ((e.key === 'Enter' || e.key === ' ') && stage.id) { e.preventDefault(); handleStageClick(stage.id); } }}
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
                      {stage.name ?? 'Unknown'}
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
                        {stageCandidates.length}
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
                }} role="list" aria-label={`${stage.name ?? 'Unknown'} candidates`}>
                  {stageCandidates.length === 0 && (
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

                  {stageCandidates.map((candidate, cardIndex) => {
                    const candidateId = candidate.id ?? `card-${cardIndex}`;
                    const isSelected = selectedCardId === candidateId;
                    const isHovered = hoveredCard === candidateId;
                    const daysInStage = getDaysInStage(candidate.appliedAt);

                    return (
                      <Box
                        key={candidateId}
                        role="listitem"
                        tabIndex={0}
                        aria-label={`${candidate.name ?? 'Unknown'}, score ${candidate.score ?? 'N/A'}, ${daysInStage} days`}
                        draggable
                        onClick={() => handleCardClick(candidateId)}
                        onMouseEnter={() => setHoveredCard(candidateId)}
                        onMouseLeave={() => setHoveredCard(null)}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(candidateId); } }}
                        style={{
                          ...card,
                          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                          cursor: 'pointer',
                          borderLeft: getPriorityBorderColor(candidate.priority, t)
                            ? `3px solid ${getPriorityBorderColor(candidate.priority, t)}`
                            : undefined,
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
                              {candidate.avatarInitial ?? '?'}
                            </Text>
                          </Box>
                          <Text style={{
                            fontSize: t.typography.fontSize.xs,
                            fontWeight: t.typography.fontWeight.medium,
                            color: t.colors.neutral[900],
                            flex: 1, minWidth: 0,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {candidate.name ?? 'Unknown'}
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

                        {/* Card row 2: time + SLA + source + tags */}
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], paddingLeft: 22, flexWrap: 'wrap' }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Clock size={9} color={getDaysColor(daysInStage, t)} />
                            <Text style={{ fontSize: 9, color: getDaysColor(daysInStage, t) }}>{daysInStage}d</Text>
                          </Box>
                          {candidate.slaBreached && (
                            <Box
                              style={{ display: 'flex', alignItems: 'center', gap: 2 }}
                              aria-label="SLA breached"
                            >
                              <AlertTriangle size={9} color={t.colors.errorScale[500]} />
                              <Text style={{ fontSize: 9, color: t.colors.errorScale[600], fontWeight: t.typography.fontWeight.bold }}>
                                SLA
                              </Text>
                            </Box>
                          )}
                          {candidate.source && (
                            <Box style={{
                              ...createBadgeStyle(t, 'info'),
                              borderRadius: badgeRadius,
                              padding: `0px ${t.spacing[1]}px`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 2,
                            }}>
                              <Briefcase size={8} />
                              <Text style={{ fontSize: 9 }}>{getSourceLabel(candidate.source)}</Text>
                            </Box>
                          )}
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
                              onClick={(e) => { e.stopPropagation(); onCardMove?.(candidateId, stage.id ?? '', (stages ?? [])[stageIndex + 1]?.id ?? stage.id ?? ''); }}
                              aria-label={`Advance ${candidate.name ?? 'candidate'}`}
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
                              aria-label={`Reject ${candidate.name ?? 'candidate'}`}
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
                    onClick={() => stage.id && handleAddCandidate(stage.id)}
                    aria-label={`Add candidate to ${stage.name ?? 'stage'}`}
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
