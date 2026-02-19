'use client';

/**
 * BhCalibrationScatter - Compact Preset
 * Mini scatter visualization with key calibration stats.
 * Designed for sidebar or widget placement.
 */

import { useMemo, useCallback} from 'react';
import {
  ScatterChart, TrendingUp, Target, CheckCircle,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  createPersonalityAccentBar,

  createCardHoverStyles,
  createDividerStyle,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
  formatAbbreviated,
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

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhCalibrationScatter = createPreset<BhCalibrationScatterProps>({
  name: 'BhCalibrationScatter.Compact',
  render: (ctx: PresetContext<BhCalibrationScatterProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      points: rawPoints = [],
      stats = { correlation: 0, meanDeviation: 0, sampleCount: 0, agreementRate: 0 },
      onPointClick,
      selectedPointId,
      showDiagonal = BH_CALIBRATION_SCATTER_DEFAULTS.showDiagonal,
      className,
      style,
    } = props;

    const points = Array.isArray(rawPoints) ? rawPoints : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const handleClick = useCallback((id: string) => {
      onPointClick?.(id);
    }, [onPointClick]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    /* Mini chart dimensions */
    const cW = 180;
    const cH = 140;
    const cPad = 20;
    const pW = cW - cPad * 2;
    const pH = cH - cPad * 2;
    const maxVal = 5;
    const toX = (v: number) => cPad + (v / maxVal) * pW;
    const toY = (v: number) => cPad + pH - (v / maxVal) * pH;

    const correlationColor = useMemo(() => {
      if (n(stats.correlation) >= 0.8) return t.colors.successScale;
      if (n(stats.correlation) >= 0.6) return t.colors.warningScale;
      return t.colors.errorScale;
    }, [stats.correlation, t]);

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const divider = useMemo(() => createDividerStyle(t), [t]);

    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);


    return (
      <Box
        className={className}
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
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
            <ScatterChart size={16} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Calibration
            </Text>
          </Box>
          <Box style={{
            ...createBadgeStyle(t, n(stats.agreementRate) >= 0.7 ? 'success' : 'warning'),
            borderRadius: badgeRadius,
            padding: `1px ${t.spacing[2]}px`,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs }}>
              {(n(stats.agreementRate) * 100).toFixed(0)}%
            </Text>
          </Box>
        </Box>

        {/* Mini Scatter */}
        <Box style={{
          display: 'flex',
          justifyContent: 'center',
          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <svg
            width={cW}
            height={cH}
            viewBox={`0 0 ${cW} ${cH}`}
            role="img"
            aria-label={`Mini scatter plot with ${points.length} points`}
          >
            {/* Background grid */}
            {[0, 2.5, 5].map(v => (
              <g key={v}>
                <line x1={toX(v)} y1={cPad} x2={toX(v)} y2={cPad + pH} stroke={t.colors.neutral[100]} strokeWidth={0.5} />
                <line x1={cPad} y1={toY(v)} x2={cPad + pW} y2={toY(v)} stroke={t.colors.neutral[100]} strokeWidth={0.5} />
              </g>
            ))}

            {/* Diagonal */}
            {showDiagonal && (
              <line
                x1={toX(0)} y1={toY(0)}
                x2={toX(maxVal)} y2={toY(maxVal)}
                stroke={t.colors.neutral[200]}
                strokeWidth={1}
                strokeDasharray="4 3"
              />
            )}

            {/* Points */}
            {points.map((p) => {
              const isSelected = selectedPointId === p.id;
              return (
                <circle
                  key={p.id}
                  cx={toX(n(p.humanScore))}
                  cy={toY(n(p.aiScore))}
                  r={isSelected ? 4.5 : 3}
                  fill={getDeviationColor(n(p.deviation), t)}
                  stroke={isSelected ? t.colors.neutral[900] : t.colors.common.white}
                  strokeWidth={isSelected ? 1.5 : 1}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleClick(p.id)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(p.id); } }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${p.candidateName}: Human ${n(p.humanScore)}, AI ${n(p.aiScore)}`}
                />
              );
            })}
          </svg>
        </Box>

        {/* Stats Grid */}
        <Box style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: t.spacing[1],
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
        }}>
          {[
            { label: 'Correlation', value: n(stats.correlation).toFixed(2), color: correlationColor },
            { label: 'Mean Dev', value: n(stats.meanDeviation).toFixed(2), color: n(stats.meanDeviation) <= 0.5 ? t.colors.successScale : t.colors.warningScale },
            { label: 'Samples', value: String(n(stats.sampleCount)), color: t.colors.infoScale },
            { label: 'Agreement', value: `${(n(stats.agreementRate) * 100).toFixed(0)}%`, color: n(stats.agreementRate) >= 0.7 ? t.colors.successScale : t.colors.warningScale },
          ].map((s) => (
            <Box key={s.label} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], textAlign: 'center', padding: `${t.spacing[1]}px 0` }} role="status" aria-label={`${s.label}: ${s.value}`}>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
                color: s.color[700],
                display: 'block',
              }}>
                {s.value}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                {s.label}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>
    );
  },
});
