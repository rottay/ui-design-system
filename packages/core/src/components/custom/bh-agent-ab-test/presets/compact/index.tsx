'use client';

/**
 * BhAgentAbTest - Compact Preset
 * Summary view with winner indication and key metrics.
 */

import { useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  createProgressBarStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type { BhAgentAbTestProps, AbTestVariant } from '../../core';
import type { DesignTokens } from '../../../../../types';
import { FlaskConical, Trophy, Activity, Star, Users } from 'lucide-react';

function getStatusBadge(status: BhAgentAbTestProps['status'] | undefined): 'success' | 'secondary' | 'primary' | 'warning' {
  switch (status) {
    case 'draft': return 'secondary';
    case 'running': return 'success';
    case 'completed': return 'primary';
    case 'paused':
    default: return 'warning';
  }
}

function getStatusLabel(status: BhAgentAbTestProps['status'] | undefined): string {
  switch (status) {
    case 'draft': return 'Draft';
    case 'running': return 'Running';
    case 'completed': return 'Completed';
    case 'paused':
    default: return 'Paused';
  }
}

export const CompactBhAgentAbTest = createPreset<BhAgentAbTestProps>({
  name: 'BhAgentAbTest.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhAgentAbTestProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      testName = 'A/B Test',
      variants: rawVariants = [],
      status = 'draft',
      startDate,
      onVariantClick,
      loading = false,
      className,
      style,
    } = props;

    const variants = Array.isArray(rawVariants) ? rawVariants : [];

    const isGlass = t.surface.useGlass && !!t.glass;
    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);

    // Determine winner
    const winner = useMemo(() => {
      if (variants.length < 2) return null;
      const sorted = [...variants].sort((a, b) => (b.metrics?.avgScore ?? 0) - (a.metrics?.avgScore ?? 0));
      return sorted[0];
    }, [variants]);

    const totalConversations = useMemo(() => {
      return variants.reduce((sum, v) => sum + (v.metrics?.conversations ?? 0), 0);
    }, [variants]);

    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[6], ...style }}>
          <Activity size={18} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[2] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ ...cardBase, padding: 0, ...style }}>
        {/* Header */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: t.spacing[2],
          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
          borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
        }}>
          <FlaskConical size={14} strokeWidth={1.5} style={{ color: t.colors.primaryScale[600] }} />
          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, color: t.colors.neutral[900], flex: 1 }}>
            {testName}
          </Text>
          <Box style={{ ...createBadgeStyle(t, getStatusBadge(status)), borderRadius: badgeRadius }}>
            <Text>{getStatusLabel(status)}</Text>
          </Box>
        </Box>

        {/* Traffic split mini bar */}
        <Box style={{ padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}` }}>
          <Box style={{
            display: 'flex', height: 8, borderRadius: t.borderRadius.full, overflow: 'hidden' as const,
            backgroundColor: t.colors.neutral[100],
          }}>
            {variants.map((variant, i) => (
              <Box
                key={variant.id}
                style={{
                  width: `${variant.trafficPercent}%`,
                  backgroundColor: i === 0 ? t.colors.primaryScale[400] : i === 1 ? t.colors.secondaryScale[400] : t.colors.infoScale[400],
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Variant rows */}
        <Box style={{ display: 'flex', flexDirection: 'column' as const }}>
          {variants.map((variant, index) => {
            const isWinner = winner?.id === variant.id;
            return (
              <Box
                key={variant.id}
                role="button"
                tabIndex={0}
                aria-label={`Variant ${variant.name}`}
                onClick={() => onVariantClick?.(variant.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                  borderBottom: index < variants.length - 1
                    ? `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`
                    : 'none',
                  cursor: 'pointer',
                  transition: `background-color ${t.motion.hover}`,
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.backgroundColor = t.colors.neutral[50];
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Winner icon */}
                {isWinner && (
                  <Trophy size={14} strokeWidth={1.5} style={{ color: t.colors.warningScale[500], flexShrink: 0 }} />
                )}

                {/* Name */}
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[900], flex: 1, minWidth: 0 }}>
                  {variant.name}
                </Text>

                {/* Traffic % */}
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], flexShrink: 0 }}>
                  {variant.trafficPercent}%
                </Text>

                {/* Score */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], flexShrink: 0 }}>
                  <Star size={12} strokeWidth={1.5} style={{ color: t.colors.warningScale[500] }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>
                    {(variant.metrics?.avgScore ?? 0).toFixed(1)}
                  </Text>
                </Box>

                {/* Conversations */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], flexShrink: 0 }}>
                  <Users size={12} strokeWidth={1.5} style={{ color: t.colors.neutral[400] }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                    {variant.metrics?.conversations ?? 0}
                  </Text>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Footer stats */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
          borderTop: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
        }}>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
            {totalConversations.toLocaleString()} total conversations
          </Text>
          {startDate && (
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
              {formatDistanceToNow(startDate, { addSuffix: true })}
            </Text>
          )}
        </Box>
      </Box>
    );
  },
});
