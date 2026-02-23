'use client';

/**
 * BhSprintCapacity - Compact Preset
 * Small dashboard widget showing sprint capacity utilization.
 * Features a circular SVG progress gauge, capacity bar,
 * member stats, and trend indicator.
 *
 * Personality-driven typography, glass-aware surfaces, entrance animations,
 * and full ARIA accessibility on all interactive elements.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhSprintCapacityProps } from '../../core';
import { n, getUtilizationColor, getUtilizationBadgeVariant } from '../../core';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEmptyStateStyle,
  createPersonalityAccentBar,
  createPersonalitySkeletonStyle,
  createProgressBarStyle,
  createStatValueStyle,
  createStatLabelStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  SVG Circular Gauge                                                  */
/* ------------------------------------------------------------------ */

function CircularGauge({ percent, color, size, trackColor, strokeWidth }: {
  percent: number;
  color: string;
  size: number;
  trackColor: string;
  strokeWidth: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Preset                                                              */
/* ------------------------------------------------------------------ */

export const CompactBhSprintCapacity = createPreset<BhSprintCapacityProps>({
  name: 'BhSprintCapacity.Compact',
  render: (ctx: PresetContext<BhSprintCapacityProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      data,
      loading,
      onViewSprint,
      className,
      style,
    } = props;

    /* -- Token-based styles ------------------------------------------- */
    const personalityTypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const entranceAnim = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionHeader = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const emptyStyle = useMemo(() => createEmptyStateStyle(t), [t]);
    const skeletonStyle = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

    /* -- Loading state ------------------------------------------------ */
    if (loading) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
          padding: `${t.spacing[5]}px`,
          ...style,
        }} role="status" aria-label="Loading sprint capacity">
          <Box style={{ ...skeletonStyle, height: 20, width: '60%' }} />
          <Box style={{ display: 'flex', justifyContent: 'center' }}>
            <Box style={{ ...skeletonStyle, height: 80, width: 80, borderRadius: t.borderRadius.full }} />
          </Box>
          <Box style={{ ...skeletonStyle, height: 24, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 16, width: '50%' }} />
        </Box>
      );
    }

    /* -- Empty state -------------------------------------------------- */
    if (!data) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          ...style,
        }}>
          <Box style={{ ...emptyStyle, padding: `${t.spacing[4]}px` }}>
            <Box style={createIconContainerStyle(t, { size: 40 })}>
              <Zap size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No sprint capacity data
            </Text>
          </Box>
        </Box>
      );
    }

    const utilPct = Math.round(n(data.avgUtilization));
    const utilColor = getUtilizationColor(utilPct, t);
    const utilBadgeVariant = getUtilizationBadgeVariant(utilPct);
    const capacityPct = data.totalCapacity > 0
      ? Math.round((n(data.usedCapacity) / n(data.totalCapacity)) * 100) : 0;
    const capacityBar = createProgressBarStyle(t, { color: utilColor, percent: capacityPct });

    const TrendIcon = data.trend === 'increasing' ? TrendingUp
      : data.trend === 'decreasing' ? TrendingDown : Minus;
    const trendColor = data.trend === 'increasing' ? t.colors.successScale[600]
      : data.trend === 'decreasing' ? t.colors.errorScale[600] : t.colors.neutral[400];

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="Sprint Capacity"
        onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, cardHover.hover); }}
        onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, cardHover.base); }}
        style={{
          ...createCardStyle(t, { elevation: 'sm', padding: 0, glass: isGlass }),
          borderRadius: t.borderRadius.lg,
          overflow: 'hidden',
          ...entranceAnim.animate,
          transition: entranceAnim.transition,
          ...accentLayout.outer,
          ...style,
        }}
      >
        {/* Accent bar */}
        {accentBar && <Box style={accentBar} />}
        <Box style={{ ...accentLayout.inner, padding: `${t.spacing[5]}px` }}>

        {/* Title row */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: t.spacing[4],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Box style={createIconContainerStyle(t, { size: 32 })}>
              <Zap size={ICON_SIZES.section} color={t.colors.primaryScale[500]} aria-hidden="true" />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const }}>
              <Text style={{
                fontSize: t.typography.fontSize.md,
                fontWeight: personalityTypo.headingWeight,
                letterSpacing: personalityTypo.headingLetterSpacing,
                color: t.colors.neutral[900],
              }}>
                Sprint Capacity
              </Text>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.neutral[500],
              }}>
                {data.sprintName}
              </Text>
            </Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
            <TrendIcon size={ICON_SIZES.label} color={trendColor} aria-hidden="true" />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: trendColor }}>
              {data.trend}
            </Text>
          </Box>
        </Box>

        {/* Circular gauge + utilization */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: t.spacing[4],
          marginBottom: t.spacing[4],
        }}>
          <Box style={{ position: 'relative' as const, flexShrink: 0 }}>
            <CircularGauge
              percent={utilPct}
              color={utilColor}
              size={72}
              trackColor={t.colors.neutral[100]}
              strokeWidth={6}
            />
            <Box style={{
              position: 'absolute' as const,
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.neutral[900],
              }}>
                {utilPct}%
              </Text>
            </Box>
          </Box>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2], flex: 1 }}>
            <Box style={{
              ...createBadgeStyle(t, utilBadgeVariant),
              borderRadius: badgeRadius,
              alignSelf: 'flex-start',
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {utilPct < 70 ? 'Healthy' : utilPct <= 90 ? 'Busy' : 'Overloaded'}
              </Text>
            </Box>
            <Text style={createStatLabelStyle(t, { personality: personalityTypo })}>
              Avg Utilization
            </Text>
          </Box>
        </Box>

        {/* Capacity bar */}
        <Box style={{ marginBottom: t.spacing[3] }}>
          <Box style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: t.spacing[1],
          }}>
            <Text style={{ ...sectionHeader, marginBottom: 0 }}>Capacity</Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
              {n(data.usedCapacity)} / {n(data.totalCapacity)} pts
            </Text>
          </Box>
          <Box style={capacityBar.track}>
            <Box style={capacityBar.fill} />
          </Box>
        </Box>

        {/* Member stats */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
          borderRadius: t.borderRadius.md,
          backgroundColor: t.colors.neutral[50],
          border: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Users size={ICON_SIZES.label} color={t.colors.neutral[500]} aria-hidden="true" />
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>
              {n(data.memberCount)} members
            </Text>
          </Box>
          {n(data.overloadedMembers) > 0 && (
            <Box style={{
              ...createBadgeStyle(t, 'error'),
              borderRadius: badgeRadius,
            }}>
              <AlertTriangle size={ICON_SIZES.inline} aria-hidden="true" />
              <Text style={{ fontSize: t.typography.fontSize.xs, marginLeft: 2 }}>
                {n(data.overloadedMembers)} overloaded
              </Text>
            </Box>
          )}
        </Box>

        {/* View Sprint link */}
        {onViewSprint && (
          <Box
            role="button"
            tabIndex={0}
            aria-label="View sprint details"
            onClick={onViewSprint}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewSprint(); }
            }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: t.spacing[1],
              marginTop: t.spacing[3],
              padding: `${t.spacing[2]}px`,
              borderRadius: t.borderRadius.md,
              cursor: 'pointer',
              transition: `all ${t.motion.hover}`,
            }}
          >
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.semibold,
              color: t.colors.primaryScale[600],
            }}>
              View Sprint
            </Text>
            <ArrowRight size={ICON_SIZES.label} color={t.colors.primaryScale[600]} aria-hidden="true" />
          </Box>
        )}

        </Box>
      </div>
    );
  },
});
