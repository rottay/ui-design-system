'use client';

/**
 * BhSkillGapDashboard - Compact Preset
 * Condensed skill gap summary widget with top gaps and summary stats.
 */

import { useMemo, useCallback} from 'react';
import {
  Target, TrendingDown, ChevronRight,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createEmptyStateStyle,
  createProgressBarStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,

  createCardHoverStyles,
  createDividerStyle,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { BhSkillGapDashboardProps, SkillGapData } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getPriorityBadgeKey(priority: SkillGapData['priority']): 'error' | 'warning' | 'success' {
  switch (priority) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low':
    default: return 'success';
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhSkillGapDashboard = createPreset<BhSkillGapDashboardProps>({
  name: 'BhSkillGapDashboard.Compact',
  render: (ctx: PresetContext<BhSkillGapDashboardProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      skills: rawSkills = [],
      onSkillClick,
      className,
      style,
    } = props;

    const skills = Array.isArray(rawSkills) ? rawSkills : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const handleClick = useCallback((skill: string) => {
      onSkillClick?.(skill);
    }, [onSkillClick]);

    const sortedSkills = useMemo(
      () => [...skills].sort((a, b) => (b.gap ?? 0) - (a.gap ?? 0)).slice(0, 5),
      [skills],
    );

    const highCount = useMemo(() => skills.filter(s => s.priority === 'high').length, [skills]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

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
            <Target size={16} color={t.colors.warningScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Skill Gaps
            </Text>
          </Box>
          {highCount > 0 && (
            <Box style={{
              ...createBadgeStyle(t, 'error'),
              borderRadius: badgeRadius,
              padding: `1px ${t.spacing[2]}px`,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{highCount} critical</Text>
            </Box>
          )}
        </Box>

        {/* Skill list */}
        <Box role="list" aria-label="Top skill gaps">
          {sortedSkills.map((skill) => {
            const skillName = skill.skill ?? 'Unknown';
            const gap = skill.gap ?? 0;
            const candidatePool = skill.candidatePool ?? 0;
            const priority = skill.priority;
            return (
            <Box
              key={skillName}
              role="listitem"
              tabIndex={0}
              aria-label={`${skillName}: gap ${gap}%`}
              onClick={() => handleClick(skillName)}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(skillName); } }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing[2],
                padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                borderBottom: `1px solid ${t.colors.neutral[50]}`,
                cursor: 'pointer',
                transition: `background-color ${t.motion.hover}`,
              }}
            >
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.medium,
                    color: t.colors.neutral[800],
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {skillName}
                  </Text>
                  <Box style={{
                    ...createBadgeStyle(t, getPriorityBadgeKey(priority)),
                    borderRadius: badgeRadius,
                    padding: `0px ${t.spacing[1]}px`,
                  }}>
                    <Text style={{ fontSize: 9 }}>{priority ?? 'none'}</Text>
                  </Box>
                </Box>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                  Gap: {gap}% | Pool: {candidatePool}
                </Text>
              </Box>
              <ChevronRight size={12} color={t.colors.neutral[300]} />
            </Box>
            );
          })}
          {skills.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No gaps found
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
