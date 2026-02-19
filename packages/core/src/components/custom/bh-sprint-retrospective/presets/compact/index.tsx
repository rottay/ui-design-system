'use client';

/**
 * BhSprintRetrospective - Compact Preset
 * Condensed summary of retrospective items grouped by category.
 * Designed for sidebar or dashboard widget placement.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ThumbsUp, Smile, AlertTriangle, Zap, MessageCircle, Activity,
  Target, BarChart3, Users as UsersIcon,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createEmptyStateStyle,
  createListItemStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createStatValueStyle,
  createStatLabelStyle,
  ICON_SIZES,
  createPersonalityAccentBar,
} from '../../../helpers';
import type { BhSprintRetrospectiveProps, RetroItem } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getCategoryIcon(category: RetroItem['category']) {
  switch (category) {
    case 'good': return Smile;
    case 'improve': return AlertTriangle;
    case 'action': return Zap;
    default: return Zap;
  }
}

function getCategoryColor(category: RetroItem['category'], t: DesignTokens) {
  switch (category) {
    case 'good': return t.colors.successScale[600];
    case 'improve': return t.colors.warningScale[600];
    case 'action': return t.colors.primaryScale[600];
  }
}

function getCategoryBadge(category: RetroItem['category']): 'success' | 'warning' | 'primary' {
  switch (category) {
    case 'good': return 'success';
    case 'improve': return 'warning';
    case 'action': return 'primary';
    default: return 'primary';
  }
}

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhSprintRetrospective = createPreset<BhSprintRetrospectiveProps>({
  name: 'BhSprintRetrospective.Compact',
  render: (ctx: PresetContext<BhSprintRetrospectiveProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass && !!t.glass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      items: rawItems = [],
      sprint,
      sprintName: sprintNameProp = 'Sprint 12',
      onVote,
      goals: rawGoals,
      completionPercentage,
      memberSnapshot: rawMemberSnapshot,
      loading = false,
      className,
      style,
    } = props;

    const sprintName = sprint?.name ?? sprintNameProp;
    const goals = Array.isArray(rawGoals) ? rawGoals : [];
    const memberSnapshot = Array.isArray(rawMemberSnapshot) ? rawMemberSnapshot : [];

    const items = Array.isArray(rawItems) ? rawItems : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const handleVote = useCallback((itemId: string) => {
      onVote?.(itemId);
    }, [onVote]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const counts = useMemo(() => ({
      good: items.filter(i => i.category === 'good').length,
      improve: items.filter(i => i.category === 'improve').length,
      action: items.filter(i => i.category === 'action').length,
    }), [items]);

    const topItems = useMemo(
      () => [...items].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0)).slice(0, 5),
      [items],
    );

    if (loading) {
      return (
        <Box className={className} style={{ ...card, ...animStyle, ...style }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[4] }}>
            <Activity size={ICON_SIZES.feature} color={t.colors.neutral[300]} style={{ animation: 'pulse 1.5s infinite' }} />
          </Box>
        </Box>
      );
    }

    return (
      <Box
        className={className}
        role="region"
        aria-label={`Retrospective - ${sprintName}`}
        style={{
          ...card,
          width: '100%',
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <MessageCircle size={ICON_SIZES.section} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Retro
            </Text>
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
            {sprintName}
          </Text>
        </Box>

        {/* Sprint stats row */}
        {(completionPercentage != null || goals.length > 0 || memberSnapshot.length > 0) && (
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[3],
            padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
            borderBottom: `1px solid ${t.colors.neutral[100]}`,
            flexWrap: 'wrap',
          }}>
            {completionPercentage != null && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <BarChart3 size={ICON_SIZES.inline} color={completionPercentage >= 80 ? t.colors.successScale[500] : t.colors.warningScale[500]} />
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.bold,
                  color: completionPercentage >= 80 ? t.colors.successScale[700] : completionPercentage >= 50 ? t.colors.warningScale[700] : t.colors.errorScale[700],
                }}>
                  {completionPercentage}%
                </Text>
              </Box>
            )}
            {goals.length > 0 && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Target size={ICON_SIZES.inline} color={t.colors.primaryScale[500]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  {goals.length} goal{goals.length !== 1 ? 's' : ''}
                </Text>
              </Box>
            )}
            {memberSnapshot.length > 0 && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <UsersIcon size={ICON_SIZES.inline} color={t.colors.primaryScale[500]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  {memberSnapshot.length} member{memberSnapshot.length !== 1 ? 's' : ''}
                </Text>
              </Box>
            )}
          </Box>
        )}

        {/* Category counts */}
        <Box style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          {([
            { cat: 'good' as const, label: 'Good', icon: Smile, color: t.colors.successScale },
            { cat: 'improve' as const, label: 'Improve', icon: AlertTriangle, color: t.colors.warningScale },
            { cat: 'action' as const, label: 'Actions', icon: Zap, color: t.colors.primaryScale },
          ]).map((c) => {
            const Icon = c.icon;
            return (
              <Box
                key={c.cat}
                role="status"
                aria-label={`${c.label}: ${counts[c.cat]}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: t.spacing[1],
                  padding: `${t.spacing[3]}px ${t.spacing[2]}px`,
                  borderRight: c.cat !== 'action' ? `1px solid ${t.colors.neutral[100]}` : undefined,
                }}
              >
                <Icon size={ICON_SIZES.label} color={c.color[500]} />
                <Text style={createStatValueStyle(t, { size: 'lg' })}>
                  {counts[c.cat]}
                </Text>
                <Text style={createStatLabelStyle(t)}>
                  {c.label}
                </Text>
              </Box>
            );
          })}
        </Box>

        {/* Top voted items */}
        <Box role="list" aria-label="Top voted items">
          {topItems.length === 0 ? (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[3] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No items yet
              </Text>
            </Box>
          ) : (
            topItems.map(item => {
              const Icon = getCategoryIcon(item.category);
              const catColor = getCategoryColor(item.category, t);
              return (
                <Box
                  key={item.id}
                  role="listitem"
                  style={{
                    ...createListItemStyle(t, { interactive: !!onVote }),
                    padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing[2],
                  }}
                >
                  <Icon size={ICON_SIZES.label} color={catColor} style={{ flexShrink: 0 }} />
                  <Text style={{
                    flex: 1,
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[700],
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.text}
                  </Text>
                  {onVote ? (
                    <Box
                      tabIndex={0}
                      role="button"
                      aria-label={`Vote (${item.votes})`}
                      onClick={() => handleVote((item.id ?? ''))}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleVote((item.id ?? '')); } }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: t.spacing[1],
                        padding: `1px ${t.spacing[1]}px`,
                        borderRadius: badgeRadius,
                        fontSize: t.typography.fontSize.xs,
                        color: t.colors.neutral[500],
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: `all ${t.motion.hover}`,
                      }}
                    >
                      <ThumbsUp size={ICON_SIZES.inline} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                        {item.votes}
                      </Text>
                    </Box>
                  ) : (
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], flexShrink: 0 }}>
                      <ThumbsUp size={ICON_SIZES.inline} color={t.colors.neutral[400]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                        {item.votes}
                      </Text>
                    </Box>
                  )}
                </Box>
              );
            })
          )}
        </Box>
      </Box>
    );
  },
});
