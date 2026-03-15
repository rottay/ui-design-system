'use client';

import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createHoverStyle,
  createFilterPillStyle,
} from '../../../helpers';
import type { GuestProfileProps } from '../../core';
import { useState } from 'react';

// Mock data for standalone demo
const MOCK_GUESTS = [
  {
    id: 'guest-001',
    name: 'Alexandra Chen',
    email: 'alexandra.chen@email.com',
    avatar: 'https://i.pravatar.cc/150?img=5',
    eventsAttended: 24,
    totalSpend: 12450,
    loyaltyTier: 'platinum' as const,
    preferences: [],
    tags: [],
  },
  {
    id: 'guest-002',
    name: 'Marcus Johnson',
    email: 'marcus.j@email.com',
    eventsAttended: 18,
    totalSpend: 8900,
    loyaltyTier: 'gold' as const,
    preferences: [],
    tags: [],
  },
  {
    id: 'guest-003',
    name: 'Sophia Rodriguez',
    email: 'sophia.r@email.com',
    avatar: 'https://i.pravatar.cc/150?img=9',
    eventsAttended: 12,
    totalSpend: 5600,
    loyaltyTier: 'gold' as const,
    preferences: [],
    tags: [],
  },
  {
    id: 'guest-004',
    name: 'David Kim',
    email: 'david.kim@email.com',
    eventsAttended: 8,
    totalSpend: 3200,
    loyaltyTier: 'silver' as const,
    preferences: [],
    tags: [],
  },
  {
    id: 'guest-005',
    name: 'Emily Thompson',
    email: 'emily.t@email.com',
    avatar: 'https://i.pravatar.cc/150?img=10',
    eventsAttended: 15,
    totalSpend: 7800,
    loyaltyTier: 'gold' as const,
    preferences: [],
    tags: [],
  },
  {
    id: 'guest-006',
    name: 'James Wilson',
    email: 'james.w@email.com',
    eventsAttended: 5,
    totalSpend: 1800,
    loyaltyTier: 'silver' as const,
    preferences: [],
    tags: [],
  },
  {
    id: 'guest-007',
    name: 'Olivia Martinez',
    email: 'olivia.m@email.com',
    avatar: 'https://i.pravatar.cc/150?img=44',
    eventsAttended: 3,
    totalSpend: 920,
    loyaltyTier: 'bronze' as const,
    preferences: [],
    tags: [],
  },
  {
    id: 'guest-008',
    name: 'Noah Anderson',
    email: 'noah.a@email.com',
    eventsAttended: 28,
    totalSpend: 15200,
    loyaltyTier: 'platinum' as const,
    preferences: [],
    tags: [],
  },
];

export const GuestProfileCard = createPreset<GuestProfileProps>({
  name: 'GuestProfile.Card',
  render: (ctx: PresetContext<GuestProfileProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const guests = props.profiles || MOCK_GUESTS;
    const [searchQuery, setSearchQuery] = useState('');
    const [tierFilter, setTierFilter] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'spend' | 'events'>('spend');

    const getTierColor = (tier: string) => {
      switch (tier) {
        case 'platinum':
          return tokens.colors.primaryScale;
        case 'gold':
          return tokens.colors.warningScale;
        case 'silver':
          return tokens.colors.infoScale;
        default:
          return tokens.colors.secondaryScale;
      }
    };

    const getTierBadgeColor = (tier: string): 'primary' | 'warning' | 'info' | 'secondary' => {
      switch (tier) {
        case 'platinum':
          return 'primary';
        case 'gold':
          return 'warning';
        case 'silver':
          return 'info';
        default:
          return 'secondary';
      }
    };

    const filteredGuests = guests
      .filter((guest) => {
        const matchesSearch =
          guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          guest.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTier = !tierFilter || guest.loyaltyTier === tierFilter;
        return matchesSearch && matchesTier;
      })
      .sort((a, b) => {
        if (sortBy === 'spend') return b.totalSpend - a.totalSpend;
        return b.eventsAttended - a.eventsAttended;
      });

    const cardStyle = createCardStyle(tokens);
    const hoverStyle = createHoverStyle(tokens);
    const filterPillStyle = createFilterPillStyle(tokens, { active: false });

    const tiers = ['platinum', 'gold', 'silver', 'bronze'];

    return (
      <Box style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Search and Filters */}
        <Box
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
          }}
        >
          {/* Search Input */}
          <Box style={{ flex: '1 1 300px' }}>
            <input
              type="text"
              placeholder="Search guests..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: tokens.spacing[2],
                border: `1px solid ${tokens.colors.neutral[200]}`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.md,
                outline: 'none',
              }}
            />
          </Box>

          {/* Tier Filters */}
          <Box style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' }}>
            <button
              onClick={() => setTierFilter(null)}
              style={{
                ...filterPillStyle,
                backgroundColor: !tierFilter
                  ? tokens.colors.primaryScale[100]
                  : tokens.colors.neutral[100],
                color: !tierFilter
                  ? tokens.colors.primaryScale[700]
                  : tokens.colors.neutral[500],
                border: `1px solid ${
                  !tierFilter ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]
                }`,
                cursor: 'pointer',
              }}
            >
              All
            </button>
            {tiers.map((tier) => {
              const tierScale = getTierColor(tier);
              const isActive = tierFilter === tier;
              return (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  style={{
                    ...filterPillStyle,
                    backgroundColor: isActive ? tierScale[100] : tokens.colors.neutral[100],
                    color: isActive ? tierScale[700] : tokens.colors.neutral[500],
                    border: `1px solid ${isActive ? tierScale[300] : tokens.colors.neutral[200]}`,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {tier}
                </button>
              );
            })}
          </Box>

          {/* Sort Buttons */}
          <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
            <button
              onClick={() => setSortBy('spend')}
              style={{
                ...filterPillStyle,
                backgroundColor:
                  sortBy === 'spend'
                    ? tokens.colors.primaryScale[100]
                    : tokens.colors.neutral[100],
                color:
                  sortBy === 'spend'
                    ? tokens.colors.primaryScale[700]
                    : tokens.colors.neutral[500],
                border: `1px solid ${
                  sortBy === 'spend' ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]
                }`,
                cursor: 'pointer',
              }}
            >
              Sort by Spend
            </button>
            <button
              onClick={() => setSortBy('events')}
              style={{
                ...filterPillStyle,
                backgroundColor:
                  sortBy === 'events'
                    ? tokens.colors.primaryScale[100]
                    : tokens.colors.neutral[100],
                color:
                  sortBy === 'events'
                    ? tokens.colors.primaryScale[700]
                    : tokens.colors.neutral[500],
                border: `1px solid ${
                  sortBy === 'events' ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]
                }`,
                cursor: 'pointer',
              }}
            >
              Sort by Events
            </button>
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
          Showing {filteredGuests.length} of {guests.length} guests
        </Text>

        {/* Guest Cards Grid */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: tokens.spacing[3],
          }}
        >
          {filteredGuests.map((guest) => {
            const tierScale = getTierColor(guest.loyaltyTier);
            const badgeColorKey = getTierBadgeColor(guest.loyaltyTier);
            const badgeStyle = createBadgeStyle(tokens, badgeColorKey);
            const initials = guest.name
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase();

            return (
              <Box
                key={guest.id}
                style={{
                  ...cardStyle,
                  ...hoverStyle,
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                }}
              >
                {/* Avatar and Name */}
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[3],
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  {guest.avatar ? (
                    <img
                      src={guest.avatar}
                      alt={guest.name}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: tokens.borderRadius.full,
                        objectFit: 'cover',
                        border: `2px solid ${tierScale[500]}`,
                      }}
                    />
                  ) : (
                    <Box
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tierScale[100],
                        color: tierScale[700],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: tokens.typography.fontSize.lg,
                        fontWeight: tokens.typography.fontWeight.bold,
                        border: `2px solid ${tierScale[500]}`,
                      }}
                    >
                      {initials}
                    </Box>
                  )}

                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {guest.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[500],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: tokens.spacing[1],
                      }}
                    >
                      {guest.email}
                    </Text>
                  </Box>
                </Box>

                {/* Tier Badge */}
                <Box
                  style={{
                    ...badgeStyle,
                    textTransform: 'uppercase',
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.bold,
                    marginBottom: tokens.spacing[3],
                    width: 'fit-content',
                  }}
                >
                  {guest.loyaltyTier}
                </Box>

                {/* Stats */}
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: tokens.spacing[3],
                    paddingTop: tokens.spacing[3],
                    borderTop: `1px solid ${tokens.colors.neutral[200]}`,
                  }}
                >
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xl,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {guest.eventsAttended}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        marginTop: tokens.spacing[1],
                      }}
                    >
                      Events
                    </Text>
                  </Box>
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xl,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.successScale[600],
                      }}
                    >
                      ${guest.totalSpend.toLocaleString()}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        marginTop: tokens.spacing[1],
                      }}
                    >
                      Total Spend
                    </Text>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
