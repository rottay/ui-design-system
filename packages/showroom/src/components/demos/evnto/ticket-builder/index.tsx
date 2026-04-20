'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Flex,
  Stack,
  Text,
  Card,
  Badge,
  Button,
  Input,
} from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import {
  PlusIcon,
  CheckIcon,
  StarIcon,
  SparklesIcon,
} from '@rottay/design-system/icons';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TicketTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  quantity: number;
  maxQuantity: number;
  status: 'active' | 'sold-out' | 'draft';
  icon: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Initial data
// ---------------------------------------------------------------------------

const INITIAL_TIERS: TicketTier[] = [
  {
    id: 'general',
    name: 'General Admission',
    price: 30,
    features: [
      'Main floor access',
      'Standard bar service',
      'Event wristband',
    ],
    quantity: 200,
    maxQuantity: 500,
    status: 'active',
    icon: <CheckIcon size={18} />,
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 120,
    features: [
      'VIP lounge access',
      'Premium open bar',
      'Priority entry',
      'Dedicated server',
    ],
    quantity: 50,
    maxQuantity: 100,
    status: 'active',
    icon: <StarIcon size={18} />,
  },
  {
    id: 'table',
    name: 'Table Service',
    price: 500,
    features: [
      'Reserved table (6 guests)',
      'Bottle service included',
      'Personal host',
      'VIP parking',
      'Backstage meet & greet',
    ],
    quantity: 8,
    maxQuantity: 15,
    status: 'active',
    icon: <SparklesIcon size={18} />,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

function statusVariant(status: TicketTier['status']): 'success' | 'error' | 'warning' {
  switch (status) {
    case 'active':
      return 'success';
    case 'sold-out':
      return 'error';
    case 'draft':
      return 'warning';
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TicketBuilderDemo() {
  const tokens = useTokens();
  const [tiers, setTiers] = useState<TicketTier[]>(INITIAL_TIERS);

  const handleQuantityChange = useCallback(
    (tierId: string, value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 0) return;
      setTiers((prev) =>
        prev.map((t) =>
          t.id === tierId
            ? {
                ...t,
                quantity: Math.min(num, t.maxQuantity),
                status: num === 0 ? 'sold-out' : num >= t.maxQuantity ? 'sold-out' : 'active',
              }
            : t,
        ),
      );
    },
    [],
  );

  const handleAddTier = useCallback(() => {
    const newTier: TicketTier = {
      id: `tier-${Date.now()}`,
      name: 'New Tier',
      price: 50,
      features: ['Custom feature 1', 'Custom feature 2'],
      quantity: 0,
      maxQuantity: 100,
      status: 'draft',
      icon: <CheckIcon size={18} />,
    };
    setTiers((prev) => [...prev, newTier]);
  }, []);

  const totalProjected = useMemo(() => {
    return tiers.reduce((sum, t) => sum + t.price * t.quantity, 0);
  }, [tiers]);

  const totalTickets = useMemo(() => {
    return tiers.reduce((sum, t) => sum + t.quantity, 0);
  }, [tiers]);

  return (
    <Stack spacing="lg">
      {/* Header */}
      <Flex align="center" justify="between">
        <Box>
          <Text as={"h2" as any} size="xl" weight="bold">
            Ticket Tier Builder
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Configure pricing tiers for your event
          </Text>
        </Box>
        <Badge variant="primary">{tiers.length} tiers</Badge>
      </Flex>

      {/* Tier cards */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: tokens.spacing[4],
        }}
      >
        {tiers.map((tier) => (
          <Card
            key={tier.id}
            style={{
              border: '1px solid var(--ds-color-border)',
              position: 'relative',
            }}
          >
            <Stack spacing="md">
              {/* Tier header */}
              <Flex align="center" justify="between">
                <Flex align="center" gap={8}>
                  <Box
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: tokens.borderRadius.md,
                      background: 'var(--ds-color-primary-50)',
                      color: 'var(--ds-color-primary-500)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {tier.icon}
                  </Box>
                  <Text size="lg" weight="semibold">
                    {tier.name}
                  </Text>
                </Flex>
                <Badge variant={statusVariant(tier.status)}>
                  {tier.status}
                </Badge>
              </Flex>

              {/* Price */}
              <Box>
                <Text size="2xl" weight="bold">
                  ${tier.price}
                </Text>
                <Text
                  size="xs"
                  style={{ color: 'var(--ds-color-text-muted)' }}
                >
                  per ticket
                </Text>
              </Box>

              {/* Features */}
              <Stack spacing="xs">
                {tier.features.map((feature, i) => (
                  <Flex key={i} align="center" gap={6}>
                    <Box
                      style={{
                        color: 'var(--ds-color-success)',
                        flexShrink: 0,
                      }}
                    >
                      <CheckIcon size={14} />
                    </Box>
                    <Text size="sm">{feature}</Text>
                  </Flex>
                ))}
              </Stack>

              {/* Quantity input */}
              <Box>
                <Text
                  size="xs"
                  weight="medium"
                  style={{
                    color: 'var(--ds-color-text-secondary)',
                    marginBottom: tokens.spacing[1],
                  }}
                >
                  Quantity (max {tier.maxQuantity})
                </Text>
                <Input
                  value={String(tier.quantity)}
                  onChange={(value: string) =>
                    handleQuantityChange(tier.id, value)
                  }
                  placeholder="0"
                  size="md"
                />
              </Box>

              {/* Tier revenue */}
              <Flex align="center" justify="between">
                <Text
                  size="sm"
                  style={{ color: 'var(--ds-color-text-secondary)' }}
                >
                  Tier revenue
                </Text>
                <Text size="sm" weight="semibold">
                  {formatCurrency(tier.price * tier.quantity)}
                </Text>
              </Flex>
            </Stack>
          </Card>
        ))}
      </Box>

      {/* Add tier button */}
      <Box>
        <Button
          variant="default"
          onClick={handleAddTier}
          icon={<PlusIcon size={16} />}
        >
          Add Tier
        </Button>
      </Box>

      {/* Revenue projection */}
      <Card
        style={{
          background: 'var(--ds-color-primary-50)',
          border: '1px solid var(--ds-color-primary-200)',
        }}
      >
        <Flex align="center" justify="between">
          <Box>
            <Text
              size="sm"
              weight="medium"
              style={{ color: 'var(--ds-color-text-secondary)' }}
            >
              Total Revenue Projection
            </Text>
            <Text size="2xl" weight="bold">
              {formatCurrency(totalProjected)}
            </Text>
          </Box>
          <Box style={{ textAlign: 'right' }}>
            <Text
              size="sm"
              weight="medium"
              style={{ color: 'var(--ds-color-text-secondary)' }}
            >
              Total Tickets
            </Text>
            <Text size="2xl" weight="bold">
              {totalTickets.toLocaleString()}
            </Text>
          </Box>
        </Flex>
      </Card>
    </Stack>
  );
}
