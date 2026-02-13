'use client';

/**
 * BhPipelineAnalytics - Detailed Preset
 * Expanded view with time-in-stage bars, per-stage metrics table, and bottleneck analysis.
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
  Target, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';

const MOCK_STAGES: PipelineStage[] = [
  { id: 'ps-1', name: 'Applied', status: 'new', count: 342, conversionRate: 100, avgTimeInStageDays: 1.2, dropoffCount: 0 },
  { id: 'ps-2', name: 'Screening', status: 'screening', count: 186, conversionRate: 54.4, avgTimeInStageDays: 3.5, slaLimitDays: 5, dropoffCount: 156 },
  { id: 'ps-3', name: 'Phone Screen', status: 'phone_screen', count: 98, conversionRate: 52.7, avgTimeInStageDays: 4.2, slaLimitDays: 7, dropoffCount: 88 },
  { id: 'ps-4', name: 'Technical Interview', status: 'technical_interview', count: 54, conversionRate: 55.1, avgTimeInStageDays: 6.8, slaLimitDays: 10, dropoffCount: 44 },
  { id: 'ps-5', name: 'Onsite Interview', status: 'onsite_interview', count: 28, conversionRate: 51.9, avgTimeInStageDays: 5.1, dropoffCount: 26 },
  { id: 'ps-6', name: 'Offer Extended', status: 'offer_extended', count: 16, conversionRate: 57.1, avgTimeInStageDays: 3.2, dropoffCount: 12 },
  { id: 'ps-7', name: 'Hired', status: 'hired', count: 12, conversionRate: 75.0, avgTimeInStageDays: 2.1, dropoffCount: 4 },
];

const MOCK_SUMMARY: PipelineSummary = {
  totalActive: 342, totalHired: 12, avgTimeToHireDays: 26.1, overallConversionRate: 3.5, bottleneckCount: 1,
};

function formatNumber(value: number): string {
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function getSeverityColor(severity: string, tokens: DesignTokens): string {
  switch (severity) {
    case 'critical': return tokens.colors.errorScale[600];
    case 'high': return tokens.colors.errorScale[400];
    case 'medium': return tokens.colors.warningScale[500];
    default: return tokens.colors.infoScale[500];
  }
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

export const DetailedBhPipelineAnalytics = createPreset<BhPipelineAnalyticsProps>({
  name: 'BhPipelineAnalytics.Detailed',
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
    const maxTime = useMemo(() => stages.length > 0 ? Math.max(...stages.map(s => s.avgTimeInStageDays)) : 1, [stages]);

    return (
      <Box className={className} style={{
        display: 'flex', flexDirection: 'column' as const,
        gap: tokens.spacing[5], width: '100%', ...style,
      }}>
        {/* ── Summary Row ──────────────────────────────── */}
        {summary && (
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: tokens.spacing[4] }}>
            {[
              { label: 'Active', value: formatNumber(summary.totalActive), color: tokens.colors.primaryScale[600], icon: <Users size={14} /> },
              { label: 'Hired', value: formatNumber(summary.totalHired), color: tokens.colors.successScale[600], icon: <TrendingUp size={14} /> },
              { label: 'Avg Days', value: `${summary.avgTimeToHireDays}d`, color: tokens.colors.warningScale[600], icon: <Clock size={14} /> },
              { label: 'Conversion', value: formatPercent(summary.overallConversionRate), color: tokens.colors.infoScale[600], icon: <Target size={14} /> },
              { label: 'Bottlenecks', value: String(summary.bottleneckCount), color: summary.bottleneckCount > 0 ? tokens.colors.errorScale[600] : tokens.colors.successScale[600], icon: <AlertTriangle size={14} /> },
            ].map(stat => (
              <Box key={stat.label} style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], ...card, padding: tokens.spacing[4], textAlign: 'center' as const }}>
                <Flex align="center" justify="center" gap={6} style={{ marginBottom: tokens.spacing[2] }}>
                  <Box style={{
                    width: 28, height: 28, borderRadius: tokens.borderRadius.md,
                    backgroundColor: stat.color + '12',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: stat.color,
                  }}>
                    {stat.icon}
                  </Box>
                </Flex>
                <Text style={{
                  fontSize: tokens.typography.fontSize['2xl'] || '1.5rem',
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: stat.color,
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

        {/* ── Stages Detail Table ──────────────────────── */}
        <Box style={{ ...card, padding: tokens.spacing[5] }}>
          <Flex align="center" gap={6} style={{ marginBottom: tokens.spacing[4] }}>
            <BarChart3 size={14} color={tokens.colors.neutral[500]} />
            <Text style={{ ...sectionHeader, marginBottom: 0 }}>Stage-by-Stage Breakdown</Text>
          </Flex>

          {stages.length > 0 ? (
            <Box style={{ overflowX: 'auto' as const }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: tokens.typography.fontSize.sm }}>
                <thead>
                  <tr style={{ borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                    {['Stage', 'Candidates', 'Conversion', 'Avg Time', 'SLA', 'Dropoff', 'Time Bar'].map(col => (
                      <th key={col} style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        textAlign: 'left' as const,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[500],
                        fontSize: tokens.typography.fontSize.xs,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                      }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stages.map((stage, i) => {
                    const isOverSla = stage.slaLimitDays !== undefined && stage.avgTimeInStageDays > stage.slaLimitDays;
                    const isBottleneck = bottlenecks.some(b => b.stageId === stage.id);
                    const barWidth = maxTime > 0 ? (stage.avgTimeInStageDays / maxTime) * 180 : 0;

                    return (
                      <tr key={stage.id}
                        onClick={() => onStageSelect?.(selectedStage === stage.id ? null : stage.id)}
                        style={{
                          ...hov,
                          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                          backgroundColor: selectedStage === stage.id ? tokens.colors.primaryScale[50] : 'transparent',
                        }}
                        onMouseEnter={(e) => { if (selectedStage !== stage.id) e.currentTarget.style.backgroundColor = tokens.colors.neutral[50]; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = selectedStage === stage.id ? tokens.colors.primaryScale[50] : 'transparent'; }}
                      >
                        <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px` }}>
                          <Flex align="center" gap={6}>
                            {isBottleneck && (
                              <Box style={{
                                width: 6, height: 6, borderRadius: tokens.borderRadius.full,
                                backgroundColor: tokens.colors.errorScale[500], flexShrink: 0,
                              }} />
                            )}
                            <Text style={{
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[800],
                            }}>
                              {stage.name}
                            </Text>
                          </Flex>
                        </td>
                        <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px` }}>
                          <Flex align="center" gap={4}>
                            <Text style={{ color: tokens.colors.neutral[700] }}>
                              {formatNumber(stage.count)}
                            </Text>
                            {showComparison && stage.previousPeriodCount !== undefined && (
                              <Flex align="center" gap={2} style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: stage.count >= stage.previousPeriodCount
                                  ? tokens.colors.successScale[500]
                                  : tokens.colors.errorScale[500],
                              }}>
                                {stage.count >= stage.previousPeriodCount
                                  ? <ArrowUpRight size={10} />
                                  : <ArrowDownRight size={10} />}
                              </Flex>
                            )}
                          </Flex>
                        </td>
                        <td style={{
                          padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[800],
                        }}>
                          {formatPercent(stage.conversionRate)}
                        </td>
                        <td style={{
                          padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                          color: isOverSla ? tokens.colors.errorScale[600] : tokens.colors.neutral[700],
                          fontWeight: isOverSla ? tokens.typography.fontWeight.bold : tokens.typography.fontWeight.normal,
                        }}>
                          {stage.avgTimeInStageDays}d
                        </td>
                        <td style={{
                          padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                          color: tokens.colors.neutral[500],
                        }}>
                          {stage.slaLimitDays !== undefined ? `${stage.slaLimitDays}d` : '--'}
                        </td>
                        <td style={{
                          padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                          color: stage.dropoffCount > 0 ? tokens.colors.errorScale[500] : tokens.colors.neutral[400],
                        }}>
                          {stage.dropoffCount > 0 ? `-${stage.dropoffCount}` : '0'}
                        </td>
                        <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px` }}>
                          <Box style={{ position: 'relative' as const, height: 20 }}>
                            <Box style={{
                              height: '100%',
                              width: Math.max(barWidth, 4),
                              borderRadius: tokens.borderRadius.sm,
                              backgroundColor: isOverSla
                                ? tokens.colors.errorScale[400]
                                : chartColors[i % chartColors.length],
                            }} />
                            {stage.slaLimitDays !== undefined && (
                              <Box style={{
                                position: 'absolute' as const, top: -2,
                                left: maxTime > 0 ? (stage.slaLimitDays / maxTime) * 180 : 0,
                                width: 2, height: 24,
                                borderLeft: `2px dashed ${tokens.colors.neutral[400]}`,
                              }} />
                            )}
                          </Box>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>
          ) : (
            <Flex align="center" justify="center" style={{
              height: 120, color: tokens.colors.neutral[400],
              fontSize: tokens.typography.fontSize.sm,
            }}>
              <Text style={{ fontSize: 'inherit', color: 'inherit' }}>No pipeline data available</Text>
            </Flex>
          )}
        </Box>

        {/* ── Bottleneck Detail ─────────────────────────── */}
        {bottlenecks.length > 0 && (
          <Box style={{ ...card, padding: tokens.spacing[5] }}>
            <Flex align="center" gap={6} style={{ marginBottom: tokens.spacing[4] }}>
              <AlertTriangle size={14} color={tokens.colors.errorScale[500]} />
              <Text style={{ ...sectionHeader, marginBottom: 0 }}>Bottleneck Analysis</Text>
            </Flex>
            <Box style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: tokens.spacing[4],
            }}>
              {bottlenecks.map(b => (
                <Box key={b.stageId}
                  onClick={() => onBottleneckSelect?.(b.stageId)}
                  style={{
                    ...hov, padding: tokens.spacing[4],
                    borderRadius: tokens.borderRadius.lg,
                    border: `2px solid ${getSeverityColor(b.severity, tokens)}`,
                    backgroundColor: tokens.colors.common.white,
                  }}>
                  <Flex align="center" justify="between" style={{ marginBottom: tokens.spacing[3] }}>
                    <Text style={{
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[800],
                      fontSize: tokens.typography.fontSize.sm,
                    }}>
                      {b.stageName}
                    </Text>
                    <Box style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: getSeverityColor(b.severity, tokens),
                      color: tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      textTransform: 'uppercase' as const,
                    }}>
                      {b.severity}
                    </Box>
                  </Flex>
                  <Text style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[600],
                    marginBottom: tokens.spacing[3],
                    lineHeight: 1.5,
                  }}>
                    {b.reason}
                  </Text>
                  <Flex gap={16}>
                    <Stack gap={1}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Delay</Text>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: getSeverityColor(b.severity, tokens),
                      }}>
                        +{b.avgDelayDays}d
                      </Text>
                    </Stack>
                    <Stack gap={1}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Impacted</Text>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[800],
                      }}>
                        {b.impactedCandidates}
                      </Text>
                    </Stack>
                  </Flex>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
