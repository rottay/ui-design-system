'use client';

/**
 * BhCalibrationView - Session Preset
 * Interactive calibration session with transcript review, scoring interface,
 * side-by-side comparison, alignment scatter plot, metrics dashboard,
 * and adjustment recommendations.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhCalibrationViewProps,
  CalibrationSample,
  AlignmentMetrics,
  DimensionAdjustment,
  TranscriptLine,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Target,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Loader2,
  MessageSquare,
  Sliders,
  Award,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Maximize2,
  Info,
  User,
  Bot,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helper: score-to-color interpolation                               */
/* ------------------------------------------------------------------ */
function getScoreColor(score: number, tokens: DesignTokens): string {
  if (score >= 80) return tokens.colors.successScale[500];
  if (score >= 60) return tokens.colors.successScale[300];
  if (score >= 40) return tokens.colors.warningScale[500];
  if (score >= 20) return tokens.colors.warningScale[300];
  return tokens.colors.errorScale[500];
}

function getAgreementColor(agreement: number, tokens: DesignTokens): string {
  if (agreement >= 0.8) return tokens.colors.successScale[500];
  if (agreement >= 0.6) return tokens.colors.successScale[300];
  if (agreement >= 0.4) return tokens.colors.warningScale[500];
  if (agreement >= 0.2) return tokens.colors.warningScale[300];
  return tokens.colors.errorScale[500];
}

function getAgreementBgColor(agreement: number, tokens: DesignTokens): string {
  if (agreement >= 0.8) return tokens.colors.successScale[50];
  if (agreement >= 0.6) return tokens.colors.successScale[100];
  if (agreement >= 0.4) return tokens.colors.warningScale[50];
  if (agreement >= 0.2) return tokens.colors.warningScale[100];
  return tokens.colors.errorScale[50];
}

function getDiffColor(diff: number, tokens: DesignTokens): { bg: string; text: string } {
  const absDiff = Math.abs(diff);
  if (absDiff <= 10) return { bg: tokens.colors.successScale[50], text: tokens.colors.successScale[700] };
  if (absDiff <= 25) return { bg: tokens.colors.warningScale[50], text: tokens.colors.warningScale[700] };
  return { bg: tokens.colors.errorScale[50], text: tokens.colors.errorScale[700] };
}

function getMisalignmentColor(misalignment: number, tokens: DesignTokens): string {
  const abs = Math.abs(misalignment);
  if (abs <= 0.1) return tokens.colors.successScale[500];
  if (abs <= 0.25) return tokens.colors.warningScale[500];
  return tokens.colors.errorScale[500];
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */
export const SessionBhCalibrationView = createPreset<BhCalibrationViewProps>({
  name: 'BhCalibrationView.Session',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhCalibrationViewProps>) => {
    const { Box, Stack } = primitives;

    const {
      rubricName,
      dimensions = [],
      samples = [],
      currentSampleIndex: currentSampleIndexProp,
      onSampleChange,
      humanScores: humanScoresProp,
      onHumanScoreChange,
      showAIScores: showAIScoresProp,
      onReveal,
      alignmentMetrics: alignmentMetricsProp,
      adjustments: adjustmentsProp,
      isSubmitting: isSubmittingProp,
      onSubmit,
      progress,
      className,
      style,
    } = props;

    /* ----- internal state ----- */
    const [internalCurrentSample, setInternalCurrentSample] = useState(currentSampleIndexProp ?? 0);
    const [internalHumanScores, setInternalHumanScores] = useState<Record<string, number>>(() => {
      const init: Record<string, number> = {};
      dimensions.forEach(d => { init[d] = 50; });
      return humanScoresProp ?? init;
    });
    const [internalShowAIScores, setInternalShowAIScores] = useState(showAIScoresProp ?? false);
    const [internalSamples] = useState<CalibrationSample[]>(samples);
    const [internalAlignmentMetrics] = useState<AlignmentMetrics | undefined>(alignmentMetricsProp);
    const [selectedDimension, setSelectedDimension] = useState<string | null>(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [internalIsSubmitting, setInternalIsSubmitting] = useState(isSubmittingProp ?? false);

    const currentSampleIndex = currentSampleIndexProp ?? internalCurrentSample;
    const humanScores = humanScoresProp ?? internalHumanScores;
    const showAIScores = showAIScoresProp ?? internalShowAIScores;
    const alignmentMetrics = alignmentMetricsProp ?? internalAlignmentMetrics;
    const adjustments = adjustmentsProp ?? [];
    const isSubmitting = isSubmittingProp ?? internalIsSubmitting;
    const currentSample = internalSamples[currentSampleIndex] ?? samples[currentSampleIndex];
    const totalSamples = progress?.total ?? samples.length;
    const completedSamples = progress?.completed ?? 0;

    const handleSampleChange = useCallback((idx: number) => {
      setInternalCurrentSample(idx);
      onSampleChange?.(idx);
    }, [onSampleChange]);

    const handleHumanScoreChange = useCallback((dimension: string, value: number) => {
      setInternalHumanScores(prev => ({ ...prev, [dimension]: value }));
      onHumanScoreChange?.(dimension, value);
    }, [onHumanScoreChange]);

    const handleReveal = useCallback(() => {
      setInternalShowAIScores(true);
      onReveal?.();
    }, [onReveal]);

    const handleSubmit = useCallback(() => {
      setInternalIsSubmitting(true);
      onSubmit?.();
    }, [onSubmit]);

    /* ----- glass support ----- */
    const glassCard = useMemo(() => createCardStyle(tokens, { glass: true, elevation: 'md' }), [tokens]);
    const surfaceBorder = useMemo(() => createSurfaceStyle(tokens, { elevation: 'sm' }), [tokens]);

    /* ----- alignment rate badge ----- */
    const alignmentRate = alignmentMetrics?.agreementRate ?? 0;
    const alignmentRatePct = Math.round(alignmentRate * 100);

    /* ----- scatter data ----- */
    const scatterPoints = useMemo(() => {
      if (!currentSample) return [];
      const human = currentSample.humanScores ?? humanScores;
      const ai = currentSample.aiScores ?? {};
      return dimensions
        .filter(d => human[d] !== undefined && ai[d] !== undefined)
        .map(d => ({ dimension: d, humanScore: human[d], aiScore: ai[d] }));
    }, [currentSample, humanScores, dimensions]);

    /* ----- heatmap data (per-dimension alignment) ----- */
    const perDimAlignment = alignmentMetrics?.perDimensionAlignment ?? [];

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, fontFamily: 'inherit', ...style }}>

        {/* ===== 1. Session Header ===== */}
        <Box style={{
          padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: tokens.colors.common.white,
          ...(tokens.surface.useGlass && tokens.glass ? { backdropFilter: tokens.glass.blur, WebkitBackdropFilter: tokens.glass.blur, backgroundColor: tokens.glass.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Box style={{
              width: tokens.spacing[10],
              height: tokens.spacing[10],
              borderRadius: tokens.borderRadius.lg,
              backgroundColor: tokens.colors.primaryScale[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Target size={20} color={tokens.colors.primaryScale[600]} />
            </Box>
            <Box>
              <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                {rubricName}
              </h2>
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                Calibration Session
              </span>
            </Box>
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            {/* Progress badge */}
            <Box style={{
              ...createBadgeStyle(tokens, 'info'),
              gap: tokens.spacing[1],
            }}>
              <BarChart3 size={12} />
              <span>{completedSamples}/{totalSamples} completed</span>
            </Box>

            {/* Status badge */}
            {showAIScores ? (
              <Box style={createBadgeStyle(tokens, 'success')}>
                <CheckCircle size={12} style={{ marginRight: tokens.spacing[1] }} />
                Revealed
              </Box>
            ) : (
              <Box style={createBadgeStyle(tokens, 'warning')}>
                <EyeOff size={12} style={{ marginRight: tokens.spacing[1] }} />
                Scoring
              </Box>
            )}

            {/* Alignment rate badge */}
            {alignmentMetrics && (
              <Box style={{
                ...createBadgeStyle(tokens, alignmentRatePct >= 70 ? 'success' : alignmentRatePct >= 50 ? 'warning' : 'error'),
                gap: tokens.spacing[1],
              }}>
                <TrendingUp size={12} />
                <span>{alignmentRatePct}% alignment</span>
              </Box>
            )}
          </Box>
        </Box>

        {/* ===== Main Content ===== */}
        <Box style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* ===== 2. Scoring Interface: Split Layout ===== */}
          <Box style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

            {/* --- Left: Transcript --- */}
            <Box style={{
              flex: 1,
              overflow: 'auto',
              borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Sample navigation */}
              <Box style={{
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: tokens.colors.neutral[50],
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <MessageSquare size={16} color={tokens.colors.neutral[500]} />
                  <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                    Sample {currentSampleIndex + 1} of {samples.length}
                  </span>
                </Box>
                <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                  <button
                    onClick={() => handleSampleChange(Math.max(0, currentSampleIndex - 1))}
                    disabled={currentSampleIndex === 0}
                    style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: tokens.colors.common.white,
                      color: currentSampleIndex === 0 ? tokens.colors.neutral[300] : tokens.colors.neutral[600],
                      cursor: currentSampleIndex === 0 ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => handleSampleChange(Math.min(samples.length - 1, currentSampleIndex + 1))}
                    disabled={currentSampleIndex === samples.length - 1}
                    style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: tokens.colors.common.white,
                      color: currentSampleIndex === samples.length - 1 ? tokens.colors.neutral[300] : tokens.colors.neutral[600],
                      cursor: currentSampleIndex === samples.length - 1 ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </Box>
              </Box>

              {/* Transcript lines */}
              <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[4] }}>
                {currentSample?.transcriptLines?.map((line: TranscriptLine, idx: number) => {
                  const isCandidate = line.speaker.toLowerCase() === 'candidate';
                  const isAI = line.speaker.toLowerCase() === 'ai' || line.speaker.toLowerCase() === 'agent';
                  return (
                    <Box
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: tokens.spacing[3],
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                        marginBottom: tokens.spacing[2],
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: idx % 2 === 0 ? tokens.colors.neutral[50] : tokens.colors.common.white,
                        transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                      }}
                    >
                      <Box style={{
                        width: tokens.spacing[8],
                        height: tokens.spacing[8],
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: isCandidate ? tokens.colors.primaryScale[100] : isAI ? tokens.colors.secondaryScale[100] : tokens.colors.neutral[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {isCandidate ? (
                          <User size={14} color={tokens.colors.primaryScale[600]} />
                        ) : isAI ? (
                          <Bot size={14} color={tokens.colors.secondaryScale[600]} />
                        ) : (
                          <User size={14} color={tokens.colors.neutral[500]} />
                        )}
                      </Box>
                      <Box style={{ flex: 1 }}>
                        <span style={{
                          display: 'block',
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: isCandidate ? tokens.colors.primaryScale[600] : isAI ? tokens.colors.secondaryScale[600] : tokens.colors.neutral[600],
                          marginBottom: tokens.spacing[1],
                          textTransform: 'capitalize',
                        }}>
                          {line.speaker}
                        </span>
                        <span style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[800],
                          lineHeight: tokens.typography.lineHeight.relaxed,
                        }}>
                          {line.text}
                        </span>
                      </Box>
                    </Box>
                  );
                })}
                {(!currentSample || !currentSample.transcriptLines?.length) && (
                  <Box style={{
                    textAlign: 'center',
                    padding: tokens.spacing[8],
                    color: tokens.colors.neutral[400],
                    fontSize: tokens.typography.fontSize.sm,
                  }}>
                    No transcript available for this sample.
                  </Box>
                )}
              </Box>
            </Box>

            {/* --- Right: Scoring Form --- */}
            <Box style={{
              width: 400,
              flexShrink: 0,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: tokens.colors.common.white,
            }}>
              {/* Scoring header */}
              <Box style={{
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                backgroundColor: tokens.colors.neutral[50],
              }}>
                <Sliders size={16} color={tokens.colors.neutral[500]} />
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                  Score Dimensions
                </span>
              </Box>

              {/* Per-dimension sliders */}
              <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[4] }}>
                <Stack direction="vertical" spacing="md">
                  {dimensions.map((dimension) => {
                    const value = humanScores[dimension] ?? 50;
                    const scoreColor = getScoreColor(value, tokens);
                    return (
                      <Box
                        key={dimension}
                        style={{
                          padding: tokens.spacing[3],
                          borderRadius: tokens.borderRadius.md,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${selectedDimension === dimension ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                          backgroundColor: selectedDimension === dimension ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                        }}
                        onClick={() => setSelectedDimension(selectedDimension === dimension ? null : dimension)}
                      >
                        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
                          <span style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[800],
                          }}>
                            {dimension}
                          </span>
                          <Box style={{
                            minWidth: tokens.spacing[10],
                            textAlign: 'center',
                            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.sm,
                            backgroundColor: `${scoreColor}15`,
                            color: scoreColor,
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.semibold,
                          }}>
                            {value}
                          </Box>
                        </Box>

                        {/* Slider track */}
                        <Box style={{ position: 'relative', height: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                          <Box style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '100%',
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: tokens.colors.neutral[200],
                          }} />
                          <Box style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: `${value}%`,
                            height: '100%',
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: scoreColor,
                            transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                          }} />
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={value}
                            onChange={(e) => handleHumanScoreChange(dimension, Number(e.target.value))}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: 'absolute',
                              top: -4,
                              left: 0,
                              width: '100%',
                              height: tokens.spacing[4],
                              opacity: 0,
                              cursor: 'pointer',
                              transition: `all ${tokens.motion.hover}`,
                              margin: 0,
                            }}
                          />
                        </Box>

                        {/* Scale labels */}
                        <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>0</span>
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>100</span>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>

                {/* Notes textarea */}
                <Box style={{ marginTop: tokens.spacing[4] }}>
                  <label style={{
                    display: 'block',
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: tokens.spacing[2],
                  }}>
                    Notes
                  </label>
                  <textarea
                    placeholder="Add notes about this scoring..."
                    style={{
                      width: '100%',
                      minHeight: 80,
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[800],
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                      e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                    }}
                  />
                </Box>
              </Box>

              {/* ===== 3. Submit Action ===== */}
              <Box style={{
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.neutral[50],
              }}>
                <button
                  onClick={showAIScores ? handleSubmit : handleReveal}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: 'none',
                    backgroundColor: isSubmitting ? tokens.colors.neutral[300] : tokens.colors.primaryScale[600],
                    color: tokens.colors.common.white,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: tokens.spacing[2],
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Submitting...
                    </>
                  ) : showAIScores ? (
                    <>
                      <Send size={16} />
                      Submit Calibration
                    </>
                  ) : (
                    <>
                      <Eye size={16} />
                      Submit & Reveal AI Scores
                    </>
                  )}
                </button>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ===== Bottom Panels (visible when AI scores revealed) ===== */}
        {showAIScores && (
          <Box style={{
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            overflow: 'auto',
            maxHeight: 500,
          }}>

            {/* ===== 4. Comparison Panel ===== */}
            <Box style={{
              padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                <Award size={18} color={tokens.colors.primaryScale[600]} />
                <h3 style={{ margin: 0, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                  Score Comparison
                </h3>
              </Box>

              <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(dimensions.length, 4)}, 1fr)`, gap: tokens.spacing[3] }}>
                {dimensions.map((dimension) => {
                  const humanVal = humanScores[dimension] ?? 0;
                  const aiVal = currentSample?.aiScores?.[dimension] ?? 0;
                  const diff = humanVal - aiVal;
                  const diffColors = getDiffColor(diff, tokens);
                  const isAgreed = Math.abs(diff) <= 10;

                  return (
                    <Box
                      key={dimension}
                      style={{
                        ...surfaceBorder,
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: isAgreed ? tokens.colors.successScale[50] : tokens.colors.errorScale[50],
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isAgreed ? tokens.colors.successScale[200] : tokens.colors.errorScale[200]}`,
                      }}
                    >
                      <span style={{
                        display: 'block',
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[600],
                        marginBottom: tokens.spacing[2],
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        {dimension}
                      </span>
                      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: tokens.spacing[2] }}>
                        <Box>
                          <span style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Human</span>
                          <span style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{humanVal}</span>
                        </Box>
                        <Box style={{ textAlign: 'center' }}>
                          <ArrowRight size={16} color={tokens.colors.neutral[400]} />
                        </Box>
                        <Box style={{ textAlign: 'right' }}>
                          <span style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>AI</span>
                          <span style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{aiVal}</span>
                        </Box>
                      </Box>
                      <Box style={{
                        textAlign: 'center',
                        padding: `${tokens.spacing[1]}px`,
                        borderRadius: tokens.borderRadius.sm,
                        backgroundColor: diffColors.bg,
                        color: diffColors.text,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                      }}>
                        {isAgreed ? (
                          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing[1] }}>
                            <CheckCircle size={10} /> Agreement
                          </Box>
                        ) : (
                          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing[1] }}>
                            <XCircle size={10} /> Diff: {diff > 0 ? '+' : ''}{diff}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* ===== 5. Alignment Scatter Plot ===== */}
            {scatterPoints.length > 0 && (
              <Box style={{
                padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                  <Maximize2 size={18} color={tokens.colors.secondaryScale[600]} />
                  <h3 style={{ margin: 0, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                    Alignment Scatter
                  </h3>
                </Box>

                <Box style={{ display: 'flex', justifyContent: 'center' }}>
                  <svg width={320} height={320} viewBox="0 0 320 320" style={{ overflow: 'visible' }}>
                    {/* Background grid */}
                    {[0, 25, 50, 75, 100].map(v => {
                      const pos = 20 + (v / 100) * 280;
                      return (
                        <g key={v}>
                          <line x1={20} y1={pos} x2={300} y2={pos} stroke={tokens.colors.neutral[100]} strokeWidth={1} />
                          <line x1={pos} y1={20} x2={pos} y2={300} stroke={tokens.colors.neutral[100]} strokeWidth={1} />
                          <text x={12} y={300 - (v / 100) * 280 + 4} fontSize={10} fill={tokens.colors.neutral[400]} textAnchor="end">{v}</text>
                          <text x={20 + (v / 100) * 280} y={314} fontSize={10} fill={tokens.colors.neutral[400]} textAnchor="middle">{v}</text>
                        </g>
                      );
                    })}

                    {/* Diagonal reference line */}
                    <line x1={20} y1={300} x2={300} y2={20} stroke={tokens.colors.neutral[300]} strokeWidth={1} strokeDasharray="6,4" />

                    {/* Axis labels */}
                    <text x={160} y={335} fontSize={11} fill={tokens.colors.neutral[600]} textAnchor="middle" fontWeight={tokens.typography.fontWeight.medium as number}>Human Score</text>
                    <text x={-160} y={8} fontSize={11} fill={tokens.colors.neutral[600]} textAnchor="middle" fontWeight={tokens.typography.fontWeight.medium as number} transform="rotate(-90)">AI Score</text>

                    {/* Scatter dots */}
                    {scatterPoints.map((point, idx) => {
                      const cx = 20 + (point.humanScore / 100) * 280;
                      const cy = 300 - (point.aiScore / 100) * 280;
                      const isOutlier = Math.abs(point.humanScore - point.aiScore) > 25;
                      return (
                        <g key={idx}>
                          {isOutlier && (
                            <circle cx={cx} cy={cy} r={14} fill="none" stroke={tokens.colors.errorScale[300]} strokeWidth={2} strokeDasharray="4,3" />
                          )}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={7}
                            fill={isOutlier ? tokens.colors.errorScale[400] : tokens.colors.primaryScale[500]}
                            stroke={tokens.colors.common.white}
                            strokeWidth={2}
                          />
                          <title>{point.dimension}: Human={point.humanScore}, AI={point.aiScore}</title>
                        </g>
                      );
                    })}
                  </svg>
                </Box>

                {/* Legend */}
                <Box style={{ display: 'flex', justifyContent: 'center', gap: tokens.spacing[4], marginTop: tokens.spacing[3] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <Box style={{ width: tokens.spacing[3], height: tokens.spacing[3], borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[500] }} />
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Aligned</span>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <Box style={{ width: tokens.spacing[3], height: tokens.spacing[3], borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.errorScale[400] }} />
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Outlier (&gt;25 diff)</span>
                  </Box>
                </Box>
              </Box>
            )}

            {/* ===== 6. Metrics Dashboard ===== */}
            {alignmentMetrics && (
              <Box style={{
                padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                  <BarChart3 size={18} color={tokens.colors.infoScale[600]} />
                  <h3 style={{ margin: 0, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                    Calibration Metrics
                  </h3>
                </Box>

                {/* Metric cards */}
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
                  {/* Agreement Rate */}
                  <Box style={{
                    ...glassCard,
                    padding: tokens.spacing[4],
                    textAlign: 'center',
                  }}>
                    <span style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: tokens.spacing[2] }}>
                      Agreement Rate
                    </span>
                    <span style={{
                      display: 'block',
                      fontSize: tokens.typography.fontSize['2xl'],
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: getAgreementColor(alignmentMetrics.agreementRate, tokens),
                    }}>
                      {Math.round(alignmentMetrics.agreementRate * 100)}%
                    </span>
                  </Box>

                  {/* MAE */}
                  <Box style={{
                    ...glassCard,
                    padding: tokens.spacing[4],
                    textAlign: 'center',
                  }}>
                    <span style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: tokens.spacing[2] }}>
                      Mean Abs. Error
                    </span>
                    <span style={{
                      display: 'block',
                      fontSize: tokens.typography.fontSize['2xl'],
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: alignmentMetrics.meanAbsoluteError <= 10 ? tokens.colors.successScale[600] : alignmentMetrics.meanAbsoluteError <= 20 ? tokens.colors.warningScale[600] : tokens.colors.errorScale[600],
                    }}>
                      {alignmentMetrics.meanAbsoluteError.toFixed(1)}
                    </span>
                  </Box>

                  {/* Confidence Correlation */}
                  <Box style={{
                    ...glassCard,
                    padding: tokens.spacing[4],
                    textAlign: 'center',
                  }}>
                    <span style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: tokens.spacing[2] }}>
                      Confidence Corr.
                    </span>
                    <span style={{
                      display: 'block',
                      fontSize: tokens.typography.fontSize['2xl'],
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: alignmentMetrics.confidenceCorrelation >= 0.7 ? tokens.colors.successScale[600] : alignmentMetrics.confidenceCorrelation >= 0.4 ? tokens.colors.warningScale[600] : tokens.colors.errorScale[600],
                    }}>
                      {alignmentMetrics.confidenceCorrelation.toFixed(2)}
                    </span>
                  </Box>
                </Box>

                {/* Per-dimension alignment heatmap */}
                {perDimAlignment.length > 0 && (
                  <Box>
                    <span style={{
                      display: 'block',
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500],
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: tokens.spacing[2],
                    }}>
                      Per-Dimension Alignment
                    </span>
                    <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(perDimAlignment.length, 6)}, 1fr)`, gap: tokens.spacing[2] }}>
                      {perDimAlignment.map((item, idx) => (
                        <Box
                          key={idx}
                          style={{
                            padding: tokens.spacing[2],
                            borderRadius: tokens.borderRadius.md,
                            backgroundColor: getAgreementBgColor(item.agreement, tokens),
                            textAlign: 'center',
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${getAgreementColor(item.agreement, tokens)}20`,
                          }}
                        >
                          <span style={{
                            display: 'block',
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[600],
                            marginBottom: tokens.spacing[1],
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {item.dimension}
                          </span>
                          <span style={{
                            display: 'block',
                            fontSize: tokens.typography.fontSize.lg,
                            fontWeight: tokens.typography.fontWeight.bold,
                            color: getAgreementColor(item.agreement, tokens),
                          }}>
                            {Math.round(item.agreement * 100)}%
                          </span>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {/* ===== 7. Adjustment Recommendations ===== */}
            {adjustments.length > 0 && (
              <Box style={{
                padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                  <Lightbulb size={18} color={tokens.colors.warningScale[600]} />
                  <h3 style={{ margin: 0, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                    Adjustment Recommendations
                  </h3>
                </Box>

                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: tokens.spacing[3] }}>
                  {adjustments.map((adj, idx) => (
                    <Box
                      key={idx}
                      style={{
                        ...glassCard,
                        padding: tokens.spacing[4],
                        borderLeft: `3px solid ${getMisalignmentColor(adj.misalignment, tokens)}`,
                      }}
                    >
                      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
                        <span style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[800],
                        }}>
                          {adj.dimension}
                        </span>
                        <Box style={{
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.sm,
                          backgroundColor: `${getMisalignmentColor(adj.misalignment, tokens)}15`,
                          color: getMisalignmentColor(adj.misalignment, tokens),
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                        }}>
                          {adj.misalignment > 0 ? '+' : ''}{(adj.misalignment * 100).toFixed(0)}%
                        </Box>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[2] }}>
                        <Info size={14} color={tokens.colors.neutral[400]} style={{ flexShrink: 0, marginTop: 2 }} />
                        <span style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[600],
                          lineHeight: tokens.typography.lineHeight.relaxed,
                        }}>
                          {adj.suggestedTweak}
                        </span>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  },
});
