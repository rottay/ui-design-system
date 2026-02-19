'use client';

/**
 * BhScorecardDetail - Compact Preset
 * Condensed scorecard card with overall score, top/bottom dimensions,
 * and key metadata. No charts. Designed for sidebar or list placement.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Target, TrendingUp, TrendingDown, CheckCircle,
  AlertCircle, Clock, User, ChevronRight,
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
  formatDistanceToNow,
  createPersonalityAccentBar,
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

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhScorecardDetail = createPreset<BhScorecardDetailProps>({
  name: 'BhScorecardDetail.Compact',
  render: (ctx: PresetContext<BhScorecardDetailProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      scorecard: rawScorecard = {} as Partial<ScorecardDetail>,
      onDimensionClick,
      className,
      style,
    } = props;

    const scorecard = rawScorecard as Partial<ScorecardDetail>;

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const handleDimClick = useCallback((dimId: string) => {
      onDimensionClick?.(dimId);
    }, [onDimensionClick]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const dims = scorecard.dimensions ?? props.dimensionScores ?? [];

    const sortedDims = useMemo(
      () => [...dims].sort((a, b) => n(b.score) - n(a.score)),
      [dims],
    );

    const topDims = sortedDims.slice(0, 2);
    const bottomDims = sortedDims.slice(-2).reverse();

    const overallPct = (n(scorecard.overallScore) / (n(scorecard.maxScore) || 1)) * 100;
    const overallColor = getScoreColor(n(scorecard.overallScore), n(scorecard.maxScore) || 1, t);

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
        {accentBar && <Box style={accentBar} />}
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
            <Target size={16} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              {scorecard.candidateName}
            </Text>
          </Box>
          <Box style={{
            ...createBadgeStyle(t, getStatusBadgeKey((scorecard.status ?? ''))),
            borderRadius: badgeRadius,
            padding: `1px ${t.spacing[2]}px`,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs }}>{getStatusLabel((scorecard.status ?? ''))}</Text>
          </Box>
        </Box>

        {/* Overall Score Bar */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
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
        </Box>

        {/* Top/Bottom Dimensions */}
        <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}` }}>
          {/* Top */}
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], marginBottom: t.spacing[3] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[2] }}>
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
            {topDims.map((dim) => (
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
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[2] }}>
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
            {bottomDims.map((dim) => (
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

        {/* Footer */}
        <Box style={{
          padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
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
