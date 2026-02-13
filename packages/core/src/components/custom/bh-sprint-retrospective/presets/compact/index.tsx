'use client';

/**
 * BhSprintRetrospective - Compact Preset
 * Condensed summary of retrospective items grouped by category.
 * Designed for sidebar or dashboard widget placement.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ThumbsUp, Smile, AlertTriangle, Zap, MessageCircle, Activity,
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
} from '../../../helpers';
import type { BhSprintRetrospectiveProps, RetroItem } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_ITEMS: RetroItem[] = [
  { id: 'r1', text: 'AI screening reduced time-to-shortlist by 40%', category: 'good', votes: 5, author: 'Sarah Chen' },
  { id: 'r2', text: 'Interview rubric calibration needs improvement', category: 'improve', votes: 6, author: 'John Davis' },
  { id: 'r3', text: 'Create standardized rubric templates for each role type', category: 'action', votes: 7, author: 'Lisa Park' },
  { id: 'r4', text: 'Team collaboration on candidate reviews was excellent', category: 'good', votes: 3, author: 'Mike Wilson' },
  { id: 'r5', text: 'Pipeline visibility for hiring managers was lacking', category: 'improve', votes: 4, author: 'Sarah Chen' },
  { id: 'r6', text: 'Implement real-time pipeline dashboard', category: 'action', votes: 5, author: 'John Davis' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getCategoryIcon(category: RetroItem['category']) {
  switch (category) {
    case 'good': return Smile;
    case 'improve': return AlertTriangle;
    case 'action': return Zap;
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
      items = MOCK_ITEMS,
      sprintName = 'Sprint 12',
      onVote,
      loading = false,
      className,
      style,
    } = props;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

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
      () => [...items].sort((a, b) => b.votes - a.votes).slice(0, 5),
      [items],
    );

    if (loading) {
      return (
        <Box className={className} style={{ ...card, ...animStyle, ...style }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[4] }}>
            <Activity size={20} color={t.colors.neutral[300]} style={{ animation: 'pulse 1.5s infinite' }} />
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
            <MessageCircle size={16} color={t.colors.primaryScale[500]} />
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
                <Icon size={14} color={c.color[500]} />
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.neutral[900],
                  display: 'block',
                }}>
                  {counts[c.cat]}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
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
                  <Icon size={12} color={catColor} style={{ flexShrink: 0 }} />
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
                      onClick={() => handleVote(item.id)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleVote(item.id); } }}
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
                      <ThumbsUp size={10} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                        {item.votes}
                      </Text>
                    </Box>
                  ) : (
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], flexShrink: 0 }}>
                      <ThumbsUp size={10} color={t.colors.neutral[400]} />
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
