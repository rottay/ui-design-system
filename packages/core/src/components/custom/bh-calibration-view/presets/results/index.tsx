'use client';

/**
 * BhCalibrationView - Results Preset
 * Analysis-focused view with charts, metrics, and detailed breakdowns
 * for reviewing completed calibration sessions.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createCardHoverStyles,
  createEmptyStateStyle,
  createEntranceAnimation,
  createFilterPillStyle,
  createHoverStyle,
  createIconContainerStyle,
  createPanelHeaderStyle,
  createPersonalitySectionHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createSurfaceStyle,
  createStaggerDelay,
  createPersonalityAccentBar,
  createDividerStyle,
  getChartConfig,
  getHoverTransform,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type {
  BhCalibrationViewProps,
  CalibrationSample,
  AlignmentMetrics,
  DimensionAdjustment,
} from '../../core';
import { n } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Target,
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info,
  FileText,
  PieChart,
  GitCompare,
  Layers,
  Zap,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getScoreColor(score: number, tokens: DesignTokens): string {
  if (score >= 80) return tokens.colors.successScale[500];
  if (score >= 60) return tokens.colors.successScale[300];
  if (score >= 40) return tokens.colors.warningScale[500];
  if (score >= 20) return tokens.colors.warningScale[300];
  return tokens.colors.errorScale[500];
}

function getAgreementColor(agreement: number, tokens: DesignTokens): string {
  if (agreement >= 0.8) return tokens.colors.successScale[600];
  if (agreement >= 0.6) return tokens.colors.successScale[400];
  if (agreement >= 0.4) return tokens.colors.warningScale[600];
  if (agreement >= 0.2) return tokens.colors.warningScale[400];
  return tokens.colors.errorScale[600];
}

function getAgreementBg(agreement: number, tokens: DesignTokens): string {
  if (agreement >= 0.8) return tokens.colors.successScale[50];
  if (agreement >= 0.6) return tokens.colors.successScale[100];
  if (agreement >= 0.4) return tokens.colors.warningScale[50];
  if (agreement >= 0.2) return tokens.colors.warningScale[100];
  return tokens.colors.errorScale[50];
}

function getGradeLabel(rate: number): string {
  if (rate >= 0.9) return 'Excellent';
  if (rate >= 0.75) return 'Good';
  if (rate >= 0.6) return 'Fair';
  if (rate >= 0.4) return 'Needs Work';
  return 'Poor';
}

function getMisalignmentColor(val: number, tokens: DesignTokens): string {
  const abs = Math.abs(val);
  if (abs <= 0.1) return tokens.colors.successScale[500];
  if (abs <= 0.25) return tokens.colors.warningScale[500];
  return tokens.colors.errorScale[500];
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */
export const ResultsBhCalibrationView = createPreset<BhCalibrationViewProps>({
  name: 'BhCalibrationView.Results',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhCalibrationViewProps>) => {
    const { Box, Text, Stack } = primitives;

    const {
      rubricName,
      dimensions: rawDimensions = [],
      samples: rawSamples = [],
      alignmentMetrics,
      adjustments: rawAdjustments = [],
      progress,
      className,
      style,
    } = props;

    const dimensions = Array.isArray(rawDimensions) ? rawDimensions : [];
    const samples = Array.isArray(rawSamples) ? rawSamples : [];
    const adjustments = Array.isArray(rawAdjustments) ? rawAdjustments : [];

    /* ----- personality + glass ----- */
    const isGlass = tokens.surface.useGlass;
    const typo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);
    const headerIconStyle = useMemo(() => createIconContainerStyle(tokens, { size: tokens.spacing[10], color: tokens.colors.primaryScale[100] }), [tokens]);
    const entrance = useMemo(() => createEntranceAnimation(tokens, { index: 0 }), [tokens]);

    const [expandedSample, setExpandedSample] = useState<string | null>(null);
    const [expandedAdjustment, setExpandedAdjustment] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'samples' | 'adjustments'>('overview');

    const handleTabChange = useCallback((tab: typeof activeTab) => {
      setActiveTab(tab);
    }, []);
    const handleSampleToggle = useCallback((id: string) => {
      setExpandedSample(prev => prev === id ? null : id);
    }, []);
    const handleAdjustmentToggle = useCallback((dimension: string) => {
      setExpandedAdjustment(prev => prev === dimension ? null : dimension);
    }, []);

    const completedSamples = useMemo(() => progress?.completed ?? samples.filter(s => s.humanScores && s.aiScores).length, [progress, samples]);
    const totalSamples = useMemo(() => progress?.total ?? samples.length, [progress, samples]);
    const agreementRate = n(alignmentMetrics?.agreementRate);
    const mae = n(alignmentMetrics?.meanAbsoluteError);
    const confidenceCorr = n(alignmentMetrics?.confidenceCorrelation);
    const perDimAlignment = useMemo(() => alignmentMetrics?.perDimensionAlignment ?? [], [alignmentMetrics]);

    const glassCard = useMemo(() => createCardStyle(tokens, { glass: isGlass, elevation: 'md' }), [tokens, isGlass]);
    const surfaceStyle = useMemo(() => createSurfaceStyle(tokens, { elevation: 'sm' }), [tokens]);

    /* Aggregate stats across all samples */
    const sampleStats = useMemo(() => {
      return samples.map(sample => {
        if (!sample.humanScores || !sample.aiScores) return null;
        const dims = Object.keys(sample.humanScores).filter(d => sample.aiScores?.[d] !== undefined);
        const totalDiff = dims.reduce((sum, d) => sum + Math.abs((sample.humanScores?.[d] ?? 0) - (sample.aiScores?.[d] ?? 0)), 0);
        const avgDiff = dims.length > 0 ? totalDiff / dims.length : 0;
        const agreementCount = dims.filter(d => Math.abs((sample.humanScores?.[d] ?? 0) - (sample.aiScores?.[d] ?? 0)) <= 10).length;
        return {
          id: sample.id,
          avgDiff,
          agreementCount,
          totalDims: dims.length,
          agreementRate: dims.length > 0 ? agreementCount / dims.length : 0,
        };
      }).filter(Boolean);
    }, [samples]);

    /* Per-dimension average scores */
    const dimAvgScores = useMemo(() => {
      return dimensions.map(dim => {
        const humanVals: number[] = [];
        const aiVals: number[] = [];
        samples.forEach(s => {
          if (s.humanScores?.[dim] !== undefined) humanVals.push(s.humanScores[dim]);
          if (s.aiScores?.[dim] !== undefined) aiVals.push(s.aiScores[dim]);
        });
        const avgHuman = humanVals.length > 0 ? humanVals.reduce((a, b) => a + b, 0) / humanVals.length : 0;
        const avgAI = aiVals.length > 0 ? aiVals.reduce((a, b) => a + b, 0) / aiVals.length : 0;
        return { dimension: dim, avgHuman, avgAI, diff: avgHuman - avgAI };
      });
    }, [dimensions, samples]);

    const tabs = useMemo<Array<{ key: typeof activeTab; label: string; icon: typeof BarChart3 }>>(() => [
      { key: 'overview', label: 'Overview', icon: PieChart },
      { key: 'samples', label: 'Sample Details', icon: FileText },
      { key: 'adjustments', label: 'Adjustments', icon: Lightbulb },
    ], []);

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', backgroundColor: tokens.colors.common.white, fontFamily: 'inherit', ...entrance.animate, transition: entrance.transition, ...style }}>

        {/* ===== Header ===== */}
        <Box style={{
          padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap' as const,
          gap: tokens.spacing[3],
          ...(isGlass && tokens.glass ? { backdropFilter: tokens.glass.blur, WebkitBackdropFilter: tokens.glass.blur, backgroundColor: tokens.glass.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Box style={headerIconStyle}>
              <Target size={20} color={tokens.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
              <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: typo.headingWeight, letterSpacing: typo.headingLetterSpacing, color: tokens.colors.neutral[900], display: 'block' }}>
                {rubricName} - Results
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                Calibration Analysis
              </Text>
            </Box>
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
            <Box style={{ ...createBadgeStyle(tokens, 'info'), borderRadius: badgeRadius }}>
              <FileText size={12} style={{ marginRight: tokens.spacing[1] }} />
              {completedSamples}/{totalSamples} samples
            </Box>
            <Box style={{ ...createBadgeStyle(tokens, agreementRate >= 0.7 ? 'success' : agreementRate >= 0.5 ? 'warning' : 'error'), borderRadius: badgeRadius }}>
              <Award size={12} style={{ marginRight: tokens.spacing[1] }} />
              {getGradeLabel(agreementRate)}
            </Box>
          </Box>
        </Box>

        {/* ===== Tab Navigation ===== */}
        <Box role="tablist" aria-label="Calibration results tabs" style={{
          display: 'flex',
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          padding: `0 ${tokens.spacing[5]}px`,
          backgroundColor: tokens.colors.neutral[50],
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.key}`}
                onClick={() => handleTabChange(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${tokens.colors.primaryScale[600]}` : `2px solid transparent`,
                  backgroundColor: 'transparent',
                  color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                  fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                  fontSize: tokens.typography.fontSize.sm,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </Box>

        {/* ===== Content ===== */}
        <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[5] }}>

          {/* ---------- Overview Tab ---------- */}
          {activeTab === 'overview' && (
            <Stack direction="vertical" spacing="lg">
              {/* Summary Metric Cards */}
              <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: tokens.spacing[4] }}>
                {/* Agreement Rate */}
                {(() => { const e0 = createEntranceAnimation(tokens, { index: 0 }); return (
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], ...glassCard, padding: tokens.spacing[4], textAlign: 'center', ...e0.animate, transition: e0.transition }}>
                  <Box style={{
                    ...createIconContainerStyle(tokens, { size: tokens.spacing[10], color: getAgreementBg(agreementRate, tokens) }),
                    margin: '0 auto',
                    marginBottom: tokens.spacing[2],
                  }}>
                    <CheckCircle size={18} color={getAgreementColor(agreementRate, tokens)} />
                  </Box>
                  <Text style={{ display: 'block', fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: getAgreementColor(agreementRate, tokens) }}>
                    {Math.round(agreementRate * 100)}%
                  </Text>
                  <Text style={{ ...sectionHeaderStyle, marginBottom: 0 }}>
                    Agreement Rate
                  </Text>
                </Box>
                ); })()}

                {/* MAE */}
                {(() => { const e1 = createEntranceAnimation(tokens, { index: 1 }); return (
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], ...glassCard, padding: tokens.spacing[4], textAlign: 'center', ...e1.animate, transition: e1.transition }}>
                  <Box style={{
                    ...createIconContainerStyle(tokens, { size: tokens.spacing[10], color: mae <= 10 ? tokens.colors.successScale[50] : mae <= 20 ? tokens.colors.warningScale[50] : tokens.colors.errorScale[50] }),
                    margin: '0 auto',
                    marginBottom: tokens.spacing[2],
                  }}>
                    <BarChart3 size={18} color={mae <= 10 ? tokens.colors.successScale[600] : mae <= 20 ? tokens.colors.warningScale[600] : tokens.colors.errorScale[600]} />
                  </Box>
                  <Text style={{ display: 'block', fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: mae <= 10 ? tokens.colors.successScale[600] : mae <= 20 ? tokens.colors.warningScale[600] : tokens.colors.errorScale[600] }}>
                    {mae.toFixed(1)}
                  </Text>
                  <Text style={{ ...sectionHeaderStyle, marginBottom: 0 }}>
                    Mean Abs. Error
                  </Text>
                </Box>
                ); })()}

                {/* Confidence Correlation */}
                {(() => { const e2 = createEntranceAnimation(tokens, { index: 2 }); return (
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], ...glassCard, padding: tokens.spacing[4], textAlign: 'center', ...e2.animate, transition: e2.transition }}>
                  <Box style={{
                    ...createIconContainerStyle(tokens, { size: tokens.spacing[10], color: confidenceCorr >= 0.7 ? tokens.colors.successScale[50] : confidenceCorr >= 0.4 ? tokens.colors.warningScale[50] : tokens.colors.errorScale[50] }),
                    margin: '0 auto',
                    marginBottom: tokens.spacing[2],
                  }}>
                    <GitCompare size={18} color={confidenceCorr >= 0.7 ? tokens.colors.successScale[600] : confidenceCorr >= 0.4 ? tokens.colors.warningScale[600] : tokens.colors.errorScale[600]} />
                  </Box>
                  <Text style={{ display: 'block', fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: confidenceCorr >= 0.7 ? tokens.colors.successScale[600] : confidenceCorr >= 0.4 ? tokens.colors.warningScale[600] : tokens.colors.errorScale[600] }}>
                    {confidenceCorr.toFixed(2)}
                  </Text>
                  <Text style={{ ...sectionHeaderStyle, marginBottom: 0 }}>
                    Confidence Corr.
                  </Text>
                </Box>
                ); })()}

                {/* Samples Completed */}
                {(() => { const e3 = createEntranceAnimation(tokens, { index: 3 }); return (
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], ...glassCard, padding: tokens.spacing[4], textAlign: 'center', ...e3.animate, transition: e3.transition }}>
                  <Box style={{
                    ...createIconContainerStyle(tokens, { size: tokens.spacing[10], color: tokens.colors.primaryScale[50] }),
                    margin: '0 auto',
                    marginBottom: tokens.spacing[2],
                  }}>
                    <Layers size={18} color={tokens.colors.primaryScale[600]} />
                  </Box>
                  <Text style={{ display: 'block', fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>
                    {completedSamples}
                  </Text>
                  <Text style={{ ...sectionHeaderStyle, marginBottom: 0 }}>
                    Samples Reviewed
                  </Text>
                </Box>
                ); })()}
              </Box>

              {/* Per-Dimension Bar Chart (horizontal) */}
              <Box style={{ ...glassCard, padding: tokens.spacing[5] }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                  <BarChart3 size={18} color={tokens.colors.primaryScale[600]} />
                  <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.md, fontWeight: typo.headingWeight, letterSpacing: typo.headingLetterSpacing, color: tokens.colors.neutral[900] }}>
                    Average Scores by Dimension
                  </Text>
                </Box>

                <Stack direction="vertical" spacing="sm">
                  {dimAvgScores.map((item) => (
                    <Box key={item.dimension} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
                      <Text style={{ width: 120, minWidth: 80, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], fontWeight: tokens.typography.fontWeight.medium, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.dimension}
                      </Text>
                      <Box style={{ flex: 1, minWidth: 120, display: 'flex', gap: tokens.spacing[1], alignItems: 'center' }}>
                        {/* Human bar */}
                        <Box style={{ flex: 1, position: 'relative', height: tokens.spacing[4] }}>
                          <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[100] }} />
                          <Box style={{
                            position: 'absolute', top: 0, left: 0, height: '100%',
                            width: `${Math.min(item.avgHuman, 100)}%`,
                            borderRadius: tokens.borderRadius.sm,
                            backgroundColor: tokens.colors.primaryScale[400],
                            transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                          }} />
                        </Box>
                        {/* AI bar */}
                        <Box style={{ flex: 1, position: 'relative', height: tokens.spacing[4] }}>
                          <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[100] }} />
                          <Box style={{
                            position: 'absolute', top: 0, left: 0, height: '100%',
                            width: `${Math.min(item.avgAI, 100)}%`,
                            borderRadius: tokens.borderRadius.sm,
                            backgroundColor: tokens.colors.secondaryScale[400],
                            transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                          }} />
                        </Box>
                      </Box>
                      <Box style={{ width: 80, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], flexShrink: 0 }}>
                        <Text style={{ color: tokens.colors.primaryScale[600], fontWeight: tokens.typography.fontWeight.semibold, fontSize: 'inherit' }}>{Math.round(item.avgHuman)}</Text>
                        <Text style={{ fontSize: 'inherit', color: 'inherit' }}>/</Text>
                        <Text style={{ color: tokens.colors.secondaryScale[600], fontWeight: tokens.typography.fontWeight.semibold, fontSize: 'inherit' }}>{Math.round(item.avgAI)}</Text>
                      </Box>
                    </Box>
                  ))}
                </Stack>

                {/* Legend */}
                <Box style={{ display: 'flex', gap: tokens.spacing[4], marginTop: tokens.spacing[3], justifyContent: 'center', flexWrap: 'wrap' as const }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <Box style={{ width: tokens.spacing[3], height: tokens.spacing[3], borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.primaryScale[400] }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Human</Text>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <Box style={{ width: tokens.spacing[3], height: tokens.spacing[3], borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.secondaryScale[400] }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>AI</Text>
                  </Box>
                </Box>
              </Box>

              {/* Per-dimension alignment heatmap */}
              {perDimAlignment.length > 0 && (
                <Box style={{ ...glassCard, padding: tokens.spacing[5] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                    <Zap size={18} color={tokens.colors.warningScale[600]} />
                    <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.md, fontWeight: typo.headingWeight, letterSpacing: typo.headingLetterSpacing, color: tokens.colors.neutral[900] }}>
                      Alignment Heatmap
                    </Text>
                  </Box>

                  <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: tokens.spacing[2] }}>
                    {perDimAlignment.map((item, idx) => {
                      const heatEntrance = createEntranceAnimation(tokens, { index: idx });
                      return (
                        <Box
                          key={idx}
                          style={{
                            padding: tokens.spacing[3],
                            borderRadius: tokens.borderRadius.md,
                            backgroundColor: getAgreementBg(n(item.agreement), tokens),
                            textAlign: 'center',
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${getAgreementColor(n(item.agreement), tokens)}30`,
                            transition: heatEntrance.transition || `all ${tokens.motion.hover}`,
                            ...heatEntrance.animate,
                          }}
                        >
                          <Text style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], marginBottom: tokens.spacing[1], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.dimension}
                          </Text>
                          <Text style={{ display: 'block', fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: getAgreementColor(n(item.agreement), tokens) }}>
                            {Math.round(n(item.agreement) * 100)}%
                          </Text>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Stack>
          )}

          {/* ---------- Samples Tab ---------- */}
          {activeTab === 'samples' && (
            <Stack direction="vertical" spacing="md">
              {samples.map((sample, sIdx) => {
                const stats = sampleStats[sIdx];
                const isExpanded = expandedSample === sample.id;
                const sEntrance = createEntranceAnimation(tokens, { index: sIdx });
                return (
                  <Box
                    key={sample.id}
                    style={{
                      ...surfaceStyle,
                      borderRadius: tokens.borderRadius.lg,
                      backgroundColor: tokens.colors.common.white,
                      overflow: 'hidden',
                      ...sEntrance.animate,
                      transition: sEntrance.transition,
                    }}
                  >
                    {/* Sample header (collapsible) */}
                    <button
                      aria-expanded={isExpanded}
                      aria-controls={`sample-detail-${sample.id}`}
                      aria-label={`Sample ${sample.id}, ${stats ? Math.round(stats.agreementRate * 100) + '% agreement' : 'no data'}`}
                      onClick={() => handleSampleToggle(sample.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                        border: 'none',
                        backgroundColor: isExpanded ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                      }}
                    >
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                        <Box style={{
                          ...createIconContainerStyle(tokens, { size: tokens.spacing[8], color: tokens.colors.primaryScale[100] }),
                        }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[600] }}>
                            {sIdx + 1}
                          </Text>
                        </Box>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                          Sample {sample.id}
                        </Text>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                        {stats && (
                          <Box style={{
                            ...createBadgeStyle(tokens, stats.agreementRate >= 0.7 ? 'success' : stats.agreementRate >= 0.5 ? 'warning' : 'error'),
                            borderRadius: badgeRadius,
                          }}>
                            {Math.round(stats.agreementRate * 100)}% agree
                          </Box>
                        )}
                        {isExpanded ? <ChevronUp size={16} color={tokens.colors.neutral[400]} /> : <ChevronDown size={16} color={tokens.colors.neutral[400]} />}
                      </Box>
                    </button>

                    {/* Expanded content */}
                    {isExpanded && sample.humanScores && sample.aiScores && (
                      <Box id={`sample-detail-${sample.id}`} role="region" aria-label={`Details for sample ${sample.id}`} style={{ padding: tokens.spacing[4], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                        <Box style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(140px, 1fr))`, gap: tokens.spacing[3] }}>
                          {dimensions.map((dim, dimIdx) => {
                            const hVal = sample.humanScores?.[dim] ?? 0;
                            const aVal = sample.aiScores?.[dim] ?? 0;
                            const diff = Math.abs(hVal - aVal);
                            const isClose = diff <= 10;
                            const dimEntrance = createEntranceAnimation(tokens, { index: dimIdx });
                            return (
                              <Box key={dim} style={{
                                padding: tokens.spacing[3],
                                borderRadius: tokens.borderRadius.md,
                                backgroundColor: isClose ? tokens.colors.successScale[50] : tokens.colors.errorScale[50],
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isClose ? tokens.colors.successScale[200] : tokens.colors.errorScale[200]}`,
                                textAlign: 'center',
                                ...dimEntrance.animate,
                                transition: dimEntrance.transition,
                              }}>
                                <Text style={{ ...sectionHeaderStyle, display: 'block', marginBottom: tokens.spacing[2], color: tokens.colors.neutral[600] }}>
                                  {dim}
                                </Text>
                                <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: tokens.spacing[2] }}>
                                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                                    <Text style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Human</Text>
                                    <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>{hVal}</Text>
                                  </Box>
                                  <ArrowRight size={14} color={tokens.colors.neutral[300]} />
                                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                                    <Text style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>AI</Text>
                                    <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.secondaryScale[600] }}>{aVal}</Text>
                                  </Box>
                                </Box>
                                <Box style={{ marginTop: tokens.spacing[1], display: 'flex', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing[1] }}>
                                  {isClose ? <CheckCircle size={10} color={tokens.colors.successScale[600]} /> : <XCircle size={10} color={tokens.colors.errorScale[600]} />}
                                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: isClose ? tokens.colors.successScale[700] : tokens.colors.errorScale[700], fontWeight: tokens.typography.fontWeight.medium }}>
                                    {isClose ? 'Aligned' : `Diff: ${diff}`}
                                  </Text>
                                </Box>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    )}
                  </Box>
                );
              })}

              {samples.length === 0 && (
                <Box style={createEmptyStateStyle(tokens)}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
                    No calibration samples available.
                  </Text>
                </Box>
              )}
            </Stack>
          )}

          {/* ---------- Adjustments Tab ---------- */}
          {activeTab === 'adjustments' && (
            <Stack direction="vertical" spacing="md">
              {adjustments.length > 0 ? (
                adjustments.map((adj, idx) => {
                  const isExpanded = expandedAdjustment === adj.dimension;
                  const misColor = getMisalignmentColor(n(adj.misalignment), tokens);
                  const adjEntrance = createEntranceAnimation(tokens, { index: idx });
                  return (
                    <Box
                      key={idx}
                      style={{
                        ...surfaceStyle,
                        borderRadius: tokens.borderRadius.lg,
                        backgroundColor: tokens.colors.common.white,
                        overflow: 'hidden',
                        borderLeft: `3px solid ${misColor}`,
                        ...adjEntrance.animate,
                        transition: adjEntrance.transition,
                      }}
                    >
                      <button
                        aria-expanded={isExpanded}
                        aria-controls={`adj-detail-${adj.dimension}`}
                        aria-label={`${adj.dimension} adjustment, ${(n(adj.misalignment) * 100).toFixed(0)}% misalignment`}
                        onClick={() => handleAdjustmentToggle(adj.dimension)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                          border: 'none',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          fontFamily: 'inherit',
                        }}
                      >
                        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                          <AlertTriangle size={16} color={misColor} />
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                            {adj.dimension}
                          </Text>
                        </Box>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                          <Box style={{
                            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                            borderRadius: badgeRadius,
                            backgroundColor: `${misColor}15`,
                            color: misColor,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                          }}>
                            {n(adj.misalignment) > 0 ? '+' : ''}{(n(adj.misalignment) * 100).toFixed(0)}%
                          </Box>
                          {isExpanded ? <ChevronUp size={16} color={tokens.colors.neutral[400]} /> : <ChevronDown size={16} color={tokens.colors.neutral[400]} />}
                        </Box>
                      </button>

                      {isExpanded && (
                        <Box id={`adj-detail-${adj.dimension}`} role="region" aria-label={`Adjustment details for ${adj.dimension}`} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                          <Box style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[2], padding: tokens.spacing[3], backgroundColor: tokens.colors.warningScale[50], borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}` }}>
                            <Lightbulb size={16} color={tokens.colors.warningScale[600]} style={{ flexShrink: 0, marginTop: tokens.spacing[1] }} />
                            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                              <Text style={{ ...sectionHeaderStyle, display: 'block', color: tokens.colors.warningScale[700], marginBottom: tokens.spacing[1] }}>
                                Suggested Tweak
                              </Text>
                              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], lineHeight: tokens.typography.lineHeight.relaxed }}>
                                {adj.suggestedTweak}
                              </Text>
                            </Box>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  );
                })
              ) : (
                <Box style={createEmptyStateStyle(tokens)}>
                  <CheckCircle size={32} color={tokens.colors.successScale[400]} style={{ marginBottom: tokens.spacing[2] }} />
                  <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                    No adjustments needed. Human and AI scoring are well aligned.
                  </Text>
                </Box>
              )}
            </Stack>
          )}
        </Box>
      </Box>
    );
  },
});
