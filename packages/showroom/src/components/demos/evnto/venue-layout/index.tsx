'use client';

import { useShowroomRuntime } from '@/composition/components/showroom-context';
import {
  Badge,
  Box,
  CalendarHeatMap,
  Card,
  Flex,
  Stack,
  Text,
  useTokens,
} from '@rottay/design-system';

const SURFACE =
  'var(--ds-color-bg-container, var(--ds-color-bg-elevated, var(--ds-color-bg-primary, #ffffff)))';
const ELEVATED_SURFACE =
  'var(--ds-color-bg-elevated, var(--ds-color-bg-primary, #ffffff))';
const SUBTLE_SURFACE =
  'var(--ds-color-bg-secondary, var(--ds-color-bg-elevated, var(--ds-color-bg-primary, #ffffff)))';
const BORDER =
  'var(--ds-color-border-subtle, var(--ds-color-border, rgba(148, 163, 184, 0.28)))';
const TEXT_SECONDARY =
  'var(--ds-color-text-secondary, var(--ds-color-text-muted, #64748b))';
const TEXT_MUTED = 'var(--ds-color-text-muted, #64748b)';
const HERO_BACKGROUND = `linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary, #ffffff) 10%, ${ELEVATED_SURFACE}) 0%, ${SURFACE} 100%)`;
const CARD_SHADOW = 'var(--ds-shadow-lg, 0 20px 48px rgba(15, 23, 42, 0.1))';
const PANEL_SHADOW = 'var(--ds-shadow-md, 0 12px 28px rgba(15, 23, 42, 0.08))';
const PANEL_BACKGROUND = `linear-gradient(180deg, color-mix(in srgb, ${ELEVATED_SURFACE} 92%, ${SURFACE} 8%) 0%, ${SURFACE} 100%)`;

interface VenueZone {
  id: string;
  name: string;
  capacity: number;
  current: number;
  status: 'open' | 'watch' | 'full';
  color: string;
  gridArea: string;
}

const VENUE_ZONES: VenueZone[] = [
  {
    id: 'main-floor',
    name: 'Main floor',
    capacity: 1500,
    current: 1120,
    status: 'open',
    color: 'var(--ds-color-primary, #ffffff)',
    gridArea: '1 / 1 / 3 / 3',
  },
  {
    id: 'vip-lounge',
    name: 'VIP lounge',
    capacity: 200,
    current: 185,
    status: 'watch',
    color: 'var(--ds-color-warning, #ffffff)',
    gridArea: '1 / 3 / 2 / 4',
  },
  {
    id: 'bar-east',
    name: 'Bar east',
    capacity: 120,
    current: 120,
    status: 'full',
    color: 'var(--ds-color-error, #ffffff)',
    gridArea: '2 / 3 / 3 / 4',
  },
  {
    id: 'arrival-lane',
    name: 'Arrival lane',
    capacity: 80,
    current: 32,
    status: 'open',
    color: 'var(--ds-color-success, #ffffff)',
    gridArea: '3 / 1 / 4 / 4',
  },
];

const OPS_NOTES = [
  'VIP lounge staffing needs one more host before doors.',
  'Bar east is at hard capacity and should redirect overflow to west service.',
  'Arrival lane throughput is healthy and can absorb the next traffic wave.',
];

const HEATMAP_START = '2026-02-01';

function occupancyPercent(zone: VenueZone) {
  return Math.round((zone.current / zone.capacity) * 100);
}

function statusVariant(status: VenueZone['status']): 'success' | 'error' | 'warning' {
  switch (status) {
    case 'open':
      return 'success';
    case 'watch':
      return 'warning';
    case 'full':
      return 'error';
  }
}

function generateHeatmapData() {
  const start = new Date(`${HEATMAP_START}T12:00:00Z`);
  const data: { date: string; value: number }[] = [];

  for (let offset = 0; offset < 84; offset += 1) {
    const current = new Date(start);
    current.setUTCDate(start.getUTCDate() + offset);
    const day = current.getUTCDay();
    const weekend = day === 5 || day === 6 || day === 0;
    const pulse = weekend ? 3 : 1;
    const pattern = (offset * 7) % 5;
    const value = pulse + pattern;

    if (!weekend && pattern === 0) {
      continue;
    }

    data.push({
      date: current.toISOString().split('T')[0],
      value,
    });
  }

  return data;
}

export function VenueLayoutDemo() {
  const runtime = useShowroomRuntime();
  const tokens = useTokens();
  const heatmapData = generateHeatmapData();

  return (
    <Stack spacing="lg">
      <Card
        style={{
          padding: tokens.spacing[4],
          border: `1px solid ${BORDER}`,
          background: HERO_BACKGROUND,
          boxShadow: CARD_SHADOW,
        }}
      >
        <Stack spacing="md">
          <Flex align="start" justify="between" style={{ gap: 12, flexWrap: 'wrap' }}>
            <Box style={{ minWidth: 0, flex: '1 1 320px' }}>
              <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
                <Badge variant="primary">Venue control</Badge>
                <Badge variant="secondary">{runtime.tenantName}</Badge>
              </Flex>
              <Text as={"h2" as any} size="xl" weight="bold" style={{ marginTop: 12 }}>
                Club Neon spatial overview
              </Text>
              <Text size="sm" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
                Real-time occupancy, zone pressure, and event cadence rendered
                through the active DS runtime.
              </Text>
            </Box>

            <Box
              style={{
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.xl,
                background: PANEL_BACKGROUND,
                border: `1px solid ${BORDER}`,
                minWidth: 220,
                boxShadow: PANEL_SHADOW,
              }}
            >
              <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
                Venue readiness
              </Text>
              <Text size="lg" weight="bold" style={{ marginTop: 6 }}>
                92%
              </Text>
              <Text size="xs" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
                Only the VIP lounge staffing assignment remains unresolved.
              </Text>
            </Box>
          </Flex>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: tokens.spacing[3],
            }}
          >
            {[
              {
                label: 'Venue capacity',
                value: '2,340',
                detail: 'Across main floor, VIP, service, and arrival lanes.',
              },
              {
                label: 'Current occupancy',
                value: '1,457',
                detail: '62% of total venue headcount is already on-site.',
              },
              {
                label: 'Hot zones',
                value: '2 zones',
                detail: 'VIP and bar east need active monitoring during doors.',
              },
            ].map((item) => (
              <Box
                key={item.label}
                style={{
                  minWidth: 0,
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.lg,
                  background: PANEL_BACKGROUND,
                  border: `1px solid ${BORDER}`,
                  boxShadow: PANEL_SHADOW,
                }}
              >
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    color: TEXT_MUTED,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {item.label}
                </Text>
                <Text size="lg" weight="bold" style={{ marginTop: 8 }}>
                  {item.value}
                </Text>
                <Text size="xs" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
                  {item.detail}
                </Text>
              </Box>
            ))}
          </Box>
        </Stack>
      </Card>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(260px, 0.9fr)',
          gap: tokens.spacing[4],
          alignItems: 'start',
        }}
      >
        <Card
          style={{
            padding: tokens.spacing[4],
            border: `1px solid ${BORDER}`,
            background: PANEL_BACKGROUND,
            boxShadow: PANEL_SHADOW,
          }}
        >
          <Stack spacing="md">
            <Text as={"h3" as any} size="lg" weight="semibold">
              Zone layout
            </Text>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gridTemplateRows: '160px 160px 100px',
                gap: tokens.spacing[3],
              }}
            >
              {VENUE_ZONES.map((zone) => {
                const percent = occupancyPercent(zone);

                return (
                  <Box
                    key={zone.id}
                    style={{
                      gridArea: zone.gridArea,
                      borderRadius: tokens.borderRadius.xl,
                      border: `1px solid ${BORDER}`,
                      background: `linear-gradient(180deg, color-mix(in srgb, ${zone.color} 16%, ${SUBTLE_SURFACE}) 0%, ${SUBTLE_SURFACE} 52%)`,
                      padding: tokens.spacing[4],
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: PANEL_SHADOW,
                    }}
                  >
                    <Flex align="center" justify="between" gap={8} style={{ flexWrap: 'wrap' }}>
                      <Text size="lg" weight="semibold">
                        {zone.name}
                      </Text>
                      <Badge variant={statusVariant(zone.status)}>{zone.status}</Badge>
                    </Flex>

                    <Box>
                      <Flex align="center" gap={8}>
                        <Text size="2xl" weight="bold">
                          {zone.current.toLocaleString()}
                        </Text>
                        <Text size="sm" style={{ color: TEXT_MUTED }}>
                          / {zone.capacity.toLocaleString()}
                        </Text>
                      </Flex>

                      <Box
                        style={{
                          marginTop: tokens.spacing[2],
                          height: 8,
                          borderRadius: 999,
                          background: SURFACE,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          style={{
                            width: `${percent}%`,
                            height: '100%',
                            borderRadius: 999,
                            background: zone.color,
                          }}
                        />
                      </Box>

                      <Flex align="center" justify="between" style={{ marginTop: tokens.spacing[1] }}>
                        <Text size="xs" style={{ color: TEXT_MUTED }}>
                          {percent}% occupied
                        </Text>
                        <Text size="xs" style={{ color: TEXT_MUTED }}>
                          {zone.capacity - zone.current} spots left
                        </Text>
                      </Flex>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Stack>
        </Card>

        <Stack spacing="md">
          <Card
            style={{
              padding: tokens.spacing[4],
              border: `1px solid ${BORDER}`,
              background: PANEL_BACKGROUND,
              boxShadow: PANEL_SHADOW,
            }}
          >
            <Stack spacing="sm">
              <Text as={"h3" as any} size="md" weight="semibold">
                Ops watchlist
              </Text>
              {OPS_NOTES.map((note) => (
                <Box
                  key={note}
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    background: SURFACE,
                    border: `1px solid ${BORDER}`,
                    boxShadow: PANEL_SHADOW,
                  }}
                >
                  <Text size="sm" style={{ color: TEXT_SECONDARY }}>
                    {note}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Card>

          <Card
            style={{
              padding: tokens.spacing[4],
              border: `1px solid ${BORDER}`,
              background: PANEL_BACKGROUND,
              boxShadow: PANEL_SHADOW,
            }}
          >
            <Stack spacing="sm">
              <Text as={"h3" as any} size="md" weight="semibold">
                Event schedule density
              </Text>
              <Text size="sm" style={{ color: TEXT_SECONDARY }}>
                Event activity over the last 12 weeks, used to plan staffing and
                venue utilization.
              </Text>
              <Box
                style={{
                  background: SURFACE,
                  borderRadius: tokens.borderRadius.xl,
                  padding: tokens.spacing[4],
                  border: `1px solid ${BORDER}`,
                  boxShadow: PANEL_SHADOW,
                }}
              >
                <CalendarHeatMap
                  data={heatmapData}
                  startDate={HEATMAP_START}
                  height={160}
                  title="Event schedule"
                  colorRange={[
                    'var(--ds-color-border-subtle, rgba(148, 163, 184, 0.18))',
                    'var(--ds-color-primary, #ffffff)',
                  ]}
                />
              </Box>
            </Stack>
          </Card>
        </Stack>
      </Box>
    </Stack>
  );
}
