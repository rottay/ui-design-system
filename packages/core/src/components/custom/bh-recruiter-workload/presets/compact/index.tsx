'use client';

/**
 * BhRecruiterWorkloadItem - Compact Preset
 * Condensed workload bars for sidebar or widget placement.
 */

import { useMemo } from 'react';
import {
  Scale, AlertTriangle,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createProgressBarStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,

  createPersonalityAccentBar,
  createCardHoverStyles,
  createDividerStyle,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { BhRecruiterWorkloadItemProps, RecruiterWorkloadItem } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getUtilizationColor(pct: number, t: DesignTokens): string {
  if (pct > 100) return t.colors.errorScale[500];
  if (pct >= 85) return t.colors.warningScale[500];
  return t.colors.successScale[500];
}

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

const CompactBhRecruiterWorkloadItem = createPreset<BhRecruiterWorkloadItemProps>({
  name: 'BhRecruiterWorkload.Compact',
  render: (ctx: PresetContext<BhRecruiterWorkloadItemProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      recruiters: rawRecruiters = [],
      className,
      style,
    } = props;

    const recruiters = Array.isArray(rawRecruiters) ? rawRecruiters : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const overloadedCount = useMemo(() => (recruiters ?? []).filter(r => (r.activePositions ?? 0) > (r.capacity ?? 0)).length, [recruiters]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

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
            <Scale size={16} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Workload
            </Text>
          </Box>
          {overloadedCount > 0 && (
            <Box style={{
              ...createBadgeStyle(t, 'error'),
              borderRadius: badgeRadius,
              padding: `1px ${t.spacing[2]}px`,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{overloadedCount} over</Text>
            </Box>
          )}
        </Box>

        {/* Workload bars */}
        <Box style={{ padding: `${t.spacing[2]}px ${t.spacing[4]}px` }}>
          {recruiters.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No data
              </Text>
            </Box>
          )}
          {(recruiters ?? []).map((r) => {
            const pct = Math.round(((r.activePositions ?? 0) / Math.max(r.capacity ?? 1, 1)) * 100);
            const color = getUtilizationColor(pct, t);
            const bar = createProgressBarStyle(t, { percent: Math.min(pct, 100), color });
            return (
              <Box key={r.recruiterId} style={{ marginBottom: t.spacing[2] }}>
                <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>{r.name ?? ''}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: pct > 100 ? t.colors.errorScale[600] : t.colors.neutral[500] }}>
                    {pct}%
                  </Text>
                </Box>
                <Box style={bar.track}><Box style={bar.fill} /></Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});

// Export with the canonical name (barrel expects this) + legacy alias
export { CompactBhRecruiterWorkloadItem as CompactBhRecruiterWorkload };
export { CompactBhRecruiterWorkloadItem };
