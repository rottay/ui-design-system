'use client';

import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createProgressBarStyle,
  createStatusDotStyle,
} from '../../../helpers';
import type { EvKitchenDisplayProps, KitchenOrder, AllDayItem } from '../../core';

// Mock data for standalone demo with multi-course orders
const MOCK_ORDERS: KitchenOrder[] = [
  {
    id: 'ord-1',
    orderNumber: '201',
    tableLabel: 'VIP 1',
    priority: 'vip',
    course: 1,
    orderedAt: new Date(Date.now() - 1000 * 60 * 15),
    server: 'Sophie',
    status: 'in-progress',
    items: [
      { id: 'item-1', name: 'Oysters Rockefeller', quantity: 1, status: 'plated' },
      { id: 'item-2', name: 'Beef Carpaccio', quantity: 1, status: 'plated' },
    ],
  },
  {
    id: 'ord-2',
    orderNumber: '201',
    tableLabel: 'VIP 1',
    priority: 'vip',
    course: 2,
    orderedAt: new Date(Date.now() - 1000 * 60 * 15),
    server: 'Sophie',
    status: 'new',
    items: [
      { id: 'item-3', name: 'Lobster Bisque', quantity: 1, status: 'pending' },
      { id: 'item-4', name: 'French Onion Soup', quantity: 1, status: 'pending' },
    ],
  },
  {
    id: 'ord-3',
    orderNumber: '201',
    tableLabel: 'VIP 1',
    priority: 'vip',
    course: 3,
    orderedAt: new Date(Date.now() - 1000 * 60 * 15),
    server: 'Sophie',
    status: 'new',
    items: [
      { id: 'item-5', name: 'Wagyu Ribeye', quantity: 1, modifiers: ['Medium Rare'], status: 'pending' },
      { id: 'item-6', name: 'Chilean Sea Bass', quantity: 1, status: 'pending' },
    ],
  },
  {
    id: 'ord-4',
    orderNumber: '202',
    tableLabel: 'Table 12',
    priority: 'normal',
    course: 1,
    orderedAt: new Date(Date.now() - 1000 * 60 * 8),
    server: 'Marcus',
    status: 'in-progress',
    items: [
      { id: 'item-7', name: 'Caesar Salad', quantity: 2, status: 'cooking' },
      { id: 'item-8', name: 'Bruschetta', quantity: 1, status: 'plated' },
    ],
  },
  {
    id: 'ord-5',
    orderNumber: '202',
    tableLabel: 'Table 12',
    priority: 'normal',
    course: 2,
    orderedAt: new Date(Date.now() - 1000 * 60 * 8),
    server: 'Marcus',
    status: 'new',
    items: [
      { id: 'item-9', name: 'Chicken Piccata', quantity: 2, status: 'pending' },
    ],
  },
  {
    id: 'ord-6',
    orderNumber: '203',
    tableLabel: 'VIP 2',
    priority: 'vip',
    course: 1,
    orderedAt: new Date(Date.now() - 1000 * 60 * 5),
    server: 'Elena',
    status: 'in-progress',
    items: [
      { id: 'item-10', name: 'Tuna Tartare', quantity: 1, status: 'cooking' },
      { id: 'item-11', name: 'Foie Gras', quantity: 1, status: 'cooking' },
    ],
  },
  {
    id: 'ord-7',
    orderNumber: '203',
    tableLabel: 'VIP 2',
    priority: 'vip',
    course: 2,
    orderedAt: new Date(Date.now() - 1000 * 60 * 5),
    server: 'Elena',
    status: 'new',
    items: [
      { id: 'item-12', name: 'Filet Mignon', quantity: 1, status: 'pending' },
      { id: 'item-13', name: 'Lobster Tail', quantity: 1, status: 'pending' },
    ],
  },
];

const MOCK_ALL_DAY: AllDayItem[] = [
  { name: 'Wagyu Ribeye', totalOrdered: 24, completed: 18, pending: 6 },
  { name: 'Chilean Sea Bass', totalOrdered: 16, completed: 12, pending: 4 },
  { name: 'Lobster Bisque', totalOrdered: 32, completed: 28, pending: 4 },
  { name: 'Caesar Salad', totalOrdered: 45, completed: 38, pending: 7 },
  { name: 'Filet Mignon', totalOrdered: 19, completed: 14, pending: 5 },
  { name: 'Chicken Piccata', totalOrdered: 28, completed: 24, pending: 4 },
  { name: 'Oysters Rockefeller', totalOrdered: 12, completed: 10, pending: 2 },
  { name: 'Tuna Tartare', totalOrdered: 15, completed: 13, pending: 2 },
];

export const ExpoEvKitchenDisplay = createPreset<EvKitchenDisplayProps>({
  name: 'EvKitchenDisplay.Expo',
  render: (ctx: PresetContext<EvKitchenDisplayProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const orders = props.orders || MOCK_ORDERS;
    const allDayItems = props.allDayItems || MOCK_ALL_DAY;

    // Group orders by order number and course
    const groupedOrders = orders.reduce(
      (acc, order) => {
        const key = order.orderNumber;
        if (!acc[key]) {
          acc[key] = {
            orderNumber: order.orderNumber,
            tableLabel: order.tableLabel,
            server: order.server,
            priority: order.priority,
            courses: [],
          };
        }
        acc[key].courses.push(order);
        return acc;
      },
      {} as Record<
        string,
        {
          orderNumber: string;
          tableLabel: string;
          server: string;
          priority: KitchenOrder['priority'];
          courses: KitchenOrder[];
        }
      >
    );

    const orderGroups = Object.values(groupedOrders).sort((a, b) => {
      // VIP first, then by order number
      if (a.priority === 'vip' && b.priority !== 'vip') return -1;
      if (a.priority !== 'vip' && b.priority === 'vip') return 1;
      return parseInt(a.orderNumber) - parseInt(b.orderNumber);
    });

    const getCourseProgress = (course: KitchenOrder) => {
      const total = course.items.length;
      const ready = course.items.filter((item) => item.status === 'plated').length;
      return { ready, total, percentage: (ready / total) * 100 };
    };

    const getPriorityColor = (priority: KitchenOrder['priority']) => {
      switch (priority) {
        case 'rush':
          return tokens.colors.warningScale;
        case 'vip':
          return tokens.colors.primaryScale;
        default:
          return tokens.colors.neutral;
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

    return (
      <Box
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: tokens.colors.neutral[900],
          color: tokens.colors.neutral[50],
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Main Content - Course Orders */}
        <Box
          style={{
            flex: 1,
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
              Expo Station
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[400],
                marginTop: tokens.spacing[1],
              }}
            >
              Multi-Course Coordinator
            </Text>
          </Box>

          {/* Orders by Course */}
          <Box
            style={{
              flex: 1,
              padding: tokens.spacing[4],
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[4],
            }}
          >
            {orderGroups.map((orderGroup) => {
              const hasPriority = orderGroup.priority !== 'normal';
              const priorityColor = getPriorityColor(orderGroup.priority);

              return (
                <Box
                  key={orderGroup.orderNumber}
                  style={{
                    ...createCardStyle(tokens),
                    border: hasPriority
                      ? `3px solid ${priorityColor[500]}`
                      : `1px solid ${tokens.colors.neutral[700]}`,
                    overflow: 'hidden',
                  }}
                >
                  {/* Order Header */}
                  <Box
                    style={{
                      padding: tokens.spacing[3],
                      backgroundColor: tokens.colors.neutral[700],
                      borderBottom: `1px solid ${tokens.colors.neutral[700]}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xl,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.neutral[50],
                        }}
                      >
                        Order #{orderGroup.orderNumber}
                      </Text>
                      {hasPriority && (
                        <Box
                          style={{
                            padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                            backgroundColor: priorityColor[100],
                            color: priorityColor[800],
                            borderRadius: tokens.borderRadius.sm,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.bold,
                            textTransform: 'uppercase',
                          }}
                        >
                          {orderGroup.priority}
                        </Box>
                      )}
                    </Box>
                    <Box
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[400],
                      }}
                    >
                      <Text>
                        {orderGroup.tableLabel} • Server: {orderGroup.server}
                      </Text>
                    </Box>
                  </Box>

                  {/* Courses */}
                  <Box
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {orderGroup.courses
                      .sort((a, b) => (a.course || 0) - (b.course || 0))
                      .map((course) => {
                        const progress = getCourseProgress(course);
                        const isReady = progress.ready === progress.total;

                        return (
                          <Box
                            key={course.id}
                            style={{
                              padding: tokens.spacing[3],
                              borderBottom: `1px solid ${tokens.colors.neutral[700]}`,
                              backgroundColor: isReady
                                ? `${tokens.colors.successScale[900]}40`
                                : 'transparent',
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
                              <Box
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: tokens.spacing[2],
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: tokens.typography.fontSize.sm,
                                    fontWeight: tokens.typography.fontWeight.semibold,
                                    color: tokens.colors.neutral[200],
                                  }}
                                >
                                  Course {course.course}
                                </Text>
                                {isReady && (
                                  <Box
                                    style={{
                                      ...createStatusDotStyle(tokens, tokens.colors.successScale[500]),
                                    }}
                                  />
                                )}
                              </Box>
                              <Text
                                style={{
                                  fontSize: tokens.typography.fontSize.sm,
                                  color: isReady
                                    ? tokens.colors.successScale[400]
                                    : tokens.colors.neutral[400],
                                  fontWeight: tokens.typography.fontWeight.medium,
                                }}
                              >
                                {progress.ready} / {progress.total} Ready
                              </Text>
                            </Box>

                            {/* Progress Bar */}
                            <Box style={{ marginBottom: tokens.spacing[3] }}>
                              {(() => {
                                const progressStyles = createProgressBarStyle(
                                  tokens,
                                  { percent: progress.percentage, color: isReady ? tokens.colors.successScale[500] : tokens.colors.primaryScale[500] }
                                );
                                return (
                                  <Box style={progressStyles.track}>
                                    <Box style={progressStyles.fill} />
                                  </Box>
                                );
                              })()}
                            </Box>

                            {/* Items */}
                            <Box
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: tokens.spacing[2],
                              }}
                            >
                              {course.items.map((item) => (
                                <Box
                                  key={item.id}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: tokens.spacing[2],
                                    backgroundColor: tokens.colors.neutral[800],
                                    borderRadius: tokens.borderRadius.sm,
                                    borderLeft: `3px solid ${getItemStatusColor(item.status)}`,
                                  }}
                                >
                                  <Box style={{ flex: 1 }}>
                                    <Text
                                      style={{
                                        fontSize: tokens.typography.fontSize.sm,
                                        fontWeight: tokens.typography.fontWeight.medium,
                                        color: tokens.colors.neutral[100],
                                      }}
                                    >
                                      {item.quantity > 1 && `${item.quantity}x `}
                                      {item.name}
                                    </Text>
                                    {item.modifiers && item.modifiers.length > 0 && (
                                      <Text
                                        style={{
                                          fontSize: tokens.typography.fontSize.xs,
                                          color: tokens.colors.warningScale[400],
                                          marginTop: tokens.spacing[1],
                                        }}
                                      >
                                        {item.modifiers.join(', ')}
                                      </Text>
                                    )}
                                  </Box>
                                  <Box
                                    style={{
                                      padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                                      backgroundColor:
                                        item.status === 'plated'
                                          ? tokens.colors.successScale[900]
                                          : item.status === 'cooking'
                                            ? tokens.colors.warningScale[900]
                                            : tokens.colors.neutral[800],
                                      color:
                                        item.status === 'plated'
                                          ? tokens.colors.successScale[200]
                                          : item.status === 'cooking'
                                            ? tokens.colors.warningScale[200]
                                            : tokens.colors.neutral[400],
                                      borderRadius: tokens.borderRadius.sm,
                                      fontSize: tokens.typography.fontSize.xs,
                                      fontWeight: tokens.typography.fontWeight.medium,
                                      textTransform: 'uppercase',
                                    }}
                                  >
                                    {item.status}
                                  </Box>
                                </Box>
                              ))}
                            </Box>

                            {/* Fire Button for Ready Courses */}
                            {isReady && course.course === 1 && (
                              <Box
                                onClick={() => props.onBump?.(course.id)}
                                style={{
                                  marginTop: tokens.spacing[3],
                                  padding: tokens.spacing[3],
                                  backgroundColor: tokens.colors.successScale[600],
                                  color: tokens.colors.common.white,
                                  textAlign: 'center',
                                  borderRadius: tokens.borderRadius.md,
                                  fontSize: tokens.typography.fontSize.sm,
                                  fontWeight: tokens.typography.fontWeight.bold,
                                  cursor: 'pointer',
                                  ...createHoverStyle(tokens),
                                }}
                              >
                                SEND COURSE
                              </Box>
                            )}
                            {isReady && (course.course || 0) > 1 && (
                              <Box
                                onClick={() => props.onBump?.(course.id)}
                                style={{
                                  marginTop: tokens.spacing[3],
                                  padding: tokens.spacing[3],
                                  backgroundColor: tokens.colors.primaryScale[600],
                                  color: tokens.colors.common.white,
                                  textAlign: 'center',
                                  borderRadius: tokens.borderRadius.md,
                                  fontSize: tokens.typography.fontSize.sm,
                                  fontWeight: tokens.typography.fontWeight.bold,
                                  cursor: 'pointer',
                                  ...createHoverStyle(tokens),
                                }}
                              >
                                FIRE NEXT COURSE
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* All Day Summary Sidebar */}
        <Box
          style={{
            width: '320px',
            borderLeft: `1px solid ${tokens.colors.neutral[700]}`,
            backgroundColor: tokens.colors.neutral[800],
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            style={{
              padding: tokens.spacing[4],
              borderBottom: `1px solid ${tokens.colors.neutral[700]}`,
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[50],
              }}
            >
              All Day Summary
            </Text>
          </Box>
          <Box
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: tokens.spacing[3],
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[2],
            }}
          >
            {allDayItems.map((item, idx) => (
              <Box
                key={idx}
                style={{
                  padding: tokens.spacing[2],
                  backgroundColor: tokens.colors.neutral[800],
                  borderRadius: tokens.borderRadius.sm,
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[100],
                    marginBottom: tokens.spacing[1],
                  }}
                >
                  {item.name}
                </Text>
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[400],
                  }}
                >
                  <Text>Total: {item.totalOrdered}</Text>
                  <Text style={{ color: tokens.colors.successScale[400] }}>
                    Done: {item.completed}
                  </Text>
                  <Text style={{ color: tokens.colors.warningScale[400] }}>
                    Pending: {item.pending}
                  </Text>
                </Box>
                <Box style={{ marginTop: tokens.spacing[1] }}>
                  {(() => {
                    const progressStyles = createProgressBarStyle(
                      tokens,
                      { percent: (item.completed / item.totalOrdered) * 100, color: tokens.colors.successScale[500] }
                    );
                    return (
                      <Box style={{ ...progressStyles.track, height: '4px' }}>
                        <Box style={progressStyles.fill} />
                      </Box>
                    );
                  })()}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  },
});
