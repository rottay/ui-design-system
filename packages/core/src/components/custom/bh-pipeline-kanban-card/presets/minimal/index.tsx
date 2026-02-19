'use client';

/**
 * BhPipelineKanbanCard - Minimal Preset
 * Slim card with essential info: name, score, time indicator.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  GripVertical, ArrowRight, XCircle, CalendarClock,
  Star, Clock,
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

  createDividerStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type {
  BhPipelineKanbanCardProps,
  KanbanCandidate,
  QuickActionType,
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

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Minimal Preset                                                     */
/* ================================================================== */

export const MinimalBhPipelineKanbanCard = createPreset<BhPipelineKanbanCardProps>({
  name: 'BhPipelineKanbanCard.Minimal',
  render: (ctx: PresetContext<BhPipelineKanbanCardProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      candidate: rawCandidate = {} as Partial<KanbanCandidate>,
      isDragging = false,
      isSelected = false,
      onQuickAction,
      onClick,
      className,
      style,
    } = props;

    const candidate = (Array.isArray(rawCandidate) ? rawCandidate : rawCandidate ?? {}) as Partial<KanbanCandidate>;

    const [isHovered, setIsHovered] = useState(false);

    const card = useMemo(() => createCardStyle(t, { elevation: isDragging ? 'md' : 'sm', glass: isGlass }), [t, isGlass, isDragging]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const candidateId = candidate?.id ?? '';

    const handleClick = useCallback(() => {
      if (candidateId) onClick?.(candidateId);
    }, [onClick, candidateId]);

    const handleQuickAction = useCallback((action: QuickActionType, e: React.MouseEvent) => {
      e.stopPropagation();
      if (candidateId) onQuickAction?.(action, candidateId);
    }, [onQuickAction, candidateId]);

    const daysInStage = useMemo(() => getDaysInStage(candidate.appliedAt), [candidate.appliedAt]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const divider = useMemo(() => createDividerStyle(t), [t]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

    return (
      <Box
        className={className}
        role="article"
        aria-label={`${candidate?.name ?? 'Unknown'}, score ${candidate?.score ?? 'N/A'}`}
        tabIndex={0}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
        style={{
          ...card,
          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
          cursor: 'pointer',
          opacity: isDragging ? 0.8 : 1,
          transform: isDragging ? 'rotate(1deg)' : isHovered ? hoverStyles.hover.transform : 'none',
          boxShadow: isDragging ? t.shadows.md : isHovered ? (hoverStyles.hover.boxShadow ?? card.boxShadow) : card.boxShadow,
          borderColor: isSelected ? t.colors.primaryScale[400] : undefined,
          backgroundColor: isSelected ? t.colors.primaryScale[50] : t.colors.common.white,
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing[2],
          ...animStyle,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}
        {/* Drag handle */}
        <Box
          style={{ color: t.colors.neutral[300], cursor: 'grab', flexShrink: 0, display: 'flex', alignItems: 'center' }}
          aria-label="Drag to reorder"
          role="img"
        >
          <GripVertical size={12} />
        </Box>

        {/* Avatar */}
        <Box style={{
          width: 24, height: 24, borderRadius: t.borderRadius.full,
          backgroundColor: t.colors.primaryScale[100],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Text style={{
            fontSize: 9,
            fontWeight: t.typography.fontWeight.bold,
            color: t.colors.primaryScale[700],
          }}>
            {candidate?.avatarInitial ?? '?'}
          </Text>
        </Box>

        {/* Name + days */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text style={{
            fontSize: t.typography.fontSize.xs,
            fontWeight: t.typography.fontWeight.medium,
            color: t.colors.neutral[900],
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
          }}>
            {candidate?.name ?? 'Unknown'}
          </Text>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
            <Clock size={9} color={getDaysColor(daysInStage, t)} />
            <Text style={{ fontSize: 9, color: getDaysColor(daysInStage, t) }}>
              {daysInStage}d
            </Text>
          </Box>
        </Box>

        {/* Score */}
        {candidate.score != null && (
          <Box style={{
            ...createBadgeStyle(t, getScoreBadgeKey(candidate.score)),
            borderRadius: badgeRadius,
            padding: `0px ${t.spacing[1]}px`,
            flexShrink: 0,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold }}>
              {candidate.score}
            </Text>
          </Box>
        )}

        {/* Quick actions on hover */}
        {isHovered && !isDragging && (
          <Box style={{ display: 'flex', gap: t.spacing[1], flexShrink: 0 }}>
            {[
              { action: 'advance' as QuickActionType, icon: ArrowRight, label: 'Advance', color: t.colors.successScale },
              { action: 'reject' as QuickActionType, icon: XCircle, label: 'Reject', color: t.colors.errorScale },
            ].map((qa) => {
              const Icon = qa.icon;
              return (
                <button
                  key={qa.action}
                  onClick={(e) => handleQuickAction(qa.action, e)}
                  aria-label={`${qa.label} ${candidate?.name ?? 'Unknown'}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 20, height: 20, borderRadius: t.borderRadius.sm,
                    border: `1px solid ${qa.color[200]}`,
                    backgroundColor: qa.color[50], color: qa.color[600],
                    cursor: 'pointer', padding: 0,
                    transition: `all ${t.motion.hover}`,
                  }}
                >
                  <Icon size={10} />
                </button>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
