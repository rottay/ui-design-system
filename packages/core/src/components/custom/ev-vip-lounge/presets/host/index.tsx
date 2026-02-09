'use client';

import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createStatusDotStyle,
} from '../../../helpers';
import type { VipLoungeProps, VipGuest } from '../../core';

// Mock data for standalone demo
const MOCK_VIP_GUESTS = [
  {
    id: 'vip-001',
    name: 'Samantha Blake',
    tier: 'platinum' as const,
    status: 'seated' as const,
    tableLabel: 'Table 7',
    host: 'Marcus',
    bottleService: true,
    arrival: new Date('2026-02-09T21:15:00'),
  },
  {
    id: 'vip-002',
    name: 'Richard Castellano',
    tier: 'platinum' as const,
    status: 'expected' as const,
    tableLabel: 'Table 3',
    host: 'Sarah',
    bottleService: true,
  },
  {
    id: 'vip-003',
    name: 'Diana Zhang',
    tier: 'gold' as const,
    status: 'arrived' as const,
    tableLabel: 'Table 12',
    host: 'Marcus',
    bottleService: false,
    arrival: new Date('2026-02-09T22:05:00'),
  },
  {
    id: 'vip-004',
    name: 'Antonio Rodriguez',
    tier: 'platinum' as const,
    status: 'seated' as const,
    tableLabel: 'Table 1',
    host: 'Jordan',
    bottleService: true,
    arrival: new Date('2026-02-09T20:45:00'),
  },
  {
    id: 'vip-005',
    name: 'Victoria Chen',
    tier: 'gold' as const,
    status: 'expected' as const,
    tableLabel: 'Table 15',
    host: 'Sarah',
    bottleService: true,
  },
  {
    id: 'vip-006',
    name: 'Malcolm Thompson',
    tier: 'platinum' as const,
    status: 'departed' as const,
    tableLabel: 'Table 5',
    host: 'Marcus',
    bottleService: true,
    arrival: new Date('2026-02-09T20:30:00'),
  },
  {
    id: 'vip-007',
    name: 'Isabella Martinez',
    tier: 'gold' as const,
    status: 'arrived' as const,
    tableLabel: 'Table 8',
    host: 'Jordan',
    bottleService: false,
    arrival: new Date('2026-02-09T22:15:00'),
  },
  {
    id: 'vip-008',
    name: 'Alexander Wright',
    tier: 'platinum' as const,
    status: 'expected' as const,
    tableLabel: 'Table 2',
    host: 'Jordan',
    bottleService: true,
  },
];

export const VipLoungeHost = createPreset<VipLoungeProps>({
  name: 'VipLounge.Host',
  render: (ctx: PresetContext<VipLoungeProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const vipGuests = props.guests || MOCK_VIP_GUESTS;

    const getTierScale = (tier: string) => {
      switch (tier) {
        case 'platinum':
          return tokens.colors.primaryScale;
        case 'gold':
          return tokens.colors.warningScale;
        default:
          return tokens.colors.infoScale;
      }
    };

    const getTierBadgeColor = (tier: string): 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary' => {
      switch (tier) {
        case 'platinum':
          return 'primary';
        case 'gold':
          return 'warning';
        default:
          return 'info';
      }
    };

    const getStatusScale = (status: string) => {
      switch (status) {
        case 'expected':
          return tokens.colors.infoScale;
        case 'arrived':
          return tokens.colors.warningScale;
        case 'seated':
          return tokens.colors.successScale;
        case 'departed':
          return tokens.colors.secondaryScale;
        default:
          return tokens.colors.secondaryScale;
      }
    };

    const getStatusBadgeColor = (status: string): 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary' => {
      switch (status) {
        case 'expected':
          return 'info';
        case 'arrived':
          return 'warning';
        case 'seated':
          return 'success';
        case 'departed':
          return 'secondary';
        default:
          return 'secondary';
      }
    };

    const statusGroups = {
      expected: vipGuests.filter((g) => g.status === 'expected'),
      arrived: vipGuests.filter((g) => g.status === 'arrived'),
      seated: vipGuests.filter((g) => g.status === 'seated'),
      departed: vipGuests.filter((g) => g.status === 'departed'),
    };

    const cardStyle = createCardStyle(tokens);

    const renderGuestCard = (guest: VipGuest) => {
      const tierScale = getTierScale(guest.tier);
      const statusScale = getStatusScale(guest.status);
      const badgeStyle = createBadgeStyle(tokens, getTierBadgeColor(guest.tier));
      const statusBadgeStyle = createBadgeStyle(tokens, getStatusBadgeColor(guest.status));
      const statusDotStyle = createStatusDotStyle(tokens, statusScale[500]);

      const initials = guest.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();

      return (
        <Box
          key={guest.id}
          style={{
            ...cardStyle,
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[2],
          }}
        >
          {/* Header: Avatar and Status */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
            }}
          >
            <Box
              style={{
                width: '48px',
                height: '48px',
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tierScale[100],
                color: tierScale[700],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                border: `2px solid ${tierScale[500]}`,
              }}
            >
              {initials}
            </Box>

            <Box style={{ flex: 1 }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  {guest.name}
                </Text>
                <Box style={statusDotStyle} />
              </Box>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  marginTop: tokens.spacing[1],
                }}
              >
                <Box
                  style={{
                    ...badgeStyle,
                    fontSize: tokens.typography.fontSize.xs,
                    textTransform: 'uppercase',
                  }}
                >
                  {guest.tier}
                </Box>
                <Box
                  style={{
                    ...statusBadgeStyle,
                    fontSize: tokens.typography.fontSize.xs,
                    textTransform: 'capitalize',
                  }}
                >
                  {guest.status}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Details */}
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: tokens.spacing[2],
              paddingTop: tokens.spacing[2],
              borderTop: `1px solid ${tokens.colors.neutral[200]}`,
            }}
          >
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}
              >
                Table
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[900],
                  marginTop: tokens.spacing[1],
                }}
              >
                {guest.tableLabel || 'TBA'}
              </Text>
            </Box>
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}
              >
                Host
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[900],
                  marginTop: tokens.spacing[1],
                }}
              >
                {guest.host || 'Unassigned'}
              </Text>
            </Box>
          </Box>

          {/* Bottle Service & Arrival */}
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {guest.bottleService && (
              <Box
                style={{
                  padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                  backgroundColor: tokens.colors.warningScale[100],
                  color: tokens.colors.warningScale[700],
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  border: `1px solid ${tokens.colors.warningScale[200]}`,
                }}
              >
                Bottle Service
              </Box>
            )}
            {guest.arrival && (
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  marginLeft: 'auto',
                }}
              >
                {guest.arrival.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            )}
          </Box>
        </Box>
      );
    };

    return (
      <Box style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header Stats */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[6],
          }}
        >
          {Object.entries(statusGroups).map(([status, guests]) => {
            const statusScale = getStatusScale(status);
            return (
              <Box
                key={status}
                style={{
                  ...cardStyle,
                  textAlign: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize['3xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: statusScale[600],
                  }}
                >
                  {guests.length}
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[500],
                    textTransform: 'capitalize',
                    marginTop: tokens.spacing[1],
                  }}
                >
                  {status}
                </Text>
              </Box>
            );
          })}
        </Box>

        {/* Guest Lists by Status */}
        {Object.entries(statusGroups).map(([status, guests]) => {
          if (guests.length === 0) return null;
          return (
            <Box key={status} style={{ marginBottom: tokens.spacing[6] }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  textTransform: 'capitalize',
                  marginBottom: tokens.spacing[3],
                }}
              >
                {status} ({guests.length})
              </Text>
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: tokens.spacing[3],
                }}
              >
                {guests.map(renderGuestCard)}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  },
});
