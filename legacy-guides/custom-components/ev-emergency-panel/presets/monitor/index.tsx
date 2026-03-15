'use client';

import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createProgressBarStyle,
  createBadgeStyle,
} from '../../../helpers';
import type { EvEmergencyPanelProps, ZoneEvacuation } from '../../core';

// Mock data for standalone demo
const MOCK_ZONES: ZoneEvacuation[] = [
  {
    zoneId: 'zone-a',
    zoneName: 'General Admission A',
    totalCapacity: 2500,
    currentOccupancy: 450,
    evacuated: 2050,
    percentComplete: 82,
    exits: [
      { name: 'Exit A1', status: 'open' },
      { name: 'Exit A2', status: 'open' },
      { name: 'Exit A3', status: 'congested' },
    ],
  },
  {
    zoneId: 'zone-b',
    zoneName: 'General Admission B',
    totalCapacity: 2500,
    currentOccupancy: 1200,
    evacuated: 1300,
    percentComplete: 52,
    exits: [
      { name: 'Exit B1', status: 'congested' },
      { name: 'Exit B2', status: 'open' },
    ],
  },
  {
    zoneId: 'vip',
    zoneName: 'VIP Section',
    totalCapacity: 500,
    currentOccupancy: 50,
    evacuated: 450,
    percentComplete: 90,
    exits: [
      { name: 'VIP Exit 1', status: 'open' },
      { name: 'VIP Exit 2', status: 'open' },
    ],
  },
  {
    zoneId: 'stage',
    zoneName: 'Stage Area',
    totalCapacity: 1234,
    currentOccupancy: 800,
    evacuated: 434,
    percentComplete: 35,
    exits: [
      { name: 'Stage Left', status: 'blocked' },
      { name: 'Stage Right', status: 'congested' },
      { name: 'Backstage', status: 'open' },
    ],
  },
];

const MOCK_EVENTS = [
  {
    id: 'evt-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    zone: 'General Admission A',
    message: 'Evacuation 82% complete',
    type: 'progress' as const,
  },
  {
    id: 'evt-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    zone: 'Stage Area',
    message: 'Exit Stage Left blocked - redirecting to Stage Right',
    type: 'warning' as const,
  },
  {
    id: 'evt-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    zone: 'VIP Section',
    message: 'VIP evacuation proceeding smoothly',
    type: 'success' as const,
  },
  {
    id: 'evt-4',
    timestamp: new Date(Date.now() - 1000 * 60 * 7),
    zone: 'General Admission B',
    message: 'Congestion at Exit B1 - staff deployed',
    type: 'warning' as const,
  },
  {
    id: 'evt-5',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    zone: 'All Zones',
    message: 'Evacuation initiated',
    type: 'info' as const,
  },
];

export const MonitorEvEmergencyPanel = createPreset<EvEmergencyPanelProps>({
  name: 'EvEmergencyPanel.Monitor',
  render: (ctx: PresetContext<EvEmergencyPanelProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const zones = props.zones || MOCK_ZONES;
    const headcount = props.headcount || {
      total: 8234,
      accounted: 5834,
      missing: 2400,
    };

    const getExitStatusColor = (status: 'open' | 'blocked' | 'congested') => {
      switch (status) {
        case 'open':
          return tokens.colors.successScale;
        case 'blocked':
          return tokens.colors.errorScale;
        case 'congested':
          return tokens.colors.warningScale;
      }
    };

    const getEventTypeColor = (type: 'progress' | 'warning' | 'success' | 'info') => {
      switch (type) {
        case 'progress':
          return tokens.colors.primaryScale[500];
        case 'warning':
          return tokens.colors.warningScale[500];
        case 'success':
          return tokens.colors.successScale[500];
        case 'info':
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

    const totalEvacuated = zones.reduce((sum, zone) => sum + zone.evacuated, 0);
    const totalRemaining = zones.reduce((sum, zone) => sum + zone.currentOccupancy, 0);
    const overallProgress = (totalEvacuated / headcount.total) * 100;

    return (
      <Box
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: tokens.colors.neutral[900],
          color: tokens.colors.neutral[50],
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          style={{
            padding: tokens.spacing[4],
            borderBottom: `1px solid ${tokens.colors.neutral[700]}`,
            backgroundColor: tokens.colors.errorScale[900],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.common.white,
            }}
          >
            Evacuation Monitor
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.errorScale[200],
              marginTop: tokens.spacing[1],
            }}
          >
            Real-time evacuation progress tracking
          </Text>
        </Box>

        {/* Overall Progress Summary */}
        <Box
          style={{
            padding: tokens.spacing[4],
            backgroundColor: tokens.colors.neutral[800],
            borderBottom: `1px solid ${tokens.colors.neutral[700]}`,
          }}
        >
          <Box
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: tokens.spacing[3],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[50],
              }}
            >
              Overall Progress
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['3xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: overallProgress >= 75
                  ? tokens.colors.successScale[400]
                  : overallProgress >= 50
                    ? tokens.colors.warningScale[400]
                    : tokens.colors.errorScale[400],
              }}
            >
              {Math.round(overallProgress)}%
            </Text>
          </Box>
          <Box style={{ marginBottom: tokens.spacing[4] }}>
            {(() => {
              const progressStyles = createProgressBarStyle(
                tokens,
                { percent: overallProgress, color: overallProgress >= 75 ? tokens.colors.successScale[500] : overallProgress >= 50 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500] }
              );
              return (
                <Box style={{ ...progressStyles.track, height: '16px' }}>
                  <Box style={progressStyles.fill} />
                </Box>
              );
            })()}
          </Box>
          <Box
            style={{
              display: 'flex',
              gap: tokens.spacing[6],
            }}
          >
            <Box style={{ textAlign: 'center' }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[100],
                }}
              >
                {headcount.total.toLocaleString()}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}
              >
                Total
              </Text>
            </Box>
            <Box style={{ textAlign: 'center' }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.successScale[400],
                }}
              >
                {totalEvacuated.toLocaleString()}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}
              >
                Evacuated
              </Text>
            </Box>
            <Box style={{ textAlign: 'center' }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.warningScale[400],
                }}
              >
                {totalRemaining.toLocaleString()}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}
              >
                Remaining
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box
          style={{
            flex: 1,
            display: 'flex',
            gap: tokens.spacing[4],
            padding: tokens.spacing[4],
            overflow: 'hidden',
          }}
        >
          {/* Zone Progress Cards */}
          <Box
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[4],
            }}
          >
            {zones.map((zone) => (
              <Box
                key={zone.zoneId}
                style={{
                  ...createCardStyle(tokens),
                  padding: tokens.spacing[4],
                  border:
                    zone.percentComplete >= 75
                      ? `2px solid ${tokens.colors.successScale[500]}`
                      : zone.percentComplete >= 50
                        ? `2px solid ${tokens.colors.warningScale[500]}`
                        : `2px solid ${tokens.colors.errorScale[500]}`,
                }}
              >
                {/* Zone Header */}
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[50],
                    }}
                  >
                    {zone.zoneName}
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize['2xl'],
                      fontWeight: tokens.typography.fontWeight.bold,
                      color:
                        zone.percentComplete >= 75
                          ? tokens.colors.successScale[400]
                          : zone.percentComplete >= 50
                            ? tokens.colors.warningScale[400]
                            : tokens.colors.errorScale[400],
                    }}
                  >
                    {zone.percentComplete}%
                  </Text>
                </Box>

                {/* Progress Bar */}
                <Box style={{ marginBottom: tokens.spacing[3] }}>
                  {(() => {
                    const progressStyles = createProgressBarStyle(
                      tokens,
                      { percent: zone.percentComplete, color: zone.percentComplete >= 75 ? tokens.colors.successScale[500] : zone.percentComplete >= 50 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500] }
                    );
                    return (
                      <Box style={{ ...progressStyles.track, height: '12px' }}>
                        <Box style={progressStyles.fill} />
                      </Box>
                    );
                  })()}
                </Box>

                {/* Stats Grid */}
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: tokens.spacing[3],
                    marginBottom: tokens.spacing[3],
                    padding: tokens.spacing[3],
                    backgroundColor: tokens.colors.neutral[800],
                    borderRadius: tokens.borderRadius.md,
                  }}
                >
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      Capacity
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[100],
                      }}
                    >
                      {zone.totalCapacity.toLocaleString()}
                    </Text>
                  </Box>
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      Evacuated
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.successScale[400],
                      }}
                    >
                      {zone.evacuated.toLocaleString()}
                    </Text>
                  </Box>
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      Remaining
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.warningScale[400],
                      }}
                    >
                      {zone.currentOccupancy.toLocaleString()}
                    </Text>
                  </Box>
                </Box>

                {/* Exit Status */}
                <Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[400],
                      marginBottom: tokens.spacing[2],
                    }}
                  >
                    Exit Status
                  </Text>
                  <Box
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: tokens.spacing[2],
                    }}
                  >
                    {zone.exits.map((exit) => {
                      const statusColors = getExitStatusColor(exit.status);
                      return (
                        <Box
                          key={exit.name}
                          style={{
                            padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                            backgroundColor: `${statusColors[900]}`,
                            border: `1px solid ${statusColors[700]}`,
                            borderRadius: tokens.borderRadius.md,
                            display: 'flex',
                            alignItems: 'center',
                            gap: tokens.spacing[2],
                          }}
                        >
                          <Box
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: tokens.borderRadius.full,
                              backgroundColor: statusColors[500],
                            }}
                          />
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              color: statusColors[200],
                            }}
                          >
                            {exit.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: statusColors[400],
                              textTransform: 'uppercase',
                              fontWeight: tokens.typography.fontWeight.semibold,
                            }}
                          >
                            {exit.status}
                          </Text>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Timeline Sidebar */}
          <Box
            style={{
              width: '320px',
              ...createCardStyle(tokens),
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box
              style={{
                padding: tokens.spacing[4],
                borderBottom: `1px solid ${tokens.colors.neutral[700]}`,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[50],
                }}
              >
                Event Timeline
              </Text>
            </Box>
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
              {MOCK_EVENTS.map((event, index) => (
                <Box
                  key={event.id}
                  style={{
                    display: 'flex',
                    gap: tokens.spacing[2],
                    position: 'relative',
                  }}
                >
                  {/* Timeline line */}
                  {index < MOCK_EVENTS.length - 1 && (
                    <Box
                      style={{
                        position: 'absolute',
                        left: '7px',
                        top: '20px',
                        bottom: '-12px',
                        width: '2px',
                        backgroundColor: tokens.colors.neutral[700],
                      }}
                    />
                  )}
                  {/* Timeline dot */}
                  <Box
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: getEventTypeColor(event.type),
                      border: `2px solid ${tokens.colors.neutral[800]}`,
                      flexShrink: 0,
                      zIndex: 1,
                      marginTop: tokens.spacing[1],
                    }}
                  />
                  {/* Event content */}
                  <Box style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      {formatTimestamp(event.timestamp)} • {event.zone}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[200],
                        lineHeight: 1.4,
                      }}
                    >
                      {event.message}
                    </Text>
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
