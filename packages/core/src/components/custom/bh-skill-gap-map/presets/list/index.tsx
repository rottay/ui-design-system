'use client';

/**
 * BhSkillGapMap - List Preset
 * Prioritized gap list with severity indicators, progress bars,
 * dimension codes, candidate counts, and recommendation callouts.
 * Slite-inspired warm design with generous whitespace.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, getPersonalityBadgeRadius, createEntranceAnimation, createStaggerDelay, createPersonalityAccentBar ,
  createCardHoverStyles,
  getPersonalityTypography,
  createDividerStyle,
  createPersonalitySectionHeaderStyle,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhSkillGapMapProps, SkillGapItem, GapPriority } from '../../core';
import { getPriorityColors } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  List, AlertTriangle, Info, Target, TrendingDown, Users, ChevronRight,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const ListBhSkillGapMap = createPreset<BhSkillGapMapProps>({
  name: 'BhSkillGapMap.List',
  render: ({ primitives, props, tokens: t }: PresetContext<BhSkillGapMapProps>) => {
    const { Box, Text } = primitives;
    const br = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const pc = getPriorityColors(t);

    const {
      gaps: rawGaps = [],
      onGapSelect,
      loading,
      className, style,
    } = props;

    const gaps = Array.isArray(rawGaps) ? rawGaps : [];

    const counts = useMemo(() => {
      const c = { critical: 0, high: 0, medium: 0, low: 0 };
      gaps.forEach(g => { if (g.priority && c[g.priority] !== undefined) c[g.priority]++; });
      return c;
    }, [gaps]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    if (loading) {
      const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
      const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
      const divider = useMemo(() => createDividerStyle(t), [t]);
      const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
      const isGlass = t.surface.useGlass;

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
        {accentBar && <Box style={accentBar} />}
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
        <Box role="list" aria-label="Skill gap items" style={{ flex: 1, overflowY: 'auto' }}>
          {gaps.map((gap, gi) => {
            const gapPriority = gap.priority ?? 'low';
            const colors = pc[gapPriority];
            const currentLevel = gap.currentLevel ?? 0;
            const requiredLevel = gap.requiredLevel ?? 0;
            const pct = requiredLevel > 0 ? Math.round((currentLevel / requiredLevel) * 100) : 0;
            const barColor = pct >= 80 ? t.colors.successScale[500] : pct >= 50 ? t.colors.warningScale[500] : t.colors.errorScale[500];

            return (
              <Box
                key={gap.id ?? gi}
                role={onGapSelect ? 'button' : undefined}
                tabIndex={onGapSelect ? 0 : undefined}
                aria-label={`${gap.dimension ?? 'Unknown'} - ${gapPriority} priority, gap ${gap.gapSize ?? 0}`}
                onClick={() => onGapSelect?.(gap.id ?? '')}
                onKeyDown={onGapSelect ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onGapSelect?.(gap.id ?? ''); } } : undefined}
                onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
                onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
                style={{
                ...animStyle(gi),
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
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.secondaryScale[700] }}>{gap.dimensionCode ?? '--'}</Text>
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>{gap.dimension ?? 'Unknown'}</Text>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Box style={{ padding: `0 ${t.spacing[2]}px`, borderRadius: br, backgroundColor: colors.bgColor, border: `1px solid ${colors.border}` }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: colors.color, fontWeight: t.typography.fontWeight.medium, textTransform: 'capitalize' }}>{gapPriority}</Text>
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
                    {currentLevel}/{requiredLevel}
                  </Text>
                </Box>

                {/* Bottom: gap size + candidate count */}
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Gap:</Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: colors.color }}>{gap.gapSize ?? 0}</Text>
                    </Box>
                    <Box style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      padding: `0 ${t.spacing[2]}px`, borderRadius: br,
                      backgroundColor: t.colors.infoScale[50], border: `1px solid ${t.colors.infoScale[200]}`,
                    }}>
                      <Users size={10} style={{ color: t.colors.infoScale[600] }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.infoScale[700] }}>{gap.candidateCount ?? 0} candidates</Text>
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
