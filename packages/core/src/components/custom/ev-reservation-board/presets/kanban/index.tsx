'use client';

import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvReservationBoardProps, Reservation } from '../../core';

// Mock data for standalone demo
const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: '1',
    guestName: 'Sarah Johnson',
    guestPhone: '555-0101',
    partySize: 4,
    tableId: 'T1',
    tableLabel: 'Table 1',
    date: new Date(),
    startTime: '19:00',
    endTime: '21:00',
    status: 'requested',
    notes: 'Window seat preferred',
    vip: false,
  },
  {
    id: '2',
    guestName: 'Michael Chen',
    guestPhone: '555-0102',
    partySize: 2,
    tableId: 'T3',
    tableLabel: 'Table 3',
    date: new Date(),
    startTime: '18:30',
    endTime: '20:30',
    status: 'confirmed',
    notes: '',
    vip: true,
    occasion: 'Anniversary',
  },
  {
    id: '3',
    guestName: 'Emma Davis',
    guestPhone: '555-0103',
    partySize: 6,
    tableId: 'T5',
    tableLabel: 'Table 5',
    date: new Date(),
    startTime: '20:00',
    endTime: '22:00',
    status: 'confirmed',
    notes: 'Allergies: peanuts',
    vip: false,
    occasion: 'Birthday',
  },
  {
    id: '4',
    guestName: 'James Wilson',
    guestPhone: '555-0104',
    partySize: 3,
    tableId: 'T2',
    tableLabel: 'Table 2',
    date: new Date(),
    startTime: '19:30',
    endTime: '21:30',
    status: 'seated',
    notes: '',
    vip: false,
  },
  {
    id: '5',
    guestName: 'Sofia Rodriguez',
    guestPhone: '555-0105',
    partySize: 2,
    tableId: 'T4',
    tableLabel: 'Table 4',
    date: new Date(),
    startTime: '18:00',
    endTime: '20:00',
    status: 'completed',
    notes: '',
    vip: true,
  },
  {
    id: '6',
    guestName: 'David Thompson',
    guestPhone: '555-0106',
    partySize: 4,
    tableId: 'T6',
    tableLabel: 'Table 6',
    date: new Date(),
    startTime: '21:00',
    endTime: '23:00',
    status: 'no-show',
    notes: '',
    vip: false,
  },
  {
    id: '7',
    guestName: 'Isabella Martinez',
    guestPhone: '555-0107',
    partySize: 5,
    date: new Date(),
    startTime: '19:00',
    endTime: '21:00',
    status: 'requested',
    notes: 'High chair needed',
    vip: false,
  },
  {
    id: '8',
    guestName: 'Robert Brown',
    guestPhone: '555-0108',
    partySize: 2,
    tableId: 'T7',
    tableLabel: 'Table 7',
    date: new Date(),
    startTime: '20:30',
    endTime: '22:30',
    status: 'confirmed',
    notes: '',
    vip: true,
  },
  {
    id: '9',
    guestName: 'Olivia Lee',
    guestPhone: '555-0109',
    partySize: 8,
    tableId: 'T8',
    tableLabel: 'Table 8',
    date: new Date(),
    startTime: '19:00',
    endTime: '21:30',
    status: 'seated',
    notes: 'Corporate dinner',
    vip: false,
  },
  {
    id: '10',
    guestName: 'William Garcia',
    guestPhone: '555-0110',
    partySize: 3,
    tableId: 'T9',
    tableLabel: 'Table 9',
    date: new Date(),
    startTime: '18:30',
    endTime: '20:30',
    status: 'completed',
    notes: '',
    vip: false,
  },
  {
    id: '11',
    guestName: 'Ava Taylor',
    guestPhone: '555-0111',
    partySize: 2,
    date: new Date(),
    startTime: '21:30',
    endTime: '23:00',
    status: 'requested',
    notes: '',
    vip: false,
    occasion: 'Date Night',
  },
  {
    id: '12',
    guestName: 'Ethan Anderson',
    guestPhone: '555-0112',
    partySize: 4,
    tableId: 'T10',
    tableLabel: 'Table 10',
    date: new Date(),
    startTime: '20:00',
    endTime: '22:00',
    status: 'seated',
    notes: '',
    vip: false,
  },
];

export const KanbanEvReservationBoard = createPreset<EvReservationBoardProps>({
  name: 'EVReservationBoard.Kanban',
  render: (ctx: PresetContext<EvReservationBoardProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const reservations = props.reservations || MOCK_RESERVATIONS;
    const onReservationClick = props.onReservationClick || (() => {});
    const onStatusChange = props.onStatusChange || (() => {});

    const columns = [
      { status: 'requested', label: 'Requested', color: tokens.colors.infoScale },
      { status: 'confirmed', label: 'Confirmed', color: tokens.colors.primaryScale },
      { status: 'seated', label: 'Seated', color: tokens.colors.successScale },
      { status: 'completed', label: 'Completed', color: tokens.colors.neutral },
      { status: 'no-show', label: 'No-Show', color: tokens.colors.errorScale },
    ] as const;

    const getColumnReservations = (status: string) => {
      return reservations.filter((r) => r.status === status);
    };

    return (
      <Box style={{ ...createSurfaceStyle(tokens), padding: tokens.spacing[4] }}>
        {/* Header */}
        <Box
          style={{
            marginBottom: tokens.spacing[4],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}
          >
            Reservation Board
          </Text>
          <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <Box
              style={createFilterPillStyle(tokens, { active: false })}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                Today
              </Text>
            </Box>
            <Box
              style={createFilterPillStyle(tokens, { active: false })}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                All Tables
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Kanban Board */}
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[3],
            overflow: 'auto',
          }}
        >
          {columns.map((column) => {
            const columnReservations = getColumnReservations(column.status);
            return (
              <Box
                key={column.status}
                style={{
                  flex: 1,
                  minWidth: '280px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Column Header */}
                <Box
                  style={{
                    ...createSurfaceStyle(tokens, {
                      borderColor: column.color[200],
                    }),
                    padding: tokens.spacing[3],
                    backgroundColor: column.color[50],
                    marginBottom: tokens.spacing[3],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: column.color[700],
                    }}
                  >
                    {column.label}
                  </Text>
                  <Box
                    style={{
                      backgroundColor: column.color[100],
                      color: column.color[800],
                      border: `1px solid ${column.color[200]}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.full,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      minWidth: '24px',
                      textAlign: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                      }}
                    >
                      {columnReservations.length}
                    </Text>
                  </Box>
                </Box>

                {/* Reservation Cards */}
                <Box
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: tokens.spacing[2],
                    flex: 1,
                  }}
                >
                  {columnReservations.map((reservation) => (
                    <Box
                      key={reservation.id}
                      style={{
                        ...createCardStyle(tokens),
                        ...createHoverStyle(tokens),
                        padding: tokens.spacing[3],
                        cursor: 'pointer',
                      }}
                      onClick={() => onReservationClick(reservation.id)}
                    >
                      {/* Guest Name & VIP Badge */}
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[900],
                          }}
                        >
                          {reservation.guestName}
                        </Text>
                        {reservation.vip && (
                          <Box
                            style={createBadgeStyle(tokens, 'warning')}
                          >
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.semibold,
                              }}
                            >
                              VIP
                            </Text>
                          </Box>
                        )}
                      </Box>

                      {/* Party Size & Time */}
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[3],
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[600],
                          }}
                        >
                          Party of {reservation.partySize}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[600],
                          }}
                        >
                          {reservation.startTime} - {reservation.endTime}
                        </Text>
                      </Box>

                      {/* Table */}
                      {reservation.tableLabel && (
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[600],
                            marginBottom: tokens.spacing[1],
                          }}
                        >
                          {reservation.tableLabel}
                        </Text>
                      )}

                      {/* Occasion Badge */}
                      {reservation.occasion && (
                        <Box style={{ marginTop: tokens.spacing[1] }}>
                          <Box
                            style={createBadgeStyle(tokens, 'secondary')}
                          >
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.medium,
                              }}
                            >
                              {reservation.occasion}
                            </Text>
                          </Box>
                        </Box>
                      )}

                      {/* Notes */}
                      {reservation.notes && (
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                            marginTop: tokens.spacing[1],
                            fontStyle: 'italic',
                          }}
                        >
                          {reservation.notes}
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
  },
});
