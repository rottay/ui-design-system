'use client';

/**
 * BhSkillGapDashboard - Compact Preset
 * Condensed skill gap summary widget with top gaps and summary stats.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
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
} from '../../../helpers';
import type { BhSkillGapDashboardProps, SkillGapData } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getPriorityBadgeKey(priority: SkillGapData['priority']): 'error' | 'warning' | 'success' {
  switch (priority) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'success';
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_SKILLS: SkillGapData[] = [
  { skill: 'React/TypeScript', required: 95, current: 72, gap: 23, priority: 'high', candidatePool: 145 },
  { skill: 'System Design', required: 90, current: 65, gap: 25, priority: 'high', candidatePool: 89 },
  { skill: 'Cloud Architecture', required: 85, current: 70, gap: 15, priority: 'medium', candidatePool: 112 },
];

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhSkillGapDashboard = createPreset<BhSkillGapDashboardProps>({
  name: 'BhSkillGapDashboard.Compact',
  render: (ctx: PresetContext<BhSkillGapDashboardProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      skills = MOCK_SKILLS,
      onSkillClick,
      className,
      style,
    } = props;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const handleClick = useCallback((skill: string) => {
      onSkillClick?.(skill);
    }, [onSkillClick]);

    const sortedSkills = useMemo(
      () => [...skills].sort((a, b) => b.gap - a.gap).slice(0, 5),
      [skills],
    );

    const highCount = useMemo(() => skills.filter(s => s.priority === 'high').length, [skills]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

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
          {sortedSkills.map((skill) => (
            <Box
              key={skill.skill}
              role="listitem"
              tabIndex={0}
              aria-label={`${skill.skill}: gap ${skill.gap}%`}
              onClick={() => handleClick(skill.skill)}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(skill.skill); } }}
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
                    {skill.skill}
                  </Text>
                  <Box style={{
                    ...createBadgeStyle(t, getPriorityBadgeKey(skill.priority)),
                    borderRadius: badgeRadius,
                    padding: `0px ${t.spacing[1]}px`,
                  }}>
                    <Text style={{ fontSize: 9 }}>{skill.priority}</Text>
                  </Box>
                </Box>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                  Gap: {skill.gap}% | Pool: {skill.candidatePool}
                </Text>
              </Box>
              <ChevronRight size={12} color={t.colors.neutral[300]} />
            </Box>
          ))}
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
