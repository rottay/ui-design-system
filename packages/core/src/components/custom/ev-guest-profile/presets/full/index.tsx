'use client';

import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createListItemStyle,
} from '../../../helpers';
import type { GuestProfileProps } from '../../core';

// Mock data for standalone demo
const MOCK_PROFILE = {
  id: 'guest-001',
  name: 'Alexandra Chen',
  email: 'alexandra.chen@email.com',
  avatar: 'https://i.pravatar.cc/150?img=5',
  eventsAttended: 24,
  totalSpend: 12450,
  loyaltyTier: 'platinum' as const,
  preferences: [
    { category: 'food' as const, value: 'Vegetarian' },
    { category: 'food' as const, value: 'Gluten-free' },
    { category: 'music' as const, value: 'Electronic' },
    { category: 'music' as const, value: 'House' },
    { category: 'seating' as const, value: 'VIP Section' },
    { category: 'seating' as const, value: 'Dance Floor Access' },
  ],
  tags: ['High-Value', 'Influencer', 'Early Adopter', 'Feedback Champion'],
};

const MOCK_EVENT_HISTORY = [
  { id: 'evt-1', name: 'Summer Rooftop Series', date: '2025-08-15', amount: 850 },
  { id: 'evt-2', name: 'Underground Warehouse Night', date: '2025-07-22', amount: 420 },
  { id: 'evt-3', name: 'Jazz & Wine Evening', date: '2025-07-10', amount: 680 },
  { id: 'evt-4', name: 'Techno Marathon', date: '2025-06-28', amount: 1200 },
  { id: 'evt-5', name: 'Sunset Beach Party', date: '2025-06-14', amount: 550 },
  { id: 'evt-6', name: 'Art Gallery Opening', date: '2025-05-30', amount: 320 },
  { id: 'evt-7', name: 'EDM Festival', date: '2025-05-18', amount: 1800 },
  { id: 'evt-8', name: 'Acoustic Sessions', date: '2025-05-02', amount: 280 },
];

export const GuestProfileFull = createPreset<GuestProfileProps>({
  name: 'GuestProfile.Full',
  render: (ctx: PresetContext<GuestProfileProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const profiles = props.profiles || [MOCK_PROFILE];
    const profile = profiles[0] || MOCK_PROFILE;
    const eventHistory = MOCK_EVENT_HISTORY;

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

    const tierScale = getTierColor(profile.loyaltyTier);
    const cardStyle = createCardStyle(tokens);
    const badgeStyle = createBadgeStyle(tokens, getTierBadgeColor(profile.loyaltyTier));
    const listItemStyle = createListItemStyle(tokens);

    const initials = profile.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();

    return (
      <Box style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header Section */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[4],
            paddingBottom: tokens.spacing[4],
            borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
          }}
        >
          {/* Avatar */}
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              style={{
                width: '96px',
                height: '96px',
                borderRadius: tokens.borderRadius.full,
                objectFit: 'cover',
                border: `3px solid ${tierScale[500]}`,
              }}
            />
          ) : (
            <Box
              style={{
                width: '96px',
                height: '96px',
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tierScale[100],
                color: tierScale[700],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                border: `3px solid ${tierScale[500]}`,
              }}
            >
              {initials}
            </Box>
          )}

          {/* Name and Contact */}
          <Box style={{ flex: 1 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                }}
              >
                {profile.name}
              </Text>
              <Box
                style={{
                  ...badgeStyle,
                  textTransform: 'uppercase',
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.bold,
                }}
              >
                {profile.loyaltyTier}
              </Box>
            </Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.md,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}
            >
              {profile.email}
            </Text>
          </Box>
        </Box>

        {/* Stats Row */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[4]} 0`,
            borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
          }}
        >
          <Box style={{ textAlign: 'center' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['3xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {profile.eventsAttended}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}
            >
              Events Attended
            </Text>
          </Box>
          <Box style={{ textAlign: 'center' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['3xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              ${profile.totalSpend.toLocaleString()}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}
            >
              Total Spend
            </Text>
          </Box>
          <Box style={{ textAlign: 'center' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['3xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {Math.floor(profile.totalSpend / 10)}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}
            >
              Loyalty Points
            </Text>
          </Box>
        </Box>

        {/* Preferences Section */}
        <Box style={{ marginTop: tokens.spacing[4] }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[3],
            }}
          >
            Preferences
          </Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
            {['food', 'music', 'seating'].map((category) => {
              const prefs = profile.preferences.filter((p) => p.category === category);
              if (prefs.length === 0) return null;
              return (
                <Box key={category}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[500],
                      textTransform: 'capitalize',
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    {category}
                  </Text>
                  <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
                    {prefs.map((pref, idx: number) => (
                      <Box
                        key={idx}
                        style={{
                          padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                          backgroundColor: tokens.colors.primaryScale[50],
                          color: tokens.colors.primaryScale[700],
                          borderRadius: tokens.borderRadius.md,
                          fontSize: tokens.typography.fontSize.sm,
                          border: `1px solid ${tokens.colors.primaryScale[200]}`,
                        }}
                      >
                        {pref.value}
                      </Box>
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Tags Section */}
        <Box style={{ marginTop: tokens.spacing[4] }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[3],
            }}
          >
            Tags
          </Text>
          <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
            {profile.tags.map((tag: string, idx: number) => (
              <Box
                key={idx}
                style={{
                  padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                  backgroundColor: tokens.colors.secondaryScale[100],
                  color: tokens.colors.secondaryScale[800],
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  border: `1px solid ${tokens.colors.secondaryScale[200]}`,
                }}
              >
                {tag}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Event History */}
        <Box style={{ marginTop: tokens.spacing[4] }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[3],
            }}
          >
            Event History
          </Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
            {eventHistory.map((event) => (
              <Box
                key={event.id}
                style={{
                  ...listItemStyle,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    {event.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[500],
                      marginTop: tokens.spacing[1],
                    }}
                  >
                    {new Date(event.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </Box>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.successScale[600],
                  }}
                >
                  ${event.amount}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  },
});
