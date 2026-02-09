'use client';

import { createPreset, type PresetContext } from '../../../factory';
import {
  createSurfaceStyle,
  createCardStyle,
  createBadgeStyle,
  createHoverStyle,
} from '../../../helpers';
import type { EvTableOrderProps, TableOrder, TableOrderItem } from '../../core';

const MOCK_DATA: TableOrder[] = [
  {
    id: 'order-1',
    tableId: 'table-3',
    tableLabel: 'Table 3',
    server: 'Alex Johnson',
    items: [
      {
        id: 'item-1',
        name: 'Caesar Salad',
        quantity: 2,
        price: 12.99,
        status: 'served',
        orderedAt: new Date(Date.now() - 45 * 60000),
        servedAt: new Date(Date.now() - 30 * 60000),
      },
      {
        id: 'item-2',
        name: 'Grilled Salmon',
        quantity: 1,
        price: 28.99,
        status: 'ready',
        orderedAt: new Date(Date.now() - 25 * 60000),
      },
      {
        id: 'item-3',
        name: 'Ribeye Steak',
        quantity: 1,
        price: 42.99,
        status: 'preparing',
        orderedAt: new Date(Date.now() - 25 * 60000),
      },
    ],
    total: 97.96,
    openedAt: new Date(Date.now() - 45 * 60000),
    status: 'open',
    guestCount: 3,
  },
  {
    id: 'order-2',
    tableId: 'table-7',
    tableLabel: 'Table 7',
    server: 'Maria Garcia',
    items: [
      {
        id: 'item-4',
        name: 'Margherita Pizza',
        quantity: 2,
        price: 16.99,
        status: 'preparing',
        orderedAt: new Date(Date.now() - 15 * 60000),
      },
      {
        id: 'item-5',
        name: 'Tiramisu',
        quantity: 1,
        price: 8.99,
        status: 'ordered',
        orderedAt: new Date(Date.now() - 5 * 60000),
      },
    ],
    total: 42.97,
    openedAt: new Date(Date.now() - 20 * 60000),
    status: 'open',
    guestCount: 4,
  },
  {
    id: 'order-3',
    tableId: 'table-12',
    tableLabel: 'Table 12',
    server: 'James Chen',
    items: [
      {
        id: 'item-6',
        name: 'Tom Yum Soup',
        quantity: 2,
        price: 9.99,
        status: 'served',
        orderedAt: new Date(Date.now() - 35 * 60000),
        servedAt: new Date(Date.now() - 20 * 60000),
      },
      {
        id: 'item-7',
        name: 'Pad Thai',
        quantity: 2,
        price: 14.99,
        status: 'ready',
        orderedAt: new Date(Date.now() - 18 * 60000),
      },
    ],
    total: 49.96,
    openedAt: new Date(Date.now() - 35 * 60000),
    status: 'open',
    guestCount: 2,
  },
  {
    id: 'order-4',
    tableId: 'table-5',
    tableLabel: 'Table 5',
    server: 'Sarah Williams',
    items: [
      {
        id: 'item-8',
        name: 'Chicken Wings',
        quantity: 1,
        price: 11.99,
        status: 'ordered',
        orderedAt: new Date(Date.now() - 8 * 60000),
      },
      {
        id: 'item-9',
        name: 'French Fries',
        quantity: 2,
        price: 5.99,
        status: 'ordered',
        orderedAt: new Date(Date.now() - 8 * 60000),
      },
    ],
    total: 23.97,
    openedAt: new Date(Date.now() - 10 * 60000),
    status: 'open',
    guestCount: 2,
  },
];

export const GridEvTableOrder = createPreset<EvTableOrderProps>({
  name: 'EvTableOrder.Grid',
  render: (ctx: PresetContext<EvTableOrderProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const orders = props.orders || MOCK_DATA;
    const onOrderClick = props.onOrderClick;

    const openOrders = orders.filter((order) => order.status === 'open');

    const sortBy = 'newest' as 'newest' | 'longest-wait' | 'highest-total';

    const sortedOrders = [...openOrders].sort((a, b) => {
      switch (sortBy as string) {
        case 'newest':
          return b.openedAt.getTime() - a.openedAt.getTime();
        case 'longest-wait': {
          const aOldest = Math.min(...a.items.map((i) => i.orderedAt.getTime()));
          const bOldest = Math.min(...b.items.map((i) => i.orderedAt.getTime()));
          return aOldest - bOldest;
        }
        case 'highest-total':
          return b.total - a.total;
        default:
          return 0;
      }
    });

    const totalRevenue = openOrders.reduce((sum, order) => sum + order.total, 0);
    const totalItems = openOrders.reduce((sum, order) => sum + order.items.length, 0);
    const avgWaitTime =
      totalItems > 0
        ? openOrders.reduce((sum, order) => {
            const orderWait = order.items.reduce((itemSum, item) => {
              return itemSum + (Date.now() - item.orderedAt.getTime());
            }, 0);
            return sum + orderWait / order.items.length;
          }, 0) / openOrders.length
        : 0;

    const formatWaitTime = (ms: number) => {
      const minutes = Math.floor(ms / 60000);
      if (minutes < 1) return '< 1m';
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      return `${hours}h ${minutes % 60}m`;
    };

    const getLongestWaitTime = (order: TableOrder) => {
      const oldest = Math.min(...order.items.map((i) => i.orderedAt.getTime()));
      return Date.now() - oldest;
    };

    const getStatusColor = (status: TableOrderItem['status']) => {
      switch (status) {
        case 'ordered':
          return tokens.colors.infoScale;
        case 'preparing':
          return tokens.colors.warningScale;
        case 'ready':
          return tokens.colors.successScale;
        case 'served':
          return tokens.colors.primaryScale;
        case 'cancelled':
          return tokens.colors.errorScale;
        default:
          return tokens.colors.neutral;
      }
    };

    const renderOrderCard = (order: TableOrder) => {
      const cardStyle = createCardStyle(tokens);
      const hoverStyle = createHoverStyle(tokens);
      const longestWait = getLongestWaitTime(order);
      const pendingItems = order.items.filter(
        (item) => item.status !== 'served' && item.status !== 'cancelled'
      );

      return (
        <Box
          key={order.id}
          style={{
            ...cardStyle,
            ...hoverStyle,
            cursor: onOrderClick ? 'pointer' : 'default',
            padding: tokens.spacing[4],
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[3],
          }}
          onClick={() => onOrderClick?.(order.id)}
        >
          <Box
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[1],
                }}
              >
                {order.tableLabel}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                }}
              >
                {order.server}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                }}
              >
                {order.guestCount} {order.guestCount === 1 ? 'guest' : 'guests'}
              </Text>
            </Box>
            <Box
              style={{
                textAlign: 'right',
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.primaryScale[600],
                }}
              >
                ${order.total.toFixed(2)}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}
              >
                Wait: {formatWaitTime(longestWait)}
              </Text>
            </Box>
          </Box>

          <Box
            style={{
              borderTop: `1px solid ${tokens.colors.neutral[200]}`,
              paddingTop: tokens.spacing[3],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[700],
                marginBottom: tokens.spacing[2],
              }}
            >
              Order Items
            </Text>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
              {order.items.map((item) => {
                const colorScale = getStatusColor(item.status);
                const itemStatusKey = (() => {
                  switch (item.status) {
                    case 'ordered': return 'info' as const;
                    case 'preparing': return 'warning' as const;
                    case 'ready': return 'success' as const;
                    case 'served': return 'primary' as const;
                    case 'cancelled': return 'error' as const;
                    default: return 'secondary' as const;
                  }
                })();
                const badgeStyle = createBadgeStyle(tokens, itemStatusKey);
                const isPending = item.status !== 'served' && item.status !== 'cancelled';

                return (
                  <Box
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: tokens.spacing[2],
                      backgroundColor: isPending
                        ? tokens.colors.warningScale[50]
                        : 'transparent',
                      borderRadius: tokens.borderRadius.md,
                    }}
                  >
                    <Box style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        {item.name} ×{item.quantity}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                        }}
                      >
                        ${item.price.toFixed(2)} each
                      </Text>
                    </Box>
                    <Box style={badgeStyle}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: badgeStyle.color,
                          textTransform: 'capitalize',
                        }}
                      >
                        {item.status}
                      </Text>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {pendingItems.length > 0 && (
            <Box
              style={{
                padding: tokens.spacing[2],
                backgroundColor: tokens.colors.infoScale[50],
                borderRadius: tokens.borderRadius.md,
                borderLeft: `3px solid ${tokens.colors.infoScale[500]}`,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.infoScale[700],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                {pendingItems.length} {pendingItems.length === 1 ? 'item' : 'items'} pending
              </Text>
            </Box>
          )}
        </Box>
      );
    };

    const summaryCardStyle = createSurfaceStyle(tokens);

    return (
      <Box
        style={{
          padding: tokens.spacing[6],
          backgroundColor: tokens.colors.neutral[50],
          minHeight: '100%',
        }}
      >
        <Text
          style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            marginBottom: tokens.spacing[6],
          }}
        >
          Active Orders
        </Text>

        <Box
          style={{
            ...summaryCardStyle,
            padding: tokens.spacing[4],
            marginBottom: tokens.spacing[6],
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            gap: tokens.spacing[4],
          }}
        >
          <Box style={{ textAlign: 'center' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['3xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.primaryScale[600],
              }}
            >
              {openOrders.length}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
              }}
            >
              Open Orders
            </Text>
          </Box>
          <Box
            style={{
              width: '1px',
              height: '40px',
              backgroundColor: tokens.colors.neutral[200],
            }}
          />
          <Box style={{ textAlign: 'center' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['3xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.successScale[600],
              }}
            >
              ${totalRevenue.toFixed(2)}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
              }}
            >
              Total Revenue
            </Text>
          </Box>
          <Box
            style={{
              width: '1px',
              height: '40px',
              backgroundColor: tokens.colors.neutral[200],
            }}
          />
          <Box style={{ textAlign: 'center' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['3xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.warningScale[600],
              }}
            >
              {formatWaitTime(avgWaitTime)}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
              }}
            >
              Avg Wait Time
            </Text>
          </Box>
        </Box>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: tokens.spacing[4],
          }}
        >
          {sortedOrders.map((order) => renderOrderCard(order))}
        </Box>

        {openOrders.length === 0 && (
          <Box
            style={{
              ...summaryCardStyle,
              padding: tokens.spacing[8],
              textAlign: 'center',
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                color: tokens.colors.neutral[500],
              }}
            >
              No active orders
            </Text>
          </Box>
        )}
      </Box>
    );
  },
});
