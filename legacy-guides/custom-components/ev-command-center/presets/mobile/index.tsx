'use client';

import { createPreset, type PresetContext } from '../../../factory';
import React from 'react';
import {
  createCardStyle,
  createHoverStyle,
  createStatusDotStyle,
  createBadgeStyle,
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

export const MobileEvCommandCenter = createPreset<EvCommandCenterProps>({
  name: 'EvCommandCenter.Mobile',
  render: (ctx: PresetContext<EvCommandCenterProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const panels = props.panels || MOCK_PANELS;
    const alerts = props.alerts || MOCK_ALERTS;
    const eventName = props.eventName || 'Summer Music Festival 2026';

    const [expandedPanels, setExpandedPanels] = React.useState<Set<string>>(new Set());

    const togglePanel = (panelId: string) => {
      const newExpanded = new Set(expandedPanels);
      if (newExpanded.has(panelId)) {
        newExpanded.delete(panelId);
      } else {
        newExpanded.add(panelId);
      }
      setExpandedPanels(newExpanded);
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

    const formatTimestamp = (date: Date) => {
      const now = Date.now();
      const diff = now - date.getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      return `${hours}h ${minutes % 60}m ago`;
    };

    const criticalAlerts = alerts.filter((a) => !a.acknowledged && a.severity === 'critical');

    return (
      <Box
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: tokens.colors.neutral[50],
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          style={{
            backgroundColor: tokens.colors.neutral[900],
            color: tokens.colors.neutral[50],
            padding: tokens.spacing[3],
            borderBottom: `1px solid ${tokens.colors.neutral[700]}`,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.bold,
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

        {/* Critical Alert Banner */}
        {criticalAlerts.length > 0 && (
          <Box
            style={{
              backgroundColor: tokens.colors.errorScale[50],
              borderLeft: `4px solid ${tokens.colors.errorScale[500]}`,
              padding: tokens.spacing[3],
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
            }}
          >
            <Box
              style={{
                width: '12px',
                height: '12px',
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.errorScale[500],
                flexShrink: 0,
              }}
            />
            <Box style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.errorScale[900],
                  marginBottom: tokens.spacing[1],
                }}
              >
                Critical Alert
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.errorScale[800],
                }}
              >
                {criticalAlerts[0].message}
              </Text>
            </Box>
          </Box>
        )}

        {/* Compact Metrics Row */}
        <Box
          style={{
            display: 'flex',
            overflowX: 'auto',
            gap: tokens.spacing[2],
            padding: tokens.spacing[3],
            backgroundColor: tokens.colors.common.white,
            borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
          }}
        >
          {panels.map((panel) => (
            <Box
              key={panel.id}
              style={{
                minWidth: '120px',
                padding: tokens.spacing[2],
                backgroundColor: tokens.colors.neutral[50],
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${tokens.colors.neutral[200]}`,
                flexShrink: 0,
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: tokens.spacing[1],
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[600],
                    fontWeight: tokens.typography.fontWeight.medium,
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
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                }}
              >
                {panel.value}
              </Text>
              {panel.trend !== undefined && (
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    marginTop: tokens.spacing[1],
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: getTrendColor(panel.trend),
                    }}
                  >
                    {getTrendIcon(panel.trend)}
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: getTrendColor(panel.trend),
                      fontWeight: tokens.typography.fontWeight.semibold,
                    }}
                  >
                    {Math.abs(panel.trend)}%
                  </Text>
                </Box>
              )}
            </Box>
          ))}
        </Box>

        {/* Collapsible Panels */}
        <Box
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: tokens.spacing[3],
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[3],
          }}
        >
          {panels.map((panel) => {
            const isExpanded = expandedPanels.has(panel.id);
            const isCritical = panel.status === 'critical';
            const isWarning = panel.status === 'warning';

            return (
              <Box
                key={panel.id}
                style={{
                  ...createCardStyle(tokens),
                  border: isCritical
                    ? `2px solid ${tokens.colors.errorScale[500]}`
                    : isWarning
                      ? `2px solid ${tokens.colors.warningScale[500]}`
                      : `1px solid ${tokens.colors.neutral[200]}`,
                  overflow: 'hidden',
                }}
              >
                {/* Panel Header - Clickable */}
                <Box
                  onClick={() => togglePanel(panel.id)}
                  style={{
                    padding: tokens.spacing[3],
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    backgroundColor: tokens.colors.common.white,
                    ...createHoverStyle(tokens),
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                    <Box
                      style={{
                        ...createStatusDotStyle(tokens, panel.status === 'critical' ? tokens.colors.errorScale[500] : panel.status === 'warning' ? tokens.colors.warningScale[500] : tokens.colors.successScale[500]),
                      }}
                    />
                    <Box>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[700],
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        {panel.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize['2xl'],
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        {panel.value}
                      </Text>
                    </Box>
                  </Box>
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[3],
                    }}
                  >
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
                            fontSize: tokens.typography.fontSize.lg,
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
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.lg,
                        color: tokens.colors.neutral[500],
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                      }}
                    >
                      ▼
                    </Text>
                  </Box>
                </Box>

                {/* Expanded Details */}
                {isExpanded && (
                  <Box
                    style={{
                      padding: tokens.spacing[3],
                      paddingTop: 0,
                      backgroundColor: tokens.colors.neutral[50],
                      borderTop: `1px solid ${tokens.colors.neutral[200]}`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                        lineHeight: 1.5,
                      }}
                    >
                      {panel.details}
                    </Text>
                    <Box
                      onClick={() => props.onPanelClick?.(panel.id)}
                      style={{
                        marginTop: tokens.spacing[3],
                        padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                        backgroundColor: tokens.colors.primaryScale[600],
                        color: tokens.colors.common.white,
                        borderRadius: tokens.borderRadius.md,
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        textAlign: 'center',
                        cursor: 'pointer',
                        ...createHoverStyle(tokens),
                      }}
                    >
                      View Details
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })}

          {/* Alerts Section */}
          <Box
            style={{
              ...createCardStyle(tokens),
              padding: tokens.spacing[3],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[700],
                marginBottom: tokens.spacing[3],
              }}
            >
              Recent Alerts ({alerts.length})
            </Text>
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacing[2],
              }}
            >
              {alerts.map((alert) => (
                <Box
                  key={alert.id}
                  style={{
                    padding: tokens.spacing[2],
                    backgroundColor: alert.acknowledged
                      ? tokens.colors.neutral[50]
                      : tokens.colors.common.white,
                    borderRadius: tokens.borderRadius.md,
                    borderLeft: `3px solid ${getSeverityColor(alert.severity)}`,
                    opacity: alert.acknowledged ? 0.6 : 1,
                  }}
                >
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: tokens.spacing[2],
                    }}
                  >
                    <Box style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[900],
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        {alert.message}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                        }}
                      >
                        {alert.source} • {formatTimestamp(alert.timestamp)}
                      </Text>
                    </Box>
                    {!alert.acknowledged && (
                      <Box
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          props.onAlertAcknowledge?.(alert.id);
                        }}
                        style={{
                          ...createBadgeStyle(tokens, 'primary'),
                          cursor: 'pointer',
                          fontSize: tokens.typography.fontSize.xs,
                          padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                        }}
                      >
                        ACK
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
