'use client';

/**
 * BhConversationAnalytics - Compact Preset
 * Widget with key metrics row, mini sparkline for volume trend, and top 3 agents by score.
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
  getAccentAwareLayout,

  createDividerStyle,
  formatAbbreviated,
} from '../../../helpers';
import type { DesignTokens } from '../../../../../types';
import type { EngineAwareProps } from '../../../../../types';
import type {
  BhConversationAnalyticsProps,
  ConversationVolumePoint,
  AgentPerformance,
} from '../../core';

import {
  MessageSquare,
  Star,
  CheckCircle,
  Activity,
  Trophy,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function sparklinePoints(data: number[], width: number, height: number, padding: number): string {
  if (!data.length) return '';
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = (width - padding * 2) / (data.length - 1 || 1);
  return data
    .map((v, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const CompactBhConversationAnalytics = createPreset<BhConversationAnalyticsProps>({
  name: 'BhConversationAnalytics.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhConversationAnalyticsProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      volumeData: rawVolumeData = undefined,
      agentPerformance: rawAgentPerformance = [],
      totalConversations = 1401,
      avgScore = 83,
      avgCompletionRate = 90.6,
      onAgentClick,
      loading = false,
      className,
      style,
    } = props;

    const volumeData = Array.isArray(rawVolumeData) ? rawVolumeData : [] as ConversationVolumePoint[];
    const agentPerformance = Array.isArray(rawAgentPerformance) ? rawAgentPerformance : [];

    /* --- Glass / personality tokens --- */
    const isGlass = t.surface.useGlass && !!t.glass;
    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const emptyState = useMemo(() => createEmptyStateStyle(t), [t]);
    const chartConfig = useMemo(() => getChartConfig(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    /* --- Entrance animation --- */
    const entrance = useMemo(() => createEntranceAnimation(t, { index: 0 }), [t]);

    /* --- Volume sparkline data --- */
    const sparkData = useMemo(() => volumeData.map(d => d.count), [volumeData]);

    /* --- Top 3 agents by score --- */
    const topAgents = useMemo(() => {
      return [...agentPerformance]
        .sort((a, b) => b.avgScore - a.avgScore)
        .slice(0, 3);
    }, [agentPerformance]);
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
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[6], ...style }}>
          <Activity size={18} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[2] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading...</Text>
        </Box>
      );
    }

    return (
      <Box
        className={className}
        style={{
          ...cardBase,
          padding: 0,
          overflow: 'hidden' as const,
          ...entrance.animate,
          transition: entrance.transition,
          ...accentLayout.outer,
          ...style,
        }}
      >
        {/* Accent bar */}
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>
        {/* Header */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing[2],
          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
          borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
        }}>
          <MessageSquare size={14} strokeWidth={1.5} style={{ color: t.colors.primaryScale[600] }} />
          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, color: t.colors.neutral[900] }}>
            Conversations
          </Text>
        </Box>

        {/* Key Metrics Row */}
        <Box style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: t.spacing[1],
          padding: `${t.spacing[3]}px ${t.spacing[3]}px`,
          borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`,
        }}>
          {/* Total Conversations */}
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], textAlign: 'center' as const }}>
            <Text style={{ fontSize: t.typography.fontSize['xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], lineHeight: 1.2 }}>
              {totalConversations.toLocaleString()}
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'block'}}>
              conversations
            </Text>
          </Box>

          {/* Avg Score */}
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], textAlign: 'center' as const, borderLeft: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`, borderRight: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}` }}>
            <Text style={{ fontSize: t.typography.fontSize['xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], lineHeight: 1.2 }}>
              {avgScore}
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'block'}}>
              avg score
            </Text>
          </Box>

          {/* Completion */}
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], textAlign: 'center' as const }}>
            <Text style={{ fontSize: t.typography.fontSize['xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], lineHeight: 1.2 }}>
              {avgCompletionRate.toFixed(0)}%
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'block'}}>
              completion
            </Text>
          </Box>
        </Box>

        {/* Sparkline */}
        <Box style={{ padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}` }}>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginBottom: t.spacing[1], display: 'block', textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>
            Volume Trend
          </Text>
          {sparkData.length > 1 ? (
            <svg width="100%" height={32} viewBox="0 0 200 32" preserveAspectRatio="none" style={{ display: 'block' }}>
              <polyline
                points={sparklinePoints(sparkData, 200, 32, 2)}
                fill="none"
                stroke={t.colors.primaryScale[400]}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <Box style={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>No data</Text>
            </Box>
          )}
        </Box>

        {/* Top 3 Agents */}
        <Box style={{ padding: `${t.spacing[2]}px ${t.spacing[3]}px` }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[2] }}>
            <Trophy size={10} strokeWidth={1.5} style={{ color: t.colors.warningScale[500] }} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>
              Top Agents
            </Text>
          </Box>

          {topAgents.length === 0 ? (
            <Box style={{ padding: t.spacing[2], textAlign: 'center' as const }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>No agent data</Text>
            </Box>
          ) : (
            <Box style={{ display: 'flex', flexDirection: 'column' as const }}>
              {topAgents.map((agent, index) => {
                const scoreColor = getScoreColor(agent.avgScore);
                const scoreBar = createProgressBarStyle(t, { color: scoreColor, percent: agent.avgScore });

                return (
                  <Box
                    key={agent.agentId}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${agent.agentName} details, score ${agent.avgScore}`}
                    onClick={() => handleAgentClick(agent.agentId)}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleAgentClick(agent.agentId);
                      }
                    }}
                    style={{
                      ...animStyle(index),
                      display: 'flex',
                      alignItems: 'center',
                      gap: t.spacing[2],
                      padding: `${t.spacing[1]}px 0`,
                      borderBottom: index < topAgents.length - 1
                        ? `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`
                        : 'none',
                      cursor: 'pointer',
                      transition: `background-color ${t.motion.hover}`,
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.backgroundColor = t.colors.neutral[50];
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* Rank */}
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.bold,
                      color: index === 0 ? t.colors.warningScale[600] : t.colors.neutral[400],
                      width: 16,
                      flexShrink: 0,
                      textAlign: 'center' as const,
                    }}>
                      {index + 1}
                    </Text>

                    {/* Name */}
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.medium,
                      color: t.colors.neutral[800],
                      flex: 1,
                      overflow: 'hidden' as const,
                      textOverflow: 'ellipsis' as const,
                      whiteSpace: 'nowrap' as const,
                    }}>
                      {agent.agentName}
                    </Text>

                    {/* Score bar */}
                    <Box style={{ width: 40, flexShrink: 0 }}>
                      <Box style={{ ...scoreBar.track, height: 4 }}>
                        <Box style={scoreBar.fill} />
                      </Box>
                    </Box>

                    {/* Score value */}
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.semibold,
                      color: t.colors.neutral[900],
                      width: 24,
                      flexShrink: 0,
                      textAlign: 'right' as const,
                    }}>
                      {agent.avgScore}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
        </Box>
      </Box>
    );
  },
});
