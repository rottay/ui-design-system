'use client';

/**
 * BhDeiPipeline - Compact Preset
 * Small dashboard widget showing DEI metrics across the hiring funnel.
 * Includes diversity score with trend, stacked bar pipeline visualization,
 * dropoff alerts, goal progress bars, and alert badge.
 *
 * Personality-driven typography, glass-aware surfaces, entrance animations,
 * and full ARIA accessibility on all interactive elements.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhDeiPipelineProps, DeiStageData, DeiAlert } from '../../core';
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
  createTrendStyle,
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
  AlertTriangle,
  Bell,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Assigns a distinct color from token scales to each demographic category */
function getCategoryColor(index: number, tokens: any): string {
  const palette = [
    tokens.colors.primaryScale[400],
    tokens.colors.secondaryScale[400],
    tokens.colors.infoScale[400],
    tokens.colors.warningScale[400],
    tokens.colors.successScale[400],
    tokens.colors.primaryScale[200],
    tokens.colors.secondaryScale[200],
    tokens.colors.infoScale[200],
  ];
  return palette[index % palette.length];
}

function getTrendIcon(trend: 'improving' | 'stable' | 'declining') {
  switch (trend) {
    case 'improving': return TrendingUp;
    case 'declining': return TrendingDown;
    case 'stable': return Minus;
  }
}

function getTrendColor(trend: 'improving' | 'stable' | 'declining', tokens: any): string {
  switch (trend) {
    case 'improving': return tokens.colors.successScale[600];
    case 'declining': return tokens.colors.errorScale[600];
    case 'stable': return tokens.colors.neutral[400];
  }
}

function getAlertSeverityVariant(severity: DeiAlert['severity']): 'info' | 'warning' | 'error' {
  switch (severity) {
    case 'info': return 'info';
    case 'warning': return 'warning';
    case 'critical': return 'error';
  }
}

/** Collects unique category names across all stages for consistent coloring */
function collectCategories(stages: DeiStageData[]): string[] {
  const seen = new Set<string>();
  for (const stage of stages) {
    for (const d of stage.demographics) {
      seen.add(d.category);
    }
  }
  return Array.from(seen);
}

/* ------------------------------------------------------------------ */
/*  Preset                                                            */
/* ------------------------------------------------------------------ */

export const CompactBhDeiPipeline = createPreset<BhDeiPipelineProps>({
  name: 'BhDeiPipeline.Compact',
  render: (ctx: PresetContext<BhDeiPipelineProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      data,
      loading,
      onViewDetails,
      onViewAlerts,
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
        }} role="status" aria-label="Loading DEI pipeline">
          <Box style={{ ...skeletonStyle, height: 20, width: '50%' }} />
          <Box style={{ ...skeletonStyle, height: 48, width: '35%' }} />
          <Box style={{ ...skeletonStyle, height: 16, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 16, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 16, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 16, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 40, width: '100%' }} />
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
              <Users size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No DEI pipeline data available
            </Text>
          </Box>
        </Box>
      );
    }

    const diversityScore = n(data.overallDiversityScore);
    const TrendIcon = getTrendIcon(data.trend);
    const trendColor = getTrendColor(data.trend, t);
    const allCategories = useMemo(() => collectCategories(data.stages), [data.stages]);
    const dropoffAlerts = data.alerts.filter(a => a.type === 'dropoff');
    const topGoals = data.representationGoals.slice(0, 2);
    const alertCount = data.alerts.length;

    /* Compute max stage total for scaling bars */
    const maxStageTotal = Math.max(...data.stages.map(s => s.total), 1);

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="DEI Pipeline"
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
            <Box style={createIconContainerStyle(t, { size: 32, color: t.colors.secondaryScale[50] })}>
              <Users size={ICON_SIZES.section} color={t.colors.secondaryScale[500]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.md,
              fontWeight: personalityTypo.headingWeight,
              letterSpacing: personalityTypo.headingLetterSpacing,
              color: t.colors.neutral[900],
            }}>
              DEI Pipeline
            </Text>
          </Box>
          {/* Alert count badge */}
          {alertCount > 0 && onViewAlerts && (
            <Box
              {...clickableProps(onViewAlerts, `View ${alertCount} DEI alerts`)}
              onClick={onViewAlerts}
              style={{
                ...createBadgeStyle(t, 'warning'),
                borderRadius: badgeRadius,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Bell size={ICON_SIZES.inline} aria-hidden="true" />
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {alertCount}
              </Text>
            </Box>
          )}
        </Box>

        {/* Diversity score with trend */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: t.spacing[3],
          marginBottom: t.spacing[4],
        }}>
          <Text style={createStatValueStyle(t, { size: '2xl' })}>
            {Math.round(diversityScore)}
          </Text>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={createStatLabelStyle(t, { personality: personalityTypo })}>
              Diversity Score
            </Text>
            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <TrendIcon size={ICON_SIZES.label} color={trendColor} aria-hidden="true" />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: trendColor }}>
                {data.trend}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Mini pipeline funnel - horizontal stacked bars */}
        {data.stages.length > 0 && (
          <Box style={{ marginBottom: t.spacing[3] }}>
            <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Pipeline Stages</Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              {data.stages.slice(0, 4).map((stage, stageIdx) => {
                const stageEntrance = createEntranceAnimation(t, { index: stageIdx });
                const barWidthPct = (stage.total / maxStageTotal) * 100;
                return (
                  <Box key={stage.stage} style={{
                    display: 'flex', alignItems: 'center', gap: t.spacing[2],
                    ...stageEntrance.animate,
                  }}>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      color: t.colors.neutral[500],
                      minWidth: 56,
                      textAlign: 'right' as const,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' as const,
                    }}>
                      {stage.stage}
                    </Text>
                    {/* Stacked bar */}
                    <Box style={{
                      flex: 1,
                      height: 16,
                      borderRadius: t.borderRadius.md,
                      overflow: 'hidden',
                      backgroundColor: t.colors.neutral[100],
                      display: 'flex',
                      position: 'relative' as const,
                    }}>
                      <Box style={{
                        display: 'flex',
                        width: `${barWidthPct}%`,
                        height: '100%',
                        transition: `width ${t.motion.hover}`,
                      }}>
                        {stage.demographics.map((dem, demIdx) => {
                          const catIdx = allCategories.indexOf(dem.category);
                          return (
                            <Box
                              key={dem.category}
                              style={{
                                width: `${dem.percentage}%`,
                                height: '100%',
                                backgroundColor: getCategoryColor(catIdx >= 0 ? catIdx : demIdx, t),
                                transition: `width ${t.motion.hover}`,
                              }}
                              title={`${dem.category}: ${dem.count} (${Math.round(dem.percentage)}%)`}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      color: t.colors.neutral[400],
                      minWidth: 24,
                    }}>
                      {stage.total}
                    </Text>
                  </Box>
                );
              })}
            </Box>

            {/* Category legend */}
            <Box style={{
              display: 'flex', flexWrap: 'wrap' as const, gap: t.spacing[2],
              marginTop: t.spacing[2],
            }}>
              {allCategories.slice(0, 6).map((cat, idx) => (
                <Box key={cat} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  <Box style={{
                    width: 8,
                    height: 8,
                    borderRadius: t.borderRadius.full,
                    backgroundColor: getCategoryColor(idx, t),
                    flexShrink: 0,
                  }} />
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[500],
                  }}>
                    {cat}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Dropoff alert indicator */}
        {dropoffAlerts.length > 0 && (
          <Box style={{
            display: 'flex', alignItems: 'flex-start', gap: t.spacing[2],
            marginBottom: t.spacing[3],
            padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
            borderRadius: t.borderRadius.md,
            backgroundColor: t.colors.warningScale[50],
            border: `1px solid ${t.colors.warningScale[200]}`,
          }}>
            <AlertTriangle size={ICON_SIZES.label} color={t.colors.warningScale[600]} aria-hidden="true" style={{ marginTop: 2, flexShrink: 0 }} />
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.warningScale[700],
              lineHeight: 1.4,
            }}>
              {dropoffAlerts[0].message}
            </Text>
          </Box>
        )}

        {/* Goal progress */}
        {topGoals.length > 0 && (
          <Box style={{ marginBottom: t.spacing[3] }}>
            <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Representation Goals</Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              {topGoals.map((goal, idx) => {
                const goalPct = goal.target > 0 ? Math.round((n(goal.current) / n(goal.target)) * 100) : 0;
                const goalColor = goalPct >= 100
                  ? t.colors.successScale[500]
                  : goalPct >= 70
                    ? t.colors.primaryScale[500]
                    : t.colors.warningScale[500];
                const barStyle = createProgressBarStyle(t, { color: goalColor, percent: goalPct });
                return (
                  <Box key={goal.category} style={{
                    display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                  }}>
                    <Box style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        color: t.colors.neutral[600],
                      }}>
                        {goal.category}
                      </Text>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: goalColor,
                      }}>
                        {Math.round(n(goal.current))}% / {Math.round(n(goal.target))}%
                      </Text>
                    </Box>
                    <Box style={barStyle.track}>
                      <Box style={barStyle.fill} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* View Full Report link */}
        {onViewDetails && (
          <Box
            role="button"
            tabIndex={0}
            aria-label="View full DEI report"
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
              View Full Report
            </Text>
            <ArrowRight size={ICON_SIZES.label} color={t.colors.primaryScale[600]} aria-hidden="true" />
          </Box>
        )}

        </Box>
      </div>
    );
  },
});
