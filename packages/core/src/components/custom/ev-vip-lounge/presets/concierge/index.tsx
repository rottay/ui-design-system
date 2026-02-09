'use client';

import React, { useState } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createListItemStyle,
  createFilterPillStyle,
} from '../../../helpers';
import type { VipLoungeProps, ConciergeRequest } from '../../core';

// Mock data for standalone demo
const MOCK_REQUESTS = [
  {
    id: 'req-001',
    guestId: 'vip-001',
    guestName: 'Samantha Blake',
    type: 'limo' as const,
    description: 'Airport pickup for group of 4, arriving at 6 PM',
    priority: 'high' as const,
    status: 'in-progress' as const,
  },
  {
    id: 'req-002',
    guestId: 'vip-004',
    guestName: 'Antonio Rodriguez',
    type: 'meet-artist' as const,
    description: 'Meet & greet with DJ after midnight set',
    priority: 'urgent' as const,
    status: 'pending' as const,
  },
  {
    id: 'req-003',
    guestId: 'vip-003',
    guestName: 'Diana Zhang',
    type: 'photographer' as const,
    description: 'Professional photographer for birthday celebration',
    priority: 'normal' as const,
    status: 'pending' as const,
  },
  {
    id: 'req-004',
    guestId: 'vip-002',
    guestName: 'Richard Castellano',
    type: 'custom' as const,
    description: 'Champagne tower setup at table, 50 glasses',
    priority: 'high' as const,
    status: 'in-progress' as const,
  },
  {
    id: 'req-005',
    guestId: 'vip-005',
    guestName: 'Victoria Chen',
    type: 'limo' as const,
    description: 'Return trip to hotel after event',
    priority: 'normal' as const,
    status: 'pending' as const,
  },
  {
    id: 'req-006',
    guestId: 'vip-008',
    guestName: 'Alexander Wright',
    type: 'custom' as const,
    description: 'Custom cocktail menu for private party of 8',
    priority: 'urgent' as const,
    status: 'pending' as const,
  },
];

export const VipLoungeConcierge = createPreset<VipLoungeProps>({
  name: 'VipLounge.Concierge',
  render: (ctx: PresetContext<VipLoungeProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const requests = props.requests || MOCK_REQUESTS;
    const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'limo':
          return '🚗';
        case 'meet-artist':
          return '🎤';
        case 'photographer':
          return '📸';
        case 'custom':
          return '⭐';
        default:
          return '📋';
      }
    };

    const getPriorityScale = (priority: string) => {
      switch (priority) {
        case 'urgent':
          return tokens.colors.errorScale;
        case 'high':
          return tokens.colors.warningScale;
        default:
          return tokens.colors.infoScale;
      }
    };

    const getPriorityBadgeColor = (priority: string): 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary' => {
      switch (priority) {
        case 'urgent':
          return 'error';
        case 'high':
          return 'warning';
        default:
          return 'info';
      }
    };

    const getStatusScale = (status: string) => {
      switch (status) {
        case 'pending':
          return tokens.colors.warningScale;
        case 'in-progress':
          return tokens.colors.infoScale;
        case 'completed':
          return tokens.colors.successScale;
        default:
          return tokens.colors.secondaryScale;
      }
    };

    const getStatusBadgeColor = (status: string): 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary' => {
      switch (status) {
        case 'pending':
          return 'warning';
        case 'in-progress':
          return 'info';
        case 'completed':
          return 'success';
        default:
          return 'secondary';
      }
    };

    const filteredRequests = requests
      .filter((req) => {
        const matchesPriority = !priorityFilter || req.priority === priorityFilter;
        const matchesStatus = !statusFilter || req.status === statusFilter;
        return matchesPriority && matchesStatus;
      })
      .sort((a: ConciergeRequest, b: ConciergeRequest) => {
        const priorityOrder: Record<string, number> = { urgent: 0, high: 1, normal: 2 };
        return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      });

    const activeRequests = requests.filter(
      (r) => r.status === 'pending' || r.status === 'in-progress'
    ).length;

    const cardStyle = createCardStyle(tokens);
    const listItemStyle = createListItemStyle(tokens);
    const filterPillStyle = createFilterPillStyle(tokens, { active: false });

    return (
      <Box style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Stats */}
        <Box
          style={{
            ...cardStyle,
            marginBottom: tokens.spacing[6],
            textAlign: 'center',
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize['4xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.primaryScale[600],
            }}
          >
            {activeRequests}
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              color: tokens.colors.neutral[500],
              marginTop: tokens.spacing[1],
            }}
          >
            Active Requests
          </Text>
        </Box>

        {/* Filters */}
        <Box
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
          }}
        >
          {/* Priority Filter */}
          <Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Priority
            </Text>
            <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
              <button
                onClick={() => setPriorityFilter(null)}
                style={{
                  ...filterPillStyle,
                  backgroundColor: !priorityFilter
                    ? tokens.colors.primaryScale[100]
                    : tokens.colors.neutral[100],
                  color: !priorityFilter
                    ? tokens.colors.primaryScale[700]
                    : tokens.colors.neutral[500],
                  border: `1px solid ${
                    !priorityFilter ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]
                  }`,
                  cursor: 'pointer',
                }}
              >
                All
              </button>
              {['urgent', 'high', 'normal'].map((priority) => {
                const isActive = priorityFilter === priority;
                const priorityScale = getPriorityScale(priority);
                return (
                  <button
                    key={priority}
                    onClick={() => setPriorityFilter(priority)}
                    style={{
                      ...filterPillStyle,
                      backgroundColor: isActive
                        ? priorityScale[100]
                        : tokens.colors.neutral[100],
                      color: isActive ? priorityScale[700] : tokens.colors.neutral[500],
                      border: `1px solid ${isActive ? priorityScale[300] : tokens.colors.neutral[200]}`,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {priority}
                  </button>
                );
              })}
            </Box>
          </Box>

          {/* Status Filter */}
          <Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Status
            </Text>
            <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
              <button
                onClick={() => setStatusFilter(null)}
                style={{
                  ...filterPillStyle,
                  backgroundColor: !statusFilter
                    ? tokens.colors.primaryScale[100]
                    : tokens.colors.neutral[100],
                  color: !statusFilter
                    ? tokens.colors.primaryScale[700]
                    : tokens.colors.neutral[500],
                  border: `1px solid ${
                    !statusFilter ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]
                  }`,
                  cursor: 'pointer',
                }}
              >
                All
              </button>
              {['pending', 'in-progress', 'completed'].map((status) => {
                const isActive = statusFilter === status;
                const statusScale = getStatusScale(status);
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    style={{
                      ...filterPillStyle,
                      backgroundColor: isActive
                        ? statusScale[100]
                        : tokens.colors.neutral[100],
                      color: isActive ? statusScale[700] : tokens.colors.neutral[500],
                      border: `1px solid ${isActive ? statusScale[300] : tokens.colors.neutral[200]}`,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {status.replace('-', ' ')}
                  </button>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* Results Count */}
        <Text
          style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            marginBottom: tokens.spacing[3],
          }}
        >
          Showing {filteredRequests.length} of {requests.length} requests
        </Text>

        {/* Request List */}
        <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
          {filteredRequests.map((request) => {
            const priorityBadge = createBadgeStyle(tokens, getPriorityBadgeColor(request.priority));
            const statusBadge = createBadgeStyle(tokens, getStatusBadgeColor(request.status));

            return (
              <Box
                key={request.id}
                style={{
                  ...listItemStyle,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[3],
                }}
              >
                {/* Header */}
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: tokens.spacing[3],
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                    <Box
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.primaryScale[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: tokens.typography.fontSize['2xl'],
                      }}
                    >
                      {getTypeIcon(request.type)}
                    </Box>
                    <Box>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.lg,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        {request.guestName}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[500],
                          marginTop: tokens.spacing[1],
                          textTransform: 'capitalize',
                        }}
                      >
                        {request.type.replace('-', ' ')}
                      </Text>
                    </Box>
                  </Box>

                  <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                    <Box
                      style={{
                        ...priorityBadge,
                        fontSize: tokens.typography.fontSize.xs,
                        textTransform: 'uppercase',
                      }}
                    >
                      {request.priority}
                    </Box>
                    <Box
                      style={{
                        ...statusBadge,
                        fontSize: tokens.typography.fontSize.xs,
                        textTransform: 'capitalize',
                      }}
                    >
                      {request.status.replace('-', ' ')}
                    </Box>
                  </Box>
                </Box>

                {/* Description */}
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.md,
                    color: tokens.colors.neutral[900],
                    lineHeight: 1.5,
                  }}
                >
                  {request.description}
                </Text>

                {/* Actions */}
                {request.status !== 'completed' && (
                  <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
                    {request.status === 'pending' && (
                      <button
                        style={{
                          padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                          backgroundColor: tokens.colors.primaryScale[600],
                          color: tokens.colors.common.white,
                          border: 'none',
                          borderRadius: tokens.borderRadius.md,
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          cursor: 'pointer',
                        }}
                      >
                        Start Request
                      </button>
                    )}
                    {request.status === 'in-progress' && (
                      <button
                        style={{
                          padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                          backgroundColor: tokens.colors.successScale[600],
                          color: tokens.colors.common.white,
                          border: 'none',
                          borderRadius: tokens.borderRadius.md,
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          cursor: 'pointer',
                        }}
                      >
                        Complete
                      </button>
                    )}
                    <button
                      style={{
                        padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                        backgroundColor: tokens.colors.neutral[100],
                        color: tokens.colors.neutral[900],
                        border: `1px solid ${tokens.colors.neutral[200]}`,
                        borderRadius: tokens.borderRadius.md,
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        cursor: 'pointer',
                      }}
                    >
                      Contact Guest
                    </button>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
