'use client';

import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createHoverStyle,
  createListItemStyle,
} from '../../../helpers';
import type { EvSeatingChartProps, SeatingSection, SeatInfo } from '../../core';
import { useState } from 'react';

// MOCK data for standalone demo
const MOCK_SECTIONS: SeatingSection[] = [
  {
    id: 'vip-1',
    name: 'VIP Front',
    rows: 3,
    seatsPerRow: 8,
    tier: 'VIP',
    pricePerSeat: 500,
    color: '#8B5CF6',
  },
];

const MOCK_SEATS: SeatInfo[] = [
  { id: 'A1', sectionId: 'vip-1', row: 'A', number: 1, status: 'available' },
  { id: 'A2', sectionId: 'vip-1', row: 'A', number: 2, status: 'available' },
  { id: 'A3', sectionId: 'vip-1', row: 'A', number: 3, status: 'sold', assignee: 'John Smith', ticketId: 'TKT-001' },
  { id: 'A4', sectionId: 'vip-1', row: 'A', number: 4, status: 'available' },
  { id: 'A5', sectionId: 'vip-1', row: 'A', number: 5, status: 'available' },
  { id: 'A6', sectionId: 'vip-1', row: 'A', number: 6, status: 'available' },
  { id: 'A7', sectionId: 'vip-1', row: 'A', number: 7, status: 'sold', assignee: 'Sarah Johnson', ticketId: 'TKT-002' },
  { id: 'A8', sectionId: 'vip-1', row: 'A', number: 8, status: 'available' },
  { id: 'B1', sectionId: 'vip-1', row: 'B', number: 1, status: 'available' },
  { id: 'B2', sectionId: 'vip-1', row: 'B', number: 2, status: 'available' },
  { id: 'B3', sectionId: 'vip-1', row: 'B', number: 3, status: 'available' },
  { id: 'B4', sectionId: 'vip-1', row: 'B', number: 4, status: 'sold', assignee: 'Mike Davis', ticketId: 'TKT-003' },
  { id: 'B5', sectionId: 'vip-1', row: 'B', number: 5, status: 'available' },
  { id: 'B6', sectionId: 'vip-1', row: 'B', number: 6, status: 'available' },
  { id: 'B7', sectionId: 'vip-1', row: 'B', number: 7, status: 'available' },
  { id: 'B8', sectionId: 'vip-1', row: 'B', number: 8, status: 'available' },
  { id: 'C1', sectionId: 'vip-1', row: 'C', number: 1, status: 'available' },
  { id: 'C2', sectionId: 'vip-1', row: 'C', number: 2, status: 'available' },
  { id: 'C3', sectionId: 'vip-1', row: 'C', number: 3, status: 'available' },
  { id: 'C4', sectionId: 'vip-1', row: 'C', number: 4, status: 'available' },
  { id: 'C5', sectionId: 'vip-1', row: 'C', number: 5, status: 'available' },
  { id: 'C6', sectionId: 'vip-1', row: 'C', number: 6, status: 'available' },
  { id: 'C7', sectionId: 'vip-1', row: 'C', number: 7, status: 'available' },
  { id: 'C8', sectionId: 'vip-1', row: 'C', number: 8, status: 'available' },
];

interface Guest {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  assignedSeat?: string;
}

const MOCK_GUESTS: Guest[] = [
  { id: 'g1', name: 'John Smith', email: 'john@example.com', ticketType: 'VIP', assignedSeat: 'A3' },
  { id: 'g2', name: 'Sarah Johnson', email: 'sarah@example.com', ticketType: 'VIP', assignedSeat: 'A7' },
  { id: 'g3', name: 'Mike Davis', email: 'mike@example.com', ticketType: 'VIP', assignedSeat: 'B4' },
  { id: 'g4', name: 'Emily Chen', email: 'emily@example.com', ticketType: 'VIP' },
  { id: 'g5', name: 'David Brown', email: 'david@example.com', ticketType: 'VIP' },
  { id: 'g6', name: 'Lisa Wilson', email: 'lisa@example.com', ticketType: 'VIP' },
  { id: 'g7', name: 'Tom Anderson', email: 'tom@example.com', ticketType: 'VIP' },
  { id: 'g8', name: 'Rachel Green', email: 'rachel@example.com', ticketType: 'VIP' },
];

export const AssignmentEvSeatingChart = createPreset<EvSeatingChartProps>({
  name: 'EvSeatingChart.Assignment',
  render: (ctx: PresetContext<EvSeatingChartProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const sections = props.sections || MOCK_SECTIONS;
    const [seats, setSeats] = useState<SeatInfo[]>(props.seats || MOCK_SEATS);
    const [guests, setGuests] = useState<Guest[]>(MOCK_GUESTS);
    const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
    const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleGuestSelect = (guestId: string) => {
      setSelectedGuest(guestId);
      setSelectedSeat(null);
    };

    const handleSeatClick = (seatId: string) => {
      if (!selectedGuest) {
        setSelectedSeat(seatId);
        return;
      }

      const seat = seats.find((s) => s.id === seatId);
      if (seat?.status !== 'available') return;

      // Unassign previous seat if any
      const guest = guests.find((g) => g.id === selectedGuest);
      if (guest?.assignedSeat) {
        setSeats(
          seats.map((s) =>
            s.id === guest.assignedSeat
              ? { ...s, status: 'available', assignee: undefined }
              : s
          )
        );
      }

      // Assign new seat
      setSeats(
        seats.map((s) =>
          s.id === seatId
            ? { ...s, status: 'sold', assignee: guest?.name }
            : s
        )
      );

      setGuests(
        guests.map((g) =>
          g.id === selectedGuest ? { ...g, assignedSeat: seatId } : g
        )
      );

      setSelectedGuest(null);
      setSelectedSeat(seatId);

      props.onAssign?.(seatId, guests.find((g) => g.id === selectedGuest)?.name || '');
    };

    const getSeatColor = (status: SeatInfo['status'], seatId: string) => {
      if (selectedSeat === seatId) {
        return tokens.colors.primaryScale[500];
      }
      switch (status) {
        case 'available':
          return tokens.colors.neutral[200];
        case 'sold':
          return tokens.colors.successScale[500];
        default:
          return tokens.colors.neutral[400];
      }
    };

    const getInitials = (name?: string) => {
      if (!name) return '';
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const filteredGuests = guests.filter((g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const assignedCount = guests.filter((g) => g.assignedSeat).length;
    const unassignedCount = guests.length - assignedCount;

    return (
      <Box style={createSurfaceStyle(tokens)}>
        {/* Header */}
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
            Seat Assignment
          </Text>
          <Box
            style={{
              display: 'flex',
              gap: tokens.spacing[3],
            }}
          >
            <Box style={createBadgeStyle(tokens, 'success')}>
              Assigned: {assignedCount}
            </Box>
            <Box style={createBadgeStyle(tokens, 'warning')}>
              Unassigned: {unassignedCount}
            </Box>
          </Box>
        </Box>

        {/* Main content */}
        <Box
          style={{
            display: 'flex',
            height: '600px',
          }}
        >
          {/* Seat map */}
          <Box
            style={{
              flex: 1,
              padding: tokens.spacing[4],
              overflowY: 'auto',
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                marginBottom: tokens.spacing[4],
                display: 'block',
              }}
            >
              Seat Map
            </Text>

            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacing[6],
              }}
            >
              {sections.map((section) => {
                const sectionSeats = seats.filter(
                  (s) => s.sectionId === section.id
                );

                return (
                  <Box key={section.id}>
                    {/* Section header */}
                    <Box
                      style={{
                        ...createCardStyle(tokens),
                        backgroundColor: tokens.colors.primaryScale[50],
                        borderColor: tokens.colors.primaryScale[200],
                        padding: tokens.spacing[3],
                        marginBottom: tokens.spacing[3],
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.md,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.primaryScale[700],
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
                        {section.tier} • ${section.pricePerSeat}
                      </Text>
                    </Box>

                    {/* Seat grid */}
                    <Box
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: tokens.spacing[2],
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
                              gap: tokens.spacing[2],
                            }}
                          >
                            {/* Row label */}
                            <Text
                              style={{
                                width: '32px',
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
                                gap: tokens.spacing[2],
                              }}
                            >
                              {rowSeats.map((seat) => (
                                <Box
                                  key={seat.id}
                                  onClick={() => handleSeatClick(seat.id)}
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: getSeatColor(
                                      seat.status,
                                      seat.id
                                    ),
                                    borderRadius: tokens.borderRadius.md,
                                    cursor:
                                      seat.status === 'available' || selectedSeat === seat.id
                                        ? 'pointer'
                                        : 'not-allowed',
                                    border:
                                      selectedGuest && seat.status === 'available'
                                        ? `2px solid ${tokens.colors.primaryScale[400]}`
                                        : selectedSeat === seat.id
                                        ? `2px solid ${tokens.colors.primaryScale[600]}`
                                        : 'none',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    ...createHoverStyle(tokens),
                                  }}
                                  title={
                                    seat.assignee
                                      ? `${seat.row}${seat.number} - ${seat.assignee}`
                                      : `${seat.row}${seat.number}`
                                  }
                                >
                                  {seat.assignee && (
                                    <Text
                                      style={{
                                        fontSize: tokens.typography.fontSize.xs,
                                        fontWeight: tokens.typography.fontWeight.semibold,
                                        color: tokens.colors.common.white,
                                      }}
                                    >
                                      {getInitials(seat.assignee)}
                                    </Text>
                                  )}
                                </Box>
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

          {/* Guest list */}
          <Box
            style={{
              width: '360px',
              borderLeft: `1px solid ${tokens.colors.neutral[200]}`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              style={{
                padding: tokens.spacing[4],
                borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[3],
                  display: 'block',
                }}
              >
                Guests
              </Text>
              <input
                type="text"
                placeholder="Search guests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: tokens.spacing[2],
                  fontSize: tokens.typography.fontSize.sm,
                  border: `1px solid ${tokens.colors.neutral[300]}`,
                  borderRadius: tokens.borderRadius.md,
                  outline: 'none',
                }}
              />
            </Box>

            <Box
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: tokens.spacing[3],
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[1],
                }}
              >
                {filteredGuests.map((guest) => (
                  <Box
                    key={guest.id}
                    onClick={() => handleGuestSelect(guest.id)}
                    style={{
                      ...createListItemStyle(tokens),
                      padding: tokens.spacing[3],
                      cursor: 'pointer',
                      backgroundColor:
                        selectedGuest === guest.id
                          ? tokens.colors.primaryScale[50]
                          : tokens.colors.common.white,
                      borderColor:
                        selectedGuest === guest.id
                          ? tokens.colors.primaryScale[300]
                          : tokens.colors.neutral[200],
                      borderWidth: selectedGuest === guest.id ? '2px' : '1px',
                    }}
                  >
                    <Box
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      <Box>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[900],
                            display: 'block',
                          }}
                        >
                          {guest.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[600],
                          }}
                        >
                          {guest.email}
                        </Text>
                      </Box>
                      <Box
                        style={{
                          ...createBadgeStyle(tokens, 'primary'),
                          fontSize: tokens.typography.fontSize.xs,
                        }}
                      >
                        {guest.ticketType}
                      </Box>
                    </Box>
                    {guest.assignedSeat ? (
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
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.successScale[700],
                            fontWeight: tokens.typography.fontWeight.medium,
                          }}
                        >
                          Seat {guest.assignedSeat}
                        </Text>
                      </Box>
                    ) : (
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.warningScale[700],
                          fontStyle: 'italic',
                        }}
                      >
                        No seat assigned
                      </Text>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
