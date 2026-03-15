'use client';

/**
 * BhPipelineSimulator - Interactive Preset
 * Full Monte Carlo simulator with parameter controls, funnel visualization,
 * distribution histogram, bottleneck alerts, and recommendation display.
 *
 * Layout:
 * - Header: title, job context, run button
 * - Left panel: parameter controls (conversion rates, source mix, positions, target date, iterations)
 * - Right panel: results (key metrics, distribution chart, confidence, bottlenecks, recommendations)
 * - Funnel visualization: SVG funnel showing stage flow
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Play,
  Save,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Target,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Info,
  Loader2,
  Zap,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createIconContainerStyle,
  createEntranceAnimation,
  createProgressBarStyle,
  createEmptyStateStyle,
  createPanelHeaderStyle,
  createDividerStyle,
  getPersonalityTypography,
  clickableProps,
  ICON_SIZES,
  numericValue,
} from '../../../helpers';
import type {
  BhPipelineSimulatorProps,
  StageConversionRate,
  SourceMixEntry,
  SimulationParameters,
  SimulationResultData,
  BottleneckResult,
} from '../../core';
import { getBottleneckColor, getProbabilityColor, formatPercentage } from '../../core';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_STAGES: StageConversionRate[] = [
  { fromStage: 'Applied', toStage: 'Screened', rate: 0.45, variance: 0.08 },
  { fromStage: 'Screened', toStage: 'Phone Interview', rate: 0.60, variance: 0.10 },
  { fromStage: 'Phone Interview', toStage: 'Technical', rate: 0.50, variance: 0.12 },
  { fromStage: 'Technical', toStage: 'Onsite', rate: 0.40, variance: 0.10 },
  { fromStage: 'Onsite', toStage: 'Offer', rate: 0.55, variance: 0.15 },
  { fromStage: 'Offer', toStage: 'Hired', rate: 0.75, variance: 0.10 },
];

const DEFAULT_SOURCES: SourceMixEntry[] = [
  { source: 'Job Boards', percentage: 40, qualityMultiplier: 0.8 },
  { source: 'Referrals', percentage: 25, qualityMultiplier: 1.3 },
  { source: 'LinkedIn', percentage: 20, qualityMultiplier: 1.0 },
  { source: 'Direct Apply', percentage: 15, qualityMultiplier: 0.9 },
];

const ITERATION_OPTIONS = [1000, 5000, 10000, 25000, 50000, 100000];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const InteractiveBhPipelineSimulator = createPreset<BhPipelineSimulatorProps>(
  'InteractiveBhPipelineSimulator',
  ({ primitives: { Box, Text, Button, Input }, props, tokens }: PresetContext<BhPipelineSimulatorProps>) => {
    const {
      simulationResults,
      historicalRates,
      onRunSimulation,
      onSaveScenario,
      loading = false,
      simulating = false,
      jobId,
      jobTitle,
      className,
      style,
    } = props;

    // ========================================================================
    // STATE
    // ========================================================================

    const [stages, setStages] = useState<StageConversionRate[]>(
      historicalRates?.stages ?? DEFAULT_STAGES
    );
    const [sources, setSources] = useState<SourceMixEntry[]>(DEFAULT_SOURCES);
    const [openPositions, setOpenPositions] = useState(3);
    const [targetDate, setTargetDate] = useState('');
    const [iterations, setIterations] = useState(10000);
    const [expandedSection, setExpandedSection] = useState<'stages' | 'sources' | null>('stages');
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [scenarioName, setScenarioName] = useState('');
    const [scenarioDescription, setScenarioDescription] = useState('');

    const results = simulationResults ?? null;

    // ========================================================================
    // DERIVED
    // ========================================================================

    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const entranceAnim = useMemo(() => createEntranceAnimation(tokens), [tokens]);

    const parameters: SimulationParameters = useMemo(() => ({
      conversionRates: stages,
      timeToFillDays: { min: 14, max: 90, median: 45 },
      sourceMix: sources,
      openPositions,
      targetHireDate: targetDate || undefined,
    }), [stages, sources, openPositions, targetDate]);

    // Funnel data: compute candidate count at each stage
    const funnelData = useMemo(() => {
      const initial = openPositions * stages.reduce((p, s) => p * (1 / s.rate), 1) * 1.5;
      const data: Array<{ stage: string; candidates: number; rate: number }> = [];
      let current = Math.round(initial);

      // First stage entry
      data.push({ stage: stages[0]?.fromStage ?? 'Start', candidates: current, rate: 1 });

      for (const stage of stages) {
        current = Math.round(current * stage.rate);
        data.push({ stage: stage.toStage, candidates: current, rate: stage.rate });
      }

      return data;
    }, [stages, openPositions]);

    const maxFunnelCandidates = funnelData[0]?.candidates ?? 1;

    // ========================================================================
    // HANDLERS
    // ========================================================================

    const handleRunSimulation = useCallback(() => {
      onRunSimulation?.(parameters, iterations);
    }, [onRunSimulation, parameters, iterations]);

    const handleSave = useCallback(() => {
      if (!scenarioName.trim()) return;
      onSaveScenario?.({
        name: scenarioName,
        description: scenarioDescription || undefined,
        jobId: jobId ?? '',
        parameters,
        results: results ?? undefined,
      });
      setShowSaveModal(false);
      setScenarioName('');
      setScenarioDescription('');
    }, [onSaveScenario, scenarioName, scenarioDescription, jobId, parameters, results]);

    const updateStageRate = useCallback((index: number, newRate: number) => {
      setStages((prev) => prev.map((s, i) => i === index ? { ...s, rate: newRate } : s));
    }, []);

    const updateStageVariance = useCallback((index: number, newVariance: number) => {
      setStages((prev) => prev.map((s, i) => i === index ? { ...s, variance: newVariance } : s));
    }, []);

    const updateSourcePercentage = useCallback((index: number, newPct: number) => {
      setSources((prev) => prev.map((s, i) => i === index ? { ...s, percentage: newPct } : s));
    }, []);

    const updateSourceQuality = useCallback((index: number, newQ: number) => {
      setSources((prev) => prev.map((s, i) => i === index ? { ...s, qualityMultiplier: newQ } : s));
    }, []);

    // ========================================================================
    // STYLES
    // ========================================================================

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: numericValue(tokens.spacing[6]),
      padding: numericValue(tokens.spacing[6]),
      background: tokens.colors.common.white,
      borderRadius: numericValue(tokens.borderRadius.lg),
      border: `1px solid ${tokens.colors.neutral[200]}`,
      ...style,
    };

    const headerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: numericValue(tokens.spacing[4]),
      flexWrap: 'wrap' as const,
    };

    const columnsStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: numericValue(tokens.spacing[6]),
      alignItems: 'start',
    };

    const panelStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: numericValue(tokens.spacing[4]),
      padding: numericValue(tokens.spacing[4]),
      background: tokens.colors.neutral[50] ?? tokens.colors.common.white,
      borderRadius: numericValue(tokens.borderRadius.md),
      border: `1px solid ${tokens.colors.neutral[200]}`,
    };

    const sectionHeaderStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      padding: `${numericValue(tokens.spacing[2])}px ${numericValue(tokens.spacing[4])}px`,
      borderRadius: numericValue(tokens.borderRadius.sm),
      userSelect: 'none' as const,
    };

    const metricCardStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: numericValue(tokens.spacing[1]),
      padding: numericValue(tokens.spacing[4]),
      background: tokens.colors.common.white,
      borderRadius: numericValue(tokens.borderRadius.md),
      border: `1px solid ${tokens.colors.neutral[200]}`,
      flex: 1,
      minWidth: 140,
    };

    const sliderContainerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    };

    const sliderRowStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: numericValue(tokens.spacing[2]),
    };

    const badgeColorMap: Record<string, React.CSSProperties> = {
      success: {
        background: tokens.colors.successScale?.[100] ?? tokens.colors.success,
        color: tokens.colors.successScale?.[700] ?? tokens.colors.success,
        border: `1px solid ${tokens.colors.successScale?.[200] ?? tokens.colors.success}`,
      },
      warning: {
        background: tokens.colors.warningScale?.[100] ?? tokens.colors.warning,
        color: tokens.colors.warningScale?.[700] ?? tokens.colors.warning,
        border: `1px solid ${tokens.colors.warningScale?.[200] ?? tokens.colors.warning}`,
      },
      error: {
        background: tokens.colors.errorScale?.[100] ?? tokens.colors.error,
        color: tokens.colors.errorScale?.[700] ?? tokens.colors.error,
        border: `1px solid ${tokens.colors.errorScale?.[200] ?? tokens.colors.error}`,
      },
    };

    // ========================================================================
    // RENDER HELPERS
    // ========================================================================

    const renderSlider = (
      label: string,
      value: number,
      min: number,
      max: number,
      step: number,
      onChange: (v: number) => void,
      format: (v: number) => string = (v) => String(v)
    ) => (
      <Box style={sliderContainerStyle}>
        <Box style={sliderRowStyle}>
          <Text style={{ fontSize: 12, color: tokens.colors.neutral[500], flex: 1 }}>{label}</Text>
          <Text style={{ fontSize: 12, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], minWidth: 48, textAlign: 'right' as const }}>
            {format(value)}
          </Text>
        </Box>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: tokens.colors.primaryScale?.[600] ?? tokens.colors.primary,
              cursor: 'pointer',
            }}
          />
        </div>
      </Box>
    );

    const renderStageControls = () => (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: numericValue(tokens.spacing[2]) }}>
        {stages.map((stage, idx) => (
          <Box
            key={`${stage.fromStage}-${stage.toStage}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              padding: numericValue(tokens.spacing[2]),
              background: tokens.colors.common.white,
              borderRadius: numericValue(tokens.borderRadius.sm),
              border: `1px solid ${tokens.colors.neutral[200]}`,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>
              {stage.fromStage} → {stage.toStage}
            </Text>
            {renderSlider(
              'Conversion Rate',
              stage.rate,
              0,
              1,
              0.01,
              (v) => updateStageRate(idx, v),
              (v) => formatPercentage(v, 0)
            )}
            {renderSlider(
              'Variance',
              stage.variance,
              0,
              0.3,
              0.01,
              (v) => updateStageVariance(idx, v),
              (v) => `±${formatPercentage(v, 0)}`
            )}
          </Box>
        ))}
      </Box>
    );

    const renderSourceControls = () => (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: numericValue(tokens.spacing[2]) }}>
        {sources.map((src, idx) => (
          <Box
            key={src.source}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              padding: numericValue(tokens.spacing[2]),
              background: tokens.colors.common.white,
              borderRadius: numericValue(tokens.borderRadius.sm),
              border: `1px solid ${tokens.colors.neutral[200]}`,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>
              {src.source}
            </Text>
            {renderSlider(
              'Mix %',
              src.percentage,
              0,
              100,
              1,
              (v) => updateSourcePercentage(idx, v),
              (v) => `${v}%`
            )}
            {renderSlider(
              'Quality',
              src.qualityMultiplier,
              0.5,
              2.0,
              0.1,
              (v) => updateSourceQuality(idx, v),
              (v) => `${v.toFixed(1)}x`
            )}
          </Box>
        ))}
      </Box>
    );

    const renderFunnel = () => {
      const width = 320;
      const stageHeight = 36;
      const gap = 4;
      const totalHeight = funnelData.length * (stageHeight + gap);
      const maxWidth = width * 0.9;
      const minWidth = width * 0.15;

      return (
        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: numericValue(tokens.spacing[2]) }}>
          <Text style={{ fontSize: 13, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
            Pipeline Funnel
          </Text>
          <svg width={width} height={totalHeight} viewBox={`0 0 ${width} ${totalHeight}`}>
            {funnelData.map((item, idx) => {
              const ratio = maxFunnelCandidates > 0 ? item.candidates / maxFunnelCandidates : 0;
              const barWidth = minWidth + (maxWidth - minWidth) * ratio;
              const x = (width - barWidth) / 2;
              const y = idx * (stageHeight + gap);
              const opacity = 0.3 + 0.7 * (1 - idx / Math.max(funnelData.length - 1, 1));

              return (
                <g key={item.stage}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={stageHeight}
                    rx={numericValue(tokens.borderRadius.sm)}
                    fill={tokens.colors.primaryScale?.[500] ?? tokens.colors.primary}
                    opacity={opacity}
                  />
                  <text
                    x={width / 2}
                    y={y + stageHeight / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={tokens.colors.common.white}
                    fontSize={11}
                    fontWeight={tokens.typography.fontWeight.medium}
                  >
                    {item.stage} ({item.candidates})
                  </text>
                </g>
              );
            })}
          </svg>
        </Box>
      );
    };

    const renderMetricCard = (
      icon: typeof Target,
      label: string,
      value: string,
      subtitle?: string,
      colorIntent?: 'success' | 'warning' | 'error'
    ) => {
      const Icon = icon;
      const iconColor = colorIntent
        ? (tokens.colors[`${colorIntent}Scale` as keyof typeof tokens.colors] as Record<string, string>)?.[600] ?? tokens.colors[colorIntent as keyof typeof tokens.colors]
        : tokens.colors.primaryScale?.[600] ?? tokens.colors.primary;

      return (
        <Box style={metricCardStyle}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: numericValue(tokens.spacing[1]) }}>
            <Icon size={ICON_SIZES.label} color={iconColor as string} />
            <Text style={{ fontSize: 11, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>
              {label}
            </Text>
          </Box>
          <Text style={{ fontSize: 22, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
            {value}
          </Text>
          {subtitle && (
            <Text style={{ fontSize: 11, color: tokens.colors.neutral[500] }}>
              {subtitle}
            </Text>
          )}
        </Box>
      );
    };

    const renderDistributionChart = () => {
      if (!results) return null;

      const { distribution, confidence } = results;
      if (!distribution.length) return null;

      const chartWidth = 380;
      const chartHeight = 180;
      const padding = { top: 20, right: 20, bottom: 30, left: 40 };
      const innerWidth = chartWidth - padding.left - padding.right;
      const innerHeight = chartHeight - padding.top - padding.bottom;

      const maxFreq = Math.max(...distribution.map((b) => b.frequency), 0.001);
      const barWidth = innerWidth / distribution.length - 2;

      return (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: numericValue(tokens.spacing[2]) }}>
          <Text style={{ fontSize: 13, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
            Outcome Distribution
          </Text>
          <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            {/* Y-axis line */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + innerHeight}
              stroke={tokens.colors.neutral[200]}
              strokeWidth={1}
            />
            {/* X-axis line */}
            <line
              x1={padding.left}
              y1={padding.top + innerHeight}
              x2={padding.left + innerWidth}
              y2={padding.top + innerHeight}
              stroke={tokens.colors.neutral[200]}
              strokeWidth={1}
            />

            {/* Confidence interval shaded region */}
            {(() => {
              const minVal = distribution[0].value;
              const maxVal = distribution[distribution.length - 1].value;
              const range = maxVal - minVal || 1;
              const lowerX = padding.left + ((confidence.lower - minVal) / range) * innerWidth;
              const upperX = padding.left + ((confidence.upper - minVal) / range) * innerWidth;

              return (
                <rect
                  x={Math.max(lowerX, padding.left)}
                  y={padding.top}
                  width={Math.min(upperX - lowerX, innerWidth)}
                  height={innerHeight}
                  fill={tokens.colors.primaryScale?.[100] ?? tokens.colors.primary}
                  opacity={0.3}
                />
              );
            })()}

            {/* Distribution bars */}
            {distribution.map((bucket, idx) => {
              const barHeight = (bucket.frequency / maxFreq) * innerHeight;
              const x = padding.left + (idx / distribution.length) * innerWidth + 1;
              const y = padding.top + innerHeight - barHeight;

              return (
                <rect
                  key={idx}
                  x={x}
                  y={y}
                  width={Math.max(barWidth, 1)}
                  height={barHeight}
                  fill={tokens.colors.primaryScale?.[500] ?? tokens.colors.primary}
                  rx={1}
                >
                  <title>{`Value: ${bucket.value}, Frequency: ${(bucket.frequency * 100).toFixed(1)}%`}</title>
                </rect>
              );
            })}

            {/* Mean line */}
            {(() => {
              const mean = results.outcomes.expectedHires;
              const minVal = distribution[0].value;
              const maxVal = distribution[distribution.length - 1].value;
              const range = maxVal - minVal || 1;
              const meanX = padding.left + ((mean - minVal) / range) * innerWidth;

              return (
                <line
                  x1={meanX}
                  y1={padding.top}
                  x2={meanX}
                  y2={padding.top + innerHeight}
                  stroke={tokens.colors.primaryScale?.[700] ?? tokens.colors.primary}
                  strokeWidth={2}
                />
              );
            })()}

            {/* X-axis labels */}
            {distribution.filter((_, i) => i % Math.max(1, Math.floor(distribution.length / 5)) === 0).map((bucket, idx) => {
              const x = padding.left + (distribution.indexOf(bucket) / distribution.length) * innerWidth;
              return (
                <text
                  key={idx}
                  x={x + barWidth / 2}
                  y={padding.top + innerHeight + 16}
                  textAnchor="middle"
                  fontSize={10}
                  fill={tokens.colors.neutral[500]}
                >
                  {Math.round(bucket.value)}
                </text>
              );
            })}

            {/* Y-axis label */}
            <text
              x={padding.left - 6}
              y={padding.top - 6}
              textAnchor="end"
              fontSize={9}
              fill={tokens.colors.neutral[500]}
            >
              Freq
            </text>
          </svg>

          <Box style={{ display: 'flex', alignItems: 'center', gap: numericValue(tokens.spacing[4]), flexWrap: 'wrap' as const }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Box style={{ width: 16, height: 3, background: tokens.colors.primaryScale?.[700] ?? tokens.colors.primary, borderRadius: 2 }} />
              <Text style={{ fontSize: 10, color: tokens.colors.neutral[500] }}>Mean</Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Box style={{ width: 16, height: 8, background: tokens.colors.primaryScale?.[100] ?? tokens.colors.primary, opacity: 0.5, borderRadius: 2 }} />
              <Text style={{ fontSize: 10, color: tokens.colors.neutral[500] }}>90% CI</Text>
            </Box>
          </Box>
        </Box>
      );
    };

    const renderBottlenecks = () => {
      if (!results?.bottlenecks?.length) return null;

      return (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: numericValue(tokens.spacing[2]) }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: numericValue(tokens.spacing[1]) }}>
            <AlertTriangle size={ICON_SIZES.label} color={tokens.colors.warningScale?.[600] ?? tokens.colors.warning} />
            <Text style={{ fontSize: 13, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
              Bottlenecks
            </Text>
          </Box>
          {results.bottlenecks.map((bn, idx) => {
            const colorIntent = getBottleneckColor(bn.severity);
            const badgeColors = badgeColorMap[colorIntent] ?? badgeColorMap.warning;

            return (
              <Box
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  padding: numericValue(tokens.spacing[2]),
                  background: tokens.colors.common.white,
                  borderRadius: numericValue(tokens.borderRadius.sm),
                  border: `1px solid ${tokens.colors.neutral[200]}`,
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                    {bn.stage}
                  </Text>
                  <Box
                    style={{
                      ...badgeColors,
                      padding: '2px 8px',
                      borderRadius: numericValue(tokens.borderRadius.full),
                      fontSize: 10,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      textTransform: 'uppercase' as const,
                    }}
                  >
                    <Text style={{ fontSize: 10, color: badgeColors.color }}>{bn.severity}</Text>
                  </Box>
                </Box>
                <Text style={{ fontSize: 11, color: tokens.colors.neutral[500], lineHeight: 1.4 }}>
                  {bn.suggestion}
                </Text>
                <Box style={{ ...createProgressBarStyle(tokens, { percent: bn.impact }).track, overflow: 'hidden' }}>
                  <Box
                    style={{
                      height: '100%',
                      width: `${bn.impact}%`,
                      background:
                        bn.severity === 'high'
                          ? tokens.colors.errorScale?.[500] ?? tokens.colors.error
                          : bn.severity === 'medium'
                            ? tokens.colors.warningScale?.[500] ?? tokens.colors.warning
                            : tokens.colors.successScale?.[500] ?? tokens.colors.success,
                      borderRadius: numericValue(tokens.borderRadius.full),
                      transition: 'width 0.6s ease',
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      );
    };

    const renderRecommendations = () => {
      if (!results?.recommendations?.length) return null;

      return (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: numericValue(tokens.spacing[2]) }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: numericValue(tokens.spacing[1]) }}>
            <Lightbulb size={ICON_SIZES.label} color={tokens.colors.infoScale?.[600] ?? tokens.colors.info} />
            <Text style={{ fontSize: 13, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
              Recommendations
            </Text>
          </Box>
          {results.recommendations.map((rec, idx) => (
            <Box
              key={idx}
              style={{
                display: 'flex',
                gap: numericValue(tokens.spacing[2]),
                padding: numericValue(tokens.spacing[2]),
                background: tokens.colors.infoScale?.[50] ?? tokens.colors.common.white,
                borderRadius: numericValue(tokens.borderRadius.sm),
                border: `1px solid ${tokens.colors.infoScale?.[200] ?? tokens.colors.neutral[200]}`,
              }}
            >
              <Zap size={14} color={tokens.colors.infoScale?.[500] ?? tokens.colors.info} style={{ flexShrink: 0, marginTop: 2 }} />
              <Text style={{ fontSize: 12, color: tokens.colors.neutral[900], lineHeight: 1.5 }}>
                {rec}
              </Text>
            </Box>
          ))}
        </Box>
      );
    };

    const renderSaveModal = () => {
      if (!showSaveModal) return null;

      return (
        <Box
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          {...clickableProps(() => setShowSaveModal(false))}
        >
          <Box
            style={{
              background: tokens.colors.common.white,
              borderRadius: numericValue(tokens.borderRadius.lg),
              padding: numericValue(tokens.spacing[6]),
              width: 400,
              maxWidth: '90vw',
              display: 'flex',
              flexDirection: 'column',
              gap: numericValue(tokens.spacing[4]),
              boxShadow: tokens.shadows?.lg ?? '0 8px 32px rgba(0,0,0,0.15)',
            }}
            {...clickableProps(() => {})}
          >
            <Text style={{ fontSize: 16, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
              Save Scenario
            </Text>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: numericValue(tokens.spacing[2]) }}>
              <Text style={{ fontSize: 12, color: tokens.colors.neutral[500] }}>Scenario Name</Text>
              <Input
                value={scenarioName}
                onChange={(value: string) => setScenarioName(value)}
                placeholder="e.g., Optimistic Q2 Forecast"
                style={{ width: '100%' }}
              />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: numericValue(tokens.spacing[2]) }}>
              <Text style={{ fontSize: 12, color: tokens.colors.neutral[500] }}>Description (optional)</Text>
              <Input
                value={scenarioDescription}
                onChange={(value: string) => setScenarioDescription(value)}
                placeholder="Brief description..."
                style={{ width: '100%' }}
              />
            </Box>
            <Box style={{ display: 'flex', justifyContent: 'flex-end', gap: numericValue(tokens.spacing[2]) }}>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowSaveModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={!scenarioName.trim()}
              >
                Save
              </Button>
            </Box>
          </Box>
        </Box>
      );
    };

    // ========================================================================
    // MAIN RENDER
    // ========================================================================

    if (loading) {
      return (
        <Box style={{ ...containerStyle, ...createEmptyStateStyle(tokens) }} className={className}>
          <Loader2
            size={ICON_SIZES.feature}
            color={tokens.colors.primaryScale?.[500] ?? tokens.colors.primary}
            style={{ animation: 'spin 1s linear infinite' }}
          />
          <Text style={{ fontSize: 14, color: tokens.colors.neutral[500] }}>
            Loading simulator...
          </Text>
        </Box>
      );
    }

    return (
      <Box style={containerStyle} className={className}>
        {/* Header */}
        <Box style={headerStyle}>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: numericValue(tokens.spacing[2]) }}>
              <BarChart3 size={ICON_SIZES.section} color={tokens.colors.primaryScale?.[600] ?? tokens.colors.primary} />
              <Text style={{ fontSize: 18, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                Pipeline Simulator
              </Text>
            </Box>
            {jobTitle && (
              <Text style={{ fontSize: 13, color: tokens.colors.neutral[500] }}>
                {jobTitle}
              </Text>
            )}
          </Box>

          <Box style={{ display: 'flex', gap: numericValue(tokens.spacing[2]) }}>
            {results && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowSaveModal(true)}
              >
                <Save size={14} style={{ marginRight: 6 }} />
                Save Scenario
              </Button>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={handleRunSimulation}
              disabled={simulating}
              style={{
                background: tokens.colors.primaryScale?.[600] ?? tokens.colors.primary,
                color: tokens.colors.common.white,
                minWidth: 160,
              }}
            >
              {simulating ? (
                <>
                  <Loader2 size={16} style={{ marginRight: 6, animation: 'spin 1s linear infinite' }} />
                  Simulating...
                </>
              ) : (
                <>
                  <Play size={16} style={{ marginRight: 6 }} />
                  Run Simulation
                </>
              )}
            </Button>
          </Box>
        </Box>

        {/* Two-column layout */}
        <Box style={columnsStyle}>
          {/* Left Panel: Parameters */}
          <Box style={panelStyle}>
            <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', gap: numericValue(tokens.spacing[1]) }}>
              <Settings size={ICON_SIZES.label} color={tokens.colors.primaryScale?.[600] ?? tokens.colors.primary} />
              <Text style={{ fontSize: 14, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                Parameters
              </Text>
            </Box>

            {/* Positions & Iterations */}
            <Box style={{ display: 'flex', gap: numericValue(tokens.spacing[4]) }}>
              <Box style={{ flex: 1 }}>
                {renderSlider('Open Positions', openPositions, 1, 50, 1, setOpenPositions)}
              </Box>
              <Box style={{ flex: 1 }}>
                <Box style={sliderContainerStyle}>
                  <Text style={{ fontSize: 12, color: tokens.colors.neutral[500] }}>Iterations</Text>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4 }}>
                    {ITERATION_OPTIONS.map((opt) => (
                      <div
                        key={opt}
                        {...clickableProps(() => setIterations(opt))}
                        style={{
                          padding: '3px 8px',
                          borderRadius: numericValue(tokens.borderRadius.sm),
                          fontSize: 11,
                          fontWeight: iterations === opt ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                          background: iterations === opt
                            ? tokens.colors.primaryScale?.[50] ?? tokens.colors.primary
                            : tokens.colors.common.white,
                          color: iterations === opt
                            ? tokens.colors.primaryScale?.[700] ?? tokens.colors.primary
                            : tokens.colors.neutral[500],
                          border: `1px solid ${iterations === opt
                            ? tokens.colors.primaryScale?.[200] ?? tokens.colors.primary
                            : tokens.colors.neutral[200]}`,
                          cursor: 'pointer',
                        }}
                      >
                        {opt >= 1000 ? `${opt / 1000}k` : opt}
                      </div>
                    ))}
                  </div>
                </Box>
              </Box>
            </Box>

            {/* Target Date */}
            <Box style={sliderContainerStyle}>
              <Text style={{ fontSize: 12, color: tokens.colors.neutral[500] }}>Target Hire Date</Text>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: numericValue(tokens.borderRadius.sm),
                  border: `1px solid ${tokens.colors.neutral[200]}`,
                  fontSize: 13,
                  color: tokens.colors.neutral[900],
                  background: tokens.colors.common.white,
                }}
              />
            </Box>

            {/* Funnel */}
            {renderFunnel()}

            {/* Stage Conversion Rates */}
            <Box
              style={sectionHeaderStyle}
              {...clickableProps(() => setExpandedSection(expandedSection === 'stages' ? null : 'stages'))}
            >
              <Text style={{ fontSize: 13, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                Stage Conversion Rates
              </Text>
              {expandedSection === 'stages' ? (
                <ChevronUp size={16} color={tokens.colors.neutral[500]} />
              ) : (
                <ChevronDown size={16} color={tokens.colors.neutral[500]} />
              )}
            </Box>
            {expandedSection === 'stages' && renderStageControls()}

            {/* Source Mix */}
            <Box
              style={sectionHeaderStyle}
              {...clickableProps(() => setExpandedSection(expandedSection === 'sources' ? null : 'sources'))}
            >
              <Text style={{ fontSize: 13, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                Source Mix
              </Text>
              {expandedSection === 'sources' ? (
                <ChevronUp size={16} color={tokens.colors.neutral[500]} />
              ) : (
                <ChevronDown size={16} color={tokens.colors.neutral[500]} />
              )}
            </Box>
            {expandedSection === 'sources' && renderSourceControls()}
          </Box>

          {/* Right Panel: Results */}
          <Box style={panelStyle}>
            <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', gap: numericValue(tokens.spacing[1]) }}>
              <TrendingUp size={ICON_SIZES.label} color={tokens.colors.primaryScale?.[600] ?? tokens.colors.primary} />
              <Text style={{ fontSize: 14, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                Results
              </Text>
            </Box>

            {!results ? (
              <Box style={{ ...createEmptyStateStyle(tokens), padding: numericValue(tokens.spacing[8]) }}>
                <BarChart3 size={40} color={tokens.colors.primaryScale?.[200] ?? tokens.colors.primary} />
                <Text style={{ fontSize: 14, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[500] }}>
                  Run a simulation to see results
                </Text>
                <Text style={{ fontSize: 12, color: tokens.colors.neutral[500], textAlign: 'center' as const, maxWidth: 280 }}>
                  Adjust the parameters on the left, then click &quot;Run Simulation&quot; to forecast your hiring pipeline outcomes.
                </Text>
              </Box>
            ) : (
              <Box style={{ display: 'flex', flexDirection: 'column', gap: numericValue(tokens.spacing[4]) }}>
                {/* Key Metrics */}
                <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: numericValue(tokens.spacing[2]) }}>
                  {renderMetricCard(
                    Users,
                    'Expected Hires',
                    String(results.outcomes.expectedHires),
                    `${results.outcomes.bestCase} best / ${results.outcomes.worstCase} worst`,
                  )}
                  {renderMetricCard(
                    Clock,
                    'Time to Fill',
                    `${results.outcomes.expectedTimeToFill}d`,
                    'Average days',
                  )}
                  {renderMetricCard(
                    Target,
                    'Target Probability',
                    formatPercentage(results.outcomes.probabilityOfMeetingTarget, 0),
                    `${openPositions} position(s)`,
                    getProbabilityColor(results.outcomes.probabilityOfMeetingTarget),
                  )}
                  {renderMetricCard(
                    DollarSign,
                    'Est. Cost',
                    `$${results.outcomes.expectedCost.toLocaleString()}`,
                    `${results.iterations.toLocaleString()} iterations`,
                  )}
                </Box>

                {/* Confidence Interval */}
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: numericValue(tokens.spacing[2]),
                    padding: numericValue(tokens.spacing[2]),
                    background: tokens.colors.primaryScale?.[50] ?? tokens.colors.common.white,
                    borderRadius: numericValue(tokens.borderRadius.sm),
                    border: `1px solid ${tokens.colors.primaryScale?.[200] ?? tokens.colors.neutral[200]}`,
                  }}
                >
                  <Info size={14} color={tokens.colors.primaryScale?.[600] ?? tokens.colors.primary} />
                  <Text style={{ fontSize: 12, color: tokens.colors.primaryScale?.[700] ?? tokens.colors.neutral[900] }}>
                    {Math.round(results.confidence.confidence * 100)}% Confidence Interval: {results.confidence.lower} - {results.confidence.upper} hires
                  </Text>
                </Box>

                {/* Distribution Chart */}
                {renderDistributionChart()}

                {/* Bottlenecks */}
                {renderBottlenecks()}

                {/* Recommendations */}
                {renderRecommendations()}
              </Box>
            )}
          </Box>
        </Box>

        {/* Save Modal */}
        {renderSaveModal()}
      </Box>
    );
  }
);
