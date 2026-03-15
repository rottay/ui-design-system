'use client';

import { createPreset, type PresetContext } from '../../../factory';
import React from 'react';
import {
  createCardStyle,
  createHoverStyle,
  createStatusDotStyle,
} from '../../../helpers';
import type { EvCommandCenterProps, CommandPanel, CommandAlert } from '../../core';

// Mock data for standalone demo
const MOCK_PANELS: CommandPanel[] = [
  {
    id: 'crowd',
    title: 'Crowd Density',
    type: 'crowd',
    value: '8,234',
    trend: 12,
    status: 'warning',
    details: 'Stage A area at 92% capacity',
  },
  {
    id: 'orders',
    title: 'Active Orders',
    type: 'orders',
    value: '347',
    trend: -5,
    status: 'normal',
    details: 'Avg wait time: 8m',
  },
  {
    id: 'staff',
    title: 'Staff Status',
    type: 'staff',
    value: '124/132',
    trend: 0,
    status: 'normal',
    details: '8 on break, 94% coverage',
  },
  {
    id: 'revenue',
    title: 'Revenue',
    type: 'revenue',
    value: '$142,567',
    trend: 18,
    status: 'normal',
    details: 'Up 18% vs last event',
  },
  {
    id: 'alerts',
    title: 'Active Alerts',
    type: 'alerts',
    value: '3',
    trend: 2,
    status: 'critical',
    details: '1 critical, 2 warnings',
  },
  {
    id: 'stages',
    title: 'Stage Status',
    type: 'stages',
    value: '2/3',
    trend: 0,
    status: 'normal',
    details: 'Stage C offline for maintenance',
  },
];

const MOCK_ALERTS: CommandAlert[] = [
  {
    id: 'alert-1',
    severity: 'critical',
    message: 'Stage A crowd density exceeds safe threshold',
    source: 'Crowd Monitor',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    acknowledged: false,
  },
  {
    id: 'alert-2',
    severity: 'warning',
    message: 'Bar 3 inventory low on premium spirits',
    source: 'Inventory System',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    acknowledged: false,
  },
  {
    id: 'alert-3',
    severity: 'warning',
    message: 'Medical team requested at VIP section',
    source: 'Security Radio',
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    acknowledged: true,
  },
  {
    id: 'alert-4',
    severity: 'info',
    message: 'Headliner scheduled to go on stage in 30 minutes',
    source: 'Event Schedule',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    acknowledged: false,
  },
];

export const FullscreenEvCommandCenter = createPreset<EvCommandCenterProps>({
  name: 'EvCommandCenter.Fullscreen',
  render: (ctx: PresetContext<EvCommandCenterProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const panels = props.panels || MOCK_PANELS;
    const alerts = props.alerts || MOCK_ALERTS;
    const eventName = props.eventName || 'Summer Music Festival 2026';

    // Current time for live clock
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    };

    const formatTimestamp = (date: Date) => {
      const now = Date.now();
      const diff = now - date.getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      return `${hours}h ${minutes % 60}m ago`;
    };

    const getTrendIcon = (trend?: number) => {
      if (!trend || trend === 0) return '→';
      return trend > 0 ? '↑' : '↓';
    };

    const getTrendColor = (trend?: number) => {
      if (!trend || trend === 0) return tokens.colors.neutral[500];
      return trend > 0 ? tokens.colors.successScale[500] : tokens.colors.errorScale[500];
    };

    const getSeverityColor = (severity: CommandAlert['severity']) => {
      switch (severity) {
        case 'critical':
          return tokens.colors.errorScale[500];
        case 'warning':
          return tokens.colors.warningScale[500];
        default:
          return tokens.colors.infoScale[500];
      }
    };

    // Pulsing animation for critical panels
    const pulseKeyframes = `
      @keyframes pulse-border {
        0%, 100% { box-shadow: 0 0 0 0px ${tokens.colors.errorScale[500]}40; }
        50% { box-shadow: 0 0 0 8px ${tokens.colors.errorScale[500]}00; }
      }
    `;

    return (
      <Box
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: tokens.colors.neutral[900],
          color: tokens.colors.neutral[50],
          padding: tokens.spacing[6],
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[4],
          overflow: 'hidden',
        }}
      >
        <style>{pulseKeyframes}</style>

        {/* Header */}
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: tokens.spacing[3],
            borderBottom: `1px solid ${tokens.colors.neutral[700]}`,
          }}
        >
          <Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[50],
                marginBottom: tokens.spacing[1],
              }}
            >
              Command Center
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[400],
              }}
            >
              {eventName}
            </Text>
          </Box>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
            }}
          >
            <Box
              style={{
                ...createStatusDotStyle(tokens, tokens.colors.successScale[500]),
                marginRight: tokens.spacing[1],
              }}
            />
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[400],
                marginRight: tokens.spacing[4],
              }}
            >
              All Systems Operational
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[50],
                fontFamily: 'monospace',
              }}
            >
              {formatTime(currentTime)}
            </Text>
          </Box>
        </Box>

        {/* Panels Grid (2x3) */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            gap: tokens.spacing[4],
            flex: 1,
            minHeight: 0,
          }}
        >
          {panels.map((panel) => {
            const isCritical = panel.status === 'critical';
            const isWarning = panel.status === 'warning';

            return (
              <Box
                key={panel.id}
                onClick={() => props.onPanelClick?.(panel.id)}
                style={{
                  ...createCardStyle(tokens),
                  ...createHoverStyle(tokens),
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: tokens.spacing[4],
                  position: 'relative',
                  border: isCritical
                    ? `2px solid ${tokens.colors.errorScale[500]}`
                    : isWarning
                      ? `2px solid ${tokens.colors.warningScale[500]}`
                      : `1px solid ${tokens.colors.neutral[700]}`,
                  animation: isCritical ? 'pulse-border 2s ease-in-out infinite' : 'none',
                }}
              >
                {/* Panel Header */}
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[400],
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {panel.title}
                  </Text>
                  <Box
                    style={{
                      ...createStatusDotStyle(tokens, panel.status === 'critical' ? tokens.colors.errorScale[500] : panel.status === 'warning' ? tokens.colors.warningScale[500] : tokens.colors.successScale[500]),
                    }}
                  />
                </Box>

                {/* Main Metric */}
                <Box
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize['4xl'],
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[50],
                      lineHeight: 1.2,
                      marginBottom: tokens.spacing[2],
                    }}
                  >
                    {panel.value}
                  </Text>

                  {/* Trend */}
                  {panel.trend !== undefined && (
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xl,
                          color: getTrendColor(panel.trend),
                        }}
                      >
                        {getTrendIcon(panel.trend)}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: getTrendColor(panel.trend),
                          fontWeight: tokens.typography.fontWeight.semibold,
                        }}
                      >
                        {Math.abs(panel.trend)}%
                      </Text>
                    </Box>
                  )}
                </Box>

                {/* Details */}
                {panel.details && (
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      marginTop: tokens.spacing[2],
                      paddingTop: tokens.spacing[2],
                      borderTop: `1px solid ${tokens.colors.neutral[700]}`,
                    }}
                  >
                    {panel.details}
                  </Text>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Alert Feed */}
        <Box
          style={{
            height: '200px',
            ...createCardStyle(tokens),
            padding: tokens.spacing[3],
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[2],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[300],
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: tokens.spacing[1],
            }}
          >
            Recent Alerts
          </Text>
          <Box
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[2],
            }}
          >
            {alerts.map((alert) => (
              <Box
                key={alert.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: tokens.spacing[3],
                  padding: tokens.spacing[2],
                  backgroundColor: alert.acknowledged
                    ? tokens.colors.neutral[800]
                    : tokens.colors.neutral[700],
                  borderRadius: tokens.borderRadius.md,
                  borderLeft: `3px solid ${getSeverityColor(alert.severity)}`,
                  opacity: alert.acknowledged ? 0.6 : 1,
                }}
              >
                <Box
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: getSeverityColor(alert.severity),
                    marginTop: tokens.spacing[1],
                    flexShrink: 0,
                  }}
                />
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[100],
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    {alert.message}
                  </Text>
                  <Box
                    style={{
                      display: 'flex',
                      gap: tokens.spacing[3],
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                    }}
                  >
                    <Text>{alert.source}</Text>
                    <Text>•</Text>
                    <Text>{formatTimestamp(alert.timestamp)}</Text>
                  </Box>
                </Box>
                {!alert.acknowledged && (
                  <Box
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      props.onAlertAcknowledge?.(alert.id);
                    }}
                    style={{
                      padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                      backgroundColor: tokens.colors.primaryScale[600],
                      color: tokens.colors.common.white,
                      borderRadius: tokens.borderRadius.sm,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      flexShrink: 0,
                      ...createHoverStyle(tokens),
                    }}
                  >
                    ACK
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  },
});
