'use client';

/**
 * BhSkillGapDashboard - Dashboard Preset
 * Full skill gap analysis view with bar chart visualization,
 * priority badges, candidate pool indicators, and summary stats.
 */

import { useState, useMemo, useCallback} from 'react';
import {
  Target, TrendingDown, TrendingUp, Users,
  AlertTriangle, ChevronRight, BarChart3, Zap,
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
  createProgressBarStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,

  createDividerStyle,
  formatAbbreviated,
} from '../../../helpers';
import type { BhSkillGapDashboardProps, SkillGapData } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getPriorityColor(priority: SkillGapData['priority'], t: any): string {
  switch (priority) {
    case 'high': return t.colors.errorScale[600];
    case 'medium': return t.colors.warningScale[600];
    case 'low': return t.colors.successScale[600];
    default: return t.colors.neutral[400];
  }
}

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
/*  Dashboard Preset                                                   */
/* ================================================================== */

export const DashboardBhSkillGapDashboard = createPreset<BhSkillGapDashboardProps>({
  name: 'BhSkillGapDashboard.Dashboard',
  render: (ctx: PresetContext<BhSkillGapDashboardProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      skills: rawSkills = [],
      department,
      title = 'Skill Gap Analysis',
      onSkillClick,
      loading,
      className,
      style,
    } = props;

    const skills = Array.isArray(rawSkills) ? rawSkills : [];

    const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const handleSkillClick = useCallback((skill: string) => {
      onSkillClick?.(skill);
    }, [onSkillClick]);

    const sortedSkills = useMemo(
      () => [...skills].sort((a, b) => (b.gap ?? 0) - (a.gap ?? 0)),
      [skills],
    );

    const stats = useMemo(() => {
      const highPriority = skills.filter(s => s.priority === 'high').length;
      const avgGap = skills.length > 0 ? skills.reduce((sum, s) => sum + (s.gap ?? 0), 0) / skills.length : 0;
      const totalPool = skills.reduce((sum, s) => sum + (s.candidatePool ?? 0), 0);
      return { highPriority, avgGap, totalPool };
    }, [skills]);

    const maxGap = useMemo(() => Math.max(...skills.map(s => s.gap ?? 0), 1), [skills]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    const divider = useMemo(() => createDividerStyle(t), [t]);

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
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
            <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.warningScale[50] })}>
              <Target size={22} color={t.colors.warningScale[600]} />
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
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                {department ? `${department} Department` : 'Organization-wide skill gap overview'}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>

          {/* Stats Row */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: t.spacing[4],
            marginBottom: t.spacing[7],
          }}>
            {[
              { label: 'High Priority Gaps', value: stats.highPriority, icon: AlertTriangle, color: t.colors.errorScale },
              { label: 'Average Gap', value: `${(stats.avgGap ?? 0).toFixed(1)}%`, icon: TrendingDown, color: t.colors.warningScale },
              { label: 'Total Skills', value: skills.length, icon: BarChart3, color: t.colors.primaryScale },
              { label: 'Candidate Pool', value: (stats.totalPool ?? 0).toLocaleString(), icon: Users, color: t.colors.infoScale },
            ].map((sc, i) => {
              const Icon = sc.icon;
              return (
                <Box
                  key={sc.label}
                  style={{ ...card, ...hoverStyles.base, ...animStyle(i) }}
                  role="status"
                  aria-label={`${sc.label}: ${sc.value}`}
                >
                  {accentBar && <Box style={accentBar} />}

                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                    <Box style={createIconContainerStyle(t, { size: 32, color: sc.color[50] })}>
                      <Icon size={16} color={sc.color[600]} />
                    </Box>
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Text style={{
                      fontSize: t.typography.fontSize['2xl'],
                      fontWeight: t.typography.fontWeight.bold,
                      color: t.colors.neutral[900],
                      display: 'block',
                    }}>
                      {sc.value}
                    </Text>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      color: t.colors.neutral[500],
                      textTransform: ptypo.labelTransform,
                      letterSpacing: ptypo.labelLetterSpacing,
                    }}>
                      {sc.label}
                    </Text>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Skill Gap Bars */}
          <Box style={{ ...card, ...animStyle(4), padding: 0 }}>
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
                Skill Gaps by Severity
              </Text>
            </Box>

            <Box role="list" aria-label="Skills ranked by gap size">
              {sortedSkills.length === 0 && (
                <Box style={createEmptyStateStyle(t)}>
                  <Target size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                    No skill gap data available
                  </Text>
                </Box>
              )}
              {sortedSkills.map((skill) => {
                const skillName = skill.skill ?? 'Unknown';
                const gap = skill.gap ?? 0;
                const current = skill.current ?? 0;
                const required = skill.required ?? 0;
                const candidatePool = skill.candidatePool ?? 0;
                const priority = skill.priority;
                const isHovered = hoveredSkill === skillName;
                const barPct = (gap / maxGap) * 100;
                const gapColor = getPriorityColor(priority, t);

                return (
                  <Box
                    key={skillName}
                    role="listitem"
                    tabIndex={0}
                    aria-label={`${skillName}: gap ${gap}%, priority ${priority ?? 'none'}`}
                    onClick={() => handleSkillClick(skillName)}
                    onMouseEnter={() => setHoveredSkill(skillName)}
                    onMouseLeave={() => setHoveredSkill(null)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSkillClick(skillName); } }}
                    style={{
                      padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
                      borderBottom: `1px solid ${t.colors.neutral[100]}`,
                      cursor: 'pointer',
                      backgroundColor: isHovered ? t.colors.neutral[50] : t.colors.common.white,
                      transition: `background-color ${t.motion.hover}`,
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Text style={{
                          fontSize: t.typography.fontSize.sm,
                          fontWeight: t.typography.fontWeight.semibold,
                          color: t.colors.neutral[900],
                        }}>
                          {skillName}
                        </Text>
                        <Box style={{
                          ...createBadgeStyle(t, getPriorityBadgeKey(priority)),
                          borderRadius: badgeRadius,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>{priority ?? 'none'}</Text>
                        </Box>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                          <Users size={12} color={t.colors.neutral[400]} />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                            {candidatePool}
                          </Text>
                        </Box>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: gapColor }}>
                          -{gap}%
                        </Text>
                        <ChevronRight size={14} color={t.colors.neutral[300]} />
                      </Box>
                    </Box>
                    {/* Gap bar */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], width: 50 }}>
                        {current}%
                      </Text>
                      <Box style={{
                        flex: 1,
                        height: 8,
                        borderRadius: t.borderRadius.full,
                        backgroundColor: t.colors.neutral[100],
                        overflow: 'hidden',
                      }}>
                        <Box style={{
                          height: '100%',
                          width: `${barPct}%`,
                          borderRadius: t.borderRadius.full,
                          backgroundColor: gapColor,
                          transition: `width ${t.motion.hover}`,
                        }} />
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], width: 50, textAlign: 'right' }}>
                        {required}%
                      </Text>
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
