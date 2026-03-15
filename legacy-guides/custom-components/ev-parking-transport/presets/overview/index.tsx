'use client';

/**
 * EvParkingTransport - Overview Preset
 * Parking lot cards: name, type badge, occupancy bar, status.
 * Shuttle routes list: route name, stops, frequency, active shuttles, wait time.
 * Rideshare zones with driver count and surge indicator.
 * KPIs: total capacity, total occupied, shuttles running.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createProgressBarStyle,
  createStatusDotStyle,
} from '../../../helpers';
import type { ParkingTransportProps, ParkingLot, ShuttleRoute, RideshareZone } from '../../core';

const MOCK_LOTS: ParkingLot[] = [
  { id: 'lot1', name: 'North Lot', type: 'general', capacity: 500, occupied: 420, status: 'open' },
  { id: 'lot2', name: 'South Lot', type: 'general', capacity: 450, occupied: 448, status: 'full' },
  { id: 'lot3', name: 'VIP Parking', type: 'vip', capacity: 100, occupied: 85, status: 'open' },
  { id: 'lot4', name: 'Accessible Lot', type: 'disabled', capacity: 50, occupied: 32, status: 'open' },
];

const MOCK_SHUTTLES: ShuttleRoute[] = [
  {
    id: 'shuttle1',
    name: 'Main Loop',
    stops: ['North Lot', 'Main Gate', 'VIP Entrance', 'South Lot'],
    frequency: 10,
    activeShuttles: 3,
    estimatedWait: 5,
  },
  {
    id: 'shuttle2',
    name: 'Express Route',
    stops: ['South Lot', 'Main Gate'],
    frequency: 15,
    activeShuttles: 2,
    estimatedWait: 8,
  },
];

const MOCK_RIDESHARE: RideshareZone[] = [
  { id: 'rs1', name: 'Main Pickup', x: 100, y: 200, activeDrivers: 12, surgeMultiplier: 1.0 },
  { id: 'rs2', name: 'VIP Pickup', x: 300, y: 150, activeDrivers: 5, surgeMultiplier: 1.5 },
];

const LOT_TYPE_CONFIG: Record<string, { color: 'primary' | 'warning' | 'info' | 'success'; label: string }> = {
  general: { color: 'primary', label: 'General' },
  vip: { color: 'warning', label: 'VIP' },
  disabled: { color: 'info', label: 'Accessible' },
  staff: { color: 'success', label: 'Staff' },
};

const STATUS_CONFIG: Record<string, { color: 'success' | 'warning' | 'error'; dotColor: string }> = {
  open: { color: 'success', dotColor: '' },
  full: { color: 'error', dotColor: '' },
  closed: { color: 'warning', dotColor: '' },
};

export const OverviewEvParkingTransport = createPreset<ParkingTransportProps>({
  name: 'EvParkingTransport.Overview',
  render: ({ primitives, props, tokens }: PresetContext<ParkingTransportProps>) => {
    const { Box, Text } = primitives;
    const { lots, shuttles, rideshareZones, onLotClick, onRouteClick, className, style } = props;

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const lotData = lots?.length ? lots : MOCK_LOTS;
    const shuttleData = shuttles?.length ? shuttles : MOCK_SHUTTLES;
    const rideshareData = rideshareZones?.length ? rideshareZones : MOCK_RIDESHARE;

    const [hoveredLot, setHoveredLot] = useState<string | null>(null);

    const totalCapacity = lotData.reduce((sum, lot) => sum + lot.capacity, 0);
    const totalOccupied = lotData.reduce((sum, lot) => sum + lot.occupied, 0);
    const totalShuttles = shuttleData.reduce((sum, route) => sum + route.activeShuttles, 0);
    const totalDrivers = rideshareData.reduce((sum, zone) => sum + zone.activeDrivers, 0);

    STATUS_CONFIG.open.dotColor = tokens.colors.successScale[500];
    STATUS_CONFIG.full.dotColor = tokens.colors.errorScale[500];
    STATUS_CONFIG.closed.dotColor = tokens.colors.warningScale[500];

    return (
      <Box
        className={className}
        style={{
          height: '100%',
          overflow: 'auto',
          backgroundColor: tokens.colors.neutral[50],
          padding: tokens.spacing[5],
          ...style,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: tokens.spacing[4],
          }}
        >
          <div>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                display: 'block',
              }}
            >
              {'🚗'} Parking & Transport
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {lotData.length} parking lots {'·'} {shuttleData.length} shuttle routes
            </Text>
          </div>
        </div>

        {/* KPIs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
          }}
        >
          {[
            { label: 'Total Capacity', value: totalCapacity, color: tokens.colors.primaryScale[500] },
            { label: 'Occupied Spaces', value: totalOccupied, color: tokens.colors.warningScale[500] },
            { label: 'Active Shuttles', value: totalShuttles, color: tokens.colors.infoScale[500] },
            { label: 'Rideshare Drivers', value: totalDrivers, color: tokens.colors.successScale[500] },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                ...cardBase,
                padding: tokens.spacing[3],
                textAlign: 'center' as const,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: stat.color,
                  display: 'block',
                }}
              >
                {stat.value}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                {stat.label}
              </Text>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
          {/* Parking Lots */}
          <div>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[700],
                display: 'block',
                marginBottom: tokens.spacing[3],
              }}
            >
              {'🅿️'} Parking Lots
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
              {lotData.map((lot) => {
                const isHovered = hoveredLot === lot.id;
                const typeConfig = LOT_TYPE_CONFIG[lot.type];
                const statusConfig = STATUS_CONFIG[lot.status];
                const occupancyPercent = (lot.occupied / lot.capacity) * 100;
                const progressBar = createProgressBarStyle(tokens, {
                  percent: occupancyPercent,
                  color:
                    lot.status === 'full'
                      ? tokens.colors.errorScale[500]
                      : occupancyPercent > 85
                      ? tokens.colors.warningScale[500]
                      : tokens.colors.successScale[500],
                });

                return (
                  <div
                    key={lot.id}
                    onMouseEnter={() => setHoveredLot(lot.id)}
                    onMouseLeave={() => setHoveredLot(null)}
                    onClick={() => onLotClick?.(lot.id)}
                    style={{
                      ...cardBase,
                      padding: tokens.spacing[3],
                      cursor: 'pointer',
                      transform: isHovered ? 'translateY(-2px)' : 'none',
                      boxShadow: isHovered ? tokens.shadows.md : tokens.shadows.sm,
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: tokens.spacing[2],
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <div style={createStatusDotStyle(tokens, statusConfig.dotColor)} />
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[900],
                          }}
                        >
                          {lot.name}
                        </Text>
                      </div>
                      <span style={createBadgeStyle(tokens, typeConfig.color)}>{typeConfig.label}</span>
                    </div>

                    <div style={{ marginBottom: tokens.spacing[2] }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                          Occupancy
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[900],
                          }}
                        >
                          {lot.occupied}/{lot.capacity} ({Math.round(occupancyPercent)}%)
                        </Text>
                      </div>
                      <div style={progressBar.track}>
                        <div style={progressBar.fill} />
                      </div>
                    </div>

                    <span style={createBadgeStyle(tokens, statusConfig.color)}>
                      {lot.status.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shuttles & Rideshare */}
          <div>
            {/* Shuttle Routes */}
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[700],
                display: 'block',
                marginBottom: tokens.spacing[3],
              }}
            >
              {'🚌'} Shuttle Routes
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
              {shuttleData.map((route) => (
                <div
                  key={route.id}
                  onClick={() => onRouteClick?.(route.id)}
                  style={{
                    ...cardBase,
                    padding: tokens.spacing[3],
                    cursor: 'pointer',
                    ...hoverStyle,
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                      display: 'block',
                      marginBottom: tokens.spacing[2],
                    }}
                  >
                    {route.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                      display: 'block',
                      marginBottom: tokens.spacing[2],
                    }}
                  >
                    {'📍'} {route.stops.join(' → ')}
                  </Text>
                  <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
                    <div>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        Frequency
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        {route.frequency}min
                      </Text>
                    </div>
                    <div>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        Active
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        {route.activeShuttles}
                      </Text>
                    </div>
                    <div>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        Wait
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.successScale[600],
                        }}
                      >
                        {route.estimatedWait}min
                      </Text>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rideshare Zones */}
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[700],
                display: 'block',
                marginBottom: tokens.spacing[3],
              }}
            >
              {'🚕'} Rideshare Zones
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
              {rideshareData.map((zone) => (
                <div
                  key={zone.id}
                  style={{
                    ...cardBase,
                    padding: tokens.spacing[3],
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: tokens.spacing[2],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {zone.name}
                    </Text>
                    {zone.surgeMultiplier > 1 && (
                      <span style={createBadgeStyle(tokens, 'warning')}>
                        {zone.surgeMultiplier}x Surge
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
                    <div>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        Drivers
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.successScale[600],
                        }}
                      >
                        {zone.activeDrivers}
                      </Text>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Box>
    );
  },
});
