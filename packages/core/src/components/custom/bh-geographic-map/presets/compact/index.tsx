'use client';

/**
 * BhGeographicMap - Compact Preset
 * Condensed geographic widget with mini dot map and top regions.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Globe, MapPin,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createEmptyStateStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type { BhGeographicMapProps, GeoRegion } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function geoToSvg(lat: number, lon: number, width: number, height: number): { x: number; y: number } {
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
  { id: 'r-4', name: 'Bangalore', candidateCount: 203, latitude: 12.9716, longitude: 77.5946 },
];

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhGeographicMap = createPreset<BhGeographicMapProps>({
  name: 'BhGeographicMap.Compact',
  render: (ctx: PresetContext<BhGeographicMapProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      regions: rawRegions = MOCK_REGIONS,
      onRegionClick,
      selectedRegionId,
      className,
      style,
    } = props;

    const regions = Array.isArray(rawRegions) ? rawRegions : MOCK_REGIONS;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const handleClick = useCallback((id: string) => {
      onRegionClick?.(id);
    }, [onRegionClick]);

    const totalCandidates = useMemo(
      () => regions.reduce((sum, r) => sum + (r.candidateCount ?? 0), 0),
      [regions],
    );

    const maxCount = useMemo(
      () => Math.max(...regions.map(r => r.candidateCount ?? 0), 1),
      [regions],
    );

    const topRegions = useMemo(
      () => [...regions].sort((a, b) => (b.candidateCount ?? 0) - (a.candidateCount ?? 0)).slice(0, 4),
      [regions],
    );

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const miniW = 200;
    const miniH = 110;

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
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Globe size={16} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Regions
            </Text>
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
            {totalCandidates.toLocaleString()}
          </Text>
        </Box>

        {/* Mini map */}
        <Box style={{
          padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <svg
            width="100%"
            viewBox={`0 0 ${miniW} ${miniH}`}
            role="img"
            aria-label="Geographic distribution"
            style={{ maxWidth: miniW, display: 'block' }}
          >
            <rect x="0" y="0" width={miniW} height={miniH} fill={t.colors.neutral[50]} rx={4} />
            {regions.map((region) => {
              const pos = geoToSvg(region.latitude ?? 0, region.longitude ?? 0, miniW, miniH);
              const r = 3 + (((region.candidateCount ?? 0) / maxCount) * 8);
              const isSelected = selectedRegionId === region.id;

              return (
                <circle
                  key={region.id}
                  cx={pos.x}
                  cy={pos.y}
                  r={r}
                  fill={isSelected ? t.colors.primaryScale[600] : t.colors.primaryScale[400]}
                  opacity={0.7}
                  stroke={t.colors.common.white}
                  strokeWidth={1}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleClick((region.id ?? ''))}
                />
              );
            })}
          </svg>
        </Box>

        {/* Top regions list */}
        <Box role="list" aria-label="Top regions">
          {topRegions.map((region) => (
            <Box
              key={region.id}
              role="listitem"
              tabIndex={0}
              aria-label={`${region.name}: ${region.candidateCount ?? 0} candidates`}
              onClick={() => handleClick((region.id ?? ''))}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick((region.id ?? '')); } }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                borderBottom: `1px solid ${t.colors.neutral[50]}`,
                cursor: 'pointer',
                transition: `background-color ${t.motion.hover}`,
              }}
            >
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                <MapPin size={10} color={t.colors.primaryScale[500]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>
                  {region.name}
                </Text>
              </Box>
              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                {region.candidateCount ?? 0}
              </Text>
            </Box>
          ))}
          {regions.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No data
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
