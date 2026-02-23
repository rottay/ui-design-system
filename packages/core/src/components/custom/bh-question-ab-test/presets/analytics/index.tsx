'use client';

/**
 * BhQuestionAbTest - Analytics Preset
 * Shows experiment analytics with score distributions, time series trends,
 * statistical summary, outcome correlation, and recommendations.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createBadgeStyle,
  createEmptyStateStyle,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
  createProgressBarStyle,
  createMetadataGridStyle,
  createMetadataFieldStyle,
  createMetadataLabelStyle,
  createMetadataValueStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  ICON_SIZES,
  formatPercent,
  formatScore,
} from '../../../helpers';
import type {
  BhQuestionAbTestProps,
  ExperimentData,
  ExperimentAnalytics,
} from '../../core';
import {
  getExperimentStatusConfig,
  getConfidenceDisplay,
  formatExperimentScore,
  getLeadingVariant,
} from '../../core';
import type { DesignTokens } from '../../../../../types';
import {
  FlaskConical,
  Trophy,
  BarChart3,
  TrendingUp,
  Target,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Activity,
  Briefcase,
  Sparkles,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Sub-components
 * -------------------------------------------------------------------------*/

let _Box: any;
let _Text: any;

function ScoreDistributionChart({
  distribution,
  variantId,
  variantLabel,
  color,
  tokens: t,
}: {
  distribution: Array<{ bucket: string; count: number }>;
  variantId: string;
  variantLabel: string;
  color: string;
  tokens: DesignTokens;
}) {
  const Box = _Box;
  const Text = _Text;
  const maxCount = Math.max(1, ...distribution.map(d => d.count));

  return (
    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>
        {variantLabel}
      </Text>
      <Box style={{ display: 'flex', gap: t.spacing[1], alignItems: 'flex-end', height: 80 }}>
        {distribution.map((d, i) => {
          const heightPercent = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
          return (
            <Box key={d.bucket} style={{
              flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: t.spacing[1],
            }}>
              <Box style={{
                width: '100%', height: `${Math.max(4, heightPercent)}%`,
                backgroundColor: color,
                borderRadius: `${t.borderRadius.sm} ${t.borderRadius.sm} 0 0`,
                opacity: 0.7 + (heightPercent / 100) * 0.3,
                transition: `height ${t.motion.hover}`,
                minHeight: 4,
              }} />
              <Text style={{ fontSize: '9px', color: t.colors.neutral[400], textAlign: 'center' as const }}>
                {d.bucket}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function ConfidenceIntervalViz({
  intervals,
  variants,
  tokens: t,
}: {
  intervals: Record<string, { lower: number; upper: number }>;
  variants: ExperimentData['variants'];
  tokens: DesignTokens;
}) {
  const Box = _Box;
  const Text = _Text;

  const allValues = Object.values(intervals).flatMap(ci => [ci.lower, ci.upper]);
  const min = Math.min(...allValues, 0);
  const max = Math.max(...allValues, 100);
  const range = max - min || 1;

  const variantColors = [t.colors.primaryScale[500], t.colors.secondaryScale[500], t.colors.infoScale[500]];

  return (
    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
      {Object.entries(intervals).map(([variantId, ci], idx) => {
        const variant = variants.find(v => v.id === variantId);
        const color = variantColors[idx % variantColors.length];
        const leftPercent = ((ci.lower - min) / range) * 100;
        const widthPercent = ((ci.upper - ci.lower) / range) * 100;
        const midpoint = ((variant?.avgScore ?? (ci.lower + ci.upper) / 2) - min) / range * 100;

        return (
          <Box key={variantId} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>
                {variant?.label ?? variantId}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                [{ci.lower.toFixed(1)} - {ci.upper.toFixed(1)}]
              </Text>
            </Box>
            <Box style={{
              position: 'relative' as const, height: 12,
              backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.full,
              overflow: 'hidden',
            }}>
              <Box style={{
                position: 'absolute' as const,
                left: `${leftPercent}%`,
                width: `${Math.max(2, widthPercent)}%`,
                height: '100%',
                backgroundColor: color,
                borderRadius: t.borderRadius.full,
                opacity: 0.4,
              }} />
              <Box style={{
                position: 'absolute' as const,
                left: `${midpoint}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 8, height: 8,
                borderRadius: t.borderRadius.full,
                backgroundColor: color,
                border: `2px solid ${t.colors.common.white}`,
              }} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

function OutcomeCorrelationSection({
  correlation,
  variants,
  tokens: t,
}: {
  correlation: ExperimentAnalytics['outcomeCorrelation'];
  variants: ExperimentData['variants'];
  tokens: DesignTokens;
}) {
  const Box = _Box;
  const Text = _Text;
  const br = getPersonalityBadgeRadius(t);

  const metrics = [
    { key: 'hiredWithin90Days', label: 'Hired within 90 days', data: correlation.hiredWithin90Days },
    { key: 'hiredWithin1Year', label: 'Hired within 1 year', data: correlation.hiredWithin1Year },
  ];

  return (
    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
      {metrics.map(metric => (
        <Box key={metric.key} style={{
          padding: `${t.spacing[3]}px`,
          borderRadius: t.borderRadius.md,
          backgroundColor: t.colors.neutral[50],
          border: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Text style={{
            fontSize: t.typography.fontSize.xs,
            fontWeight: t.typography.fontWeight.semibold,
            color: t.colors.neutral[700],
            marginBottom: t.spacing[2],
          }}>
            {metric.label}
          </Text>
          <Box style={{ display: 'flex', gap: t.spacing[4] }}>
            {Object.entries(metric.data).map(([variantId, count]) => {
              const variant = variants.find(v => v.id === variantId);
              const total = variant?.sampleSize ?? 1;
              const rate = total > 0 ? (count / total) * 100 : 0;
              return (
                <Box key={variantId} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                    {variant?.label ?? variantId}
                  </Text>
                  <Box style={{ display: 'flex', alignItems: 'baseline', gap: t.spacing[1] }}>
                    <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                      {count}
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                      ({rate.toFixed(1)}%)
                    </Text>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/* ---------------------------------------------------------------------------
 * Analytics Preset
 * -------------------------------------------------------------------------*/

export const AnalyticsBhQuestionAbTest = createPreset<BhQuestionAbTestProps>({
  name: 'BhQuestionAbTest.Analytics',
  render: ({ primitives, props, tokens: t }: PresetContext<BhQuestionAbTestProps>) => {
    const { Box, Text } = primitives;
    _Box = Box;
    _Text = Text;

    const br = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const statusConfig = useMemo(() => getExperimentStatusConfig(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    const {
      selectedExperiment: experiment,
      analytics,
      loading = false,
      className,
      style,
    } = props;

    // Loading state
    if (loading || !experiment) {
      return (
        <Box className={className} style={{
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5],
          height: '100%', ...style,
        }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Box key={i} style={{ ...skeleton, width: '100%', height: 120, borderRadius: t.borderRadius.lg }} />
          ))}
        </Box>
      );
    }

    const sc = statusConfig[experiment.status];
    const leader = getLeadingVariant(experiment);
    const { text: confidenceText, color: confidenceColor } = getConfidenceDisplay(t, experiment.statisticalSignificance);
    const variantColors = [t.colors.primaryScale[500], t.colors.secondaryScale[500], t.colors.infoScale[500]];

    // Determine if there is a meaningful difference
    const hasMeaningfulData = experiment.variants.every(v => v.sampleSize > 0);
    const scoreDiff = experiment.variants.length >= 2
      ? Math.abs(experiment.variants[0].avgScore - experiment.variants[1].avgScore)
      : 0;

    // Generate recommendation
    let recommendation = '';
    if (!hasMeaningfulData) {
      recommendation = 'Not enough data has been collected yet. Continue running the experiment until each variant has sufficient samples.';
    } else if (experiment.statisticalSignificance != null && parseFloat(String(experiment.statisticalSignificance)) < 0.05) {
      const winnerVariant = leader;
      recommendation = `The results are statistically significant. ${winnerVariant?.label ?? 'Leading variant'} shows a ${scoreDiff.toFixed(1)} point advantage with ${confidenceText}. Consider adopting this question phrasing for future interviews.`;
    } else if (experiment.statisticalSignificance != null) {
      recommendation = `The results are not yet statistically significant (${confidenceText}). The score difference of ${scoreDiff.toFixed(1)} points may be due to chance. Continue collecting data or consider ending the experiment if the difference is too small to matter.`;
    } else {
      recommendation = 'Statistical analysis has not been run yet. Run the analysis once you have sufficient sample sizes to determine significance.';
    }

    return (
      <Box className={className} style={{
        display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5],
        height: '100%', overflow: 'auto', ...style,
      }}>
        {accentBar && <Box style={accentBar} />}

        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
          <BarChart3 size={ICON_SIZES.feature} style={{ color: t.colors.primaryScale[600] }} />
          <Text style={{
            fontSize: t.typography.fontSize.xl,
            fontWeight: ptypo.headingWeight,
            color: t.colors.neutral[900],
            letterSpacing: ptypo.headingLetterSpacing,
          }}>
            Experiment Analytics
          </Text>
          <Box style={{
            padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
            borderRadius: br,
            backgroundColor: sc.bgColor,
            color: sc.color,
            border: `1px solid ${sc.borderColor}`,
            fontSize: t.typography.fontSize.xs,
            fontWeight: t.typography.fontWeight.semibold,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs }}>{experiment.name}</Text>
          </Box>
        </Box>

        {/* Overview cards */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: t.spacing[4] }}>
          <Box style={{ ...createCardStyle(t, { elevation: 'sm' }), ...animStyle(0), padding: `${t.spacing[4]}px`, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Activity size={ICON_SIZES.section} style={{ color: t.colors.primaryScale[500] }} />
              <Text style={createMetadataLabelStyle(t, { personality: ptypo })}>Total Interviews</Text>
            </Box>
            <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
              {analytics?.totalInterviews ?? experiment.currentSampleSize}
            </Text>
          </Box>
          <Box style={{ ...createCardStyle(t, { elevation: 'sm' }), ...animStyle(1), padding: `${t.spacing[4]}px`, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Target size={ICON_SIZES.section} style={{ color: t.colors.warningScale[500] }} />
              <Text style={createMetadataLabelStyle(t, { personality: ptypo })}>Score Difference</Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'baseline', gap: t.spacing[1] }}>
              <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                {scoreDiff.toFixed(1)}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>pts</Text>
            </Box>
          </Box>
          <Box style={{ ...createCardStyle(t, { elevation: 'sm' }), ...animStyle(2), padding: `${t.spacing[4]}px`, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <CheckCircle size={ICON_SIZES.section} style={{ color: confidenceColor }} />
              <Text style={createMetadataLabelStyle(t, { personality: ptypo })}>Confidence</Text>
            </Box>
            <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: confidenceColor }}>
              {confidenceText}
            </Text>
          </Box>
        </Box>

        {/* Per-variant score summary */}
        <Box style={{ ...createCardStyle(t, { elevation: 'sm' }), ...animStyle(3), padding: `${t.spacing[5]}px`, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4] }}>
          <Text style={{
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.semibold,
            color: t.colors.neutral[900],
          }}>
            Score Comparison
          </Text>
          <Box style={{ display: 'flex', gap: t.spacing[4] }}>
            {experiment.variants.map((variant, idx) => {
              const color = variantColors[idx % variantColors.length];
              const isLeading = leader?.id === variant.id && experiment.variants.length > 1;
              return (
                <Box key={variant.id} style={{
                  flex: 1, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
                  padding: `${t.spacing[4]}px`,
                  borderRadius: t.borderRadius.lg,
                  border: `2px solid ${isLeading ? t.colors.successScale[200] : t.colors.neutral[200]}`,
                  backgroundColor: isLeading ? t.colors.successScale[50] : t.colors.common.white,
                }}>
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Box style={{ width: 12, height: 12, borderRadius: t.borderRadius.full, backgroundColor: color }} />
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                        {variant.label}
                      </Text>
                    </Box>
                    {isLeading && <Trophy size={ICON_SIZES.label} style={{ color: t.colors.successScale[500] }} />}
                  </Box>
                  <Box style={createMetadataGridStyle(t, { columns: 2 })}>
                    <Box style={createMetadataFieldStyle(t)}>
                      <Text style={createMetadataLabelStyle(t)}>Avg Score</Text>
                      <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                        {variant.sampleSize > 0 ? formatExperimentScore(variant.avgScore) : '--'}
                      </Text>
                    </Box>
                    <Box style={createMetadataFieldStyle(t)}>
                      <Text style={createMetadataLabelStyle(t)}>Samples</Text>
                      <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                        {variant.sampleSize}
                      </Text>
                    </Box>
                    <Box style={createMetadataFieldStyle(t)}>
                      <Text style={createMetadataLabelStyle(t)}>Std Dev</Text>
                      <Text style={createMetadataValueStyle(t)}>
                        {variant.stdDev != null ? variant.stdDev.toFixed(2) : '--'}
                      </Text>
                    </Box>
                    {analytics?.confidenceIntervals?.[variant.id] && (
                      <Box style={createMetadataFieldStyle(t)}>
                        <Text style={createMetadataLabelStyle(t)}>95% CI</Text>
                        <Text style={createMetadataValueStyle(t)}>
                          [{analytics.confidenceIntervals[variant.id].lower.toFixed(1)}, {analytics.confidenceIntervals[variant.id].upper.toFixed(1)}]
                        </Text>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Confidence intervals visualization */}
        {analytics?.confidenceIntervals && Object.keys(analytics.confidenceIntervals).length > 0 && (
          <Box style={{ ...createCardStyle(t, { elevation: 'sm' }), ...animStyle(4), padding: `${t.spacing[5]}px`, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.semibold,
              color: t.colors.neutral[900],
            }}>
              Confidence Intervals (95%)
            </Text>
            <ConfidenceIntervalViz
              intervals={analytics.confidenceIntervals}
              variants={experiment.variants}
              tokens={t}
            />
          </Box>
        )}

        {/* Score distribution */}
        {analytics?.scoreDistribution && Object.keys(analytics.scoreDistribution).length > 0 && (
          <Box style={{ ...createCardStyle(t, { elevation: 'sm' }), ...animStyle(5), padding: `${t.spacing[5]}px`, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4] }}>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.semibold,
              color: t.colors.neutral[900],
            }}>
              Score Distribution
            </Text>
            <Box style={{ display: 'flex', gap: t.spacing[4] }}>
              {Object.entries(analytics.scoreDistribution).map(([variantId, dist], idx) => {
                const variant = experiment.variants.find(v => v.id === variantId);
                return (
                  <Box key={variantId} style={{ flex: 1 }}>
                    <ScoreDistributionChart
                      distribution={dist}
                      variantId={variantId}
                      variantLabel={variant?.label ?? variantId}
                      color={variantColors[idx % variantColors.length]}
                      tokens={t}
                    />
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Outcome correlation */}
        {analytics?.outcomeCorrelation && (
          <Box style={{ ...createCardStyle(t, { elevation: 'sm' }), ...animStyle(6), padding: `${t.spacing[5]}px`, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Briefcase size={ICON_SIZES.section} style={{ color: t.colors.primaryScale[500] }} />
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[900],
              }}>
                Hiring Outcome Correlation
              </Text>
            </Box>
            <OutcomeCorrelationSection
              correlation={analytics.outcomeCorrelation}
              variants={experiment.variants}
              tokens={t}
            />
          </Box>
        )}

        {/* Recommendation */}
        <Box style={{
          ...createCardStyle(t, { elevation: 'sm' }),
          ...animStyle(7),
          padding: `${t.spacing[5]}px`,
          display: 'flex', alignItems: 'flex-start', gap: t.spacing[3],
          backgroundColor: t.colors.primaryScale[50],
          border: `1px solid ${t.colors.primaryScale[200]}`,
        }}>
          <Box style={{
            width: 36, height: 36, borderRadius: br,
            backgroundColor: t.colors.primaryScale[100],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Sparkles size={ICON_SIZES.section} style={{ color: t.colors.primaryScale[600] }} />
          </Box>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.primaryScale[800] }}>
              Recommendation
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.primaryScale[700], lineHeight: 1.6 }}>
              {recommendation}
            </Text>
          </Box>
        </Box>
      </Box>
    );
  },
});
