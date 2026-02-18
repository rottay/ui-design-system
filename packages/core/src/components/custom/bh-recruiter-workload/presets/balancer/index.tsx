'use client';

/**
 * BhRecruiterWorkloadItem - Balancer Preset
 * Visual workload distribution with capacity gauges and utilization bars.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Scale, Users, Briefcase, Calendar, ListTodo,
  AlertTriangle, ChevronRight,
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
  createEmptyStateStyle,
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
  if (pct >= 50) return t.colors.successScale[500];
  return t.colors.infoScale[500];
}

function getUtilizationBadgeKey(pct: number): 'error' | 'warning' | 'success' | 'info' {
  if (pct > 100) return 'error';
  if (pct >= 85) return 'warning';
  if (pct >= 50) return 'success';
  return 'info';
}

/* ================================================================== */
/*  Balancer Preset                                                    */
/* ================================================================== */

const BalancerBhRecruiterWorkloadItem = createPreset<BhRecruiterWorkloadItemProps>({
  name: 'BhRecruiterWorkload.Balancer',
  render: (ctx: PresetContext<BhRecruiterWorkloadItemProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      recruiters: rawRecruiters = [],
      onRebalance,
      selectedRecruiterId,
      loading,
      className,
      style,
    } = props;

    const recruiters = Array.isArray(rawRecruiters) ? rawRecruiters : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const overloadedCount = useMemo(() => (recruiters ?? []).filter(r => (r.activePositions ?? 0) > (r.capacity ?? 0)).length, [recruiters]);
    const avgUtilization = useMemo(() => {
      if ((recruiters ?? []).length === 0) return 0;
      return Math.round((recruiters ?? []).reduce((s, r) => s + ((r.activePositions ?? 0) / Math.max(r.capacity ?? 1, 1)) * 100, 0) / (recruiters ?? []).length);
    }, [recruiters]);

    const sorted = useMemo(() => [...(recruiters ?? [])].sort((a, b) => ((b.activePositions ?? 0) / Math.max(b.capacity ?? 1, 1)) - ((a.activePositions ?? 0) / Math.max(a.capacity ?? 1, 1))), [recruiters]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
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
                <Scale size={22} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  Workload Balancer
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                  Monitor and rebalance recruiter workload distribution
                </Text>
              </Box>
            </Box>
            {overloadedCount > 0 && (
              <Box style={{
                ...createBadgeStyle(t, 'error'),
                borderRadius: badgeRadius,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <AlertTriangle size={12} />
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{overloadedCount} overloaded</Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>
          {/* Summary */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: t.spacing[4],
            marginBottom: t.spacing[6],
          }}>
            {[
              { label: 'Avg Utilization', value: `${avgUtilization}%`, icon: Scale, color: avgUtilization > 100 ? t.colors.errorScale : t.colors.primaryScale },
              { label: 'Total Interviews', value: (recruiters ?? []).reduce((s, r) => s + (r.interviews ?? 0), 0), icon: Calendar, color: t.colors.infoScale },
              { label: 'Pending Tasks', value: (recruiters ?? []).reduce((s, r) => s + (r.pendingTasks ?? 0), 0), icon: ListTodo, color: t.colors.warningScale },
            ].map((stat, i) => {
              const StatIcon = stat.icon;
              return (
                <Box key={stat.label} style={{ ...card, ...animStyle(i) }} role="status" aria-label={`${stat.label}: ${stat.value}`}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                    <Box style={createIconContainerStyle(t, { size: 36, color: stat.color[50] })}>
                      <StatIcon size={18} color={stat.color[600]} />
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                        {stat.value}
                      </Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>
                        {stat.label}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Workload cards */}
          <Text style={{ ...sectionLabel, marginBottom: t.spacing[3] }}>Team Workload</Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
            {sorted.map((r, i) => {
              const utilization = Math.round(((r.activePositions ?? 0) / Math.max(r.capacity ?? 1, 1)) * 100);
              const isOverloaded = utilization > 100;
              const color = getUtilizationColor(utilization, t);
              const bar = createProgressBarStyle(t, { percent: Math.min(utilization, 100), color });
              const isSelected = selectedRecruiterId === r.recruiterId;

              return (
                <Box
                  key={r.recruiterId}
                  style={{
                    ...card,
                    ...animStyle(i + 3),
                    backgroundColor: isSelected ? t.colors.primaryScale[50] : card.backgroundColor,
                    borderColor: isSelected ? t.colors.primaryScale[200] : isOverloaded ? t.colors.errorScale[200] : undefined,
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Box style={createIconContainerStyle(t, { size: 28, color: t.colors.neutral[100] })}>
                        <Users size={14} color={t.colors.neutral[500]} />
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>
                        {r.name}
                      </Text>
                    </Box>
                    <Box style={{
                      ...createBadgeStyle(t, getUtilizationBadgeKey(utilization)),
                      borderRadius: badgeRadius,
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs }}>{utilization}%</Text>
                    </Box>
                  </Box>
                  {/* Capacity bar */}
                  <Box style={{ marginBottom: t.spacing[2] }}>
                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                        {r.activePositions ?? 0} / {r.capacity ?? 0} positions
                      </Text>
                    </Box>
                    <Box style={bar.track}><Box style={bar.fill} /></Box>
                  </Box>
                  {/* Sub-metrics */}
                  <Box style={{ display: 'flex', gap: t.spacing[4] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <Calendar size={12} color={t.colors.neutral[400]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{r.interviews ?? 0} interviews</Text>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <ListTodo size={12} color={t.colors.neutral[400]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{r.pendingTasks ?? 0} tasks</Text>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  },
});

// Export with the canonical name (barrel expects this) + legacy alias
export { BalancerBhRecruiterWorkloadItem as BalancerBhRecruiterWorkload };
export { BalancerBhRecruiterWorkloadItem };
