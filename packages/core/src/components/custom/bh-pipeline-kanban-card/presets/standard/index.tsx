'use client';

/**
 * BhPipelineKanbanCard - Standard Preset
 * Full card with candidate info, score badge, time-in-stage indicator,
 * tag chips, quick action buttons on hover, drag handle indicator.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  GripVertical, ArrowRight, XCircle, CalendarClock,
  Tag, Star, Clock, Maximize2,
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
  BhPipelineKanbanCardProps,
  KanbanCandidate,
  QuickActionType,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getScoreColor(score: number, t: DesignTokens): string {
  if (score >= 80) return t.colors.successScale[600];
  if (score >= 60) return t.colors.warningScale[600];
  return t.colors.errorScale[600];
}

function getScoreBg(score: number, t: DesignTokens): string {
  if (score >= 80) return t.colors.successScale[50];
  if (score >= 60) return t.colors.warningScale[50];
  return t.colors.errorScale[50];
}

function getScoreBadgeKey(score: number): 'success' | 'warning' | 'error' {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'error';
}

function getDaysInStage(appliedAt: Date): number {
  const diffMs = Date.now() - appliedAt.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function getDaysColor(days: number, t: DesignTokens): string {
  if (days <= 3) return t.colors.successScale[600];
  if (days <= 7) return t.colors.warningScale[600];
  return t.colors.errorScale[600];
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_CANDIDATE: KanbanCandidate = {
  id: 'kan-1',
  name: 'Sarah Johnson',
  avatarInitial: 'SJ',
  score: 85,
  stage: 'Technical Interview',
  appliedAt: new Date(Date.now() - 86400000 * 3),
  tags: ['Senior', 'Remote', 'Referred'],
};

/* ================================================================== */
/*  Standard Preset                                                    */
/* ================================================================== */

export const StandardBhPipelineKanbanCard = createPreset<BhPipelineKanbanCardProps>({
  name: 'BhPipelineKanbanCard.Standard',
  render: (ctx: PresetContext<BhPipelineKanbanCardProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      candidate = MOCK_CANDIDATE,
      isDragging = false,
      isSelected = false,
      onQuickAction,
      onExpand,
      onClick,
      className,
      style,
    } = props;

    const [isHovered, setIsHovered] = useState(false);


    const card = useMemo(() => createCardStyle(t, { elevation: isDragging ? 'lg' : 'sm', glass: isGlass }), [t, isGlass, isDragging]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const handleClick = useCallback(() => {
      onClick?.(candidate.id);
    }, [onClick, candidate.id]);

    const handleExpand = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      onExpand?.(candidate.id);
    }, [onExpand, candidate.id]);

    const handleQuickAction = useCallback((action: QuickActionType, e: React.MouseEvent) => {
      e.stopPropagation();
      onQuickAction?.(action, candidate.id);
    }, [onQuickAction, candidate.id]);

    const daysInStage = useMemo(() => getDaysInStage(candidate.appliedAt), [candidate.appliedAt]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    return (
      <Box
        className={className}
        role="article"
        aria-label={`Candidate card: ${candidate.name}, score ${candidate.score ?? 'N/A'}, ${daysInStage} days in stage`}
        tabIndex={0}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          cursor: 'pointer',
          opacity: isDragging ? 0.8 : 1,
          transform: isDragging ? 'rotate(2deg) scale(1.02)' : isHovered ? hoverStyles.hover.transform : 'none',
          boxShadow: isDragging ? t.shadows.lg : isHovered ? (hoverStyles.hover.boxShadow ?? card.boxShadow) : card.boxShadow,
          borderColor: isSelected ? t.colors.primaryScale[400] : undefined,
          backgroundColor: isSelected
            ? t.colors.primaryScale[50]
            : isDragging
              ? t.colors.common.white
              : isHovered
                ? (hoverStyles.hover.backgroundColor ?? t.colors.common.white)
                : t.colors.common.white,
          ...animStyle,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={{ ...accentLayout.inner, padding: t.spacing[3] }}>
          {/* Top row: drag handle + avatar + name + score */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
            {/* Drag handle */}
            <Box
              style={{
                color: t.colors.neutral[300],
                cursor: 'grab',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Drag to reorder"
              role="img"
            >
              <GripVertical size={14} />
            </Box>

            {/* Avatar */}
            <Box style={{
              width: 32, height: 32, borderRadius: t.borderRadius.full,
              backgroundColor: t.colors.primaryScale[100],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.primaryScale[700],
              }}>
                {candidate.avatarInitial}
              </Text>
            </Box>

            {/* Name */}
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[900],
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block',
              }}>
                {candidate.name}
              </Text>
            </Box>

            {/* Score badge */}
            {candidate.score != null && (
              <Box style={{
                ...createBadgeStyle(t, getScoreBadgeKey(candidate.score)),
                borderRadius: badgeRadius,
                padding: `1px ${t.spacing[2]}px`,
                flexShrink: 0,
              }}>
                <Star size={10} style={{ marginRight: 2 }} />
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold }}>
                  {candidate.score}
                </Text>
              </Box>
            )}
          </Box>

          {/* Time in stage */}
          <Box style={{ display: 'flex',
            alignItems: 'center',
            gap: t.spacing[1],
            marginBottom: t.spacing[2],
          }}>
            <Clock size={11} color={getDaysColor(daysInStage, t)} />
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              color: getDaysColor(daysInStage, t),
              fontWeight: t.typography.fontWeight.medium,
            }}>
              {daysInStage}d in stage
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginLeft: t.spacing[1] }}>
              Applied {formatDistanceToNow(candidate.appliedAt, { addSuffix: true })}
            </Text>
          </Box>

          {/* Tags */}
          {candidate.tags && candidate.tags.length > 0 && (
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[1], marginBottom: t.spacing[2] }}>
              {candidate.tags.map((tag) => (
                <Box
                  key={tag}
                  style={{
                    ...createBadgeStyle(t, 'secondary'),
                    borderRadius: badgeRadius,
                    padding: `0px ${t.spacing[2]}px`,
                  }}
                >
                  <Tag size={8} style={{ marginRight: 2 }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{tag}</Text>
                </Box>
              ))}
            </Box>
          )}

          {/* Quick Actions (on hover) */}
          {isHovered && !isDragging && (
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: t.spacing[2],
              borderTop: `1px solid ${t.colors.neutral[100]}`,
            }}>
              <Box style={{ display: 'flex', gap: t.spacing[1] }}>
                {[
                  { action: 'advance' as QuickActionType, icon: ArrowRight, label: 'Advance', color: t.colors.successScale },
                  { action: 'reject' as QuickActionType, icon: XCircle, label: 'Reject', color: t.colors.errorScale },
                  { action: 'schedule' as QuickActionType, icon: CalendarClock, label: 'Schedule', color: t.colors.infoScale },
                ].map((qa) => {
                  const Icon = qa.icon;
                  return (
                    <button
                      key={qa.action}
                      onClick={(e) => handleQuickAction(qa.action, e)}
                      aria-label={`${qa.label} ${candidate.name}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: t.spacing[1],
                        padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                        borderRadius: badgeRadius,
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.medium,
                        border: `1px solid ${qa.color[200]}`,
                        backgroundColor: qa.color[50],
                        color: qa.color[700],
                        cursor: 'pointer',
                        transition: `all ${t.motion.hover}`,
                      }}
                    >
                      <Icon size={10} />
                      {qa.label}
                    </button>
                  );
                })}
              </Box>
              <button
                onClick={handleExpand}
                aria-label={`Expand ${candidate.name} details`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24, borderRadius: t.borderRadius.md,
                  border: `1px solid ${t.colors.neutral[200]}`,
                  backgroundColor: t.colors.common.white, color: t.colors.neutral[500],
                  cursor: 'pointer', padding: 0,
                  transition: `all ${t.motion.hover}`,
                }}
              >
                <Maximize2 size={11} />
              </button>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
