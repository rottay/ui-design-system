'use client';

/**
 * BhCandidateComparison - Overlay Preset
 * Radar chart overlay with all candidates on one chart.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Users, ArrowUpDown } from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalityAccentBar,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  getAccentAwareLayout,
} from '../../../helpers';
import type { BhCandidateComparisonProps, ComparisonCandidate } from '../../core';
import { getCandidateFullName } from '../../core';
import type { DesignTokens } from '../../../../../types';
import type { DBCandidate } from '@rottay/recruiter';

function getCandidateColor(index: number, t: DesignTokens): string {
  const palette = [t.colors.primaryScale[500], t.colors.successScale[500], t.colors.warningScale[500], t.colors.infoScale[500]];
  return palette[index % palette.length];
}

export const OverlayBhCandidateComparison = createPreset<BhCandidateComparisonProps>({
  name: 'BhCandidateComparison.Overlay',
  render: (ctx: PresetContext<BhCandidateComparisonProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      candidates: rawCandidates = [],
      dimensions,
      title = 'Candidate Radar',
      onCandidateSelect,
      highlightedId,
      className,
      style,
    } = props;

    const candidates = Array.isArray(rawCandidates) ? rawCandidates : [];

    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const dims = useMemo(() => {
      if (dimensions && dimensions.length > 0) return dimensions;
      if (candidates.length > 0) return Object.keys(candidates[0].scores);
      return [];
    }, [dimensions, candidates]);

    /* Radar geometry */
    const size = 280;
    const cx = size / 2;
    const cy = size / 2;
    const maxRadius = size / 2 - 40;

    const getPoint = useCallback((dimIndex: number, value: number) => {
      const angle = (2 * Math.PI * dimIndex) / dims.length - Math.PI / 2;
      const r = (value / 100) * maxRadius;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    }, [dims.length, maxRadius, cx, cy]);

    const getPolygonPoints = useCallback((scores: Record<string, number>) => {
      return dims.map((dim, i) => {
        const p = getPoint(i, scores[dim] ?? 0);
        return `${p.x},${p.y}`;
      }).join(' ');
    }, [dims, getPoint]);

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
          ...animStyle,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[50] })}>
              <ArrowUpDown size={20} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
              }}>
                {title}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                {candidates.length} candidates overlaid
              </Text>
            </Box>
          </Box>
        </Box>

        {candidates.length === 0 || dims.length === 0 ? (
          <Box style={createEmptyStateStyle(t)}>
            <Users size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
              No candidates to compare
            </Text>
          </Box>
        ) : (
          <Box style={{ padding: t.spacing[5] }}>
            {/* Radar Chart */}
            <Box style={{ display: 'flex', justifyContent: 'center', marginBottom: t.spacing[4] }}>
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                role="img"
                aria-label={`Radar chart comparing ${candidates.map(c => getCandidateFullName(c.candidate)).join(', ')}`}
              >
                {/* Grid rings */}
                {[20, 40, 60, 80, 100].map(level => {
                  const points = dims.map((_, i) => {
                    const p = getPoint(i, level);
                    return `${p.x},${p.y}`;
                  }).join(' ');
                  return (
                    <polygon
                      key={level}
                      points={points}
                      fill="none"
                      stroke={t.colors.neutral[100]}
                      strokeWidth={1}
                    />
                  );
                })}

                {/* Axis lines */}
                {dims.map((_, i) => {
                  const p = getPoint(i, 100);
                  return (
                    <line
                      key={i}
                      x1={cx}
                      y1={cy}
                      x2={p.x}
                      y2={p.y}
                      stroke={t.colors.neutral[100]}
                      strokeWidth={1}
                    />
                  );
                })}

                {/* Dimension labels */}
                {dims.map((dim, i) => {
                  const p = getPoint(i, 115);
                  return (
                    <text
                      key={dim}
                      x={p.x}
                      y={p.y}
                      fill={t.colors.neutral[500]}
                      fontSize={10}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {dim}
                    </text>
                  );
                })}

                {/* Candidate polygons */}
                {candidates.slice(0, 4).map((compCandidate, ci) => {
                  const color = getCandidateColor(ci, t);
                  const isActive = hoveredId === null || hoveredId === compCandidate.candidate.id || highlightedId === compCandidate.candidate.id;
                  return (
                    <g key={compCandidate.candidate.id} style={{ transition: `opacity ${t.motion.hover}` }} opacity={isActive ? 1 : 0.15}>
                      <polygon
                        points={getPolygonPoints(compCandidate.scores)}
                        fill={color}
                        fillOpacity={0.1}
                        stroke={color}
                        strokeWidth={2}
                        strokeLinejoin="round"
                      />
                      {dims.map((dim, di) => {
                        const p = getPoint(di, compCandidate.scores[dim] ?? 0);
                        return (
                          <circle
                            key={di}
                            cx={p.x}
                            cy={p.y}
                            r={3}
                            fill={t.colors.common.white}
                            stroke={color}
                            strokeWidth={2}
                          />
                        );
                      })}
                    </g>
                  );
                })}
              </svg>
            </Box>

            {/* Legend */}
            <Box style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: t.spacing[3],
            }}>
              {candidates.slice(0, 4).map((compCandidate, ci) => {
                const color = getCandidateColor(ci, t);
                const cand = compCandidate.candidate;
                const name = getCandidateFullName(cand);
                const isActive = hoveredId === null || hoveredId === cand.id;
                const avgScore = dims.length > 0
                  ? Math.round(dims.reduce((s, d) => s + (compCandidate.scores[d] ?? 0), 0) / dims.length)
                  : 0;

                return (
                  <Box
                    key={cand.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`${name}: avg ${avgScore}`}
                    onMouseEnter={() => setHoveredId(cand.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => onCandidateSelect?.(cand.id)}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onCandidateSelect?.(cand.id);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: t.spacing[2],
                      padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                      borderRadius: badgeRadius,
                      border: `1px solid ${isActive ? color : t.colors.neutral[200]}`,
                      cursor: 'pointer',
                      opacity: isActive ? 1 : 0.5,
                      transition: `all ${t.motion.hover}`,
                    }}
                  >
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                      width: 10,
                      height: 10,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: color,
                      flexShrink: 0,
                    }} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>
                      {name}
                    </Text>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.bold,
                      color: t.colors.neutral[900],
                    }}>
                      {avgScore}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
        </Box>
      </Box>
    );
  },
});
