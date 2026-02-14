'use client';

/**
 * BhScorecardDetail - Panel Preset
 * Full scorecard detail with circular gauge, radar chart, dimension bars,
 * evidence counts, confidence indicators, and calibration status.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Target, BarChart3, FileText, Download, CheckCircle,
  Clock, User, Scale, ChevronRight, AlertCircle, Layers,
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
  formatDistanceToNow,
  getAccentAwareLayout,
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
    { dimensionId: 'dim-1', dimensionName: 'Technical Knowledge', score: 4.5, maxScore: 5, weight: 0.25, confidence: 0.92, evidenceCount: 8, notes: 'Strong React and TypeScript skills' },
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

/* ------------------------------------------------------------------ */
/*  Module-level Box/Text for sub-components                           */
/* ------------------------------------------------------------------ */

let Box: any;
let Text: any;

/* ------------------------------------------------------------------ */
/*  Circular Gauge Component                                           */
/* ------------------------------------------------------------------ */

function ScoreGauge({ score, maxScore, tokens: t, size = 140 }: {
  score: number;
  maxScore: number;
  tokens: DesignTokens;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) - 14;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * r;
  const pct = score / maxScore;
  const dashLen = pct * circumference;
  const color = getScoreColor(score, maxScore, t);

  return (
    <Box style={{ position: 'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Overall score: ${score} out of ${maxScore}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={t.colors.neutral[100]}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dashLen} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <Box style={{ 
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{
          fontSize: t.typography.fontSize['2xl'],
          fontWeight: t.typography.fontWeight.bold,
          color: t.colors.neutral[900],
        }}>
          {score.toFixed(1)}
        </Text>
        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
          / {maxScore}
        </Text>
      </Box>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Radar Chart Component                                              */
/* ------------------------------------------------------------------ */

function RadarChart({ dimensions, tokens: t, size = 240 }: {
  dimensions: DimensionScore[];
  tokens: DesignTokens;
  size?: number;
}) {
  const dimCount = dimensions.length;
  if (dimCount < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const maxR = (size / 2) - 36;
  const step = (2 * Math.PI) / dimCount;

  const polygon = (radius: number) =>
    dimensions.map((_, i) => {
      const a = i * step - Math.PI / 2;
      return `${cx + radius * Math.cos(a)},${cy + radius * Math.sin(a)}`;
    }).join(' ');

  const dataPolygon = dimensions.map((d, i) => {
    const a = i * step - Math.PI / 2;
    const r = (n(d.score) / (n(d.maxScore) || 1)) * maxR;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');

  const labelAreas = dimensions.map((d, i) => {
    const a = i * step - Math.PI / 2;
    const lx = cx + (maxR + 24) * Math.cos(a);
    const ly = cy + (maxR + 24) * Math.sin(a);
    const dimName = d.dimensionName ?? '';
    const label = dimName.length > 14
      ? dimName.slice(0, 12) + '..'
      : dimName;
    return { label, x: lx, y: ly, score: n(d.score), maxScore: n(d.maxScore), a, i };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Radar chart: ${dimensions.map(d => `${d.dimensionName ?? ''}: ${n(d.score)}/${n(d.maxScore)}`).join(', ')}`}
    >
      {[0.2, 0.4, 0.6, 0.8, 1].map(p => (
        <polygon
          key={p}
          points={polygon(maxR * p)}
          fill="none"
          stroke={t.colors.neutral[200]}
          strokeWidth={1}
        />
      ))}
      {dimensions.map((_, i) => {
        const a = i * step - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={cx + maxR * Math.cos(a)}
            y2={cy + maxR * Math.sin(a)}
            stroke={t.colors.neutral[200]}
            strokeWidth={1}
          />
        );
      })}
      <polygon
        points={dataPolygon}
        fill={t.colors.primaryScale[100]}
        stroke={t.colors.primaryScale[500]}
        strokeWidth={2}
        style={{ transition: 'all 0.6s ease' }}
      />
      {dimensions.map((d, i) => {
        const a = i * step - Math.PI / 2;
        const r = (n(d.score) / (n(d.maxScore) || 1)) * maxR;
        return (
          <circle
            key={d.dimensionId}
            cx={cx + r * Math.cos(a)}
            cy={cy + r * Math.sin(a)}
            r={4}
            fill={t.colors.common.white}
            stroke={getScoreColor(n(d.score), n(d.maxScore) || 1, t)}
            strokeWidth={2}
          />
        );
      })}
      {labelAreas.map(({ label, x, y }) => (
        <text
          key={label}
          x={x} y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={t.colors.neutral[600]}
          fontSize={t.typography.fontSize.xs}
        >
          {label}
        </text>
      ))}
    </svg>
  );
}

/* ================================================================== */
/*  Panel Preset                                                       */
/* ================================================================== */

export const PanelBhScorecardDetail = createPreset<BhScorecardDetailProps>({
  name: 'BhScorecardDetail.Panel',
  render: (ctx: PresetContext<BhScorecardDetailProps>) => {
    const { primitives, props, tokens: t } = ctx;
    Box = primitives.Box;
    Text = primitives.Text;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      scorecard = MOCK_SCORECARD,
      onDimensionClick,
      onCalibrateClick,
      onExportClick,
      loading,
      className,
      style,
    } = props;

    const [hoveredDim, setHoveredDim] = useState<string | null>(null);


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const handleDimClick = useCallback((dimId: string) => {
      onDimensionClick?.(dimId);
    }, [onDimensionClick]);

    const dims = scorecard.dimensions ?? [];
    const sortedByScore = useMemo(
      () => [...dims].sort((a, b) => n(b.score) - n(a.score)),
      [dims],
    );

    const maxDimScore = useMemo(
      () => Math.max(...dims.map(d => n(d.maxScore)), 1),
      [dims],
    );

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    return (
      <Box
        className={className}
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
                <Target size={22} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.xl,
                    fontWeight: ptypo.headingWeight,
                    color: t.colors.neutral[900],
                    letterSpacing: ptypo.headingLetterSpacing,
                  }}>
                    {scorecard.candidateName}
                  </Text>
                  <Box style={{
                    ...createBadgeStyle(t, getStatusBadgeKey((scorecard.status ?? ''))),
                    borderRadius: badgeRadius,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs }}>
                      {getStatusLabel((scorecard.status ?? ''))}
                    </Text>
                  </Box>
                </Box>
                {scorecard.jobTitle && (
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                    {scorecard.jobTitle}
                  </Text>
                )}
              </Box>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              {onCalibrateClick && (
                <button
                  onClick={onCalibrateClick}
                  aria-label="Calibrate scorecard"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    borderRadius: t.borderRadius.md,
                    border: `1px solid ${t.colors.neutral[200]}`,
                    backgroundColor: t.colors.common.white,
                    color: t.colors.primaryScale[600],
                    fontSize: t.typography.fontSize.sm,
                    fontWeight: t.typography.fontWeight.medium,
                    cursor: 'pointer',
                  }}
                >
                  <Scale size={14} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.primaryScale[600] }}>Calibrate</Text>
                </button>
              )}
              {onExportClick && (
                <button
                  onClick={onExportClick}
                  aria-label="Export scorecard"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    borderRadius: t.borderRadius.md,
                    border: `1px solid ${t.colors.neutral[200]}`,
                    backgroundColor: t.colors.common.white,
                    color: t.colors.neutral[600],
                    fontSize: t.typography.fontSize.sm,
                    fontWeight: t.typography.fontWeight.medium,
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>Export</Text>
                </button>
              )}
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>
          {/* Overall Score + Radar Row */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(220px, 1fr) minmax(280px, 1.5fr)',
            gap: t.spacing[6],
            marginBottom: t.spacing[7],
          }}>
            {/* Overall Score Card */}
            <Box style={{ ...card, ...animStyle(0), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: t.spacing[4] }}>
              {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>
              <Text style={{ ...sectionLabel, marginBottom: 0 }}>Overall Score</Text>
              <ScoreGauge score={n(scorecard.overallScore)} maxScore={n(scorecard.maxScore) || 1} tokens={t} />
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                {scorecard.calibrated && (
                  <Box style={{
                    ...createBadgeStyle(t, 'success'),
                    borderRadius: badgeRadius,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                  }}>
                    <CheckCircle size={10} />
                    <Text style={{ fontSize: t.typography.fontSize.xs }}>Calibrated</Text>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Radar Chart Card */}
            <Box style={{ ...card, ...animStyle(1) }}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[4] }}>Dimension Radar</Text>
              <Box style={{ display: 'flex', justifyContent: 'center' }}>
                <RadarChart dimensions={dims} tokens={t} />
              </Box>
            </Box>
          </Box>

          {/* Dimension Breakdown */}
          <Box style={{ ...card, ...animStyle(2), marginBottom: t.spacing[7] }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[4] }}>
              <Text style={sectionLabel}>Dimension Breakdown</Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                {dims.length} dimensions
              </Text>
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
              {sortedByScore.map((dim) => {
                const barPct = (n(dim.score) / (n(dim.maxScore) || 1)) * 100;
                const isHovered = hoveredDim === dim.dimensionId;
                const confColor = getConfidenceColor(n(dim.confidence), t);
                const scoreColor = getScoreColor(n(dim.score), n(dim.maxScore) || 1, t);

                return (
                  <Box
                    key={dim.dimensionId}
                    role="button"
                    tabIndex={0}
                    aria-label={`${dim.dimensionName ?? ''}: ${n(dim.score)} out of ${n(dim.maxScore)}, weight ${(n(dim.weight) * 100).toFixed(0)}%, confidence ${(n(dim.confidence) * 100).toFixed(0)}%, ${dim.evidenceCount ?? 0} evidence items`}
                    onClick={() => handleDimClick((dim.dimensionId ?? ''))}
                    onMouseEnter={() => setHoveredDim((dim.dimensionId ?? null))}
                    onMouseLeave={() => setHoveredDim(null)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDimClick((dim.dimensionId ?? '')); } }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: t.spacing[3],
                      padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                      borderRadius: t.borderRadius.md,
                      cursor: 'pointer',
                      backgroundColor: isHovered ? t.colors.neutral[50] : t.colors.common.white,
                      border: `1px solid ${isHovered ? t.colors.neutral[200] : t.colors.neutral[100]}`,
                      transition: `background-color ${t.motion.hover}, border-color ${t.motion.hover}`,
                    }}
                  >
                    {/* Dimension Name */}
                    <Text style={{
                      flex: 1,
                      minWidth: 120,
                      fontSize: t.typography.fontSize.sm,
                      fontWeight: t.typography.fontWeight.medium,
                      color: t.colors.neutral[800],
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {dim.dimensionName}
                    </Text>

                    {/* Score Bar */}
                    <Box style={{ flex: 2, minWidth: 100, display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Box style={{
                        flex: 1,
                        height: 8,
                        borderRadius: t.borderRadius.full,
                        backgroundColor: t.colors.neutral[100],
                        overflow: 'hidden',
                      }}>
                        <Box style={{
                          height: '100%',
                          width: `${barPct}%`,
                          borderRadius: t.borderRadius.full,
                          backgroundColor: scoreColor,
                          transition: 'width 0.6s ease',
                        }} />
                      </Box>
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        fontWeight: t.typography.fontWeight.bold,
                        color: t.colors.neutral[900],
                        minWidth: 36,
                        textAlign: 'right' as const,
                      }}>
                        {n(dim.score).toFixed(1)}
                      </Text>
                    </Box>

                    {/* Weight */}
                    <Box style={{
                      ...createBadgeStyle(t, 'secondary'),
                      borderRadius: badgeRadius,
                      minWidth: 44,
                      justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs }}>
                        {((dim.weight ?? 0) * 100).toFixed(0)}%
                      </Text>
                    </Box>

                    {/* Confidence */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], minWidth: 52 }}>
                      <Box style={{
                        width: 8, height: 8,
                        borderRadius: t.borderRadius.full,
                        backgroundColor: confColor,
                        flexShrink: 0,
                      }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                        {((dim.confidence ?? 0) * 100).toFixed(0)}%
                      </Text>
                    </Box>

                    {/* Evidence Count */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], minWidth: 36 }}>
                      <FileText size={12} color={t.colors.neutral[400]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                        {dim.evidenceCount}
                      </Text>
                    </Box>

                    <ChevronRight size={14} color={t.colors.neutral[300]} />
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Footer */}
          <Box style={{
            ...card,
            ...animStyle(3),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                <User size={14} color={t.colors.neutral[400]} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>
                  {scorecard.scoredBy}
                </Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                <Clock size={14} color={t.colors.neutral[400]} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                  {formatDistanceToNow(new Date(scorecard.scoredAt!), { addSuffix: true })}
                </Text>
              </Box>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              {scorecard.calibrated ? (
                <Box style={{
                  ...createBadgeStyle(t, 'success'),
                  borderRadius: badgeRadius,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}>
                  <CheckCircle size={10} />
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>Calibrated</Text>
                </Box>
              ) : (
                <Box style={{
                  ...createBadgeStyle(t, 'warning'),
                  borderRadius: badgeRadius,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}>
                  <AlertCircle size={10} />
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>Not Calibrated</Text>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
