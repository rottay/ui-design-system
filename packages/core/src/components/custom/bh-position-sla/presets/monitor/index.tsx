'use client';

/**
 * BhPositionSla - Monitor Preset
 * Full SLA dashboard with countdown timers, status indicators,
 * and position details. Personality-driven, glass-aware.
 */

import { useState, useCallback, useMemo} from 'react';
import {
  Clock, AlertTriangle, Shield, Users,
  ChevronRight, Target, TrendingDown, CheckCircle,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalityAccentBar,
  createProgressBarStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  createCardHoverStyles,
  getAccentAwareLayout,

  createDividerStyle,
  createPersonalitySectionHeaderStyle,
} from '../../../helpers';
import type { BhPositionSlaProps, PositionSlaData } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusConfig(status: PositionSlaData['status'], t: DesignTokens) {
  switch (status) {
    case 'on-track':
      return { label: 'On Track', color: t.colors.successScale[600], bg: t.colors.successScale[50], badge: 'success' as const, icon: CheckCircle };
    case 'at-risk':
      return { label: 'At Risk', color: t.colors.warningScale[600], bg: t.colors.warningScale[50], badge: 'warning' as const, icon: AlertTriangle };
    case 'breached':
      return { label: 'Breached', color: t.colors.errorScale[600], bg: t.colors.errorScale[50], badge: 'error' as const, icon: TrendingDown };
  }
}

function getSlaPercent(days: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, ((total - days) / total) * 100));
}

/* ================================================================== */
/*  Monitor Preset                                                     */
/* ================================================================== */

export const MonitorBhPositionSla = createPreset<BhPositionSlaProps>({
  name: 'BhPositionSla.Monitor',
  render: (ctx: PresetContext<BhPositionSlaProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);

    const {
      positions: rawPositions = [],
      onPositionClick,
      selectedPositionId,
      loading = false,
      className,
      style,
    } = props;

    const positions = Array.isArray(rawPositions) ? rawPositions : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'md', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const stats = useMemo(() => ({
      total: positions.length,
      onTrack: positions.filter(p => p.status === 'on-track').length,
      atRisk: positions.filter(p => p.status === 'at-risk').length,
      breached: positions.filter(p => p.status === 'breached').length,
    }), [positions]);

    const sorted = useMemo(
      () => [...positions].sort((a, b) => a.daysRemaining - b.daysRemaining),
      [positions],
    );

    const animStyle = useCallback((index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    }), [entrance, t]);

    const handleClick = useCallback((id: string) => {
      onPositionClick?.(id);
    }, [onPositionClick]);

    const divider = useMemo(() => createDividerStyle(t), [t]);

    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);


    return (
      <Box
        className={className}
        style={{ ...card, padding: 0, overflow: 'hidden', ...accentLayout.outer,
          ...style }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.warningScale[50] })}>
                <Clock size={20} color={t.colors.warningScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  SLA Monitor
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>
                  {stats.total} positions tracked
                </Text>
              </Box>
            </Box>

            {/* Stats summary */}
            <Box style={{ display: 'flex', gap: t.spacing[3] }}>
              {[
                { label: 'On Track', count: stats.onTrack, color: t.colors.successScale[600], bg: t.colors.successScale[50] },
                { label: 'At Risk', count: stats.atRisk, color: t.colors.warningScale[600], bg: t.colors.warningScale[50] },
                { label: 'Breached', count: stats.breached, color: t.colors.errorScale[600], bg: t.colors.errorScale[50] },
              ].map(s => (
                <Box key={s.label} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                  textAlign: 'center' as const,
                  padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                  borderRadius: badgeRadius,
                  backgroundColor: s.bg,
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: s.color }}>
                    {s.count}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: s.color }}>{s.label}</Text>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Position list */}
        <Box style={{ padding: t.spacing[4] }} role="list" aria-label="SLA positions">
          {positions.length === 0 && (
            <Box style={createEmptyStateStyle(t)}>
              <Shield size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                No positions to monitor
              </Text>
            </Box>
          )}

          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
            {sorted.map((pos, idx) => {
              const cfg = getStatusConfig(pos.status, t);
              const isSelected = selectedPositionId === pos.id;
              const isHovered = hoveredId === pos.id;
              const StatusIcon = cfg.icon;
              const progress = createProgressBarStyle(t, { color: cfg.color, percent: getSlaPercent(pos.daysRemaining, 30) });

              return (
                <Box
                  key={pos.id}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`${pos.positionTitle}, ${cfg.label}, ${pos.daysRemaining} days remaining`}
                  onClick={() => handleClick(pos.id)}
                  onMouseEnter={() => setHoveredId(pos.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(pos.id); } }}
                  style={{
                    ...animStyle(idx),
                    padding: t.spacing[4],
                    borderRadius: t.borderRadius.lg,
                    border: `1px solid ${isSelected ? cfg.color : t.colors.neutral[100]}`,
                    borderLeft: `3px solid ${cfg.color}`,
                    backgroundColor: isSelected ? cfg.bg : isHovered ? t.colors.neutral[50] : t.colors.common.white,
                    cursor: 'pointer',
                    transition: `all ${t.motion.hover}`,
                    ...(isHovered ? hoverStyles.hover : {}),
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <StatusIcon size={14} color={cfg.color} />
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: t.colors.neutral[900],
                      }}>
                        {pos.positionTitle}
                      </Text>
                    </Box>
                    <Box style={{
                      ...createBadgeStyle(t, cfg.badge),
                      borderRadius: badgeRadius,
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs }}>{cfg.label}</Text>
                    </Box>
                  </Box>

                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4], marginBottom: t.spacing[3] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                      {pos.clientName}
                    </Text>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Target size={10} color={t.colors.neutral[400]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                        {pos.currentStage}
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Users size={10} color={t.colors.neutral[400]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                        {pos.candidateCount}
                      </Text>
                    </Box>
                  </Box>

                  {/* SLA progress bar */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                    <Box style={{ flex: 1 }}>
                      <Box style={progress.track}>
                        <Box style={progress.fill} />
                      </Box>
                    </Box>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.bold,
                      color: cfg.color,
                      flexShrink: 0,
                      minWidth: 48,
                      textAlign: 'right' as const,
                    }}>
                      {pos.daysRemaining <= 0 ? `${Math.abs(pos.daysRemaining)}d over` : `${pos.daysRemaining}d left`}
                    </Text>
                  </Box>

                  {/* Compliance status and breach count */}
                  {(pos.complianceStatus || pos.totalBreaches != null) && (
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginTop: t.spacing[2] }}>
                      {pos.complianceStatus && (
                        <Box style={{
                          ...createBadgeStyle(t, pos.complianceStatus === 'compliant' ? 'success' : pos.complianceStatus === 'non-compliant' ? 'error' : 'warning'),
                          borderRadius: badgeRadius,
                          display: 'inline-flex', alignItems: 'center', gap: t.spacing[1],
                        }}>
                          <Shield size={10} />
                          <Text style={{ fontSize: t.typography.fontSize.xs, textTransform: 'capitalize' as const }}>{pos.complianceStatus.replace('-', ' ')}</Text>
                        </Box>
                      )}
                      {pos.totalBreaches != null && pos.totalBreaches > 0 && (
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], fontSize: t.typography.fontSize.xs, color: t.colors.errorScale[600] }}>
                          <AlertTriangle size={10} />
                          <Text style={{ fontSize: 'inherit', color: 'inherit' }}>
                            {pos.totalBreaches} breach{pos.totalBreaches > 1 ? 'es' : ''}
                          </Text>
                        </Box>
                      )}
                      {pos.milestones && pos.milestones.length > 0 && (
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                          {pos.milestones.filter(m => m.completed).length}/{pos.milestones.length} milestones
                        </Text>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
