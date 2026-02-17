'use client';

/**
 * BhCalibrationSample - Compact Preset
 * Summary card with overall scores, agreement rate, and top disagreements.
 * Designed for sidebar or widget placement. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Scale, User, Bot, Check, X, ChevronRight,
  AlertTriangle, Target,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createIconContainerStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
} from '../../../helpers';
import type {
  BhCalibrationSampleProps,
  CalibrationSample,
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

const MOCK_SAMPLE: CalibrationSample = {
  id: 'cal-1',
  scorableId: 'sc-1',
  candidateName: 'Sarah Johnson',
  dimensions: [
    { dimensionName: 'Technical Depth', humanScore: 4.2, aiScore: 3.8, deviation: -0.4, maxScore: 5, weight: 0.3, agreed: true },
    { dimensionName: 'Problem Solving', humanScore: 3.5, aiScore: 4.1, deviation: 0.6, maxScore: 5, weight: 0.25, agreed: false },
    { dimensionName: 'Communication', humanScore: 4.0, aiScore: 4.2, deviation: 0.2, maxScore: 5, weight: 0.2, agreed: true },
    { dimensionName: 'Code Quality', humanScore: 3.0, aiScore: 4.5, deviation: 1.5, maxScore: 5, weight: 0.15, agreed: false },
    { dimensionName: 'Culture Fit', humanScore: 4.5, aiScore: 4.3, deviation: -0.2, maxScore: 5, weight: 0.1, agreed: true },
  ],
  overallHumanScore: 3.8,
  overallAiScore: 4.1,
  overallDeviation: 0.3,
  agreementRate: 0.6,
  status: 'pending',
};

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhCalibrationSample = createPreset<BhCalibrationSampleProps>({
  name: 'BhCalibrationSample.Compact',
  render: (ctx: PresetContext<BhCalibrationSampleProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      sample: rawSample = MOCK_SAMPLE,
      onSubmitReview,
      className,
      style,
    } = props;

    const sample = Array.isArray(rawSample) ? rawSample : MOCK_SAMPLE;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    /* Top disagreements: sorted by absolute deviation descending, only non-agreed */
    const topDisagreements = useMemo(() => {
      return [...(sample.dimensions ?? [])]
        .filter((d) => !d.agreed)
        .sort((a, b) => Math.abs(n(b.deviation)) - Math.abs(n(a.deviation)))
        .slice(0, 3);
    }, [sample.dimensions]);

    const agreementPct = Math.round(n(sample.agreementRate) * 100);

    return (
      <Box
        className={className}
        style={{
          ...card,
          width: '100%',
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Scale size={16} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Calibration
            </Text>
          </Box>
          <Box style={{
            ...createBadgeStyle(t, getStatusBadgeKey(sample.status!)),
            borderRadius: badgeRadius,
            padding: `1px ${t.spacing[2]}px`,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs }}>{getStatusLabel(sample.status!)}</Text>
          </Box>
        </Box>

        {/* Candidate name */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Text style={{
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.semibold,
            color: t.colors.neutral[900],
          }}>
            {sample.candidateName}
          </Text>
        </Box>

        {/* Overall scores row */}
        <Box style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          {/* Human Score */}
          <Box style={{ textAlign: 'center' }} role="status" aria-label={`Human score: ${n(sample.overallHumanScore).toFixed(1)}`}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginBottom: t.spacing[1] }}>
              <User size={10} color={t.colors.infoScale[500]} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Human</Text>
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.lg,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.neutral[900],
              display: 'block',
            }}>
              {n(sample.overallHumanScore).toFixed(1)}
            </Text>
          </Box>

          {/* AI Score */}
          <Box style={{ textAlign: 'center' }} role="status" aria-label={`AI score: ${n(sample.overallAiScore).toFixed(1)}`}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginBottom: t.spacing[1] }}>
              <Bot size={10} color={t.colors.primaryScale[500]} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>AI</Text>
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.lg,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.neutral[900],
              display: 'block',
            }}>
              {n(sample.overallAiScore).toFixed(1)}
            </Text>
          </Box>

          {/* Agreement */}
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], textAlign: 'center' }} role="status" aria-label={`Agreement rate: ${agreementPct}%`}>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'block', marginBottom: t.spacing[1] }}>
              Agreement
            </Text>
            <Text style={{
              fontSize: t.typography.fontSize.lg,
              fontWeight: t.typography.fontWeight.bold,
              color: getAgreementColor(n(sample.agreementRate), t),
              display: 'block',
            }}>
              {agreementPct}%
            </Text>
          </Box>
        </Box>

        {/* Agreement progress bar */}
        <Box style={{
          display: 'flex',
          height: 4,
          overflow: 'hidden',
        }} role="img" aria-label={`Agreement: ${agreementPct}%`}>
          <Box style={{
            flex: n(sample.agreementRate),
            backgroundColor: t.colors.successScale[500],
            transition: 'flex 0.4s ease',
          }} />
          <Box style={{
            flex: 1 - n(sample.agreementRate),
            backgroundColor: t.colors.errorScale[300],
            transition: 'flex 0.4s ease',
          }} />
        </Box>

        {/* Top Disagreements */}
        {topDisagreements.length > 0 && (
          <Box>
            <Box style={{
              padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
              borderBottom: `1px solid ${t.colors.neutral[50]}`,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <AlertTriangle size={10} color={t.colors.warningScale[500]} />
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.semibold,
                  color: t.colors.neutral[500],
                  textTransform: ptypo.labelTransform,
                  letterSpacing: ptypo.labelLetterSpacing,
                }}>
                  Top Disagreements
                </Text>
              </Box>
            </Box>

            <Box role="list" aria-label="Top disagreements">
              {topDisagreements.map((dim) => {
                const devColor = getDeviationColor(n(dim.deviation), t);
                return (
                  <Box
                    key={dim.dimensionName}
                    role="listitem"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: t.spacing[2],
                      padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                      borderBottom: `1px solid ${t.colors.neutral[50]}`,
                      backgroundColor: t.colors.common.white,
                    }}
                  >
                    <X size={10} color={t.colors.errorScale[400]} />
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1, minWidth: 0 }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.medium,
                        color: t.colors.neutral[800],
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {dim.dimensionName}
                      </Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                        H: {n(dim.humanScore).toFixed(1)} | AI: {n(dim.aiScore).toFixed(1)}
                      </Text>
                    </Box>
                    <Box style={{
                      padding: `0px ${t.spacing[1]}px`,
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
                );
              })}
            </Box>
          </Box>
        )}

        {topDisagreements.length === 0 && (
          <Box style={{
            padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: t.spacing[2],
          }}>
            <Check size={14} color={t.colors.successScale[500]} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.successScale[600] }}>
              Full agreement across all dimensions
            </Text>
          </Box>
        )}
      </Box>
    );
  },
});
