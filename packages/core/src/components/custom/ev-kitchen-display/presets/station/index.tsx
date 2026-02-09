'use client';

import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createStatusDotStyle,
} from '../../../helpers';
import type { EvKitchenDisplayProps, KitchenOrder } from '../../core';

// Mock data for standalone demo
const MOCK_ORDERS: KitchenOrder[] = [
  {
    id: 'ord-1',
    orderNumber: '142',
    tableLabel: 'Table 15',
    priority: 'rush',
    orderedAt: new Date(Date.now() - 1000 * 60 * 11),
    server: 'Maria',
    status: 'in-progress',
    items: [
      {
        id: 'item-1',
        name: 'Wagyu Steak',
        quantity: 1,
        modifiers: ['Medium Rare', 'Extra Sauce'],
        station: 'Grill',
        status: 'cooking',
      },
      {
        id: 'item-2',
        name: 'Truffle Fries',
        quantity: 2,
        station: 'Fry',
        status: 'plated',
      },
    ],
  },
  {
    id: 'ord-2',
    orderNumber: '143',
    tableLabel: 'VIP 3',
    priority: 'vip',
    orderedAt: new Date(Date.now() - 1000 * 60 * 4),
    server: 'James',
    status: 'new',
    items: [
      {
        id: 'item-3',
        name: 'Lobster Thermidor',
        quantity: 2,
        modifiers: ['No Butter'],
        station: 'Seafood',
        status: 'pending',
      },
      {
        id: 'item-4',
        name: 'Caesar Salad',
        quantity: 2,
        modifiers: ['Extra Anchovies', 'Dressing on side'],
        station: 'Cold',
        status: 'pending',
      },
    ],
  },
  {
    id: 'ord-3',
    orderNumber: '144',
    tableLabel: 'Table 8',
    priority: 'normal',
    orderedAt: new Date(Date.now() - 1000 * 60 * 6),
    server: 'Lisa',
    status: 'in-progress',
    items: [
      {
        id: 'item-5',
        name: 'Margherita Pizza',
        quantity: 1,
        station: 'Pizza',
        status: 'cooking',
      },
      {
        id: 'item-6',
        name: 'Caprese Salad',
        quantity: 1,
        station: 'Cold',
        status: 'plated',
      },
    ],
  },
  {
    id: 'ord-4',
    orderNumber: '145',
    tableLabel: 'Table 22',
    priority: 'normal',
    orderedAt: new Date(Date.now() - 1000 * 60 * 2),
    server: 'Carlos',
    status: 'new',
    items: [
      {
        id: 'item-7',
        name: 'Chicken Parmesan',
        quantity: 2,
        station: 'Grill',
        status: 'pending',
      },
      {
        id: 'item-8',
        name: 'Garlic Bread',
        quantity: 3,
        station: 'Appetizer',
        status: 'pending',
      },
    ],
  },
  {
    id: 'ord-5',
    orderNumber: '146',
    tableLabel: 'Bar 2',
    priority: 'normal',
    orderedAt: new Date(Date.now() - 1000 * 60 * 8),
    server: 'Anna',
    status: 'in-progress',
    items: [
      {
        id: 'item-9',
        name: 'Fish & Chips',
        quantity: 1,
        modifiers: ['Extra Tartar Sauce'],
        station: 'Fry',
        status: 'cooking',
      },
    ],
  },
  {
    id: 'ord-6',
    orderNumber: '147',
    tableLabel: 'Table 11',
    priority: 'rush',
    orderedAt: new Date(Date.now() - 1000 * 60 * 13),
    server: 'Mike',
    status: 'in-progress',
    items: [
      {
        id: 'item-10',
        name: 'Ribeye Steak',
        quantity: 1,
        modifiers: ['Rare', 'No Vegetables'],
        station: 'Grill',
        status: 'cooking',
      },
      {
        id: 'item-11',
        name: 'Loaded Potato',
        quantity: 1,
        station: 'Grill',
        status: 'plated',
      },
    ],
  },
];

export const StationEvKitchenDisplay = createPreset<EvKitchenDisplayProps>({
  name: 'EvKitchenDisplay.Station',
  render: (ctx: PresetContext<EvKitchenDisplayProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const orders = props.orders || MOCK_ORDERS;

    const getElapsedMinutes = (orderedAt: Date): number => {
      const now = Date.now();
      const elapsed = now - orderedAt.getTime();
      return Math.floor(elapsed / 60000);
    };

    const getTimerColor = (minutes: number) => {
      if (minutes < 5) return tokens.colors.successScale[500];
      if (minutes < 10) return tokens.colors.warningScale[500];
      return tokens.colors.errorScale[500];
    };

    const getTimerBgColor = (minutes: number) => {
      if (minutes < 5) return tokens.colors.successScale[50];
      if (minutes < 10) return tokens.colors.warningScale[50];
      return tokens.colors.errorScale[50];
    };

    const getPriorityColor = (priority: KitchenOrder['priority']) => {
      switch (priority) {
        case 'rush':
          return tokens.colors.warningScale;
        case 'vip':
          return tokens.colors.primaryScale;
        default:
          return null;
      }
    };

    const getItemStatusColor = (status: string) => {
      switch (status) {
        case 'pending':
          return tokens.colors.neutral[400];
        case 'cooking':
          return tokens.colors.warningScale[500];
        case 'plated':
          return tokens.colors.successScale[500];
        default:
          return tokens.colors.neutral[400];
      }
    };

    const formatTimer = (minutes: number): string => {
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    };

    return (
      <Box
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: tokens.colors.neutral[900],
          color: tokens.colors.neutral[50],
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          style={{
            padding: tokens.spacing[4],
            borderBottom: `1px solid ${tokens.colors.neutral[700]}`,
            backgroundColor: tokens.colors.neutral[800],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[50],
            }}
          >
            Kitchen Display System
          </Text>
          <Box
            style={{
              display: 'flex',
              gap: tokens.spacing[4],
              marginTop: tokens.spacing[3],
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Box
                style={{
                  ...createStatusDotStyle(tokens, tokens.colors.warningScale[500]),
                }}
              />
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[400],
                }}
              >
                {orders.filter((o) => o.priority === 'rush').length} Rush Orders
              </Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Box
                style={{
                  ...createStatusDotStyle(tokens, tokens.colors.primaryScale[500]),
                }}
              />
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[400],
                }}
              >
                {orders.filter((o) => o.priority === 'vip').length} VIP Orders
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Order Grid */}
        <Box
          style={{
            flex: 1,
            padding: tokens.spacing[4],
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: tokens.spacing[4],
            alignContent: 'start',
          }}
        >
          {orders.map((order) => {
            const elapsedMinutes = getElapsedMinutes(order.orderedAt);
            const timerColor = getTimerColor(elapsedMinutes);
            const timerBgColor = getTimerBgColor(elapsedMinutes);
            const priorityColor = getPriorityColor(order.priority);
            const hasPriority = order.priority !== 'normal';

            return (
              <Box
                key={order.id}
                style={{
                  ...createCardStyle(tokens),
                  border: hasPriority
                    ? `3px solid ${priorityColor?.[500]}`
                    : `1px solid ${tokens.colors.neutral[700]}`,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* Order Header */}
                <Box
                  style={{
                    padding: tokens.spacing[3],
                    backgroundColor: tokens.colors.neutral[700],
                    borderBottom: `1px solid ${tokens.colors.neutral[700]}`,
                  }}
                >
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: tokens.spacing[2],
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize['2xl'],
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.neutral[50],
                        }}
                      >
                        #{order.orderNumber}
                      </Text>
                      {hasPriority && (
                        <Box
                          style={{
                            padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                            backgroundColor: priorityColor?.[100],
                            color: priorityColor?.[800],
                            borderRadius: tokens.borderRadius.sm,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.bold,
                            textTransform: 'uppercase',
                          }}
                        >
                          {order.priority}
                        </Box>
                      )}
                    </Box>
                    {/* Timer */}
                    <Box
                      style={{
                        padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                        backgroundColor: timerBgColor,
                        borderRadius: tokens.borderRadius.md,
                        border: `2px solid ${timerColor}`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xl,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: timerColor,
                          fontFamily: 'monospace',
                        }}
                      >
                        {formatTimer(elapsedMinutes)}
                      </Text>
                    </Box>
                  </Box>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[400],
                    }}
                  >
                    <Text>
                      <Text
                        style={{
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[300],
                        }}
                      >
                        {order.tableLabel}
                      </Text>
                    </Text>
                    <Text>Server: {order.server}</Text>
                  </Box>
                </Box>

                {/* Items List */}
                <Box
                  style={{
                    flex: 1,
                    padding: tokens.spacing[3],
                    display: 'flex',
                    flexDirection: 'column',
                    gap: tokens.spacing[3],
                  }}
                >
                  {order.items.map((item) => (
                    <Box
                      key={item.id}
                      style={{
                        padding: tokens.spacing[2],
                        backgroundColor: tokens.colors.neutral[800],
                        borderRadius: tokens.borderRadius.md,
                        borderLeft: `3px solid ${getItemStatusColor(item.status)}`,
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
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[100],
                          }}
                        >
                          {item.quantity > 1 && `${item.quantity}x `}
                          {item.name}
                        </Text>
                        <Box
                          style={{
                            ...createStatusDotStyle(
                              tokens,
                              item.status === 'plated'
                                ? tokens.colors.successScale[500]
                                : item.status === 'cooking'
                                  ? tokens.colors.warningScale[500]
                                  : tokens.colors.neutral[400]
                            ),
                          }}
                        />
                      </Box>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <Box
                          style={{
                            marginTop: tokens.spacing[1],
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: tokens.spacing[1],
                          }}
                        >
                          {item.modifiers.map((mod, idx) => (
                            <Box
                              key={idx}
                              style={{
                                padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                                backgroundColor: tokens.colors.warningScale[900],
                                color: tokens.colors.warningScale[200],
                                borderRadius: tokens.borderRadius.sm,
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.medium,
                              }}
                            >
                              {mod}
                            </Box>
                          ))}
                        </Box>
                      )}
                      {item.station && (
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                            marginTop: tokens.spacing[1],
                          }}
                        >
                          Station: {item.station}
                        </Text>
                      )}
                    </Box>
                  ))}
                </Box>

                {/* Bump Button */}
                <Box
                  onClick={() => props.onBump?.(order.id)}
                  style={{
                    padding: tokens.spacing[4],
                    backgroundColor: tokens.colors.successScale[600],
                    color: tokens.colors.common.white,
                    textAlign: 'center',
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    cursor: 'pointer',
                    borderTop: `1px solid ${tokens.colors.neutral[700]}`,
                    ...createHoverStyle(tokens),
                  }}
                >
                  BUMP ORDER
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
