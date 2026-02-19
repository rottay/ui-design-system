'use client';

/**
 * BhPipelineGlobalKanban - Compact Preset
 * Condensed column view with minimal card representation.
 * Designed for sidebar or reduced viewport. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Columns3, Plus, Users, AlertTriangle,
  Clock, ChevronRight, Star,
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
  getAccentAwareLayout,
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

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhPipelineGlobalKanban = createPreset<BhPipelineGlobalKanbanProps>({
  name: 'BhPipelineGlobalKanban.Compact',
  render: (ctx: PresetContext<BhPipelineGlobalKanbanProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      stages: rawStages = [],
      onCardClick,
      onStageClick,
      onAddCandidate,
      selectedCardId,
      className,
      style,
    } = props;

    const stages = Array.isArray(rawStages) ? rawStages : [];

    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [expandedStage, setExpandedStage] = useState<string | null>(stages[0]?.id ?? null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const handleCardClick = useCallback((id: string) => { onCardClick?.(id); }, [onCardClick]);
    const handleStageClick = useCallback((id: string) => { onStageClick?.(id); }, [onStageClick]);
    const handleAddCandidate = useCallback((stageId: string) => { onAddCandidate?.(stageId); }, [onAddCandidate]);

    const toggleExpanded = useCallback((stageId: string) => {
      setExpandedStage(prev => prev === stageId ? null : stageId);
    }, []);

    const totalCandidates = useMemo(
      () => (stages ?? []).reduce((sum, s) => sum + (s.candidates ?? []).length, 0),
      [stages],
    );

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    return (
      <Box
        className={className}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Columns3 size={14} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Pipeline
            </Text>
          </Box>
          <Box style={{
            ...createBadgeStyle(t, 'primary'),
            borderRadius: badgeRadius,
            padding: `0px ${t.spacing[2]}px`,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs }}>{totalCandidates}</Text>
          </Box>
        </Box>

        {/* Stage funnel overview bar */}
        <Box style={{
          display: 'flex',
          height: 6,
          overflow: 'hidden',
        }} role="img" aria-label="Pipeline stage distribution">
          {(stages ?? []).map((stage, i) => (
            <Box
              key={stage.id ?? `stage-${i}`}
              style={{
                flex: Math.max((stage.candidates ?? []).length, 0.3),
                backgroundColor: stage.color ?? getDefaultStageColor(i, t),
                transition: 'flex 0.4s ease',
              }}
            />
          ))}
        </Box>

        {/* Accordion Columns */}
        <Box style={{ overflow: 'auto', maxHeight: 480 }} role="list" aria-label="Pipeline stages">
          {(stages ?? []).map((stage, stageIndex) => {
            const stageCandidates = stage.candidates ?? [];
            const stageColor = stage.color ?? getDefaultStageColor(stageIndex, t);
            const stageColorLight = getDefaultStageColorLight(stageIndex, t);
            const isExpanded = expandedStage === stage.id;
            const isOverLimit = stage.limit != null && stageCandidates.length >= stage.limit;

            return (
              <Box key={stage.id} role="listitem">
                {/* Stage Header (clickable accordion) */}
                <Box
                  style={{
                    padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                    borderBottom: `1px solid ${t.colors.neutral[100]}`,
                    borderLeft: `3px solid ${stageColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: isExpanded ? stageColorLight : t.colors.common.white,
                    transition: `background-color ${t.motion.hover}`,
                  }}
                  onClick={() => toggleExpanded((stage.id ?? ''))}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  aria-label={`${stage.name ?? 'Unknown'}: ${stageCandidates.length} candidates`}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpanded((stage.id ?? '')); } }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <ChevronRight
                      size={12}
                      color={t.colors.neutral[400]}
                      style={{
                        transform: isExpanded ? 'rotate(90deg)' : 'none',
                        transition: 'transform 200ms ease',
                      }}
                    />
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.medium,
                      color: t.colors.neutral[800],
                    }}>
                      {stage.name ?? 'Unknown'}
                    </Text>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                    {isOverLimit && <AlertTriangle size={10} color={t.colors.warningScale[600]} />}
                    <Box style={{
                      ...createBadgeStyle(t, isOverLimit ? 'warning' : 'secondary'),
                      borderRadius: badgeRadius,
                      padding: `0px ${t.spacing[1]}px`,
                    }}>
                      <Text style={{ fontSize: 9, fontWeight: t.typography.fontWeight.bold }}>
                        {stageCandidates.length}{stage.limit != null && `/${stage.limit}`}
                      </Text>
                    </Box>
                  </Box>
                </Box>

                {/* Expanded Candidates */}
                {isExpanded && (
                  <Box style={{ backgroundColor: t.colors.neutral[50] }}>
                    {stageCandidates.length === 0 && (
                      <Box style={{
                        padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                        textAlign: 'center',
                      }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          No candidates in this stage
                        </Text>
                      </Box>
                    )}
                    {stageCandidates.map((candidate, ci) => {
                      const candidateId = candidate.id ?? `card-${ci}`;
                      const isSelected = selectedCardId === candidateId;
                      const isHovered = hoveredCard === candidateId;
                      const daysInStage = getDaysInStage(candidate.appliedAt);

                      return (
                        <Box
                          key={candidateId}
                          tabIndex={0}
                          aria-label={`${candidate.name ?? 'Unknown'}, score ${candidate.score ?? 'N/A'}`}
                          onClick={() => handleCardClick(candidateId)}
                          onMouseEnter={() => setHoveredCard(candidateId)}
                          onMouseLeave={() => setHoveredCard(null)}
                          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(candidateId); } }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: t.spacing[2],
                            padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                            borderBottom: `1px solid ${t.colors.neutral[100]}`,
                            cursor: 'pointer',
                            backgroundColor: isSelected
                              ? t.colors.primaryScale[50]
                              : isHovered
                                ? t.colors.common.white
                                : 'transparent',
                            transition: `background-color ${t.motion.hover}`,
                          }}
                        >
                          <Box style={{
                            width: 22, height: 22, borderRadius: t.borderRadius.full,
                            backgroundColor: stageColorLight,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <Text style={{ fontSize: 8, fontWeight: t.typography.fontWeight.bold, color: stageColor }}>
                              {candidate.avatarInitial ?? '?'}
                            </Text>
                          </Box>
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text style={{
                              fontSize: t.typography.fontSize.xs,
                              fontWeight: t.typography.fontWeight.medium,
                              color: t.colors.neutral[800],
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                              {candidate.name ?? 'Unknown'}
                            </Text>
                          </Box>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                            <Clock size={9} color={getDaysColor(daysInStage, t)} />
                            <Text style={{ fontSize: 9, color: getDaysColor(daysInStage, t) }}>{daysInStage}d</Text>
                          </Box>
                          {candidate.score != null && (
                            <Box style={{
                              ...createBadgeStyle(t, getScoreBadgeKey(candidate.score)),
                              borderRadius: badgeRadius,
                              padding: `0px ${t.spacing[1]}px`,
                              flexShrink: 0,
                            }}>
                              <Text style={{ fontSize: 9, fontWeight: t.typography.fontWeight.bold }}>{candidate.score}</Text>
                            </Box>
                          )}
                        </Box>
                      );
                    })}

                    {/* Add candidate */}
                    <Box style={{ padding: `${t.spacing[1]}px ${t.spacing[4]}px ${t.spacing[2]}px` }}>
                      <button
                        onClick={() => stage.id && handleAddCandidate(stage.id)}
                        aria-label={`Add candidate to ${stage.name ?? 'stage'}`}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: 4, width: '100%',
                          padding: `${t.spacing[1]}px`,
                          borderRadius: t.borderRadius.sm,
                          border: `1px dashed ${t.colors.neutral[300]}`,
                          backgroundColor: 'transparent',
                          color: t.colors.neutral[400],
                          cursor: 'pointer', fontSize: t.typography.fontSize.xs,
                          transition: `all ${t.motion.hover}`,
                        }}
                      >
                        <Plus size={10} />
                        Add
                      </button>
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
        </Box>
      </Box>
    );
  },
});
