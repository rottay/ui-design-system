'use client';

import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge, DesignSystemProvider } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import {
  UsersIcon,
  Building2Icon,
  ShieldIcon,
  LockIcon,
  FlagIcon,
  SettingsIcon,
  BellIcon,
} from '@rottay/design-system/icons';

import PlatformDashboardDemo from '@/components/demos/platform/dashboard';
import PlatformUserListDemo from '@/components/demos/platform/user-list';
import PlatformTenantFormDemo from '@/components/demos/platform/tenant-form';

interface DemoCategory {
  title: string;
  slug: string;
  description: string;
  demoCount: number;
  icon: React.ReactNode;
}

const PLATFORM_CATEGORIES: DemoCategory[] = [
  {
    title: 'Identity',
    slug: 'identity',
    description: 'User management, profiles, sessions, and authentication flows.',
    demoCount: 4,
    icon: <UsersIcon size={20} />,
  },
  {
    title: 'Tenancy',
    slug: 'tenancy',
    description: 'Tenant CRUD, company profiles, branding, and billing settings.',
    demoCount: 3,
    icon: <Building2Icon size={20} />,
  },
  {
    title: 'Permissions',
    slug: 'permissions',
    description: 'Role-based access control, permission matrices, and policy editor.',
    demoCount: 3,
    icon: <ShieldIcon size={20} />,
  },
  {
    title: 'Auth',
    slug: 'auth',
    description: 'Login, MFA, password reset, session management, and API key admin.',
    demoCount: 4,
    icon: <LockIcon size={20} />,
  },
  {
    title: 'Features',
    slug: 'features',
    description: 'Feature flag management, rollout strategies, and experiment tracking.',
    demoCount: 3,
    icon: <FlagIcon size={20} />,
  },
  {
    title: 'Navigation',
    slug: 'navigation',
    description: 'Sidebar layouts, command palette, breadcrumbs, and admin shell.',
    demoCount: 3,
    icon: <SettingsIcon size={20} />,
  },
  {
    title: 'Notifications',
    slug: 'notifications',
    description: 'Notification center, toast system, alert banners, and email templates.',
    demoCount: 3,
    icon: <BellIcon size={20} />,
  },
];

function PlatformContent() {
  const tokens = useTokens();
  const totalDemos = PLATFORM_CATEGORIES.reduce(
    (sum, cat) => sum + cat.demoCount,
    0,
  );

  return (
    <Stack spacing="lg">
      {/* Page header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            Platform
          </Text>
          <Badge variant="primary">{totalDemos} demos</Badge>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text
            size="md"
            style={{ color: 'var(--ds-color-text-secondary)' }}
          >
            Admin control plane for multi-tenant SaaS. These demos render with
            the classic engine, rottay theme, and compact density -- matching
            the production Platform experience.
          </Text>
        </Box>
      </Box>

      {/* Config bar */}
      <Flex gap={12} style={{ flexWrap: 'wrap' }}>
        {[
          { label: 'Engine', value: 'classic' },
          { label: 'Theme', value: 'rottay' },
          { label: 'Density', value: 'compact' },
          { label: 'Vertical', value: 'platform' },
        ].map((tag) => (
          <Flex
            key={tag.label}
            align="center"
            gap={6}
            style={{
              padding: '4px 12px',
              borderRadius: 6,
              background: 'var(--ds-color-neutral-100)',
              border: '1px solid var(--ds-color-neutral-200)',
            }}
          >
            <Text
              size="xs"
              style={{ color: 'var(--ds-color-text-muted)' }}
            >
              {tag.label}:
            </Text>
            <Text size="xs" weight="semibold">
              {tag.value}
            </Text>
          </Flex>
        ))}
      </Flex>

      {/* Live Demo Previews */}
      <Stack spacing="xl">
        <Box>
          <Box
            style={{
              border: '1px solid var(--ds-color-neutral-200)',
              borderRadius: tokens.borderRadius.lg,
              padding: tokens.spacing[5],
              background: 'var(--ds-color-neutral-50)',
            }}
          >
            <PlatformDashboardDemo />
          </Box>
        </Box>

        <Box>
          <Box
            style={{
              border: '1px solid var(--ds-color-neutral-200)',
              borderRadius: tokens.borderRadius.lg,
              padding: tokens.spacing[5],
              background: 'var(--ds-color-neutral-50)',
            }}
          >
            <PlatformUserListDemo />
          </Box>
        </Box>

        <Box>
          <Box
            style={{
              border: '1px solid var(--ds-color-neutral-200)',
              borderRadius: tokens.borderRadius.lg,
              padding: tokens.spacing[5],
              background: 'var(--ds-color-neutral-50)',
            }}
          >
            <PlatformTenantFormDemo />
          </Box>
        </Box>
      </Stack>

      {/* Category cards */}
      <Box>
        <Box style={{ marginBottom: tokens.spacing[4] }}>
          <Text as={"h2" as any} size="xl" weight="semibold">
            All Categories
          </Text>
        </Box>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: tokens.spacing[5],
          }}
        >
          {PLATFORM_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/verticals/platform/${cat.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <Card
                hoverable
                style={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'box-shadow 200ms ease, transform 200ms ease',
                }}
              >
                <Stack spacing="md">
                  <Flex align="center" justify="between">
                    <Box
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: tokens.borderRadius.md,
                        background: 'var(--ds-color-primary-50)',
                        color: 'var(--ds-color-primary-500)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {cat.icon}
                    </Box>
                    <Badge>{cat.demoCount} demos</Badge>
                  </Flex>

                  <Box>
                    <Text as={"h3" as any} size="lg" weight="semibold">
                      {cat.title}
                    </Text>
                    <Box style={{ marginTop: tokens.spacing[1] }}>
                      <Text
                        size="sm"
                        style={{ color: 'var(--ds-color-text-secondary)' }}
                      >
                        {cat.description}
                      </Text>
                    </Box>
                  </Box>
                </Stack>
              </Card>
            </Link>
          ))}
        </Box>
      </Box>
    </Stack>
  );
}

export default function PlatformPage() {
  return (
    <DesignSystemProvider tenantSlug="rottay" forceEngine="classic">
      <PlatformContent />
    </DesignSystemProvider>
  );
}
