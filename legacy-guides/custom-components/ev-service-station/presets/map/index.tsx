'use client';

import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createStatusDotStyle,
} from '../../../helpers';
import type { EvServiceStationProps, ServicePoint } from '../../core';

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

export const MapEvServiceStation = createPreset<EvServiceStationProps>({
  name: 'EVServiceStation.Map',
  render: (ctx: PresetContext<EvServiceStationProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const servicePoints = props.stations || MOCK_SERVICE_POINTS;

    // Calculate KPIs
    const totalStations = servicePoints.length;
    const avgWaitTime =
      servicePoints.reduce((sum: number, sp: ServicePoint) => sum + sp.estimatedWaitMinutes, 0) /
      totalStations;
    const totalRevenue = servicePoints.reduce((sum: number, sp: ServicePoint) => sum + sp.revenue, 0);
    const totalStaff = servicePoints.reduce((sum: number, sp: ServicePoint) => sum + sp.staffCount, 0);

    // Sort by wait time for ranking
    const rankedByWait = [...servicePoints].sort(
      (a: ServicePoint, b: ServicePoint) => b.estimatedWaitMinutes - a.estimatedWaitMinutes
    );

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

    const getMarkerSize = (queueLength: number) => {
      if (queueLength === 0) return 24;
      if (queueLength < 5) return 32;
      if (queueLength < 10) return 40;
      return 48;
    };

    return (
      <Box style={createSurfaceStyle(tokens)}>
        {/* KPI Bar */}
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[4],
            padding: tokens.spacing[4],
            borderBottom: `1px solid ${tokens.colors.secondaryScale[200]}`,
            flexWrap: 'wrap',
          }}
        >
          <Box style={{ flex: 1, minWidth: '200px' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.secondaryScale[600],
                marginBottom: tokens.spacing[1],
              }}
            >
              Total Stations
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.primaryScale[700],
              }}
            >
              {totalStations}
            </Text>
          </Box>
          <Box style={{ flex: 1, minWidth: '200px' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.secondaryScale[600],
                marginBottom: tokens.spacing[1],
              }}
            >
              Avg Wait Time
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.warningScale[700],
              }}
            >
              {avgWaitTime.toFixed(1)} min
            </Text>
          </Box>
          <Box style={{ flex: 1, minWidth: '200px' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.secondaryScale[600],
                marginBottom: tokens.spacing[1],
              }}
            >
              Total Revenue
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.successScale[700],
              }}
            >
              ${totalRevenue.toLocaleString()}
            </Text>
          </Box>
          <Box style={{ flex: 1, minWidth: '200px' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.secondaryScale[600],
                marginBottom: tokens.spacing[1],
              }}
            >
              Total Staff
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.primaryScale[700],
              }}
            >
              {totalStaff}
            </Text>
          </Box>
        </Box>

        {/* Main Content */}
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[4],
            padding: tokens.spacing[4],
          }}
        >
          {/* Map Area */}
          <Box style={{ flex: 2 }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                marginBottom: tokens.spacing[3],
                color: tokens.colors.primaryScale[900],
              }}
            >
              Venue Map
            </Text>
            <Box
              style={{
                position: 'relative',
                width: '100%',
                height: '500px',
                backgroundColor: tokens.colors.secondaryScale[50],
                borderRadius: tokens.borderRadius.lg,
                border: `1px solid ${tokens.colors.secondaryScale[200]}`,
                overflow: 'hidden',
              }}
            >
              {/* Service Point Markers */}
              {servicePoints.map((point: ServicePoint) => {
                const statusColor = getStatusColor(point.status);
                const size = getMarkerSize(point.queueLength);

                return (
                  <Box
                    key={point.id}
                    style={{
                      position: 'absolute',
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      transform: 'translate(-50%, -50%)',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Marker */}
                    <Box
                      className="marker"
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: statusColor[500],
                        border: `3px solid ${statusColor[700]}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: `${size * 0.5}px`,
                        transition: 'transform 0.2s ease',
                        boxShadow: tokens.shadows.md,
                      }}
                    >
                      {STATION_TYPE_ICONS[point.type]}
                    </Box>

                    {/* Hover Popup */}
                    <Box
                      className="popup"
                      style={{
                        display: 'none',
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginTop: tokens.spacing[1],
                        ...createCardStyle(tokens),
                        minWidth: '220px',
                        padding: tokens.spacing[3],
                        zIndex: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.md,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          marginBottom: tokens.spacing[1],
                          color: tokens.colors.primaryScale[900],
                        }}
                      >
                        {point.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.secondaryScale[600],
                          marginBottom: tokens.spacing[2],
                        }}
                      >
                        {STATION_TYPE_LABELS[point.type]}
                      </Text>
                      <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                        <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.secondaryScale[600] }}>
                            Wait Time:
                          </Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium }}>
                            {point.estimatedWaitMinutes} min
                          </Text>
                        </Box>
                        <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.secondaryScale[600] }}>
                            Staff:
                          </Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium }}>
                            {point.staffCount}
                          </Text>
                        </Box>
                        <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.secondaryScale[600] }}>
                            Revenue:
                          </Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.successScale[700] }}>
                            ${point.revenue.toLocaleString()}
                          </Text>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Legend */}
            <Box
              style={{
                marginTop: tokens.spacing[3],
                display: 'flex',
                gap: tokens.spacing[4],
                flexWrap: 'wrap',
              }}
            >
              <Box>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    marginBottom: tokens.spacing[1],
                    color: tokens.colors.primaryScale[900],
                  }}
                >
                  Station Types
                </Text>
                <Box style={{ display: 'flex', gap: tokens.spacing[3], flexWrap: 'wrap' }}>
                  {Object.entries(STATION_TYPE_ICONS).map(([type, icon]: [string, string]) => (
                    <Box key={type} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.lg }}>{icon}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm }}>
                        {STATION_TYPE_LABELS[type as ServicePoint['type']]}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    marginBottom: tokens.spacing[1],
                    color: tokens.colors.primaryScale[900],
                  }}
                >
                  Status
                </Text>
                <Box style={{ display: 'flex', gap: tokens.spacing[3], flexWrap: 'wrap' }}>
                  {(['open', 'busy', 'paused', 'closed'] as const).map((status: ServicePoint['status']) => (
                    <Box key={status} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                      <Box
                        style={{
                          ...createStatusDotStyle(tokens, getStatusColor(status)[500]),
                        }}
                      />
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, textTransform: 'capitalize' }}>
                        {status}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Wait Time Ranking */}
          <Box style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                marginBottom: tokens.spacing[3],
                color: tokens.colors.primaryScale[900],
              }}
            >
              Wait Time Ranking
            </Text>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
              {rankedByWait.map((point: ServicePoint, index: number) => (
                <Box
                  key={point.id}
                  style={{
                    ...createCardStyle(tokens),
                    padding: tokens.spacing[3],
                    ...createHoverStyle(tokens),
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.lg,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.secondaryScale[400],
                        minWidth: '24px',
                      }}
                    >
                      {index + 1}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.lg }}>
                      {STATION_TYPE_ICONS[point.type]}
                    </Text>
                    <Box style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.primaryScale[900],
                        }}
                      >
                        {point.name}
                      </Text>
                    </Box>
                  </Box>
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xl,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: point.estimatedWaitMinutes > 10
                          ? tokens.colors.errorScale[700]
                          : point.estimatedWaitMinutes > 5
                          ? tokens.colors.warningScale[700]
                          : tokens.colors.successScale[700],
                      }}
                    >
                      {point.estimatedWaitMinutes} min
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.secondaryScale[600],
                      }}
                    >
                      {point.queueLength} in queue
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
