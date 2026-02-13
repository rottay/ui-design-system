'use client';

/**
 * BhGeographicMap - Map Preset
 * SVG bubble/dot map visualization positioned on a proportional canvas
 * based on latitude/longitude. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Globe, MapPin, Users,
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
  createEmptyStateStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type { BhGeographicMapProps, GeoRegion } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Convert lat/lon to SVG canvas position using Mercator-like projection */
function geoToSvg(lat: number, lon: number, width: number, height: number): { x: number; y: number } {
  // Simple equirectangular projection for the SVG canvas
  const x = ((lon + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_REGIONS: GeoRegion[] = [
  { id: 'r-1', name: 'San Francisco', candidateCount: 342, latitude: 37.7749, longitude: -122.4194 },
  { id: 'r-2', name: 'New York', candidateCount: 287, latitude: 40.7128, longitude: -74.006 },
  { id: 'r-3', name: 'London', candidateCount: 198, latitude: 51.5074, longitude: -0.1278 },
  { id: 'r-4', name: 'Berlin', candidateCount: 156, latitude: 52.52, longitude: 13.405 },
  { id: 'r-5', name: 'Tokyo', candidateCount: 134, latitude: 35.6762, longitude: 139.6503 },
  { id: 'r-6', name: 'Sydney', candidateCount: 89, latitude: -33.8688, longitude: 151.2093 },
  { id: 'r-7', name: 'Toronto', candidateCount: 112, latitude: 43.6532, longitude: -79.3832 },
  { id: 'r-8', name: 'Singapore', candidateCount: 78, latitude: 1.3521, longitude: 103.8198 },
  { id: 'r-9', name: 'Sao Paulo', candidateCount: 67, latitude: -23.5505, longitude: -46.6333 },
  { id: 'r-10', name: 'Bangalore', candidateCount: 203, latitude: 12.9716, longitude: 77.5946 },
];

/* ================================================================== */
/*  Map Preset                                                         */
/* ================================================================== */

export const MapBhGeographicMap = createPreset<BhGeographicMapProps>({
  name: 'BhGeographicMap.Map',
  render: (ctx: PresetContext<BhGeographicMapProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      regions = MOCK_REGIONS,
      title = 'Geographic Distribution',
      onRegionClick,
      selectedRegionId,
      loading,
      className,
      style,
    } = props;

    const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const handleClick = useCallback((id: string) => {
      onRegionClick?.(id);
    }, [onRegionClick]);

    const totalCandidates = useMemo(
      () => regions.reduce((sum, r) => sum + r.candidateCount, 0),
      [regions],
    );

    const maxCount = useMemo(
      () => Math.max(...regions.map(r => r.candidateCount), 1),
      [regions],
    );

    const svgWidth = 600;
    const svgHeight = 340;

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

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
                <Globe size={22} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  {title}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                  {totalCandidates.toLocaleString()} candidates across {regions.length} regions
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>
          {/* SVG Map */}
          <Box style={{ ...card, ...animStyle, marginBottom: t.spacing[6] }}>
            <Text style={{ ...sectionLabel, marginBottom: t.spacing[4] }}>Global Overview</Text>

            {regions.length === 0 ? (
              <Box style={createEmptyStateStyle(t)}>
                <Globe size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                  No geographic data available
                </Text>
              </Box>
            ) : (
              <Box style={{ width: '100%', maxWidth: svgWidth, margin: '0 auto' }}>
                <svg
                  width="100%"
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  role="img"
                  aria-label={`Geographic distribution map with ${regions.length} regions`}
                  style={{ display: 'block' }}
                >
                  {/* Background grid */}
                  <rect x="0" y="0" width={svgWidth} height={svgHeight} fill={t.colors.neutral[50]} rx={8} />
                  {/* Latitude lines */}
                  {[30, 60, 90, 120, 150].map(y => (
                    <line key={`lat-${y}`} x1={0} y1={y * (svgHeight / 180)} x2={svgWidth} y2={y * (svgHeight / 180)} stroke={t.colors.neutral[100]} strokeWidth={0.5} />
                  ))}
                  {/* Longitude lines */}
                  {[60, 120, 180, 240, 300].map(x => (
                    <line key={`lon-${x}`} x1={x * (svgWidth / 360)} y1={0} x2={x * (svgWidth / 360)} y2={svgHeight} stroke={t.colors.neutral[100]} strokeWidth={0.5} />
                  ))}

                  {/* Region bubbles */}
                  {regions.map((region) => {
                    const pos = geoToSvg(region.latitude, region.longitude, svgWidth, svgHeight);
                    const minR = 6;
                    const maxR = 28;
                    const r = minR + ((region.candidateCount / maxCount) * (maxR - minR));
                    const isHovered = hoveredRegion === region.id;
                    const isSelected = selectedRegionId === region.id;

                    return (
                      <g key={region.id}>
                        {/* Outer glow on hover/select */}
                        {(isHovered || isSelected) && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={r + 4}
                            fill="none"
                            stroke={t.colors.primaryScale[300]}
                            strokeWidth={2}
                            opacity={0.5}
                          />
                        )}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={r}
                          fill={isSelected ? t.colors.primaryScale[500] : t.colors.primaryScale[400]}
                          opacity={isHovered ? 0.9 : 0.7}
                          stroke={t.colors.common.white}
                          strokeWidth={1.5}
                          style={{
                            cursor: 'pointer',
                            transition: `opacity ${t.motion.hover}, r ${t.motion.hover}`,
                          }}
                          onClick={() => handleClick(region.id)}
                          onMouseEnter={() => setHoveredRegion(region.id)}
                          onMouseLeave={() => setHoveredRegion(null)}
                        />
                        {/* Label for larger bubbles */}
                        {r > 14 && (
                          <text
                            x={pos.x}
                            y={pos.y + 1}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill={t.colors.common.white}
                            fontSize={9}
                            fontWeight={600}
                            style={{ pointerEvents: 'none' }}
                          >
                            {region.candidateCount}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </Box>
            )}
          </Box>

          {/* Region List */}
          <Box style={{ ...card, padding: 0 }}>
            <Box style={{
              padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
              borderBottom: `1px solid ${t.colors.neutral[100]}`,
              backgroundColor: t.colors.neutral[50],
              borderRadius: `${t.borderRadius.lg} ${t.borderRadius.lg} 0 0`,
            }}>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[800],
                textTransform: ptypo.labelTransform,
                letterSpacing: ptypo.labelLetterSpacing,
              }}>
                Top Regions
              </Text>
            </Box>
            <Box role="list" aria-label="Candidate regions">
              {[...regions].sort((a, b) => b.candidateCount - a.candidateCount).map((region) => {
                const pct = totalCandidates > 0 ? (region.candidateCount / totalCandidates) * 100 : 0;
                const isSelected = selectedRegionId === region.id;
                return (
                  <Box
                    key={region.id}
                    role="listitem"
                    tabIndex={0}
                    aria-label={`${region.name}: ${region.candidateCount} candidates`}
                    onClick={() => handleClick(region.id)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(region.id); } }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
                      borderBottom: `1px solid ${t.colors.neutral[100]}`,
                      cursor: 'pointer',
                      backgroundColor: isSelected ? t.colors.primaryScale[50] : t.colors.common.white,
                      transition: `background-color ${t.motion.hover}`,
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                      <MapPin size={14} color={t.colors.primaryScale[500]} />
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        fontWeight: t.typography.fontWeight.medium,
                        color: t.colors.neutral[800],
                      }}>
                        {region.name}
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                        {pct.toFixed(1)}%
                      </Text>
                      <Box style={{
                        ...createBadgeStyle(t, 'primary'),
                        borderRadius: badgeRadius,
                      }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>{region.candidateCount}</Text>
                      </Box>
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
