'use client';

/**
 * BhTeamCard - Standard Preset
 * Full team summary card with performance metrics as progress bars,
 * status badge, department label, and member count.
 */

import { useMemo, useCallback } from 'react';
import {
  Users,
  Building2,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createBadgeStyle,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createEntranceAnimation,
  createProgressBarStyle,
  createPersonalityAccentBar,
} from '../../../helpers';
import type { BhTeamCardProps, TeamMetric } from '../../core';

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */
const MOCK_METRICS: TeamMetric[] = [
  { label: 'Hires', value: 18, target: 24 },
  { label: 'Time to Fill', value: 22, target: 30 },
  { label: 'Quality Score', value: 87, target: 90 },
  { label: 'Satisfaction', value: 4.3, target: 5 },
];

/* ------------------------------------------------------------------ */
/*  Standard Preset                                                    */
/* ------------------------------------------------------------------ */
export const StandardBhTeamCard = createPreset<BhTeamCardProps>({
  name: 'BhTeamCard.Standard',
  render: ({ primitives, props, tokens }: PresetContext<BhTeamCardProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      team,
      metrics: metricsProp = [],
      onClick,
      className,
      style,
    } = props;

    const teamName = team?.name ?? 'Engineering Hiring';
    const teamType = team?.type ?? 'general';
    const memberCount = team?.activeMemberCount ?? 6;
    const status = team?.status ?? 'active';

    const metrics = metricsProp?.length ? metricsProp : MOCK_METRICS;

    /* -- Styles ---------------------------------------------------- */
    const card = useMemo(() => createCardStyle(t, { padding: 24 }), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const badgeR = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t, { index: 0 }), [t]);
    const accent = useMemo(
      () => createPersonalityAccentBar(t, { color: status === 'active' ? t.colors.successScale[500] : t.colors.neutral[400] }),
      [t, status],
    );

    const handleClick = useCallback(() => {
      onClick?.();
    }, [onClick]);

    const pctColor = useCallback(
      (value: number, target: number) => {
        const pct = target > 0 ? (value / target) * 100 : 0;
        return pct >= 90
          ? t.colors.successScale[500]
          : pct >= 70
            ? t.colors.primaryScale[500]
            : pct >= 50
              ? t.colors.warningScale[500]
              : t.colors.errorScale[500];
      },
      [t],
    );

    return (
      <Box
        className={className}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? `View team ${teamName}` : undefined}
        onClick={handleClick}
        onKeyDown={onClick ? (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); }
        } : undefined}
        style={{
          ...card,
          position: 'relative' as const,
          overflow: 'hidden',
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
        {accent && <Box style={{ ...accent, position: 'absolute' as const, top: 0, left: 0 }} />}

        {/* Header: Team Name + Status */}
        <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: t.spacing[4] }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={{
              ...createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[100] }),
              color: t.colors.primaryScale[700],
            }}>
              <Users size={20} />
            </Box>
            <Box>
              <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: typo.headingWeight, color: t.colors.neutral[900], display: 'block', letterSpacing: typo.headingLetterSpacing }}>
                {teamName}
              </Text>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: t.spacing[1] }}>
                <Building2 size={12} style={{ color: t.colors.neutral[400] }} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: 'capitalize' as const }}>{teamType}</Text>
              </Box>
            </Box>
          </Box>
          <Box style={{ ...createBadgeStyle(t, status === 'active' ? 'success' : 'secondary'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {status === 'active' ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
            <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>{status}</Text>
          </Box>
        </Box>

        {/* Member count badge */}
        <Box style={{ marginBottom: t.spacing[4] }}>
          <Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Users size={11} />
            <Text style={{ fontSize: 'inherit' }}>{memberCount} members</Text>
          </Box>
        </Box>

        {/* Metrics */}
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
          {metrics.map((metric) => {
            const pct = metric.target > 0 ? Math.min((metric.value / metric.target) * 100, 100) : 0;
            const color = pctColor(metric.value, metric.target);
            const bar = createProgressBarStyle(t, { color, percent: pct });

            return (
              <Box key={metric.label}>
                <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{metric.label}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>
                    {metric.value} / {metric.target}
                  </Text>
                </Box>
                <Box style={bar.track}>
                  <Box style={bar.fill} />
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
