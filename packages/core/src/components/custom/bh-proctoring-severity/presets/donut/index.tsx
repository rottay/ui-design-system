'use client';

/**
 * BhProctoringSeverity - Donut Preset
 * Interactive donut/ring chart showing event severity distribution.
 * Click a segment to filter by severity.
 */

import { useMemo, useCallback, useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getChartConfig,
  createPersonalitySectionHeaderStyle,
  createPersonalityAccentBar,
  getAccentAwareLayout,
} from '../../../helpers';
import type {
  BhProctoringSeverityProps,
  ProctoringEventSeverity,
  SeverityCount,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getSeverityColor(severity: ProctoringEventSeverity | string, t: DesignTokens): string {
  switch (severity) {
    case 'critical': return t.colors.errorScale[600];
    case 'high': return t.colors.errorScale[400];
    case 'medium': return t.colors.warningScale[500];
    case 'low': return t.colors.infoScale[500];
    default: return t.colors.neutral[400];
  }
}

function getSeverityLabel(severity: ProctoringEventSeverity): string {
  return (severity || '').charAt(0).toUpperCase() + (severity || '').slice(1);
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_SEVERITY: SeverityCount[] = [
  { severity: 'critical', count: 5 },
  { severity: 'high', count: 18 },
  { severity: 'medium', count: 42 },
  { severity: 'low', count: 62 },
];

/* ================================================================== */
/*  Donut Preset                                                       */
/* ================================================================== */

export const DonutBhProctoringSeverity = createPreset<BhProctoringSeverityProps>({
  name: 'BhProctoringSeverity.Donut',
  render: (ctx: PresetContext<BhProctoringSeverityProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const chartCfg = getChartConfig(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      severityCounts = [],
      onSeverityClick,
      selectedSeverity,
      showLabels = true,
      showPercentages = true,
      size = 180,
      className,
      style,
    } = props;

    const [hoveredSegment, setHoveredSegment] = useState<ProctoringEventSeverity | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const total = useMemo(() => severityCounts.reduce((s, d) => s + d.count, 0), [severityCounts]);

    const segments = useMemo(() => {
      if (total === 0) return [];
      let accumulated = 0;
      return severityCounts.map((d) => {
        const pct = d.count / total;
        const start = accumulated;
        accumulated += pct;
        return { ...d, start, pct };
      });
    }, [severityCounts, total]);

    const handleSegmentClick = useCallback((severity: ProctoringEventSeverity) => {
      onSeverityClick?.(severity);
    }, [onSeverityClick]);

    const cx = size / 2;
    const cy = size / 2;
    const r = (size / 2) - 20;
    const strokeWidth = 24;
    const circumference = 2 * Math.PI * r;

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    return (
      <Box
        className={className}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          fontFamily: 'inherit',
          ...animStyle,
          ...accentLayout.outer,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        <Box style={{ padding: t.spacing[5] }}>
          <Text style={{ ...sectionLabel, marginBottom: t.spacing[4] }}>Severity Distribution</Text>

          <Box style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: t.spacing[4],
          }}>
            {/* SVG Donut */}
            <Box style={{ position: 'relative', width: size, height: size }}>
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                role="img"
                aria-label={`Severity distribution: ${severityCounts.map(d => `${getSeverityLabel(d.severity)}: ${d.count}`).join(', ')}`}
                style={{ transform: 'rotate(-90deg)' }}
              >
                {/* Background circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={t.colors.neutral[100]}
                  strokeWidth={strokeWidth}
                />
                {/* Segments */}
                {segments.map((seg) => {
                  const isSelected = selectedSeverity === seg.severity;
                  const isHovered = hoveredSegment === seg.severity;
                  const opacity = selectedSeverity && !isSelected ? 0.3 : (isHovered ? 0.85 : 1);

                  return (
                    <circle
                      key={seg.severity}
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill="none"
                      stroke={getSeverityColor(seg.severity, t)}
                      strokeWidth={isSelected || isHovered ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={`${seg.pct * circumference} ${circumference}`}
                      strokeDashoffset={-seg.start * circumference}
                      strokeLinecap="round"
                      style={{
                        opacity,
                        cursor: 'pointer',
                        transition: `stroke-dasharray ${chartCfg.animationDuration}ms ease, stroke-width 0.2s ease, opacity 0.2s ease`,
                      }}
                      onMouseEnter={() => setHoveredSegment(seg.severity)}
                      onMouseLeave={() => setHoveredSegment(null)}
                      onClick={() => handleSegmentClick(seg.severity)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${getSeverityLabel(seg.severity)}: ${seg.count} events (${Math.round(seg.pct * 100)}%)`}
                    />
                  );
                })}
              </svg>

              {/* Center label */}
              <Box style={{ 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <Text style={{
                  fontSize: t.typography.fontSize['2xl'],
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.neutral[900],
                }}>
                  {hoveredSegment
                    ? severityCounts.find(s => s.severity === hoveredSegment)?.count ?? total
                    : total}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  {hoveredSegment ? getSeverityLabel(hoveredSegment) : 'Total'}
                </Text>
              </Box>
            </Box>

            {/* Legend */}
            {showLabels && (
              <Box style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: t.spacing[3],
                justifyContent: 'center',
              }} role="list" aria-label="Severity legend">
                {severityCounts.map((sc) => {
                  const isSelected = selectedSeverity === sc.severity;
                  const pct = total > 0 ? Math.round((sc.count / total) * 100) : 0;

                  return (
                    <Box
                      key={sc.severity}
                      role="listitem"
                      tabIndex={0}
                      onClick={() => handleSegmentClick(sc.severity)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSegmentClick(sc.severity); } }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: t.spacing[1],
                        cursor: 'pointer',
                        padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                        borderRadius: t.borderRadius.sm,
                        backgroundColor: isSelected ? t.colors.neutral[100] : 'transparent',
                        transition: `background-color ${t.motion.hover}`,
                      }}
                      aria-label={`${getSeverityLabel(sc.severity)}: ${sc.count} events`}
                    >
                      <Box style={{
                        width: 10, height: 10, borderRadius: t.borderRadius.full,
                        backgroundColor: getSeverityColor(sc.severity, t), flexShrink: 0,
                      }} />
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        color: t.colors.neutral[600],
                        fontWeight: isSelected ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal,
                      }}>
                        {getSeverityLabel(sc.severity)} ({sc.count})
                        {showPercentages && (
                          <Text style={{ color: t.colors.neutral[400], marginLeft: 4 }}>{pct}%</Text>
                        )}
                      </Text>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
