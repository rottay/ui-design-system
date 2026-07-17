'use client';

import { useState } from 'react';
import { useShowroomRuntime } from '@/composition/components/showroom-context';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Input,
  Select,
  Stack,
  Switch,
  Text,
  useTokens,
} from '@rottay/design-system';
import { CheckIcon, SparklesIcon, StarIcon } from '@rottay/design-system/icons';

const SURFACE =
  'var(--ds-color-bg-container, var(--ds-color-bg-elevated, var(--ds-color-bg-primary, #ffffff)))';
const ELEVATED_SURFACE =
  'var(--ds-color-bg-elevated, var(--ds-color-bg-primary, #ffffff))';
const BORDER =
  'var(--ds-color-border-subtle, var(--ds-color-border, rgba(148, 163, 184, 0.22)))';
const TEXT_SECONDARY =
  'var(--ds-color-text-secondary, var(--ds-color-text-muted, #64748b))';
const TEXT_MUTED = 'var(--ds-color-text-muted, #64748b)';
const HERO_BACKGROUND = `linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary, #ffffff) 12%, ${ELEVATED_SURFACE}) 0%, ${SURFACE} 100%)`;
const CARD_SHADOW = 'var(--ds-shadow-lg, 0 20px 48px rgba(15, 23, 42, 0.1))';
const PANEL_SHADOW = 'var(--ds-shadow-md, 0 12px 28px rgba(15, 23, 42, 0.08))';
const PANEL_BACKGROUND = `linear-gradient(180deg, color-mix(in srgb, ${ELEVATED_SURFACE} 92%, ${SURFACE} 8%) 0%, ${SURFACE} 100%)`;

const TIER_OPTIONS = [
  { value: 'ga', label: 'General admission' },
  { value: 'vip', label: 'VIP early entry' },
  { value: 'table', label: 'Table package' },
];

export function TicketBuilderDemo() {
  const runtime = useShowroomRuntime();
  const tokens = useTokens();
  const [dynamicPricing, setDynamicPricing] = useState(true);
  const [waitlistEnabled, setWaitlistEnabled] = useState(true);

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
                <Badge variant="primary">Ticketing ops</Badge>
                <Badge variant="secondary">{runtime.tenantName}</Badge>
              </Flex>
              <Text as={"h2" as any} size="xl" weight="bold" style={{ marginTop: 12 }}>
                Ticket tier builder
              </Text>
              <Text size="sm" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
                Pricing strategy, inventory release, and launch pressure should read like one
                commercial control surface, not three disconnected inputs.
              </Text>
            </Box>

            <Box
              style={{
              minWidth: 240,
              padding: tokens.spacing[3],
              borderRadius: tokens.borderRadius.xl,
              border: `1px solid ${BORDER}`,
              background: PANEL_BACKGROUND,
              boxShadow: PANEL_SHADOW,
            }}
          >
              <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
                Revenue posture
              </Text>
              <Text size="sm" weight="semibold" style={{ marginTop: 8 }}>
                Dynamic release live
              </Text>
              <Text size="xs" style={{ marginTop: 6, color: TEXT_SECONDARY, lineHeight: 1.6 }}>
                Showcase should feel premium while still making margin decisions obvious.
              </Text>
            </Box>
          </Flex>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)',
              gap: tokens.spacing[4],
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
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: tokens.spacing[3],
                  }}
                >
                  <Box>
                    <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
                      Tier type
                    </Text>
                    <Select defaultValue={TIER_OPTIONS[1].value} options={TIER_OPTIONS} style={{ marginTop: 8 }} />
                  </Box>

                  <Box>
                    <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
                      Price
                    </Text>
                    <Input defaultValue="$180.00" style={{ marginTop: 8 }} />
                  </Box>
                </Box>

                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: tokens.spacing[3],
                  }}
                >
                  <Box>
                    <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
                      Inventory cap
                    </Text>
                    <Input defaultValue="240" style={{ marginTop: 8 }} />
                  </Box>

                  <Box>
                    <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
                      Promo window
                    </Text>
                    <Input defaultValue="48 hours before doors" style={{ marginTop: 8 }} />
                  </Box>
                </Box>

                <Card
                  style={{
                    padding: tokens.spacing[3],
                    border: `1px solid ${BORDER}`,
                    background: SURFACE,
                    boxShadow: PANEL_SHADOW,
                  }}
                >
                  <Stack spacing="sm">
                    <Flex align="center" justify="between" gap={12}>
                      <Flex align="center" gap={10}>
                        <StarIcon size={18} />
                        <Box>
                          <Text size="sm" weight="semibold">
                            Dynamic pricing
                          </Text>
                          <Text size="xs" style={{ marginTop: 4, color: TEXT_SECONDARY }}>
                            Raise or hold price as velocity changes.
                          </Text>
                        </Box>
                      </Flex>
                      <Switch checked={dynamicPricing} onChange={setDynamicPricing} />
                    </Flex>

                    <Flex align="center" justify="between" gap={12}>
                      <Flex align="center" gap={10}>
                        <SparklesIcon size={18} />
                        <Box>
                          <Text size="sm" weight="semibold">
                            Waitlist unlock
                          </Text>
                          <Text size="xs" style={{ marginTop: 4, color: TEXT_SECONDARY }}>
                            Auto-open overflow demand when churn spikes.
                          </Text>
                        </Box>
                      </Flex>
                      <Switch checked={waitlistEnabled} onChange={setWaitlistEnabled} />
                    </Flex>
                  </Stack>
                </Card>

                <Flex justify="between" align="center" style={{ gap: 12, flexWrap: 'wrap' }}>
                  <Text size="xs" style={{ color: TEXT_MUTED }}>
                    Last simulated sell-through update · 4 minutes ago
                  </Text>
                  <Flex gap={10} style={{ flexWrap: 'wrap' }}>
                    <Button variant="ghost">Duplicate tier</Button>
                    <Button>Publish pricing</Button>
                  </Flex>
                </Flex>
              </Stack>
            </Card>

            <Stack spacing="md">
              {[
                {
                  icon: <CheckIcon size={18} />,
                  title: 'Inventory ladder',
                  detail: 'VIP 82% sold · GA 54% sold · Tables 6 left',
                },
                {
                  icon: <StarIcon size={18} />,
                  title: 'Conversion read',
                  detail: 'VIP tier outpacing forecast by 18% this cycle',
                },
              ].map((item) => (
                <Card
                  key={item.title}
                  style={{
                    padding: tokens.spacing[4],
                    border: `1px solid ${BORDER}`,
                    background: PANEL_BACKGROUND,
                    boxShadow: PANEL_SHADOW,
                  }}
                >
                  <Flex align="center" gap={10}>
                    {item.icon}
                    <Box>
                      <Text size="sm" weight="semibold">
                        {item.title}
                      </Text>
                      <Text size="xs" style={{ marginTop: 4, color: TEXT_SECONDARY }}>
                        {item.detail}
                      </Text>
                    </Box>
                  </Flex>
                </Card>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
