'use client';

/**
 * BhCalibrationScatter - Chart Preset
 * Full SVG scatter plot with Human Score (x-axis) vs AI Score (y-axis),
 * diagonal reference line, optional regression line, deviation-colored points,
 * hover tooltips, and stats summary bar.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ScatterChart, TrendingUp, Target, BarChart3,
  CheckCircle, AlertTriangle, Info,
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
  getAccentAwareLayout,
} from '../../../helpers';
import type {
  BhCalibrationScatterProps,
  ScatterPoint,
  CalibrationStats,
} from '../../core';
import { BH_CALIBRATION_SCATTER_DEFAULTS, n } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getDeviationColor(deviation: number, t: DesignTokens): string {
  const abs = Math.abs(deviation);
  if (abs <= 0.5) return t.colors.successScale[500];
  if (abs <= 1.0) return t.colors.warningScale[500];
  return t.colors.errorScale[500];
}

function getDeviationBg(deviation: number, t: DesignTokens): string {
  const abs = Math.abs(deviation);
  if (abs <= 0.5) return t.colors.successScale[50];
  if (abs <= 1.0) return t.colors.warningScale[50];
  return t.colors.errorScale[50];
}

function computeRegressionLine(points: ScatterPoint[]): { slope: number; intercept: number } | null {
  const len = points.length;
  if (len < 2) return null;

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (const p of points) {
    const hs = n(p.humanScore);
    const as = n(p.aiScore);
    sumX += hs;
    sumY += as;
    sumXY += hs * as;
    sumXX += hs * hs;
  }

  const denom = len * sumXX - sumX * sumX;
  if (Math.abs(denom) < 1e-10) return null;

  const slope = (len * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / len;
  return { slope, intercept };
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_POINTS: ScatterPoint[] = [
  { id: 'sp-1', humanScore: 4.2, aiScore: 4.0, candidateName: 'Sarah Johnson', dimensionName: 'Technical', deviation: 0.2, calibrated: true },
  { id: 'sp-2', humanScore: 3.5, aiScore: 3.8, candidateName: 'Michael Chen', dimensionName: 'Problem Solving', deviation: -0.3, calibrated: true },
  { id: 'sp-3', humanScore: 2.8, aiScore: 3.5, candidateName: 'Emily Rodriguez', dimensionName: 'Communication', deviation: -0.7, calibrated: false },
  { id: 'sp-4', humanScore: 4.8, aiScore: 4.5, candidateName: 'James Kim', dimensionName: 'Leadership', deviation: 0.3, calibrated: true },
  { id: 'sp-5', humanScore: 1.5, aiScore: 2.8, candidateName: 'Anna Kowalski', dimensionName: 'Technical', deviation: -1.3, calibrated: false },
  { id: 'sp-6', humanScore: 3.0, aiScore: 3.2, candidateName: 'David Park', dimensionName: 'System Design', deviation: -0.2, calibrated: true },
  { id: 'sp-7', humanScore: 4.5, aiScore: 3.8, candidateName: 'Lisa Wang', dimensionName: 'Cultural Fit', deviation: 0.7, calibrated: false },
  { id: 'sp-8', humanScore: 2.0, aiScore: 2.2, candidateName: 'Tom Baker', dimensionName: 'Problem Solving', deviation: -0.2, calibrated: true },
  { id: 'sp-9', humanScore: 3.8, aiScore: 4.2, candidateName: 'Maria Garcia', dimensionName: 'Communication', deviation: -0.4, calibrated: true },
  { id: 'sp-10', humanScore: 4.0, aiScore: 2.5, candidateName: 'Robert Lee', dimensionName: 'Technical', deviation: 1.5, calibrated: false },
];

const MOCK_STATS: CalibrationStats = {
  correlation: 0.78,
  meanDeviation: 0.52,
  sampleCount: 10,
  agreementRate: 0.72,
};

/* ------------------------------------------------------------------ */
/*  Module-level Box/Text for sub-components                           */
/* ------------------------------------------------------------------ */

let Box: any;
let Text: any;

/* ================================================================== */
/*  Chart Preset                                                       */
/* ================================================================== */

export const ChartBhCalibrationScatter = createPreset<BhCalibrationScatterProps>({
  name: 'BhCalibrationScatter.Chart',
  render: (ctx: PresetContext<BhCalibrationScatterProps>) => {
    const { primitives, props, tokens: t } = ctx;
    Box = primitives.Box;
    Text = primitives.Text;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      points: rawPoints = [],
      stats = { correlation: 0, meanDeviation: 0, sampleCount: 0, agreementRate: 0 },
      onPointClick,
      selectedPointId,
      showRegressionLine = BH_CALIBRATION_SCATTER_DEFAULTS.showRegressionLine,
      showDiagonal = BH_CALIBRATION_SCATTER_DEFAULTS.showDiagonal,
      loading,
      className,
      style,
    } = props;

    const points = Array.isArray(rawPoints) ? rawPoints : [];

    const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const handlePointClick = useCallback((id: string) => {
      onPointClick?.(id);
    }, [onPointClick]);

    const regression = useMemo(
      () => showRegressionLine ? computeRegressionLine(points) : null,
      [points, showRegressionLine],
    );

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    /* Chart dimensions */
    const chartW = 480;
    const chartH = 400;
    const pad = { top: 24, right: 24, bottom: 48, left: 48 };
    const plotW = chartW - pad.left - pad.right;
    const plotH = chartH - pad.top - pad.bottom;
    const maxVal = 5;

    const toX = (v: number) => pad.left + (v / maxVal) * plotW;
    const toY = (v: number) => pad.top + plotH - (v / maxVal) * plotH;

    const hoveredData = useMemo(
      () => points.find(p => p.id === hoveredPoint),
      [points, hoveredPoint],
    );

    const statItems = useMemo(() => [
      { label: 'Correlation', value: n(stats.correlation).toFixed(2), icon: TrendingUp, color: t.colors.primaryScale },
      { label: 'Mean Deviation', value: n(stats.meanDeviation).toFixed(2), icon: Target, color: n(stats.meanDeviation) <= 0.5 ? t.colors.successScale : t.colors.warningScale },
      { label: 'Samples', value: String(n(stats.sampleCount)), icon: BarChart3, color: t.colors.infoScale },
      { label: 'Agreement', value: `${(n(stats.agreementRate) * 100).toFixed(0)}%`, icon: CheckCircle, color: n(stats.agreementRate) >= 0.7 ? t.colors.successScale : t.colors.warningScale },
    ], [stats, t]);

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
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
            <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[50] })}>
              <ScatterChart size={22} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.xl,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                Calibration Scatter
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                Human vs AI score agreement analysis
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>
          {/* Chart Card */}
          <Box style={{ ...card, ...animStyle(0), marginBottom: t.spacing[6] }}>
            {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>
            <Text style={{ ...sectionLabel, marginBottom: t.spacing[4] }}>Score Comparison</Text>
            <Box style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <svg
                width={chartW}
                height={chartH}
                viewBox={`0 0 ${chartW} ${chartH}`}
                role="img"
                aria-label={`Scatter plot: ${points.length} data points comparing human and AI scores`}
              >
                {/* Grid lines */}
                {[0, 1, 2, 3, 4, 5].map(v => (
                  <g key={v}>
                    <line
                      x1={toX(v)} y1={pad.top}
                      x2={toX(v)} y2={pad.top + plotH}
                      stroke={t.colors.neutral[100]}
                      strokeWidth={1}
                    />
                    <line
                      x1={pad.left} y1={toY(v)}
                      x2={pad.left + plotW} y2={toY(v)}
                      stroke={t.colors.neutral[100]}
                      strokeWidth={1}
                    />
                    {/* X axis labels */}
                    <text
                      x={toX(v)} y={chartH - 8}
                      textAnchor="middle"
                      fill={t.colors.neutral[500]}
                      fontSize={t.typography.fontSize.xs}
                    >
                      {v}
                    </text>
                    {/* Y axis labels */}
                    <text
                      x={pad.left - 12} y={toY(v)}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fill={t.colors.neutral[500]}
                      fontSize={t.typography.fontSize.xs}
                    >
                      {v}
                    </text>
                  </g>
                ))}

                {/* Axis labels */}
                <text
                  x={pad.left + plotW / 2} y={chartH - 0}
                  textAnchor="middle"
                  fill={t.colors.neutral[600]}
                  fontSize={t.typography.fontSize.xs}
                  fontWeight={t.typography.fontWeight.semibold}
                >
                  Human Score
                </text>
                <text
                  x={12} y={pad.top + plotH / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={t.colors.neutral[600]}
                  fontSize={t.typography.fontSize.xs}
                  fontWeight={t.typography.fontWeight.semibold}
                  transform={`rotate(-90, 12, ${pad.top + plotH / 2})`}
                >
                  AI Score
                </text>

                {/* Diagonal line (perfect agreement) */}
                {showDiagonal && (
                  <line
                    x1={toX(0)} y1={toY(0)}
                    x2={toX(maxVal)} y2={toY(maxVal)}
                    stroke={t.colors.neutral[300]}
                    strokeWidth={1.5}
                    strokeDasharray="6 4"
                  />
                )}

                {/* Regression line */}
                {regression && (
                  <line
                    x1={toX(0)} y1={toY(regression.intercept)}
                    x2={toX(maxVal)} y2={toY(regression.slope * maxVal + regression.intercept)}
                    stroke={t.colors.primaryScale[400]}
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    opacity={0.7}
                  />
                )}

                {/* Data points */}
                {points.map((p) => {
                  const isHovered = hoveredPoint === p.id;
                  const isSelected = selectedPointId === p.id;
                  const pointColor = getDeviationColor(n(p.deviation), t);
                  const r = isHovered || isSelected ? 7 : 5;

                  return (
                    <g key={p.id}>
                      <circle
                        cx={toX(n(p.humanScore))}
                        cy={toY(n(p.aiScore))}
                        r={r}
                        fill={pointColor}
                        stroke={isSelected ? t.colors.neutral[900] : t.colors.common.white}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        style={{
                          cursor: 'pointer',
                          transition: 'r 0.2s ease, stroke-width 0.2s ease',
                        }}
                        onMouseEnter={() => setHoveredPoint(p.id)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        onClick={() => handlePointClick(p.id)}
                        role="button"
                        tabIndex={0}
                        aria-label={`${p.candidateName}: Human ${n(p.humanScore)}, AI ${n(p.aiScore)}, deviation ${n(p.deviation).toFixed(2)}`}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Tooltip */}
              {hoveredData && (
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                  position: 'absolute',
                  top: toY(n(hoveredData.aiScore)) - 80,
                  left: toX(n(hoveredData.humanScore)) + 12,
                  ...createCardStyle(t, { elevation: 'md', glass: isGlass }),
                  padding: t.spacing[3],
                  minWidth: 180,
                  pointerEvents: 'none',
                  zIndex: 10,
                }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.sm,
                    fontWeight: t.typography.fontWeight.semibold,
                    color: t.colors.neutral[900],
                    marginBottom: t.spacing[1],
                    display: 'block',
                  }}>
                    {hoveredData.candidateName}
                  </Text>
                  {hoveredData.dimensionName && (
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginBottom: t.spacing[2], display: 'block' }}>
                      {hoveredData.dimensionName}
                    </Text>
                  )}
                  <Box style={{ display: 'flex', gap: t.spacing[3] }}>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], display: 'block' }}>Human</Text>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                        {n(hoveredData.humanScore).toFixed(1)}
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], display: 'block' }}>AI</Text>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                        {n(hoveredData.aiScore).toFixed(1)}
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], display: 'block' }}>Deviation</Text>
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        fontWeight: t.typography.fontWeight.bold,
                        color: getDeviationColor(n(hoveredData.deviation), t),
                      }}>
                        {n(hoveredData.deviation) > 0 ? '+' : ''}{n(hoveredData.deviation).toFixed(2)}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Legend */}
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[5], marginTop: t.spacing[4] }}>
              {[
                { label: 'Low deviation (< 0.5)', color: t.colors.successScale[500] },
                { label: 'Medium (0.5 - 1.0)', color: t.colors.warningScale[500] },
                { label: 'High (> 1.0)', color: t.colors.errorScale[500] },
              ].map((item) => (
                <Box key={item.label} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Box style={{
                    width: 10, height: 10,
                    borderRadius: t.borderRadius.full,
                    backgroundColor: item.color,
                    flexShrink: 0,
                  }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                    {item.label}
                  </Text>
                </Box>
              ))}
              {showDiagonal && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Box style={{
                    width: 16, height: 0,
                    borderTop: `2px dashed ${t.colors.neutral[300]}`,
                    flexShrink: 0,
                  }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                    Perfect agreement
                  </Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Stats Summary Bar */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: t.spacing[4],
          }}>
            {statItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <Box
                  key={item.label}
                  style={{ ...card, ...animStyle(i + 1) }}
                  role="status"
                  aria-label={`${item.label}: ${item.value}`}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                    <Box style={createIconContainerStyle(t, { size: 32, color: item.color[50] })}>
                      <Icon size={16} color={item.color[600]} />
                    </Box>
                  </Box>
                  <Text style={{
                    fontSize: t.typography.fontSize.xl,
                    fontWeight: t.typography.fontWeight.bold,
                    color: t.colors.neutral[900],
                    display: 'block',
                  }}>
                    {item.value}
                  </Text>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[500],
                    marginTop: t.spacing[1],
                    textTransform: ptypo.labelTransform,
                    letterSpacing: ptypo.labelLetterSpacing,
                  }}>
                    {item.label}
                  </Text>
                </Box>
              );
            })}
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
