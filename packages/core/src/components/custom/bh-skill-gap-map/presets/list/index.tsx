'use client';

/**
 * BhSkillGapMap - List Preset
 * Prioritized gap list with severity indicators, progress bars,
 * dimension codes, candidate counts, and recommendation callouts.
 * Slite-inspired warm design with generous whitespace.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, getPersonalityBadgeRadius } from '../../../helpers';
import type { BhSkillGapMapProps, SkillGapItem, GapPriority } from '../../core';
import { getPriorityColors } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  List, AlertTriangle, Info, Target, TrendingDown, Users, ChevronRight,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Default Data
 * -------------------------------------------------------------------------*/

const DEFAULT_GAPS: SkillGapItem[] = [
  { id: 'g-1', dimension: 'System Design', dimensionCode: 'SD', currentLevel: 3, requiredLevel: 5, gapSize: 2, priority: 'critical', candidateCount: 4, recommendation: 'Focus hiring on candidates with distributed systems experience at scale.' },
  { id: 'g-2', dimension: 'React Advanced', dimensionCode: 'RA', currentLevel: 4, requiredLevel: 5, gapSize: 1, priority: 'high', candidateCount: 3, recommendation: 'Look for RSC and server component expertise.' },
  { id: 'g-3', dimension: 'Leadership', dimensionCode: 'LD', currentLevel: 3, requiredLevel: 4, gapSize: 1, priority: 'high', candidateCount: 5, recommendation: 'Prioritize tech lead or engineering manager backgrounds.' },
  { id: 'g-4', dimension: 'TypeScript', dimensionCode: 'TS', currentLevel: 4, requiredLevel: 5, gapSize: 1, priority: 'medium', candidateCount: 2 },
  { id: 'g-5', dimension: 'Testing', dimensionCode: 'QA', currentLevel: 3, requiredLevel: 4, gapSize: 1, priority: 'medium', candidateCount: 3 },
  { id: 'g-6', dimension: 'Communication', dimensionCode: 'CM', currentLevel: 4, requiredLevel: 4, gapSize: 0, priority: 'low', candidateCount: 1 },
];

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const ListBhSkillGapMap = createPreset<BhSkillGapMapProps>({
  name: 'BhSkillGapMap.List',
  render: ({ primitives, props, tokens: t }: PresetContext<BhSkillGapMapProps>) => {
    const { Box, Text } = primitives;
    const br = getPersonalityBadgeRadius(t);
    const pc = getPriorityColors(t);

    const {
      gaps = DEFAULT_GAPS,
      onGapSelect,
      loading,
      className, style,
    } = props;

    const counts = useMemo(() => {
      const c = { critical: 0, high: 0, medium: 0, low: 0 };
      gaps.forEach(g => { c[g.priority]++; });
      return c;
    }, [gaps]);

    if (loading) {
      return (
        <Box className={className} style={{ padding: t.spacing[8], textAlign: 'center', color: t.colors.neutral[500], ...style }}>
          <Text>Loading skill gaps...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{
        ...createCardStyle(t, { elevation: 'md' }),
        display: 'flex', flexDirection: 'column', width: '100%', height: '100%',
        backgroundColor: t.colors.common.white, overflow: 'hidden', ...style,
      }}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>
            <List size={16} style={{ marginRight: t.spacing[2], verticalAlign: 'middle' }} />
            Skill Gaps ({gaps.length})
          </Text>
          {/* Priority counters */}
          <Box style={{ display: 'flex', gap: t.spacing[3], marginTop: t.spacing[3] }}>
            {(['critical', 'high', 'medium', 'low'] as GapPriority[]).map(p => {
              const colors = pc[p];
              return (
                <Box key={p} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Box style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: colors.color }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], textTransform: 'capitalize' }}>{p}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: colors.color }}>{counts[p]}</Text>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Gap rows */}
        <Box style={{ flex: 1, overflowY: 'auto' }}>
          {gaps.map((gap, gi) => {
            const colors = pc[gap.priority];
            const pct = gap.requiredLevel > 0 ? Math.round((gap.currentLevel / gap.requiredLevel) * 100) : 0;
            const barColor = pct >= 80 ? t.colors.successScale[500] : pct >= 50 ? t.colors.warningScale[500] : t.colors.errorScale[500];

            return (
              <Box key={gap.id} onClick={() => onGapSelect?.(gap.id)} style={{
                padding: `${t.spacing[4]}px ${t.spacing[6]}px`,
                borderBottom: gi < gaps.length - 1 ? `1px solid ${t.colors.neutral[50]}` : undefined,
                borderLeft: `3px solid ${colors.color}`,
                cursor: onGapSelect ? 'pointer' : 'default',
                transition: 'background-color 0.15s ease',
              }}>
                {/* Top: dimension + code badge + priority */}
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Box style={{
                      padding: `1px ${t.spacing[2]}px`, borderRadius: br,
                      backgroundColor: t.colors.secondaryScale[50], border: `1px solid ${t.colors.secondaryScale[200]}`,
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.secondaryScale[700] }}>{gap.dimensionCode}</Text>
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>{gap.dimension}</Text>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Box style={{ padding: `0 ${t.spacing[2]}px`, borderRadius: br, backgroundColor: colors.bgColor, border: `1px solid ${colors.border}` }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: colors.color, fontWeight: t.typography.fontWeight.medium, textTransform: 'capitalize' }}>{gap.priority}</Text>
                    </Box>
                    {onGapSelect && <ChevronRight size={14} style={{ color: t.colors.neutral[400] }} />}
                  </Box>
                </Box>

                {/* Progress bar */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                  <Box style={{ flex: 1, height: 6, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden' }}>
                    <Box style={{ height: '100%', width: `${pct}%`, backgroundColor: barColor, borderRadius: t.borderRadius.full, transition: 'width 0.4s ease' }} />
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[600], minWidth: 36, textAlign: 'right' }}>
                    {gap.currentLevel}/{gap.requiredLevel}
                  </Text>
                </Box>

                {/* Bottom: gap size + candidate count */}
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Gap:</Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: colors.color }}>{gap.gapSize}</Text>
                    </Box>
                    <Box style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      padding: `0 ${t.spacing[2]}px`, borderRadius: br,
                      backgroundColor: t.colors.infoScale[50], border: `1px solid ${t.colors.infoScale[200]}`,
                    }}>
                      <Users size={10} style={{ color: t.colors.infoScale[600] }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.infoScale[700] }}>{gap.candidateCount} candidates</Text>
                    </Box>
                  </Box>
                </Box>

                {/* Recommendation */}
                {gap.recommendation && (
                  <Box style={{
                    marginTop: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    borderRadius: t.borderRadius.lg, backgroundColor: t.colors.infoScale[50],
                    border: `1px solid ${t.colors.infoScale[200]}`,
                    display: 'flex', alignItems: 'flex-start', gap: t.spacing[2],
                  }}>
                    <Info size={11} style={{ color: t.colors.infoScale[500], flexShrink: 0, marginTop: t.spacing[1] }} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.infoScale[700], lineHeight: 1.5 }}>{gap.recommendation}</Text>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
