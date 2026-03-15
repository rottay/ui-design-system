'use client';

import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createStatusDotStyle,
} from '../../../helpers';
import type { EvTableAssignmentProps, TableInfo, AssignedGuest } from '../../core';

// Mock data for standalone demo
const MOCK_TABLES: TableInfo[] = [
  {
    id: 'T1',
    label: 'Table 1',
    capacity: 8,
    zone: 'Main Hall',
    shape: 'round',
    assignedGuests: [
      { id: 'G1', name: 'Sarah Johnson', vip: true, ticketType: 'VIP' },
      { id: 'G2', name: 'Michael Chen', ticketType: 'Standard' },
      { id: 'G3', name: 'Emma Wilson', ticketType: 'Standard' },
    ],
    server: 'James',
    status: 'partial',
  },
  {
    id: 'T2',
    label: 'Table 2',
    capacity: 6,
    zone: 'Main Hall',
    shape: 'rectangle',
    assignedGuests: [
      { id: 'G4', name: 'David Martinez', ticketType: 'Standard' },
      { id: 'G5', name: 'Lisa Anderson', vip: true, ticketType: 'VIP' },
      { id: 'G6', name: 'Robert Taylor', ticketType: 'Standard' },
      { id: 'G7', name: 'Jennifer Lee', ticketType: 'Standard' },
      { id: 'G8', name: 'William Brown', ticketType: 'Standard' },
      { id: 'G9', name: 'Maria Garcia', ticketType: 'Standard' },
    ],
    server: 'Alice',
    status: 'full',
  },
  {
    id: 'T3',
    label: 'Table 3',
    capacity: 4,
    zone: 'Balcony',
    shape: 'booth',
    assignedGuests: [],
    server: 'Carlos',
    status: 'available',
  },
  {
    id: 'T4',
    label: 'Table 4',
    capacity: 10,
    zone: 'VIP Section',
    shape: 'round',
    assignedGuests: [
      { id: 'G10', name: 'Victoria Stone', vip: true, ticketType: 'VIP' },
      { id: 'G11', name: 'Alexander Hunt', vip: true, ticketType: 'VIP' },
    ],
    server: 'Diana',
    status: 'reserved',
  },
  {
    id: 'T5',
    label: 'Table 5',
    capacity: 6,
    zone: 'Patio',
    shape: 'rectangle',
    assignedGuests: [
      { id: 'G12', name: 'Sophia Rodriguez', ticketType: 'Standard' },
    ],
    server: 'Marcus',
    status: 'partial',
  },
  {
    id: 'T6',
    label: 'Table 6',
    capacity: 8,
    zone: 'Main Hall',
    shape: 'round',
    assignedGuests: [
      { id: 'G13', name: 'Olivia Thompson', ticketType: 'Standard' },
      { id: 'G14', name: 'Ethan Walker', ticketType: 'Standard' },
      { id: 'G15', name: 'Ava Martinez', vip: true, ticketType: 'VIP' },
    ],
    server: 'James',
    status: 'partial',
  },
];

const MOCK_UNASSIGNED: AssignedGuest[] = [
  { id: 'U1', name: 'Daniel Wright', ticketType: 'Standard' },
  { id: 'U2', name: 'Grace Miller', vip: true, ticketType: 'VIP' },
  { id: 'U3', name: 'Nathan Davis', ticketType: 'Standard' },
  { id: 'U4', name: 'Chloe Wilson', ticketType: 'Standard' },
  { id: 'U5', name: 'Lucas Anderson', ticketType: 'Standard' },
];

export const VisualEvTableAssignment = createPreset<EvTableAssignmentProps>({
  name: 'EvTableAssignment.Visual',
  render: (ctx: PresetContext<EvTableAssignmentProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const tables = props.tables || MOCK_TABLES;
    const unassignedGuests = props.unassignedGuests || MOCK_UNASSIGNED;

    const getStatusColor = (status: TableInfo['status']) => {
      switch (status) {
        case 'available':
          return tokens.colors.successScale[500];
        case 'partial':
          return tokens.colors.warningScale[500];
        case 'full':
          return tokens.colors.errorScale[500];
        case 'reserved':
          return tokens.colors.infoScale[500];
        default:
          return tokens.colors.neutral[400];
      }
    };

    const getInitials = (name: string) => {
      const parts = name.split(' ');
      return parts.length >= 2
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase();
    };

    return (
      <Box
        style={{
          ...createSurfaceStyle(tokens),
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          gap: tokens.spacing[6],
          padding: tokens.spacing[6],
        }}
      >
        {/* Floor Plan Area */}
        <Box
          style={{
            flex: 1,
            ...createSurfaceStyle(tokens),
            borderRadius: tokens.borderRadius.lg,
            padding: tokens.spacing[6],
            overflowY: 'auto',
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[6],
            }}
          >
            Floor Plan
          </Text>

          {/* Tables Grid */}
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: tokens.spacing[6],
            }}
          >
            {tables.map((table) => {
              const capacityPercent = Math.round(
                (table.assignedGuests.length / table.capacity) * 100
              );

              return (
                <Box
                  key={table.id}
                  style={{
                    ...createCardStyle(tokens),
                    padding: tokens.spacing[4],
                    position: 'relative',
                    cursor: 'pointer',
                    ...createHoverStyle(tokens),
                  }}
                >
                  {/* Table Header */}
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
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {table.label}
                    </Text>
                    <Box
                      style={{
                        ...createStatusDotStyle(tokens, getStatusColor(table.status)),
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                      }}
                    >
                      <Box
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: getStatusColor(table.status),
                        }}
                      />
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                          textTransform: 'capitalize',
                        }}
                      >
                        {table.status}
                      </Text>
                    </Box>
                  </Box>

                  {/* Table Info */}
                  <Box
                    style={{
                      display: 'flex',
                      gap: tokens.spacing[4],
                      marginBottom: tokens.spacing[3],
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[600],
                    }}
                  >
                    <Text>{table.zone}</Text>
                    <Text>•</Text>
                    <Text style={{ textTransform: 'capitalize' }}>
                      {table.shape}
                    </Text>
                    {table.server && (
                      <>
                        <Text>•</Text>
                        <Text>Server: {table.server}</Text>
                      </>
                    )}
                  </Box>

                  {/* Capacity Bar */}
                  <Box
                    style={{
                      marginBottom: tokens.spacing[3],
                    }}
                  >
                    <Box
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                        }}
                      >
                        Capacity
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[700],
                        }}
                      >
                        {table.assignedGuests.length}/{table.capacity}
                      </Text>
                    </Box>
                    <Box
                      style={{
                        height: tokens.spacing[2],
                        backgroundColor: tokens.colors.neutral[200],
                        borderRadius: tokens.borderRadius.full,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        style={{
                          height: '100%',
                          width: `${capacityPercent}%`,
                          backgroundColor: getStatusColor(table.status),
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Assigned Guests Avatars */}
                  <Box
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: tokens.spacing[2],
                      minHeight: '60px',
                    }}
                  >
                    {table.assignedGuests.map((guest) => (
                      <Box
                        key={guest.id}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.primaryScale[100],
                          border: guest.vip
                            ? `2px solid ${tokens.colors.warningScale[500]}`
                            : `2px solid ${tokens.colors.primaryScale[300]}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.primaryScale[700],
                          cursor: 'pointer',
                          position: 'relative',
                          ...createHoverStyle(tokens),
                        }}
                        title={guest.name}
                      >
                        {getInitials(guest.name)}
                      </Box>
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Unassigned Guests Panel */}
        <Box
          style={{
            width: '320px',
            ...createSurfaceStyle(tokens),
            borderRadius: tokens.borderRadius.lg,
            padding: tokens.spacing[4],
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[4],
            }}
          >
            Unassigned Guests ({unassignedGuests.length})
          </Text>

          {/* Search */}
          <Box
            style={{
              marginBottom: tokens.spacing[4],
            }}
          >
            <input
              type="text"
              placeholder="Search guests..."
              style={{
                width: '100%',
                padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                border: `1px solid ${tokens.colors.neutral[300]}`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[900],
                backgroundColor: tokens.colors.common.white,
              }}
            />
          </Box>

          {/* Guest List */}
          <Box
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[2],
            }}
          >
            {unassignedGuests.map((guest) => (
              <Box
                key={guest.id}
                style={{
                  ...createCardStyle(tokens),
                  padding: tokens.spacing[3],
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[3],
                  cursor: 'grab',
                  ...createHoverStyle(tokens),
                }}
              >
                <Box
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.neutral[100],
                    border: guest.vip
                      ? `2px solid ${tokens.colors.warningScale[500]}`
                      : `1px solid ${tokens.colors.neutral[300]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[700],
                    flexShrink: 0,
                  }}
                >
                  {getInitials(guest.name)}
                </Box>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[900],
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {guest.name}
                  </Text>
                  {guest.vip && (
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.warningScale[700],
                        fontWeight: tokens.typography.fontWeight.medium,
                      }}
                    >
                      VIP
                    </Text>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  },
});
