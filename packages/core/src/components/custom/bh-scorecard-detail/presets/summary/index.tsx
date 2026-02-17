'use client';

/**
 * BhScorecardDetail - Summary Preset
 * Compact overview card showing key scorecard data at a glance.
 * Top/bottom dimensions, overall score bar, and metadata.
 * Follows same pattern as panel/compact presets using actual core types.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Target, TrendingUp, TrendingDown, CheckCircle,
  AlertCircle, Clock, User, ChevronRight, ChevronDown,
  Shield, FileText,
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
  formatDistanceToNow,
} from '../../../helpers';
import type {
  BhScorecardDetailProps,
  DimensionScore,
  ScorecardDetail,
} from '../../core';
import { n } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getScoreColor(score: number, maxScore: number, t: DesignTokens): string {
  const pct = score / maxScore;
  if (pct >= 0.8) return t.colors.successScale[500];
  if (pct >= 0.6) return t.colors.successScale[400];
  if (pct >= 0.4) return t.colors.warningScale[500];
  if (pct >= 0.2) return t.colors.warningScale[600];
  return t.colors.errorScale[500];
}

function getConfidenceColor(confidence: number, t: DesignTokens): string {
  if (confidence >= 0.7) return t.colors.successScale[500];
  if (confidence >= 0.4) return t.colors.warningScale[500];
  return t.colors.errorScale[500];
}

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.5) return 'Medium';
  return 'Low';
}

function getStatusBadgeKey(status: string): 'primary' | 'warning' | 'success' {
  switch (status) {
    case 'calibrated': return 'success';
    case 'submitted': return 'primary';
    case 'draft':
    default: return 'warning';
  }
}

function getStatusLabel(status: string): string {
  return (status || '').charAt(0).toUpperCase() + (status || '').slice(1);
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_SCORECARD: ScorecardDetail = {
  id: 'sc-1',
  scorableId: 'int-1',
  candidateName: 'Sarah Johnson',
  jobTitle: 'Senior Frontend Engineer',
  overallScore: 4.2,
  maxScore: 5,
  dimensions: [
    { dimensionId: 'dim-1', dimensionName: 'Technical Knowledge', score: 4.5, maxScore: 5, weight: 0.25, confidence: 0.92, evidenceCount: 8 },
    { dimensionId: 'dim-2', dimensionName: 'Problem Solving', score: 4.0, maxScore: 5, weight: 0.20, confidence: 0.85, evidenceCount: 6 },
    { dimensionId: 'dim-3', dimensionName: 'Communication', score: 4.8, maxScore: 5, weight: 0.15, confidence: 0.90, evidenceCount: 5 },
    { dimensionId: 'dim-4', dimensionName: 'System Design', score: 3.5, maxScore: 5, weight: 0.20, confidence: 0.78, evidenceCount: 4 },
    { dimensionId: 'dim-5', dimensionName: 'Cultural Fit', score: 4.2, maxScore: 5, weight: 0.10, confidence: 0.88, evidenceCount: 3 },
    { dimensionId: 'dim-6', dimensionName: 'Leadership', score: 3.8, maxScore: 5, weight: 0.10, confidence: 0.72, evidenceCount: 2 },
  ],
  scoredBy: 'Alex Rivera',
  scoredAt: new Date(Date.now() - 3600000),
  calibrated: true,
  status: 'calibrated',
};

/* ================================================================== */
/*  Summary Preset                                                     */
/* ================================================================== */

export const SummaryBhScorecardDetail = createPreset<BhScorecardDetailProps>({
  name: 'BhScorecardDetail.Summary',
  render: (ctx: PresetContext<BhScorecardDetailProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      scorecard: rawScorecard = MOCK_SCORECARD,
      onDimensionClick,
      className,
      style,
    } = props;

    const scorecard = Array.isArray(rawScorecard) ? rawScorecard : MOCK_SCORECARD;

    const [expanded, setExpanded] = useState(false);
    const [hoveredDim, setHoveredDim] = useState<string | null>(null);


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const handleDimClick = useCallback((dimId: string) => {
      onDimensionClick?.(dimId);
    }, [onDimensionClick]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const dims = scorecard.dimensions ?? [];

    const sortedDims = useMemo(
      () => [...dims].sort((a: DimensionScore, b: DimensionScore) => n(b.score) - n(a.score)),
      [dims],
    );

    const topDims = sortedDims.slice(0, 3);
    const bottomDims = sortedDims.slice(-3).reverse();
    const displayDims = expanded ? sortedDims : sortedDims.slice(0, 5);

    const overallPct = (n(scorecard.overallScore) / (n(scorecard.maxScore) || 1)) * 100;
    const overallColor = getScoreColor(n(scorecard.overallScore), n(scorecard.maxScore) || 1, t);

    const avgConfidence = dims.length > 0
      ? dims.reduce((sum: number, d: DimensionScore) => sum + n(d.confidence), 0) / dims.length
      : 0;

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
          padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 36, color: t.colors.primaryScale[50] })}>
              <Target size={18} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[800],
              }}>
                {scorecard.candidateName}
              </Text>
              {scorecard.jobTitle && (
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  {scorecard.jobTitle}
                </Text>
              )}
            </Box>
          </Box>
          <Box style={{
            ...createBadgeStyle(t, getStatusBadgeKey((scorecard.status ?? ''))),
            borderRadius: badgeRadius,
            padding: `1px ${t.spacing[2]}px`,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs }}>{getStatusLabel((scorecard.status ?? ''))}</Text>
          </Box>
        </Box>

        {/* Overall Score */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
              Overall Score
            </Text>
            <Text style={{
              fontSize: t.typography.fontSize.lg,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.neutral[900],
            }}>
              {n(scorecard.overallScore).toFixed(1)}
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], fontWeight: t.typography.fontWeight.normal }}>
                /{n(scorecard.maxScore)}
              </Text>
            </Text>
          </Box>
          <Box style={{
            height: 6,
            borderRadius: t.borderRadius.full,
            backgroundColor: t.colors.neutral[100],
            overflow: 'hidden',
          }}>
            <Box style={{
              height: '100%',
              width: `${overallPct}%`,
              borderRadius: t.borderRadius.full,
              backgroundColor: overallColor,
              transition: 'width 0.6s ease',
            }} />
          </Box>
          {/* Confidence + Calibration */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginTop: t.spacing[2] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Shield size={12} color={getConfidenceColor(avgConfidence, t)} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                {getConfidenceLabel(avgConfidence)} ({Math.round(avgConfidence * 100)}%)
              </Text>
            </Box>
            {scorecard.calibrated ? (
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <CheckCircle size={12} color={t.colors.successScale[500]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.successScale[600] }}>Calibrated</Text>
              </Box>
            ) : (
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <AlertCircle size={12} color={t.colors.warningScale[500]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.warningScale[600] }}>Not Calibrated</Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Top / Bottom Strengths */}
        <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[5]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}` }}>
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[3] }}>
            {/* Top */}
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
              padding: t.spacing[3],
              backgroundColor: t.colors.successScale[50],
              borderRadius: t.borderRadius.lg,
              border: `1px solid ${t.colors.successScale[100]}`,
            }}>
              <Box style={{
                display: 'flex', alignItems: 'center', gap: t.spacing[1],
                marginBottom: t.spacing[2],
              }}>
                <TrendingUp size={12} color={t.colors.successScale[500]} />
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.semibold,
                  color: t.colors.successScale[600],
                  textTransform: ptypo.labelTransform,
                  letterSpacing: ptypo.labelLetterSpacing,
                }}>
                  Strongest
                </Text>
              </Box>
              {topDims.map((dim: DimensionScore) => (
                <Box
                  key={dim.dimensionId}
                  role="button"
                  tabIndex={0}
                  aria-label={`${dim.dimensionName}: ${n(dim.score)}/${n(dim.maxScore)}`}
                  onClick={() => handleDimClick((dim.dimensionId ?? ''))}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDimClick((dim.dimensionId ?? '')); } }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${t.spacing[1]}px 0`,
                    cursor: 'pointer',
                  }}
                >
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[700],
                    flex: 1,
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {dim.dimensionName}
                  </Text>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.bold,
                    color: t.colors.successScale[600],
                    marginLeft: t.spacing[2],
                  }}>
                    {n(dim.score).toFixed(1)}
                  </Text>
                </Box>
              ))}
            </Box>

            {/* Bottom */}
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
              padding: t.spacing[3],
              backgroundColor: t.colors.warningScale[50],
              borderRadius: t.borderRadius.lg,
              border: `1px solid ${t.colors.warningScale[100]}`,
            }}>
              <Box style={{
                display: 'flex', alignItems: 'center', gap: t.spacing[1],
                marginBottom: t.spacing[2],
              }}>
                <TrendingDown size={12} color={t.colors.warningScale[500]} />
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.semibold,
                  color: t.colors.warningScale[600],
                  textTransform: ptypo.labelTransform,
                  letterSpacing: ptypo.labelLetterSpacing,
                }}>
                  Needs Improvement
                </Text>
              </Box>
              {bottomDims.map((dim: DimensionScore) => (
                <Box
                  key={dim.dimensionId}
                  role="button"
                  tabIndex={0}
                  aria-label={`${dim.dimensionName}: ${n(dim.score)}/${n(dim.maxScore)}`}
                  onClick={() => handleDimClick((dim.dimensionId ?? ''))}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDimClick((dim.dimensionId ?? '')); } }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${t.spacing[1]}px 0`,
                    cursor: 'pointer',
                  }}
                >
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[700],
                    flex: 1,
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {dim.dimensionName}
                  </Text>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.bold,
                    color: t.colors.warningScale[600],
                    marginLeft: t.spacing[2],
                  }}>
                    {n(dim.score).toFixed(1)}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Dimension Bars */}
        <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[5]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}` }}>
          <Box style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: t.spacing[2],
          }}>
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.semibold,
              color: t.colors.neutral[500],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
            }}>
              Dimensions ({dims.length})
            </Text>
          </Box>
          {displayDims.map((dim: DimensionScore) => {
            const isHov = hoveredDim === dim.dimensionId;
            const barPct = (n(dim.score) / (n(dim.maxScore) || 1)) * 100;
            return (
              <Box key={dim.dimensionId}
                onMouseEnter={() => setHoveredDim((dim.dimensionId ?? null))}
                onMouseLeave={() => setHoveredDim(null)}
                onClick={() => handleDimClick((dim.dimensionId ?? ''))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  cursor: 'pointer',
                  padding: `${t.spacing[1]}px 0`,
                }}>
                <Text style={{
                  flex: 1, fontSize: t.typography.fontSize.xs,
                  color: isHov ? t.colors.primaryScale[600] : t.colors.neutral[600],
                  fontWeight: isHov ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                  minWidth: 0, transition: `color ${t.motion.hover}`,
                }}>
                  {dim.dimensionName}
                </Text>
                <Box style={{
                  width: 80, height: 6, backgroundColor: t.colors.neutral[100],
                  borderRadius: t.borderRadius.full, overflow: 'hidden', flexShrink: 0,
                }}>
                  <Box style={{
                    width: `${barPct}%`, height: '100%',
                    backgroundColor: getScoreColor(n(dim.score), n(dim.maxScore) || 1, t),
                    borderRadius: t.borderRadius.full,
                    transition: `width ${t.motion.hover}`,
                  }} />
                </Box>
                <Text style={{
                  fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold,
                  color: t.colors.neutral[700], minWidth: 24, textAlign: 'right' as const,
                }}>
                  {n(dim.score).toFixed(1)}
                </Text>
              </Box>
            );
          })}
          {dims.length > 5 && (
            <Box
              onClick={() => setExpanded(!expanded)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                cursor: 'pointer',
                padding: `${t.spacing[1]}px 0`,
                fontSize: t.typography.fontSize.xs,
                color: t.colors.primaryScale[600],
                fontWeight: t.typography.fontWeight.medium,
                marginTop: t.spacing[1],
              }}>
              {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>
                {expanded ? 'Show less' : `Show ${dims.length - 5} more`}
              </Text>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box style={{
          padding: `${t.spacing[2]}px ${t.spacing[5]}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <User size={12} color={t.colors.neutral[400]} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
              {scorecard.scoredBy}
            </Text>
            <Clock size={12} color={t.colors.neutral[400]} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
              {formatDistanceToNow(new Date(scorecard.scoredAt!), { addSuffix: true })}
            </Text>
          </Box>
          {scorecard.calibrated ? (
            <CheckCircle size={12} color={t.colors.successScale[500]} />
          ) : (
            <AlertCircle size={12} color={t.colors.warningScale[500]} />
          )}
        </Box>
      </Box>
    );
  },
});
