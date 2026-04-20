'use client';

import { useMemo } from 'react';
import {
  Box,
  Flex,
  Stack,
  Text,
  Badge,
  CalendarHeatMap,
} from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VenueZone {
  id: string;
  name: string;
  capacity: number;
  current: number;
  status: 'open' | 'full' | 'closed';
  color: string;
  gridArea: string;
}

// ---------------------------------------------------------------------------
// Zone data
// ---------------------------------------------------------------------------

const VENUE_ZONES: VenueZone[] = [
  {
    id: 'main-floor',
    name: 'Main Floor',
    capacity: 1500,
    current: 1120,
    status: 'open',
    color: 'var(--ds-color-primary)',
    gridArea: '1 / 1 / 3 / 3',
  },
  {
    id: 'vip-area',
    name: 'VIP Area',
    capacity: 200,
    current: 185,
    status: 'open',
    color: 'var(--ds-color-warning)',
    gridArea: '1 / 3 / 2 / 4',
  },
  {
    id: 'bar',
    name: 'Bar',
    capacity: 120,
    current: 120,
    status: 'full',
    color: 'var(--ds-color-error)',
    gridArea: '2 / 3 / 3 / 4',
  },
  {
    id: 'entrance',
    name: 'Entrance',
    capacity: 80,
    current: 32,
    status: 'open',
    color: 'var(--ds-color-success)',
    gridArea: '3 / 1 / 4 / 4',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function occupancyPercent(zone: VenueZone): number {
  return Math.round((zone.current / zone.capacity) * 100);
}

function statusVariant(status: VenueZone['status']): 'success' | 'error' | 'warning' {
  switch (status) {
    case 'open':
      return 'success';
    case 'full':
      return 'error';
    case 'closed':
      return 'warning';
  }
}

// ---------------------------------------------------------------------------
// Generate heatmap data for the current month
// ---------------------------------------------------------------------------

function generateMonthEvents(): { date: string; value: number }[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startDate = new Date(year, month - 2, 1);
  const endDate = new Date(year, month + 1, 0);
  const data: { date: string; value: number }[] = [];

  for (
    let d = new Date(startDate);
    d <= endDate;
    d.setDate(d.getDate() + 1)
  ) {
    const day = d.getDay();
    // Weekends have more events
    const isWeekend = day === 0 || day === 5 || day === 6;
    const base = isWeekend ? 3 : 1;
    const value = Math.floor(Math.random() * 4) + base;
    const iso = d.toISOString().split('T')[0];
    // Skip some weekdays for realism
    if (!isWeekend && Math.random() < 0.3) continue;
    data.push({ date: iso, value });
  }
  return data;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VenueLayoutDemo() {
  const tokens = useTokens();

  const heatmapData = useMemo(() => generateMonthEvents(), []);
  const heatmapStart = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 2);
    d.setDate(1);
    return d.toISOString().split('T')[0];
  }, []);

  return (
    <Stack spacing="lg">
      {/* Header */}
      <Flex align="center" justify="between">
        <Box>
          <Text as={"h2" as any} size="xl" weight="bold">
            Venue Zone Overview
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Real-time occupancy by zone -- Club Neon, 2340 capacity
          </Text>
        </Box>
        <Badge variant="primary">4 zones</Badge>
      </Flex>

      {/* Venue grid layout */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gridTemplateRows: '160px 160px 100px',
          gap: tokens.spacing[3],
        }}
      >
        {VENUE_ZONES.map((zone) => {
          const pct = occupancyPercent(zone);
          return (
            <Box
              key={zone.id}
              style={{
                gridArea: zone.gridArea,
                borderRadius: tokens.borderRadius.lg,
                border: `2px solid ${zone.color}`,
                background: 'var(--ds-color-bg-secondary)',
                padding: tokens.spacing[4],
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Occupancy fill bar (background) */}
              <Box
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${pct}%`,
                  background: zone.color,
                  opacity: 0.08,
                  transition: 'height 400ms ease',
                }}
              />

              {/* Zone content */}
              <Flex align="center" justify="between" style={{ position: 'relative', zIndex: 1 }}>
                <Text size="lg" weight="semibold">
                  {zone.name}
                </Text>
                <Badge variant={statusVariant(zone.status)}>
                  {zone.status}
                </Badge>
              </Flex>

              <Box style={{ position: 'relative', zIndex: 1 }}>
                <Flex align="center" gap={8}>
                  <Text size="2xl" weight="bold">
                    {zone.current.toLocaleString()}
                  </Text>
                  <Text
                    size="sm"
                    style={{ color: 'var(--ds-color-text-muted)' }}
                  >
                    / {zone.capacity.toLocaleString()}
                  </Text>
                </Flex>

                {/* Occupancy bar */}
                <Box
                  style={{
                    marginTop: tokens.spacing[2],
                    height: 6,
                    borderRadius: 3,
                    background: 'var(--ds-color-neutral-200)',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      borderRadius: 3,
                      background: zone.color,
                      transition: 'width 400ms ease',
                    }}
                  />
                </Box>

                <Flex align="center" justify="between" style={{ marginTop: tokens.spacing[1] }}>
                  <Text
                    size="xs"
                    style={{ color: 'var(--ds-color-text-muted)' }}
                  >
                    {pct}% occupied
                  </Text>
                  <Text
                    size="xs"
                    style={{ color: 'var(--ds-color-text-muted)' }}
                  >
                    {zone.capacity - zone.current} spots left
                  </Text>
                </Flex>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Calendar heatmap -- event schedule */}
      <Box>
        <Stack spacing="sm">
          <Text as={"h3" as any} size="lg" weight="semibold">
            Event Schedule
          </Text>
          <Text
            size="sm"
            style={{ color: 'var(--ds-color-text-secondary)' }}
          >
            Events per day -- last 3 months
          </Text>
          <Box
            style={{
              background: 'var(--ds-color-bg-secondary)',
              borderRadius: tokens.borderRadius.lg,
              padding: tokens.spacing[4],
              border: '1px solid var(--ds-color-border)',
            }}
          >
            <CalendarHeatMap
              data={heatmapData}
              startDate={heatmapStart}
              height={160}
              title="Event Schedule"
              colorRange={[
                'var(--ds-color-neutral-200)',
                'var(--ds-color-primary)',
              ]}
            />
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
