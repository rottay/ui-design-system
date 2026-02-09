'use client';

import { createPreset, type PresetContext } from '../../../factory';
import {
  createSurfaceStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createStatusDotStyle,
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
  {
    id: 'order-5',
    tableId: 'table-8',
    tableLabel: 'Table 8',
    server: 'Alex Johnson',
    items: [
      {
        id: 'item-10',
        name: 'Beef Burger',
        quantity: 3,
        price: 15.99,
        status: 'served',
        orderedAt: new Date(Date.now() - 90 * 60000),
        servedAt: new Date(Date.now() - 70 * 60000),
      },
      {
        id: 'item-11',
        name: 'Chocolate Cake',
        quantity: 2,
        price: 7.99,
        status: 'served',
        orderedAt: new Date(Date.now() - 75 * 60000),
        servedAt: new Date(Date.now() - 60 * 60000),
      },
    ],
    total: 63.95,
    openedAt: new Date(Date.now() - 90 * 60000),
    closedAt: new Date(Date.now() - 55 * 60000),
    status: 'closed',
    guestCount: 3,
  },
  {
    id: 'order-6',
    tableId: 'table-15',
    tableLabel: 'Table 15',
    server: 'Maria Garcia',
    items: [
      {
        id: 'item-12',
        name: 'Sushi Platter',
        quantity: 1,
        price: 34.99,
        status: 'served',
        orderedAt: new Date(Date.now() - 120 * 60000),
        servedAt: new Date(Date.now() - 95 * 60000),
      },
    ],
    total: 34.99,
    openedAt: new Date(Date.now() - 120 * 60000),
    closedAt: new Date(Date.now() - 90 * 60000),
    status: 'closed',
    guestCount: 2,
  },
];

export const TimelineEvTableOrder = createPreset<EvTableOrderProps>({
  name: 'EvTableOrder.Timeline',
  render: (ctx: PresetContext<EvTableOrderProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const orders = props.orders || MOCK_DATA;
    const selectedFilter = 'all';

    const filteredOrders =
      selectedFilter === 'all'
        ? orders
        : orders.filter((order) => order.status === selectedFilter);

    const activeOrders = filteredOrders.filter((order) => order.status === 'open');
    const completedOrders = filteredOrders.filter((order) => order.status === 'closed');

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

    const formatTime = (date: Date) => {
      const now = Date.now();
      const diff = now - date.getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      return `${hours}h ${minutes % 60}m ago`;
    };

    const renderTimelineNode = (item: TableOrderItem) => {
      const colorScale = getStatusColor(item.status);
      const dotStyle = createStatusDotStyle(tokens, colorScale[500]);
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

      return (
        <Box
          key={item.id}
          style={{
            display: 'flex',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
            position: 'relative',
          }}
        >
          <Box
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box style={dotStyle} />
            <Box
              style={{
                width: '2px',
                height: '100%',
                backgroundColor: tokens.colors.neutral[200],
                marginTop: tokens.spacing[1],
              }}
            />
          </Box>
          <Box style={{ flex: 1 }}>
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
                  {formatTime(item.orderedAt)}
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
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[700],
              }}
            >
              ${item.price.toFixed(2)}
            </Text>
          </Box>
        </Box>
      );
    };

    const renderTableColumn = (order: TableOrder) => {
      const surfaceStyle = createSurfaceStyle(tokens);

      return (
        <Box
          key={order.id}
          style={{
            ...surfaceStyle,
            minWidth: '280px',
            maxWidth: '320px',
            padding: tokens.spacing[4],
          }}
        >
          <Box style={{ marginBottom: tokens.spacing[4] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
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
              Server: {order.server}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
              }}
            >
              Guests: {order.guestCount}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
              }}
            >
              Opened {formatTime(order.openedAt)}
            </Text>
          </Box>
          <Box>{order.items.map((item) => renderTimelineNode(item))}</Box>
          <Box
            style={{
              marginTop: tokens.spacing[4],
              paddingTop: tokens.spacing[3],
              borderTop: `1px solid ${tokens.colors.neutral[200]}`,
            }}
          >
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[700],
                }}
              >
                Total
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                }}
              >
                ${order.total.toFixed(2)}
              </Text>
            </Box>
          </Box>
        </Box>
      );
    };

    const filterOptions = [
      { value: 'all', label: 'All Orders' },
      { value: 'open', label: 'Open' },
      { value: 'closed', label: 'Closed' },
    ];

    return (
      <Box
        style={{
          padding: tokens.spacing[6],
          backgroundColor: tokens.colors.neutral[50],
          minHeight: '100%',
        }}
      >
        <Box style={{ marginBottom: tokens.spacing[6] }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[3],
            }}
          >
            Order Timeline
          </Text>
          <Box style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
            {filterOptions.map((option) => {
              const isSelected = selectedFilter === option.value;
              const pillStyle = createFilterPillStyle(tokens, { active: isSelected });
              return (
                <Box key={option.value} style={pillStyle}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: pillStyle.color,
                    }}
                  >
                    {option.label}
                  </Text>
                </Box>
              );
            })}
          </Box>
        </Box>

        {activeOrders.length > 0 && (
          <Box style={{ marginBottom: tokens.spacing[6] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                marginBottom: tokens.spacing[4],
              }}
            >
              Active Orders
            </Text>
            <Box
              style={{
                display: 'flex',
                gap: tokens.spacing[4],
                overflowX: 'auto',
                paddingBottom: tokens.spacing[3],
              }}
            >
              {activeOrders.map((order) => renderTableColumn(order))}
            </Box>
          </Box>
        )}

        {completedOrders.length > 0 && (
          <Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                marginBottom: tokens.spacing[4],
              }}
            >
              Completed Orders
            </Text>
            <Box
              style={{
                display: 'flex',
                gap: tokens.spacing[4],
                overflowX: 'auto',
                paddingBottom: tokens.spacing[3],
              }}
            >
              {completedOrders.map((order) => renderTableColumn(order))}
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
