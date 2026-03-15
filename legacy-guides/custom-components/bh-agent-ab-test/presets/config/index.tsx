'use client';

/**
 * BhAgentAbTest - Config Preset
 * Traffic split visual + side-by-side metric cards + status controls.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createCardHoverStyles,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createStaggerDelay,
  formatDistanceToNow,
  createEmptyStateStyle,
  createProgressBarStyle,

  createPersonalityAccentBar,
  createDividerStyle,
  formatAbbreviated,
} from '../../../helpers';
import type { BhAgentAbTestProps, AbTestVariant } from '../../core';
import type { DesignTokens, ColorScale } from '../../../../../types';
import {
  FlaskConical,
  Play,
  Pause,
  CheckCircle,
  BarChart3,
  Clock,
  Users,
  Star,
  Activity,
  Trophy,
} from 'lucide-react';

const VARIANT_COLORS = ['primaryScale', 'secondaryScale', 'infoScale', 'warningScale'] as const;

function getStatusInfo(status: BhAgentAbTestProps['status'] | undefined, t: DesignTokens) {
  switch (status) {
    case 'draft': return { bg: t.colors.neutral[100], color: t.colors.neutral[600], label: 'Draft', badgeColor: 'secondary' as const };
    case 'running': return { bg: t.colors.successScale[100], color: t.colors.successScale[700], label: 'Running', badgeColor: 'success' as const };
    case 'completed': return { bg: t.colors.primaryScale[100], color: t.colors.primaryScale[700], label: 'Completed', badgeColor: 'primary' as const };
    case 'paused':
    default: return { bg: t.colors.warningScale[100], color: t.colors.warningScale[700], label: 'Paused', badgeColor: 'warning' as const };
  }
}

export const ConfigBhAgentAbTest = createPreset<BhAgentAbTestProps>({
  name: 'BhAgentAbTest.Config',
  render: ({ primitives, props, tokens }: PresetContext<BhAgentAbTestProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      testName = 'A/B Test',
      variants: rawVariants = [],
      status = 'draft',
      startDate,
      endDate,
      onTrafficChange,
      onStatusChange,
      selectedVariantId: controlledSelected,
      onVariantClick,
      loading = false,
      className,
      style,
    } = props;

    const variants = Array.isArray(rawVariants) ? rawVariants : [];

    const [localSelected, setLocalSelected] = useState<string | null>(null);
    const selectedVariantId = controlledSelected ?? localSelected;

    const handleVariantClick = useCallback((id: string) => {
      onVariantClick?.(id);
      if (controlledSelected === undefined) setLocalSelected(id);
    }, [onVariantClick, controlledSelected]);

    const isGlass = t.surface.useGlass && !!t.glass;
    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const statusInfo = useMemo(() => getStatusInfo(status, t), [status, t]);

    // Find winner (highest avg score with enough conversations)
    const winner = useMemo(() => {
      if (status !== 'completed' || variants.length < 2) return null;
      const sorted = [...variants].sort((a, b) => (b.metrics?.avgScore ?? 0) - (a.metrics?.avgScore ?? 0));
      if ((sorted[0].metrics?.conversations ?? 0) > 10) return sorted[0];
      return null;
    }, [variants, status]);

    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[10], ...style }}>
          <Activity size={24} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[3] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading test data...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5], ...style }}>
        {/* Header */}
        <Box style={{ ...cardBase, padding: t.spacing[4] }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <FlaskConical size={20} strokeWidth={1.5} style={{ color: t.colors.primaryScale[600] }} />
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight, letterSpacing: ptypo.headingLetterSpacing, color: t.colors.neutral[900] }}>
                {testName}
              </Text>
              <Box style={{ ...createBadgeStyle(t, statusInfo.badgeColor), borderRadius: badgeRadius }}>
                <Text>{statusInfo.label}</Text>
              </Box>
            </Box>

            {/* Status controls */}
            {onStatusChange && (
              <Box style={{ display: 'flex', gap: t.spacing[2] }}>
                {status === 'draft' && (
                  <Box
                    role="button"
                    tabIndex={0}
                    aria-label="Start test"
                    onClick={() => onStatusChange('running')}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStatusChange('running'); } }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: t.spacing[1],
                      padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                      borderRadius: t.borderRadius.md,
                      backgroundColor: t.colors.successScale[600],
                      color: t.colors.common.white,
                      fontSize: t.typography.fontSize.sm,
                      fontWeight: t.typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: `all ${t.motion.hover}`,
                      border: 'none',
                    }}
                  >
                    <Play size={14} strokeWidth={1.5} />
                    <Text>Start</Text>
                  </Box>
                )}
                {status === 'running' && (
                  <Box
                    role="button"
                    tabIndex={0}
                    aria-label="Pause test"
                    onClick={() => onStatusChange('paused')}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStatusChange('paused'); } }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: t.spacing[1],
                      padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                      borderRadius: t.borderRadius.md,
                      backgroundColor: t.colors.warningScale[600],
                      color: t.colors.common.white,
                      fontSize: t.typography.fontSize.sm,
                      fontWeight: t.typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: `all ${t.motion.hover}`,
                      border: 'none',
                    }}
                  >
                    <Pause size={14} strokeWidth={1.5} />
                    <Text>Pause</Text>
                  </Box>
                )}
                {status === 'paused' && (
                  <Box
                    role="button"
                    tabIndex={0}
                    aria-label="Resume test"
                    onClick={() => onStatusChange('running')}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStatusChange('running'); } }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: t.spacing[1],
                      padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                      borderRadius: t.borderRadius.md,
                      backgroundColor: t.colors.successScale[600],
                      color: t.colors.common.white,
                      fontSize: t.typography.fontSize.sm,
                      fontWeight: t.typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: `all ${t.motion.hover}`,
                      border: 'none',
                    }}
                  >
                    <Play size={14} strokeWidth={1.5} />
                    <Text>Resume</Text>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Date info */}
          {(startDate || endDate) && (
            <Box style={{ display: 'flex', gap: t.spacing[4] }}>
              {startDate && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Clock size={14} strokeWidth={1.5} style={{ color: t.colors.neutral[400] }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                    Started {formatDistanceToNow(startDate, { addSuffix: true })}
                  </Text>
                </Box>
              )}
              {endDate && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <CheckCircle size={14} strokeWidth={1.5} style={{ color: t.colors.neutral[400] }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                    Ended {formatDistanceToNow(endDate, { addSuffix: true })}
                  </Text>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Traffic Split Visual */}
        <Box style={{ ...cardBase, padding: t.spacing[4] }}>
          <Text style={sectionLabel}>Traffic Split</Text>
          <Box style={{
            display: 'flex',
            height: 32,
            borderRadius: t.borderRadius.lg,
            overflow: 'hidden' as const,
            border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
            marginBottom: t.spacing[3],
          }}>
            {variants.map((variant, i) => {
              const colorScale = VARIANT_COLORS[i % VARIANT_COLORS.length];
              const colors = (t.colors as any)[colorScale];
              return (
                <Box
                  key={variant.id}
                  style={{
                    width: `${variant.trafficPercent}%`,
                    backgroundColor: colors?.[400] || t.colors.primaryScale[400],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: `width ${t.motion.hover}`,
                    minWidth: variant.trafficPercent > 5 ? 40 : 0,
                  }}
                >
                  {variant.trafficPercent >= 15 && (
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.common.white }}>
                      {variant.trafficPercent}%
                    </Text>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Variant labels */}
          <Box style={{ display: 'flex', gap: t.spacing[4] }}>
            {variants.map((variant, i) => {
              const colorScale = VARIANT_COLORS[i % VARIANT_COLORS.length];
              const colors = (t.colors as any)[colorScale];
              return (
                <Box key={variant.id} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <Box style={{ width: 12, height: 12, borderRadius: t.borderRadius.sm, backgroundColor: colors?.[400] || t.colors.primaryScale[400] }} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], fontWeight: t.typography.fontWeight.medium }}>
                    {variant.name} ({variant.trafficPercent}%)
                  </Text>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Side-by-side Metric Cards */}
        <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(variants.length, 3)}, 1fr)`, gap: t.spacing[4] }}>
          {variants.map((variant, i) => {
            const colorScale = VARIANT_COLORS[i % VARIANT_COLORS.length];
            const colors = (t.colors as any)[colorScale];
            const isSelected = selectedVariantId === variant.id;
            const isWinner = winner?.id === variant.id;
            const staggerDelay = createStaggerDelay(t, i);

            return (
              <Box
                key={variant.id}
                role="button"
                tabIndex={0}
                aria-label={`Variant ${variant.name}`}
                onClick={() => handleVariantClick(variant.id)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleVariantClick(variant.id); } }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  Object.assign(e.currentTarget.style, hoverStyles.hover);
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = t.shadows.sm;
                }}
                style={{
                  ...cardBase,
                  ...hoverStyles.base,
                  padding: 0,
                  overflow: 'hidden' as const,
                  borderColor: isSelected ? t.colors.primaryScale[400] : undefined,
                  ...entrance.animate,
                  transition: entrance.transition,
                  transitionDelay: `${staggerDelay}ms`,
                }}
              >
                {/* Color bar */}
                <Box style={{
                  height: 4,
                  backgroundColor: colors?.[400] || t.colors.primaryScale[400],
                }} />

                <Box style={{ padding: t.spacing[4] }}>
                  {/* Variant header */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
                    <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: ptypo.headingWeight, color: t.colors.neutral[900] }}>
                      {variant.name}
                    </Text>
                    {isWinner && (
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], ...createBadgeStyle(t, 'success'), borderRadius: badgeRadius }}>
                        <Trophy size={12} strokeWidth={1.5} />
                        <Text>Winner</Text>
                      </Box>
                    )}
                  </Box>

                  {/* Metrics grid */}
                  <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[3] }}>
                    <Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[1] }}>
                        <Users size={12} strokeWidth={1.5} style={{ color: t.colors.neutral[400] }} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Conversations</Text>
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                        {(variant.metrics?.conversations ?? 0).toLocaleString()}
                      </Text>
                    </Box>

                    <Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[1] }}>
                        <Star size={12} strokeWidth={1.5} style={{ color: t.colors.warningScale[500] }} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Avg Score</Text>
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                        {(variant.metrics?.avgScore ?? 0).toFixed(1)}
                      </Text>
                    </Box>

                    <Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[1] }}>
                        <BarChart3 size={12} strokeWidth={1.5} style={{ color: t.colors.primaryScale[500] }} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Completion</Text>
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                        {(variant.metrics?.completionRate ?? 0).toFixed(0)}%
                      </Text>
                    </Box>

                    <Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[1] }}>
                        <Clock size={12} strokeWidth={1.5} style={{ color: t.colors.neutral[400] }} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Avg Duration</Text>
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                        {(variant.metrics?.avgDuration ?? 0).toFixed(0)}s
                      </Text>
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
