'use client';

/**
 * BhCalibrationSample - Review Preset
 * Full calibration review with header scores, dimension comparison table,
 * agreement gauge, expandable notes, score adjustment panel, and submit footer.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback} from 'react';
import {
  Scale, User, Bot, Check, X, ChevronDown, ChevronUp,
  Send, AlertTriangle, Target, Percent, FileText,
  Edit3, RotateCcw,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,
  createProgressBarStyle,
  getAccentAwareLayout,

  createDividerStyle,
  formatAbbreviated,
} from '../../../helpers';
import type {
  BhCalibrationSampleProps,
  CalibrationSample,
  CalibrationSampleView,
  DimensionComparison,
  CalibrationSampleStatus,
} from '../../core';
import { n } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getDeviationColor(deviation: number, t: DesignTokens): string {
  const abs = Math.abs(deviation);
  if (abs <= 0.5) return t.colors.successScale[600];
  if (abs <= 1.0) return t.colors.warningScale[500];
  if (abs <= 1.5) return t.colors.warningScale[600];
  return t.colors.errorScale[600];
}

function getDeviationBg(deviation: number, t: DesignTokens): string {
  const abs = Math.abs(deviation);
  if (abs <= 0.5) return t.colors.successScale[50];
  if (abs <= 1.0) return t.colors.warningScale[50];
  return t.colors.errorScale[50];
}

function getAgreementColor(rate: number, t: DesignTokens): string {
  if (rate >= 0.8) return t.colors.successScale[600];
  if (rate >= 0.6) return t.colors.warningScale[600];
  return t.colors.errorScale[600];
}

function getAgreementBg(rate: number, t: DesignTokens): string {
  if (rate >= 0.8) return t.colors.successScale[50];
  if (rate >= 0.6) return t.colors.warningScale[50];
  return t.colors.errorScale[50];
}

function getStatusBadgeKey(status: CalibrationSampleStatus): 'secondary' | 'success' | 'warning' {
  switch (status) {
    case 'pending': return 'secondary';
    case 'reviewed': return 'success';
    case 'adjusted': return 'warning';
  }
}

function getStatusLabel(status: CalibrationSampleStatus): string {
return (status || '').charAt(0).toUpperCase() + (status || '').slice(1);
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Review Preset                                                      */
/* ================================================================== */

export const ReviewBhCalibrationSample = createPreset<BhCalibrationSampleProps>({
  name: 'BhCalibrationSample.Review',
  render: (ctx: PresetContext<BhCalibrationSampleProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      sample: rawSample = {} as Partial<CalibrationSampleView>,
      onAdjustScore,
      onSubmitReview,
      onDismiss,
      loading,
      className,
      style,
    } = props;

    const sample = rawSample as Partial<CalibrationSampleView>;

    const [expandedDimension, setExpandedDimension] = useState<string | null>(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [adjustments, setAdjustments] = useState<Record<string, number>>({});

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const toggleDimension = useCallback((name: string) => {
      setExpandedDimension((prev) => prev === name ? null : name);
    }, []);

    const handleAdjust = useCallback((dimName: string, newScore: number) => {
      const clamped = Math.max(0, Math.min(5, newScore));
      setAdjustments((prev) => ({ ...prev, [dimName]: clamped }));
      onAdjustScore?.(dimName, clamped);
    }, [onAdjustScore]);

    const handleSubmit = useCallback(() => {
      onSubmitReview?.(sample.id ?? '', reviewNotes);
    }, [onSubmitReview, sample.id, reviewNotes]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    /* Agreement gauge arc */
    const gaugeSize = 100;
    const gaugeR = 38;
    const gaugeCircumference = 2 * Math.PI * gaugeR;
    const gaugeFill = n(sample.agreementRate) * gaugeCircumference;
    const divider = useMemo(() => createDividerStyle(t), [t]);
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    return (
      <Box
        className={className}
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: t.colors.neutral[50],
          fontFamily: 'inherit',
          overflow: 'auto',
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[6]}px ${t.spacing[7]}px`,
          backgroundColor: t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
              <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[50] })}>
                <Scale size={22} color={t.colors.primaryScale[600]} />
              </Box>
              <Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.xl,
                    fontWeight: ptypo.headingWeight,
                    color: t.colors.neutral[900],
                    letterSpacing: ptypo.headingLetterSpacing,
                  }}>
                    {sample.candidateName}
                  </Text>
                  <Box style={{
                    ...createBadgeStyle(t, getStatusBadgeKey(sample.status ?? 'pending')),
                    borderRadius: badgeRadius,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs }}>
                      {getStatusLabel(sample.status ?? 'pending')}
                    </Text>
                  </Box>
                </Box>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], marginTop: t.spacing[1] }}>
                  Calibration review - Human vs AI score comparison
                </Text>
              </Box>
            </Box>
            {onDismiss && (
              <button
                onClick={onDismiss}
                aria-label="Dismiss calibration sample"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: t.borderRadius.md,
                  border: `1px solid ${t.colors.neutral[200]}`,
                  backgroundColor: t.colors.common.white, color: t.colors.neutral[500],
                  cursor: 'pointer', padding: 0,
                }}
              >
                <X size={16} />
              </button>
            )}
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>

          {/* Overall Scores + Agreement Rate */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: t.spacing[4],
            marginBottom: t.spacing[7],
          }}>
            {/* Human Score */}
            <Box style={{ ...card, ...hoverStyles.base, ...animStyle(0) }} role="status" aria-label={`Overall human score: ${n(sample.overallHumanScore).toFixed(1)} out of 5`}>
              {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[3] }}>
                <Box style={createIconContainerStyle(t, { size: 36, color: t.colors.infoScale[50] })}>
                  <User size={18} color={t.colors.infoScale[600]} />
                </Box>
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  color: t.colors.neutral[500],
                  textTransform: ptypo.labelTransform,
                  letterSpacing: ptypo.labelLetterSpacing,
                }}>
                  Human Score
                </Text>
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize['2xl'],
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.neutral[900],
                display: 'block',
              }}>
                {n(sample.overallHumanScore).toFixed(1)}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                out of 5.0
              </Text>
            </Box>

            {/* AI Score */}
            <Box style={{ ...card, ...hoverStyles.base, ...animStyle(1) }} role="status" aria-label={`Overall AI score: ${n(sample.overallAiScore).toFixed(1)} out of 5`}>
              {accentBar && <Box style={accentBar} />}
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[3] }}>
                <Box style={createIconContainerStyle(t, { size: 36, color: t.colors.primaryScale[50] })}>
                  <Bot size={18} color={t.colors.primaryScale[600]} />
                </Box>
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  color: t.colors.neutral[500],
                  textTransform: ptypo.labelTransform,
                  letterSpacing: ptypo.labelLetterSpacing,
                }}>
                  AI Score
                </Text>
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize['2xl'],
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.neutral[900],
                display: 'block',
              }}>
                {n(sample.overallAiScore).toFixed(1)}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                out of 5.0
              </Text>
            </Box>

            {/* Overall Deviation */}
            <Box style={{ ...card, ...hoverStyles.base, ...animStyle(2) }} role="status" aria-label={`Overall deviation: ${n(sample.overallDeviation).toFixed(2)}`}>
              {accentBar && <Box style={accentBar} />}
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[3] }}>
                <Box style={createIconContainerStyle(t, { size: 36, color: getDeviationBg(n(sample.overallDeviation), t) })}>
                  <Target size={18} color={getDeviationColor(n(sample.overallDeviation), t)} />
                </Box>
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  color: t.colors.neutral[500],
                  textTransform: ptypo.labelTransform,
                  letterSpacing: ptypo.labelLetterSpacing,
                }}>
                  Deviation
                </Text>
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize['2xl'],
                fontWeight: t.typography.fontWeight.bold,
                color: getDeviationColor(n(sample.overallDeviation), t),
                display: 'block',
              }}>
                {n(sample.overallDeviation) >= 0 ? '+' : ''}{n(sample.overallDeviation).toFixed(2)}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                AI - Human
              </Text>
            </Box>

            {/* Agreement Rate Gauge */}
            <Box style={{ ...card, ...hoverStyles.base, ...animStyle(3) }} role="status" aria-label={`Agreement rate: ${Math.round(n(sample.agreementRate) * 100)}%`}>
              {accentBar && <Box style={accentBar} />}
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[3] }}>
                <Box style={createIconContainerStyle(t, { size: 36, color: getAgreementBg(n(sample.agreementRate), t) })}>
                  <Percent size={18} color={getAgreementColor(n(sample.agreementRate), t)} />
                </Box>
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  color: t.colors.neutral[500],
                  textTransform: ptypo.labelTransform,
                  letterSpacing: ptypo.labelLetterSpacing,
                }}>
                  Agreement
                </Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                <Box style={{ position: 'relative', width: gaugeSize, height: gaugeSize }}>
                  <svg
                    width={gaugeSize}
                    height={gaugeSize}
                    viewBox={`0 0 ${gaugeSize} ${gaugeSize}`}
                    role="img"
                    aria-hidden="true"
                    style={{ transform: 'rotate(-90deg)' }}
                  >
                    <circle
                      cx={gaugeSize / 2}
                      cy={gaugeSize / 2}
                      r={gaugeR}
                      fill="none"
                      stroke={t.colors.neutral[100]}
                      strokeWidth={8}
                    />
                    <circle
                      cx={gaugeSize / 2}
                      cy={gaugeSize / 2}
                      r={gaugeR}
                      fill="none"
                      stroke={getAgreementColor(n(sample.agreementRate), t)}
                      strokeWidth={8}
                      strokeDasharray={`${gaugeFill} ${gaugeCircumference}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 0.6s ease' }}
                    />
                  </svg>
                  <Box style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{
                      fontSize: t.typography.fontSize.lg,
                      fontWeight: t.typography.fontWeight.bold,
                      color: getAgreementColor(n(sample.agreementRate), t),
                    }}>
                      {Math.round(n(sample.agreementRate) * 100)}%
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Per-Dimension Comparison Table */}
          <Box style={{ ...card, ...animStyle(4), padding: 0 }}>
            <Box style={{
              padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
              borderBottom: `1px solid ${t.colors.neutral[100]}`,
              backgroundColor: t.colors.neutral[50],
              borderRadius: `${t.borderRadius.lg} ${t.borderRadius.lg} 0 0`,
            }}>
              <Text style={{
                ...sectionLabel,
              }}>
                Dimension Comparison
              </Text>
            </Box>

            {/* Column headers */}
            <Box style={{
              display: 'grid',
              gridTemplateColumns: '2fr 0.5fr 1fr 1fr 0.8fr 0.5fr',
              gap: t.spacing[2],
              padding: `${t.spacing[2]}px ${t.spacing[5]}px`,
              borderBottom: `1px solid ${t.colors.neutral[100]}`,
              backgroundColor: t.colors.neutral[50] ?? t.colors.common.white,
            }}>
              {['Dimension', 'Weight', 'Human', 'AI', 'Deviation', ''].map((header) => (
                <Text key={header} style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.semibold,
                  color: t.colors.neutral[500],
                  textTransform: ptypo.labelTransform,
                  letterSpacing: ptypo.labelLetterSpacing,
                }}>
                  {header}
                </Text>
              ))}
            </Box>

            <Box role="list" aria-label="Dimension comparisons">
              {(sample.dimensions ?? []).map((dim) => {
                const isExpanded = expandedDimension === dim.dimensionName;
                const adjustedScore = (adjustments as Record<string, number | undefined>)[dim.dimensionName ?? ''];
                const humanBarPct = (n(dim.humanScore) / (n(dim.maxScore) || 1)) * 100;
                const aiBarPct = (n(dim.aiScore) / (n(dim.maxScore) || 1)) * 100;
                const devColor = getDeviationColor(n(dim.deviation), t);

                return (
                  <Box key={dim.dimensionName} role="listitem">
                    {/* Main row */}
                    <Box
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 0.5fr 1fr 1fr 0.8fr 0.5fr',
                        gap: t.spacing[2],
                        padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
                        borderBottom: `1px solid ${t.colors.neutral[50]}`,
                        cursor: 'pointer',
                        transition: `background-color ${t.motion.hover}`,
                      }}
                      onClick={() => toggleDimension((dim.dimensionName ?? ''))}
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      aria-label={`${dim.dimensionName}: Human ${n(dim.humanScore)}, AI ${n(dim.aiScore)}, deviation ${n(dim.deviation).toFixed(1)}`}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleDimension((dim.dimensionName ?? ''));
                        }
                      }}
                    >
                      {/* Dimension Name */}
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        {isExpanded ? <ChevronUp size={14} color={t.colors.neutral[400]} /> : <ChevronDown size={14} color={t.colors.neutral[400]} />}
                        <Text style={{
                          fontSize: t.typography.fontSize.sm,
                          fontWeight: t.typography.fontWeight.medium,
                          color: t.colors.neutral[800],
                        }}>
                          {dim.dimensionName}
                        </Text>
                      </Box>

                      {/* Weight */}
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'flex', alignItems: 'center' }}>
                        {Math.round(n(dim.weight) * 100)}%
                      </Text>

                      {/* Human Score Bar */}
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Box style={{
                          flex: 1,
                          height: 8,
                          borderRadius: t.borderRadius.full,
                          backgroundColor: t.colors.neutral[100],
                          overflow: 'hidden',
                        }}>
                          <Box style={{
                            height: '100%',
                            width: `${humanBarPct}%`,
                            borderRadius: t.borderRadius.full,
                            backgroundColor: t.colors.infoScale[500],
                            transition: 'width 0.4s ease',
                          }} />
                        </Box>
                        <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[700], minWidth: 24 }}>
                          {n(dim.humanScore).toFixed(1)}
                        </Text>
                      </Box>

                      {/* AI Score Bar */}
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Box style={{
                          flex: 1,
                          height: 8,
                          borderRadius: t.borderRadius.full,
                          backgroundColor: t.colors.neutral[100],
                          overflow: 'hidden',
                        }}>
                          <Box style={{
                            height: '100%',
                            width: `${aiBarPct}%`,
                            borderRadius: t.borderRadius.full,
                            backgroundColor: t.colors.primaryScale[500],
                            transition: 'width 0.4s ease',
                          }} />
                        </Box>
                        <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[700], minWidth: 24 }}>
                          {n(dim.aiScore).toFixed(1)}
                        </Text>
                      </Box>

                      {/* Deviation */}
                      <Box style={{ display: 'flex', alignItems: 'center' }}>
                        <Box style={{
                          padding: `1px ${t.spacing[2]}px`,
                          borderRadius: badgeRadius,
                          backgroundColor: getDeviationBg(n(dim.deviation), t),
                        }}>
                          <Text style={{
                            fontSize: t.typography.fontSize.xs,
                            fontWeight: t.typography.fontWeight.bold,
                            color: devColor,
                          }}>
                            {n(dim.deviation) >= 0 ? '+' : ''}{n(dim.deviation).toFixed(1)}
                          </Text>
                        </Box>
                      </Box>

                      {/* Agreement Icon */}
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {dim.agreed ? (
                          <Check size={16} color={t.colors.successScale[500]} aria-label="Agreed" />
                        ) : (
                          <X size={16} color={t.colors.errorScale[500]} aria-label="Disagreed" />
                        )}
                      </Box>
                    </Box>

                    {/* Expanded notes section */}
                    {isExpanded && (
                      <Box style={{
                        padding: `${t.spacing[3]}px ${t.spacing[5]}px ${t.spacing[4]}px`,
                        backgroundColor: t.colors.neutral[50],
                        borderBottom: `1px solid ${t.colors.neutral[100]}`,
                      }}>
                        <Box style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: t.spacing[4],
                          marginBottom: t.spacing[3],
                        }}>
                          {/* Human Notes */}
                          <Box>
                            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[2] }}>
                              <User size={12} color={t.colors.infoScale[500]} />
                              <Text style={{
                                fontSize: t.typography.fontSize.xs,
                                fontWeight: t.typography.fontWeight.semibold,
                                color: t.colors.infoScale[700],
                                textTransform: ptypo.labelTransform,
                              }}>
                                Human Notes
                              </Text>
                            </Box>
                            <Text style={{
                              fontSize: t.typography.fontSize.sm,
                              color: t.colors.neutral[600],
                              lineHeight: 1.5,
                            }}>
                              {dim.humanNotes || 'No notes provided'}
                            </Text>
                          </Box>

                          {/* AI Notes */}
                          <Box>
                            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[2] }}>
                              <Bot size={12} color={t.colors.primaryScale[500]} />
                              <Text style={{
                                fontSize: t.typography.fontSize.xs,
                                fontWeight: t.typography.fontWeight.semibold,
                                color: t.colors.primaryScale[700],
                                textTransform: ptypo.labelTransform,
                              }}>
                                AI Notes
                              </Text>
                            </Box>
                            <Text style={{
                              fontSize: t.typography.fontSize.sm,
                              color: t.colors.neutral[600],
                              lineHeight: 1.5,
                            }}>
                              {dim.aiNotes || 'No notes provided'}
                            </Text>
                          </Box>
                        </Box>

                        {/* Score Adjustment */}
                        <Box style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: t.spacing[3],
                          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                          backgroundColor: t.colors.common.white,
                          borderRadius: t.borderRadius.md,
                          border: `1px solid ${t.colors.neutral[200]}`,
                        }}>
                          <Edit3 size={14} color={t.colors.neutral[500]} />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                            Adjust score:
                          </Text>
                          <input
                            type="number"
                            min={0}
                            max={dim.maxScore}
                            step={0.1}
                            value={adjustedScore !== undefined ? adjustedScore : ''}
                            placeholder={n(dim.aiScore).toFixed(1)}
                            onChange={(e) => handleAdjust((dim.dimensionName ?? ''), parseFloat(e.target.value) || 0)}
                            aria-label={`Adjust score for ${dim.dimensionName}`}
                            style={{
                              width: 64,
                              padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                              borderRadius: t.borderRadius.sm,
                              border: `1px solid ${t.colors.neutral[300]}`,
                              fontSize: t.typography.fontSize.sm,
                              fontFamily: 'inherit',
                              color: t.colors.neutral[900],
                              backgroundColor: t.colors.common.white,
                              outline: 'none',
                            }}
                          />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                            / {dim.maxScore}
                          </Text>
                          {adjustedScore !== undefined && (
                            <button
                              onClick={() => {
                                setAdjustments((prev) => {
                                  const next = { ...prev };
                                  delete (next as Record<string, any>)[dim.dimensionName ?? ''];
                                  return next;
                                });
                              }}
                              aria-label="Reset adjustment"
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 24, height: 24, borderRadius: t.borderRadius.sm,
                                border: `1px solid ${t.colors.neutral[200]}`,
                                backgroundColor: t.colors.common.white, color: t.colors.neutral[400],
                                cursor: 'pointer', padding: 0,
                              }}
                            >
                              <RotateCcw size={12} />
                            </button>
                          )}
                        </Box>
                      </Box>
                    )}
                  </Box>
                );
              })}

              {(sample.dimensions ?? []).length === 0 && (
                <Box style={createEmptyStateStyle(t)}>
                  <Scale size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                    No dimensions to compare
                  </Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Submit Review Footer */}
          <Box style={{
            ...card,
            ...animStyle(5),
            marginTop: t.spacing[6],
          }}>
            <Text style={{ ...sectionLabel, marginBottom: t.spacing[3] }}>
              Submit Review
            </Text>
            <Box style={{ marginBottom: t.spacing[4] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[2] }}>
                <FileText size={12} color={t.colors.neutral[500]} />
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.medium,
                  color: t.colors.neutral[600],
                  textTransform: ptypo.labelTransform,
                }}>
                  Review Notes
                </Text>
              </Box>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes about this calibration review..."
                aria-label="Review notes"
                rows={3}
                style={{
                  width: '100%',
                  padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                  borderRadius: t.borderRadius.md,
                  border: `1px solid ${t.colors.neutral[300]}`,
                  fontSize: t.typography.fontSize.sm,
                  fontFamily: 'inherit',
                  color: t.colors.neutral[900],
                  backgroundColor: t.colors.common.white,
                  outline: 'none',
                  resize: 'vertical',
                  lineHeight: 1.5,
                  boxSizing: 'border-box',
                }}
              />
            </Box>

            {Object.keys(adjustments).length > 0 && (
              <Box style={{
                padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                backgroundColor: t.colors.warningScale[50],
                borderRadius: t.borderRadius.md,
                marginBottom: t.spacing[4],
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing[2],
              }}>
                <AlertTriangle size={14} color={t.colors.warningScale[600]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.warningScale[700] }}>
                  {Object.keys(adjustments).length} dimension(s) adjusted
                </Text>
              </Box>
            )}

            <Box style={{ display: 'flex', justifyContent: 'flex-end', gap: t.spacing[3] }}>
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  aria-label="Cancel review"
                  style={{
                    display: 'flex', alignItems: 'center', gap: t.spacing[2],
                    padding: `${t.spacing[2]}px ${t.spacing[5]}px`,
                    borderRadius: t.borderRadius.md,
                    border: `1px solid ${t.colors.neutral[300]}`,
                    backgroundColor: t.colors.common.white,
                    color: t.colors.neutral[600],
                    cursor: 'pointer',
                    fontSize: t.typography.fontSize.sm,
                    fontFamily: 'inherit',
                    fontWeight: t.typography.fontWeight.medium,
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={loading}
                aria-label="Submit review"
                style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[5]}px`,
                  borderRadius: t.borderRadius.md,
                  border: 'none',
                  backgroundColor: t.colors.primaryScale[600],
                  color: t.colors.common.white,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: t.typography.fontSize.sm,
                  fontFamily: 'inherit',
                  fontWeight: t.typography.fontWeight.semibold,
                  opacity: loading ? 0.6 : 1,
                  boxShadow: t.shadows.sm,
                  transition: `opacity ${t.motion.hover}`,
                }}
              >
                <Send size={14} />
                Submit Review
              </button>
            </Box>
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
