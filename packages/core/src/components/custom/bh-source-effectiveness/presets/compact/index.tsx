'use client';

/**
 * BhSourceEffectiveness - Compact Preset
 * Condensed source ranking with hire rate bars.
 */

import { useState, useMemo, useEffect } from 'react';
import { Globe, TrendingUp } from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhSourceEffectivenessProps, SourceMetrics } from '../../core';
import type { DesignTokens } from '../../../../../types';

const MOCK_SOURCES: SourceMetrics[] = [
  { source: 'Referrals', applicants: 95, qualified: 62, hired: 28, hireRate: 29.5, qualityScore: 94 },
  { source: 'LinkedIn', applicants: 420, qualified: 168, hired: 34, hireRate: 8.1, qualityScore: 82 },
  { source: 'Indeed', applicants: 680, qualified: 136, hired: 22, hireRate: 3.2, qualityScore: 58 },
  { source: 'Career Page', applicants: 310, qualified: 124, hired: 18, hireRate: 5.8, qualityScore: 72 },
];

export const CompactBhSourceEffectiveness = createPreset<BhSourceEffectivenessProps>({
  name: 'BhSourceEffectiveness.Compact',
  render: (ctx: PresetContext<BhSourceEffectivenessProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      sources: rawSources = MOCK_SOURCES,
      onSourceClick,
      selectedSource,
      className,
      style,
    } = props;

    const sources = Array.isArray(rawSources) ? rawSources : MOCK_SOURCES;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const sorted = useMemo(() => [...sources].sort((a, b) => b.hireRate - a.hireRate), [sources]);
    const maxRate = useMemo(() => Math.max(...sorted.map(s => s.hireRate), 1), [sorted]);

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
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Globe size={14} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Sources
            </Text>
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
            {sources.length} sources
          </Text>
        </Box>

        <Box role="list" aria-label="Source effectiveness" style={{ padding: `${t.spacing[2]}px 0` }}>
          {sorted.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>No sources</Text>
            </Box>
          )}
          {sorted.map((source) => {
            const barPct = (source.hireRate / maxRate) * 100;
            const isSelected = selectedSource === source.source;

            return (
              <Box
                key={source.source}
                role="listitem"
                tabIndex={0}
                aria-label={`${source.source}: ${source.hireRate}% hire rate`}
                onClick={() => onSourceClick?.(source.source)}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSourceClick?.(source.source);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  cursor: 'pointer',
                  backgroundColor: isSelected ? t.colors.primaryScale[50] : t.colors.common.white,
                  transition: `background-color ${t.motion.hover}`,
                }}
              >
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.medium,
                  color: t.colors.neutral[700],
                  width: 80,
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {source.source}
                </Text>
                <Box style={{ flex: 1 }}>
                  <Box style={{
                    height: 6,
                    borderRadius: t.borderRadius.full,
                    backgroundColor: t.colors.neutral[100],
                    overflow: 'hidden',
                  }}>
                    <Box style={{
                      height: '100%',
                      width: `${barPct}%`,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: source.hireRate >= 10
                        ? t.colors.successScale[500]
                        : source.hireRate >= 5
                          ? t.colors.warningScale[500]
                          : t.colors.errorScale[400],
                      transition: `width 400ms ease`,
                    }} />
                  </Box>
                </Box>
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.neutral[800],
                  width: 40,
                  textAlign: 'right',
                  flexShrink: 0,
                }}>
                  {source.hireRate}%
                </Text>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
