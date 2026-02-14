'use client';

/**
 * BhPipelineAnalytics - Overview Preset
 * High-level funnel visualization with conversion rates, summary stats, and bottleneck alerts.
 * Slite-inspired: generous whitespace, warm neutrals, soft shadows, minimal borders.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createSectionHeaderStyle,
  createHoverStyle,
  createStatusDotStyle,
} from '../../../helpers';
import type { BhPipelineAnalyticsProps, PipelineStage, PipelineSummary } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Users, TrendingUp, Clock, AlertTriangle, BarChart3,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';

const MOCK_STAGES: PipelineStage[] = [
  { id: 'ps-1', name: 'Applied', status: 'new', count: 342, conversionRate: 100, avgTimeInStageDays: 1.2, dropoffCount: 0 },
  { id: 'ps-2', name: 'Screening', status: 'screening', count: 186, previousPeriodCount: 164, conversionRate: 54.4, avgTimeInStageDays: 3.5, slaLimitDays: 5, dropoffCount: 156 },
  { id: 'ps-3', name: 'Phone Screen', status: 'phone_screen', count: 98, conversionRate: 52.7, avgTimeInStageDays: 4.2, slaLimitDays: 7, dropoffCount: 88 },
  { id: 'ps-4', name: 'Technical Interview', status: 'technical_interview', count: 54, conversionRate: 55.1, avgTimeInStageDays: 6.8, slaLimitDays: 10, dropoffCount: 44 },
  { id: 'ps-5', name: 'Onsite Interview', status: 'onsite_interview', count: 28, conversionRate: 51.9, avgTimeInStageDays: 5.1, dropoffCount: 26 },
  { id: 'ps-6', name: 'Offer Extended', status: 'offer_extended', count: 16, conversionRate: 57.1, avgTimeInStageDays: 3.2, dropoffCount: 12 },
  { id: 'ps-7', name: 'Hired', status: 'hired', count: 12, conversionRate: 75.0, avgTimeInStageDays: 2.1, dropoffCount: 4 },
];

const MOCK_SUMMARY: PipelineSummary = {
  totalActive: 342, totalHired: 12, avgTimeToHireDays: 26.1, overallConversionRate: 3.5, bottleneckCount: 1,
};

function formatNumber(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '0';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function formatPercent(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '0.0%';
  return `${value.toFixed(1)}%`;
}

function getChartColors(tokens: DesignTokens): string[] {
  return [
    tokens.colors.primaryScale[500],
    tokens.colors.successScale[500],
    tokens.colors.warningScale[500],
    tokens.colors.errorScale[500],
    tokens.colors.infoScale[500],
    tokens.colors.primaryScale[300],
    tokens.colors.successScale[300],
    tokens.colors.warningScale[300],
    tokens.colors.errorScale[300],
    tokens.colors.infoScale[300],
    tokens.colors.primaryScale[700],
    tokens.colors.successScale[700],
  ];
}

function getSeverityColor(severity: string, tokens: DesignTokens): string {
  switch (severity) {
    case 'critical': return tokens.colors.errorScale[600];
    case 'high': return tokens.colors.errorScale[400];
    case 'medium': return tokens.colors.warningScale[500];
    default: return tokens.colors.infoScale[500];
  }
}

function funnelTrapezoid(
  topWidth: number, bottomWidth: number, y: number,
  height: number, centerX: number,
): string {
  const tl = centerX - topWidth / 2;
  const tr = centerX + topWidth / 2;
  const bl = centerX - bottomWidth / 2;
  const br = centerX + bottomWidth / 2;
  return `M ${tl} ${y} L ${tr} ${y} L ${br} ${y + height} L ${bl} ${y + height} Z`;
}

export const OverviewBhPipelineAnalytics = createPreset<BhPipelineAnalyticsProps>({
  name: 'BhPipelineAnalytics.Overview',
  render: ({ primitives, props, tokens }: PresetContext<BhPipelineAnalyticsProps>) => {
    const { Box, Flex, Stack, Text } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    const {
      stages = MOCK_STAGES, bottlenecks = [], summary = MOCK_SUMMARY,
      showComparison = false, onStageSelect, selectedStage,
      onBottleneckSelect, className, style,
    } = props;

    const card = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);
    const hov = useMemo(() => createHoverStyle(tokens), [tokens]);
    const chartColors = getChartColors(tokens);

    const maxCount = useMemo(() => (stages ?? []).length > 0 ? Math.max(...(stages ?? []).map(s => s.count ?? 0)) : 1, [stages]);

    const funnelWidth = 500;
    const stageHeight = 40;
    const stageGap = 12;
    const funnelHeight = (stages ?? []).length * (stageHeight + stageGap) + 20;

    /* ── Summary stat icons ──────────────────────────── */
    const statIcons: Record<string, React.ReactNode> = {
      'Active Candidates': <Users size={16} color={tokens.colors.primaryScale[500]} />,
      'Total Hired': <TrendingUp size={16} color={tokens.colors.successScale[500]} />,
      'Avg Time to Hire': <Clock size={16} color={tokens.colors.warningScale[500]} />,
      'Overall Conversion': <BarChart3 size={16} color={tokens.colors.infoScale[500]} />,
      'Bottlenecks': <AlertTriangle size={16} color={tokens.colors.errorScale[500]} />,
    };

    return (
      <Box className={className} style={{
        display: 'flex', flexDirection: 'column' as const,
        gap: tokens.spacing[5], width: '100%', ...style,
      }}>
        {/* ── Summary Stats ────────────────────────────── */}
        {summary && (
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: tokens.spacing[4] }}>
            {[
              { label: 'Active Candidates', value: formatNumber(summary?.totalActive) },
              { label: 'Total Hired', value: formatNumber(summary?.totalHired) },
              { label: 'Avg Time to Hire', value: `${summary?.avgTimeToHireDays ?? 0}d` },
              { label: 'Overall Conversion', value: formatPercent(summary?.overallConversionRate) },
              { label: 'Bottlenecks', value: String(summary?.bottleneckCount ?? 0) },
            ].map(stat => (
              <Box key={stat.label} style={{
                ...card, padding: tokens.spacing[4],
                display: 'flex', flexDirection: 'column' as const,
                alignItems: 'center', gap: tokens.spacing[2],
              }}>
                <Box style={{
                  width: 36, height: 36, borderRadius: tokens.borderRadius.lg,
                  backgroundColor: tokens.colors.neutral[50],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {statIcons[stat.label]}
                </Box>
                <Text style={{
                  fontSize: tokens.typography.fontSize['2xl'] || '1.5rem',
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                }}>
                  {stat.value}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  {stat.label}
                </Text>
              </Box>
            ))}
          </Box>
        )}

        {/* ── Funnel Visualization ─────────────────────── */}
        <Box style={{ ...card, padding: tokens.spacing[5] }}>
          <Flex align="center" gap={6} style={{ marginBottom: tokens.spacing[4] }}>
            <BarChart3 size={14} color={tokens.colors.neutral[500]} />
            <Text style={{ ...sectionHeader, marginBottom: 0 }}>Application Pipeline Funnel</Text>
          </Flex>
          {(stages ?? []).length > 0 ? (
            <Flex justify="center">
              <svg
                viewBox={`0 0 ${funnelWidth} ${funnelHeight}`}
                style={{ width: '100%', maxWidth: funnelWidth, height: 'auto' }}
                preserveAspectRatio="xMidYMid meet"
              >
                {(stages ?? []).map((stage, i) => {
                  const y = 10 + i * (stageHeight + stageGap);
                  const stageCount = stage.count ?? 0;
                  const widthPct = maxCount > 0 ? stageCount / maxCount : 0;
                  const safeStages = stages ?? [];
                  const nextWidthPct = i < safeStages.length - 1 && maxCount > 0
                    ? (safeStages[i + 1]?.count ?? 0) / maxCount : widthPct * 0.8;
                  const maxTrapWidth = funnelWidth - 140;
                  const topWidth = Math.max(widthPct * maxTrapWidth, 60);
                  const bottomWidth = Math.max(nextWidthPct * maxTrapWidth, 40);
                  const centerX = funnelWidth / 2;
                  const isBottleneck = (bottlenecks ?? []).some(b => b.stageId === stage.id);
                  const colorIndex = i % chartColors.length;

                  return (
                    <g key={stage.id ?? `stage-${i}`}
                      onClick={() => onStageSelect?.(selectedStage === stage.id ? null : stage.id ?? null)}
                      style={{ cursor: 'pointer' }}>
                      <path
                        d={funnelTrapezoid(topWidth, bottomWidth, y, stageHeight, centerX)}
                        fill={isBottleneck ? tokens.colors.errorScale[400] : chartColors[colorIndex]}
                        opacity={selectedStage === stage.id ? 1 : 0.8}
                        rx={4}
                      />
                      <text x={centerX} y={y + stageHeight / 2 - 4}
                        textAnchor="middle" fontSize={tokens.typography.fontSize.xs}
                        fontWeight={tokens.typography.fontWeight.semibold}
                        fill={tokens.colors.common.white}>
                        {stage.name ?? 'Unknown'}
                      </text>
                      <text x={centerX} y={y + stageHeight / 2 + 12}
                        textAnchor="middle" fontSize={tokens.typography.fontSize.xs}
                        fill={tokens.overlay?.white || 'rgba(255,255,255,0.8)'}>
                        {formatNumber(stageCount)}
                      </text>
                      <text x={funnelWidth - 10} y={y + stageHeight / 2 + 4}
                        textAnchor="end" fontSize={tokens.typography.fontSize.xs}
                        fontWeight={tokens.typography.fontWeight.medium}
                        fill={tokens.colors.neutral[600]}>
                        {formatPercent(stage.conversionRate)}
                      </text>
                      {showComparison && stage.previousPeriodCount != null && (
                        <text x={funnelWidth - 10} y={y + stageHeight / 2 + 18}
                          textAnchor="end" fontSize={tokens.typography.fontSize.xs}
                          fill={stageCount >= (stage.previousPeriodCount ?? 0)
                            ? tokens.colors.successScale[500]
                            : tokens.colors.errorScale[500]}>
                          {stageCount >= (stage.previousPeriodCount ?? 0) ? '\u2191' : '\u2193'}{' '}
                          {(stage.previousPeriodCount ?? 0) !== 0
                            ? formatPercent(Math.abs(((stageCount - (stage.previousPeriodCount ?? 0)) / (stage.previousPeriodCount ?? 1)) * 100))
                            : 'N/A'}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </Flex>
          ) : (
            <Flex align="center" justify="center" style={{
              height: 120, color: tokens.colors.neutral[400],
              fontSize: tokens.typography.fontSize.sm,
            }}>
              <Text style={{ fontSize: 'inherit', color: 'inherit' }}>No pipeline data available</Text>
            </Flex>
          )}
        </Box>

        {/* ── Bottleneck Alerts ─────────────────────────── */}
        {(bottlenecks ?? []).length > 0 && (
          <Box style={{ ...card, padding: tokens.spacing[5] }}>
            <Flex align="center" gap={6} style={{ marginBottom: tokens.spacing[4] }}>
              <AlertTriangle size={14} color={tokens.colors.errorScale[500]} />
              <Text style={{ ...sectionHeader, marginBottom: 0 }}>Bottleneck Detection</Text>
            </Flex>
            <Stack gap={8}>
              {(bottlenecks ?? []).map(b => (
                <Box key={b.stageId ?? 'unknown'}
                  onClick={() => b.stageId && onBottleneckSelect?.(b.stageId)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    ...hov, padding: tokens.spacing[4],
                    borderRadius: tokens.borderRadius.lg,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${getSeverityColor(b.severity ?? 'low', tokens)}30`,
                    backgroundColor: tokens.colors.common.white,
                  }}>
                  <Box style={createStatusDotStyle(tokens, getSeverityColor(b.severity ?? 'low', tokens))} />
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[800],
                    }}>
                      {b.stageName ?? 'Unknown'}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      {b.reason ?? ''}
                    </Text>
                  </Stack>
                  <Stack gap={1} style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: getSeverityColor(b.severity ?? 'low', tokens),
                    }}>
                      +{b.avgDelayDays ?? 0}d delay
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      {b.impactedCandidates ?? 0} candidates
                    </Text>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    );
  },
});
