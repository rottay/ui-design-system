'use client';

/**
 * BhQuestionBank - Compact Preset
 * Small dashboard widget showing question bank statistics.
 * Features total count, dimension breakdown bars, recently added badge,
 * top-rated question preview, and effectiveness score.
 *
 * Personality-driven typography, glass-aware surfaces, entrance animations,
 * and full ARIA accessibility on all interactive elements.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhQuestionBankProps } from '../../core';
import { n } from '../../core';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEmptyStateStyle,
  createPersonalityAccentBar,
  createPersonalitySkeletonStyle,
  createProgressBarStyle,
  createStatValueStyle,
  createStatLabelStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import {
  BookOpen,
  Star,
  Plus,
  ArrowRight,
  ChevronRight,
  BarChart3,
  Sparkles,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Dimension color palette (token-based)                               */
/* ------------------------------------------------------------------ */

const DIMENSION_COLORS = [
  'primaryScale',
  'successScale',
  'warningScale',
  'infoScale',
] as const;

function getDimensionColor(index: number, tokens: any): string {
  const scaleKey = DIMENSION_COLORS[index % DIMENSION_COLORS.length];
  const scale = tokens.colors[scaleKey];
  return scale ? scale[400] : tokens.colors.primaryScale[400];
}

/* ------------------------------------------------------------------ */
/*  Preset                                                              */
/* ------------------------------------------------------------------ */

export const CompactBhQuestionBank = createPreset<BhQuestionBankProps>({
  name: 'BhQuestionBank.Compact',
  render: (ctx: PresetContext<BhQuestionBankProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      stats,
      loading,
      onBrowseQuestions,
      onViewQuestion,
      className,
      style,
    } = props;

    /* -- Token-based styles ------------------------------------------- */
    const personalityTypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const entranceAnim = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionHeader = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const emptyStyle = useMemo(() => createEmptyStateStyle(t), [t]);
    const skeletonStyle = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

    /* -- Loading state ------------------------------------------------ */
    if (loading) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
          padding: `${t.spacing[5]}px`,
          ...style,
        }} role="status" aria-label="Loading question bank">
          <Box style={{ ...skeletonStyle, height: 20, width: '55%' }} />
          <Box style={{ ...skeletonStyle, height: 40, width: '35%' }} />
          <Box style={{ ...skeletonStyle, height: 16, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 16, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 16, width: '80%' }} />
          <Box style={{ ...skeletonStyle, height: 60, width: '100%' }} />
        </Box>
      );
    }

    /* -- Empty state -------------------------------------------------- */
    if (!stats) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          ...style,
        }}>
          <Box style={{ ...emptyStyle, padding: `${t.spacing[4]}px` }}>
            <Box style={createIconContainerStyle(t, { size: 40 })}>
              <BookOpen size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No question bank data
            </Text>
          </Box>
        </Box>
      );
    }

    const topQuestion = stats.topRated.length > 0 ? stats.topRated[0] : null;
    const topDimensions = stats.byDimension.slice(0, 4);
    const maxDimensionCount = topDimensions.length > 0
      ? Math.max(...topDimensions.map(d => n(d.count))) : 1;
    const effectivenessBar = createProgressBarStyle(t, {
      percent: n(stats.avgEffectiveness),
    });

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="Question Bank"
        onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, cardHover.hover); }}
        onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, cardHover.base); }}
        style={{
          ...createCardStyle(t, { elevation: 'sm', padding: 0, glass: isGlass }),
          borderRadius: t.borderRadius.lg,
          overflow: 'hidden',
          ...entranceAnim.animate,
          transition: entranceAnim.transition,
          ...accentLayout.outer,
          ...style,
        }}
      >
        {/* Accent bar */}
        {accentBar && <Box style={accentBar} />}
        <Box style={{ ...accentLayout.inner, padding: `${t.spacing[5]}px` }}>

        {/* Title row */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: t.spacing[4],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Box style={createIconContainerStyle(t, { size: 32 })}>
              <BookOpen size={ICON_SIZES.section} color={t.colors.primaryScale[500]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.md,
              fontWeight: personalityTypo.headingWeight,
              letterSpacing: personalityTypo.headingLetterSpacing,
              color: t.colors.neutral[900],
            }}>
              Question Bank
            </Text>
          </Box>
          {n(stats.recentlyAdded) > 0 && (
            <Box style={{
              ...createBadgeStyle(t, 'success'),
              borderRadius: badgeRadius,
            }}>
              <Plus size={ICON_SIZES.inline} aria-hidden="true" />
              <Text style={{ fontSize: t.typography.fontSize.xs, marginLeft: 2 }}>
                {n(stats.recentlyAdded)} new
              </Text>
            </Box>
          )}
        </Box>

        {/* Total questions + effectiveness */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: t.spacing[4],
          marginBottom: t.spacing[4],
        }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={createStatValueStyle(t, { size: '2xl' })}>
              {n(stats.totalQuestions)}
            </Text>
            <Text style={createStatLabelStyle(t, { personality: personalityTypo })}>
              Total Questions
            </Text>
          </Box>
          <Box style={{
            display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
            flex: 1,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                Avg Effectiveness
              </Text>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[800],
              }}>
                {Math.round(n(stats.avgEffectiveness))}%
              </Text>
            </Box>
            <Box style={effectivenessBar.track}>
              <Box style={effectivenessBar.fill} />
            </Box>
          </Box>
        </Box>

        {/* Dimension breakdown */}
        {topDimensions.length > 0 && (
          <Box style={{ marginBottom: t.spacing[4] }}>
            <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>By Dimension</Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              {topDimensions.map((dim, idx) => {
                const pct = maxDimensionCount > 0 ? (n(dim.count) / maxDimensionCount) * 100 : 0;
                const barColor = getDimensionColor(idx, t);
                return (
                  <Box key={dim.dimension} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      color: t.colors.neutral[600],
                      width: 80,
                      flexShrink: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' as const,
                    }}>
                      {dim.dimension}
                    </Text>
                    <Box style={{
                      flex: 1, height: 6,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: t.colors.neutral[100],
                      overflow: 'hidden' as const,
                    }}>
                      <Box style={{
                        height: '100%',
                        width: `${pct}%`,
                        borderRadius: t.borderRadius.full,
                        backgroundColor: barColor,
                        transition: `width ${t.motion.hover}`,
                      }} />
                    </Box>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      color: t.colors.neutral[500],
                      width: 28,
                      textAlign: 'right' as const,
                      flexShrink: 0,
                    }}>
                      {n(dim.count)}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Top rated question preview */}
        {topQuestion && (
          <Box
            {...(onViewQuestion ? clickableProps(() => onViewQuestion(topQuestion.id), `View question: ${topQuestion.text}`) : {})}
            onClick={onViewQuestion ? () => onViewQuestion(topQuestion.id) : undefined}
            style={{
              padding: `${t.spacing[3]}px`,
              borderRadius: t.borderRadius.md,
              backgroundColor: t.colors.neutral[50],
              border: `1px solid ${t.colors.neutral[100]}`,
              cursor: onViewQuestion ? 'pointer' : 'default',
              transition: `all ${t.motion.hover}`,
            }}
          >
            <Box style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: t.spacing[1],
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Star size={ICON_SIZES.inline} color={t.colors.warningScale[500]} aria-hidden="true" />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.warningScale[600], fontWeight: t.typography.fontWeight.medium }}>
                  Top Rated
                </Text>
              </Box>
              <Box style={{
                ...createBadgeStyle(t, 'info'),
                borderRadius: badgeRadius,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{topQuestion.dimension}</Text>
              </Box>
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[700],
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap' as const,
              marginBottom: t.spacing[1],
            }}>
              {topQuestion.text}
            </Text>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Sparkles size={ICON_SIZES.inline} color={t.colors.successScale[500]} aria-hidden="true" />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  {Math.round(n(topQuestion.effectiveness))}% effective
                </Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BarChart3 size={ICON_SIZES.inline} color={t.colors.neutral[400]} aria-hidden="true" />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  {n(topQuestion.usageCount)} uses
                </Text>
              </Box>
            </Box>
          </Box>
        )}

        {/* Browse Questions link */}
        {onBrowseQuestions && (
          <Box
            role="button"
            tabIndex={0}
            aria-label="Browse all questions"
            onClick={onBrowseQuestions}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onBrowseQuestions(); }
            }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: t.spacing[1],
              marginTop: t.spacing[3],
              padding: `${t.spacing[2]}px`,
              borderRadius: t.borderRadius.md,
              cursor: 'pointer',
              transition: `all ${t.motion.hover}`,
            }}
          >
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.semibold,
              color: t.colors.primaryScale[600],
            }}>
              Browse Questions
            </Text>
            <ArrowRight size={ICON_SIZES.label} color={t.colors.primaryScale[600]} aria-hidden="true" />
          </Box>
        )}

        </Box>
      </div>
    );
  },
});
