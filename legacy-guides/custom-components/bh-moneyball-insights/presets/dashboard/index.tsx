'use client';

/**
 * BhMoneyballInsights - Dashboard Preset
 * Overview of all AI-discovered hiring pattern insights with stats,
 * filterable card grid, correlation meters, and discovery action.
 */

import { useState, useMemo } from 'react';
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
  createFilterPillStyle,
  createBadgeStyle,
  createPersonalitySkeletonStyle,
  createStatCardLayout,
  createStatValueStyle,
  createStatLabelStyle,
  getCardPadding,
  getAccentAwareLayout,
  clickableProps,
  ICON_SIZES,
  numericValue,
  formatPercent,
} from '../../../helpers';
import type {
  BhMoneyballInsightsProps,
  MoneyballInsight,
  PatternType,
  InsightStatus,
} from '../../core';
import {
  getPatternTypeConfig,
  getInsightStatusConfig,
  getSignificanceStars,
  getCorrelationColor,
  formatPValue,
} from '../../core';
import type { DesignTokens } from '../../../../../types';
import {
  Brain, TrendingUp, CheckCircle, Search, Zap,
  BarChart3, Target, Clock, Users, Star,
  Filter, Play, ChevronRight, Eye, Sparkles,
  ArrowUpRight, ArrowDownRight, Activity,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Pattern Icon mapping
 * -------------------------------------------------------------------------*/

function PatternIcon({ type, size = ICON_SIZES.section }: { type: PatternType; size?: number }) {
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
 * CorrelationMeter sub-component
 * -------------------------------------------------------------------------*/

let _Box: any;
let _Text: any;

function CorrelationMeter({ value, tokens: t }: { value: number; tokens: DesignTokens }) {
  const Box = _Box;
  const Text = _Text;
  const normalized = Math.abs(value);
  const widthPct = Math.min(normalized * 100, 100);
  const color = getCorrelationColor(t, value);
  const isPositive = value >= 0;

  return (
    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Correlation</Text>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isPositive ? <ArrowUpRight size={ICON_SIZES.inline} style={{ color }} /> : <ArrowDownRight size={ICON_SIZES.inline} style={{ color }} />}
          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color }}>{value.toFixed(2)}</Text>
        </Box>
      </Box>
      <Box style={{
        height: 6, borderRadius: t.borderRadius.full,
        backgroundColor: t.colors.neutral[100], overflow: 'hidden' as const,
      }}>
        <Box style={{
          height: '100%', width: `${widthPct}%`,
          borderRadius: t.borderRadius.full,
          backgroundColor: color,
          transition: 'width 0.6s ease',
        }} />
      </Box>
    </Box>
  );
}

/* ---------------------------------------------------------------------------
 * SignificanceStars sub-component
 * -------------------------------------------------------------------------*/

function SignificanceStars({ significance, tokens: t }: { significance: number; tokens: DesignTokens }) {
  const Box = _Box;
  const stars = getSignificanceStars(significance);
  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {[1, 2, 3].map(i => (
        <Star
          key={i}
          size={ICON_SIZES.inline}
          fill={i <= stars ? t.colors.warningScale[400] : 'none'}
          style={{ color: i <= stars ? t.colors.warningScale[400] : t.colors.neutral[200] }}
        />
      ))}
    </Box>
  );
}

/* ---------------------------------------------------------------------------
 * MiniSparkline sub-component
 * -------------------------------------------------------------------------*/

function MiniSparkline({ data, tokens: t }: { data: number[]; tokens: DesignTokens }) {
  const Box = _Box;
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 24;
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Box style={{ width, height, flexShrink: 0 }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <polyline
          points={points}
          fill="none"
          stroke={t.colors.primaryScale[400]}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
}

/* ---------------------------------------------------------------------------
 * Skeleton Loader sub-component
 * -------------------------------------------------------------------------*/

function InsightCardSkeleton({ tokens: t, index }: { tokens: DesignTokens; index: number }) {
  const Box = _Box;
  const skeleton = createPersonalitySkeletonStyle(t);
  return (
    <Box style={{
      ...createCardStyle(t, { elevation: 'sm' }),
      padding: getCardPadding(t),
      display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
    }}>
      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
        <Box style={{ ...skeleton, width: 32, height: 32, borderRadius: t.borderRadius.md }} />
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
          <Box style={{ ...skeleton, width: '60%', height: 14 }} />
          <Box style={{ ...skeleton, width: '40%', height: 10 }} />
        </Box>
      </Box>
      <Box style={{ ...skeleton, width: '100%', height: 10 }} />
      <Box style={{ ...skeleton, width: '80%', height: 10 }} />
      <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box style={{ ...skeleton, width: '30%', height: 6 }} />
        <Box style={{ ...skeleton, width: '20%', height: 6 }} />
      </Box>
    </Box>
  );
}

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const DashboardBhMoneyballInsights = createPreset<BhMoneyballInsightsProps>({
  name: 'BhMoneyballInsights.Dashboard',
  render: ({ primitives, props, tokens: t }: PresetContext<BhMoneyballInsightsProps>) => {
    const { Box, Text } = primitives;
    _Box = Box;
    _Text = Text;

    const br = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const patternCfg = useMemo(() => getPatternTypeConfig(t), [t]);
    const statusCfg = useMemo(() => getInsightStatusConfig(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    const {
      insights: rawInsights = [],
      stats: rawStats,
      loading = false,
      patternTypeFilter: ptfProp,
      statusFilter: sfProp,
      significanceThreshold: stProp,
      onPatternTypeFilterChange,
      onStatusFilterChange,
      onSignificanceThresholdChange,
      onRunDiscovery,
      onInsightSelect,
      className,
      style,
    } = props;

    const insights = Array.isArray(rawInsights) ? rawInsights : [];

    // Internal state
    const [iPtFilter, setIPtFilter] = useState<PatternType | 'all'>('all');
    const [iSfFilter, setISfFilter] = useState<InsightStatus | 'all'>('all');

    const ptFilter = ptfProp ?? iPtFilter;
    const sfFilter = sfProp ?? iSfFilter;
    const sigThreshold = stProp ?? 0.05;

    const setPtFilter = (f: PatternType | 'all') => {
      onPatternTypeFilterChange?.(f);
      if (!ptfProp) setIPtFilter(f);
    };
    const setSfFilter = (f: InsightStatus | 'all') => {
      onStatusFilterChange?.(f);
      if (!sfProp) setISfFilter(f);
    };

    // Filtered insights
    const filtered = useMemo(() => {
      let result = insights;
      if (ptFilter !== 'all') {
        result = result.filter(i => i.patternType === ptFilter);
      }
      if (sfFilter !== 'all') {
        result = result.filter(i => i.status === sfFilter);
      }
      result = result.filter(i => i.statisticalSignificance <= sigThreshold);
      return result;
    }, [insights, ptFilter, sfFilter, sigThreshold]);

    // Computed stats
    const stats = rawStats ?? useMemo(() => {
      if (insights.length === 0) return { totalInsights: 0, avgSignificance: 0, confirmedCount: 0, topPatternType: null };
      const avgSig = insights.reduce((s, i) => s + i.statisticalSignificance, 0) / insights.length;
      const confirmed = insights.filter(i => i.status === 'confirmed').length;
      const typeCounts: Record<string, number> = {};
      insights.forEach(i => { typeCounts[i.patternType] = (typeCounts[i.patternType] || 0) + 1; });
      const topPt = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as PatternType | undefined;
      return { totalInsights: insights.length, avgSignificance: avgSig, confirmedCount: confirmed, topPatternType: topPt ?? null };
    }, [insights]);

    const patternTypes: Array<PatternType | 'all'> = ['all', 'question_correlation', 'skill_predictor', 'source_quality', 'timing_pattern', 'demographic_insight'];
    const statusTypes: Array<InsightStatus | 'all'> = ['all', 'new', 'confirmed', 'investigating', 'dismissed'];

    const patternTypeLabels: Record<string, string> = {
      all: 'All Types',
      question_correlation: 'Question',
      skill_predictor: 'Skill',
      source_quality: 'Source',
      timing_pattern: 'Timing',
      demographic_insight: 'Demo',
    };
    const statusLabels: Record<string, string> = {
      all: 'All Status',
      new: 'New',
      confirmed: 'Confirmed',
      investigating: 'Investigating',
      dismissed: 'Dismissed',
    };

    return (
      <Box className={className} style={{
        display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5],
        height: '100%', ...style,
      }}>
        {/* ---- Stats Row ---- */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[4] }}>
          {[
            { label: 'Total Insights', value: String(stats.totalInsights), icon: <Brain size={ICON_SIZES.feature} style={{ color: t.colors.primaryScale[500] }} /> },
            { label: 'Avg Significance', value: stats.avgSignificance > 0 ? `p=${stats.avgSignificance.toFixed(3)}` : '--', icon: <Activity size={ICON_SIZES.feature} style={{ color: t.colors.successScale[500] }} /> },
            { label: 'Confirmed', value: String(stats.confirmedCount), icon: <CheckCircle size={ICON_SIZES.feature} style={{ color: t.colors.successScale[500] }} /> },
            { label: 'Top Pattern', value: stats.topPatternType ? patternCfg[stats.topPatternType]?.label ?? '--' : '--', icon: <TrendingUp size={ICON_SIZES.feature} style={{ color: t.colors.infoScale[500] }} /> },
          ].map((stat, idx) => (
            <Box key={idx} style={{
              ...createStatCardLayout(t, { elevation: 'sm' }),
              padding: getCardPadding(t), gap: t.spacing[2],
              ...animStyle(idx),
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box style={createIconContainerStyle(t, { size: 36 })}>
                  {stat.icon}
                </Box>
              </Box>
              <Text style={createStatValueStyle(t)}>{stat.value}</Text>
              <Text style={createStatLabelStyle(t, { personality: ptypo })}>{stat.label}</Text>
            </Box>
          ))}
        </Box>

        {/* ---- Filters + Actions Row ---- */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap' as const, gap: t.spacing[3],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexWrap: 'wrap' as const }}>
            <Filter size={ICON_SIZES.label} style={{ color: t.colors.neutral[400] }} />
            {/* Pattern type pills */}
            {patternTypes.map(pt => (
              <Box key={pt}
                {...clickableProps(() => setPtFilter(pt), `Filter: ${patternTypeLabels[pt]}`)}
                onClick={() => setPtFilter(pt)}
                style={createFilterPillStyle(t, { active: ptFilter === pt })}
              >
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{patternTypeLabels[pt]}</Text>
              </Box>
            ))}
            <Box style={{ width: 1, height: 16, backgroundColor: t.colors.neutral[200], margin: `0 ${t.spacing[1]}px` }} />
            {/* Status pills */}
            {statusTypes.map(st => (
              <Box key={st}
                {...clickableProps(() => setSfFilter(st), `Filter: ${statusLabels[st]}`)}
                onClick={() => setSfFilter(st)}
                style={createFilterPillStyle(t, { active: sfFilter === st })}
              >
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{statusLabels[st]}</Text>
              </Box>
            ))}
          </Box>

          {/* Run Discovery Button */}
          {onRunDiscovery && (
            <Box
              {...clickableProps(onRunDiscovery, 'Run Discovery')}
              onClick={onRunDiscovery}
              style={{
                display: 'flex', alignItems: 'center', gap: t.spacing[2],
                padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                borderRadius: t.borderRadius.lg,
                backgroundColor: t.colors.primaryScale[600],
                color: t.colors.common.white,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                cursor: 'pointer',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <Play size={ICON_SIZES.label} />
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.common.white }}>Run Discovery</Text>
            </Box>
          )}
        </Box>

        {/* ---- Loading State ---- */}
        {loading && (
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: t.spacing[4] }}>
            {[0, 1, 2, 3, 4, 5].map(i => (
              <InsightCardSkeleton key={i} tokens={t} index={i} />
            ))}
          </Box>
        )}

        {/* ---- Empty State ---- */}
        {!loading && filtered.length === 0 && (
          <Box style={createEmptyStateStyle(t)}>
            <Brain size={ICON_SIZES.illustration} style={{ color: t.colors.neutral[300], marginBottom: t.spacing[3] }} />
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[600], marginBottom: t.spacing[2] }}>
              No insights discovered yet
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400], maxWidth: 400 }}>
              Run the discovery engine to analyze your hiring data and uncover hidden correlations that predict candidate success.
            </Text>
          </Box>
        )}

        {/* ---- Insight Cards Grid ---- */}
        {!loading && filtered.length > 0 && (
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: t.spacing[4] }}>
            {filtered.map((insight, idx) => {
              const ptCfg = patternCfg[insight.patternType] ?? patternCfg.question_correlation;
              const stCfg = statusCfg[insight.status] ?? statusCfg.new;

              return (
                <Box
                  key={insight.id}
                  {...clickableProps(onInsightSelect ? () => onInsightSelect(insight.id) : undefined, `View insight: ${insight.title}`)}
                  onClick={() => onInsightSelect?.(insight.id)}
                  onMouseEnter={(e: any) => {
                    if (hoverStyles.hover.transform) e.currentTarget.style.transform = hoverStyles.hover.transform;
                    if (hoverStyles.hover.boxShadow) e.currentTarget.style.boxShadow = hoverStyles.hover.boxShadow;
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = t.shadows.sm;
                  }}
                  style={{
                    ...createCardStyle(t, { elevation: 'sm' }),
                    ...hoverStyles.base,
                    padding: getCardPadding(t),
                    display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
                    ...animStyle(idx),
                  }}
                >
                  {/* Card header: pattern icon + badge + status */}
                  <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Box style={{
                        ...createIconContainerStyle(t, { size: 32, color: ptCfg.bgColor }),
                        color: ptCfg.color,
                      }}>
                        <PatternIcon type={insight.patternType} size={ICON_SIZES.section} />
                      </Box>
                      <Box style={{
                        padding: `1px ${t.spacing[2]}px`, borderRadius: br,
                        backgroundColor: ptCfg.bgColor, color: ptCfg.color,
                        border: `1px solid ${ptCfg.borderColor}`,
                        fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                      }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>{ptCfg.label}</Text>
                      </Box>
                    </Box>
                    <Box style={{
                      padding: `1px ${t.spacing[2]}px`, borderRadius: br,
                      backgroundColor: stCfg.bgColor, color: stCfg.color,
                      border: `1px solid ${stCfg.borderColor}`,
                      fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs }}>{stCfg.label}</Text>
                    </Box>
                  </Box>

                  {/* Title + Description */}
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Text style={{
                      fontSize: t.typography.fontSize.sm,
                      fontWeight: t.typography.fontWeight.semibold,
                      color: t.colors.neutral[900],
                      lineHeight: 1.3,
                    }}>{insight.title}</Text>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      color: t.colors.neutral[500],
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as any,
                      overflow: 'hidden',
                    }}>{insight.description}</Text>
                  </Box>

                  {/* Correlation Meter */}
                  <CorrelationMeter value={insight.correlationCoefficient} tokens={t} />

                  {/* Stats row: significance, sample size, sparkline */}
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: 1 }}>
                        <Text style={{ fontSize: 9, color: t.colors.neutral[400], textTransform: ptypo.labelTransform as any, letterSpacing: ptypo.labelLetterSpacing }}>Significance</Text>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>{formatPValue(insight.statisticalSignificance)}</Text>
                          <SignificanceStars significance={insight.statisticalSignificance} tokens={t} />
                        </Box>
                      </Box>
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: 1 }}>
                        <Text style={{ fontSize: 9, color: t.colors.neutral[400], textTransform: ptypo.labelTransform as any, letterSpacing: ptypo.labelLetterSpacing }}>Sample</Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>n={insight.sampleSize}</Text>
                      </Box>
                    </Box>
                    {insight.trendData && <MiniSparkline data={insight.trendData} tokens={t} />}
                  </Box>

                  {/* Footer: view detail link */}
                  <Box style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                    paddingTop: t.spacing[2],
                    borderTop: `1px solid ${t.colors.neutral[100]}`,
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], color: t.colors.primaryScale[600] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.primaryScale[600] }}>View Details</Text>
                      <ChevronRight size={ICON_SIZES.inline} />
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
