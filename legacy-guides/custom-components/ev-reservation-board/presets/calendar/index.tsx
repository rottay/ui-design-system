'use client';

import { createPreset, type PresetContext } from '../../../factory';
import { createSurfaceStyle, createBadgeStyle, createFilterPillStyle } from '../../../helpers';
import type { EvReservationBoardProps, Reservation } from '../../core';

// Mock data for standalone demo
const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: '1',
    guestName: 'Sarah Johnson',
    partySize: 4,
    tableId: 'T1',
    tableLabel: 'Table 1',
    date: new Date(),
    startTime: '18:30',
    endTime: '20:30',
    status: 'confirmed',
  },
  {
    id: '2',
    guestName: 'Michael Chen',
    partySize: 2,
    tableId: 'T2',
    tableLabel: 'Table 2',
    date: new Date(),
    startTime: '19:00',
    endTime: '21:00',
    status: 'seated',
    vip: true,
  },
  {
    id: '3',
    guestName: 'Emma Davis',
    partySize: 6,
    tableId: 'T3',
    tableLabel: 'Table 3',
    date: new Date(),
    startTime: '20:00',
    endTime: '22:30',
    status: 'confirmed',
  },
  {
    id: '4',
    guestName: 'James Wilson',
    partySize: 3,
    tableId: 'T1',
    tableLabel: 'Table 1',
    date: new Date(),
    startTime: '21:00',
    endTime: '23:00',
    status: 'requested',
  },
  {
    id: '5',
    guestName: 'Sofia Rodriguez',
    partySize: 2,
    tableId: 'T4',
    tableLabel: 'Table 4',
    date: new Date(),
    startTime: '18:00',
    endTime: '20:00',
    status: 'seated',
  },
  {
    id: '6',
    guestName: 'David Thompson',
    partySize: 4,
    tableId: 'T4',
    tableLabel: 'Table 4',
    date: new Date(),
    startTime: '20:30',
    endTime: '22:30',
    status: 'confirmed',
  },
  {
    id: '7',
    guestName: 'Isabella Martinez',
    partySize: 5,
    tableId: 'T2',
    tableLabel: 'Table 2',
    date: new Date(),
    startTime: '21:30',
    endTime: '23:30',
    status: 'requested',
  },
  {
    id: '8',
    guestName: 'Robert Brown',
    partySize: 2,
    tableId: 'T5',
    tableLabel: 'Table 5',
    date: new Date(),
    startTime: '19:00',
    endTime: '21:00',
    status: 'seated',
  },
  {
    id: '9',
    guestName: 'Olivia Lee',
    partySize: 8,
    tableId: 'T5',
    tableLabel: 'Table 5',
    date: new Date(),
    startTime: '21:30',
    endTime: '23:30',
    status: 'confirmed',
  },
  {
    id: '10',
    guestName: 'William Garcia',
    partySize: 3,
    tableId: 'T3',
    tableLabel: 'Table 3',
    date: new Date(),
    startTime: '18:00',
    endTime: '19:30',
    status: 'completed',
  },
];

export const CalendarEvReservationBoard = createPreset<EvReservationBoardProps>({
  name: 'EVReservationBoard.Calendar',
  render: (ctx: PresetContext<EvReservationBoardProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const reservations = props.reservations || MOCK_RESERVATIONS;

    // Time blocks from 18:00 to 23:30 in 30-min intervals
    const timeBlocks = [
      '18:00',
      '18:30',
      '19:00',
      '19:30',
      '20:00',
      '20:30',
      '21:00',
      '21:30',
      '22:00',
      '22:30',
      '23:00',
      '23:30',
    ];

    // Extract unique tables
    const tables = Array.from(
      new Set(reservations.map((r) => r.tableLabel).filter(Boolean))
    ).sort() as string[];

    const statusColors = {
      requested: tokens.colors.infoScale,
      confirmed: tokens.colors.primaryScale,
      seated: tokens.colors.successScale,
      completed: tokens.colors.neutral,
      'no-show': tokens.colors.errorScale,
      cancelled: tokens.colors.neutral,
    };

    // Convert time to minutes for positioning
    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // Get position and width for reservation block
    const getBlockPosition = (startTime: string, endTime: string) => {
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(endTime);
      const baseMinutes = timeToMinutes('18:00');
      const totalMinutes = timeToMinutes('23:30') - baseMinutes;

      const left = ((startMinutes - baseMinutes) / totalMinutes) * 100;
      const width = ((endMinutes - startMinutes) / totalMinutes) * 100;

      return { left: `${left}%`, width: `${width}%` };
    };

    // Calculate stats
    const totalReservations = reservations.length;
    const expectedCovers = reservations.reduce((sum, r) => sum + r.partySize, 0);
    const currentlySeated = reservations.filter((r) => r.status === 'seated').length;

    // Current time indicator (mock at 20:00)
    const currentTime = '20:00';
    const currentTimePosition = () => {
      const currentMinutes = timeToMinutes(currentTime);
      const baseMinutes = timeToMinutes('18:00');
      const totalMinutes = timeToMinutes('23:30') - baseMinutes;
      return `${((currentMinutes - baseMinutes) / totalMinutes) * 100}%`;
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
            Reservation Timeline
          </Text>
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
        </Box>

        {/* Stats */}
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[4],
            marginBottom: tokens.spacing[4],
          }}
        >
          <Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
              }}
            >
              Total Reservations
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {totalReservations}
            </Text>
          </Box>
          <Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
              }}
            >
              Expected Covers
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {expectedCovers}
            </Text>
          </Box>
          <Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
              }}
            >
              Currently Seated
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.successScale[600],
              }}
            >
              {currentlySeated}
            </Text>
          </Box>
        </Box>

        {/* Legend */}
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
            flexWrap: 'wrap',
          }}
        >
          {Object.entries(statusColors).map(([status, colorScale]) => (
            <Box
              key={status}
              style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}
            >
              <Box
                style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: colorScale[500],
                  borderRadius: tokens.borderRadius.sm,
                }}
              />
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[700],
                  textTransform: 'capitalize',
                }}
              >
                {status.replace('-', ' ')}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Timeline Grid */}
        <Box style={{ overflow: 'auto' }}>
          <Box style={{ minWidth: '1200px' }}>
            {/* Time Header */}
            <Box
              style={{
                display: 'flex',
                borderBottom: `2px solid ${tokens.colors.neutral[300]}`,
                paddingBottom: tokens.spacing[2],
                marginBottom: tokens.spacing[2],
              }}
            >
              <Box style={{ width: '120px', flexShrink: 0 }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[700],
                  }}
                >
                  Table
                </Text>
              </Box>
              <Box style={{ flex: 1, display: 'flex', position: 'relative' }}>
                {timeBlocks.map((time, idx) => (
                  <Box
                    key={time}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      borderLeft:
                        idx > 0 ? `1px solid ${tokens.colors.neutral[200]}` : 'none',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[600],
                      }}
                    >
                      {time}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Table Rows */}
            {tables.map((table) => {
              const tableReservations = reservations.filter((r) => r.tableLabel === table);
              return (
                <Box
                  key={table}
                  style={{
                    display: 'flex',
                    minHeight: '60px',
                    borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
                    paddingTop: tokens.spacing[2],
                    paddingBottom: tokens.spacing[2],
                  }}
                >
                  {/* Table Label */}
                  <Box
                    style={{
                      width: '120px',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {table}
                    </Text>
                  </Box>

                  {/* Timeline with Reservation Blocks */}
                  <Box style={{ flex: 1, position: 'relative', height: '48px' }}>
                    {/* Time Grid Lines */}
                    {timeBlocks.map((time, idx) => (
                      <Box
                        key={time}
                        style={{
                          position: 'absolute',
                          left: `${(idx / (timeBlocks.length - 1)) * 100}%`,
                          top: 0,
                          bottom: 0,
                          width: '1px',
                          backgroundColor:
                            idx > 0
                              ? tokens.colors.neutral[200]
                              : tokens.colors.neutral[300],
                        }}
                      />
                    ))}

                    {/* Current Time Indicator */}
                    <Box
                      style={{
                        position: 'absolute',
                        left: currentTimePosition(),
                        top: '-8px',
                        bottom: '-8px',
                        width: '2px',
                        backgroundColor: tokens.colors.errorScale[500],
                        zIndex: 10,
                      }}
                    />

                    {/* Reservation Blocks */}
                    {tableReservations.map((reservation) => {
                      const { left, width } = getBlockPosition(
                        reservation.startTime,
                        reservation.endTime
                      );
                      const colorScale = statusColors[reservation.status];

                      return (
                        <Box
                          key={reservation.id}
                          style={{
                            position: 'absolute',
                            left,
                            width,
                            top: '4px',
                            height: '40px',
                            backgroundColor: colorScale[500],
                            borderRadius: tokens.borderRadius.md,
                            padding: tokens.spacing[1],
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: tokens.shadows.sm,
                          }}
                          onClick={() => props.onReservationClick?.(reservation.id)}
                        >
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.common.white,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {reservation.guestName}
                          </Text>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.common.white,
                            }}
                          >
                            Party of {reservation.partySize}
                          </Text>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  },
});
