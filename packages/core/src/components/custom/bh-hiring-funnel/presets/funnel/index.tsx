'use client';

/**
 * BhHiringFunnel - Funnel Preset
 * Full interactive funnel visualization with stage bars, conversion arrows,
 * and click-to-drill. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Filter, ChevronDown, Users, TrendingDown,
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
  createPersonalityAccentBar,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  getAccentAwareLayout,
} from '../../../helpers';
import type { BhHiringFunnelProps, FunnelStage } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_STAGES: FunnelStage[] = [
  { name: 'Applied', count: 1240, conversionRate: 100 },
  { name: 'Screened', count: 620, conversionRate: 50 },
  { name: 'Interviewed', count: 248, conversionRate: 40 },
  { name: 'Technical', count: 124, conversionRate: 50 },
  { name: 'Offer', count: 37, conversionRate: 30 },
  { name: 'Hired', count: 28, conversionRate: 76 },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStageColor(index: number, t: DesignTokens, customColor?: string): string {
  if (customColor) return customColor;
  const palette = [
    t.colors.primaryScale[500],
    t.colors.primaryScale[400],
    t.colors.infoScale[500],
    t.colors.infoScale[400],
    t.colors.successScale[500],
    t.colors.successScale[600],
  ];
  return palette[index % palette.length];
}

/* ================================================================== */
/*  Funnel Preset                                                      */
/* ================================================================== */

export const FunnelBhHiringFunnel = createPreset<BhHiringFunnelProps>({
  name: 'BhHiringFunnel.Funnel',
  render: (ctx: PresetContext<BhHiringFunnelProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      stages: rawStages = MOCK_STAGES,
      title = 'Hiring Funnel',
      onStageClick,
      selectedStage,
      loading,
      className,
      style,
    } = props;

    const stages = Array.isArray(rawStages) ? rawStages : MOCK_STAGES;

    const [hoveredStage, setHoveredStage] = useState<string | null>(null);


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const maxCount = useMemo(() => Math.max(...stages.map(s => s.count ?? 0), 1), [stages]);

    const handleStageClick = useCallback((name: string) => {
      onStageClick?.(name);
    }, [onStageClick]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    return (
      <Box
        className={className}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          ...accentLayout.outer,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[50] })}>
              <Filter size={20} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                {title}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>
                {stages.length} stages in pipeline
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Funnel visualization */}
        <Box style={{ padding: t.spacing[6] }}>
          {stages.length === 0 && (
            <Box style={createEmptyStateStyle(t)}>
              <Filter size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                No funnel stages configured
              </Text>
            </Box>
          )}

          <Box
            role="list"
            aria-label="Hiring funnel stages"
            style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[1] }}
          >
            {stages.map((stage, i) => {
              const barWidth = ((stage.count ?? 0) / maxCount) * 100;
              const stageColor = getStageColor(i, t, stage.color);
              const isHovered = hoveredStage === stage.name;
              const isSelected = selectedStage === stage.name;
              const isLast = i === stages.length - 1;

              return (
                <Box key={stage.name} style={animStyle(i)}>
                  <Box
                    role="listitem"
                    tabIndex={0}
                    aria-label={`${stage.name ?? 'Unknown'}: ${stage.count ?? 0} candidates, ${stage.conversionRate ?? 0}% conversion`}
                    onClick={() => handleStageClick((stage.name ?? ''))}
                    onMouseEnter={() => setHoveredStage((stage.name ?? null))}
                    onMouseLeave={() => setHoveredStage(null)}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleStageClick((stage.name ?? ''));
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: t.spacing[4],
                      padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                      borderRadius: t.borderRadius.lg,
                      cursor: 'pointer',
                      backgroundColor: isSelected
                        ? t.colors.primaryScale[50]
                        : isHovered
                          ? t.colors.neutral[50]
                          : t.colors.common.white,
                      border: isSelected
                        ? `1px solid ${t.colors.primaryScale[200]}`
                        : `1px solid ${t.colors.neutral[100]}`,
                      transition: `all ${t.motion.hover}`,
                    }}
                  >
                    {/* Stage label */}
                    <Box style={{ width: 120, flexShrink: 0 }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: t.colors.neutral[800],
                      }}>
                        {stage.name}
                      </Text>
                    </Box>

                    {/* Bar */}
                    <Box style={{ flex: 1, position: 'relative' }}>
                      <Box style={{
                        height: 32,
                        borderRadius: t.borderRadius.md,
                        backgroundColor: t.colors.neutral[100],
                        overflow: 'hidden',
                        position: 'relative',
                      }}>
                        <Box style={{
                          height: '100%',
                          width: `${barWidth}%`,
                          backgroundColor: stageColor,
                          borderRadius: t.borderRadius.md,
                          transition: `width 600ms ease`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          paddingRight: t.spacing[2],
                          minWidth: 40,
                        }}>
                          <Text style={{
                            fontSize: t.typography.fontSize.xs,
                            fontWeight: t.typography.fontWeight.bold,
                            color: t.colors.common.white,
                          }}>
                            {(stage.count ?? 0).toLocaleString()}
                          </Text>
                        </Box>
                      </Box>
                    </Box>

                    {/* Conversion badge */}
                    <Box style={{
                      ...createBadgeStyle(t, (stage.conversionRate ?? 0) >= 50 ? 'success' : (stage.conversionRate ?? 0) >= 25 ? 'warning' : 'error'),
                      borderRadius: badgeRadius,
                      minWidth: 52,
                      justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs }}>
                        {stage.conversionRate ?? 0}%
                      </Text>
                    </Box>
                  </Box>

                  {/* Conversion arrow between stages */}
                  {!isLast && (
                    <Box style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: `${t.spacing[1]}px 0`,
                    }}>
                      <ChevronDown size={14} color={t.colors.neutral[300]} />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Summary row */}
          {stages.length > 0 && (
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: t.spacing[5],
              padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
              borderRadius: t.borderRadius.lg,
              backgroundColor: t.colors.neutral[50],
              border: `1px solid ${t.colors.neutral[100]}`,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                <Users size={14} color={t.colors.neutral[500]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                  Overall conversion
                </Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                <TrendingDown size={14} color={t.colors.neutral[500]} />
                <Text style={{
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.neutral[900],
                }}>
                  {stages.length > 1 && (stages[0].count ?? 0) > 0
                    ? `${(((stages[stages.length - 1].count ?? 0) / (stages[0].count ?? 1)) * 100).toFixed(1)}%`
                    : '100%'}
                </Text>
              </Box>
            </Box>
          )}
        </Box>
        </Box>
      </Box>
    );
  },
});
