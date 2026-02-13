'use client';

/**
 * BhSprintRetrospective - Form Preset
 * Three-column retrospective board: What went well, What to improve, Action Items.
 * Supports adding items, voting, and deletion.
 * Personality-driven, glass-aware. Only uses Box and Text primitives.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ThumbsUp, Trash2, Plus, Smile, AlertTriangle, Zap,
  MessageCircle, Users, Activity,
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
  createPersonalityAccentBar,
  createEmptyStateStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
} from '../../../helpers';
import type { BhSprintRetrospectiveProps, RetroItem } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_ITEMS: RetroItem[] = [
  { id: 'r1', text: 'AI screening reduced time-to-shortlist by 40%', category: 'good', votes: 5, author: 'Sarah Chen' },
  { id: 'r2', text: 'Team collaboration on candidate reviews was excellent', category: 'good', votes: 3, author: 'Mike Wilson' },
  { id: 'r3', text: 'Automated scheduling saved hours of coordinator time', category: 'good', votes: 4, author: 'Lisa Park' },
  { id: 'r4', text: 'Interview rubric calibration needs improvement', category: 'improve', votes: 6, author: 'John Davis' },
  { id: 'r5', text: 'Pipeline visibility for hiring managers was lacking', category: 'improve', votes: 4, author: 'Sarah Chen' },
  { id: 'r6', text: 'Candidate feedback loop was too slow', category: 'improve', votes: 2, author: 'Mike Wilson' },
  { id: 'r7', text: 'Create standardized rubric templates for each role type', category: 'action', votes: 7, author: 'Lisa Park' },
  { id: 'r8', text: 'Implement real-time pipeline dashboard for hiring managers', category: 'action', votes: 5, author: 'John Davis' },
  { id: 'r9', text: 'Set up automated candidate status notifications', category: 'action', votes: 3, author: 'Sarah Chen' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getCategoryConfig(category: RetroItem['category'], t: DesignTokens) {
  switch (category) {
    case 'good':
      return {
        label: 'What Went Well',
        icon: Smile,
        color: t.colors.successScale[600],
        bg: t.colors.successScale[50],
        border: t.colors.successScale[200],
        badge: 'success' as const,
      };
    case 'improve':
      return {
        label: 'What to Improve',
        icon: AlertTriangle,
        color: t.colors.warningScale[600],
        bg: t.colors.warningScale[50],
        border: t.colors.warningScale[200],
        badge: 'warning' as const,
      };
    case 'action':
      return {
        label: 'Action Items',
        icon: Zap,
        color: t.colors.primaryScale[600],
        bg: t.colors.primaryScale[50],
        border: t.colors.primaryScale[200],
        badge: 'primary' as const,
      };
  }
}

/* ================================================================== */
/*  Form Preset                                                        */
/* ================================================================== */

export const FormBhSprintRetrospective = createPreset<BhSprintRetrospectiveProps>({
  name: 'BhSprintRetrospective.Form',
  render: (ctx: PresetContext<BhSprintRetrospectiveProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass && !!t.glass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      items = MOCK_ITEMS,
      sprintName = 'Sprint 12',
      onAddItem,
      onVote,
      onDeleteItem,
      loading = false,
      className,
      style,
    } = props;

    const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({ good: '', improve: '', action: '' });

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const handleVote = useCallback((itemId: string) => {
      onVote?.(itemId);
    }, [onVote]);

    const handleDelete = useCallback((itemId: string) => {
      onDeleteItem?.(itemId);
    }, [onDeleteItem]);

    const handleAdd = useCallback((category: string) => {
      const text = newItemTexts[category]?.trim();
      if (text) {
        onAddItem?.(category, text);
        setNewItemTexts(prev => ({ ...prev, [category]: '' }));
      }
    }, [onAddItem, newItemTexts]);

    const handleInputChange = useCallback((category: string, value: string) => {
      setNewItemTexts(prev => ({ ...prev, [category]: value }));
    }, []);

    const animStyle = useCallback((index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    }), [entrance, t]);

    const categorizedItems = useMemo(() => ({
      good: items.filter(i => i.category === 'good').sort((a, b) => b.votes - a.votes),
      improve: items.filter(i => i.category === 'improve').sort((a, b) => b.votes - a.votes),
      action: items.filter(i => i.category === 'action').sort((a, b) => b.votes - a.votes),
    }), [items]);

    const totalVotes = useMemo(() => items.reduce((s, i) => s + i.votes, 0), [items]);

    if (loading) {
      return (
        <Box className={className} style={{ ...card, ...animStyle(0), ...style }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[8] }}>
            <Activity size={24} color={t.colors.neutral[300]} style={{ animation: 'pulse 1.5s infinite' }} />
          </Box>
        </Box>
      );
    }

    return (
      <Box
        className={className}
        role="region"
        aria-label={`Sprint Retrospective - ${sprintName}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: t.spacing[5],
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{ ...card, ...animStyle(0), ...accentLayout.outer }}>
          {accentBar && <Box style={accentBar} />}
          <Box style={accentLayout.inner}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[50] })}>
                <MessageCircle size={20} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                  display: 'block',
                }}>
                  Sprint Retrospective
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                  {sprintName}
                </Text>
              </Box>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box role="status" aria-label={`${items.length} items`} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Users size={14} color={t.colors.neutral[400]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  {items.length} items
                </Text>
              </Box>
              <Box role="status" aria-label={`${totalVotes} votes`} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <ThumbsUp size={14} color={t.colors.neutral[400]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  {totalVotes} votes
                </Text>
              </Box>
            </Box>
          </Box>
          </Box>
        </Box>

        {/* Three-column board */}
        <Box style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: t.spacing[4],
        }}>
          {(['good', 'improve', 'action'] as const).map((category, colIdx) => {
            const config = getCategoryConfig(category, t);
            const categoryItems = categorizedItems[category];
            const Icon = config.icon;

            return (
              <Box key={category} style={{ ...card, padding: 0, overflow: 'hidden', ...animStyle(colIdx + 1) }}>
                {/* Category header */}
                <Box style={{
                  padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                  borderBottom: `2px solid ${config.border}`,
                  backgroundColor: config.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Icon size={16} color={config.color} />
                    <Text style={{
                      fontSize: t.typography.fontSize.sm,
                      fontWeight: t.typography.fontWeight.bold,
                      color: config.color,
                    }}>
                      {config.label}
                    </Text>
                  </Box>
                  <Box style={{ ...createBadgeStyle(t, config.badge), borderRadius: badgeRadius }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs }}>{categoryItems.length}</Text>
                  </Box>
                </Box>

                {/* Items */}
                <Box
                  role="list"
                  aria-label={config.label}
                  style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
                >
                  {categoryItems.length === 0 && (
                    <Box style={{ padding: t.spacing[4], textAlign: 'center' }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                        No items yet
                      </Text>
                    </Box>
                  )}
                  {categoryItems.map((item, i) => (
                    <Box
                      key={item.id}
                      role="listitem"
                      style={{
                        padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                        borderBottom: `1px solid ${t.colors.neutral[100]}`,
                        transition: `background-color ${t.motion.hover}`,
                      }}
                    >
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        color: t.colors.neutral[800],
                        lineHeight: 1.5,
                        display: 'block',
                        marginBottom: t.spacing[2],
                      }}>
                        {item.text}
                      </Text>
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          {item.author}
                        </Text>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                          {onVote && (
                            <Box
                              tabIndex={0}
                              role="button"
                              aria-label={`Vote for "${item.text}" (${item.votes} votes)`}
                              onClick={() => handleVote(item.id)}
                              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleVote(item.id); } }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: t.spacing[1],
                                padding: `2px ${t.spacing[2]}px`,
                                borderRadius: badgeRadius,
                                border: `1px solid ${t.colors.neutral[200]}`,
                                fontSize: t.typography.fontSize.xs,
                                color: t.colors.neutral[600],
                                cursor: 'pointer',
                                transition: `all ${t.motion.hover}`,
                              }}
                            >
                              <ThumbsUp size={10} />
                              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                                {item.votes}
                              </Text>
                            </Box>
                          )}
                          {onDeleteItem && (
                            <Box
                              tabIndex={0}
                              role="button"
                              aria-label={`Delete "${item.text}"`}
                              onClick={() => handleDelete(item.id)}
                              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDelete(item.id); } }}
                              style={{
                                display: 'flex', alignItems: 'center',
                                padding: 2,
                                borderRadius: t.borderRadius.sm,
                                color: t.colors.neutral[400],
                                cursor: 'pointer',
                                transition: `all ${t.motion.hover}`,
                              }}
                            >
                              <Trash2 size={12} />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Add item form */}
                {onAddItem && (
                  <Box style={{
                    padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                    borderTop: `1px solid ${t.colors.neutral[100]}`,
                    backgroundColor: t.colors.neutral[50],
                    display: 'flex',
                    gap: t.spacing[2],
                  }}>
                    <input
                      type="text"
                      aria-label={`Add item to ${config.label}`}
                      placeholder="Add an item..."
                      value={newItemTexts[category] || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(category, e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAdd(category);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                        borderRadius: t.borderRadius.md,
                        border: `1px solid ${t.colors.neutral[200]}`,
                        backgroundColor: t.colors.common.white,
                        fontSize: t.typography.fontSize.sm,
                        color: t.colors.neutral[800],
                        outline: 'none',
                      }}
                    />
                    <Box
                      tabIndex={0}
                      role="button"
                      aria-label={`Submit item to ${config.label}`}
                      onClick={() => handleAdd(category)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAdd(category); } }}
                      style={{
                        width: 32, height: 32,
                        borderRadius: t.borderRadius.md,
                        backgroundColor: config.color,
                        color: t.colors.common.white,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        transition: `all ${t.motion.hover}`,
                        flexShrink: 0,
                      }}
                    >
                      <Plus size={16} />
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
