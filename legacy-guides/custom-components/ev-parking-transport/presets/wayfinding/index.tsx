'use client';

/**
 * EvParkingTransport - Wayfinding Preset
 * Attendee-facing view: nearest parking with capacity indicators.
 * Walking time estimates. Shuttle schedule with next arrival.
 * Rideshare pickup point. Color-coded availability (green=available, yellow=filling, red=full).
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
  { id: 'lot1', name: 'North Lot', type: 'general', capacity: 500, occupied: 250, status: 'open' },
  { id: 'lot2', name: 'South Lot', type: 'general', capacity: 450, occupied: 430, status: 'open' },
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
  { id: 'rs1', name: 'Main Pickup Zone', x: 100, y: 200, activeDrivers: 12, surgeMultiplier: 1.0 },
];

const getAvailabilityColor = (lot: ParkingLot, tokens: any) => {
  const percent = (lot.occupied / lot.capacity) * 100;
  if (lot.status === 'full' || percent >= 95) {
    return { bg: tokens.colors.errorScale[50], border: tokens.colors.errorScale[500], text: 'Full', icon: '🔴' };
  }
  if (percent >= 80) {
    return { bg: tokens.colors.warningScale[50], border: tokens.colors.warningScale[500], text: 'Filling Up', icon: '🟡' };
  }
  return { bg: tokens.colors.successScale[50], border: tokens.colors.successScale[500], text: 'Available', icon: '🟢' };
};

const getWalkingTime = (lotName: string): number => {
  // Mock walking times in minutes
  const times: Record<string, number> = {
    'North Lot': 5,
    'South Lot': 8,
    'VIP Parking': 2,
    'Accessible Lot': 3,
  };
  return times[lotName] || 5;
};

export const WayfindingEvParkingTransport = createPreset<ParkingTransportProps>({
  name: 'EvParkingTransport.Wayfinding',
  render: ({ primitives, props, tokens }: PresetContext<ParkingTransportProps>) => {
    const { Box, Text } = primitives;
    const { lots, shuttles, rideshareZones, className, style } = props;

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);

    const lotData = lots?.length ? lots : MOCK_LOTS;
    const shuttleData = shuttles?.length ? shuttles : MOCK_SHUTTLES;
    const rideshareData = rideshareZones?.length ? rideshareZones : MOCK_RIDESHARE;

    const [selectedOption, setSelectedOption] = useState<'parking' | 'shuttle' | 'rideshare'>('parking');

    const now = new Date();
    const nextShuttleArrivals = shuttleData.map((route) => {
      const arrivalTime = new Date(now.getTime() + route.estimatedWait * 60000);
      return {
        ...route,
        arrivalTime: arrivalTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
    });

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
            textAlign: 'center' as const,
            marginBottom: tokens.spacing[4],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize['3xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              display: 'block',
            }}
          >
            {'🚗'} Getting Here
          </Text>
          <Text style={{ fontSize: tokens.typography.fontSize.lg, color: tokens.colors.neutral[600] }}>
            Choose your transportation option
          </Text>
        </div>

        {/* Option Selector */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[5],
          }}
        >
          {[
            { key: 'parking' as const, icon: '🅿️', label: 'Parking' },
            { key: 'shuttle' as const, icon: '🚌', label: 'Shuttle' },
            { key: 'rideshare' as const, icon: '🚕', label: 'Rideshare' },
          ].map((option) => (
            <div
              key={option.key}
              onClick={() => setSelectedOption(option.key)}
              style={{
                ...cardBase,
                padding: tokens.spacing[4],
                textAlign: 'center' as const,
                cursor: 'pointer',
                backgroundColor:
                  selectedOption === option.key ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                borderLeft:
                  selectedOption === option.key
                    ? `4px solid ${tokens.colors.primaryScale[500]}`
                    : `4px solid transparent`,
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: tokens.spacing[2] }}>{option.icon}</div>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                }}
              >
                {option.label}
              </Text>
            </div>
          ))}
        </div>

        {/* Parking Option */}
        {selectedOption === 'parking' && (
          <div>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                display: 'block',
                marginBottom: tokens.spacing[3],
                textAlign: 'center' as const,
              }}
            >
              Available Parking Lots
            </Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing[4] }}>
              {lotData.map((lot) => {
                const availability = getAvailabilityColor(lot, tokens);
                const walkTime = getWalkingTime(lot.name);
                const occupancyPercent = (lot.occupied / lot.capacity) * 100;
                const spotsLeft = lot.capacity - lot.occupied;

                return (
                  <div
                    key={lot.id}
                    style={{
                      ...cardBase,
                      padding: tokens.spacing[5],
                      backgroundColor: availability.bg,
                      border: `3px solid ${availability.border}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize['2xl'],
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        {lot.name}
                      </Text>
                      <span style={{ fontSize: '2rem' }}>{availability.icon}</span>
                    </div>

                    <div
                      style={{
                        marginBottom: tokens.spacing[3],
                        padding: tokens.spacing[3],
                        backgroundColor: tokens.colors.common.white,
                        borderRadius: tokens.borderRadius.md,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize['3xl'],
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.neutral[900],
                          display: 'block',
                          textAlign: 'center' as const,
                        }}
                      >
                        {spotsLeft}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[600],
                          textAlign: 'center' as const,
                        }}
                      >
                        Spots Available
                      </Text>
                    </div>

                    <div style={{ marginBottom: tokens.spacing[3] }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[700],
                          }}
                        >
                          {availability.text}
                        </Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                          {Math.round(occupancyPercent)}%
                        </Text>
                      </div>
                      <div
                        style={{
                          height: 12,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.neutral[200],
                          overflow: 'hidden' as const,
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${occupancyPercent}%`,
                            backgroundColor: availability.border,
                            transition: `width ${tokens.motion.hover}`,
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: tokens.spacing[2],
                        padding: tokens.spacing[2],
                        backgroundColor: tokens.colors.common.white,
                        borderRadius: tokens.borderRadius.md,
                      }}
                    >
                      <span style={{ fontSize: tokens.typography.fontSize.lg }}>{'🚶'}</span>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[700],
                        }}
                      >
                        {walkTime} min walk to venue
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Shuttle Option */}
        {selectedOption === 'shuttle' && (
          <div>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                display: 'block',
                marginBottom: tokens.spacing[3],
                textAlign: 'center' as const,
              }}
            >
              Shuttle Schedule
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
              {nextShuttleArrivals.map((route) => (
                <div
                  key={route.id}
                  style={{
                    ...cardBase,
                    padding: tokens.spacing[5],
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: tokens.spacing[4],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize['2xl'],
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {'🚌'} {route.name}
                    </Text>
                    <div
                      style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.successScale[500],
                        color: tokens.colors.common.white,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.lg,
                          fontWeight: tokens.typography.fontWeight.bold,
                        }}
                      >
                        Next: {route.arrivalTime}
                      </Text>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: tokens.spacing[3],
                      backgroundColor: tokens.colors.neutral[50],
                      borderRadius: tokens.borderRadius.md,
                      marginBottom: tokens.spacing[3],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[600],
                        display: 'block',
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      Route Stops:
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.lg,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {route.stops.join(' → ')}
                    </Text>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3] }}>
                    <div style={{ textAlign: 'center' as const }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                          display: 'block',
                        }}
                      >
                        Frequency
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xl,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        {route.frequency} min
                      </Text>
                    </div>
                    <div style={{ textAlign: 'center' as const }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                          display: 'block',
                        }}
                      >
                        Shuttles Running
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xl,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        {route.activeShuttles}
                      </Text>
                    </div>
                    <div style={{ textAlign: 'center' as const }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                          display: 'block',
                        }}
                      >
                        Est. Wait
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xl,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.successScale[600],
                        }}
                      >
                        {route.estimatedWait} min
                      </Text>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rideshare Option */}
        {selectedOption === 'rideshare' && (
          <div>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                display: 'block',
                marginBottom: tokens.spacing[3],
                textAlign: 'center' as const,
              }}
            >
              Rideshare Pickup
            </Text>
            {rideshareData.map((zone) => (
              <div
                key={zone.id}
                style={{
                  ...cardBase,
                  padding: tokens.spacing[6],
                  textAlign: 'center' as const,
                }}
              >
                <div style={{ fontSize: '4rem', marginBottom: tokens.spacing[3] }}>{'🚕'}</div>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize['2xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                    display: 'block',
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  {zone.name}
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    color: tokens.colors.neutral[600],
                    display: 'block',
                    marginBottom: tokens.spacing[4],
                  }}
                >
                  Follow signs for rideshare pickup
                </Text>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: tokens.spacing[4],
                    marginTop: tokens.spacing[4],
                  }}
                >
                  <div
                    style={{
                      padding: tokens.spacing[4],
                      backgroundColor: tokens.colors.successScale[50],
                      borderRadius: tokens.borderRadius.md,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[600],
                        display: 'block',
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      Drivers Nearby
                    </Text>
                    <Text
                      style={{
                        fontSize: '2.5rem',
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.successScale[600],
                      }}
                    >
                      {zone.activeDrivers}
                    </Text>
                  </div>
                  <div
                    style={{
                      padding: tokens.spacing[4],
                      backgroundColor:
                        zone.surgeMultiplier > 1 ? tokens.colors.warningScale[50] : tokens.colors.neutral[50],
                      borderRadius: tokens.borderRadius.md,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[600],
                        display: 'block',
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      Surge Pricing
                    </Text>
                    <Text
                      style={{
                        fontSize: '2.5rem',
                        fontWeight: tokens.typography.fontWeight.bold,
                        color:
                          zone.surgeMultiplier > 1
                            ? tokens.colors.warningScale[600]
                            : tokens.colors.neutral[700],
                      }}
                    >
                      {zone.surgeMultiplier}x
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Box>
    );
  },
});
