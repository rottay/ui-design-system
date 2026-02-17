'use client';

/**
 * BhProctoringSeverity - Bars Preset
 * Horizontal bar chart showing event severity distribution.
 * Click a bar to filter by severity.
 */

import { useMemo, useCallback, useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createEntranceAnimation,
  createStaggerDelay,
  getPersonalityTypography,
  getChartConfig,
  createPersonalitySectionHeaderStyle,
  createPersonalityAccentBar,
  createProgressBarStyle,
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

// Label helpers from scoring domain (centralized, no duplication)
import { getSeverityLabel } from '@rottay/scoring';

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
/*  Bars Preset                                                        */
/* ================================================================== */

export const BarsBhProctoringSeverity = createPreset<BhProctoringSeverityProps>({
  name: 'BhProctoringSeverity.Bars',
  render: (ctx: PresetContext<BhProctoringSeverityProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const chartCfg = getChartConfig(t);

    const {
      severityCounts: rawSeverityCounts = [],
      onSeverityClick,
      selectedSeverity,
      showLabels = true,
      showPercentages = true,
      className,
      style,
    } = props;

    const severityCounts = Array.isArray(rawSeverityCounts) ? rawSeverityCounts : [];

    const [hoveredBar, setHoveredBar] = useState<ProctoringEventSeverity | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const total = useMemo(() => severityCounts.reduce((s, d) => s + d.count, 0), [severityCounts]);
    const maxCount = useMemo(() => Math.max(...severityCounts.map(s => s.count), 1), [severityCounts]);

    const handleBarClick = useCallback((severity: ProctoringEventSeverity) => {
      onSeverityClick?.(severity);
    }, [onSeverityClick]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    return (
      <Box
        className={className}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          fontFamily: 'inherit',
          ...entrance.animate,
          transition: entrance.transition,
          ...accentLayout.outer,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        <Box style={{ padding: t.spacing[5] }}>
          <Box style={{ display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: t.spacing[4],
          }}>
            <Text style={sectionLabel}>Severity Distribution</Text>
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.neutral[400],
            }}>
              {total} total
            </Text>
          </Box>

          <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
            {severityCounts.map((sc, i) => {
              const isSelected = selectedSeverity === sc.severity;
              const isHovered = hoveredBar === sc.severity;
              const barPct = (sc.count / maxCount) * 100;
              const totalPct = total > 0 ? Math.round((sc.count / total) * 100) : 0;
              const dimmed = selectedSeverity && !isSelected;

              return (
                <Box
                  key={sc.severity}
                  role="button"
                  tabIndex={0}
                  aria-label={`${getSeverityLabel(sc.severity)}: ${sc.count} events (${totalPct}%)`}
                  aria-pressed={isSelected}
                  onClick={() => handleBarClick(sc.severity)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleBarClick(sc.severity); } }}
                  onMouseEnter={() => setHoveredBar(sc.severity)}
                  onMouseLeave={() => setHoveredBar(null)}
                  style={{
                    cursor: 'pointer',
                    opacity: dimmed ? 0.4 : 1,
                    padding: `${t.spacing[2]}px ${t.spacing[2]}px`,
                    borderRadius: t.borderRadius.md,
                    backgroundColor: isSelected
                      ? t.colors.neutral[50]
                      : isHovered
                        ? t.colors.neutral[50]
                        : 'transparent',
                    ...animStyle(i),
                  }}
                >
                  {/* Label row */}
                  <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: t.spacing[1],
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Box style={{
                        width: 10, height: 10,
                        borderRadius: t.borderRadius.full,
                        backgroundColor: getSeverityColor(sc.severity, t),
                        flexShrink: 0,
                      }} />
                      {showLabels && (
                        <Text style={{
                          fontSize: t.typography.fontSize.sm,
                          fontWeight: isSelected ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
                          color: t.colors.neutral[700],
                        }}>
                          {getSeverityLabel(sc.severity)}
                        </Text>
                      )}
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        fontWeight: t.typography.fontWeight.bold,
                        color: t.colors.neutral[900],
                      }}>
                        {sc.count}
                      </Text>
                      {showPercentages && (
                        <Text style={{
                          fontSize: t.typography.fontSize.xs,
                          color: t.colors.neutral[400],
                          minWidth: 32,
                          textAlign: 'right' as const,
                        }}>
                          {totalPct}%
                        </Text>
                      )}
                    </Box>
                  </Box>

                  {/* Bar */}
                  <Box style={{
                    height: 8,
                    borderRadius: t.borderRadius.full,
                    backgroundColor: t.colors.neutral[100],
                    overflow: 'hidden',
                  }}>
                    <Box style={{
                      height: '100%',
                      width: `${barPct}%`,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: getSeverityColor(sc.severity, t),
                      transition: `width ${chartCfg.animationDuration}ms ease`,
                    }} />
                  </Box>
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
