'use client';

/**
 * BhOkrTracker - Compact Preset
 * Small dashboard widget for OKR progress at a glance.
 * Includes circular progress ring, days remaining, status counts,
 * top objectives with progress bars, and key result mini-progress.
 *
 * Personality-driven typography, glass-aware surfaces, entrance animations,
 * and full ARIA accessibility on all interactive elements.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhOkrTrackerProps, OkrObjective } from '../../core';
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
  createStatLabelStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import {
  Target,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function getStatusBadgeVariant(status: OkrObjective['status']): 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'on_track': return 'success';
    case 'at_risk': return 'warning';
    case 'behind': return 'error';
    case 'completed': return 'info';
  }
}

function getStatusLabel(status: OkrObjective['status']): string {
  switch (status) {
    case 'on_track': return 'On Track';
    case 'at_risk': return 'At Risk';
    case 'behind': return 'Behind';
    case 'completed': return 'Done';
  }
}

function getProgressColor(status: OkrObjective['status'], tokens: any): string {
  switch (status) {
    case 'on_track': return tokens.colors.successScale[500];
    case 'at_risk': return tokens.colors.warningScale[500];
    case 'behind': return tokens.colors.errorScale[500];
    case 'completed': return tokens.colors.infoScale[500];
  }
}

function getRingColor(progress: number, tokens: any): string {
  if (progress >= 75) return tokens.colors.successScale[500];
  if (progress >= 50) return tokens.colors.warningScale[500];
  return tokens.colors.errorScale[500];
}

/* ------------------------------------------------------------------ */
/*  Preset                                                            */
/* ------------------------------------------------------------------ */

export const CompactBhOkrTracker = createPreset<BhOkrTrackerProps>({
  name: 'BhOkrTracker.Compact',
  render: (ctx: PresetContext<BhOkrTrackerProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      data,
      loading,
      onViewObjective,
      onViewAll,
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
        }} role="status" aria-label="Loading OKR tracker">
          <Box style={{ ...skeletonStyle, height: 20, width: '50%' }} />
          <Box style={{ ...skeletonStyle, height: 64, width: 64, borderRadius: '50%' }} />
          <Box style={{ ...skeletonStyle, height: 24, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 60, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 60, width: '100%' }} />
        </Box>
      );
    }

    /* -- Empty state -------------------------------------------------- */
    if (!data) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          ...style,
        }}>
          <Box style={{ ...emptyStyle, padding: `${t.spacing[4]}px` }}>
            <Box style={createIconContainerStyle(t, { size: 40 })}>
              <Target size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No OKR data available
            </Text>
          </Box>
        </Box>
      );
    }

    const overallProgress = n(data.overallProgress);
    const ringColor = getRingColor(overallProgress, t);
    const topObjectives = data.objectives.slice(0, 3);
    const completedCount = data.objectives.filter(o => o.status === 'completed').length;

    /* SVG ring dimensions */
    const ringSize = 64;
    const ringRadius = 26;
    const ringCircumference = 2 * Math.PI * ringRadius;

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="OKR Tracker"
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
              <Target size={ICON_SIZES.section} color={t.colors.primaryScale[500]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.md,
              fontWeight: personalityTypo.headingWeight,
              letterSpacing: personalityTypo.headingLetterSpacing,
              color: t.colors.neutral[900],
            }}>
              OKR Tracker
            </Text>
          </Box>
          {data.period && (
            <Box style={{
              ...createBadgeStyle(t, 'secondary'),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{data.period}</Text>
            </Box>
          )}
        </Box>

        {/* Progress ring + days remaining + status counts */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: t.spacing[4],
          marginBottom: t.spacing[4],
        }}>
          {/* Circular progress ring */}
          <Box style={{ position: 'relative' as const, width: ringSize, height: ringSize, flexShrink: 0 }}>
            <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`} aria-hidden="true">
              <circle
                cx={ringSize / 2} cy={ringSize / 2} r={ringRadius}
                fill="none"
                stroke={t.colors.neutral[100]}
                strokeWidth={6}
              />
              <circle
                cx={ringSize / 2} cy={ringSize / 2} r={ringRadius}
                fill="none"
                stroke={ringColor}
                strokeWidth={6}
                strokeDasharray={`${(overallProgress / 100) * ringCircumference} ${ringCircumference}`}
                strokeLinecap="round"
                transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                style={{ transition: `stroke-dasharray ${t.motion.hover}` }}
              />
            </svg>
            <Box style={{
              position: 'absolute' as const, inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{
                fontSize: t.typography.fontSize.md,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.neutral[900],
              }}>
                {Math.round(overallProgress)}%
              </Text>
            </Box>
          </Box>

          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
            {/* Days remaining */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Clock size={ICON_SIZES.label} color={t.colors.neutral[400]} aria-hidden="true" />
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.medium,
                color: t.colors.neutral[700],
              }}>
                {data.daysRemaining} days left
              </Text>
            </Box>

            {/* Status counts */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexWrap: 'wrap' as const }}>
              <Box style={{
                ...createBadgeStyle(t, 'success'),
                borderRadius: badgeRadius,
              }}>
                <CheckCircle size={ICON_SIZES.inline} aria-hidden="true" />
                <Text style={{ fontSize: t.typography.fontSize.xs, marginLeft: 2 }}>
                  {data.onTrackCount} on track
                </Text>
              </Box>
              <Box style={{
                ...createBadgeStyle(t, 'error'),
                borderRadius: badgeRadius,
              }}>
                <XCircle size={ICON_SIZES.inline} aria-hidden="true" />
                <Text style={{ fontSize: t.typography.fontSize.xs, marginLeft: 2 }}>
                  {data.behindCount} behind
                </Text>
              </Box>
              {completedCount > 0 && (
                <Box style={{
                  ...createBadgeStyle(t, 'info'),
                  borderRadius: badgeRadius,
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>
                    {completedCount} done
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Top 3 objectives */}
        {topObjectives.length > 0 && (
          <Box>
            <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Objectives</Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              {topObjectives.map((obj, idx) => {
                const objEntrance = createEntranceAnimation(t, { index: idx });
                const pct = obj.target > 0 ? Math.round((n(obj.progress) / n(obj.target)) * 100) : 0;
                const progressColor = getProgressColor(obj.status, t);
                const barStyle = createProgressBarStyle(t, { color: progressColor, percent: pct });
                return (
                  <Box
                    key={obj.id}
                    {...(onViewObjective ? clickableProps(() => onViewObjective(obj.id), `View objective: ${obj.title}`) : {})}
                    onClick={onViewObjective ? () => onViewObjective(obj.id) : undefined}
                    style={{
                      display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                      borderRadius: t.borderRadius.md,
                      backgroundColor: t.colors.neutral[50],
                      border: `1px solid ${t.colors.neutral[100]}`,
                      cursor: onViewObjective ? 'pointer' : 'default',
                      transition: `all ${t.motion.hover}`,
                      ...objEntrance.animate,
                    }}
                  >
                    {/* Title + status + percentage */}
                    <Box style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        fontWeight: t.typography.fontWeight.medium,
                        color: t.colors.neutral[800],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap' as const,
                        flex: 1,
                        minWidth: 0,
                      }}>
                        {obj.title}
                      </Text>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], flexShrink: 0, marginLeft: t.spacing[2] }}>
                        <Box style={{
                          ...createBadgeStyle(t, getStatusBadgeVariant(obj.status)),
                          borderRadius: badgeRadius,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>
                            {getStatusLabel(obj.status)}
                          </Text>
                        </Box>
                        <Text style={{
                          fontSize: t.typography.fontSize.xs,
                          fontWeight: t.typography.fontWeight.semibold,
                          color: progressColor,
                        }}>
                          {pct}%
                        </Text>
                        {onViewObjective && (
                          <ChevronRight size={ICON_SIZES.label} color={t.colors.neutral[400]} aria-hidden="true" />
                        )}
                      </Box>
                    </Box>

                    {/* Progress bar */}
                    <Box style={barStyle.track}>
                      <Box style={barStyle.fill} />
                    </Box>

                    {/* Key results mini-progress (for first objective only) */}
                    {idx === 0 && obj.keyResults.length > 0 && (
                      <Box style={{
                        display: 'flex', flexDirection: 'column' as const, gap: 2,
                        marginTop: t.spacing[1],
                      }}>
                        {obj.keyResults.slice(0, 2).map((kr, krIdx) => {
                          const krPct = kr.target > 0 ? Math.round((n(kr.current) / n(kr.target)) * 100) : 0;
                          const krBar = createProgressBarStyle(t, { percent: krPct });
                          return (
                            <Box key={krIdx} style={{
                              display: 'flex', alignItems: 'center', gap: t.spacing[2],
                            }}>
                              <Text style={{
                                fontSize: t.typography.fontSize.xs,
                                color: t.colors.neutral[400],
                                minWidth: 0,
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap' as const,
                              }}>
                                {kr.title}
                              </Text>
                              <Box style={{ ...krBar.track, width: 48, height: 4, flexShrink: 0 }}>
                                <Box style={{ ...krBar.fill, height: 4 }} />
                              </Box>
                              <Text style={{
                                fontSize: t.typography.fontSize.xs,
                                color: t.colors.neutral[500],
                                flexShrink: 0,
                              }}>
                                {n(kr.current)}/{n(kr.target)} {kr.unit}
                              </Text>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* View All OKRs link */}
        {onViewAll && (
          <Box
            role="button"
            tabIndex={0}
            aria-label="View all OKRs"
            onClick={onViewAll}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewAll(); }
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
              View All OKRs
            </Text>
            <ArrowRight size={ICON_SIZES.label} color={t.colors.primaryScale[600]} aria-hidden="true" />
          </Box>
        )}

        </Box>
      </div>
    );
  },
});
