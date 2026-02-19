'use client';

/**
 * BhRecruiterPerformance - Compact Preset
 * Condensed recruiter leaderboard with key metrics.
 */

import { useMemo } from 'react';
import {
  Award, TrendingUp, ChevronRight,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhRecruiterPerformanceProps, RecruiterPerformanceItem } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhRecruiterPerformance = createPreset<BhRecruiterPerformanceProps>({
  name: 'BhRecruiterPerformance.Compact',
  render: (ctx: PresetContext<BhRecruiterPerformanceProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      recruiters: rawRecruiters = [],
      selectedRecruiterId,
      onRecruiterClick,
      className,
      style,
    } = props;

    const recruiters = Array.isArray(rawRecruiters) ? rawRecruiters : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const sorted = useMemo(() => [...(recruiters ?? [])].sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0)), [recruiters]);

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
            <Award size={16} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Performance
            </Text>
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
            {(recruiters ?? []).length} recruiters
          </Text>
        </Box>

        {/* Leaderboard */}
        <Box role="list" aria-label="Recruiter leaderboard">
          {sorted.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No data
              </Text>
            </Box>
          )}
          {sorted.map((r, i) => {
            const isSelected = selectedRecruiterId === r.recruiterId;
            return (
              <Box
                key={r.recruiterId}
                role="listitem"
                tabIndex={0}
                aria-label={`${i + 1}. ${r.name ?? ''}: Quality ${r.qualityScore ?? 0}, ${r.hires ?? 0} hires`}
                onClick={() => onRecruiterClick?.((r.recruiterId ?? ''))}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRecruiterClick?.((r.recruiterId ?? '')); } }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                  cursor: 'pointer',
                  backgroundColor: isSelected ? t.colors.primaryScale[50] : t.colors.common.white,
                  transition: `background-color ${t.motion.hover}`,
                }}
              >
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.bold,
                  color: i === 0 ? t.colors.warningScale[600] : t.colors.neutral[400],
                  width: 16,
                  textAlign: 'center',
                }}>
                  {i + 1}
                </Text>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1, minWidth: 0 }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.medium,
                    color: t.colors.neutral[800],
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {r.name ?? ''}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                    {r.hires ?? 0} hires / {r.timeToFill ?? 0}d TTF
                  </Text>
                </Box>
                <Box style={{
                  ...createBadgeStyle(t, (r.qualityScore ?? 0) >= 85 ? 'success' : (r.qualityScore ?? 0) >= 70 ? 'warning' : 'error'),
                  borderRadius: badgeRadius,
                  padding: `1px ${t.spacing[2]}px`,
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{r.qualityScore ?? 0}</Text>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
