'use client';

/**
 * BhMoneyballInsights - Detail Preset
 * Deep dive view for a single AI-discovered hiring pattern insight.
 * Shows key metrics, correlation visualization, affected candidates,
 * and action buttons.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,
  createBadgeStyle,
  createPersonalitySkeletonStyle,
  createMetadataGridStyle,
  createMetadataFieldStyle,
  createMetadataLabelStyle,
  createMetadataValueStyle,
  createStatValueStyle,
  createStatLabelStyle,
  createStatCardLayout,
  getCardPadding,
  clickableProps,
  ICON_SIZES,
  formatPercent,
  formatDate,
} from '../../../helpers';
import type {
  BhMoneyballInsightsProps,
  MoneyballCorrelation,
  AffectedCandidate,
} from '../../core';
import {
  getPatternTypeConfig,
  getInsightStatusConfig,
  getSignificanceStars,
  getCorrelationColor,
  formatPValue,
  getOutcomeConfig,
} from '../../core';
import type { DesignTokens } from '../../../../../types';
import {
  Brain, Target, Users, Clock, BarChart3, Sparkles,
  CheckCircle, XCircle, Search, ArrowUpRight, ArrowDownRight,
  Star, Calendar, Cpu, Hash, Shield, Eye,
  ThumbsUp, ThumbsDown, AlertTriangle, ChevronRight,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Pattern icon mapping
 * -------------------------------------------------------------------------*/

function PatternIcon({ type, size = ICON_SIZES.feature }: { type: string; size?: number }) {
  switch (type) {
    case 'question_correlation': return <Brain size={size} />;
    case 'skill_predictor': return <Target size={size} />;
    case 'source_quality': return <Users size={size} />;
    case 'timing_pattern': return <Clock size={size} />;
    case 'demographic_insight': return <BarChart3 size={size} />;
    default: return <Sparkles size={size} />;
  }
}

/* ---------------------------------------------------------------------------
 * Module-level refs for sub-components
 * -------------------------------------------------------------------------*/

let _Box: any;
let _Text: any;

/* ---------------------------------------------------------------------------
 * CorrelationBar sub-component - horizontal bar visualization
 * -------------------------------------------------------------------------*/

function CorrelationBar({ correlation, tokens: t, index }: { correlation: MoneyballCorrelation; tokens: DesignTokens; index: number }) {
  const Box = _Box;
  const Text = _Text;
  const color = getCorrelationColor(t, correlation.coefficient);
  const abs = Math.abs(correlation.coefficient);
  const widthPct = Math.min(abs * 100, 100);
  const isPositive = correlation.coefficient >= 0;
  const entrance = createEntranceAnimation(t, { index });

  return (
    <Box style={{
      display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2],
      padding: t.spacing[3], borderRadius: t.borderRadius.md,
      backgroundColor: t.colors.neutral[50],
      border: `1px solid ${t.colors.neutral[100]}`,
      ...entrance.animate,
      transition: entrance.transition,
    }}>
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: 1 }}>
          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{correlation.variable1}</Text>
          <Text style={{ fontSize: 9, color: t.colors.neutral[400] }}>vs {correlation.variable2}</Text>
        </Box>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isPositive ? <ArrowUpRight size={ICON_SIZES.label} style={{ color }} /> : <ArrowDownRight size={ICON_SIZES.label} style={{ color }} />}
          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color }}>{correlation.coefficient.toFixed(3)}</Text>
        </Box>
      </Box>
      <Box style={{
        height: 8, borderRadius: t.borderRadius.full,
        backgroundColor: t.colors.neutral[100], overflow: 'hidden' as const,
      }}>
        <Box style={{
          height: '100%', width: `${widthPct}%`,
          borderRadius: t.borderRadius.full,
          backgroundColor: color,
          transition: 'width 0.8s ease',
        }} />
      </Box>
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 9, color: t.colors.neutral[400] }}>p-value: {formatPValue(correlation.pValue)}</Text>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {[1, 2, 3].map(i => (
            <Star key={i} size={8}
              fill={i <= getSignificanceStars(correlation.pValue) ? t.colors.warningScale[400] : 'none'}
              style={{ color: i <= getSignificanceStars(correlation.pValue) ? t.colors.warningScale[400] : t.colors.neutral[200] }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

/* ---------------------------------------------------------------------------
 * CandidateRow sub-component
 * -------------------------------------------------------------------------*/

function CandidateRow({ candidate, tokens: t, index }: { candidate: AffectedCandidate; tokens: DesignTokens; index: number }) {
  const Box = _Box;
  const Text = _Text;
  const outcomeConfig = getOutcomeConfig(t);
  const oc = outcomeConfig[candidate.outcome] ?? outcomeConfig.pending;
  const br = getPersonalityBadgeRadius(t);
  const initials = candidate.name.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const entrance = createEntranceAnimation(t, { index });

  return (
    <Box style={{
      display: 'flex', alignItems: 'center', gap: t.spacing[3],
      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
      borderRadius: t.borderRadius.md,
      border: `1px solid ${t.colors.neutral[100]}`,
      ...entrance.animate,
      transition: entrance.transition,
    }}>
      <Box style={{
        width: 32, height: 32, borderRadius: t.borderRadius.full,
        backgroundColor: t.colors.primaryScale[50], color: t.colors.primaryScale[700],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, flexShrink: 0,
      }}>{initials}</Box>
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: 1, minWidth: 0 }}>
        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[900] }}>{candidate.name}</Text>
        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Score: {candidate.score}%</Text>
      </Box>
      <Box style={{
        padding: `1px ${t.spacing[2]}px`, borderRadius: br,
        backgroundColor: oc.bgColor, color: oc.color,
        fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
      }}>
        <Text style={{ fontSize: t.typography.fontSize.xs }}>{oc.label}</Text>
      </Box>
    </Box>
  );
}

/* ---------------------------------------------------------------------------
 * Detail Skeleton
 * -------------------------------------------------------------------------*/

function DetailSkeleton({ tokens: t }: { tokens: DesignTokens }) {
  const Box = _Box;
  const skeleton = createPersonalitySkeletonStyle(t);
  return (
    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5] }}>
      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
        <Box style={{ ...skeleton, width: 48, height: 48, borderRadius: t.borderRadius.lg }} />
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
          <Box style={{ ...skeleton, width: '50%', height: 20 }} />
          <Box style={{ ...skeleton, width: '30%', height: 14 }} />
        </Box>
      </Box>
      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[4] }}>
        {[0, 1, 2, 3].map(i => <Box key={i} style={{ ...skeleton, height: 80, borderRadius: t.borderRadius.lg }} />)}
      </Box>
      <Box style={{ ...skeleton, height: 200, borderRadius: t.borderRadius.lg }} />
    </Box>
  );
}

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const DetailBhMoneyballInsights = createPreset<BhMoneyballInsightsProps>({
  name: 'BhMoneyballInsights.Detail',
  render: ({ primitives, props, tokens: t }: PresetContext<BhMoneyballInsightsProps>) => {
    const { Box, Text } = primitives;
    _Box = Box;
    _Text = Text;

    const br = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const patternCfg = useMemo(() => getPatternTypeConfig(t), [t]);
    const statusCfg = useMemo(() => getInsightStatusConfig(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const {
      insight,
      correlations: rawCorrelations = [],
      affectedCandidates: rawCandidates = [],
      loading = false,
      onConfirm,
      onDismiss,
      onInvestigate,
      className,
      style,
    } = props;

    const correlations = Array.isArray(rawCorrelations) ? rawCorrelations : [];
    const candidates = Array.isArray(rawCandidates) ? rawCandidates : [];

    if (loading) {
      return (
        <Box className={className} style={{ padding: t.spacing[6], ...style }}>
          <DetailSkeleton tokens={t} />
        </Box>
      );
    }

    if (!insight) {
      return (
        <Box className={className} style={{ ...createEmptyStateStyle(t), ...style }}>
          <Search size={ICON_SIZES.illustration} style={{ color: t.colors.neutral[300], marginBottom: t.spacing[3] }} />
          <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[600], marginBottom: t.spacing[2] }}>
            Insight not found
          </Text>
          <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
            The requested insight could not be loaded.
          </Text>
        </Box>
      );
    }

    const ptCfg = patternCfg[insight.patternType] ?? patternCfg.question_correlation;
    const stCfg = statusCfg[insight.status] ?? statusCfg.new;
    const coeffColor = getCorrelationColor(t, insight.correlationCoefficient);

    return (
      <Box className={className} style={{
        display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5],
        height: '100%', ...style,
      }}>
        {/* ---- Header ---- */}
        <Box style={{
          ...createCardStyle(t, { elevation: 'sm' }),
          padding: getCardPadding(t),
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4],
          ...entrance.animate, transition: entrance.transition,
        }}>
          {accentBar && <Box style={accentBar} />}
          <Box style={{ display: 'flex', alignItems: 'flex-start', gap: t.spacing[4] }}>
            <Box style={{
              ...createIconContainerStyle(t, { size: 48, color: ptCfg.bgColor }),
              color: ptCfg.color,
            }}>
              <PatternIcon type={insight.patternType} size={ICON_SIZES.hero} />
            </Box>
            <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexWrap: 'wrap' as const }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.neutral[900],
                }}>{insight.title}</Text>
                <Box style={{
                  padding: `2px ${t.spacing[2]}px`, borderRadius: br,
                  backgroundColor: stCfg.bgColor, color: stCfg.color,
                  border: `1px solid ${stCfg.borderColor}`,
                  fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold,
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{stCfg.label}</Text>
                </Box>
                <Box style={{
                  padding: `2px ${t.spacing[2]}px`, borderRadius: br,
                  backgroundColor: ptCfg.bgColor, color: ptCfg.color,
                  border: `1px solid ${ptCfg.borderColor}`,
                  fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{ptCfg.label}</Text>
                </Box>
              </Box>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600], lineHeight: 1.5 }}>
                {insight.description}
              </Text>
            </Box>
          </Box>

          {/* Action buttons */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexWrap: 'wrap' as const }}>
            {onConfirm && (
              <Box
                {...clickableProps(() => onConfirm(insight.id), 'Confirm insight')}
                onClick={() => onConfirm(insight.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[1],
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                  borderRadius: t.borderRadius.lg,
                  backgroundColor: t.colors.successScale[600],
                  color: t.colors.common.white,
                  fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold,
                  cursor: 'pointer', transition: `all ${t.motion.hover}`,
                }}
              >
                <ThumbsUp size={ICON_SIZES.label} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white }}>Confirm</Text>
              </Box>
            )}
            {onInvestigate && (
              <Box
                {...clickableProps(() => onInvestigate(insight.id), 'Investigate insight')}
                onClick={() => onInvestigate(insight.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[1],
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                  borderRadius: t.borderRadius.lg,
                  backgroundColor: t.colors.warningScale[600],
                  color: t.colors.common.white,
                  fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold,
                  cursor: 'pointer', transition: `all ${t.motion.hover}`,
                }}
              >
                <Eye size={ICON_SIZES.label} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white }}>Investigate</Text>
              </Box>
            )}
            {onDismiss && (
              <Box
                {...clickableProps(() => onDismiss(insight.id), 'Dismiss insight')}
                onClick={() => onDismiss(insight.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[1],
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                  borderRadius: t.borderRadius.lg,
                  border: `1px solid ${t.colors.neutral[300]}`,
                  backgroundColor: t.colors.common.white,
                  color: t.colors.neutral[600],
                  fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium,
                  cursor: 'pointer', transition: `all ${t.motion.hover}`,
                }}
              >
                <XCircle size={ICON_SIZES.label} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>Dismiss</Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* ---- Key Metrics Row ---- */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[4] }}>
          {/* Correlation Coefficient - large display */}
          <Box style={{
            ...createStatCardLayout(t, { elevation: 'sm' }),
            padding: getCardPadding(t), gap: t.spacing[2],
            alignItems: 'center',
          }}>
            <Box style={{
              fontSize: t.typography.fontSize['2xl'],
              fontWeight: t.typography.fontWeight.bold,
              color: coeffColor, lineHeight: 1,
            }}>
              <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: coeffColor }}>
                {insight.correlationCoefficient.toFixed(3)}
              </Text>
            </Box>
            <Text style={createStatLabelStyle(t, { personality: ptypo })}>Correlation</Text>
            <Box style={{
              width: '100%', height: 6, borderRadius: t.borderRadius.full,
              backgroundColor: t.colors.neutral[100], overflow: 'hidden' as const,
            }}>
              <Box style={{
                height: '100%',
                width: `${Math.min(Math.abs(insight.correlationCoefficient) * 100, 100)}%`,
                borderRadius: t.borderRadius.full,
                backgroundColor: coeffColor,
              }} />
            </Box>
          </Box>

          {/* P-Value */}
          <Box style={{
            ...createStatCardLayout(t, { elevation: 'sm' }),
            padding: getCardPadding(t), gap: t.spacing[2],
            alignItems: 'center',
          }}>
            <Text style={createStatValueStyle(t)}>
              {formatPValue(insight.statisticalSignificance)}
            </Text>
            <Text style={createStatLabelStyle(t, { personality: ptypo })}>P-Value</Text>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {[1, 2, 3].map(i => (
                <Star key={i} size={ICON_SIZES.label}
                  fill={i <= getSignificanceStars(insight.statisticalSignificance) ? t.colors.warningScale[400] : 'none'}
                  style={{ color: i <= getSignificanceStars(insight.statisticalSignificance) ? t.colors.warningScale[400] : t.colors.neutral[200] }}
                />
              ))}
            </Box>
          </Box>

          {/* Sample Size */}
          <Box style={{
            ...createStatCardLayout(t, { elevation: 'sm' }),
            padding: getCardPadding(t), gap: t.spacing[2],
            alignItems: 'center',
          }}>
            <Text style={createStatValueStyle(t)}>
              {insight.sampleSize.toLocaleString()}
            </Text>
            <Text style={createStatLabelStyle(t, { personality: ptypo })}>Sample Size</Text>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Hash size={ICON_SIZES.inline} style={{ color: t.colors.neutral[400] }} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>candidates analyzed</Text>
            </Box>
          </Box>

          {/* Confidence */}
          <Box style={{
            ...createStatCardLayout(t, { elevation: 'sm' }),
            padding: getCardPadding(t), gap: t.spacing[2],
            alignItems: 'center',
          }}>
            <Text style={createStatValueStyle(t)}>
              {insight.statisticalSignificance <= 0.001 ? '99.9%' :
               insight.statisticalSignificance <= 0.01 ? '99%' :
               insight.statisticalSignificance <= 0.05 ? '95%' : '<95%'}
            </Text>
            <Text style={createStatLabelStyle(t, { personality: ptypo })}>Confidence</Text>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Shield size={ICON_SIZES.inline} style={{ color: t.colors.successScale[400] }} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>interval</Text>
            </Box>
          </Box>
        </Box>

        {/* ---- Main Content: Correlations + Candidates ---- */}
        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[4] }}>
          {/* Correlation Visualization */}
          <Box style={{
            ...createCardStyle(t, { elevation: 'sm' }),
            padding: getCardPadding(t),
            display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
          }}>
            <Text style={sectionHdr}>Correlations</Text>
            {correlations.length === 0 ? (
              <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
                <BarChart3 size={ICON_SIZES.hero} style={{ color: t.colors.neutral[300], marginBottom: t.spacing[2] }} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>No correlation data available</Text>
              </Box>
            ) : (
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                {correlations.map((corr, idx) => (
                  <CorrelationBar key={idx} correlation={corr} tokens={t} index={idx} />
                ))}
              </Box>
            )}
          </Box>

          {/* Affected Candidates */}
          <Box style={{
            ...createCardStyle(t, { elevation: 'sm' }),
            padding: getCardPadding(t),
            display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={sectionHdr}>Affected Candidates</Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{candidates.length} total</Text>
            </Box>
            {candidates.length === 0 ? (
              <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
                <Users size={ICON_SIZES.hero} style={{ color: t.colors.neutral[300], marginBottom: t.spacing[2] }} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>No candidates linked to this insight</Text>
              </Box>
            ) : (
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2], maxHeight: 360, overflow: 'auto' }}>
                {candidates.map((cand, idx) => (
                  <CandidateRow key={cand.id} candidate={cand} tokens={t} index={idx} />
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* ---- Discovery Metadata ---- */}
        <Box style={{
          ...createCardStyle(t, { elevation: 'sm' }),
          padding: getCardPadding(t),
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
        }}>
          <Text style={sectionHdr}>Discovery Metadata</Text>
          <Box style={createMetadataGridStyle(t, { columns: 4 })}>
            <Box style={createMetadataFieldStyle(t)}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Cpu size={ICON_SIZES.inline} style={{ color: t.colors.neutral[400] }} />
                <Text style={createMetadataLabelStyle(t, { personality: ptypo })}>Model Version</Text>
              </Box>
              <Text style={createMetadataValueStyle(t)}>{insight.modelVersion || '--'}</Text>
            </Box>
            <Box style={createMetadataFieldStyle(t)}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Calendar size={ICON_SIZES.inline} style={{ color: t.colors.neutral[400] }} />
                <Text style={createMetadataLabelStyle(t, { personality: ptypo })}>Discovered At</Text>
              </Box>
              <Text style={createMetadataValueStyle(t)}>{formatDate(insight.discoveredAt)}</Text>
            </Box>
            <Box style={createMetadataFieldStyle(t)}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Hash size={ICON_SIZES.inline} style={{ color: t.colors.neutral[400] }} />
                <Text style={createMetadataLabelStyle(t, { personality: ptypo })}>Insight ID</Text>
              </Box>
              <Text style={{ ...createMetadataValueStyle(t), fontFamily: 'monospace', fontSize: t.typography.fontSize.xs }}>{insight.id.slice(0, 12)}...</Text>
            </Box>
            <Box style={createMetadataFieldStyle(t)}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Users size={ICON_SIZES.inline} style={{ color: t.colors.neutral[400] }} />
                <Text style={createMetadataLabelStyle(t, { personality: ptypo })}>Affected Candidates</Text>
              </Box>
              <Text style={createMetadataValueStyle(t)}>{insight.affectedCandidateIds.length}</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
