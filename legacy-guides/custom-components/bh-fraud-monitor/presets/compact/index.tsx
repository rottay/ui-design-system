'use client';

/**
 * BhFraudMonitor - Compact Preset
 * Slite-inspired condensed event list with severity indicators,
 * review status badges, and clean filter pills.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhFraudMonitorProps, ProctoringEvent, EventType, EventSeverity } from '../../core';
import { getSeverityColors, getEventTypeLabel } from '../../core';
import {
  createCardStyle, createBadgeStyle, createCardHoverStyles,
  createEntranceAnimation, createStaggerDelay,
  createPersonalitySectionHeaderStyle, getPersonalityTypography,
  getPersonalityBadgeRadius, createIconContainerStyle,
  createEmptyStateStyle,
  createPersonalityAccentBar,

  createDividerStyle,
} from '../../../helpers';
import type { DesignTokens } from '../../../../../types';
import { ShieldAlert, AlertTriangle, Clock } from 'lucide-react';

const EVENT_TYPE_SCALE: Record<EventType, 'error' | 'warning' | 'info' | 'primary' | 'secondary'> = {
  tab_switch: 'warning', copy_paste: 'error', screen_share: 'error',
  browser_resize: 'info', focus_loss: 'warning', suspicious_timing: 'error', similarity_flag: 'primary',
};

export const CompactBhFraudMonitor = createPreset<BhFraudMonitorProps>({
  name: 'BhFraudMonitor.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhFraudMonitorProps>) => {
    const { Box, Text } = primitives;
    const isGlass = tokens.surface.useGlass;
    const sevColors = useMemo(() => getSeverityColors(tokens), [tokens]);
    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const hoverStyles = useMemo(() => createCardHoverStyles(tokens), [tokens]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);
    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
    });
    const { events: rawEvents = [], stats, timeRange, selectedEventId, onEventSelect, loading, className, style } = props;

    const events = Array.isArray(rawEvents) ? rawEvents : [];
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const handleEventSelect = useCallback((id: string) => {
      onEventSelect?.(id);
    }, [onEventSelect]);

    const formatTime = useCallback((ts: string) => {
      try {
        const d = new Date(ts);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      } catch { return ts; }
    }, []);

    if (loading) {
      return (
        <Box className={className} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: `${tokens.spacing[10]}px`, ...style,
        }}>
          <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>Loading events...</Text>
        </Box>
      );
    }

    const criticalCount = events.filter(e => e.severity === 'critical').length;
    const highCount = events.filter(e => e.severity === 'high').length;
    const pendingCount = events.filter(e => e.reviewStatus === 'pending').length;

    const getTypeIndicator = (type: EventType) => {
      const scale = tokens.colors[`${EVENT_TYPE_SCALE[type]}Scale` as keyof typeof tokens.colors] as Record<number, string> | undefined;
      return { bg: scale?.[100] || tokens.colors.neutral[100], color: scale?.[600] || tokens.colors.neutral[600] };
    };

    const reviewBadgeColors: Record<string, { bg: string; color: string }> = {
      pending: { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700] },
      dismissed: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[600] },
      flagged: { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700] },
      escalated: { bg: tokens.colors.errorScale[100], color: tokens.colors.errorScale[800] },
    };

    return (
      <Box className={className} style={{
        ...createCardStyle(tokens, { elevation: 'sm', padding: 0, glass: isGlass }),
        borderRadius: tokens.borderRadius.lg,
        border: `1px solid ${tokens.colors.neutral[100]}`,
        overflow: 'hidden', ...style,
      }}>
        {accentBar && <Box style={accentBar} />}
        {/* Header */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Box style={{
              width: 32, height: 32, borderRadius: tokens.borderRadius.lg,
              backgroundColor: tokens.colors.errorScale[50],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShieldAlert size={16} color={tokens.colors.errorScale[500]} />
            </Box>
            <Text style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}>
              Fraud Events{timeRange ? ` - ${timeRange}` : ''}
            </Text>
            <Box style={{
              ...createBadgeStyle(tokens, 'primary'),
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
            }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[700] }}>{events.length}</Text>
            </Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {criticalCount > 0 && (
              <Box style={{
                padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: sevColors.critical.bgColor,
                border: `1px solid ${sevColors.critical.border}`,
                display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
              }}>
                <Box style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: sevColors.critical.dot }} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: sevColors.critical.color }}>{criticalCount}</Text>
              </Box>
            )}
            {highCount > 0 && (
              <Box style={{
                padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: sevColors.high.bgColor,
                border: `1px solid ${sevColors.high.border}`,
                display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
              }}>
                <Box style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: sevColors.high.dot }} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: sevColors.high.color }}>{highCount}</Text>
              </Box>
            )}
            {pendingCount > 0 && (
              <Box style={{
                padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.warningScale[50],
                border: `1px solid ${tokens.colors.warningScale[200]}`,
              }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[700] }}>{pendingCount} pending</Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Stats row */}
        {stats && (
          <Box style={{ display: 'flex', gap: tokens.spacing[4], alignItems: 'center',
            padding: `${tokens.spacing[3]}px ${tokens.spacing[6]}px`,
            backgroundColor: tokens.colors.neutral[50],
            borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
          }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
              Total: <Text style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{stats.totalEvents}</Text>
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
              Flagged: <Text style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.errorScale[600] }}>{stats.flaggedScorables}</Text>
            </Text>
          </Box>
        )}

        {/* Event list */}
        <Box style={{ maxHeight: 380, overflowY: 'auto' as const }}>
          {events.slice(0, 15).map((ev: ProctoringEvent, i) => {
            const isHovered = hoveredId === ev.id;
            const isSelected = selectedEventId === ev.id;
            const typeInd = getTypeIndicator(ev.type);
            const sevBadge = sevColors[ev.severity];
            const reviewBadge = reviewBadgeColors[ev.reviewStatus];

            return (
              <Box
                key={ev.id}
                onClick={() => handleEventSelect(ev.id)}
                onMouseEnter={() => setHoveredId(ev.id)}
                onMouseLeave={() => setHoveredId(null)}
                role="button"
                tabIndex={0}
                aria-label={`${ev.severity} event: ${ev.description}`}
                aria-selected={selectedEventId === ev.id}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEventSelect(ev.id); } }}
                style={{
                  ...animStyle(i),
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[6]}px`,
                  borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                  borderLeft: `3px solid ${sevBadge.dot}`,
                  backgroundColor: isSelected ? tokens.colors.primaryScale[50] : isHovered ? tokens.colors.neutral[50] : 'transparent',
                  cursor: onEventSelect ? 'pointer' : 'default',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flex: 1, minWidth: 0 }}>
                    <Box style={{
                      width: 24, height: 24, borderRadius: tokens.borderRadius.full,
                      backgroundColor: typeInd.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Box style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: typeInd.color }} />
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], flex: 1, minWidth: 0 }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                          {getEventTypeLabel(ev.type)}
                        </Text>
                        <Box style={{
                          padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: sevBadge.bgColor,
                        }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: sevBadge.color, textTransform: 'capitalize' as const }}>{ev.severity}</Text>
                        </Box>
                      </Box>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500],
                        overflow: 'hidden' as const, textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                      }}>
                        {ev.description}
                      </Text>
                      {ev.candidateName && (
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400]}}>
                          {ev.candidateName}
                        </Text>
                      )}
                    </Box>
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: tokens.spacing[1], flexShrink: 0, marginLeft: tokens.spacing[3] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], whiteSpace: 'nowrap' as const }}>
                      {formatTime(ev.timestamp)}
                    </Text>
                    <Box style={{
                      padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: reviewBadge.bg,
                    }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: reviewBadge.color, textTransform: 'capitalize' as const }}>{ev.reviewStatus}</Text>
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
