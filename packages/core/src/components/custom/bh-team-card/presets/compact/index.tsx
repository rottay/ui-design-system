'use client';

/**
 * BhTeamCard - Compact Preset
 * Slim single-row card with team name, member count, and inline metrics.
 */

import { useMemo, useCallback } from 'react';
import {
  Users,
  Building2,
  Target,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createBadgeStyle,
  createIconContainerStyle,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createEntranceAnimation,
  createStaggerDelay,
  createProgressBarStyle,
  createPersonalityAccentBar,

  createDividerStyle,
  createPersonalitySectionHeaderStyle,
  createEmptyStateStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { BhTeamCardProps, TeamMetric } from '../../core';

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Compact Preset                                                     */
/* ------------------------------------------------------------------ */
export const CompactBhTeamCard = createPreset<BhTeamCardProps>({
  name: 'BhTeamCard.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhTeamCardProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      team,
      metrics: rawMetricsProp = [],
      onClick,
      className,
      style,
    } = props;

    const metricsProp = Array.isArray(rawMetricsProp) ? rawMetricsProp : [];

    const teamName = team?.name ?? 'Engineering Hiring';
    const teamType = team?.type ?? 'general';
    const memberCount = team?.activeMemberCount ?? 6;
    const status = team?.status ?? 'active';

    const metrics = metricsProp?.length ? metricsProp : [];
    const displayMetrics = metrics.slice(0, 2);

    /* -- Styles ---------------------------------------------------- */
    const card = useMemo(() => createCardStyle(t, { padding: t.spacing[4] }), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const badgeR = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    const handleClick = useCallback(() => {
      onClick?.();
    }, [onClick]);

    const divider = useMemo(() => createDividerStyle(t), [t]);

    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const isGlass = t.surface.useGlass;

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);


    return (
      <Box
        className={className}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? `View team ${teamName}` : undefined}
        onClick={handleClick}
        onKeyDown={onClick ? (e: React.KeyboardEvent) => {
        {accentBar && <Box style={accentBar} />}
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); }
        } : undefined}
        style={{
          ...card,
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing[4],
          width: '100%',
          cursor: onClick ? 'pointer' : 'default',
          transition: `all ${t.motion.hover}`,
          ...entrance.animate,
          ...style,
        }}
        onMouseEnter={onClick ? (e: React.MouseEvent<HTMLElement>) => {
          const el = e.currentTarget;
          if (cardHover.hover.transform) el.style.transform = cardHover.hover.transform;
          if (cardHover.hover.boxShadow) el.style.boxShadow = cardHover.hover.boxShadow;
        } : undefined}
        onMouseLeave={onClick ? (e: React.MouseEvent<HTMLElement>) => {
          const el = e.currentTarget;
          el.style.transform = 'none';
          el.style.boxShadow = (card.boxShadow as string) || '';
        } : undefined}
      >
        {/* Icon */}
        <Box style={{
          ...createIconContainerStyle(t, { size: 36, color: t.colors.primaryScale[100] }),
          color: t.colors.primaryScale[700],
        }}>
          <Users size={16} />
        </Box>

        {/* Name + department */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: typo.headingWeight, color: t.colors.neutral[900], display: 'block', letterSpacing: typo.headingLetterSpacing, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
            {teamName}
          </Text>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: t.spacing[1] }}>
            <Building2 size={10} style={{ color: t.colors.neutral[400] }} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: 'capitalize' as const }}>{teamType}</Text>
          </Box>
        </Box>

        {/* Member badge */}
        <Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], flexShrink: 0 }}>
          <Users size={10} />
          <Text style={{ fontSize: 'inherit' }}>{memberCount}</Text>
        </Box>

        {/* Inline metrics */}
        {displayMetrics.map((metric, i) => {
          const pct = metric.target > 0 ? Math.min((metric.value / metric.target) * 100, 100) : 0;
          const color = pct >= 90 ? t.colors.successScale[500] : pct >= 70 ? t.colors.primaryScale[500] : t.colors.warningScale[500];
          const bar = createProgressBarStyle(t, { color, percent: pct });

          return (
            <Box key={metric.label} style={{ ...animStyle(i), width: 80, flexShrink: 0 }}>
              <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{metric.label}</Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>{metric.value}</Text>
              </Box>
              <Box style={{ ...bar.track, height: 4 }}>
                <Box style={bar.fill} />
              </Box>
            </Box>
          );
        })}

        {/* Status */}
        <Box style={{ ...createBadgeStyle(t, status === 'active' ? 'success' : 'secondary'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], flexShrink: 0 }}>
          {status === 'active' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
          <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>{status}</Text>
        </Box>
      </Box>
    );
  },
});
