'use client';

/**
 * BhBiasMonitor - Compact Preset
 * Dashboard widget showing bias monitoring with overall score,
 * metric grid (2x2), active alerts, and last analyzed timestamp.
 * Full token-driven styling, personality-aware, glass surfaces.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhBiasMonitorProps } from '../../core';
import { n, getBiasStatusColor, getOverallBiasInfo } from '../../core';
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
  createStatusDotStyle,
  createStatLabelStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  formatDistanceToNow,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  AlertCircle,
  Bell,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Preset                                                              */
/* ------------------------------------------------------------------ */

export const CompactBhBiasMonitor = createPreset<BhBiasMonitorProps>({
  name: 'BhBiasMonitor.Compact',
  render: (ctx: PresetContext<BhBiasMonitorProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      data,
      loading,
      onViewDetails,
      onViewAlert,
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
        }} role="status" aria-label="Loading bias monitor">
          <Box style={{ ...skeletonStyle, height: 20, width: '55%' }} />
          <Box style={{ ...skeletonStyle, height: 56, width: '40%' }} />
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[2] }}>
            <Box style={{ ...skeletonStyle, height: 48 }} />
            <Box style={{ ...skeletonStyle, height: 48 }} />
            <Box style={{ ...skeletonStyle, height: 48 }} />
            <Box style={{ ...skeletonStyle, height: 48 }} />
          </Box>
          <Box style={{ ...skeletonStyle, height: 20, width: '70%' }} />
        </Box>
      );
    }

    /* -- Derived data ------------------------------------------------- */
    const overallScore = n(data?.overallBiasScore);
    const biasInfo = data ? getOverallBiasInfo(overallScore, t) : null;
    const metrics = data?.metrics?.slice(0, 4) ?? [];
    const alertCount = data?.alerts?.length ?? 0;
    const criticalAlerts = data?.alerts?.filter(a => a.severity === 'critical').length ?? 0;
    const warningAlerts = data?.alerts?.filter(a => a.severity === 'warning').length ?? 0;

    /* -- Trend icon --------------------------------------------------- */
    const TrendIcon = data?.trend === 'improving'
      ? TrendingUp
      : data?.trend === 'worsening'
        ? TrendingDown
        : Minus;

    const trendColor = data?.trend === 'improving'
      ? t.colors.successScale[600]
      : data?.trend === 'worsening'
        ? t.colors.errorScale[600]
        : t.colors.neutral[400];

    /* -- Metric labels ------------------------------------------------ */
    const metricLabels: Record<string, string> = {
      talk_time_ratio: 'Talk Time',
      question_consistency: 'Consistency',
      scoring_distribution: 'Scoring Dist.',
      demographic_variance: 'Demo. Variance',
      interruption_pattern: 'Interruptions',
    };

    /* -- Last analyzed ------------------------------------------------ */
    const lastAnalyzed = data?.lastAnalyzedAt
      ? formatDistanceToNow(
          typeof data.lastAnalyzedAt === 'string' ? new Date(data.lastAnalyzedAt) : data.lastAnalyzedAt,
          { addSuffix: true },
        )
      : null;

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="Bias Monitor"
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
              <ShieldCheck size={ICON_SIZES.section} color={t.colors.primaryScale[500]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.md,
              fontWeight: personalityTypo.headingWeight,
              letterSpacing: personalityTypo.headingLetterSpacing,
              color: t.colors.neutral[900],
            }}>
              Bias Monitor
            </Text>
          </Box>
          {data && (
            <Box style={{
              ...createBadgeStyle(t, 'secondary'),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {n(data.interviewCount)} interviews
              </Text>
            </Box>
          )}
        </Box>

        {/* Empty state */}
        {!data && (
          <Box style={{ ...emptyStyle, padding: `${t.spacing[4]}px` }}>
            <Box style={createIconContainerStyle(t, { size: 40 })}>
              <ShieldCheck size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No bias data available yet
            </Text>
          </Box>
        )}

        {data && biasInfo && (
          <>
            {/* Overall bias score */}
            <Box style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[3],
              marginBottom: t.spacing[4],
            }}>
              <Box style={{
                display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
                minWidth: 64,
              }}>
                <Text style={{
                  fontSize: t.typography.fontSize['2xl'],
                  fontWeight: t.typography.fontWeight.bold,
                  color: biasInfo.color,
                  lineHeight: 1,
                }}>
                  {Math.round(overallScore)}
                </Text>
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  color: t.colors.neutral[500],
                  marginTop: t.spacing[1],
                }}>
                  /100
                </Text>
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Box style={{
                  ...createBadgeStyle(t, biasInfo.badgeColor),
                  borderRadius: badgeRadius,
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{biasInfo.label}</Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <TrendIcon size={ICON_SIZES.label} color={trendColor} aria-hidden="true" />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: trendColor }}>
                    {data.trend === 'improving' ? 'Improving' : data.trend === 'worsening' ? 'Worsening' : 'Stable'}
                  </Text>
                </Box>
              </Box>
            </Box>

            {/* Metrics grid (2x2) */}
            {metrics.length > 0 && (
              <Box style={{ marginBottom: t.spacing[4] }}>
                <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Key Metrics</Text>
                <Box style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: t.spacing[2],
                }}>
                  {metrics.map((metric, idx) => {
                    const statusColor = getBiasStatusColor(metric.status, t);
                    const metricEntrance = createEntranceAnimation(t, { index: idx });
                    const bar = createProgressBarStyle(t, {
                      color: statusColor,
                      percent: Math.min(100, n(metric.score)),
                    });
                    return (
                      <Box
                        key={metric.type}
                        style={{
                          padding: `${t.spacing[2]}px ${t.spacing[2]}px`,
                          borderRadius: t.borderRadius.md,
                          backgroundColor: t.colors.neutral[50],
                          border: `1px solid ${t.colors.neutral[100]}`,
                          ...metricEntrance.animate,
                        }}
                      >
                        <Box style={{
                          display: 'flex', alignItems: 'center', gap: t.spacing[1],
                          marginBottom: t.spacing[1],
                        }}>
                          <Box style={createStatusDotStyle(t, statusColor)} />
                          <Text style={{
                            fontSize: t.typography.fontSize.xs,
                            color: t.colors.neutral[600],
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap' as const,
                          }}>
                            {metricLabels[metric.type] ?? metric.label}
                          </Text>
                        </Box>
                        <Box style={{ ...bar.track, height: 4, marginBottom: t.spacing[1] }}>
                          <Box style={bar.fill} />
                        </Box>
                        <Text style={{
                          fontSize: t.typography.fontSize.xs,
                          fontWeight: t.typography.fontWeight.medium,
                          color: t.colors.neutral[700],
                        }}>
                          {Math.round(n(metric.score))} / {Math.round(n(metric.benchmark))}
                        </Text>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Alerts summary */}
            {alertCount > 0 && (
              <Box style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                borderRadius: t.borderRadius.md,
                backgroundColor: criticalAlerts > 0 ? t.colors.errorScale[50] : t.colors.warningScale[50],
                border: `1px solid ${criticalAlerts > 0 ? t.colors.errorScale[200] : t.colors.warningScale[200]}`,
                marginBottom: t.spacing[3],
                cursor: onViewAlert ? 'pointer' : 'default',
                transition: `all ${t.motion.hover}`,
              }}
                {...(onViewAlert && data.alerts[0] ? clickableProps(() => onViewAlert(data.alerts[0]), 'View bias alerts') : {})}
                onClick={onViewAlert && data.alerts[0] ? () => onViewAlert(data.alerts[0]) : undefined}
              >
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <Bell size={ICON_SIZES.section} color={criticalAlerts > 0 ? t.colors.errorScale[600] : t.colors.warningScale[600]} aria-hidden="true" />
                  <Box>
                    <Text style={{
                      fontSize: t.typography.fontSize.sm,
                      fontWeight: t.typography.fontWeight.medium,
                      color: criticalAlerts > 0 ? t.colors.errorScale[800] : t.colors.warningScale[800],
                    }}>
                      {alertCount} Active Alert{alertCount !== 1 ? 's' : ''}
                    </Text>
                    {(criticalAlerts > 0 || warningAlerts > 0) && (
                      <Box style={{ display: 'flex', gap: t.spacing[2], marginTop: 2 }}>
                        {criticalAlerts > 0 && (
                          <Box style={{
                            ...createBadgeStyle(t, 'error'),
                            borderRadius: badgeRadius,
                            padding: `0 ${t.spacing[1]}px`,
                          }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs }}>{criticalAlerts} critical</Text>
                          </Box>
                        )}
                        {warningAlerts > 0 && (
                          <Box style={{
                            ...createBadgeStyle(t, 'warning'),
                            borderRadius: badgeRadius,
                            padding: `0 ${t.spacing[1]}px`,
                          }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs }}>{warningAlerts} warning</Text>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
                {onViewAlert && (
                  <AlertCircle size={ICON_SIZES.label} color={criticalAlerts > 0 ? t.colors.errorScale[500] : t.colors.warningScale[500]} aria-hidden="true" />
                )}
              </Box>
            )}

            {/* Last analyzed + View Full Report */}
            <Box style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginTop: t.spacing[2],
            }}>
              {lastAnalyzed && (
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  color: t.colors.neutral[400],
                }}>
                  Analyzed {lastAnalyzed}
                </Text>
              )}
              {onViewDetails && (
                <Box
                  role="button"
                  tabIndex={0}
                  aria-label="View full bias report"
                  onClick={onViewDetails}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewDetails(); }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center',
                    gap: t.spacing[1],
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
          </>
        )}

        </Box>
      </div>
    );
  },
});
