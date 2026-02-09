'use client';

import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createHoverStyle,
} from '../../../helpers';
import type { EvSeatingChartProps, SeatingSection, SeatInfo } from '../../core';
import { useState } from 'react';

// MOCK data for standalone demo
const MOCK_SECTIONS: SeatingSection[] = [
  {
    id: 'vip-1',
    name: 'VIP Front',
    rows: 5,
    seatsPerRow: 10,
    tier: 'VIP',
    pricePerSeat: 500,
    color: '#8B5CF6',
  },
  {
    id: 'premium-1',
    name: 'Premium Center',
    rows: 8,
    seatsPerRow: 12,
    tier: 'Premium',
    pricePerSeat: 300,
    color: '#3B82F6',
  },
  {
    id: 'general-1',
    name: 'General',
    rows: 10,
    seatsPerRow: 15,
    tier: 'Standard',
    pricePerSeat: 100,
    color: '#10B981',
  },
];

const generateMockSeats = (sections: SeatingSection[]): SeatInfo[] => {
  const seats: SeatInfo[] = [];
  const statuses: SeatInfo['status'][] = [
    'available',
    'reserved',
    'sold',
    'blocked',
    'vip',
  ];

  sections.forEach((section) => {
    for (let r = 0; r < section.rows; r++) {
      const rowLetter = String.fromCharCode(65 + r);
      for (let s = 0; s < section.seatsPerRow; s++) {
        const randomStatus =
          statuses[Math.floor(Math.random() * statuses.length)];
        seats.push({
          id: `${section.id}-${rowLetter}${s + 1}`,
          sectionId: section.id,
          row: rowLetter,
          number: s + 1,
          status: randomStatus,
          assignee:
            randomStatus === 'sold' || randomStatus === 'reserved'
              ? `Guest ${Math.floor(Math.random() * 100)}`
              : undefined,
          ticketId:
            randomStatus === 'sold' ? `TKT-${Math.random().toString(36).substr(2, 9).toUpperCase()}` : undefined,
        });
      }
    }
  });

  return seats;
};

export const EditorEvSeatingChart = createPreset<EvSeatingChartProps>({
  name: 'EvSeatingChart.Editor',
  render: (ctx: PresetContext<EvSeatingChartProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const sections = props.sections || MOCK_SECTIONS;
    const [seats, setSeats] = useState<SeatInfo[]>(
      props.seats || generateMockSeats(sections)
    );
    const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

    const handleSeatClick = (seatId: string) => {
      setSelectedSeat(seatId);
      const seat = seats.find((s) => s.id === seatId);
      if (!seat) return;

      // Cycle through statuses
      const statusCycle: SeatInfo['status'][] = [
        'available',
        'reserved',
        'sold',
        'blocked',
        'vip',
      ];
      const currentIndex = statusCycle.indexOf(seat.status);
      const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

      setSeats(
        seats.map((s) =>
          s.id === seatId
            ? {
                ...s,
                status: nextStatus,
                assignee:
                  nextStatus === 'sold' || nextStatus === 'reserved'
                    ? s.assignee || 'Unassigned'
                    : undefined,
              }
            : s
        )
      );

      props.onSeatClick?.(seatId);
    };

    const getTierColor = (tier: string) => {
      switch (tier) {
        case 'VIP':
          return {
            bg: tokens.colors.primaryScale[50],
            border: tokens.colors.primaryScale[200],
            text: tokens.colors.primaryScale[700],
          };
        case 'Premium':
          return {
            bg: tokens.colors.secondaryScale[50],
            border: tokens.colors.secondaryScale[200],
            text: tokens.colors.secondaryScale[700],
          };
        case 'Standard':
          return {
            bg: tokens.colors.infoScale[50],
            border: tokens.colors.infoScale[200],
            text: tokens.colors.infoScale[700],
          };
        case 'Economy':
          return {
            bg: tokens.colors.successScale[50],
            border: tokens.colors.successScale[200],
            text: tokens.colors.successScale[700],
          };
        default:
          return {
            bg: tokens.colors.neutral[50],
            border: tokens.colors.neutral[200],
            text: tokens.colors.neutral[700],
          };
      }
    };

    const getSeatColor = (status: SeatInfo['status']) => {
      switch (status) {
        case 'available':
          return tokens.colors.neutral[200];
        case 'reserved':
          return tokens.colors.warningScale[400];
        case 'sold':
          return tokens.colors.successScale[500];
        case 'blocked':
          return tokens.colors.neutral[400];
        case 'vip':
          return tokens.colors.primaryScale[500];
        default:
          return tokens.colors.neutral[200];
      }
    };

    const stats = {
      total: seats.length,
      available: seats.filter((s) => s.status === 'available').length,
      sold: seats.filter((s) => s.status === 'sold').length,
      reserved: seats.filter((s) => s.status === 'reserved').length,
      blocked: seats.filter((s) => s.status === 'blocked').length,
      vip: seats.filter((s) => s.status === 'vip').length,
    };

    return (
      <Box style={createSurfaceStyle(tokens)}>
        {/* Header with stats */}
        <Box
          style={{
            padding: tokens.spacing[4],
            borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[3],
              display: 'block',
            }}
          >
            Seating Chart Editor
          </Text>
          <Box
            style={{
              display: 'flex',
              gap: tokens.spacing[3],
              flexWrap: 'wrap',
            }}
          >
            <Box style={createBadgeStyle(tokens, 'secondary')}>
              Total: {stats.total}
            </Box>
            <Box style={createBadgeStyle(tokens, 'success')}>
              Available: {stats.available}
            </Box>
            <Box style={createBadgeStyle(tokens, 'info')}>
              Sold: {stats.sold}
            </Box>
            <Box style={createBadgeStyle(tokens, 'warning')}>
              Reserved: {stats.reserved}
            </Box>
            <Box style={createBadgeStyle(tokens, 'secondary')}>
              Blocked: {stats.blocked}
            </Box>
            <Box style={createBadgeStyle(tokens, 'primary')}>
              VIP: {stats.vip}
            </Box>
          </Box>
        </Box>

        {/* Main content */}
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[6],
            padding: tokens.spacing[4],
          }}
        >
          {/* Seating sections */}
          <Box style={{ flex: 1 }}>
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacing[6],
              }}
            >
              {sections.map((section) => {
                const tierColors = getTierColor(section.tier);
                const sectionSeats = seats.filter(
                  (s) => s.sectionId === section.id
                );

                return (
                  <Box key={section.id}>
                    {/* Section header */}
                    <Box
                      style={{
                        ...createCardStyle(tokens),
                        backgroundColor: tierColors.bg,
                        borderColor: tierColors.border,
                        padding: tokens.spacing[3],
                        marginBottom: tokens.spacing[3],
                      }}
                    >
                      <Box
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.lg,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tierColors.text,
                              display: 'block',
                            }}
                          >
                            {section.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              color: tokens.colors.neutral[600],
                            }}
                          >
                            {section.tier} • ${section.pricePerSeat} per seat
                          </Text>
                        </Box>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[600],
                          }}
                        >
                          {section.rows} rows × {section.seatsPerRow} seats
                        </Text>
                      </Box>
                    </Box>

                    {/* Seat grid */}
                    <Box
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: tokens.spacing[1],
                      }}
                    >
                      {Array.from({ length: section.rows }).map((_, rowIndex) => {
                        const rowLetter = String.fromCharCode(65 + rowIndex);
                        const rowSeats = sectionSeats.filter(
                          (s) => s.row === rowLetter
                        );

                        return (
                          <Box
                            key={rowLetter}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: tokens.spacing[1],
                            }}
                          >
                            {/* Row label */}
                            <Text
                              style={{
                                width: '24px',
                                fontSize: tokens.typography.fontSize.sm,
                                fontWeight: tokens.typography.fontWeight.medium,
                                color: tokens.colors.neutral[600],
                                textAlign: 'center',
                              }}
                            >
                              {rowLetter}
                            </Text>

                            {/* Seats */}
                            <Box
                              style={{
                                display: 'flex',
                                gap: tokens.spacing[1],
                              }}
                            >
                              {rowSeats.map((seat) => (
                                <Box
                                  key={seat.id}
                                  onClick={() => handleSeatClick(seat.id)}
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    backgroundColor: getSeatColor(seat.status),
                                    borderRadius: tokens.borderRadius.sm,
                                    cursor: 'pointer',
                                    border:
                                      selectedSeat === seat.id
                                        ? `2px solid ${tokens.colors.primaryScale[600]}`
                                        : 'none',
                                    transition: 'all 0.2s',
                                    ...createHoverStyle(tokens),
                                  }}
                                  title={`${seat.row}${seat.number} - ${seat.status}`}
                                />
                              ))}
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Sidebar with legend and section summaries */}
          <Box
            style={{
              width: '280px',
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[4],
            }}
          >
            {/* Legend */}
            <Box style={createCardStyle(tokens)}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[3],
                  display: 'block',
                }}
              >
                Legend
              </Text>
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[2],
                }}
              >
                {[
                  { status: 'available' as const, label: 'Available' },
                  { status: 'reserved' as const, label: 'Reserved' },
                  { status: 'sold' as const, label: 'Sold' },
                  { status: 'blocked' as const, label: 'Blocked' },
                  { status: 'vip' as const, label: 'VIP' },
                ].map((item) => (
                  <Box
                    key={item.status}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                    }}
                  >
                    <Box
                      style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: getSeatColor(item.status),
                        borderRadius: tokens.borderRadius.sm,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      {item.label}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Section summaries */}
            <Box style={createCardStyle(tokens)}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[3],
                  display: 'block',
                }}
              >
                Sections
              </Text>
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[3],
                }}
              >
                {sections.map((section) => {
                  const tierColors = getTierColor(section.tier);
                  const sectionSeats = seats.filter(
                    (s) => s.sectionId === section.id
                  );
                  const available = sectionSeats.filter(
                    (s) => s.status === 'available'
                  ).length;

                  return (
                    <Box
                      key={section.id}
                      style={{
                        padding: tokens.spacing[2],
                        backgroundColor: tierColors.bg,
                        borderRadius: tokens.borderRadius.md,
                        border: `1px solid ${tierColors.border}`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tierColors.text,
                          display: 'block',
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        {section.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                          display: 'block',
                        }}
                      >
                        {available} / {sectionSeats.length} available
                      </Text>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
