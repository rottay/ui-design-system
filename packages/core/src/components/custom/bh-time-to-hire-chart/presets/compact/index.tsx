'use client';

/**
 * BhTimeToHireChart - Compact Preset
 * Condensed department averages with sparkline bars and target indicator.
 */

import { useState, useMemo, useEffect } from 'react';
import { Clock, Target } from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhTimeToHireChartProps, DepartmentConfig } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_DEPARTMENTS: DepartmentConfig[] = [
  { name: 'Engineering' },
  { name: 'Design' },
  { name: 'Sales' },
];

const MOCK_DATA = [
  { date: '2025-10', department: 'Engineering', days: 32 },
  { date: '2025-11', department: 'Engineering', days: 29 },
  { date: '2025-12', department: 'Engineering', days: 31 },
  { date: '2025-10', department: 'Design', days: 24 },
  { date: '2025-11', department: 'Design', days: 20 },
  { date: '2025-12', department: 'Design', days: 19 },
  { date: '2025-10', department: 'Sales', days: 16 },
  { date: '2025-11', department: 'Sales', days: 14 },
  { date: '2025-12', department: 'Sales', days: 15 },
];

function getDeptColor(index: number, t: DesignTokens, customColor?: string): string {
  if (customColor) return customColor;
  const palette = [t.colors.primaryScale[500], t.colors.successScale[500], t.colors.warningScale[500]];
  return palette[index % palette.length];
}

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhTimeToHireChart = createPreset<BhTimeToHireChartProps>({
  name: 'BhTimeToHireChart.Compact',
  render: (ctx: PresetContext<BhTimeToHireChartProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      data: rawData = MOCK_DATA,
      departments: rawDepartments = MOCK_DEPARTMENTS,
      targetDays = 30,
      className,
      style,
    } = props;

    const data = Array.isArray(rawData) ? rawData : MOCK_DATA;
    const departments = Array.isArray(rawDepartments) ? rawDepartments : MOCK_DEPARTMENTS;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const deptAvgs = useMemo(() => {
      return departments.map(dept => {
        const deptData = data.filter(d => d.department === dept.name);
        const avg = deptData.length > 0
          ? deptData.reduce((s, d) => s + (d.days ?? 0), 0) / deptData.length
          : 0;
        return { name: dept.name, avg: Math.round(avg), color: dept.color };
      });
    }, [departments, data]);

    const maxAvg = useMemo(() => Math.max(...deptAvgs.map(d => d.avg), targetDays, 1), [deptAvgs, targetDays]);

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
            <Clock size={14} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Time to Hire
            </Text>
          </Box>
          <Box style={{
            ...createBadgeStyle(t, 'info'),
            borderRadius: badgeRadius,
            padding: `1px ${t.spacing[2]}px`,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs }}>
              <Target size={9} style={{ marginRight: 2, verticalAlign: 'middle' }} />
              {targetDays}d
            </Text>
          </Box>
        </Box>

        {/* Department bars */}
        <Box role="list" aria-label="Time to hire by department" style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px` }}>
          {deptAvgs.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[3] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>No data</Text>
            </Box>
          )}
          {deptAvgs.map((dept, i) => {
            const color = getDeptColor(i, t, dept.color);
            const barPct = (dept.avg / maxAvg) * 100;
            const overTarget = dept.avg > targetDays;

            return (
              <Box key={dept.name} role="listitem" style={{ marginBottom: t.spacing[3] }}>
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <Box style={{
                      width: 8,
                      height: 8,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: color,
                      flexShrink: 0,
                    }} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>
                      {dept.name}
                    </Text>
                  </Box>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.bold,
                    color: overTarget ? t.colors.errorScale[600] : t.colors.successScale[600],
                  }}>
                    {dept.avg}d
                  </Text>
                </Box>
                <Box style={{
                  height: 6,
                  borderRadius: t.borderRadius.full,
                  backgroundColor: t.colors.neutral[100],
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <Box style={{
                    height: '100%',
                    width: `${barPct}%`,
                    borderRadius: t.borderRadius.full,
                    backgroundColor: overTarget ? t.colors.errorScale[400] : color,
                    transition: `width 400ms ease`,
                  }} />
                  {/* Target marker */}
                  <Box style={{
                    position: 'absolute',
                    top: 0,
                    left: `${(targetDays / maxAvg) * 100}%`,
                    width: 2,
                    height: '100%',
                    backgroundColor: t.colors.errorScale[400],
                  }} />
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
