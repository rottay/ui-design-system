'use client';

/**
 * BhSprintRetrospective - Form Preset
 * Three-column retrospective board: What went well, What to improve, Action Items.
 * Supports adding items, voting, and deletion.
 * Personality-driven, glass-aware. Only uses Box and Text primitives.
 */

import { useState, useMemo, useCallback} from 'react';
import {
  ThumbsUp, Trash2, Plus, Smile, AlertTriangle, Zap,
  MessageCircle, Users, Activity, Target, CheckCircle2,
  BarChart3, User,
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
  createMetadataFieldStyle, createMetadataGridStyle,
  createStatValueStyle, createStatLabelStyle, ICON_SIZES,

  createDividerStyle,
} from '../../../helpers';
import type { BhSprintRetrospectiveProps, RetroItem } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

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
    default:
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
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      items: rawItems = [],
      sprint,
      sprintName: sprintNameProp = 'Sprint 12',
      onAddItem,
      onVote,
      onDeleteItem,
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
      good: items.filter(i => i.category === 'good').sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0)),
      improve: items.filter(i => i.category === 'improve').sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0)),
      action: items.filter(i => i.category === 'action').sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0)),
    }), [items]);

    const totalVotes = useMemo(() => items.reduce((s, i) => s + (i.votes ?? 0), 0), [items]);

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
        onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
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
                <MessageCircle size={ICON_SIZES.feature} color={t.colors.primaryScale[600]} />
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

        {/* Sprint Overview: Completion + Goals + Members */}
        {(completionPercentage != null || goals.length > 0 || memberSnapshot.length > 0) && (
          <Box style={{
            display: 'grid',
            gridTemplateColumns: completionPercentage != null ? (goals.length > 0 || memberSnapshot.length > 0 ? '1fr 2fr' : '1fr') : '1fr',
            gap: t.spacing[4],
          }}>
            {/* Completion percentage */}
            {completionPercentage != null && (
              <Box style={{ ...card, ...animStyle(1), display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: t.spacing[2] }}>
                <Box style={createIconContainerStyle(t, { size: 40, color: completionPercentage >= 80 ? t.colors.successScale[50] : completionPercentage >= 50 ? t.colors.warningScale[50] : t.colors.errorScale[50] })}>
                  <BarChart3 size={ICON_SIZES.feature} color={completionPercentage >= 80 ? t.colors.successScale[600] : completionPercentage >= 50 ? t.colors.warningScale[600] : t.colors.errorScale[600]} />
                </Box>
                <Text style={{
                  ...createStatValueStyle(t, { size: '2xl' }),
                  color: completionPercentage >= 80 ? t.colors.successScale[700] : completionPercentage >= 50 ? t.colors.warningScale[700] : t.colors.errorScale[700],
                }}>
                  {completionPercentage}%
                </Text>
                <Text style={createStatLabelStyle(t, { personality: ptypo })}>
                  Sprint Completion
                </Text>
              </Box>
            )}

            {/* Goals + Members */}
            {(goals.length > 0 || memberSnapshot.length > 0) && (
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4] }}>
                {/* Sprint Goals */}
                {goals.length > 0 && (
                  <Box style={{ ...card, ...animStyle(2) }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
                      <Target size={ICON_SIZES.section} color={t.colors.primaryScale[500]} />
                      <Text style={sectionLabel}>Sprint Goals</Text>
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                      {goals.map((goal, i) => (
                        <Box key={i} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: t.spacing[2],
                          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                          borderRadius: t.borderRadius.md,
                          backgroundColor: t.colors.neutral[50],
                          border: `1px solid ${t.colors.neutral[100]}`,
                        }}>
                          <CheckCircle2 size={14} color={t.colors.successScale[500]} style={{ flexShrink: 0, marginTop: 2 }} />
                          <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], lineHeight: 1.5 }}>
                            {goal}
                          </Text>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Member Snapshot */}
                {memberSnapshot.length > 0 && (
                  <Box style={{ ...card, ...animStyle(3) }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
                      <Users size={ICON_SIZES.section} color={t.colors.primaryScale[500]} />
                      <Text style={sectionLabel}>Team Members</Text>
                    </Box>
                    <Box style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[2] }}>
                      {memberSnapshot.map((member) => (
                        <Box key={member.recruiterId} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: t.spacing[2],
                          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                          borderRadius: t.borderRadius.md,
                          backgroundColor: t.colors.neutral[50],
                          border: `1px solid ${t.colors.neutral[100]}`,
                        }}>
                          <Box style={createIconContainerStyle(t, { size: 28, color: t.colors.primaryScale[50] })}>
                            <User size={13} color={t.colors.primaryScale[600]} />
                          </Box>
                          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                              {member.name}
                            </Text>
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                              {member.placementsMade} placements
                            </Text>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}

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
                    <Icon size={ICON_SIZES.section} color={config.color} />
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
                              onClick={() => handleVote((item.id ?? ''))}
                              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleVote((item.id ?? '')); } }}
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
                              <ThumbsUp size={ICON_SIZES.inline} />
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
                              onClick={() => handleDelete((item.id ?? ''))}
                              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDelete((item.id ?? '')); } }}
                              style={{
                                display: 'flex', alignItems: 'center',
                                padding: 2,
                                borderRadius: t.borderRadius.sm,
                                color: t.colors.neutral[400],
                                cursor: 'pointer',
                                transition: `all ${t.motion.hover}`,
                              }}
                            >
                              <Trash2 size={ICON_SIZES.label} />
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
