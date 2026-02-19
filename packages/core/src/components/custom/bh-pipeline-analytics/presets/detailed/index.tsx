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
  createStatValueStyle,
  createStatLabelStyle,
  ICON_SIZES,

  createEntranceAnimation,
  createStaggerDelay,
  createPersonalityAccentBar,
  getPersonalityTypography,
  createDividerStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { BhPipelineAnalyticsProps, PipelineStage, PipelineSummary, PipelineBottleneck } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Users, TrendingUp, Clock, AlertTriangle, BarChart3,
  Target, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';

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
      stages: rawStages = [], bottlenecks: rawBottlenecks = [], summary: rawSummary = {} as Partial<PipelineSummary>,
      showComparison = false, onStageSelect, selectedStage,
      onBottleneckSelect, className, style,
    } = props;

    const stages = Array.isArray(rawStages) ? rawStages as PipelineStage[] : [];
    const bottlenecks = Array.isArray(rawBottlenecks) ? rawBottlenecks : [];
    const summary = (Array.isArray(rawSummary) ? rawSummary : rawSummary ?? {}) as Partial<PipelineSummary>;

    const card = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);
    const hov = useMemo(() => createHoverStyle(tokens), [tokens]);
    const chartColors = getChartColors(tokens);
    const maxTime = useMemo(() => (stages ?? []).length > 0 ? Math.max(...(stages ?? []).map(s => s.avgTimeInStageDays ?? 0)) : 1, [stages]);

    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);

    const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);

    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);

    const divider = useMemo(() => createDividerStyle(tokens), [tokens]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(tokens), [tokens]);


    return (
      <Box className={className} style={{
        display: 'flex', flexDirection: 'column' as const,
        gap: tokens.spacing[5], width: '100%', ...style,
      }}>
        {/* ── Summary Row ──────────────────────────────── */}
        {summary && (
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: tokens.spacing[4] }}>
            {[
              { label: 'Active', value: formatNumber(summary?.totalActive), color: tokens.colors.primaryScale[600], icon: <Users size={14} /> },
              { label: 'Hired', value: formatNumber(summary?.totalHired), color: tokens.colors.successScale[600], icon: <TrendingUp size={14} /> },
              { label: 'Avg Days', value: `${summary?.avgTimeToHireDays ?? 0}d`, color: tokens.colors.warningScale[600], icon: <Clock size={14} /> },
              { label: 'Conversion', value: formatPercent(summary?.overallConversionRate), color: tokens.colors.infoScale[600], icon: <Target size={14} /> },
              { label: 'Bottlenecks', value: String(summary?.bottleneckCount ?? 0), color: (summary?.bottleneckCount ?? 0) > 0 ? tokens.colors.errorScale[600] : tokens.colors.successScale[600], icon: <AlertTriangle size={14} /> },
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
                <Text style={{ ...createStatValueStyle(tokens, { size: '2xl' }), color: stat.color }}>
                  {stat.value}
                </Text>
                <Text style={createStatLabelStyle(tokens)}>
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
                  {(stages ?? []).map((stage, i) => {
                    const avgTime = stage.avgTimeInStageDays ?? 0;
                    const slaLimit = stage.slaLimitDays;
                    const isOverSla = slaLimit != null && avgTime > slaLimit;
                    const isBottleneck = (bottlenecks ?? []).some(b => b.stageId === stage.id);
                    const barWidth = maxTime > 0 ? (avgTime / maxTime) * 180 : 0;

                    return (
                      <tr key={stage.id ?? `stage-${i}`}
                        onClick={() => onStageSelect?.(selectedStage === stage.id ? null : stage.id ?? null)}
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
                              {stage.name ?? 'Unknown'}
                            </Text>
                          </Flex>
                        </td>
                        <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px` }}>
                          <Flex align="center" gap={4}>
                            <Text style={{ color: tokens.colors.neutral[700] }}>
                              {formatNumber(stage.count)}
                            </Text>
                            {showComparison && stage.previousPeriodCount != null && (
                              <Flex align="center" gap={2} style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: (stage.count ?? 0) >= (stage.previousPeriodCount ?? 0)
                                  ? tokens.colors.successScale[500]
                                  : tokens.colors.errorScale[500],
                              }}>
                                {(stage.count ?? 0) >= (stage.previousPeriodCount ?? 0)
                                  ? <ArrowUpRight size={ICON_SIZES.inline} />
                                  : <ArrowDownRight size={ICON_SIZES.inline} />}
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
                          {avgTime}d
                        </td>
                        <td style={{
                          padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                          color: tokens.colors.neutral[500],
                        }}>
                          {slaLimit != null ? `${slaLimit}d` : '--'}
                        </td>
                        <td style={{
                          padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                          color: (stage.dropoffCount ?? 0) > 0 ? tokens.colors.errorScale[500] : tokens.colors.neutral[400],
                        }}>
                          {(stage.dropoffCount ?? 0) > 0 ? `-${stage.dropoffCount}` : '0'}
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
                            {slaLimit != null && (
                              <Box style={{
                                position: 'absolute' as const, top: -2,
                                left: maxTime > 0 ? (slaLimit / maxTime) * 180 : 0,
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
        {(bottlenecks ?? []).length > 0 && (
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
              {(bottlenecks ?? []).map(b => (
                <Box key={b.stageId ?? 'unknown'}
                  onClick={() => b.stageId && onBottleneckSelect?.(b.stageId)}
                  style={{
                    ...hov, padding: tokens.spacing[4],
                    borderRadius: tokens.borderRadius.lg,
                    border: `2px solid ${getSeverityColor((b.severity ?? ''), tokens)}`,
                    backgroundColor: tokens.colors.common.white,
                  }}>
                  <Flex align="center" justify="between" style={{ marginBottom: tokens.spacing[3] }}>
                    <Text style={{
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[800],
                      fontSize: tokens.typography.fontSize.sm,
                    }}>
                      {b.stageName ?? 'Unknown'}
                    </Text>
                    <Box style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: getSeverityColor(b.severity ?? 'low', tokens),
                      color: tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      textTransform: 'uppercase' as const,
                    }}>
                      {b.severity ?? 'low'}
                    </Box>
                  </Flex>
                  <Text style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[600],
                    marginBottom: tokens.spacing[3],
                    lineHeight: 1.5,
                  }}>
                    {b.reason ?? ''}
                  </Text>
                  <Flex gap={16}>
                    <Stack gap={1}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Delay</Text>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: getSeverityColor(b.severity ?? 'low', tokens),
                      }}>
                        +{b.avgDelayDays ?? 0}d
                      </Text>
                    </Stack>
                    <Stack gap={1}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Impacted</Text>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[800],
                      }}>
                        {b.impactedCandidates ?? 0}
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
