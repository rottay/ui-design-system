'use client';

import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createProgressBarStyle,
} from '../../../helpers';
import type { EvServiceStationProps, ServicePoint } from '../../core';
import { useState } from 'react';

// Mock data for standalone demo
const MOCK_SERVICE_POINTS: ServicePoint[] = [
  {
    id: 'sp-1',
    name: 'Main Bar',
    type: 'bar',
    x: 20,
    y: 30,
    status: 'busy',
    queueLength: 12,
    estimatedWaitMinutes: 8,
    staffCount: 4,
    staffAssigned: ['Emma', 'Lucas', 'Sophia', 'Noah'],
    lowStockItems: ['IPA Beer', 'Vodka'],
    revenue: 4250,
    ordersPerHour: 45,
  },
  {
    id: 'sp-2',
    name: 'VIP Lounge Bar',
    type: 'vip-bar',
    x: 70,
    y: 20,
    status: 'open',
    queueLength: 3,
    estimatedWaitMinutes: 2,
    staffCount: 2,
    staffAssigned: ['Olivia', 'Liam'],
    lowStockItems: [],
    revenue: 3800,
    ordersPerHour: 28,
  },
  {
    id: 'sp-3',
    name: 'Taco Truck',
    type: 'food-truck',
    x: 40,
    y: 70,
    status: 'open',
    queueLength: 8,
    estimatedWaitMinutes: 12,
    staffCount: 3,
    staffAssigned: ['Ava', 'Ethan', 'Mia'],
    lowStockItems: ['Corn Tortillas'],
    revenue: 2100,
    ordersPerHour: 22,
  },
  {
    id: 'sp-4',
    name: 'Merch Stand',
    type: 'merch',
    x: 85,
    y: 60,
    status: 'open',
    queueLength: 5,
    estimatedWaitMinutes: 5,
    staffCount: 2,
    staffAssigned: ['Isabella', 'James'],
    lowStockItems: [],
    revenue: 1850,
    ordersPerHour: 18,
  },
  {
    id: 'sp-5',
    name: 'Water Station',
    type: 'water-station',
    x: 50,
    y: 45,
    status: 'open',
    queueLength: 2,
    estimatedWaitMinutes: 1,
    staffCount: 1,
    staffAssigned: ['Mason'],
    lowStockItems: [],
    revenue: 0,
    ordersPerHour: 60,
  },
  {
    id: 'sp-6',
    name: 'Side Bar',
    type: 'bar',
    x: 15,
    y: 75,
    status: 'paused',
    queueLength: 0,
    estimatedWaitMinutes: 0,
    staffCount: 2,
    staffAssigned: ['Charlotte', 'Benjamin'],
    lowStockItems: ['Glasses', 'Ice'],
    revenue: 1200,
    ordersPerHour: 0,
  },
];

const STATION_TYPE_ICONS: Record<ServicePoint['type'], string> = {
  bar: '\u{1F37A}',
  'food-truck': '\u{1F32E}',
  merch: '\u{1F455}',
  'vip-bar': '\u{1F942}',
  'water-station': '\u{1F4A7}',
};

const STATION_TYPE_LABELS: Record<ServicePoint['type'], string> = {
  bar: 'Bar',
  'food-truck': 'Food Truck',
  merch: 'Merchandise',
  'vip-bar': 'VIP Bar',
  'water-station': 'Water Station',
};

const STATUS_BADGE_MAP: Record<ServicePoint['status'], 'success' | 'warning' | 'error' | 'secondary'> = {
  open: 'success',
  busy: 'warning',
  closed: 'error',
  paused: 'secondary',
};

export const OperationsEvServiceStation = createPreset<EvServiceStationProps>({
  name: 'EVServiceStation.Operations',
  render: (ctx: PresetContext<EvServiceStationProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const servicePoints = props.stations || MOCK_SERVICE_POINTS;

    const [filterType, setFilterType] = useState<ServicePoint['type'] | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<ServicePoint['status'] | 'all'>('all');
    const [sortBy, setSortBy] = useState<'wait-time' | 'revenue'>('wait-time');

    // Filter and sort
    let filteredPoints = servicePoints.filter((point: ServicePoint) => {
      if (filterType !== 'all' && point.type !== filterType) return false;
      if (filterStatus !== 'all' && point.status !== filterStatus) return false;
      return true;
    });

    filteredPoints = [...filteredPoints].sort((a: ServicePoint, b: ServicePoint) => {
      if (sortBy === 'wait-time') {
        return b.estimatedWaitMinutes - a.estimatedWaitMinutes;
      }
      return b.revenue - a.revenue;
    });

    // Calculate summary stats
    const busiestStation = [...servicePoints].sort(
      (a: ServicePoint, b: ServicePoint) => b.estimatedWaitMinutes - a.estimatedWaitMinutes
    )[0];
    const totalLowStockAlerts = servicePoints.filter(
      (p: ServicePoint) => p.lowStockItems.length > 0
    ).length;
    const avgOrdersPerHour =
      servicePoints.reduce((sum: number, p: ServicePoint) => sum + p.ordersPerHour, 0) /
      servicePoints.length;

    const getStatusColor = (status: ServicePoint['status']) => {
      switch (status) {
        case 'open':
          return tokens.colors.successScale;
        case 'busy':
          return tokens.colors.warningScale;
        case 'closed':
          return tokens.colors.errorScale;
        case 'paused':
          return tokens.colors.secondaryScale;
      }
    };

    return (
      <Box style={{ padding: tokens.spacing[4] }}>
        {/* Summary Stats */}
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
            flexWrap: 'wrap',
          }}
        >
          <Box
            style={{
              ...createCardStyle(tokens),
              flex: 1,
              minWidth: '200px',
              padding: tokens.spacing[3],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.secondaryScale[600],
                marginBottom: tokens.spacing[1],
              }}
            >
              Busiest Station
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.primaryScale[900],
              }}
            >
              {busiestStation.name}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.warningScale[700],
              }}
            >
              {busiestStation.estimatedWaitMinutes} min wait
            </Text>
          </Box>
          <Box
            style={{
              ...createCardStyle(tokens),
              flex: 1,
              minWidth: '200px',
              padding: tokens.spacing[3],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.secondaryScale[600],
                marginBottom: tokens.spacing[1],
              }}
            >
              Low Stock Alerts
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color:
                  totalLowStockAlerts > 0
                    ? tokens.colors.errorScale[700]
                    : tokens.colors.successScale[700],
              }}
            >
              {totalLowStockAlerts}
            </Text>
          </Box>
          <Box
            style={{
              ...createCardStyle(tokens),
              flex: 1,
              minWidth: '200px',
              padding: tokens.spacing[3],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.secondaryScale[600],
                marginBottom: tokens.spacing[1],
              }}
            >
              Avg Orders/Hour
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.primaryScale[700],
              }}
            >
              {avgOrdersPerHour.toFixed(1)}
            </Text>
          </Box>
        </Box>

        {/* Filters and Sort */}
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Box style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.primaryScale[900],
                marginRight: tokens.spacing[1],
              }}
            >
              Type:
            </Text>
            {(['all', 'bar', 'vip-bar', 'food-truck', 'merch', 'water-station'] as const).map(
              (type) => (
                <Box
                  key={type}
                  onClick={() => setFilterType(type)}
                  style={{
                    ...createFilterPillStyle(tokens, { active: filterType === type }),
                    cursor: 'pointer',
                  }}
                >
                  {type === 'all' ? 'All' : STATION_TYPE_LABELS[type as ServicePoint['type']]}
                </Box>
              )
            )}
          </Box>
          <Box style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.primaryScale[900],
                marginRight: tokens.spacing[1],
              }}
            >
              Status:
            </Text>
            {(['all', 'open', 'busy', 'paused', 'closed'] as const).map((status) => (
              <Box
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  ...createFilterPillStyle(tokens, { active: filterStatus === status }),
                  cursor: 'pointer',
                }}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Box>
            ))}
          </Box>
          <Box style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap', marginLeft: 'auto' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.primaryScale[900],
                marginRight: tokens.spacing[1],
              }}
            >
              Sort:
            </Text>
            <Box
              onClick={() => setSortBy('wait-time')}
              style={{
                ...createFilterPillStyle(tokens, { active: sortBy === 'wait-time' }),
                cursor: 'pointer',
              }}
            >
              Wait Time
            </Box>
            <Box
              onClick={() => setSortBy('revenue')}
              style={{
                ...createFilterPillStyle(tokens, { active: sortBy === 'revenue' }),
                cursor: 'pointer',
              }}
            >
              Revenue
            </Box>
          </Box>
        </Box>

        {/* Station Cards */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: tokens.spacing[4],
          }}
        >
          {filteredPoints.map((point: ServicePoint) => {
            const statusColor = getStatusColor(point.status);
            const hasAlerts =
              point.lowStockItems.length > 0 || point.estimatedWaitMinutes > 10;

            const progressBarStyles = createProgressBarStyle(tokens, { percent: (point.queueLength / 15) * 100 });

            return (
              <Box
                key={point.id}
                style={{
                  ...createCardStyle(tokens),
                  padding: tokens.spacing[4],
                  ...createHoverStyle(tokens),
                  border: hasAlerts
                    ? `2px solid ${tokens.colors.errorScale[500]}`
                    : `1px solid ${tokens.colors.secondaryScale[200]}`,
                }}
              >
                {/* Header */}
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize['2xl'] }}>
                      {STATION_TYPE_ICONS[point.type]}
                    </Text>
                    <Box>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.lg,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.primaryScale[900],
                        }}
                      >
                        {point.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.secondaryScale[600],
                        }}
                      >
                        {STATION_TYPE_LABELS[point.type]}
                      </Text>
                    </Box>
                  </Box>
                  <Box
                    style={{
                      ...createBadgeStyle(tokens, STATUS_BADGE_MAP[point.status]),
                      textTransform: 'capitalize',
                    }}
                  >
                    {point.status}
                  </Box>
                </Box>

                {/* Queue Length */}
                <Box style={{ marginBottom: tokens.spacing[3] }}>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.secondaryScale[600],
                      }}
                    >
                      Queue Length
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.primaryScale[900],
                      }}
                    >
                      {point.queueLength} people
                    </Text>
                  </Box>
                  <Box style={progressBarStyles.track}>
                    <Box style={progressBarStyles.fill} />
                  </Box>
                </Box>

                {/* Wait Time */}
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: tokens.spacing[3],
                    padding: tokens.spacing[2],
                    backgroundColor: tokens.colors.secondaryScale[50],
                    borderRadius: tokens.borderRadius.md,
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.secondaryScale[600],
                    }}
                  >
                    Estimated Wait
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color:
                        point.estimatedWaitMinutes > 10
                          ? tokens.colors.errorScale[700]
                          : point.estimatedWaitMinutes > 5
                          ? tokens.colors.warningScale[700]
                          : tokens.colors.successScale[700],
                    }}
                  >
                    {point.estimatedWaitMinutes} min
                  </Text>
                </Box>

                {/* Staff */}
                <Box style={{ marginBottom: tokens.spacing[3] }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.primaryScale[900],
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    Staff ({point.staffCount})
                  </Text>
                  <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
                    {point.staffAssigned.map((staff: string) => (
                      <Box
                        key={staff}
                        style={{
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          backgroundColor: tokens.colors.primaryScale[50],
                          color: tokens.colors.primaryScale[700],
                          borderRadius: tokens.borderRadius.sm,
                          fontSize: tokens.typography.fontSize.xs,
                        }}
                      >
                        {staff}
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Low Stock Warning */}
                {point.lowStockItems.length > 0 && (
                  <Box
                    style={{
                      marginBottom: tokens.spacing[3],
                      padding: tokens.spacing[2],
                      backgroundColor: tokens.colors.errorScale[50],
                      borderRadius: tokens.borderRadius.md,
                      border: `1px solid ${tokens.colors.errorScale[200]}`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.errorScale[900],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      Low Stock Alert
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.errorScale[700],
                      }}
                    >
                      {point.lowStockItems.join(', ')}
                    </Text>
                  </Box>
                )}

                {/* Metrics */}
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: tokens.spacing[3],
                    borderTop: `1px solid ${tokens.colors.secondaryScale[200]}`,
                  }}
                >
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.secondaryScale[600],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      Revenue
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.successScale[700],
                      }}
                    >
                      ${point.revenue.toLocaleString()}
                    </Text>
                  </Box>
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.secondaryScale[600],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      Orders/Hour
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.primaryScale[700],
                      }}
                    >
                      {point.ordersPerHour}
                    </Text>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        {filteredPoints.length === 0 && (
          <Box
            style={{
              padding: tokens.spacing[6],
              textAlign: 'center',
              color: tokens.colors.secondaryScale[600],
            }}
          >
            <Text style={{ fontSize: tokens.typography.fontSize.lg }}>
              No stations match the current filters
            </Text>
          </Box>
        )}
      </Box>
    );
  },
});
