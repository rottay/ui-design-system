'use client';

import { useState } from 'react';
import { useShowroomRuntime } from '@/composition/components/showroom-context';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  PatternDataTable,
  Stack,
  Text,
  useTokens,
} from '@rottay/design-system';
import { EditIcon, ShieldIcon, Trash2Icon } from '@rottay/design-system/icons';

import type { ColumnDef, SortConfig } from '@rottay/design-system';

const SURFACE = 'var(--ds-color-bg-container, #ffffff)';
const ELEVATED_SURFACE = 'var(--ds-color-bg-elevated, #f8fafc)';
const BORDER = 'var(--ds-color-border, rgba(148, 163, 184, 0.28))';
const TEXT_SECONDARY = 'var(--ds-color-text-secondary)';
const TEXT_MUTED = 'var(--ds-color-text-muted)';
const CARD_SHADOW = 'var(--ds-shadow-lg, 0 20px 48px rgba(15, 23, 42, 0.1))';
const PANEL_SHADOW = 'var(--ds-shadow-md, 0 12px 28px rgba(15, 23, 42, 0.08))';
const PANEL_BACKGROUND = `linear-gradient(180deg, color-mix(in srgb, ${ELEVATED_SURFACE} 92%, ${SURFACE} 8%) 0%, ${SURFACE} 100%)`;
const PRIORITY_BACKGROUND = `linear-gradient(180deg, rgba(59, 130, 246, 0.16), rgba(14, 165, 233, 0.06) 58%, ${SURFACE} 100%)`;
const RISK_BACKGROUND = `linear-gradient(180deg, rgba(248, 113, 113, 0.14), rgba(245, 158, 11, 0.08) 58%, ${SURFACE} 100%)`;
const ANALYSIS_BACKGROUND = `linear-gradient(180deg, rgba(99, 102, 241, 0.12), rgba(59, 130, 246, 0.04) 58%, ${SURFACE} 100%)`;

interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  posture: 'healthy' | 'review' | 'critical';
  lastLogin: string;
}

const USERS: User[] = [
  {
    id: '1',
    name: 'Daniel Avila',
    email: 'daniel@rottay.com',
    company: 'Rottay HQ',
    role: 'Super Admin',
    posture: 'healthy',
    lastLogin: '2 min ago',
  },
  {
    id: '2',
    name: 'Sofia Martinez',
    email: 'sofia@northstarhealth.com',
    company: 'Northstar Health',
    role: 'Tenant Admin',
    posture: 'review',
    lastLogin: '18 min ago',
  },
  {
    id: '3',
    name: 'James Chen',
    email: 'james@canopylogistics.io',
    company: 'Canopy Logistics',
    role: 'Support Admin',
    posture: 'healthy',
    lastLogin: '46 min ago',
  },
  {
    id: '4',
    name: 'Maria Garcia',
    email: 'maria@blueriver.capital',
    company: 'Blue River Capital',
    role: 'Billing Admin',
    posture: 'critical',
    lastLogin: '4 hours ago',
  },
  {
    id: '5',
    name: 'Alex Johnson',
    email: 'alex@atlasretail.co',
    company: 'Atlas Retail',
    role: 'Operations Admin',
    posture: 'healthy',
    lastLogin: '6 hours ago',
  },
  {
    id: '6',
    name: 'Emily Davis',
    email: 'emily@greenline.energy',
    company: 'Greenline Energy',
    role: 'Security Admin',
    posture: 'review',
    lastLogin: '9 hours ago',
  },
];

const POSTURE_VARIANT: Record<User['posture'], 'success' | 'warning' | 'error'> = {
  healthy: 'success',
  review: 'warning',
  critical: 'error',
};

const REVIEW_QUEUE = [
  {
    name: 'Blue River Capital',
    issue: 'Role escalation exceeds policy baseline',
    variant: 'error' as const,
  },
  {
    name: 'Northstar Health',
    issue: 'Expired SAML certificate pending renewal',
    variant: 'warning' as const,
  },
  {
    name: 'Greenline Energy',
    issue: 'SSO fallback disabled during onboarding',
    variant: 'secondary' as const,
  },
];

const POLICY_GUARDRAILS = [
  {
    label: 'Privileged access reviews',
    detail: 'All super admins require weekly attestation and named ownership.',
  },
  {
    label: 'Dormant operator sweep',
    detail: 'Accounts inactive for 14 days are queued for deprovisioning review.',
  },
  {
    label: 'Cross-tenant drift',
    detail: 'Badge, table density, and row actions must stay readable under every runtime.',
  },
];

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Box style={{ minWidth: 0 }}>
      <Text
        size="xs"
        weight="semibold"
        style={{
          color: TEXT_MUTED,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {eyebrow}
      </Text>
      <Text as={"h3" as any} size="lg" weight="semibold" style={{ marginTop: 8 }}>
        {title}
      </Text>
      <Text size="sm" style={{ marginTop: 6, color: TEXT_SECONDARY, lineHeight: 1.65 }}>
        {description}
      </Text>
    </Box>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  detail: string;
  tone?: 'neutral' | 'priority' | 'risk';
}) {
  const background =
    tone === 'risk'
      ? RISK_BACKGROUND
      : tone === 'priority'
        ? PRIORITY_BACKGROUND
        : PANEL_BACKGROUND;
  const borderColor =
    tone === 'risk'
      ? 'rgba(248, 113, 113, 0.26)'
      : tone === 'priority'
        ? 'rgba(59, 130, 246, 0.24)'
        : BORDER;

  return (
    <Box
      style={{
        minWidth: 0,
        padding: '16px 18px',
        borderRadius: 'var(--ds-border-radius-lg, 16px)',
        background,
        border: `1px solid ${borderColor}`,
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
        {label}
      </Text>
      <Text size="lg" weight="bold" style={{ marginTop: 10, lineHeight: 1.15 }}>
        {value}
      </Text>
      <Text size="xs" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
        {detail}
      </Text>
    </Box>
  );
}

export default function PlatformUserListDemo() {
  const tokens = useTokens();
  const runtime = useShowroomRuntime();
  const [sorting, setSorting] = useState<SortConfig>({ key: 'name', direction: 'asc' });

  const columns: ColumnDef<User>[] = [
    {
      key: 'name',
      header: 'User',
      accessorKey: 'name',
      sortable: true,
      width: 240,
      render: (_value: unknown, row: User) => (
        <Flex align="center" gap={10}>
          <Avatar name={row.name} size="sm" shape="circle" />
          <Box style={{ minWidth: 0 }}>
            <Text size="sm" weight="semibold">
              {row.name}
            </Text>
            <Text size="xs" style={{ color: TEXT_MUTED }}>
              {row.email}
            </Text>
          </Box>
        </Flex>
      ),
    },
    {
      key: 'company',
      header: 'Tenant',
      accessorKey: 'company',
      sortable: true,
      width: 180,
    },
    {
      key: 'role',
      header: 'Role',
      accessorKey: 'role',
      sortable: true,
      width: 150,
    },
    {
      key: 'posture',
      header: 'Access posture',
      accessorKey: 'posture',
      sortable: true,
      width: 150,
      render: (_value: unknown, row: User) => (
        <Badge variant={POSTURE_VARIANT[row.posture]}>{row.posture}</Badge>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last login',
      accessorKey: 'lastLogin',
      sortable: true,
      width: 130,
    },
  ];

  return (
    <Stack spacing="lg">
      <Card
        style={{
          padding: tokens.spacing[4],
          border: `1px solid ${BORDER}`,
          background:
            'linear-gradient(180deg, rgba(59, 130, 246, 0.12), transparent 44%), var(--ds-color-bg-container, #ffffff)',
          boxShadow: CARD_SHADOW,
        }}
      >
        <Stack spacing="md">
          <Flex align="start" justify="between" style={{ gap: 12, flexWrap: 'wrap' }}>
            <Box style={{ minWidth: 0, flex: '1 1 320px' }}>
              <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
                <Badge variant="primary">Identity directory</Badge>
                <Badge variant="secondary">{runtime.tenantName}</Badge>
              </Flex>
              <Text as={"h2" as any} size="xl" weight="bold" style={{ marginTop: 12 }}>
                Platform user access center
              </Text>
              <Text size="sm" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
                Dense user management needs to stay crisp, safe, and scannable
                under the active DS runtime.
              </Text>
            </Box>

            <Box
              style={{
                padding: '12px 14px',
                borderRadius: tokens.borderRadius.xl,
                background: PANEL_BACKGROUND,
                border: `1px solid ${BORDER}`,
                minWidth: 220,
                boxShadow: PANEL_SHADOW,
              }}
            >
              <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
                Runtime expectation
              </Text>
              <Text size="sm" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
                Row density, badges, and table chrome should stay readable even
                when Rottay pushes a darker shell.
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
            <SummaryCard
              label="Managed accounts"
              value="3,842"
              detail="Across 128 active tenant environments."
              tone="priority"
            />
            <SummaryCard
              label="MFA coverage"
              value="96%"
              detail="Only 41 privileged accounts still exempt."
            />
            <SummaryCard
              label="Review queue"
              value="7 accounts"
              detail="Escalated access or SSO drift needs follow-up."
              tone="risk"
            />
          </Box>
        </Stack>
      </Card>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: tokens.spacing[4],
          alignItems: 'start',
        }}
      >
        <Card
          style={{
            padding: tokens.spacing[4],
            border: `1px solid ${BORDER}`,
            background: ANALYSIS_BACKGROUND,
            boxShadow: PANEL_SHADOW,
          }}
        >
          <Stack spacing="md">
            <SectionHeader
              eyebrow="Operator roster"
              title="Privilege and tenant access inventory"
              description="The table is the analysis layer. It should feel dense and actionable without stealing urgency from the review queue."
            />
            <PatternDataTable<User>
              data={USERS}
              columns={columns}
              rowKey="id"
              selectable
              sorting={sorting}
              onSortChange={setSorting}
              hoverable
              striped
              actions={(row) => (
                <Flex gap={4}>
                  <Button variant="ghost" size="sm" aria-label={`Edit ${row.name}`}>
                    <EditIcon size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" aria-label={`Review ${row.name}`}>
                    <ShieldIcon size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" aria-label={`Delete ${row.name}`}>
                    <Trash2Icon size={14} />
                  </Button>
                </Flex>
              )}
              toolbar={
                <Flex
                  align="center"
                  justify="between"
                  style={{ width: '100%', gap: 12, flexWrap: 'wrap' }}
                >
                  <Text size="sm" style={{ color: TEXT_MUTED }}>
                    Showing 6 high-signal operators across live tenant accounts
                  </Text>
                  <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                    <Button variant="default" size="sm">
                      Bulk review
                    </Button>
                    <Button variant="primary" size="sm">
                      Invite admin
                    </Button>
                  </Flex>
                </Flex>
              }
            />
          </Stack>
        </Card>

        <Stack spacing="md">
          <Card
            style={{
              padding: tokens.spacing[4],
              border: '1px solid rgba(248, 113, 113, 0.22)',
              background: RISK_BACKGROUND,
              boxShadow: PANEL_SHADOW,
            }}
          >
            <Stack spacing="sm">
              <SectionHeader
                eyebrow="Risk + status"
                title="Access review queue"
                description="This rail owns urgency. Escalations and posture drift should visually separate from the broader operator inventory."
              />
              {REVIEW_QUEUE.map((item) => (
                <Box
                  key={item.name}
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    background: SURFACE,
                    border: '1px solid rgba(248, 113, 113, 0.16)',
                    boxShadow: PANEL_SHADOW,
                  }}
                >
                  <Text size="sm" weight="semibold">
                    {item.name}
                  </Text>
                  <Text size="xs" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
                    {item.issue}
                  </Text>
                  <Box style={{ marginTop: 8 }}>
                    <Badge variant={item.variant}>{item.variant}</Badge>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Card>

          <Card
            style={{
              padding: tokens.spacing[4],
              border: `1px solid ${BORDER}`,
              background: PRIORITY_BACKGROUND,
              boxShadow: PANEL_SHADOW,
            }}
          >
            <Stack spacing="sm">
              <SectionHeader
                eyebrow="Policy guardrails"
                title="What keeps this screen governance-safe"
                description="Runtime switching is only valid if operator scanning, escalations, and row actions still feel trustworthy under every tenant and engine."
              />
              {POLICY_GUARDRAILS.map((item) => (
                <Box
                  key={item.label}
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    border: `1px solid ${BORDER}`,
                    background: SURFACE,
                    boxShadow: PANEL_SHADOW,
                  }}
                >
                  <Text size="sm" weight="semibold">
                    {item.label}
                  </Text>
                  <Text size="xs" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
                    {item.detail}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Card>
        </Stack>
      </Box>
    </Stack>
  );
}
