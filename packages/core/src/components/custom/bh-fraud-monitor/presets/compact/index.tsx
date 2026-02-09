'use client';

/**
 * BhFraudMonitor - Compact Preset
 * Premium condensed event list with severity indicators and review status
 */

import React, { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhFraudMonitorProps, ProctoringEvent, EventType, EventSeverity } from '../../core';
import { getSeverityColors, getEventTypeLabel } from '../../core';
import {
  createCardStyle, createAccentBarStyle, createBadgeStyle,
  createPanelHeaderStyle, createListItemStyle, createStatusDotStyle, createHoverStyle,
} from '../../../helpers';

const EVENT_TYPE_SCALE: Record<EventType, 'error' | 'warning' | 'info' | 'primary' | 'secondary'> = {
  tab_switch: 'warning', copy_paste: 'error', screen_share: 'error',
  browser_resize: 'info', focus_loss: 'warning', suspicious_timing: 'error', similarity_flag: 'primary',
};

export const CompactBhFraudMonitor = createPreset<BhFraudMonitorProps>({
  name: 'BhFraudMonitor.Compact',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhFraudMonitorProps>) => {
    const { Box, Flex, Stack, Text, Spinner } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;
    const sevColors = getSeverityColors(tokens);
    const { events, stats, selectedEventId, onEventSelect, loading, className, style } = props;
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const containerStyle = useMemo(() => ({
      ...createCardStyle(tokens, { glass: isGlass, padding: 0, elevation: 'md' }),
      overflow: 'hidden' as const,
    }), [tokens, isGlass]);
    const accentBar = useMemo(
      () => createAccentBarStyle(tokens, { position: 'top', color: tokens.colors.errorScale[500] }),
      [tokens],
    );
    const headerStyle = useMemo(() => ({
      ...createPanelHeaderStyle(tokens),
      display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const,
    }), [tokens]);
    const hoverBase = useMemo(() => createHoverStyle(tokens), [tokens]);
    const sevBadgeMap = useMemo(() => ({
      critical: createBadgeStyle(tokens, 'error'), high: createBadgeStyle(tokens, 'error'),
      medium: createBadgeStyle(tokens, 'warning'), low: createBadgeStyle(tokens, 'info'),
    }), [tokens]);
    const reviewBadgeMap = useMemo(() => ({
      pending: createBadgeStyle(tokens, 'warning'), dismissed: createBadgeStyle(tokens, 'secondary'),
      flagged: createBadgeStyle(tokens, 'error'), escalated: createBadgeStyle(tokens, 'error'),
    }), [tokens]);
    const criticalDot = useMemo(() => ({
      ...createStatusDotStyle(tokens, sevColors.critical.dot),
      animation: 'pulse 2s ease-in-out infinite',
    }), [tokens, sevColors]);

    const formatTime = (ts: string) => {
      try {
        const d = new Date(ts);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      } catch { return ts; }
    };

    if (loading) {
      return (
        <Box style={containerStyle} className={className}>
          <Box style={accentBar} />
          <Flex align="center" justify="center" style={{ padding: tokens.spacing[8], ...style }}>
            <Spinner size="sm" />
            <Text style={{ color: tokens.colors.neutral[500], fontSize: tokens.typography.fontSize.xs, marginLeft: tokens.spacing[2] }}>
              Loading events...
            </Text>
          </Flex>
        </Box>
      );
    }

    const criticalCount = events.filter((e) => e.severity === 'critical').length;
    const highCount = events.filter((e) => e.severity === 'high').length;
    const pendingCount = events.filter((e) => e.reviewStatus === 'pending').length;

    const getTypeIndicator = (type: EventType) => {
      const scale = (tokens.colors as any)[`${EVENT_TYPE_SCALE[type]}Scale`];
      return { bg: scale?.[100] || tokens.colors.neutral[100], color: scale?.[600] || tokens.colors.neutral[600] };
    };

    const getSevBorder = (sev: EventSeverity, hovered: boolean) =>
      `${hovered ? 4 : 3}px solid ${sevColors[sev].dot}`;

    return (
      <Box className={className} style={{ ...containerStyle, ...style }}>
        <Box style={accentBar} />
        <Box style={headerStyle}>
          <Flex gap={8} align="center">
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
              Fraud Events
            </Text>
            <Box style={createBadgeStyle(tokens, 'primary')}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{events.length}</Text>
            </Box>
          </Flex>
          <Flex gap={6} align="center">
            {criticalCount > 0 && (
              <Flex gap={4} align="center" style={{ ...sevBadgeMap.critical, padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px` }}>
                <Box style={criticalDot} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: sevColors.critical.color }}>{criticalCount}</Text>
              </Flex>
            )}
            {highCount > 0 && (
              <Flex gap={4} align="center" style={{ ...sevBadgeMap.high, padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, backgroundColor: sevColors.high.bgColor }}>
                <Box style={createStatusDotStyle(tokens, sevColors.high.dot)} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: sevColors.high.color }}>{highCount}</Text>
              </Flex>
            )}
            {pendingCount > 0 && (
              <Flex gap={4} align="center" style={{ ...sevBadgeMap.medium, padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, backgroundColor: tokens.colors.warningScale[50] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[700] }}>{pendingCount} pending</Text>
              </Flex>
            )}
          </Flex>
        </Box>

        {stats && (
          <Flex gap={8} style={{
            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
            backgroundColor: tokens.colors.neutral[50],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
              Total: <Text style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{stats.totalEvents}</Text>
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
              Flagged: <Text style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.errorScale[600] }}>{stats.flaggedScorables}</Text>
            </Text>
          </Flex>
        )}

        <Stack gap={0} style={{ maxHeight: 320, overflowY: 'auto' as const }}>
          {events.slice(0, 15).map((ev: ProctoringEvent) => {
            const isHovered = hoveredId === ev.id;
            const isSelected = selectedEventId === ev.id;
            const typeInd = getTypeIndicator(ev.type);

            return (
              <Box
                key={ev.id}
                onClick={() => onEventSelect?.(ev.id)}
                onMouseEnter={() => setHoveredId(ev.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  ...createListItemStyle(tokens, { interactive: !!onEventSelect, active: isSelected }),
                  ...hoverBase,
                  borderLeft: getSevBorder(ev.severity, isHovered),
                  backgroundColor: isSelected
                    ? tokens.colors.primaryScale[50]
                    : isHovered ? tokens.colors.neutral[50] : 'transparent',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                }}
              >
                <Flex justify="between" align="start" gap={8}>
                  <Flex gap={8} align="center" style={{ flex: 1, minWidth: 0 }}>
                    <Box style={{
                      width: tokens.spacing[6], height: tokens.spacing[6],
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: typeInd.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Box style={{ ...createStatusDotStyle(tokens, typeInd.color), width: 6, height: 6 }} />
                    </Box>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Flex gap={6} align="center">
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                          {getEventTypeLabel(ev.type)}
                        </Text>
                        <Box style={{ ...sevBadgeMap[ev.severity], padding: `0 ${tokens.spacing[1]}px`, fontSize: tokens.typography.fontSize.xs }}>
                          {ev.severity}
                        </Box>
                      </Flex>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500],
                        marginTop: tokens.spacing[1], overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, maxWidth: '100%',
                      }}>
                        {ev.description}
                      </Text>
                      {ev.candidateName && (
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1] }}>
                          {ev.candidateName}
                        </Text>
                      )}
                    </Box>
                  </Flex>
                  <Flex direction="column" align="end" gap={4} style={{ flexShrink: 0 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], whiteSpace: 'nowrap' as const }}>
                      {formatTime(ev.timestamp)}
                    </Text>
                    <Box style={{ ...reviewBadgeMap[ev.reviewStatus], padding: `0 ${tokens.spacing[1]}px`, fontSize: tokens.typography.fontSize.xs }}>
                      {ev.reviewStatus}
                    </Box>
                  </Flex>
                </Flex>
              </Box>
            );
          })}
        </Stack>
      </Box>
    );
  },
});
