'use client';

import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createListItemStyle,
} from '../../../helpers';
import type { EvTableAssignmentProps, TableInfo } from '../../core';

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

export const ListEvTableAssignment = createPreset<EvTableAssignmentProps>({
  name: 'EvTableAssignment.List',
  render: (ctx: PresetContext<EvTableAssignmentProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const tables = props.tables || MOCK_TABLES;

    const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
    const totalAssigned = tables.reduce(
      (sum, t) => sum + t.assignedGuests.length,
      0
    );
    const totalUnassigned = (props.unassignedGuests?.length || 0);

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

    const getStatusBadgeStyle = (status: TableInfo['status']) => {
      const baseColor = getStatusColor(status);
      return {
        padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
        borderRadius: tokens.borderRadius.md,
        fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.medium,
        textTransform: 'capitalize' as const,
        backgroundColor:
          status === 'available'
            ? tokens.colors.successScale[100]
            : status === 'partial'
            ? tokens.colors.warningScale[100]
            : status === 'full'
            ? tokens.colors.errorScale[100]
            : tokens.colors.infoScale[100],
        color:
          status === 'available'
            ? tokens.colors.successScale[800]
            : status === 'partial'
            ? tokens.colors.warningScale[800]
            : status === 'full'
            ? tokens.colors.errorScale[800]
            : tokens.colors.infoScale[800],
      };
    };

    return (
      <Box
        style={{
          ...createSurfaceStyle(tokens),
          height: '100%',
          padding: tokens.spacing[6],
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <Box
          style={{
            marginBottom: tokens.spacing[6],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[4],
            }}
          >
            Table Assignments
          </Text>

          {/* Summary Stats */}
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: tokens.spacing[4],
              marginBottom: tokens.spacing[6],
            }}
          >
            <Box
              style={{
                ...createCardStyle(tokens),
                padding: tokens.spacing[4],
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                  marginBottom: tokens.spacing[1],
                }}
              >
                Total Tables
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                }}
              >
                {tables.length}
              </Text>
            </Box>

            <Box
              style={{
                ...createCardStyle(tokens),
                padding: tokens.spacing[4],
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                  marginBottom: tokens.spacing[1],
                }}
              >
                Total Capacity
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                }}
              >
                {totalCapacity}
              </Text>
            </Box>

            <Box
              style={{
                ...createCardStyle(tokens),
                padding: tokens.spacing[4],
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                  marginBottom: tokens.spacing[1],
                }}
              >
                Assigned Guests
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.successScale[600],
                }}
              >
                {totalAssigned}
              </Text>
            </Box>

            <Box
              style={{
                ...createCardStyle(tokens),
                padding: tokens.spacing[4],
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                  marginBottom: tokens.spacing[1],
                }}
              >
                Unassigned Guests
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.warningScale[600],
                }}
              >
                {totalUnassigned}
              </Text>
            </Box>
          </Box>

          {/* Filters */}
          <Box
            style={{
              display: 'flex',
              gap: tokens.spacing[3],
              flexWrap: 'wrap',
            }}
          >
            <input
              type="text"
              placeholder="Search by guest name..."
              style={{
                flex: 1,
                minWidth: '200px',
                padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                border: `1px solid ${tokens.colors.neutral[300]}`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[900],
                backgroundColor: tokens.colors.common.white,
              }}
            />
            <select
              style={{
                padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                border: `1px solid ${tokens.colors.neutral[300]}`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[900],
                backgroundColor: tokens.colors.common.white,
              }}
            >
              <option value="">All Zones</option>
              <option value="main">Main Hall</option>
              <option value="balcony">Balcony</option>
              <option value="vip">VIP Section</option>
              <option value="patio">Patio</option>
            </select>
            <select
              style={{
                padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                border: `1px solid ${tokens.colors.neutral[300]}`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[900],
                backgroundColor: tokens.colors.common.white,
              }}
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="partial">Partial</option>
              <option value="full">Full</option>
              <option value="reserved">Reserved</option>
            </select>
          </Box>
        </Box>

        {/* Table */}
        <Box
          style={{
            ...createCardStyle(tokens),
            overflow: 'hidden',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: tokens.colors.neutral[50],
                  borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
                }}
              >
                <th
                  style={{
                    padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
                    textAlign: 'left',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[700],
                  }}
                >
                  Table
                </th>
                <th
                  style={{
                    padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
                    textAlign: 'left',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[700],
                  }}
                >
                  Zone
                </th>
                <th
                  style={{
                    padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
                    textAlign: 'left',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[700],
                  }}
                >
                  Capacity
                </th>
                <th
                  style={{
                    padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
                    textAlign: 'left',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[700],
                  }}
                >
                  Assigned
                </th>
                <th
                  style={{
                    padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
                    textAlign: 'left',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[700],
                  }}
                >
                  Server
                </th>
                <th
                  style={{
                    padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
                    textAlign: 'left',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[700],
                  }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table) => {
                const capacityPercent = Math.round(
                  (table.assignedGuests.length / table.capacity) * 100
                );

                return (
                  <tr
                    key={table.id}
                    style={{
                      borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        tokens.colors.neutral[50];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td
                      style={{
                        padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        {table.label}
                      </Text>
                    </td>
                    <td
                      style={{
                        padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[700],
                        }}
                      >
                        {table.zone}
                      </Text>
                    </td>
                    <td
                      style={{
                        padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
                      }}
                    >
                      <Box style={{ minWidth: '120px' }}>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[600],
                            marginBottom: tokens.spacing[1],
                          }}
                        >
                          {table.assignedGuests.length} / {table.capacity}
                        </Text>
                        <Box
                          style={{
                            height: tokens.spacing[1],
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
                    </td>
                    <td
                      style={{
                        padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[700],
                        }}
                      >
                        {table.assignedGuests.length > 0
                          ? table.assignedGuests
                              .slice(0, 2)
                              .map((g) => g.name.split(' ')[0])
                              .join(', ') +
                            (table.assignedGuests.length > 2
                              ? ` +${table.assignedGuests.length - 2}`
                              : '')
                          : '—'}
                      </Text>
                    </td>
                    <td
                      style={{
                        padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[700],
                        }}
                      >
                        {table.server || '—'}
                      </Text>
                    </td>
                    <td
                      style={{
                        padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
                      }}
                    >
                      <Box style={getStatusBadgeStyle(table.status)}>
                        {table.status}
                      </Box>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      </Box>
    );
  },
});
