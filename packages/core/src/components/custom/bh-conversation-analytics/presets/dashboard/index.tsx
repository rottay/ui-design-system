'use client';

/**
 * BhConversationAnalytics - Dashboard Preset
 * Full dashboard with KPI cards, volume trend line chart, score distribution bar chart,
 * and agent performance table.
 */

import { useMemo, useCallback} from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createCardHoverStyles,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createProgressBarStyle,
  createEmptyStateStyle,
  getChartConfig,

  createDividerStyle,
} from '../../../helpers';
import type { DesignTokens } from '../../../../../types';
import type { EngineAwareProps } from '../../../../../types';
import type {
  BhConversationAnalyticsProps,
  ConversationVolumePoint,
  ScoreDistribution,
  AgentPerformance,
} from '../../core';
import {
  MessageSquare,
  Star,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Users,
  Activity,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function buildPolyline(points: { x: number; y: number }[]): string {
  return points.map(p => `${p.x},${p.y}`).join(' ');
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const CHART_PAD = { top: 20, right: 20, bottom: 40, left: 50 };
const CHART_HEIGHT = 240;
const CHART_WIDTH = 600;
const BAR_CHART_HEIGHT = 200;
const BAR_CHART_WIDTH = 400;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const DashboardBhConversationAnalytics = createPreset<BhConversationAnalyticsProps>({
  name: 'BhConversationAnalytics.Dashboard',
  render: ({ primitives, props, tokens }: PresetContext<BhConversationAnalyticsProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      volumeData: rawVolumeData = undefined,
      scoreDistribution: rawScoreDistribution = [],
      agentPerformance: rawAgentPerformance = [],
      totalConversations = 1401,
      avgScore = 83,
      avgCompletionRate = 90.6,
      avgDuration = 30,
      period = 'Last 30 days',
      onAgentClick,
      loading = false,
      className,
      style,
    } = props;

    const volumeData = Array.isArray(rawVolumeData) ? rawVolumeData : [] as ConversationVolumePoint[];
    const scoreDistribution = Array.isArray(rawScoreDistribution) ? rawScoreDistribution : [];
    const agentPerformance = Array.isArray(rawAgentPerformance) ? rawAgentPerformance : [];

    /* --- Glass / personality tokens --- */
    const isGlass = t.surface.useGlass && !!t.glass;
    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const emptyState = useMemo(() => createEmptyStateStyle(t), [t]);
    const chartConfig = useMemo(() => getChartConfig(t), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    /* --- Entrance animations --- */
    const entranceAnims = useMemo(() => {
      return Array.from({ length: 8 }, (_, i) => createEntranceAnimation(t, { index: i }));
    }, [t]);

    /* --- KPI data --- */
    const kpis = useMemo(() => [
      {
        key: 'total',
        label: 'Total Conversations',
        value: totalConversations.toLocaleString(),
        icon: MessageSquare,
        iconColor: t.colors.primaryScale[600],
        iconBg: t.colors.primaryScale[50],
        trend: 12.4,
      },
      {
        key: 'score',
        label: 'Avg Score',
        value: `${avgScore}`,
        icon: Star,
        iconColor: t.colors.warningScale[600],
        iconBg: t.colors.warningScale[50],
        trend: 3.2,
      },
      {
        key: 'completion',
        label: 'Completion Rate',
        value: `${avgCompletionRate.toFixed(1)}%`,
        icon: CheckCircle,
        iconColor: t.colors.successScale[600],
        iconBg: t.colors.successScale[50],
        trend: 1.8,
      },
      {
        key: 'duration',
        label: 'Avg Duration',
        value: formatDuration(avgDuration),
        icon: Clock,
        iconColor: t.colors.infoScale[600],
        iconBg: t.colors.infoScale[50],
        trend: -5.1,
      },
    ], [totalConversations, avgScore, avgCompletionRate, avgDuration, t]);

    /* --- Volume chart scales --- */
    const innerWidth = CHART_WIDTH - CHART_PAD.left - CHART_PAD.right;
    const innerHeight = CHART_HEIGHT - CHART_PAD.top - CHART_PAD.bottom;

    const maxVolume = useMemo(() => {
      const vals = volumeData.map(d => d.count);
      return Math.max(...vals, 10) * 1.15;
    }, [volumeData]);

    const xScale = useCallback((i: number) => {
      const count = Math.max(1, volumeData.length - 1);
      return CHART_PAD.left + (i / count) * innerWidth;
    }, [volumeData.length, innerWidth]);

    const yScale = useCallback((v: number) => {
      return CHART_PAD.top + innerHeight - (v / maxVolume) * innerHeight;
    }, [maxVolume, innerHeight]);

    const volumePoints = useMemo(
      () => volumeData.map((d, i) => ({ x: xScale(i), y: yScale(d.count) })),
      [volumeData, xScale, yScale],
    );

    const yTicks = useMemo(() => {
      const tickCount = 4;
      return Array.from({ length: tickCount + 1 }, (_, i) => Math.round((maxVolume / tickCount) * i));
    }, [maxVolume]);

    /* --- Score distribution chart --- */
    const barInnerWidth = BAR_CHART_WIDTH - CHART_PAD.left - CHART_PAD.right;
    const barInnerHeight = BAR_CHART_HEIGHT - CHART_PAD.top - CHART_PAD.bottom;

    const maxBarCount = useMemo(() => {
      return Math.max(...scoreDistribution.map(d => d.count), 1) * 1.15;
    }, [scoreDistribution]);

    const barWidth = useMemo(() => {
      if (scoreDistribution.length === 0) return 0;
      const divider = useMemo(() => createDividerStyle(t), [t]);

      return (barInnerWidth / scoreDistribution.length) * 0.7;
    }, [scoreDistribution.length, barInnerWidth]);

    const barGap = useMemo(() => {
      if (scoreDistribution.length === 0) return 0;
      return (barInnerWidth / scoreDistribution.length) * 0.3;
    }, [scoreDistribution.length, barInnerWidth]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    /* --- Agent click handler --- */
    const handleAgentClick = useCallback((agentId: string) => {
      onAgentClick?.(agentId);
    }, [onAgentClick]);

    /* --- Score color --- */
    const getScoreColor = useCallback((score: number): string => {
      if (score >= 85) return t.colors.successScale[500];
      if (score >= 70) return t.colors.warningScale[500];
      return t.colors.errorScale[500];
    }, [t]);

    /* --- Loading state --- */
    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[10], ...style }}>
          <Activity size={24} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[3] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading conversation analytics...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4], ...style }}>
        {/* Header */}
        <Box
          style={{
            ...cardBase,
            padding: t.spacing[4],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            ...entranceAnims[0].animate,
            transition: entranceAnims[0].transition,
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 36, color: t.colors.primaryScale[50] })}>
              <BarChart3 size={18} strokeWidth={1.5} style={{ color: t.colors.primaryScale[600] }} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight, letterSpacing: ptypo.headingLetterSpacing, color: t.colors.neutral[900] }}>
                Conversation Analytics
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                {period}
              </Text>
            </Box>
          </Box>
          <Box style={{ ...createBadgeStyle(t, 'primary'), borderRadius: badgeRadius }}>
            <Text style={{ fontSize: t.typography.fontSize.xs }}>Live</Text>
          </Box>
        </Box>

        {/* KPI Cards */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[3] }}>
          {kpis.map((kpi, index) => {
            const anim = entranceAnims[Math.min(index + 1, entranceAnims.length - 1)];
            const Icon = kpi.icon;
            const trendUp = kpi.trend > 0;
            const trendFlat = kpi.trend === 0;
            const TrendIcon = trendFlat ? Minus : trendUp ? TrendingUp : TrendingDown;
            const trendColor = trendFlat
              ? t.colors.neutral[500]
              : trendUp
                ? t.colors.successScale[600]
                : t.colors.errorScale[600];

            return (
              <Box
                key={kpi.key}
                style={{
                  ...animStyle(index),
                  ...cardBase,
                  padding: t.spacing[4],
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: t.spacing[2],
                  position: 'relative' as const,
                  overflow: 'hidden' as const,
                  ...anim.animate,
                  transition: anim.transition,
                }}
              >
                {accentBar && (
                  <Box style={{ ...accentBar, position: 'absolute' as const, top: 0, left: 0 }} />
                )}
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box style={createIconContainerStyle(t, { size: 32, color: kpi.iconBg })}>
                    <Icon size={16} strokeWidth={1.5} style={{ color: kpi.iconColor }} />
                  </Box>
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: t.spacing[1],
                      padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                      borderRadius: badgeRadius,
                      backgroundColor: trendFlat
                        ? t.colors.neutral[50]
                        : trendUp
                          ? t.colors.successScale[50]
                          : t.colors.errorScale[50],
                    }}
                  >
                    <TrendIcon size={12} strokeWidth={2} style={{ color: trendColor }} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: trendColor }}>
                      {Math.abs(kpi.trend).toFixed(1)}%
                    </Text>
                  </Box>
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                  <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], lineHeight: 1.2 }}>
                    {kpi.value}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginTop: t.spacing[1] }}>
                    {kpi.label}
                  </Text>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Charts Row */}
        <Box style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: t.spacing[4] }}>
          {/* Volume Trend Line Chart */}
          <Box
            style={{
              ...cardBase,
              padding: t.spacing[4],
              ...entranceAnims[5].animate,
              transition: entranceAnims[5].transition,
            }}
          >
            <Text style={{ ...sectionLabel, marginBottom: t.spacing[3] }}>Conversation Volume</Text>
            {volumeData.length === 0 ? (
              <Box style={emptyState}>
                <MessageSquare size={32} strokeWidth={1} style={{ color: t.colors.neutral[300], marginBottom: t.spacing[2] }} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No volume data available</Text>
              </Box>
            ) : (
              <svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
                {/* Grid lines */}
                {yTicks.map(tick => (
                  <g key={tick}>
                    <line
                      x1={CHART_PAD.left} y1={yScale(tick)}
                      x2={CHART_WIDTH - CHART_PAD.right} y2={yScale(tick)}
                      stroke={t.colors.neutral[100]}
                      strokeWidth={1}
                    />
                    <text
                      x={CHART_PAD.left - 8} y={yScale(tick) + 4}
                      fill={t.colors.neutral[400]}
                      fontSize={10}
                      textAnchor="end"
                    >
                      {tick}
                    </text>
                  </g>
                ))}

                {/* X-axis labels */}
                {volumeData.map((d, i) => {
                  if (volumeData.length > 10 && i % Math.ceil(volumeData.length / 8) !== 0) return null;
                  return (
                    <text
                      key={i}
                      x={xScale(i)} y={CHART_HEIGHT - 10}
                      fill={t.colors.neutral[400]}
                      fontSize={9}
                      textAnchor="middle"
                    >
                      {d.date.substring(5)}
                    </text>
                  );
                })}

                {/* Area fill */}
                <polygon
                  points={`${CHART_PAD.left},${yScale(0)} ${buildPolyline(volumePoints)} ${xScale(volumeData.length - 1)},${yScale(0)}`}
                  fill={t.colors.primaryScale[100]}
                  opacity={0.4}
                />

                {/* Line */}
                <polyline
                  points={buildPolyline(volumePoints)}
                  fill="none"
                  stroke={t.colors.primaryScale[500]}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Latest dot */}
                {volumePoints.length > 0 && (
                  <circle
                    cx={volumePoints[volumePoints.length - 1].x}
                    cy={volumePoints[volumePoints.length - 1].y}
                    r={4}
                    fill={t.colors.primaryScale[500]}
                    stroke={t.colors.common.white}
                    strokeWidth={2}
                  />
                )}
              </svg>
            )}
          </Box>

          {/* Score Distribution Bar Chart */}
          <Box
            style={{
              ...cardBase,
              padding: t.spacing[4],
              ...entranceAnims[6].animate,
              transition: entranceAnims[6].transition,
            }}
          >
            <Text style={{ ...sectionLabel, marginBottom: t.spacing[3] }}>Score Distribution</Text>
            {scoreDistribution.length === 0 ? (
              <Box style={emptyState}>
                <Star size={32} strokeWidth={1} style={{ color: t.colors.neutral[300], marginBottom: t.spacing[2] }} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No score data available</Text>
              </Box>
            ) : (
              <svg width="100%" height={BAR_CHART_HEIGHT} viewBox={`0 0 ${BAR_CHART_WIDTH} ${BAR_CHART_HEIGHT}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
                {/* Y-axis grid lines */}
                {Array.from({ length: 5 }, (_, i) => {
                  const val = Math.round((maxBarCount / 4) * i);
                  const y = CHART_PAD.top + barInnerHeight - (val / maxBarCount) * barInnerHeight;
                  return (
                    <g key={i}>
                      <line
                        x1={CHART_PAD.left} y1={y}
                        x2={BAR_CHART_WIDTH - CHART_PAD.right} y2={y}
                        stroke={t.colors.neutral[100]}
                        strokeWidth={1}
                      />
                      <text x={CHART_PAD.left - 6} y={y + 4} fill={t.colors.neutral[400]} fontSize={9} textAnchor="end">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Bars */}
                {scoreDistribution.map((d, i) => {
                  const barH = (d.count / maxBarCount) * barInnerHeight;
                  const barX = CHART_PAD.left + (i * (barInnerWidth / scoreDistribution.length)) + barGap / 2;
                  const barY = CHART_PAD.top + barInnerHeight - barH;
                  const rangeStart = parseInt(d.range.split('-')[0], 10);
                  const barColor = rangeStart >= 81
                    ? t.colors.successScale[400]
                    : rangeStart >= 61
                      ? t.colors.successScale[300]
                      : rangeStart >= 41
                        ? t.colors.warningScale[400]
                        : rangeStart >= 21
                          ? t.colors.warningScale[300]
                          : t.colors.errorScale[400];

                  return (
                    <g key={d.range}>
                      <rect
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={barH}
                        fill={barColor}
                        rx={3}
                        ry={3}
                      />
                      {/* X label */}
                      <text
                        x={barX + barWidth / 2}
                        y={BAR_CHART_HEIGHT - 10}
                        fill={t.colors.neutral[500]}
                        fontSize={9}
                        textAnchor="middle"
                      >
                        {d.range}
                      </text>
                      {/* Count on top */}
                      <text
                        x={barX + barWidth / 2}
                        y={barY - 4}
                        fill={t.colors.neutral[600]}
                        fontSize={9}
                        textAnchor="middle"
                        fontWeight={600}
                      >
                        {d.count}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </Box>
        </Box>

        {/* Agent Performance Table */}
        <Box
          style={{
            ...cardBase,
            padding: 0,
            overflow: 'hidden' as const,
            ...entranceAnims[7].animate,
            transition: entranceAnims[7].transition,
          }}
        >
          {/* Table header */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[2],
            padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
            borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
          }}>
            <Users size={16} strokeWidth={1.5} style={{ color: t.colors.primaryScale[600] }} />
            <Text style={{ ...sectionLabel, marginBottom: 0 }}>Agent Performance</Text>
          </Box>

          {agentPerformance.length === 0 ? (
            <Box style={{ ...emptyState, padding: t.spacing[6] }}>
              <Users size={32} strokeWidth={1} style={{ color: t.colors.neutral[300], marginBottom: t.spacing[2] }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No agent data available</Text>
            </Box>
          ) : (
            <Box style={{ display: 'flex', flexDirection: 'column' as const }}>
              {/* Column headers */}
              <Box style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 2fr 1fr 1fr',
                gap: t.spacing[3],
                padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                backgroundColor: t.colors.neutral[50],
                borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`,
              }}>
                {['Agent', 'Conversations', 'Score', 'Completion', 'Duration'].map(col => (
                  <Text key={col} style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>
                    {col}
                  </Text>
                ))}
              </Box>

              {/* Rows */}
              {agentPerformance.map((agent, index) => {
                const scoreColor = getScoreColor(agent.avgScore);
                const scoreBarStyle = createProgressBarStyle(t, { color: scoreColor, percent: agent.avgScore });

                return (
                  <Box
                    key={agent.agentId}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${agent.agentName} performance`}
                    onClick={() => handleAgentClick(agent.agentId)}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleAgentClick(agent.agentId);
                      }
                    }}
                    style={{
                      ...animStyle(index),
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 2fr 1fr 1fr',
                      gap: t.spacing[3],
                      padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                      borderBottom: index < agentPerformance.length - 1
                        ? `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`
                        : 'none',
                      cursor: 'pointer',
                      transition: `background-color ${t.motion.hover}`,
                      alignItems: 'center',
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.backgroundColor = t.colors.neutral[50];
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* Agent name */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Box style={{
                        width: 28,
                        height: 28,
                        borderRadius: t.borderRadius.full,
                        backgroundColor: t.colors.primaryScale[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.primaryScale[700] }}>
                          {agent.agentName.split(' ').map(n => n[0]).join('')}
                        </Text>
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                        {agent.agentName}
                      </Text>
                    </Box>

                    {/* Conversations */}
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>
                      {(agent.totalConversations || 0).toLocaleString()}
                    </Text>

                    {/* Score bar */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Box style={{ ...scoreBarStyle.track, flex: 1, height: 6 }}>
                        <Box style={scoreBarStyle.fill} />
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], minWidth: 28 }}>
                        {agent.avgScore}
                      </Text>
                    </Box>

                    {/* Completion rate */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[900] }}>
                        {agent.completionRate}%
                      </Text>
                    </Box>

                    {/* Duration */}
                    <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>
                      {formatDuration(agent.avgDuration)}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
