'use client';

/**
 * BhHiringFunnel - Compact Preset
 * Condensed horizontal funnel bars with inline conversion rates.
 * Designed for sidebar or dashboard widget placement.
 */

import { useMemo, useCallback } from 'react';
import { Filter, ChevronRight } from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  createPersonalityAccentBar,

  createCardHoverStyles,
  createDividerStyle,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
  formatAbbreviated,
} from '../../../helpers';
import type { BhHiringFunnelProps, FunnelStage } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

function getStageColor(index: number, t: DesignTokens, customColor?: string): string {
  if (customColor) return customColor;
  const palette = [
    t.colors.primaryScale[500],
    t.colors.primaryScale[400],
    t.colors.infoScale[500],
    t.colors.successScale[500],
    t.colors.successScale[600],
  ];
  return palette[index % palette.length];
}

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhHiringFunnel = createPreset<BhHiringFunnelProps>({
  name: 'BhHiringFunnel.Compact',
  render: (ctx: PresetContext<BhHiringFunnelProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      stages: rawStages = [],
      title = 'Funnel',
      onStageClick,
      selectedStage,
      className,
      style,
    } = props;

    const stages = Array.isArray(rawStages) ? rawStages : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const maxCount = useMemo(() => Math.max(...stages.map(s => s.count ?? 0), 1), [stages]);

    const handleClick = useCallback((name: string) => {
      onStageClick?.(name);
    }, [onStageClick]);

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
        onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{
          ...card,
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
            <Filter size={14} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              {title}
            </Text>
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
            {stages.length} stages
          </Text>
        </Box>

        {/* Compact funnel bars */}
        <Box role="list" aria-label="Hiring funnel stages" style={{ padding: `${t.spacing[2]}px 0` }}>
          {stages.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No stages
              </Text>
            </Box>
          )}
          {stages.map((stage, i) => {
            const barWidth = ((stage.count ?? 0) / maxCount) * 100;
            const stageColor = getStageColor(i, t, stage.color);
            const isSelected = selectedStage === stage.name;

            return (
              <Box
                key={stage.name}
                role="listitem"
                tabIndex={0}
                aria-label={`${stage.name}: ${stage.count ?? 0}, ${stage.conversionRate ?? 0}%`}
                onClick={() => handleClick((stage.name ?? ''))}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick((stage.name ?? ''));
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
                  {stage.name}
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
                      width: `${barWidth}%`,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: stageColor,
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
                  {stage.count ?? 0}
                </Text>
              </Box>
            );
          })}
        </Box>

        {/* Bottom summary */}
        {stages.length > 1 && (
          <Box style={{
            padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
            borderTop: `1px solid ${t.colors.neutral[100]}`,
            backgroundColor: t.colors.neutral[50],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
              Overall
            </Text>
            <Box style={{
              ...createBadgeStyle(t, 'primary'),
              borderRadius: badgeRadius,
              padding: `1px ${t.spacing[2]}px`,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {(stages[0].count ?? 0) > 0 ? (((stages[stages.length - 1].count ?? 0) / (stages[0].count ?? 1)) * 100).toFixed(1) : 0}%
              </Text>
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
