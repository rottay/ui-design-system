'use client';

/**
 * BhRubricBuilder - Preview Preset
 * Read-only scorecard preview with sample data visualization.
 * Shows how the rubric renders with sample scores, radar chart,
 * dimension breakdown, and score level distribution.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createHoverStyle,
  createIconContainerStyle,
  createPanelHeaderStyle,
  createPersonalityAccentBar,
  createPersonalitySectionHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  createSurfaceStyle,
  getHoverTransform,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  getAccentAwareLayout,
} from '../../../helpers';
import type {
  BhRubricBuilderProps,
  ScoringDimension,
  ScoreLevel,
} from '../../core';
import {
  getRubricStatusColors,
  getScorableTypeColors,
  getDimensionColors,
  formatScorableType,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Target,
  BarChart3,
  Flag,
  CheckCircle2,
  XCircle,
  CircleDot,
  Hash,
  Radar,
  Award,
  TrendingUp,
  User,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helper: radar chart generation                                     */
/* ------------------------------------------------------------------ */
function generateRadarPoints(
  values: { label: string; value: number; maxValue: number }[],
  cx: number,
  cy: number,
  radius: number
): { polygon: string; gridLines: string[][]; labels: { x: number; y: number; label: string }[] } {
  const count = values.length;
  if (count < 3) return { polygon: '', gridLines: [], labels: [] };

  const angleStep = (2 * Math.PI) / count;
  const startAngle = -Math.PI / 2;
  const points: string[] = [];
  const labels: { x: number; y: number; label: string }[] = [];
  const gridLines: string[][] = [];

  for (const pct of [0.25, 0.5, 0.75, 1]) {
    const ring: string[] = [];
    for (let i = 0; i < count; i++) {
      const angle = startAngle + i * angleStep;
      const x = cx + radius * pct * Math.cos(angle);
      const y = cy + radius * pct * Math.sin(angle);
      ring.push(`${x},${y}`);
    }
    gridLines.push(ring);
  }

  for (let i = 0; i < count; i++) {
    const angle = startAngle + i * angleStep;
    const normalizedValue = values[i].maxValue > 0 ? values[i].value / values[i].maxValue : 0;
    const clampedValue = Math.min(Math.max(normalizedValue, 0), 1);
    const x = cx + radius * clampedValue * Math.cos(angle);
    const y = cy + radius * clampedValue * Math.sin(angle);
    points.push(`${x},${y}`);

    const labelRadius = radius + 20;
    const lx = cx + labelRadius * Math.cos(angle);
    const ly = cy + labelRadius * Math.sin(angle);
    labels.push({ x: lx, y: ly, label: values[i].label });
  }

  return { polygon: points.join(' '), gridLines, labels };
}

/* ------------------------------------------------------------------ */
/*  Helper: generate pie chart slices                                  */
/* ------------------------------------------------------------------ */
function generatePieSlices(
  weights: { label: string; value: number; color: string }[],
  cx: number,
  cy: number,
  radius: number
): { d: string; color: string; label: string; value: number }[] {
  const total = weights.reduce((sum, w) => sum + w.value, 0);
  if (total === 0) return [];

  const slices: { d: string; color: string; label: string; value: number }[] = [];
  let currentAngle = -Math.PI / 2;

  for (const w of weights) {
    const sliceAngle = (w.value / total) * 2 * Math.PI;
    const x1 = cx + radius * Math.cos(currentAngle);
    const y1 = cy + radius * Math.sin(currentAngle);
    const x2 = cx + radius * Math.cos(currentAngle + sliceAngle);
    const y2 = cy + radius * Math.sin(currentAngle + sliceAngle);
    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    slices.push({ d, color: w.color, label: w.label, value: w.value });
    currentAngle += sliceAngle;
  }

  return slices;
}

/* ------------------------------------------------------------------ */
/*  Preview Preset                                                     */
/* ------------------------------------------------------------------ */
export const PreviewBhRubricBuilder = createPreset<BhRubricBuilderProps>({
  name: 'BhRubricBuilder.Preview',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhRubricBuilderProps>) => {
    const { Box, Flex, Stack, Text } = primitives;

    const {
      rubricName,
      industry,
      scorableType,
      status,
      dimensions: dimensionsProp,
      scoreLevels,
      className,
      style,
    } = props;

    /* ── Derived ──────────────────────────────────────────────────── */
    const sortedDimensions = useMemo(
      () => [...dimensionsProp].sort((a, b) => a.order - b.order),
      [dimensionsProp]
    );

    const totalWeight = useMemo(
      () => dimensionsProp.reduce((sum, d) => sum + d.weight, 0),
      [dimensionsProp]
    );

    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    /* ── Mounted for entrance animation ──────────────────────────── */

    const statusColors = useMemo(() => getRubricStatusColors(tokens), [tokens]);
    const scorableColors = useMemo(() => getScorableTypeColors(tokens), [tokens]);
    const dimColors = useMemo(() => getDimensionColors(tokens), [tokens]);

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);

    /* ── Personality + Animation ──────────────────────────────────── */
    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const cardHover = useMemo(() => createCardHoverStyles(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);
    const accentLayout = useMemo(() => getAccentAwareLayout(tokens), [tokens]);
    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);

    /* ── Glass header style ───────────────────────────────────────── */
    const headerGlassStyle = useMemo(() => {
      const s: React.CSSProperties = {};
      if (isGlass && tokens.glass) {
        s.backdropFilter = tokens.glass.blur;
        s.WebkitBackdropFilter = tokens.glass.blur;
        s.backgroundColor = tokens.glass.bg;
      }
      return s;
    }, [isGlass, tokens]);

    /* ── Stable sample scores (using dimension order as seed) ────── */
    const sampleScores = useMemo(() => {
      return sortedDimensions.map((d, i) => {
        const seed = ((d.order * 17 + i * 31) % 40) + 55;
        return {
          label: d.code || d.name.substring(0, 4),
          name: d.name,
          value: seed,
          maxValue: 100,
          weight: d.weight,
          isKnockout: d.isKnockout,
          knockoutThreshold: d.knockoutThreshold,
        };
      });
    }, [sortedDimensions]);

    const overallScore = useMemo(() => {
      if (sampleScores.length === 0) return 0;
      const weighted = sampleScores.reduce(
        (sum, s) => sum + s.value * s.weight,
        0
      );
      return Math.round(weighted / (totalWeight || 1));
    }, [sampleScores, totalWeight]);

    const overallLevel = useMemo(() => {
      const sorted = [...scoreLevels].sort((a, b) => b.minScore - a.minScore);
      return sorted.find((l) => overallScore >= l.minScore) ?? null;
    }, [overallScore, scoreLevels]);

    const knockoutFailed = useMemo(() => {
      return sampleScores.filter(
        (s) => s.isKnockout && s.knockoutThreshold !== undefined && s.value < s.knockoutThreshold
      );
    }, [sampleScores]);

    /* ── State for selected dimension detail ──────────────────────── */
    const [selectedDim, setSelectedDim] = useState<string | null>(null);

    const handleDimSelect = useCallback((dimId: string) => {
      setSelectedDim((prev) => (prev === dimId ? null : dimId));
    }, []);

    /* ================================================================ */
    /*  RENDER                                                          */
    /* ================================================================ */
    return (
      <Box
        className={className}
        role="region"
        aria-label={`Rubric preview: ${rubricName}`}
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          height: '100%',
          backgroundColor: tokens.colors.neutral[50],
          fontFamily: 'inherit',
          ...entrance.animate,
          transition: entrance.transition,
          width: '100%',
          ...style,
        }}
      >
        {/* Accent bar */}
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        {/* ── Header ───────────────────────────────────────────────── */}
        <Flex
          align="center"
          justify="between"
          style={{
            ...cardBase,
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.none,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            ...headerGlassStyle,
          }}
        >
          <Flex align="center" gap={12}>
            <Target size={20} color={tokens.colors.primaryScale[600]} strokeWidth={1.5} />
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: ptypo.headingWeight,
                letterSpacing: ptypo.headingLetterSpacing,
                color: tokens.colors.neutral[900],
              }}
            >
              {rubricName}
            </Text>
            <Text style={{ ...createBadgeStyle(tokens, 'secondary'), borderRadius: badgeRadius }}>{industry}</Text>
            <Text
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: badgeRadius,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: scorableColors[scorableType].bg,
                color: scorableColors[scorableType].color,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${scorableColors[scorableType].border}`,
              }}
            >
              {formatScorableType(scorableType)}
            </Text>
            <Text
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: badgeRadius,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: statusColors[status].bg,
                color: statusColors[status].color,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusColors[status].border}`,
                gap: tokens.spacing[1],
              }}
            >
              <CircleDot size={10} aria-hidden="true" />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </Flex>

          <Flex align="center" gap={8}>
            <Text
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: badgeRadius,
                backgroundColor: tokens.colors.neutral[100],
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[600],
                fontWeight: tokens.typography.fontWeight.medium,
              }}
            >
              <User size={12} aria-hidden="true" />
              Sample Candidate Preview
            </Text>
          </Flex>
        </Flex>

        {/* ── Content ──────────────────────────────────────────────── */}
        <Box
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: tokens.spacing[5],
            display: 'flex',
            gap: tokens.spacing[5],
          }}
        >
          {/* ── Left: Score Details ───────────────────────────────── */}
          <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
            {/* Overall Score Card */}
            <Box
              style={{
                ...cardBase,
                padding: tokens.spacing[5],
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[5],
              }}
            >
              {/* Score circle */}
              <Box style={{ position: 'relative' as const }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={tokens.colors.neutral[100]}
                    strokeWidth={8}
                  />
                  {/* Score arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={overallLevel?.color ?? tokens.colors.neutral[400]}
                    strokeWidth={8}
                    strokeDasharray={`${(overallScore / 100) * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                  <text
                    x="50"
                    y="46"
                    textAnchor="middle"
                    fontSize={tokens.typography.fontSize['2xl']}
                    fontWeight={tokens.typography.fontWeight.bold}
                    fill={overallLevel?.color ?? tokens.colors.neutral[700]}
                  >
                    {overallScore}
                  </text>
                  <text
                    x="50"
                    y="62"
                    textAnchor="middle"
                    fontSize="9"
                    fill={tokens.colors.neutral[400]}
                  >
                    / 100
                  </text>
                </svg>
              </Box>

              <Box style={{ flex: 1 }}>
                <Text
                  style={{
                    ...sectionHeaderStyle,
                    marginBottom: tokens.spacing[1],
                    display: 'block',
                  }}
                >
                  Overall Score
                </Text>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                  <Award size={18} color={overallLevel?.color ?? tokens.colors.neutral[500]} aria-hidden="true" />
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xl,
                      fontWeight: ptypo.headingWeight,
                      color: overallLevel?.color ?? tokens.colors.neutral[700],
                    }}
                  >
                    {overallLevel?.label ?? 'N/A'}
                  </Text>
                </Box>

                {/* Knockout warning */}
                {knockoutFailed.length > 0 && (
                  <Box
                    role="alert"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.errorScale[50],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                    }}
                  >
                    <Flag size={12} color={tokens.colors.errorScale[500]} aria-hidden="true" />
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.errorScale[700],
                        fontWeight: tokens.typography.fontWeight.medium,
                      }}
                    >
                      {knockoutFailed.length} knockout{knockoutFailed.length > 1 ? 's' : ''} failed
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Dimension Scores */}
            <Box>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  marginBottom: tokens.spacing[3],
                }}
              >
                <BarChart3 size={16} color={tokens.colors.primaryScale[600]} aria-hidden="true" />
                <Text
                  style={{
                    ...sectionHeaderStyle,
                    marginBottom: 0,
                  }}
                >
                  Dimension Scores
                </Text>
              </Box>

              <Box role="list" aria-label="Dimension scores" style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                {sampleScores.map((score, idx) => {
                  const matchingLevel = [...scoreLevels]
                    .sort((a, b) => b.minScore - a.minScore)
                    .find((l) => score.value >= l.minScore);

                  const isKnockoutFailed =
                    score.isKnockout &&
                    score.knockoutThreshold !== undefined &&
                    score.value < score.knockoutThreshold;

                  const scoreEntrance = createEntranceAnimation(tokens, { index: idx });

                  return (
                    <Box
                      key={sortedDimensions[idx].id}
                      role="listitem"
                      aria-label={`${score.name}: ${score.value}${isKnockoutFailed ? ' - knockout failed' : ''}`}
                      tabIndex={0}
                      onClick={() => handleDimSelect(sortedDimensions[idx].id)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDimSelect(sortedDimensions[idx].id); } }}
                      style={{
                        ...cardBase,
                        ...cardHover.base,
                        ...scoreEntrance.animate,
                        padding: tokens.spacing[3],
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        borderColor: isKnockoutFailed
                          ? tokens.colors.errorScale[300]
                          : selectedDim === sortedDimensions[idx].id
                          ? tokens.colors.primaryScale[300]
                          : tokens.colors.neutral[200],
                        borderWidth: isKnockoutFailed || selectedDim === sortedDimensions[idx].id ? '2px' : tokens.surface.borderWidth,
                        borderStyle: 'solid',
                      }}
                    >
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: tokens.spacing[2],
                        }}
                      >
                        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                          <Box
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: tokens.borderRadius.full,
                              backgroundColor: dimColors[idx % dimColors.length],
                            }}
                          />
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: ptypo.headingWeight,
                              color: tokens.colors.neutral[900],
                            }}
                          >
                            {score.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontFamily: 'monospace',
                              color: tokens.colors.neutral[400],
                            }}
                          >
                            {score.label}
                          </Text>
                          {score.isKnockout && (
                            <Flag
                              size={12}
                              aria-hidden="true"
                              color={
                                isKnockoutFailed
                                  ? tokens.colors.errorScale[500]
                                  : tokens.colors.neutral[400]
                              }
                            />
                          )}
                        </Box>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.bold,
                              color: matchingLevel?.color ?? tokens.colors.neutral[600],
                            }}
                          >
                            {score.value}
                          </Text>
                          <Text
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: `1px ${tokens.spacing[2]}px`,
                              borderRadius: badgeRadius,
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              backgroundColor:
                                isKnockoutFailed
                                  ? tokens.colors.errorScale[100]
                                  : `${matchingLevel?.color ?? tokens.colors.neutral[400]}20`,
                              color: isKnockoutFailed
                                ? tokens.colors.errorScale[700]
                                : matchingLevel?.color ?? tokens.colors.neutral[600],
                            }}
                          >
                            {isKnockoutFailed ? 'FAILED' : matchingLevel?.label ?? 'N/A'}
                          </Text>
                        </Box>
                      </Box>

                      {/* Score bar */}
                      <Box
                        role="progressbar"
                        aria-valuenow={score.value}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        style={{
                          height: 6,
                          backgroundColor: tokens.colors.neutral[100],
                          borderRadius: tokens.borderRadius.full,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          style={{
                            height: '100%',
                            width: `${score.value}%`,
                            backgroundColor: isKnockoutFailed
                              ? tokens.colors.errorScale[500]
                              : matchingLevel?.color ?? tokens.colors.neutral[400],
                            borderRadius: tokens.borderRadius.full,
                          }}
                        />
                      </Box>

                      {/* Weight indicator */}
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: tokens.spacing[1],
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[400],
                          }}
                        >
                          Weight: {score.weight.toFixed(0)}%
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[400],
                          }}
                        >
                          Weighted: {Math.round(score.value * score.weight / 100)}
                        </Text>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Score Level Legend */}
            <Box>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  marginBottom: tokens.spacing[3],
                }}
              >
                <TrendingUp size={16} color={tokens.colors.warningScale[600]} aria-hidden="true" />
                <Text
                  style={{
                    ...sectionHeaderStyle,
                    marginBottom: 0,
                  }}
                >
                  Score Levels
                </Text>
              </Box>

              <Box
                role="list"
                aria-label="Score level definitions"
                style={{
                  ...cardBase,
                  padding: 0,
                  overflow: 'hidden',
                }}
              >
                {scoreLevels.map((level, idx) => (
                  <Box
                    key={idx}
                    role="listitem"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[3],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderBottom:
                        idx < scoreLevels.length - 1
                          ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
                          : 'none',
                    }}
                  >
                    <Box
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: level.color,
                        flexShrink: 0,
                      }}
                    />
                    <Text
                      style={{
                        flex: 1,
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[800],
                      }}
                    >
                      {level.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        fontFamily: 'monospace',
                      }}
                    >
                      {'\u2265'} {level.minScore}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* ── Right: Radar + Weights ───────────────────────────── */}
          <Box style={{ width: 340, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
            {/* Radar Chart */}
            {sampleScores.length >= 3 && (
              <Box
                style={{
                  ...cardBase,
                  padding: tokens.spacing[4],
                }}
              >
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  <Radar size={16} color={tokens.colors.primaryScale[600]} aria-hidden="true" />
                  <Text
                    style={{
                      ...sectionHeaderStyle,
                      marginBottom: 0,
                    }}
                  >
                    Competency Radar
                  </Text>
                </Box>

                <Box style={{ display: 'flex', justifyContent: 'center' }}>
                  <svg width="280" height="280" viewBox="0 0 280 280">
                    {(() => {
                      const radar = generateRadarPoints(sampleScores, 140, 140, 100);
                      return (
                        <>
                          {radar.gridLines.map((ring, ri) => (
                            <polygon
                              key={ri}
                              points={ring.join(' ')}
                              fill="none"
                              stroke={tokens.colors.neutral[200]}
                              strokeWidth={1}
                            />
                          ))}
                          {sampleScores.map((_, i) => {
                            const angle = -Math.PI / 2 + (i * 2 * Math.PI) / sampleScores.length;
                            const x2 = 140 + 100 * Math.cos(angle);
                            const y2 = 140 + 100 * Math.sin(angle);
                            return (
                              <line
                                key={i}
                                x1={140}
                                y1={140}
                                x2={x2}
                                y2={y2}
                                stroke={tokens.colors.neutral[200]}
                                strokeWidth={1}
                              />
                            );
                          })}
                          {radar.polygon && (
                            <polygon
                              points={radar.polygon}
                              fill={tokens.colors.primaryScale[100]}
                              fillOpacity={0.5}
                              stroke={tokens.colors.primaryScale[500]}
                              strokeWidth={2}
                            />
                          )}
                          {radar.polygon &&
                            radar.polygon.split(' ').map((pt, i) => {
                              const [px, py] = pt.split(',').map(Number);
                              return (
                                <circle
                                  key={i}
                                  cx={px}
                                  cy={py}
                                  r={4}
                                  fill={dimColors[i % dimColors.length]}
                                  stroke={tokens.colors.common.white}
                                  strokeWidth={2}
                                />
                              );
                            })}
                          {radar.labels.map((lbl, i) => (
                            <text
                              key={i}
                              x={lbl.x}
                              y={lbl.y}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="9"
                              fill={tokens.colors.neutral[500]}
                              fontWeight={tokens.typography.fontWeight.medium}
                            >
                              {lbl.label}
                            </text>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </Box>
              </Box>
            )}

            {/* Weight Distribution Pie */}
            <Box
              style={{
                ...cardBase,
                padding: tokens.spacing[4],
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  marginBottom: tokens.spacing[3],
                }}
              >
                <BarChart3 size={16} color={tokens.colors.infoScale[600]} aria-hidden="true" />
                <Text
                  style={{
                    ...sectionHeaderStyle,
                    marginBottom: 0,
                  }}
                >
                  Weight Distribution
                </Text>
              </Box>

              <Box style={{ display: 'flex', justifyContent: 'center', marginBottom: tokens.spacing[3] }}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  {(() => {
                    const weights = sortedDimensions.map((d, i) => ({
                      label: d.name,
                      value: d.weight,
                      color: dimColors[i % dimColors.length],
                    }));
                    const slices = generatePieSlices(weights, 70, 70, 60);
                    return slices.map((slice, i) => (
                      <path
                        key={i}
                        d={slice.d}
                        fill={slice.color}
                        stroke={tokens.colors.common.white}
                        strokeWidth={2}
                      />
                    ));
                  })()}
                  <circle
                    cx="70"
                    cy="70"
                    r="28"
                    fill={tokens.colors.common.white}
                    stroke={tokens.colors.neutral[100]}
                    strokeWidth={1}
                  />
                  <text
                    x="70"
                    y="66"
                    textAnchor="middle"
                    fontSize={tokens.typography.fontSize.xs}
                    fill={tokens.colors.neutral[500]}
                    fontWeight={tokens.typography.fontWeight.medium}
                  >
                    {sortedDimensions.length}
                  </text>
                  <text x="70" y="80" textAnchor="middle" fontSize="8" fill={tokens.colors.neutral[400]}>
                    dims
                  </text>
                </svg>
              </Box>

              {/* Legend */}
              <Box role="list" aria-label="Weight distribution legend" style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                {sortedDimensions.map((d, i) => (
                  <Box
                    key={d.id}
                    role="listitem"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                    }}
                  >
                    <Box
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: dimColors[i % dimColors.length],
                        flexShrink: 0,
                      }}
                    />
                    <Text style={{ flex: 1 }}>{d.name}</Text>
                    <Text style={{ fontWeight: tokens.typography.fontWeight.semibold }}>
                      {d.weight.toFixed(0)}%
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
