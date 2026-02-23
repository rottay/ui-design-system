'use client';

/**
 * BhRetentionForecast - Compact Preset
 * Dashboard widget showing AI-powered retention predictions for recent hires.
 * Includes avg retention rate display, at-risk badge, hire prediction rows
 * with 6mo/12mo retention bars, model confidence, and view all link.
 *
 * Personality-driven typography, glass-aware surfaces, entrance animations,
 * and full ARIA accessibility on all interactive elements.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhRetentionForecastProps } from '../../core';
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
  formatDate,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import {
  Shield,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Activity,
  CheckCircle,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Preset                                                              */
/* ------------------------------------------------------------------ */

export const CompactBhRetentionForecast = createPreset<BhRetentionForecastProps>({
  name: 'BhRetentionForecast.Compact',
  render: (ctx: PresetContext<BhRetentionForecastProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      data,
      loading,
      onViewCandidate,
      maxDisplay = 3,
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

    /* -- Status helpers ----------------------------------------------- */
    const getStatusColor = (status: 'strong' | 'moderate' | 'at_risk') => {
      switch (status) {
        case 'strong': return 'success' as const;
        case 'moderate': return 'warning' as const;
        case 'at_risk': return 'error' as const;
      }
    };

    const getStatusLabel = (status: 'strong' | 'moderate' | 'at_risk') => {
      switch (status) {
        case 'strong': return 'Strong';
        case 'moderate': return 'Moderate';
        case 'at_risk': return 'At Risk';
      }
    };

    const predictions = data?.predictions ?? [];
    const displayPredictions = predictions.slice(0, maxDisplay);

    /* -- Loading state ------------------------------------------------ */
    if (loading) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
          padding: `${t.spacing[5]}px`,
          ...style,
        }} role="status" aria-label="Loading retention forecast">
          <Box style={{ ...skeletonStyle, height: 20, width: '60%' }} />
          <Box style={{ ...skeletonStyle, height: 48, width: '40%' }} />
          <Box style={{ ...skeletonStyle, height: 60, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 60, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 60, width: '100%' }} />
        </Box>
      );
    }

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="Retention Forecast"
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
              <Shield size={ICON_SIZES.section} color={t.colors.primaryScale[500]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.md,
              fontWeight: personalityTypo.headingWeight,
              letterSpacing: personalityTypo.headingLetterSpacing,
              color: t.colors.neutral[900],
            }}>
              Retention Forecast
            </Text>
          </Box>
          {data && n(data.atRiskCount) > 0 && (
            <Box style={{
              ...createBadgeStyle(t, 'error'),
              borderRadius: badgeRadius,
            }}>
              <AlertTriangle size={ICON_SIZES.inline} aria-hidden="true" />
              <Text style={{ fontSize: t.typography.fontSize.xs, marginLeft: 2 }}>
                {n(data.atRiskCount)} at risk
              </Text>
            </Box>
          )}
        </Box>

        {/* Avg retention rate large display */}
        {data && (
          <Box style={{
            display: 'flex', alignItems: 'center', gap: t.spacing[3],
            marginBottom: t.spacing[4],
          }}>
            <Text style={createStatValueStyle(t, { size: '2xl' })}>
              {Math.round(n(data.avgRetentionRate))}%
            </Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={createStatLabelStyle(t, { personality: personalityTypo })}>
                Avg Retention Rate
              </Text>
              <Box style={{
                ...createBadgeStyle(t, n(data.avgRetentionRate) >= 85 ? 'success' : n(data.avgRetentionRate) >= 70 ? 'warning' : 'error'),
                borderRadius: badgeRadius,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>
                  {n(data.avgRetentionRate) >= 85 ? 'Excellent' : n(data.avgRetentionRate) >= 70 ? 'Good' : 'Needs Attention'}
                </Text>
              </Box>
            </Box>
          </Box>
        )}

        {/* Prediction rows */}
        {displayPredictions.length > 0 && (
          <Box style={{ marginBottom: t.spacing[3] }}>
            <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Recent Hires</Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              {displayPredictions.map((prediction, idx) => {
                const rowEntrance = createEntranceAnimation(t, { index: idx });
                const prob6 = n(prediction.retentionProbability6Month);
                const prob12 = n(prediction.retentionProbability12Month);
                const bar6Styles = createProgressBarStyle(t, {
                  color: prob6 >= 80 ? t.colors.successScale[500] : prob6 >= 60 ? t.colors.warningScale[500] : t.colors.errorScale[500],
                  percent: prob6,
                });
                const bar12Styles = createProgressBarStyle(t, {
                  color: prob12 >= 80 ? t.colors.successScale[400] : prob12 >= 60 ? t.colors.warningScale[400] : t.colors.errorScale[400],
                  percent: prob12,
                });

                return (
                  <Box
                    key={prediction.candidateId}
                    {...(onViewCandidate ? clickableProps(() => onViewCandidate(prediction.candidateId), `View candidate: ${prediction.candidateName}`) : {})}
                    onClick={onViewCandidate ? () => onViewCandidate(prediction.candidateId) : undefined}
                    style={{
                      padding: `${t.spacing[3]}px`,
                      borderRadius: t.borderRadius.md,
                      backgroundColor: t.colors.neutral[50],
                      border: `1px solid ${t.colors.neutral[100]}`,
                      cursor: onViewCandidate ? 'pointer' : 'default',
                      transition: `all ${t.motion.hover}`,
                      ...rowEntrance.animate,
                    }}
                  >
                    {/* Name + date + status */}
                    <Box style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: t.spacing[2],
                    }}>
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: 2, flex: 1, minWidth: 0 }}>
                        <Text style={{
                          fontSize: t.typography.fontSize.sm,
                          fontWeight: t.typography.fontWeight.medium,
                          color: t.colors.neutral[800],
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap' as const,
                        }}>
                          {prediction.candidateName}
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          Hired {formatDate(prediction.hireDate)}
                        </Text>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                        <Box style={{
                          ...createBadgeStyle(t, getStatusColor(prediction.status)),
                          borderRadius: badgeRadius,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>
                            {getStatusLabel(prediction.status)}
                          </Text>
                        </Box>
                        {onViewCandidate && (
                          <ChevronRight size={ICON_SIZES.label} color={t.colors.neutral[400]} aria-hidden="true" />
                        )}
                      </Box>
                    </Box>

                    {/* Retention bars */}
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], width: 32, flexShrink: 0 }}>
                          6mo
                        </Text>
                        <Box style={{ ...bar6Styles.track, flex: 1, height: 6 }}>
                          <Box style={{ ...bar6Styles.fill, height: 6 }} />
                        </Box>
                        <Text style={{
                          fontSize: t.typography.fontSize.xs,
                          fontWeight: t.typography.fontWeight.semibold,
                          color: t.colors.neutral[700],
                          width: 32,
                          textAlign: 'right' as const,
                          flexShrink: 0,
                        }}>
                          {Math.round(prob6)}%
                        </Text>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], width: 32, flexShrink: 0 }}>
                          12mo
                        </Text>
                        <Box style={{ ...bar12Styles.track, flex: 1, height: 6 }}>
                          <Box style={{ ...bar12Styles.fill, height: 6 }} />
                        </Box>
                        <Text style={{
                          fontSize: t.typography.fontSize.xs,
                          fontWeight: t.typography.fontWeight.semibold,
                          color: t.colors.neutral[700],
                          width: 32,
                          textAlign: 'right' as const,
                          flexShrink: 0,
                        }}>
                          {Math.round(prob12)}%
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Model confidence */}
        {data && (
          <Box style={{
            display: 'flex', alignItems: 'center', gap: t.spacing[2],
            padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
            borderRadius: t.borderRadius.md,
            backgroundColor: t.colors.infoScale[50],
            border: `1px solid ${t.colors.infoScale[100]}`,
            marginBottom: t.spacing[3],
          }}>
            <Activity size={ICON_SIZES.label} color={t.colors.infoScale[500]} aria-hidden="true" />
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.neutral[600],
              flex: 1,
            }}>
              Model confidence: <Text style={{ fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>{Math.round(n(data.modelConfidence))}%</Text>
            </Text>
          </Box>
        )}

        {/* Empty state */}
        {!data && (
          <Box style={{ ...emptyStyle, padding: `${t.spacing[4]}px` }}>
            <Box style={createIconContainerStyle(t, { size: 40 })}>
              <Shield size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No retention data available
            </Text>
          </Box>
        )}

        {/* View All Forecasts link */}
        {data && predictions.length > maxDisplay && onViewCandidate && (
          <Box
            role="button"
            tabIndex={0}
            aria-label="View all retention forecasts"
            onClick={() => onViewCandidate('')}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewCandidate(''); }
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
              View All Forecasts
            </Text>
            <ArrowRight size={ICON_SIZES.label} color={t.colors.primaryScale[600]} aria-hidden="true" />
          </Box>
        )}

        </Box>
      </div>
    );
  },
});
