'use client';

/**
 * BhCollaborationScore - Compact Preset
 * Dashboard widget showing hiring team collaboration score.
 * Includes circular score display, trend indicator, dimension bars,
 * response rate stats, top collaborator callout, and improve score link.
 *
 * Personality-driven typography, glass-aware surfaces, entrance animations,
 * and full ARIA accessibility on all interactive elements.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhCollaborationScoreProps } from '../../core';
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
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Clock,
  MessageSquare,
  Star,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Preset                                                              */
/* ------------------------------------------------------------------ */

export const CompactBhCollaborationScore = createPreset<BhCollaborationScoreProps>({
  name: 'BhCollaborationScore.Compact',
  render: (ctx: PresetContext<BhCollaborationScoreProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      data,
      loading,
      onViewDetails,
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

    /* -- Circular score display --------------------------------------- */
    const renderCircularScore = useMemo(() => {
      if (!data) return null;
      const score = n(data.overallScore);
      const radius = 34;
      const circumference = 2 * Math.PI * radius;
      const pct = Math.min(100, Math.max(0, score));
      const dashOffset = circumference - (pct / 100) * circumference;
      const scoreColor = score >= 80
        ? t.colors.successScale[500]
        : score >= 60
          ? t.colors.warningScale[500]
          : t.colors.errorScale[500];

      return (
        <svg width={84} height={84} viewBox="0 0 84 84" aria-hidden="true">
          <circle
            cx={42} cy={42} r={radius}
            fill="none"
            stroke={t.colors.neutral[100]}
            strokeWidth={7}
          />
          <circle
            cx={42} cy={42} r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth={7}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 42 42)"
            style={{ transition: `stroke-dashoffset 0.6s ease` }}
          />
          <text
            x={42} y={46}
            textAnchor="middle"
            fontSize={t.typography.fontSize.xl}
            fontWeight={t.typography.fontWeight.bold}
            fill={t.colors.neutral[900]}
          >
            {Math.round(score)}
          </text>
        </svg>
      );
    }, [data, t]);

    /* -- Trend icon --------------------------------------------------- */
    const TrendIcon = data?.trend === 'up' ? TrendingUp : data?.trend === 'down' ? TrendingDown : Minus;
    const trendColor = data?.trend === 'up'
      ? t.colors.successScale[600]
      : data?.trend === 'down'
        ? t.colors.errorScale[600]
        : t.colors.neutral[400];
    const trendLabel = data?.trend === 'up' ? 'Improving' : data?.trend === 'down' ? 'Declining' : 'Stable';

    /* -- Loading state ------------------------------------------------ */
    if (loading) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
          padding: `${t.spacing[5]}px`,
          ...style,
        }} role="status" aria-label="Loading collaboration score">
          <Box style={{ ...skeletonStyle, height: 20, width: '60%' }} />
          <Box style={{ display: 'flex', justifyContent: 'center' }}>
            <Box style={{ ...skeletonStyle, height: 84, width: 84, borderRadius: t.borderRadius.full }} />
          </Box>
          <Box style={{ ...skeletonStyle, height: 16, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 16, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 16, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 16, width: '100%' }} />
        </Box>
      );
    }

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="Collaboration Score"
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
              <Users size={ICON_SIZES.section} color={t.colors.primaryScale[500]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.md,
              fontWeight: personalityTypo.headingWeight,
              letterSpacing: personalityTypo.headingLetterSpacing,
              color: t.colors.neutral[900],
            }}>
              Collaboration Score
            </Text>
          </Box>
          {data && (
            <Box style={{
              ...createBadgeStyle(t, 'secondary'),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {n(data.teamSize)} members
              </Text>
            </Box>
          )}
        </Box>

        {/* Score display + trend */}
        {data && (
          <Box style={{
            display: 'flex', alignItems: 'center', gap: t.spacing[4],
            marginBottom: t.spacing[4],
          }}>
            {renderCircularScore}
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              <Text style={createStatLabelStyle(t, { personality: personalityTypo })}>
                Overall Score
              </Text>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <TrendIcon size={ICON_SIZES.label} color={trendColor} aria-hidden="true" />
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.medium,
                  color: trendColor,
                }}>
                  {trendLabel}
                </Text>
              </Box>
            </Box>
          </Box>
        )}

        {/* Dimension bars (simplified radar as horizontal bars) */}
        {data && data.dimensions.length > 0 && (
          <Box style={{ marginBottom: t.spacing[4] }}>
            <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Dimensions</Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              {data.dimensions.map((dim, idx) => {
                const dimScore = n(dim.score);
                const dimColor = dimScore >= 80
                  ? t.colors.successScale[500]
                  : dimScore >= 60
                    ? t.colors.warningScale[500]
                    : t.colors.errorScale[500];
                const progressStyles = createProgressBarStyle(t, { color: dimColor, percent: dimScore });
                const dimEntrance = createEntranceAnimation(t, { index: idx });
                return (
                  <Box key={dim.name} style={{ ...dimEntrance.animate }}>
                    <Box style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: 2,
                    }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        color: t.colors.neutral[600],
                      }}>
                        {dim.name}
                      </Text>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: t.colors.neutral[800],
                      }}>
                        {Math.round(dimScore)}
                      </Text>
                    </Box>
                    <Box style={{ ...progressStyles.track, height: 6 }}>
                      <Box style={{ ...progressStyles.fill, height: 6 }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Stats row: response rate + avg feedback time */}
        {data && (
          <Box style={{
            display: 'flex', gap: t.spacing[3],
            marginBottom: t.spacing[3],
          }}>
            <Box style={{
              flex: 1,
              padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
              borderRadius: t.borderRadius.md,
              backgroundColor: t.colors.neutral[50],
              border: `1px solid ${t.colors.neutral[100]}`,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: 2 }}>
                <MessageSquare size={ICON_SIZES.inline} color={t.colors.neutral[400]} aria-hidden="true" />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  Response Rate
                </Text>
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[900],
              }}>
                {Math.round(n(data.responseRate))}%
              </Text>
            </Box>
            <Box style={{
              flex: 1,
              padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
              borderRadius: t.borderRadius.md,
              backgroundColor: t.colors.neutral[50],
              border: `1px solid ${t.colors.neutral[100]}`,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: 2 }}>
                <Clock size={ICON_SIZES.inline} color={t.colors.neutral[400]} aria-hidden="true" />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  Avg Feedback
                </Text>
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[900],
              }}>
                {n(data.avgFeedbackTime)}h
              </Text>
            </Box>
          </Box>
        )}

        {/* Top collaborator callout */}
        {data?.topCollaborator && (
          <Box style={{
            display: 'flex', alignItems: 'center', gap: t.spacing[2],
            padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
            borderRadius: t.borderRadius.md,
            backgroundColor: t.colors.primaryScale[50],
            border: `1px solid ${t.colors.primaryScale[100]}`,
            marginBottom: t.spacing[3],
          }}>
            <Star size={ICON_SIZES.label} color={t.colors.primaryScale[500]} aria-hidden="true" />
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.neutral[700],
              flex: 1,
            }}>
              Top collaborator: <Text style={{ fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>{data.topCollaborator.name}</Text>
            </Text>
            <Box style={{
              ...createBadgeStyle(t, 'primary'),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{Math.round(n(data.topCollaborator.score))}</Text>
            </Box>
          </Box>
        )}

        {/* Empty state */}
        {!data && (
          <Box style={{ ...emptyStyle, padding: `${t.spacing[4]}px` }}>
            <Box style={createIconContainerStyle(t, { size: 40 })}>
              <Users size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No collaboration data yet
            </Text>
          </Box>
        )}

        {/* Improve Score link */}
        {onViewDetails && data && (
          <Box
            role="button"
            tabIndex={0}
            aria-label="Improve collaboration score"
            onClick={onViewDetails}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewDetails(); }
            }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: t.spacing[1],
              marginTop: t.spacing[1],
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
              Improve Score
            </Text>
            <ArrowRight size={ICON_SIZES.label} color={t.colors.primaryScale[600]} aria-hidden="true" />
          </Box>
        )}

        </Box>
      </div>
    );
  },
});
