'use client';

/**
 * BhPredictiveModels - Compact Preset
 * Dashboard widget showing overall model accuracy, active predictions count,
 * model cards with accuracy bars and status badges, and retrain actions.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhPredictiveModelsProps, PredictiveModel } from '../../core';
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
  createStatusDotStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  formatDistanceToNow,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import {
  Cpu,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  RefreshCw,
  Activity,
  Target,
  Users,
  Clock,
  Zap,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getAccuracyColor(accuracy: number, tokens: any): string {
  if (accuracy >= 90) return tokens.colors.successScale[600];
  if (accuracy >= 75) return tokens.colors.infoScale[600];
  if (accuracy >= 60) return tokens.colors.warningScale[600];
  return tokens.colors.errorScale[600];
}

function getAccuracyBarColor(accuracy: number, tokens: any): string {
  if (accuracy >= 90) return tokens.colors.successScale[500];
  if (accuracy >= 75) return tokens.colors.infoScale[500];
  if (accuracy >= 60) return tokens.colors.warningScale[500];
  return tokens.colors.errorScale[500];
}

function getStatusColor(status: PredictiveModel['status'], tokens: any): string {
  switch (status) {
    case 'active': return tokens.colors.successScale[500];
    case 'training': return tokens.colors.warningScale[500];
    case 'degraded': return tokens.colors.errorScale[500];
    case 'retired': return tokens.colors.neutral[400];
  }
}

function getStatusLabel(status: PredictiveModel['status']): string {
  switch (status) {
    case 'active': return 'Active';
    case 'training': return 'Training';
    case 'degraded': return 'Degraded';
    case 'retired': return 'Retired';
  }
}

function getModelTypeIcon(type: PredictiveModel['type']): typeof Target {
  switch (type) {
    case 'hire_success': return Target;
    case 'time_to_fill': return Clock;
    case 'offer_acceptance': return Zap;
    case 'retention': return Users;
    case 'source_quality': return Activity;
  }
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const CompactBhPredictiveModels = createPreset<BhPredictiveModelsProps>({
  name: 'BhPredictiveModels.Compact',
  render: (ctx: PresetContext<BhPredictiveModelsProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      data,
      loading,
      onViewModel,
      onRetrain,
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
        }} role="status" aria-label="Loading predictive models">
          <Box style={{ ...skeletonStyle, height: 20, width: '55%' }} />
          <Box style={{ ...skeletonStyle, height: 48, width: '30%' }} />
          <Box style={{ ...skeletonStyle, height: 24, width: '80%' }} />
          <Box style={{ ...skeletonStyle, height: 48, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 48, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 48, width: '100%' }} />
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
              <Cpu size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No predictive models configured
            </Text>
          </Box>
        </Box>
      );
    }

    const accuracy = Math.round(n(data.overallAccuracy));
    const accuracyColor = getAccuracyColor(accuracy, t);
    const lastTrained = typeof data.lastTrainedAt === 'string'
      ? new Date(data.lastTrainedAt)
      : data.lastTrainedAt;

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="Predictive Models"
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
                <Cpu size={ICON_SIZES.section} color={t.colors.primaryScale[500]} aria-hidden="true" />
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize.md,
                fontWeight: personalityTypo.headingWeight,
                letterSpacing: personalityTypo.headingLetterSpacing,
                color: t.colors.neutral[900],
              }}>
                Predictive Models
              </Text>
            </Box>
          </Box>

          {/* Overall accuracy + stats row */}
          <Box style={{
            display: 'flex', alignItems: 'center', gap: t.spacing[4],
            marginBottom: t.spacing[4],
          }}>
            <Box style={{ display: 'flex', alignItems: 'baseline', gap: t.spacing[1] }}>
              <Text style={{
                ...createStatValueStyle(t, { size: '2xl' }),
                color: accuracyColor,
              }}>
                {accuracy}%
              </Text>
              <Text style={createStatLabelStyle(t, { personality: personalityTypo })}>
                accuracy
              </Text>
            </Box>
            <Box style={{
              display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
              paddingLeft: t.spacing[3],
              borderLeft: `1px solid ${t.colors.neutral[200]}`,
            }}>
              <Text style={{
                fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500],
              }}>
                {n(data.activePredictions).toLocaleString()} active
              </Text>
              <Text style={{
                fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400],
              }}>
                {n(data.totalPredictions).toLocaleString()} total
              </Text>
            </Box>
          </Box>

          {/* Model cards */}
          <Box style={{ marginBottom: t.spacing[3] }}>
            <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Models</Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              {data.models.slice(0, 5).map((model, idx) => {
                const ModelTypeIcon = getModelTypeIcon(model.type);
                const modelAccuracy = Math.round(n(model.accuracy));
                const modelAccuracyColor = getAccuracyBarColor(modelAccuracy, t);
                const statusColor = getStatusColor(model.status, t);
                const modelEntrance = createEntranceAnimation(t, { index: idx });
                const bar = createProgressBarStyle(t, {
                  color: modelAccuracyColor,
                  percent: modelAccuracy,
                });

                const TrendIcon = model.trend === 'improving' ? TrendingUp
                  : model.trend === 'degrading' ? TrendingDown
                  : Minus;
                const trendColor = model.trend === 'improving'
                  ? t.colors.successScale[500]
                  : model.trend === 'degrading'
                    ? t.colors.errorScale[500]
                    : t.colors.neutral[400];

                return (
                  <Box
                    key={model.id}
                    {...(onViewModel ? clickableProps(() => onViewModel(model.id), `View model: ${model.name}`) : {})}
                    onClick={onViewModel ? () => onViewModel(model.id) : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', gap: t.spacing[2],
                      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                      borderRadius: t.borderRadius.md,
                      backgroundColor: t.colors.neutral[50],
                      border: `1px solid ${t.colors.neutral[100]}`,
                      cursor: onViewModel ? 'pointer' : 'default',
                      transition: `all ${t.motion.hover}`,
                      ...modelEntrance.animate,
                    }}
                  >
                    {/* Type icon */}
                    <ModelTypeIcon size={ICON_SIZES.label} color={t.colors.neutral[500]} aria-hidden="true" />

                    {/* Name + accuracy bar */}
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Box style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: 2,
                      }}>
                        <Text style={{
                          fontSize: t.typography.fontSize.xs,
                          fontWeight: t.typography.fontWeight.medium,
                          color: t.colors.neutral[800],
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap' as const,
                        }}>
                          {model.name}
                        </Text>
                        <Text style={{
                          fontSize: t.typography.fontSize.xs,
                          fontWeight: t.typography.fontWeight.semibold,
                          color: t.colors.neutral[700],
                          flexShrink: 0,
                          marginLeft: t.spacing[1],
                        }}>
                          {modelAccuracy}%
                        </Text>
                      </Box>
                      <Box style={{ ...bar.track, height: 3 }}>
                        <Box style={bar.fill} />
                      </Box>
                    </Box>

                    {/* Status dot */}
                    <Box style={createStatusDotStyle(t, statusColor)} aria-label={getStatusLabel(model.status)} />

                    {/* Trend arrow */}
                    <TrendIcon size={ICON_SIZES.inline} color={trendColor} aria-hidden="true" />

                    {/* Retrain button for degraded */}
                    {model.status === 'degraded' && onRetrain && (
                      <Box
                        role="button"
                        tabIndex={0}
                        aria-label={`Retrain ${model.name}`}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onRetrain(model.id);
                        }}
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            onRetrain(model.id);
                          }
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 2,
                          padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                          borderRadius: badgeRadius,
                          backgroundColor: t.colors.warningScale[100],
                          color: t.colors.warningScale[700],
                          border: `1px solid ${t.colors.warningScale[200]}`,
                          cursor: 'pointer',
                          fontSize: t.typography.fontSize.xs,
                          fontWeight: t.typography.fontWeight.medium,
                          transition: `all ${t.motion.hover}`,
                          flexShrink: 0,
                        }}
                      >
                        <RefreshCw size={ICON_SIZES.inline} aria-hidden="true" />
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>Retrain</Text>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Last trained timestamp */}
          <Box style={{
            display: 'flex', alignItems: 'center', gap: t.spacing[1],
            marginBottom: t.spacing[2],
          }}>
            <Clock size={ICON_SIZES.inline} color={t.colors.neutral[400]} aria-hidden="true" />
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.neutral[400],
            }}>
              Last trained {formatDistanceToNow(lastTrained, { addSuffix: true })}
            </Text>
          </Box>

          {/* View All Models link */}
          {onViewModel && (
            <Box
              role="button"
              tabIndex={0}
              aria-label="View all predictive models"
              onClick={() => onViewModel('all')}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewModel('all'); }
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
                View All Models
              </Text>
              <ArrowRight size={ICON_SIZES.label} color={t.colors.primaryScale[600]} aria-hidden="true" />
            </Box>
          )}

        </Box>
      </div>
    );
  },
});
